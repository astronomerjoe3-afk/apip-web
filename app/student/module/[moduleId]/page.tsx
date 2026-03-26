"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apipGet, apipPost } from "../../../../lib/apipApi";
import LessonRunner from "../../../../components/LessonRunner";
import { restartModuleProgress } from "../../../../lib/lessonRunnerApi";
import { securityActionLabel } from "../../../../lib/accountSecurity";
import { useAuth } from "../../../../lib/auth";
import {
  applyCurriculumModuleMeta,
  canonicalizeModuleScopedLessonId,
  curriculumMetaForModule,
  normalizeModuleId,
  sanitizeModuleHeadingDescription,
} from "../../../../lib/moduleCurriculum";
import { readSessionUser, signOutEverywhere, type SessionUser } from "../../../../lib/sessionClient";

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

type ModuleCatalog = {
  id: string;
  title?: string;
  description?: string;
  misconception_tag_allowlist?: string[];
  mastery_outcomes?: string[];
  access_tier?: string;
  access?: ModuleAccess;
};

type BillingSummary = {
  configured?: boolean;
  webhook_configured?: boolean;
  can_checkout?: boolean;
  portal_enabled?: boolean;
  has_customer?: boolean;
  customer_email?: string | null;
  purchased_module_ids?: string[];
  active_subscription_plan_id?: string | null;
  subscription_expires_utc?: string | null;
  has_active_subscription?: boolean;
  subscription?: {
    status?: string;
    plan_id?: string;
    ends_utc?: string;
  } | null;
};

type BillingSummaryResponse = {
  ok: boolean;
  billing: BillingSummary;
  module_access?: ModuleAccess;
};

type CheckoutSessionResponse = {
  ok: boolean;
  checkout_url?: string;
  session_id?: string;
};

type PortalSessionResponse = {
  ok: boolean;
  portal_url?: string;
  session_id?: string;
};

type LessonPhases = {
  analogical_grounding?: {
    analogy_text?: string;
  };
  simulation_inquiry?: {
    lab_id?: string | null;
    inquiry_prompts?: string[];
  };
  concept_reconstruction?: {
    prompts?: string[];
  };
  diagnostic?: {
    items?: unknown[];
  };
  transfer?: {
    items?: unknown[];
  };
};

type LessonCatalog = {
  id: string;
  lesson_id?: string;
  title?: string;
  sequence?: number;
  module_id?: string;
  phases?: LessonPhases;
  [key: string]: unknown;
};

type LessonProgress = {
  lesson_id: string;
  title?: string;
  sequence?: number;
  best_score: number;
  latest_score?: number | null;
  attempt_count: number;
  completed: boolean;
  can_advance: boolean;
  lab_available: boolean;
  lab_used: boolean;
  status: string;
};

type StudentModuleProgressResponse = {
  ok: boolean;
  module: {
    module_id: string;
    module_mastery: number;
    lessons_completed_count: number;
    total_lessons: number;
  };
  lessons: LessonProgress[];
};

type LessonsResponse = {
  ok: boolean;
  lessons: LessonCatalog[];
  warnings?: string[];
};

type ActiveLesson = LessonCatalog & {
  progress?: LessonProgress;
};



function normalizeLessonId(moduleId: string | undefined | null, value: string | undefined | null): string {
  const canonical = canonicalizeModuleScopedLessonId(moduleId, value);
  const compactMatch = canonical.match(/^([A-Z]+\d+)_?L(\d+)$/);
  return compactMatch ? `${compactMatch[1]}_L${compactMatch[2]}` : canonical;
}

function normalizeModuleTitle(moduleId: string | undefined | null, title: string | undefined): string | undefined {
  const curriculumMeta = curriculumMetaForModule(moduleId);
  if (curriculumMeta) return curriculumMeta.title;
  const trimmed = String(title || "").trim();
  return trimmed || undefined;
}

function normalizeModuleDescription(moduleId: string | undefined | null, title: string | undefined, description: string | undefined): string | undefined {
  void title;
  const curriculumMeta = curriculumMetaForModule(moduleId);
  if (curriculumMeta) return curriculumMeta.description;
  return sanitizeModuleHeadingDescription(description);
}

