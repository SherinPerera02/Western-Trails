"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePlan } from "@/context/PlanContext";

export interface ComparePlaceItem {
  id: number;
  name: string;
}

interface CompareContextType {
  selectedPlaces: ComparePlaceItem[];
  compareCount: number;
  isComparing: (placeId: number) => boolean;
  toggleCompare: (place: ComparePlaceItem) => boolean;
  removeCompare: (placeId: number) => void;
  clearCompare: () => void;
  setSelectedPlaces: (places: ComparePlaceItem[]) => void;
}

const STORAGE_KEY = "wt_compare_places";
const MAX_COMPARE = 3;

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const { showToast } = usePlan();
  const [selectedPlaces, setSelectedPlaces] = useState<ComparePlaceItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedPlaces(parsed.slice(0, MAX_COMPARE));
        }
      }
    } catch {
      // Ignore JSON error
    }
  }, []);

  const saveToStorage = useCallback((places: ComparePlaceItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
    } catch {}
  }, []);

  const isComparing = useCallback(
    (placeId: number) => selectedPlaces.some((p) => p.id === placeId),
    [selectedPlaces]
  );

  const toggleCompare = useCallback(
    (place: ComparePlaceItem): boolean => {
      const exists = selectedPlaces.some((p) => p.id === place.id);

      if (exists) {
        const next = selectedPlaces.filter((p) => p.id !== place.id);
        setSelectedPlaces(next);
        saveToStorage(next);
        showToast(`Removed ${place.name} from comparison`);
        return false;
      }

      if (selectedPlaces.length >= MAX_COMPARE) {
        showToast("You can compare up to 3 places at once.", "info");
        return false;
      }

      const next = [...selectedPlaces, place];
      setSelectedPlaces(next);
      saveToStorage(next);
      showToast(`Added ${place.name} to comparison`);
      return true;
    },
    [selectedPlaces, saveToStorage, showToast]
  );

  const removeCompare = useCallback(
    (placeId: number) => {
      const next = selectedPlaces.filter((p) => p.id !== placeId);
      setSelectedPlaces(next);
      saveToStorage(next);
    },
    [selectedPlaces, saveToStorage]
  );

  const clearCompare = useCallback(() => {
    setSelectedPlaces([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    showToast("Comparison cleared");
  }, [showToast]);

  return (
    <CompareContext.Provider
      value={{
        selectedPlaces,
        compareCount: selectedPlaces.length,
        isComparing,
        toggleCompare,
        removeCompare,
        clearCompare,
        setSelectedPlaces,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return ctx;
}
