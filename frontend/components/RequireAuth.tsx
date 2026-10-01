"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (adminOnly && user.role !== "admin") router.replace("/");
  }, [user, loading, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== "admin")) {
    return <p className="p-6 text-gray-500">Loading…</p>;
  }
  return <>{children}</>;
}
