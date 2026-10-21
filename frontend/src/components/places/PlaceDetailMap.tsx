"use client";

import dynamic from "next/dynamic";
import { PlaceDetailMapProps } from "./PlaceDetailMapInner";

const PlaceDetailMapInner = dynamic(
  () => import("./PlaceDetailMapInner"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] sm:h-[340px] w-full rounded-2xl bg-[#EAE4D7] border border-[#E8E2D5] flex items-center justify-center text-xs font-medium text-[#736B5E] animate-pulse">
        Loading trail map...
      </div>
    ),
  }
);

export default function PlaceDetailMap(props: PlaceDetailMapProps) {
  return <PlaceDetailMapInner {...props} />;
}
