import React from 'react';
import { ExternalLink } from "lucide-react";
import { QueryResult } from '../types';

interface HistoryTabProps {
  history: QueryResult[];
  openSearch: (query: string, engine?: string) => void;
}

export function HistoryTab({ history, openSearch }: HistoryTabProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-20 text-t2 text-xs italic">El historial de búsquedas aparecerá aquí.</div>
    );
  }

  return (
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
           <button className="p-1 text-t2 hover:text-blue-brand" onClick={() => openSearch(h.query, h.engine, true)}><ExternalLink className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
