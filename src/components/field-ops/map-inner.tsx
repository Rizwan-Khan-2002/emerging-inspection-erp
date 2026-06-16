"use client";

import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Use CDN marker images (avoids bundler path issues) + brand-orange pin.
const pin = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#ff7a00;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -22],
});

export type Site = {
  id: string;
  ref: string;
  title: string;
  client: string;
  lat: number;
  lng: number;
};

export default function MapInner({ sites }: { sites: Site[] }) {
  const center: [number, number] = sites.length
    ? [sites[0].lat, sites[0].lng]
    : [27.0, 49.66]; // Jubail Industrial City default

  return (
    <MapContainer
      center={center}
      zoom={sites.length ? 9 : 7}
      scrollWheelZoom
      style={{ height: "100%", width: "100%", borderRadius: 12, background: "#0a2033" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {sites.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={pin}>
          <Popup>
            <strong>{s.title}</strong><br />
            {s.ref}<br />
            {s.client}
          </Popup>
        </Marker>
      ))}
      {sites.map((s) => (
        <CircleMarker key={`c-${s.id}`} center={[s.lat, s.lng]} radius={16}
          pathOptions={{ color: "#ff7a00", fillColor: "#ff7a00", fillOpacity: 0.08, weight: 1 }} />
      ))}
    </MapContainer>
  );
}
