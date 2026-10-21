"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Menu, X, Heart, MapPin, User as UserIcon, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { totalItemsCount } = usePlan();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Standalone authentication and admin pages must NOT display the consumer navbar
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) {
    return null;
  }

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

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Places", href: "/places" },
    { label: "Map", href: "/map" },
    { label: "Destinations", href: "/destinations" },
    { label: "Explore", href: "/explore" },
    { label: "Trip Planner", href: "/planner" },
    { label: "Saved", href: "/saved" },
    { label: "About", href: "/#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAE4D7] bg-[#FBF9F4]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Western Trails Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#174D44] text-[#FBF9F4] shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Compass
              className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45"
              strokeWidth={1.8}
            />
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1E2421]">
            Western Trails
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  active
                    ? "text-[#174D44] font-semibold bg-[#EFE9DC]/60"
                    : "text-[#3D4540] hover:text-[#174D44] hover:bg-[#F3EFE6]"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#174D44] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Authentication / User State (Desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Visit Planner quick link with stop counter */}
          <Link
            href="/planner"
            className="relative flex h-9 items-center gap-1.5 rounded-lg border border-[#D8D2C5] bg-white px-2.5 text-[#5C645F] transition-colors hover:border-[#174D44] hover:text-[#174D44]"
            title="Your visit plan"
          >
            <Calendar className="h-4 w-4 text-[#174D44]" />
            <span className="text-xs font-semibold text-[#1E2421]">Plan</span>
            {totalItemsCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#174D44] px-1 text-[11px] font-bold text-white">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-lg bg-[#E8E2D5]" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/saved"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8D2C5] bg-white text-[#5C645F] transition-colors hover:border-[#174D44] hover:text-[#174D44]"
                title="Your saved places"
              >
                <Heart className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2 rounded-lg border border-[#D8D2C5] bg-white px-3 py-1.5 shadow-2xs">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#174D44] text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium text-[#1E2421]">
                  {user.name}
                </span>
              </div>

              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-lg border border-[#174D44]/40 bg-[#EFE9DC] px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#174D44] transition-colors hover:bg-[#E4DDD3]"
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg border border-[#D5CCBA] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1E2421] transition-colors hover:bg-[#F4F0E8] disabled:opacity-60"
              >
                {loggingOut ? "…" : "Logout"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-[#1E2421] transition-colors hover:text-[#174D44]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[#174D44] px-4.5 py-2 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] hover:shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg border border-[#D8D2C5] bg-white p-2 text-[#1E2421] shadow-2xs transition-colors hover:bg-[#F4F0E8] focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#1E2421]" />
            ) : (
              <Menu className="h-6 w-6 text-[#1E2421]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E8E2D5] bg-[#FBF9F4] px-4 pb-6 pt-3 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const isPlanner = link.href === "/planner";
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 text-base font-medium transition-colors ${
                    active
                      ? "bg-[#EFE9DC] text-[#174D44] font-semibold"
                      : "text-[#1E2421] hover:bg-[#F3EFE6]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isPlanner && totalItemsCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#174D44] px-1.5 text-xs font-bold text-white">
                      {totalItemsCount}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mt-4 border-t border-[#E8E2D5] pt-4">
              {loading ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-[#E8E2D5]" />
              ) : user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#174D44] text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="overflow-hidden text-sm">
                      <p className="truncate font-semibold text-[#1E2421]">{user.name}</p>
                      <p className="truncate text-xs text-[#5C645F]">{user.email}</p>
                    </div>
                  </div>

                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg bg-[#EFE9DC] py-2 text-center text-xs font-semibold uppercase tracking-wider text-[#174D44]"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full rounded-lg border border-[#D5CCBA] bg-white py-2.5 text-center text-sm font-medium text-[#1E2421]"
                  >
                    {loggingOut ? "Logging out…" : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg border border-[#D5CCBA] bg-white py-2.5 text-center text-sm font-semibold text-[#1E2421] transition-colors hover:bg-[#F4F0E8]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg bg-[#174D44] py-2.5 text-center text-sm font-semibold text-[#FBF9F4] shadow-xs transition-colors hover:bg-[#103630]"
                  >
                    Sign Up
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
