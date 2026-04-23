"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading || authenticated) {
      return;
    }

    const query = searchParams.toString();
    const nextPath = `${pathname || "/"}${query ? `?${query}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
  }, [authenticated, loading, pathname, router, searchParams]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!authenticated) return null; // while redirecting

  return <>{children}</>;
}
