import React from 'react';
import { Copy, ExternalLink, Star } from "lucide-react";
import { DorkOp, SortConfig } from '../types';

interface BuilderTabProps {
  OPERATORS: Record<string, DorkOp[]>;
  selectedOps: string[];
  toggleOperator: (id: string) => void;
  custom: string;
  setCustom: (v: string) => void;
  builtQuery: string;
  renderHighlightedQuery: (q: string) => React.ReactNode;
  favorites: string[];
  toggleFavorite: (q: string) => void;
  copyToClipboard: (t: string) => void;
  openSearch: (query: string, engine?: string) => void;
  setScrapeQuery: (v: string) => void;
  setTab: (v: string) => void;
}

export function BuilderTab({
  OPERATORS, selectedOps, toggleOperator, custom, setCustom,
  builtQuery, renderHighlightedQuery, favorites, toggleFavorite,
  copyToClipboard, openSearch, setScrapeQuery, setTab
}: BuilderTabProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="pnl">
        <div className="flex items-center gap-2 mb-4 text-[9px] font-mono tracking-widest text-t2 uppercase"><div className="w-1 h-1 rounded-full bg-blue-brand" /> Operadores Google</div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {OPERATORS.google.map(op => (
            <button
              key={op.id}
               className={`px-3 py-2 rounded-md border border-b0 bg-bg1 font-mono text-[10px] transition-all hover:border-blue-brand hover:text-cyan-brand flex flex-col items-center gap-1 ${selectedOps.includes(op.id) ? "border-blue-brand text-cyan-brand bg-bg3" : "text-t2"} ${op.status === "deprecated" ? "opacity-50 line-through" : ""}`}
               onClick={() => toggleOperator(op.id)}
               title={`${op.desc}${op.status === "deprecated" ? " — ⚠️ DEPRECATED" : ""}`}
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
            <button className="btn border border-blue-brand/50 bg-bg1 text-t0 hover:bg-bg2 flex-1 justify-center" onClick={() => openSearch(builtQuery, "google", true)}>Google</button>
            <button className="btn border border-b0 bg-bg1 text-t0 hover:bg-bg2" onClick={() => openSearch(builtQuery, "yandex")}>Yandex</button>
            <button className="btn border border-b0 bg-bg1 text-t0 hover:bg-bg2" onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(builtQuery)}`, "_blank")}>Maps</button>
            <button className="btn bg-blue-brand text-white hover:opacity-90 px-6" onClick={() => { setScrapeQuery(builtQuery); setTab("scraper"); }}>Scrape</button>
          </div>
        )}
      </div>
    </div>
  );
}
