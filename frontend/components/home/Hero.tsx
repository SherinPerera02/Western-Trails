"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/places?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/places");
    }
  };

  return (
    <section className="relative border-b border-[#E8E2D5] bg-[#FBF9F4] px-4 py-12 sm:px-6 sm:py-18 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Copy, Search */}
          <div className="lg:col-span-7">
            <span className="inline-block border-b-2 border-[#C86446] pb-1 text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Panadura & 25 km around · West Coast, Sri Lanka
            </span>

            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-[#1E2421] sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              One day, a few good stops, no guesswork.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#5C645F] sm:text-lg">
              A quiet guide for when you have one free day on the coast. No hurried itineraries or tourist traps—just the right places in the right order, from morning temple bells to sunset on the beach.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="mt-8 max-w-lg">
              <label htmlFor="search-input" className="sr-only">
                Search places, temples, beaches, or lakes
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C645F]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="search-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search beach, temple, lake, seafood..."
                    className="w-full rounded-md border border-[#D5CCBA] bg-white py-3 pl-10 pr-4 text-sm text-[#1E2421] placeholder-[#5C645F]/70 shadow-xs focus:border-[#174D44] focus:outline-none focus:ring-1 focus:ring-[#174D44]"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-md bg-[#174D44] px-5 py-3 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#103630] sm:w-auto"
                >
                  Search
                </button>
              </div>
              <p className="mt-2 text-xs text-[#5C645F]">
                Try &ldquo;Rankoth Viharaya&rdquo;, &ldquo;Bolgoda Lake&rdquo;, or &ldquo;sunset seafood&rdquo;
              </p>
            </form>
          </div>

          {/* Right Column: Uneven, Overlapping Photo Placeholders */}
          <div className="relative lg:col-span-5 lg:pt-4">
            <div className="relative mx-auto max-w-sm sm:max-w-none">
              {/* Primary Large Tile */}
              <div className="overflow-hidden rounded-lg border border-[#E8E2D5] bg-white p-3 shadow-xs">
                <div className="relative flex aspect-4/3 w-full flex-col justify-between rounded bg-[#DCE5E0] p-4 text-[#174D44]">
                  <span className="self-start rounded bg-white/80 px-2 py-0.5 text-xs font-semibold tracking-wide text-[#174D44]">
                    Featured Sunset
                  </span>
                  <div>
                    <span className="block font-serif text-lg font-bold text-[#1E2421]">
                      Panadura Beach
                    </span>
                    <span className="text-xs text-[#5C645F]">
                      Golden hour near the old railway line · 500 m from station
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[11px] font-mono text-[#5C645F]">
                    [ photo: /public/images/panadura-beach.jpg ]
                  </span>
                </div>
              </div>

              {/* Smaller Overlapping Secondary Tile */}
              <div className="mt-4 sm:-mt-10 sm:ml-auto sm:w-72 sm:translate-x-3 overflow-hidden rounded-lg border border-[#D5CCBA] bg-[#F4F0E8] p-2.5 shadow-sm">
                <div className="flex aspect-16/9 flex-col justify-between rounded bg-[#E4DDD3] p-3 text-[#1E2421]">
                  <span className="self-start rounded bg-[#C86446]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#C86446]">
                    Morning Stop
                  </span>
                  <div>
                    <span className="block font-serif text-sm font-bold text-[#1E2421]">
                      Rankoth Viharaya
                    </span>
                    <span className="text-[11px] text-[#5C645F]">
                      Quiet stupa bell ringing at 6 AM · 2 km inland
                    </span>
                  </div>
                </div>
                <div className="mt-1.5 text-right">
                  <span className="text-[10px] font-mono text-[#5C645F]">
                    [ photo: /public/images/rankoth-viharaya.jpg ]
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
