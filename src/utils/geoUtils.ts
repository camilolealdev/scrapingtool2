import { MapParams } from '../types';

export async function searchLocation(
  q: string,
  setGeocoding: (v: boolean) => void,
  setCity: (v: string) => void,
  setZone: (v: string) => void,
  setMapParams: (v: MapParams) => void,
  showToast: (m: string) => void
) {
  if (!q.trim()) return;
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
      showToast("❌ No se encontró la ubicación");
    }
  } catch (e) {
    showToast("❌ Error en geocodificación");
  } finally {
    setGeocoding(false);
  }
}
