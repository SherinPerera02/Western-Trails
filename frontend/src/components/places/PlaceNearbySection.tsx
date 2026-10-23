import Link from "next/link";
import Image from "next/image";
import { Compass, MapPin, ArrowRight, ImageIcon, Utensils, Sparkles } from "lucide-react";
import { NearbyPlace } from "./types";

interface PlaceNearbySectionProps {
  nearby: NearbyPlace[];
}

export default function PlaceNearbySection({ nearby }: PlaceNearbySectionProps) {
  if (!nearby || nearby.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="nearby-places-heading" className="space-y-6 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[#E8E2D5] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A8522E] mb-1">
            <Compass className="h-4 w-4" />
            <span>Nearby Destinations & Services</span>
          </div>
          <h2
            id="nearby-places-heading"
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2421]"
          >
            Nearby Along the Trail
          </h2>
        </div>

        {/* Distance disclaimer note (REQ-008, REQ-066) */}
        <p className="text-xs text-[#736B5E] italic">
          * Calculated straight-line estimates between coordinates
        </p>
      </div>

      {/* Grid of Compact Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {nearby.map((place) => {
          const rawImageUrl =
            place.first_image_url || place.image_url || place.first_image;
          const categories = place.categories || place.category_names || [];
          const isRestaurant = place.is_restaurant || categories.includes("Restaurant") || categories.includes("Food & Dining");
          const isRecreation = place.is_recreation || categories.includes("Recreation");

          return (
            <Link
              key={place.id}
              href={`/places/${place.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44]/40 hover:shadow-md"
            >
              {/* Thumbnail Container */}
              <div className="relative h-36 w-full overflow-hidden bg-[#EAE4D7]">
                {rawImageUrl ? (
                  <Image
                    src={rawImageUrl}
                    alt={place.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#EFE9DC] text-[#736B5E]">
                    <ImageIcon className="h-7 w-7 text-[#A89F91]" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                {/* Nearby Category Indicator (REQ-074, REQ-075) */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                  {isRestaurant && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/90 text-white backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold">
                      <Utensils className="h-3 w-3" />
                      <span>Dining</span>
                    </span>
                  )}
                  {isRecreation && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-teal-600/90 text-white backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold">
                      <Sparkles className="h-3 w-3" />
                      <span>Recreation</span>
                    </span>
                  )}
                </div>

                {/* Distance pill badge */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-white">
                  <MapPin className="h-3 w-3 text-[#EFE9DC]" />
                  <span>{place.distance_from_here_km} km away</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  {categories.length > 0 && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A8522E]">
                      {categories[0]}
                    </span>
                  )}
                  <h3 className="mt-1 font-serif text-base font-bold text-[#1E2421] transition-colors group-hover:text-[#174D44] line-clamp-1">
                    {place.name}
                  </h3>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#F0EBE0] pt-2 text-xs font-semibold text-[#174D44]">
                  <span>Explore stop</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
