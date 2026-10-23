"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  RefreshCw,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface AdminReviewItem {
  id: number;
  attraction_id: number;
  user_id: number;
  user_name: string;
  place_name: string;
  rating: number;
  comment: string | null;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  formatted_date: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected">("all");

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Status updating pending ID
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Delete modal
  const [reviewToDelete, setReviewToDelete] = useState<AdminReviewItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get("/admin/reviews");
      if (res.data?.data) {
        setReviews(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to load reviews.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (r.place_name && r.place_name.toLowerCase().includes(q)) ||
        (r.user_name && r.user_name.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ? true : r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, statusFilter]);

  const handleUpdateStatus = async (review: AdminReviewItem, nextStatus: "approved" | "rejected") => {
    setUpdatingId(review.id);
    try {
      await api.put(`/admin/reviews/${review.id}/status`, { status: nextStatus });
      setNotification({
        type: "success",
        message: `Review #${review.id} status set to ${nextStatus}.`,
      });
      fetchReviews(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to update review status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/admin/reviews/${reviewToDelete.id}`);
      setNotification({
        type: "success",
        message: `Review #${reviewToDelete.id} was deleted successfully.`,
      });
      setReviewToDelete(null);
      fetchReviews(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Could not delete review.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4 text-[#174D44]" />
            <span>Moderation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Visitor Reviews & Feedback
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Monitor community ratings, approve or flag reviews, and manage feedback across all attractions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchReviews(true)}
            disabled={refreshing || loading}
            title="Refresh reviews"
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#174D44]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
              : "bg-rose-50/90 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-600 p-0.5 rounded-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar: Search + Status */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by destination, reviewer name, or review comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#174D44] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === "all"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === "approved"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === "pending"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              statusFilter === "rejected"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#174D44]/30 border-t-[#174D44] rounded-full animate-spin mx-auto" />
            <p className="text-stone-500 text-sm font-medium">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-800">No reviews found</h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No reviews match your current filter or search criteria."
                : "No reviews have been submitted by visitors yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Attraction
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Reviewer & Rating
                  </th>
                  <th scope="col" className="px-6 py-3.5 max-w-sm">
                    Comment
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredReviews.map((rev) => {
                  const isUpdating = updatingId === rev.id;

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-stone-50/70 transition-colors group"
                    >
                      {/* Place Name */}
                      <td className="px-6 py-4 font-semibold text-stone-900 whitespace-nowrap">
                        <Link
                          href={`/places/${rev.attraction_id}`}
                          target="_blank"
                          className="hover:text-[#174D44] inline-flex items-center gap-1 group-hover:underline"
                        >
                          <span>{rev.place_name || `Place #${rev.attraction_id}`}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </Link>
                      </td>

                      {/* Reviewer & Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-xs text-stone-800">{rev.user_name}</p>
                          <div className="flex items-center gap-0.5 text-[#E9B949] mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? "fill-[#E9B949] text-[#E9B949]"
                                    : "text-stone-300"
                                }`}
                              />
                            ))}
                            <span className="text-[11px] font-bold text-stone-600 ml-1">
                              {rev.rating}.0
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-6 py-4 text-xs text-stone-600 max-w-sm">
                        {rev.comment ? (
                          <p className="line-clamp-2 leading-relaxed">{rev.comment}</p>
                        ) : (
                          <span className="text-stone-300 italic">No written comment (rating only)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {rev.status === "approved" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Approved
                          </span>
                        ) : rev.status === "pending" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-center text-xs text-stone-500 whitespace-nowrap">
                        {rev.formatted_date}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {rev.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(rev, "approved")}
                              disabled={isUpdating}
                              title="Approve Review"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {rev.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(rev, "rejected")}
                              disabled={isUpdating}
                              title="Reject Review"
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Review (REQ-072) */}
                          <button
                            type="button"
                            onClick={() => setReviewToDelete(rev)}
                            title="Delete Review"
                            className="p-1.5 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(reviewToDelete)}
        title="Delete Visitor Review"
        itemName={`Review by ${reviewToDelete?.user_name || "Visitor"}`}
        message="Are you sure you want to permanently delete this review? The attraction's average rating will be recalculated automatically."
        confirmLabel="Delete Review"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
