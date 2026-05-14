import React, { useState } from 'react';
import { Copy, ExternalLink } from "lucide-react";
import { BulkDork } from '../types';

interface BulkTabProps {
  bulkDorks: BulkDork[];
  copyToClipboard: (t: string) => void;
  openSearch: (query: string, engine?: string) => void;
  R: any;
}

const BULK_ENGINES = [
  { id: "google",          label: "Google",     color: "text-blue-400" },
  { id: "bing",            label: "Bing",        color: "text-cyan-400" },
  { id: "ddg",             label: "DDG",         color: "text-orange-400" },
  { id: "yandex",          label: "Yandex",      color: "text-red-400" },
  { id: "brave",           label: "Brave",       color: "text-orange-300" },
  { id: "mojeek",          label: "Mojeek",      color: "text-purple-400" },
  { id: "maps",            label: "Maps",        color: "text-emerald-400" },
  { id: "linkedin_people", label: "LinkedIn",    color: "text-sky-400" },
  { id: "twitter",         label: "Twitter/X",   color: "text-neutral-300" },
  { id: "youtube",         label: "YouTube",     color: "text-red-500" },
  { id: "shodan",          label: "Shodan",      color: "text-rose-400" },
  { id: "github",          label: "GitHub",      color: "text-violet-400" },
];

export function BulkTab({ bulkDorks, copyToClipboard, openSearch, R }: BulkTabProps) {
  const [bulkEngine, setBulkEngine] = useState("google");
  const [catFilter, setCatFilter] = useState("all");
  const cats = ["all", ...Array.from(new Set(bulkDorks.map(d => d.cat)))];
  const filtered = catFilter === "all" ? bulkDorks : bulkDorks.filter(d => d.cat === catFilter);

  return (
    <div>
      <div className="bg-bgc border border-b0 rounded-xl p-4 mb-4 flex flex-wrap justify-between items-center gap-3">
        <div className="text-[10px] font-bold text-t2 uppercase tracking-widest">
          {R.flag} {R.name} — {filtered.length} dorks
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Category filter */}
          <select className="inp !py-0.5 !text-[10px] !w-36" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c === "all" ? "Todas las categorías" : c}</option>)}
          </select>
          {/* Engine selector */}
          <select className="inp !py-0.5 !text-[10px] !w-32" value={bulkEngine} onChange={e => setBulkEngine(e.target.value)}>
            {BULK_ENGINES.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <button className="btn bg-bg1 border border-b0 text-t2 text-[10px]" onClick={() => copyToClipboard(filtered.map(d => `[${d.cat}] ${d.name}: ${d.query}`).join("\n"))}>
            <Copy className="w-3.5 h-3.5" /> Copiar Todo
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {filtered.map((d, i) => (
          <div key={i} className="flex items-center gap-3 bg-bg1 border border-b0 rounded-lg p-2 hover:border-b1 group">
            <span className="bg-bg3 text-[8px] font-bold px-1.5 py-0.5 rounded border border-b0 text-t2 w-20 text-center uppercase truncate">{d.cat.substring(0,12)}</span>
            <span className="text-[10px] text-t1 font-medium w-32 truncate shrink-0">{d.name}</span>
            <span className="font-mono text-[9px] text-cyan-brand truncate flex-1">{d.query}</span>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => copyToClipboard(d.query)}><Copy className="w-3.5 h-3.5" /></button>
              <button className={`p-1 ${BULK_ENGINES.find(e => e.id === bulkEngine)?.color || "text-t2"} hover:opacity-80`} onClick={() => openSearch(d.query, bulkEngine, true)} title={`Abrir en ${bulkEngine}`}><ExternalLink className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
