"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";
import { auth } from "../lib/firebase";

/**
 * Student-only LessonRunner (ACSRM Level-1 aligned):
 * - Single-focus screens (one primary task per screen)
 * - Persistent header: Back (optional), Stepper, Module Mastery, Help drawer
 * - Bottom tray: Hint (for written), Next/Submit actions, Lock reasons
 *
 * Student-visible:
 * - Prompts, inputs, hints, feedback
 * - Module mastery only (derived from highest lesson scores)
 *
 * Hidden/internal:
 * - No IDs, no tags, no debug, no readiness/confidence
 *
 * Rules enforced:
 * - Virtual lab happens at most once (if lab_id exists)
 * - A question must not appear more than once (each list used once)
 * - Student may move on after first attempt even if not completed
 * - Lesson marked “Completed” only when best >= 80%
 * - Only highest score is kept for mastery indicator
 */

type Props = {
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
  onRequestNextLesson?: () => void;
  onRequestPrevLesson?: () => void;
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
  return "Tip: show units and explain your reasoning in 1–2 sentences.";
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

type KeyedItem = Item & { __key: string };

function keyItems(items: Item[]) {
  return (items || []).map((it, idx) => {
    const k = String((it as any)?.question_id || `q_${idx}`);
    return { ...(it as any), __key: k } as KeyedItem;
  });
}

function scoreMcq(items: KeyedItem[], chosenMap: Record<string, number>) {
  const mcqItems = items.filter((x) => x.type === "mcq") as (McqItem & { __key: string })[];
  if (mcqItems.length === 0) return null;

  let correct = 0;
  let total = 0;

  for (const q of mcqItems) {
    const chosen = chosenMap[q.__key];
    if (typeof chosen !== "number") continue;

    total += 1;
    if (typeof q.correct_index === "number" && chosen === q.correct_index) correct += 1;
  }

  if (total === 0) return 0;
  return clamp01(correct / total);
}

export default function LessonRunner({
  moduleId,
  lesson,
  misconceptionAllowlist,
  onRequestNextLesson,
  onRequestPrevLesson,
}: Props) {
  const phases = lesson?.phases || {};

  // Map your seeded phases into a strict ACSR(M) loop with gating:
  // 1) Commitment Gate   <- diagnostic items (no hints shown here)
  // 2) Concept-build (MIM) <- analogical grounding + tool-trust + short explanation (hints allowed)
  // 3) Simulation conflict (once) <- simulation_inquiry (if lab_id exists)
  // 4) Concept Capsules (short, mandatory) <- concept_reconstruction prompts broken into micro screens
  // 5) Challenge (scored) <- transfer items
  // 6) Report + allow move-on

  const diagnosticItems = useMemo(() => keyItems((phases?.diagnostic?.items || []) as Item[]), [phases]);
  const transferItems = useMemo(() => keyItems((phases?.transfer?.items || []) as Item[]), [phases]);

  const analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  const commitmentPrompt: string = phases?.analogical_grounding?.commitment_prompt || "";

  const reconPrompts: string[] = phases?.concept_reconstruction?.prompts || [];

  const sim = phases?.simulation_inquiry || {};
  const simLabId: string | null = sim?.lab_id || null;
  const simPrompts: string[] = sim?.inquiry_prompts || [];

  const title = lesson?.title || "Lesson";
  const lessonIdForScore = String(lesson?.id || lesson?.lesson_id || title);

  const [screen, setScreen] = useState<
    "commit" | "mim" | "sim" | "capsules" | "challenge" | "report"
  >("commit");

  // capsule index for single-focus screens
  const [capsuleIndex, setCapsuleIndex] = useState(0);

  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [saving, setSaving] = useState<string>("");

  // responses keyed by __key
  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});

  // MIM tool-trust interaction
  const [toolChoice, setToolChoice] = useState<"rough" | "precision" | "">("");
  const [toolWhy, setToolWhy] = useState<string>("");

  // feedback banner
  const [feedback, setFeedback] = useState<{ kind: "ok" | "warn"; title: string; body?: string } | null>(
    null
  );

  // best-score mastery
  const [bestScores, setBestScores] = useState<BestScores>({});
  const moduleMastery = useMemo(() => computeModuleMastery(bestScores), [bestScores]);

  // hidden backend progress (optional)
  const [progress, setProgress] = useState<ProgressMe | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setBestScores(readBestScores(moduleId));
  }, [moduleId]);

  useEffect(() => {
    // reset on lesson change
    setScreen("commit");
    setCapsuleIndex(0);
    setStartedAt(Date.now());
    setSaving("");
    setFeedback(null);
    setMcq({});
    setShort({});
    setToolChoice("");
    setToolWhy("");
  }, [lesson?.id]);

  function durationSeconds() {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }

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

  const moduleMasteryPct = Math.round(moduleMastery * 100);

  const studentOnlyTagsFor = (items: KeyedItem[]) => {
    const tags: string[] = [];
    for (const it of items) {
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
      details: {
        lesson_id: lesson?.id,
        screen,
      },
    };

    setSaving("Saving…");
    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    setSaving("");
  }

  // -----------------------------
  // Gating helpers
  // -----------------------------

  function requireAllAnswered(items: KeyedItem[], allowHints: boolean) {
    const hasMcq = items.some((x: any) => x.type === "mcq");
    const hasShort = items.some((x: any) => x.type === "short");

    if (hasMcq) {
      const missing = items
        .filter((x: any) => x.type === "mcq")
        .some((q: any) => typeof mcq[q.__key] !== "number");
      if (missing) {
        setFeedback({ kind: "warn", title: "Answer all questions to continue." });
        return false;
      }
    }

    if (hasShort) {
      const missing = items
        .filter((x: any) => x.type === "short")
        .some((q: any) => !(short[q.__key] || "").trim());
      if (missing) {
        setFeedback({
          kind: "warn",
          title: "Write an answer for each written question to continue.",
          body: allowHints ? "Use the hint under each writing box." : undefined,
        });
        return false;
      }
    }

    return true;
  }

  // -----------------------------
  // Submit handlers (single-focus)
  // -----------------------------

  async function submitCommitmentGate() {
    // Commitment Gate = formative score from diagnostic MCQs only
    // (We do not show hints here.)
    if (!requireAllAnswered(diagnosticItems, false)) return;

    const s = scoreMcq(diagnosticItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("diagnostic", score, studentOnlyTagsFor(diagnosticItems));
    await refreshProgress();

    // Keep highest only
    persistBestScore(score);

    const pct = Math.round(score * 100);
    setFeedback({
      kind: score >= PASS_THRESHOLD ? "ok" : "warn",
      title: score >= PASS_THRESHOLD ? `Strong start: ${pct}%` : `Start recorded: ${pct}%`,
      body: "Now we build the idea with an engineering anchor.",
    });

    setStartedAt(Date.now());
    setScreen("mim");
  }

  async function submitMIM() {
    // Require tool choice + why + optional commitment sentence
    if (!toolChoice) {
      setFeedback({ kind: "warn", title: "Choose one tool to continue." });
      return;
    }
    if (!toolWhy.trim()) {
      setFeedback({ kind: "warn", title: "Write 1–2 sentences explaining why." });
      return;
    }
    if (commitmentPrompt && !(short["commitment"] || "").trim()) {
      setFeedback({ kind: "warn", title: "Write 1 sentence before continuing." });
      return;
    }

    await logEvent("reflection", undefined, []);
    await refreshProgress();

    setStartedAt(Date.now());
    setScreen(simLabId ? "sim" : "capsules");
  }

  async function submitSimOnce() {
    // Virtual lab only once; require one observation
    const notes = (short["lab_notes"] || "").trim();
    if (!notes) {
      setFeedback({ kind: "warn", title: "Write one observation before continuing." });
      return;
    }

    await logEvent("simulation", undefined, []);
    await refreshProgress();

    setStartedAt(Date.now());
    setScreen("capsules");
  }

  function capsulePromptText(i: number) {
    // “Concept-build chipped immediately after sim”
    // We turn reconPrompts into 60–120s “capsules” with micro checks (written)
    return reconPrompts[i] || "";
  }

  async function submitCapsule() {
    const key = `caps_${capsuleIndex}`;
    const ans = (short[key] || "").trim();
    if (!ans) {
      setFeedback({ kind: "warn", title: "Write a short answer to continue.", body: "Use the hint below." });
      return;
    }

    // attempt event for capsules (not persisted server-side by your backend)
    await logEvent("attempt", undefined, []);

    // move to next capsule or challenge
    const next = capsuleIndex + 1;
    if (next < reconPrompts.length) {
      setCapsuleIndex(next);
      setFeedback(null);
      setStartedAt(Date.now());
      return;
    }

    setFeedback({
      kind: "ok",
      title: "Concept-build complete ✅",
      body: "Now take the challenge. Aim for 80–100% to mark the lesson completed.",
    });
    setStartedAt(Date.now());
    setScreen("challenge");
  }

  async function submitChallenge() {
    // Challenge = transfer (scored)
    if (!requireAllAnswered(transferItems, true)) return;

    const s = scoreMcq(transferItems, mcq);
    const score = typeof s === "number" ? s : 0;

    await logEvent("transfer", score, studentOnlyTagsFor(transferItems));
    await refreshProgress();

    persistBestScore(score);

    const pct = Math.round(score * 100);
    const bestNow = Math.max(Number(bestScores[lessonIdForScore] ?? 0), score);
    const completed = bestNow >= PASS_THRESHOLD;

    setFeedback({
      kind: score >= PASS_THRESHOLD ? "ok" : "warn",
      title: `Score: ${pct}%`,
      body: completed
        ? "Lesson marked completed ✅"
        : "You can move on now. Practice later to reach 80–100% and mark it completed.",
    });

    setScreen("report");
  }

  // -----------------------------
  // UI
  // -----------------------------

  const completed = isLessonCompleted();

  const steps = useMemo(() => {
    const out: Array<{ id: typeof screen; label: string }> = [
      { id: "commit", label: "Commit" },
      { id: "mim", label: "Build" },
    ];
    if (simLabId) out.push({ id: "sim", label: "Sim" });
    out.push({ id: "capsules", label: "Clarify" });
    out.push({ id: "challenge", label: "Challenge" });
    out.push({ id: "report", label: "Finish" });
    return out;
  }, [simLabId]);

  const stepIndex = steps.findIndex((s) => s.id === screen);
  const stepText = `Step ${Math.max(1, stepIndex + 1)} / ${steps.length}`;

  const [helpOpen, setHelpOpen] = useState(false);

  const styles = {
    page: {
      maxWidth: 1040,
      margin: "0 auto",
      padding: "16px 16px 24px 16px",
    } as React.CSSProperties,

    topbar: {
      position: "sticky" as const,
      top: 0,
      zIndex: 5,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(14px)",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    } as React.CSSProperties,

    topLeft: { display: "flex", alignItems: "center", gap: 10 } as React.CSSProperties,
    topRight: { display: "flex", alignItems: "center", gap: 10 } as React.CSSProperties,

    btn: {
      height: 44,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(255,255,255,0.06)",
      color: "white",
      fontSize: 14,
      fontWeight: 900,
      padding: "0 12px",
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
    } as React.CSSProperties,

    chip: {
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 999,
      padding: "8px 12px",
      fontSize: 13,
      fontWeight: 900,
      opacity: 0.95,
      background: "rgba(255,255,255,0.04)",
    } as React.CSSProperties,

    header: { textAlign: "center", marginBottom: 14 } as React.CSSProperties,
    title: { fontSize: 52, fontWeight: 950, lineHeight: 1.05, margin: "10px 0 8px 0" } as React.CSSProperties,
    subtitle: { fontSize: 18, opacity: 0.85, lineHeight: 1.55, margin: 0 } as React.CSSProperties,

    card: {
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 18,
      padding: 18,
      background: "rgba(0,0,0,0.35)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 48px rgba(0,0,0,0.35)",
    } as React.CSSProperties,

    bigH2: { fontSize: 34, fontWeight: 950, textAlign: "center", margin: "2px 0 10px 0" } as React.CSSProperties,
    body: { fontSize: 18, opacity: 0.92, textAlign: "center", lineHeight: 1.6, margin: "0 0 14px 0" } as React.CSSProperties,

    feedbackOk: {
      border: "1px solid rgba(0,200,120,0.55)",
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

    questionCard: {
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
      background: "rgba(255,255,255,0.03)",
    } as React.CSSProperties,

    prompt: { fontSize: 22, fontWeight: 950, marginBottom: 10, lineHeight: 1.25 } as React.CSSProperties,

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
        fontWeight: 900,
        color: "white",
      } as React.CSSProperties),

    textarea: {
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
    } as React.CSSProperties,

    hint: { marginTop: 10, fontSize: 15, opacity: 0.88, lineHeight: 1.45 } as React.CSSProperties,

    bottomTray: {
      marginTop: 14,
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(0,0,0,0.40)",
      padding: 12,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap" as const,
    } as React.CSSProperties,

    primaryBtn: {
      height: 54,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.10)",
      color: "white",
      fontSize: 18,
      fontWeight: 950,
      padding: "0 18px",
      cursor: "pointer",
      minWidth: 220,
    } as React.CSSProperties,

    drawer: {
      position: "fixed" as const,
      top: 0,
      right: 0,
      height: "100vh",
      width: 360,
      background: "rgba(0,0,0,0.92)",
      borderLeft: "1px solid rgba(255,255,255,0.12)",
      padding: 16,
      zIndex: 20,
      boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
    } as React.CSSProperties,

    drawerTitle: { fontSize: 18, fontWeight: 950, marginBottom: 10 } as React.CSSProperties,
    drawerItem: {
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 14,
      padding: 12,
      background: "rgba(255,255,255,0.04)",
      marginBottom: 10,
      opacity: 0.95,
      lineHeight: 1.45,
    } as React.CSSProperties,
  };

  return (
    <div style={styles.page}>
      {/* Persistent header */}
      <div style={styles.topbar}>
        <div style={styles.topLeft}>
          {onRequestPrevLesson ? (
            <button style={styles.btn} onClick={onRequestPrevLesson}>
              ← Back
            </button>
          ) : (
            <div style={{ ...styles.chip, opacity: 0.9 }}>{stepText}</div>
          )}
          <div style={styles.chip}>
            Module mastery: <b>{moduleMasteryPct}%</b>
          </div>
          <div style={styles.chip}>
            Lesson: <b>{completed ? "Completed" : "In progress"}</b>
          </div>
        </div>

        <div style={styles.topRight}>
          {saving ? <div style={{ ...styles.chip, opacity: 0.8 }}>{saving}</div> : null}
          <button style={styles.btn} onClick={() => setHelpOpen(true)}>
            Help
          </button>
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.title}>{title}</div>
        <p style={styles.subtitle}>
          Follow one step at a time. You can move on after your first try — and practice later to raise mastery.
        </p>
      </div>

      {feedback ? (
        <div style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackWarn}>
          <div style={{ fontSize: 18, fontWeight: 950 }}>{feedback.title}</div>
          {feedback.body ? <div style={{ marginTop: 6, opacity: 0.92 }}>{feedback.body}</div> : null}
        </div>
      ) : null}

      <div style={styles.card}>
        {screen === "commit" ? (
          <>
            <div style={styles.bigH2}>Commitment Gate</div>
            <p style={styles.body}>Commit to an answer first. Then we build the idea.</p>

            <QuestionListStudent items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} showHints={false} />

            <div style={styles.bottomTray}>
              <div style={{ opacity: 0.85, fontWeight: 800 }}>
                Locked until all questions are answered.
              </div>
              <button style={styles.primaryBtn} onClick={submitCommitmentGate}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {screen === "mim" ? (
          <>
            <div style={styles.bigH2}>Concept Build (MIM)</div>
            <p style={styles.body}>
              Anchor the concept using an engineering analogy — then explain your choice.
            </p>

            {analogyText ? (
              <div style={{ ...styles.questionCard, textAlign: "left", whiteSpace: "pre-wrap", opacity: 0.95 }}>
                {analogyText}
              </div>
            ) : null}

            <div style={styles.questionCard}>
              <div style={styles.prompt}>Choose a tool to measure a steel beam.</div>
              <div style={{ textAlign: "center", opacity: 0.9, marginBottom: 10 }}>
                Which would engineers trust more — and why?
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
                <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>Your explanation</div>
                <textarea
                  style={styles.textarea}
                  placeholder="Explain in 1–2 sentences…"
                  value={toolWhy}
                  onChange={(e) => setToolWhy(e.target.value)}
                />
                <div style={styles.hint}>Hint: higher precision gives more reliable measurements.</div>
              </div>

              {commitmentPrompt ? (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>Before moving on…</div>
                  <textarea
                    style={styles.textarea}
                    placeholder="Write 1 sentence…"
                    value={short["commitment"] || ""}
                    onChange={(e) => setShort({ ...short, commitment: e.target.value })}
                  />
                  <div style={styles.hint}>Hint: predict what will happen and why.</div>
                </div>
              ) : null}
            </div>

            <div style={styles.bottomTray}>
              <div style={{ opacity: 0.85, fontWeight: 800 }}>
                Locked until you choose a tool and explain why.
              </div>
              <button style={styles.primaryBtn} onClick={submitMIM}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {screen === "sim" ? (
          <>
            <div style={styles.bigH2}>Simulation</div>
            <p style={styles.body}>
              Do the lab once. Then write one observation about what changed and why.
            </p>

            {simPrompts?.length ? (
              <div style={{ ...styles.questionCard, textAlign: "left" }}>
                {simPrompts.map((p: string, i: number) => (
                  <div key={i} style={{ marginBottom: 6, opacity: 0.95 }}>
                    • {p}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={styles.questionCard}>
              <div style={styles.prompt}>Your observation</div>
              <textarea
                style={styles.textarea}
                placeholder="Write what you noticed…"
                value={short["lab_notes"] || ""}
                onChange={(e) => setShort({ ...short, lab_notes: e.target.value })}
              />
              <div style={styles.hint}>
                Hint: mention tool precision/uncertainty and how that affects results.
              </div>
            </div>

            <div style={styles.bottomTray}>
              <div style={{ opacity: 0.85, fontWeight: 800 }}>
                Locked until you write one observation.
              </div>
              <button style={styles.primaryBtn} onClick={submitSimOnce}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {screen === "capsules" ? (
          <>
            <div style={styles.bigH2}>Concept Capsules</div>
            <p style={styles.body}>
              Quick clarity step. This prepares you for the challenge.
            </p>

            {reconPrompts?.length ? (
              <div style={styles.questionCard}>
                <div style={{ ...styles.chip, display: "inline-block", marginBottom: 10 }}>
                  Capsule {capsuleIndex + 1} / {reconPrompts.length}
                </div>
                <div style={styles.prompt}>{capsulePromptText(capsuleIndex)}</div>
                <textarea
                  style={styles.textarea}
                  placeholder="Write 2–4 sentences…"
                  value={short[`caps_${capsuleIndex}`] || ""}
                  onChange={(e) => setShort({ ...short, [`caps_${capsuleIndex}`]: e.target.value })}
                />
                <div style={styles.hint}>Hint: keep it simple; include units or a small example.</div>
              </div>
            ) : (
              <div style={{ textAlign: "center", opacity: 0.85 }}>No capsules provided.</div>
            )}

            <div style={styles.bottomTray}>
              <div style={{ opacity: 0.85, fontWeight: 800 }}>
                Locked until you answer this capsule.
              </div>
              <button style={styles.primaryBtn} onClick={submitCapsule}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {screen === "challenge" ? (
          <>
            <div style={styles.bigH2}>Challenge</div>
            <p style={styles.body}>
              This score affects Module Mastery. Aim for <b>80–100%</b>.
            </p>

            <QuestionListStudent items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} showHints={true} />

            <div style={styles.bottomTray}>
              <div style={{ opacity: 0.85, fontWeight: 800 }}>
                Locked until all questions are answered.
              </div>
              <button style={styles.primaryBtn} onClick={submitChallenge}>
                Submit ✓
              </button>
            </div>
          </>
        ) : null}

        {screen === "report" ? (
          <>
            <div style={styles.bigH2}>Finished</div>

            <p style={styles.body}>
              {isLessonCompleted()
                ? "Lesson marked completed ✅"
                : "You can move on now. Practice later to reach 80–100% and mark it completed."}
            </p>

            <div style={{ ...styles.questionCard, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 950, marginBottom: 8 }}>
                Module mastery now: <b>{moduleMasteryPct}%</b>
              </div>
              <div style={{ opacity: 0.9, lineHeight: 1.55 }}>
                Only your <b>highest</b> score per lesson is kept in mastery.
              </div>
            </div>

            <div style={styles.bottomTray}>
              <button
                style={styles.btn}
                onClick={() => {
                  // practice resets screen flow; best score remains
                  setFeedback(null);
                  setMcq({});
                  setShort({});
                  setToolChoice("");
                  setToolWhy("");
                  setCapsuleIndex(0);
                  setStartedAt(Date.now());
                  setScreen("commit");
                }}
              >
                Practice this lesson
              </button>

              <button
                style={styles.btn}
                onClick={refreshProgress}
              >
                Refresh (optional)
              </button>

              <button
                style={styles.primaryBtn}
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

      {/* Help Drawer */}
      {helpOpen ? (
        <div style={styles.drawer}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={styles.drawerTitle}>Help</div>
            <button style={styles.btn} onClick={() => setHelpOpen(false)}>
              Close
            </button>
          </div>

          <div style={styles.drawerItem}>
            <b>How to win this lesson</b>
            <div style={{ marginTop: 6, opacity: 0.92 }}>
              Follow each step. Answer in simple sentences. Use units. Aim for 80–100% in the Challenge.
            </div>
          </div>

          <div style={styles.drawerItem}>
            <b>Glossary</b>
            <div style={{ marginTop: 6, opacity: 0.92 }}>
              <div>• <b>Precision</b>: how consistent measurements are.</div>
              <div>• <b>Accuracy</b>: how close to the true value.</div>
              <div>• <b>Uncertainty</b>: the “± range” your tool can’t avoid.</div>
            </div>
          </div>

          <div style={styles.drawerItem}>
            <b>Quick tip</b>
            <div style={{ marginTop: 6, opacity: 0.92 }}>
              If you’re unsure, write what you know first, then add units. Units often reveal the correct method.
            </div>
          </div>

          <div style={{ opacity: 0.7, fontSize: 12 }}>
            (Tutor + notes can be plugged in here next.)
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuestionListStudent({
  items,
  mcq,
  setMcq,
  short,
  setShort,
  showHints,
}: {
  items: KeyedItem[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
  showHints: boolean;
}) {
  if (!items?.length) return <div style={{ opacity: 0.85, textAlign: "center" }}>No questions.</div>;

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
      {items.map((q) => {
        const prompt = String((q as any)?.prompt || "");
        const key = q.__key;

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
            <div style={{ fontSize: 22, fontWeight: 950, marginBottom: 12, lineHeight: 1.25 }}>
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
                        fontWeight: 900,
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

                {showHints ? (
                  <div style={{ marginTop: 10, fontSize: 15, opacity: 0.88, lineHeight: 1.45 }}>
                    Hint: {pickHint(q)}
                  </div>
                ) : null}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}