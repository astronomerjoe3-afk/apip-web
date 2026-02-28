"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";
import { auth } from "../lib/firebase";

/**
 * Student-only LessonRunner (ACR(M)-aligned)
 * - Teaching ALWAYS exists for F1 (fallback if Firestore lesson.phases missing)
 * - Single-focus screens: Gate -> Analogy -> Lab (once) -> Capsules -> Challenge -> Done
 * - No readiness/confidence bars; no internal IDs displayed
 * - “Commitment sentence” removed
 * - Dedupes repeated questions strongly
 * - Module mastery derived from HIGHEST lesson scores across ALL lessons in module
 */

type Props = {
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
  lessonOrderIds: string[]; // passed from module page
  onRequestNextLesson?: () => void;
};

type Item =
  | {
      type: "mcq";
      question_id?: string;
      prompt: string;
      choices: string[];
      correct_index?: number;
      misconception_tags?: string[];
      hint?: string;
    }
  | {
      type: "short";
      question_id?: string;
      prompt: string;
      misconception_tags?: string[];
      hint?: string;
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
  for (const t of tags) if (HINT_BY_TAG[t]) return HINT_BY_TAG[t];

  return "Tip: show units, and explain your reasoning in 1–2 sentences.";
}

function storageKey(moduleId: string) {
  const uid = auth.currentUser?.uid || "anon";
  return `apip:bestScores:${uid}:${moduleId}`;
}

type BestScores = Record<string, number>; // lessonId -> best [0..1]

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

/**
 * Module mastery MUST account for *all* lessons in the module:
 * - highest score per lesson
 * - unattempted lessons count as 0
 */
function computeModuleMastery(best: BestScores, lessonOrderIds: string[]) {
  const ids = lessonOrderIds || [];
  if (!ids.length) return 0;
  let sum = 0;
  for (const id of ids) sum += clamp01(Number(best[id] ?? 0));
  return clamp01(sum / ids.length);
}

/**
 * Strong dedupe: normalize prompt/choices; dedupe by question_id if present,
 * else by normalized fingerprint.
 */
