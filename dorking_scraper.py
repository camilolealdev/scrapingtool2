#!/usr/bin/env python3
"""
════════════════════════════════════════════════════════════════════════
  DORKING LAB — Python Lead Scraper v2.0
  Powered by Scrapling (https://github.com/D4Vinci/Scrapling)

  Features:
    ✓ Scrapling StealthyFetcher — bypasses Cloudflare, anti-bot
    ✓ Scrapling Fetcher — fast HTTP with TLS fingerprint impersonation
    ✓ Scrapling adaptive selectors — survives website redesigns
    ✓ Scrapling Spider — concurrent multi-page crawls
    ✓ BeautifulSoup fallback if Scrapling not installed
    ✓ Multi-engine search: Google → Bing → DuckDuckGo
    ✓ Regex extraction: emails, phones, WhatsApp, Instagram
    ✓ 9 regions: CO, MX, AR, CL, PE, EC, ES, US, BR
    ✓ CSV export with BOM for Excel compatibility

  Install:
    pip install "scrapling[fetchers]" && scrapling install
    # OR minimal: pip install requests beautifulsoup4

  Usage:
    python dorking_scraper.py "dentista" "bogota" -r co
    python dorking_scraper.py "restaurant" "miami" -r us --stealth
    python dorking_scraper.py "restaurante" "madrid" -r es --spider
════════════════════════════════════════════════════════════════════════
"""

import csv
import re
import time
import json
import argparse
import sys
from urllib.parse import quote_plus, urlparse
from datetime import datetime
from typing import Optional

# ─── DETECT AVAILABLE ENGINES ───
SCRAPLING_AVAILABLE = False
BS4_AVAILABLE = False

try:
    from scrapling.fetchers import Fetcher, StealthyFetcher, AsyncFetcher
    from scrapling.fetchers import FetcherSession, StealthySession

    SCRAPLING_AVAILABLE = True
    print("✅ Scrapling detected — using StealthyFetcher + adaptive selectors")
except ImportError:
    pass

try:
    import requests
    from bs4 import BeautifulSoup

    BS4_AVAILABLE = True
    if not SCRAPLING_AVAILABLE:
        print("⚠️  Scrapling not found — falling back to BeautifulSoup + requests")
        print(
            "   Install Scrapling for anti-bot bypass: pip install 'scrapling[fetchers]' && scrapling install"
        )
except ImportError:
    if not SCRAPLING_AVAILABLE:
        print("❌ Neither Scrapling nor BeautifulSoup found!")
        print("   Install: pip install 'scrapling[fetchers]' && scrapling install")
        print("   Or minimal: pip install requests beautifulsoup4")
        sys.exit(1)

# ─── REGIONS ───
REGIONS = {
    "co": {
        "name": "Colombia",
        "google": "google.com.co",
        "bing_cc": "co",
        "lang": "es",
        "tld": ".com.co",
    },
    "mx": {
        "name": "México",
        "google": "google.com.mx",
        "bing_cc": "mx",
        "lang": "es",
        "tld": ".com.mx",
    },
    "ar": {
        "name": "Argentina",
        "google": "google.com.ar",
        "bing_cc": "ar",
        "lang": "es",
        "tld": ".com.ar",
    },
    "cl": {
        "name": "Chile",
        "google": "google.cl",
        "bing_cc": "cl",
        "lang": "es",
        "tld": ".cl",
    },
    "pe": {
        "name": "Perú",
        "google": "google.com.pe",
        "bing_cc": "pe",
        "lang": "es",
        "tld": ".com.pe",
    },
    "ec": {
        "name": "Ecuador",
        "google": "google.com.ec",
        "bing_cc": "ec",
        "lang": "es",
        "tld": ".com.ec",
    },
    "es": {
        "name": "España",
        "google": "google.es",
        "bing_cc": "es",
        "lang": "es",
        "tld": ".es",
    },
    "us": {
        "name": "USA",
        "google": "google.com",
        "bing_cc": "us",
        "lang": "en",
        "tld": ".com",
    },
    "br": {
        "name": "Brasil",
        "google": "google.com.br",
        "bing_cc": "br",
        "lang": "pt",
        "tld": ".com.br",
    },
}

