"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Heart,
  CalendarPlus,
  Share2,
  Check,
  X,
  Info,
} from "lucide-react";
import { PlaceCategory, PlaceDetail } from "./types";
import FeatureNoticeModal, { FeatureModalType } from "./FeatureNoticeModal";
import { usePlan } from "@/context/PlanContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCompare } from "@/context/CompareContext";

interface PlaceDetailHeaderProps {
  place: PlaceDetail;
}

export default function PlaceDetailHeader({ place }: PlaceDetailHeaderProps) {
  const { isInPlan, addToPlan, removeFromPlan } = usePlan();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  const [modalType, setModalType] = useState<FeatureModalType>(null);
  const [copied, setCopied] = useState(false);
  const inPlan = isInPlan(place.id);
  const isFav = isFavorite(place.id);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const hasRating =
    place.average_rating !== null &&
    place.average_rating !== undefined &&
    place.average_rating > 0;

  return (
    <>
      <header className="border-b border-[#E8E2D5] pb-8 pt-2">
        {/* Category Pills & Top Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {place.categories?.map((cat: PlaceCategory) => (
              <Link
                key={cat.id}
                href={`/places?category=${encodeURIComponent(cat.name)}`}
                className="rounded-full bg-[#EAE4D7] px-3.5 py-1 text-xs font-semibold text-[#174D44] transition-colors hover:bg-[#D5EAE2]"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Quick Share */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this place"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8E2D5] bg-white px-3 py-1.5 text-xs font-medium text-[#5C645F] transition-colors hover:bg-[#F8F5EE] hover:text-[#1E2421]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Place Title (H1) */}
        <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl md:text-5xl lg:leading-tight">
          {place.name}
        </h1>

        {/* Metadata Strip: Distance, REQ-008 Note, Rating (if present) */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-[#5C645F]">
          {/* Distance from Panadura */}
          {place.distance_km !== null && place.distance_km !== undefined && (
            <div className="flex items-center gap-1.5 font-medium text-[#1E2421]">
              <MapPin className="h-4 w-4 text-[#C86446] shrink-0" />
              <span>{place.distance_km} km from Panadura</span>
              {/* REQ-008 explicit requirement */}
              <span className="inline-flex items-center gap-0.5 text-xs font-normal text-[#736B5E]">
                <Info className="h-3 w-3 text-[#A89F91]" />
                <span className="italic">Distances are approximate</span>
              </span>
            </div>
          )}

          {/* Rating (Rendered ONLY if it exists) */}
          {hasRating && (
            <div className="flex items-center gap-1.5 rounded-md bg-[#FFF7E8] px-2.5 py-1 text-xs font-semibold text-[#8C6200] border border-[#F3E2B8]">
              <Star className="h-3.5 w-3.5 fill-[#E9B949] text-[#E9B949]" />
              <span>{place.average_rating?.toFixed(1)}</span>
              {place.reviews_count > 0 && (
                <span className="font-normal text-[#8C754A]">
                  ({place.reviews_count} {place.reviews_count === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons: Save, Add to Plan, Compare */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Save / Favorite Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(place.id, place.name)}
            aria-label={isFav ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
            className="group/save inline-flex items-center justify-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E2421] shadow-2xs transition-all hover:bg-[#F8F5EE] hover:border-[#174D44]/30 active:scale-98"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFav ? "fill-[#8C2E1F] text-[#8C2E1F]" : "text-[#8C2E1F]"
              }`}
            />
            {isFav ? (
              <>
                <span className="group-hover/save:hidden">Saved</span>
                <span className="hidden group-hover/save:inline text-[#8C2E1F]">Remove</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>

          {/* Compare Checkbox */}
          <label className="inline-flex items-center gap-2 rounded-xl border border-[#D8D2C5] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E2421] shadow-2xs hover:bg-[#F8F5EE] cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={isComparing(place.id)}
              onChange={() => toggleCompare({ id: place.id, name: place.name })}
              className="h-4 w-4 rounded border-[#C5BFB0] text-[#174D44] focus:ring-[#174D44] cursor-pointer"
            />
            <span>Compare</span>
          </label>

          {inPlan ? (
            <button
              type="button"
              onClick={() => removeFromPlan(place.id)}
              className="group/inplan inline-flex items-center justify-center gap-2 rounded-xl border border-[#174D44] bg-[#EFE9DC] px-5 py-2.5 text-sm font-semibold text-[#174D44] shadow-2xs transition-all hover:border-[#8C2E1F] hover:bg-[#FDF5F3] hover:text-[#8C2E1F] active:scale-98"
              title="Click to remove from plan"
            >
              <Check className="h-4 w-4 text-[#174D44] group-hover/inplan:hidden" />
              <X className="h-4 w-4 hidden text-[#8C2E1F] group-hover/inplan:inline" />
              <span className="group-hover/inplan:hidden">In your plan</span>
              <span className="hidden group-hover/inplan:inline">Remove from plan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addToPlan(place.id, place.name)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] active:scale-98"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Add to plan</span>
            </button>
          )}
        </div>
      </header>

      {/* Feature notice modal handling guest log in or M5/M6 roadmap */}
      <FeatureNoticeModal
        type={modalType}
        place={place}
        onClose={() => setModalType(null)}
      />
    </>
  );
}
