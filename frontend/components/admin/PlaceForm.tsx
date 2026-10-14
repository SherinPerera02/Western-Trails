"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  MapPin,
  ArrowLeft,
  Save,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Compass,
  DollarSign,
  Clock,
  Phone,
  FileText,
  Tag,
  Eye,
  X,
  Plus,
} from "lucide-react";
import api, { apiError } from "@/lib/api";
import {
  placeSchema,
  PlaceFormValues,
  mapBackendErrorsToForm,
} from "@/lib/schemas";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface CategoryOption {
  id: number;
  name: string;
  status: "active" | "inactive";
}

export interface ExistingImage {
  id: number;
  url: string;
  caption: string | null;
}

interface NewImageFile {
  file: File;
  previewUrl: string;
  caption: string;
}

interface PlaceFormProps {
  mode: "create" | "edit";
  placeId?: string | number;
}

export default function PlaceForm({ mode, placeId }: PlaceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(mode === "edit");
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Existing images (for edit mode)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [imageToDelete, setImageToDelete] = useState<ExistingImage | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // New images to upload
  const [newImages, setNewImages] = useState<NewImageFile[]>([]);

  // Server distance & warning states
  const [serverDistance, setServerDistance] = useState<number | null>(null);
  const [serverWarning, setServerWarning] = useState<string | null>(null);

  // Form banners
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: "",
      description: "",
      category_ids: [],
      latitude: 6.7132, // Default near Panadura center
      longitude: 79.9074,
      address: "",
      opening_hours: "",
      contact_info: "",
      entrance_fee: null,
      facilities: "",
      activities: "",
      travel_tips: "",
      visitor_guidelines: "",
      status: "active",
    },
  });

  const selectedCategoryIds = watch("category_ids") || [];

  // Fetch categories on mount
  useEffect(() => {
    let mounted = true;
    async function loadCategories() {
      try {
        const res = await api.get("/admin/categories");
        if (mounted && res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (mounted) setCategoriesLoading(false);
      }
    }
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch place data if in edit mode
  useEffect(() => {
    if (mode !== "edit" || !placeId) return;

    let mounted = true;
    async function loadPlace() {
      try {
        setLoadingInitial(true);
        const res = await api.get(`/admin/places/${placeId}`);
        const data = res.data?.data;
        if (!data || !mounted) return;

        // Populate fields
        reset({
          name: data.name || "",
          description: data.description || "",
          category_ids: Array.isArray(data.categories)
            ? data.categories.map((c: { id: number }) => c.id)
            : [],
          latitude: typeof data.latitude === "number" ? data.latitude : 6.7132,
          longitude: typeof data.longitude === "number" ? data.longitude : 79.9074,
          address: data.address || "",
          opening_hours: data.opening_hours || "",
          contact_info: data.contact_info || "",
          entrance_fee:
            typeof data.entrance_fee === "number" ? data.entrance_fee : null,
          facilities: data.facilities || "",
          activities: data.activities || "",
          travel_tips: data.travel_tips || "",
          visitor_guidelines: data.visitor_guidelines || "",
          status: data.status || "active",
        });

        // Set distance and warning
        if (typeof data.distance_km === "number") {
          setServerDistance(data.distance_km);
        }
        if (data.warning) {
          setServerWarning(data.warning);
        } else if (data.distance_km && data.distance_km > 25) {
          setServerWarning(
            `Attraction is located ${data.distance_km} km from Panadura, which exceeds the recommended 25 km radius guideline.`
          );
        }

        // Set images
        if (Array.isArray(data.images)) {
          setExistingImages(data.images);
        }
      } catch (err) {
        if (mounted) {
          setGeneralError(apiError(err) || "Failed to load place details.");
        }
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    }

    loadPlace();
    return () => {
      mounted = false;
    };
  }, [mode, placeId, reset]);

  // Clean up object URLs when unmounting or removing new images
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [newImages]);

  // Category selection toggle
  const toggleCategory = (catId: number) => {
    const current = [...selectedCategoryIds];
    const index = current.indexOf(catId);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(catId);
    }
    setValue("category_ids", current, { shouldValidate: true });
  };

  // Preset coordinate button helper
  const setPanaduraCoords = () => {
    setValue("latitude", 6.7132, { shouldValidate: true });
    setValue("longitude", 79.9074, { shouldValidate: true });
  };

  // Handle selecting new image files
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const totalAllowed = 8 - existingImages.length - newImages.length;
    if (totalAllowed <= 0) {
      alert("A place can have a maximum of 8 images.");
      return;
    }

    const added: NewImageFile[] = [];
    const filesArray = Array.from(files).slice(0, totalAllowed);

    for (const file of filesArray) {
      if (file.size > 2 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 2 MB size limit.`);
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      added.push({
        file,
        previewUrl,
        caption: "",
      });
    }

    setNewImages((prev) => [...prev, ...added]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1);
      if (removed[0]) URL.revokeObjectURL(removed[0].previewUrl);
      return copy;
    });
  };

  const updateNewImageCaption = (index: number, caption: string) => {
    setNewImages((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], caption };
      }
      return copy;
    });
  };

  // Delete existing image handler
  const handleDeleteExistingImage = async () => {
    if (!imageToDelete || !placeId) return;
    setIsDeletingImage(true);

    try {
      await api.delete(`/admin/places/${placeId}/images/${imageToDelete.id}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageToDelete.id));
      setSuccessMessage("Image deleted successfully.");
      setImageToDelete(null);
    } catch (err) {
      setGeneralError(apiError(err) || "Failed to delete image.");
    } finally {
      setIsDeletingImage(false);
    }
  };

  // Main Submit handler
  const onSubmit = async (values: PlaceFormValues) => {
    setGeneralError(null);
    setSuccessMessage(null);

    // Format payload
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      category_ids: values.category_ids,
      latitude: values.latitude,
      longitude: values.longitude,
      address: values.address?.trim() || null,
      opening_hours: values.opening_hours?.trim() || null,
      contact_info: values.contact_info?.trim() || null,
      entrance_fee:
        typeof values.entrance_fee === "number" ? values.entrance_fee : null,
      facilities: values.facilities?.trim() || null,
      activities: values.activities?.trim() || null,
      travel_tips: values.travel_tips?.trim() || null,
      visitor_guidelines: values.visitor_guidelines?.trim() || null,
      status: values.status,
    };

    try {
      let savedPlaceId = placeId;
      let calculatedDist: number | null = null;
      let returnedWarning: string | null = null;

      if (mode === "create") {
        const res = await api.post("/places", payload);
        const data = res.data?.data;
        savedPlaceId = data?.id;
        calculatedDist = data?.distance_km ?? null;
        returnedWarning = res.data?.warning || data?.warning || null;
      } else {
        const res = await api.put(`/places/${placeId}`, payload);
        const data = res.data?.data;
        calculatedDist = data?.distance_km ?? null;
        returnedWarning = res.data?.warning || data?.warning || null;
      }

      // Upload new images if any are selected
      if (newImages.length > 0 && savedPlaceId) {
        const formData = new FormData();
        newImages.forEach((img) => {
          formData.append("images[]", img.file);
          formData.append("captions[]", img.caption.trim());
        });

        try {
          const imgRes = await api.post(
            `/admin/places/${savedPlaceId}/images`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          if (imgRes.data?.data && Array.isArray(imgRes.data.data)) {
            setExistingImages((prev) => [...prev, ...imgRes.data.data]);
          }
          // Clear newly selected files
          newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
          setNewImages([]);
        } catch (imgErr) {
          console.error("Image upload warning:", imgErr);
          setGeneralError(
            `Place was saved, but image upload encountered an issue: ${apiError(imgErr)}`
          );
        }
      }

      // Update distance and warning state
      if (calculatedDist !== null) {
        setServerDistance(calculatedDist);
        if (returnedWarning) {
          setServerWarning(returnedWarning);
        } else if (calculatedDist > 25) {
          setServerWarning(
            `Attraction is located ${calculatedDist} km from Panadura, which exceeds the recommended 25 km radius guideline.`
          );
        } else {
          setServerWarning(null);
        }
      }

      const successTxt =
        mode === "create"
          ? `Place "${payload.name}" was created successfully!`
          : `Place "${payload.name}" was updated successfully!`;
      setSuccessMessage(successTxt);

      // If created, redirect to edit or places listing after brief notification
      if (mode === "create" && savedPlaceId) {
        setTimeout(() => {
          router.push(`/admin/places/${savedPlaceId}/edit`);
        }, 1200);
      }
    } catch (err) {
      const hasFieldErrors = mapBackendErrorsToForm(err, setError);
      if (!hasFieldErrors) {
        setGeneralError(apiError(err) || "Failed to save place.");
      }
    }
  };

  if (loadingInitial) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#174D44]/30 border-t-[#174D44] rounded-full animate-spin mx-auto" />
        <p className="text-stone-500 text-sm font-medium">Loading place details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Link
            href="/admin/places"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-[#174D44] text-xs font-semibold uppercase tracking-wider mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Places</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            {mode === "create" ? "Add New Place" : "Edit Attraction"}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            {mode === "create"
              ? "Register a new tourist attraction in the Western Province network."
              : `Modify attraction coordinates, category tags, images, and visitor details.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/places"
            className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174D44] hover:bg-[#133E37] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === "create" ? "Create Place" : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {generalError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Could not save place</p>
            <p className="text-xs sm:text-sm mt-0.5 text-rose-800">{generalError}</p>
          </div>
          <button
            type="button"
            onClick={() => setGeneralError(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="font-medium flex-1">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-stone-400 hover:text-stone-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* Server Distance & 25km Warning Display */}
      {serverDistance !== null && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#174D44] border border-teal-100 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Server-Calculated Distance
                </span>
                <p className="text-lg font-bold text-stone-900">
                  {serverDistance.toFixed(2)} km{" "}
                  <span className="text-xs font-normal text-stone-500">
                    from Panadura Clock Tower (Base)
                  </span>
                </p>
              </div>
            </div>

            <div className="text-xs text-stone-500 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200 max-w-sm">
              Distance is automatically computed via Haversine geodesic math on the backend; client input is ignored to maintain data integrity.
            </div>
          </div>

          {/* Prominent warning if exceeds 25 km */}
          {serverWarning && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm sm:text-base text-amber-900">
                  Outside Recommended Tourism Boundary (&gt; 25 km)
                </p>
                <p className="text-xs sm:text-sm text-amber-800/90 mt-0.5 leading-relaxed">
                  {serverWarning}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Form Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Core Details & Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              General Information
            </h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Place Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                maxLength={150}
                placeholder="e.g. Panadura Beach, Richmond Castle"
                {...register("name")}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 transition-all ${
                  errors.name
                    ? "border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-400"
                    : "border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44]"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                maxLength={5000}
                placeholder="Detailed narrative, cultural history, landscape features, and visitor appeal..."
                {...register("description")}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 transition-all resize-y ${
                  errors.description
                    ? "border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-400"
                    : "border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44]"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-xs text-rose-600 font-medium">{errors.description.message}</p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] text-stone-400">Up to 5,000 characters</span>
              </div>
            </div>

            {/* Category Multi-select (BR-003) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Categories <span className="text-rose-500">*</span>{" "}
                  <span className="font-normal text-stone-500 lowercase">(select at least one)</span>
                </label>
                <span className="text-xs text-stone-500 font-medium">
                  {selectedCategoryIds.length} selected
                </span>
              </div>

              {categoriesLoading ? (
                <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  No categories found. Please create at least one active category in{" "}
                  <Link href="/admin/categories" className="underline font-semibold text-[#174D44]">
                    Categories Management
                  </Link>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  {categories.map((cat) => {
                    const isChecked = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left ${
                          isChecked
                            ? "bg-[#174D44] text-white border-[#174D44] shadow-xs"
                            : "bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-100"
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border text-[10px] ${
                            isChecked
                              ? "bg-white text-[#174D44] border-white"
                              : "border-stone-400 bg-transparent"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.category_ids && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium">
                  {errors.category_ids.message}
                </p>
              )}
            </div>
          </div>

          {/* Card: Location & Coordinates */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#174D44]" />
                <span>Geographic Location</span>
              </h2>
              <button
                type="button"
                onClick={setPanaduraCoords}
                className="text-xs text-[#174D44] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>Use Panadura Base (6.7132, 79.9074)</span>
              </button>
            </div>

            {/* Latitude & Longitude Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Latitude */}
              <div>
                <label htmlFor="latitude" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Latitude <span className="text-rose-500">*</span>{" "}
                  <span className="text-stone-400 font-normal lowercase">(5.9 to 9.9)</span>
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="6.7132"
                  {...register("latitude", { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 transition-all ${
                    errors.latitude
                      ? "border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-400"
                      : "border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44]"
                  }`}
                />
                {errors.latitude && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {errors.latitude.message}
                  </p>
                )}
              </div>

              {/* Longitude */}
              <div>
                <label htmlFor="longitude" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Longitude <span className="text-rose-500">*</span>{" "}
                  <span className="text-stone-400 font-normal lowercase">(79.5 to 82.0)</span>
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="79.9074"
                  {...register("longitude", { valueAsNumber: true })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-stone-900 transition-all ${
                    errors.longitude
                      ? "border-rose-400 bg-rose-50/50 focus:ring-2 focus:ring-rose-400"
                      : "border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44]"
                  }`}
                />
                {errors.longitude && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    {errors.longitude.message}
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Address / Street Location
              </label>
              <input
                id="address"
                type="text"
                maxLength={255}
                placeholder="e.g. Galle Road, Panadura, Western Province"
                {...register("address")}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all"
              />
              {errors.address && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Card: Detailed Visitor Guidelines & Content */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#174D44]" />
              <span>Visitor Information & Experience</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Facilities */}
              <div>
                <label htmlFor="facilities" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Facilities Available
                </label>
                <textarea
                  id="facilities"
                  rows={3}
                  maxLength={2000}
                  placeholder="Parking, restrooms, wheelchair access, cafeteria..."
                  {...register("facilities")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all resize-y"
                />
                {errors.facilities && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.facilities.message}</p>
                )}
              </div>

              {/* Activities */}
              <div>
                <label htmlFor="activities" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Activities & Highlights
                </label>
                <textarea
                  id="activities"
                  rows={3}
                  maxLength={2000}
                  placeholder="Sunset photography, swimming, boat rides, guided heritage walk..."
                  {...register("activities")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all resize-y"
                />
                {errors.activities && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.activities.message}</p>
                )}
              </div>

              {/* Travel Tips */}
              <div>
                <label htmlFor="travel_tips" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Travel Tips
                </label>
                <textarea
                  id="travel_tips"
                  rows={3}
                  maxLength={2000}
                  placeholder="Best visited during morning hours; carry sun protection and water..."
                  {...register("travel_tips")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all resize-y"
                />
                {errors.travel_tips && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.travel_tips.message}</p>
                )}
              </div>

              {/* Visitor Guidelines */}
              <div>
                <label htmlFor="visitor_guidelines" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Visitor Guidelines
                </label>
                <textarea
                  id="visitor_guidelines"
                  rows={3}
                  maxLength={2000}
                  placeholder="Modest clothing recommended for temple grounds; no littering..."
                  {...register("visitor_guidelines")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all resize-y"
                />
                {errors.visitor_guidelines && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.visitor_guidelines.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Logistics, Status, & Image Gallery */}
        <div className="space-y-6">
          {/* Card: Status & Operational Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <h2 className="font-serif text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Operations & Visibility
            </h2>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                Visibility Status <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    watch("status") === "active"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="active"
                    {...register("status")}
                    className="sr-only"
                  />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </label>
                <label
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    watch("status") === "inactive"
                      ? "bg-stone-100 text-stone-800 border-stone-300 ring-2 ring-stone-400/20"
                      : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="inactive"
                    {...register("status")}
                    className="sr-only"
                  />
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  <span>Inactive</span>
                </label>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <label htmlFor="opening_hours" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>Opening Hours</span>
              </label>
              <input
                id="opening_hours"
                type="text"
                maxLength={255}
                placeholder="e.g. 06:00 - 18:30 Daily"
                {...register("opening_hours")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all"
              />
              {errors.opening_hours && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.opening_hours.message}</p>
              )}
            </div>

            {/* Entrance Fee */}
            <div>
              <label htmlFor="entrance_fee" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                <span>Entrance Fee (LKR)</span>
              </label>
              <input
                id="entrance_fee"
                type="number"
                step="any"
                min="0"
                placeholder="0 or leave empty for free"
                {...register("entrance_fee", {
                  setValueAs: (v) =>
                    v === "" || v === null || v === undefined || Number.isNaN(Number(v))
                      ? null
                      : Number(v),
                })}
                className={`w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all`}
              />
              <span className="text-[11px] text-stone-400 mt-0.5 block">
                Leave empty or enter 0 if admission is free.
              </span>
              {errors.entrance_fee && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.entrance_fee.message}</p>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="contact_info" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Contact Info</span>
              </label>
              <input
                id="contact_info"
                type="text"
                maxLength={255}
                placeholder="+94 38 223 4567 or info@domain.lk"
                {...register("contact_info")}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:ring-2 focus:ring-[#174D44] text-sm text-stone-900 transition-all"
              />
              {errors.contact_info && (
                <p className="text-xs text-rose-600 mt-1 font-medium">{errors.contact_info.message}</p>
              )}
            </div>
          </div>

          {/* Card: Image Gallery & Uploader */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900">Place Images</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {existingImages.length + newImages.length} / 8 max
              </span>
            </div>

            {/* Existing Images Gallery (in Edit Mode) */}
            {existingImages.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2">
                  Existing Uploaded Images
                </span>
                <div className="space-y-2.5">
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-white transition-all group"
                    >
                      <img
                        src={img.url}
                        alt={img.caption || "Place photo"}
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-800 font-medium truncate">
                          {img.caption || <span className="text-stone-400 italic">No caption</span>}
                        </p>
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          ID: #{img.id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageToDelete(img)}
                        title="Delete image"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newly selected images to upload */}
            {newImages.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2">
                  New Images Ready to Upload
                </span>
                <div className="space-y-3">
                  {newImages.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.previewUrl}
                            alt="Upload preview"
                            className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                          />
                          <p className="text-xs font-medium text-stone-800 truncate">
                            {item.file.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Add caption (optional)..."
                        value={item.caption}
                        onChange={(e) => updateNewImageCaption(idx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-xs text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#174D44]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Selector Box */}
            {existingImages.length + newImages.length < 8 ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFilesSelected}
                  className="sr-only"
                  id="place-images-upload"
                />
                <label
                  htmlFor="place-images-upload"
                  className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-stone-300 hover:border-[#174D44] bg-stone-50/50 hover:bg-stone-50 transition-colors cursor-pointer text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-stone-500 group-hover:text-[#174D44] mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 group-hover:text-[#174D44]">
                    Choose or Drag Images
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5">
                    JPG, PNG, WebP &bull; Max 2 MB each
                  </span>
                </label>
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-2 italic">
                Maximum 8 images reached for this place.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Image Deletion */}
      <ConfirmDialog
        isOpen={Boolean(imageToDelete)}
        title="Delete Image"
        itemName={imageToDelete?.caption ? `"${imageToDelete.caption}"` : `Image #${imageToDelete?.id}`}
        message="Are you sure you want to delete this attraction image? It will be removed from storage permanently."
        confirmLabel="Delete Image"
        isDestructive={true}
        isLoading={isDeletingImage}
        onConfirm={handleDeleteExistingImage}
        onCancel={() => setImageToDelete(null)}
      />
    </form>
  );
}
