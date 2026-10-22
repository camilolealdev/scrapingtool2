"""lead-worker: una sola API interna sobre dorking_scraper (un trabajo a la vez, poca RAM)."""
import os
import hmac
import threading
from typing import Optional

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

import dorking_scraper as ds

KEY = os.environ.get("WORKER_KEY", "")
app = FastAPI(title="lead-worker")
_lock = threading.Lock()  # concurrencia 1: protege el VPS compartido

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


@app.get("/health")
def health():
    return {"ok": True, "busy": _lock.locked(), "scrapling": ds.SCRAPLING_AVAILABLE}


@app.post("/run")
def run(job: Job, x_worker_key: str = Header(default="")):
    if not KEY or not hmac.compare_digest(x_worker_key, KEY):
        raise HTTPException(401, "clave inválida")
    region = region_of(job.country)
    if not _lock.acquire(blocking=False):
        raise HTTPException(429, "worker ocupado", headers={"Retry-After": "60"})
    try:
        leads = ds.run(job.niche, job.city or "", region, max_pages=10, delay=3,
                       stealth=False, output="/tmp/leads.csv") or []
        out = [l.to_dict() for l in leads[: job.limit]]
        return {"session_id": job.session_id, "count": len(out), "leads": out}
    finally:
        _lock.release()
