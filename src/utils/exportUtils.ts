import { ScrapeResult } from '../types';

export function exportLeadsCSV(scrapeResults: ScrapeResult[], niche: string, city: string) {
  if (!scrapeResults.length) return;
  const headers = "Name,Phone,Email,WhatsApp,Website,Instagram,Address,Notes";
  const rows = scrapeResults.map(l =>
    `"${(l.name||'').replace(/"/g,'""')}","${l.phone||''}","${l.email||''}","${l.whatsapp||''}","${l.website||''}","${l.instagram||''}","${(l.address||'').replace(/"/g,'""')}","${(l.notes||'').replace(/"/g,'""')}"`
  ).join("\n");
  const blob = new Blob(["\uFEFF" + headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads_${niche || "leads"}_${city || "data"}.csv`;
  a.click();
}

export function exportScrapeLog(scrapeLog: any[]) {
  if (!scrapeLog.length) return;
  const content = scrapeLog.map(l => `[${l.time}] ${l.msg}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `osint_log_${new Date().getTime()}.txt`;
  a.click();
}

export function exportAllLogs(scrapeLog: any[], allHistoryLogs: any[]) {
  const combined = [...allHistoryLogs, ...scrapeLog];
  if (!combined.length) return;
  const content = combined.map(l => `[${l.time}] ${l.msg}`).join("\n");
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `osint_combined_logs_${new Date().getTime()}.txt`;
  a.click();
}

export function generatePythonScript(TEMPLATES: any, niche: string, city: string, zone: string, year: number): string {
  const n = niche || "restaurante";
  const c = city || "bogota";
  const z = zone || "centro";

  const bulkDorks = Object.values(TEMPLATES).flatMap((cat: any) =>
    cat.templates.map((t: any) =>
      t.query
        .replace(/\{NICHE\}/g, n)
        .replace(/\{CITY\}/g, c)
        .replace(/\{YEAR\}/g, String(year))
        .replace(/\{ZONE\}/g, z)
    )
  );

  // Deduplicate and cap at 40 queries
  const uniqueDorks = [...new Set(bulkDorks)].slice(0, 40);
  const dorksStr = uniqueDorks.map(q => `    ${JSON.stringify(q)},`).join("\n");

  return `#!/usr/bin/env python3
"""
════════════════════════════════════════════════════════
  DORKING LAB v3.0 — Generated Lead Scraper
  Niche: ${n} | City: ${c} | Zone: ${z}
  Generated: ${new Date().toISOString().slice(0,10)}
  ${uniqueDorks.length} queries across all template categories

  Install (full):
    pip install "scrapling[fetchers]" duckduckgo-search && scrapling install
  Install (minimal):
    pip install requests beautifulsoup4

  Usage:
    python script.py                    # run all ${uniqueDorks.length} queries
    python script.py --stealth          # Cloudflare bypass
    python script.py --max 20           # max 20 results per query
════════════════════════════════════════════════════════
"""
import csv, re, time, json, random, sys, hashlib, argparse
from urllib.parse import quote_plus, unquote
from datetime import datetime

# ── Library detection ──────────────────────────────────
SCRAPLING = False
DDGS_LIB  = False
BS4       = False

try:
    from scrapling.fetchers import Fetcher, StealthyFetcher
    SCRAPLING = True
    print("✅ Scrapling active (anti-bot + TLS fingerprint)")
except ImportError:
    pass

try:
    from duckduckgo_search import DDGS
    DDGS_LIB = True
    print("✅ duckduckgo-search active")
except ImportError:
    pass

try:
    import requests
    from bs4 import BeautifulSoup
    BS4 = True
    if not SCRAPLING:
        print("⚠️  Using BeautifulSoup fallback — install Scrapling for better results")
except ImportError:
    print("❌ No library found. pip install requests beautifulsoup4")
    sys.exit(1)

# ── Config ────────────────────────────────────────────
NICHE  = "${n}"
CITY   = "${c}"
ZONE   = "${z}"
REGION = "co"   # change to: mx ar cl pe ec es us br

QUERIES = [
${dorksStr}
]

UAS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]

EMAIL_RE  = re.compile(r"[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}")
PHONE_RE  = re.compile(r"(?<!\\d)(\\+?[\\d\\s.\\-()]{7,20})(?!\\d)")
WA_RE     = re.compile(r"wa\\.me/(\\d+)|api\\.whatsapp\\.com/send\\?phone=(\\d+)")
IG_RE     = re.compile(r"instagram\\.com/([a-zA-Z0-9_.]{2,30})(?:/|\\?|$)")
NOISE     = {"example.com","google.com","gstatic.com","schema.org","w3.org","sentry.io","cloudflare.com"}
IG_NOISE  = {"p","reel","stories","explore","accounts","about","legal","static","tv"}

def hdr():
    return {"User-Agent": random.choice(UAS), "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"}

def search_google(q, stealth=False, num=10):
    url = f"https://www.google.com.co/search"
    params = {"q": q, "num": num, "hl": "es"}
    selectors_scrapling = ["div.MjjYud", "div.g", ".Gx5Zad", "#rso > div"]
    try:
        if SCRAPLING:
            full = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k,v in params.items())
            page = StealthyFetcher.fetch(full, headless=True) if stealth else Fetcher.get(full, stealthy_headers=True)
            for sel in selectors_scrapling:
                results = []
                for item in page.css(sel):
                    link = item.css_first("a[href]")
                    if link:
                        href = link.attrib.get("href","")
                        if href.startswith("/url?q="):
                            href = unquote(href.split("/url?q=")[1].split("&")[0])
                        if href.startswith("http") and "google.com" not in href:
                            results.append(href)
                if results:
                    return results
        elif BS4:
            resp = requests.get(url, params=params, headers=hdr(), timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            results = []
            for sel in ["div.g", "div.MjjYud", ".Gx5Zad"]:
                for item in soup.select(sel):
                    link = item.select_one("a[href]")
                    if link:
                        href = link.get("href","")
                        if href.startswith("/url?q="):
                            href = unquote(href.split("/url?q=")[1].split("&")[0])
                        if href.startswith("http") and "google.com" not in href:
                            results.append(href)
                if results:
                    return results
    except Exception as e:
        print(f"  ↻ Google err: {e}")
    return []

def search_bing(q, num=10):
    url = "https://www.bing.com/search"
    params = {"q": q, "count": num, "cc": REGION, "setlang": "es"}
    try:
        if SCRAPLING:
            full = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k,v in params.items())
            page = Fetcher.get(full, stealthy_headers=True)
            return [li.css_first("h2 a").attrib.get("href","") for li in page.css("li.b_algo") if li.css_first("h2 a")]
        elif BS4:
            resp = requests.get(url, params=params, headers=hdr(), timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            return [li.select_one("h2 a").get("href","") for li in soup.select("li.b_algo") if li.select_one("h2 a")]
    except Exception as e:
        print(f"  ↻ Bing err: {e}")
    return []

def search_ddg(q, num=10):
    if DDGS_LIB:
        try:
            with DDGS() as ddgs:
                return [r["href"] for r in ddgs.text(q, max_results=num) if r.get("href","").startswith("http")]
        except Exception as e:
            print(f"  ↻ DDGS err: {e}")
    try:
        if BS4:
            resp = requests.post("https://html.duckduckgo.com/html/", data={"q": q}, headers=hdr(), timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            return [a.get("href","") for a in soup.select("a.result__a")][:num]
    except Exception as e:
        print(f"  ↻ DDG err: {e}")
    return []

def multi_search(q, stealth=False, num=10):
    for name, fn in [("Google", lambda: search_google(q, stealth, num)),
                     ("Bing",   lambda: search_bing(q, num)),
                     ("DDG",    lambda: search_ddg(q, num))]:
        results = fn()
        if results:
            return results, name
        time.sleep(random.uniform(1, 2.5))
    return [], "None"

def extract(url, stealth=False):
    data = {"url": url, "name":"", "email":"", "phone":"", "whatsapp":"", "instagram":"", "facebook":"", "notes":""}
    try:
        if SCRAPLING:
            page = StealthyFetcher.fetch(url, headless=True) if stealth else Fetcher.get(url, stealthy_headers=True, timeout=12)
            body = page.get_text() if hasattr(page, "get_text") else (page.text or "")
            html = str(page.html) if hasattr(page, "html") else body
            t = page.css_first("title")
            if t: data["name"] = t.text.strip()[:120]
            emails = [e for e in EMAIL_RE.findall(body) if not any(n in e for n in NOISE)]
            if emails: data["email"] = ", ".join(list(dict.fromkeys(emails))[:3])
            for m in page.css('a[href^="tel:"]'):
                p = m.attrib.get("href","").replace("tel:","").strip()
                if len(re.sub(r"\\D","",p)) >= 7: data["phone"] = p; break
            if not data["phone"]:
                phones = [p for p in PHONE_RE.findall(body) if len(re.sub(r"\\D","",p)) >= 7]
                if phones: data["phone"] = phones[0].strip()
            for m in WA_RE.findall(html):
                num = m[0] or m[1]
                if num: data["whatsapp"] = f"https://wa.me/{num}"; break
            for h in IG_RE.findall(html):
                if h.lower() not in IG_NOISE: data["instagram"] = f"@{h}"; break
        elif BS4:
            resp = requests.get(url, headers=hdr(), timeout=10)
            body = resp.text
            soup = BeautifulSoup(body, "html.parser")
            t = soup.find("title")
            if t: data["name"] = t.get_text().strip()[:120]
            emails = [e for e in EMAIL_RE.findall(body) if not any(n in e for n in NOISE)]
            if emails: data["email"] = ", ".join(list(dict.fromkeys(emails))[:3])
            phones = [p for p in PHONE_RE.findall(body) if len(re.sub(r"\\D","",p)) >= 7]
            if phones: data["phone"] = phones[0].strip()
            for m in WA_RE.findall(body):
                num = m[0] or m[1]
                if num: data["whatsapp"] = f"https://wa.me/{num}"; break
            for h in IG_RE.findall(body):
                if h.lower() not in IG_NOISE: data["instagram"] = f"@{h}"; break
    except Exception as e:
        data["notes"] = str(e)[:100]
    return data

def is_valid(d):
    return bool(d.get("email") or d.get("phone") or d.get("whatsapp") or d.get("instagram"))

def dedup_key(d):
    phone = re.sub(r"\\D","",d.get("phone","") or d.get("whatsapp",""))[-10:]
    email = (d.get("email","") or "").lower().split(",")[0].strip()
    return hashlib.md5((phone or email or d.get("url","")).encode()).hexdigest()

def main(stealth=False, max_results=10, delay=3):
    ts = datetime.now().strftime("%Y%m%d_%H%M")
    outfile = f"leads_{NICHE}_{CITY}_{ts}.csv"
    fields = ["name","email","phone","whatsapp","instagram","facebook","url","notes"]

    all_leads = []
    seen_urls = set()
    seen_dedup = set()

    for i, q in enumerate(QUERIES):
        print(f"\\n[{i+1}/{len(QUERIES)}] {q[:70]}...")
        urls, engine = multi_search(q, stealth, max_results)
        print(f"  ↳ {engine}: {len(urls)} results")

        for url in urls:
            if not url.startswith("http"): continue
            url_clean = url.split("?")[0].rstrip("/")
            if url_clean in seen_urls: continue
            seen_urls.add(url_clean)

            print(f"    {url[:60]}...", end="", flush=True)
            d = extract(url, stealth)

            dk = dedup_key(d)
            if dk in seen_dedup: print(" ⟳"); continue
            seen_dedup.add(dk)

            if is_valid(d):
                all_leads.append(d)
                parts = []
                if d.get("email"): parts.append(f"📧{d['email'][:25]}")
                if d.get("phone"): parts.append(f"📞{d['phone'][:15]}")
                if d.get("whatsapp"): parts.append("💬WA")
                if d.get("instagram"): parts.append(f"📸{d['instagram']}")
                print(f" ✅ {' | '.join(parts)}")
            else:
                print(" ·")
            time.sleep(random.uniform(0.8, 1.5))

        time.sleep(random.uniform(delay - 0.5, delay + 1.0))

    if all_leads:
        with open(outfile, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            w.writerows(all_leads)
        print(f"\\n✅ {len(all_leads)} leads → {outfile}")
        print(f"   📧 Emails: {sum(1 for d in all_leads if d.get('email'))}")
        print(f"   📞 Phones: {sum(1 for d in all_leads if d.get('phone'))}")
        print(f"   💬 WhatsApp: {sum(1 for d in all_leads if d.get('whatsapp'))}")
        print(f"   📸 Instagram: {sum(1 for d in all_leads if d.get('instagram'))}")
    else:
        print("\\n⚠ No leads. Try --stealth or different niche/city.")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--stealth", action="store_true")
    p.add_argument("--max", type=int, default=10)
    p.add_argument("--delay", type=int, default=3)
    a = p.parse_args()
    main(a.stealth, a.max, a.delay)
`;
}
