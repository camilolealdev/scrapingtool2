#!/usr/bin/env python3
"""
════════════════════════════════════════════════════════════════════════
  DORKING LAB — Python Lead Scraper v3.0
  Powered by Scrapling (https://github.com/D4Vinci/Scrapling)

  Engines: Google → Bing → DuckDuckGo (DDGS lib) → Yandex → Brave
  ✓ Scrapling StealthyFetcher — bypasses Cloudflare, anti-bot
  ✓ Scrapling Fetcher — fast HTTP with TLS fingerprint impersonation
  ✓ duckduckgo-search library — reliable DDG without scraping
  ✓ Multi-engine failover with exponential backoff
  ✓ User-Agent rotation pool
  ✓ Lead deduplication by normalized phone + email hash
  ✓ Regex: emails, phones, WhatsApp, Instagram, Facebook
  ✓ 9 regions: CO, MX, AR, CL, PE, EC, ES, US, BR
  ✓ CSV export with BOM (Excel-compatible)

  Install (full):
    pip install "scrapling[fetchers]" && scrapling install
    pip install duckduckgo-search requests beautifulsoup4

  Install (minimal):
    pip install requests beautifulsoup4

  Usage:
    python dorking_scraper.py "dentista" "bogota" -r co
    python dorking_scraper.py "restaurant" "miami" -r us --stealth
    python dorking_scraper.py "restaurante" "madrid" -r es --spider
    python dorking_scraper.py "plomero" "cdmx" -r mx -z "polanco" -m 20
════════════════════════════════════════════════════════════════════════
"""

import csv
import re
import time
import json
import random
import argparse
import sys
import hashlib
from urllib.parse import quote_plus, urlparse, urlencode
from datetime import datetime
from typing import Optional, List, Dict, Set

# ═══ LIBRARY DETECTION ════════════════════════════════════════════════

SCRAPLING_AVAILABLE = False
DDGS_AVAILABLE = False
BS4_AVAILABLE = False

try:
    from scrapling.fetchers import Fetcher, StealthyFetcher
    SCRAPLING_AVAILABLE = True
    print("✅ Scrapling v2 detected — StealthyFetcher + adaptive selectors active")
except ImportError:
    pass

try:
    from duckduckgo_search import DDGS
    DDGS_AVAILABLE = True
    print("✅ duckduckgo-search detected — reliable DDG engine active")
except ImportError:
    pass

try:
    import requests
    from bs4 import BeautifulSoup
    BS4_AVAILABLE = True
    if not SCRAPLING_AVAILABLE:
        print("⚠️  Scrapling not found — using BeautifulSoup fallback")
        print("   Upgrade: pip install 'scrapling[fetchers]' && scrapling install")
except ImportError:
    if not SCRAPLING_AVAILABLE:
        print("❌ No scraping library found!")
        print("   pip install 'scrapling[fetchers]' && scrapling install")
        print("   OR: pip install requests beautifulsoup4")
        sys.exit(1)

# ═══ REGIONS ══════════════════════════════════════════════════════════

REGIONS: Dict[str, Dict] = {
    "co": {"name": "Colombia",  "google": "google.com.co",  "bing_cc": "co", "lang": "es", "tld": ".com.co",  "ddg_region": "co-es", "yandex_lr": ""},
    "mx": {"name": "México",    "google": "google.com.mx",  "bing_cc": "mx", "lang": "es", "tld": ".com.mx",  "ddg_region": "mx-es", "yandex_lr": ""},
    "ar": {"name": "Argentina", "google": "google.com.ar",  "bing_cc": "ar", "lang": "es", "tld": ".com.ar",  "ddg_region": "ar-es", "yandex_lr": ""},
    "cl": {"name": "Chile",     "google": "google.cl",      "bing_cc": "cl", "lang": "es", "tld": ".cl",      "ddg_region": "cl-es", "yandex_lr": ""},
    "pe": {"name": "Perú",      "google": "google.com.pe",  "bing_cc": "pe", "lang": "es", "tld": ".com.pe",  "ddg_region": "pe-es", "yandex_lr": ""},
    "ec": {"name": "Ecuador",   "google": "google.com.ec",  "bing_cc": "ec", "lang": "es", "tld": ".com.ec",  "ddg_region": "ec-es", "yandex_lr": ""},
    "es": {"name": "España",    "google": "google.es",      "bing_cc": "es", "lang": "es", "tld": ".es",      "ddg_region": "es-es", "yandex_lr": ""},
    "us": {"name": "USA",       "google": "google.com",     "bing_cc": "us", "lang": "en", "tld": ".com",     "ddg_region": "us-en", "yandex_lr": ""},
    "br": {"name": "Brasil",    "google": "google.com.br",  "bing_cc": "br", "lang": "pt", "tld": ".com.br",  "ddg_region": "br-pt", "yandex_lr": ""},
}

# ═══ USER-AGENT ROTATION POOL ═════════════════════════════════════════

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0",
]

def get_headers() -> Dict[str, str]:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
    }

# ═══ EXTRACTION PATTERNS ══════════════════════════════════════════════

