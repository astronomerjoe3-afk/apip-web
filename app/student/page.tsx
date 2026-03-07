"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { apipGet } from "../../lib/apipApi";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";

type Module = {
  id: string;
  title?: string;
  description?: string;
  estimated_minutes?: number;
  level?: string;
};

type ModulesResponse = {
  ok: boolean;
  modules: Module[];
};

type Role = "student" | "instructor" | "admin" | "unknown";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function getRole(user: User): Promise<Role> {
  try {
    const tokenResult = await user.getIdTokenResult(true);
    const claim = tokenResult.claims?.role;
    if (
      claim === "student" ||
      claim === "instructor" ||
      claim === "admin"
    ) {
      return claim;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export default function StudentHomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [role, setRole] = useState<Role>("unknown");
  const [roleLoading, setRoleLoading] = useState<boolean>(true);

  const [modules, setModules] = useState<Module[]>([]);
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
          router.replace("/login");
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
        router.replace("/login");
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

  async function handleLogout(): Promise<void> {
    try {
      setStatus("Signing out...");
      await signOut(auth);
      router.replace("/login");
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
            Choose a module to begin.
          </p>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Signed in as: {user?.email || "student"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
          {modules.map((moduleItem) => (
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

                  <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>
                    {moduleItem.level ? `Level: ${moduleItem.level} • ` : ""}
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
                      Open module
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {modules.length === 0 ? (
            <div
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                No modules returned.
              </div>
              <Link href="/student/module/F1">
                <button
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #333",
                    fontWeight: 700,
                  }}
                >
                  Open F1
                </button>
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}