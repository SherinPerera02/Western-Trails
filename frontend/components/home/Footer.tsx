import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#D5C9B3] bg-[#E1D7C4] px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        {/* Brand & Tagline matching Screenshot 5 */}
        <div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#174D44]">
            Western Trails
          </span>
          <p className="mt-1 text-sm text-[#4E5751]">
            Day trips around Panadura, written by people who live here.
          </p>
        </div>

        {/* Links matching Screenshot 5 */}
        <nav className="flex items-center gap-6 sm:gap-8 text-sm font-medium text-[#1E2421]">
          <Link
            href="/places"
            className="hover:text-[#174D44] transition-colors"
          >
            Places
          </Link>
          <Link
            href="/map"
            className="hover:text-[#174D44] transition-colors"
          >
            Map
          </Link>
          <Link
            href="/planner"
            className="hover:text-[#174D44] transition-colors"
          >
            Plan a day
          </Link>
        </nav>
      </div>
    </footer>
  );
}
