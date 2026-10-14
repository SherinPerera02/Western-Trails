"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import CategoryModal, { CategoryItem } from "@/components/admin/CategoryModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

  // Delete dialog state
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get("/admin/categories");
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Failed to load categories.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ? true : cat.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedCat: CategoryItem, isEdit: boolean) => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setNotification({
      type: "success",
      message: isEdit
        ? `Category "${savedCat.name}" updated successfully.`
        : `Category "${savedCat.name}" created successfully.`,
    });
    fetchCategories(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/categories/${categoryToDelete.id}`);
      setNotification({
        type: "success",
        message: `Category "${categoryToDelete.name}" was deleted successfully.`,
      });
      setCategoryToDelete(null);
      fetchCategories(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: apiError(err) || "Could not delete category.",
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
            <Layers className="w-4 h-4 text-[#174D44]" />
            <span>Management</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Categories
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Organize Western Province attractions with category labels and active visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing || loading}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#174D44]" : ""}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#174D44] hover:bg-[#133E37] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
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

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#174D44] focus:bg-white transition-all text-stone-800 placeholder-stone-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 whitespace-nowrap hidden sm:inline">
            Status:
          </span>
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
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === "inactive"
                  ? "bg-white text-stone-700 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table / Card List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#174D44]/30 border-t-[#174D44] rounded-full animate-spin mx-auto" />
            <p className="text-stone-500 text-sm font-medium">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-stone-800">No categories found</h3>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "No categories match the specified search or status filter."
                : "No categories have been created yet. Click 'Add Category' to get started."}
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174D44] text-white text-xs font-semibold hover:bg-[#133E37] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Category</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Category Name
                  </th>
                  <th scope="col" className="px-6 py-3.5 hidden md:table-cell">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-center">
                    Places
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-stone-50/70 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-6 py-4 font-semibold text-stone-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#174D44]/30 group-hover:bg-[#174D44] transition-colors" />
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 hidden md:table-cell text-stone-500 max-w-xs truncate">
                      {cat.description || (
                        <span className="text-stone-300 italic">No description</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {cat.status === "active" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Number of places */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          (cat.attractions_count || 0) > 0
                            ? "bg-amber-100 text-amber-900 border border-amber-200"
                            : "bg-stone-100 text-stone-500"
                        }`}
                        title={
                          (cat.attractions_count || 0) > 0
                            ? `Attached to ${cat.attractions_count} active attractions`
                            : "Not used by any attractions"
                        }
                      >
                        {cat.attractions_count ?? 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#174D44] hover:bg-emerald-50 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          title="Delete Category"
                          className="p-1.5 rounded-lg text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REQ-107 Helpful info */}
      <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
        <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
        <span>
          Note: Categories attached to active attractions cannot be deleted (REQ-107). Reassign or delete places first.
        </span>
      </div>

      {/* Add / Edit Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={selectedCategory}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Delete Category"
        itemName={categoryToDelete?.name || ""}
        message={
          categoryToDelete && (categoryToDelete.attractions_count || 0) > 0
            ? `Warning: This category is currently associated with ${categoryToDelete.attractions_count} place(s). The system will reject deletion if any non-deleted attraction still references it.`
            : "This action cannot be undone. Are you sure you want to remove this category from the system?"
        }
        confirmLabel="Delete Category"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
