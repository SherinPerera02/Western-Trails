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
    <section className="relative bg-[#FBF9F4] px-4 pt-12 pb-16 sm:px-6 lg:pt-16 lg:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Heading, Copy, Search */}
          <div className="lg:col-span-6 lg:pt-4">
            <span className="block text-sm font-normal text-[#5A635D]">
              Day trips within 25 km of Panadura
            </span>

            <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-[#1E2421] sm:text-6xl lg:text-[62px] lg:leading-[1.08]">
              One day, a few good stops, no guesswork.
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-[#525B55]">
              Temples, lagoons, quiet beaches and a castle up the road. Pick what you like and we&apos;ll put it in an order that makes sense.
            </p>

            {/* Search Box matching Screenshot 1 */}
            <form onSubmit={handleSearch} className="mt-8 flex max-w-md border border-[#C5BFB0] bg-white">
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try "Bolgoda" or "sunset"'
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-[#1E2421] placeholder-[#79817C] outline-none"
              />
              <button
                type="submit"
                className="bg-[#174D44] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#103630]"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Column: Layered Art Collage matching Screenshot 1 */}
          <div className="relative lg:col-span-6 lg:pt-2">
            <div className="relative mx-auto max-w-lg lg:ml-auto lg:mr-0">
              {/* Top-Right Large Card */}
              <div className="relative ml-auto h-72 w-72 sm:h-88 sm:w-88 overflow-hidden rounded-xs bg-[#B5BBA9] shadow-xs">
                <span className="absolute bottom-4 left-5 text-[10px] font-medium tracking-widest text-[#50574F] uppercase">
                  BEACH AT DUSK
                </span>
              </div>

              {/* Bottom area: Overlapping card on the left + Italic caption to its right */}
              <div className="relative -mt-24 sm:-mt-28 flex items-end justify-between">
                {/* Bottom-Left Overlapping Card */}
                <div className="relative z-10 h-52 w-52 sm:h-56 sm:w-56 shrink-0 overflow-hidden rounded-xs border-4 border-[#FBF9F4] bg-[#B9C0AE] shadow-sm">
                  <span className="absolute bottom-3 left-4 text-[9px] font-medium tracking-wider text-[#50574F] uppercase">
                    PHOTO · RANKOTH VIHARAYA
                  </span>
                </div>

                {/* Italic caption placed to the right under the large card */}
                <div className="pb-2 pl-4 sm:pl-6 max-w-[210px] sm:max-w-[230px]">
                  <p className="font-serif italic text-xs sm:text-sm text-[#4E5650] leading-snug">
                    &lsquo;The stupa at Rankoth, ten minutes&rsquo; walk from the bus stand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
