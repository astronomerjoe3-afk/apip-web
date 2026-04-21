"use client";

import Link from "next/link";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "./settings.module.css";
import { apipGet, apipPatch, apipPost } from "@/lib/apipApi";
import { securityActionLabel } from "@/lib/accountSecurity";
import { useAuth } from "@/lib/auth";
import { readSessionUser, signOutEverywhere, type SessionUser } from "@/lib/sessionClient";

type ProfileResponse = {
  ok: boolean;
  uid: string;
  email?: string | null;
  display_name?: string | null;
  email_verified?: boolean | null;
  role: SessionUser["role"];
  security?: SessionUser["security"];
  utc: string;
};

type DeleteResponse = {
  ok: boolean;
  deleted: {
    firebase_auth_deleted?: boolean;
    profile_documents_deleted?: number;
    progress_documents_deleted?: number;
    progress_events_deleted?: number;
    help_requests_deleted?: number;
    sessions_deleted?: number;
    retained_records?: string[];
  };
  utc: string;
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong.";
}

function mapProfileResponse(payload: ProfileResponse | SessionUser | null): SessionUser | null {
  if (!payload) {
    return null;
  }

  return {
    uid: payload.uid,
    email: payload.email ?? null,
    display_name: "display_name" in payload ? payload.display_name ?? null : null,
    email_verified: payload.email_verified ?? null,
    role: payload.role,
    security: payload.security ?? null,
  };
}

