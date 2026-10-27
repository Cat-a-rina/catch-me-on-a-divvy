"use client";

import type { Station } from "@/lib/divvy/types";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const CYCLOSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Tiles: <a href="https://www.cyclosm.org">CyclOSM</a>';

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px ${color};"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const stationMarkerIcon = pinIcon("#0057a3");
const userMarkerIcon = pinIcon("#2f7d4f");

export function StationMapInner({
  stations,
  userLocation,
  center,
  zoom = 14,
}: {
  stations: Station[];
  userLocation?: { lat: number; lon: number } | null;
  center: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution={CYCLOSM_ATTRIBUTION}
        url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
        subdomains={["a", "b", "c"]}
      />
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lon]}
          icon={userMarkerIcon}
        >
          <Popup>Your location</Popup>
        </Marker>
      )}
      {stations.map((station) => (
        <Marker
          key={station.stationId}
          position={[station.lat, station.lon]}
          icon={stationMarkerIcon}
        >
          <Popup>
            <strong>{station.name}</strong>
            <br />
            {station.isRenting
              ? `${station.bikesAvailable} bikes · ${station.docksAvailable} docks open`
              : "Not currently renting"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
