import { z } from "zod";
import { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { getBackendFieldErrors } from "./api";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(60, "Name must not exceed 60 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"], {
    message: "Status must be active or inactive",
  }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const placeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Place name is required")
    .max(150, "Place name must not exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description must not exceed 5000 characters"),
  category_ids: z
    .array(z.number())
    .min(1, "At least one category is required"),
  latitude: z
    .number({ message: "Latitude must be a valid number" })
    .min(5.9, "Latitude must be between 5.9 and 9.9 (Sri Lanka)")
    .max(9.9, "Latitude must be between 5.9 and 9.9 (Sri Lanka)"),
  longitude: z
    .number({ message: "Longitude must be a valid number" })
    .min(79.5, "Longitude must be between 79.5 and 82.0 (Sri Lanka)")
    .max(82.0, "Longitude must be between 79.5 and 82.0 (Sri Lanka)"),
  address: z
    .string()
    .max(255, "Address must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  opening_hours: z
    .string()
    .max(255, "Opening hours must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  contact_info: z
    .string()
    .max(255, "Contact info must not exceed 255 characters")
    .optional()
    .or(z.literal("")),
  entrance_fee: z
    .number({ message: "Entrance fee must be a valid number" })
    .min(0, "Entrance fee cannot be negative")
    .nullable()
    .optional(),
  facilities: z
    .string()
    .max(2000, "Facilities must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  activities: z
    .string()
    .max(2000, "Activities must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  travel_tips: z
    .string()
    .max(2000, "Travel tips must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  visitor_guidelines: z
    .string()
    .max(2000, "Visitor guidelines must not exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"], {
    message: "Status must be active or inactive",
  }),
});

export type PlaceFormValues = z.infer<typeof placeSchema>;

/**
 * Maps backend 422 validation errors onto the matching react-hook-form fields.
 */
export function mapBackendErrorsToForm<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>
): boolean {
  const backendErrors = getBackendFieldErrors(err);
  const keys = Object.keys(backendErrors);

  if (keys.length === 0) return false;

  for (const [key, message] of Object.entries(backendErrors)) {
    // Map array notation like "category_ids.0" -> "category_ids"
    const rootField = key.split(".")[0] as Path<T>;
    setError(rootField, {
      type: "server",
      message,
    });
  }

  return true;
}
