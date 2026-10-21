"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  ArrowLeft,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Plus,
  Compass,
  AlertCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import api, { apiError } from "@/lib/api";
import { SavedPlanSummary } from "@/types/planner";

export default function SavedPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    savedPlans,
    loadSavedPlans,
    selectSavedPlan,
    duplicatePlan,
    deletePlan,
    showToast,
  } = usePlan();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SavedPlanSummary | null>(null);
  const [newName, setNewName] = useState("");
  const [planToDelete, setPlanToDelete] = useState<SavedPlanSummary | null>(null);
  const [actionPending, setActionPending] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      loadSavedPlans().finally(() => setLoading(false));
    }
  }, [user, authLoading, router, loadSavedPlans]);

  const handleOpenPlan = async (planId: number) => {
    const success = await selectSavedPlan(planId);
    if (success) {
      router.push("/planner");
    } else {
      // 404 or not found
      showToast("This plan no longer exists. Refreshing your list.", "error");
      loadSavedPlans();
    }
  };

  const handleDuplicate = async (planId: number) => {
    setActionPending(true);
    await duplicatePlan(planId);
    setActionPending(false);
  };

  const handleStartRename = (plan: SavedPlanSummary) => {
    setEditingPlan(plan);
    setNewName(plan.plan_name);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    const trimmed = newName.trim();
    if (!trimmed) return;

    try {
      setActionPending(true);
      await api.put(`/trip/${editingPlan.id}`, {
        plan_name: trimmed,
      });
      await loadSavedPlans();
      showToast("Plan renamed successfully");
      setEditingPlan(null);
    } catch (err) {
      showToast(apiError(err), "error");
    } finally {
      setActionPending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    setActionPending(true);
    await deletePlan(planToDelete.id);
    setPlanToDelete(null);
    setActionPending(false);
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 bg-[#FBF9F4]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      {/* Header Banner */}
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D44] hover:text-[#103630] mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Active Planner</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8522E]">
                <FolderOpen className="h-4 w-4" />
                <span>My Saved Itineraries</span>
              </div>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#1E2421]">
                Saved Visit Plans
              </h1>
              <p className="mt-1 text-sm text-[#5C645F]">
                Access, rename, duplicate, and manage all your saved day-trip itineraries.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-4.5 py-2.5 text-xs font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] transition-colors self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Plan</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Plans List */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent mb-3" />
            <p className="font-serif text-base font-semibold text-[#1E2421]">Loading saved plans...</p>
          </div>
        ) : savedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8D2C5] bg-white/70 p-10 sm:p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
              <FolderOpen className="h-7 w-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E2421]">
              No saved plans yet
            </h3>
            <p className="mt-2 text-sm text-[#5C645F] max-w-sm leading-relaxed">
              When you create and save visit plans in the Day Trip Planner, they will appear here so you can revisit them anytime.
            </p>
            <Link
              href="/planner"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#103630] transition-colors"
            >
              <Compass className="h-4 w-4" />
              <span>Open Trip Planner</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-2xs hover:border-[#174D44]/30 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-lg font-bold text-[#1E2421] group-hover:text-[#174D44] transition-colors line-clamp-1">
                      {plan.plan_name}
                    </h2>
                    <span className="shrink-0 rounded-md bg-[#EFE9DC] px-2 py-0.5 text-[11px] font-bold text-[#174D44]">
                      {plan.items_count} {plan.items_count === 1 ? "stop" : "stops"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-[#5C645F]">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#174D44] shrink-0" />
                      <span>{plan.visit_date || "Date not set (flexible)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[#C86446] shrink-0" />
                      <span>{plan.total_distance_km} km estimated road distance</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-[#EAE4D7] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPlan(plan.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#174D44] px-3 py-1.5 text-xs font-semibold text-[#FBF9F4] shadow-2xs hover:bg-[#103630] transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <div className="flex items-center gap-1 text-[#5C645F]">
                    <button
                      type="button"
                      onClick={() => handleStartRename(plan)}
                      aria-label={`Rename ${plan.plan_name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F4EFE6] hover:text-[#174D44] transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(plan.id)}
                      disabled={actionPending}
                      aria-label={`Duplicate ${plan.plan_name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#F4EFE6] hover:text-[#174D44] transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanToDelete(plan)}
                      aria-label={`Delete ${plan.plan_name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#FDF5F3] hover:text-[#8C2E1F] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Rename Modal */}
      {editingPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
            <h4
              id="rename-dialog-title"
              className="font-serif text-lg font-bold text-[#1E2421]"
            >
              Rename Visit Plan
            </h4>
            <form onSubmit={handleConfirmRename} className="mt-4">
              <label
                htmlFor="rename-input"
                className="block text-xs font-semibold uppercase tracking-wider text-[#736B5E] mb-1"
              >
                Plan Name
              </label>
              <input
                id="rename-input"
                type="text"
                maxLength={100}
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-[#D8D2C5] bg-white px-3.5 py-2 text-sm text-[#1E2421] focus:border-[#174D44] focus:outline-none focus:ring-1 focus:ring-[#174D44]"
              />

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="rounded-xl border border-[#D5CCBA] bg-white px-4 py-2 text-xs font-semibold text-[#1E2421] hover:bg-[#F4F0E8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionPending || !newName.trim()}
                  className="rounded-xl bg-[#174D44] px-4 py-2 text-xs font-semibold text-white hover:bg-[#103630] disabled:opacity-60 transition-colors"
                >
                  {actionPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {planToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
            <h4
              id="delete-dialog-title"
              className="font-serif text-lg font-bold text-[#1E2421]"
            >
              Delete Visit Plan?
            </h4>
            <p className="mt-2 text-xs text-[#5C645F] leading-relaxed">
              Are you sure you want to delete &ldquo;{planToDelete.plan_name}&rdquo;?
              This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="rounded-xl border border-[#D5CCBA] bg-white px-4 py-2 text-xs font-semibold text-[#1E2421] hover:bg-[#F4F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionPending}
                className="rounded-xl bg-[#8C2E1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A83220] disabled:opacity-60 transition-colors"
              >
                {actionPending ? "Deleting…" : "Delete Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
