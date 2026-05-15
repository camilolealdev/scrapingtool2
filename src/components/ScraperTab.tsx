import React from 'react';
import { Bot, Terminal, Instagram, Mail, Zap, MapPin, Download, Search, FileText, Database } from "lucide-react";
import { ScrapeResult, LogEntry } from '../types';
import { LeadCard } from './LeadCard';

interface ScraperTabProps {
  scraping: boolean;
  scraperMode: "search" | "batch";
  setScraperMode: (v: "search" | "batch") => void;
  scrapeQuery: string;
  setScrapeQuery: (v: string) => void;
  runAIScrape: (query: string, mode?: "standard" | "instagram" | "emails" | "phones") => void;
  batchInput: string;
  setBatchInput: (v: string) => void;
  runBatchScrape: () => void;
  scrapeResults: ScrapeResult[];
  leadsSearch: string;
  setLeadsSearch: (v: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  setSortConfig: (v: { key: string; direction: 'asc' | 'desc' }) => void;
  sortedAndFilteredLeads: ScrapeResult[];
  setTab: (v: string) => void;
  exportLeadsCSV: () => void;
  scrapeLog: LogEntry[];
  exportScrapeLog: () => void;
  allHistoryLogs: LogEntry[];
  exportAllLogs: () => void;
  generatePythonScript: () => void;
  downloadPythonScript: () => void;
  autoStart: (query: string) => void;
  aiProvider: "gemini" | "openrouter" | "nvidia" | "google-cs" | "claude";
  setAiProvider: (v: "gemini" | "openrouter" | "nvidia" | "google-cs" | "claude") => void;
  orModel: string;
  setOrModel: (v: string) => void;
}

const KEY_MAP = {
  gemini: 'VITE_GEMINI_API_KEY',
  claude: 'VITE_ANTHROPIC_API_KEY',
  openrouter: 'VITE_OPENROUTER_API_KEY',
  nvidia: 'VITE_NVIDIA_API_KEY',
  'google-cs': 'VITE_GOOGLE_CS_API_KEY',
};

const PROVIDER_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  gemini:     { label: 'Gemini',     badge: '🔍 Web',    color: '#4285F4' },
  claude:     { label: 'Claude',     badge: '🌐 Web',    color: '#D97757' },
  openrouter: { label: 'OpenRouter', badge: '🔁 Multi',  color: '#7C3AED' },
  nvidia:     { label: 'NVIDIA',     badge: '⚡ NIM',    color: '#76B900' },
  'google-cs':{ label: 'Google CS',  badge: '🔎 CS',     color: '#EA4335' },
};

const CX_KEY = 'VITE_GOOGLE_CS_CX';

