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
  // If API returned valid items, use them; otherwise use default curated places
  const displayPlaces = places && places.length > 0 ? places : DEFAULT_PLACES;

  return (
    <section className="border-b border-[#E8E2D5] bg-[#FBF9F4] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header: Left-aligned, tight serif */}
        <div className="mb-10 max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C86446]">
            Highlights
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl">
            A few good spots near town
          </h2>
          <p className="mt-3 text-base text-[#5C645F]">
            From quiet coastal stretches to hundred-year-old temple courtyards. Everything is within a short tuk-tuk ride from Panadura.
          </p>
        </div>

        {/* Asymmetric Grid: 1 Wide Hero Card + Uneven Card Mix */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {displayPlaces.map((place, idx) => {
            const colSpanClass =
              idx === 0
                ? "md:col-span-7"
                : idx === 1
                ? "md:col-span-5"
                : idx === 2
                ? "md:col-span-4"
                : idx === 3
                ? "md:col-span-4"
                : idx === 4
                ? "md:col-span-4"
                : "md:col-span-12";

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

            const bgColor = place.bg_color || (idx % 2 === 0 ? "bg-[#D8E2DC]" : "bg-[#E6DFD3]");
            const imageSlot = place.image_slot || `/public/images/${place.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;

            return (
              <article
                key={place.name}
                className={`flex flex-col justify-between overflow-hidden rounded-lg border border-[#E8E2D5] bg-white p-5 shadow-xs transition-colors hover:border-[#174D44]/50 ${colSpanClass}`}
              >
                <div>
                  {/* Photo Placeholder Slot */}
                  <div
                    className={`relative flex aspect-16/9 w-full flex-col justify-between rounded p-4 text-[#1E2421] ${bgColor} ${
                      idx === 0 ? "sm:aspect-2/1" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-white/85 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#174D44]">
                        {categoryText}
                      </span>
                      <span className="text-[10px] font-medium text-[#1E2421]/75">
                        {distanceText}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#1E2421]/60">
                        [ slot: {imageSlot} ]
                      </span>
                    </div>
                  </div>

                  {/* Title and Distance */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-serif text-xl font-bold tracking-tight text-[#1E2421]">
                        {place.name}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-[#5C645F]">
                      {place.description}
                    </p>
                  </div>
                </div>

                {/* Plain Words Hours & Details */}
                <div className="mt-5 border-t border-[#E8E2D5]/70 pt-3 text-xs text-[#5C645F]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-[#1E2421]">
                      {place.hours || place.visitor_guidelines || "Open to visitors daily"}
                    </span>
                    <Link
                      href={`/places?q=${encodeURIComponent(place.name)}`}
                      className="font-semibold text-[#174D44] underline-offset-2 hover:underline"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* View All Places Button */}
        <div className="mt-10 text-left">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 rounded-md border border-[#D5CCBA] bg-[#F4F0E8] px-4 py-2.5 text-sm font-semibold text-[#174D44] transition-colors hover:border-[#174D44] hover:bg-[#EFE9DC]"
          >
            <span>See all places in the guide</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
