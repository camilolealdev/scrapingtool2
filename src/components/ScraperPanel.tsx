import { Bot, Terminal, Instagram, Mail, Zap, Download, MapPin, Search } from "lucide-react";

interface Props {
  scrapeQuery: string;
  setScrapeQuery: (v: string) => void;
  scrapeResults: any[];
  setScrapeResults: (v: any[] | ((prev: any[]) => any[])) => void;
  scraping: boolean;
  scrapeLog: any[];
  scraperMode: "search" | "batch";
  setScraperMode: (m: "search" | "batch") => void;
  batchInput: string;
  setBatchInput: (v: string) => void;
  runAIScrape: (query: string, mode?: string) => void;
  runBatchScrape: () => void;
  exportLeadsCSV: () => void;
  sortedAndFilteredLeads: any[];
  leadsSearch: string;
  setLeadsSearch: (v: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  setSortConfig: (c: any) => void;
  showToast: (m: string) => void;
  generatePythonScript: () => void;
  region: any;
}

export default function ScraperPanel({ scrapeQuery, setScrapeQuery, scrapeResults, scraping, scrapeLog, scraperMode, setScraperMode, batchInput, setBatchInput, runAIScrape, runBatchScrape, exportLeadsCSV, sortedAndFilteredLeads, leadsSearch, setLeadsSearch, sortConfig, setSortConfig, showToast, generatePythonScript }: Props) {
  return (
    <div>
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

      {/* Results */}
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
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {sortedAndFilteredLeads.length === 0 ? (
              <div className="text-center py-10 text-t2 italic text-sm border border-dashed border-b0 rounded-xl">
                {scraping ? "Extrayendo leads con IA..." : "No hay leads. Usa el extractor arriba."}
              </div>
            ) : sortedAndFilteredLeads.map((lead, i) => (
              <div key={i} className="bg-bgc border border-b0 rounded-lg p-3 hover:border-b1 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-t0">{lead.name || "Sin nombre"}</h4>
                  <button className="text-t2 hover:text-red-brand" onClick={() => setScrapeResults(prev => prev.filter((_, idx) => idx !== i))}>
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  {lead.phone && <span className="text-t2"><span className="text-cyan-brand">📞</span> {lead.phone}</span>}
                  {lead.email && <span className="text-t2"><span className="text-green-brand">📧</span> {lead.email}</span>}
                  {lead.whatsapp && <span className="text-t2"><span className="text-green-brand">💬</span> {lead.whatsapp}</span>}
                  {lead.website && <span className="text-t2"><span className="text-blue-brand">🌐</span> {lead.website}</span>}
                  {lead.instagram && <span className="text-t2"><span className="text-pink-brand">📸</span> {lead.instagram}</span>}
                </div>
                {lead.address && <p className="text-[10px] text-t2 mt-1">{lead.address}</p>}
                {lead.notes && <p className="text-[9px] text-t1 mt-1 italic">{lead.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Log panel */}
        <div className="bg-bg0 border border-b0 rounded-xl p-3 overflow-y-auto">
          <div className="text-[9px] font-bold text-t2 uppercase tracking-widest mb-2 flex justify-between">
            Log de Extracción
            <button className="text-t2 hover:text-red-brand text-[9px]" onClick={() => setScrapeLog([])}>Limpiar</button>
          </div>
          <div className="space-y-1">
            {scrapeLog.map((l, i) => (
              <div key={i} className="text-[9px] font-mono text-t2 p-1.5 rounded bg-bg1/50">
                <span className="text-t1">[{l.time}]</span> {l.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
