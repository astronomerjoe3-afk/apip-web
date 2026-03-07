"use client";

import { useEffect, useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Login failed";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr(null);

    if (!email.trim() || !password) {
      setErr("Email and password are required.");
      return;
    }

    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 520 }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input
            style={{ width: "100%", padding: 10 }}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            style={{ width: "100%", padding: 10 }}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {err ? <p style={{ color: "crimson", margin: 0 }}>{err}</p> : null}

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