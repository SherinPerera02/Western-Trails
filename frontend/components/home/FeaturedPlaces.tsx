import Link from "next/link";

export interface Place {
  id?: number | string;
  name: string;
  description: string;
  distance_km?: number | string;
  category?: string;
  categories?: { id?: number; name: string }[] | string[];
  visitor_guidelines?: string;
  best_time?: string;
  hours?: string;
  image_slot?: string;
  bg_color?: string;
}

const DEFAULT_PLACES: Place[] = [
  {
    name: "Panadura Beach",
    category: "Beach & Nature",
    distance_km: "0.8 km from Panadura town",
    description:
      "Broad sandy shore where the coastal train runs parallel to the waves. Local families gather around 5:30 PM for the sunset, salt breeze, and freshly fried isso wade.",
    hours: "Open daily · Best 5:00 PM – 6:30 PM",
    image_slot: "/public/images/panadura-beach.jpg",
    bg_color: "bg-[#D8E2DC]",
  },
  {
    name: "Rankoth Viharaya",
    category: "Religious & Heritage",
    distance_km: "1.8 km from Clock Tower",
    description:
      "Historical 19th-century Buddhist temple featuring a tall stupa and peaceful sand courtyard. Please wear white or modest attire covering shoulders and knees.",
    hours: "Open daily 5:30 AM – 8:00 PM",
    image_slot: "/public/images/rankoth-viharaya.jpg",
    bg_color: "bg-[#E4DDD3]",
  },
  {
    name: "Bolgoda Lake",
    category: "Nature & Recreation",
    distance_km: "7.5 km inland",
    description:
      "Sri Lanka's largest natural lake basin. Shaded waterfront trails, boat safaris through water hyacinth patches, and open-air lakeside seafood restaurants.",
    hours: "Boat rides: 7:00 AM – 6:00 PM",
    image_slot: "/public/images/bolgoda-lake.jpg",
    bg_color: "bg-[#DFE3DC]",
  },
  {
    name: "Richmond Castle",
    category: "Heritage",
    distance_km: "18 km south near Kalutara",
    description:
      "Grand 1910 Edwardian mansion built by Mudaliyar Don Arthur de Silva. Features intricate imported timber craftsmanship, stained glass, and tranquil orchards.",
    hours: "Tue–Sun 9:00 AM – 4:00 PM",
    image_slot: "/public/images/richmond-castle.jpg",
    bg_color: "bg-[#E6DFD3]",
  },
  {
    name: "Kalutara Bodhiya",
    category: "Religious",
    distance_km: "16 km south along Galle Road",
    description:
      "One of Sri Lanka's most venerated shrines situated where the Kalu Ganga meets the ocean. You can walk inside the hollow white stupa adorned with frescoes.",
    hours: "Open all day and evening",
    image_slot: "/public/images/kalutara-bodhiya.jpg",
    bg_color: "bg-[#EFE9DC]",
  },
  {
    name: "Wadduwa Beach",
    category: "Beach",
    distance_km: "6.2 km south",
    description:
      "Wider, calmer golden shore flanked by outrigger fishing canoes and tall coconut palms. Ideal for an unhurried morning stroll before midday heat.",
    hours: "Best in early morning or late afternoon",
    image_slot: "/public/images/wadduwa-beach.jpg",
    bg_color: "bg-[#DCE5E0]",
  },
];

export default function FeaturedPlaces({ places }: { places?: Place[] | null }) {
  const hasPlaces = places && places.length > 0;
  const displayPlaces = hasPlaces ? places : null;

  return (
    <section className="bg-[#FBF9F4] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Section Header matching Screenshot 2 */}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2421]">
            Worth the bus fare
          </h2>
          <Link
            href="/places"
            className="text-sm font-medium text-[#9E5432] underline underline-offset-4 hover:text-[#7F3F22] transition-colors"
          >
            All places
          </Link>
        </div>

        {/* Fallback Box matching Screenshot 2 when places are not loaded */}
        {!displayPlaces ? (
          <div className="border border-dashed border-[#CFC7B6] bg-transparent p-6 sm:p-8 max-w-xl rounded-xs">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#1E2421]">
              The place list isn&apos;t loading right now.
            </h3>
            <p className="mt-2 text-sm text-[#5C645F] leading-relaxed">
              Try again in a minute, or browse by category above. Panadura Beach is always a safe bet in the evening.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayPlaces.map((place, idx) => {
              const distanceText =
                typeof place.distance_km === "number"
                  ? `${place.distance_km} km from Panadura`
                  : place.distance_km || "Near Panadura";

              const categoryText =
                place.category ||
                (Array.isArray(place.categories)
                  ? place.categories
                      .map((c) => (typeof c === "string" ? c : c.name))
                      .join(" · ")
                  : "Attraction");

              const bgColor = place.bg_color || (idx % 2 === 0 ? "bg-[#BAC0B0]" : "bg-[#DDD3C1]");

              return (
                <article
                  key={place.name}
                  className="flex flex-col justify-between overflow-hidden rounded-xs border border-[#E4DDD0] bg-white p-5 shadow-xs transition-colors hover:border-[#174D44]/50"
                >
                  <div>
                    <div
                      className={`relative flex aspect-16/10 w-full flex-col justify-between rounded-xs p-4 text-[#1E2421] ${bgColor}`}
                    >
                      <span className="self-start rounded-xs bg-white/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#174D44]">
                        {categoryText}
                      </span>
                      <span className="text-[10px] font-medium text-[#1E2421]/80">
                        {distanceText}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-serif text-xl font-bold tracking-tight text-[#1E2421]">
                        {place.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5C645F]">
                        {place.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#EAE4D7] pt-3 text-xs text-[#5C645F]">
                    <div className="flex items-center justify-between">
                      <span>{place.hours || place.visitor_guidelines || "Open daily"}</span>
                      <Link
                        href={`/places?q=${encodeURIComponent(place.name)}`}
                        className="font-medium text-[#174D44] underline-offset-2 hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

