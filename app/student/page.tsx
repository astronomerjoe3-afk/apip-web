"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { apipGet, apipPost } from "../../lib/apipApi";
import { paidAccessRequiresSecurityUpgrade, securityActionLabel } from "../../lib/accountSecurity";
import { useAuth } from "../../lib/auth";
import { getClientRole, isAcademicLeadRole, isInstitutionStaffRole, type Role } from "../../lib/authRouting";
import { applyCurriculumModuleMeta } from "../../lib/moduleCurriculum";
import { readSessionUser, signOutEverywhere, type SessionUser } from "../../lib/sessionClient";
import StudentHelpCard from "../../components/StudentHelpCard";

type PricingOffer = {
  id?: string;
  title?: string;
  price_label?: string;
  billing_label?: string;
  effective_monthly_label?: string;
  description?: string;
};

type ModuleAccess = {
  tier?: "free" | "premium" | string;
  is_unlocked?: boolean;
  unlock_reason?: string;
  message?: string;
  module_purchase?: PricingOffer | null;
  subscription_plans?: PricingOffer[];
};

type Module = {
  id: string;
  title?: string;
  description?: string;
  estimated_minutes?: number;
  level?: string;
  access_tier?: string;
  access?: ModuleAccess;
};

type ModulesResponse = {
  ok: boolean;
  modules: Module[];
};

type BillingSummary = {
  configured?: boolean;
  portal_enabled?: boolean;
  has_active_subscription?: boolean;
  active_subscription_plan_id?: string | null;
  can_checkout?: boolean;
  subscription?: {
    plan_id?: string | null;
    ends_utc?: string | null;
  } | null;
};

type BillingSummaryResponse = {
  ok: boolean;
  billing: BillingSummary;
};

type InstitutionalSubmissionSummary = {
  id: string;
  status: string;
  score?: number | null;
  feedback?: string | null;
  submitted_utc?: string | null;
};

type InstitutionalAssignment = {
  id: string;
  class_id: string;
  class_name: string;
  title: string;
  assignment_type: string;
  instructions: string;
  due_utc?: string | null;
  grading_mode: string;
  resource_module_ids: string[];
  your_submission?: InstitutionalSubmissionSummary | null;
};

type InstitutionalClass = {
  id: string;
  name: string;
  join_code?: string | null;
  teacher_names: string[];
  assignments: InstitutionalAssignment[];
};

type InstitutionalDiscussion = {
  id: string;
  scope: string;
  title: string;
  body: string;
  module_id?: string | null;
};

type InstitutionalBlock = {
  institution: {
    id: string;
    name: string;
    public_community_enabled: boolean;
  };
  classes: InstitutionalClass[];
};

type InstitutionalWorkspaceResponse = {
  ok: boolean;
  viewer: {
    can_access_public_topics: boolean;
  };
  public_topic_discussions: InstitutionalDiscussion[];
  institutions: InstitutionalBlock[];
};

type CheckoutSessionResponse = {
  ok: boolean;
  checkout_url?: string;
  session_id?: string;
};

type ModuleGroupKey = "foundation" | "corePhysics" | "advancedPhysics";

type ModuleSection = {
  key: ModuleGroupKey;
  title: string;
  description: string;
  modules: Module[];
};

const MODULE_SECTION_ORDER: Array<Omit<ModuleSection, "modules">> = [
  {
    key: "foundation",
    title: "Foundation",
    description: "Measurement, motion, forces, energy, and the first physics relationships students build from.",
  },
  {
    key: "corePhysics",
    title: "Core Physics",
    description: "The main physics sequence that extends the foundations into broader systems and applications.",
  },
  {
    key: "advancedPhysics",
    title: "Advanced Physics",
    description: "Higher-level topics that build on the full core sequence.",
  },
];

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

async function getRole(user: User): Promise<Role> {
  return getClientRole(user);
}

function moduleBadge(moduleItem: Module): { label: string; background: string; color: string } {
  const locked = moduleItem.access?.tier === "premium" && moduleItem.access?.is_unlocked === false;
  if (moduleItem.access?.tier === "premium") {
    return locked
      ? { label: "Premium locked", background: "#fef3c7", color: "#92400e" }
      : { label: "Premium unlocked", background: "#dcfce7", color: "#166534" };
  }

  return { label: "Free module", background: "#dbeafe", color: "#1d4ed8" };
}

