"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      setMobileMenuOpen(false);
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8E2D5] bg-[#FBF9F4]/95 backdrop-blur-xs">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-7">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#174D44] text-[#FBF9F4]">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="font-serif text-xl font-bold tracking-tight text-[#174D44]">
              Western Trails
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main Navigation">
            <Link
              href="/places"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive("/places")
                  ? "bg-[#EFE9DC] text-[#174D44] font-semibold"
                  : "text-[#1E2421]/80 hover:bg-[#F4F0E8] hover:text-[#174D44]"
              }`}
            >
              Places
            </Link>
            <Link
              href="/map"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive("/map")
                  ? "bg-[#EFE9DC] text-[#174D44] font-semibold"
                  : "text-[#1E2421]/80 hover:bg-[#F4F0E8] hover:text-[#174D44]"
              }`}
            >
              Map
            </Link>
            <Link
              href="/planner"
              className={`inline-flex items-center gap-1.5 rounded-full border border-[#D5CCBA] px-3.5 py-1 text-xs font-semibold tracking-wide transition-colors ${
                isActive("/planner")
                  ? "bg-[#174D44] text-[#FBF9F4] border-[#174D44]"
                  : "bg-[#F4F0E8] text-[#174D44] hover:border-[#174D44]"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#C86446]" />
              Plan a day
            </Link>
          </nav>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-[#E8E2D5]" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm text-[#1E2421]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFE9DC] text-xs font-semibold text-[#174D44]">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[130px] truncate font-medium">{user.name}</span>
              </span>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`rounded-md border border-[#174D44]/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#174D44] hover:bg-[#EFE9DC] ${
                    isActive("/admin") ? "bg-[#EFE9DC]" : ""
                  }`}
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-md border border-[#D5CCBA] bg-white px-3 py-1 text-xs font-medium text-[#1E2421] transition-colors hover:bg-[#F4F0E8] disabled:opacity-60"
              >
                {loggingOut ? "..." : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-[#1E2421] hover:text-[#174D44]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#174D44] px-3.5 py-1.5 text-sm font-medium text-[#FBF9F4] transition-colors hover:bg-[#103630]"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-1.5 text-[#1E2421] hover:bg-[#F4F0E8] focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8E2D5] bg-[#FBF9F4] px-4 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            <Link
              href="/places"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 text-base font-medium ${
                isActive("/places") ? "bg-[#EFE9DC] text-[#174D44] font-semibold" : "text-[#1E2421]"
              }`}
            >
              Places
            </Link>
            <Link
              href="/map"
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-md px-3 py-2 text-base font-medium ${
                isActive("/map") ? "bg-[#EFE9DC] text-[#174D44] font-semibold" : "text-[#1E2421]"
              }`}
            >
              Map
            </Link>
            <Link
              href="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-[#174D44] ${
                isActive("/planner") ? "bg-[#EFE9DC] font-semibold" : ""
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#C86446]" />
              Plan a day
            </Link>

            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-[#174D44]"
              >
                Admin Dashboard
              </Link>
            )}

            <div className="mt-3 border-t border-[#E8E2D5] pt-3">
              {loading ? (
                <div className="h-9 w-full animate-pulse rounded bg-[#E8E2D5]" />
              ) : user ? (
                <div className="flex flex-col gap-2.5">
                  <div className="px-1 text-sm">
                    <span className="block font-semibold text-[#1E2421]">{user.name}</span>
                    <span className="block text-xs text-[#5C645F]">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full rounded-md border border-[#D5CCBA] bg-white py-2 text-center text-sm font-medium text-[#1E2421]"
                  >
                    {loggingOut ? "..." : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-md border border-[#D5CCBA] bg-white py-2 text-center text-sm font-medium text-[#1E2421]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-md bg-[#174D44] py-2 text-center text-sm font-medium text-[#FBF9F4]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
