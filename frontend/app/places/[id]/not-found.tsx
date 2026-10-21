import Link from "next/link";
import { Compass, ArrowLeft, Search } from "lucide-react";

export default function PlaceNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[#FBF9F4] px-4 py-20 sm:px-6 sm:py-28 text-center text-[#1E2421]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-6 shadow-2xs">
        <Compass className="h-8 w-8 stroke-[1.5]" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-[#C86446]">
        404 — Location Not Found
      </span>

      <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl md:text-5xl">
        This trail stop doesn&apos;t seem to exist
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-[#5C645F]">
        The destination you are looking for may have been archived, renamed, or
        is outside our curated western coast trail network.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-md">
        <Link
          href="/places"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#174D44] px-6 py-3 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-colors hover:bg-[#103630]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse All Places</span>
        </Link>

        <Link
          href="/places?q="
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-3 text-sm font-semibold text-[#1E2421] shadow-2xs transition-colors hover:bg-[#F8F5EE]"
        >
          <Search className="h-4 w-4 text-[#5C645F]" />
          <span>Search Trail</span>
        </Link>
      </div>
    </div>
  );
}
