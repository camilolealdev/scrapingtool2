import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="hd text-center mb-8 border-b border-b0 pb-6">
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
