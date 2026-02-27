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
  const params = useParams<{ moduleId: string }>();
  const moduleId = decodeURIComponent(params.moduleId);

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [err, setErr] = useState<string>("");
  const [activeLessonId, setActiveLessonId] = useState<string>("");

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId]
  );

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const m = await apipGet<{ ok: boolean; module: Module }>(`/modules/${encodeURIComponent(moduleId)}`);
        setModule(m.module);

        const l = await apipGet<{ ok: boolean; lessons: Lesson[]; warnings?: string[] }>(
          `/modules/${encodeURIComponent(moduleId)}/lessons`
        );

        const ordered = [...(l.lessons || [])].sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
        setLessons(ordered);
        if (ordered.length > 0) setActiveLessonId(ordered[0].id);
      } catch (e: any) {
        setErr(String(e?.message || e));
      }
    })();
  }, [moduleId]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          {module?.title || moduleId}
        </div>
        <div style={{ opacity: 0.85, marginTop: 6 }}>
          {module?.description || ""}
        </div>
      </div>

      {err ? (
        <div style={{ border: "1px solid #800", padding: 12, borderRadius: 10, marginBottom: 16 }}>
          <b>Error:</b> {err}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Lessons</div>
          <div style={{ display: "grid", gap: 8 }}>
            {lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLessonId(l.id)}
                style={{
                  textAlign: "left",
                  border: "1px solid #333",
                  borderRadius: 10,
                  padding: 10,
                  opacity: l.id === activeLessonId ? 1 : 0.85,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  {(l.sequence ?? "?")}. {l.title || l.id}
                </div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>
                  {l.id}
                </div>
              </button>
            ))}
          </div>

          {module?.mastery_outcomes?.length ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Outcomes</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
                {module.mastery_outcomes.slice(0, 6).map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div style={{ border: "1px solid #333", borderRadius: 12, padding: 12 }}>
          {activeLesson ? (
            <LessonRunner
              moduleId={moduleId}
              lesson={activeLesson}
              misconceptionAllowlist={module?.misconception_tag_allowlist || []}
            />
          ) : (
            <div style={{ opacity: 0.8 }}>Select a lesson.</div>
          )}
        </div>
      </div>
    </div>
  );
}