EMAIL_RE  = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
PHONE_RE  = re.compile(r"(?<!\d)(\+?[\d\s.\-()]{7,20})(?!\d)")
WA_RE     = re.compile(r"wa\.me/(\d+)|api\.whatsapp\.com/send\?phone=(\d+)|whatsapp://send\?phone=(\d+)")
IG_RE     = re.compile(r"instagram\.com/([a-zA-Z0-9_.]{2,30})(?:/|\?|$)")
FB_RE     = re.compile(r"facebook\.com/(?:pages/[^/?]+/|)([a-zA-Z0-9.\-]{3,50})(?:/|\?|$)")
TIKTOK_RE = re.compile(r"tiktok\.com/@([a-zA-Z0-9_.]{2,30})")
YT_RE     = re.compile(r"youtube\.com/(?:channel/|c/|@)([a-zA-Z0-9_.\-]{2,60})")

NOISE_EMAIL_DOMAINS = {
    "example.com", "test.com", "sentry.io", "webpack.js", "w3.org",
    "schema.org", "googleapis.com", "google.com", "gstatic.com",
    "cloudflare.com", "jquery.com", "wixpress.com", "shopify.com",
    "squarespace.com", "wordpress.org", "bootstrap.com", "cdn.com",
    "amazonaws.com", "azure.com", "heroku.com", "vercel.app",
}

IG_NOISE  = {"p", "reel", "stories", "explore", "accounts", "about", "legal", "static", "tv"}
FB_NOISE  = {"sharer", "dialog", "share", "login", "register", "help", "policies", "groups"}


def normalize_phone(phone: str) -> str:
    """Strip all non-digits for dedup hashing."""
    digits = re.sub(r"\D", "", phone)
    if len(digits) < 7:
        return ""
    return digits[-10:]  # Last 10 digits for normalization


def is_valid_phone(phone: str) -> bool:
    digits = re.sub(r"\D", "", phone)
    return 7 <= len(digits) <= 15


def clean_email(email: str) -> bool:
    return not any(n in email.lower() for n in NOISE_EMAIL_DOMAINS)


# ═══ LEAD MODEL ═══════════════════════════════════════════════════════

class Lead:
    def __init__(self):
        self.name        = ""
        self.phone       = ""
        self.email       = ""
        self.whatsapp    = ""
        self.website     = ""
        self.instagram   = ""
        self.facebook    = ""
        self.tiktok      = ""
        self.youtube     = ""
        self.address     = ""
        self.source_url  = ""
        self.source_engine = ""
        self.source_query  = ""
        self.score       = 0   # data completeness 0-100
        self.notes       = ""

    def to_dict(self) -> Dict:
        return {k: v for k, v in vars(self).items()}

    def dedup_key(self) -> str:
        """Hash for deduplication — phone or email based."""
        phone_norm = normalize_phone(self.phone or self.whatsapp or "")
        email_norm = (self.email or "").lower().strip().split(",")[0]
        if phone_norm:
            return hashlib.md5(phone_norm.encode()).hexdigest()
        if email_norm:
            return hashlib.md5(email_norm.encode()).hexdigest()
        return hashlib.md5((self.source_url or self.name or "").encode()).hexdigest()

    def is_valid(self) -> bool:
        return bool(self.email or self.phone or self.whatsapp or self.instagram)

    def compute_score(self):
        pts = 0
        if self.name:      pts += 10
        if self.phone:     pts += 20
        if self.email:     pts += 25
        if self.whatsapp:  pts += 20
        if self.website:   pts += 10
        if self.instagram: pts += 10
        if self.address:   pts +=  5
        self.score = pts

    def summary(self) -> str:
        parts = []
        if self.email:     parts.append(f"📧 {self.email.split(',')[0][:30]}")
        if self.phone:     parts.append(f"📞 {self.phone.split(',')[0][:18]}")
        if self.whatsapp:  parts.append("💬 WA")
        if self.instagram: parts.append(f"📸 {self.instagram}")
        return " | ".join(parts) if parts else "—"


# ═══ DORK BUILDER ═════════════════════════════════════════════════════

