import { Navigation } from "lucide-react";

interface Props {
  niche: string;
  setNiche: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  zone: string;
  setZone: (v: string) => void;
  showErrors: boolean;
  geocoding: boolean;
  searchLocation: (q: string) => void;
}

export function ConfigInputs({ niche, setNiche, city, setCity, zone, setZone, showErrors, geocoding, searchLocation }: Props) {
  return (
    <div className="bg-bgc border border-b0 rounded-xl p-3.5 flex flex-wrap gap-3 items-end mb-6">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="niche-input" className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Nicho / Palabra Clave</label>
        <input id="niche-input" name="niche" className={`inp ${showErrors && !niche.trim() ? "border-red-brand bg-red-brand/5" : ""}`}
          placeholder="ej: odontologia, restaurante..." value={niche} onChange={e => setNiche(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="city-input" className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Ciudad/Referencia</label>
        <div className="relative group">
          <input id="city-input" name="city" className={`inp pr-10 ${showErrors && !city.trim() ? "border-red-brand bg-red-brand/5" : ""}`}
            placeholder="ej: bogota, CC Andino..." value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onGeocode(city)} />
          <button className={`absolute right-2 top-1/2 -translate-y-1/2 text-t2 hover:text-blue-brand transition-colors ${geocoding ? "animate-spin" : ""}`}
            onClick={() => onGeocode(city)} title="Geocodificar">
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="w-32">
        <label htmlFor="zone-input" className="text-[9px] font-bold text-t2 uppercase tracking-widest block mb-1">Zona</label>
        <input id="zone-input" name="zone" className={`inp ${showErrors && !zone.trim() ? "border-red-brand bg-red-brand/5" : ""}`}
          placeholder="ej: norte..." value={zone} onChange={e => setZone(e.target.value)} />
      </div>
    </div>
  );
}
