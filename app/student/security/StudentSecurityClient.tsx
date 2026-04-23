"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FirebaseError } from "firebase/app";
import {
  EmailAuthProvider,
  multiFactor,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { getClientRole, landingPathForRole, sanitizeNextPath } from "@/lib/authRouting";
import {
  evaluatePasswordStrength,
  MIN_PASSWORD_POLICY_VERSION,
  passwordRequirementRows,
  securityActionLabel,
} from "@/lib/accountSecurity";
import {
  establishSessionFromUser,
  readSessionUser,
  recordStrongPasswordPolicy,
  type SessionUser,
} from "@/lib/sessionClient";
import styles from "./security.module.css";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Security update failed";
}

function shouldMaskVerificationResendError(error: unknown): boolean {
  return error instanceof FirebaseError
    && (error.code === "auth/too-many-requests" || error.code === "auth/retry-limit-exceeded");
}

export default function StudentSecurityClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [verifyBusy, setVerifyBusy] = useState<boolean>(false);
  const [refreshBusy, setRefreshBusy] = useState<boolean>(false);
  const [passwordBusy, setPasswordBusy] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [factorCount, setFactorCount] = useState<number>(0);
  const [err, setErr] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const nextPath = useMemo(
    () => sanitizeNextPath(searchParams.get("next")) || "/student",
    [searchParams],
  );
  const signupSource = searchParams.get("source") === "signup";
  const verificationStatus = searchParams.get("verification");
  const resumePath = useMemo(() => {
    const params = new URLSearchParams();
    params.set("next", nextPath);
    if (signupSource) {
      params.set("source", "signup");
    }
    if (verificationStatus) {
      params.set("verification", verificationStatus);
    }
    return `/student/security?${params.toString()}`;
  }, [nextPath, signupSource, verificationStatus]);

  const passwordCheck = useMemo(
    () => evaluatePasswordStrength(newPassword, user?.email || sessionUser?.email || ""),
    [newPassword, sessionUser?.email, user?.email],
  );
  const passwordRequirements = useMemo(
    () => passwordRequirementRows(passwordCheck),
    [passwordCheck],
  );

  const refreshSecurityState = useCallback(async (currentUser = user): Promise<SessionUser | null> => {
    if (!currentUser) {
      setSessionUser(null);
      setPageLoading(false);
      return null;
    }

    await currentUser.reload();
    const refreshedSession = await establishSessionFromUser(currentUser);
    const resolvedRole = await getClientRole(currentUser);
    if (resolvedRole !== "student") {
      router.replace(landingPathForRole(resolvedRole));
      return null;
    }

    setSessionUser(refreshedSession);
    setFactorCount(multiFactor(currentUser).enrolledFactors.length);
    setPageLoading(false);
    return refreshedSession;
  }, [router, user]);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      if (loading) {
        return;
      }

      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(resumePath)}`);
        return;
      }

      try {
        const cachedSession = await readSessionUser();
        if (cancelled) {
          return;
        }
        if (cachedSession) {
          setSessionUser(cachedSession);
          setFactorCount(multiFactor(user).enrolledFactors.length);
        }
        await refreshSecurityState(user);
      } catch (error: unknown) {
        if (!cancelled) {
          setErr(errorMessage(error));
          setPageLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [loading, refreshSecurityState, resumePath, router, user]);

  const emailVerified = sessionUser?.security?.email_verified === true;
  const strongPasswordConfirmed = sessionUser?.security?.strong_password_confirmed === true;
  const hardeningComplete = sessionUser?.security?.hardening_complete === true;
  const recommendedActions = sessionUser?.security?.recommended_actions || [];

  async function handleSendVerification(): Promise<void> {
    if (!user) return;
    setErr("");
    setStatus("");
    setVerifyBusy(true);

    try {
      const verificationUrl = `${window.location.origin}/student/security?next=${encodeURIComponent(nextPath)}`;
      await sendEmailVerification(user, { url: verificationUrl });
      setStatus("Verification email sent. Open the link in that message, then come back here and refresh this page.");
    } catch (error: unknown) {
      if (shouldMaskVerificationResendError(error)) {
        setStatus("A verification email was already sent recently. Open that message, or wait a moment before requesting another one.");
        return;
      }
      setErr(errorMessage(error));
    } finally {
      setVerifyBusy(false);
    }
  }

  async function handleRefreshVerification(): Promise<void> {
    if (!user) return;
    setErr("");
    setStatus("");
    setRefreshBusy(true);

    try {
      const refreshedSession = await refreshSecurityState(user);
      const emailVerifiedNow =
        refreshedSession?.security?.email_verified === true
        || refreshedSession?.email_verified === true
        || user.emailVerified === true;
      setStatus(
        emailVerifiedNow
          ? "Your email verification status is up to date."
          : "Your email is still unverified. Finish the email step first, then refresh again.",
      );
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setRefreshBusy(false);
    }
  }

  async function handlePasswordUpgrade(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!user || !user.email) {
      setErr("A signed-in email/password account is required before the password can be updated.");
      return;
    }

    setErr("");
    setStatus("");

    if (!currentPassword) {
      setErr("Enter your current password first.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("The new password and confirmation do not match.");
      return;
    }
    if (!passwordCheck.isStrong) {
      setErr("Choose a stronger new password before saving it.");
      return;
    }

    setPasswordBusy(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      await recordStrongPasswordPolicy(MIN_PASSWORD_POLICY_VERSION);
      await refreshSecurityState(user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("Password updated. This account now satisfies the stronger password policy.");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setPasswordBusy(false);
    }
  }

  if (loading || pageLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.heroTop}>
              <div className={styles.brandLockup}>
                <div className={styles.brandMark}>C</div>
                <div>
                  <p className={styles.brandName}>Cognispark</p>
                  <p className={styles.brandTag}>Physics, mission by mission.</p>
                </div>
              </div>
            </div>
            <div>
              <p className={styles.eyebrow}>Student onboarding security</p>
              <h1 className={styles.headline}>Secure your account.</h1>
              <p className={styles.support}>Checking your current verification and password status now.</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.brandLockup}>
              <div className={styles.brandMark}>C</div>
              <div>
                <p className={styles.brandName}>Cognispark</p>
                <p className={styles.brandTag}>Physics, mission by mission.</p>
              </div>
            </div>

            <div className={styles.heroLinks}>
              <Link href="/mission-demo" className={styles.heroLink}>
                Public mission
              </Link>
              <Link href="/learn" className={styles.heroLink}>
                Full route
              </Link>
              <Link href="/support" className={styles.heroLink}>
                Support
              </Link>
            </div>
          </div>

          <div>
            <p className={styles.eyebrow}>Student onboarding security</p>
            <h1 className={styles.headline}>Secure your account.</h1>
            <p className={styles.support}>
              Keep your account protected and recovery-ready so the student route stays smooth from signup into the
              platform.
            </p>
          </div>

          <div className={styles.heroMeta}>
            <article className={styles.heroBadge}>
              <span>Email status</span>
              <strong>{emailVerified ? "Verified and ready to continue" : "Verification still needed"}</strong>
            </article>
            <article className={styles.heroBadge}>
              <span>Password baseline</span>
              <strong>{strongPasswordConfirmed ? "Strong password already recorded" : "Strong password check still open"}</strong>
            </article>
            <article className={styles.heroBadge}>
              <span>Destination</span>
              <strong>{nextPath === "/student" ? "Student workspace next" : "Return to your requested page next"}</strong>
            </article>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            {signupSource ? (
              <div className={styles.notice}>
                <strong>{emailVerified ? "Your account is ready." : "Your account is created."}</strong>{" "}
                {emailVerified
                  ? "Your email already shows as verified, so you can continue straight into the student workspace below."
                  : verificationStatus === "sent"
                    ? "We sent a verification email to this account. Open that link, then come back here and refresh your status."
                    : "Finish email verification below before you move on. If you did not receive a message yet, use the resend button in Step 1."}
              </div>
            ) : null}

            {err ? (
              <div className={`${styles.alert} ${styles.alertError}`}>
                <strong>Error:</strong> {err}
              </div>
            ) : null}

            {status ? <div className={styles.alert}>{status}</div> : null}

            <div className={styles.statusCard}>
              <div className={styles.statusTitle}>Current status</div>
              <div className={styles.statusList}>
                <div className={`${styles.statusItem} ${emailVerified ? styles.statusComplete : ""}`}>
                  {emailVerified ? "Ready: Email address verified" : "Needed: Verify your email address"}
                </div>
                <div className={`${styles.statusItem} ${strongPasswordConfirmed ? styles.statusComplete : ""}`}>
                  {strongPasswordConfirmed ? "Ready" : "Needed"}: Strong password recorded for this account
                </div>
                <div className={`${styles.statusItem} ${factorCount > 0 ? styles.statusComplete : ""}`}>
                  {factorCount > 0 ? "Enabled" : "Recommended"}: 2-factor authentication
                </div>
              </div>

              {recommendedActions.length > 0 ? (
                <div className={styles.statusHint}>
                  Next focus: {recommendedActions.map((action) => securityActionLabel(action)).join(", ")}.
                </div>
              ) : (
                <div className={styles.allClear}>Your account security steps are complete.</div>
              )}
            </div>

            {!emailVerified ? (
              <div className={styles.sectionCard}>
                <div className={styles.sectionTitle}>Step 1: Verify your email</div>
                <div className={styles.sectionBody}>
                  A verified email gives you a reliable recovery path and keeps the account ready for the full student
                  route.
                </div>
                <div className={styles.buttonRow}>
                  <button
                    type="button"
                    onClick={() => void handleSendVerification()}
                    disabled={verifyBusy}
                    className={styles.secondaryButton}
                  >
                    {verifyBusy ? "Sending email..." : "Send verification email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRefreshVerification()}
                    disabled={refreshBusy}
                    className={styles.secondaryButton}
                  >
                    {refreshBusy ? "Refreshing..." : "I have verified, refresh now"}
                  </button>
                </div>
              </div>
            ) : null}

            {!strongPasswordConfirmed ? (
              <div className={styles.sectionCard}>
                <div className={styles.sectionTitle}>Step 2: Confirm a strong password</div>
                <div className={styles.sectionBody}>
                  Only older accounts need this. New accounts that already met the strong-password signup rule will
                  show this step as complete automatically.
                </div>

                <form onSubmit={handlePasswordUpgrade} className={styles.form}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Current password</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      className={styles.input}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>New strong password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className={styles.input}
                      minLength={6}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Confirm new password</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className={styles.input}
                      minLength={6}
                      required
                    />
                  </label>

                  <div className={styles.checklist}>
                    <strong>Strong password checklist</strong>
                    <div className={styles.checklistRows}>
                      {passwordRequirements.map((requirement) => (
                        <div
                          key={requirement.key}
                          className={`${styles.checklistItem} ${requirement.met ? styles.checkMet : styles.checkPending}`}
                        >
                          {requirement.met ? "Pass" : "Needs work"}: {requirement.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button disabled={passwordBusy || !passwordCheck.isStrong} className={styles.button}>
                    {passwordBusy ? "Saving password..." : "Save stronger password"}
                  </button>
                </form>
              </div>
            ) : null}

            <div className={styles.sectionCard}>
              <div className={styles.sectionTitle}>{hardeningComplete ? "Continue into the student route" : "Finish the required steps first"}</div>
              <div className={styles.sectionBody}>
                {hardeningComplete
                  ? "Your required onboarding security steps are complete, so you can continue into the next student page now."
                  : "Once verification and password requirements are complete, this page will let you continue cleanly into the route you were heading toward."}
              </div>
              <div className={styles.footerActions}>
                {hardeningComplete ? (
                  <button type="button" onClick={() => router.push(nextPath)} className={styles.button}>
                    Continue
                  </button>
                ) : null}
                <Link href={nextPath} className={styles.linkButton}>
                  Back
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.sideColumn}>
            <div className={styles.sectionCard}>
              <p className={styles.sideCardLabel}>What opens next</p>
              <h2 className={styles.sideCardTitle}>The onboarding handoff should feel predictable.</h2>
              <p className={styles.sideCardBody}>
                After this page, students should be able to continue into the route they asked for without wondering
                whether signup worked, whether the email step counted, or where to click next.
              </p>
              <div className={styles.sideList}>
                <div className={styles.sideListItem}>Verification state stays visible here instead of hiding in email guesswork.</div>
                <div className={styles.sideListItem}>The requested destination is preserved, so students continue into the page they meant to open.</div>
                <div className={styles.sideListItem}>Password hardening happens once and does not keep interrupting newer accounts.</div>
              </div>
            </div>

            <div className={styles.sectionCard}>
              <p className={styles.sideCardLabel}>Extra protection</p>
              <h2 className={styles.sideCardTitle}>2-factor authentication is still the best optional next step.</h2>
              <p className={styles.sideCardBody}>
                {factorCount > 0
                  ? `This browser session can already see ${factorCount} enrolled second factor${factorCount === 1 ? "" : "s"}.`
                  : "When you are ready, add 2-factor authentication in your sign-in provider settings for extra protection."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
