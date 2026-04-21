"use client";

import { useEffect, useState, type FormEvent } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, firebaseConfigured } from "../../lib/firebase";
import { useAuth } from "../../lib/auth";
import { getClientRole, resolvePostAuthPath } from "../../lib/authRouting";
import { establishSessionFromUser } from "../../lib/sessionClient";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Login failed";
}

const PASSWORD_RESET_NOTICE =
  "If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.";

function shouldMaskPasswordResetResult(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "auth/user-not-found";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, sessionUser, authenticated, loading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [resetBusy, setResetBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !authenticated) {
      return;
    }

    async function redirectSignedInUser(): Promise<void> {
      if (user) {
        const role = await getClientRole(user);
        router.replace(resolvePostAuthPath(role, searchParams.get("next")));
        return;
      }

      if (sessionUser) {
        router.replace(resolvePostAuthPath(sessionUser.role, searchParams.get("next")));
      }
    }

    void redirectSignedInUser();
  }, [authenticated, loading, router, searchParams, sessionUser, user]);

  async function handleLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr(null);
    setResetMessage(null);

    if (!firebaseConfigured) {
      setErr("Sign-in is not configured on this app instance yet.");
      return;
    }

    if (!email.trim() || !password) {
      setErr("Email and password are required.");
      return;
    }

    setBusy(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await establishSessionFromUser(credential.user);
      const role = await getClientRole(credential.user);
      router.replace(resolvePostAuthPath(role, searchParams.get("next")));
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordReset(): Promise<void> {
    setErr(null);
    setResetMessage(null);

    if (!firebaseConfigured) {
      setErr("Password reset is not configured on this app instance yet.");
      return;
    }

    if (!email.trim()) {
      setErr("Enter your email address first, then choose Forgot password.");
      return;
    }

    setResetBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${window.location.origin}/login`,
      });
      setResetMessage(PASSWORD_RESET_NOTICE);
    } catch (error: unknown) {
      if (shouldMaskPasswordResetResult(error)) {
        setResetMessage(PASSWORD_RESET_NOTICE);
        return;
      }
      setErr(errorMessage(error));
    } finally {
      setResetBusy(false);
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
        {resetMessage ? (
          <p style={{ color: "#1f5f3a", margin: 0 }}>{resetMessage}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void handlePasswordReset()}
          disabled={busy || resetBusy}
          style={{
            padding: 0,
            border: "none",
            background: "transparent",
            color: "#0b3b76",
            textAlign: "left",
            cursor: busy || resetBusy ? "default" : "pointer",
          }}
        >
          {resetBusy ? "Sending reset link..." : "Forgot password?"}
        </button>

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
