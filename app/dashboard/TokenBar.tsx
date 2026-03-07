"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

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

  async function copyIdToken(forceRefresh: boolean): Promise<void> {
    try {
      setStatus("Fetching token...");
      if (!user) {
        setStatus("Not signed in.");
        return;
      }

      const token = await user.getIdToken(forceRefresh);
      await navigator.clipboard.writeText(token);
      setStatus(forceRefresh ? "Fresh ID token copied." : "ID token copied.");
      window.setTimeout(() => setStatus(""), 2500);
    } catch (error: unknown) {
      setStatus(`Token copy failed: ${errorMessage(error)}`.slice(0, 160));
    }
  }

  async function doLogout(): Promise<void> {
    try {
      setStatus("Signing out...");
      await signOut(auth);
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
            Token is never shown on screen — only copied on click.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => void copyIdToken(false)} disabled={!user}>
            Copy ID token
          </button>
          <button onClick={() => void copyIdToken(true)} disabled={!user}>
            Refresh + copy token
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