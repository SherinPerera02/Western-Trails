"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, Heart, ArrowRight } from "lucide-react";
import { Destination } from "@/data/travelData";
import { useAuth } from "@/context/AuthContext";

interface DestinationCardProps {
  destination: Destination;
  onSelect?: (destination: Destination) => void;
}

export default function DestinationCard({ destination, onSelect }: DestinationCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("wt_favorites");
      if (stored) {
        const favs: string[] = JSON.parse(stored);
        setIsFavorite(favs.includes(destination.id));
      }
    } catch {
      // ignore
    }
  }, [destination.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const stored = localStorage.getItem("wt_favorites");
      let favs: string[] = stored ? JSON.parse(stored) : [];
      if (favs.includes(destination.id)) {
        favs = favs.filter((id) => id !== destination.id);
        setIsFavorite(false);
      } else {
        favs.push(destination.id);
        setIsFavorite(true);
      }
      localStorage.setItem("wt_favorites", JSON.stringify(favs));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44]/30 hover:shadow-md">
      {/* Image with Tag & Favorite Button */}
      <div className="relative h-60 w-full overflow-hidden bg-[#EAE4D7]">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Category Pill Tag */}
        <div className="absolute left-3.5 top-3.5">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#174D44] shadow-xs backdrop-blur-md">
            {destination.category}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
          className={`absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-xs ${
            isFavorite
              ? "bg-[#8C2E1F] text-white"
              : "bg-white/85 text-[#1E2421] hover:bg-white hover:text-[#8C2E1F]"
          }`}
        >
          <Heart
            className={`h-4.5 w-4.5 ${isFavorite ? "fill-current" : ""}`}
            strokeWidth={2}
          />
        </button>

        {/* Bottom Distance & Rating Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-[#FBF9F4]">
          <span className="flex items-center gap-1 font-medium drop-shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-[#EFE9DC]" />
            {destination.distance}
          </span>
          <span className="flex items-center gap-1 font-semibold rounded-md bg-black/40 px-2 py-0.5 backdrop-blur-xs">
            <Star className="h-3.5 w-3.5 fill-[#E9B949] text-[#E9B949]" />
            {destination.rating.toFixed(1)}
            <span className="text-white/70 font-normal text-[11px]">({destination.reviewsCount})</span>
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C86446]">
            {destination.location}
          </span>
          <h3 className="mt-1 font-serif text-xl font-bold text-[#1E2421] transition-colors group-hover:text-[#174D44]">
            {destination.name}
          </h3>
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed text-[#5C645F]">
          {destination.description}
        </p>

        {/* Highlights List */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {destination.highlights.slice(0, 3).map((h) => (
            <span
              key={h}
              className="rounded-md bg-[#F4F0E8] px-2.5 py-1 text-[11px] font-medium text-[#4D5650]"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-6 border-t border-[#EAE4D7] pt-4">
          <Link
            href={`/destinations#${destination.id}`}
            onClick={(e) => {
              if (onSelect) {
                e.preventDefault();
                onSelect(destination);
              }
            }}
            className="flex items-center justify-between rounded-lg bg-[#F4F0E8] px-4 py-2.5 text-sm font-semibold text-[#174D44] transition-all hover:bg-[#174D44] hover:text-[#FBF9F4]"
          >
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
