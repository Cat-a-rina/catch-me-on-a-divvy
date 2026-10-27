import { NearestStationCard } from "@/components/nearest-station-card";
import { getStations } from "@/lib/divvy/gbfs";
import { getFavoriteStations } from "@/lib/supabase/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user?.publicMetadata.onboarded) {
    redirect("/onboarding");
  }

  const [stations, favorites] = await Promise.all([
    getStations(),
    getFavoriteStations(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <p className="font-heading text-sm font-semibold uppercase tracking-widest text-divvy-blue">
        Welcome back{user.firstName ? `, ${user.firstName}` : ""}
      </p>

      <NearestStationCard
        stations={stations}
        favoriteStationIds={favorites.map((f) => f.station_id)}
      />
    </div>
  );
}
