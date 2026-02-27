"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

// NOTE: adjust this import if your firebase.ts exports differently
import { auth } from "../../lib/firebase";

type Props = {
  label?: string;
};

export default function TokenBar({ label = "Session tools" }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function copyIdToken(forceRefresh: boolean) {
    try {
      setStatus("Fetching token...");
      if (!user) {
        setStatus("Not signed in.");
        return;
      }
      const token = await user.getIdToken(forceRefresh);
      await navigator.clipboard.writeText(token);
      setStatus(forceRefresh ? "Fresh ID token copied." : "ID token copied.");
      setTimeout(() => setStatus(""), 2500);
    } catch (e: any) {
      setStatus(`Token copy failed: ${String(e?.message || e)}`.slice(0, 120));
    }
  }

  return (
    <div style={{ margin: "16px 0", padding: "12px", border: "1px solid #333", borderRadius: 10 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{label}</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Token is never shown on screen — only copied on click.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => copyIdToken(false)} disabled={!user}>
            Copy ID token
          </button>
          <button onClick={() => copyIdToken(true)} disabled={!user}>
            Refresh + copy token
          </button>
        </div>
      </div>

      {status ? (
        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
          {status}
        </div>
      ) : null}
    </div>
  );
}