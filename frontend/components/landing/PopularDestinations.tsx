"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import DestinationCard from "./DestinationCard";
import { POPULAR_DESTINATIONS, Destination } from "@/data/travelData";

export default function PopularDestinations() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? POPULAR_DESTINATIONS
    : POPULAR_DESTINATIONS.filter((d) => d.category.toLowerCase().includes(activeFilter.toLowerCase()));

  return (
    <section id="destinations" className="bg-[#FBF9F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Curated Highlights
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl lg:text-5xl">
              Popular Destinations
            </h2>
            <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
              Explore some of the most beautiful places around Sri Lanka, from serene coastlines to ancient Buddhist heritage sites.
            </p>
          </div>

          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#174D44] hover:text-[#103630] transition-colors group self-start md:self-end"
          >
            <span>View All Destinations</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {filtered.map((destination) => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </div>
    </section>
  );
}