# ─── EXTRACTION PATTERNS ───
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"\+?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}")
WA_RE = re.compile(r"wa\.me/(\d+)|api\.whatsapp\.com/send\?phone=(\d+)")
IG_RE = re.compile(r"instagram\.com/([a-zA-Z0-9_.]{2,30})")
NOISE_DOMAINS = {
    "example.com",
    "test.com",
    "sentry.io",
    "webpack.js",
    "w3.org",
    "schema.org",
    "googleapis.com",
    "google.com",
    "gstatic.com",
    "cloudflare.com",
    "jquery.com",
}
IG_NOISE = {"p", "reel", "stories", "explore", "accounts", "about", "legal", "static"}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}


# ═══════════════════════════════════════════════════════════════════════
#  LEAD DATA MODEL
# ═══════════════════════════════════════════════════════════════════════


class Lead:
    def __init__(self):
        self.name = ""
        self.phone = ""
        self.email = ""
        self.whatsapp = ""
        self.website = ""
        self.instagram = ""
        self.address = ""
        self.source_url = ""
        self.source_query = ""
        self.notes = ""

    def to_dict(self):
        return vars(self)

    def is_valid(self):
        return bool(self.email or self.phone or self.whatsapp or self.instagram)

    def summary(self):
        parts = []
        if self.email:
            parts.append(f"📧 {self.email.split(',')[0].strip()}")
        if self.phone:
            parts.append(f"📞 {self.phone.split(',')[0].strip()}")
        if self.whatsapp:
            parts.append("💬 WA")
        if self.instagram:
            parts.append(f"📸 {self.instagram}")
        return " | ".join(parts) if parts else "—"


# ═══════════════════════════════════════════════════════════════════════
#  DORK QUERY GENERATOR
# ═══════════════════════════════════════════════════════════════════════


def build_dorks(niche: str, city: str, region_id: str, zone: str = "") -> list:
    R = REGIONS[region_id]
    y = str(datetime.now().year)
    z = zone or "centro"

    return [
        # Google Maps / GMB
        f'site:{R["google"]}/maps/place/ "{niche}" "{city}"',
        f'site:{R["google"]}/maps "{niche}" "{city}"',
        # Instagram
        f'site:instagram.com "{niche}" "{city}" -inurl:/p/ -inurl:/reel/',
        f'site:instagram.com "{niche}" "{city}" "wa.me" OR "whatsapp"',
        f'site:instagram.com "{niche}" "{city}" "@gmail.com" OR "@hotmail.com"',
        f'site:instagram.com "{niche}" "{city}" "linktr.ee"',
        # Obsolete websites
        f'"{niche}" "{city}" intext:"© 2018" OR intext:"© 2017" OR intext:"© 2019"',
        f'"{niche}" "{city}" inurl:index.html OR inurl:index.htm -wordpress -wix',
        f'"{niche}" "{city}" (site:wixsite.com OR site:weebly.com OR site:blogspot.com)',
        # Emails & contacts
        f'filetype:pdf OR filetype:xlsx "{niche}" "{city}" "@gmail.com" OR "@hotmail.com"',
        f'"{niche}" "{city}" intitle:"contacto" intext:"@"',
        f'"{niche}" "{city}" "wa.me/" OR "api.whatsapp.com/send"',
        # Social
        f'site:facebook.com "{niche}" "{city}" -"website"',
        f'site:linkedin.com/company/ "{niche}" "{city}"',
        f'site:tiktok.com "{niche}" "{city}"',
        # Advanced combos
        f'"{niche}" "{city}" (site:instagram.com OR site:facebook.com) ("wa.me" OR "@gmail") -"www."',
        f'"{niche}" "{city}" ("freelance" OR "freelance") ("whatsapp" OR "@gmail")',
        f'"{niche}" "{city}" -site:instagram.com -site:facebook.com inurl:"contacto"',
        # New businesses
        f'"{niche}" "{city}" ("grand opening" OR "now open" OR "new business") after:{y}-01-01',
        # Zone
        f'"{niche}" "{city}" "{z}" intext:"phone"',
    ]


