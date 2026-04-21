/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  Instagram, 
  Mail, 
  Globe, 
  Zap, 
  Star, 
  History as HistoryIcon, 
  Database, 
  Download, 
  Trash2, 
  Copy, 
  ExternalLink, 
  AlertTriangle,
  Bot,
  Terminal,
  FileText,
  Clock,
  Navigation,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to center map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// ─── REGION DATABASE ───
const REGIONS: Record<string, any> = {
  co: { name: "Colombia", flag: "🇨🇴", lang: "es", google: "google.com.co", tld: ".com.co", bing_loc: "co", ddg_region: "co-es",
    maps: "google.com.co/maps", ml: "mercadolibre.com.co", pa: "paginasamarillas.com.co",
    dirs: ["cylex.com.co","infoisinfo.com.co","tupalo.com","empresite.eleconomistaamerica.co"],
    apps: ["Rappi","Domicilios.com"], phone: "+57",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|móvil|llamar", order: "pedidos|domicilios|envíos|delivery",
      open: "abrimos|inauguración|apertura|nuevo local", review: "reseña|reseñas|review|reviews", schedule: "horario|horarios",
      quote: "cotización|cotizar|presupuesto", independent: "independiente|freelance|por cuenta propia" }
  },
  mx: { name: "México", flag: "🇲🇽", lang: "es", google: "google.com.mx", tld: ".com.mx", bing_loc: "mx", ddg_region: "mx-es",
    maps: "google.com.mx/maps", ml: "mercadolibre.com.mx", pa: "seccionamarilla.com.mx",
    dirs: ["cylex.com.mx","infoisinfo.com.mx","guialis.com.mx","mexpages.com"],
    apps: ["Rappi","DiDi Food","Uber Eats"], phone: "+52",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|a domicilio|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ar: { name: "Argentina", flag: "🇦🇷", lang: "es", google: "google.com.ar", tld: ".com.ar", bing_loc: "ar", ddg_region: "ar-es",
    maps: "google.com.ar/maps", ml: "mercadolibre.com.ar", pa: "paginasamarillas.com.ar",
    dirs: ["cylex.com.ar","guiafe.com.ar","donempresa.com"],
    apps: ["Rappi","PedidosYa"], phone: "+54",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "independiente|freelance" }
  },
  cl: { name: "Chile", flag: "🇨🇱", lang: "es", google: "google.cl", tld: ".cl", bing_loc: "cl", ddg_region: "cl-es",
    maps: "google.cl/maps", ml: "mercadolibre.cl", pa: "paginasamarillas.cl",
    dirs: ["cylex.cl","amarillas.cl","guioteca.com"],
    apps: ["Rappi","PedidosYa","Cornershop"], phone: "+56",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular|fono", order: "pedidos|despacho|envíos|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  pe: { name: "Perú", flag: "🇵🇪", lang: "es", google: "google.com.pe", tld: ".com.pe", bing_loc: "pe", ddg_region: "pe-es",
    maps: "google.com.pe/maps", ml: "mercadolibre.com.pe", pa: "paginasamarillas.com.pe",
    dirs: ["cylex.com.pe","infoisinfo.com.pe"],
    apps: ["Rappi","PedidosYa"], phone: "+51",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review|opinión", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  ec: { name: "Ecuador", flag: "🇪🇨", lang: "es", google: "google.com.ec", tld: ".com.ec", bing_loc: "ec", ddg_region: "ec-es",
    maps: "google.com.ec/maps", ml: "mercadolibre.com.ec", pa: "paginasamarillas.com.ec",
    dirs: ["cylex.com.ec","guialocal.com.ec"],
    apps: ["Rappi","PedidosYa"], phone: "+593",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|celular", order: "pedidos|delivery|envíos",
      open: "abrimos|inauguración|apertura", review: "reseña|review", schedule: "horario|horarios",
      quote: "cotización|presupuesto", independent: "independiente|freelance" }
  },
  br: { name: "Brasil", flag: "🇧🇷", lang: "pt", google: "google.com.br", tld: ".com.br", bing_loc: "br", ddg_region: "br-pt",
    maps: "google.com.br/maps", ml: "mercadolivre.com.br", pa: null,
    dirs: ["telelistas.net","guiamais.com.br","apontador.com.br"],
    apps: ["iFood","Rappi"], phone: "+55",
    kw: { contact: "contato|fale conosco", phone: "telefone|celular|whatsapp", order: "pedidos|delivery|entregas",
      open: "inauguração|abertura|novo", review: "avaliação|avaliações|review", schedule: "horário|horários",
      quote: "orçamento|solicitar orçamento", independent: "autônomo|freelancer" }
  },
  us: { name: "USA", flag: "🇺🇸", lang: "en", google: "google.com", tld: ".com", bing_loc: "us", ddg_region: "us-en",
    maps: "google.com/maps", ml: null, pa: null,
    dirs: ["yelp.com","yellowpages.com","bbb.org","manta.com","thumbtack.com"],
    apps: ["DoorDash","Uber Eats","GrubHub"], phone: "+1",
    kw: { contact: "contact|contact us", phone: "phone|call|cell", order: "order|delivery|pickup",
      open: "now open|grand opening", review: "review|reviews|rating", schedule: "hours|business hours",
      quote: "quote|estimate", independent: "freelance|independent" }
  },
  es: { name: "España", flag: "🇪🇸", lang: "es", google: "google.es", tld: ".es", bing_loc: "es", ddg_region: "es-es",
    maps: "google.es/maps", ml: null, pa: "paginasamarillas.es",
    dirs: ["qdq.com","cylex.es","infoisinfo.es"],
    apps: ["Glovo","Just Eat"], phone: "+34",
    kw: { contact: "contacto|contáctenos", phone: "teléfono|móvil", order: "pedidos|reparto|delivery",
      open: "abrimos|inauguración|apertura", review: "reseña|reseñas|valoración", schedule: "horario|horarios",
      quote: "presupuesto|cotización", independent: "autónomo|freelance" }
  }
};

