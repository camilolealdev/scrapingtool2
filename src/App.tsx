import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, ExternalLink, Copy, Trash2, Star, Download, FileText, Database, MapPin, Terminal } from "lucide-react";
import { useRegion } from './hooks/useRegion';
import { useScraper } from './hooks/useScraper';
import { useHistory } from './hooks/useHistory';
import { useFavorites } from './hooks/useFavorites';
import { REGIONS, OPERATORS, fillTemplate } from './utils/dorkBuilder';
import type { SortConfig, MapParams, ScrapeResult, LogEntry, QueryResult, CategoryTemplate, Template, BulkDork } from './types';

import { Header } from './components/Header';
import { RegionSelector } from './components/RegionSelector';
import { ConfigInputs } from './components/ConfigInputs';
import { TabBar } from './components/TabBar';
import { BuilderTab } from './components/BuilderTab';
import { TemplatesTab } from './components/TemplatesTab';
import { ScraperTab } from './components/ScraperTab';
import { MapTab } from './components/MapTab';
import { BulkTab } from './components/BulkTab';
import { FavoritesTab } from './components/FavoritesTab';
import { HistoryTab } from './components/HistoryTab';
import { Toast } from './components/Toast';

export default function App() {
  const [tab, setTab] = useState("templates");
  const [custom, setCustom] = useState("");
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("gmb");
  const [dorkSearch, setDorkSearch] = useState("");
  const [dorkOpFilter, setDorkOpFilter] = useState("all");
  const [showErrors, setShowErrors] = useState(false);
  const [toast, setToast] = useState("");

  // Inputs persisted
  const [niche, setNiche] = useState(() => localStorage.getItem("osint_niche") || "");
  const [city, setCity] = useState(() => localStorage.getItem("osint_city") || "");
  const [zone, setZone] = useState(() => localStorage.getItem("osint_zone") || "");

  const { region, setRegion, R, year, TEMPLATES } = useRegion();
  const {
    scrapeQuery, setScrapeQuery, scrapeResults, scraping, scrapeLog,
    allHistoryLogs, scraperMode, setScraperMode, batchInput, setBatchInput,
    leadsSearch, setLeadsSearch, sortConfig, setSortConfig,
    geocoding, mapParams, setMapParams,
    checkInputs, addLog, searchLocation: scraperSearchLoc,
    runAIScrape, runBatchScrape, autoStart,
    exportLeadsCSV: scraperExportCSV, generatePythonScript: scraperGenPy,
    exportScrapeLog, exportAllLogs,
    sortedAndFilteredLeads
  } = useScraper(niche, city, zone, year, region, R, TEMPLATES, (m: string) => showToast(m), setShowErrors);
  const { history, setHistory, addToHistory } = useHistory();
  const { favorites, setFavorites, toggleFavorite } = useFavorites();

  // persist inputs
  useEffect(() => { localStorage.setItem("osint_niche", niche); }, [niche]);
  useEffect(() => { localStorage.setItem("osint_city", city); }, [city]);
  useEffect(() => { localStorage.setItem("osint_zone", zone); }, [zone]);
  useEffect(() => { localStorage.setItem("osint_region", region); }, [region]);

  const showToast = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const copyToClipboard = useCallback((t: string) => {
    navigator.clipboard.writeText(t).then(() => showToast("✓ Copiado"));
  }, [showToast]);

  const openSearch = useCallback((query: string, engineKey = "google", direct = false) => {
    if (!direct && !query.includes("!!!") && !checkInputs()) return;
    const googleDomain = R.google;
    const urls: Record<string, string> = {
      google: `https://www.${googleDomain}/search?q=`,
      bing: `https://www.bing.com/search?cc=${R.bing_loc}&q=`,
      ddg: `https://duckduckgo.com/?kl=${R.ddg_region}&q=`,
      yandex: `https://yandex.com/search/?text=`,
      maps: `https://www.${googleDomain}/maps/search/`,
    };
    window.open(urls[engineKey] + encodeURIComponent(query), "_blank");
    setHistory(prev => [{
      query, engine: engineKey,
      time: new Date().toLocaleTimeString(),
      ts: Date.now(),
      flag: R.flag
    }, ...prev.slice(0, 49)]);
  }, [R, checkInputs]);

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

  const filteredDorks = useMemo(() => {
    const dorks = TEMPLATES[activeCategory].templates;
    return dorks.filter((t: Template) => {
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

  const bulkDorks = useMemo(() => {
    if (!niche.trim() || !city.trim() || !zone.trim()) return [];
    const all: BulkDork[] = [];
    for (const cat of Object.values(TEMPLATES)) {
      for (const t of cat.templates) {
        const q = fillTemplate(t.query, niche, city, zone, year, showErrors);
        all.push({ cat: cat.name, name: t.name, query: q });
      }
    }
    return all;
  }, [TEMPLATES, niche, city, zone, year, showErrors]);

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
        <Header />

        <RegionSelector
          region={region} setRegion={setRegion}
          setActiveCategory={setActiveCategory}
          REGIONS={REGIONS}
        />

        <ConfigInputs
          niche={niche} setNiche={setNiche}
          city={city} setCity={setCity}
          zone={zone} setZone={setZone}
          showErrors={showErrors}
          geocoding={geocoding}
          searchLocation={(q) => { if (!q.trim()) return; scraperSearchLoc(q); }}
        />

        <TabBar tab={tab} setTab={setTab}
          scrapeResultsCount={scrapeResults.length}
          bulkDorksCount={bulkDorks.length}
        />

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {tab === "builder" && (
              <motion.div key="builder" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid md:grid-cols-2 gap-4">
                <BuilderTab
                  OPERATORS={OPERATORS} selectedOps={selectedOps}
                  toggleOperator={toggleOperator} custom={custom}
                  setCustom={setCustom} builtQuery={builtQuery}
                  renderHighlightedQuery={renderHighlightedQuery}
                  favorites={favorites} toggleFavorite={toggleFavorite}
                  copyToClipboard={copyToClipboard}
                  openSearch={openSearch} setScrapeQuery={setScrapeQuery}
                  setTab={setTab}
                />
              </motion.div>
            )}

            {tab === "templates" && (
              <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <TemplatesTab
                  TEMPLATES={TEMPLATES} activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  dorkSearch={dorkSearch} setDorkSearch={setDorkSearch}
                  dorkOpFilter={dorkOpFilter} setDorkOpFilter={setDorkOpFilter}
                  filteredDorks={filteredDorks}
                  fillTemplate={(q) => fillTemplate(q, niche, city, zone, year, showErrors)}
                  renderHighlightedQuery={renderHighlightedQuery}
                  favorites={favorites} toggleFavorite={toggleFavorite}
                  openSearch={openSearch}
                  setScrapeQuery={setScrapeQuery} setTab={setTab}
                />
              </motion.div>
            )}

            {tab === "scraper" && (
              <motion.div key="scraper" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <ScraperTab
                  scraping={scraping} scraperMode={scraperMode}
                  setScraperMode={setScraperMode} scrapeQuery={scrapeQuery}
                  setScrapeQuery={setScrapeQuery}
                  runAIScrape={runAIScrape} batchInput={batchInput}
                  setBatchInput={setBatchInput} runBatchScrape={runBatchScrape}
                  scrapeResults={scrapeResults} leadsSearch={leadsSearch}
                  setLeadsSearch={setLeadsSearch} sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                  sortedAndFilteredLeads={sortedAndFilteredLeads}
                  setTab={setTab} exportLeadsCSV={scraperExportCSV}
                  scrapeLog={scrapeLog} exportScrapeLog={exportScrapeLog}
                  allHistoryLogs={allHistoryLogs} exportAllLogs={exportAllLogs}
                  generatePythonScript={() => scraperGenPy(TEMPLATES, niche, city, zone, year)}
                  autoStart={autoStart}
                  aiProvider={aiProvider} setAiProvider={setAiProvider}
                  orModel={orModel} setOrModel={setOrModel}
                />
              </motion.div>
            )}

            {tab === "map" && (
              <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-[600px] w-full">
                <MapTab scrapeResults={scrapeResults} mapParams={mapParams} setMapParams={setMapParams} />
              </motion.div>
            )}

            {tab === "bulk" && (
              <motion.div key="bulk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <BulkTab bulkDorks={bulkDorks} copyToClipboard={copyToClipboard}
                  openSearch={openSearch} R={R} />
              </motion.div>
            )}

            {tab === "favorites" && (
              <motion.div key="favorites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <FavoritesTab favorites={favorites} copyToClipboard={copyToClipboard}
                  openSearch={openSearch} toggleFavorite={toggleFavorite} />
              </motion.div>
            )}

            {tab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <HistoryTab history={history} openSearch={openSearch} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="mt-12 pt-8 border-t border-b0 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-[10px] text-t2"><Search className="w-3 h-3" /> Russell Optimized</div>
            <div className="flex items-center gap-2 text-[10px] text-t2"><Database className="w-3 h-3" /> Export Ready</div>
          </div>
          <p className="text-[9px] font-mono text-t2 opacity-50 uppercase tracking-[2px]">Use responsibly. Powered by Google AI Studio.</p>
        </footer>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