function normalizeText(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function keyAndDedupe(items: Item[]) {
  const seen = new Set<string>();
  const out: any[] = [];

  for (const it of items || []) {
    const qid = normalizeText(String((it as any)?.question_id || ""));
    const prompt = normalizeText(String((it as any)?.prompt || ""));
    const choices = Array.isArray((it as any)?.choices)
      ? (it as any).choices.map((c: any) => normalizeText(String(c))).join("|")
      : "";

    const fp = qid ? `id:${qid}` : `p:${prompt}::c:${choices}`;
    if (seen.has(fp)) continue;
    seen.add(fp);

    out.push(it);
  }

  return out.map((it, idx) => ({
    ...(it as any),
    __key: String((it as any)?.question_id || `q_${idx}`),
  }));
}

function scoreMcq(items: any[], chosenMap: Record<string, number>) {
  const mcqs = (items || []).filter((x: any) => x?.type === "mcq");
  if (!mcqs.length) return null;

  let correct = 0;
  let total = 0;

  for (const q of mcqs) {
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
 * F1 fallback teaching pack (used ONLY if Firestore is missing phases).
 * This is not “questions only” — it provides analogy + lab prompt + capsules.
 */
function getF1Fallback(lesson: any) {
  const seq = Number(lesson?.sequence ?? 0);

  const mim = `Measurement Infrastructure Model (MIM)
• SI unit = standard construction code
• SI prefix = permit category (kilo-, milli-, micro-)
• Scalars = single-lane measurement (amount only)
• Vectors = directed pathway measurement (amount + direction)
• Significant figures = precision tolerance limit
• Error/uncertainty = construction deviation band
• Density = mass-per-capacity (how tightly packed)`;

  // One “lab” per lesson at most; lightweight guided activity until real sim_specs exist.
  const labPromptBySeq: Record<number, string[]> = {
    1: ["Use prefixes to convert values. Notice: the quantity stays the same; only the unit scale changes."],
    2: ["Add two arrows (direction matters). See how vectors can cancel even when you travelled."],
    3: ["Read a scale carefully. Your best reading includes a small uncertainty band (about half the smallest division)."],
    4: ["Change instrument resolution. Watch how reported digits must match the tool."],
    5: ["Measure mass and volume once. Compute density (mass per volume) and classify the material."],
    6: ["Compare precision vs accuracy using the dartboard idea: tight grouping vs close to true value."],
  };

  const capsulePromptsBySeq: Record<number, { title: string; prompts: string[] }> = {
    1: {
      title: "Concept Capsules: Units & Prefixes",
      prompts: [
        "Explain what a prefix does (kilo-, milli-, micro-) in one sentence.",
        "Show one conversion with units cancelling (example: km → m).",
      ],
    },
    2: {
      title: "Concept Capsules: Scalars vs Vectors",
      prompts: [
        "Explain the difference between distance and displacement.",
        "Give one example of a vector and include a direction.",
      ],
    },
    3: {
      title: "Concept Capsules: Reading Scales & Uncertainty",
      prompts: [
        "How do you estimate uncertainty from a scale?",
        "Why can two careful measurements be slightly different?",
      ],
    },
    4: {
      title: "Concept Capsules: Significant Figures",
      prompts: [
        "What does an extra decimal place *mean* about precision?",
        "When should you round in multi-step calculations?",
      ],
    },
    5: {
      title: "Concept Capsules: Density & Units",
      prompts: [
        "Explain density in words (no formula).",
        "Write correct density units and give one conversion idea (g/cm³ vs kg/m³).",
      ],
    },
    6: {
      title: "Concept Capsules: Precision vs Accuracy",
      prompts: [
        "Explain precision vs accuracy using the dartboard idea.",
        "Give one real-world example where precision matters.",
      ],
    },
  };

  return {
    analogyText: mim,
    simPrompts: labPromptBySeq[seq] || ["Do the activity once, then write one observation."],
    reconTitle: capsulePromptsBySeq[seq]?.title || "Concept Capsules",
    reconPrompts: capsulePromptsBySeq[seq]?.prompts || ["Explain the key idea in 2–4 sentences."],
  };
}

export default function LessonRunner({
  moduleId,
  lesson,
  misconceptionAllowlist,
  lessonOrderIds,
  onRequestNextLesson,
}: Props) {
  const phases = lesson?.phases || {};

  // Pull from Firestore if present…
  let diagnosticItems: any[] = keyAndDedupe((phases?.diagnostic?.items || []) as Item[]);
  let transferItems: any[] = keyAndDedupe((phases?.transfer?.items || []) as Item[]);
  let analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  let simLabId: string | null = phases?.simulation_inquiry?.lab_id || null;
  let simPrompts: string[] = phases?.simulation_inquiry?.inquiry_prompts || [];
  let reconPrompts: string[] = phases?.concept_reconstruction?.prompts || [];

  // …otherwise, inject F1 teaching defaults (so it’s not “questions only”).
  const needsTeachingFallback =
    moduleId === "F1" &&
    (!analogyText.trim() || !reconPrompts.length || !simPrompts.length);

  const f1Fallback = useMemo(() => (needsTeachingFallback ? getF1Fallback(lesson) : null), [needsTeachingFallback, lesson]);

  if (f1Fallback) {
    if (!analogyText.trim()) analogyText = f1Fallback.analogyText;
    if (!simPrompts.length) simPrompts = f1Fallback.simPrompts;
    if (!reconPrompts.length) reconPrompts = f1Fallback.reconPrompts;
  }

  const [step, setStep] = useState<"gate" | "analogy" | "lab" | "capsules" | "challenge" | "done">("gate");
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [status, setStatus] = useState<string>("");

  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});

  const [toolChoice, setToolChoice] = useState<"rough" | "precision" | "">("");
  const [toolWhy, setToolWhy] = useState<string>("");

  const [feedback, setFeedback] = useState<{ kind: "ok" | "warn"; title: string; body?: string } | null>(null);

  const [bestScores, setBestScores] = useState<BestScores>({});

  useEffect(() => {
    if (typeof window !== "undefined") setBestScores(readBestScores(moduleId));
  }, [moduleId]);

  useEffect(() => {
    setStep("gate");
    setStartedAt(Date.now());
    setStatus("");
    setFeedback(null);
    setMcq({});
    setShort({});
    setToolChoice("");
    setToolWhy("");
  }, [lesson?.id]);

  const lessonIdForScore = String(lesson?.id || lesson?.lesson_id || lesson?.title || "lesson");
  const moduleMastery = useMemo(() => computeModuleMastery(bestScores, lessonOrderIds), [bestScores, lessonOrderIds]);
  const masteryPct = Math.round(moduleMastery * 100);

  function durationSeconds() {
    return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  }

  function persistBestScore(newScore: number) {
    const prev = Number(bestScores[lessonIdForScore] ?? 0);
    const best = Math.max(prev, clamp01(newScore));
    const next = { ...bestScores, [lessonIdForScore]: best };
    setBestScores(next);
    writeBestScores(moduleId, next);
  }

  function isLessonCompleted() {
    return Number(bestScores[lessonIdForScore] ?? 0) >= PASS_THRESHOLD;
  }

  const studentOnlyTagsFor = (items: any[]) => {
    const tags: string[] = [];
    for (const it of items || []) {
      const t = (it as any)?.misconception_tags || [];
      for (const x of t) tags.push(String(x));
    }
    return allowTags([...new Set(tags)], misconceptionAllowlist);
  };

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

  async function submitGate() {
    const hasMcq = diagnosticItems.some((x: any) => x.type === "mcq");
    const hasShort = diagnosticItems.some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = diagnosticItems
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.question_id || q.__key || "")] !== "number");
      if (unanswered) return setFeedback({ kind: "warn", title: "Answer all questions to continue." });
    }
    if (hasShort) {
      const missing = diagnosticItems
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.question_id || q.__key || "")] || "").trim());
      if (missing) return setFeedback({ kind: "warn", title: "Write an answer for each written question to continue." });
    }

    const s = scoreMcq(diagnosticItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("diagnostic", score, studentOnlyTagsFor(diagnosticItems));
    persistBestScore(score);

    setStartedAt(Date.now());
    setStep("analogy");
    setFeedback(null);
  }

  async function submitAnalogy() {
    if (!toolChoice) return setFeedback({ kind: "warn", title: "Choose one tool to continue." });
    if (!toolWhy.trim()) return setFeedback({ kind: "warn", title: "Write 1–2 sentences explaining why." });

    await logEvent("reflection");
    setStartedAt(Date.now());
    setStep("lab");
    setFeedback(null);
  }

  async function submitLabOnce() {
    const notes = (short["lab_notes"] || "").trim();
    if (!notes) return setFeedback({ kind: "warn", title: "Write a short observation before continuing." });

    await logEvent("simulation");
    setStartedAt(Date.now());
    setStep("capsules");
    setFeedback(null);
  }

  async function submitCapsules() {
    const missing = (reconPrompts || []).some((_: string, i: number) => !(short[`cap_${i}`] || "").trim());
    if (missing) return setFeedback({ kind: "warn", title: "Answer each capsule question to continue." });

    await logEvent("reflection");
    setStartedAt(Date.now());
    setStep("challenge");
    setFeedback(null);
  }

  async function submitChallenge() {
    const hasMcq = transferItems.some((x: any) => x.type === "mcq");
    const hasShort = transferItems.some((x: any) => x.type === "short");

    if (hasMcq) {
      const unanswered = transferItems
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[String(q.question_id || q.__key || "")] !== "number");
      if (unanswered) return setFeedback({ kind: "warn", title: "Answer all questions to submit." });
    }
    if (hasShort) {
      const missing = transferItems
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[String(q.question_id || q.__key || "")] || "").trim());
      if (missing) return setFeedback({ kind: "warn", title: "Write an answer for each written question to submit." });
    }

    const s = scoreMcq(transferItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("transfer", score, studentOnlyTagsFor(transferItems));
    persistBestScore(score);

    const pct = Math.round(score * 100);
    const completed = Math.max(score, Number(bestScores[lessonIdForScore] ?? 0)) >= PASS_THRESHOLD;

    setFeedback({
      kind: score >= PASS_THRESHOLD ? "ok" : "warn",
      title: `Score: ${pct}%`,
      body: completed
        ? "Lesson marked completed."
        : "You can move on to the next lesson now. Practice later to reach 80–100% and mark it completed.",
    });

    setStep("done");
  }

  const completed = isLessonCompleted();
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

        <div style={styles.subtitle}>Focus on the prompts. Do your best. You can always practice again to improve your mastery.</div>
      </div>

      {feedback ? (
        <div style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackWarn}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{feedback.title}</div>
          {feedback.body ? <div style={{ marginTop: 6, opacity: 0.9 }}>{feedback.body}</div> : null}
        </div>
      ) : null}

      {status ? <div style={{ ...styles.card, textAlign: "center", marginBottom: 14, opacity: 0.9 }}>{status}</div> : null}

      <div style={styles.card}>
        {step === "gate" ? (
          <>
            <div style={styles.bigH2}>Gate</div>
            <p style={styles.bodyText}>Commit to answers first. Then we’ll build understanding.</p>
            <QuestionListStudent items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />
            <div style={styles.divider} />
            <button style={styles.btnPrimary} onClick={submitGate}>Continue →</button>
          </>
        ) : null}

        {step === "analogy" ? (
          <>
            <div style={styles.bigH2}>Analogy (MIM)</div>
            <p style={{ ...styles.bodyText, whiteSpace: "pre-wrap" }}>{analogyText}</p>

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
                <textarea style={styles.textarea} placeholder="Explain in 1–2 sentences…" value={toolWhy} onChange={(e) => setToolWhy(e.target.value)} />
                <div style={styles.hint}>Hint: precision controls reliability.</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitAnalogy}>Continue →</button>
            </div>
          </>
        ) : null}

        {step === "lab" ? (
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

        {step === "capsules" ? (
          <>
            <div style={styles.bigH2}>Concept Capsules</div>
            <p style={styles.bodyText}>Short explanations you must complete before the challenge.</p>

            <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
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

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitCapsules}>Continue →</button>
            </div>
          </>
        ) : null}

        {step === "challenge" ? (
          <>
            <div style={styles.bigH2}>Challenge</div>
            <p style={styles.bodyText}>This score affects your Module Mastery. Aim for 80–100%.</p>

            <QuestionListStudent items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={submitChallenge}>Submit ✓</button>
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
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setFeedback(null);
                  setStep("gate");
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
                  Hint: {pickHint(q)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
