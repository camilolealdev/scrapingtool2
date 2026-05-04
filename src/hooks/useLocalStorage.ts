import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try { return JSON.parse(window.localStorage.getItem(key) || ''); } catch { return initialValue; }
  });
  useEffect(() => { try { window.localStorage.setItem(key, JSON.stringify(storedValue)); } catch {} }, [key, storedValue]);
  return [storedValue, setStoredValue];
}
