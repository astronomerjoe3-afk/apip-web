"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
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
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 480 }}>
      <h1>Create account</h1>

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
          Password (min 6 chars)
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={6}
            required
          />
        </label>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <button disabled={busy} style={{ padding: 12 }}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}
