"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";

type Props = {
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
  lessonOrderIds: string[];
  onRequestNextLesson?: () => void;
  onLessonStateChanged?: () => void;
};

type RunnerStage = {
  key: string;
  label: string;
  available: boolean;
  completed: boolean;
  active: boolean;
};

type RunnerLesson = {
  lesson_id: string;
  title?: string | null;
  sequence?: number | null;
  best_score: number;
  mastery_threshold: number;
  mastery_achieved: boolean;
  can_advance: boolean;
  lesson_status: string;
  next_recommended_action: string;
  stages: RunnerStage[];
};

type RunnerModule = {
  module_id: string;
  module_mastery: number;
  lessons_completed_count: number;
  total_lessons: number;
};

type RunnerResponse = {
  ok: boolean;
  module: RunnerModule;
  lesson: RunnerLesson;
};

type ProgressLesson = {
  lesson_id: string;
  title?: string;
  sequence?: number;
  best_score: number;
  attempt_count: number;
  completed: boolean;
  can_advance: boolean;
  lab_available: boolean;
  lab_used: boolean;
  status: string;
};

type LessonProgressResponse = {
  ok: boolean;
  module: RunnerModule;
  lesson: ProgressLesson;
};

type Item =
  | {
      type: "mcq";
      prompt: string;
      choices: string[];
    }
  | {
      type: "short";
      prompt: string;
      choices?: null;
    };

const PASS_THRESHOLD = 0.8;

