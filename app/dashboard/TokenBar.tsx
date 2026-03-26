"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { auth } from "../../lib/firebase";
import { signOutEverywhere } from "../../lib/sessionClient";

type Props = {
  label?: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export default function TokenBar({ label = "Session tools" }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsubscribe();
  }, []);

  function refreshWorkspace(): void {
    setStatus("Refreshing workspace...");
    window.location.reload();
  }

  async function doLogout(): Promise<void> {
    try {
      setStatus("Signing out...");
      await signOutEverywhere();
      setStatus("Signed out.");
      window.location.href = "/login";
    } catch (error: unknown) {
      setStatus(`Logout failed: ${errorMessage(error)}`.slice(0, 160));
    }
  }

  return (
    <div
      style={{
        margin: "16px 0",
        padding: "12px",
        border: "1px solid #333",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: 700 }}>{label}</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Session access is managed server-side. No bearer token is copied to the clipboard here.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => refreshWorkspace()} disabled={!user}>
            Refresh workspace
          </button>
          <button onClick={() => void doLogout()} disabled={!user}>
            Logout
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