// ─── GOOGLE OPERATORS ───
const OPERATORS: Record<string, any[]> = {
  google: [
    { id: "site", syntax: "site:", status: "active", desc: "Domain restriction", example: "site:instagram.com" },
    { id: "intitle", syntax: "intitle:", status: "active", desc: "Title match", example: 'intitle:"contacto"' },
    { id: "inurl", syntax: "inurl:", status: "active", desc: "URL match", example: "inurl:admin" },
    { id: "filetype", syntax: "filetype:", status: "active", desc: "File type", example: "filetype:pdf" },
    { id: "before", syntax: "before:", status: "active", desc: "Before date", example: "before:2024-01-01" },
    { id: "after", syntax: "after:", status: "active", desc: "After date", example: "after:2024-01-01" },
    { id: "OR", syntax: "OR", status: "active", desc: "Boolean OR", example: "dentist OR doctor" },
    { id: "minus", syntax: "-", status: "active", desc: "Exclude", example: "-franchise" },
    { id: "exact", syntax: '""', status: "active", desc: "Exact phrase", example: '"web design"' },
    { id: "AROUND", syntax: "AROUND(n)", status: "active", desc: "Proximity", example: '"dentist" AROUND(3) "reviews"' },
  ],
  bing: [
    { id: "b_contains", syntax: "contains:", status: "active", desc: "File link", example: "contains:pdf" },
    { id: "b_loc", syntax: "loc:", status: "active", desc: "Country code", example: "loc:co" },
  ],
  ddg: [
    { id: "d_region", syntax: "region:", status: "active", desc: "Region filter", example: "region:co-es" },
  ]
};

