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

type Lesson = {
  id: string;
  lesson_id?: string;
  title?: string;
  sequence?: number;
  module_id?: string;
  phases?: any;
};

export default function StudentModulePage() {
  // Next returns Record<string, string | string[]>
  const params = useParams() as Record<string, string | string[] | undefined>;

  // Support both keys defensively
  const raw =
    (params["moduleId"] ?? params["module"]) as string | string[] | undefined;

  const moduleId = useMemo(() => {
    if (!raw) return "";
    const v = Array.isArray(raw) ? raw[0] : raw;
    return decodeURIComponent(v);
  }, [raw]);

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [err, setErr] = useState<string>("");

  // ACSRM-only: student progresses linearly; no browsing list.
  const [activeIdx, setActiveIdx] = useState<number>(0);

  const activeLesson = useMemo(() => {
    if (!lessons.length) return null;
    const idx = Math.min(Math.max(activeIdx, 0), lessons.length - 1);
    return lessons[idx] || null;
  }, [lessons, activeIdx]);

  const progressLabel = useMemo(() => {
    if (!lessons.length) return "";
    return `Mission ${activeIdx + 1} of ${lessons.length}`;
  }, [lessons.length, activeIdx]);

  useEffect(() => {
    if (!moduleId) {
      setErr("Missing module id in route.");
      setModule(null);
      setLessons([]);
      setActiveIdx(0);
      return;
    }

    (async () => {
      try {
        setErr("");

        const m = await apipGet<{ ok: boolean; module: Module }>(
          `/modules/${encodeURIComponent(moduleId)}`
        );
        setModule(m.module);

        const l = await apipGet<{
          ok: boolean;
          lessons: Lesson[];
          warnings?: string[];
        }>(`/modules/${encodeURIComponent(moduleId)}/lessons`);

        const ordered = [...(l.lessons || [])].sort(
          (a, b) => (a.sequence ?? 999) - (b.sequence ?? 999)
        );

        setLessons(ordered);
        setActiveIdx(0);
      } catch (e: any) {
        setErr(String(e?.message || e));
        setModule(null);
        setLessons([]);
        setActiveIdx(0);
      }
    })();
  }, [moduleId]);

  const canGoBack = activeIdx > 0;
  const canGoNext = lessons.length > 0 && activeIdx < lessons.length - 1;

  function goBack() {
    if (!canGoBack) return;
    setActiveIdx((i) => Math.max(0, i - 1));
    // Scroll to top for “new screen” feel
    window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    if (!canGoNext) return;
    setActiveIdx((i) => Math.min(lessons.length - 1, i + 1));
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
      {/* ACSRM student shell: centered, big, clean */}
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

      {/* Main ACSRM runner card */}
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
          />
        ) : (
          <div style={{ padding: 18, textAlign: "center", opacity: 0.85 }}>
            Loading mission…
          </div>
        )}
      </div>

      {/* Student-friendly navigation (linear ACSRM). No lesson list, no IDs. */}
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