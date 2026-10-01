import Hero from "@/components/home/Hero";
import CategoryRow from "@/components/home/CategoryRow";
import FeaturedPlaces, { Place } from "@/components/home/FeaturedPlaces";
import PlanSteps from "@/components/home/PlanSteps";
import MapPreview from "@/components/home/MapPreview";
import Footer from "@/components/home/Footer";

async function getFeaturedPlaces(): Promise<Place[] | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/places`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || null;
  } catch {
    // Graceful empty state/fallback if API is unreachable or returns nothing
    return null;
  }
}

export default async function HomePage() {
  const places = await getFeaturedPlaces();

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      <main id="main-content" className="flex-1">
        <Hero />
        <CategoryRow />
        <FeaturedPlaces places={places} />
        <PlanSteps />
        <MapPreview />
      </main>
      <Footer />
    </div>
  );
}
