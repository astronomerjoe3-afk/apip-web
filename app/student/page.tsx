"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { apipGet, apipPost } from "../../lib/apipApi";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";
import { getClientRole, type Role } from "../../lib/authRouting";

type PricingOffer = {
  id?: string;
  title?: string;
  price_label?: string;
  billing_label?: string;
  effective_monthly_label?: string;
  description?: string;
};

type ModuleAccess = {
  tier?: "free" | "premium" | string;
  is_unlocked?: boolean;
  unlock_reason?: string;
  message?: string;
  module_purchase?: PricingOffer | null;
  subscription_plans?: PricingOffer[];
};

type Module = {
  id: string;
  title?: string;
  description?: string;
  estimated_minutes?: number;
  level?: string;
  access_tier?: string;
  access?: ModuleAccess;
};

type ModulesResponse = {
  ok: boolean;
  modules: Module[];
};

type BillingSummary = {
  configured?: boolean;
  portal_enabled?: boolean;
  has_active_subscription?: boolean;
  active_subscription_plan_id?: string | null;
};

type BillingSummaryResponse = {
  ok: boolean;
  billing: BillingSummary;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function getRole(user: User): Promise<Role> {
  return getClientRole(user);
}

function moduleBadge(moduleItem: Module): { label: string; background: string; color: string } {
  const locked = moduleItem.access?.tier === "premium" && moduleItem.access?.is_unlocked === false;
  if (moduleItem.access?.tier === "premium") {
    return locked
      ? { label: "Premium locked", background: "#fef3c7", color: "#92400e" }
      : { label: "Premium unlocked", background: "#dcfce7", color: "#166534" };
  }

  return { label: "Free module", background: "#dbeafe", color: "#1d4ed8" };
}

export default function StudentHomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [role, setRole] = useState<Role>("unknown");
  const [roleLoading, setRoleLoading] = useState<boolean>(true);

  const [modules, setModules] = useState<Module[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [billingBusy, setBillingBusy] = useState<boolean>(false);
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function resolveRole(): Promise<void> {
      if (loading) return;

      if (!user) {
        if (!cancelled) {
          setRole("unknown");
          setRoleLoading(false);
          router.replace("/login?next=/student");
        }
        return;
      }

      const resolvedRole = await getRole(user);
      if (cancelled) return;

      setRole(resolvedRole);
      setRoleLoading(false);

      if (resolvedRole === "instructor") {
        router.replace("/instructor");
        return;
      }

      if (resolvedRole === "admin") {
        router.replace("/dashboard");
        return;
      }

      if (resolvedRole !== "student") {
        router.replace("/login?next=/student");
      }
    }

    void resolveRole();

    return () => {
      cancelled = true;
    };
  }, [loading, router, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadModules(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") return;

      setModulesLoading(true);

      try {
        setErr("");
        const data = await apipGet<ModulesResponse>("/modules");
        if (cancelled) return;
        setModules(Array.isArray(data.modules) ? data.modules : []);
      } catch (error: unknown) {
        if (cancelled) return;
        setErr(errorMessage(error));
        setModules([]);
      } finally {
        if (!cancelled) {
          setModulesLoading(false);
        }
      }
    }

    void loadModules();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingSummary(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") return;
      try {
        const data = await apipGet<BillingSummaryResponse>("/billing/summary");
        if (!cancelled) setBillingSummary(data.billing || null);
      } catch {}
    }

    void loadBillingSummary();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  async function openBillingPortal(): Promise<void> {
    try {
      setBillingBusy(true);
      const data = await apipPost<{ ok: boolean; portal_url?: string }>("/billing/portal-session", { origin: window.location.origin, return_path: "/student" } as never);
      if (!data.portal_url) throw new Error("Billing portal did not return a redirect URL.");
      window.location.assign(data.portal_url);
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBillingBusy(false);
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      setStatus("Signing out...");
      await signOut(auth);
      router.replace("/login?next=/student");
    } catch (error: unknown) {
      setStatus("");
      setErr(errorMessage(error));
    }
  }

  const pageReady = useMemo(() => {
    return !loading && !roleLoading && !!user && role === "student";
  }, [loading, roleLoading, role, user]);

  if (loading || roleLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 14,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Loading student access...
        </div>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 14,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 12 }}>Student</h1>
          <p style={{ opacity: 0.8, marginBottom: 8 }}>
            F1 is free. Premium modules unlock for 1 month per module or through subscription.
          </p>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Signed in as: {user?.email || "student"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {billingSummary?.portal_enabled ? (
            <button onClick={() => void openBillingPortal()} disabled={billingBusy} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", fontWeight: 700, opacity: billingBusy ? 0.65 : 1 }}>
              {billingBusy ? "Opening billing..." : "Manage billing"}
            </button>
          ) : null}
          <button
            onClick={() => router.refresh()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              fontWeight: 700,
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => void handleLogout()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              fontWeight: 700,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {status ? (
        <div
          style={{
            border: "1px solid #333",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
            opacity: 0.85,
          }}
        >
          {status}
        </div>
      ) : null}

      {err ? (
        <div
          style={{
            border: "1px solid #800",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <b>Error:</b> {err}
        </div>
      ) : null}

      {modulesLoading ? (
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Loading modules...
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {modules.map((moduleItem) => {
            const badge = moduleBadge(moduleItem);
            const locked = moduleItem.access?.tier === "premium" && moduleItem.access?.is_unlocked === false;
            const buttonLabel = locked ? "See unlock options" : "Open module";

            return (
            <div
              key={moduleItem.id}
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {moduleItem.title || moduleItem.id}
                  </div>

                  <div style={{ opacity: 0.8, marginTop: 6 }}>
                    {moduleItem.description || ""}
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: badge.background,
                        color: badge.color,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {moduleItem.access?.message ? (
                    <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85 }}>
                      {moduleItem.access.message}
                    </div>
                  ) : null}

                  {locked && moduleItem.access?.module_purchase?.price_label ? (
                    <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>
                      1-month access: {moduleItem.access.module_purchase.price_label}
                    </div>
                  ) : null}


                  <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>
                    {moduleItem.level ? `Level: ${moduleItem.level} | ` : ""}
                    {moduleItem.estimated_minutes
                      ? `Est: ${moduleItem.estimated_minutes} min`
                      : ""}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <Link href={`/student/module/${encodeURIComponent(moduleItem.id)}`}>
                    <button
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid #333",
                        fontWeight: 700,
                      }}
                    >
                      {buttonLabel}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
          {modules.length === 0 ? (
            <div
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                No modules returned.
              </div>
              <div style={{ opacity: 0.8 }}>
                Module options come from Firestore. If one is missing here, the live API is not returning it.
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
