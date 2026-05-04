import { useState, useCallback, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('osint_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('osint_favorites', JSON.stringify(favorites)); }
    catch {}
  }, [favorites]);

  const toggleFavorite = useCallback((q: string) => {
    setFavorites(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  }, []);

  return { favorites, setFavorites, toggleFavorite };
}
