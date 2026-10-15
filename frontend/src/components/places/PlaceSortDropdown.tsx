"use client";

import { ArrowUpDown } from "lucide-react";

interface PlaceSortDropdownProps {
  currentSort: string;
  hasAnyRating: boolean;
  onSortChange: (newSort: string) => void;
}

export default function PlaceSortDropdown({
  currentSort = "distance_asc",
  hasAnyRating,
  onSortChange,
}: PlaceSortDropdownProps) {
  const sortOptions = [
    { value: "distance_asc", label: "Nearest first" },
    { value: "distance_desc", label: "Furthest first" },
    { value: "name_asc", label: "Name A to Z" },
    ...(hasAnyRating ? [{ value: "rating_desc", label: "Highest rated" }] : []),
    { value: "fee_asc", label: "Lowest fee" },
  ];

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="place-sort"
        className="text-xs font-semibold uppercase tracking-wider text-[#5C645F] whitespace-nowrap"
      >
        Sort by:
      </label>

      <div className="relative inline-flex items-center">
        <select
          id="place-sort"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none rounded-xl border border-[#D8D2C5] bg-white py-2 pl-3 pr-8 text-xs font-semibold text-[#1E2421] shadow-2xs transition-colors hover:border-[#174D44] focus:border-[#174D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]/20 cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown
          className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-[#5C645F]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
