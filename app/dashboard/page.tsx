"use client";

import React, { useEffect, useState } from "react";
import AdminPanel from "./AdminPanel";

// NOTE: this import path depends on how you set up Firebase in apip-web.
// Adjust if needed (common: "@/lib/firebase" exporting `auth`)
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const [claimsRole, setClaimsRole] = useState<string>("");
  const [apiRole, setApiRole] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setErr("");
      setApiRole("");
      setClaimsRole("");
      setToken("");

      if (!user) return;

      setEmail(user.email || "");
      setUid(user.uid);

      try {
        const t = await user.getIdToken(/* forceRefresh */ true);
        setToken(t);

        const decoded = await user.getIdTokenResult();
        const role = (decoded?.claims as any)?.role;
        setClaimsRole(role ? String(role) : "");

        // Fetch /profile from API for server-side role truth (Step 3.2 depends on this)
        const base = process.env.NEXT_PUBLIC_API_BASE;
        if (base) {
          const resp = await fetch(`${base.replace(/\/$/, "")}/profile`, {
            headers: { Authorization: `Bearer ${t}` },
            cache: "no-store",
          });
          const data = await resp.json().catch(() => null);

          if (!resp.ok) {
            setErr(`API ${resp.status}: ${JSON.stringify(data)}`);
          } else {
            setApiRole(data?.role ? String(data.role) : "");
          }
        }
      } catch (e: any) {
        setErr(String(e));
      }
    });

    return () => unsub();
  }, []);

  const isAdmin = (apiRole || claimsRole) === "admin";

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 44, fontWeight: 800, marginBottom: 16 }}>Dashboard</h1>

      <div style={{ fontSize: 18, lineHeight: 1.6 }}>
        <div>
          <b>Email:</b> {email || "(not signed in)"}
        </div>
        <div>
          <b>UID:</b> {uid || "-"}
        </div>
        <div>
          <b>Role (client claims):</b> {claimsRole || "-"}
        </div>
        <div>
          <b>Role (from API /profile):</b> {apiRole || "(not fetched)"}
        </div>
      </div>

      {err ? (
        <pre style={{ color: "#ff6b6b", marginTop: 12, whiteSpace: "pre-wrap" }}>{err}</pre>
      ) : null}

      {isAdmin && token ? <AdminPanel token={token} /> : null}
    </main>
  );
}