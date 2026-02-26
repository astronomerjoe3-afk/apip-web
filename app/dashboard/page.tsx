"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminPanel from "./AdminPanel";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, getIdTokenResult, User } from "firebase/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");
  const [claimsRole, setClaimsRole] = useState<string>("(unknown)");
  const [uid, setUid] = useState<string>("");

  const email = useMemo(() => user?.email ?? "(not signed in)", [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setToken("");
      setClaimsRole("(unknown)");
      setUid("");

      if (!u) return;

      setUid(u.uid);

      // Always fetch token+claims once on load
      const res = await getIdTokenResult(u, true);
      setToken(res.token);

      const role = (res.claims?.role as string) || "(none)";
      setClaimsRole(role);
    });

    return () => unsub();
  }, []);

  const isAdmin = claimsRole === "admin";

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 56, marginBottom: 12 }}>Dashboard</h1>

      <div style={{ lineHeight: 1.8 }}>
        <div>
          <strong>Email:</strong> {email}
        </div>
        <div>
          <strong>UID:</strong> {uid || "(not signed in)"}
        </div>
        <div>
          <strong>Role (client claims):</strong> {claimsRole}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {isAdmin && token ? <AdminPanel token={token} /> : null}
      </div>
    </main>
  );
}