const HINT_BY_TAG: Record<string, string> = {
  unit_conversion: "Tip: write the conversion factor, then multiply so units cancel.",
  si_prefixes: "Tip: kilo = 10³, milli = 10⁻³, micro = 10⁻⁶.",
  scalar_vs_vector: "Tip: vectors need both magnitude and direction.",
  reading_scales: "Tip: uncertainty is usually about half the smallest division.",
  significant_figures: "Tip: your final answer cannot be more precise than your least-precise measurement.",
  rounding_rules: "Tip: round only at the end unless instructed otherwise.",
  precision_vs_accuracy: "Tip: precision = tight grouping; accuracy = close to true value.",
  random_vs_systematic_error: "Tip: systematic error shifts results in one direction; random error varies up/down.",
  uncertainty_estimation: "Tip: report a reasonable ± value based on the instrument scale.",
  density_concept: "Tip: density is how much mass is packed into each unit volume.",
  density_units: "Tip: check units carefully, for example g/cm³ vs kg/m³.",
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeText(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function keyAndDedupe(items: any[]) {
  const seen = new Set<string>();
  const out: any[] = [];

  for (const it of items || []) {
    const prompt = normalizeText(String(it?.prompt || ""));
    const choices = Array.isArray(it?.choices)
      ? it.choices.map((c: any) => normalizeText(String(c))).join("|")
      : "";

    const fp = `p:${prompt}::c:${choices}`;
    if (seen.has(fp)) continue;
    seen.add(fp);

    out.push({
      type: it?.type,
      prompt: it?.prompt,
      choices: Array.isArray(it?.choices) ? it.choices : null,
      __key: `q_${out.length}`,
    });
  }

  return out;
}

function scoreMcq(items: any[], chosenMap: Record<string, number>) {
  const mcqs = (items || []).filter((x: any) => x?.type === "mcq");
  if (!mcqs.length) return 0;

  let answered = 0;
  for (const q of mcqs) {
    const key = String(q?.__key || "");
    if (typeof chosenMap[key] === "number") answered += 1;
  }

  return answered > 0 ? 0.01 : 0;
}

function getLessonDisplayStatus(lesson: RunnerLesson | null, progress: ProgressLesson | null) {
  if (lesson?.mastery_achieved) return "Completed";
  if (progress?.status === "not_started") return "Not started";
  return "In progress";
}

function getModuleMasteryPercent(module: RunnerModule | null) {
  return Math.round(((module?.module_mastery || 0) as number) * 100);
}

function getActiveStage(lesson: RunnerLesson | null): string {
  const stage = lesson?.stages?.find((s) => s.active);
  return stage?.key || "diagnostic";
}

function pickHint(): string {
  return "Tip: explain your reasoning clearly and include units where relevant.";
}

export default function LessonRunner({
  moduleId,
  lesson,
  onRequestNextLesson,
  onLessonStateChanged,
}: Props) {
  const lessonId = String(lesson?.lesson_id || lesson?.id || "");
  const phases = lesson?.phases || {};

  const diagnosticItems = useMemo(
    () => keyAndDedupe((phases?.diagnostic?.items || []) as Item[]),
    [phases]
  );
  const transferItems = useMemo(
    () => keyAndDedupe((phases?.transfer?.items || []) as Item[]),
    [phases]
  );

  const analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  const simPrompts: string[] = phases?.simulation_inquiry?.inquiry_prompts || [];
  const reconPrompts: string[] = phases?.concept_reconstruction?.prompts || [];

  const [runner, setRunner] = useState<RunnerResponse | null>(null);
  const [progress, setProgress] = useState<LessonProgressResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");

  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});
  const [toolChoice, setToolChoice] = useState<"rough" | "precision" | "">("");
  const [toolWhy, setToolWhy] = useState<string>("");

  const [feedback, setFeedback] = useState<{ kind: "ok" | "warn"; title: string; body?: string } | null>(null);
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  async function refreshState() {
    if (!moduleId || !lessonId) return;

    const [runnerResp, progressResp] = await Promise.all([
      apipGet<RunnerResponse>(
        `/student/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/runner`
      ),
      apipGet<LessonProgressResponse>(
        `/student/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/progress`
      ),
    ]);

    setRunner(runnerResp);
    setProgress(progressResp);
  }

  useEffect(() => {
    if (!moduleId || !lessonId) return;

    setLoading(true);
    setFeedback(null);
    setStatus("");
    setMcq({});
    setShort({});
    setToolChoice("");
    setToolWhy("");
    setStartedAt(Date.now());

    (async () => {
      try {
        await refreshState();
      } finally {
        setLoading(false);
      }
    })();
  }, [moduleId, lessonId]);

  function durationSeconds() {
    return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  }

  async function logEvent(
    event_type: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt",
    score?: number
  ) {
    const payload: any = {
      event_type,
      duration_seconds: durationSeconds(),
      score: typeof score === "number" ? clamp01(score) : undefined,
      details: { lesson_id: lessonId },
    };

    setStatus("Saving…");
    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    setStatus("");

    await refreshState();
    onLessonStateChanged?.();
  }

  async function submitDiagnostic() {
    const hasMcq = diagnosticItems.some((x: any) => x.type === "mcq");
    const hasShort = diagnosticItems.some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = diagnosticItems
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.__key || "")] !== "number");
      if (unanswered) {
        setFeedback({ kind: "warn", title: "Answer all questions to continue." });
        return;
      }
    }

    if (hasShort) {
      const missing = diagnosticItems
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.__key || "")] || "").trim());
      if (missing) {
        setFeedback({ kind: "warn", title: "Write an answer for each written question to continue." });
        return;
      }
    }

    const score = scoreMcq(diagnosticItems, mcq);
    await logEvent("diagnostic", score);
    setFeedback({ kind: "ok", title: "Diagnostic submitted.", body: "Continue with the lesson guidance." });
    setStartedAt(Date.now());
  }

  async function submitTeachingReflection() {
    if (!toolChoice) {
      setFeedback({ kind: "warn", title: "Choose one tool to continue." });
      return;
    }
    if (!toolWhy.trim()) {
      setFeedback({ kind: "warn", title: "Write 1–2 sentences explaining why." });
      return;
    }

    await logEvent("reflection");
    setFeedback({ kind: "ok", title: "Good. Continue to the next stage." });
    setStartedAt(Date.now());
  }

  async function submitLabOnce() {
    const notes = (short["lab_notes"] || "").trim();
    if (!notes) {
      setFeedback({ kind: "warn", title: "Write a short observation before continuing." });
      return;
    }

    await logEvent("simulation");
    setFeedback({ kind: "ok", title: "Lab recorded.", body: "The virtual lab is now counted as used." });
    setStartedAt(Date.now());
  }

  async function submitMasteryCheck() {
    const hasMcq = transferItems.some((x: any) => x.type === "mcq");
    const hasShort = transferItems.some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = transferItems
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.__key || "")] !== "number");
      if (unanswered) {
        setFeedback({ kind: "warn", title: "Answer all questions to submit." });
        return;
      }
    }

    if (hasShort) {
      const missing = transferItems
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.__key || "")] || "").trim());
      if (missing) {
        setFeedback({ kind: "warn", title: "Write an answer for each written question to submit." });
        return;
      }
    }

    const score = scoreMcq(transferItems, mcq);
    await logEvent("transfer", score);

    const refreshed = await apipGet<LessonProgressResponse>(
      `/student/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/progress`
    );
    setProgress(refreshed);
    onLessonStateChanged?.();

    const passed = Boolean(refreshed.lesson.completed);
    const pct = Math.round((refreshed.lesson.best_score || 0) * 100);

    setFeedback({
      kind: passed ? "ok" : "warn",
      title: `Score: ${pct}%`,
      body: passed
        ? "Lesson completed. You can continue to the next lesson."
        : "Keep working until you reach 80% or higher.",
    });

    setStartedAt(Date.now());
  }

  const moduleMastery = getModuleMasteryPercent(runner?.module || null);
  const lessonStatus = getLessonDisplayStatus(runner?.lesson || null, progress?.lesson || null);
  const activeStage = getActiveStage(runner?.lesson || null);
  const canAdvance = Boolean(runner?.lesson?.can_advance);
  const title = lesson?.title || "Lesson";

  const styles = {
    wrap: { maxWidth: 980, margin: "0 auto", padding: "22px 16px 26px 16px" } as React.CSSProperties,
    header: { textAlign: "center", marginBottom: 18 } as React.CSSProperties,
    lessonTitle: { fontSize: 56, fontWeight: 900, lineHeight: 1.05, margin: "0 0 10px 0", letterSpacing: -0.5 } as React.CSSProperties,
    subtitle: { fontSize: 18, opacity: 0.85, marginBottom: 14 } as React.CSSProperties,
    chipsRow: { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 18 } as React.CSSProperties,
    chip: {
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 999,
      padding: "8px 14px",
      fontSize: 14,
      fontWeight: 800,
      opacity: 0.9,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(8px)",
    } as React.CSSProperties,
    card: {
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 18,
      padding: 18,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
    } as React.CSSProperties,
    bigH2: { fontSize: 34, fontWeight: 900, textAlign: "center", margin: "4px 0 10px 0", letterSpacing: -0.2 } as React.CSSProperties,
    bodyText: { fontSize: 18, opacity: 0.9, textAlign: "center", lineHeight: 1.55, margin: "0 0 14px 0" } as React.CSSProperties,
    divider: { height: 1, background: "rgba(255,255,255,0.10)", margin: "14px 0" } as React.CSSProperties,
    btnPrimary: {
      width: "100%",
      height: 64,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.10)",
      color: "white",
      fontSize: 20,
      fontWeight: 900,
      cursor: "pointer",
    } as React.CSSProperties,
    btnGhost: {
      height: 48,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "transparent",
      color: "white",
      fontSize: 16,
      fontWeight: 800,
      padding: "0 14px",
      cursor: "pointer",
      opacity: 0.9,
    } as React.CSSProperties,
    feedbackOk: {
      border: "1px solid rgba(0,200,120,0.5)",
      background: "rgba(0,200,120,0.10)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      textAlign: "center",
    } as React.CSSProperties,
    feedbackWarn: {
      border: "1px solid rgba(220,60,60,0.55)",
      background: "rgba(220,60,60,0.10)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 14,
      textAlign: "center",
    } as React.CSSProperties,
    questionCard: { border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16, marginTop: 12 } as React.CSSProperties,
    prompt: { fontSize: 22, fontWeight: 900, marginBottom: 12, lineHeight: 1.25 } as React.CSSProperties,
    choiceGrid: { display: "grid", gap: 10 } as React.CSSProperties,
    choiceBtn: (active: boolean) =>
      ({
        textAlign: "left",
        padding: "14px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        background: active ? "rgba(155, 81, 224, 0.22)" : "rgba(255,255,255,0.06)",
        cursor: "pointer",
        fontSize: 18,
        fontWeight: 800,
        color: "white",
      } as React.CSSProperties),
    textarea: {
      width: "100%",
      minHeight: 88,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      padding: 12,
      fontSize: 18,
      lineHeight: 1.4,
      outline: "none",
    } as React.CSSProperties,
    hint: { marginTop: 10, fontSize: 15, opacity: 0.85, lineHeight: 1.45 } as React.CSSProperties,
    footerRow: { display: "flex", justifyContent: "space-between", gap: 12, marginTop: 14, opacity: 0.9, alignItems: "center" } as React.CSSProperties,
  };

  if (loading) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", opacity: 0.85 }}>Loading lesson state…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.lessonTitle}>{title}</div>

        <div style={styles.chipsRow}>
          <div style={styles.chip}>
            Module mastery: <b>{moduleMastery}%</b>
          </div>
          <div style={styles.chip}>
            Lesson: <b>{lessonStatus}</b>
          </div>
        </div>

        <div style={styles.subtitle}>
          Focus on the prompts. Do your best. You can always practice again to improve your mastery.
        </div>
      </div>

      {feedback ? (
        <div style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackWarn}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{feedback.title}</div>
          {feedback.body ? <div style={{ marginTop: 6, opacity: 0.9 }}>{feedback.body}</div> : null}
        </div>
      ) : null}

      {status ? <div style={{ ...styles.card, textAlign: "center", marginBottom: 14, opacity: 0.9 }}>{status}</div> : null}

      <div style={styles.card}>
        {activeStage === "diagnostic" ? (
          <>
            <div style={styles.bigH2}>Initial diagnostic</div>
            <p style={styles.bodyText}>Answer first. Then we will build understanding.</p>
            <QuestionListStudent items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />
            <div style={styles.divider} />
            <button style={styles.btnPrimary} onClick={submitDiagnostic}>Continue →</button>
          </>
        ) : null}

        {activeStage === "scaffolded_teaching" ? (
          <>
            <div style={styles.bigH2}>Guided concept building</div>
            {analogyText ? <p style={{ ...styles.bodyText, whiteSpace: "pre-wrap" }}>{analogyText}</p> : null}

            <div style={styles.questionCard}>
              <div style={styles.prompt}>Tool Trust</div>
              <div style={{ ...styles.bodyText, marginTop: -6, marginBottom: 12 }}>
                Choose the tool engineers would trust more — and explain why.
              </div>

              <div style={styles.choiceGrid}>
                <button style={styles.choiceBtn(toolChoice === "rough")} onClick={() => setToolChoice("rough")}>
                  Rough ruler (±1 cm)
                </button>
                <button style={styles.choiceBtn(toolChoice === "precision")} onClick={() => setToolChoice("precision")}>
                  Precision caliper (±0.01 cm)
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Your explanation</div>
                <textarea
                  style={styles.textarea}
                  placeholder="Explain in 1–2 sentences…"
                  value={toolWhy}
                  onChange={(e) => setToolWhy(e.target.value)}
                />
                <div style={styles.hint}>Hint: precision controls reliability.</div>
              </div>
            </div>

            {reconPrompts?.length ? (
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {reconPrompts.map((p: string, i: number) => (
                  <div key={i} style={styles.questionCard}>
                    <div style={styles.prompt}>{p}</div>
                    <textarea
                      style={styles.textarea}
                      value={short[`cap_${i}`] || ""}
                      onChange={(e) => setShort({ ...short, [`cap_${i}`]: e.target.value })}
                      placeholder="Write 2–4 sentences…"
                    />
                    <div style={styles.hint}>Hint: keep it simple; include units and a concrete example.</div>
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitTeachingReflection}>Continue →</button>
            </div>
          </>
        ) : null}

        {activeStage === "simulation" ? (
          <>
            <div style={styles.bigH2}>Virtual Lab</div>
            <p style={styles.bodyText}>Do this once, then write one observation.</p>

            {simPrompts?.length ? (
              <div style={{ marginTop: 8, textAlign: "center", opacity: 0.95, fontSize: 18, lineHeight: 1.6 }}>
                {simPrompts.map((p: string, i: number) => (
                  <div key={i} style={{ marginBottom: 6 }}>• {p}</div>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Your observation</div>
              <textarea
                style={styles.textarea}
                placeholder="Write what you noticed…"
                value={short["lab_notes"] || ""}
                onChange={(e) => setShort({ ...short, lab_notes: e.target.value })}
              />
              <div style={styles.hint}>Hint: mention precision/uncertainty and why results can vary.</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitLabOnce}>Continue →</button>
            </div>
          </>
        ) : null}

        {activeStage === "mastery_check" ? (
          <>
            <div style={styles.bigH2}>Mastery check</div>
            <p style={styles.bodyText}>Reach 80–100% to unlock the next lesson.</p>

            <QuestionListStudent items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitMasteryCheck}>Submit ✓</button>
            </div>
          </>
        ) : null}

        {runner?.lesson?.mastery_achieved ? (
          <div style={{ marginTop: 14 }}>
            <div style={styles.feedbackOk}>
              <div style={{ fontSize: 18, fontWeight: 900 }}>Lesson completed</div>
              <div style={{ marginTop: 6, opacity: 0.9 }}>You reached the mastery threshold and can move to the next lesson.</div>
            </div>

            <div style={styles.footerRow}>
              <div style={{ opacity: 0.85 }}>
                Score: {Math.round((runner.lesson.best_score || 0) * 100)}%
              </div>

              <button
                style={styles.btnGhost}
                onClick={() => {
                  if (canAdvance && onRequestNextLesson) onRequestNextLesson();
                }}
                disabled={!canAdvance}
              >
                Next lesson →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuestionListStudent({
  items,
  mcq,
  setMcq,
  short,
  setShort,
}: {
  items: any[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
}) {
  if (!items?.length) return <div style={{ opacity: 0.85, textAlign: "center" }}>No questions.</div>;

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
      {items.map((q: any, idx: number) => {
        const prompt = String(q?.prompt || "");
        const key = String(q?.__key || `q_${idx}`);

        return (
          <div
            key={key}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              padding: 16,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12, lineHeight: 1.25 }}>
              {prompt}
            </div>

            {q.type === "mcq" ? (
              <div style={{ display: "grid", gap: 10 }}>
                {(q.choices || []).map((c: string, cidx: number) => {
                  const active = mcq[key] === cidx;
                  return (
                    <button
                      key={cidx}
                      onClick={() => setMcq({ ...mcq, [key]: cidx })}
                      style={{
                        textAlign: "left",
                        padding: "14px 14px",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: active ? "rgba(155, 81, 224, 0.22)" : "rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: 96,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    padding: 12,
                    fontSize: 18,
                    lineHeight: 1.4,
                    outline: "none",
                  }}
                  value={short[key] || ""}
                  onChange={(e) => setShort({ ...short, [key]: e.target.value })}
                  placeholder="Write your answer…"
                />
                <div style={{ marginTop: 10, fontSize: 15, opacity: 0.85, lineHeight: 1.45 }}>
                  Hint: {pickHint()}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
