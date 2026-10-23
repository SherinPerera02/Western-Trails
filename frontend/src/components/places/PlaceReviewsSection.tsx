"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MessageSquare, Send, Trash2, Edit3, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import { PlaceDetail } from "./types";
import { useAuth } from "@/context/AuthContext";
import api, { apiError } from "@/lib/api";

interface ReviewItem {
  id: number;
  attraction_id: number;
  user_id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  status: string;
  formatted_date: string;
}

interface PlaceReviewsSectionProps {
  place: PlaceDetail;
}

export default function PlaceReviewsSection({ place }: PlaceReviewsSectionProps) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [currentUserReview, setCurrentUserReview] = useState<ReviewItem | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(place.average_rating ?? null);
  const [reviewsCount, setReviewsCount] = useState<number>(place.reviews_count ?? 0);
  const [loading, setLoading] = useState(true);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/places/${place.id}/reviews`);
      if (res.data) {
        setReviews(res.data.data || []);
        setAverageRating(res.data.average_rating ?? null);
        setReviewsCount(res.data.reviews_count ?? 0);
        if (res.data.current_user_review) {
          setCurrentUserReview(res.data.current_user_review);
          setRating(res.data.current_user_review.rating);
          setComment(res.data.current_user_review.comment || "");
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [place.id, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setFeedbackMessage(null);

    try {
      const res = await api.post(`/places/${place.id}/reviews`, {
        rating,
        comment: comment.trim() || null,
      });

      setFeedbackMessage({
        type: "success",
        text: res.data?.message || "Your review was saved successfully!",
      });

      setIsEditing(false);
      await fetchReviews();
    } catch (err) {
      setFeedbackMessage({
        type: "error",
        text: apiError(err) || "Could not submit review. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete your review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setCurrentUserReview(null);
      setComment("");
      setRating(5);
      setIsEditing(false);
      setFeedbackMessage({
        type: "success",
        text: "Your review was deleted successfully.",
      });
      await fetchReviews();
    } catch (err) {
      setFeedbackMessage({
        type: "error",
        text: apiError(err) || "Could not delete review.",
      });
    }
  };

  const ratingDisplay = averageRating !== null ? averageRating.toFixed(1) : null;

  return (
    <section
      aria-labelledby="reviews-heading"
      className="rounded-2xl border border-[#E8E2D5] bg-white p-6 shadow-2xs sm:p-8 space-y-6"
    >
      {/* Header with Average Rating */}
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
            Visitor Reviews & Ratings
          </h2>
        </div>

        {ratingDisplay ? (
          <div className="flex items-center gap-3 rounded-xl bg-[#FBF9F4] border border-[#E8E2D5] px-4 py-2">
            <div className="flex items-center gap-1 text-[#E9B949]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(Number(ratingDisplay))
                      ? "fill-[#E9B949] text-[#E9B949]"
                      : "text-[#DCD5C5]"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-bold text-[#1E2421]">
              {ratingDisplay}{" "}
              <span className="font-normal text-xs text-[#5C645F]">
                ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-[#736B5E] italic">
            No reviews yet — be the first to rate!
          </span>
        )}
      </div>

      {/* Status Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-medium ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Review Submission Area */}
      {user ? (
        currentUserReview && !isEditing ? (
          /* User's existing review display with edit/delete buttons */
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#174D44]">
                Your Review
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#174D44] hover:underline"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => handleDeleteReview(currentUserReview.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C2E1F] hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#E9B949]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= currentUserReview.rating
                      ? "fill-[#E9B949] text-[#E9B949]"
                      : "text-stone-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-xs font-semibold text-stone-700">
                {currentUserReview.rating} of 5 stars
              </span>
            </div>

            {currentUserReview.comment && (
              <p className="text-sm text-stone-800 leading-relaxed">
                {currentUserReview.comment}
              </p>
            )}
          </div>
        ) : (
          /* Interactive Submission / Edit Form */
          <form
            onSubmit={handleSubmitReview}
            className="rounded-xl border border-[#E8E2D5] bg-[#FBF9F4] p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#1E2421]">
                {isEditing ? "Update Your Review" : "Leave a Rating & Review"}
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-medium text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736B5E] mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} of 5 stars`}
                    className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-[#E9B949] text-[#E9B949]"
                          : "text-[#DCD5C5]"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-[#1E2421]">
                  {(hoverRating || rating)} / 5 Stars
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label
                htmlFor="review-comment"
                className="block text-xs font-semibold uppercase tracking-wider text-[#736B5E] mb-1.5"
              >
                Review Comments (Optional)
              </label>
              <textarea
                id="review-comment"
                rows={3}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience, visiting tips, conditions, or recommendations for other explorers..."
                className="w-full rounded-xl border border-[#D8D2C5] bg-white px-3.5 py-2.5 text-sm text-[#1E2421] placeholder-stone-400 focus:border-[#174D44] focus:outline-none focus:ring-1 focus:ring-[#174D44] transition-all resize-y"
              />
              <span className="block text-right text-[11px] text-stone-400 mt-1">
                {comment.length} / 1,000 characters
              </span>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-xs font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] disabled:opacity-50 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{submitting ? "Submitting…" : isEditing ? "Save Changes" : "Post Review"}</span>
              </button>
            </div>
          </form>
        )
      ) : (
        /* Guest Callout Prompt */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E8E2D5] bg-[#F7F4EB] text-xs">
          <div className="flex items-center gap-2.5 text-[#5C645F]">
            <LogIn className="h-4 w-4 text-[#174D44] shrink-0" />
            <span>Have you explored {place.name}? Log in to share your rating and review.</span>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-[#174D44] text-white font-semibold hover:bg-[#103630] transition-colors shrink-0"
          >
            <span>Log In to Review</span>
          </Link>
        </div>
      )}

      {/* Community Reviews List */}
      <div className="space-y-4 pt-2">
        <h3 className="font-serif font-bold text-base text-[#1E2421]">
          Community Feedback ({reviews.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#5C645F]">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-xs text-[#736B5E] italic py-3">
            No community reviews have been posted for this destination yet.
          </p>
        ) : (
          <div className="divide-y divide-[#F0EBE0] space-y-4">
            {reviews.map((rev) => (
              <article key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#174D44]/10 text-[#174D44] flex items-center justify-center font-bold text-xs">
                      {rev.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs text-[#1E2421]">
                      {rev.user_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#736B5E]">
                    {rev.formatted_date}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[#E9B949]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating
                          ? "fill-[#E9B949] text-[#E9B949]"
                          : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>

                {rev.comment && (
                  <p className="text-xs sm:text-sm text-[#3D4540] leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
