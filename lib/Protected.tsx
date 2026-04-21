"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) router.replace("/login");
  }, [authenticated, loading, router]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!authenticated) return null; // while redirecting

  return <>{children}</>;
}
