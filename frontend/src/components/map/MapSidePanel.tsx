"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Compass,
  MapPin,
  Clock,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Lock,
  ImageIcon,
  AlertTriangle,
  Sparkles,
  Calendar,
} from "lucide-react";
import { MapPlace, FilterCategory } from "../places/types";
import { CATEGORY_STYLES, getCategoryStyle } from "./mapUtils";
import PlaceSearchBox from "../places/PlaceSearchBox";

interface MapSidePanelProps {
  places: MapPlace[];
  totalAvailable: number;
  categories: FilterCategory[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPlaceId: number | null;
  onSelectPlace: (place: MapPlace) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  showPlanOnly?: boolean;
  onTogglePlanOnly?: (showPlanOnly: boolean) => void;
}

export default function MapSidePanel({
  places,
  totalAvailable,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedPlaceId,
  onSelectPlace,
  loading,
  error,
  onRetry,
  onClearFilters,
  hasActiveFilters,
  showPlanOnly = false,
  onTogglePlanOnly,
}: MapSidePanelProps) {
  // Mobile drawer collapse state (Requirement 5: bottom sheet on phones)
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <>
      {/* ============================================================== */}
      {/* DESKTOP SIDE PANEL (md:flex)                                   */}
      {/* ============================================================== */}
      <aside
        aria-label="Places directory and filters"
        className="hidden md:flex h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] min-h-0 w-80 lg:w-[400px] shrink-0 flex-col border-r border-[#E8E2D5] bg-[#FBF9F4] shadow-sm z-10"
      >
        {/* Panel Header */}
        <div className="border-b border-[#E8E2D5] p-5 space-y-4 bg-white/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8522E]">
              <Compass className="h-4 w-4" />
              <span>Trail Explorer</span>
            </div>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#1E2421]">
              Interactive Map
            </h1>
            <p className="mt-0.5 text-xs text-[#5C645F]">
              Stops within 25 km of Panadura along Sri Lanka&apos;s west coast.
            </p>
          </div>

          {/* All places / My plan only toggle (Planner enabled) */}
          <div className="flex items-center p-1 rounded-xl bg-[#EFE9DC] text-xs font-semibold">
            <button
              type="button"
              onClick={() => onTogglePlanOnly?.(false)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-all ${
                !showPlanOnly
                  ? "bg-white text-[#174D44] shadow-xs font-bold"
                  : "text-[#5C645F] hover:text-[#1E2421]"
              }`}
            >
              All places
            </button>
            <button
              type="button"
              onClick={() => onTogglePlanOnly?.(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-center transition-all ${
                showPlanOnly
                  ? "bg-white text-[#174D44] shadow-xs font-bold"
                  : "text-[#5C645F] hover:text-[#1E2421]"
              }`}
            >
              <Calendar className="h-3 w-3 text-[#174D44]" />
              <span>My plan only</span>
            </button>
          </div>

          {/* Search Box */}
          <PlaceSearchBox
            initialValue={searchQuery}
            onSearchChange={onSearchChange}
            placeholder="Search stops, temples, beaches..."
          />

          {/* Category Chips Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#736B5E]">
              <span>Categories</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-[#8C2E1F] hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {/* "All" chip */}
              <button
                type="button"
                onClick={() => onSelectCategory("")}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  !selectedCategory
                    ? "bg-[#174D44] text-white shadow-xs"
                    : "bg-[#EAE4D7] text-[#4A554F] hover:bg-[#DCD5C5]"
                }`}
              >
                All ({totalAvailable})
              </button>

              {/* Dynamic categories chips */}
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const style = getCategoryStyle([cat.name]);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      onSelectCategory(isSelected ? "" : cat.name)
                    }
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#174D44] text-white shadow-xs"
                        : "bg-[#EAE4D7] text-[#4A554F] hover:bg-[#DCD5C5]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: style.color }}
                    />
                    <span>{cat.name}</span>
                    {cat.places_count !== undefined && (
                      <span className="opacity-70 text-[10px]">
                        ({cat.places_count})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count & Places List */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#F7F4EB] border-b border-[#EAE4D7] text-xs font-medium text-[#736B5E]">
          <span>
            {places.length} {places.length === 1 ? "place" : "places"} found
          </span>
          <span className="italic text-[11px]">* Distances approximate</span>
        </div>

        {/* Scrollable Places Directory */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 focus:outline-none">
          {/* Requirement 8: Loading State */}
          {loading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-[#E8E2D5] bg-white p-3 animate-pulse"
                >
                  <div className="h-16 w-16 rounded-lg bg-[#EAE4D7] shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-[#EAE4D7]" />
                    <div className="h-3 w-1/2 rounded bg-[#EAE4D7]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Requirement 8: Error State with Retry */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-[#FEF2F2] p-5 text-center text-xs text-red-900 space-y-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mx-auto" />
              <div>
                <p className="font-semibold text-sm">Failed to load places</p>
                <p className="mt-1 text-red-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Requirement 8: Empty Result Message */}
          {!loading && !error && places.length === 0 && (
            <div className="rounded-2xl border border-[#E8E2D5] bg-white p-6 text-center text-xs text-[#5C645F] space-y-3">
              <Compass className="h-8 w-8 text-[#A89F91] mx-auto stroke-1" />
              <div>
                <p className="font-serif font-bold text-sm text-[#1E2421]">
                  No places match your search
                </p>
                <p className="mt-1">
                  Try adjusting your search keywords or switching categories.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#174D44] px-4 py-2 font-semibold text-white hover:bg-[#103630] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          )}

          {/* Requirement 9: Keyboard operable place list */}
          {!loading &&
            !error &&
            places.map((place) => {
              const isSelected = place.id === selectedPlaceId;
              const rawImageUrl = place.first_image_url || place.image_url;
              const categories =
                place.category_names ||
                place.categories?.map((c) => c.name) ||
                [];

              return (
                <div
                  key={place.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectPlace(place)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectPlace(place);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select ${place.name} on map`}
                  className={`group relative flex gap-3 rounded-2xl border p-3 transition-all cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44] ${
                    isSelected
                      ? "border-[#174D44] bg-[#F4F0E8] shadow-sm ring-1 ring-[#174D44]/30"
                      : "border-[#E8E2D5] bg-white hover:border-[#174D44]/40 hover:bg-[#FDFCF9]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-18 w-20 shrink-0 overflow-hidden rounded-xl bg-[#EAE4D7]">
                    {rawImageUrl ? (
                      <Image
                        src={rawImageUrl}
                        alt={place.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#736B5E]">
                        <ImageIcon className="h-5 w-5 text-[#A89F91]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      {categories.length > 0 && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A8522E]">
                          {categories[0]}
                        </span>
                      )}
                      <h3 className="font-serif text-sm font-bold text-[#1E2421] truncate group-hover:text-[#174D44]">
                        {place.name}
                      </h3>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs text-[#5C645F]">
                      {place.distance_km !== null && (
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-[#C86446]" />
                          <span>{place.distance_km} km</span>
                        </span>
                      )}

                      <Link
                        href={`/places/${place.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#174D44] hover:underline"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM SHEET / DRAWER (md:hidden)                       */}
      {/* ============================================================== */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-[400] transition-all duration-300">
        {/* Compact Handle Bar */}
        <div className="rounded-t-3xl border-t border-x border-[#E8E2D5] bg-[#FBF9F4] shadow-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileExpanded((prev) => !prev)}
            aria-label="Toggle places list drawer"
            className="flex w-full items-center justify-between px-5 py-3.5 bg-[#FBF9F4] text-xs font-semibold text-[#1E2421]"
          >
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#174D44]" />
              <span>
                {places.length} Places Found {selectedCategory && `in ${selectedCategory}`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#736B5E]">
              <span>{mobileExpanded ? "Collapse" : "View List"}</span>
              {mobileExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </button>

          {/* Drawer Body */}
          {mobileExpanded && (
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 border-t border-[#EAE4D7]">
              {/* Mobile Search & Chips */}
              <PlaceSearchBox
                initialValue={searchQuery}
                onSearchChange={onSearchChange}
                placeholder="Search places..."
              />

              {/* Category Chips Scroll */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => onSelectCategory("")}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    !selectedCategory
                      ? "bg-[#174D44] text-white"
                      : "bg-[#EAE4D7] text-[#4A554F]"
                  }`}
                >
                  All ({totalAvailable})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      onSelectCategory(
                        selectedCategory === cat.name ? "" : cat.name
                      )
                    }
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedCategory === cat.name
                        ? "bg-[#174D44] text-white"
                        : "bg-[#EAE4D7] text-[#4A554F]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Mobile Place Cards */}
              <div className="space-y-2.5">
                {places.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => {
                      onSelectPlace(place);
                      setMobileExpanded(false);
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E8E2D5] bg-white p-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#1E2421] truncate">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#5C645F] mt-0.5">
                        {place.distance_km} km from Panadura
                      </p>
                    </div>
                    <Link
                      href={`/places/${place.id}`}
                      className="rounded-lg bg-[#F4F0E8] px-3 py-1.5 text-xs font-semibold text-[#174D44] shrink-0"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