# ═══════════════════════════════════════════════════════════════════════
#  SEARCH ENGINES (multi-engine with fallback)
# ═══════════════════════════════════════════════════════════════════════


def _search_with_scrapling(url: str, params: dict, stealth: bool = False):
    """Use Scrapling's fetchers to search."""
    full_url = (
        url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
    )

    if stealth:
        page = StealthyFetcher.fetch(full_url, headless=True, network_idle=True)
    else:
        page = Fetcher.get(full_url, stealthy_headers=True, follow_redirects=True)

    return page


def _search_with_requests(url: str, params: dict):
    """Fallback search with requests + BS4."""
    resp = requests.get(url, params=params, headers=HEADERS, timeout=15)
    return BeautifulSoup(resp.text, "html.parser") if resp.status_code == 200 else None


def search_google(
    query: str, region_id: str, num: int = 10, stealth: bool = False
) -> list:
    R = REGIONS[region_id]
    results = []
    url = f"https://www.{R['google']}/search"
    params = {"q": query, "num": num, "hl": R["lang"]}

    try:
        if SCRAPLING_AVAILABLE:
            page = _search_with_scrapling(url, params, stealth)
            # Scrapling CSS selectors
            for g in page.css("div.g, div.tF2Cxc"):
                link_el = g.css_first("a[href]")
                title_el = g.css_first("h3")
                snippet_el = g.css_first("div.VwiC3b, span.aCOpRe")
                if link_el:
                    href = link_el.attrib.get("href", "")
                    if href.startswith("/url?q="):
                        href = href.split("/url?q=")[1].split("&")[0]
                    if href.startswith("http"):
                        results.append(
                            {
                                "url": href,
                                "title": title_el.text if title_el else "",
                                "snippet": snippet_el.text if snippet_el else "",
                            }
                        )
        elif BS4_AVAILABLE:
            soup = _search_with_requests(url, params)
            if soup:
                for g in soup.select("div.g, div.tF2Cxc"):
                    link = g.select_one("a[href]")
                    title = g.select_one("h3")
                    snippet = g.select_one("div.VwiC3b, span.aCOpRe")
                    if link:
                        href = link.get("href", "")
                        if href.startswith("/url?q="):
                            href = href.split("/url?q=")[1].split("&")[0]
                        if href.startswith("http"):
                            results.append(
                                {
                                    "url": href,
                                    "title": title.text if title else "",
                                    "snippet": snippet.text if snippet else "",
                                }
                            )
    except Exception as e:
        print(f"  ❌ Google search error: {e}")

    return results


def search_bing(
    query: str, region_id: str, num: int = 10, stealth: bool = False
) -> list:
    R = REGIONS[region_id]
    results = []
    url = "https://www.bing.com/search"
    params = {"q": query, "count": num, "cc": R["bing_cc"]}

    try:
        if SCRAPLING_AVAILABLE:
            page = _search_with_scrapling(url, params, stealth)
            for li in page.css("li.b_algo"):
                link = li.css_first("h2 a")
                snippet = li.css_first("p")
                if link:
                    results.append(
                        {
                            "url": link.attrib.get("href", ""),
                            "title": link.text,
                            "snippet": snippet.text if snippet else "",
                        }
                    )
        elif BS4_AVAILABLE:
            soup = _search_with_requests(url, params)
            if soup:
                for li in soup.select("li.b_algo"):
                    link = li.select_one("h2 a")
                    snippet = li.select_one("p")
                    if link:
                        results.append(
                            {
                                "url": link.get("href", ""),
                                "title": link.text,
                                "snippet": snippet.text if snippet else "",
                            }
                        )
    except Exception as e:
        print(f"  ❌ Bing error: {e}")

    return results


