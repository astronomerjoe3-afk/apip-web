"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
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

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Security update failed";
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

  const passwordCheck = useMemo(
    () => evaluatePasswordStrength(newPassword, user?.email || sessionUser?.email || ""),
    [newPassword, sessionUser?.email, user?.email],
  );
  const passwordRequirements = useMemo(
    () => passwordRequirementRows(passwordCheck),
    [passwordCheck],
  );

  const refreshSecurityState = useCallback(async (currentUser = user): Promise<void> => {
    if (!currentUser) {
      setSessionUser(null);
      setPageLoading(false);
      return;
    }

    await currentUser.reload();
    const refreshedSession = await establishSessionFromUser(currentUser);
    const resolvedRole = await getClientRole(currentUser);
    if (resolvedRole !== "student") {
      router.replace(landingPathForRole(resolvedRole));
      return;
    }

    setSessionUser(refreshedSession);
    setFactorCount(multiFactor(currentUser).enrolledFactors.length);
    setPageLoading(false);
  }, [router, user]);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      if (loading) {
        return;
      }

      if (!user) {
        const nextLoginPath = `/student/security?next=${encodeURIComponent(nextPath)}`;
        router.replace(`/login?next=${encodeURIComponent(nextLoginPath)}`);
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
  }, [loading, nextPath, refreshSecurityState, router, user]);

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
      await refreshSecurityState(user);
      setStatus(
        user.emailVerified || sessionUser?.security?.email_verified
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
      <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 820, margin: "0 auto" }}>
        <h1>Secure your account</h1>
        <p>Checking your current security status...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 860, margin: "0 auto", display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ marginBottom: 8 }}>Secure your paid access</h1>
        <p style={{ margin: 0, opacity: 0.82, lineHeight: 1.6 }}>
          Premium access is protected behind a stronger account baseline. If you already created this account with the new strong-password rule, you will not be asked to replace that password again.
        </p>
      </div>

      {err ? (
        <div style={{ border: "1px solid #991b1b", borderRadius: 12, padding: 12, background: "#fef2f2", color: "#991b1b" }}>
          <strong>Error:</strong> {err}
        </div>
      ) : null}

      {status ? (
        <div style={{ border: "1px solid #14532d", borderRadius: 12, padding: 12, background: "#f0fdf4", color: "#166534" }}>
          {status}
        </div>
      ) : null}

      <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 16, padding: 16, background: "#ffffff" }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
          Current status
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ color: emailVerified ? "#166534" : "#334155", fontWeight: emailVerified ? 700 : 500 }}>
            {emailVerified ? "Ready" : "Needed"}: Verify your email address
          </div>
          <div style={{ color: strongPasswordConfirmed ? "#166534" : "#334155", fontWeight: strongPasswordConfirmed ? 700 : 500 }}>
            {strongPasswordConfirmed ? "Ready" : "Needed"}: Strong password recorded for this account
          </div>
          <div style={{ color: factorCount > 0 ? "#166534" : "#334155", fontWeight: factorCount > 0 ? 700 : 500 }}>
            {factorCount > 0 ? "Enabled" : "Recommended"}: 2-factor authentication
          </div>
        </div>
        {recommendedActions.length > 0 ? (
          <div style={{ marginTop: 12, opacity: 0.82, lineHeight: 1.6 }}>
            Next focus: {recommendedActions.map((action) => securityActionLabel(action)).join(", ")}.
          </div>
        ) : (
          <div style={{ marginTop: 12, color: "#166534", fontWeight: 700 }}>
            This account is already hardened enough for paid access.
          </div>
        )}
      </div>

      {!emailVerified ? (
        <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 16, padding: 16, background: "#ffffff", display: "grid", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Step 1: Verify your email</div>
          <div style={{ opacity: 0.82, lineHeight: 1.6 }}>
            A verified email gives you a recovery path and makes subscription or module access easier to protect.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => void handleSendVerification()}
              disabled={verifyBusy}
              style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(15, 23, 42, 0.14)", fontWeight: 800 }}
            >
              {verifyBusy ? "Sending email..." : "Send verification email"}
            </button>
            <button
              onClick={() => void handleRefreshVerification()}
              disabled={refreshBusy}
              style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(15, 23, 42, 0.14)", fontWeight: 800 }}
            >
              {refreshBusy ? "Refreshing..." : "I have verified, refresh now"}
            </button>
          </div>
        </div>
      ) : null}

      {!strongPasswordConfirmed ? (
        <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 16, padding: 16, background: "#ffffff", display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Step 2: Confirm a strong password</div>
            <div style={{ opacity: 0.82, lineHeight: 1.6 }}>
              Only older accounts need this. New accounts that already met the strong-password signup rule will show this step as complete automatically.
            </div>
          </div>

          <form onSubmit={handlePasswordUpgrade} style={{ display: "grid", gap: 12 }}>
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
                required
              />
            </label>

            <label>
              New strong password
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
                minLength={12}
                required
              />
            </label>

            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                style={{ width: "100%", padding: 10, marginTop: 6 }}
                minLength={12}
                required
              />
            </label>

            <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Strong password checklist</div>
              <div style={{ display: "grid", gap: 6 }}>
                {passwordRequirements.map((requirement) => (
                  <div
                    key={requirement.key}
                    style={{
                      color: requirement.met ? "#166534" : "#475569",
                      fontWeight: requirement.met ? 700 : 500,
                      fontSize: 14,
                    }}
                  >
                    {requirement.met ? "Pass" : "Needs work"}: {requirement.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={passwordBusy || !passwordCheck.isStrong}
              style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(15, 23, 42, 0.14)", fontWeight: 800 }}
            >
              {passwordBusy ? "Saving password..." : "Save stronger password"}
            </button>
          </form>
        </div>
      ) : null}

      <div style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 16, padding: 16, background: "#ffffff", display: "grid", gap: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Recommended next step: 2-factor authentication</div>
        <div style={{ opacity: 0.82, lineHeight: 1.6 }}>
          {factorCount > 0
            ? `This browser session can already see ${factorCount} enrolled second factor${factorCount === 1 ? "" : "s"}.`
            : "Once your required steps are done, add 2-factor authentication in your sign-in provider settings for stronger protection on paid access."}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {hardeningComplete ? (
          <button
            onClick={() => router.push(nextPath)}
            style={{ padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(15, 23, 42, 0.14)", fontWeight: 800 }}
          >
            Continue to paid access
          </button>
        ) : null}
        <Link href={nextPath} style={{ alignSelf: "center", color: "#0f172a", fontWeight: 700 }}>
          Back
        </Link>
      </div>
    </main>
  );
}