function fallbackModuleMeta(moduleId: string): ModuleCatalog | null {
  const curriculumMeta = curriculumMetaForModule(moduleId);
  if (!curriculumMeta) return null;
  return {
    id: curriculumMeta.id,
    title: curriculumMeta.title,
    description: curriculumMeta.description,
  };
}


function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isFetchFailure(error: unknown): boolean {
  return error instanceof Error && (error.message === "Failed to fetch" || error.name === "TypeError");
}

function emptyModuleProgress(moduleId: string, totalLessons: number): StudentModuleProgressResponse["module"] {
  return {
    module_id: moduleId,
    module_mastery: 0,
    lessons_completed_count: 0,
    total_lessons: totalLessons,
  };
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

export default function StudentModulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams() as Record<string, string | string[] | undefined>;
  const { user, loading: authLoading } = useAuth();

  const raw =
    (params["moduleId"] ?? params["module"]) as string | string[] | undefined;

  const routeModuleId = useMemo(() => {
    if (!raw) return "";
    const value = Array.isArray(raw) ? raw[0] : raw;
    return decodeURIComponent(value);
  }, [raw]);

  const moduleId = useMemo(() => normalizeModuleId(routeModuleId), [routeModuleId]);

  const currentModulePath = useMemo(() => {
    const pathModuleId = routeModuleId || moduleId;
    if (!pathModuleId) return "/student";
    return "/student/module/" + encodeURIComponent(pathModuleId);
  }, [moduleId, routeModuleId]);

  const checkoutState = searchParams.get("checkout");
  const checkoutSessionId = searchParams.get("session_id");
  const returnedFromBillingPortal = searchParams.get("billing") === "return";

  const [moduleMeta, setModuleMeta] = useState<ModuleCatalog | null>(null);
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [billingErr, setBillingErr] = useState<string>("");
  const [billingLoading, setBillingLoading] = useState<boolean>(false);
  const [billingBusyId, setBillingBusyId] = useState<string>("");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const confirmedSessionRef = useRef<string>("");
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgressResponse["module"] | null>(null);
  const [lessons, setLessons] = useState<ActiveLesson[]>([]);
  const [err, setErr] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    const index = Math.min(Math.max(activeIdx, 0), lessons.length - 1);
    return lessons[index] || null;
  }, [lessons, activeIdx]);

  const progressLabel = useMemo(() => {
    if (!lessons.length) return "";
    return `Mission ${activeIdx + 1} of ${lessons.length}`;
  }, [lessons.length, activeIdx]);

  const moduleLocked = moduleMeta?.access?.tier === "premium" && moduleMeta?.access?.is_unlocked === false;
  const billingConfigured = billingSummary?.configured === true;
  const checkoutEnabled = billingSummary?.can_checkout !== false;
  const canManageBilling = billingSummary?.portal_enabled === true;
  const hasActiveSubscription = billingSummary?.has_active_subscription === true;
  const activeSubscriptionPlanId = billingSummary?.active_subscription_plan_id || billingSummary?.subscription?.plan_id || null;
  const activeSubscriptionLabel = planDisplayName(activeSubscriptionPlanId);
  const subscriptionPlans = moduleMeta?.access?.subscription_plans || [];
  const showModulePurchase = Boolean(moduleMeta?.access?.module_purchase) && !hasActiveSubscription;
  const modulePurchaseTitle = /forever/i.test(moduleMeta?.access?.module_purchase?.title || "")
    ? "Unlock this module for 1 month"
    : moduleMeta?.access?.module_purchase?.title || "Unlock this module for 1 month";
  const modulePurchaseDescription = /(permanent|forever)/i.test(moduleMeta?.access?.module_purchase?.description || "")
    ? "One payment for 1 month of access to this premium module."
    : moduleMeta?.access?.module_purchase?.description || "One payment for 1 month of access to this premium module.";
  const billingCtaText = hasActiveSubscription
    ? "Use Manage subscription or upgrade to a longer premium plan below."
    : "Secure checkout is ready. Choose a 1-month module pass or premium subscription.";
  const showBillingError = Boolean(billingErr) && moduleLocked;
  const premiumAccessUnlocked = moduleMeta?.access?.tier === "premium" && moduleMeta?.access?.is_unlocked !== false;
  const moduleNeedsSecurityUpgrade = premiumAccessUnlocked && sessionUser?.security?.hardening_complete !== true;
  const waitingForSecurityCheck = premiumAccessUnlocked && sessionLoading;
  const securityActions = sessionUser?.security?.recommended_actions || [];

  const loadBillingSummary = useCallback(async (): Promise<void> => {
    if (!user) {
      setBillingSummary(null);
      setBillingErr("");
      return;
    }

    setBillingLoading(true);
    try {
      const response = await apipGet<BillingSummaryResponse>("/billing/summary");
      setBillingSummary(response.billing || null);
      setBillingErr("");
    } catch (error) {
      setBillingErr(errorMessage(error));
    } finally {
      setBillingLoading(false);
    }
  }, [user]);

  const loadModuleState = useCallback(
    async (preserveCurrentLesson: boolean = true, currentLessonIdOverride?: string): Promise<void> => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setErr("");
        setModuleMeta(null);
        setModuleProgress(null);
        setLessons([]);
        setActiveIdx(0);
        setLoading(false);
        return;
      }

      if (!moduleId) {
        setErr("Missing module id in route.");
        setModuleMeta(null);
        setModuleProgress(null);
        setLessons([]);
        setActiveIdx(0);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        setErr("");

        const [moduleResult, lessonsResult, progressResult] = await Promise.allSettled([
          apipGet<{ ok: boolean; module: ModuleCatalog }>(
            `/modules/${encodeURIComponent(moduleId)}`,
          ),
          apipGet<LessonsResponse>(
            `/modules/${encodeURIComponent(moduleId)}/lessons`,
          ),
          apipGet<StudentModuleProgressResponse>(
            `/student/modules/${encodeURIComponent(moduleId)}/progress`,
          ),
        ]);

        const moduleResponse =
          moduleResult.status === "fulfilled" ? moduleResult.value : null;
        const resolvedModuleMeta = moduleResponse
          ? applyCurriculumModuleMeta({
              ...moduleResponse.module,
              title: normalizeModuleTitle(moduleResponse.module.id || moduleId, moduleResponse.module.title),
              description: normalizeModuleDescription(
                moduleResponse.module.id || moduleId,
                moduleResponse.module.title,
                moduleResponse.module.description,
              ),
            })
          : fallbackModuleMeta(moduleId);

        if (!resolvedModuleMeta && lessonsResult.status !== "fulfilled") {
          throw (moduleResult.status === "rejected" ? moduleResult.reason : lessonsResult.reason);
        }

        setModuleMeta(resolvedModuleMeta);

        if (
          moduleResponse?.module.access?.tier === "premium" &&
          moduleResponse.module.access?.is_unlocked === false
        ) {
          setModuleProgress(null);
          setLessons([]);
          setActiveIdx(0);
          return;
        }

        if (lessonsResult.status !== "fulfilled") {
          throw lessonsResult.reason;
        }

        const lessonsResponse = lessonsResult.value;
        const progressResponse =
          progressResult.status === "fulfilled" ? progressResult.value : null;

        const progressByLessonId = new Map<string, LessonProgress>();
        if (progressResponse) {
          for (const lessonProgress of progressResponse.lessons || []) {
            const normalizedLessonId = normalizeLessonId(moduleId, lessonProgress.lesson_id);
            progressByLessonId.set(
              normalizedLessonId,
              {
                ...lessonProgress,
                lesson_id: normalizedLessonId,
              },
            );
          }
        }

        const mergedLessons: ActiveLesson[] = [...(lessonsResponse.lessons || [])]
          .sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999))
          .map((lesson) => {
            const lessonId = normalizeLessonId(moduleId, lesson.lesson_id || lesson.id);
            return {
              ...lesson,
              lesson_id: lessonId,
              progress: progressByLessonId.get(lessonId),
            };
          });

        const currentLessonId = preserveCurrentLesson
          ? normalizeLessonId(moduleId, currentLessonIdOverride)
          : "";

        let nextIndex = 0;

        if (currentLessonId) {
          const foundIndex = mergedLessons.findIndex(
            (lesson) =>
              normalizeLessonId(moduleId, lesson.lesson_id || lesson.id) === currentLessonId,
          );
          if (foundIndex >= 0) {
            nextIndex = foundIndex;
          } else {
            const firstIncompleteIndex = mergedLessons.findIndex(
              (lesson) => lesson.progress?.completed !== true,
            );
            nextIndex =
              firstIncompleteIndex >= 0
                ? firstIncompleteIndex
                : Math.max(mergedLessons.length - 1, 0);
          }
        } else {
          const firstIncompleteIndex = mergedLessons.findIndex(
            (lesson) => lesson.progress?.completed !== true,
          );
          nextIndex =
            firstIncompleteIndex >= 0
              ? firstIncompleteIndex
              : Math.max(mergedLessons.length - 1, 0);
        }

        if (progressResult.status !== "fulfilled" && !isFetchFailure(progressResult.reason)) {
          setErr(errorMessage(progressResult.reason));
        }

        setModuleProgress(
          progressResponse?.module || emptyModuleProgress(moduleId, mergedLessons.length),
        );
        setLessons(mergedLessons);
        setActiveIdx(nextIndex);
      } catch (error) {
        setErr(error instanceof Error ? error.message : String(error));
        setModuleMeta(null);
        setModuleProgress(null);
        setLessons([]);
        setActiveIdx(0);
      } finally {
        setLoading(false);
      }
    },
    [authLoading, moduleId, user],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      const nextPath = currentModulePath;
      router.replace("/login?next=" + encodeURIComponent(nextPath));
      return;
    }

    void loadModuleState(false);
  }, [authLoading, currentModulePath, loadModuleState, router, user]);

  useEffect(() => {
    if (!authLoading && user) {
      void loadBillingSummary();
    }
  }, [authLoading, loadBillingSummary, user]);

  useEffect(() => {
    let cancelled = false;

    async function loadSessionState(): Promise<void> {
      if (authLoading) {
        return;
      }

      if (!user) {
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
  }, [authLoading, user]);

  useEffect(() => {
    if (!checkoutState) {
      return;
    }

    if (checkoutState === "cancelled") {
      setStatus("Checkout cancelled. You can choose another option whenever you are ready.");
    }

    if (returnedFromBillingPortal) {
      setStatus("Returned from billing management.");
    }
  }, [checkoutState, returnedFromBillingPortal]);

  useEffect(() => {
    if (!user || !checkoutSessionId || checkoutState !== "success") {
      return;
    }

    if (confirmedSessionRef.current === checkoutSessionId) {
      return;
    }
    confirmedSessionRef.current = checkoutSessionId;

    setBillingErr("");
    setStatus("Confirming your payment and refreshing access...");

    void apipPost<BillingSummaryResponse, { session_id: string; module_id: string }>("/billing/checkout-session/confirm", {
      session_id: checkoutSessionId,
      module_id: moduleId,
    })
      .then(async () => {
        await Promise.all([loadBillingSummary(), loadModuleState(false)]);
        setStatus("Payment confirmed. Your access has been refreshed.");
        router.replace(currentModulePath);
      })
      .catch((error) => {
        setStatus("");
        setBillingErr(errorMessage(error));
      });
  }, [checkoutSessionId, checkoutState, currentModulePath, loadBillingSummary, loadModuleState, moduleId, router, user]);

  const canGoBack = activeIdx > 0;
  const currentLessonCompleted = activeLesson?.progress?.completed === true;
  const hasNextLesson = lessons.length > 0 && activeIdx < lessons.length - 1;
  const canGoNext = hasNextLesson && currentLessonCompleted;


  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      setErr("");
      setStatus("Signing out...");
      await signOutEverywhere();
      const nextPath = currentModulePath;
      router.replace("/login?next=" + encodeURIComponent(nextPath));
    } catch (error: unknown) {
      setStatus("");
      setErr(errorMessage(error));
    }
  }, [currentModulePath, router]);

  const launchCheckout = useCallback(async (purchaseKind: "module_unlock" | "subscription", planId?: string) => {
    if (!moduleId) return;
    setBillingErr("");
    setBillingBusyId(purchaseKind === "module_unlock" ? "module_unlock" : String(planId || "subscription"));
    try {
      const response = await apipPost<CheckoutSessionResponse>("/billing/checkout-session", { purchase_kind: purchaseKind, module_id: purchaseKind === "module_unlock" ? moduleId : undefined, plan_id: purchaseKind === "subscription" ? planId : undefined, origin: window.location.origin, success_path: currentModulePath, cancel_path: currentModulePath } as never);
      if (!response.checkout_url) throw new Error("Checkout did not return a redirect URL.");
      window.location.assign(response.checkout_url);
    } catch (error) {
      setBillingErr(errorMessage(error));
    } finally {
      setBillingBusyId("");
    }
  }, [currentModulePath, moduleId]);

  const openBillingPortal = useCallback(async () => {
    setBillingErr("");
    setBillingBusyId("portal");
    try {
      const response = await apipPost<PortalSessionResponse>("/billing/portal-session", { origin: window.location.origin, return_path: currentModulePath } as never);
      if (!response.portal_url) throw new Error("Billing portal did not return a redirect URL.");
      window.location.assign(response.portal_url);
    } catch (error) {
      setBillingErr(errorMessage(error));
    } finally {
      setBillingBusyId("");
    }
  }, [currentModulePath]);

  function goBack(): void {
    if (!canGoBack) return;
    setActiveIdx((index) => Math.max(0, index - 1));
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function goNext(): void {
    if (!canGoNext) return;
    setActiveIdx((index) => Math.min(lessons.length - 1, index + 1));
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  const restartFromBeginning = useCallback(async (): Promise<void> => {
    if (!moduleId) return;
    await restartModuleProgress(moduleId);
    setActiveIdx(0);
    await loadModuleState(false);
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [loadModuleState, moduleId]);
  const handleRunnerProgressSummaryChanged = useCallback((summary: {
    lessonId: string;
    lessonStatus: "not_started" | "in_progress" | "completed";
    latestMasteryPercent?: number | null;
    bestMasteryPercent?: number | null;
    moduleMasteryPercent?: number | null;
  }): void => {
    const normalizedLessonId = normalizeLessonId(moduleId, summary.lessonId);

    setLessons((currentLessons) => {
      const nextLessons = currentLessons.map((lesson) => {
        const lessonKey = normalizeLessonId(moduleId, lesson.lesson_id || lesson.id);
        if (lessonKey !== normalizedLessonId) {
          return lesson;
        }

        const previousProgress = lesson.progress;
        const nextCompleted = summary.lessonStatus === "completed";
        const nextLatestScore = typeof summary.latestMasteryPercent === "number"
          ? summary.latestMasteryPercent / 100
          : previousProgress?.latest_score ?? null;
        const nextBestScore = typeof summary.bestMasteryPercent === "number"
          ? summary.bestMasteryPercent / 100
          : previousProgress?.best_score ?? 0;

        return {
          ...lesson,
          progress: {
            lesson_id: normalizeLessonId(moduleId, normalizedLessonId),
            title: previousProgress?.title ?? lesson.title,
            sequence: previousProgress?.sequence ?? lesson.sequence,
            best_score: nextBestScore,
            latest_score: nextLatestScore,
            attempt_count: previousProgress?.attempt_count ?? 0,
            completed: nextCompleted,
            can_advance: nextCompleted || (previousProgress?.can_advance ?? false),
            lab_available: previousProgress?.lab_available ?? false,
            lab_used: previousProgress?.lab_used ?? false,
            status: summary.lessonStatus,
          },
        };
      });

      const nextCompletedCount = nextLessons.reduce(
        (count, lesson) => count + (lesson.progress?.completed ? 1 : 0),
        0,
      );

      setModuleProgress((currentProgress) =>
        currentProgress
          ? {
              ...currentProgress,
              module_mastery:
                typeof summary.moduleMasteryPercent === "number"
                  ? summary.moduleMasteryPercent / 100
                  : currentProgress.module_mastery,
              lessons_completed_count: nextCompletedCount,
            }
          : currentProgress,
      );

      return nextLessons;
    });
  }, [moduleId]);
  return (
    <div
      style={{
        padding: "40px 24px 56px",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      {user ? (
        <div
          style={{
            position: "sticky",
            top: 16,
            zIndex: 30,
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => void handleLogout()}
            disabled={status === "Signing out..."}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "1px solid rgba(16, 35, 63, 0.14)",
              background: "rgba(255, 255, 255, 0.88)",
              color: "#10233f",
              fontWeight: 900,
              opacity: status === "Signing out..." ? 0.72 : 1,
              boxShadow: "0 18px 38px rgba(15, 23, 42, 0.12)",
              backdropFilter: "blur(18px)",
            }}
          >
            Logout
          </button>
        </div>
      ) : null}

      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: -1.6, fontFamily: "Bahnschrift, Aptos Display, Segoe UI, sans-serif", color: "#10233f" }}>
          {moduleMeta?.title || routeModuleId || moduleId || "Module"}
        </div>

        {moduleMeta?.description ? (
          <div
            style={{
              marginTop: 14,
              fontSize: 19,
              color: "#46566b",
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.65,
            }}
          >
            {moduleMeta.description}
          </div>
        ) : null}

        {progressLabel ? (
          <div
            style={{
              marginTop: 18,
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 18px",
              border: "1px solid rgba(16, 35, 63, 0.12)",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.72)",
              boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
            }}>
            <span style={{ fontWeight: 800 }}>{progressLabel}</span>
            <span style={{ opacity: 0.8 }}>|</span>
            <span style={{ opacity: 0.85 }}>
              Work through each step and take your time.
            </span>
          </div>
        ) : null}

        {moduleProgress ? (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              gap: 12,
              alignItems: "center",
              padding: "10px 18px",
              border: "1px solid rgba(16, 35, 63, 0.1)",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.68)",
              color: "#334155",
            }}
          >
            <span style={{ fontWeight: 800 }}>
              Module mastery average: {Math.round((moduleProgress.module_mastery || 0) * 100)}%
            </span>
            <span style={{ opacity: 0.55 }}>|</span>
            <span>
              Lessons completed: {moduleProgress.lessons_completed_count}/{moduleProgress.total_lessons}
            </span>
          </div>
        ) : null}
      </div>

      {err ? (
        <div
          style={{
            border: "1px solid #800",
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
            maxWidth: 900,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <b>Error:</b> {err}
        </div>
      ) : null}


      {showBillingError ? (
        <div style={{ border: "1px solid #92400e", padding: 14, borderRadius: 12, marginBottom: 16, maxWidth: 900, marginLeft: "auto", marginRight: "auto", background: "#fff7ed", color: "#9a3412" }}>
          <b>Billing:</b> {billingErr}
        </div>
      ) : null}

      {status ? (
        <div
          style={{
            border: "1px solid rgba(16, 35, 63, 0.12)",
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
            maxWidth: 900,
            marginLeft: "auto",
            marginRight: "auto",
            background: "rgba(255, 255, 255, 0.75)",
          }}
        >
          {status}
        </div>
      ) : null}
      <div
        style={{
          border: "1px solid rgba(16, 35, 63, 0.12)",
          borderRadius: 30,
          padding: 24,
          maxWidth: 1100,
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.78)", boxShadow: "0 30px 80px rgba(15, 23, 42, 0.12)", backdropFilter: "blur(18px)",
        }}>
        {authLoading ? (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Checking your sign-in...
          </div>
        ) : !user ? (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Taking you to sign in...
          </div>
        ) : moduleLocked ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "inline-flex", justifyContent: "center" }}>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "#fef3c7", color: "#92400e", fontWeight: 800, fontSize: 12 }}>Premium module</span>
            </div>
            <div style={{ textAlign: "center", fontSize: 18, color: "#46566b", lineHeight: 1.6 }}>
              {moduleMeta?.access?.message || "Unlock this premium module for 1 month or subscribe for wider access."}
            </div>
            {hasActiveSubscription ? (
              <div style={{ border: "1px solid rgba(22, 101, 52, 0.16)", borderRadius: 18, padding: 18, background: "#f0fdf4", color: "#166534" }}>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Active plan: {activeSubscriptionLabel}</div>
                <div style={{ marginTop: 6, opacity: 0.84 }}>Your premium subscription should already unlock this module. Refresh access below, manage the subscription, or upgrade to a longer plan here.</div>
              </div>
            ) : null}
            {showModulePurchase ? (
              <div style={{ border: "1px solid rgba(16, 35, 63, 0.12)", borderRadius: 18, padding: 18, background: "rgba(255, 255, 255, 0.82)" }}>
                <div style={{ fontWeight: 900, fontSize: 20 }}>{modulePurchaseTitle}</div>
                <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>{moduleMeta?.access?.module_purchase?.price_label}</div>
                <div style={{ marginTop: 8, opacity: 0.82 }}>{modulePurchaseDescription}</div>
                <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => void launchCheckout("module_unlock")} disabled={!billingConfigured || !checkoutEnabled || billingBusyId !== "" || billingLoading} style={{ padding: "12px 18px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #10233f 0%, #0b1a32 100%)", color: "#fff", fontWeight: 900, opacity: !billingConfigured || !checkoutEnabled || billingBusyId !== "" || billingLoading ? 0.55 : 1 }}>
                    {billingBusyId === "module_unlock" ? "Opening secure checkout..." : "Unlock this module"}
                  </button>
                  <span style={{ opacity: 0.72 }}>One-time purchase for 1 month of access. Secure checkout opens in Stripe.</span>
                </div>
              </div>
            ) : null}
            {subscriptionPlans.length > 0 ? (
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id || plan.title} style={{ border: "1px solid rgba(16, 35, 63, 0.12)", borderRadius: 18, padding: 18, background: "rgba(255, 255, 255, 0.82)" }}>
                    <div style={{ fontWeight: 900 }}>{plan.title}</div>
                    <div style={{ marginTop: 6, fontSize: 24, fontWeight: 900 }}>{plan.price_label}</div>
                    <div style={{ marginTop: 4, opacity: 0.72 }}>{plan.effective_monthly_label || plan.billing_label}</div>
                    <div style={{ marginTop: 8, opacity: 0.82 }}>{plan.description}</div>
                    <button onClick={() => void launchCheckout("subscription", plan.id)} disabled={!billingConfigured || !checkoutEnabled || billingBusyId !== "" || billingLoading} style={{ marginTop: 14, width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(16, 35, 63, 0.14)", background: "rgba(255, 255, 255, 0.92)", color: "#10233f", fontWeight: 900, opacity: !billingConfigured || !checkoutEnabled || billingBusyId !== "" || billingLoading ? 0.55 : 1 }}>
                      {billingBusyId === plan.id ? "Opening billing..." : subscriptionActionLabel(plan, activeSubscriptionPlanId)}
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ textAlign: "center", opacity: 0.72 }}>
              {billingConfigured ? billingCtaText : "Live billing is not configured in this environment yet. Add the Stripe keys and price ids on the API service to enable checkout."}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              {canManageBilling ? (
                <button onClick={() => void openBillingPortal()} disabled={billingBusyId !== ""} style={{ padding: "12px 18px", borderRadius: 14, border: "1px solid rgba(16, 35, 63, 0.14)", background: "rgba(255, 255, 255, 0.88)", fontWeight: 800, opacity: billingBusyId !== "" ? 0.6 : 1 }}>
                  {billingBusyId === "portal" ? "Opening billing portal..." : hasActiveSubscription ? "Manage subscription" : "Manage billing"}
                </button>
              ) : null}
              <button onClick={() => { void Promise.all([loadModuleState(false), loadBillingSummary()]); }} style={{ padding: "12px 18px", borderRadius: 14, border: "1px solid rgba(16, 35, 63, 0.14)", background: "rgba(255, 255, 255, 0.88)", fontWeight: 800 }}>Refresh access</button>
              <button onClick={() => router.push("/student")} style={{ padding: "12px 18px", borderRadius: 14, border: "1px solid rgba(16, 35, 63, 0.14)", background: "rgba(255, 255, 255, 0.72)", fontWeight: 800 }}>Back to modules</button>
            </div>
          </div>
        ) : waitingForSecurityCheck ? (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Checking account security for paid access...
          </div>
        ) : moduleNeedsSecurityUpgrade ? (
          <div style={{ display: "grid", gap: 16, maxWidth: 860, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", justifyContent: "center" }}>
              <span style={{ padding: "6px 12px", borderRadius: 999, background: "#fff7ed", color: "#9a3412", fontWeight: 800, fontSize: 12 }}>
                Security step required
              </span>
            </div>
            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 900, color: "#10233f" }}>
              Secure this account before continuing with premium lessons
            </div>
            <div style={{ textAlign: "center", fontSize: 17, color: "#46566b", lineHeight: 1.65 }}>
              This premium module is unlocked, but paid access now requires a stronger account baseline first.
            </div>
            <div style={{ border: "1px solid rgba(146, 64, 14, 0.2)", borderRadius: 18, padding: 18, background: "#fff7ed", color: "#9a3412" }}>
              <div style={{ fontWeight: 900, marginBottom: 8 }}>Required next steps</div>
              <div style={{ lineHeight: 1.6 }}>
                {securityActions.length > 0
                  ? securityActions.map((action) => securityActionLabel(action)).join(", ")
                  : "Verify your email and confirm a strong password."}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => router.push(`/student/security?next=${encodeURIComponent(currentModulePath)}`)}
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #10233f 0%, #0b1a32 100%)",
                  color: "#fff",
                  fontWeight: 900,
                }}
              >
                Secure this account
              </button>
              <button
                onClick={() => router.push("/student")}
                style={{
                  padding: "12px 18px",
                  borderRadius: 14,
                  border: "1px solid rgba(16, 35, 63, 0.14)",
                  background: "rgba(255, 255, 255, 0.82)",
                  fontWeight: 800,
                }}
              >
                Back to modules
              </button>
            </div>
          </div>
        ) : loading && !activeLesson ? (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Loading mission...
          </div>
        ) : activeLesson ? (
          <LessonRunner
            moduleId={moduleId}
            lessonId={normalizeLessonId(moduleId, activeLesson.lesson_id || activeLesson.id)}
            prefetchedLesson={activeLesson}
            canGoNextLesson={canGoNext}
            onGoNextLesson={canGoNext ? goNext : undefined}
            onProgressSummaryChanged={handleRunnerProgressSummaryChanged}




          />
        ) : (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Loading mission...
          </div>
        )}
      </div>

      {lessons.length > 0 ? (
        <div
          style={{
            maxWidth: 1100,
            margin: "16px auto 0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={goBack}
              disabled={!canGoBack}
              style={{
                opacity: canGoBack ? 1 : 0.42,
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(16, 35, 63, 0.14)",
                background: "rgba(255, 255, 255, 0.72)",
                fontWeight: 800,
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
              }}>
              Back
            </button>

            <button
              onClick={() => void restartFromBeginning()}
              style={{
                padding: "12px 18px",
                borderRadius: 14,
                border: "1px solid rgba(16, 35, 63, 0.14)",
                background: "rgba(255, 255, 255, 0.72)",
                fontWeight: 800,
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
              }}>
              Start over from Lesson 1
            </button>
          </div>

          <div style={{ opacity: 0.8, textAlign: "center", flex: "1 1 220px" }}>
            {currentLessonCompleted ? "You can continue to the next mission." : "Complete this mission to unlock the next one."}
          </div>

          <button
            onClick={goNext}
            disabled={!canGoNext}
            style={{
              opacity: canGoNext ? 1 : 0.42,
              padding: "12px 20px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #10233f 0%, #0b1a32 100%)",
              color: "#fff", fontWeight: 900, boxShadow: "0 18px 38px rgba(11, 26, 50, 0.22)",
            }}>
            Continue
          </button>
        </div>
      ) : null}
    </div>
  );
}
