import React from 'react';
import { Terminal, Database, Bot, MapPin, Download, Star, Clock } from "lucide-react";

interface TabBarProps {
  tab: string;
  setTab: (v: string) => void;
  scrapeResultsCount: number;
  bulkDorksCount: number;
}

export function TabBar({ tab, setTab, scrapeResultsCount, bulkDorksCount }: TabBarProps) {
  const tabs = [
    { id: "builder", i: <Terminal className="w-4 h-4" />, l: "Constructor" },
    { id: "templates", i: <Database className="w-4 h-4" />, l: "Dorks" },
    { id: "scraper", i: <Bot className="w-4 h-4" />, l: `Scraper (${scrapeResultsCount})` },
    { id: "map", i: <MapPin className="w-4 h-4" />, l: "Mapa" },
    { id: "bulk", i: <Download className="w-4 h-4" />, l: `Bulk (${bulkDorksCount})` },
    { id: "favorites", i: <Star className="w-4 h-4" />, l: "Favoritos" },
    { id: "history", i: <Clock className="w-4 h-4" />, l: "Historial" },
  ];

  return (
    <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`btn border border-b0 bg-bg1 text-t2 hover:border-b1 hover:text-t0 whitespace-nowrap ${tab === t.id ? "!bg-bg3 !border-blue-brand !text-t0 shadow-[0_0_10px_rgba(66,133,244,0.1)]" : ""}`}
          onClick={() => setTab(t.id)}
        >
          {t.i} {t.l}
        </button>
      ))}
    </div>
  );
}
