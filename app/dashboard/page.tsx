"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, User } from "firebase/auth";

import { auth } from "../../lib/firebase";
import TokenBar from "./TokenBar";
import AdminPanel from "./AdminPanel";

type Role = "student" | "instructor" | "admin" | "unknown";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("unknown");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole("unknown");
        return;
      }
      try {
        // Pull custom claims (role) from Firebase
        const tokenResult = await getIdTokenResult(u, true);
        const r = (tokenResult.claims?.role as Role) || "unknown";
        setRole(r);
      } catch {
        setRole("unknown");
      }
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 72, margin: "0 0 16px 0" }}>Dashboard</h1>

      <div style={{ fontSize: 18, lineHeight: 1.6 }}>
        <div><b>Email:</b> {user?.email || "-"}</div>
        <div><b>UID:</b> {user?.uid || "-"}</div>
        <div><b>Role (client claims):</b> {role}</div>
      </div>

      <TokenBar label="Token tools (student/instructor/admin)" />

      {role === "admin" ? (
        <AdminPanel />
      ) : role === "instructor" ? (
        <div style={{ marginTop: 18, padding: 16, border: "1px solid #333", borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>Instructor Mode</h2>
          <div style={{ opacity: 0.85 }}>
            Instructor dashboard features will appear here next (cohort metrics, misconception map, engagement analytics).
          </div>
        </div>
      ) : role === "student" ? (
        <div style={{ marginTop: 18, padding: 16, border: "1px solid #333", borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>Student Mode</h2>
          <div style={{ opacity: 0.85 }}>
            Student learning UI will be added next (Module F1 → Lessons → ACSR loop → /progress logging).
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18, opacity: 0.8 }}>
          Sign in to continue.
        </div>
      )}
    </div>
  );
}