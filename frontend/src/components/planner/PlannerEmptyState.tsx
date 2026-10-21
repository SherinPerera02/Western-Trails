"use client";

import Link from "next/link";
import { Compass, Map, MapPin } from "lucide-react";

export default function PlannerEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8D2C5] bg-white/70 p-8 sm:p-14 text-center shadow-xs">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
        <Compass className="h-7 w-7" strokeWidth={1.8} />
      </div>

      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]">
        Your plan is empty
      </h3>

      <p className="mt-2 text-sm text-[#5C645F] max-w-md leading-relaxed">
        Pick a few places and they&apos;ll show up here. You can arrange their
        sequence, see distances and travel times, and plan your day along the
        coast.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/places"
          className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors"
        >
          <MapPin className="h-4 w-4" />
          <span>Browse Places</span>
        </Link>

        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#1E2421] hover:bg-[#F8F5EE] transition-colors"
        >
          <Map className="h-4 w-4 text-[#174D44]" />
          <span>Interactive Map</span>
        </Link>
      </div>
    </div>
  );
}
