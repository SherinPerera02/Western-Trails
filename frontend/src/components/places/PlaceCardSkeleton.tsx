export default function PlaceCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D5] bg-white animate-pulse"
      aria-hidden="true"
    >
      {/* Photo skeleton */}
      <div className="h-56 w-full bg-[#E8E2D5]" />

      {/* Body skeleton */}
      <div className="flex flex-1 flex-col p-5 space-y-4">
        {/* Title */}
        <div className="h-6 w-3/4 rounded-md bg-[#E8E2D5]" />

        {/* Description line 1 & 2 */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md bg-[#F0EBE0]" />
          <div className="h-4 w-2/3 rounded-md bg-[#F0EBE0]" />
        </div>

        {/* Meta rows */}
        <div className="border-t border-[#EAE4D7] pt-3 space-y-2">
          <div className="h-4 w-1/2 rounded-md bg-[#F0EBE0]" />
          <div className="h-4 w-1/3 rounded-md bg-[#F0EBE0]" />
        </div>

        {/* Action buttons */}
        <div className="mt-4 border-t border-[#EAE4D7] pt-3 flex justify-between">
          <div className="h-8 w-24 rounded-lg bg-[#E8E2D5]" />
          <div className="h-8 w-28 rounded-lg bg-[#E8E2D5]" />
        </div>
      </div>
    </div>
  );
}
