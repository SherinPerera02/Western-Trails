"use client";

import { useState } from "react";
import { Layers, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_STYLES } from "./mapUtils";

export default function MapLegend() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-6 right-4 z-[400] max-w-[280px]">
      <div className="overflow-hidden rounded-2xl border border-[#E8E2D5] bg-[#FBF9F4]/95 shadow-md backdrop-blur-md transition-all">
        {/* Toggle Button Header */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle map category legend"
          className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold text-[#1E2421] hover:bg-[#F4EFE6] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#174D44]" />
            <span>Map Legend</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-[#736B5E]" />
          ) : (
            <ChevronUp className="h-4 w-4 text-[#736B5E]" />
          )}
        </button>

        {/* Legend Content */}
        {isOpen && (
          <div className="border-t border-[#EAE4D7] p-3 text-xs space-y-2 max-h-56 overflow-y-auto">
            {Object.entries(CATEGORY_STYLES).map(([key, item]) => (
              <div key={key} className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#3A453F] font-medium leading-none">
                  {item.label}
                </span>
              </div>
            ))}

            <div className="border-t border-[#EAE4D7] pt-2 mt-2 flex items-center gap-2.5">
              <span className="h-3 w-3 shrink-0 rounded-full border-2 border-dashed border-[#174D44] bg-[#174D44]/10" />
              <span className="text-[11px] text-[#736B5E] italic">
                25 km Day-Trip Boundary
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
