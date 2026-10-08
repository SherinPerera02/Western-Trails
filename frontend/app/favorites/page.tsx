"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Compass } from "lucide-react";
import DestinationCard from "@/components/landing/DestinationCard";
import Footer from "@/components/home/Footer";
import { POPULAR_DESTINATIONS, Destination } from "@/data/travelData";
import { useAuth } from "@/context/AuthContext";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favoriteList, setFavoriteList] = useState<Destination[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wt_favorites");
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const matches = POPULAR_DESTINATIONS.filter((d) => ids.includes(d.id));
        setFavoriteList(matches);
      } else {
        // Default sample if empty for nice preview
        setFavoriteList([POPULAR_DESTINATIONS[0], POPULAR_DESTINATIONS[1]]);
      }
    } catch {
      setFavoriteList([POPULAR_DESTINATIONS[0]]);
    } finally {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      <div className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#174D44] hover:text-[#103630] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C2E1F]">
            <Heart className="h-4 w-4 fill-current" />
            <span>Saved Places</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E2421]">
            Your Favorite Destinations
          </h1>
          <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
            {user
              ? `Welcome ${user.name}. Here are the places you have bookmarked for your upcoming journeys.`
              : "Saved places in your personal collection. Sign in to sync across your devices."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
        {favoriteList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#D8D2C5] bg-white p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-[#D8D2C5]" />
            <h3 className="mt-4 font-serif text-2xl font-bold text-[#1E2421]">
              No saved favorites yet
            </h3>
            <p className="mt-2 text-sm text-[#5C645F] max-w-md mx-auto">
              Browse destinations and click the heart icon on any place to save it for your next trip.
            </p>
            <Link
              href="/destinations"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-6 py-3 text-sm font-semibold text-[#FBF9F4] hover:bg-[#103630]"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Destinations</span>
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-[#5C645F]">
                {favoriteList.length} saved place{favoriteList.length > 1 ? "s" : ""}
              </span>
              <Link
                href="/planner"
                className="text-xs font-semibold text-[#174D44] underline-offset-4 hover:underline"
              >
                Plan a Day with These Stops →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
              {favoriteList.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
