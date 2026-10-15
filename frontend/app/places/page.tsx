import { Suspense } from "react";
import type { Metadata } from "next";
import PlacesView from "@/src/components/places/PlacesView";
import {
  FilterMetadata,
  PaginationMeta,
  Place,
  PlacesApiResponse,
} from "@/src/components/places/types";
import PlaceCardSkeleton from "@/src/components/places/PlaceCardSkeleton";

export const metadata: Metadata = {
  title: "Places to Visit — Western Trails",
  description:
    "Explore attractions, serene beaches, Buddhist shrines, and historic landmarks within day-trip reach of Panadura and Sri Lanka's western coast.",
};

const DEFAULT_FILTER_META: FilterMetadata = {
  categories: [],
  min_distance: 0,
  max_distance: 25,
  max_fee: 0,
};

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getPlacesData(searchParams: { [key: string]: string | string[] | undefined }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  const urlParams = new URLSearchParams();
  if (searchParams.q && typeof searchParams.q === "string") {
    urlParams.set("q", searchParams.q);
  }
  if (searchParams.category && typeof searchParams.category === "string") {
    urlParams.set("category", searchParams.category);
  }
  if (searchParams.max_distance && typeof searchParams.max_distance === "string") {
    urlParams.set("max_distance", searchParams.max_distance);
  }
  if (searchParams.free && typeof searchParams.free === "string") {
    urlParams.set("free", searchParams.free);
  }
  if (searchParams.sort && typeof searchParams.sort === "string") {
    urlParams.set("sort", searchParams.sort);
  }
  if (searchParams.page && typeof searchParams.page === "string") {
    urlParams.set("page", searchParams.page);
  }

  const queryString = urlParams.toString();
  const placesUrl = `${baseUrl}/places${queryString ? `?${queryString}` : ""}`;
  const filtersUrl = `${baseUrl}/places/filters`;

  let places: Place[] = [];
  let meta: PaginationMeta = DEFAULT_META;
  let filterMeta: FilterMetadata = DEFAULT_FILTER_META;
  let error: string | null = null;

  try {
    const [placesRes, filtersRes] = await Promise.allSettled([
      fetch(placesUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }),
      fetch(filtersUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      }),
    ]);

    if (placesRes.status === "fulfilled" && placesRes.value.ok) {
      const placesJson: PlacesApiResponse = await placesRes.value.json();
      places = placesJson.data || [];
      meta = placesJson.meta || DEFAULT_META;
    } else {
      error = "Unable to fetch places list from server.";
    }

    if (filtersRes.status === "fulfilled" && filtersRes.value.ok) {
      const filtersJson = await filtersRes.value.json();
      filterMeta = filtersJson.data || DEFAULT_FILTER_META;
    }
  } catch (err) {
    error = "Cannot reach the Western Trails service. Please check your connection.";
  }

  return { places, meta, filterMeta, error };
}

async function PlacesContent({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { places, meta, filterMeta, error } = await getPlacesData(resolvedSearchParams);

  return (
    <PlacesView
      initialPlaces={places}
      initialMeta={meta}
      filterMeta={filterMeta}
      initialError={error}
    />
  );
}

function PlacesLoadingFallback() {
  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-4 w-32 rounded bg-[#E8E2D5] mb-2" />
          <div className="h-10 w-64 rounded bg-[#E8E2D5] mb-4" />
          <div className="h-12 w-full max-w-3xl rounded-xl bg-[#E8E2D5]" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <PlaceCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlacesPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PlacesLoadingFallback />}>
      <PlacesContent searchParams={searchParams} />
    </Suspense>
  );
}
