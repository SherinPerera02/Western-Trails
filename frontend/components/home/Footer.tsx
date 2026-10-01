import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E2D5] bg-[#F4F0E8] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand & Note */}
          <div className="md:col-span-6">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#174D44]">
              Western Trails
            </span>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#5C645F]">
              A slow day-trip guide for Sri Lanka&apos;s west coast. Created to help travelers and locals discover coastal temples, inland freshwater lakes, and unhurried sunset beaches within 25 km of Panadura.
            </p>
            <div className="mt-4 text-xs text-[#5C645F]">
              <span>Coverage area: Panadura · Wadduwa · Kalutara · Bolgoda Lake · Moratuwa</span>
            </div>
          </div>

          {/* Guide Links */}
          <div className="md:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E2421]">
              Explore
            </span>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/places" className="text-[#5C645F] hover:text-[#174D44]">
                  All Places
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-[#5C645F] hover:text-[#174D44]">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/planner" className="text-[#5C645F] hover:text-[#174D44]">
                  Plan a Day
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Administration */}
          <div className="md:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E2421]">
              Account
            </span>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-[#5C645F] hover:text-[#174D44]">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-[#5C645F] hover:text-[#174D44]">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#E8E2D5] pt-6 text-xs text-[#5C645F] sm:flex-row sm:items-center">
          <p>
            &copy; {new Date().getFullYear()} Western Trails. All places verified locally.
          </p>
          <p>
            Distances measured from Panadura town centre (6.7133° N, 79.9026° E).
          </p>
        </div>
      </div>
    </footer>
  );
}
