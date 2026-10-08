import FeatureCard from "./FeatureCard";
import { WHY_FEATURES } from "@/data/travelData";

export default function WhyWesternTrails() {
  return (
    <section id="about" className="bg-[#FBF9F4] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C86446]">
            The Western Trails Experience
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-[#1E2421] sm:text-4xl lg:text-5xl">
            Plan Less. Explore More.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#5C645F] leading-relaxed">
            We simplify your travel around Sri Lanka with verified local insights, smart itinerary sequencing, and intuitive tools that eliminate guesswork.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_FEATURES.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
