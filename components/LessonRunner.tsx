"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";
import { auth } from "../lib/firebase";

/**
 * Student-only LessonRunner (ACRM-aligned):
 * - Shows only prompts + inputs + hints + feedback + Module Mastery
 * - No IDs, no tags, no step/debug, no confidence/readiness
 * - Virtual lab step runs once (if lab_id exists)
 * - Lesson considered "Completed" only when best >= 80%
 * - Student can move on even if not completed, after first attempt
 * - Module mastery shown as derived from highest lesson scores (client-side)
 * - Dedupes repeated questions coming from Firestore (reseed/merge issues)
 */

type Props = {
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
  onRequestNextLesson?: () => void;
};

type McqItem = {
  type: "mcq";
  question_id?: string;
  prompt: string;
  choices: string[];
  correct_index?: number;
  misconception_tags?: string[];
  hint?: string;
};

type ShortItem = {
  type: "short";
  question_id?: string;
  prompt: string;
  misconception_tags?: string[];
  hint?: string;
};

type Item = McqItem | ShortItem;

type ProgressMe = {
  ok: boolean;
  mastery_map?: Array<{
    module_id: string;
    mastery_score: number;
    readiness: string;
    engagement_seconds: number;
    last_event_utc?: string;
  }>;
};

const PASS_THRESHOLD = 0.8;

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function allowTags(tags: string[], allowlist: string[]) {
  const allow = new Set(allowlist || []);
  return (tags || []).filter((t) => allow.has(t));
}

const HINT_BY_TAG: Record<string, string> = {
  unit_conversion: "Tip: write the conversion factor, then multiply so units cancel.",
  si_prefixes: "Tip: kilo = 10³, milli = 10⁻³, micro = 10⁻⁶.",
  scalar_vs_vector: "Tip: vectors need BOTH magnitude and direction.",
  reading_scales: "Tip: uncertainty is usually about half the smallest division.",
  significant_figures: "Tip: your final answer can’t be more precise than your least-precise measurement.",
  rounding_rules: "Tip: round only at the end unless instructed otherwise.",
  precision_vs_accuracy: "Tip: precision = tight grouping; accuracy = close to true value.",
  random_vs_systematic_error: "Tip: systematic shifts results in one direction; random varies up/down.",
  uncertainty_estimation: "Tip: report a reasonable ± value based on the instrument scale.",
  density_concept: "Tip: density is how much mass is packed into each unit volume.",
  density_units: "Tip: check units carefully (e.g., g/cm³ vs kg/m³).",
};

function pickHint(item: any): string {
  if (typeof item?.hint === "string" && item.hint.trim()) return item.hint.trim();

  const tags = (item?.misconception_tags || []) as string[];
  for (const t of tags) {
    if (HINT_BY_TAG[t]) return HINT_BY_TAG[t];
  }
  return "Tip: show units, and explain your reasoning in 1–2 sentences.";
}

function storageKey(moduleId: string) {
  const uid = auth.currentUser?.uid || "anon";
  return `apip:bestScores:${uid}:${moduleId}`;
}

type BestScores = Record<string, number>; // lessonId -> best score [0..1]

function readBestScores(moduleId: string): BestScores {
  try {
    const raw = localStorage.getItem(storageKey(moduleId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: BestScores = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Number(v);
      if (!Number.isFinite(n)) continue;
      out[String(k)] = clamp01(n);
    }
    return out;
  } catch {
    return {};
  }
}

function writeBestScores(moduleId: string, best: BestScores) {
  try {
    localStorage.setItem(storageKey(moduleId), JSON.stringify(best));
  } catch {
    // ignore
  }
}

function computeModuleMastery(best: BestScores): number {
  const vals = Object.values(best).filter((n) => Number.isFinite(n));
  if (!vals.length) return 0;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return clamp01(avg);
}

/**
 * IMPORTANT:
 * - Score MCQ by question_id (preferred).
 * - If question_id missing, we fallback to a stable derived key created in keyItems().
 */
function scoreMcq(items: any[], chosenMap: Record<string, number>) {
  const mcqItems = (items || []).filter((x: any) => x?.type === "mcq") as any[];
  if (mcqItems.length === 0) return null;

  let correct = 0;
  let total = 0;

  for (const q of mcqItems) {
    const key = String(q?.question_id || q?.__key || "");
    const chosen = chosenMap[key];
    if (typeof chosen !== "number") continue;

    total += 1;
    if (typeof q.correct_index === "number" && chosen === q.correct_index) correct += 1;
  }

  if (total === 0) return 0;
  return clamp01(correct / total);
}

/**
 * Dedupe repeated questions caused by Firestore merges/reseeding.
 * - Prefer dedupe by question_id
 * - Else dedupe by prompt+choices fingerprint
 * Adds __key for stable state tracking.
 */
function keyItems(items: Item[]) {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const it of items || []) {
    const qid = String((it as any)?.question_id || "").trim();
    const prompt = String((it as any)?.prompt || "").trim();
    const choices = Array.isArray((it as any)?.choices) ? (it as any).choices.join("|") : "";
    const fingerprint = qid ? `id:${qid}` : `p:${prompt}::c:${choices}`;

    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    unique.push(it);
  }

  return unique.map((it, idx) => {
    const k = String((it as any)?.question_id || `q_${idx}`);
    return { ...(it as any), __key: k };
  });
}

