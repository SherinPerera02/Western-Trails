import { Compass, Calendar, Heart, Info } from "lucide-react";
import { WhyFeature } from "@/data/travelData";

const iconMap = {
  Compass,
  Calendar,
  Heart,
  Info,
};

interface FeatureCardProps {
  feature: WhyFeature;
  index: number;
}

export default function FeatureCard({ feature, index }: FeatureCardProps) {
  const IconComponent = iconMap[feature.iconName as keyof typeof iconMap] || Compass;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#E8E2D5] bg-white p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#174D44]/30 hover:shadow-md">
      <div className="flex items-center justify-between mb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#174D44]/10 text-[#174D44]">
          <IconComponent className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <span className="font-mono text-xs font-semibold text-[#8C7A65]">
          0{index + 1}
        </span>
      </div>

      <h3 className="font-serif text-xl font-bold text-[#1E2421]">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#5C645F]">
        {feature.description}
      </p>
    </div>
  );
}
