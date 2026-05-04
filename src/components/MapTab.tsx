import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import { ScrapeResult, MapParams } from '../types';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to center map
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface MapTabProps {
  scrapeResults: ScrapeResult[];
  mapParams: MapParams;
  setMapParams: (v: MapParams) => void;
}

export function MapTab({ scrapeResults, mapParams, setMapParams }: MapTabProps) {
  const positionedLeads = scrapeResults.filter(l => l.lat && l.lng);
  return (
    <div>
      <div className="mb-4 flex justify-between items-center bg-bgc border border-b0 p-3 rounded-xl">
        <div className="text-[10px] font-bold text-t2 uppercase tracking-widest">
          Visualización de Leads ({positionedLeads.length} posicionados)
        </div>
        <div className="text-[9px] text-t2 italic">Usa el scraper para poblar el mapa</div>
      </div>
      <MapContainer center={mapParams.center} zoom={mapParams.zoom} style={{ height: "600px", width: "100%" }}>
        <ChangeView center={mapParams.center} zoom={mapParams.zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {positionedLeads.map((lead, idx) => (
          <Marker key={idx} position={[lead.lat!, lead.lng!]}>
            <Popup>
              <div className="font-sans">
                <h4 className="font-bold text-xs mb-1">{lead.name}</h4>
                <p className="text-[10px] mb-1">{lead.address}</p>
                <div className="flex gap-2 text-[9px] font-bold">
                  {lead.phone && <span className="text-green-600">{lead.phone}</span>}
                  {lead.website && <a href={lead.website} target="_blank" className="text-blue-600">Web</a>}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
