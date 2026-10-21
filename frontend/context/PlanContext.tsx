"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  PlanAttraction,
  PlanItemDetail,
  SavedPlanSummary,
  TripLeg,
  VisitPlanDetail,
} from "@/types/planner";
import { MapPlace } from "@/src/components/places/types";

const DRAFT_STORAGE_KEY = "wt_draft_plan_ids";
const DISCLAIMER_TEXT =
  "Distances and travel times are estimates. This plan is a planning aid, not an optimised route.";

interface ToastState {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

interface PlanContextType {
  currentPlan: VisitPlanDetail | null;
  savedPlans: SavedPlanSummary[];
  loading: boolean;
  saving: boolean;
  totalItemsCount: number;
  planAttractionIds: Set<number>;
  liveAnnouncement: string;
  isInPlan: (attractionId: number) => boolean;
  addToPlan: (attractionId: number, placeName?: string) => Promise<boolean>;
  removeFromPlan: (attractionId: number) => Promise<boolean>;
  reorderItems: (newItemIds: number[]) => Promise<boolean>;
  updatePlanMeta: (planName?: string, visitDate?: string | null) => Promise<boolean>;
  updateItemDetails: (
    itemId: number,
    startTime: string | null,
    notes: string | null
  ) => Promise<boolean>;
  clearPlan: () => Promise<boolean>;
  saveCurrentDraftToAccount: () => Promise<boolean>;
  loadSavedPlans: () => Promise<void>;
  selectSavedPlan: (planId: number) => Promise<boolean>;
  duplicatePlan: (planId: number) => Promise<boolean>;
  deletePlan: (planId: number) => Promise<boolean>;
  showToast: (message: string, type?: "success" | "info" | "error") => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [currentPlan, setCurrentPlan] = useState<VisitPlanDetail | null>(null);
  const [savedPlans, setSavedPlans] = useState<SavedPlanSummary[]>([]);
  const [draftIds, setDraftIds] = useState<number[]>([]);
  const [cachedPlaces, setCachedPlaces] = useState<Map<number, PlanAttraction>>(
    new Map()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const announce = useCallback((message: string) => {
    setLiveAnnouncement(message);
  }, []);

  // Fetch lightweight map places to build offline/draft plan details
  const ensurePlacesCached = useCallback(
    async (ids: number[]): Promise<Map<number, PlanAttraction>> => {
      const missing = ids.filter((id) => !cachedPlaces.has(id));
      if (missing.length === 0) return cachedPlaces;

      try {
        const res = await api.get<{ data: MapPlace[] }>("/places/map");
        const newMap = new Map(cachedPlaces);
        res.data.data.forEach((p) => {
          newMap.set(p.id, {
            id: p.id,
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
            distance_km: p.distance_km,
            opening_hours: p.opening_hours,
            first_image_url: p.first_image_url,
            status: "active",
            categories: p.category_names.map((name, i) => ({ id: i + 1, name })),
          });
        });
        setCachedPlaces(newMap);
        return newMap;
      } catch {
        return cachedPlaces;
      }
    },
    [cachedPlaces]
  );

  // Compute a synthetic VisitPlanDetail for guest users
  const buildGuestDraftPlan = useCallback(
    (
      ids: number[],
      placesMap: Map<number, PlanAttraction>,
      customName = "My Day Trip Draft",
      customDate: string | null = null,
      existingItemsMeta: Map<number, { start_time: string | null; notes: string | null }> = new Map()
    ): VisitPlanDetail => {
      const items: PlanItemDetail[] = [];
      const legs: TripLeg[] = [];
      let totalDistance = 0;
      let totalMinutes = 0;

      for (let i = 0; i < ids.length; i++) {
        const attId = ids[i];
        const att = placesMap.get(attId) || null;
        const meta = existingItemsMeta.get(attId);

        let legToNext = null;
        if (i < ids.length - 1) {
          const nextAttId = ids[i + 1];
          const nextAtt = placesMap.get(nextAttId) || null;

          if (att && nextAtt) {
            const dist = calculateHaversineKm(
              att.latitude,
              att.longitude,
              nextAtt.latitude,
              nextAtt.longitude
            );
            const mins = Math.round((dist / 30) * 60);
            totalDistance += dist;
            totalMinutes += mins;

            legToNext = {
              distance_km: dist,
              estimated_minutes: mins,
              from_attraction_id: att.id,
              to_attraction_id: nextAtt.id,
            };

            legs.push({
              from_item_id: i + 1,
              to_item_id: i + 2,
              from_attraction_id: att.id,
              to_attraction_id: nextAtt.id,
              from_name: att.name,
              to_name: nextAtt.name,
              distance_km: dist,
              estimated_minutes: mins,
            });
          }
        }

        items.push({
          id: -(i + 1), // negative ID signifies temporary draft item
          sequence: i + 1,
          start_time: meta?.start_time ?? null,
          notes: meta?.notes ?? null,
          attraction_id: attId,
          unavailable: !att,
          opening_hours: att?.opening_hours || null,
          visit_hours_hint: att?.opening_hours || null,
          attraction: att,
          leg_to_next: legToNext,
        });
      }

      return {
        id: -1,
        plan_name: customName,
        visit_date: customDate,
        items_count: items.length,
        total_distance_km: Math.round(totalDistance * 10) / 10,
        total_estimated_travel_minutes: totalMinutes,
        disclaimer: DISCLAIMER_TEXT,
        items,
        legs,
      };
    },
    []
  );

  // Load saved plans for authenticated user
  const loadSavedPlans = useCallback(async () => {
    if (!user) {
      setSavedPlans([]);
      return;
    }
    try {
      const res = await api.get<{ data: SavedPlanSummary[] }>("/trip");
      setSavedPlans(res.data.data || []);
    } catch {
      setSavedPlans([]);
    }
  }, [user]);

  // Load full plan details by ID
  const fetchPlanDetails = useCallback(async (planId: number) => {
    try {
      const res = await api.get<{ data: VisitPlanDetail }>(`/trip/${planId}`);
      setCurrentPlan(res.data.data);
      return res.data.data;
    } catch {
      return null;
    }
  }, []);

  // Sync draft IDs from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDraftIds(parsed.map(Number).filter(Boolean));
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Main synchronization effect on Auth change
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;
    setLoading(true);

    const initializePlan = async () => {
      if (user) {
        // Authenticated user: Check if there's a guest draft to merge
        let localDraft: number[] = [];
        try {
          const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localDraft = parsed.map(Number).filter(Boolean);
            }
          }
        } catch {}

        try {
          // Fetch user's saved plans list
          const listRes = await api.get<{ data: SavedPlanSummary[] }>("/trip");
          if (!isMounted) return;

          const plans = listRes.data.data || [];
          setSavedPlans(plans);

          if (localDraft.length > 0) {
            // Merge draft into a real plan on the backend
            try {
              const createRes = await api.post<{ data: VisitPlanDetail }>("/trip", {
                plan_name: "My Day Trip",
                attraction_ids: localDraft.slice(0, 12),
              });
              if (isMounted) {
                setCurrentPlan(createRes.data.data);
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                setDraftIds([]);
                showToast("Your draft plan has been saved to your account!", "success");
                announce("Guest draft plan successfully saved to your account.");
                // Refresh saved plans
                api.get<{ data: SavedPlanSummary[] }>("/trip").then((r) => {
                  if (isMounted) setSavedPlans(r.data.data || []);
                });
              }
            } catch (err) {
              console.error("Failed to merge draft plan:", err);
            }
          } else if (plans.length > 0) {
            // Load the most recently created plan
            const fullPlan = await fetchPlanDetails(plans[0].id);
            if (isMounted && fullPlan) {
              setCurrentPlan(fullPlan);
            }
          } else {
            setCurrentPlan(null);
          }
        } catch {
          if (isMounted) {
            setCurrentPlan(null);
            setSavedPlans([]);
          }
        }
      } else {
        // Guest user: construct draft plan from localStorage
        const storedIds = draftIds;
        if (storedIds.length > 0) {
          const placesMap = await ensurePlacesCached(storedIds);
          if (isMounted) {
            const draft = buildGuestDraftPlan(storedIds, placesMap);
            setCurrentPlan(draft);
          }
        } else {
          setCurrentPlan(null);
        }
      }

