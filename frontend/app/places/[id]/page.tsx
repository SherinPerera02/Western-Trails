import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { PlaceDetail, PlaceDetailApiResponse } from "@/src/components/places/types";
import PlaceDetailGallery from "@/src/components/places/PlaceDetailGallery";
import PlaceDetailHeader from "@/src/components/places/PlaceDetailHeader";
import PlacePracticalInfo from "@/src/components/places/PlacePracticalInfo";
import PlaceVisitorGuidelines from "@/src/components/places/PlaceVisitorGuidelines";
import PlaceEditorialContent from "@/src/components/places/PlaceEditorialContent";
import PlaceNearbySection from "@/src/components/places/PlaceNearbySection";
import PlaceReviewsSection from "@/src/components/places/PlaceReviewsSection";
import PlaceDetailMap from "@/src/components/places/PlaceDetailMap";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPlaceDetail(id: string): Promise<PlaceDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  const cleanBase = baseUrl.replace(/\/$/, "");

  try {
    const res = await fetch(`${cleanBase}/places/${id}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`API response failed with status ${res.status}`);
      return null;
    }

    const json: PlaceDetailApiResponse = await res.json();
    return json.data ?? null;
  } catch (error) {
    console.error("Error fetching place details:", error);
    return null;
  }
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const place = await getPlaceDetail(id);

  if (!place) {
    return {
      title: "Place Not Found — Western Trails",
      description: "The requested destination could not be found on Western Trails.",
    };
  }

  const categoryNames = place.categories?.map((c) => c.name).join(", ");
  const shortDesc =
    place.description?.slice(0, 160) ||
    `Explore ${place.name} on Sri Lanka's western coast with the Western Trails day-trip guide.`;

  return {
    title: `${place.name} — Western Trails`,
    description: shortDesc,
    openGraph: {
      title: `${place.name} | Western Trails`,
      description: shortDesc,
      images: place.images?.length > 0 ? [{ url: place.images[0].url }] : [],
    },
    keywords: [
      place.name,
      ...(categoryNames ? [categoryNames] : []),
      "Panadura",
      "Sri Lanka Day Trips",
      "Western Coast",
    ],
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const place = await getPlaceDetail(id);

  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E2421]">
      {/* 1. Subtle Guidebook Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-[#E8E2D5] bg-[#F7F4EB]/70 py-3 px-4 sm:px-6 lg:px-8 text-xs font-medium text-[#5C645F]"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <ol className="flex items-center gap-1.5 overflow-hidden">
            <li>
              <Link
                href="/"
                className="hover:text-[#174D44] transition-colors shrink-0"
              >
                Home
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-[#B8AF9F] shrink-0" />
            <li>
              <Link
                href="/places"
                className="hover:text-[#174D44] transition-colors shrink-0"
              >
                Places
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5 text-[#B8AF9F] shrink-0" />
            <li className="truncate text-[#1E2421] font-semibold">
              {place.name}
            </li>
          </ol>

          <Link
            href="/places"
            className="hidden sm:inline-flex items-center gap-1 text-[#174D44] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Places</span>
          </Link>
        </div>
      </nav>

      {/* Main Page Container */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-12">
        {/* 2. Photo Gallery at the Top */}
        <PlaceDetailGallery
          placeName={place.name}
          images={place.images || []}
        />

        {/* 3. Header: Title, Category Tags, Distance from Panadura, Rating, and Actions */}
        <PlaceDetailHeader place={place} />

        {/* 4. Natural Guidebook Layout: Editorial Content & Practical Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Left Column (7 cols): Editorial, Guidelines, Map, Reviews */}
          <div className="lg:col-span-7 space-y-10">
            {/* Description, Activities, Facilities, Explorer Tips */}
            <PlaceEditorialContent place={place} />

            {/* Visitor Guidelines (SRS section 5.2): High-visibility note box */}
            <PlaceVisitorGuidelines
              guidelines={place.visitor_guidelines}
              categories={place.categories}
            />

            {/* Small Map using react-leaflet + Open in Google Maps */}
            <PlaceDetailMap
              placeName={place.name}
              latitude={place.latitude}
              longitude={place.longitude}
              address={place.address}
            />

            {/* Reviews Section: Rendered ONLY if reviews_count > 0 */}
            <PlaceReviewsSection place={place} />
          </div>

          {/* Sidebar Right Column (5 cols): Practical Info Block */}
          <aside className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
            <PlacePracticalInfo place={place} />
          </aside>
        </div>

        {/* 5. "Nearby" Section: Compact cards from the nearby array */}
        {place.nearby && place.nearby.length > 0 && (
          <div className="border-t border-[#E8E2D5] pt-10">
            <PlaceNearbySection nearby={place.nearby} />
          </div>
        )}
      </main>
    </div>
  );
}
