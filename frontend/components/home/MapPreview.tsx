import Link from "next/link";

export default function MapPreview() {
  return (
    <section className="bg-[#16483E] px-4 py-16 text-white sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Heading & Copy matching Screenshot 3 */}
          <div className="lg:col-span-5">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[44px] lg:leading-[1.12]">
              Everything sits along one stretch of coast
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#D0DDD7] max-w-md">
              From Bolgoda in the north to Kalutara in the south is about 25 km. Most stops are a short tuk-tuk ride from the Galle Road.
            </p>

            <Link
              href="/map"
              className="inline-block mt-8 text-sm font-medium text-white underline underline-offset-4 hover:text-[#D5EAE2] transition-colors"
            >
              Open the map
            </Link>
          </div>

          {/* Right Column: Parchment Map Card matching Screenshot 3 */}
          <div className="lg:col-span-7">
            <div className="relative flex overflow-hidden rounded-xs border border-[#2B5E54] bg-[#E1D7BF] h-[340px] sm:h-[380px] shadow-sm select-none">
              {/* Left Sea Strip */}
              <div className="w-16 sm:w-20 bg-[#54776D] shrink-0 flex items-center justify-center border-r border-[#4A6D63]" />

              {/* Main Map Parchment Area */}
              <div className="relative flex-1 bg-[#E1D7BF] p-6 sm:p-8">
                {/* 1. Bolgoda Lake (Top-Right) */}
                <div className="absolute top-[16%] right-[22%] sm:right-[26%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Bolgoda Lake
                  </span>
                </div>

                {/* 2. Rankoth Viharaya (Top-Center) */}
                <div className="absolute top-[28%] left-[36%] sm:left-[40%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Rankoth Viharaya
                  </span>
                </div>

                {/* 3. Panadura Beach (Upper Coast) */}
                <div className="absolute top-[38%] left-[10%] sm:left-[12%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Panadura Beach
                  </span>
                </div>

                {/* 4. Wadduwa Beach (Mid Coast) */}
                <div className="absolute top-[58%] left-[18%] sm:left-[22%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Wadduwa Beach
                  </span>
                </div>

                {/* 5. Kalutara Bodhiya (Lower Coast) */}
                <div className="absolute bottom-[20%] left-[28%] sm:left-[32%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Kalutara Bodhiya
                  </span>
                </div>

                {/* 6. Richmond Castle (Lower Inland) */}
                <div className="absolute bottom-[26%] right-[16%] sm:right-[22%] flex items-center gap-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#A8522E] shrink-0" />
                  <span className="font-sans text-xs sm:text-sm font-medium text-[#222A26]">
                    Richmond Castle
                  </span>
                </div>

                {/* Bottom-Right Note */}
                <span className="absolute bottom-3 right-4 font-sans text-[10px] sm:text-[11px] text-[#7A7360] italic">
                  Sea on the left · not to scale
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

