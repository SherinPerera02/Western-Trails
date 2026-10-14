"use client";

import { ReactNode } from "react";
import RequireAuth from "@/components/RequireAuth";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth adminOnly>
      <div className="min-h-screen bg-[#FBF9F4] text-stone-800 flex flex-col font-sans antialiased">
        <AdminNav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-stone-200 bg-white/70 py-4 px-4 text-center text-xs text-stone-500">
          Western Trails Admin Portal &bull; Panadura, Sri Lanka &bull; Internal Administration
        </footer>
      </div>
    </RequireAuth>
  );
}