function moduleGroupKey(moduleId?: string): ModuleGroupKey {
  const normalized = String(moduleId || "").trim().toUpperCase();
  if (normalized.startsWith("F")) return "foundation";
  if (normalized.startsWith("A")) return "advancedPhysics";
  return "corePhysics";
}

function moduleOrderValue(moduleId?: string): number {
  const match = String(moduleId || "").trim().toUpperCase().match(/^[A-Z]+(\d+)$/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]);
}

function compareModules(left: Module, right: Module): number {
  const orderDifference = moduleOrderValue(left.id) - moduleOrderValue(right.id);
  if (orderDifference !== 0) return orderDifference;
  return String(left.id || "").localeCompare(String(right.id || ""));
}

function planRank(planId?: string | null): number {
  switch (String(planId || "")) {
    case "premium_monthly":
      return 1;
    case "premium_six_month":
      return 2;
    case "premium_yearly":
      return 3;
    default:
      return 0;
  }
}

function planDisplayName(planId?: string | null): string {
  switch (String(planId || "")) {
    case "premium_monthly":
      return "Premium monthly";
    case "premium_six_month":
      return "Premium 6 months";
    case "premium_yearly":
      return "Premium yearly";
    default:
      return "Premium subscription";
  }
}

function subscriptionPlanAction(targetPlanId?: string | null, currentPlanId?: string | null): "subscribe" | "upgrade" | "manage" {
  if (!currentPlanId) {
    return "subscribe";
  }

  if (!targetPlanId || targetPlanId === currentPlanId) {
    return "manage";
  }

  return planRank(targetPlanId) > planRank(currentPlanId) ? "upgrade" : "manage";
}

function subscriptionActionLabel(plan: PricingOffer, currentPlanId?: string | null): string {
  const action = subscriptionPlanAction(plan.id, currentPlanId);
  if (action === "upgrade") {
    return "Upgrade to " + (plan.title || "premium");
  }
  if (action === "manage") {
    return "Manage subscription";
  }
  return "Subscribe to " + (plan.title || "premium");
}

