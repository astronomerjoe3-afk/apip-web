"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

import authStyles from "../auth.module.css";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [resetBusy, setResetBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

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
      setResetMessage("Password reset email sent. Check your inbox and spam folder.");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <main className={authStyles.page}>
      <section className={authStyles.shell}>
        <div className={authStyles.brandPanel}>
          <div className={authStyles.brandHeader}>
            <div className={authStyles.brandLockup}>
              <div className={authStyles.brandMark}>C</div>
              <div>
                <p className={authStyles.brandName}>Cognispark</p>
                <p className={authStyles.brandTag}>Physics, mission by mission.</p>
              </div>
            </div>
            <div>
              <p className={authStyles.eyebrow}>Student sign-in</p>
              <h1 className={authStyles.headline}>Come back to the mission route.</h1>
              <p className={authStyles.support}>
                Pick up exactly where you left off with your dashboard, premium access, and lesson progress in one place.
              </p>
            </div>
          </div>

          <div className={authStyles.proofStack}>
            <article className={authStyles.proofCard}>
              <span>Clear route</span>
              <strong>Foundation, Core, and Advanced modules stay in one pathway.</strong>
              <p>Students can move from first-contact ideas into deeper mechanics, fields, circuits, and astrophysics without changing tools.</p>
            </article>
            <article className={authStyles.proofCard}>
              <span>Feedback loop</span>
              <strong>Wrong answers become guidance instead of a dead end.</strong>
              <p>Every lesson is designed to keep momentum by showing what changed, what matters, and what to notice next.</p>
            </article>
          </div>

          <div className={authStyles.previewBoard}>
            <p className={authStyles.eyebrow}>Mission flow</p>
            <strong>What the student experience is built to do</strong>
            <div className={authStyles.previewList}>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>01</span>
                <p>Show the concept visually before formulas start competing for attention.</p>
              </div>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>02</span>
                <p>Use feedback and worked examples to turn uncertainty into direction.</p>
              </div>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>03</span>
                <p>Track mastery as a route forward, not just a score after the fact.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={authStyles.formPanel}>
          <div className={authStyles.formCard}>
            <div className={authStyles.formHeader}>
              <p className={authStyles.eyebrow}>Welcome back</p>
              <h1>Login</h1>
              <p>Sign in to continue your current module, review feedback, and manage your student account.</p>
            </div>

            <form onSubmit={handleLogin} className={authStyles.form}>
              <label className={authStyles.field} htmlFor="login-email">
                <span className={authStyles.fieldLabel}>Email</span>
                <input
                  id="login-email"
                  className={authStyles.input}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </label>

              <label className={authStyles.field} htmlFor="login-password">
                <span className={authStyles.fieldLabel}>Password</span>
                <input
                  id="login-password"
                  className={authStyles.input}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              {err ? (
                <p className={authStyles.error} role="alert">
                  {err}
                </p>
              ) : null}
              {resetMessage ? (
                <p className={authStyles.success} aria-live="polite">
                  {resetMessage}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void handlePasswordReset()}
                disabled={busy || resetBusy}
                className={authStyles.textButton}
              >
                {resetBusy ? "Sending reset link..." : "Forgot password?"}
              </button>

              <button className={authStyles.primaryButton} disabled={busy}>
                {busy ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className={authStyles.linkRow}>
              No account yet? <Link href="/register">Create one</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
