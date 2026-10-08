"use client";

import Link from "next/link";
import { Heart, Compass, BookmarkCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FavoritesSection() {
  const { user } = useAuth();

  return (
    <section className="bg-[#FBF9F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E8E2D5] bg-white p-8 sm:p-12 md:p-16 shadow-xs">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12">
          {/* Left Column: Visual Icon & Badge */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FDF2F0] text-[#8C2E1F] shadow-inner">
              <Heart className="h-10 w-10 fill-[#8C2E1F]" strokeWidth={1.75} />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#174D44] text-white shadow-xs">
                <BookmarkCheck className="h-4 w-4" />
              </span>
            </div>

            <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Personalized Journeys
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl">
              Keep Your Favorite Places Close
            </h2>
          </div>

          {/* Right Column: Description & Action */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-base sm:text-lg text-[#5C645F] leading-relaxed">
              Save destinations you love and easily add them to your future trips. Whether it&apos;s a hidden coastal viewpoint or a quiet lakeside curry stop, your dream spots will always be one click away.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/destinations"
                className="flex items-center gap-2 rounded-xl bg-[#174D44] px-6 py-3.5 text-base font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] active:scale-[0.99]"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {user ? (
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-3.5 text-base font-semibold text-[#1E2421] transition-colors hover:bg-[#F4F0E8]"
                >
                  <Heart className="h-4 w-4 text-[#8C2E1F] fill-current" />
                  <span>View My Favorites</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-3.5 text-base font-semibold text-[#1E2421] transition-colors hover:bg-[#F4F0E8]"
                >
                  <span>Sign In to Sync</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
