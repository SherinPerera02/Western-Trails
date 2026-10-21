"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Scale,
  ArrowLeft,
  MapPin,
  Ticket,
  Clock,
  Sparkles,
  Star,
  Heart,
  CalendarPlus,
  Check,
  X,
  Share2,
  Trash2,
  AlertCircle,
  Compass,
  ImageIcon,
  ArrowRight,
  Layers,
  Table as TableIcon,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import { PlaceDetail } from "@/src/components/places/types";
import { useCompare } from "@/context/CompareContext";
import { usePlan } from "@/context/PlanContext";
import { useFavorites } from "@/context/FavoritesContext";

function parseFacilities(
  facilities: string[] | string | null | undefined
): string[] {
  if (!facilities) return [];
  if (Array.isArray(facilities)) return facilities.filter(Boolean);
  if (typeof facilities === "string") {
    try {
      const parsed = JSON.parse(facilities);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {}
    return facilities
      .split(/[,\n]/)
      .map((f) => f.trim())
      .filter(Boolean);
  }
  return [];
}

function getFirstImageUrl(place: PlaceDetail): string | null {
  if (place.images && place.images.length > 0 && place.images[0]?.url) {
    return place.images[0].url;
  }
  // Check any top-level image props if present
  const anyPlace = place as unknown as { first_image_url?: string; image_url?: string };
  return anyPlace.first_image_url || anyPlace.image_url || null;
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { removeCompare, clearCompare, setSelectedPlaces } = useCompare();
  const { isInPlan, addToPlan, removeFromPlan, showToast } = usePlan();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [places, setPlaces] = useState<PlaceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disappearedNotice, setDisappearedNotice] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"stacked" | "table">("stacked");

  const idsParam = searchParams.get("ids") || "";

  // Parse IDs from query parameter
  const targetIds = useMemo(() => {
    if (!idsParam) return [];
    return Array.from(
      new Set(
        idsParam
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id) && id > 0)
      )
    ).slice(0, 3);
  }, [idsParam]);

  // Fetch places
  useEffect(() => {
    let isCancelled = false;

    async function fetchPlaces() {
      if (targetIds.length === 0) {
        setPlaces([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const results = await Promise.allSettled(
        targetIds.map(async (id) => {
          const res = await api.get<{ data: PlaceDetail }>(`/places/${id}`);
          return res.data.data;
        })
      );

      if (isCancelled) return;

      const loadedPlaces: PlaceDetail[] = [];
      const missingIds: number[] = [];

      results.forEach((result, idx) => {
        if (result.status === "fulfilled" && result.value) {
          loadedPlaces.push(result.value);
        } else {
          missingIds.push(targetIds[idx]);
        }
      });

      // Handle 404 / disappeared places
      if (missingIds.length > 0) {
        missingIds.forEach((id) => removeCompare(id));
        setDisappearedNotice(
          `Note: ${
            missingIds.length === 1
              ? `Place #${missingIds[0]}`
              : `Places #${missingIds.join(", #")}`
          } could not be found or is no longer available and was removed from this comparison.`
        );

        // Update URL to keep shareable link consistent
        const remainingIds = loadedPlaces.map((p) => p.id);
        if (remainingIds.length > 0) {
          router.replace(`/compare?ids=${remainingIds.join(",")}`);
        } else {
          router.replace("/compare");
        }
      }

      setPlaces(loadedPlaces);
      // Synchronize with CompareContext for cross-page persistence
      setSelectedPlaces(loadedPlaces.map((p) => ({ id: p.id, name: p.name })));
      setLoading(false);
    }

    fetchPlaces();

    return () => {
      isCancelled = true;
    };
  }, [targetIds, router, removeCompare, setSelectedPlaces]);

  // Handle Remove column
  const handleRemove = (placeId: number, placeName: string) => {
    const nextPlaces = places.filter((p) => p.id !== placeId);
    setPlaces(nextPlaces);
    removeCompare(placeId);
    showToast(`Removed ${placeName} from comparison`);

    const remainingIds = nextPlaces.map((p) => p.id);
    if (remainingIds.length > 0) {
      router.replace(`/compare?ids=${remainingIds.join(",")}`);
    } else {
      router.replace("/compare");
    }
  };

  // Handle Share link
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Comparison link copied to clipboard!");
      }
    } catch {
      showToast("Failed to copy link to clipboard", "error");
    }
  };

  // Accessible Highlights: Nearest
  const { minDistance, showNearestHighlight } = useMemo(() => {
    const validDistances = places
      .map((p) => p.distance_km)
      .filter((d): d is number => d !== null && d !== undefined && !isNaN(d));

    if (validDistances.length < 2) {
      return { minDistance: null, showNearestHighlight: false };
    }

    const uniqueDistances = new Set(validDistances);
    if (uniqueDistances.size <= 1) {
      return { minDistance: null, showNearestHighlight: false };
    }

    return {
      minDistance: Math.min(...validDistances),
      showNearestHighlight: true,
    };
  }, [places]);

  // Accessible Highlights: Cheapest / Free
  const { minFee, showCheapestHighlight } = useMemo(() => {
    const validFees = places
      .map((p) => {
        if (p.is_free) return 0;
        if (p.entrance_fee === null || p.entrance_fee === undefined) return null;
        return Number(p.entrance_fee);
      })
      .filter((f): f is number => f !== null && !isNaN(f));

    if (validFees.length < 2) {
      return { minFee: null, showCheapestHighlight: false };
    }

    const uniqueFees = new Set(validFees);
    if (uniqueFees.size <= 1) {
      return { minFee: null, showCheapestHighlight: false };
    }

    return {
      minFee: Math.min(...validFees),
      showCheapestHighlight: true,
    };
  }, [places]);

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      {/* Top Banner Header */}
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/places"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D44] hover:text-[#103630] mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Places</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C86446]">
              <Scale className="h-4 w-4" />
              <span>Side-by-Side Comparison</span>
            </div>

            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2421]">
              Compare Places
            </h1>

            <p className="mt-1 text-sm text-[#5C645F] max-w-2xl">
              Compare entrance fees, distances, visiting hours, and amenities to
              choose the ideal destinations for your trail.
            </p>
          </div>

          {places.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D2C5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E2421] shadow-2xs hover:bg-[#F8F5EE] transition-colors"
                title="Copy shareable comparison link"
              >
                <Share2 className="h-3.5 w-3.5 text-[#174D44]" />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={clearCompare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5C1B8] bg-white px-3.5 py-2 text-xs font-semibold text-[#8C2E1F] shadow-2xs hover:bg-[#FDF5F3] transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>

              {/* Mobile View Switcher */}
              <div className="flex sm:hidden items-center rounded-xl border border-[#D8D2C5] bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMobileView("stacked")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    mobileView === "stacked"
                      ? "bg-[#174D44] text-white"
                      : "text-[#5C645F] hover:text-[#1E2421]"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView("table")}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                    mobileView === "table"
                      ? "bg-[#174D44] text-white"
                      : "text-[#5C645F] hover:text-[#1E2421]"
                  }`}
                >
                  <TableIcon className="h-3 w-3" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Disappeared Places 404 Notice */}
      {disappearedNotice && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#E9B949]/50 bg-[#FFF7E8] p-3.5 text-xs text-[#8C6200]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="flex-1 font-medium">{disappearedNotice}</p>
            <button
              type="button"
              onClick={() => setDisappearedNotice(null)}
              className="text-[#8C6200] hover:text-black font-bold p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent mb-3" />
            <p className="font-serif text-base font-semibold text-[#1E2421]">
              Loading comparison data...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#E5C1B8] bg-[#FDF5F3] p-8 text-center text-sm text-[#8C2E1F]">
            <p>{error}</p>
            <Link
              href="/places"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#8C2E1F] px-4 py-2 text-xs font-semibold text-white"
            >
              Browse Places
            </Link>
          </div>
        ) : places.length === 0 ? (
          /* Empty State: No places chosen */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8D2C5] bg-white/70 p-12 sm:p-16 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAE4D7] text-[#174D44] mb-4">
              <Scale className="h-7 w-7" />
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]">
              No places selected for comparison
            </h3>

            <p className="mt-2 text-sm text-[#5C645F] max-w-md leading-relaxed">
              Select 2 or 3 places by ticking the <strong>Compare</strong> checkbox
              on any place card or details page to see their features side-by-side.
            </p>

            <Link
              href="/places"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Places to Compare</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* Limit or guidance reminder */}
            {places.length === 1 && (
              <div className="mb-6 rounded-2xl border border-[#D5CCBA] bg-[#EFE9DC]/60 p-4 text-xs text-[#5C645F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#174D44] shrink-0" />
                  <span>
                    You have selected <strong>1 place</strong>. Add at least 1 more
                    place (up to 3) to view a side-by-side comparison.
                  </span>
                </div>
                <Link
                  href="/places"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D44] hover:underline shrink-0"
                >
                  <span>Select another place</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Accessible Legend for subtle highlights (REQ-044) */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-[#5C645F] bg-white/70 border border-[#E8E2D5] rounded-xl px-4 py-2.5">
              <span className="font-semibold text-[#1E2421]">Highlights:</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#E8F3EE] border border-[#276B60]/30 px-2 py-0.5 font-bold text-[#174D44]">
                <MapPin className="h-3 w-3 text-[#174D44]" />
                <span>Nearest to Panadura</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#FFF7E8] border border-[#E9B949]/40 px-2 py-0.5 font-bold text-[#8C6200]">
                <Ticket className="h-3 w-3 text-[#8C6200]" />
                <span>Lowest Fee / Free</span>
              </span>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* TABLET & DESKTOP (or mobile toggle "table"): HORIZONTALLY SCROLLABLE TABLE WITH STICKY FIRST COLUMN (REQ-043, REQ-044) */}
            {/* ------------------------------------------------------------- */}
            <div
              className={`overflow-x-auto rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs ${
                mobileView === "table" ? "block" : "hidden sm:block"
              }`}
            >
              <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
                {/* Column header row (Places) */}
                <thead>
                  <tr className="border-b border-[#E8E2D5] bg-[#F7F4EC]">
                    <th
                      scope="col"
                      className="sticky left-0 z-20 w-44 bg-[#F7F4EC] p-4 text-xs font-bold uppercase tracking-wider text-[#736B5E] border-r border-[#E8E2D5]"
                    >
                      Place
                    </th>
                    {places.map((place) => {
                      const photoUrl = getFirstImageUrl(place);
                      const inPlan = isInPlan(place.id);
                      const isFav = isFavorite(place.id);

                      return (
                        <th
                          key={place.id}
                          scope="col"
                          className="w-72 p-4 align-top border-r last:border-r-0 border-[#E8E2D5]"
                        >
                          <div className="flex flex-col gap-3">
                            {/* Photo Thumbnail */}
                            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-[#EAE4D7]">
                              {photoUrl ? (
                                <Image
                                  src={photoUrl}
                                  alt={place.name}
                                  fill
                                  sizes="280px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#736B5E]">
                                  <ImageIcon className="h-8 w-8 text-[#A89F91]" />
                                </div>
                              )}

                              {/* Remove link per column (REQ-042) */}
                              <button
                                type="button"
                                onClick={() => handleRemove(place.id, place.name)}
                                aria-label={`Remove ${place.name} from comparison`}
                                className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#8C2E1F] shadow-xs hover:bg-[#FDF5F3] hover:scale-105 transition-all"
                                title="Remove from comparison"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Name & Quick Actions */}
                            <div>
                              <h2 className="font-serif text-lg font-bold text-[#1E2421] line-clamp-2">
                                <Link
                                  href={`/places/${place.id}`}
                                  className="hover:text-[#174D44] hover:underline"
                                >
                                  {place.name}
                                </Link>
                              </h2>

                              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                {/* Save toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(place.id, place.name)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2 py-1 text-xs font-medium text-[#1E2421] hover:bg-[#F8F5EE]"
                                >
                                  <Heart
                                    className={`h-3.5 w-3.5 ${
                                      isFav
                                        ? "fill-[#8C2E1F] text-[#8C2E1F]"
                                        : "text-[#5C645F]"
                                    }`}
                                  />
                                  <span>{isFav ? "Saved" : "Save"}</span>
                                </button>

                                {/* Plan toggle */}
                                {inPlan ? (
                                  <button
                                    type="button"
                                    onClick={() => removeFromPlan(place.id)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#174D44] bg-[#EFE9DC] px-2 py-1 text-xs font-semibold text-[#174D44] hover:bg-[#FDF5F3] hover:text-[#8C2E1F]"
                                  >
                                    <Check className="h-3 w-3 text-[#174D44]" />
                                    <span>In Plan</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => addToPlan(place.id, place.name)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2 py-1 text-xs font-medium text-[#1E2421] hover:border-[#174D44] hover:bg-[#F8F5EE]"
                                  >
                                    <CalendarPlus className="h-3 w-3 text-[#174D44]" />
                                    <span>Add Plan</span>
                                  </button>
                                )}

                                {/* Details link */}
                                <Link
                                  href={`/places/${place.id}`}
                                  className="inline-flex items-center gap-0.5 rounded-lg bg-[#174D44] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#103630]"
                                >
                                  <span>View</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Feature Comparison Body */}
                <tbody className="divide-y divide-[#E8E2D5] text-sm">
                  {/* Category Row */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Category
                    </th>
                    {places.map((place) => {
                      const cats = place.categories || [];
                      return (
                        <td
                          key={place.id}
                          className="p-4 align-top border-r last:border-r-0 border-[#E8E2D5]"
                        >
                          {cats.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {cats.map((cat) => (
                                <span
                                  key={cat.id}
                                  className="rounded-full bg-[#EAE4D7] px-2.5 py-0.5 text-xs font-medium text-[#174D44]"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#8C8476] italic">Not listed</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Distance Row (Subtle, accessible highlight REQ-044) */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Distance
                    </th>
                    {places.map((place) => {
                      const isNearest =
                        showNearestHighlight && place.distance_km === minDistance;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 align-top border-r last:border-r-0 border-[#E8E2D5] transition-colors ${
                            isNearest ? "bg-[#F5FAF7]" : ""
                          }`}
                        >
                          {place.distance_km !== null && place.distance_km !== undefined ? (
                            <div className="space-y-1">
                              <p className="font-serif text-base font-bold text-[#1E2421]">
                                {place.distance_km} km
                              </p>
                              <p className="text-xs text-[#5C645F]">from Panadura</p>

                              {isNearest && (
                                <div className="mt-1">
                                  <span
                                    role="status"
                                    aria-label={`Nearest destination: ${place.distance_km} km from Panadura`}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#E8F3EE] border border-[#276B60]/30 px-2 py-0.5 text-[11px] font-bold text-[#174D44]"
                                  >
                                    <MapPin className="h-3 w-3 text-[#174D44]" />
                                    <span>Nearest</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8C8476] italic">Not listed</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Entrance Fee Row (Subtle, accessible highlight REQ-044) */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Entrance Fee
                    </th>
                    {places.map((place) => {
                      const feeVal = place.is_free
                        ? 0
                        : place.entrance_fee !== null && place.entrance_fee !== undefined
                        ? Number(place.entrance_fee)
                        : null;

                      const isCheapest =
                        showCheapestHighlight && feeVal !== null && feeVal === minFee;

                      const isFree = feeVal === 0;

                      return (
                        <td
                          key={place.id}
                          className={`p-4 align-top border-r last:border-r-0 border-[#E8E2D5] transition-colors ${
                            isCheapest ? "bg-[#FFFDF7]" : ""
                          }`}
                        >
                          {feeVal !== null ? (
                            <div className="space-y-1">
                              <p className="font-serif text-base font-bold text-[#1E2421]">
                                {isFree ? "Free" : `Rs. ${feeVal.toLocaleString()}`}
                              </p>

                              {isCheapest && (
                                <div className="mt-1">
                                  <span
                                    role="status"
                                    aria-label={`Lowest admission: ${
                                      isFree ? "Free admission" : `Rs. ${feeVal}`
                                    }`}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#FFF7E8] border border-[#E9B949]/40 px-2 py-0.5 text-[11px] font-bold text-[#8C6200]"
                                  >
                                    <Ticket className="h-3 w-3 text-[#8C6200]" />
                                    <span>{isFree ? "Free Admission" : "Lowest Fee"}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8C8476] italic">Not listed</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Opening Hours Row */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Opening Hours
                    </th>
                    {places.map((place) => (
                      <td
                        key={place.id}
                        className="p-4 align-top border-r last:border-r-0 border-[#E8E2D5]"
                      >
                        {place.opening_hours ? (
                          <div className="flex items-start gap-1.5 text-xs text-[#1E2421]">
                            <Clock className="h-3.5 w-3.5 text-[#174D44] mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{place.opening_hours}</span>
                          </div>
                        ) : (
                          <span className="text-[#8C8476] italic">Not listed</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Facilities Row */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Facilities
                    </th>
                    {places.map((place) => {
                      const facilitiesList = parseFacilities(place.facilities);

                      return (
                        <td
                          key={place.id}
                          className="p-4 align-top border-r last:border-r-0 border-[#E8E2D5]"
                        >
                          {facilitiesList.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {facilitiesList.map((facility, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md bg-[#F4EFE6] px-2 py-0.5 text-xs text-[#3D4540]"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#8C8476] italic">Not listed</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating Row */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Rating
                    </th>
                    {places.map((place) => (
                      <td
                        key={place.id}
                        className="p-4 align-top border-r last:border-r-0 border-[#E8E2D5]"
                      >
                        {place.average_rating !== null &&
                        place.average_rating !== undefined &&
                        place.average_rating > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-[#E9B949] text-[#E9B949]" />
                            <span className="font-bold text-[#1E2421]">
                              {place.average_rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-[#736B5E]">
                              ({place.reviews_count ?? 0}{" "}
                              {place.reviews_count === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#8C8476] italic">Not listed</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Address Row */}
                  <tr>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-white p-4 font-semibold text-[#5C645F] border-r border-[#E8E2D5]"
                    >
                      Address
                    </th>
                    {places.map((place) => (
                      <td
                        key={place.id}
                        className="p-4 align-top text-xs text-[#5C645F] border-r last:border-r-0 border-[#E8E2D5]"
                      >
                        {place.address ? (
                          <span>{place.address}</span>
                        ) : (
                          <span className="text-[#8C8476] italic">Not listed</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE: STACKED CARDS VIEW (REQ-043: never an unreadable squeezed table) */}
            {/* ------------------------------------------------------------- */}
            <div
              className={`space-y-6 ${
                mobileView === "stacked" ? "block sm:hidden" : "hidden"
              }`}
            >
              {places.map((place) => {
                const photoUrl = getFirstImageUrl(place);
                const inPlan = isInPlan(place.id);
                const isFav = isFavorite(place.id);

                const isNearest =
                  showNearestHighlight && place.distance_km === minDistance;

                const feeVal = place.is_free
                  ? 0
                  : place.entrance_fee !== null && place.entrance_fee !== undefined
                  ? Number(place.entrance_fee)
                  : null;

                const isCheapest =
                  showCheapestHighlight && feeVal !== null && feeVal === minFee;

                const isFree = feeVal === 0;
                const facilitiesList = parseFacilities(place.facilities);

                return (
                  <article
                    key={place.id}
                    className="overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs"
                  >
                    {/* Header Image & Overlay */}
                    <div className="relative h-44 w-full bg-[#EAE4D7]">
                      {photoUrl ? (
                        <Image
                          src={photoUrl}
                          alt={place.name}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#736B5E]">
                          <ImageIcon className="h-8 w-8 text-[#A89F91]" />
                        </div>
                      )}

                      {/* Remove column link */}
                      <button
                        type="button"
                        onClick={() => handleRemove(place.id, place.name)}
                        aria-label={`Remove ${place.name} from comparison`}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#8C2E1F] shadow-xs"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* Categories */}
                      {place.categories && place.categories.length > 0 && (
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1">
                          <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-[#174D44] shadow-xs">
                            {place.categories[0].name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-[#1E2421]">
                          <Link
                            href={`/places/${place.id}`}
                            className="hover:text-[#174D44]"
                          >
                            {place.name}
                          </Link>
                        </h2>
                      </div>

                      {/* Feature Comparison List */}
                      <div className="divide-y divide-[#EAE4D7] border-y border-[#EAE4D7] text-xs">
                        {/* Distance */}
                        <div className="py-2.5 flex items-center justify-between">
                          <span className="font-semibold text-[#5C645F]">Distance</span>
                          <div className="text-right">
                            {place.distance_km !== null && place.distance_km !== undefined ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#1E2421]">
                                  {place.distance_km} km
                                </span>
                                {isNearest && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md bg-[#E8F3EE] px-1.5 py-0.5 text-[10px] font-bold text-[#174D44]">
                                    <MapPin className="h-2.5 w-2.5 text-[#174D44]" />
                                    <span>Nearest</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#8C8476] italic">Not listed</span>
                            )}
                          </div>
                        </div>

                        {/* Fee */}
                        <div className="py-2.5 flex items-center justify-between">
                          <span className="font-semibold text-[#5C645F]">Entrance Fee</span>
                          <div className="text-right">
                            {feeVal !== null ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#1E2421]">
                                  {isFree ? "Free" : `Rs. ${feeVal.toLocaleString()}`}
                                </span>
                                {isCheapest && (
                                  <span className="inline-flex items-center gap-0.5 rounded-md bg-[#FFF7E8] px-1.5 py-0.5 text-[10px] font-bold text-[#8C6200]">
                                    <Ticket className="h-2.5 w-2.5 text-[#8C6200]" />
                                    <span>{isFree ? "Free" : "Lowest"}</span>
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#8C8476] italic">Not listed</span>
                            )}
                          </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <span className="font-semibold text-[#5C645F] shrink-0">Hours</span>
                          <span className="text-right text-[#1E2421] truncate">
                            {place.opening_hours || (
                              <span className="text-[#8C8476] italic">Not listed</span>
                            )}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="py-2.5 flex items-center justify-between">
                          <span className="font-semibold text-[#5C645F]">Rating</span>
                          <div>
                            {place.average_rating !== null &&
                            place.average_rating !== undefined &&
                            place.average_rating > 0 ? (
                              <span className="flex items-center gap-1 font-bold text-[#1E2421]">
                                <Star className="h-3.5 w-3.5 fill-[#E9B949] text-[#E9B949]" />
                                {place.average_rating.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-[#8C8476] italic">Not listed</span>
                            )}
                          </div>
                        </div>

                        {/* Facilities */}
                        <div className="py-2.5 flex flex-col gap-1.5">
                          <span className="font-semibold text-[#5C645F]">Facilities</span>
                          {facilitiesList.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {facilitiesList.map((f, idx) => (
                                <span
                                  key={idx}
                                  className="rounded bg-[#F4EFE6] px-2 py-0.5 text-[11px] text-[#3D4540]"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#8C8476] italic">Not listed</span>
                          )}
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Save */}
                          <button
                            type="button"
                            onClick={() => toggleFavorite(place.id, place.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1E2421]"
                          >
                            <Heart
                              className={`h-3.5 w-3.5 ${
                                isFav
                                  ? "fill-[#8C2E1F] text-[#8C2E1F]"
                                  : "text-[#5C645F]"
                              }`}
                            />
                            <span>{isFav ? "Saved" : "Save"}</span>
                          </button>

                          {/* Plan */}
                          {inPlan ? (
                            <button
                              type="button"
                              onClick={() => removeFromPlan(place.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#174D44] bg-[#EFE9DC] px-2.5 py-1.5 text-xs font-semibold text-[#174D44]"
                            >
                              <Check className="h-3.5 w-3.5 text-[#174D44]" />
                              <span>In Plan</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToPlan(place.id, place.name)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#D8D2C5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1E2421]"
                            >
                              <CalendarPlus className="h-3.5 w-3.5 text-[#174D44]" />
                              <span>Add Plan</span>
                            </button>
                          )}
                        </div>

                        {/* Details */}
                        <Link
                          href={`/places/${place.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#174D44] px-3 py-1.5 text-xs font-semibold text-white"
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

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 min-h-[50vh] items-center justify-center bg-[#FBF9F4]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