// ─── BUILD REGION-AWARE DORK TEMPLATES ───
function buildTemplates(r: string) {
  const R = REGIONS[r];
  const k = R.kw;
  const kws = (field: string, n = 2) => k[field].split("|").slice(0, n).map((w: string) => `"${w}"`).join(" OR ");

  return {
    gmb: {
      name: "Google My Business", icon: <MapPin className="w-4 h-4" />, color: "#4285F4",
      desc: "Negocios en Google Maps sin presencia web",
      templates: [
        { name: "Perfiles de negocios", query: `site:${R.maps}/place/ "{NICHE}" "{CITY}"`, desc: "Perfiles GMB — muchos sin web propia" },
        { name: "Pocas reseñas", query: `site:${R.google}/maps "{NICHE}" "{CITY}" (${kws("review", 3)})`, desc: "Negocios que necesitan gestión de reseñas" },
        { name: "Negocios nuevos", query: `"{NICHE}" "{CITY}" (${kws("open", 3)}) after:{YEAR}-01-01`, desc: "Negocios recientemente abiertos" },
      ]
    },
    instagram: {
      name: "Instagram Leads", icon: <Instagram className="w-4 h-4" />, color: "#E1306C",
      desc: "Cuentas IG de negocios sin website",
      templates: [
        { name: "Solo perfiles", query: `site:instagram.com "{NICHE}" "{CITY}" -inurl:/p/ -inurl:/reel/`, desc: "Filtra posts individuales" },
        { name: "Linktree users", query: `site:instagram.com "{NICHE}" "{CITY}" "linktr.ee" OR "linktree"`, desc: "Usan Linktree = sin web propia" },
        { name: "Email en bio", query: `site:instagram.com "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Email personal visible en bio" },
      ]
    },
    obsolete: {
      name: "Webs Obsoletas", icon: <Globe className="w-4 h-4" />, color: "#FF6B35",
      desc: "Websites anticuados o abandonados",
      templates: [
        { name: "Copyright viejo", query: `"{NICHE}" "{CITY}" intext:"© 2018" OR intext:"© 2019" OR intext:"© 2017"`, desc: "Footer viejo = sitio abandonado" },
        { name: "Sin HTTPS", query: `"{NICHE}" "{CITY}" inurl:http:// -inurl:https:// intext:"${k.contact.split("|")[0]}"`, desc: "Sin certificado SSL" },
      ]
    },
    emails: {
      name: "Emails & Datos", icon: <Mail className="w-4 h-4" />, color: "#00C853",
      desc: "Datos de contacto expuestos públicos",
      templates: [
        { name: "Emails en docs", query: `filetype:pdf OR filetype:xlsx "{NICHE}" "{CITY}" "@gmail.com" OR "@hotmail.com"`, desc: "Archivos con emails expuestos" },
        { name: "WhatsApp", query: `"{NICHE}" "{CITY}" "wa.me/" OR "api.whatsapp.com/send"`, desc: "Links directos de WhatsApp" },
        { name: "Directorios", query: `"{NICHE}" "{CITY}" (${R.dirs.slice(0, 2).map((d: string) => `site:${d}`).join(" OR ")})`, desc: "Directorios específicos de la región" },
      ]
    },
    social: {
      name: "Redes Sociales", icon: <Globe className="w-4 h-4" />, color: "#7C4DFF",
      desc: "Presencia en redes sin sitio web propio",
      templates: [
        { name: "Facebook Only", query: `site:facebook.com "{NICHE}" "{CITY}" -inurl:www. -inurl:.com/`, desc: "Negocios que solo operan en FB" },
        { name: "LinkedIn Co.", query: `site:linkedin.com/company/ "{NICHE}" "{CITY}"`, desc: "Perfiles de empresa en LinkedIn" },
        { name: "TikTok Leads", query: `site:tiktok.com "{NICHE}" "{CITY}"`, desc: "Emprendedores activos en TikTok" },
      ]
    },
    regional: {
      name: "Regional Tools", icon: <Database className="w-4 h-4" />, color: "#FFD600",
      desc: `Plataformas locales de ${R.name}`,
      templates: [
        ...(R.ml ? [{ name: "MercadoLibre", query: `site:${R.ml} "{NICHE}" "{CITY}"`, desc: "Vendedores locales con volumen" }] : []),
        ...(R.pa ? [{ name: "Paginas Amarillas", query: `site:${R.pa} "{NICHE}" "{CITY}"`, desc: "Directorio tradicional" }] : []),
        ...R.apps.map((a: string) => ({ name: a, query: `"{NICHE}" "{CITY}" "${a}"`, desc: `Presentes en ${a}` })),
      ]
    },
    advanced: {
      name: "Power Combos", icon: <Zap className="w-4 h-4" />, color: "#FF9100",
      desc: "Combinaciones de alta precisión",
      templates: [
        { name: "Hot Leads", query: `"{NICHE}" "{CITY}" ("@gmail.com" OR "@hotmail.com" OR "wa.me") -site:instagram.com -site:facebook.com`, desc: "Contactos directos fuera de redes" },
        { name: "Freelancers", query: `"{NICHE}" "{CITY}" (${kws("independent")}) ("whatsapp" OR "@gmail")`, desc: "Profesionales independientes" },
        { name: "Weak SEO", query: `"{NICHE}" "{CITY}" -site:instagram.com -site:facebook.com inurl:${k.contact.split("|")[0]}`, desc: "Sitios con bajo SEO (sin redes)" },
      ]
    }
  };
}

export default function App() {
  const [region, setRegion] = useState("co");
  const [tab, setTab] = useState("templates");
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [custom, setCustom] = useState("");
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("gmb");
  const [history, setHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  
  // Scraper state
  const [scrapeQuery, setScrapeQuery] = useState("");
  const [scrapeResults, setScrapeResults] = useState<any[]>([]);
  const [scraping, setScraping] = useState(false);
  const [scrapeLog, setScrapeLog] = useState<any[]>([]);
  const [allHistoryLogs, setAllHistoryLogs] = useState<any[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Expansion states
  const [scraperMode, setScraperMode] = useState<"search" | "batch">("search");
  const [batchInput, setBatchInput] = useState("");
  const [dorkSearch, setDorkSearch] = useState("");
  const [dorkOpFilter, setDorkOpFilter] = useState("all");
  const [leadsSearch, setLeadsSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [geocoding, setGeocoding] = useState(false);
  const [mapParams, setMapParams] = useState({ center: [4.5709, -74.2973] as [number, number], zoom: 6 });
  const [locSearch, setLocSearch] = useState("");

  const R = REGIONS[region];
  const year = new Date().getFullYear();
  const TEMPLATES: Record<string, any> = useMemo(() => buildTemplates(region), [region]);

  const showToast = useCallback((m: string) => { 
    setToast(m); 
    setTimeout(() => setToast(""), 2200); 
  }, []);

  const copyToClipboard = useCallback((t: string) => { 
    navigator.clipboard.writeText(t).then(() => showToast("✓ Copiado")); 
  }, [showToast]);

  const fillTemplate = useCallback((q: string) => {
    return q
      .replace(/\{NICHE\}/g, niche || (showErrors ? "!!!" : "restaurante"))
      .replace(/\{CITY\}/g, city || (showErrors ? "!!!" : "bogota"))
      .replace(/{YEAR}/g, String(year))
      .replace(/\{ZONE\}/g, zone || (showErrors ? "!!!" : "centro"));
  }, [niche, city, year, zone, showErrors]);

  const checkInputs = useCallback(() => {
    if (!niche.trim() || !city.trim() || !zone.trim()) {
      setShowErrors(true);
      showToast("⚠ Falta: Nicho, Ciudad y Zona");
      return false;
    }
    setShowErrors(false);
    return true;
  }, [niche, city, zone, showToast]);

  const openSearch = useCallback((query: string, engineKey = "google") => {
    if (!query.includes("!!!") && !checkInputs()) return;
    const googleDomain = R.google;
    const urls: Record<string, string> = {
      google: `https://www.${googleDomain}/search?q=`,
      bing: `https://www.bing.com/search?cc=${R.bing_loc}&q=`,
      ddg: `https://duckduckgo.com/?kl=${R.ddg_region}&q=`,
      yandex: `https://yandex.com/search/?text=`,
    };
    window.open(urls[engineKey] + encodeURIComponent(query), "_blank");
    setHistory(prev => [{ 
      query, 
      engine: engineKey, 
      time: new Date().toLocaleTimeString(), 
      ts: Date.now(), 
      flag: R.flag 
    }, ...prev.slice(0, 49)]);
  }, [R]);

  const toggleFavorite = useCallback((q: string) => { 
    setFavorites(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]); 
  }, []);

  const toggleOperator = useCallback((id: string) => { 
    setSelectedOps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); 
  }, []);

  const builtQuery = useMemo(() => {
    if (!selectedOps.length && !custom) return "";
    const allOps = [...OPERATORS.google, ...OPERATORS.bing, ...OPERATORS.ddg];
    const opsStr = selectedOps
      .map(id => allOps.find(o => o.id === id)?.example || "")
      .filter(Boolean)
      .join(" ");
    return [opsStr, custom].filter(Boolean).join(" ");
  }, [selectedOps, custom]);

  const addLog = useCallback((msg: string) => { 
    setScrapeLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]); 
  }, []);

  const searchLocation = async (q: string) => {
    if (!q.trim() || geocoding) return;
    setGeocoding(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await resp.json();
      if (data && data[0]) {
        const { display_name, lat, lon } = data[0];
        const parts = display_name.split(", ");
        setCity(parts[0] || "");
        setZone(parts[1] || "");
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
    
    // Save current logs to history if switching away from search result accumulation
    // Note: for batch we want to keep them visible during the process
    
    setScraping(true);
    addLog(`🤖 Modo ${mode.toUpperCase()} - Iniciando: ${query.slice(0, 50)}...`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
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
      addLog("📡 Consultando a Gemini con herramientas de búsqueda...");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
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
    
    // Clear previous results for fresh batch? Maybe safe to keep.
    // setScrapeResults([]);
    // setScrapeLog([]);
    
    addLog(`🚀 Iniciando lote de ${lines.length} URLs/Búsquedas...`);
    for (const line of lines) {
      addLog(`📄 Procesando: ${line}`);
      await runAIScrape(line);
      // Wait a bit between calls
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
    const bulkDorks = Object.values(TEMPLATES).flatMap((c: any) => c.templates.map((t: any) => fillTemplate(t.query)));
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
    copyToClipboard(script);
    showToast("✓ Script Python (v2) copiado");
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

  const getBulkDorks = () => {
    const all = [];
    if (!niche.trim() || !city.trim() || !zone.trim()) return [];
    for (const cat of Object.values(TEMPLATES)) {
      for (const t of cat.templates) {
        all.push({ cat: cat.name, name: t.name, query: fillTemplate(t.query) });
      }
    }
    return all;
  };

  const bulkDorks = useMemo(() => getBulkDorks(), [TEMPLATES, niche, city, zone, region]);

  const filteredDorks = useMemo(() => {
    const dorks = TEMPLATES[activeCategory].templates;
    return dorks.filter((t: any) => {
      const matchesSearch = t.name.toLowerCase().includes(dorkSearch.toLowerCase()) || 
                           t.desc.toLowerCase().includes(dorkSearch.toLowerCase()) ||
                           t.query.toLowerCase().includes(dorkSearch.toLowerCase());
      
      let matchesOp = true;
      if (dorkOpFilter === "all") matchesOp = true;
      else if (dorkOpFilter === "email") {
        matchesOp = t.query.includes("@") || t.query.toLowerCase().includes("email");
      }
      else if (dorkOpFilter === "phone") {
        matchesOp = t.query.includes("tel") || t.query.includes("phone") || t.query.includes("celular");
      }
      else {
        matchesOp = t.query.toLowerCase().includes(dorkOpFilter.toLowerCase());
      }
      
      return matchesSearch && matchesOp;
    });
  }, [TEMPLATES, activeCategory, dorkSearch, dorkOpFilter]);

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
      const valA = (a[sortConfig.key] || "").toString().toLowerCase();
      const valB = (b[sortConfig.key] || "").toString().toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [scrapeResults, leadsSearch, sortConfig]);

  // Helper for query highlighting
  const renderHighlightedQuery = (q: string) => {
    if (!q) return null;
    return q.split(/(\b(?:site|intitle|inurl|filetype|before|after|AROUND):|OR|AND|-\w+|"[^"]*"|\{[^}]+\})/g)
      .map((p, i) => {
        if (/^(site|intitle|inurl|filetype|before|after|AROUND):$/i.test(p)) return <span key={i} className="text-orange-brand font-bold">{p}</span>;
        if (p === "OR" || p === "AND") return <span key={i} className="text-orange-brand font-bold">{p}</span>;
        if (p.startsWith("-")) return <span key={i} className="text-green-brand">{p}</span>;
        if (p.startsWith('"')) return <span key={i} className="text-pink-brand">{p}</span>;
        if (p.startsWith("{")) return <span key={i} className="text-t2 italic">{p}</span>;
        return <span key={i}>{p}</span>;
      });
  };

  return (
    <div className="min-h-screen bg-bg0 text-t0 font-sans selection:bg-blue-brand/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="hd text-center mb-8 border-b border-b0 pb-6">
          <div className="badge">
            <Zap className="w-3 h-3 fill-cyan-brand" /> OSINT LEAD FINDER v5
          </div>
          <h1>Google Dorking Lab</h1>
          <p className="text-t1 text-sm max-w-2xl mx-auto">
            Explora leads ocultos en diversas regiones usando operadores avanzados de búsqueda. 
            Optimizado para prospección B2B y recolección de datos públicos.
          </p>
        </header>

        {/* Region Selection */}
        <div className="flex flex-wrap gap-2 justify-center mb-6 p-2.5 bg-bgc border border-b0 rounded-xl">
          {Object.entries(REGIONS).map(([id, rg]) => (
            <button 
              key={id} 
              className={`btn border border-b0 bg-bg1 text-t2 font-medium hover:border-b1 hover:text-t0 ${region === id ? "!bg-bg3 !border-blue-brand !text-t0 shadow-[0_0_10px_rgba(66,133,244,0.1)]" : ""}`}
              onClick={() => { setRegion(id); setActiveCategory("gmb"); }}
            >
              <span className="text-base">{rg.flag}</span> {rg.name}
            </button>
          ))}
        </div>

        {/* Config Inputs */}
        <div className="bg-bgc border border-b0 rounded-xl p-3.5 flex flex-wrap gap-3 items-end mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Nicho / Palabra Clave</label>
            <input className={`inp ${showErrors && !niche.trim() ? "border-red-brand bg-red-brand/5" : ""}`} placeholder="ej: odontologia, restaurante..." value={niche} onChange={e => setNiche(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1 flex justify-between">
              Ciudad/Referencia 
            </label>
            <div className="relative group">
              <input 
                className={`inp pr-10 ${showErrors && !city.trim() ? "border-red-brand bg-red-brand/5" : ""}`} 
                placeholder="ej: bogota, CC Andino..." 
                value={city} 
                onChange={e => setCity(e.target.value)} 
                onKeyDown={e => e.key === "Enter" && searchLocation(city)}
              />
              <button 
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-t2 hover:text-blue-brand transition-colors ${geocoding ? "animate-spin" : ""}`}
                onClick={() => searchLocation(city)}
                title="Geocodificar"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="w-32">
            <label className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Zona</label>
            <input className={`inp ${showErrors && !zone.trim() ? "border-red-brand bg-red-brand/5" : ""}`} placeholder="ej: norte..." value={zone} onChange={e => setZone(e.target.value)} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "builder", i: <Terminal className="w-4 h-4" />, l: "Constructor" },
            { id: "templates", i: <Database className="w-4 h-4" />, l: "Dorks" },
            { id: "scraper", i: <Bot className="w-4 h-4" />, l: `Scraper (${scrapeResults.length})` },
            { id: "map", i: <MapPin className="w-4 h-4" />, l: "Mapa" },
            { id: "bulk", i: <Download className="w-4 h-4" />, l: `Bulk (${bulkDorks.length})` },
            { id: "favorites", i: <Star className="w-4 h-4" />, l: "Favoritos" },
            { id: "history", i: <Clock className="w-4 h-4" />, l: "Historial" },
          ].map(t => (
            <button 
              key={t.id} 
              className={`btn border border-b0 bg-bg1 text-t2 hover:border-b1 hover:text-t0 whitespace-nowrap ${tab === t.id ? "!bg-bg3 !border-blue-brand !text-t0 shadow-[0_0_10px_rgba(66,133,244,0.1)]" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.i} {t.l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {tab === "builder" && (
              <motion.div 
                key="builder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid md:grid-cols-2 gap-4"
              >
                <div className="pnl">
                  <div className="flex items-center gap-2 mb-4 text-[9px] font-mono tracking-widest text-t2 uppercase"><div className="w-1 h-1 rounded-full bg-blue-brand" /> Operadores Google</div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {OPERATORS.google.map(op => (
                      <button 
                        key={op.id} 
                        className={`px-3 py-2 rounded-md border border-b0 bg-bg1 font-mono text-[10px] transition-all hover:border-blue-brand hover:text-cyan-brand flex flex-col items-center gap-1 ${selectedOps.includes(op.id) ? "border-blue-brand text-cyan-brand bg-bg3" : "text-t2"}`}
                        onClick={() => toggleOperator(op.id)}
                        title={op.desc}
                      >
                        <span className="font-bold text-xs">{op.syntax}</span>
                        <span className="opacity-40 text-[8px] italic">{op.example.slice(0, 15)}...</span>
                      </button>
                    ))}
                  </div>
                  <label className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Personalizado</label>
                  <input className="inp" placeholder='"whatsapp" OR "@gmail.com"' value={custom} onChange={e => setCustom(e.target.value)} />
                </div>
                
                <div className="pnl">
                  <div className="flex items-center gap-2 mb-4 text-[9px] font-mono tracking-widest text-t2 uppercase"><div className="w-1 h-1 rounded-full bg-green-brand" /> Query Resultante</div>
                  <div className="qb h-32 overflow-y-auto">
                    {builtQuery ? renderHighlightedQuery(builtQuery) : <span className="text-t2 italic opacity-60">Selecciona operadores o escribe...</span>}
                  </div>
                  {builtQuery && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button className="btn border border-b0 bg-bg1 text-t0 hover:bg-bg2" onClick={() => copyToClipboard(builtQuery)}><Copy className="w-3.5 h-3.5" /></button>
                      <button 
                        className={`btn border border-b0 bg-bg1 hover:bg-bg2 ${favorites.includes(builtQuery) ? "text-yellow-brand" : "text-t0"}`} 
                        onClick={() => toggleFavorite(builtQuery)}
                        title="Guardar en favoritos"
                      >
                        <Star className={`w-3.5 h-3.5 ${favorites.includes(builtQuery) ? "fill-current" : ""}`} />
                      </button>
                      <button className="btn border border-blue-brand/50 bg-bg1 text-t0 hover:bg-bg2 flex-1 justify-center" onClick={() => openSearch(builtQuery)}>Google</button>
                      <button className="btn border border-b0 bg-bg1 text-t0 hover:bg-bg2" onClick={() => openSearch(builtQuery, "yandex")}>Yandex</button>
                      <button className="btn border border-b0 bg-bg1 text-t0 hover:bg-bg2" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(builtQuery)}`, "_blank")}>Maps</button>
                      <button className="btn bg-blue-brand text-white hover:opacity-90 px-6" onClick={() => { setScrapeQuery(builtQuery); setTab("scraper"); }}>Scrape</button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "templates" && (
              <motion.div 
                key="templates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                    {Object.entries(TEMPLATES).map(([k, c]) => (
                      <button 
                        key={k} 
                        className={`btn border border-b0 transition-all font-medium whitespace-nowrap ${activeCategory === k ? "text-white" : "bg-bg1 text-t2"}`}
                        style={activeCategory === k ? { background: c.color, borderColor: c.color } : {}}
                        onClick={() => setActiveCategory(k)}
                      >
                        {c.icon} {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 bg-bgc border border-b0 p-1.5 rounded-xl w-full lg:w-auto">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-t2" />
                      <input 
                        className="inp !w-48 !pl-9" 
                        placeholder="Filtrar dorks..." 
                        value={dorkSearch} 
                        onChange={e => setDorkSearch(e.target.value)} 
                      />
                    </div>
                    <select 
                      className="inp !w-32 !py-0" 
                      value={dorkOpFilter} 
                      onChange={e => setDorkOpFilter(e.target.value)}
                    >
                      <option value="all">Todo Op.</option>
                      <option value="site:">site:</option>
                      <option value="inurl:">inurl:</option>
                      <option value="intitle:">intitle:</option>
                      <option value="filetype:">filetype:</option>
                      <option value="email">Emails</option>
                      <option value="phone">Teléfonos</option>
                    </select>
                    <button 
                      className="btn bg-bg1 border border-b0 text-t2 hover:text-red-brand px-2 py-1 text-[10px]" 
                      onClick={() => { setDorkSearch(""); setDorkOpFilter("all"); showToast("Filtros limpiados"); }}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {filteredDorks.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-b0 rounded-xl text-t2 italic">
                    <Filter className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    No se encontraron dorks con esos filtros.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredDorks.map((t, i) => {
                      const filled = fillTemplate(t.query);
                      return (
                        <div key={i} className="tc group">
                          <div className="absolute top-0 left-0 w-1 h-full" style={{ background: TEMPLATES[activeCategory].color }} />
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xs">{t.name}</h3>
                            <button onClick={() => toggleFavorite(filled)} className={`transition-transform hover:scale-110 ${favorites.includes(filled) ? "text-yellow-brand" : "text-t2 opacity-40"}`}>
                              <Star className={`w-3.5 h-3.5 ${favorites.includes(filled) ? "fill-current" : ""}`} />
                            </button>
                          </div>
                          <p className="text-[10px] text-t2 mb-3 leading-relaxed">{t.desc}</p>
                          <div className="tc-q mb-3 line-clamp-2">
                            {renderHighlightedQuery(filled)}
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="btn bg-bg1 border border-b0 px-2 py-1 flex-1 text-[10px]" onClick={() => openSearch(filled)}>Google</button>
                            <button className="btn bg-blue-brand/20 border border-blue-brand/30 text-blue-brand px-2 py-1 flex-1 text-[10px]" onClick={() => { setScrapeQuery(filled); setTab("scraper"); }}>Scrape</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "scraper" && (
              <motion.div 
                key="scraper"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-bgc border border-b0 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-brand/10 flex items-center justify-center text-blue-brand">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                      <h2 className="text-sm font-bold">🤖 AI Extractor</h2>
                      <p className="text-[10px] text-t2">Navega y extrae leads estructurados en segundos.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className={`btn text-[10px] font-bold px-3 py-1 border transition-all ${scraperMode === "search" ? "bg-bg3 border-blue-brand text-blue-brand" : "bg-bg1 border-b0 text-t2 hover:text-t1"}`}
                      onClick={() => setScraperMode("search")}
                    >
                      Búsqueda IA
                    </button>
                    <button 
                      className={`btn text-[10px] font-bold px-3 py-1 border transition-all ${scraperMode === "batch" ? "bg-bg3 border-blue-brand text-blue-brand" : "bg-bg1 border-b0 text-t2 hover:text-t1"}`}
                      onClick={() => setScraperMode("batch")}
                    >
                      Lote de URLs
                    </button>
                    <button className="btn bg-bg1 border border-b0 text-t0 ml-2" onClick={generatePythonScript}>
                      <Terminal className="w-3.5 h-3.5" /> Generar Python
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {scraperMode === "search" ? (
                    <div className="flex gap-2">
                      <input 
                        className="inp flex-1" 
                        placeholder="Pega un dork o describe tu búsqueda..."
                        value={scrapeQuery}
                        onChange={e => setScrapeQuery(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && runAIScrape(scrapeQuery)}
                      />
                      <div className="flex gap-1">
                        <button 
                          className={`btn bg-blue-brand text-white px-6 h-full ${scraping ? "animate-pulse opacity-50" : ""}`}
                          onClick={() => runAIScrape(scrapeQuery)}
                          disabled={scraping}
                        >
                          Extraer
                        </button>
                        <button className="btn bg-pink-brand/20 border border-pink-brand/30 text-pink-brand px-3" onClick={() => runAIScrape(scrapeQuery, "instagram")} title="Extraer de Instagram">
                          <Instagram className="w-4 h-4" />
                        </button>
                        <button className="btn bg-green-brand/20 border border-green-brand/30 text-green-brand px-3" onClick={() => runAIScrape(scrapeQuery, "emails")} title="Extraer Emails">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="btn bg-orange-brand/20 border border-orange-brand/30 text-orange-brand px-3" onClick={() => runAIScrape(scrapeQuery, "phones")} title="Extraer Teléfonos">
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <textarea 
                        className="inp w-full min-h-[100px] font-mono text-xs" 
                        placeholder="Ingresa una URL o búsqueda por línea..."
                        value={batchInput}
                        onChange={e => setBatchInput(e.target.value)}
                      />
                      <div className="flex justify-between items-center bg-bg1/50 p-2 rounded-lg border border-b0">
                        <div className="flex gap-2">
                          <button 
                            className={`btn bg-blue-brand text-white px-8 ${scraping ? "animate-pulse" : ""}`}
                            onClick={runBatchScrape}
                            disabled={scraping}
                          >
                            Procesar Lote
                          </button>
                          <button className="btn bg-bg1 border border-b0 text-t2" onClick={() => setBatchInput("")}>Limpiar</button>
                        </div>
                        <span className="text-[10px] text-t2 italic font-mono">{batchInput.split("\n").filter(l => l.trim()).length} objetivos</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                <div className="grid lg:grid-cols-3 gap-4 h-[500px]">
                  <div className="lg:col-span-2 space-y-3 overflow-y-auto pr-2 scrollbar-thin flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-t2 uppercase tracking-widest">{sortedAndFilteredLeads.length} Leads Encontrados</span>
                      {scrapeResults.length > 0 && (
                        <div className="flex gap-4">
                          <button className="flex items-center gap-1.5 text-cyan-brand text-[10px] font-bold hover:underline" onClick={() => setTab("map")}>
                            <MapPin className="w-3 h-3" /> Ver en Mapa
                          </button>
                          <button className="flex items-center gap-1.5 text-blue-brand text-[10px] font-bold hover:underline" onClick={exportLeadsCSV}>
                            <Download className="w-3 h-3" /> Exportar CSV
                          </button>
                        </div>
                      )}
                    </div>

                    {scrapeResults.length > 0 && (
                      <div className="flex gap-2 mb-3">
                         <div className="relative flex-1">
                           <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-t2" />
                           <input 
                             className="inp !py-1 !pl-8 !text-[10px] w-full" 
                             placeholder="Buscar en leads (nombre, dirección, email)..." 
                             value={leadsSearch}
                             onChange={e => setLeadsSearch(e.target.value)}
                           />
                         </div>
                         <div className="flex border border-b0 rounded bg-bgc overflow-hidden text-[9px] uppercase font-bold text-t2">
                            {['name', 'phone', 'email', 'address'].map(k => (
                              <button 
                                key={k}
                                className={`px-2 py-1 border-r border-b0 last:border-r-0 hover:bg-bg2 transition-colors ${sortConfig.key === k ? "text-cyan-brand bg-bg3" : ""}`}
                                onClick={() => setSortConfig(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                              >
                                {k === 'name' ? 'Nombre' : k === 'phone' ? 'Tel' : k === 'email' ? 'Email' : 'Dir'}
                                {sortConfig.key === k && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                              </button>
                            ))}
                         </div>
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3">
                    {scrapeResults.length === 0 && !scraping && (
                      <div className="h-full flex items-center justify-center border border-dashed border-b0 rounded-xl text-t2 text-xs italic text-center px-8">
                        Nada que mostrar. Inicia un scrape para ver resultados o usa los dorks de las otras pestañas.
                      </div>
                    )}

                    {sortedAndFilteredLeads.map((lead, idx) => (
                      <div key={idx} className="bg-bg1 border border-b0 rounded-lg p-3 hover:border-b1 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-blue-brand">{lead.name}</h4>
                          <div className="flex gap-2">
                            {lead.website && lead.website !== "none" && <a href={lead.website} target="_blank" className="text-cyan-brand hover:scale-110 transition-transform"><ExternalLink className="w-3.5 h-3.5" /></a>}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                          <div className="space-y-1">
                            {lead.phone && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-green-brand" /> {lead.phone}</div>}
                            {lead.email && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-blue-brand" /> {lead.email}</div>}
                          </div>
                          <div className="space-y-1">
                            {lead.instagram && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-pink-brand" /> {lead.instagram}</div>}
                            {lead.address && <div className="flex items-center gap-2 text-t1"><div className="w-1.5 h-1.5 rounded-full bg-orange-brand" /> {lead.address}</div>}
                          </div>
                        </div>
                        {lead.notes && <p className="mt-2 pt-2 border-t border-b0 text-[10px] text-t2 italic line-clamp-1">{lead.notes}</p>}
                      </div>
                    ))}
                    </div>
                  </div>

                  <div className="bg-bg0 border border-b0 rounded-xl p-3 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold text-t2 uppercase tracking-widest block">Logs de Ejecución</span>
                       <div className="flex gap-2">
                         {scrapeLog.length > 0 && (
                           <button className="text-[9px] text-blue-brand hover:underline flex items-center gap-1" onClick={exportScrapeLog}>
                              <FileText className="w-2.5 h-2.5" /> Log
                           </button>
                         )}
                         {(allHistoryLogs.length > 0 || scrapeLog.length > 0) && (
                           <button className="text-[9px] text-cyan-brand hover:underline flex items-center gap-1" onClick={exportAllLogs}>
                              <Database className="w-2.5 h-2.5" /> Todo
                           </button>
                         )}
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin">
                      {scrapeLog.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-t2 shrink-0">[{log.time}]</span>
                          <span className={log.msg.includes("❌") ? "text-red-brand" : log.msg.includes("✅") ? "text-green-brand" : "text-t1"}>{log.msg}</span>
                        </div>
                      ))}
                      {scraping && <div className="animate-pulse text-cyan-brand">_ procesando búsqueda en tiempo real...</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "map" && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-[600px] w-full"
              >
                <div className="mb-4 flex justify-between items-center bg-bgc border border-b0 p-3 rounded-xl">
                  <div className="text-[10px] font-bold text-t2 uppercase tracking-widest">
                    Visualización de Leads ({scrapeResults.filter(l => l.lat && l.lng).length} posicionados)
                  </div>
                  <div className="text-[9px] text-t2 italic">Usa el scraper para poblar el mapa</div>
                </div>
                <MapContainer center={mapParams.center} zoom={mapParams.zoom} style={{ height: "100%", width: "100%" }}>
                  <ChangeView center={mapParams.center} zoom={mapParams.zoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {scrapeResults.filter(l => l.lat && l.lng).map((lead, idx) => (
                    <Marker key={idx} position={[lead.lat, lead.lng]}>
                      <Popup>
                        <div className="font-sans">
                          <h4 className="font-bold text-xs mb-1">{lead.name}</h4>
                          <p className="text-[10px] mb-1">{lead.address}</p>
                          <div className="flex gap-2 text-[9px] font-bold">
                            {lead.phone && <span className="text-green-600">{lead.phone}</span>}
                            {lead.website && <a href={lead.website} target="_blank" className="text-blue-600">Web</a>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </motion.div>
            )}

            {tab === "bulk" && (
              <motion.div 
                key="bulk"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-bgc border border-b0 rounded-xl p-4 mb-4 flex justify-between items-center gap-4">
                  <div className="text-[10px] font-bold text-t2 uppercase tracking-widest">
                    Vista General: {bulkDorks.length} consultas generadas para {R.flag} {R.name}
                  </div>
                  <button className="btn bg-blue-brand text-white" onClick={() => copyToClipboard(bulkDorks.map(d => `[${d.cat}] ${d.name}: ${d.query}`).join("\n"))}>
                    <Copy className="w-3.5 h-3.5" /> Copiar Todo
                  </button>
                </div>
                <div className="space-y-1.5">
                  {bulkDorks.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 bg-bg1 border border-b0 rounded-lg p-2 hover:border-b1 group">
                      <span className="bg-bg3 text-[8px] font-bold px-1.5 py-0.5 rounded border border-b0 text-t2 w-20 text-center uppercase">{d.cat}</span>
                      <span className="text-[10px] text-t1 font-medium w-32 truncate shrink-0">{d.name}</span>
                      <span className="font-mono text-[9px] text-cyan-brand truncate flex-1">{d.query}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => copyToClipboard(d.query)}><Copy className="w-3.5 h-3.5" /></button>
                        <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => openSearch(d.query)}><ExternalLink className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "favorites" && (
              <motion.div 
                key="favorites"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {favorites.length === 0 ? (
                  <div className="text-center py-20 text-t2 text-xs italic">Aún no tienes favoritos. Marca dorks con el icono de estrella.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {favorites.map((q, idx) => (
                      <div key={idx} className="pnl !py-3 flex items-center justify-between group">
                        <div className="font-mono text-[10px] text-cyan-brand truncate flex-1 mr-4">{q}</div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="btn bg-bg1 border border-b0 p-1.5" onClick={() => copyToClipboard(q)}><Copy className="w-3.5 h-3.5" /></button>
                          <button className="btn bg-blue-brand text-white p-1.5" onClick={() => openSearch(q)}><Search className="w-3.5 h-3.5" /></button>
                          <button className="btn bg-red-brand/10 text-red-brand p-1.5 border border-red-brand/20" onClick={() => toggleFavorite(q)}><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {history.length === 0 ? (
                  <div className="text-center py-20 text-t2 text-xs italic">El historial de búsquedas aparecerá aquí.</div>
                ) : (
                  <div className="space-y-2">
                    {history.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-bg1 border border-b0 rounded-lg p-2.5 hover:border-b1 transition-colors">
                        <span className="text-sm">{h.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-t0 truncate">{h.query}</div>
                          <div className="flex gap-3 text-[9px] text-t2 mt-0.5">
                            <span>{h.time}</span>
                            <span className="uppercase">{h.engine}</span>
                          </div>
                        </div>
                        <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => openSearch(h.query, h.engine)}><ExternalLink className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <footer className="mt-12 pt-8 border-t border-b0 text-center">
            <div className="flex justify-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-[10px] text-t2"><Search className="w-3 h-3" /> Russell Optimized</div>
              <div className="flex items-center gap-2 text-[10px] text-t2"><Globe className="w-3 h-3" /> Multi-Region OSINT</div>
              <div className="flex items-center gap-2 text-[10px] text-t2"><Database className="w-3 h-3" /> Export Ready</div>
            </div>
            <p className="text-[9px] font-mono text-t2 opacity-50 uppercase tracking-[2px]">Use responsibly. Powered by Google AI Studio.</p>
        </footer>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-brand text-bg0 font-bold px-6 py-2.5 rounded-lg shadow-2xl transition-all z-50 ${toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
        {toast}
      </div>
    </div>
  );
}
