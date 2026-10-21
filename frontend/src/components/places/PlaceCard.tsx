"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Ticket,
  Star,
  Heart,
  CalendarPlus,
  ArrowRight,
  Check,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Place } from "./types";
import { usePlan } from "@/context/PlanContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useCompare } from "@/context/CompareContext";

interface PlaceCardProps {
  place: Place;
  onSave?: (place: Place) => void;
  onAddToPlan?: (place: Place) => void;
}

export default function PlaceCard({ place, onSave, onAddToPlan }: PlaceCardProps) {
  const { isInPlan, addToPlan, removeFromPlan } = usePlan();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isComparing, toggleCompare } = useCompare();

  const [imageError, setImageError] = useState(false);
  const inPlan = isInPlan(place.id);
  const isFav = isFavorite(place.id);

  const rawImageUrl = place.first_image_url || place.image_url;
  const hasImage = Boolean(rawImageUrl) && !imageError;

  // Format natural distance string
  const distanceText =
    place.distance_km !== null
      ? `${Number(place.distance_km).toFixed(place.distance_km % 1 === 0 ? 0 : 1)} km from Panadura`
      : "Distance unknown";

  // Format fee string
  const isFree = place.entrance_fee === null || Number(place.entrance_fee) === 0;
  const feeText = isFree
    ? "Free"
    : `Rs. ${Number(place.entrance_fee).toLocaleString()}`;

  // Format opening hours
  const hoursText = place.opening_hours || "Hours not specified";

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44]/30 hover:shadow-md">
      {/* Photo Header */}
      <div className="relative h-56 w-full overflow-hidden bg-[#EAE4D7]">
        {hasImage && rawImageUrl ? (
          <Image
            src={rawImageUrl}
            alt={place.name}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#EFE9DC] text-[#5C645F]">
            <ImageIcon className="h-10 w-10 text-[#5C645F]/50 mb-1" />
            <span className="text-xs font-medium text-[#5C645F]/70">
              Photo coming soon
            </span>
          </div>
        )}

        {/* Subtle shadow gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top-left: Category Pills */}
        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5 max-w-[70%]">
          {place.categories?.slice(0, 2).map((cat) => (
            <span
              key={cat.id}
              className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-[#174D44] shadow-xs backdrop-blur-md"
            >
              {cat.name}
            </span>
          ))}
          {place.categories && place.categories.length > 2 && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-[#5C645F] shadow-xs">
              +{place.categories.length - 2}
            </span>
          )}
        </div>

        {/* Top-right: Save Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(place.id, place.name)}
          aria-label={isFav ? `Remove ${place.name} from favorites` : `Save ${place.name} to favorites`}
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-xs transition-transform hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
        >
          <Heart
            className={`h-4.5 w-4.5 transition-colors ${
              isFav ? "fill-[#8C2E1F] text-[#8C2E1F]" : "text-[#1E2421] hover:text-[#8C2E1F]"
            }`}
          />
        </button>

        {/* Bottom Distance & Rating Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-[#FBF9F4]">
          <span className="flex items-center gap-1 font-medium drop-shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-[#EFE9DC]" />
            {distanceText}
          </span>

          {place.average_rating !== null && place.average_rating > 0 && (
            <span className="flex items-center gap-1 font-semibold rounded-md bg-black/45 px-2 py-0.5 backdrop-blur-xs">
              <Star className="h-3.5 w-3.5 fill-[#E9B949] text-[#E9B949]" />
              {place.average_rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Name */}
        <h3 className="font-serif text-xl font-bold text-[#1E2421] transition-colors group-hover:text-[#174D44]">
          <Link
            href={`/places/${place.id}`}
            className="focus-visible:outline-none focus-visible:underline"
          >
            {place.name}
          </Link>
        </h3>

        {/* Short Description */}
        {place.short_description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#5C645F]">
            {place.short_description}
          </p>
        )}

        {/* Meta Info: Fee & Opening Hours */}
        <div className="mt-4 space-y-1.5 border-t border-[#EAE4D7] pt-3 text-xs text-[#4D5650]">
          <div className="flex items-center gap-2">
            <Ticket className="h-3.5 w-3.5 text-[#174D44] shrink-0" />
            <span>
              Entrance fee:{" "}
              <strong
                className={isFree ? "text-[#174D44] font-semibold" : "font-semibold"}
              >
                {feeText}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#174D44] shrink-0" />
            <span className="truncate">{hoursText}</span>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="mt-5 pt-3 border-t border-[#EAE4D7] flex flex-wrap items-center justify-between gap-2">
          {/* Compare Checkbox (REQ-041) */}
          <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#5C645F] hover:text-[#1E2421] select-none">
            <input
              type="checkbox"
              checked={isComparing(place.id)}
              onChange={() => toggleCompare({ id: place.id, name: place.name })}
              className="h-3.5 w-3.5 rounded border-[#C5BFB0] text-[#174D44] focus:ring-[#174D44] cursor-pointer"
            />
            <span>Compare</span>
          </label>

          <div className="flex items-center gap-2">
            {/* Add / In Plan button */}
            {inPlan ? (
              <button
                type="button"
                onClick={() => removeFromPlan(place.id)}
                className="group/inplan inline-flex items-center gap-1.5 rounded-lg border border-[#174D44] bg-[#EFE9DC] px-3 py-2 text-xs font-semibold text-[#174D44] transition-colors hover:border-[#8C2E1F] hover:bg-[#FDF5F3] hover:text-[#8C2E1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
                title="Click to remove from plan"
              >
                <Check className="h-3.5 w-3.5 text-[#174D44] group-hover/inplan:hidden" />
                <X className="h-3.5 w-3.5 hidden text-[#8C2E1F] group-hover/inplan:inline" />
                <span className="group-hover/inplan:hidden">In your plan</span>
                <span className="hidden group-hover/inplan:inline">Remove</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => addToPlan(place.id, place.name)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D2C5] bg-white px-3 py-2 text-xs font-semibold text-[#1E2421] transition-colors hover:border-[#174D44] hover:bg-[#F8F5EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-[#174D44]" />
                <span>Add to plan</span>
              </button>
            )}

            {/* View details */}
            <Link
              href={`/places/${place.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#174D44] px-3.5 py-2 text-xs font-semibold text-[#FBF9F4] shadow-2xs transition-all hover:bg-[#103630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
            >
              <span>View details</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
