"use client";

import { X } from "lucide-react";
import { FilterCategory } from "./types";

interface PlaceActiveTagsProps {
  q?: string;
  categoryIds: number[];
  categories: FilterCategory[];
  maxDistance?: number;
  free?: boolean;
  onRemoveQ: () => void;
  onRemoveCategory: (id: number) => void;
  onRemoveDistance: () => void;
  onRemoveFree: () => void;
  onClearAll: () => void;
}

export default function PlaceActiveTags({
  q,
  categoryIds,
  categories,
  maxDistance,
  free,
  onRemoveQ,
  onRemoveCategory,
  onRemoveDistance,
  onRemoveFree,
  onClearAll,
}: PlaceActiveTagsProps) {
  const hasActive =
    Boolean(q) ||
    categoryIds.length > 0 ||
    maxDistance !== undefined ||
    Boolean(free);

  if (!hasActive) {
    return null;
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#5C645F] mr-1">
        Active filters:
      </span>

      {/* Query tag */}
      {q && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CCBA] bg-[#EFE9DC] px-2.5 py-1 text-xs font-medium text-[#1E2421]">
          <span>
            Search: <strong className="font-semibold">&ldquo;{q}&rdquo;</strong>
          </span>
          <button
            type="button"
            onClick={onRemoveQ}
            aria-label={`Remove search filter for ${q}`}
            className="flex h-4 w-4 items-center justify-center rounded-full text-[#5C645F] hover:bg-[#DED5C3] hover:text-[#1E2421]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Category tags */}
      {categoryIds.map((id) => {
        const catName = categoryMap.get(id) || `Category #${id}`;
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CCBA] bg-[#EFE9DC] px-2.5 py-1 text-xs font-medium text-[#1E2421]"
          >
            <span>{catName}</span>
            <button
              type="button"
              onClick={() => onRemoveCategory(id)}
              aria-label={`Remove category filter for ${catName}`}
              className="flex h-4 w-4 items-center justify-center rounded-full text-[#5C645F] hover:bg-[#DED5C3] hover:text-[#1E2421]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {/* Distance tag */}
      {maxDistance !== undefined && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CCBA] bg-[#EFE9DC] px-2.5 py-1 text-xs font-medium text-[#1E2421]">
          <span>Within {maxDistance} km</span>
          <button
            type="button"
            onClick={onRemoveDistance}
            aria-label="Remove distance filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-[#5C645F] hover:bg-[#DED5C3] hover:text-[#1E2421]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Free entry tag */}
      {free && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CCBA] bg-[#EFE9DC] px-2.5 py-1 text-xs font-medium text-[#1E2421]">
          <span>Free entry only</span>
          <button
            type="button"
            onClick={onRemoveFree}
            aria-label="Remove free entry filter"
            className="flex h-4 w-4 items-center justify-center rounded-full text-[#5C645F] hover:bg-[#DED5C3] hover:text-[#1E2421]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Clear all button */}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-semibold text-[#8C2E1F] underline-offset-4 hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
}
