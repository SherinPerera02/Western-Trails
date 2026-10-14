"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Search,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Compass,
  Layers,
  HelpCircle,
  Archive,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export interface PlaceCategory {
  id: number;
  name: string;
}

export interface PlaceListItem {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  distance_km: number | null;
  warning?: string;
  categories: PlaceCategory[];
  deleted_at?: string | null;
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<PlaceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter mode: "active_all" (non-deleted places) vs "trashed" (soft-deleted places)
  const [viewMode, setViewMode] = useState<"all" | "trashed">("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Delete dialog state (naming the place REQ-097, REQ-098)
  const [placeToDelete, setPlaceToDelete] = useState<PlaceListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore state
  const [isRestoringId, setIsRestoringId] = useState<number | null>(null);

  const fetchPlaces = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const url =
        viewMode === "trashed"
          ? "/admin/places?trashed=only"
          : "/admin/places";

      const res = await api.get(url);
      if (res.data?.data) {
        setPlaces(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to load places.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [viewMode]);

  // Filtered places by name search
  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places;
    const q = searchQuery.toLowerCase();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categories?.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [places, searchQuery]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!placeToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/places/${placeToDelete.id}`);
      setNotification({
        type: "success",
        message: `Place "${placeToDelete.name}" was deleted successfully.`,
      });
      setPlaceToDelete(null);
      fetchPlaces(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Could not delete place.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle restore action
  const handleRestore = async (place: PlaceListItem) => {
    setIsRestoringId(place.id);

    try {
      await api.post(`/admin/places/${place.id}/restore`);
      setNotification({
        type: "success",
        message: `Place "${place.name}" was restored successfully.`,
      });
      fetchPlaces(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Could not restore place.",
      });
    } finally {
      setIsRestoringId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4 text-[#174D44]" />
            <span>Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Places & Attractions
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Administer destinations, categories, distances from Panadura, and image media.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPlaces(true)}
            disabled={refreshing || loading}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#174D44]" : ""}`} />
          </button>
          <Link
            href="/admin/places/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#174D44] hover:bg-[#133E37] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Place</span>
          </Link>
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

      {/* Filters Bar: Search + Trashed Toggle */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search places by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#174D44] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
          />
        </div>

        {/* View Mode Toggle: All Places vs Deleted Places */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 whitespace-nowrap hidden sm:inline">
            Filter View:
          </span>
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "all"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Active Places
            </button>
            <button
              onClick={() => setViewMode("trashed")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === "trashed"
                  ? "bg-rose-50 text-rose-700 shadow-xs border border-rose-200"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Deleted / Trashed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#174D44]/30 border-t-[#174D44] rounded-full animate-spin mx-auto" />
            <p className="text-stone-500 text-sm font-medium">Loading places...</p>
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-800">
              {viewMode === "trashed" ? "No deleted places found" : "No places found"}
            </h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              {searchQuery
                ? "No places match the specified search term."
                : viewMode === "trashed"
                ? "No places are currently in the trash bin."
                : "No places have been registered yet. Click 'Add Place' to create one."}
            </p>
            {!searchQuery && viewMode === "all" && (
              <Link
                href="/admin/places/new"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174D44] text-white text-xs font-semibold hover:bg-[#133E37] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Place</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Place Name
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Categories
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Distance (Panadura Base)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPlaces.map((place) => {
                  const dist = place.distance_km;
                  const exceeds25 = dist !== null && dist !== undefined && dist > 25;

                  return (
                    <tr
                      key={place.id}
                      className="hover:bg-stone-50/70 transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-semibold text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#174D44]/30 group-hover:bg-[#174D44] transition-colors" />
                          <span>{place.name}</span>
                        </div>
                      </td>

                      {/* Categories */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {place.categories && place.categories.length > 0 ? (
                            place.categories.map((c) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-300 italic text-xs">None</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {place.status === "active" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Distance */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {dist !== null && dist !== undefined ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold ${
                                exceeds25 ? "text-amber-700 font-bold" : "text-stone-700"
                              }`}
                            >
                              {dist.toFixed(2)} km
                            </span>
                            {exceeds25 && (
                              <span
                                title="Warning: Exceeds 25 km tourism radius guideline"
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>&gt; 25 km</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs">--</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {viewMode === "trashed" ? (
                          <button
                            onClick={() => handleRestore(place)}
                            disabled={isRestoringId === place.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRestoringId === place.id ? "animate-spin" : ""}`} />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={`/admin/places/${place.id}/edit`}
                              title="Edit Place"
                              className="p-1.5 rounded-lg text-stone-600 hover:text-[#174D44] hover:bg-emerald-50 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setPlaceToDelete(place)}
                              title="Delete Place"
                              className="p-1.5 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Distance Notice */}
      <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
        <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
        <span>
          Distances are calculated from Panadura base coordinates (6.7132, 79.9074). Places with &gt; 25 km exceed the recommended regional boundary guideline.
        </span>
      </div>

      {/* Delete Confirmation Dialog (REQ-097, REQ-098) */}
      <ConfirmDialog
        isOpen={Boolean(placeToDelete)}
        title="Delete Place"
        itemName={placeToDelete?.name || ""}
        message="Are you sure you want to delete this place? It will be soft-deleted and can be restored at any time from the Deleted / Trashed filter."
        confirmLabel="Delete Place"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPlaceToDelete(null)}
      />
    </div>
  );
}
