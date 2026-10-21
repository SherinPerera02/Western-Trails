"use client";

import Link from "next/link";
import { X, Heart, CalendarPlus, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Place, PlaceDetail } from "./types";

export type FeatureModalType = "save" | "plan" | null;

interface FeatureNoticeModalProps {
  type: FeatureModalType;
  place: Place | PlaceDetail | { id: number; name: string } | null;
  onClose: () => void;
}

export default function FeatureNoticeModal({
  type,
  place,
  onClose,
}: FeatureNoticeModalProps) {
  const { user } = useAuth();

  if (!type || !place) return null;

  const isSave = type === "save";

  // Case 1: User is not authenticated -> prompt to log in
  if (!user) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
      >
        <div className="relative w-full max-w-md rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#5C645F] hover:bg-[#F4F0E8] hover:text-[#1E2421]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
            {isSave ? <Heart className="h-6 w-6" /> : <CalendarPlus className="h-6 w-6" />}
          </div>

          <h3
            id="auth-prompt-title"
            className="font-serif text-xl font-bold text-[#1E2421]"
          >
            {isSave ? "Log in to save places" : "Log in to plan your day trip"}
          </h3>

          <p className="mt-2 text-sm text-[#5C645F] leading-relaxed">
            {isSave
              ? `Sign in to your Western Trails account to bookmark ${place.name} and manage your personalized travel favorites.`
              : `Sign in to your Western Trails account to add ${place.name} to customized day-trip itineraries.`}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#174D44] py-2.5 px-4 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-colors hover:bg-[#103630]"
            >
              <LogIn className="h-4 w-4" />
              <span>Log in</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#D8D2C5] bg-white py-2.5 px-4 text-sm font-semibold text-[#1E2421] transition-colors hover:bg-[#F8F5EE]"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User is authenticated -> show feature roadmap / coming soon notice (modules M5 & M6)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feature-notice-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#5C645F] hover:bg-[#F4F0E8] hover:text-[#1E2421]"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
          <Sparkles className="h-6 w-6" />
        </div>

        <h3
          id="feature-notice-title"
          className="font-serif text-xl font-bold text-[#1E2421]"
        >
          {isSave ? "Saved Places — Coming in Module M5" : "Trip Planner — Coming in Module M6"}
        </h3>

        <p className="mt-2 text-sm text-[#5C645F] leading-relaxed">
          {isSave
            ? `Thanks for your interest, ${user.name}! Cloud-synced favorites and custom place collections are currently being finalized in Module M5. ${place.name} will be ready to save once the module is enabled.`
            : `Hello ${user.name}! The multi-stop Trip Planner is coming in Module M6. You will be able to organize ${place.name} alongside other western coast destinations into optimized schedules.`}
        </p>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#174D44] py-2.5 px-4 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-colors hover:bg-[#103630]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
