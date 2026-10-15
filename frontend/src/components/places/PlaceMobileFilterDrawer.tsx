"use client";

import { useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import PlaceFilters from "./PlaceFilters";
import { FilterCategory } from "./types";

interface PlaceMobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: FilterCategory[];
  selectedCategoryIds: number[];
  onToggleCategory: (categoryId: number) => void;
  maxDistance?: number;
  onDistanceChange: (distance?: number) => void;
  freeOnly: boolean;
  onFreeToggle: (free: boolean) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  totalResults: number;
}

export default function PlaceMobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategoryIds,
  onToggleCategory,
  maxDistance,
  onDistanceChange,
  freeOnly,
  onFreeToggle,
  hasActiveFilters,
  onClearAll,
  totalResults,
}: PlaceMobileFilterDrawerProps) {
  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filter options"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-[#FBF9F4] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE4D7] px-5 py-4 bg-white">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#174D44]" />
            <h2 className="font-serif text-lg font-bold text-[#1E2421]">
              Filter Places
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters drawer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5C645F] hover:bg-[#F4F0E8] hover:text-[#1E2421]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <PlaceFilters
            categories={categories}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={onToggleCategory}
            maxDistance={maxDistance}
            onDistanceChange={onDistanceChange}
            freeOnly={freeOnly}
            onFreeToggle={onFreeToggle}
            hasActiveFilters={hasActiveFilters}
            onClearAll={onClearAll}
          />
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-[#EAE4D7] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#174D44] py-3 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] active:scale-[0.99]"
          >
            Show {totalResults} {totalResults === 1 ? "Place" : "Places"}
          </button>
        </div>
      </div>
    </div>
  );
}
