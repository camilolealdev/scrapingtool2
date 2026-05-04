import { useState, useCallback } from 'react';

export function useGeocoding(showToast: (msg: string) => void) {
  const [geocoding, setGeocoding] = useState(false);
  const [mapParams, setMapParams] = useState({ center: [4.5709, -74.2973] as [number, number], zoom: 6 });
  const [city, setCity] = useState(() => localStorage.getItem("osint_city") || "");
  const [zone, setZone] = useState(() => localStorage.getItem("osint_zone") || "");

  useEffect(() => { localStorage.setItem("osint_city", city); }, [city]);
  useEffect(() => { localStorage.setItem("osint_zone", zone); }, [zone]);

  const searchLocation = useCallback(async (q: string) => {
    if (!q.trim() || geocoding) return;
    setGeocoding(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
      const data = await resp.json();
      if (data && data[0]) {
        const { display_name, lat, lon } = data[0];
        const parts = display_name.split(", ");
        setCity(parts[0] || "");
        setZone(parts[1] || "");
        setMapParams({ center: [parseFloat(lat), parseFloat(lon)], zoom: 12 });
        showToast(`📍 Ubicación: ${parts[0]}`);
      } else {
        showToast("❌ No se encontró");
      }
    } catch {
      showToast("❌ Error geocodificación");
    } finally {
      setGeocoding(false);
    }
  }, [geocoding, showToast]);

  return { geocoding, mapParams, setMapParams, city, setCity, zone, setZone, searchLocation };
}
