"use client";

import { Navigation } from "lucide-react";
import { LegToNext } from "@/types/planner";

interface PlannerLegConnectorProps {
  leg: LegToNext | null;
}

export default function PlannerLegConnector({ leg }: PlannerLegConnectorProps) {
  if (!leg) {
    return (
      <div className="flex items-center justify-center my-1.5 py-1">
        <div className="h-6 w-0.5 border-l-2 border-dashed border-[#D5CCBA]" />
      </div>
    );
  }

  const { distance_km, estimated_minutes } = leg;

  const naturalText = `about ${distance_km} km, roughly ${estimated_minutes} min by road (estimate)`;

  return (
    <div className="relative flex items-center justify-center my-2 py-1">
      {/* Dashed connector line */}
      <div className="absolute inset-y-0 w-0.5 border-l-2 border-dashed border-[#C5BFB0]" />

      {/* Natural estimate pill */}
      <div className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-[#D5CCBA] bg-[#F4EFE6] px-3.5 py-1 text-xs text-[#5C645F] shadow-2xs">
        <Navigation className="h-3 w-3 text-[#174D44] shrink-0" />
        <span className="font-medium text-[#1E2421]">{naturalText}</span>
      </div>
    </div>
  );
}
