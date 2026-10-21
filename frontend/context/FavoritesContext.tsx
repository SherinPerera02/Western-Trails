"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/context/PlanContext";
import Link from "next/link";
import { Heart, LogIn, X } from "lucide-react";

interface FavoritesContextType {
  favoriteIds: Set<number>;
  favoritesCount: number;
  loading: boolean;
  isFavorite: (placeId: number) => boolean;
  toggleFavorite: (placeId: number, placeName?: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = usePlan();

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlaceName, setPendingPlaceName] = useState("");

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const res = await api.get<{ data: number[]; ids: number[] }>("/favorites/ids");
      const ids = res.data?.ids || res.data?.data || [];
      setFavoriteIds(new Set(ids));
    } catch (err) {
      console.error("Failed to load favorite IDs:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refreshFavorites();
  }, [user, authLoading, refreshFavorites]);

  const isFavorite = useCallback(
    (placeId: number) => favoriteIds.has(placeId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (placeId: number, placeName?: string): Promise<boolean> => {
      const displayName = placeName || "Place";

      if (!user) {
        setPendingPlaceName(displayName);
        setShowLoginModal(true);
        return false;
      }

      const currentlyFavorited = favoriteIds.has(placeId);
      const nextIds = new Set(favoriteIds);

      // Optimistic update
      if (currentlyFavorited) {
        nextIds.delete(placeId);
      } else {
        nextIds.add(placeId);
      }
      setFavoriteIds(nextIds);

      try {
        if (currentlyFavorited) {
          await api.delete(`/favorites/${placeId}`);
          showToast(`Removed ${displayName} from favorites`);
        } else {
          await api.post(`/favorites/${placeId}`);
          showToast(`Saved ${displayName} to favorites`);
        }
        return true;
      } catch (err) {
        // Rollback
        setFavoriteIds(favoriteIds);
        showToast(apiError(err), "error");
        return false;
      }
    },
    [user, favoriteIds, showToast]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoritesCount: favoriteIds.size,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}

      {/* Guest Login Required Modal */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="favorite-auth-title"
        >
          <div className="relative w-full max-w-md rounded-2xl border border-[#EAE4D7] bg-[#FBF9F4] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#5C645F] hover:bg-[#F4F0E8] hover:text-[#1E2421]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF5F3] text-[#8C2E1F] mb-4">
              <Heart className="h-6 w-6 fill-current" />
            </div>

            <h3
              id="favorite-auth-title"
              className="font-serif text-xl font-bold text-[#1E2421]"
            >
              Log in to save places
            </h3>

            <p className="mt-2 text-sm text-[#5C645F] leading-relaxed">
              Sign in to your Western Trails account to bookmark{" "}
              {pendingPlaceName ? `"${pendingPlaceName}"` : "places"} and sync
              your saved favorites across your devices.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/login"
                onClick={() => setShowLoginModal(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#174D44] py-2.5 text-xs font-semibold text-[#FBF9F4] hover:bg-[#103630] transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setShowLoginModal(false)}
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-[#D5CCBA] bg-white py-2.5 text-xs font-semibold text-[#1E2421] hover:bg-[#F4F0E8] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return ctx;
}
