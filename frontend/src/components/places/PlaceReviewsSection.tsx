import { Star, MessageSquare } from "lucide-react";
import { PlaceDetail } from "./types";

interface PlaceReviewsSectionProps {
  place: PlaceDetail;
}

export default function PlaceReviewsSection({ place }: PlaceReviewsSectionProps) {
  // Requirement 10: Render only if reviews_count > 0, otherwise render nothing (do not show an empty review box)
  if (!place.reviews_count || place.reviews_count <= 0) {
    return null;
  }

  const rating = place.average_rating ? place.average_rating.toFixed(1) : null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-2xs sm:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EBE0] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8522E] mb-1">
            <MessageSquare className="h-4 w-4" />
            <span>Community Feedback</span>
          </div>
          <h2
            id="reviews-heading"
            className="font-serif text-2xl font-bold tracking-tight text-[#1E2421]"
          >
            Visitor Reviews
          </h2>
        </div>

        {rating && (
          <div className="flex items-center gap-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D5] px-4 py-2">
            <div className="flex items-center gap-1 text-[#E9B949]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(Number(rating))
                      ? "fill-[#E9B949] text-[#E9B949]"
                      : "text-[#DCD5C5]"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-bold text-[#1E2421]">
              {rating}{" "}
              <span className="font-normal text-xs text-[#5C645F]">
                ({place.reviews_count} {place.reviews_count === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 text-sm leading-relaxed text-[#5C645F]">
        <p>
          Verified visitor reviews and ratings for {place.name}. Community review submissions and photo uploads will open to all registered explorers in Module M8.
        </p>
      </div>
    </section>
  );
}
