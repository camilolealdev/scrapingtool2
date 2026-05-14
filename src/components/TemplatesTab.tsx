import React from 'react';
import { Search, Filter, Star, ExternalLink, Copy } from "lucide-react";
import { CategoryTemplate, Template } from '../types';

interface TemplatesTabProps {
  TEMPLATES: Record<string, CategoryTemplate>;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  dorkSearch: string;
  setDorkSearch: (v: string) => void;
  dorkOpFilter: string;
  setDorkOpFilter: (v: string) => void;
  filteredDorks: Template[];
  fillTemplate: (q: string) => string;
  renderHighlightedQuery: (q: string) => React.ReactNode;
  favorites: string[];
  toggleFavorite: (q: string) => void;
  openSearch: (query: string, engine?: string) => void;
  setScrapeQuery: (v: string) => void;
  setTab: (v: string) => void;
}

export function TemplatesTab({
  TEMPLATES, activeCategory, setActiveCategory, dorkSearch, setDorkSearch,
  dorkOpFilter, setDorkOpFilter, filteredDorks, fillTemplate,
  renderHighlightedQuery, favorites, toggleFavorite, openSearch,
  setScrapeQuery, setTab
}: TemplatesTabProps) {
  return (
    <div>
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TEMPLATES).map(([k, c]) => {
            const isActive = activeCategory === k;
            return (
              <button
                key={k}
                onClick={() => setActiveCategory(k)}
                className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border text-[10px] font-semibold tracking-wide transition-all duration-150 whitespace-nowrap
                  ${isActive ? 'text-white' : 'bg-bg1 border-b0 text-t2 hover:text-white'}`}
                style={isActive
                  ? { background: `${c.color}cc`, borderColor: c.color, boxShadow: `0 0 10px ${c.color}50` }
                  : {}}
              >
                <span className="text-[11px] leading-none">{c.icon}</span>
                {c.name}
              </button>
            );
          })}
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
            onClick={() => { setDorkSearch(""); setDorkOpFilter("all"); }}
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
                {t.proTip && <p className="text-[9px] text-green-brand mb-2 italic">💡 {t.proTip}</p>}
                <div className="tc-q mb-3 line-clamp-2">
                  {renderHighlightedQuery(filled)}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="btn bg-bg1 border border-b0 px-2 py-1 flex-1 text-[10px]" onClick={() => openSearch(filled, "google", true)}>Google</button>
                  <button className="btn bg-blue-brand/20 border border-blue-brand/30 text-blue-brand px-2 py-1 flex-1 text-[10px]" onClick={() => { setScrapeQuery(filled); setTab("scraper"); }}>Scrape</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
