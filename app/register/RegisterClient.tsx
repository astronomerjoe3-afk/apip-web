"use client";

import { startTransition, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

import authStyles from "../auth.module.css";
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
  const { user, sessionUser, authenticated, loading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const redirectLockRef = useRef(false);
  const nextPath = searchParams.get("next");
  const loginHref = useMemo(
    () => nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login",
    [nextPath],
  );
  const passwordCheck = useMemo(() => evaluatePasswordStrength(password, email), [password, email]);
  const passwordRequirements = useMemo(
    () => passwordRequirementRows(passwordCheck),
    [passwordCheck],
  );

  useEffect(() => {
    if (loading || !authenticated || redirectLockRef.current) {
      return;
    }

    async function redirectSignedInUser(): Promise<void> {
      if (user) {
        const role = await getClientRole(user);
        startTransition(() => {
          router.replace(resolvePostAuthPath(role, nextPath));
        });
        return;
      }

      if (sessionUser) {
        startTransition(() => {
          router.replace(resolvePostAuthPath(sessionUser.role, nextPath));
        });
      }
    }

    void redirectSignedInUser();
  }, [authenticated, loading, nextPath, router, sessionUser, user]);

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

    redirectLockRef.current = true;
    setBusy(true);

    try {
      const trimmedEmail = email.trim();
      const credential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );
      const verificationPath = resolvePostAuthPath("student", nextPath);
      let verificationStatus = "retry";

      try {
        await sendEmailVerification(credential.user, {
          url: `${window.location.origin}/student/security?next=${encodeURIComponent(verificationPath)}&source=signup`,
        });
        verificationStatus = "sent";
      } catch {
        verificationStatus = "retry";
      }

      const session = await establishSessionFromUser(credential.user);
      await recordStrongPasswordPolicy(MIN_PASSWORD_POLICY_VERSION);
      const targetPath = resolvePostAuthPath(session.role, nextPath);
      startTransition(() => {
        router.replace(
          `/student/security?next=${encodeURIComponent(targetPath)}&source=signup&verification=${verificationStatus}`,
        );
      });
    } catch (error: unknown) {
      redirectLockRef.current = false;
      setErr(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={authStyles.page}>
      <section className={authStyles.shell}>
        <div className={authStyles.brandPanel}>
          <div className={authStyles.brandHeader}>
            <div className={authStyles.brandTopRow}>
              <div className={authStyles.brandLockup}>
                <div className={authStyles.brandMark}>C</div>
                <div>
                  <p className={authStyles.brandName}>Cognispark</p>
                  <p className={authStyles.brandTag}>Physics, mission by mission.</p>
                </div>
              </div>

              <div className={authStyles.utilityLinks}>
                <Link href="/mission-demo" className={authStyles.utilityLink}>
                  Public mission
                </Link>
                <Link href="/learn" className={authStyles.utilityLink}>
                  Full route
                </Link>
                <Link href="/support" className={authStyles.utilityLink}>
                  Support
                </Link>
              </div>
            </div>

            <div>
              <p className={authStyles.eyebrow}>Create your student account</p>
              <h1 className={authStyles.headline}>Start with structure, not confusion.</h1>
              <p className={authStyles.support}>
                Open your account once, then move through missions, worked examples, and mastery checks with a cleaner route across physics.
              </p>
            </div>

            <div className={authStyles.routeStats}>
              <article className={authStyles.routeStat}>
                <span>First step</span>
                <strong>Create the account, then verify your email and enter the student route cleanly.</strong>
              </article>
              <article className={authStyles.routeStat}>
                <span>Public entry</span>
                <strong>Visitors can already try a mission and inspect the full coverage map before signup.</strong>
              </article>
              <article className={authStyles.routeStat}>
                <span>After signup</span>
                <strong>{nextPath ? "You will continue into the page you originally asked for." : "You will land in the student onboarding flow, then continue into the platform."}</strong>
              </article>
            </div>
          </div>

          <div className={authStyles.proofStack}>
            <article className={authStyles.proofCard}>
              <span>Built for learning</span>
              <strong>Students get visual setup, guided checks, and clearer momentum.</strong>
              <p>The platform is designed so new ideas become understandable before they become mathematical.</p>
            </article>
            <article className={authStyles.proofCard}>
              <span>Future-ready account</span>
              <strong>Signup already satisfies the strong-password baseline for premium access.</strong>
              <p>That means less interruption later if this account unlocks premium modules or a wider subscription.</p>
            </article>
          </div>

          <div className={authStyles.previewBoard}>
            <p className={authStyles.eyebrow}>What opens next</p>
            <strong>The first platform wins to expect</strong>
            <div className={authStyles.previewList}>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>01</span>
                <p>Free foundations to build confidence before the heavier modules.</p>
              </div>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>02</span>
                <p>Core mechanics, energy, waves, circuits, particles, and astrophysics pathways.</p>
              </div>
              <div className={authStyles.previewItem}>
                <span className={authStyles.previewIndex}>03</span>
                <p>A dashboard that keeps progress, support, and premium access in one place.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={authStyles.formPanel}>
          <div className={authStyles.formCard}>
            <div className={authStyles.formHeader}>
              <p className={authStyles.eyebrow}>Create account</p>
              <h1>Create account</h1>
              <p>Set up a Cognispark account and start the mission path with the right security baseline from day one.</p>
            </div>

            <div className={authStyles.formNote}>
              The next step after signup is email verification, so your route and recovery flow are ready from the start.
            </div>

            <form onSubmit={onSubmit} className={authStyles.form}>
              <label className={authStyles.field} htmlFor="register-email">
                <span className={authStyles.fieldLabel}>Email</span>
                <input
                  id="register-email"
                  className={authStyles.input}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </label>

              <label className={authStyles.field} htmlFor="register-password">
                <span className={authStyles.fieldLabel}>Password</span>
                <input
                  id="register-password"
                  className={authStyles.input}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  aria-describedby="password-requirements"
                  minLength={6}
                  required
                />
              </label>

              <div className={authStyles.requirements} id="password-requirements">
                <strong>Minimum password strength</strong>
                <p>
                  If this account later unlocks a module or uses a subscription, the strong-password requirement is already satisfied when this signup rule passes.
                </p>
                <div className={authStyles.requirementList}>
                  {passwordRequirements.map((requirement) => (
                    <div
                      key={requirement.key}
                      className={`${authStyles.requirementItem} ${requirement.met ? authStyles.requirementMet : authStyles.requirementPending}`}
                    >
                      <span>{requirement.met ? "Pass" : "Needs work"}</span>
                      <span>{requirement.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {err ? (
                <p className={authStyles.error} role="alert">
                  {err}
                </p>
              ) : null}

              <button className={authStyles.primaryButton} disabled={busy || !passwordCheck.isStrong}>
                {busy ? "Creating..." : "Create account"}
              </button>
            </form>

            <p className={authStyles.linkRow}>
              Already have an account? <Link href={loginHref}>Login</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
