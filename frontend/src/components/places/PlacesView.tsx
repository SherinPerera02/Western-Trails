"use client";

import { useState, useTransition, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, MapPin } from "lucide-react";
import api, { apiError } from "@/lib/api";

import {
  Place,
  FilterMetadata,
  PaginationMeta,
  PlacesApiResponse,
} from "./types";
import PlaceSearchBox from "./PlaceSearchBox";
import PlaceFilters from "./PlaceFilters";
import PlaceActiveTags from "./PlaceActiveTags";
import PlaceSortDropdown from "./PlaceSortDropdown";
import PlaceCard from "./PlaceCard";
import PlaceCardSkeleton from "./PlaceCardSkeleton";
import PlaceEmptyState from "./PlaceEmptyState";
import PlaceErrorState from "./PlaceErrorState";
import PlacePagination from "./PlacePagination";
import PlaceMobileFilterDrawer from "./PlaceMobileFilterDrawer";
import FeatureNoticeModal, { FeatureModalType } from "./FeatureNoticeModal";

interface PlacesViewProps {
  initialPlaces: Place[];
  initialMeta: PaginationMeta;
  filterMeta: FilterMetadata;
  initialError?: string | null;
}

export default function PlacesView({
  initialPlaces,
  initialMeta,
  filterMeta,
  initialError = null,
}: PlacesViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active places & pagination state (synced with server props or client refresh)
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);
  const [error, setError] = useState<string | null>(initialError);
  const [isRetrying, setIsRetrying] = useState(false);

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Feature notice modal state (for Save and Add to plan)
  const [activeModal, setActiveModal] = useState<FeatureModalType>(null);
  const [selectedPlaceForModal, setSelectedPlaceForModal] = useState<Place | null>(null);

  // Sync state whenever server props update (e.g. from server component re-render)
  useEffect(() => {
    setPlaces(initialPlaces);
    setMeta(initialMeta);
    setError(initialError);
  }, [initialPlaces, initialMeta, initialError]);

  // Read current query parameters from URL (Single Source of Truth)
  const currentQ = searchParams.get("q") || "";
  const currentCategoryRaw = searchParams.get("category") || "";
  const currentCategoryIds = useMemo(() => {
    if (!currentCategoryRaw.trim()) return [];
    return currentCategoryRaw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);
  }, [currentCategoryRaw]);

  const currentMaxDistance = searchParams.get("max_distance")
    ? Number(searchParams.get("max_distance"))
    : undefined;

  const currentFree =
    searchParams.get("free") === "1" || searchParams.get("free") === "true";

  const currentSort = searchParams.get("sort") || "distance_asc";
  const currentPage = searchParams.get("page")
    ? Number(searchParams.get("page"))
    : 1;

  // Determine if any places in the current dataset have reviews/ratings
  const hasAnyRating = useMemo(() => {
    return places.some(
      (p) => p.average_rating !== null && Number(p.average_rating) > 0
    );
  }, [places]);

  // Helper to push updated search parameters to the URL
  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | undefined | null>, resetPage = true) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, String(val));
        }
      });

      if (resetPage) {
        nextParams.delete("page");
      }

      const queryString = nextParams.toString();
      const targetUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

      startTransition(() => {
        router.push(targetUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  // Handler for text search
  const handleSearchChange = useCallback((newQ: string) => {
    updateUrlParams({ q: newQ.trim() || undefined });
  }, [updateUrlParams]);

  // Handler for category chip toggle (multi-select)
  const handleToggleCategory = useCallback((catId: number) => {
    let nextIds: number[];
    if (currentCategoryIds.includes(catId)) {
      nextIds = currentCategoryIds.filter((id) => id !== catId);
    } else {
      nextIds = [...currentCategoryIds, catId];
    }

    updateUrlParams({
      category: nextIds.length > 0 ? nextIds.join(",") : undefined,
    });
  }, [currentCategoryIds, updateUrlParams]);

  // Handler for distance change
  const handleDistanceChange = useCallback((distance?: number) => {
    updateUrlParams({
      max_distance: distance !== undefined && distance > 0 ? distance : undefined,
    });
  }, [updateUrlParams]);

  // Handler for free entry toggle
  const handleFreeToggle = useCallback((free: boolean) => {
    updateUrlParams({ free: free ? "1" : undefined });
  }, [updateUrlParams]);

  // Handler for sort change
  const handleSortChange = useCallback((newSort: string) => {
    updateUrlParams({ sort: newSort });
  }, [updateUrlParams]);

  // Handler for page change (does NOT reset page)
  const handlePageChange = useCallback((newPage: number) => {
    updateUrlParams({ page: newPage > 1 ? newPage : undefined }, false);
    // Smooth scroll back to top of listings
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [updateUrlParams]);

  // Handler for Clear all filters (REQ-020)
  const handleClearAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  // Handlers for active filter tag dismissals
  const handleRemoveQ = useCallback(() => updateUrlParams({ q: undefined }), [updateUrlParams]);
  const handleRemoveCategory = useCallback((catId: number) => {
    const nextIds = currentCategoryIds.filter((id) => id !== catId);
    updateUrlParams({
      category: nextIds.length > 0 ? nextIds.join(",") : undefined,
    });
  }, [currentCategoryIds, updateUrlParams]);
  const handleRemoveDistance = useCallback(() => updateUrlParams({ max_distance: undefined }), [updateUrlParams]);
  const handleRemoveFree = useCallback(() => updateUrlParams({ free: undefined }), [updateUrlParams]);

  // Direct client retry in case of network/server error
  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (currentQ) params.q = currentQ;
      if (currentCategoryIds.length > 0) params.category = currentCategoryIds.join(",");
      if (currentMaxDistance) params.max_distance = currentMaxDistance;
      if (currentFree) params.free = 1;
      if (currentSort) params.sort = currentSort;
      if (currentPage > 1) params.page = currentPage;

      const res = await api.get<PlacesApiResponse>("/api/places", { params });
      setPlaces(res.data.data || []);
      setMeta(res.data.meta);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setIsRetrying(false);
    }
  };

  // Save button action trigger
  const handleSaveClick = (place: Place) => {
    setSelectedPlaceForModal(place);
    setActiveModal("save");
  };

  // Add to plan button action trigger
  const handleAddToPlanClick = (place: Place) => {
    setSelectedPlaceForModal(place);
    setActiveModal("plan");
  };

  // Check if any filter is applied
  const hasActiveFilters = Boolean(
    currentQ ||
      currentCategoryIds.length > 0 ||
      currentMaxDistance !== undefined ||
      currentFree
  );

  const activeFiltersCount =
    (currentQ ? 1 : 0) +
    currentCategoryIds.length +
    (currentMaxDistance !== undefined ? 1 : 0) +
    (currentFree ? 1 : 0);

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      {/* 1. Header Banner with Search Bar */}
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C86446]">
              <MapPin className="h-3.5 w-3.5" />
              <span>Panadura & Western Coast Guide</span>
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl lg:text-5xl">
              Places to Visit
            </h1>

            <p className="mt-1 text-sm sm:text-base text-[#5C645F] max-w-2xl leading-relaxed">
              Discover authentic attractions, beaches, sanctuaries, and cultural stops within
              day-trip reach of Panadura.
            </p>
          </div>

          {/* Search Box (debounced 400ms + clear button) */}
          <div className="mt-6 max-w-3xl">
            <PlaceSearchBox
              initialValue={currentQ}
              onSearchChange={handleSearchChange}
            />
          </div>

          {/* Active Filter Tags */}
          <PlaceActiveTags
            q={currentQ}
            categoryIds={currentCategoryIds}
            categories={filterMeta.categories || []}
            maxDistance={currentMaxDistance}
            free={currentFree}
            onRemoveQ={handleRemoveQ}
            onRemoveCategory={handleRemoveCategory}
            onRemoveDistance={handleRemoveDistance}
            onRemoveFree={handleRemoveFree}
            onClearAll={handleClearAllFilters}
          />
        </div>
      </section>

      {/* 2. Main Discovery Workspace */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        {/* Results Bar: Result Count, Mobile Filter Trigger & Sort Dropdown */}
        <div className="flex flex-col gap-4 border-b border-[#EAE4D7] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Filters Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1E2421] shadow-2xs hover:border-[#174D44] hover:bg-[#F8F5EE] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#174D44]" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#174D44] text-[11px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Accessible result count (aria-live region) */}
            <div aria-live="polite" aria-atomic="true">
              <p className="text-sm font-medium text-[#5C645F]">
                {isPending ? (
                  <span className="text-[#174D44] font-medium">Updating results…</span>
                ) : (
                  <>
                    Showing <strong className="text-[#1E2421]">{meta.total}</strong>{" "}
                    {meta.total === 1 ? "place" : "places"}
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="self-end sm:self-auto">
            <PlaceSortDropdown
              currentSort={currentSort}
              hasAnyRating={hasAnyRating}
              onSortChange={handleSortChange}
            />
          </div>
        </div>

        {/* 3. Grid Layout: Desktop Sidebar Filters + Places Cards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 rounded-2xl border border-[#EAE4D7] bg-white p-6 shadow-xs sticky top-24">
            <PlaceFilters
              categories={filterMeta.categories || []}
              selectedCategoryIds={currentCategoryIds}
              onToggleCategory={handleToggleCategory}
              maxDistance={currentMaxDistance}
              onDistanceChange={handleDistanceChange}
              freeOnly={currentFree}
              onFreeToggle={handleFreeToggle}
              hasActiveFilters={hasActiveFilters}
              onClearAll={handleClearAllFilters}
            />
          </aside>

          {/* Main Places Cards Stream */}
          <main className="lg:col-span-3">
            {error ? (
              <PlaceErrorState
                message={error}
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
            ) : isPending ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <PlaceCardSkeleton key={idx} />
                ))}
              </div>
            ) : places.length === 0 ? (
              <PlaceEmptyState
                onClearFilters={handleClearAllFilters}
                hasFilters={hasActiveFilters}
              />
            ) : (
              <div className="space-y-8">
                {/* Responsive Place Cards Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onSave={handleSaveClick}
                      onAddToPlan={handleAddToPlanClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <PlacePagination
                  meta={meta}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 4. Mobile Filter Drawer Sheet */}
      <PlaceMobileFilterDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        categories={filterMeta.categories || []}
        selectedCategoryIds={currentCategoryIds}
        onToggleCategory={handleToggleCategory}
        maxDistance={currentMaxDistance}
        onDistanceChange={handleDistanceChange}
        freeOnly={currentFree}
        onFreeToggle={handleFreeToggle}
        hasActiveFilters={hasActiveFilters}
        onClearAll={handleClearAllFilters}
        totalResults={meta.total}
      />

      {/* 5. Feature Modal (Auth prompt or Coming Soon notice for M5 & M6) */}
      <FeatureNoticeModal
        type={activeModal}
        place={selectedPlaceForModal}
        onClose={() => {
          setActiveModal(null);
          setSelectedPlaceForModal(null);
        }}
      />
    </div>
  );
}
