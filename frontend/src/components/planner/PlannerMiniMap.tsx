"use client";

import dynamic from "next/dynamic";
import { PlanItemDetail } from "@/types/planner";

interface PlannerMiniMapProps {
  items: PlanItemDetail[];
}

const PlannerMiniMapInner = dynamic(
  () => import("./PlannerMiniMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[300px] w-full rounded-2xl bg-[#EAE4D7] border border-[#E8E2D5] flex flex-col items-center justify-center p-6 text-center text-[#5C645F] animate-pulse">
        <div className="h-8 w-8 rounded-full border-2 border-[#174D44] border-t-transparent animate-spin mb-2" />
        <p className="font-serif text-sm font-semibold text-[#1E2421]">Loading trail route map...</p>
      </div>
    ),
  }
);

export default function PlannerMiniMap({ items }: PlannerMiniMapProps) {
  return (
    <div className="h-[360px] sm:h-[420px] lg:h-[500px] w-full sticky top-24">
      <PlannerMiniMapInner items={items} />
    </div>
  );
}