      if (isMounted) setLoading(false);
    };

    initializePlan();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fast attraction ID lookup
  const planAttractionIds = useMemo(() => {
    const set = new Set<number>();
    if (user && currentPlan?.items) {
      currentPlan.items.forEach((item) => set.add(item.attraction_id));
    } else {
      draftIds.forEach((id) => set.add(id));
    }
    return set;
  }, [user, currentPlan, draftIds]);

  const totalItemsCount = useMemo(() => {
    if (user && currentPlan) {
      return currentPlan.items_count ?? currentPlan.items?.length ?? 0;
    }
    return draftIds.length;
  }, [user, currentPlan, draftIds]);

  const isInPlan = useCallback(
    (attractionId: number) => planAttractionIds.has(attractionId),
    [planAttractionIds]
  );

  // Add attraction to plan
  const addToPlan = useCallback(
    async (attractionId: number, placeName?: string): Promise<boolean> => {
      if (planAttractionIds.has(attractionId)) {
        showToast("This place is already in your visit plan.", "info");
        return false;
      }

      if (totalItemsCount >= 12) {
        showToast("A visit plan cannot exceed 12 stops.", "error");
        return false;
      }

      const displayName = placeName || "Place";

      if (!user) {
        // Guest mode: update localStorage
        const nextIds = [...draftIds, attractionId];
        setDraftIds(nextIds);
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextIds));

        const placesMap = await ensurePlacesCached(nextIds);
        const updated = buildGuestDraftPlan(
          nextIds,
          placesMap,
          currentPlan?.plan_name || "My Day Trip Draft",
          currentPlan?.visit_date || null
        );
        setCurrentPlan(updated);

        showToast(`Added ${displayName} to your plan`);
        announce(`Added ${displayName} to your plan. Total stops: ${nextIds.length}.`);
        return true;
      }

