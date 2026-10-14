"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  itemName,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isDestructive
                  ? "bg-rose-100 text-rose-600 border border-rose-200"
                  : "bg-amber-100 text-amber-600 border border-amber-200"
              }`}
            >
              {isDestructive ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              {title}
            </h3>

            <div className="mt-2 text-sm text-stone-600">
              {message || (
                <span>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-stone-900">
                    &ldquo;{itemName}&rdquo;
                  </span>
                  ? This action will remove the record.
                </span>
              )}
            </div>

            {/* Entity Highlight Badge (REQ-097, REQ-098) */}
            <div className="mt-3.5 p-3 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                Target:
              </span>
              <span className="text-sm font-bold text-stone-800 truncate">
                {itemName}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 focus:outline-hidden transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-hidden transition-all shadow-sm flex items-center gap-2 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400"
                : "bg-[#174D44] hover:bg-[#123E37] disabled:bg-stone-400"
            }`}
          >
            {isLoading ? (
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
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