export default function StudentHomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [role, setRole] = useState<Role>("unknown");
  const [roleLoading, setRoleLoading] = useState<boolean>(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);

  const [modules, setModules] = useState<Module[]>([]);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [billingBusy, setBillingBusy] = useState<string>("");
  const [modulesLoading, setModulesLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [institutionWorkspace, setInstitutionWorkspace] = useState<InstitutionalWorkspaceResponse | null>(null);
  const [institutionBusy, setInstitutionBusy] = useState<string>("");
  const [communityDialogOpen, setCommunityDialogOpen] = useState<boolean>(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState<boolean>(false);
  const [submissionForm, setSubmissionForm] = useState({
    assignment_id: "",
    text_response: "",
    link_url: "",
  });
  const [discussionForm, setDiscussionForm] = useState({
    scope: "public_topic",
    class_id: "",
    module_id: "",
    title: "",
    body: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function resolveRole(): Promise<void> {
      if (loading) return;

      if (!user) {
        if (!cancelled) {
          setRole("unknown");
          setRoleLoading(false);
          router.replace("/login?next=/student");
        }
        return;
      }

      const resolvedRole = await getRole(user);
      if (cancelled) return;

      setRole(resolvedRole);
      setRoleLoading(false);

      if (isAcademicLeadRole(resolvedRole)) {
        router.replace("/instructor");
        return;
      }

      if (isInstitutionStaffRole(resolvedRole)) {
        router.replace("/institution");
        return;
      }

      if (resolvedRole === "admin") {
        router.replace("/dashboard");
        return;
      }

      if (resolvedRole !== "student") {
        router.replace("/login?next=/student");
      }
    }

    void resolveRole();

    return () => {
      cancelled = true;
    };
  }, [loading, router, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadModules(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") return;

      setModulesLoading(true);

      try {
        setErr("");
        const data = await apipGet<ModulesResponse>("/modules");
        if (cancelled) return;
        setModules(
          Array.isArray(data.modules)
            ? data.modules.map((moduleItem) => applyCurriculumModuleMeta(moduleItem))
            : [],
        );
      } catch (error: unknown) {
        if (cancelled) return;
        setErr(errorMessage(error));
        setModules([]);
      } finally {
        if (!cancelled) {
          setModulesLoading(false);
        }
      }
    }

    void loadModules();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingSummary(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") return;
      try {
        const data = await apipGet<BillingSummaryResponse>("/billing/summary");
        if (!cancelled) setBillingSummary(data.billing || null);
      } catch {}
    }

    void loadBillingSummary();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadSessionState(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") {
        if (!cancelled) {
          setSessionUser(null);
          setSessionLoading(false);
        }
        return;
      }

      try {
        const currentSessionUser = await readSessionUser();
        if (!cancelled) {
          setSessionUser(currentSessionUser);
        }
      } catch {
        if (!cancelled) {
          setSessionUser(null);
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
        }
      }
    }

    void loadSessionState();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadInstitutionWorkspace(): Promise<void> {
      if (loading || roleLoading) return;
      if (!user || role !== "student") return;

      try {
        const data = await apipGet<InstitutionalWorkspaceResponse>("/institutions/workspace");
        if (!cancelled) {
          setInstitutionWorkspace(data);
        }
      } catch {
        if (!cancelled) {
          setInstitutionWorkspace(null);
        }
      }
    }

    void loadInstitutionWorkspace();

    return () => {
      cancelled = true;
    };
  }, [loading, roleLoading, role, user]);

  async function openBillingPortal(): Promise<void> {
    try {
      setBillingBusy("portal");
      const data = await apipPost<{ ok: boolean; portal_url?: string }>("/billing/portal-session", { origin: window.location.origin, return_path: "/student" } as never);
      if (!data.portal_url) throw new Error("Billing portal did not return a redirect URL.");
      window.location.assign(data.portal_url);
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBillingBusy("");
    }
  }

  async function launchSubscriptionCheckout(planId?: string): Promise<void> {
    if (!planId) return;
    try {
      setBillingBusy(planId);
      const data = await apipPost<CheckoutSessionResponse>("/billing/checkout-session", { purchase_kind: "subscription", plan_id: planId, origin: window.location.origin, success_path: "/student", cancel_path: "/student" } as never);
      if (!data.checkout_url) throw new Error("Subscription billing did not return a redirect URL.");
      window.location.assign(data.checkout_url);
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setBillingBusy("");
    }
  }

  async function handleLogout(): Promise<void> {
    try {
      setStatus("Signing out...");
      await signOutEverywhere();
      router.replace("/login?next=/student");
    } catch (error: unknown) {
      setStatus("");
      setErr(errorMessage(error));
    }
  }

  async function submitInstitutionAssignment(): Promise<void> {
    if (!submissionForm.assignment_id) return;
    try {
      setInstitutionBusy("submission");
      await apipPost(`/institutions/assignments/${encodeURIComponent(submissionForm.assignment_id)}/submission`, {
        text_response: submissionForm.text_response || null,
        link_url: submissionForm.link_url || null,
      });
      setSubmissionForm((current) => ({ ...current, text_response: "", link_url: "" }));
      const data = await apipGet<InstitutionalWorkspaceResponse>("/institutions/workspace");
      setInstitutionWorkspace(data);
      setStatus("Class submission sent.");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setInstitutionBusy("");
    }
  }

  async function postStudentDiscussion(): Promise<void> {
    try {
      setInstitutionBusy("discussion");
      await apipPost("/institutions/discussions", {
        scope: discussionForm.scope,
        class_id: discussionForm.scope === "class" ? discussionForm.class_id || null : null,
        module_id: discussionForm.module_id || null,
        title: discussionForm.title,
        body: discussionForm.body,
      });
      setDiscussionForm((current) => ({ ...current, title: "", body: "", module_id: "" }));
      const data = await apipGet<InstitutionalWorkspaceResponse>("/institutions/workspace");
      setInstitutionWorkspace(data);
      setStatus("Discussion posted.");
    } catch (error: unknown) {
      setErr(errorMessage(error));
    } finally {
      setInstitutionBusy("");
    }
  }

  const pageReady = useMemo(() => {
    return !loading && !roleLoading && !!user && role === "student";
  }, [loading, roleLoading, role, user]);

  const activeSubscriptionPlanId = billingSummary?.active_subscription_plan_id || billingSummary?.subscription?.plan_id || null;
  const subscriptionPlans = useMemo(() => {
    for (const moduleItem of modules) {
      if (moduleItem.access?.subscription_plans?.length) {
        return moduleItem.access.subscription_plans;
      }
    }
    return [] as PricingOffer[];
  }, [modules]);

  const moduleSections = useMemo(() => {
    const grouped: Record<ModuleGroupKey, Module[]> = {
      foundation: [],
      corePhysics: [],
      advancedPhysics: [],
    };

    for (const moduleItem of modules) {
      grouped[moduleGroupKey(moduleItem.id)].push(moduleItem);
    }

    for (const key of Object.keys(grouped) as ModuleGroupKey[]) {
      grouped[key].sort(compareModules);
    }

    return MODULE_SECTION_ORDER.map((section) => ({
      ...section,
      modules: grouped[section.key],
    })).filter((section) => section.modules.length > 0);
  }, [modules]);
  const institutionalClasses = useMemo(
    () => (institutionWorkspace?.institutions || []).flatMap((block) => block.classes || []),
    [institutionWorkspace],
  );
  const institutionalAssignments = useMemo(
    () => institutionalClasses.flatMap((classItem) => classItem.assignments || []),
    [institutionalClasses],
  );
  const needsPaidSecurityUpgrade = useMemo(
    () => paidAccessRequiresSecurityUpgrade(sessionUser, billingSummary, modules),
    [billingSummary, modules, sessionUser],
  );
  const securityActions = sessionUser?.security?.recommended_actions || [];
  const canShowStudentHelp = !sessionLoading && role === "student";
  const canShowStudentCommunity = !sessionLoading && role === "student" && (
    (institutionWorkspace?.institutions.length || 0) > 0 ||
    institutionWorkspace?.viewer.can_access_public_topics === true
  );

  useEffect(() => {
    if (!submissionForm.assignment_id && institutionalAssignments.length > 0) {
      setSubmissionForm((current) => ({
        ...current,
        assignment_id: institutionalAssignments[0].id,
      }));
    }
    if (!discussionForm.class_id && institutionalClasses.length > 0) {
      setDiscussionForm((current) => ({
        ...current,
        class_id: institutionalClasses[0].id,
        scope: "class",
      }));
    }
  }, [discussionForm.class_id, institutionalAssignments, institutionalClasses, submissionForm.assignment_id]);

  function renderModuleCard(moduleItem: Module) {
    const badge = moduleBadge(moduleItem);
    const locked = moduleItem.access?.tier === "premium" && moduleItem.access?.is_unlocked === false;
    const buttonLabel = locked ? "See unlock options" : "Open module";

    return (
      <div
        key={moduleItem.id}
        style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {moduleItem.title || moduleItem.id}
            </div>

            <div style={{ opacity: 0.8, marginTop: 6 }}>
              {moduleItem.description || ""}
            </div>

            <div style={{ marginTop: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: badge.background,
                  color: badge.color,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {badge.label}
              </span>
            </div>

            {moduleItem.access?.message ? (
              <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85 }}>
                {moduleItem.access.message}
              </div>
            ) : null}

            {locked && moduleItem.access?.module_purchase?.price_label ? (
              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>
                1-month access: {moduleItem.access.module_purchase.price_label}
              </div>
            ) : null}

            <div style={{ opacity: 0.75, marginTop: 8, fontSize: 13 }}>
              {moduleItem.level ? `Level: ${moduleItem.level} | ` : ""}
              {moduleItem.estimated_minutes
                ? `Est: ${moduleItem.estimated_minutes} min`
                : ""}
            </div>
          </div>

          <div
            style={{
              minWidth: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Link href={`/student/module/${encodeURIComponent(moduleItem.id)}`}>
              <button
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #333",
                  fontWeight: 700,
                }}
              >
                {buttonLabel}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || roleLoading) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 14,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Loading student access...
        </div>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 14,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 36, marginBottom: 12 }}>Student</h1>
          <p style={{ opacity: 0.8, marginBottom: 8 }}>
            F1 is free. Premium modules unlock for 1 month per module or through subscription.
          </p>
          <div style={{ opacity: 0.7, fontSize: 13 }}>
            Signed in as: {user?.email || "student"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {billingSummary?.portal_enabled ? (
            <button onClick={() => void openBillingPortal()} disabled={billingBusy !== ""} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", fontWeight: 700, opacity: billingBusy !== "" ? 0.65 : 1 }}>
              {billingBusy === "portal" ? "Opening billing..." : billingSummary?.has_active_subscription ? "Manage subscription" : "Manage billing"}
            </button>
          ) : null}
          <button
            onClick={() => router.refresh()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              fontWeight: 700,
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => void handleLogout()}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #333",
              fontWeight: 700,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {status ? (
        <div
          style={{
            border: "1px solid #333",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
            opacity: 0.85,
          }}
        >
          {status}
        </div>
      ) : null}

      {err ? (
        <div
          style={{
            border: "1px solid #800",
            padding: 12,
            borderRadius: 10,
            marginBottom: 16,
          }}
        >
          <b>Error:</b> {err}
        </div>
      ) : null}

      {billingSummary?.has_active_subscription ? (
        <div
          style={{
            border: "1px solid rgba(22, 101, 52, 0.2)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            background: "#f0fdf4",
            color: "#166534",
            display: "grid",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              Active subscription: {planDisplayName(activeSubscriptionPlanId)}
            </div>
            <div style={{ marginTop: 6, opacity: 0.84 }}>
              Manage the current plan or upgrade to a longer premium subscription directly here.
            </div>
          </div>
          {subscriptionPlans.length > 0 ? (
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              {subscriptionPlans.map((plan) => (
                <button
                  key={plan.id || plan.title}
                  onClick={() => void launchSubscriptionCheckout(plan.id)}
                  disabled={billingBusy !== "" || billingSummary?.can_checkout === false}
                  style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(22, 101, 52, 0.16)", background: "rgba(255,255,255,0.92)", fontWeight: 800, color: "#14532d", opacity: billingBusy !== "" || billingSummary?.can_checkout === false ? 0.6 : 1 }}
                >
                  {billingBusy === plan.id ? "Opening billing..." : subscriptionActionLabel(plan, activeSubscriptionPlanId)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {needsPaidSecurityUpgrade ? (
        <div
          style={{
            border: "1px solid rgba(146, 64, 14, 0.28)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
            background: "#fff7ed",
            color: "#9a3412",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            Secure your paid access before continuing
          </div>
          <div style={{ lineHeight: 1.6 }}>
            This account already has a paid module or subscription. Before continuing with premium access, finish the required security steps: {securityActions.length > 0 ? securityActions.map((action) => securityActionLabel(action)).join(", ") : "verify your email and confirm a strong password"}.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/student/security?next=/student")}
              disabled={sessionLoading}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(146, 64, 14, 0.28)",
                background: "#fff",
                fontWeight: 800,
                color: "#9a3412",
                opacity: sessionLoading ? 0.7 : 1,
              }}
            >
              {sessionLoading ? "Checking security..." : "Secure this account"}
            </button>
          </div>
        </div>
      ) : null}

      {modulesLoading ? (
        <div
          style={{
            border: "1px solid #333",
            borderRadius: 12,
            padding: 18,
            textAlign: "center",
            opacity: 0.85,
          }}
        >
          Loading modules...
        </div>
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          {moduleSections.map((section) => (
            <section
              key={section.key}
              style={{
                display: "grid",
                gap: 12,
                border: "1px solid rgba(51, 51, 51, 0.18)",
                borderRadius: 16,
                padding: 16,
                background: "#fcfcfc",
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{section.title}</div>
                <div style={{ marginTop: 6, opacity: 0.76 }}>
                  {section.description}
                </div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {section.modules.map((moduleItem) => renderModuleCard(moduleItem))}
              </div>
            </section>
          ))}
          {modules.length === 0 ? (
            <div
              style={{ border: "1px solid #333", borderRadius: 12, padding: 14 }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                No modules returned.
              </div>
              <div style={{ opacity: 0.8 }}>
                Module options come from Firestore. If one is missing here, the live API is not returning it.
              </div>
            </div>
          ) : null}
        </div>
      )}

      {canShowStudentCommunity && communityDialogOpen ? (
        <div
          onClick={() => setCommunityDialogOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(15, 23, 42, 0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "min(100%, 1100px)",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
              display: "grid",
              gap: 16,
            }}
          >
            <button
              onClick={() => setCommunityDialogOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(16, 35, 63, 0.14)",
                background: "rgba(255, 255, 255, 0.94)",
                color: "#10233f",
                fontWeight: 800,
              }}
            >
              Close
            </button>

            {institutionWorkspace?.institutions.length ? (
              <section
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: 16,
                  padding: 16,
                  background: "#f8fafc",
                  display: "grid",
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>School classes inside Cognispark</div>
                  <div style={{ marginTop: 6, opacity: 0.78 }}>
                    Your institutional classes now sit alongside the self-serve mission flow, so assignments, feedback, and discussion stay in one place.
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
                  {institutionWorkspace.institutions.flatMap((block) =>
                    block.classes.map((classItem) => (
                      <article key={classItem.id} style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14, background: "#fff" }}>
                        <div style={{ fontWeight: 800, fontSize: 18 }}>{classItem.name}</div>
                        <div style={{ marginTop: 4, opacity: 0.74 }}>
                          {block.institution.name} | {classItem.teacher_names.join(", ") || "Teacher"} | Join code {classItem.join_code || "n/a"}
                        </div>
                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                          {classItem.assignments.map((assignment) => (
                            <div key={assignment.id} style={{ borderTop: "1px solid rgba(15, 23, 42, 0.08)", paddingTop: 10 }}>
                              <div style={{ fontWeight: 700 }}>{assignment.title}</div>
                              <div style={{ fontSize: 13, opacity: 0.76 }}>
                                {assignment.assignment_type} | {assignment.resource_module_ids.join(", ") || "custom"} | {assignment.due_utc || "No due date"}
                              </div>
                              <div style={{ marginTop: 6, fontSize: 14, opacity: 0.86 }}>{assignment.instructions}</div>
                              {assignment.your_submission ? (
                                <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "#f8fafc", fontSize: 14 }}>
                                  <strong>Status:</strong> {assignment.your_submission.status}
                                  {typeof assignment.your_submission.score === "number" ? ` | Score ${assignment.your_submission.score}` : ""}
                                  {assignment.your_submission.feedback ? <div style={{ marginTop: 6 }}>{assignment.your_submission.feedback}</div> : null}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </article>
                    )),
                  )}
                </div>

                {institutionalAssignments.length ? (
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                    <article style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14, background: "#fff" }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>Submit class assignment</div>
                      <div style={{ marginTop: 6, opacity: 0.74 }}>
                        Send written work or a link back through the platform so your teacher can grade and reply here.
                      </div>
                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <label>
                          Assignment
                          <select
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={submissionForm.assignment_id}
                            onChange={(event) => setSubmissionForm((current) => ({ ...current, assignment_id: event.target.value }))}
                          >
                            {institutionalAssignments.map((assignment) => (
                              <option key={assignment.id} value={assignment.id}>
                                {assignment.class_name} | {assignment.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Response
                          <textarea
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            rows={4}
                            value={submissionForm.text_response}
                            onChange={(event) => setSubmissionForm((current) => ({ ...current, text_response: event.target.value }))}
                          />
                        </label>
                        <label>
                          Link
                          <input
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={submissionForm.link_url}
                            onChange={(event) => setSubmissionForm((current) => ({ ...current, link_url: event.target.value }))}
                            placeholder="https://..."
                          />
                        </label>
                        <button
                          onClick={() => void submitInstitutionAssignment()}
                          disabled={institutionBusy !== ""}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", fontWeight: 700 }}
                        >
                          {institutionBusy === "submission" ? "Submitting..." : "Submit assignment"}
                        </button>
                      </div>
                    </article>

                    <article style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14, background: "#fff" }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>Discussion</div>
                      <div style={{ marginTop: 6, opacity: 0.74 }}>
                        Use a class thread for coursework questions or the public topic feed for broader learner discussion.
                      </div>
                      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        <label>
                          Scope
                          <select
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={discussionForm.scope}
                            onChange={(event) => setDiscussionForm((current) => ({ ...current, scope: event.target.value }))}
                          >
                            <option value="class">class</option>
                            {institutionWorkspace.viewer.can_access_public_topics ? <option value="public_topic">public_topic</option> : null}
                          </select>
                        </label>
                        <label>
                          Class
                          <select
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={discussionForm.class_id}
                            onChange={(event) => setDiscussionForm((current) => ({ ...current, class_id: event.target.value }))}
                          >
                            {institutionalClasses.map((classItem) => (
                              <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Module ID
                          <input
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={discussionForm.module_id}
                            onChange={(event) => setDiscussionForm((current) => ({ ...current, module_id: event.target.value }))}
                            placeholder="M3"
                          />
                        </label>
                        <label>
                          Title
                          <input
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            value={discussionForm.title}
                            onChange={(event) => setDiscussionForm((current) => ({ ...current, title: event.target.value }))}
                          />
                        </label>
                        <label>
                          Body
                          <textarea
                            style={{ width: "100%", padding: 10, marginTop: 4 }}
                            rows={4}
                            value={discussionForm.body}
                            onChange={(event) => setDiscussionForm((current) => ({ ...current, body: event.target.value }))}
                          />
                        </label>
                        <button
                          onClick={() => void postStudentDiscussion()}
                          disabled={institutionBusy !== ""}
                          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333", fontWeight: 700 }}
                        >
                          {institutionBusy === "discussion" ? "Posting..." : "Post discussion"}
                        </button>
                      </div>
                    </article>
                  </div>
                ) : null}
              </section>
            ) : null}

            {institutionWorkspace?.viewer.can_access_public_topics ? (
              <section
                style={{
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                  borderRadius: 16,
                  padding: 16,
                  background: "#fff",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>Public topic community</div>
                  <div style={{ marginTop: 6, opacity: 0.78 }}>
                    Join broader student discussion by topic, whether you learn independently or through a school subscription.
                  </div>
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                  {(institutionWorkspace.public_topic_discussions || []).map((item) => (
                    <article key={item.id} style={{ border: "1px solid rgba(15, 23, 42, 0.12)", borderRadius: 14, padding: 14, background: "#f8fafc" }}>
                      <div style={{ fontWeight: 800 }}>{item.title}</div>
                      <div style={{ marginTop: 4, fontSize: 13, opacity: 0.74 }}>{item.module_id || "General topic"}</div>
                      <div style={{ marginTop: 8, opacity: 0.86 }}>{item.body}</div>
                    </article>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(15, 23, 42, 0.08)", paddingTop: 12 }}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>Start a public topic thread</div>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    <label>
                      Module ID
                      <input
                        style={{ width: "100%", padding: 10, marginTop: 4 }}
                        value={discussionForm.module_id}
                        onChange={(event) => setDiscussionForm((current) => ({ ...current, module_id: event.target.value, scope: "public_topic" }))}
                        placeholder="M3"
                      />
                    </label>
                    <label>
                      Title
                      <input
                        style={{ width: "100%", padding: 10, marginTop: 4 }}
                        value={discussionForm.title}
                        onChange={(event) => setDiscussionForm((current) => ({ ...current, title: event.target.value, scope: "public_topic" }))}
                      />
                    </label>
                  </div>
                  <label style={{ display: "block", marginTop: 10 }}>
                    Body
                    <textarea
                      style={{ width: "100%", padding: 10, marginTop: 4 }}
                      rows={4}
                      value={discussionForm.body}
                      onChange={(event) => setDiscussionForm((current) => ({ ...current, body: event.target.value, scope: "public_topic" }))}
                    />
                  </label>
                  <button
                    onClick={() => void postStudentDiscussion()}
                    disabled={institutionBusy !== ""}
                    style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid #333", fontWeight: 700 }}
                  >
                    {institutionBusy === "discussion" ? "Posting..." : "Post public topic"}
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      ) : null}

      {canShowStudentHelp && helpDialogOpen ? (
        <div
          onClick={() => setHelpDialogOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(15, 23, 42, 0.42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "min(100%, 980px)",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setHelpDialogOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(16, 35, 63, 0.14)",
                background: "rgba(255, 255, 255, 0.94)",
                color: "#10233f",
                fontWeight: 800,
              }}
            >
              Close
            </button>
            <StudentHelpCard
              moduleTitle="Student module list"
              pagePath="/student"
            />
          </div>
        </div>
      ) : null}

      {canShowStudentCommunity ? (
        <button
          onClick={() => setCommunityDialogOpen(true)}
          style={{
            position: "fixed",
            right: 22,
            bottom: canShowStudentHelp ? 86 : 22,
            zIndex: 80,
            padding: "14px 18px",
            borderRadius: 999,
            border: "1px solid rgba(16, 35, 63, 0.14)",
            background: "rgba(255, 255, 255, 0.96)",
            color: "#10233f",
            fontWeight: 900,
            boxShadow: "0 18px 38px rgba(11, 26, 50, 0.18)",
          }}
        >
          Social threads
        </button>
      ) : null}

      {canShowStudentHelp ? (
        <button
          onClick={() => setHelpDialogOpen(true)}
          style={{
            position: "fixed",
            right: 22,
            bottom: 22,
            zIndex: 80,
            padding: "14px 18px",
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg, #10233f 0%, #0b1a32 100%)",
            color: "#fff",
            fontWeight: 900,
            boxShadow: "0 18px 38px rgba(11, 26, 50, 0.24)",
          }}
        >
          Help / inquiry
        </button>
      ) : null}
    </div>
  );
}
