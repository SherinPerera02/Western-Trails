"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin, ArrowRight, Sparkles } from "lucide-react";
import QuickSearch from "./QuickSearch";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-[#121B17] px-4 py-20 sm:px-6 lg:px-8">
      {/* Background Travel Photography */}
      <Image
        src="/images/hero-coast.jpg"
        alt="Sri Lanka tropical coastline and ocean waves"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-85 transition-transform duration-1000"
      />

      {/* Atmospheric Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#121B17] via-black/45 to-black/35 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Top Travel Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-medium tracking-wide text-[#FBF9F4] backdrop-blur-md shadow-xs mb-6">
          <MapPin className="h-3.5 w-3.5 text-[#EFE9DC]" />
          <span>Sri Lanka West Coast · Panadura & Beyond</span>
        </div>

        {/* Hero Heading */}
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] drop-shadow-sm">
          Discover Your Next Journey
        </h1>

        {/* Supporting Text */}
        <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-[#EAE4D7]/90 drop-shadow-xs">
          Explore beautiful destinations, discover unforgettable places, and plan your perfect day trip with Western Trails.
        </p>

        {/* Dual CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/destinations"
            className="flex items-center gap-2 rounded-xl bg-[#174D44] px-6 py-3.5 text-base font-semibold text-[#FBF9F4] shadow-md transition-all hover:bg-[#103630] hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>Explore Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/planner"
            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 active:scale-[0.99]"
          >
            <Compass className="h-4.5 w-4.5" />
            <span>Plan Your Trip</span>
          </Link>
        </div>

        {/* Prominent Quick Search Component */}
        <div className="mt-12 sm:mt-14">
          <QuickSearch />
        </div>
      </div>
    </section>
  );
}