def build_dorks(niche: str, city: str, region_id: str, zone: str = "") -> List[str]:
    R = REGIONS[region_id]
    y = str(datetime.now().year)
    z = zone or "centro"
    tld = R["tld"]

    dorks = [
        # ── GMB / Local ──────────────────────────────────────────────
        f'site:{R["google"]}/maps/place/ "{niche}" "{city}"',
        f'"{niche}" "{city}" site:{R["google"]}/maps',
        # ── Instagram ────────────────────────────────────────────────
        f'site:instagram.com "{niche}" "{city}" -inurl:/p/ -inurl:/reel/ -inurl:/tv/',
        f'site:instagram.com "{niche}" "{city}" "wa.me" OR "whatsapp"',
        f'site:instagram.com "{niche}" "{city}" "@gmail.com" OR "@hotmail.com" OR "@yahoo.com"',
        f'site:instagram.com "{niche}" "{city}" "linktr.ee" OR "beacons.ai"',
        f'site:instagram.com "{niche}" "{city}" "{z}" -inurl:/p/',
        # ── WhatsApp ─────────────────────────────────────────────────
        f'"{niche}" "{city}" "wa.me/" -site:instagram.com -site:facebook.com',
        f'"{niche}" "{city}" "api.whatsapp.com/send" OR "wa.me"',
        f'filetype:pdf "{niche}" "{city}" "whatsapp" OR "wa.me"',
        # ── Emails & Docs ─────────────────────────────────────────────
        f'filetype:pdf "{niche}" "{city}" "@gmail.com" OR "@hotmail.com" OR "@yahoo.com"',
        f'filetype:xlsx OR filetype:csv "{niche}" "{city}" "@"',
        f'filetype:docx "{niche}" "{city}" "@"',
        f'"{niche}" "{city}" intitle:"contacto" intext:"@"',
        f'"{niche}" "{city}" "ventas@" OR "info@" OR "contacto@" site:{tld.lstrip(".")}',
        # ── Webs propias ─────────────────────────────────────────────
        f'"{niche}" "{city}" inurl:contacto site:{tld.lstrip(".")}',
        f'"{niche}" "{city}" -site:instagram.com -site:facebook.com "teléfono" OR "celular" OR "phone"',
        # ── Websites obsoletas ────────────────────────────────────────
        f'"{niche}" "{city}" intext:"© 2018" OR intext:"© 2017" OR intext:"© 2019"',
        f'"{niche}" "{city}" (site:wixsite.com OR site:weebly.com OR site:blogspot.com)',
        f'"{niche}" "{city}" inurl:http:// -inurl:https:// "contacto"',
        # ── Social ───────────────────────────────────────────────────
        f'site:facebook.com/pages/ "{niche}" "{city}" -inurl:/posts/',
        f'site:linkedin.com/company/ "{niche}" "{city}"',
        f'site:tiktok.com "{niche}" "{city}" -inurl:/video/',
        # ── Directorios ──────────────────────────────────────────────
        f'"{niche}" "{city}" site:cylex.com{tld}',
        f'"{niche}" "{city}" site:infoisinfo.com{tld}',
        # ── Negocios nuevos ──────────────────────────────────────────
        f'"{niche}" "{city}" ("inauguración" OR "grand opening" OR "nuevo") after:{y}-01-01',
        f'"{niche}" "{city}" "abrimos" OR "apertura" after:{y}-01-01',
        # ── Combos avanzados ─────────────────────────────────────────
        f'"{niche}" "{city}" ("@gmail" OR "@hotmail" OR "wa.me") -site:instagram.com -site:facebook.com',
        f'"{niche}" "{city}" ("freelance" OR "independiente" OR "autónomo") ("whatsapp" OR "@gmail")',
        f'"{niche}" "{city}" "{z}" ("teléfono" OR "celular" OR "whatsapp")',
        # ── Marketplace ──────────────────────────────────────────────
        f'site:olx.com "{niche}" "{city}"',
        f'site:mercadolibre.com "{niche}" "{city}"',
        # ── Bing-specific (enviados a Bing) ──────────────────────────
        f'"{niche}" "{city}" loc:{region_id} inbody:"teléfono" OR inbody:"whatsapp"',
        # ── Yandex-specific ──────────────────────────────────────────
        f'"{niche}" "{city}" domain:{tld} body:"whatsapp" || body:"wa.me"',
    ]
    return dorks


# ═══ RETRY WITH BACKOFF ═══════════════════════════════════════════════

def retry_with_backoff(fn, max_retries=3, base_delay=2.0):
    """Exponential backoff wrapper."""
    for attempt in range(max_retries):
        try:
            result = fn()
            if result:
                return result
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"    ↻ Retry {attempt+1}/{max_retries} in {wait:.1f}s ({e})")
            time.sleep(wait)
    return []


# ═══ GOOGLE SEARCH ════════════════════════════════════════════════════

# Multiple CSS selector sets — Google changes HTML frequently
GOOGLE_RESULT_SELECTORS = [
    # 2024-2026 selectors (most current)
    "div.MjjYud",
    "div[data-sokoban-container]",
    ".Gx5Zad",
    # 2023 selectors
    "div.g",
    "div.tF2Cxc",
    # Universal fallbacks
    "#rso > div",
    "#search .g",
]

GOOGLE_LINK_SELECTORS = ["a[href]", "a[data-jsarwt]", "a[ping]"]
GOOGLE_TITLE_SELECTORS = ["h3", "h3[class]", ".DKV0Md", ".LC20lb"]
GOOGLE_SNIPPET_SELECTORS = ["div.VwiC3b", "span.aCOpRe", ".lEBKkf", "div[data-sncf]"]


def _parse_google_results(page_content, use_scrapling=True) -> List[Dict]:
    """Try multiple selector strategies to extract Google results."""
    results = []

    def extract_href(el, scrapling=True):
        href = el.attrib.get("href", "") if scrapling else el.get("href", "")
        if href.startswith("/url?q="):
            href = href.split("/url?q=")[1].split("&")[0]
        from urllib.parse import unquote
        return unquote(href) if href.startswith("http") else ""

    if use_scrapling:
        for container_sel in GOOGLE_RESULT_SELECTORS:
            containers = page_content.css(container_sel)
            if not containers:
                continue
            for item in containers:
                href = ""
                title = ""
                snippet = ""

                for ls in GOOGLE_LINK_SELECTORS:
                    link_el = item.css_first(ls)
                    if link_el:
                        href = extract_href(link_el, True)
                        if href:
                            break

                for ts in GOOGLE_TITLE_SELECTORS:
                    title_el = item.css_first(ts)
                    if title_el:
                        title = title_el.text.strip()
                        break

                for ss in GOOGLE_SNIPPET_SELECTORS:
                    snip_el = item.css_first(ss)
                    if snip_el:
                        snippet = snip_el.text.strip()
                        break

                if href and "google.com" not in href:
                    results.append({"url": href, "title": title, "snippet": snippet})

            if results:
                return results  # Stop at first working selector set
    else:
        # BeautifulSoup path
        for container_sel in GOOGLE_RESULT_SELECTORS:
            containers = page_content.select(container_sel)
            if not containers:
                continue
            for item in containers:
                href = ""
                title = ""
                snippet = ""

                for ls in GOOGLE_LINK_SELECTORS:
                    link_el = item.select_one(ls)
                    if link_el:
                        href = extract_href(link_el, False)
                        if href:
                            break

                for ts in GOOGLE_TITLE_SELECTORS:
                    title_el = item.select_one(ts)
                    if title_el:
                        title = title_el.get_text().strip()
                        break

                for ss in GOOGLE_SNIPPET_SELECTORS:
                    snip_el = item.select_one(ss)
                    if snip_el:
                        snippet = snip_el.get_text().strip()
                        break

                if href and "google.com" not in href:
                    results.append({"url": href, "title": title, "snippet": snippet})

            if results:
                return results

    return results


