import HeroSection from "@/components/landing/HeroSection";
import PopularDestinations from "@/components/landing/PopularDestinations";
import ExploreByCategory from "@/components/landing/ExploreByCategory";
import WhyWesternTrails from "@/components/landing/WhyWesternTrails";
import FeaturedDayTrips from "@/components/landing/FeaturedDayTrips";
import TripPlannerCTA from "@/components/landing/TripPlannerCTA";
import FavoritesSection from "@/components/landing/FavoritesSection";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "Western Trails — Discover Sri Lanka & Plan Your Journey",
  description:
    "Explore beautiful destinations, discover unforgettable places, and plan your perfect day trip around Panadura and the western coast of Sri Lanka.",
};

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      <main id="main-content" className="flex-1">
        {/* 1. Hero Section & Quick Search */}
        <HeroSection />

        {/* 2. Popular Destinations */}
        <PopularDestinations />

        {/* 3. Explore by Category */}
        <ExploreByCategory />

        {/* 4. Why Western Trails */}
        <WhyWesternTrails />

        {/* 5. Featured Day Trips */}
        <FeaturedDayTrips />

        {/* 6. Trip Planner Call-to-Action */}
        <TripPlannerCTA />

        {/* 7. Favorites / Personalization */}
        <FavoritesSection />
      </main>

      {/* 8. Professional Footer */}
      <Footer />
    </div>
  );
}
