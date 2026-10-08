import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CategoryCard from "./CategoryCard";
import { TRAVEL_CATEGORIES } from "@/data/travelData";

export default function ExploreByCategory() {
  return (
    <section id="categories" className="bg-[#F4EFE6]/60 px-4 py-20 sm:px-6 lg:px-8 border-y border-[#EAE4D7]">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
              Browse By Interest
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl lg:text-5xl">
              Explore by Category
            </h2>
            <p className="mt-3 text-base text-[#5C645F] max-w-2xl">
              Filter destinations to match your travel mood, whether you crave coastal relaxation, cultural insights, or scenic adventures.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#174D44] hover:text-[#103630] transition-colors group self-start md:self-end"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Responsive Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 sm:gap-6">
          {TRAVEL_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
