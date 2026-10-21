"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Clock,
  MapPin,
  AlertCircle,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { PlanItemDetail } from "@/types/planner";

interface PlannerTimelineItemProps {
  item: PlanItemDetail;
  index: number;
  totalItems: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdateDetails: (startTime: string | null, notes: string | null) => void;
}

export default function PlannerTimelineItem({
  item,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdateDetails,
}: PlannerTimelineItemProps) {
  const [imageError, setImageError] = useState(false);
  const [startTime, setStartTime] = useState(
    item.start_time ? item.start_time.slice(0, 5) : ""
  );
  const [notes, setNotes] = useState(item.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const attraction = item.attraction;
  const placeName = attraction?.name || `Stop #${index + 1}`;
  const hoursHint = item.visit_hours_hint || item.opening_hours || attraction?.opening_hours;
  const rawImage = attraction?.first_image_url;
  const hasImage = Boolean(rawImage) && !imageError;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartTime(val);
    onUpdateDetails(val ? `${val}:00` : null, notes.trim() || null);
  };

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    onUpdateDetails(
      startTime ? `${startTime}:00` : null,
      notes.trim() || null
    );
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
        item.unavailable
          ? "border-[#E5C1B8] bg-[#FDF8F7]"
          : "border-[#E8E2D5] bg-white hover:border-[#174D44]/30 hover:shadow-sm"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Stop Number & Thumbnail */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-[#EAE4D7] border border-[#E8E2D5]">
          {hasImage && rawImage ? (
            <Image
              src={rawImage}
              alt={placeName}
              fill
              sizes="96px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#5C645F]/50">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}

          {/* Sequence badge overlay */}
          <span className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#174D44] text-xs font-bold text-white shadow-xs">
            {index + 1}
          </span>
        </div>

        {/* Place Info & Details */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/places/${item.attraction_id}`}
                  className="font-serif text-lg font-bold text-[#1E2421] hover:text-[#174D44] transition-colors inline-flex items-center gap-1.5 group-hover:text-[#174D44]"
                >
                  <span className="truncate">{placeName}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>

              {/* Categories */}
              {attraction?.categories && attraction.categories.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {attraction.categories.map((cat: { id?: number; name: string }) => (
                    <span
                      key={cat.id || cat.name}
                      className="rounded-md bg-[#F4EFE6] px-2 py-0.5 text-[11px] font-medium text-[#5C645F]"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Reorder & Remove Controls */}
            <div
              className="flex items-center gap-1 shrink-0 bg-[#FBF9F4] p-1 rounded-xl border border-[#E8E2D5]"
              role="group"
              aria-label={`Controls for ${placeName}`}
            >
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                aria-label={`Move ${placeName} up to stop #${index}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C645F] hover:bg-white hover:text-[#174D44] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5C645F] transition-colors"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalItems - 1}
                aria-label={`Move ${placeName} down to stop #${index + 2}`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#5C645F] hover:bg-white hover:text-[#174D44] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5C645F] transition-colors"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>

              <span className="h-4 w-px bg-[#EAE4D7] mx-0.5" />

              <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${placeName} from plan`}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8C2E1F] hover:bg-[#FDF5F3] hover:text-[#A83220] transition-colors"
                title="Remove stop"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Unavailable Warning */}
          {item.unavailable && (
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#FDF5F3] px-2.5 py-1 text-xs font-semibold text-[#8C2E1F] border border-[#F4D3CC]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>This place is currently inactive or removed from public listings.</span>
            </div>
          )}

          {/* Opening Hours Hint */}
          {hoursHint && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#5C645F]">
              <Clock className="h-3.5 w-3.5 text-[#174D44] shrink-0" />
              <span className="truncate">{hoursHint}</span>
            </div>
          )}

          {/* Arrive Around Time & Personal Notes Form */}
          <div className="mt-3.5 pt-3 border-t border-[#EAE4D7]/70 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            {/* Arrival Time */}
            <div className="sm:col-span-4 flex items-center gap-1.5">
              <label
                htmlFor={`time-${item.id}`}
                className="font-medium text-[#736B5E] shrink-0"
              >
                Arrive around:
              </label>
              <input
                id={`time-${item.id}`}
                type="time"
                value={startTime}
                onChange={handleTimeChange}
                aria-label={`Arrival time for ${placeName}`}
                className="rounded-lg border border-[#D8D2C5] bg-[#FBF9F4] px-2 py-1 text-xs text-[#1E2421] focus:border-[#174D44] focus:outline-none focus:ring-1 focus:ring-[#174D44]"
              />
            </div>

            {/* Note field */}
            <div className="sm:col-span-8 flex items-center gap-1.5">
              <input
                id={`notes-${item.id}`}
                type="text"
                value={notes}
                maxLength={255}
                onChange={(e) => setNotes(e.target.value)}
                onFocus={() => setIsEditingNotes(true)}
                onBlur={handleNotesBlur}
                placeholder="Add a visit note (e.g. Bring water, buy tickets at booth)"
                aria-label={`Notes for ${placeName}`}
                className="w-full rounded-lg border border-[#D8D2C5] bg-[#FBF9F4] px-2.5 py-1 text-xs text-[#1E2421] placeholder-[#8C8476] focus:border-[#174D44] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174D44]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
