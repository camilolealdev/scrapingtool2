import React from 'react';
import { Copy, ExternalLink } from "lucide-react";
import { BulkDork } from '../types';

interface BulkTabProps {
  bulkDorks: BulkDork[];
  copyToClipboard: (t: string) => void;
  openSearch: (query: string, engine?: string) => void;
  R: any;
}

export function BulkTab({ bulkDorks, copyToClipboard, openSearch, R }: BulkTabProps) {
  return (
    <div>
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
               <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => openSearch(d.query, "google", true)}><ExternalLink className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
