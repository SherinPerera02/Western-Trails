"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  MapPin,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Compass,
  Users,
  MessageSquare,
  Calendar,
  Star,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface DashboardStats {
  places: {
    total: number;
    active: number;
    trashed: number;
  };
  categories: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    tourists: number;
    admins: number;
  };
  reviews: {
    total: number;
    approved: number;
    pending: number;
    average_rating: number | null;
  };
  plans: {
    total: number;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
  }>;
  recent_reviews: Array<{
    id: number;
    user_name: string;
    place_name: string;
    rating: number;
    comment: string | null;
    status: string;
    formatted_date: string;
  }>;
}

export default function AdminLandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      try {
        const res = await api.get("/admin/stats");
        if (isMounted && res.data?.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStats();
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
            Monitor system operations, manage destinations within the 25 km Panadura tourism radius, review visitor feedback, and administer explorer accounts.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <Compass className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* Real-time System Statistics Overview (REQ-079) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Attractions */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Attractions</span>
            <MapPin className="w-4 h-4 text-[#174D44]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {loading ? "…" : stats?.places.total ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {stats?.places.active ?? 0} active
            </span>
          </div>
          {stats && stats.places.trashed > 0 && (
            <span className="text-[11px] text-stone-400 mt-1 block">
              {stats.places.trashed} in trash
            </span>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Categories</span>
            <Layers className="w-4 h-4 text-[#C88A2C]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {loading ? "…" : stats?.categories.total ?? 0}
            </span>
            <span className="text-xs text-stone-500">
              {stats?.categories.active ?? 0} active
            </span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {loading ? "…" : stats?.users.total ?? 0}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              {stats?.users.active ?? 0} active
            </span>
          </div>
        </div>

        {/* Community Reviews */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Reviews</span>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {loading ? "…" : stats?.reviews.total ?? 0}
            </span>
            {stats?.reviews.average_rating ? (
              <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                {stats.reviews.average_rating}
              </span>
            ) : null}
          </div>
        </div>

        {/* Visit Plans Created */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Visit Plans</span>
            <Calendar className="w-4 h-4 text-[#8C2E1F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
              {loading ? "…" : stats?.plans.total ?? 0}
            </span>
            <span className="text-xs text-stone-500">created</span>
          </div>
        </div>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Places Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#C88A2C] border border-amber-100 flex items-center justify-center mb-4 group-hover:bg-[#C88A2C] group-hover:text-white transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">Places & Attractions</h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              Browse, filter, edit, and soft-delete places. Review Panadura base distance calculations and restore deleted attractions.
            </p>
          </div>
          <Link
            href="/admin/places"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-xs sm:text-sm transition-all"
          >
            <span>Manage Places</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Categories Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#174D44] border border-emerald-100 flex items-center justify-center mb-4 group-hover:bg-[#174D44] group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">Categories</h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              Organize attractions into categories (Beaches, Nature, Religious). Enforce active state and deletion protection.
            </p>
          </div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-xs sm:text-sm transition-all"
          >
            <span>Manage Categories</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Users Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">User Accounts</h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              View registered users, inspect activity (plans, favorites, reviews), and deactivate or remove accounts.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-xs sm:text-sm transition-all"
          >
            <span>Manage Users</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        {/* Reviews Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#8C2E1F] border border-rose-100 flex items-center justify-center mb-4 group-hover:bg-[#8C2E1F] group-hover:text-white transition-colors">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-1">Reviews & Ratings</h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
              Oversee visitor reviews, approve or reject feedback, and delete obsolete or inappropriate comments.
            </p>
          </div>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-[#174D44] text-stone-800 hover:text-white font-medium text-xs sm:text-sm transition-all"
          >
            <span>Moderate Reviews</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activity Sections (Users & Reviews) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#174D44]" />
              <span>Recent Explorers</span>
            </h3>
            <Link href="/admin/users" className="text-xs text-[#174D44] font-semibold hover:underline">
              View All
            </Link>
          </div>

          {stats?.recent_users && stats.recent_users.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {stats.recent_users.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-stone-900">{u.name}</p>
                    <p className="text-[11px] text-stone-500">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {u.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic py-4">No recent users.</p>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>Recent Community Reviews</span>
            </h3>
            <Link href="/admin/reviews" className="text-xs text-[#174D44] font-semibold hover:underline">
              View All
            </Link>
          </div>

          {stats?.recent_reviews && stats.recent_reviews.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {stats.recent_reviews.map((r) => (
                <div key={r.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900">{r.place_name}</span>
                    <div className="flex items-center gap-0.5 text-[#E9B949]">
                      <Star className="w-3 h-3 fill-[#E9B949]" />
                      <span className="text-xs font-bold text-stone-700">{r.rating}</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-stone-600 line-clamp-1 italic">&ldquo;{r.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span>by {r.user_name}</span>
                    <span>{r.formatted_date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400 italic py-4">No community reviews yet.</p>
          )}
        </div>
      </div>

      {/* Quick External Links / Info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Public Tourist Website</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Preview the live tourist-facing destinations, categories, interactive map, and visit planner.
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
