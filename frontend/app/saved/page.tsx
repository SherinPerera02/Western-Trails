"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ArrowRight,
  Clock,
  MapPin,
  Compass,
  Map,
  CalendarPlus,
  Check,
  X,
  Trash2,
  Star,
  ImageIcon,
} from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { usePlan } from "@/context/PlanContext";
import api, { apiError } from "@/lib/api";
import { Place } from "@/src/components/places/types";

function SavedPlacesContent() {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInPlan, addToPlan, removeFromPlan } = usePlan();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: Place[] }>("/favorites");
      setPlaces(res.data?.data || []);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (place: Place) => {
    // Optimistic removal from saved grid
    setPlaces((prev) => prev.filter((p) => p.id !== place.id));
    await toggleFavorite(place.id, place.name);
  };

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      {/* Header Banner */}
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C2E1F]">
              <Heart className="h-4 w-4 fill-current" />
              <span>Personal Bookmarks</span>
            </div>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2421]">
              Saved Places
            </h1>
            <p className="mt-1 text-sm text-[#5C645F] max-w-xl">
              All your favorite destinations around Panadura and the western coast,
              ready to visit or assemble into a day trip itinerary.
            </p>
          </div>

          {places.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-4.5 py-2.5 text-xs font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span>Open in Trip Planner</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid or Empty State */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent mb-3" />
            <p className="font-serif text-base font-semibold text-[#1E2421]">
              Loading your saved places...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#E5C1B8] bg-[#FDF5F3] p-6 text-center text-sm text-[#8C2E1F]">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchFavorites}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#8C2E1F] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#A83220]"
            >
              Try Again
            </button>
          </div>
        ) : places.length === 0 ? (
          /* Friendly Empty State */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8D2C5] bg-white/70 p-10 sm:p-16 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF5F3] text-[#8C2E1F] mb-4">
              <Heart className="h-7 w-7" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]">
              No saved places yet
            </h3>

            <p className="mt-2 text-sm text-[#5C645F] max-w-md leading-relaxed">
              Browse destinations along the western coast and tap the heart icon on any
              place to save it to your personal collection.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/places"
                className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span>Explore Places</span>
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#1E2421] hover:bg-[#F8F5EE] transition-colors"
              >
                <Map className="h-4 w-4 text-[#174D44]" />
                <span>View on Map</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#736B5E]">
                {places.length} saved place{places.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => {
                const inPlan = isInPlan(place.id);
                const rawImage = place.first_image_url || place.image_url;

                const distanceText =
                  place.distance_km !== null
                    ? `${Number(place.distance_km).toFixed(place.distance_km % 1 === 0 ? 0 : 1)} km from Panadura`
                    : "Distance not specified";

                const isFree =
                  place.entrance_fee === null || Number(place.entrance_fee) === 0;
                const feeText = isFree
                  ? "Free"
                  : `Rs. ${Number(place.entrance_fee).toLocaleString()}`;

                return (
                  <article
                    key={place.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs transition-all duration-300 hover:border-[#174D44]/30 hover:shadow-md"
                  >
                    {/* Photo Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#EAE4D7]">
                      {rawImage ? (
                        <Image
                          src={rawImage}
                          alt={place.name}
                          fill
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#5C645F]/50">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}

                      {/* Remove Button on photo */}
                      <button
                        type="button"
                        onClick={() => handleRemove(place)}
                        aria-label={`Remove ${place.name} from saved places`}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#8C2E1F] backdrop-blur-md shadow-xs transition-transform hover:scale-105 hover:bg-white"
                        title="Remove from saved places"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>

                      {/* Category Badges */}
                      {place.categories && place.categories.length > 0 && (
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#174D44] shadow-xs">
                            {place.categories[0].name}
                          </span>
                        </div>
                      )}

                      {/* Distance overlay */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-[#FBF9F4]">
                        <span className="flex items-center gap-1 font-medium drop-shadow-sm">
                          <MapPin className="h-3 w-3 text-[#EFE9DC]" />
                          <span>{distanceText}</span>
                        </span>
                        {place.average_rating !== null && place.average_rating > 0 && (
                          <span className="flex items-center gap-1 font-semibold rounded-md bg-black/45 px-1.5 py-0.5 backdrop-blur-xs text-[11px]">
                            <Star className="h-3 w-3 fill-[#E9B949] text-[#E9B949]" />
                            {place.average_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-1 flex-col p-4 justify-between">
                      <div>
                        <h2 className="font-serif text-lg font-bold text-[#1E2421] group-hover:text-[#174D44] transition-colors line-clamp-1">
                          <Link href={`/places/${place.id}`}>
                            {place.name}
                          </Link>
                        </h2>

                        {place.short_description && (
                          <p className="mt-1 text-xs text-[#5C645F] line-clamp-2 leading-relaxed">
                            {place.short_description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-xs text-[#736B5E]">
                          <span className="font-medium text-[#1E2421]">{feeText}</span>
                          {place.opening_hours && (
                            <span className="flex items-center gap-1 truncate">
                              <Clock className="h-3 w-3 text-[#174D44] shrink-0" />
                              <span className="truncate">{place.opening_hours}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions Footer: Remove, Add to plan, View details */}
                      <div className="mt-5 pt-3 border-t border-[#EAE4D7] flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(place)}
                            aria-label={`Remove ${place.name} from saved`}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5C1B8] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#8C2E1F] hover:bg-[#FDF5F3] transition-colors"
                            title="Remove from saved places"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove</span>
                          </button>

                          {/* Add to plan / In plan button */}
                          {inPlan ? (
                            <button
                              type="button"
                              onClick={() => removeFromPlan(place.id)}
                              className="group/inplan inline-flex items-center gap-1 rounded-lg border border-[#174D44] bg-[#EFE9DC] px-2.5 py-1.5 text-xs font-semibold text-[#174D44] hover:border-[#8C2E1F] hover:bg-[#FDF5F3] hover:text-[#8C2E1F] transition-colors"
                              title="Click to remove from plan"
                            >
                              <Check className="h-3 w-3 text-[#174D44] group-hover/inplan:hidden" />
                              <X className="h-3 w-3 hidden text-[#8C2E1F] group-hover/inplan:inline" />
                              <span className="group-hover/inplan:hidden">In plan</span>
                              <span className="hidden group-hover/inplan:inline">Remove</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToPlan(place.id, place.name)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1E2421] hover:border-[#174D44] hover:bg-[#F8F5EE] transition-colors"
                            >
                              <CalendarPlus className="h-3 w-3 text-[#174D44]" />
                              <span>Plan</span>
                            </button>
                          )}
                        </div>

                        {/* View details */}
                        <Link
                          href={`/places/${place.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#174D44] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#103630] transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SavedPage() {
  return (
    <RequireAuth>
      <SavedPlacesContent />
    </RequireAuth>
  );
}
