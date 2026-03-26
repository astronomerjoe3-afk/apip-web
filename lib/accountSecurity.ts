"use client";

import type { SessionUser } from "./sessionClient";


export const MIN_PASSWORD_LENGTH = 12;
export const MIN_PASSWORD_POLICY_VERSION = 1;

const COMMON_PASSWORD_SNIPPETS = [
  "password",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "123456",
];

export type PasswordStrengthCheck = {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  avoidsEmailWords: boolean;
  avoidsCommonPatterns: boolean;
  score: number;
  isStrong: boolean;
};

type BillingLike = {
  has_active_subscription?: boolean;
  purchased_module_ids?: string[];
} | null;

type ModuleLike = {
  access?: {
    tier?: string;
    is_unlocked?: boolean;
  };
};

function emailTokens(email?: string | null): string[] {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized.includes("@")) {
    return [];
  }

  const localPart = normalized.split("@")[0] || "";
  return localPart
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

export function evaluatePasswordStrength(password: string, email?: string | null): PasswordStrengthCheck {
  const value = String(password || "");
  const lowered = value.toLowerCase();
  const tokens = emailTokens(email);

  const minLength = value.length >= MIN_PASSWORD_LENGTH;
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasDigit = /\d/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const avoidsEmailWords = tokens.every((token) => !lowered.includes(token));
  const avoidsCommonPatterns = COMMON_PASSWORD_SNIPPETS.every(
    (snippet) => !lowered.includes(snippet),
  );

  const score = [
    minLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSymbol,
    avoidsEmailWords,
    avoidsCommonPatterns,
  ].filter(Boolean).length;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSymbol,
    avoidsEmailWords,
    avoidsCommonPatterns,
    score,
    isStrong:
      minLength &&
      hasUppercase &&
      hasLowercase &&
      hasDigit &&
      hasSymbol &&
      avoidsEmailWords &&
      avoidsCommonPatterns,
  };
}

export function passwordRequirementRows(check: PasswordStrengthCheck): Array<{
  key: string;
  label: string;
  met: boolean;
}> {
  return [
    {
      key: "length",
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: check.minLength,
    },
    {
      key: "upper",
      label: "At least one uppercase letter",
      met: check.hasUppercase,
    },
    {
      key: "lower",
      label: "At least one lowercase letter",
      met: check.hasLowercase,
    },
    {
      key: "digit",
      label: "At least one number",
      met: check.hasDigit,
    },
    {
      key: "symbol",
      label: "At least one symbol",
      met: check.hasSymbol,
    },
    {
      key: "email",
      label: "Does not include your email name",
      met: check.avoidsEmailWords,
    },
    {
      key: "common",
      label: "Avoids common patterns like password or 123456",
      met: check.avoidsCommonPatterns,
    },
  ];
}

export function paidAccessRequiresSecurityUpgrade(
  sessionUser: SessionUser | null,
  billingSummary: BillingLike,
  modules: ModuleLike[] = [],
): boolean {
  const hasSubscription = billingSummary?.has_active_subscription === true;
  const hasPurchasedModule = Array.isArray(billingSummary?.purchased_module_ids)
    && billingSummary.purchased_module_ids.length > 0;
  const hasUnlockedPremiumModule = modules.some(
    (moduleItem) =>
      moduleItem.access?.tier === "premium" && moduleItem.access?.is_unlocked === true,
  );

  const hasPaidAccess = hasSubscription || hasPurchasedModule || hasUnlockedPremiumModule;
  return hasPaidAccess && sessionUser?.security?.hardening_complete !== true;
}

export function securityActionLabel(action: string): string {
  switch (action) {
    case "upgrade_password":
      return "Set or confirm a strong password";
    case "verify_email":
      return "Verify your email address";
    case "enable_2fa":
      return "Enable 2-factor authentication";
    default:
      return action.replace(/[_-]+/g, " ");
  }
}
