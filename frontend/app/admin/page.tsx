"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  MapPin,
  PlusCircle,
  ExternalLink,
  Info,
  ArrowRight,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function AdminLandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{
    categoryCount: number | null;
    placeCount: number | null;
    loading: boolean;
  }>({
    categoryCount: null,
    placeCount: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      try {
        const [catRes, placeRes] = await Promise.allSettled([
          api.get("/admin/categories"),
          api.get("/admin/places"),
        ]);

        let catCount: number | null = null;
        let placeCount: number | null = null;

        if (catRes.status === "fulfilled" && catRes.value.data?.data) {
          catCount = catRes.value.data.data.length;
        }
        if (placeRes.status === "fulfilled" && placeRes.value.data) {
          // Pagination meta or data array length
          const metaTotal = placeRes.value.data?.meta?.total;
          placeCount = typeof metaTotal === "number" ? metaTotal : placeRes.value.data.data?.length ?? null;
        }

        if (isMounted) {
          setStats({
            categoryCount: catCount,
            placeCount: placeCount,
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#174D44] to-[#1F6358] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-[#174D44]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-medium tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administration Portal
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome back, {user?.name || "Administrator"}
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Manage destinations, attraction categories, visitor guidelines, and coordinates within the Panadura and Western Province tourism boundary.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <Compass className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* Module M7 Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-sm">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900">Admin Overview Area</p>
          <p className="text-amber-800/90 text-xs sm:text-sm mt-0.5">
            This is the landing page for managing categories and places. The complete analytics, visitor charts, and reporting dashboard will be unlocked in Module M7.
          </p>
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Categories Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#174D44] border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-[#174D44] group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-lg font-bold text-stone-900">Categories</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {stats.loading ? "..." : stats.categoryCount !== null ? `${stats.categoryCount} total` : "Manage"}
              </span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              Organize attractions into categories (e.g. Beaches, Historical, Religious). Configure active status and inspect associated places.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-sm transition-all"
          >
            <span>Manage Categories</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Places Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C88A2C] border border-amber-100 flex items-center justify-center mb-4 group-hover:bg-[#C88A2C] group-hover:text-white transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-lg font-bold text-stone-900">Places & Attractions</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {stats.loading ? "..." : stats.placeCount !== null ? `${stats.placeCount} places` : "Manage"}
              </span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              Browse, filter, edit, and soft-delete places. Review Panadura base distance calculations, 25 km radius warnings, and restore deleted attractions.
            </p>
          </div>
          <Link
            href="/admin/places"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-sm transition-all"
          >
            <span>Manage Places</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* New Place Shortcut Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-4 group-hover:bg-[#174D44] group-hover:text-white transition-colors">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-lg font-bold text-stone-900">Add New Place</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Action
              </span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-6">
              Create a new attraction with Sri Lanka coordinates, multi-category tags, visitor guidelines, opening hours, and image uploads.
            </p>
          </div>
          <Link
            href="/admin/places/new"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#174D44] hover:bg-[#133E37] text-white font-medium text-sm shadow-xs transition-all"
          >
            <span>Create New Place</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Quick External Links / Info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Public Tourist Website</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            View live tourist-facing destinations, categories, and map views.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-sm font-medium transition-colors"
        >
          <span>Open Public Portal</span>
          <ExternalLink className="w-4 h-4 text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
