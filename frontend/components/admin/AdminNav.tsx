"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Layers,
  MapPin,
  ExternalLink,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  Users,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Places", href: "/admin/places", icon: MapPin },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#174D44] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-600/30 flex items-center justify-center border border-emerald-400/30 text-amber-400">
                <Compass className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg tracking-tight text-white leading-none">
                  Western Trails
                </span>
                <span className="text-[10px] font-semibold text-amber-400 tracking-wider uppercase mt-0.5">
                  Admin Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-white/15 text-white shadow-inner font-semibold"
                        : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-emerald-100/70 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Site
            </Link>

            <div className="h-5 w-px bg-emerald-700/60" />

            {/* Admin User Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[10px] text-emerald-200/70 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Admin
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 text-xs text-rose-200 hover:text-white px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/20 transition-colors disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{loggingOut ? "..." : "Sign Out"}</span>
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-800 bg-[#123E37] px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? "bg-white/15 text-white font-semibold" : "text-emerald-100/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-emerald-800/80 flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-xs text-emerald-200 py-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Site
            </Link>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1 text-xs text-rose-300 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
