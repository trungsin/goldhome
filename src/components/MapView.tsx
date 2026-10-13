"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from "react-leaflet";

export type MapPoint = { id: string; lat: number; lng: number; label: string; sub?: string; href?: string; kind: "listing" | "infra" | "project"; radiusKm?: number };

const COLORS = { listing: "#d4961f", infra: "#2563eb", project: "#111827" } as const;

export default function MapView({ points, center, zoom = 12, height = 420 }: { points: MapPoint[]; center: [number, number]; zoom?: number; height?: number | string }) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height, width: "100%", borderRadius: 16, zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p) => (
        <span key={p.id}>
          {p.kind === "infra" && p.radiusKm && (
            <Circle center={[p.lat, p.lng]} radius={p.radiusKm * 1000} pathOptions={{ color: COLORS.infra, weight: 1, fillOpacity: 0.06 }} />
          )}
          <CircleMarker center={[p.lat, p.lng]} radius={p.kind === "listing" ? 7 : 9} pathOptions={{ color: "#fff", weight: 2, fillColor: COLORS[p.kind], fillOpacity: 1 }}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{p.label}</strong>
                {p.sub && <div style={{ color: "#3e4c63", marginTop: 2 }}>{p.sub}</div>}
                {p.href && <a href={p.href} style={{ color: "#b77418", fontWeight: 600, display: "inline-block", marginTop: 4 }}>Xem chi tiết →</a>}
              </div>
            </Popup>
          </CircleMarker>
        </span>
      ))}
    </MapContainer>
  );
}
