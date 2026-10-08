"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import CategoryCard from "@/components/landing/CategoryCard";
import DestinationCard from "@/components/landing/DestinationCard";
import Footer from "@/components/home/Footer";
import { POPULAR_DESTINATIONS, TRAVEL_CATEGORIES } from "@/data/travelData";

function ExploreContent() {
  const searchParams = useSearchParams();
  const selectedCat = searchParams.get("category");

  const matchingDestinations = useMemo(() => {
    if (!selectedCat) return POPULAR_DESTINATIONS;
    return POPULAR_DESTINATIONS.filter((d) =>
      d.category.toLowerCase().includes(selectedCat.toLowerCase())
    );
  }, [selectedCat]);

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      <div className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#174D44] hover:text-[#103630] mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C86446]">
            <Sparkles className="h-4 w-4" />
            <span>Discovery Portal</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E2421]">
            Explore by Category
          </h1>
          <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
            Choose what you feel like experiencing today. We group places by mood so you can match your itinerary to your pace.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
        {/* Categories Grid */}
        <div className="mb-14">
          <h2 className="font-serif text-2xl font-bold text-[#1E2421] mb-6">
            Travel Themes
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-6">
            {TRAVEL_CATEGORIES.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>

        {/* Selected or All Category Places */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#1E2421]">
              {selectedCat ? `${selectedCat} Destinations` : "Featured Highlights"}
            </h2>
            {selectedCat && (
              <Link
                href="/explore"
                className="text-xs font-semibold text-[#174D44] underline-offset-4 hover:underline"
              >
                Show All
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {matchingDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#5C645F]">Loading exploration...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
