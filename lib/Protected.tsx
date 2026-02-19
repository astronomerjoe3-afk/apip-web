"use client";

import { useEffect } from "react";
import { useAuth } from "./auth";
import { useRouter } from "next/navigation";

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!user) return null;

  return <>{children}</>;
}
