"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Layers, AlertCircle, Trash2 } from "lucide-react";
import api, { apiError } from "@/lib/api";
import {
  categorySchema,
  CategoryFormValues,
  mapBackendErrorsToForm,
} from "@/lib/schemas";

export interface CategoryItem {
  id: number;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  attractions_count?: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  category: CategoryItem | null; // null = Add mode, object = Edit mode
  onClose: () => void;
  onSuccess: (cat: CategoryItem, isEdit: boolean) => void;
  onDelete?: (cat: CategoryItem) => void;
}

export default function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
  onDelete,
}: CategoryModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        status: category.status,
      });
    } else {
      reset({
        name: "",
        description: "",
        status: "active",
      });
    }
    setServerError(null);
  }, [category, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: CategoryFormValues) => {
    setServerError(null);
    try {
      if (isEdit && category) {
        const res = await api.put(`/categories/${category.id}`, values);
        onSuccess(res.data.data, true);
      } else {
        const res = await api.post("/categories", values);
        onSuccess(res.data.data, false);
      }
      onClose();
    } catch (err: unknown) {
      const hasFieldErrors = mapBackendErrorsToForm(err, setError);
      if (!hasFieldErrors) {
        setServerError(apiError(err));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#174D44]/10 text-[#174D44] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              {isEdit ? "Edit Category" : "Add New Category"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            {serverError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Coastal Escapes, Ancient Temples"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-white focus:outline-hidden transition-all ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-stone-300 focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/20"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                {...register("description")}
                placeholder="Brief description of destinations in this category (up to 500 characters)..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm border bg-white focus:outline-hidden transition-all ${
                  errors.description
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-stone-300 focus:border-[#174D44] focus:ring-2 focus:ring-[#174D44]/20"
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors has-checked:border-[#174D44] has-checked:bg-emerald-50/50">
                  <input
                    type="radio"
                    value="active"
                    {...register("status")}
                    className="text-[#174D44] focus:ring-[#174D44]"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Active
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Visible to the public
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors has-checked:border-[#174D44] has-checked:bg-stone-100">
                  <input
                    type="radio"
                    value="inactive"
                    {...register("status")}
                    className="text-[#174D44] focus:ring-[#174D44]"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Inactive
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Hidden from public view
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <div>
              {isEdit && category && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(category);
                  }}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Category</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-[#174D44] hover:bg-[#123E37] rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Saving...
                </>
              ) : isEdit ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