def search_ddg(query: str, num: int = 10) -> list:
    """DuckDuckGo HTML search as last fallback."""
    results = []
    try:
        if BS4_AVAILABLE:
            resp = requests.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                headers=HEADERS,
                timeout=15,
            )
            soup = BeautifulSoup(resp.text, "html.parser")
            for r in soup.select("div.result")[:num]:
                link = r.select_one("a.result__a")
                snippet = r.select_one("a.result__snippet")
                if link:
                    results.append(
                        {
                            "url": link.get("href", ""),
                            "title": link.text,
                            "snippet": snippet.text if snippet else "",
                        }
                    )
        elif SCRAPLING_AVAILABLE:
            # Scrapling POST via Fetcher
            page = Fetcher.post(
                "https://html.duckduckgo.com/html/",
                data={"q": query},
                stealthy_headers=True,
            )
            for r in page.css("div.result")[:num]:
                link = r.css_first("a.result__a")
                snippet = r.css_first("a.result__snippet")
                if link:
                    results.append(
                        {
                            "url": link.attrib.get("href", ""),
                            "title": link.text,
                            "snippet": snippet.text if snippet else "",
                        }
                    )
    except Exception as e:
        print(f"  ❌ DDG error: {e}")

    return results


# ═══════════════════════════════════════════════════════════════════════
#  PAGE DATA EXTRACTION
# ═══════════════════════════════════════════════════════════════════════


def extract_from_page(url: str, stealth: bool = False) -> Lead:
    """Fetch a page and extract all contact data."""
    lead = Lead()
    lead.source_url = url

    try:
        if SCRAPLING_AVAILABLE:
            # ─── SCRAPLING ENGINE (primary) ───
            if stealth:
                page = StealthyFetcher.fetch(url, headless=True, network_idle=True)
            else:
                page = Fetcher.get(
                    url, stealthy_headers=True, follow_redirects=True, timeout=12
                )

            # Title
            title_el = page.css_first("title")
            if title_el:
                lead.name = title_el.text.strip()[:120]

            # Get body text via Scrapling
            body_text = page.get_text() if hasattr(page, "get_text") else page.text

            # Emails — Scrapling can find mailto: links directly
            mailto_links = page.css('a[href^="mailto:"]')
            mailto_emails = []
            for m in mailto_links:
                href = m.attrib.get("href", "")
                if "mailto:" in href:
                    mailto_emails.append(
                        href.replace("mailto:", "").split("?")[0].strip()
                    )

            regex_emails = EMAIL_RE.findall(body_text)
            all_emails = list(set(mailto_emails + regex_emails))
            all_emails = [
                e for e in all_emails if not any(n in e.lower() for n in NOISE_DOMAINS)
            ]
            if all_emails:
                lead.email = ", ".join(all_emails[:5])

            # Phones — try structured data first, then regex
            phone_links = page.css('a[href^="tel:"]')
            phones = []
            for p in phone_links:
                href = p.attrib.get("href", "").replace("tel:", "").strip()
                if href and len(re.sub(r"\D", "", href)) >= 7:
                    phones.append(href)
            if not phones:
                phones = PHONE_RE.findall(body_text)
                phones = [p.strip() for p in phones if len(re.sub(r"\D", "", p)) >= 7]
            if phones:
                lead.phone = ", ".join(list(set(phones))[:3])

            # WhatsApp — check href attributes
            wa_links = page.css('a[href*="wa.me"], a[href*="whatsapp.com"]')
            for w in wa_links:
                href = w.attrib.get("href", "")
                if "wa.me" in href or "whatsapp" in href:
                    lead.whatsapp = href
                    break
            if not lead.whatsapp:
                wa_match = WA_RE.findall(
                    str(page.html) if hasattr(page, "html") else body_text
                )
                for m in wa_match:
                    num = m[0] or m[1]
                    if num:
                        lead.whatsapp = f"https://wa.me/{num}"
                        break

            # Instagram — check links
            ig_links = page.css('a[href*="instagram.com"]')
            for ig in ig_links:
                href = ig.attrib.get("href", "")
                ig_match = IG_RE.findall(href)
                for handle in ig_match:
                    if handle.lower() not in IG_NOISE:
                        lead.instagram = f"@{handle}"
                        break
                if lead.instagram:
                    break

            # Notes
            html_str = str(page.html) if hasattr(page, "html") else body_text
            _add_notes(lead, url, body_text, html_str)

        elif BS4_AVAILABLE:
            # ─── BEAUTIFULSOUP FALLBACK ───
            resp = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
            soup = BeautifulSoup(resp.text, "html.parser")
            body_text = soup.get_text(separator=" ", strip=True)

            title = soup.find("title")
            if title:
                lead.name = title.text.strip()[:120]

            # Emails
            emails = EMAIL_RE.findall(body_text)
            emails = [
                e for e in emails if not any(n in e.lower() for n in NOISE_DOMAINS)
            ]
            if emails:
                lead.email = ", ".join(list(set(emails))[:5])

            # Phones
            phones = PHONE_RE.findall(body_text)
            phones = [p.strip() for p in phones if len(re.sub(r"\D", "", p)) >= 7]
            if phones:
                lead.phone = ", ".join(list(set(phones))[:3])

            # WhatsApp
            wa = WA_RE.findall(resp.text)
            for m in wa:
                num = m[0] or m[1]
                if num:
                    lead.whatsapp = f"https://wa.me/{num}"
                    break

            # Instagram
            ig = IG_RE.findall(resp.text)
            ig = [h for h in ig if h.lower() not in IG_NOISE]
            if ig:
                lead.instagram = f"@{ig[0]}"

            _add_notes(lead, url, body_text, resp.text)

    except Exception as e:
        lead.notes = f"Error: {str(e)[:80]}"

    return lead


