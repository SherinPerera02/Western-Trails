"use client";

import Link from "next/link";
import { ArrowRight, Scale, X, Trash2 } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { usePathname } from "next/navigation";

export default function CompareStickyBar() {
  const { selectedPlaces, removeCompare, clearCompare } = useCompare();
  const pathname = usePathname();

  // Hide sticky bar on standalone compare page
  if (selectedPlaces.length === 0 || pathname === "/compare") {
    return null;
  }

  const idsQuery = selectedPlaces.map((p) => p.id).join(",");
  const canCompare = selectedPlaces.length >= 2;

  return (
    <div
      role="region"
      aria-label="Comparison dock"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#1E2421]/95 text-[#FBF9F4] backdrop-blur-md border-t border-[#3D4540] shadow-2xl py-3 px-4 sm:px-6 transition-all animate-in slide-in-from-bottom duration-300"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Indicator & Place Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#EAE4D7] mr-1">
            <Scale className="h-4 w-4 text-[#C86446]" />
            <span>Compare ({selectedPlaces.length}/3)</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {selectedPlaces.map((place) => (
              <span
                key={place.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2E3632] border border-[#444E48] px-2.5 py-1 text-xs text-[#FBF9F4]"
              >
                <span className="max-w-[120px] sm:max-w-[150px] truncate">
                  {place.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeCompare(place.id)}
                  aria-label={`Remove ${place.name} from comparison`}
                  className="rounded hover:bg-[#444E48] p-0.5 text-[#C5BFB0] hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-[#C5BFB0] hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Clear all
          </button>

          {canCompare ? (
            <Link
              href={`/compare?ids=${idsQuery}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#174D44] hover:bg-[#103630] border border-[#276B60] px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors"
            >
              <span>Compare Places</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-[#8C8476] cursor-not-allowed border border-white/5"
              title="Select at least 2 places to compare"
            >
              <span>Select {2 - selectedPlaces.length} more</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
