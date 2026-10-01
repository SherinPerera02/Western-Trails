import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("wt_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turns any API error into one readable message (REQ-025)
export function apiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.errors) {
      const firstErrorList = Object.values<string[]>(data.errors)[0];
      if (Array.isArray(firstErrorList) && firstErrorList.length > 0) {
        return firstErrorList[0];
      }
    }
    if (data?.message) return data.message;
    if (!err.response) return "Cannot reach the server. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

// Extracts field-specific errors returned by the backend (Laravel 422 validation)
export function getBackendFieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err)) {
    const errors = err.response?.data?.errors;
    if (errors && typeof errors === "object") {
      const result: Record<string, string> = {};
      for (const [key, messages] of Object.entries(errors)) {
        if (Array.isArray(messages) && messages.length > 0 && typeof messages[0] === "string") {
          result[key] = messages[0];
        }
      }
      return result;
    }
  }
  return {};
}

export default api;
