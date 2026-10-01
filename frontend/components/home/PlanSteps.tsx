import Link from "next/link";

const SAMPLE_DAY = [
  {
    step: "01",
    time: "8:30 AM",
    place: "Rankoth Viharaya",
    area: "Panadura town, 2 km inland",
    note: "Start your morning at the quiet sand terrace of Rankoth Viharaya before the midday heat settles in. The white stupa is shaded by ancient Bo trees.",
    hours: "Open from 5:30 AM · Modest white dress recommended",
  },
  {
    step: "02",
    time: "12:30 PM",
    place: "Bolgoda Lake",
    area: "8 km northeast of town",
    note: "Take a 20-minute tuk-tuk ride inland to the lake. Have lunch on a wooden deck by the water—fresh modha fish curry and cold king coconut—followed by a slow boat safari among the reeds.",
    hours: "Best midday dining · Boats leave until 5:00 PM",
  },
  {
    step: "03",
    time: "5:00 PM",
    place: "Panadura Beach",
    area: "Back at the coast, 500 m from station",
    note: "Finish the day with the sea wind. Watch the evening commuter trains roll past right against the beach, buy hot fried crab or prawn wade from the pushcarts, and wait for sunset over the Indian Ocean.",
    hours: "Busiest & liveliest between 5:15 PM and 6:30 PM",
  },
];

export default function PlanSteps() {
  return (
    <section className="border-b border-[#E8E2D5] bg-[#F4F0E8]/40 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C86446]">
            How it works
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl">
            How a day comes together
          </h2>
          <p className="mt-3 text-base leading-relaxed text-[#5C645F]">
            Tell the planner what you like. It connects the dots within a 25 km radius so you spend more time seeing places and less time stuck in tuk-tuk traffic.
          </p>
        </div>

        {/* Route Steps with Thin Dashed Route Line */}
        <div className="relative mt-12">
          {/* Dashed Line: Vertical on mobile, Horizontal on desktop */}
          <div
            className="pointer-events-none absolute left-6 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-[#C86446]/50 lg:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-10 right-10 top-7 hidden h-0.5 border-t-2 border-dashed border-[#C86446]/50 lg:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
            {SAMPLE_DAY.map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col justify-between rounded-lg border border-[#E8E2D5] bg-white p-6 pl-14 shadow-xs lg:pl-6"
              >
                {/* Timeline Marker Dot */}
                <div className="absolute left-4 top-6 flex h-4 w-4 -translate-y-0.5 items-center justify-center rounded-full border-2 border-white bg-[#C86446] shadow-xs lg:static lg:mb-4 lg:self-start">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2 border-b border-[#E8E2D5]/70 pb-3">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#C86446]">
                      Stop {item.step} · {item.time}
                    </span>
                    <span className="text-[11px] text-[#5C645F]">{item.area}</span>
                  </div>

                  <h3 className="mt-3 font-serif text-xl font-bold text-[#1E2421]">
                    {item.place}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[#5C645F]">
                    {item.note}
                  </p>
                </div>

                <div className="mt-5 border-t border-[#E8E2D5]/60 pt-3">
                  <span className="block text-xs font-medium text-[#174D44]">
                    {item.hours}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planner Call to Action */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-lg border border-[#D5CCBA] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h4 className="font-serif text-lg font-bold text-[#1E2421]">
              Want a custom day plan tailored to your rhythm?
            </h4>
            <p className="mt-1 text-sm text-[#5C645F]">
              Choose whether you want religious sites, beach breeze, calm water, or seafood spots.
            </p>
          </div>
          <Link
            href="/planner"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#174D44] px-5 py-3 text-sm font-semibold text-[#FBF9F4] transition-colors hover:bg-[#103630]"
          >
            <span>Open Day Planner</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
