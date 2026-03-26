"use client";

import { useEffect, useState } from "react";
import { type User } from "firebase/auth";

import { useAuth } from "../../lib/auth";
import { getClientRole } from "../../lib/authRouting";
import AdminPanel from "./AdminPanel";
import TokenBar from "./TokenBar";

type Role = "student" | "instructor" | "admin" | "unknown";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<Role>("unknown");

  useEffect(() => {
    let cancelled = false;

    async function resolveRole(nextUser: User | null): Promise<void> {
      if (!nextUser) {
        if (!cancelled) {
          setRole("unknown");
        }
        return;
      }

      const resolvedRole = await getClientRole(nextUser);
      if (!cancelled) {
        setRole(resolvedRole);
      }
    }

    if (!loading) {
      void resolveRole(user);
    }

    return () => {
      cancelled = true;
    };
  }, [loading, user]);

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Cognispark control center</p>
          <h1 className="dashboard-title">{role === "admin" ? "Admin dashboard" : "Dashboard"}</h1>
          <p className="dashboard-subtitle">
            Monitor live operations, protect access, and keep the learning platform healthy without losing track of who is signed in and what role they hold.
          </p>
        </div>

        <div className="dashboard-identity-grid">
          <article className="dashboard-identity-card">
            <span>Email</span>
            <strong>{user?.email || "-"}</strong>
          </article>
          <article className="dashboard-identity-card">
            <span>UID</span>
            <strong>{user?.uid || "-"}</strong>
          </article>
          <article className="dashboard-identity-card">
            <span>Role claim</span>
            <strong>{role}</strong>
          </article>
        </div>
      </section>

      {role === "admin" ? (
        <AdminPanel />
      ) : role === "instructor" ? (
        <div className="dashboard-mode-stack">
          <TokenBar label="Instructor session tools" />
          <section className="dashboard-mode-card">
            <h2>Instructor mode</h2>
            <p>Open the instructor workspace to view cohort misconceptions, predictive risk, cognitive load, class management tools, and content staging.</p>
            <div className="admin-toolbar admin-toolbar-tight" style={{ marginTop: "1rem" }}>
              <a className="admin-btn admin-btn-primary" href="/instructor">Open instructor workspace</a>
            </div>
          </section>
        </div>
      ) : role === "student" ? (
        <div className="dashboard-mode-stack">
          <TokenBar label="Student session tools" />
          <section className="dashboard-mode-card">
            <h2>Student mode</h2>
            <p>The student learning workflow now lives in the lesson experience rather than this dashboard shell.</p>
          </section>
        </div>
      ) : (
        <section className="dashboard-mode-card">
          <h2>Sign in to continue</h2>
          <p>Once you are authenticated, this dashboard will load the tools that match your role.</p>
        </section>
      )}
    </div>
  );
}
