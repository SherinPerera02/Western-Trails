"use client";

import { FilterCategory } from "./types";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface PlaceFiltersProps {
  categories: FilterCategory[];
  selectedCategoryIds: number[];
  onToggleCategory: (categoryId: number) => void;
  maxDistance?: number;
  onDistanceChange: (distance?: number) => void;
  freeOnly: boolean;
  onFreeToggle: (free: boolean) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

const DISTANCE_OPTIONS = [
  { value: undefined, label: "Any distance" },
  { value: 5, label: "Within 5 km" },
  { value: 10, label: "Within 10 km" },
  { value: 15, label: "Within 15 km" },
  { value: 25, label: "Within 25 km" },
];

export default function PlaceFilters({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  maxDistance,
  onDistanceChange,
  freeOnly,
  onFreeToggle,
  hasActiveFilters,
  onClearAll,
}: PlaceFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Top Header with Clear All Button */}
      <div className="flex items-center justify-between border-b border-[#EAE4D7] pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#174D44]" />
          <h2 className="font-serif text-base font-bold text-[#1E2421]">
            Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C2E1F] hover:text-[#5F1C11] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C2E1F]/20 rounded-md px-1 py-0.5"
            aria-label="Clear all applied filters"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* 1. Category Chips */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#5C645F]">
            Category
          </label>
          {selectedCategoryIds.length > 0 && (
            <span className="text-xs text-[#174D44] font-medium">
              {selectedCategoryIds.length} selected
            </span>
          )}
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onToggleCategory(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggleCategory(cat.id);
                  }
                }}
                className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44] ${
                  isSelected
                    ? "bg-[#174D44] text-[#FBF9F4] shadow-xs"
                    : "border border-[#D8D2C5] bg-white text-[#3D4540] hover:border-[#174D44] hover:bg-[#F8F5EE]"
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#EFE9DC] text-[#5C645F]"
                  }`}
                >
                  {cat.places_count ?? cat.count ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Distance Filter */}
      <div className="border-t border-[#EAE4D7] pt-5">
        <label
          htmlFor="distance-filter"
          className="block text-xs font-semibold uppercase tracking-wider text-[#5C645F] mb-2.5"
        >
          Distance from Panadura
        </label>

        <div className="space-y-2">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {DISTANCE_OPTIONS.map((opt) => {
              const isSelected = maxDistance === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onDistanceChange(opt.value)}
                  className={`rounded-lg py-2 px-2.5 text-xs font-semibold text-center transition-all focus-visible:ring-2 focus-visible:ring-[#174D44] ${
                    isSelected
                      ? "bg-[#174D44] text-white shadow-xs"
                      : "border border-[#D8D2C5] bg-white text-[#1E2421] hover:bg-[#F8F5EE] hover:border-[#174D44]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Range Slider for granular control */}
          <div className="mt-3 px-1">
            <div className="flex justify-between text-[11px] text-[#5C645F] mb-1 font-medium">
              <span>5 km</span>
              <span className="font-semibold text-[#174D44]">
                {maxDistance ? `Max ${maxDistance} km` : "No limit"}
              </span>
              <span>25 km</span>
            </div>
            <input
              id="distance-filter"
              type="range"
              min="5"
              max="25"
              step="5"
              value={maxDistance ?? 25}
              onChange={(e) => onDistanceChange(Number(e.target.value))}
              aria-label="Distance range slider up to 25 km"
              className="w-full accent-[#174D44] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Free Entry Toggle */}
      <div className="border-t border-[#EAE4D7] pt-5">
        <label className="flex items-center justify-between cursor-pointer select-none rounded-xl border border-[#D8D2C5] bg-white p-3 hover:bg-[#F8F5EE] transition-colors focus-within:ring-2 focus-within:ring-[#174D44]/30">
          <div className="pr-2">
            <span className="block text-sm font-semibold text-[#1E2421]">
              Free entry
            </span>
            <span className="block text-xs text-[#5C645F]">
              Places with no entrance fee required
            </span>
          </div>

          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => onFreeToggle(e.target.checked)}
            aria-label="Filter only free entry places"
            className="h-5 w-5 rounded border-[#D8D2C5] text-[#174D44] accent-[#174D44] focus:ring-[#174D44] cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
