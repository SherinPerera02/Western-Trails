import { CheckCircle2, Sparkles, Lightbulb, Check } from "lucide-react";
import { PlaceDetail } from "./types";

interface PlaceEditorialContentProps {
  place: PlaceDetail;
}

function parseItems(data: string[] | string | null | undefined): string[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return [];
    if (trimmed.includes("\n") || trimmed.includes("\r")) {
      return trimmed
        .split(/\r?\n/)
        .map((s) => s.replace(/^[•\-\*]\s*/, "").trim())
        .filter((s) => s.length > 0);
    }
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [trimmed];
  }
  return [];
}

export default function PlaceEditorialContent({
  place,
}: PlaceEditorialContentProps) {
  const activities = parseItems(place.activities);
  const facilities = parseItems(place.facilities);

  return (
    <div className="space-y-10">
      {/* 1. Main Place Description */}
      {place.description && (
        <section aria-labelledby="about-heading" className="space-y-4">
          <h2
            id="about-heading"
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1E2421]"
          >
            About {place.name}
          </h2>
          <div className="prose prose-stone max-w-none text-base sm:text-lg leading-relaxed text-[#2D3732] whitespace-pre-line font-sans">
            {place.description}
          </div>
        </section>
      )}

      {/* 2. Activities & Experiences (if any) */}
      {activities.length > 0 && (
        <section aria-labelledby="activities-heading">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#C86446]" />
            <h2
              id="activities-heading"
              className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]"
            >
              Activities & Things to Do
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-xl border border-[#E8E2D5] bg-white p-3.5 shadow-2xs transition-colors hover:border-[#174D44]/30"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8F2EE] text-[#174D44] mt-0.5">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
                <span className="text-sm font-medium text-[#1E2421]">
                  {activity}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Facilities & Amenities (if any) */}
      {facilities.length > 0 && (
        <section aria-labelledby="facilities-heading">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-[#174D44]" />
            <h2
              id="facilities-heading"
              className="font-serif text-xl sm:text-2xl font-bold text-[#1E2421]"
            >
              Facilities & Amenities
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {facilities.map((facility, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCD5C5] bg-[#F7F4EB] px-3.5 py-2 text-xs sm:text-sm font-medium text-[#3A453F]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#174D44]" />
                {facility}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 4. Travel Tips & Advisory (if not already displayed in practical info or supplementary) */}
      {place.travel_tips && (
        <section
          aria-labelledby="travel-tips-heading"
          className="rounded-2xl border border-[#EADCC0] bg-[#FAF6EC] p-6 sm:p-7 shadow-2xs"
        >
          <div className="flex items-center gap-2.5 text-[#A8522E] mb-3">
            <Lightbulb className="h-5 w-5" />
            <h2
              id="travel-tips-heading"
              className="font-serif text-lg sm:text-xl font-bold text-[#1E2421]"
            >
              Local Explorer Tips
            </h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[#404944] whitespace-pre-line">
            {place.travel_tips}
          </p>
        </section>
      )}
    </div>
  );
}