      // Logged in mode
      try {
        setSaving(true);
        if (!currentPlan || currentPlan.id <= 0) {
          // Create new plan
          const res = await api.post<{ data: VisitPlanDetail }>("/trip", {
            plan_name: "My Day Trip",
            attraction_ids: [attractionId],
          });
          setCurrentPlan(res.data.data);
          loadSavedPlans();
        } else {
          // Append item to existing plan
          const res = await api.post<{ data: VisitPlanDetail }>(
            `/trip/${currentPlan.id}/items`,
            { attraction_id: attractionId }
          );
          setCurrentPlan(res.data.data);
          loadSavedPlans();
        }

        showToast(`Added ${displayName} to your plan`);
        announce(`Added ${displayName} to your plan.`);
        return true;
      } catch (err) {
        showToast(apiError(err), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [
      planAttractionIds,
      totalItemsCount,
      user,
      draftIds,
      ensurePlacesCached,
      buildGuestDraftPlan,
      currentPlan,
      showToast,
      announce,
      loadSavedPlans,
    ]
  );

  // Remove attraction from plan
  const removeFromPlan = useCallback(
    async (attractionId: number): Promise<boolean> => {
      if (!planAttractionIds.has(attractionId)) return false;

      if (!user) {
        // Guest mode
        const nextIds = draftIds.filter((id) => id !== attractionId);
        setDraftIds(nextIds);
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextIds));

        if (nextIds.length === 0) {
          setCurrentPlan(null);
        } else {
          const placesMap = await ensurePlacesCached(nextIds);
          const updated = buildGuestDraftPlan(
            nextIds,
            placesMap,
            currentPlan?.plan_name || "My Day Trip Draft",
            currentPlan?.visit_date || null
          );
          setCurrentPlan(updated);
        }

        showToast("Removed stop from your plan");
        announce("Removed stop from your plan.");
        return true;
      }

      // Logged-in mode: optimistic removal
      if (!currentPlan || currentPlan.id <= 0) return false;

      const itemToRemove = currentPlan.items.find(
        (it) => it.attraction_id === attractionId
      );
      if (!itemToRemove) return false;

      const previousPlan = currentPlan;
      // Optimistically update
      const filteredItems = currentPlan.items
        .filter((it) => it.attraction_id !== attractionId)
        .map((it, idx) => ({ ...it, sequence: idx + 1 }));

      setCurrentPlan({
        ...currentPlan,
        items_count: filteredItems.length,
        items: filteredItems,
      });

      try {
        const res = await api.delete<{ data: VisitPlanDetail }>(
          `/trip/${currentPlan.id}/items/${itemToRemove.id}`
        );
        setCurrentPlan(res.data.data);
        loadSavedPlans();
        showToast("Removed stop from your plan");
        announce("Removed stop from your plan.");
        return true;
      } catch (err) {
        // Rollback
        setCurrentPlan(previousPlan);
        showToast(apiError(err), "error");
        return false;
      }
    },
    [
      planAttractionIds,
      user,
      draftIds,
      ensurePlacesCached,
      buildGuestDraftPlan,
      currentPlan,
      showToast,
      announce,
      loadSavedPlans,
    ]
  );

  // Reorder items
  const reorderItems = useCallback(
    async (newItemIds: number[]): Promise<boolean> => {
      if (!currentPlan) return false;

      if (!user) {
        // Guest reordering
        // In guest mode, newItemIds contains attractionIds in new order
        setDraftIds(newItemIds);
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newItemIds));

        const placesMap = await ensurePlacesCached(newItemIds);
        // preserve start_time and notes
        const metaMap = new Map<number, { start_time: string | null; notes: string | null }>();
        currentPlan.items.forEach((it) => {
          metaMap.set(it.attraction_id, { start_time: it.start_time, notes: it.notes });
        });

        const updated = buildGuestDraftPlan(
          newItemIds,
          placesMap,
          currentPlan.plan_name,
          currentPlan.visit_date,
          metaMap
        );
        setCurrentPlan(updated);
        announce("Stops reordered.");
        return true;
      }

      // Logged-in reordering: optimistic update
      const previousPlan = currentPlan;
      const itemMap = new Map(currentPlan.items.map((it) => [it.id, it]));
      const newItems: PlanItemDetail[] = [];

      for (let i = 0; i < newItemIds.length; i++) {
        const item = itemMap.get(newItemIds[i]);
        if (item) {
          newItems.push({ ...item, sequence: i + 1 });
        }
      }

      setCurrentPlan({
        ...currentPlan,
        items: newItems,
      });

      try {
        const res = await api.put<{ data: VisitPlanDetail }>(
          `/trip/${currentPlan.id}/reorder`,
          { item_ids: newItemIds }
        );
        setCurrentPlan(res.data.data);
        announce("Stops reordered successfully.");
        return true;
      } catch (err) {
        // Rollback on failure
        setCurrentPlan(previousPlan);
        showToast(apiError(err), "error");
        return false;
      }
    },
    [currentPlan, user, ensurePlacesCached, buildGuestDraftPlan, announce, showToast]
  );

  // Update plan metadata (name, visit date)
  const updatePlanMeta = useCallback(
    async (planName?: string, visitDate?: string | null): Promise<boolean> => {
      if (!currentPlan) return false;

      if (!user) {
        // Update guest plan local state
        setCurrentPlan((prev) =>
          prev
            ? {
                ...prev,
                plan_name: planName ?? prev.plan_name,
                visit_date: visitDate !== undefined ? visitDate : prev.visit_date,
              }
            : null
        );
        return true;
      }

      try {
        setSaving(true);
        const res = await api.put<{ data: VisitPlanDetail }>(
          `/trip/${currentPlan.id}`,
          {
            plan_name: planName,
            visit_date: visitDate,
          }
        );
        setCurrentPlan(res.data.data);
        loadSavedPlans();
        showToast("Plan details updated");
        return true;
      } catch (err) {
        showToast(apiError(err), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentPlan, user, loadSavedPlans, showToast]
  );

  // Update start_time or notes on an individual stop
  const updateItemDetails = useCallback(
    async (
      itemId: number,
      startTime: string | null,
      notes: string | null
    ): Promise<boolean> => {
      if (!currentPlan) return false;

      if (!user) {
        // Guest mode update
        setCurrentPlan((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items.map((it) =>
              it.id === itemId
                ? { ...it, start_time: startTime, notes: notes }
                : it
            ),
          };
        });
        return true;
      }

      // Backend expects PUT /api/trip/{id} with full items list
      const updatedItemsPayload = currentPlan.items.map((it) => {
        if (it.id === itemId) {
          return {
            attraction_id: it.attraction_id,
            start_time: startTime,
            notes: notes,
          };
        }
        return {
          attraction_id: it.attraction_id,
          start_time: it.start_time,
          notes: it.notes,
        };
      });

      try {
        const res = await api.put<{ data: VisitPlanDetail }>(
          `/trip/${currentPlan.id}`,
          {
            plan_name: currentPlan.plan_name,
            visit_date: currentPlan.visit_date,
            items: updatedItemsPayload,
          }
        );
        setCurrentPlan(res.data.data);
        return true;
      } catch (err) {
        showToast(apiError(err), "error");
        return false;
      }
    },
    [currentPlan, user, showToast]
  );

  // Clear current plan
  const clearPlan = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setDraftIds([]);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setCurrentPlan(null);
      showToast("Plan cleared");
      announce("Plan cleared.");
      return true;
    }

    if (!currentPlan) return true;

    try {
      setSaving(true);
      await api.delete(`/trip/${currentPlan.id}`);
      setCurrentPlan(null);
      loadSavedPlans();
      showToast("Plan cleared");
      announce("Plan cleared.");
      return true;
    } catch (err) {
      showToast(apiError(err), "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, currentPlan, loadSavedPlans, showToast, announce]);

  // Save current guest draft when user is logged in
  const saveCurrentDraftToAccount = useCallback(async (): Promise<boolean> => {
    if (!user || !currentPlan) return false;

    const attractionIds = currentPlan.items.map((it) => it.attraction_id);
    if (attractionIds.length === 0) return false;

    try {
      setSaving(true);
      const res = await api.post<{ data: VisitPlanDetail }>("/trip", {
        plan_name: currentPlan.plan_name || "My Day Trip",
        visit_date: currentPlan.visit_date,
        attraction_ids: attractionIds,
      });
      setCurrentPlan(res.data.data);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftIds([]);
      loadSavedPlans();
      showToast("Plan saved to your account!", "success");
      return true;
    } catch (err) {
      showToast(apiError(err), "error");
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, currentPlan, loadSavedPlans, showToast]);

  // Select a saved plan to view in planner
  const selectSavedPlan = useCallback(
    async (planId: number): Promise<boolean> => {
      setLoading(true);
      const plan = await fetchPlanDetails(planId);
      setLoading(false);
      if (plan) {
        announce(`Loaded plan: ${plan.plan_name}`);
        return true;
      }
      showToast("Plan not found or could not be loaded.", "error");
      return false;
    },
    [fetchPlanDetails, announce, showToast]
  );

  // Duplicate a saved plan
  const duplicatePlan = useCallback(
    async (planId: number): Promise<boolean> => {
      try {
        setSaving(true);
        const sourceRes = await api.get<{ data: VisitPlanDetail }>(
          `/trip/${planId}`
        );
        const source = sourceRes.data.data;

        const copyName = `${source.plan_name} (Copy)`.slice(0, 100);
        const attractionIds = source.items.map((it) => it.attraction_id);

        const res = await api.post<{ data: VisitPlanDetail }>("/trip", {
          plan_name: copyName,
          visit_date: source.visit_date,
          attraction_ids: attractionIds,
        });

        // Copy notes and arrival times if present
        const itemsWithMeta = source.items.filter(
          (it) => it.start_time || it.notes
        );
        if (itemsWithMeta.length > 0) {
          const itemsPayload = res.data.data.items.map((it) => {
            const original = source.items.find(
              (o) => o.attraction_id === it.attraction_id
            );
            return {
              attraction_id: it.attraction_id,
              start_time: original?.start_time || null,
              notes: original?.notes || null,
            };
          });
          await api.put(`/trip/${res.data.data.id}`, {
            plan_name: copyName,
            visit_date: source.visit_date,
            items: itemsPayload,
          });
        }

        await loadSavedPlans();
        showToast(`Created copy: ${copyName}`);
        return true;
      } catch (err) {
        showToast(apiError(err), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadSavedPlans, showToast]
  );

  // Delete a saved plan
  const deletePlan = useCallback(
    async (planId: number): Promise<boolean> => {
      try {
        setSaving(true);
        await api.delete(`/trip/${planId}`);
        if (currentPlan?.id === planId) {
          setCurrentPlan(null);
        }
        await loadSavedPlans();
        showToast("Plan deleted successfully");
        announce("Plan deleted.");
        return true;
      } catch (err) {
        showToast(apiError(err), "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [currentPlan, loadSavedPlans, showToast, announce]
  );

  return (
    <PlanContext.Provider
      value={{
        currentPlan,
        savedPlans,
        loading,
        saving,
        totalItemsCount,
        planAttractionIds,
        liveAnnouncement,
        isInPlan,
        addToPlan,
        removeFromPlan,
        reorderItems,
        updatePlanMeta,
        updateItemDetails,
        clearPlan,
        saveCurrentDraftToAccount,
        loadSavedPlans,
        selectSavedPlan,
        duplicatePlan,
        deletePlan,
        showToast,
      }}
    >
      {children}

      {/* Screen reader live updates */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Global Toast Container */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              t.type === "error"
                ? "border-[#E5C1B8] bg-[#FDF5F3] text-[#8C2E1F]"
                : t.type === "info"
                ? "border-[#D5CCBA] bg-[#FBF9F4] text-[#1E2421]"
                : "border-[#C9DDD6] bg-[#F2F8F5] text-[#174D44]"
            }`}
          >
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within a PlanProvider");
  return ctx;
}
