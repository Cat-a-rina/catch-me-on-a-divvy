"use client";

import type { Station } from "@/lib/divvy/types";
import dynamic from "next/dynamic";

const StationMapInner = dynamic(
  () => import("./station-map-inner").then((mod) => mod.StationMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-[#0a1f3d]/50">
        Loading map…
      </div>
    ),
  },
);

export function StationMap({
  stations,
  userLocation,
  center,
  zoom,
  heightClassName = "h-64",
}: {
  stations: Station[];
  userLocation?: { lat: number; lon: number } | null;
  center: [number, number];
  zoom?: number;
  heightClassName?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Map of Divvy station locations. The station list on this page covers the same information and is fully keyboard accessible."
      className={`${heightClassName} w-full overflow-hidden rounded-lg border border-divvy-blue/20`}
    >
      <StationMapInner
        stations={stations}
        userLocation={userLocation}
        center={center}
        zoom={zoom}
      />
    </div>
  );
}