def search_google(query: str, region_id: str, num: int = 10, stealth: bool = False) -> List[Dict]:
    R = REGIONS[region_id]
    url = f"https://www.{R['google']}/search"
    params = {"q": query, "num": min(num, 50), "hl": R["lang"], "gl": region_id}

    def _fetch():
        if SCRAPLING_AVAILABLE:
            full_url = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
            if stealth:
                page = StealthyFetcher.fetch(full_url, headless=True, network_idle=True)
            else:
                page = Fetcher.get(full_url, stealthy_headers=True, follow_redirects=True)
            return _parse_google_results(page, use_scrapling=True)
        elif BS4_AVAILABLE:
            resp = requests.get(url, params=params, headers=get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                return _parse_google_results(soup, use_scrapling=False)
        return []

    try:
        return retry_with_backoff(_fetch)
    except Exception as e:
        print(f"  ❌ Google error: {e}")
        return []


# ═══ BING SEARCH ══════════════════════════════════════════════════════

BING_RESULT_SELECTORS = ["li.b_algo", "div.b_algo"]
BING_LINK_SELECTORS   = ["h2 > a", "h2 a", ".b_title a"]
BING_SNIPPET_SELECTORS = ["p.b_lineclamp2", "p.b_lineclamp1", "p", "div.b_caption p"]


def search_bing(query: str, region_id: str, num: int = 10, stealth: bool = False) -> List[Dict]:
    R = REGIONS[region_id]
    url = "https://www.bing.com/search"
    params = {"q": query, "count": min(num, 50), "cc": R["bing_cc"], "setlang": R["lang"]}

    def _fetch():
        results = []
        if SCRAPLING_AVAILABLE:
            full_url = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
            page = StealthyFetcher.fetch(full_url, headless=True) if stealth else Fetcher.get(full_url, stealthy_headers=True)
            for sel in BING_RESULT_SELECTORS:
                items = page.css(sel)
                for item in items:
                    link_el = None
                    for ls in BING_LINK_SELECTORS:
                        link_el = item.css_first(ls)
                        if link_el:
                            break
                    snip_el = None
                    for ss in BING_SNIPPET_SELECTORS:
                        snip_el = item.css_first(ss)
                        if snip_el:
                            break
                    if link_el:
                        href = link_el.attrib.get("href", "")
                        if href.startswith("http"):
                            results.append({"url": href, "title": link_el.text, "snippet": snip_el.text if snip_el else ""})
                if results:
                    break
        elif BS4_AVAILABLE:
            resp = requests.get(url, params=params, headers=get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for sel in BING_RESULT_SELECTORS:
                    for item in soup.select(sel):
                        link_el = None
                        for ls in BING_LINK_SELECTORS:
                            link_el = item.select_one(ls)
                            if link_el:
                                break
                        snip_el = None
                        for ss in BING_SNIPPET_SELECTORS:
                            snip_el = item.select_one(ss)
                            if snip_el:
                                break
                        if link_el:
                            href = link_el.get("href", "")
                            if href.startswith("http"):
                                results.append({"url": href, "title": link_el.get_text(), "snippet": snip_el.get_text() if snip_el else ""})
                    if results:
                        break
        return results

    try:
        return retry_with_backoff(_fetch)
    except Exception as e:
        print(f"  ❌ Bing error: {e}")
        return []


# ═══ DUCKDUCKGO SEARCH ════════════════════════════════════════════════

def search_ddg(query: str, region_id: str = "co", num: int = 10) -> List[Dict]:
    R = REGIONS.get(region_id, REGIONS["co"])

    # ── Method 1: duckduckgo-search library (most reliable) ──
    if DDGS_AVAILABLE:
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(
                    query,
                    region=R["ddg_region"],
                    max_results=num,
                ))
            return [{"url": r.get("href", ""), "title": r.get("title", ""), "snippet": r.get("body", "")} for r in results if r.get("href", "").startswith("http")]
        except Exception as e:
            print(f"    ↻ DDGS lib error: {e} — trying HTML fallback")

    # ── Method 2: Scrapling POST (better than requests for anti-bot) ──
    if SCRAPLING_AVAILABLE:
        try:
            page = Fetcher.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query, "kl": R["ddg_region"]},
                stealthy_headers=True,
            )
            results = []
            for r in page.css("div.result")[:num]:
                link = r.css_first("a.result__a")
                snippet = r.css_first("a.result__snippet")
                if link:
                    href = link.attrib.get("href", "")
                    results.append({"url": href, "title": link.text, "snippet": snippet.text if snippet else ""})
            return results
        except Exception as e:
            print(f"    ↻ Scrapling DDG error: {e} — trying requests")

    # ── Method 3: requests + BS4 fallback ──
    if BS4_AVAILABLE:
        try:
            resp = requests.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query, "kl": R["ddg_region"]},
                headers=get_headers(),
                timeout=15,
            )
            soup = BeautifulSoup(resp.text, "html.parser")
            results = []
            for r in soup.select("div.result")[:num]:
                link = r.select_one("a.result__a")
                snippet = r.select_one("a.result__snippet")
                if link:
                    results.append({"url": link.get("href", ""), "title": link.get_text(), "snippet": snippet.get_text() if snippet else ""})
            return results
        except Exception as e:
            print(f"  ❌ DDG all methods failed: {e}")

    return []


