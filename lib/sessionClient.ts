"use client";

import { signOut, type User } from "firebase/auth";

import { auth } from "./firebase";

export type SessionRole = "student" | "instructor" | "admin" | "unknown";

export type SessionUser = {
  uid: string;
  email?: string | null;
  email_verified?: boolean | null;
  role: SessionRole;
};

type SessionResponse = {
  ok?: boolean;
  user?: SessionUser;
};

type SessionLoginResponse = SessionResponse & {
  expires_utc?: string;
};

function normalizeRole(value: unknown): SessionRole {
  if (value === "student" || value === "instructor" || value === "admin" || value === "unknown") {
    return value;
  }
  return "unknown";
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
    email_verified: typeof user.email_verified === "boolean" ? user.email_verified : null,
    role: normalizeRole(user.role),
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

export async function signOutEverywhere(): Promise<void> {
  await clearServerSession().catch(() => undefined);
  await signOut(auth);
}
