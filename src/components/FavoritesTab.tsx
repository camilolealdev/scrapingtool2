import React from 'react';
import { Copy, Search, Trash2, Star } from "lucide-react";

interface FavoritesTabProps {
  favorites: string[];
  copyToClipboard: (t: string) => void;
  openSearch: (query: string, engine?: string) => void;
  toggleFavorite: (q: string) => void;
}

export function FavoritesTab({ favorites, copyToClipboard, openSearch, toggleFavorite }: FavoritesTabProps) {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-20 text-t2 text-xs italic">Aún no tienes favoritos. Marca dorks con el icono de estrella.</div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-3">
      {favorites.map((q, idx) => (
        <div key={idx} className="pnl !py-3 flex items-center justify-between group">
          <div className="font-mono text-[10px] text-cyan-brand truncate flex-1 mr-4">{q}</div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
            <button className="btn bg-bg1 border border-b0 p-1.5" onClick={() => copyToClipboard(q)}><Copy className="w-3.5 h-3.5" /></button>
             <button className="btn bg-blue-brand text-white p-1.5" onClick={() => openSearch(q, "google", true)}><Search className="w-3.5 h-3.5" /></button>
            <button className="btn bg-red-brand/10 text-red-brand p-1.5 border border-red-brand/20" onClick={() => toggleFavorite(q)}><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
