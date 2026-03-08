"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, firebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { getClientRole, resolvePostAuthPath } from "@/lib/authRouting";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Registration failed";
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const currentUser = user;

    async function redirectSignedInUser(): Promise<void> {
      const role = await getClientRole(currentUser);
      router.replace(resolvePostAuthPath(role, searchParams.get("next")));
    }

    void redirectSignedInUser();
  }, [loading, router, searchParams, user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      if (!firebaseConfigured) {
        setErr("Registration is not configured on this app instance yet.");
        return;
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const role = await getClientRole(credential.user);
      router.replace(resolvePostAuthPath(role, searchParams.get("next")));
    } catch (error: unknown) {
      setErr(errorMessage(error));
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
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>

        <label>
          Password (min 6 chars)
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={6}
            required
          />
        </label>

        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}

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