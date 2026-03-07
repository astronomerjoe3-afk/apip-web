"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apipGet } from "../../../../lib/apipApi";
import LessonRunner from "../../../../components/LessonRunner";

type Module = {
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

type Lesson = {
  id: string;
  lesson_id?: string;
  title?: string;
  sequence?: number;
  module_id?: string;
  phases?: LessonPhases;
};

export default function StudentModulePage() {
  const params = useParams() as Record<string, string | string[] | undefined>;

  const raw =
    (params["moduleId"] ?? params["module"]) as string | string[] | undefined;

  const moduleId = useMemo(() => {
    if (!raw) return "";
    const value = Array.isArray(raw) ? raw[0] : raw;
    return decodeURIComponent(value);
  }, [raw]);

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [err, setErr] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    const index = Math.min(Math.max(activeIdx, 0), lessons.length - 1);
    return lessons[index] || null;
  }, [lessons, activeIdx]);

  const progressLabel = useMemo(() => {
    if (!lessons.length) return "";
    return `Mission ${activeIdx + 1} of ${lessons.length}`;
  }, [lessons.length, activeIdx]);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      if (!moduleId) {
        if (!cancelled) {
          setErr("Missing module id in route.");
          setModule(null);
          setLessons([]);
          setActiveIdx(0);
        }
        return;
      }

      try {
        if (!cancelled) setErr("");

        const moduleResponse = await apipGet<{ ok: boolean; module: Module }>(
          `/modules/${encodeURIComponent(moduleId)}`,
        );
        if (cancelled) return;

        const lessonsResponse = await apipGet<{
          ok: boolean;
          lessons: Lesson[];
          warnings?: string[];
        }>(`/modules/${encodeURIComponent(moduleId)}/lessons`);
        if (cancelled) return;

        const ordered = [...(lessonsResponse.lessons || [])].sort(
          (a, b) => (a.sequence ?? 999) - (b.sequence ?? 999),
        );

        setModule(moduleResponse.module);
        setLessons(ordered);
        setActiveIdx(0);
      } catch (error) {
        if (cancelled) return;

        setErr(error instanceof Error ? error.message : String(error));
        setModule(null);
        setLessons([]);
        setActiveIdx(0);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

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

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -0.5 }}>
          {module?.title || moduleId || "Module"}
        </div>

        {module?.description ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 18,
              opacity: 0.9,
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.5,
            }}
          >
            {module.description}
          </div>
        ) : null}

        {progressLabel ? (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 14px",
              border: "1px solid #333",
              borderRadius: 999,
              opacity: 0.9,
            }}
          >
            <span style={{ fontWeight: 800 }}>{progressLabel}</span>
            <span style={{ opacity: 0.8 }}>•</span>
            <span style={{ opacity: 0.85 }}>
              Follow the mission steps. No browsing.
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
          border: "1px solid #333",
          borderRadius: 18,
          padding: 16,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {activeLesson ? (
          <LessonRunner
            moduleId={moduleId}
            lesson={activeLesson}
            misconceptionAllowlist={module?.misconception_tag_allowlist || []}
            onRequestNextLesson={goNext}
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
              opacity: canGoBack ? 1 : 0.4,
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #333",
              fontWeight: 800,
            }}
          >
            ← Back
          </button>

          <div style={{ opacity: 0.8, textAlign: "center" }}>
            Finish this mission, then continue.
          </div>

          <button
            onClick={goNext}
            disabled={!canGoNext}
            style={{
              opacity: canGoNext ? 1 : 0.4,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #333",
              fontWeight: 900,
            }}
          >
            Continue →
          </button>
        </div>
      ) : null}
    </div>
  );
}