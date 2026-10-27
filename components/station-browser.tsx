"use client";

import { FavoriteButton } from "@/components/favorite-button";
import { StationMap } from "@/components/station-map";
import type { Station } from "@/lib/divvy/types";
import { useEffect, useMemo, useState } from "react";

const POLL_INTERVAL_MS = 30_000;
const CHICAGO_CENTER: [number, number] = [41.8781, -87.6298];

export function StationBrowser({
  initialStations,
  favoriteStationIds,
}: {
  initialStations: Station[];
  favoriteStationIds: string[];
}) {
  const [stations, setStations] = useState(initialStations);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");
  const favoriteSet = useMemo(
    () => new Set(favoriteStationIds),
    [favoriteStationIds],
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/stations");
        if (!res.ok) return;
        const body = (await res.json()) as { stations: Station[] };
        setStations(body.stations);
      } catch {
        // keep showing the last known data if a poll fails
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const filteredStations = useMemo(() => {
    if (!query.trim()) return stations;
    const q = query.toLowerCase();
    return stations.filter((station) => station.name.toLowerCase().includes(q));
  }, [stations, query]);

  const limitedStations = filteredStations.slice(0, 50);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor="station-search" className="sr-only">
          Search stations by name
        </label>
        <input
          id="station-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stations by name…"
          className="w-full rounded border border-divvy-blue/30 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-divvy-blue"
        />
      </div>

      <div className="flex gap-2" role="group" aria-label="Choose view">
        {(["list", "map"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={view === option}
            onClick={() => setView(option)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-divvy-blue ${
              view === option
                ? "border-divvy-blue bg-divvy-blue text-white"
                : "border-divvy-blue/30 text-divvy-blue"
            }`}
          >
            {option === "list" ? "List" : "Map"}
          </button>
        ))}
      </div>

      {view === "map" ? (
        <StationMap
          stations={limitedStations}
          center={
            limitedStations.length > 0
              ? [limitedStations[0].lat, limitedStations[0].lon]
              : CHICAGO_CENTER
          }
          zoom={12}
          heightClassName="h-[28rem]"
        />
      ) : (
        <ul className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
          {limitedStations.map((station) => (
            <li
              key={station.stationId}
              className="rounded border border-divvy-blue/15 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{station.name}</span>
                <FavoriteButton
                  stationId={station.stationId}
                  stationName={station.name}
                  isFavorited={favoriteSet.has(station.stationId)}
                />
              </div>
              <div className="mt-1 text-[#0a1f3d]/60">
                {station.isRenting ? (
                  <>
                    {station.bikesAvailable} bikes ({station.ebikesAvailable}{" "}
                    e-bike{station.ebikesAvailable === 1 ? "" : "s"}) ·{" "}
                    {station.docksAvailable} docks open
                  </>
                ) : (
                  "Not currently renting"
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
