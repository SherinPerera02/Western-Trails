"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "./types";

interface PlacePaginationProps {
  meta: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export default function PlacePagination({ meta, onPageChange }: PlacePaginationProps) {
  const { current_page, last_page, total } = meta;

  if (last_page <= 1 || total === 0) {
    return null;
  }

  // Generate page numbers window (up to 5 pages around current)
  const getPages = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;

    const left = Math.max(1, current_page - delta);
    const right = Math.min(last_page, current_page + delta);

    if (left > 1) {
      pages.push(1);
      if (left > 2) {
        pages.push("ellipsis");
      }
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < last_page) {
      if (right < last_page - 1) {
        pages.push("ellipsis");
      }
      pages.push(last_page);
    }

    return pages;
  };

  const pages = getPages();

  return (
    <nav
      className="flex flex-col items-center justify-between gap-4 border-t border-[#EAE4D7] pt-8 sm:flex-row"
      aria-label="Places pagination"
    >
      {/* Information text */}
      <p className="text-xs text-[#5C645F]">
        Showing page <strong className="text-[#1E2421]">{current_page}</strong> of{" "}
        <strong className="text-[#1E2421]">{last_page}</strong> ({total} total places)
      </p>

      {/* Page links */}
      <div className="flex items-center gap-1.5">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          aria-label="Go to previous page"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white px-3 text-xs font-semibold text-[#1E2421] shadow-2xs transition-colors hover:border-[#174D44] hover:bg-[#F8F5EE] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-[#5C645F]"
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isCurrent = p === current_page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44] ${
                  isCurrent
                    ? "bg-[#174D44] text-[#FBF9F4] shadow-xs"
                    : "border border-[#D8D2C5] bg-white text-[#1E2421] hover:border-[#174D44] hover:bg-[#F8F5EE]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= last_page}
          aria-label="Go to next page"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white px-3 text-xs font-semibold text-[#1E2421] shadow-2xs transition-colors hover:border-[#174D44] hover:bg-[#F8F5EE] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </nav>
  );
}
