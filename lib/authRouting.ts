"use client";

import { type User } from "firebase/auth";
import { establishSessionFromUser, readSessionUser } from "./sessionClient";

export type Role =
  | "student"
  | "teacher"
  | "institution_admin"
  | "academic_lead"
  | "instructor"
  | "admin"
  | "unknown";

const VALID_ROLES = new Set<Role>([
  "student",
  "teacher",
  "institution_admin",
  "academic_lead",
  "instructor",
  "admin",
  "unknown",
]);

const DISALLOWED_POST_AUTH_PREFIXES = [
  "/login",
  "/register",
];

export function isAcademicLeadRole(role: Role | null | undefined): boolean {
  return role === "academic_lead" || role === "instructor";
}

export function isInstitutionStaffRole(role: Role | null | undefined): boolean {
  return role === "teacher" || role === "institution_admin";
}

export function isPrivilegedRole(role: Role | null | undefined): boolean {
  return role === "admin" || isAcademicLeadRole(role) || isInstitutionStaffRole(role);
}

export function roleDisplayName(role: Role | null | undefined): string {
  if (role === "academic_lead" || role === "instructor") {
    return "Academic Lead";
  }
  if (role === "institution_admin") {
    return "Institution Admin";
  }
  if (role === "teacher") {
    return "Teacher";
  }
  if (role === "student") {
    return "Student";
  }
  if (role === "admin") {
    return "Admin";
  }
  return "Unknown";
}

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

function sanitizePostAuthPath(value: string | null | undefined): string | null {
  const nextPath = sanitizeNextPath(value);
  if (!nextPath) {
    return null;
  }

  if (DISALLOWED_POST_AUTH_PREFIXES.some((prefix) => nextPath === prefix || nextPath.startsWith(`${prefix}?`))) {
    return null;
  }

  return nextPath;
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

  if (isAcademicLeadRole(role)) {
    return "/instructor";
  }

  if (isInstitutionStaffRole(role)) {
    return "/institution";
  }

  return "/student";
}

export function resolvePostAuthPath(role: Role, nextPath?: string | null): string {
  return sanitizePostAuthPath(nextPath) || landingPathForRole(role);
}
