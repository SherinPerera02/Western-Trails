"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Compass, SlidersHorizontal, ArrowRight } from "lucide-react";

export default function QuickSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("all");
  const [distance, setDistance] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (category !== "all") params.set("category", category);
    if (distance !== "all") params.set("distance", distance);

    const queryStr = params.toString();
    router.push(`/destinations${queryStr ? `?${queryStr}` : ""}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto rounded-2xl border border-white/20 bg-white/95 p-3 sm:p-4 shadow-xl backdrop-blur-md"
    >
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-12 md:items-center">
        {/* Destination Search Input */}
        <div className="relative md:col-span-5">
          <div className="flex items-center rounded-xl bg-[#F8F5EE] px-3.5 py-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#174D44]/20">
            <MapPin className="h-5 w-5 shrink-0 text-[#174D44]" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              className="ml-2.5 w-full bg-transparent text-sm font-medium text-[#1E2421] placeholder-[#5C645F]/70 outline-none"
            />
          </div>
        </div>

        {/* Category Selector */}
        <div className="relative md:col-span-3">
          <div className="flex items-center rounded-xl bg-[#F8F5EE] px-3.5 py-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#174D44]/20">
            <Compass className="h-5 w-5 shrink-0 text-[#174D44]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="ml-2.5 w-full bg-transparent text-sm font-medium text-[#1E2421] outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Beaches">Beaches</option>
              <option value="Nature">Nature</option>
              <option value="Historical">Historical</option>
              <option value="Cultural">Cultural</option>
              <option value="Religious">Religious</option>
              <option value="Adventure">Adventure</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Family">Family</option>
            </select>
          </div>
        </div>

        {/* Distance Filter */}
        <div className="relative md:col-span-2">
          <div className="flex items-center rounded-xl bg-[#F8F5EE] px-3.5 py-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#174D44]/20">
            <SlidersHorizontal className="h-4.5 w-4.5 shrink-0 text-[#174D44]" />
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              aria-label="Filter by distance"
              className="ml-2 w-full bg-transparent text-sm font-medium text-[#1E2421] outline-none cursor-pointer"
            >
              <option value="all">Any Distance</option>
              <option value="5">Within 5 km</option>
              <option value="15">Within 15 km</option>
              <option value="25">Within 25 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>
        </div>

        {/* Search Action Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#174D44] py-3.5 px-4 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] hover:shadow-md active:scale-[0.99]"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
