import Link from "next/link";

const CATEGORIES = [
  { name: "Beach", note: "Sunset & sand", color: "border-[#C86446]/40" },
  { name: "Religious", note: "Temples & stupas", color: "border-[#D5CCBA]" },
  { name: "Nature", note: "Lakes & wetlands", color: "border-[#4A6B42]/40" },
  { name: "Heritage", note: "Colonial mansions", color: "border-[#D5CCBA]" },
  { name: "Restaurant", note: "Local seafood", color: "border-[#C86446]/40" },
  { name: "Resort", note: "Quiet day rooms", color: "border-[#D5CCBA]" },
  { name: "Recreation", note: "Boat rides & parks", color: "border-[#4A6B42]/40" },
];

export default function CategoryRow() {
  return (
    <section className="border-b border-[#E8E2D5] bg-[#F4F0E8]/50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5C645F]">
            Browse by type of stop
          </span>
          <span className="hidden text-xs text-[#5C645F] sm:inline">
            7 categories within 25 km
          </span>
        </div>

        {/* Scrollable pill container on mobile, wrapping on desktop */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={`/places?category=${encodeURIComponent(cat.name)}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#D5CCBA] bg-white px-3.5 py-2 text-sm transition-colors hover:border-[#174D44] hover:bg-[#EFE9DC]/60"
            >
              <span className="font-medium text-[#1E2421] group-hover:text-[#174D44]">
                {cat.name}
              </span>
              <span className="text-[11px] text-[#5C645F]">
                {cat.note}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
