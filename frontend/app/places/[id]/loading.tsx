export default function PlaceDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1E2421]">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#E8E2D5] bg-[#F7F4EB]/70 py-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl flex items-center gap-2">
          <div className="h-4 w-20 bg-[#E8E2D5] rounded animate-pulse" />
          <span className="text-[#C5BEAF]">/</span>
          <div className="h-4 w-32 bg-[#E8E2D5] rounded animate-pulse" />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 space-y-10">
        {/* Gallery Skeleton */}
        <div className="w-full space-y-3">
          <div className="h-[300px] sm:h-[420px] md:h-[480px] w-full rounded-2xl bg-[#EAE4D7] animate-pulse" />
          <div className="flex gap-2.5 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-24 sm:h-20 sm:w-28 rounded-xl bg-[#E8E2D5] shrink-0 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="space-y-4 border-b border-[#E8E2D5] pb-8">
          <div className="flex gap-2">
            <div className="h-6 w-24 rounded-full bg-[#EAE4D7] animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-[#EAE4D7] animate-pulse" />
          </div>
          <div className="h-10 sm:h-14 w-3/4 max-w-xl rounded-xl bg-[#E8E2D5] animate-pulse" />
          <div className="flex gap-4">
            <div className="h-5 w-44 rounded bg-[#EAE4D7] animate-pulse" />
            <div className="h-5 w-24 rounded bg-[#EAE4D7] animate-pulse" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-28 rounded-xl bg-[#E8E2D5] animate-pulse" />
            <div className="h-10 w-36 rounded-xl bg-[#174D44]/30 animate-pulse" />
          </div>
        </div>

        {/* Main Content & Practical Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Description, Guidelines, Map Skeleton */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="h-7 w-48 rounded bg-[#E8E2D5] animate-pulse" />
              <div className="h-4 w-full rounded bg-[#EAE4D7] animate-pulse" />
              <div className="h-4 w-full rounded bg-[#EAE4D7] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[#EAE4D7] animate-pulse" />
            </div>

            {/* Guidelines Box Skeleton */}
            <div className="h-32 w-full rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] animate-pulse" />

            {/* Map Skeleton */}
            <div className="h-[280px] sm:h-[340px] w-full rounded-2xl bg-[#EAE4D7] animate-pulse" />
          </div>

          {/* Right Column: Practical Info Guidebook Card Skeleton */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#E3DCB] bg-[#F7F4EB] p-6 sm:p-8 space-y-6">
              <div className="h-5 w-36 rounded bg-[#E0D7C4] animate-pulse" />
              <div className="space-y-4">
                <div className="h-12 w-full rounded-xl bg-[#EAE2D0] animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-[#EAE2D0] animate-pulse" />
                <div className="h-12 w-full rounded-xl bg-[#EAE2D0] animate-pulse" />
                <div className="h-16 w-full rounded-xl bg-[#EAE2D0] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Skeleton */}
        <div className="space-y-4 pt-6">
          <div className="h-8 w-60 rounded bg-[#E8E2D5] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-60 rounded-2xl bg-[#EAE4D7] border border-[#E8E2D5] animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