export function ScraperTab({
  scraping, scraperMode, setScraperMode, scrapeQuery, setScrapeQuery,
  runAIScrape, batchInput, setBatchInput, runBatchScrape,
  scrapeResults, leadsSearch, setLeadsSearch, sortConfig, setSortConfig,
  sortedAndFilteredLeads, setTab, exportLeadsCSV, scrapeLog,
  exportScrapeLog, allHistoryLogs, exportAllLogs,
  generatePythonScript, downloadPythonScript,
  autoStart,
  aiProvider, setAiProvider,
  orModel, setOrModel
}: ScraperTabProps) {

  const getSavedKey = (key: string) => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(`osint_${key}`) || import.meta.env[key] || '';
  };

  const hasValidKey = () => {
    const key = KEY_MAP[aiProvider];
    const saved = getSavedKey(key);
    if (!saved) return false;
    if (aiProvider === 'google-cs') {
      return !!getSavedKey(CX_KEY);
    }
    return true;
  };

  const handleKeyChange = (provider: string, value: string) => {
    const key = KEY_MAP[provider as keyof typeof KEY_MAP];
    if (value.trim()) {
      localStorage.setItem(`osint_${key}`, value.trim());
      // Auto-start if query is present and key is now valid
      if (scrapeQuery.trim()) {
        autoStart(scrapeQuery);
      }
    } else {
      localStorage.removeItem(`osint_${key}`);
    }
  };

  const handleCxChange = (value: string) => {
    if (value.trim()) {
      localStorage.setItem(`osint_${CX_KEY}`, value.trim());
    } else {
      localStorage.removeItem(`osint_${CX_KEY}`);
    }
  };

  const canStart = hasValidKey() && scrapeQuery.trim() && !scraping;

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
            <div className="flex gap-2">
              <button className="btn bg-bg1 border border-b0 text-t0" onClick={generatePythonScript}>
                <Terminal className="w-3.5 h-3.5" /> Copiar Python
              </button>
              <button className="btn bg-green-brand/20 border border-green-brand/30 text-green-brand" onClick={downloadPythonScript}>
                <Download className="w-3.5 h-3.5" /> Descargar .py
              </button>
            </div>
          </div>
        </div>

        {/* Provider selector */}
        <div className="bg-bg1/50 p-3 rounded-lg border border-b0">
          <span className="text-[10px] font-bold text-t2 uppercase tracking-widest block mb-2">AI Provider</span>

          {/* Provider buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(KEY_MAP).map(([id, key]) => {
              const saved = getSavedKey(key);
              const isActive = aiProvider === id;
              const meta = PROVIDER_LABELS[id];
              return (
                <button
                  key={id}
                  onClick={() => setAiProvider(id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all duration-150
                    ${isActive ? 'text-white' : 'bg-bg1 border-b0 text-t2 hover:text-white'}`}
                  style={isActive ? { background: `${meta.color}cc`, borderColor: meta.color, boxShadow: `0 0 10px ${meta.color}50` } : {}}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${saved ? 'bg-green-brand' : 'bg-red-brand/50'}`} />
                  {meta.label}
                  <span className={`text-[9px] px-1 py-0.5 rounded font-mono ${isActive ? 'bg-white/20' : 'bg-bg0/60 text-t2'}`}>{meta.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Key input for current provider */}
          {aiProvider !== 'google-cs' && (
            <div className="flex gap-2">
              <input
                className="inp flex-1 text-[10px] font-mono"
                placeholder={
                  aiProvider === 'gemini'     ? 'AIza... (Google AI Studio)' :
                  aiProvider === 'claude'     ? 'sk-ant-... (console.anthropic.com)' :
                  aiProvider === 'openrouter' ? 'sk-or-... (openrouter.ai)' :
                                               'nvapi-... (build.nvidia.com)'
                }
                defaultValue={getSavedKey(KEY_MAP[aiProvider as keyof typeof KEY_MAP])}
                onChange={e => handleKeyChange(aiProvider, e.target.value)}
              />
              {hasValidKey() && (
                <button
                  className="btn bg-green-brand/20 border border-green-brand/30 text-green-brand text-[10px] whitespace-nowrap"
                  onClick={() => { if (scrapeQuery.trim()) runAIScrape(scrapeQuery); }}
                  disabled={!scrapeQuery.trim() || scraping}
                >
                  ▶ Iniciar
                </button>
              )}
            </div>
          )}

          {aiProvider === 'google-cs' && (
            <div className="flex gap-2">
              <input
                className="inp flex-1 text-[10px] font-mono"
                placeholder="Google CS API Key..."
                defaultValue={getSavedKey(KEY_MAP['google-cs'])}
                onChange={e => handleKeyChange('google-cs', e.target.value)}
              />
              <input
                className="inp flex-1 text-[10px] font-mono"
                placeholder="CX ID..."
                defaultValue={getSavedKey(CX_KEY)}
                onChange={e => handleCxChange(e.target.value)}
              />
              {hasValidKey() && (
                <button
                  className="btn bg-green-brand/20 border border-green-brand/30 text-green-brand text-[10px] whitespace-nowrap"
                  onClick={() => { if (scrapeQuery.trim()) runAIScrape(scrapeQuery); }}
                  disabled={!scrapeQuery.trim() || scraping}
                >
                  ▶ Iniciar
                </button>
              )}
            </div>
          )}

          {aiProvider === 'openrouter' && (
            <div className="flex gap-2 mt-2">
              <select className="inp text-[10px] flex-1" value={orModel} onChange={e => setOrModel(e.target.value)}>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="openai/gpt-4o">GPT-4o</option>
                <option value="meta-llama/llama-3.1-405b">Llama 3.1 405B</option>
              </select>
            </div>
          )}

          {/* Info badge for providers with real web search */}
          {(aiProvider === 'gemini' || aiProvider === 'claude') && (
            <p className="text-[9px] text-green-brand mt-2 flex items-center gap-1">
              <span>✓</span>
              {aiProvider === 'gemini' ? 'Gemini 2.0 Flash — búsqueda web en vivo vía Google Search' : 'Claude claude-sonnet-4-6 — búsqueda web en vivo vía Anthropic Web Search'}
            </p>
          )}
        </div>

        <div className="space-y-4 mt-4">
          {scraperMode === "search" ? (
            <div className="flex gap-2">
              <input
                className="inp flex-1"
                placeholder="Pega un dork o describe tu búsqueda..."
                value={scrapeQuery}
                onChange={e => setScrapeQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && hasValidKey() && runAIScrape(scrapeQuery)}
              />
              <div className="flex gap-1">
                <button
                  className={`btn bg-blue-brand text-white px-6 h-full ${scraping ? "animate-pulse opacity-50" : ""}`}
                  onClick={() => runAIScrape(scrapeQuery)}
                  disabled={scraping || !hasValidKey()}
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
                <div className="flex gap-4">
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

          {scrapeResults.length === 0 && !scraping && (
            <div className="h-full flex items-center justify-center border border-dashed border-b0 rounded-xl text-t2 text-xs italic text-center px-8">
              Nada que mostrar. Inicia un scrape para ver resultados o usa los dorks de las otras pestañas.
            </div>
          )}

          <div className="flex-1 space-y-3">
            {sortedAndFilteredLeads.map((lead, idx) => (
              <LeadCard key={idx} lead={lead} />
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
    </div>
  );
}
