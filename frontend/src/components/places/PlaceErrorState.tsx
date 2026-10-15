import { AlertCircle, RefreshCw } from "lucide-react";

interface PlaceErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export default function PlaceErrorState({
  message = "Unable to connect to the Western Trails service. Please check your network connection and try again.",
  onRetry,
  isRetrying = false,
}: PlaceErrorStateProps) {
  return (
    <div className="rounded-2xl border border-[#E8D0CC] bg-[#FDF8F7] p-10 text-center shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6E2DF] text-[#8C2E1F] mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="font-serif text-lg font-bold text-[#1E2421]">
        Unable to load places
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-[#5C645F] leading-relaxed">
        {message}
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-xl bg-[#174D44] px-5 py-2.5 text-sm font-semibold text-[#FBF9F4] shadow-xs transition-all hover:bg-[#103630] disabled:opacity-60 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D44]"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
          <span>{isRetrying ? "Retrying…" : "Retry"}</span>
        </button>
      </div>
    </div>
  );
}