export default function LessonRunner({ moduleId, lesson, misconceptionAllowlist, onRequestNextLesson }: Props) {
  const phases = lesson?.phases || {};

  const diagnosticItems: any[] = keyItems((phases?.diagnostic?.items || []) as Item[]);
  const transferItems: any[] = keyItems((phases?.transfer?.items || []) as Item[]);
  const analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  const reconPrompts: string[] = phases?.concept_reconstruction?.prompts || [];
  const sim = phases?.simulation_inquiry || {};
  const simLabId: string | null = sim?.lab_id || null;
  const simPrompts: string[] = sim?.inquiry_prompts || [];

  const [step, setStep] = useState<"prediction" | "analogy" | "lab" | "build" | "challenge" | "done">("prediction");
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [status, setStatus] = useState<string>("");

  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});

  const [toolChoice, setToolChoice] = useState<"rough" | "precision" | "">("");
  const [toolWhy, setToolWhy] = useState<string>("");

  const [feedback, setFeedback] = useState<{ kind: "ok" | "warn"; title: string; body?: string } | null>(null);

  const [bestScores, setBestScores] = useState<BestScores>({});
  const moduleMastery = useMemo(() => computeModuleMastery(bestScores), [bestScores]);

  const [progress, setProgress] = useState<ProgressMe | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setBestScores(readBestScores(moduleId));
  }, [moduleId]);

  useEffect(() => {
    setStep("prediction");
    setStartedAt(Date.now());
    setStatus("");
    setFeedback(null);
    setMcq({});
    setShort({});
    setToolChoice("");
    setToolWhy("");
  }, [lesson?.id]);

  const title = lesson?.title || "Lesson";

  function durationSeconds() {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }

  const lessonIdForScore = String(lesson?.id || lesson?.lesson_id || title);

  function persistBestScore(newScore: number) {
    const prev = Number(bestScores[lessonIdForScore] ?? 0);
    const best = Math.max(prev, clamp01(newScore));
    const next = { ...bestScores, [lessonIdForScore]: best };
    setBestScores(next);
    writeBestScores(moduleId, next);
  }

  function isLessonCompleted() {
    const best = Number(bestScores[lessonIdForScore] ?? 0);
    return best >= PASS_THRESHOLD;
  }

  const studentOnlyTagsFor = (items: any[]) => {
    const tags: string[] = [];
    for (const it of items || []) {
      const t = (it as any)?.misconception_tags || [];
      for (const x of t) tags.push(String(x));
    }
    return allowTags([...new Set(tags)], misconceptionAllowlist);
  };

  async function refreshProgress() {
    try {
      const p = await apipGet<ProgressMe>("/progress/me");
      setProgress(p);
    } catch {
      // non-fatal
    }
  }

  async function logEvent(event_type: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt", score?: number, tags?: string[]) {
    const payload: any = {
      event_type,
      duration_seconds: durationSeconds(),
      score: typeof score === "number" ? clamp01(score) : undefined,
      misconception_tags: allowTags(tags || [], misconceptionAllowlist),
      details: { lesson_id: lesson?.id, phase: step },
    };

    setStatus("Saving…");
    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    setStatus("");
  }

  async function submitPredictionGate() {
    const hasMcq = (diagnosticItems || []).some((x: any) => x.type === "mcq");
    const hasShort = (diagnosticItems || []).some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = (diagnosticItems || [])
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.question_id || q.__key || "")] !== "number");
      if (unanswered) {
        setFeedback({ kind: "warn", title: "Answer all questions to continue." });
        return;
      }
    }

    if (hasShort) {
      const missing = (diagnosticItems || [])
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.question_id || q.__key || "")] || "").trim());
      if (missing) {
        setFeedback({ kind: "warn", title: "Write an answer for each written question to continue." });
        return;
      }
    }

    const s = scoreMcq(diagnosticItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("diagnostic", score, studentOnlyTagsFor(diagnosticItems));
    await refreshProgress();
    persistBestScore(score);

    const pct = Math.round(score * 100);
    setFeedback({
      kind: score >= PASS_THRESHOLD ? "ok" : "warn",
      title: score >= PASS_THRESHOLD ? `Great start: ${pct}%` : `Good try: ${pct}%`,
      body:
        score >= PASS_THRESHOLD
          ? "You can continue."
          : "You can continue now. If you want, you can practice later to improve your mastery.",
    });

    setStartedAt(Date.now());
    setStep("analogy");
  }

  async function submitAnalogy() {
    if (!toolChoice) {
      setFeedback({ kind: "warn", title: "Choose one tool to continue." });
      return;
    }
    if (!toolWhy.trim()) {
      setFeedback({ kind: "warn", title: "Write 1–2 sentences explaining why." });
      return;
    }

    await logEvent("reflection", undefined, []);
    await refreshProgress();

    setStartedAt(Date.now());
    setStep(simLabId ? "lab" : "build");
  }

  async function submitLabOnce() {
    const notes = (short["lab_notes"] || "").trim();
    if (!notes) {
      setFeedback({ kind: "warn", title: "Write a short observation before continuing." });
      return;
    }

    await logEvent("simulation", undefined, studentOnlyTagsFor([]));
    await refreshProgress();

    setStartedAt(Date.now());
    setStep("build");
  }

  async function submitBuildConcepts() {
    const missing = (reconPrompts || []).some((_: string, i: number) => !(short[`recon_${i}`] || "").trim());
    if (missing) {
      setFeedback({ kind: "warn", title: "Answer each question to continue." });
      return;
    }

    await logEvent("reflection", undefined, []);
    await refreshProgress();

    setStartedAt(Date.now());
    setStep("challenge");
  }

  async function submitChallenge() {
    const hasMcq = (transferItems || []).some((x: any) => x.type === "mcq");
    const hasShort = (transferItems || []).some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = (transferItems || [])
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.question_id || q.__key || "")] !== "number");
      if (unanswered) {
        setFeedback({ kind: "warn", title: "Answer all questions to submit." });
        return;
      }
    }
    if (hasShort) {
      const missing = (transferItems || [])
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.question_id || q.__key || "")] || "").trim());
      if (missing) {
        setFeedback({ kind: "warn", title: "Write an answer for each written question to submit." });
        return;
      }
    }

    const s = scoreMcq(transferItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("transfer", score, studentOnlyTagsFor(transferItems));
    await refreshProgress();

    persistBestScore(score);

    const pct = Math.round(score * 100);
    const completed = Math.max(score, Number(bestScores[lessonIdForScore] ?? 0)) >= PASS_THRESHOLD;

    setFeedback({
      kind: score >= PASS_THRESHOLD ? "ok" : "warn",
      title: `Score: ${pct}%`,
      body: completed
        ? "Lesson marked completed."
        : "You can move on to the next lesson now. Repeat later to reach 80–100% and mark it completed.",
    });

    setStep("done");
  }

  const completed = isLessonCompleted();
  const masteryPct = Math.round(moduleMastery * 100);

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

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.lessonTitle}>{title}</div>

        <div style={styles.chipsRow}>
          <div style={styles.chip}>
            Module mastery: <b>{masteryPct}%</b>
          </div>
          <div style={styles.chip}>
            Lesson: <b>{completed ? "Completed" : "In progress"}</b>
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

      {status ? (
        <div style={{ ...styles.card, textAlign: "center", marginBottom: 14, opacity: 0.9 }}>{status}</div>
      ) : null}

      <div style={styles.card}>
        {step === "prediction" ? (
          <>
            <div style={styles.bigH2}>Prediction Gate</div>
            <p style={styles.bodyText}>Answer first. Then we’ll learn.</p>

            <QuestionListStudent items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={styles.divider} />

            <button style={styles.btnPrimary} onClick={submitPredictionGate}>
              Continue →
            </button>
          </>
        ) : null}

        {step === "analogy" ? (
          <>
            <div style={styles.bigH2}>Measurement Infrastructure Model (MIM)</div>

            {analogyText ? (
              <p style={{ ...styles.bodyText, whiteSpace: "pre-wrap" }}>{analogyText}</p>
            ) : (
              <p style={styles.bodyText}>Anchor the idea with a real engineering analogy.</p>
            )}

            <div style={styles.questionCard}>
              <div style={styles.prompt}>Choose a tool to measure a steel beam.</div>
              <div style={{ ...styles.bodyText, marginTop: -6, marginBottom: 12 }}>Which would engineers trust more — and why?</div>

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
                <textarea style={styles.textarea} placeholder="Explain in 1–2 sentences…" value={toolWhy} onChange={(e) => setToolWhy(e.target.value)} />
                <div style={styles.hint}>Hint: the more precise tool gives more reliable measurements.</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitAnalogy}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {step === "lab" ? (
          <>
            <div style={styles.bigH2}>Virtual Lab</div>

            {simLabId ? <p style={styles.bodyText}>Do the lab once, then write one observation.</p> : null}

            {simPrompts?.length ? (
              <div style={{ marginTop: 8, textAlign: "center", opacity: 0.95, fontSize: 18, lineHeight: 1.6 }}>
                {simPrompts.map((p: string, i: number) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    • {p}
                  </div>
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
              <div style={styles.hint}>Hint: mention precision/uncertainty and how results can change.</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitLabOnce}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {step === "build" ? (
          <>
            <div style={styles.bigH2}>Build the Idea</div>
            <p style={styles.bodyText}>Answer these short prompts to make the concept clear before the final challenge.</p>

            {reconPrompts?.length ? (
              <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                {reconPrompts.map((p: string, i: number) => (
                  <div key={i} style={styles.questionCard}>
                    <div style={styles.prompt}>{p}</div>
                    <textarea
                      style={styles.textarea}
                      value={short[`recon_${i}`] || ""}
                      onChange={(e) => setShort({ ...short, [`recon_${i}`]: e.target.value })}
                      placeholder="Write 2–4 sentences…"
                    />
                    <div style={styles.hint}>Hint: keep it simple; use units and examples.</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.bodyText}>No prompts provided.</p>
            )}

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitBuildConcepts}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {step === "challenge" ? (
          <>
            <div style={styles.bigH2}>Challenge</div>
            <p style={styles.bodyText}>This score affects your Module Mastery. Aim for 80–100%.</p>

            <QuestionListStudent items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitChallenge}>
                Submit ✓
              </button>
            </div>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <div style={styles.bigH2}>Lesson Finished</div>

            <p style={styles.bodyText}>
              {isLessonCompleted()
                ? "Completed ✅"
                : "Not completed yet — you can move on, and practice later to reach 80–100%."}
            </p>

            <div style={styles.footerRow}>
              <button style={styles.btnGhost} onClick={refreshProgress}>
                Refresh (optional)
              </button>

              <button
                style={styles.btnGhost}
                onClick={() => {
                  setFeedback(null);
                  setStep("prediction");
                  setStartedAt(Date.now());
                  setMcq({});
                  setShort({});
                  setToolChoice("");
                  setToolWhy("");
                }}
              >
                Practice this lesson
              </button>

              <button
                style={styles.btnGhost}
                onClick={() => {
                  if (onRequestNextLesson) onRequestNextLesson();
                  else setFeedback({ kind: "ok", title: "You can move on to the next lesson now." });
                }}
              >
                Next lesson →
              </button>
            </div>
          </>
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
        const key = String(q?.question_id || q?.__key || `q_${idx}`);

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
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12, lineHeight: 1.25 }}>{prompt}</div>

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
                <div style={{ marginTop: 10, fontSize: 15, opacity: 0.85, lineHeight: 1.45 }}>Hint: {pickHint(q)}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
