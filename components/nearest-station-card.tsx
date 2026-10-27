"use client";

import { FavoriteButton } from "@/components/favorite-button";
import { StationMap } from "@/components/station-map";
import { distanceMeters } from "@/lib/divvy/distance";
import type { Station } from "@/lib/divvy/types";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function NearestStationCard({
  stations,
  favoriteStationIds,
}: {
  stations: Station[];
  favoriteStationIds: string[];
}) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const favoriteSet = useMemo(
    () => new Set(favoriteStationIds),
    [favoriteStationIds],
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      queueMicrotask(() =>
        setLocationError("Geolocation isn't supported by this browser."),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => setLocationError("Location access was denied."),
    );
  }, []);

  const nearest = useMemo(() => {
    if (!coords || stations.length === 0) return null;
    return stations.reduce<{ station: Station; distance: number } | null>(
      (closest, station) => {
        const distance = distanceMeters(coords, station);
        if (!closest || distance < closest.distance) {
          return { station, distance };
        }
        return closest;
      },
      null,
    );
  }, [coords, stations]);

  return (
    <section className="rounded-lg border border-divvy-blue/20 bg-white p-5 shadow-sm">
      <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-divvy-blue">
        Nearest station
      </h2>

      <div aria-live="polite">
        {!coords && !locationError && (
          <p className="mt-2 text-sm text-[#0a1f3d]/60">
            Finding your location…
          </p>
        )}
        {locationError && (
          <p className="mt-2 text-sm text-[#0a1f3d]/60">{locationError}</p>
        )}
      </div>

      {nearest && (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{nearest.station.name}</p>
              <p className="text-sm text-[#0a1f3d]/60">
                {(nearest.distance / 1000).toFixed(2)} km away
              </p>
            </div>
            <FavoriteButton
              stationId={nearest.station.stationId}
              stationName={nearest.station.name}
              isFavorited={favoriteSet.has(nearest.station.stationId)}
            />
          </div>

          <StationMap
            stations={[nearest.station]}
            userLocation={coords}
            center={[nearest.station.lat, nearest.station.lon]}
          />

          <p className="flex items-center gap-1.5 text-sm">
            {nearest.station.isRenting ? (
              <>
                <Leaf
                  aria-hidden="true"
                  size={15}
                  className="text-divvy-green"
                />
                {nearest.station.bikesAvailable} bikes (
                {nearest.station.ebikesAvailable} e-bike
                {nearest.station.ebikesAvailable === 1 ? "" : "s"}) ·{" "}
                {nearest.station.docksAvailable} docks open
              </>
            ) : (
              "Not currently renting"
            )}
          </p>

          <Link
            href={`/routes?from=${encodeURIComponent(nearest.station.stationId)}`}
            className="self-start font-heading text-sm font-semibold uppercase tracking-wide text-divvy-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-divvy-blue"
          >
            Plan a route from here →
          </Link>
        </div>
      )}
    </section>
  );
}
