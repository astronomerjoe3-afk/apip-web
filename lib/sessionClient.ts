"use client";

import type { User } from "firebase/auth";
import { BFF_PREFIX } from "./sessionConstants";

export type SessionRole =
  | "student"
  | "teacher"
  | "institution_admin"
  | "academic_lead"
  | "instructor"
  | "admin"
  | "unknown";

export type SessionSecurity = {
  password_policy_version: number;
  password_policy_target_version: number;
  strong_password_confirmed: boolean;
  strong_password_confirmed_utc?: string | null;
  email_verified: boolean;
  email_verified_utc?: string | null;
  hardening_complete: boolean;
  recommended_actions: string[];
  recommended_next_step?: string | null;
};

export type SessionUser = {
  uid: string;
  email?: string | null;
  display_name?: string | null;
  email_verified?: boolean | null;
  role: SessionRole;
  security?: SessionSecurity | null;
};

type SessionResponse = {
  ok?: boolean;
  user?: SessionUser;
};

type SessionLoginResponse = SessionResponse & {
  expires_utc?: string;
};

type PasswordPolicyResponse = {
  ok?: boolean;
  security?: SessionSecurity;
};

function normalizeRole(value: unknown): SessionRole {
  if (
    value === "student"
    || value === "teacher"
    || value === "institution_admin"
    || value === "academic_lead"
    || value === "instructor"
    || value === "admin"
    || value === "unknown"
  ) {
    return value;
  }
  return "unknown";
}

function normalizeSessionSecurity(payload: unknown): SessionSecurity | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const security = payload as Record<string, unknown>;
  const recommendedActions = Array.isArray(security.recommended_actions)
    ? security.recommended_actions.filter((value): value is string => typeof value === "string")
    : [];

  return {
    password_policy_version:
      typeof security.password_policy_version === "number"
        ? security.password_policy_version
        : 0,
    password_policy_target_version:
      typeof security.password_policy_target_version === "number"
        ? security.password_policy_target_version
        : 1,
    strong_password_confirmed: security.strong_password_confirmed === true,
    strong_password_confirmed_utc:
      typeof security.strong_password_confirmed_utc === "string"
        ? security.strong_password_confirmed_utc
        : null,
    email_verified: security.email_verified === true,
    email_verified_utc:
      typeof security.email_verified_utc === "string"
        ? security.email_verified_utc
        : null,
    hardening_complete: security.hardening_complete === true,
    recommended_actions: recommendedActions,
    recommended_next_step:
      typeof security.recommended_next_step === "string"
        ? security.recommended_next_step
        : null,
  };
}

function normalizeSessionUser(payload: unknown): SessionUser | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const user = payload as Record<string, unknown>;
  const uid = typeof user.uid === "string" ? user.uid : "";
  if (!uid) {
    return null;
  }

  return {
    uid,
    email: typeof user.email === "string" ? user.email : null,
    display_name: typeof user.display_name === "string" ? user.display_name : null,
    email_verified: typeof user.email_verified === "boolean" ? user.email_verified : null,
    role: normalizeRole(user.role),
    security: normalizeSessionSecurity(user.security),
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`Expected JSON response, received ${contentType || "unknown content type"}.`);
  }
  return (await response.json()) as T;
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  try {
    const payload = await readJson<{ detail?: string }>(response);
    throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed with status ${response.status}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Request failed with status ${response.status}`);
  }
}

export async function establishSessionFromUser(user: User): Promise<SessionUser> {
  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ idToken }),
    cache: "no-store",
    credentials: "same-origin",
  });

  await throwIfNotOk(response);
  const payload = await readJson<SessionLoginResponse>(response);
  const sessionUser = normalizeSessionUser(payload.user);
  if (!sessionUser) {
    throw new Error("Session bootstrap did not return a user.");
  }
  return sessionUser;
}

export async function readSessionUser(): Promise<SessionUser | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 401) {
    return null;
  }

  await throwIfNotOk(response);
  const payload = await readJson<SessionResponse>(response);
  return normalizeSessionUser(payload.user);
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
    headers: { Accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
  });
}

export async function recordStrongPasswordPolicy(passwordPolicyVersion: number): Promise<SessionSecurity | null> {
  const response = await fetch(`${BFF_PREFIX}/auth/security/password-policy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ password_policy_version: passwordPolicyVersion }),
    cache: "no-store",
    credentials: "same-origin",
  });

  await throwIfNotOk(response);
  const payload = await readJson<PasswordPolicyResponse>(response);
  return normalizeSessionSecurity(payload.security);
}

export async function signOutEverywhere(): Promise<void> {
  await clearServerSession().catch(() => undefined);
  const [{ signOut }, firebaseModule] = await Promise.all([
    import("firebase/auth"),
    import("./firebase"),
  ]);

  if (firebaseModule.maybeAuth) {
    await signOut(firebaseModule.maybeAuth);
  }
}
