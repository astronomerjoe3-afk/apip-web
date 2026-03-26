"use client";

import { type User } from "firebase/auth";
import { establishSessionFromUser, readSessionUser } from "./sessionClient";

export type Role = "student" | "instructor" | "admin" | "unknown";

const VALID_ROLES = new Set<Role>(["student", "instructor", "admin", "unknown"]);

export function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

export async function getClientRole(user: User): Promise<Role> {
  try {
    const sessionUser = await readSessionUser();
    if (sessionUser && VALID_ROLES.has(sessionUser.role as Role)) {
      return sessionUser.role as Role;
    }
  } catch {
    // Fall through and try to bootstrap the server session once.
  }

  try {
    const sessionUser = await establishSessionFromUser(user);
    if (VALID_ROLES.has(sessionUser.role as Role)) {
      return sessionUser.role as Role;
    }
  } catch {
    // Return unknown if the server session cannot be established.
  }

  return "unknown";
}

export function landingPathForRole(role: Role): string {
  if (role === "admin") {
    return "/dashboard";
  }

  if (role === "instructor") {
    return "/instructor";
  }

  return "/student";
}

export function resolvePostAuthPath(role: Role, nextPath?: string | null): string {
  return sanitizeNextPath(nextPath) || landingPathForRole(role);
}