def _add_notes(lead: Lead, url: str, body_text: str, html: str):
    """Add diagnostic notes to a lead."""
    notes = []
    old_years = re.findall(r"©\s*(201[0-8]|2019)", body_text)
    if old_years:
        notes.append(f"Old ©{old_years[0]}")
    if url.startswith("http://"):
        notes.append("No HTTPS")
    if any(
        d in url
        for d in [
            "wixsite.com",
            "weebly.com",
            "blogspot.com",
            "wordpress.com",
            "jimdo.com",
        ]
    ):
        notes.append("Free domain")
    if any(
        t in body_text.lower()
        for t in [
            "coming soon",
            "en construcción",
            "under construction",
            "próximamente",
        ]
    ):
        notes.append("Under construction")
    if "linktr.ee" in html or "linktree" in html.lower():
        notes.append("Uses Linktree")
    lead.notes = " | ".join(notes)


# ═══════════════════════════════════════════════════════════════════════
#  SCRAPLING SPIDER MODE (concurrent crawl)
# ═══════════════════════════════════════════════════════════════════════


def run_spider_mode(niche: str, city: str, region_id: str, zone: str = ""):
    """Use Scrapling's Spider framework for concurrent crawling."""
    if not SCRAPLING_AVAILABLE:
        print(
            "❌ Spider mode requires Scrapling. Install: pip install 'scrapling[fetchers]' && scrapling install"
        )
        return []

    try:
        from scrapling.spiders import Spider, Request, Response
    except ImportError:
        print(
            "❌ Scrapling spiders not available. Update Scrapling: pip install -U 'scrapling[fetchers]'"
        )
        return []

    R = REGIONS[region_id]
    dorks = build_dorks(niche, city, region_id, zone)

    # Build Google search URLs from dorks
    start_urls = [
        f"https://www.{R['google']}/search?q={quote_plus(d)}&num=10&hl={R['lang']}"
        for d in dorks[:10]  # Limit to 10 for spider mode
    ]

    all_leads = []

    class LeadSpider(Spider):
        name = "dorking_leads"
        concurrent_requests = 5
        download_delay = 2

        async def parse(self, response: Response):
            """Parse Google search results page."""
            for g in response.css("div.g, div.tF2Cxc"):
                link = g.css_first("a[href]")
                if link:
                    href = link.attrib.get("href", "")
                    if href.startswith("/url?q="):
                        href = href.split("/url?q=")[1].split("&")[0]
                    if href.startswith("http") and "google.com" not in href:
                        yield Request(href, callback=self.parse_lead)

        async def parse_lead(self, response: Response):
            """Extract lead data from a business page."""
            lead = Lead()
            lead.source_url = str(response.url)

            title = response.css_first("title")
            if title:
                lead.name = title.text.strip()[:120]

            body = (
                response.get_text() if hasattr(response, "get_text") else response.text
            )

            # Extract emails
            mailto_links = response.css('a[href^="mailto:"]')
            emails = [
                m.attrib.get("href", "").replace("mailto:", "").split("?")[0]
                for m in mailto_links
            ]
            emails += EMAIL_RE.findall(body)
            emails = [
                e
                for e in set(emails)
                if e and not any(n in e.lower() for n in NOISE_DOMAINS)
            ]
            if emails:
                lead.email = ", ".join(emails[:3])

            # Extract phones
            tel_links = response.css('a[href^="tel:"]')
            phones = [t.attrib.get("href", "").replace("tel:", "") for t in tel_links]
            if not phones:
                phones = PHONE_RE.findall(body)
            phones = [p for p in phones if len(re.sub(r"\D", "", p)) >= 7]
            if phones:
                lead.phone = ", ".join(list(set(phones))[:3])

            # WhatsApp
            wa_links = response.css('a[href*="wa.me"], a[href*="whatsapp.com"]')
            for w in wa_links:
                lead.whatsapp = w.attrib.get("href", "")
                break

            # Instagram
            ig_links = response.css('a[href*="instagram.com"]')
            for ig in ig_links:
                match = IG_RE.findall(ig.attrib.get("href", ""))
                for h in match:
                    if h.lower() not in IG_NOISE:
                        lead.instagram = f"@{h}"
                        break

            if lead.is_valid():
                yield lead.to_dict()

    print(f"\n🕷️  Starting Scrapling Spider with {len(start_urls)} search URLs...")
    print(
        f"   Concurrency: {LeadSpider.concurrent_requests} | Delay: {LeadSpider.download_delay}s\n"
    )

    spider = LeadSpider()
    spider.start_urls = start_urls
    result = spider.start()

    for item in result.items:
        lead = Lead()
        for k, v in item.items():
            setattr(lead, k, v)
        all_leads.append(lead)

    return all_leads


