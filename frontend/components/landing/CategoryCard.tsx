import Link from "next/link";
import {
  Waves,
  Trees,
  Landmark,
  Sparkles,
  Church,
  Compass,
  Utensils,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { TravelCategory } from "@/data/travelData";

const iconMap = {
  Waves,
  Trees,
  Landmark,
  Sparkles,
  Church,
  Compass,
  Utensils,
  Users,
};

interface CategoryCardProps {
  category: TravelCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || Compass;

  return (
    <Link
      href={`/explore?category=${encodeURIComponent(category.name)}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white p-5 sm:p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44] hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFE9DC] text-[#174D44] transition-all duration-300 group-hover:bg-[#174D44] group-hover:text-[#FBF9F4] group-hover:scale-105">
            <IconComponent className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] transition-colors group-hover:text-[#174D44]">
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        <h3 className="mt-4 font-serif text-lg font-bold text-[#1E2421] transition-colors group-hover:text-[#174D44]">
          {category.name}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-[#5C645F]">
          {category.description}
        </p>
      </div>

      <div className="mt-5 border-t border-[#EAE4D7] pt-3 text-xs font-semibold text-[#174D44]">
        <span>{category.placesCount}</span>
      </div>
    </Link>
  );
}
