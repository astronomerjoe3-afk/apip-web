"use client";

import { getIdTokenResult, type User } from "firebase/auth";

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
    const tokenResult = await getIdTokenResult(user, true);
    const claim = tokenResult.claims?.role;

    if (typeof claim === "string" && VALID_ROLES.has(claim as Role)) {
      return claim as Role;
    }

    return "student";
  } catch {
    return "unknown";
  }
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
