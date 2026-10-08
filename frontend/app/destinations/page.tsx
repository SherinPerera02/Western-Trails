"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, MapPin, ArrowLeft } from "lucide-react";
import DestinationCard from "@/components/landing/DestinationCard";
import Footer from "@/components/home/Footer";
import { POPULAR_DESTINATIONS, TRAVEL_CATEGORIES } from "@/data/travelData";

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "all";

  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);

  const filtered = useMemo(() => {
    return POPULAR_DESTINATIONS.filter((item) => {
      const matchQ =
        !query.trim() ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.location.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase());

      const matchCat =
        selectedCategory === "all" ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchQ && matchCat;
    });
  }, [query, selectedCategory]);

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
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E2421]">
            Sri Lankan Destinations
          </h1>
          <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
            Explore authentic coastal viewpoints, historic Buddhist stupas, colonial mansions, and tranquil lake lagoons.
          </p>

          {/* Search and Filter Controls */}
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5C645F]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination name, location, or keyword..."
                className="w-full rounded-xl border border-[#D8D2C5] bg-white py-3 pl-11 pr-4 text-sm font-medium text-[#1E2421] placeholder-[#5C645F]/60 shadow-2xs outline-none focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/15"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#174D44] hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter destinations by category"
                className="rounded-xl border border-[#D8D2C5] bg-white px-4 py-3 text-sm font-medium text-[#1E2421] shadow-2xs outline-none focus:border-[#174D44]"
              >
                <option value="all">All Categories</option>
                {TRAVEL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-medium text-[#5C645F]">
            Showing <strong className="text-[#1E2421]">{filtered.length}</strong> destinations
          </p>
          {(query || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
              }}
              className="text-xs font-semibold text-[#174D44] underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8D2C5] bg-white p-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-[#C86446]" />
            <h3 className="mt-4 font-serif text-xl font-bold text-[#1E2421]">No destinations found</h3>
            <p className="mt-2 text-sm text-[#5C645F]">Try clearing your search terms or choosing another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {filtered.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#5C645F]">Loading destinations...</div>}>
      <DestinationsContent />
    </Suspense>
  );
}
