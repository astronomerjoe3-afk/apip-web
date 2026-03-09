"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apipGet } from "../../../../lib/apipApi";
import LessonRunner from "../../../../components/LessonRunner";
import { restartModuleProgress } from "../../../../lib/lessonRunnerApi";
import { useAuth } from "../../../../lib/auth";

type ModuleCatalog = {
  id: string;
  title?: string;
  description?: string;
  misconception_tag_allowlist?: string[];
  mastery_outcomes?: string[];
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


function normalizeLessonId(value: string | undefined | null): string {
  return String(value || "").replace(/-/g, "_");
}

export default function StudentModulePage() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[] | undefined>;
  const { user, loading: authLoading } = useAuth();

  const raw =
    (params["moduleId"] ?? params["module"]) as string | string[] | undefined;

  const moduleId = useMemo(() => {
    if (!raw) return "";
    const value = Array.isArray(raw) ? raw[0] : raw;
    return decodeURIComponent(value);
  }, [raw]);

  const [moduleMeta, setModuleMeta] = useState<ModuleCatalog | null>(null);
  const [moduleProgress, setModuleProgress] = useState<StudentModuleProgressResponse["module"] | null>(null);
  const [lessons, setLessons] = useState<ActiveLesson[]>([]);
  const [err, setErr] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState<number>(0);
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

  const loadModuleState = useCallback(
    async (preserveCurrentLesson: boolean = true): Promise<void> => {
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

        const [moduleResponse, lessonsResponse, progressResponse] =
          await Promise.all([
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

        const progressByLessonId = new Map<string, LessonProgress>();
        for (const lessonProgress of progressResponse.lessons || []) {
          progressByLessonId.set(
            normalizeLessonId(lessonProgress.lesson_id),
            lessonProgress,
          );
        }

        const mergedLessons: ActiveLesson[] = [...(lessonsResponse.lessons || [])]
          .sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999))
          .map((lesson) => {
            const lessonId = normalizeLessonId(lesson.lesson_id || lesson.id);
            return {
              ...lesson,
              progress: progressByLessonId.get(lessonId),
            };
          });

        const currentLessonId = preserveCurrentLesson
          ? normalizeLessonId(activeLesson?.lesson_id || activeLesson?.id)
          : "";

        let nextIndex = 0;

        if (currentLessonId) {
          const foundIndex = mergedLessons.findIndex(
            (lesson) =>
              normalizeLessonId(lesson.lesson_id || lesson.id) === currentLessonId,
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

        setModuleMeta(moduleResponse.module);
        setModuleProgress(progressResponse.module);
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
    [activeLesson, authLoading, moduleId, user],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      const nextPath = moduleId
        ? "/student/module/" + encodeURIComponent(moduleId)
        : "/student";
      router.replace("/login?next=" + encodeURIComponent(nextPath));
      return;
    }

    void loadModuleState(false);
  }, [authLoading, loadModuleState, moduleId, router, user]);

  const canGoBack = activeIdx > 0;
  const canGoNext = lessons.length > 0 && activeIdx < lessons.length - 1;

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
  return (
    <div
      style={{
        padding: "40px 24px 56px",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 54, fontWeight: 900, letterSpacing: -1.6, fontFamily: "Bahnschrift, Aptos Display, Segoe UI, sans-serif", color: "#10233f" }}>
          {moduleMeta?.title || moduleId || "Module"}
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
        ) : loading && !activeLesson ? (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Loading mission...
          </div>
        ) : activeLesson ? (
          <LessonRunner
            moduleId={moduleId}
            lessonId={normalizeLessonId(activeLesson.lesson_id || activeLesson.id)}
            canGoNextLesson={canGoNext}
            onGoNextLesson={canGoNext ? goNext : undefined}
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
          }}
        >
          <button
            onClick={goBack}
            disabled={!canGoBack}
            style={{
              opacity: canGoBack ? 1 : 0.42,
              padding: "12px 18px",
              borderRadius: 14,
              border: "1px solid rgba(16, 35, 63, 0.14)",
              background: "rgba(255, 255, 255, 0.72)",
              fontWeight: 800, boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
            }}>
            Back
          </button>

          <div style={{ opacity: 0.8, textAlign: "center" }}>
            Finish this mission, then continue.
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