# ═══════════════════════════════════════════════════════════════════════
#  MAIN SCRAPER PIPELINE
# ═══════════════════════════════════════════════════════════════════════


def run(
    niche: str,
    city: str,
    region_id: str,
    zone: str = "",
    max_pages: int = 10,
    delay: int = 3,
    stealth: bool = False,
    spider_mode: bool = False,
    output: Optional[str] = None,
):
    """Main scraper orchestrator."""
    R = REGIONS.get(region_id)
    if not R:
        print(f"❌ Unknown region: {region_id}. Available: {', '.join(REGIONS.keys())}")
        return

    if not output:
        output = (
            f"leads_{niche.replace(' ', '_')}_{city.replace(' ', '_')}_{region_id}.csv"
        )

    engine = "Scrapling" if SCRAPLING_AVAILABLE else "BeautifulSoup"
    mode = (
        "Spider (concurrent)" if spider_mode else ("Stealth" if stealth else "Standard")
    )

    print("═" * 64)
    print(f"  🔍 DORKING LAB — Python Scraper v2.0")
    print(f"  Engine: {engine} | Mode: {mode}")
    print(f"  Niche: {niche} | City: {city} | Region: {R['name']}")
    if not spider_mode:
        print(f"  Max pages/query: {max_pages} | Delay: {delay}s")
    print("═" * 64)

    # ─── SPIDER MODE ───
    if spider_mode:
        all_leads = run_spider_mode(niche, city, region_id, zone)
    else:
        # ─── SEQUENTIAL MODE ───
        dorks = build_dorks(niche, city, region_id, zone)
        print(f"\n  📋 {len(dorks)} dork queries generated\n")

        all_leads = []
        seen_urls = set()

        for i, query in enumerate(dorks):
            print(f"\n[{i + 1}/{len(dorks)}] 🔍 {query[:72]}...")

            # Multi-engine: Google → Bing → DuckDuckGo
            results = search_google(query, region_id, max_pages, stealth)
            engine_used = "Google"
            if not results:
                print("  ↳ Google blocked, trying Bing...")
                results = search_bing(query, region_id, max_pages, stealth)
                engine_used = "Bing"
            if not results:
                print("  ↳ Bing failed, trying DuckDuckGo...")
                results = search_ddg(query, max_pages)
                engine_used = "DuckDuckGo"

            print(f"  ↳ {engine_used}: {len(results)} results")

            for j, result in enumerate(results):
                url = result["url"]
                if url in seen_urls or not url.startswith("http"):
                    continue
                seen_urls.add(url)

                print(f"    [{j + 1}] {url[:62]}...", end="", flush=True)
                lead = extract_from_page(url, stealth)
                lead.source_query = query[:100]

                if lead.is_valid():
                    all_leads.append(lead)
                    print(f" ✅ {lead.summary()}")
                else:
                    print(" ·")

                time.sleep(1)

            time.sleep(delay)

    # ─── SAVE CSV ───
    print("\n" + "═" * 64)
    if all_leads:
        fields = [
            "name",
            "phone",
            "email",
            "whatsapp",
            "website",
            "instagram",
            "address",
            "source_url",
            "source_query",
            "notes",
        ]
        with open(output, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for lead in all_leads:
                writer.writerow(lead.to_dict())

        print(f"  ✅ {len(all_leads)} leads → {output}")
        print(f"  📧 Emails: {sum(1 for l in all_leads if l.email)}")
        print(f"  📞 Phones: {sum(1 for l in all_leads if l.phone)}")
        print(f"  💬 WhatsApp: {sum(1 for l in all_leads if l.whatsapp)}")
        print(f"  📸 Instagram: {sum(1 for l in all_leads if l.instagram)}")
        print(f"  🔍 Engine: {engine}")
    else:
        print("  ⚠ No leads found. Try different niche/city.")
    print("═" * 64)


# ═══════════════════════════════════════════════════════════════════════
#  CLI
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="DORKING LAB — Python Lead Scraper v2.0 (Scrapling-powered)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python dorking_scraper.py "dentista" "bogota" -r co
  python dorking_scraper.py "restaurant" "miami" -r us --stealth
  python dorking_scraper.py "restaurante" "madrid" -r es --spider
  python dorking_scraper.py "plomero" "cdmx" -r mx -z "polanco" --stealth -m 15
        """,
    )
    parser.add_argument("niche", help="Business niche (e.g. 'dentista', 'restaurant')")
    parser.add_argument("city", help="City (e.g. 'bogota', 'miami')")
    parser.add_argument(
        "-r",
        "--region",
        default="co",
        choices=list(REGIONS.keys()),
        help="Region code (default: co)",
    )
    parser.add_argument("-z", "--zone", default="", help="Neighborhood/zone (optional)")
    parser.add_argument(
        "-m",
        "--max-pages",
        type=int,
        default=10,
        help="Max results per query (default: 10)",
    )
    parser.add_argument(
        "-d",
        "--delay",
        type=int,
        default=3,
        help="Delay between queries in seconds (default: 3)",
    )
    parser.add_argument("-o", "--output", default=None, help="Output CSV filename")
    parser.add_argument(
        "--stealth",
        action="store_true",
        help="Use StealthyFetcher (bypasses Cloudflare/anti-bot)",
    )
    parser.add_argument(
        "--spider",
        action="store_true",
        help="Use Scrapling Spider for concurrent crawling",
    )

    args = parser.parse_args()
    run(
        args.niche,
        args.city,
        args.region,
        args.zone,
        args.max_pages,
        args.delay,
        args.stealth,
        args.spider,
        args.output,
    )
