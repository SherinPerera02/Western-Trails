import Link from "next/link";

export default function MapPreview() {
  return (
    <section className="border-b border-[#E8E2D5] bg-[#FBF9F4] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Context and Key Distances */}
          <div className="lg:col-span-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C86446]">
              Orientation
            </span>

            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl">
              Everything is within a 25 km ride
            </h2>

            <p className="mt-4 text-base leading-relaxed text-[#5C645F]">
              From the quiet freshwater backwaters of Bolgoda to the colonial estates of Kalutara, every stop in Western Trails is reachable in under 45 minutes by tuk-tuk or scooter from the Panadura clock tower.
            </p>

            {/* Plain Text Distance Guide */}
            <div className="mt-6 border-t border-[#E8E2D5] pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#174D44]">
                Typical travel times from town centre
              </span>
              <ul className="mt-3 space-y-2 text-sm text-[#1E2421]">
                <li className="flex items-baseline justify-between border-b border-[#E8E2D5]/50 pb-1.5">
                  <span className="font-medium">Panadura Beach & Promenade</span>
                  <span className="text-xs text-[#5C645F]">3 min · 800 m</span>
                </li>
                <li className="flex items-baseline justify-between border-b border-[#E8E2D5]/50 pb-1.5">
                  <span className="font-medium">Rankoth Viharaya (Temple)</span>
                  <span className="text-xs text-[#5C645F]">5 min · 1.8 km</span>
                </li>
                <li className="flex items-baseline justify-between border-b border-[#E8E2D5]/50 pb-1.5">
                  <span className="font-medium">Bolgoda Lake Waterfront</span>
                  <span className="text-xs text-[#5C645F]">15 min · 7.5 km</span>
                </li>
                <li className="flex items-baseline justify-between border-b border-[#E8E2D5]/50 pb-1.5">
                  <span className="font-medium">Wadduwa Coconut Coast</span>
                  <span className="text-xs text-[#5C645F]">12 min · 6.2 km</span>
                </li>
                <li className="flex items-baseline justify-between">
                  <span className="font-medium">Kalutara Bodhiya & Richmond Castle</span>
                  <span className="text-xs text-[#5C645F]">30 min · 16–18 km</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-md bg-[#174D44] px-5 py-3 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#103630]"
              >
                <span>Open interactive map</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Handcrafted Map Graphic Preview Card */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-lg border border-[#D5CCBA] bg-[#EFE9DC]/70 p-6 shadow-xs">
              {/* Decorative Guidebook Map Canvas */}
              <div className="relative flex aspect-4/3 flex-col justify-between rounded border border-[#D5CCBA] bg-[#FBF9F4] p-5">
                {/* Coastal Marker Water Line */}
                <div className="absolute right-0 top-0 bottom-0 w-24 border-l border-dashed border-[#174D44]/30 bg-[#DCE5E0]/40 sm:w-32">
                  <span className="absolute bottom-4 right-3 -rotate-90 text-[10px] font-semibold uppercase tracking-widest text-[#174D44]/60">
                    Indian Ocean
                  </span>
                </div>

                {/* Simulated Landmarks on the Corridor */}
                <div className="relative z-10 flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#174D44]" />
                    <span className="font-semibold text-[#1E2421]">Bolgoda Lake Basin</span>
                    <span className="text-[10px] text-[#5C645F]">(North inland)</span>
                  </div>

                  <div className="ml-6 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#C86446]" />
                    <span className="font-medium text-[#1E2421]">Rankoth Viharaya</span>
                  </div>

                  <div className="flex items-center gap-2 rounded bg-[#EFE9DC] px-2 py-1 self-start font-serif font-bold text-[#174D44]">
                    <span>★ Panadura Clock Tower (0 km hub)</span>
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#174D44]" />
                    <span className="font-medium text-[#1E2421]">Panadura Beach & Pier</span>
                  </div>

                  <div className="ml-8 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#5C645F]" />
                    <span className="font-medium text-[#1E2421]">Wadduwa Fishing Shore</span>
                  </div>

                  <div className="ml-12 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#C86446]" />
                    <span className="font-semibold text-[#1E2421]">Kalutara Bodhiya & Richmond Castle</span>
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#E8E2D5] pt-3 text-[11px] text-[#5C645F]">
                  <span>25 km maximum radius</span>
                  <Link
                    href="/map"
                    className="font-semibold text-[#174D44] hover:underline"
                  >
                    View coordinates on full map →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
