import { deleteRoute, saveRoute } from "@/app/actions/routes";
import { getStations } from "@/lib/divvy/gbfs";
import { getSavedRoutes } from "@/lib/supabase/queries";

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const [stations, savedRoutes] = await Promise.all([
    getStations(),
    getSavedRoutes(),
  ]);

  const sortedStations = [...stations].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const stationNameById = new Map(
    stations.map((station) => [station.stationId, station.name]),
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-3xl font-bold uppercase tracking-wide">
        Routes
      </h1>

      <form
        action={saveRoute}
        className="flex flex-col gap-3 rounded-lg border border-divvy-blue/20 bg-white p-5 shadow-sm"
      >
        <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-divvy-blue">
          Save a route
        </h2>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Origin station
          <select
            name="originStationId"
            required
            defaultValue={from ?? ""}
            className="rounded border border-divvy-blue/30 px-3 py-2 focus:border-divvy-blue focus:outline-none"
          >
            <option value="" disabled>
              Select a station
            </option>
            {sortedStations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Destination station
          <select
            name="destinationStationId"
            required
            defaultValue=""
            className="rounded border border-divvy-blue/30 px-3 py-2 focus:border-divvy-blue focus:outline-none"
          >
            <option value="" disabled>
              Select a station
            </option>
            {sortedStations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Label (optional)
          <input
            name="label"
            placeholder="e.g. Daily commute"
            className="rounded border border-divvy-blue/30 px-3 py-2 focus:border-divvy-blue focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="font-heading mt-2 self-start rounded-full bg-divvy-blue px-6 py-2 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-divvy-blue-dark"
        >
          Save route
        </button>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-divvy-blue">
          Saved routes
        </h2>
        {savedRoutes.length === 0 && (
          <p className="text-sm text-[#0a1f3d]/60">
            You haven&apos;t saved any routes yet.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {savedRoutes.map((route) => (
            <li
              key={route.id}
              className="flex items-center justify-between gap-3 rounded border border-divvy-blue/15 bg-white p-3 text-sm"
            >
              <div>
                {route.label && (
                  <p className="font-semibold">{route.label}</p>
                )}
                <p className="text-[#0a1f3d]/70">
                  {stationNameById.get(route.origin_station_id) ??
                    route.origin_station_id}{" "}
                  →{" "}
                  {stationNameById.get(route.destination_station_id) ??
                    route.destination_station_id}
                </p>
              </div>
              <form action={deleteRoute.bind(null, route.id)}>
                <button
                  type="submit"
                  className="font-heading text-xs font-semibold uppercase tracking-wide text-divvy-blue hover:underline"
                >
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
