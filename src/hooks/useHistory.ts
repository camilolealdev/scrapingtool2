import { useState, useEffect, useCallback } from 'react';
import { QueryResult } from '../types';

export function useHistory() {
  const [history, setHistory] = useState<QueryResult[]>(() => {
    try {
      const saved = localStorage.getItem('osint_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('osint_history', JSON.stringify(history.slice(0, 50))); }
    catch {}
  }, [history]);

  const addToHistory = useCallback((entry: QueryResult) => {
    setHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  return { history, setHistory, addToHistory };
}
