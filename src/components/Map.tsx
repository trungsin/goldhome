"use client";
import dynamic from "next/dynamic";
import type { MapPoint } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="grid h-full min-h-64 place-items-center rounded-2xl bg-ink-100 text-sm text-ink-400">Đang tải bản đồ…</div> });

export type { MapPoint };
export function Map(props: { points: MapPoint[]; center: [number, number]; zoom?: number; height?: number | string }) {
  return <MapView {...props} />;
}
