import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import TripCard from "./TripCard";
import { FEATURED_DAY_TRIPS } from "@/data/travelData";

export default function FeaturedDayTrips() {
  return (
    <section id="trips" className="bg-[#F4EFE6]/60 px-4 py-20 sm:px-6 lg:px-8 border-t border-[#EAE4D7]">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Ready-to-Explore Routes
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl lg:text-5xl">
              Plan Your Perfect Day Trip
            </h2>
            <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
              Handcrafted itineraries designed so you don&apos;t double back. Tailored for easy morning departures and relaxing sunset finishes.
            </p>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-3 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] self-start md:self-end"
          >
            <Compass className="h-4 w-4" />
            <span>Customize Your Own Itinerary</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {FEATURED_DAY_TRIPS.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </section>
  );
}
