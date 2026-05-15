import { useState, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { ScrapeResult, LogEntry, SortConfig, MapParams, QueryResult } from '../types';
import { fillTemplate } from '../utils/dorkBuilder';
import { callOpenRouter } from '../utils/openRouter';
import { callNVIDIANIM } from '../utils/nvidiaNIM';
import { googleCustomSearch } from '../utils/googleCS';
import { callAnthropicClaude } from '../utils/anthropicClaude';

export function useScraper(
  niche: string, city: string, zone: string, year: number,
  region: string, R: any, TEMPLATES: any,
  showToast: (msg: string) => void,
  setShowErrors: (v: boolean) => void
) {
  const [scrapeQuery, setScrapeQuery] = useState("");
  const [scrapeResults, setScrapeResults] = useState<ScrapeResult[]>([]);
  const [scraping, setScraping] = useState(false);
  const [scrapeLog, setScrapeLog] = useState<LogEntry[]>([]);
  const [allHistoryLogs, setAllHistoryLogs] = useState<LogEntry[]>([]);

  const [scraperMode, setScraperMode] = useState<"search" | "batch">("search");
  const [batchInput, setBatchInput] = useState("");
  const [leadsSearch, setLeadsSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [geocoding, setGeocoding] = useState(false);
  const [mapParams, setMapParams] = useState<MapParams>({ center: [4.5709, -74.2973], zoom: 6 });
  const [locSearch, setLocSearch] = useState("");

  const ENV: Record<string, string> = {
    VITE_GEMINI_API_KEY:      import.meta.env.VITE_GEMINI_API_KEY      || '',
    VITE_ANTHROPIC_API_KEY:   import.meta.env.VITE_ANTHROPIC_API_KEY   || '',
    VITE_OPENROUTER_API_KEY:  import.meta.env.VITE_OPENROUTER_API_KEY  || '',
    VITE_NVIDIA_API_KEY:      import.meta.env.VITE_NVIDIA_API_KEY       || '',
    VITE_GOOGLE_CS_API_KEY:   import.meta.env.VITE_GOOGLE_CS_API_KEY   || '',
    VITE_GOOGLE_CS_CX:        import.meta.env.VITE_GOOGLE_CS_CX        || '',
  };
  const getKey = (key: string) => localStorage.getItem(`osint_${key}`) || ENV[key] || '';

  const [aiProvider, setAiProvider] = useState<"gemini" | "openrouter" | "nvidia" | "google-cs" | "claude">(() => {
    if (getKey("VITE_GEMINI_API_KEY")) return "gemini";
    if (getKey("VITE_ANTHROPIC_API_KEY")) return "claude";
    if (getKey("VITE_OPENROUTER_API_KEY")) return "openrouter";
    if (getKey("VITE_NVIDIA_API_KEY")) return "nvidia";
    if (getKey("VITE_GOOGLE_CS_API_KEY")) return "google-cs";
    return "gemini";
  });
  const [orModel, setOrModel] = useState("anthropic/claude-3.5-sonnet");
  const [keysLoaded, setKeysLoaded] = useState(true);

  const addLog = useCallback((msg: string) => {
    setScrapeLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
  }, []);

  const checkInputs = useCallback(() => {
    if (!niche.trim() || !city.trim() || !zone.trim()) {
      setShowErrors(true);
      showToast("⚠ Falta: Nicho, Ciudad y Zona");
      return false;
    }
    setShowErrors(false);
    return true;
  }, [niche, city, zone, showToast, setShowErrors]);

  const searchLocation = async (q: string) => {
    if (!q.trim() || geocoding) return;
    setGeocoding(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await resp.json();
      if (data && data[0]) {
        const { display_name, lat, lon } = data[0];
        const parts = display_name.split(", ");
        setMapParams({ center: [parseFloat(lat), parseFloat(lon)], zoom: 12 });
        showToast(`📍 Ubicación: ${parts[0]}`);
      } else {
        showToast("❌ No se encontró la ubicación");
      }
    } catch (e) {
      showToast("❌ Error en geocodificación");
    } finally {
      setGeocoding(false);
    }
  };

  const runAIScrape = useCallback(async (query: string, mode: "standard" | "instagram" | "emails" | "phones" = "standard") => {
    if (!checkInputs()) return;
    if (!query.trim() || scraping) return;

    setScraping(true);
    addLog(`🤖 ${aiProvider.toUpperCase()} - ${mode.toUpperCase()} - Iniciando: ${query.slice(0, 50)}...`);

    let instructions = "Eres un experto en inteligencia de fuentes abiertas (OSINT) y prospección B2B. Tu objetivo es encontrar y extraer leads de negocios reales basándote en la búsqueda o URL solicitada. Importante: Para las coordenadas (lat, lng), intenta estimarlas basándote en la dirección si no las encuentras explícitamente. Debes devolver una lista estructurada en JSON.";
    let prompt = `Extrae todos los leads de negocios que encuentres para esta entrada: "${query}". Para cada lead necesito: nombre, teléfono, email, whatsapp, sitio web, instagram, dirección, latitud, longitud y notas relevantes sobre el estado del negocio. Devuelve un array JSON.`;

    if (mode === "instagram") {
      instructions = "Eres un experto en OSINT de redes sociales. Tu tarea es analizar perfiles de Instagram y extraer información de contacto y detalles del negocio. Debes devolver JSON.";
      prompt = `Analiza este perfil o búsqueda de Instagram: "${query}". Extrae: nombre del negocio/cuenta, biografía, email, teléfono, ciudad, sitio web y cualquier dato de contacto disponible.`;
    } else if (mode === "emails") {
      instructions = "Eres un recolector de emails experto. Busca profundamente en el contenido de la web o búsqueda proporcionada y extrae todas las direcciones de correo electrónico relacionadas con negocios.";
      prompt = `Escanea profundamente: "${query}". Encuentra y lista todos los emails de negocios. Devuelve objetos lead con 'name' y 'email'.`;
    } else if (mode === "phones") {
      instructions = "Eres un recolector de teléfonos experto. Busca profundamente y extrae todos los números de teléfono y WhatsApp relacionados con negocios.";
      prompt = `Escanea profundamente: "${query}". Encuentra y lista todos los teléfonos de negocios. Devuelve objetos lead con 'name' y 'phone' o 'whatsapp'.`;
    }

    try {
      if (aiProvider === "gemini") {
        addLog("📡 Consultando a Gemini con herramientas de búsqueda...");
        const apiKey = getKey("VITE_GEMINI_API_KEY");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: instructions,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  whatsapp: { type: Type.STRING },
                  website: { type: Type.STRING },
                  instagram: { type: Type.STRING },
                  address: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  notes: { type: Type.STRING },
                },
                required: ["name"]
              }
            },
            tools: [{ googleSearch: {} }]
          },
        });
        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setScrapeResults(prev => [...prev, ...parsed]);
            addLog(`✅ ¡Éxito! Se añadieron ${parsed.length} leads.`);
          }
        }
      } else if (aiProvider === "claude") {
        addLog("🟣 Consultando Claude claude-sonnet-4-6 con búsqueda web...");
        const apiKey = getKey("VITE_ANTHROPIC_API_KEY");
        const parsed = await callAnthropicClaude(apiKey, prompt, instructions);
        if (Array.isArray(parsed)) {
          setScrapeResults(prev => [...prev, ...parsed]);
          addLog(`✅ ¡Éxito! Se añadieron ${parsed.length} leads.`);
        }
      } else if (aiProvider === "openrouter") {
        addLog(`📡 Consultando OpenRouter (${orModel})...`);
        const apiKey = getKey("VITE_OPENROUTER_API_KEY");
        const parsed = await callOpenRouter(apiKey, orModel, prompt, instructions);
        if (Array.isArray(parsed)) {
          setScrapeResults(prev => [...prev, ...parsed]);
          addLog(`✅ ¡Éxito! Se añadieron ${parsed.length} leads.`);
        }
      } else if (aiProvider === "nvidia") {
        addLog("📡 Consultando a NVIDIA NIM...");
        const apiKey = getKey("VITE_NVIDIA_API_KEY");
        const parsed = await callNVIDIANIM(apiKey, "nvidia/nemotron-4-340b-instruct", `${instructions}\n\n${prompt}`);
        if (Array.isArray(parsed)) {
          setScrapeResults(prev => [...prev, ...parsed]);
          addLog(`✅ ¡Éxito! Se añadieron ${parsed.length} leads.`);
        }
      } else if (aiProvider === "google-cs") {
        addLog("🔍 Google Custom Search...");
        const csApiKey = getKey("VITE_GOOGLE_CS_API_KEY");
        const csCx = getKey("VITE_GOOGLE_CS_CX");
        const results = await googleCustomSearch(csApiKey, csCx, query);
        addLog(`✅ ${results.length} URLs encontradas, extrayendo leads...`);
        for (const item of results) {
          try {
            const geminiKey = getKey("VITE_GEMINI_API_KEY");
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash",
              contents: [{ role: "user", parts: [{ text: `Analiza esta página: ${item.link}. Extrae leads de negocios. Devuelve array JSON.` }] }],
              config: {
                systemInstruction: instructions,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      phone: { type: Type.STRING },
                      email: { type: Type.STRING },
                      whatsapp: { type: Type.STRING },
                      website: { type: Type.STRING },
                      instagram: { type: Type.STRING },
                      address: { type: Type.STRING },
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                      notes: { type: Type.STRING },
                    },
                    required: ["name"]
                  }
                },
              },
            });
              const text = response.text;
              if (text) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                  setScrapeResults(prev => [...prev, ...parsed]);
                }
              }
          } catch (e: any) {
            addLog(`❌ Error en ${item.link}: ${e.message}`);
          }
        }
        addLog(`✅ Procesadas ${results.length} URLs.`);
      }
    } catch (err: any) {
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setScraping(false);
    }
  }, [aiProvider, scraping, orModel, checkInputs, addLog]);

  // Auto-start scrape when provider is ready and query is valid
  const autoStart = useCallback((query: string) => {
    if (!query.trim() || scraping) return;
    const hasKey =
      (aiProvider === "gemini" && getKey("VITE_GEMINI_API_KEY")) ||
      (aiProvider === "claude" && getKey("VITE_ANTHROPIC_API_KEY")) ||
      (aiProvider === "openrouter" && getKey("VITE_OPENROUTER_API_KEY")) ||
      (aiProvider === "nvidia" && getKey("VITE_NVIDIA_API_KEY")) ||
      (aiProvider === "google-cs" && getKey("VITE_GOOGLE_CS_API_KEY") && getKey("VITE_GOOGLE_CS_CX"));
    if (hasKey) {
      addLog(`🚀 Auto-iniciando con ${aiProvider.toUpperCase()}...`);
      runAIScrape(query);
    }
  }, [aiProvider, scraping, runAIScrape, addLog]);

  const runBatchScrape = async () => {
    if (!batchInput.trim() || scraping) return;
    const lines = batchInput.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (!lines.length) return;

    addLog(`🚀 Iniciando lote de ${lines.length} URLs/Búsquedas...`);
    for (const line of lines) {
      addLog(`📄 Procesando: ${line}`);
      await runAIScrape(line);
      await new Promise(r => setTimeout(r, 1500));
    }
    showToast(`✅ Proceso por lote finalizado`);
  };

  const exportLeadsCSV = () => {
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
    showToast("✓ Leads CSV exportado");
  };

  const getPythonScriptContent = () => {
    const regionId = region || "co";
    return `#!/usr/bin/env python3
"""
══════════════════════════════════════════════════════════════════
  DORKING LAB — Python Lead Scraper v2.0 (Generated by OSINT Lead Finder)
  Powered by Scrapling (https://github.com/D4Vinci/Scrapling)

  Install:
    pip install "scrapling[all]" && scrapling install

  Usage (generated with hardcoded values):
    python dorking_scraper.py
    # Uses: niche="${niche}", city="${city}", zone="${zone}", region=${regionId}

  Override with CLI:
    python dorking_scraper.py "dentista" "bogota" -r co
══════════════════════════════════════════════════════════════════
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
    from scrapling.fetchers import Fetcher, StealthyFetcher
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
        print("   Install Scrapling for anti-bot bypass: pip install 'scrapling[fetchers]' && scrapling install")
except ImportError:
    if not SCRAPLING_AVAILABLE:
        print("❌ Neither Scrapling nor BeautifulSoup found!")
        print("   Install: pip install 'scrapling[fetchers]' && scrapling install")
        print("   Or minimal: pip install requests beautifulsoup4")
        sys.exit(1)

# ─── REGIONS ───
REGIONS = {
    "co": {"name": "Colombia", "google": "google.com.co", "bing_cc": "co", "lang": "es", "tld": ".com.co"},
    "mx": {"name": "México", "google": "google.com.mx", "bing_cc": "mx", "lang": "es", "tld": ".com.mx"},
    "ar": {"name": "Argentina", "google": "google.com.ar", "bing_cc": "ar", "lang": "es", "tld": ".com.ar"},
    "cl": {"name": "Chile", "google": "google.cl", "bing_cc": "cl", "lang": "es", "tld": ".cl"},
    "pe": {"name": "Perú", "google": "google.com.pe", "bing_cc": "pe", "lang": "es", "tld": ".com.pe"},
    "ec": {"name": "Ecuador", "google": "google.com.ec", "bing_cc": "ec", "lang": "es", "tld": ".com.ec"},
    "es": {"name": "España", "google": "google.es", "bing_cc": "es", "lang": "es", "tld": ".es"},
    "us": {"name": "USA", "google": "google.com", "bing_cc": "us", "lang": "en", "tld": ".com"},
    "br": {"name": "Brasil", "google": "google.com.br", "bing_cc": "br", "lang": "pt", "tld": ".com.br"},
}

# ─── EXTRACTION PATTERNS ───
EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
PHONE_RE = re.compile(r'\\+?\\d{1,3}[\\s.-]?\\(?\d{2,4}\\)?[\\s.-]?\\d{3,4}[\\s.-]?\\d{3,4}')
WA_RE = re.compile(r'wa\\.me/(\\d+)|api\\.whatsapp\\.com/send\\?phone=(\\d+)')
IG_RE = re.compile(r'instagram\\.com/([a-zA-Z0-9_.]{2,30})')
NOISE_DOMAINS = {"example.com","test.com","sentry.io","webpack.js","w3.org","schema.org","googleapis.com","google.com","gstatic.com","cloudflare.com","jquery.com"}
IG_NOISE = {"p","reel","stories","explore","accounts","about","legal","static"}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

# ─── HARDCODED VALUES FROM UI ───
HARDCODED_NICHE = "${niche || "restaurante"}"
HARDCODED_CITY = "${city || "bogota"}"
HARDCODED_ZONE = "${zone || ""}"
HARDCODED_REGION = "${regionId}"

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

def build_dorks(niche: str, city: str, region_id: str, zone: str = "") -> list:
    R = REGIONS[region_id]
    y = str(datetime.now().year)
    z = zone or "centro"
    return [
        f'site:{R["google"]}/maps/place/ "{niche}" "{city}"',
        f'site:{R["google"]}/maps "{niche}" "{city}"',
        f'site:instagram.com "{niche}" "{city}" -inurl:/p/ -inurl:/reel/',
        f'site:instagram.com "{niche}" "{city}" "wa.me" OR "whatsapp"',
        f'site:instagram.com "{niche}" "{city}" "@gmail.com" OR "@hotmail.com"',
        f'"{niche}" "{city}" intitle:"contacto" intext:"@"',
        f'"{niche}" "{city}" "wa.me/" OR "api.whatsapp.com/send"',
        f'site:facebook.com "{niche}" "{city}" -"website"',
        f'site:linkedin.com/company/ "{niche}" "{city}"',
        f'"{niche}" "{city}" (site:instagram.com OR site:facebook.com) ("wa.me" OR "@gmail") -"www."',
        f'"{niche}" "{city}" "grand opening" OR "now open" OR "new business" after:{y}-01-01',
        f'"{niche}" "{city}" "{z}" intext:"phone"',
    ]

def _search_with_scrapling(url: str, params: dict, stealth: bool = False):
    full_url = url + "?" + "&".join(f"{k}={quote_plus(str(v))}" for k, v in params.items())
    if stealth:
        page = StealthyFetcher.fetch(full_url, headless=True, network_idle=True)
    else:
        page = Fetcher.get(full_url, stealthy_headers=True, follow_redirects=True)
    return page

def _search_with_requests(url: str, params: dict):
    resp = requests.get(url, params=params, headers=HEADERS, timeout=15)
    return BeautifulSoup(resp.text, "html.parser") if resp.status_code == 200 else None

def search_google(query: str, region_id: str, num: int = 10, stealth: bool = False) -> list:
    R = REGIONS[region_id]
    results = []
    url = f"https://www.{R['google']}/search"
    params = {"q": query, "num": num, "hl": R["lang"]}
    try:
        if SCRAPLING_AVAILABLE:
            page = _search_with_scrapling(url, params, stealth)
            for g in page.css("div.g, div.tF2Cxc"):
                link_el = g.css_first("a[href]")
                title_el = g.css_first("h3")
                snippet_el = g.css_first("div.VwiC3b, span.aCOpRe")
                if link_el:
                    href = link_el.attrib.get("href", "")
                    if href.startswith("/url?q="):
                        href = href.split("/url?q=")[1].split("&")[0]
                    if href.startswith("http"):
                        results.append({"url": href, "title": title_el.text if title_el else "", "snippet": snippet_el.text if snippet_el else ""})
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
                            results.append({"url": href, "title": title.text if title else "", "snippet": snippet.text if snippet else ""})
    except Exception as e:
        print(f"  ❌ Google search error: {e}")
    return results

def search_bing(query: str, region_id: str, num: int = 10, stealth: bool = False) -> list:
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
                    results.append({"url": link.attrib.get("href", ""), "title": link.text, "snippet": snippet.text if snippet else ""})
        elif BS4_AVAILABLE:
            soup = _search_with_requests(url, params)
            if soup:
                for li in soup.select("li.b_algo"):
                    link = li.select_one("h2 a")
                    snippet = li.select_one("p")
                    if link:
                        results.append({"url": link.get("href", ""), "title": link.text, "snippet": snippet.text if snippet else ""})
    except Exception as e:
        print(f"  ❌ Bing error: {e}")
    return results

def search_ddg(query: str, num: int = 10) -> list:
    results = []
    try:
        if BS4_AVAILABLE:
            resp = requests.post("https://html.duckduckgo.com/html/", data={"q": query}, headers=HEADERS, timeout=15)
            soup = BeautifulSoup(resp.text, "html.parser")
            for r in soup.select("div.result")[:num]:
                link = r.select_one("a.result__a")
                snippet = r.select_one("a.result__snippet")
                if link:
                    results.append({"url": link.get("href", ""), "title": link.text, "snippet": snippet.text if snippet else ""})
    except Exception as e:
        print(f"  ❌ DDG error: {e}")
    return results

def extract_from_page(url: str, stealth: bool = False) -> Lead:
    lead = Lead()
    lead.source_url = url
    try:
        if SCRAPLING_AVAILABLE:
            if stealth:
                page = StealthyFetcher.fetch(url, headless=True, network_idle=True)
            else:
                page = Fetcher.get(url, stealthy_headers=True, follow_redirects=True, timeout=12)
            body_text = page.get_text() if hasattr(page, "get_text") else page.text
            mailto_links = page.css('a[href^="mailto:"]')
            mailto_emails = [m.attrib.get("href", "").replace("mailto:", "").split("?")[0].strip() for m in mailto_links]
            regex_emails = EMAIL_RE.findall(body_text)
            all_emails = list(set(mailto_emails + regex_emails))
            all_emails = [e for e in all_emails if not any(n in e.lower() for n in NOISE_DOMAINS)]
            if all_emails:
                lead.email = ", ".join(all_emails[:5])
            phones = [p.attrib.get("href", "").replace("tel:", "").strip() for p in page.css('a[href^="tel:"]')]
            if not phones:
                phones = PHONE_RE.findall(body_text)
                phones = [p.strip() for p in phones if len(re.sub(r"\\D", "", p)) >= 7]
            if phones:
                lead.phone = ", ".join(list(set(phones))[:3])
            wa_links = page.css('a[href*="wa.me"], a[href*="whatsapp.com"]')
            for w in wa_links:
                href = w.attrib.get("href", "")
                if "wa.me" in href or "whatsapp" in href:
                    lead.whatsapp = href
                    break
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
        elif BS4_AVAILABLE:
            resp = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
            soup = BeautifulSoup(resp.text, "html.parser")
            body_text = soup.get_text(separator=" ", strip=True)
            emails = [e for e in EMAIL_RE.findall(body_text) if not any(n in e.lower() for n in NOISE_DOMAINS)]
            if emails:
                lead.email = ", ".join(list(set(emails))[:5])
            phones = [p.strip() for p in PHONE_RE.findall(body_text) if len(re.sub(r"\\D", "", p)) >= 7]
            if phones:
                lead.phone = ", ".join(list(set(phones))[:3])
            wa = WA_RE.findall(resp.text)
            for m in wa:
                num = m[0] or m[1]
                if num:
                    lead.whatsapp = f"https://wa.me/{num}"
                    break
            ig = [h for h in IG_RE.findall(resp.text) if h.lower() not in IG_NOISE]
            if ig:
                lead.instagram = f"@{ig[0]}"
    except Exception as e:
        lead.notes = f"Error: {str(e)[:80]}"
    return lead

def run(niche: str, city: str, region_id: str, zone: str = "", max_pages: int = 10, delay: int = 3, stealth: bool = False, spider_mode: bool = False, output: Optional[str] = None):
    R = REGIONS.get(region_id)
    if not R:
        print(f"❌ Unknown region: {region_id}")
        return
    if not output:
        output = f"leads_{niche.replace(' ', '_')}_{city.replace(' ', '_')}_{region_id}.csv"
    engine = "Scrapling" if SCRAPLING_AVAILABLE else "BeautifulSoup"
    mode = "Stealth" if stealth else "Standard"
    print("=" * 64)
    print(f"  🔍 DORKING LAB — Python Scraper v2.0")
    print(f"  Engine: {engine} | Mode: {mode}")
    print(f"  Niche: {niche} | City: {city} | Region: {R['name']}")
    print("=" * 64)
    dorks = build_dorks(niche, city, region_id, zone)
    print(f"\\n  📋 {len(dorks)} dork queries generated\\n")
    all_leads = []
    seen_urls = set()
    for i, query in enumerate(dorks):
        print(f"\\n[{i + 1}/{len(dorks)}] 🔍 {query[:72]}...")
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
    print("\\n" + "=" * 64)
    if all_leads:
        fields = ["name","phone","email","whatsapp","website","instagram","address","source_url","source_query","notes"]
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
    else:
        print("  ⚠ No leads found. Try different niche/city.")
    print("=" * 64)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DORKING LAB — Python Lead Scraper v2.0")
    parser.add_argument("niche", nargs="?", default=HARDCODED_NICHE, help="Business niche")
    parser.add_argument("city", nargs="?", default=HARDCODED_CITY, help="City")
    parser.add_argument("-r", "--region", default=HARDCODED_REGION, choices=list(REGIONS.keys()), help="Region code")
    parser.add_argument("-z", "--zone", default=HARDCODED_ZONE, help="Neighborhood/zone")
    parser.add_argument("-m", "--max-pages", type=int, default=10, help="Max results per query")
    parser.add_argument("-d", "--delay", type=int, default=3, help="Delay between queries")
    parser.add_argument("-o", "--output", default=None, help="Output CSV filename")
    parser.add_argument("--stealth", action="store_true", help="Use StealthyFetcher")
    parser.add_argument("--spider", action="store_true", help="Use Scrapling Spider")
    args = parser.parse_args()
    run(args.niche, args.city, args.region, args.zone, args.max_pages, args.delay, args.stealth, args.spider, args.output)
`;
  };

  const generatePythonScript = () => {
    if (!checkInputs()) return;
    const script = getPythonScriptContent();
    navigator.clipboard.writeText(script).then(() => showToast("✓ Script Python v2.0 (Scrapling) copiado"));
  };

  const downloadPythonScript = () => {
    if (!checkInputs()) return;
    const script = getPythonScriptContent();
    const blob = new Blob([script], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dorking_scraper_${niche || "leads"}_${city || "data"}.py`;
    a.click();
    showToast("✓ dorking_scraper.py descargado");
  };

  const exportScrapeLog = () => {
    if (!scrapeLog.length) return;
    const content = scrapeLog.map(l => `[${l.time}] ${l.msg}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint_log_${new Date().getTime()}.txt`;
    a.click();
    showToast("✓ Log exportado");
  };

  const exportAllLogs = () => {
    const combined = [...allHistoryLogs, ...scrapeLog];
    if (!combined.length) return;
    const content = combined.map(l => `[${l.time}] ${l.msg}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint_combined_logs_${new Date().getTime()}.txt`;
    a.click();
    showToast("✓ Todos los logs exportados");
  };

  const sortedAndFilteredLeads = useMemo(() => {
    let result = [...scrapeResults];

    if (leadsSearch) {
      const s = leadsSearch.toLowerCase();
      result = result.filter(l =>
        (l.name || "").toLowerCase().includes(s) ||
        (l.address || "").toLowerCase().includes(s) ||
        (l.email || "").toLowerCase().includes(s)
      );
    }

    result.sort((a, b) => {
      const valA = ((a as any)[sortConfig.key] || "").toString().toLowerCase();
      const valB = ((b as any)[sortConfig.key] || "").toString().toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [scrapeResults, leadsSearch, sortConfig]);

    return {
    scrapeQuery, setScrapeQuery, scrapeResults, setScrapeResults,
    scraping, setScraping, scrapeLog, setScrapeLog,
    allHistoryLogs, setAllHistoryLogs,
    scraperMode, setScraperMode, batchInput, setBatchInput,
    leadsSearch, setLeadsSearch, sortConfig, setSortConfig,
    geocoding, mapParams, setMapParams, locSearch, setLocSearch,
    aiProvider, setAiProvider, orModel, setOrModel,
    keysLoaded, setKeysLoaded, getKey,
    checkInputs, addLog, searchLocation, runAIScrape, runBatchScrape, autoStart,
    exportLeadsCSV, generatePythonScript, downloadPythonScript, exportScrapeLog, exportAllLogs,
    sortedAndFilteredLeads
  };
}
