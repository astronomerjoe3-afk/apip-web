"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, firebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { getClientRole, resolvePostAuthPath } from "@/lib/authRouting";
import {
  evaluatePasswordStrength,
  MIN_PASSWORD_POLICY_VERSION,
  passwordRequirementRows,
} from "@/lib/accountSecurity";
import { establishSessionFromUser, recordStrongPasswordPolicy } from "@/lib/sessionClient";

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
  const passwordCheck = useMemo(() => evaluatePasswordStrength(password, email), [password, email]);
  const passwordRequirements = useMemo(
    () => passwordRequirementRows(passwordCheck),
    [passwordCheck],
  );

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
    if (!firebaseConfigured) {
      setErr("Registration is not configured on this app instance yet.");
      return;
    }

    if (!passwordCheck.isStrong) {
      setErr("Choose a stronger password before creating the account.");
      return;
    }

    setBusy(true);

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      await establishSessionFromUser(credential.user);
      await recordStrongPasswordPolicy(MIN_PASSWORD_POLICY_VERSION);
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
          Password
          <input
            style={{ width: "100%", padding: 10 }}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            minLength={6}
            required
          />
        </label>

        <div
          style={{
            border: "1px solid rgba(15, 23, 42, 0.12)",
            borderRadius: 12,
            padding: 12,
            background: "#f8fafc",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Minimum password strength
          </div>
          <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8, lineHeight: 1.6 }}>
            If this account later unlocks a module or uses a subscription, the strong-password step is already satisfied when it passes this signup rule.
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {passwordRequirements.map((requirement) => (
              <div
                key={requirement.key}
                style={{
                  color: requirement.met ? "#166534" : "#475569",
                  fontSize: 14,
                  fontWeight: requirement.met ? 700 : 500,
                }}
              >
                {requirement.met ? "Pass" : "Needs work"}: {requirement.label}
              </div>
            ))}
          </div>
        </div>

        {err ? <p style={{ color: "crimson" }}>{err}</p> : null}

        <button disabled={busy || !passwordCheck.isStrong} style={{ padding: 12 }}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}
