import Link from "next/link";
import { Compass, MapPin, Mail, Globe, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#E8E2D5] bg-[#F4EFE6] text-[#1E2421]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#174D44] text-[#FBF9F4] shadow-xs">
                <Compass className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#174D44]">
                Western Trails
              </span>
            </Link>

            <p className="mt-4 font-serif text-lg italic text-[#2D3732]">
              &ldquo;Discover Sri Lanka. Plan unforgettable journeys.&rdquo;
            </p>

            <p className="mt-3 text-sm leading-relaxed text-[#5C645F] max-w-sm">
              Your authentic guide to the beaches, temples, lagoons, and heritage estates of Sri Lanka&apos;s west coast. One day, a few good stops, no guesswork.
            </p>

            <div className="mt-6 flex items-center gap-3 text-sm text-[#5C645F]">
              <MapPin className="h-4 w-4 text-[#C86446]" />
              <span>Panadura & Coastal Trails · Western Province</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#174D44]">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#3D4540]">
              <li>
                <Link href="/" className="hover:text-[#174D44] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-[#174D44] transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[#174D44] transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-[#174D44] transition-colors">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#174D44] transition-colors">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#174D44] transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Resources Column */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#174D44]">
              Account
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#3D4540]">
              <li>
                <Link href="/login" className="hover:text-[#174D44] transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#174D44] transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#174D44] transition-colors">
                  Saved Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social Column */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#174D44]">
              Connect
            </h4>
            <p className="mt-4 text-xs text-[#5C645F] leading-relaxed">
              Have a hidden spot to share? Get in touch with our local editorial team.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#contact"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white text-[#3D4540] transition-colors hover:border-[#174D44] hover:text-[#174D44]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="#contact"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white text-[#3D4540] transition-colors hover:border-[#174D44] hover:text-[#174D44]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#contact"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white text-[#3D4540] transition-colors hover:border-[#174D44] hover:text-[#174D44]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#E2DAC8] pt-8 text-xs text-[#5C645F] sm:flex-row">
          <p>© 2026 Western Trails. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/#about" className="hover:text-[#174D44] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/#about" className="hover:text-[#174D44] transition-colors">
              Terms of Service
            </Link>
            <Link href="/#about" className="hover:text-[#174D44] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