# ═══ YANDEX SEARCH ════════════════════════════════════════════════════

YANDEX_RESULT_SELECTORS = [
    "li.serp-item",
    "div.serp-item",
    "div[class*='serp-item']",
    ".organic",
    "div[data-cid]",
]

def search_yandex(query: str, region_id: str = "co", num: int = 10) -> List[Dict]:
    R = REGIONS.get(region_id, REGIONS["co"])
    url = "https://yandex.com/search/"
    params = {"text": query, "numdoc": min(num, 50), "lang": R["lang"]}

    def _fetch():
        results = []
        if SCRAPLING_AVAILABLE:
            full_url = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
            page = Fetcher.get(full_url, stealthy_headers=True, follow_redirects=True)
            for sel in YANDEX_RESULT_SELECTORS:
                items = page.css(sel)
                for item in items[:num]:
                    link_el = item.css_first("a[href]")
                    title_el = item.css_first("h2, .organic__title, .serp-item__title")
                    snip_el = item.css_first(".organic__content-wrapper, .serp-item__text")
                    if link_el:
                        href = link_el.attrib.get("href", "")
                        if href.startswith("http") and "yandex.com" not in href:
                            results.append({"url": href, "title": title_el.text if title_el else "", "snippet": snip_el.text if snip_el else ""})
                if results:
                    break
        elif BS4_AVAILABLE:
            resp = requests.get(url, params=params, headers=get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for sel in YANDEX_RESULT_SELECTORS:
                    for item in soup.select(sel)[:num]:
                        link_el = item.select_one("a[href]")
                        title_el = item.select_one("h2")
                        if link_el:
                            href = link_el.get("href", "")
                            if href.startswith("http") and "yandex.com" not in href:
                                results.append({"url": href, "title": title_el.get_text() if title_el else "", "snippet": ""})
                    if results:
                        break
        return results

    try:
        return retry_with_backoff(_fetch)
    except Exception as e:
        print(f"  ❌ Yandex error: {e}")
        return []


# ═══ BRAVE SEARCH ═════════════════════════════════════════════════════

BRAVE_RESULT_SELECTORS = [".snippet", "article", "div[data-type='web']"]

def search_brave(query: str, region_id: str = "co", num: int = 10) -> List[Dict]:
    R = REGIONS.get(region_id, REGIONS["co"])
    url = "https://search.brave.com/search"
    params = {"q": query, "count": min(num, 20), "country": region_id.upper(), "lang": R["lang"]}

    def _fetch():
        results = []
        if SCRAPLING_AVAILABLE:
            full_url = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
            page = Fetcher.get(full_url, stealthy_headers=True, follow_redirects=True)
            for sel in BRAVE_RESULT_SELECTORS:
                items = page.css(sel)
                for item in items[:num]:
                    link_el = item.css_first("a[href]")
                    title_el = item.css_first("span.title, h3, .snippet-title")
                    snip_el = item.css_first("p.snippet-description, .snippet-content")
                    if link_el:
                        href = link_el.attrib.get("href", "")
                        if href.startswith("http") and "brave.com" not in href:
                            results.append({"url": href, "title": title_el.text if title_el else "", "snippet": snip_el.text if snip_el else ""})
                if results:
                    break
        elif BS4_AVAILABLE:
            resp = requests.get(url, params=params, headers=get_headers(), timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for item in soup.select(".snippet")[:num]:
                    link = item.select_one("a[href]")
                    if link:
                        href = link.get("href", "")
                        if href.startswith("http") and "brave.com" not in href:
                            results.append({"url": href, "title": link.get_text(), "snippet": ""})
        return results

    try:
        return retry_with_backoff(_fetch)
    except Exception as e:
        print(f"  ❌ Brave error: {e}")
        return []


# ═══ MULTI-ENGINE FAILOVER ════════════════════════════════════════════

def multi_engine_search(query: str, region_id: str, num: int = 10, stealth: bool = False, use_yandex: bool = True) -> tuple:
    """
    Google → Bing → DDG → Yandex → Brave
    Returns (results, engine_name)
    """
    engines = [
        ("Google",   lambda: search_google(query, region_id, num, stealth)),
        ("Bing",     lambda: search_bing(query, region_id, num, stealth)),
        ("DDG",      lambda: search_ddg(query, region_id, num)),
        ("Yandex",   lambda: search_yandex(query, region_id, num)) if use_yandex else None,
        ("Brave",    lambda: search_brave(query, region_id, num)),
    ]

    for entry in engines:
        if entry is None:
            continue
        name, fn = entry
        try:
            results = fn()
            if results:
                return results, name
            print(f"  ↻ {name}: 0 results — trying next engine...")
        except Exception as e:
            print(f"  ↻ {name} failed ({e}) — trying next engine...")
        time.sleep(random.uniform(1.0, 2.5))

    return [], "None"


# ═══ PAGE DATA EXTRACTION ═════════════════════════════════════════════

def extract_from_page(url: str, stealth: bool = False) -> Lead:
    """Fetch a page and extract all contact data using all patterns."""
    lead = Lead()
    lead.source_url = url

    try:
        body_text = ""
        html_str  = ""

        if SCRAPLING_AVAILABLE:
            if stealth:
                page = StealthyFetcher.fetch(url, headless=True, network_idle=True)
            else:
                page = Fetcher.get(url, stealthy_headers=True, follow_redirects=True, timeout=12)

            title_el = page.css_first("title")
            if title_el:
                lead.name = title_el.text.strip()[:120]

            # Use get_text() if available, else .text
            body_text = page.get_text() if hasattr(page, "get_text") else (page.text or "")
            html_str  = str(page.html) if hasattr(page, "html") else body_text

            # ── Email via mailto: links (most reliable) ──
            mailto_emails = []
            for m in page.css('a[href^="mailto:"]'):
                href = m.attrib.get("href", "")
                e = href.replace("mailto:", "").split("?")[0].strip()
                if e and clean_email(e):
                    mailto_emails.append(e)

            regex_emails = [e for e in EMAIL_RE.findall(body_text) if clean_email(e)]
            all_emails = list(dict.fromkeys(mailto_emails + regex_emails))  # preserve order, dedup
            if all_emails:
                lead.email = ", ".join(all_emails[:5])

            # ── Phone via tel: links ──
            phones = []
            for p in page.css('a[href^="tel:"]'):
                href = p.attrib.get("href", "").replace("tel:", "").strip()
                if is_valid_phone(href):
                    phones.append(href)
            if not phones:
                phones = [p.strip() for p in PHONE_RE.findall(body_text) if is_valid_phone(p.strip())]

            seen_phones: Set[str] = set()
            unique_phones = []
            for p in phones:
                norm = normalize_phone(p)
                if norm and norm not in seen_phones:
                    seen_phones.add(norm)
                    unique_phones.append(p.strip())
            if unique_phones:
                lead.phone = ", ".join(unique_phones[:3])

            # ── WhatsApp ──
            for w in page.css('a[href*="wa.me"], a[href*="whatsapp.com"]'):
                href = w.attrib.get("href", "")
                if href:
                    lead.whatsapp = href
                    break
            if not lead.whatsapp:
                for m in WA_RE.findall(html_str):
                    num = m[0] or m[1] or m[2]
                    if num:
                        lead.whatsapp = f"https://wa.me/{num}"
                        break

            # ── Instagram ──
            for ig in page.css('a[href*="instagram.com"]'):
                href = ig.attrib.get("href", "")
                for handle in IG_RE.findall(href):
                    if handle.lower() not in IG_NOISE:
                        lead.instagram = f"@{handle}"
                        break
                if lead.instagram:
                    break
            if not lead.instagram:
                for handle in IG_RE.findall(html_str):
                    if handle.lower() not in IG_NOISE:
                        lead.instagram = f"@{handle}"
                        break

            # ── Facebook ──
            for fb in page.css('a[href*="facebook.com"]'):
                href = fb.attrib.get("href", "")
                for handle in FB_RE.findall(href):
                    if handle.lower() not in FB_NOISE and len(handle) > 3:
                        lead.facebook = f"https://facebook.com/{handle}"
                        break
                if lead.facebook:
                    break

            # ── TikTok ──
            for tt in page.css('a[href*="tiktok.com"]'):
                href = tt.attrib.get("href", "")
                matches = TIKTOK_RE.findall(href)
                if matches:
                    lead.tiktok = f"@{matches[0]}"
                    break

            # ── YouTube ──
            for yt in page.css('a[href*="youtube.com"]'):
                href = yt.attrib.get("href", "")
                matches = YT_RE.findall(href)
                if matches:
                    lead.youtube = f"https://youtube.com/@{matches[0]}"
                    break

            # ── Address via schema ──
            schema_el = page.css_first('[itemprop="address"], .address, [class*="address"]')
            if schema_el:
                lead.address = schema_el.text.strip()[:200]

        elif BS4_AVAILABLE:
            resp = requests.get(url, headers=get_headers(), timeout=10, allow_redirects=True)
            soup = BeautifulSoup(resp.text, "html.parser")
            body_text = soup.get_text(separator=" ", strip=True)
            html_str  = resp.text

            title = soup.find("title")
            if title:
                lead.name = title.get_text().strip()[:120]

            emails = [e for e in EMAIL_RE.findall(body_text) if clean_email(e)]
            if emails:
                lead.email = ", ".join(list(dict.fromkeys(emails))[:5])

            phones = [p.strip() for p in PHONE_RE.findall(body_text) if is_valid_phone(p.strip())]
            seen_phones: Set[str] = set()
            unique_phones = []
            for p in phones:
                norm = normalize_phone(p)
                if norm and norm not in seen_phones:
                    seen_phones.add(norm)
                    unique_phones.append(p.strip())
            if unique_phones:
                lead.phone = ", ".join(unique_phones[:3])

            for m in WA_RE.findall(html_str):
                num = m[0] or m[1] or m[2]
                if num:
                    lead.whatsapp = f"https://wa.me/{num}"
                    break

            for handle in IG_RE.findall(html_str):
                if handle.lower() not in IG_NOISE:
                    lead.instagram = f"@{handle}"
                    break

            for handle in FB_RE.findall(html_str):
                if handle.lower() not in FB_NOISE and len(handle) > 3:
                    lead.facebook = f"https://facebook.com/{handle}"
                    break

            for handle in TIKTOK_RE.findall(html_str):
                lead.tiktok = f"@{handle}"
                break

        # ── Website ──
        lead.website = url.split("?")[0][:200]

        # ── Notes ──
        _add_notes(lead, url, body_text, html_str)
        lead.compute_score()

    except Exception as e:
        lead.notes = f"Error: {str(e)[:120]}"

    return lead


def _add_notes(lead: Lead, url: str, body_text: str, html: str):
    notes = []
    old_years = re.findall(r"©\s*(201[0-8]|2019)", body_text)
    if old_years:
        notes.append(f"Old©{old_years[0]}")
    if url.startswith("http://"):
        notes.append("NoHTTPS")
    if any(d in url for d in ["wixsite.com", "weebly.com", "blogspot.com", "wordpress.com", "jimdo.com"]):
        notes.append("FreeDomain")
    if any(t in body_text.lower() for t in ["coming soon", "en construcción", "under construction", "próximamente"]):
        notes.append("UnderConstruction")
    if "linktr.ee" in html or "linktree" in html.lower():
        notes.append("Linktree")
    if "wa.me" in html or "whatsapp" in html.lower():
        notes.append("HasWA")
    lead.notes = " | ".join(notes)


# ═══ SPIDER MODE ══════════════════════════════════════════════════════

def run_spider_mode(niche: str, city: str, region_id: str, zone: str = "") -> List[Lead]:
    if not SCRAPLING_AVAILABLE:
        print("❌ Spider mode requires Scrapling. Install: pip install 'scrapling[fetchers]' && scrapling install")
        return []

    try:
        from scrapling.spiders import Spider, Request, Response
    except ImportError:
        print("❌ Scrapling spiders not available. Update: pip install -U 'scrapling[fetchers]'")
        return []

    R = REGIONS[region_id]
    dorks = build_dorks(niche, city, region_id, zone)
    start_urls = [
        f"https://www.{R['google']}/search?q={quote_plus(d)}&num=10&hl={R['lang']}&gl={region_id}"
        for d in dorks[:12]
    ]
    all_leads: List[Lead] = []

    class LeadSpider(Spider):
        name = "dorking_leads_v3"
        concurrent_requests = 4
        download_delay = 2.5

        async def parse(self, response: Response):
            for item in response.css("div.MjjYud, div.g, .Gx5Zad"):
                link = item.css_first("a[href]")
                if link:
                    href = link.attrib.get("href", "")
                    if href.startswith("/url?q="):
                        href = href.split("/url?q=")[1].split("&")[0]
                    if href.startswith("http") and "google.com" not in href:
                        yield Request(href, callback=self.parse_lead)

        async def parse_lead(self, response: Response):
            lead = Lead()
            lead.source_url = str(response.url)
            lead.source_engine = "Spider/Google"

            title = response.css_first("title")
            if title:
                lead.name = title.text.strip()[:120]

            body = response.get_text() if hasattr(response, "get_text") else response.text
            html = str(response.html) if hasattr(response, "html") else body

            # Emails
            emails = [e for e in EMAIL_RE.findall(body) if clean_email(e)]
            if emails:
                lead.email = ", ".join(list(dict.fromkeys(emails))[:3])

            # Phones
            phones = [p.strip() for p in PHONE_RE.findall(body) if is_valid_phone(p.strip())]
            if phones:
                lead.phone = ", ".join(list(dict.fromkeys(phones))[:2])

            # WhatsApp
            for m in WA_RE.findall(html):
                num = m[0] or m[1] or m[2]
                if num:
                    lead.whatsapp = f"https://wa.me/{num}"
                    break

            # Instagram
            for h in IG_RE.findall(html):
                if h.lower() not in IG_NOISE:
                    lead.instagram = f"@{h}"
                    break

            lead.compute_score()
            if lead.is_valid():
                yield lead.to_dict()

    print(f"\n🕷️  Spider v3.0 — {len(start_urls)} start URLs | concurrency=4 | delay=2.5s\n")
    spider = LeadSpider()
    spider.start_urls = start_urls
    result = spider.start()

    for item in result.items:
        lead = Lead()
        for k, v in item.items():
            if hasattr(lead, k):
                setattr(lead, k, v)
        all_leads.append(lead)

    return all_leads


# ═══ MAIN PIPELINE ════════════════════════════════════════════════════

def run(
    niche: str,
    city: str,
    region_id: str,
    zone: str = "",
    max_pages: int = 10,
    delay: int = 3,
    stealth: bool = False,
    spider_mode: bool = False,
    use_yandex: bool = True,
    output: Optional[str] = None,
    min_score: int = 0,
):
    R = REGIONS.get(region_id)
    if not R:
        print(f"❌ Unknown region: {region_id}. Available: {', '.join(REGIONS.keys())}")
        return

    if not output:
        ts = datetime.now().strftime("%Y%m%d_%H%M")
        output = f"leads_{niche.replace(' ','_')}_{city.replace(' ','_')}_{region_id}_{ts}.csv"

    engine_name = "Scrapling" if SCRAPLING_AVAILABLE else "BeautifulSoup"
    mode = "Spider" if spider_mode else ("Stealth" if stealth else "Standard")

    print("═" * 64)
    print(f"  🔍 DORKING LAB v3.0 | Engine: {engine_name} | Mode: {mode}")
    print(f"  Niche: {niche} | City: {city} | Region: {R['name']}")
    print(f"  DDG lib: {'✅' if DDGS_AVAILABLE else '❌'} | Yandex: {'✅' if use_yandex else '—'}")
    print("═" * 64)

    if spider_mode:
        all_leads = run_spider_mode(niche, city, region_id, zone)
    else:
        dorks = build_dorks(niche, city, region_id, zone)
        print(f"\n  📋 {len(dorks)} dork queries\n")

        all_leads: List[Lead] = []
        seen_urls: Set[str] = set()
        seen_dedup: Set[str] = set()

        for i, query in enumerate(dorks):
            print(f"\n[{i+1}/{len(dorks)}] 🔍 {query[:70]}...")

            results, engine_used = multi_engine_search(query, region_id, max_pages, stealth, use_yandex)
            print(f"  ↳ {engine_used}: {len(results)} results")

            for j, result in enumerate(results):
                url = result.get("url", "")
                if not url or not url.startswith("http"):
                    continue
                # URL-level dedup
                url_key = url.split("?")[0].rstrip("/")
                if url_key in seen_urls:
                    continue
                seen_urls.add(url_key)

                print(f"    [{j+1}] {url[:62]}...", end="", flush=True)
                lead = extract_from_page(url, stealth)
                lead.source_query  = query[:100]
                lead.source_engine = engine_used

                # Lead-level dedup (by normalized phone/email)
                dk = lead.dedup_key()
                if dk in seen_dedup:
                    print(" ⟳ dup")
                    continue
                seen_dedup.add(dk)

                if lead.is_valid() and lead.score >= min_score:
                    all_leads.append(lead)
                    print(f" ✅ [{lead.score}pts] {lead.summary()}")
                else:
                    print(f" · (score={lead.score})")

                time.sleep(random.uniform(0.8, 1.5))

            time.sleep(random.uniform(delay - 0.5, delay + 1.0))

    # ── SAVE CSV ──
    print("\n" + "═" * 64)
    if all_leads:
        fields = ["name","phone","email","whatsapp","website","instagram","facebook",
                  "tiktok","youtube","address","score","source_engine","source_url","source_query","notes"]
        with open(output, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            writer.writeheader()
            for lead in sorted(all_leads, key=lambda l: l.score, reverse=True):
                writer.writerow(lead.to_dict())

        avg_score = sum(l.score for l in all_leads) / len(all_leads)
        print(f"  ✅ {len(all_leads)} leads → {output}")
        print(f"  📊 Avg quality score: {avg_score:.1f}/100")
        print(f"  📧 Emails:    {sum(1 for l in all_leads if l.email)}")
        print(f"  📞 Phones:    {sum(1 for l in all_leads if l.phone)}")
        print(f"  💬 WhatsApp:  {sum(1 for l in all_leads if l.whatsapp)}")
        print(f"  📸 Instagram: {sum(1 for l in all_leads if l.instagram)}")
        print(f"  👥 Facebook:  {sum(1 for l in all_leads if l.facebook)}")
    else:
        print("  ⚠ No leads found. Try --stealth, different niche/city, or --no-yandex.")
    print("═" * 64)
    return all_leads


# ═══ CLI ══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="DORKING LAB v3.0 — Multi-Engine Lead Scraper",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
EXAMPLES:
  python dorking_scraper.py "dentista" "bogota" -r co
  python dorking_scraper.py "restaurant" "miami" -r us --stealth
  python dorking_scraper.py "restaurante" "madrid" -r es --spider
  python dorking_scraper.py "plomero" "cdmx" -r mx -z "polanco" -m 20 --stealth
  python dorking_scraper.py "electricista" "lima" -r pe --no-yandex -d 5

INSTALL:
  Full:    pip install "scrapling[fetchers]" duckduckgo-search && scrapling install
  Minimal: pip install requests beautifulsoup4
        """
    )
    parser.add_argument("niche",  help="Business niche (e.g. 'dentista', 'restaurant')")
    parser.add_argument("city",   help="City (e.g. 'bogota', 'miami')")
    parser.add_argument("-r", "--region",    default="co", choices=list(REGIONS.keys()), help="Region code (default: co)")
    parser.add_argument("-z", "--zone",      default="",   help="Zone/neighborhood (optional)")
    parser.add_argument("-m", "--max-pages", type=int, default=10, help="Max results per query (default: 10)")
    parser.add_argument("-d", "--delay",     type=int, default=3,  help="Delay between queries in seconds (default: 3)")
    parser.add_argument("-o", "--output",    default=None, help="Output CSV filename")
    parser.add_argument("-s", "--min-score", type=int, default=0, help="Min quality score 0-100 (default: 0)")
    parser.add_argument("--stealth",    action="store_true",  help="Use StealthyFetcher (Cloudflare bypass)")
    parser.add_argument("--spider",     action="store_true",  help="Use Scrapling Spider (concurrent)")
    parser.add_argument("--no-yandex",  action="store_true",  help="Skip Yandex in failover chain")

    args = parser.parse_args()
    run(
        args.niche, args.city, args.region, args.zone,
        args.max_pages, args.delay, args.stealth, args.spider,
        not args.no_yandex, args.output, args.min_score,
    )
