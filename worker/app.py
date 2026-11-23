"""lead-worker: una sola API interna sobre dorking_scraper (un trabajo a la vez, poca RAM)."""
import os
import hmac
import time
import requests
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from threading import Lock
from typing import Any, Optional
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

import dorking_scraper as ds

KEY = os.environ.get("WORKER_KEY", "")
GOSOM_URL = os.environ.get("GOSOM_URL", "").rstrip("/")
MAPS_KIT_URL = os.environ.get("MAPS_KIT_URL", "").rstrip("/")
EXTERNAL_TIMEOUT = float(os.environ.get("EXTERNAL_TIMEOUT", "20"))
app = FastAPI(title="lead-worker")
_jobs: dict[str, dict[str, Any]] = {}
_jobs_lock = Lock()
_executor = ThreadPoolExecutor(max_workers=1)

COUNTRY = {
    "colombia": "co", "mexico": "mx", "méxico": "mx", "argentina": "ar", "chile": "cl",
    "peru": "pe", "perú": "pe", "ecuador": "ec", "españa": "es", "spain": "es",
    "estados unidos": "us", "usa": "us", "brasil": "br", "brazil": "br",
}


class Job(BaseModel):
    niche: str = Field(min_length=2, max_length=120)
    country: str = Field(min_length=2, max_length=60)
    city: str = Field(default="", max_length=80)
    limit: int = Field(default=30, ge=1, le=50)
    session_id: Optional[str] = None


def region_of(country: str) -> str:
    c = country.strip().lower()
    code = c if c in ds.REGIONS else COUNTRY.get(c)
    if not code or code not in ds.REGIONS:
        raise HTTPException(422, f"país no soportado: {country}. Disponibles: {', '.join(ds.REGIONS)}")
    return code


def _extract_external_rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return data
    if not isinstance(data, dict):
        return []
    for key in ("results", "leads", "places", "data", "items"):
        value = data.get(key)
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            rows = _extract_external_rows(value)
            if rows:
                return rows
    return []


def _external_job(base_url: str, job: Job) -> list[dict[str, Any]]:
    if not base_url:
        return []
    query = " ".join(part for part in (job.niche, job.city, job.country) if part)
    payload = {"keywords": [query], "query": query, "limit": job.limit,
               "depth": 1, "email": True, "fast_mode": False,
               "session_id": job.session_id}
    try:
        created = requests.post(f"{base_url}/api/v1/jobs", json=payload, timeout=EXTERNAL_TIMEOUT)
        created.raise_for_status()
        data = created.json()
        job_id = data.get("id") or data.get("job_id")
        if not job_id:
            return _extract_external_rows(data)
        deadline = time.monotonic() + max(EXTERNAL_TIMEOUT, 20) * 6
        while time.monotonic() < deadline:
            current = requests.get(f"{base_url}/api/v1/jobs/{job_id}", timeout=EXTERNAL_TIMEOUT)
            current.raise_for_status()
            state = current.json()
            status = str(state.get("status", "")).lower()
            if status in {"completed", "complete", "done", "success", "finished"}:
                return _extract_external_rows(state)
            if status in {"failed", "error", "cancelled", "canceled"}:
                return []
            time.sleep(2)
    except (requests.RequestException, ValueError):
        return []
    return []


def _run_provider_chain(job: Job, region: str) -> tuple[list[dict[str, Any]], str]:
    for provider, url in (("gosom", GOSOM_URL), ("maps-kit", MAPS_KIT_URL)):
        rows = _external_job(url, job)
        if rows:
            return rows[:job.limit], provider
    leads = ds.run(job.niche, job.city or "", region, max_pages=10, delay=3,
                   stealth=False, output=f"/tmp/{uuid4()}.csv") or []
    return [lead.to_dict() for lead in leads[:job.limit]], "dorking"


def _run_job(job_id: str, job: Job, region: str) -> None:
    with _jobs_lock:
        _jobs[job_id]["status"] = "running"
        _jobs[job_id]["started_at"] = datetime.now(timezone.utc).isoformat()
    try:
        out, provider = _run_provider_chain(job, region)
        with _jobs_lock:
            _jobs[job_id].update(status="completed", count=len(out), leads=out, provider=provider)
    except Exception as exc:
        with _jobs_lock:
            _jobs[job_id].update(status="failed", error=str(exc)[:500])
    finally:
        with _jobs_lock:
            _jobs[job_id]["finished_at"] = datetime.now(timezone.utc).isoformat()


def _busy() -> bool:
    return any(j["status"] in {"queued", "running"} for j in _jobs.values())


@app.get("/health")
def health():
    return {"ok": True, "busy": _busy(), "scrapling": ds.SCRAPLING_AVAILABLE}


@app.post("/run", status_code=202)
def run(job: Job, x_worker_key: str = Header(default="")):
    if not KEY or not hmac.compare_digest(x_worker_key, KEY):
        raise HTTPException(401, "clave inválida")
    region = region_of(job.country)
    if _busy():
        raise HTTPException(429, "worker ocupado", headers={"Retry-After": "60"})
    job_id = str(uuid4())
    with _jobs_lock:
        _jobs[job_id] = {"job_id": job_id, "session_id": job.session_id,
                         "status": "queued", "count": 0, "leads": []}
    _executor.submit(_run_job, job_id, job, region)
    return {"job_id": job_id, "session_id": job.session_id, "status": "queued"}


@app.get("/jobs/{job_id}")
def get_job(job_id: str, x_worker_key: str = Header(default="")):
    if not KEY or not hmac.compare_digest(x_worker_key, KEY):
        raise HTTPException(401, "clave inválida")
    with _jobs_lock:
        job = _jobs.get(job_id)
        if not job:
            raise HTTPException(404, "job no encontrado")
        return dict(job)
