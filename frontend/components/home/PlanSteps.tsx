import Link from "next/link";

const ITINERARY = [
  {
    time: "7:30 am",
    title: "Rankoth Viharaya",
    description: "Go early while it's cool. Open from dawn, cover shoulders and knees.",
  },
  {
    time: "10:00 am",
    title: "Richmond Castle",
    description: "About 20 km south. Open 9 to 4, closed on poya days.",
  },
  {
    time: "1:00 pm",
    title: "Lunch by Bolgoda Lake",
    description: "Rice and curry at a lakeside place, then a slow boat ride if it's not too hot.",
  },
  {
    time: "5:45 pm",
    title: "Sunset on Panadura Beach",
    description: "2 km from Panadura town. Stay until the fishing boats come in.",
  },
];

export default function PlanSteps() {
  return (
    <section className="bg-[#FBF9F4] px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column matching Screenshots 4 & 5 */}
          <div className="lg:col-span-5">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-[#1E2421] sm:text-5xl lg:text-[48px] lg:leading-[1.12]">
              How a day gets planned
            </h2>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#555E59] max-w-md">
              Tell the planner what you&apos;re in the mood for and when you can start. It picks a handful of stops, orders them so you&apos;re not doubling back, and fits them around opening hours. Here&apos;s one it made.
            </p>

            <Link
              href="/planner"
              className="inline-block mt-8 rounded-xs bg-[#9E5432] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#854324] shadow-xs"
            >
              Plan my day
            </Link>
          </div>

          {/* Right Column: Vertical Dashed Itinerary Timeline matching Screenshots 4 & 5 */}
          <div className="lg:col-span-7 lg:pt-2">
            <div className="relative border-l border-dashed border-[#B86B4D] ml-3 sm:ml-4 pl-8 sm:pl-10 space-y-10 sm:space-y-12">
              {ITINERARY.map((item) => (
                <div key={item.title} className="relative">
                  {/* Hollow Circle on the dashed line */}
                  <span
                    className="absolute -left-[39px] sm:-left-[47px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#B86B4D] bg-[#FBF9F4]"
                    aria-hidden="true"
                  />

                  {/* Time label */}
                  <span className="block text-xs font-normal text-[#5C645F]">
                    {item.time}
                  </span>

                  {/* Stop Title */}
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1E2421] mt-0.5">
                    {item.title}
                  </h3>

                  {/* Stop Description */}
                  <p className="mt-1 text-sm text-[#5C645F] leading-relaxed max-w-lg">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

