"use client";

import { Info } from "lucide-react";

interface PlannerDisclaimerProps {
  disclaimer?: string;
}

export default function PlannerDisclaimer({
  disclaimer = "Distances and travel times are estimates. This plan is a planning aid, not an optimised route.",
}: PlannerDisclaimerProps) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-[#D8D2C5] bg-[#F4EFE6]/70 p-4 text-xs text-[#5C645F] leading-relaxed shadow-2xs"
    >
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#174D44] text-white mt-0.5">
        <Info className="h-3.5 w-3.5" />
      </div>
      <div>
        <span className="font-semibold text-[#1E2421]">Planning Aid: </span>
        <span>{disclaimer}</span>
      </div>
    </div>
  );
}
