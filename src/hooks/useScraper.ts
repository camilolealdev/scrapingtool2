import { useState, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { ScrapeResult, LogEntry, SortConfig, MapParams, QueryResult } from '../types';
import { fillTemplate } from '../utils/dorkBuilder';
import { callOpenRouter } from '../utils/openRouter';
import { callNVIDIANIM } from '../utils/nvidiaNIM';
import { googleCustomSearch } from '../utils/googleCS';

export function useScraper(
  niche: string, city: string, zone: string, year: number,
  region: string, R: any, TEMPLATES: TEMPLATES_TYPE,
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
  // Auto-detect available providers from localStorage or env
  const getKey = (key: string) => localStorage.getItem(`osint_${key}`) || import.meta.env[key] || '';
  const [aiProvider, setAiProvider] = useState<"gemini" | "openrouter" | "nvidia" | "google-cs">(() => {
    if (getKey("VITE_GEMINI_API_KEY")) return "gemini";
    if (getKey("VITE_OPENROUTER_API_KEY")) return "openrouter";
    if (getKey("VITE_NVIDIA_API_KEY")) return "nvidia";
    if (getKey("VITE_GOOGLE_CS_API_KEY")) return "google-cs";
    return "gemini";
  });
  const [orModel, setOrModel] = useState("anthropic/claude-3.5-sonnet");

  const addLog = useCallback((msg: string) => {
    setScrapeLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
  }, []);

  // Auto-start scrape when provider is ready and query is valid
  const autoStart = useCallback((query: string) => {
    if (!query.trim() || scraping) return;
    const hasKey =
      (aiProvider === "gemini" && getKey("VITE_GEMINI_API_KEY")) ||
      (aiProvider === "openrouter" && getKey("VITE_OPENROUTER_API_KEY")) ||
      (aiProvider === "nvidia" && getKey("VITE_NVIDIA_API_KEY")) ||
      (aiProvider === "google-cs" && getKey("VITE_GOOGLE_CS_API_KEY") && getKey("VITE_GOOGLE_CS_CX"));
    if (hasKey) {
      addLog(`🚀 Auto-iniciando con ${aiProvider.toUpperCase()}...`);
      runAIScrape(query);
    }
  }, [aiProvider, scraping, runAIScrape, addLog]);

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
        // Note: setCity/setZone would need to be passed or handled differently
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

  const runAIScrape = async (query: string, mode: "standard" | "instagram" | "emails" | "phones" = "standard") => {
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
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
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
          let leads = JSON.parse(text);
          if (Array.isArray(leads)) {
            setScrapeResults(prev => [...prev, ...leads]);
            addLog(`✅ ¡Éxito! Se añadieron ${leads.length} leads.`);
          }
        }
      } else if (aiProvider === "openrouter") {
        addLog(`📡 Consultando OpenRouter (${orModel})...`);
        const leads = await callOpenRouter(import.meta.env.VITE_OPENROUTER_API_KEY!, orModel, prompt, instructions);
        if (Array.isArray(leads)) {
          setScrapeResults(prev => [...prev, ...leads]);
          addLog(`✅ ¡Éxito! Se añadieron ${leads.length} leads.`);
        }
      } else if (aiProvider === "nvidia") {
        addLog("📡 Consultando a NVIDIA NIM...");
        const leads = await callNVIDIANIM(import.meta.env.VITE_NVIDIA_API_KEY!, "nvidia/nemotron-4-340b-instruct", `${instructions}\n\n${prompt}`);
        if (Array.isArray(leads)) {
          setScrapeResults(prev => [...prev, ...leads]);
          addLog(`✅ ¡Éxito! Se añadieron ${leads.length} leads.`);
        }
      } else if (aiProvider === "google-cs") {
        addLog("🔍 Google Custom Search...");
        const results = await googleCustomSearch(import.meta.env.VITE_GOOGLE_CS_API_KEY!, import.meta.env.VITE_GOOGLE_CS_CX!, query);
        addLog(`✅ ${results.length} URLs encontradas, extrayendo leads...`);
        for (const item of results) {
          try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });
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
              const leads = JSON.parse(text);
              if (Array.isArray(leads)) {
                setScrapeResults(prev => [...prev, ...leads]);
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
  };

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

  const generatePythonScript = () => {
    if (!checkInputs()) return;
    const bulkDorks = Object.values(TEMPLATES).flatMap((c: any) => c.templates.map((t: any) => fillTemplate(t.query, niche, city, zone, year, false)));
    const script = `#!/usr/bin/env python3
"""
DORKING LAB — Advanced Lead Extractor v2.0
Author: OSINT AI
"""
import requests
from bs4 import BeautifulSoup
import csv, re, time, json
from urllib.parse import quote

NICHE = "${niche || "restaurante"}"
CITY = "${city || "bogota"}"
QUERIES = [
${bulkDorks.slice(0, 15).map(q => `    "${q.replace(/"/g, '\\"')}",`).join("\n")}
]

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}

def get_links_from_search(query):
    print(f"[*] Searching: {query}")
    url = f"https://www.google.com/search?q={quote(query)}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if "url?q=" in href and "google.com" not in href:
                clean_url = href.split("url?q=")[1].split("&")[0]
                links.append(clean_url)
        return list(set(links))
    except Exception as e:
        print(f"[!] Search Error: {e}")
        return []

def extract_leads(target_url):
    print(f" [+] Scraping: {target_url}")
    try:
        resp = requests.get(target_url, headers=HEADERS, timeout=10)
        text = resp.text
        
        # Regex extraction
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', text)
        phones = re.findall(r'\\+?\\d{1,3}[\\s.-]?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}', text)
        socials = re.findall(r'instagram\\.com/[a-zA-Z0-9._-]+|facebook\\.com/[a-zA-Z0-9._-]+', text)
        
        return {
            "source": target_url,
            "emails": list(set(emails)),
            "phones": list(set(phones)),
            "socials": list(set(socials))
        }
    except:
        return None

def main():
    all_leads = []
    for q in QUERIES:
        links = get_links_from_search(q)
        for link in links[:5]: # Limit per query
            lead = extract_leads(link)
            if lead:
                all_leads.append(lead)
            time.sleep(2)
            
    with open(f"leads_{NICHE}_{CITY}.json", "w") as f:
        json.dump(all_leads, f, indent=4)
    print(f"[*] Done! Saved {len(all_leads)} leads to JSON.")

if __name__ == "__main__":
    main()
`;
    navigator.clipboard.writeText(script).then(() => showToast("✓ Script Python (v2) copiado"));
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
      exportLeadsCSV, generatePythonScript, exportScrapeLog, exportAllLogs,
      sortedAndFilteredLeads
    };
}
