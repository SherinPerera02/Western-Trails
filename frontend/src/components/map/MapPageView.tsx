"use client";

import { useState, useEffect, useCallback, useTransition, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import api, { apiError } from "@/lib/api";
import { MapPlace, FilterCategory } from "../places/types";
import MapSidePanel from "./MapSidePanel";
import FeatureNoticeModal, { FeatureModalType } from "../places/FeatureNoticeModal";
import { usePlan } from "@/context/PlanContext";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[#EAE4D7] flex flex-col items-center justify-center p-6 text-center text-[#5C645F] animate-pulse">
      <div className="h-10 w-10 rounded-full border-3 border-[#174D44] border-t-transparent animate-spin mb-3" />
      <p className="font-serif font-bold text-[#1E2421]">Loading interactive trail map...</p>
      <p className="text-xs text-[#736B5E] mt-1">Preparing stops within 25 km of Panadura</p>
    </div>
  ),
});

export default function MapPageView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const { planAttractionIds, addToPlan, removeFromPlan, isInPlan } = usePlan();

  // URL state synchronization
  const initialQ = searchParams?.get("q") || "";
  const initialCategory = searchParams?.get("category") || "";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showPlanOnly, setShowPlanOnly] = useState(false);

  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Plan modal roadmap handling
  const [modalType, setModalType] = useState<FeatureModalType>(null);
  const [modalPlace, setModalPlace] = useState<MapPlace | null>(null);

  // Synchronize state to URL query parameters
  const updateUrlParams = useCallback(
    (q: string, category: string) => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (category.trim()) params.set("category", category.trim());

        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router]
  );

  // Fetch places from GET /api/places/map (lightweight 200 rows endpoint)
  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch map places
      const placesRes = await api.get("/places/map");
      const fetchedPlaces: MapPlace[] = placesRes.data?.data || [];
      setPlaces(fetchedPlaces);
      setTotalAvailable(fetchedPlaces.length);

      // 2. Fetch filter categories
      try {
        const filtersRes = await api.get("/places/filters");
        const cats: FilterCategory[] = filtersRes.data?.data?.categories || [];
        setCategories(cats);
      } catch {
        // Fallback: derive categories from places if filters endpoint is slow
        const extracted = Array.from(
          new Set(fetchedPlaces.flatMap((p) => p.category_names || []))
        ).map((name, idx) => ({
          id: idx + 1,
          name,
          places_count: fetchedPlaces.filter((p) =>
            p.category_names?.includes(name)
          ).length,
          count: 0,
        }));
        setCategories(extracted);
      }
    } catch (err) {
      console.error("Error loading map places:", err);
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // Client-side filtering across the fetched map places
  const filteredPlaces = places.filter((place) => {
    // 1. My plan only filter
    if (showPlanOnly) {
      if (!planAttractionIds.has(place.id)) return false;
    }

    // 2. Category filter
    if (selectedCategory) {
      const catMatch =
        place.category_names?.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        ) ||
        place.categories?.some(
          (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
        );
      if (!catMatch) return false;
    }

    // 3. Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = place.name.toLowerCase().includes(q);
      const catMatch = place.category_names?.some((c) =>
        c.toLowerCase().includes(q)
      );
      if (!nameMatch && !catMatch) return false;
    }

    return true;
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams(query, selectedCategory);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams(searchQuery, cat);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setShowPlanOnly(false);
    updateUrlParams("", "");
  };

  const handleSelectPlace = (place: MapPlace) => {
    setSelectedPlaceId(place.id);
  };

  const handleAddToPlan = (place: MapPlace) => {
    if (isInPlan(place.id)) {
      removeFromPlan(place.id);
    } else {
      addToPlan(place.id, place.name);
    }
  };

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory || showPlanOnly);

  return (
    <div className="flex flex-1 flex-col md:flex-row h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] min-h-0 overflow-hidden bg-[#FBF9F4]">
      {/* Side Panel (Desktop left sidebar / Mobile bottom drawer) */}
      <MapSidePanel
        places={filteredPlaces}
        totalAvailable={totalAvailable}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedPlaceId={selectedPlaceId}
        onSelectPlace={handleSelectPlace}
        loading={loading}
        error={error}
        onRetry={fetchMapData}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        showPlanOnly={showPlanOnly}
        onTogglePlanOnly={setShowPlanOnly}
      />

      {/* Main Map View Area */}
      <main className="relative flex-1 flex flex-col h-[calc(100vh-4.5rem)] min-h-[calc(100vh-4.5rem)] md:min-h-0 w-full overflow-hidden">
        <InteractiveMap
          places={filteredPlaces}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={handleSelectPlace}
          onAddToPlan={handleAddToPlan}
        />
      </main>

      {/* Planner Feature Roadmap Notice Modal */}
      <FeatureNoticeModal
        type={modalType}
        place={modalPlace}
        onClose={() => {
          setModalType(null);
          setModalPlace(null);
        }}
      />
    </div>
  );
}
