import Link from "next/link";

const CATEGORIES = [
  "Beach",
  "Religious",
  "Nature",
  "Heritage",
  "Restaurant",
  "Resort",
  "Recreation",
];

export default function CategoryRow() {
  return (
    <section className="border-b border-[#DDD5C4] bg-[#EAE1D2] px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto no-scrollbar sm:gap-3.5">
        <span className="font-serif text-lg font-bold tracking-tight text-[#1E2421] shrink-0 mr-1 sm:mr-2">
          Looking for
        </span>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/places?category=${encodeURIComponent(cat)}`}
              className="inline-flex shrink-0 items-center justify-center border border-[#C5BAA5] bg-[#E4DAC7] px-3.5 py-1 text-xs sm:text-sm font-medium text-[#262F2A] transition-colors hover:border-[#174D44] hover:bg-white rounded-xs shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

