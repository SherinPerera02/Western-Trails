"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/saved");
  }, [router]);

  return (
    <div className="flex flex-1 min-h-[50vh] items-center justify-center bg-[#FBF9F4] text-[#1E2421]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D44] border-t-transparent" />
        <p className="font-serif text-sm font-semibold text-[#5C645F]">
          Redirecting to your saved places...
        </p>
      </div>
    </div>
  );
}
