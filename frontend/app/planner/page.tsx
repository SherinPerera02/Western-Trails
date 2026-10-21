"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Compass,
  MapPin,
  Save,
  Trash2,
  FolderOpen,
  ArrowRight,
  Clock,
  Navigation,
  AlertCircle,
  LogIn,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import PlannerTimelineItem from "@/src/components/planner/PlannerTimelineItem";
import PlannerLegConnector from "@/src/components/planner/PlannerLegConnector";
import PlannerDisclaimer from "@/src/components/planner/PlannerDisclaimer";
import PlannerHeavyNotice from "@/src/components/planner/PlannerHeavyNotice";
import PlannerEmptyState from "@/src/components/planner/PlannerEmptyState";
import PlannerMiniMap from "@/src/components/planner/PlannerMiniMap";
import { PlanItemDetail } from "@/types/planner";

export default function PlannerPage() {
  const { user } = useAuth();
  const {
    currentPlan,
    loading,
    saving,
    totalItemsCount,
    reorderItems,
    removeFromPlan,
    updatePlanMeta,
    updateItemDetails,
    clearPlan,
    saveCurrentDraftToAccount,
  } = usePlan();

  const [planName, setPlanName] = useState("My Day Trip");
  const [visitDate, setVisitDate] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showGuestAuthPrompt, setShowGuestAuthPrompt] = useState(false);

  // Sync plan title and date when plan changes
  useEffect(() => {
    if (currentPlan) {
      setPlanName(currentPlan.plan_name || "My Day Trip");
      setVisitDate(currentPlan.visit_date || "");
    }
  }, [currentPlan]);

  // Today's date formatted as YYYY-MM-DD for datepicker min restriction
  const today = new Date().toISOString().split("T")[0];

  const handleNameBlur = () => {
    const trimmed = planName.trim() || "My Day Trip";
    setPlanName(trimmed);
    updatePlanMeta(trimmed, visitDate || null);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setVisitDate(dateVal);
    updatePlanMeta(planName, dateVal || null);
  };

  const handleMoveUp = (index: number) => {
    if (!currentPlan || index <= 0) return;
    const items = [...currentPlan.items];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    // Use attraction IDs in guest mode, item IDs in user mode
    const ids = items.map((it) => (user ? it.id : it.attraction_id));
    reorderItems(ids);
  };

  const handleMoveDown = (index: number) => {
    if (!currentPlan || index >= currentPlan.items.length - 1) return;
    const items = [...currentPlan.items];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    const ids = items.map((it) => (user ? it.id : it.attraction_id));
    reorderItems(ids);
  };

  const handleSavePlan = async () => {
    if (!user) {
      setShowGuestAuthPrompt(true);
      return;
    }
    await updatePlanMeta(planName, visitDate || null);
  };

  const handleConfirmClear = async () => {
    await clearPlan();
    setShowClearConfirm(false);
  };

  const items = currentPlan?.items || [];
  const legs = currentPlan?.legs || [];
  const stopsCount = items.length;
  const totalDistance = currentPlan?.total_distance_km ?? 0;
  const travelMinutes = currentPlan?.total_estimated_travel_minutes ?? 0;

  const travelHours = Math.floor(travelMinutes / 60);
  const remainingMins = travelMinutes % 60;
  const formattedTime =
    travelHours > 0
      ? `${travelHours}h ${remainingMins}m`
      : `${travelMinutes} min`;

  return (
    <div className="flex flex-1 flex-col bg-[#FBF9F4] text-[#1E2421]">
      {/* Top Banner Header */}
      <section className="border-b border-[#EAE4D7] bg-[#F4EFE6]/70 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A8522E]">
                <Compass className="h-4 w-4" />
                <span>Visit Planner</span>
              </div>
              <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1E2421]">
                Day Trip Itinerary
              </h1>
              <p className="mt-1 text-sm text-[#5C645F] max-w-2xl">
                Curate your day along Sri Lanka&apos;s west coast. See stop sequences,
                travel times, and distances at a glance.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2.5 shrink-0">
              {user && (
                <Link
                  href="/planner/saved"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D2C5] bg-white px-4 py-2.5 text-xs font-semibold text-[#1E2421] shadow-2xs hover:bg-[#F8F5EE] transition-colors"
                >
                  <FolderOpen className="h-4 w-4 text-[#174D44]" />
                  <span>Saved Plans</span>
                </Link>
              )}

              {stopsCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5C1B8] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#8C2E1F] hover:bg-[#FDF5F3] transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSavePlan}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#174D44] px-4.5 py-2.5 text-xs font-semibold text-[#FBF9F4] shadow-xs hover:bg-[#103630] disabled:opacity-60 transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "Saving…" : user ? "Save Plan" : "Save Plan (Login)"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-9 w-9 rounded-full border-3 border-[#174D44] border-t-transparent animate-spin mb-3" />
            <p className="font-serif text-lg font-bold text-[#1E2421]">Loading your visit plan...</p>
          </div>
        ) : stopsCount === 0 ? (
          <PlannerEmptyState />
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Timeline, Plan Meta Inputs, Totals */}
            <div className="w-full lg:col-span-7 flex flex-col gap-6 order-1">
              {/* Plan Metadata Box (Title & Date Picker) */}
              <div className="rounded-2xl border border-[#E8E2D5] bg-white p-5 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Plan Name */}
                  <div className="sm:col-span-7">
                    <label
                      htmlFor="planner-plan-name"
                      className="block text-xs font-bold uppercase tracking-wider text-[#736B5E] mb-1"
                    >
                      Plan Name
                    </label>
                    <input
                      id="planner-plan-name"
                      type="text"
                      maxLength={100}
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      onBlur={handleNameBlur}
                      placeholder="e.g. Saturday Southern Coast Trail"
                      className="w-full rounded-xl border border-[#D8D2C5] bg-[#FBF9F4] px-3.5 py-2 text-sm font-semibold text-[#1E2421] focus:border-[#174D44] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174D44]"
                    />
                  </div>

                  {/* Date Picker (Optional, not in past) */}
                  <div className="sm:col-span-5">
                    <label
                      htmlFor="planner-visit-date"
                      className="block text-xs font-bold uppercase tracking-wider text-[#736B5E] mb-1"
                    >
                      Visit Date (Optional)
                    </label>
                    <div className="relative">
                      <input
                        id="planner-visit-date"
                        type="date"
                        min={today}
                        value={visitDate}
                        onChange={handleDateChange}
                        className="w-full rounded-xl border border-[#D8D2C5] bg-[#FBF9F4] px-3 py-2 text-sm text-[#1E2421] focus:border-[#174D44] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#174D44]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gentle Warning if plan looks heavy */}
              <PlannerHeavyNotice
                stopsCount={stopsCount}
                travelMinutes={travelMinutes}
              />

              {/* Stop Timeline */}
              <div className="flex flex-col" role="list" aria-label="Visit plan stops timeline">
                {items.map((item: PlanItemDetail, idx: number) => (
                  <div key={item.id || item.attraction_id} role="listitem">
                    <PlannerTimelineItem
                      item={item}
                      index={idx}
                      totalItems={stopsCount}
                      onMoveUp={() => handleMoveUp(idx)}
                      onMoveDown={() => handleMoveDown(idx)}
                      onRemove={() => removeFromPlan(item.attraction_id)}
                      onUpdateDetails={(time, note) =>
                        updateItemDetails(item.id, time, note)
                      }
                    />

                    {/* Show leg connector between stops */}
                    {idx < stopsCount - 1 && (
                      <PlannerLegConnector leg={item.leg_to_next} />
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Summary Footer */}
              <div className="rounded-2xl border border-[#E8E2D5] bg-[#F4EFE6]/70 p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-[#1E2421] mb-3">
                  Itinerary Summary
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
                  <div className="rounded-xl bg-white p-3 border border-[#EAE4D7]">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#736B5E]">
                      Stops
                    </span>
                    <span className="mt-0.5 block font-serif text-xl sm:text-2xl font-bold text-[#174D44]">
                      {stopsCount}
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-[#EAE4D7]">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#736B5E]">
                      Total Distance
                    </span>
                    <span className="mt-0.5 block font-serif text-xl sm:text-2xl font-bold text-[#174D44]">
                      {totalDistance} km
                    </span>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-[#EAE4D7]">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#736B5E]">
                      Est. Road Time
                    </span>
                    <span className="mt-0.5 block font-serif text-xl sm:text-2xl font-bold text-[#174D44]">
                      {formattedTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Disclaimer Note Box */}
              <PlannerDisclaimer disclaimer={currentPlan?.disclaimer} />
            </div>

            {/* Right 5 Cols (Mobile below): Mini Map */}
            <div className="w-full lg:col-span-5 order-2 lg:order-2">
              <div className="rounded-2xl bg-white border border-[#E8E2D5] p-3 shadow-xs">
                <div className="flex items-center justify-between pb-3 px-1 border-b border-[#EAE4D7] mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#174D44]">
                    <MapPin className="h-4 w-4" />
                    <span>Route Overview</span>
                  </div>
                  <span className="text-xs text-[#736B5E]">
                    {stopsCount} numbered stops
                  </span>
                </div>
                <PlannerMiniMap items={items} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
            <h4
              id="clear-dialog-title"
              className="font-serif text-lg font-bold text-[#1E2421]"
            >
              Clear your visit plan?
            </h4>
            <p className="mt-2 text-xs text-[#5C645F] leading-relaxed">
              This will remove all {stopsCount} stops currently in this plan.
              You can always add places again from the directory or map.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-[#D5CCBA] bg-white px-4 py-2 text-xs font-semibold text-[#1E2421] hover:bg-[#F4F0E8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="rounded-xl bg-[#8C2E1F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#A83220] transition-colors"
              >
                Clear Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Login Prompt Modal */}
      {showGuestAuthPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-dialog-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowGuestAuthPrompt(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#5C645F] hover:bg-[#F4F0E8]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFE9DC] text-[#174D44] mb-4">
              <LogIn className="h-6 w-6" />
            </div>

            <h3
              id="guest-dialog-title"
              className="font-serif text-xl font-bold text-[#1E2421]"
            >
              Log in to save your itinerary
            </h3>

            <p className="mt-2 text-sm text-[#5C645F] leading-relaxed">
              You are currently planning as a guest. All your {stopsCount} stops
              are safely preserved in your browser draft and will automatically
              transfer to your account when you log in or sign up.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/login"
                className="flex-1 rounded-xl bg-[#174D44] py-2.5 text-center text-xs font-semibold text-[#FBF9F4] hover:bg-[#103630] transition-colors"
              >
                Log In & Save Draft
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-xl border border-[#D5CCBA] bg-white py-2.5 text-center text-xs font-semibold text-[#1E2421] hover:bg-[#F4F0E8] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
