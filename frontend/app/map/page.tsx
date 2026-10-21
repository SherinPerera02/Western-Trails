import { Suspense } from "react";
import type { Metadata } from "next";
import MapPageView from "@/src/components/map/MapPageView";

export const metadata: Metadata = {
  title: "Interactive Trail Map — Western Trails",
  description:
    "Explore active day-trip attractions within 25 km of Panadura along Sri Lanka's western coast with our interactive map.",
};

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 h-[calc(100vh-4.5rem)] items-center justify-center bg-[#FBF9F4] text-[#1E2421]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-3 border-[#174D44] border-t-transparent animate-spin" />
            <p className="font-serif font-bold text-sm text-[#1E2421]">
              Loading Western Trails Map...
            </p>
          </div>
        </div>
      }
    >
      <MapPageView />
    </Suspense>
  );
}
