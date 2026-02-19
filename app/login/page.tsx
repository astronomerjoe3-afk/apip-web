"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            style={{ width: "100%", padding: 10 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label>
          Password
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <button disabled={busy} style={{ padding: 12 }}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        No account? <a href="/register">Create one</a>
      </p>
    </main>
  );
}
