import Link from "next/link";
import { Compass, MapPin, ArrowRight } from "lucide-react";

export default function TripPlannerCTA() {
  return (
    <section className="relative overflow-hidden bg-[#174D44] px-4 py-20 sm:px-6 lg:px-8 text-[#FBF9F4]">
      {/* Decorative subtle background accents */}
      <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#C86446]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#EAE4D7] backdrop-blur-md mb-6">
          <Compass className="h-3.5 w-3.5" />
          <span>Interactive Day Trip Planner</span>
        </span>

        <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Ready to Plan Your Next Adventure?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-[#EAE4D7]/90 leading-relaxed">
          Create your own itinerary and discover amazing places worth visiting. Pick what you like, and we&apos;ll order them so your day flows effortlessly.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/planner"
            className="flex items-center gap-2 rounded-xl bg-[#FBF9F4] px-7 py-3.5 text-base font-semibold text-[#174D44] shadow-md transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>Start Planning</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/destinations"
            className="flex items-center gap-2 rounded-xl border border-white/30 bg-transparent px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/15 active:scale-[0.99]"
          >
            <span>Explore Destinations</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
