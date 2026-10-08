"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Clock, MapPin, CheckCircle2, Sparkles } from "lucide-react";
import Footer from "@/components/home/Footer";
import TripCard from "@/components/landing/TripCard";
import { FEATURED_DAY_TRIPS, POPULAR_DESTINATIONS } from "@/data/travelData";

export default function PlannerPage() {
  const [selectedStops, setSelectedStops] = useState<string[]>([
    "panadura-beach",
    "bolgoda-lake",
  ]);

  const toggleStop = (id: string) => {
    if (selectedStops.includes(id)) {
      setSelectedStops(selectedStops.filter((s) => s !== id));
    } else {
      setSelectedStops([...selectedStops, id]);
    }
  };

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
            <Compass className="h-4 w-4" />
            <span>Day Trip Optimizer</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1E2421]">
            Plan Your Day Trip
          </h1>
          <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
            Select the places you want to visit around Panadura and the western coast. We organize them in a sequence that prevents backtracking.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-1">
        {/* Interactive Trip Builder */}
        <div className="mb-16 rounded-3xl border border-[#E8E2D5] bg-white p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-[#EAE4D7]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#174D44]">
                Step 1 · Choose Destinations
              </span>
              <h2 className="mt-1 font-serif text-2xl font-bold text-[#1E2421]">
                Select stops for your day
              </h2>
              <p className="text-sm text-[#5C645F] mt-1">
                Selected {selectedStops.length} stops for your customized itinerary.
              </p>
            </div>

            <button
              onClick={() =>
                alert("Itinerary created! Order optimized for minimal travel time.")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D44] px-6 py-3 text-sm font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Optimized Itinerary</span>
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULAR_DESTINATIONS.map((dest) => {
              const selected = selectedStops.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  onClick={() => toggleStop(dest.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? "border-[#174D44] bg-[#EFE9DC]/40 shadow-xs"
                      : "border-[#E8E2D5] bg-[#FBF9F4]/50 hover:bg-white hover:border-[#D5CCBA]"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      selected
                        ? "border-[#174D44] bg-[#174D44] text-white"
                        : "border-[#C5BFB0] bg-white"
                    }`}
                  >
                    {selected && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#1E2421]">
                      {dest.name}
                    </h4>
                    <p className="text-xs text-[#5C645F] mt-0.5">
                      {dest.location} · {dest.distance}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Routes */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1E2421] mb-6">
            Recommended Ready-to-Go Trips
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {FEATURED_DAY_TRIPS.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