export default function StudentSettingsPage() {
  const router = useRouter();
  const { user, sessionUser: authSessionUser, authenticated, loading } = useAuth();

  const [profile, setProfile] = useState<SessionUser | null>(authSessionUser);
  const [displayName, setDisplayName] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [saveBusy, setSaveBusy] = useState<boolean>(false);
  const [signOutBusy, setSignOutBusy] = useState<boolean>(false);
  const [deleteBusy, setDeleteBusy] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile(): Promise<void> {
      if (loading) {
        return;
      }

      if (!authenticated) {
        router.replace("/login?next=/student/settings");
        return;
      }

      try {
        const apiProfile = await apipGet<ProfileResponse>("/profile");
        if (cancelled) {
          return;
        }
        const mappedProfile = mapProfileResponse(apiProfile);
        setProfile(mappedProfile);
        setDisplayName(mappedProfile?.display_name || "");
      } catch {
        const fallbackProfile = mapProfileResponse(await readSessionUser());
        if (cancelled) {
          return;
        }
        setProfile(fallbackProfile || authSessionUser || null);
        setDisplayName(fallbackProfile?.display_name || authSessionUser?.display_name || "");
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authSessionUser, authenticated, loading, router]);

  const recommendedActions = profile?.security?.recommended_actions || [];
  const accountLabel = useMemo(() => {
    return profile?.display_name || user?.displayName || profile?.email || user?.email || "Student";
  }, [profile?.display_name, profile?.email, user?.displayName, user?.email]);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr("");
    setStatus("");

    const nextDisplayName = displayName.trim();
    if (nextDisplayName.length < 2) {
      setErr("Enter a display name with at least 2 characters.");
      return;
    }

    setSaveBusy(true);
    try {
      const response = await apipPatch<ProfileResponse, { display_name: string }>("/profile", {
        display_name: nextDisplayName,
      });

      if (user) {
        await updateFirebaseProfile(user, { displayName: nextDisplayName }).catch(() => undefined);
      }

      const updatedProfile = mapProfileResponse(response);
      setProfile(updatedProfile);
      setDisplayName(updatedProfile?.display_name || nextDisplayName);
      setStatus("Profile updated.");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setSaveBusy(false);
    }
  }

  async function handleSignOut(): Promise<void> {
    setErr("");
    setStatus("");
    setSignOutBusy(true);

    try {
      await signOutEverywhere();
      router.replace("/login?next=/student");
    } catch (error: unknown) {
      setErr(errorMessage(error));
      setSignOutBusy(false);
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErr("");
    setStatus("");

    if (deleteConfirm.trim().toUpperCase() !== "DELETE") {
      setErr('Type "DELETE" to confirm account deletion.');
      return;
    }

    setDeleteBusy(true);
    try {
      const response = await apipPost<DeleteResponse, { confirm_text: string }>("/profile/delete", {
        confirm_text: deleteConfirm.trim(),
      });
      setStatus(
        `Account deletion completed. Progress removed: ${response.deleted.progress_documents_deleted || 0} documents. Signing you out now...`,
      );
      await signOutEverywhere().catch(() => undefined);
      setTimeout(() => {
        router.replace("/");
      }, 700);
    } catch (error: unknown) {
      setErr(errorMessage(error));
      setDeleteBusy(false);
      return;
    }

    setDeleteBusy(false);
  }

  if (loading || pageLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Student settings</p>
          <h1 className={styles.title}>Loading your account tools.</h1>
          <p className={styles.lead}>Checking profile details, security status, and the account actions available for this session.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Student settings</p>
          <h1 className={styles.title}>Account controls now live inside Cognispark.</h1>
          <p className={styles.lead}>
            Update your name, review security guidance, sign out from the correct place, and delete your account without leaving the app.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <div className={styles.heroMetaLabel}>Signed in as</div>
          <div className={styles.heroMetaValue}>{accountLabel}</div>
          <div className={styles.heroMetaSubtle}>{profile?.email || "No email available"}</div>
        </div>
      </section>

      {status ? (
        <div className={styles.statusSuccess}>{status}</div>
      ) : null}

      {err ? (
        <div className={styles.statusError}>{err}</div>
      ) : null}

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Profile</p>
              <h2>Edit your profile</h2>
            </div>
            <span className={styles.cardTag}>{profile?.role || "student"}</span>
          </div>

          <form className={styles.form} onSubmit={(event) => void handleProfileSave(event)}>
            <label className={styles.field}>
              <span>Display name</span>
              <input
                className={styles.input}
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={120}
                placeholder="How your name should appear in the app"
              />
            </label>

            <label className={styles.field}>
              <span>Email address</span>
              <input className={styles.inputMuted} type="text" value={profile?.email || ""} readOnly />
            </label>

            <button className={styles.primaryButton} disabled={saveBusy} type="submit">
              {saveBusy ? "Saving profile..." : "Save profile"}
            </button>
          </form>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Security</p>
              <h2>Keep access protected</h2>
            </div>
            <span className={styles.cardTag}>
              {profile?.security?.hardening_complete ? "Ready" : "Action needed"}
            </span>
          </div>

          <div className={styles.securityList}>
            <div className={styles.securityRow}>
              <strong>Email verification</strong>
              <span>{profile?.security?.email_verified ? "Verified" : "Still needed"}</span>
            </div>
            <div className={styles.securityRow}>
              <strong>Strong password</strong>
              <span>{profile?.security?.strong_password_confirmed ? "Recorded" : "Still needed"}</span>
            </div>
            <div className={styles.securityRow}>
              <strong>Recommended next step</strong>
              <span>
                {recommendedActions.length > 0
                  ? recommendedActions.map((action) => securityActionLabel(action)).join(", ")
                  : "No urgent action"}
              </span>
            </div>
          </div>

          <div className={styles.cardActions}>
            <Link className={styles.secondaryButton} href="/student/security?next=/student/settings">
              Open security page
            </Link>
            <Link className={styles.textLink} href="/student">
              Back to modules
            </Link>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Session</p>
              <h2>Sign out from the right place</h2>
            </div>
          </div>

          <p className={styles.bodyCopy}>
            PrimeTestLab flagged the home-page logout placement. Sign-out now lives here so the learning flow stays focused on modules and lessons.
          </p>

          <div className={styles.cardActions}>
            <button className={styles.secondaryButton} disabled={signOutBusy} onClick={() => void handleSignOut()} type="button">
              {signOutBusy ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </article>

        <article className={`${styles.card} ${styles.dangerCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardLabel}>Delete account</p>
              <h2>Delete your account in-app</h2>
            </div>
            <span className={styles.cardTag}>High impact</span>
          </div>

          <p className={styles.bodyCopy}>
            This removes your sign-in access, student progress, help requests, and app profile data. Billing, security, and audit records may still be retained where legally required.
          </p>

          <form className={styles.form} onSubmit={(event) => void handleDeleteAccount(event)}>
            <label className={styles.field}>
              <span>Type DELETE to confirm</span>
              <input
                className={styles.input}
                type="text"
                value={deleteConfirm}
                onChange={(event) => setDeleteConfirm(event.target.value)}
                placeholder="DELETE"
              />
            </label>

            <button className={styles.dangerButton} disabled={deleteBusy} type="submit">
              {deleteBusy ? "Deleting account..." : "Delete account"}
            </button>
          </form>

          <Link className={styles.textLink} href="/delete-account">
            View the public deletion policy
          </Link>
        </article>
      </section>
    </main>
  );
}
