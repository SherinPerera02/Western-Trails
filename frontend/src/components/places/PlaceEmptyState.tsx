import { Compass, RotateCcw } from "lucide-react";

interface PlaceEmptyStateProps {
  onClearFilters: () => void;
  hasFilters: boolean;
}

export default function PlaceEmptyState({
  onClearFilters,
  hasFilters,
}: PlaceEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D8D2C5] bg-white p-12 text-center shadow-xs">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
        <Compass className="h-7 w-7" />
      </div>

      <h3 className="font-serif text-xl font-bold text-[#1E2421]">
        No places match your search
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#5C645F] leading-relaxed">
        {hasFilters
          ? "We couldn't find any attractions matching your current filters. Try widening your distance radius, searching for a different keyword, or resetting your filters."
          : "There are currently no active places listed. Check back soon as new attractions are added regularly."}
      </p>

      {hasFilters && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
