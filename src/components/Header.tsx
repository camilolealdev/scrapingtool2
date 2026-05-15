import { useState, useEffect } from 'react';
import { Zap, Sun, Moon } from "lucide-react";

function applyTheme(light: boolean) {
  document.documentElement.classList.toggle('light', light);
}

export function Header() {
  const [isLight, setIsLight] = useState(() => {
    const saved = localStorage.getItem('osint_theme');
    const light = saved === 'light';
    applyTheme(light);
    return light;
  });

  useEffect(() => {
    applyTheme(isLight);
    localStorage.setItem('osint_theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  return (
    <header className="hd text-center mb-8 border-b border-b0 pb-6 relative">
      <button
        onClick={() => setIsLight(v => !v)}
        className="absolute right-0 top-0 btn bg-bg1 border border-b0 text-t2 hover:text-t0 hover:border-b1 transition-all px-3 py-2"
        title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
      <div className="badge">
        <Zap className="w-3 h-3 fill-cyan-brand" /> OSINT LEAD FINDER v5
      </div>
      <h1>Google Dorking Lab</h1>
      <p className="text-t1 text-sm max-w-2xl mx-auto">
        Explora leads ocultos en diversas regiones usando operadores avanzados de búsqueda.
        Optimizado para prospección B2B y recolección de datos públicos.
      </p>
    </header>
  );
}
