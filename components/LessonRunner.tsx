"use client";

import { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";

/**
 * LessonRunner.tsx (ACSRM™-aligned for Module F1)
 * - Student-first UI (big, bold, centered, beautiful)
 * - Hides IDs/tags/steps from students
 * - Implements the reconstructed ACSRM™ sequence for F1:
 *   P1 Prediction Gate -> P2 MIM Analogy -> P3 Simulation cycles (3) ->
 *   P4 Symbolic unlock (readiness gate) -> P4b Concept Capsules (coverage gate) ->
 *   P6 Transfer (scored, persisted)
 *
 * Notes:
 * - Works with your existing seeded lesson schema (phases.diagnostic, analogical_grounding, simulation_inquiry, transfer).
 * - Adds F1-specific ACSRM layers (MIM + simulation cycles + capsules) in the UI without requiring new Firestore fields yet.
 * - Logs progress to /progress/{moduleId}/event using your backend contract.
 */

type ViewerRole = "student" | "instructor" | "admin";

type Props = {
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
  viewerRole?: ViewerRole; // default "student"
};

type McqItem = {
  type: "mcq";
  question_id: string;
  prompt: string;
  choices: string[];
  correct_index?: number;
  misconception_tags?: string[];
};

type ShortItem = {
  type: "short";
  question_id: string;
  prompt: string;
  misconception_tags?: string[];
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

type Capsule = {
  id: string;
  title: string;
  objectiveTags: string[];
  content: Array<{ kind: "text"; value: string }>;
  microChecks: Array<
    | {
        type: "mcq";
        prompt: string;
        choices: string[];
        correct_index: number;
        tags: string[];
      }
    | {
        type: "short";
        prompt: string;
        tags: string[];
      }
  >;
};

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

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function calcMcqScore(items: Item[], chosen: Record<string, number>) {
  const mcqItems = items.filter((x) => x.type === "mcq") as McqItem[];
  if (mcqItems.length === 0) return null;

  let correct = 0;
  let total = 0;
  for (const q of mcqItems) {
    const pick = chosen[q.question_id];
    if (typeof pick !== "number") continue;
    total += 1;
    if (typeof q.correct_index === "number" && pick === q.correct_index) correct += 1;
  }
  if (total === 0) return 0;
  return clamp01(correct / total);
}

function hasAnyAnswer(items: Item[], chosen: Record<string, number>, short: Record<string, string>) {
  for (const q of items) {
    if (q.type === "mcq") {
      if (typeof chosen[q.question_id] === "number") return true;
    } else {
      if ((short[q.question_id] || "").trim().length > 0) return true;
    }
  }
  return false;
}

/** Heuristic: if short answers exist (no auto-rubric), award partial credit for completion */
function shortCompletionScore(items: Item[], short: Record<string, string>) {
  const shortItems = items.filter((x) => x.type === "short") as ShortItem[];
  if (shortItems.length === 0) return null;
  const answered = shortItems.filter((q) => (short[q.question_id] || "").trim().length > 0).length;
  return clamp01(answered / Math.max(1, shortItems.length));
}

function labelizeStep(step: Step) {
  switch (step) {
    case "P1":
      return "Prediction Gate";
    case "P2":
      return "Analogy (MIM)";
    case "P3":
      return "Simulation Lab";
    case "P4":
      return "Symbols & Meaning";
    case "P4b":
      return "Concept Capsules";
    case "P6":
      return "Challenge Task";
    case "DONE":
      return "Complete";
  }
}

type Step = "P1" | "P2" | "P3" | "P4" | "P4b" | "P6" | "DONE";

function makeF1Capsules(): Capsule[] {
  return [
    {
      id: "cap_units_prefixes",
      title: "Units & Prefixes (The ‘Currency’ of Physics)",
      objectiveTags: ["si_prefixes", "unit_conversion"],
      content: [
        {
          kind: "text",
          value:
            "Units are the currency of physics. You can’t add ‘meters’ to ‘seconds’. Prefixes (kilo-, milli-, micro-) are like denominations (thousand, thousandth, millionth).",
        },
        {
          kind: "text",
          value:
            "Quick rule: move the decimal using the prefix meaning. Example: 1 mm = 0.001 m (10⁻³ m).",
        },
      ],
      microChecks: [
        {
          type: "mcq",
          prompt: "1 millimeter (mm) equals:",
          choices: ["10⁻³ m", "10⁻² m", "10³ m", "10⁻⁶ m"],
          correct_index: 0,
          tags: ["si_prefixes", "unit_conversion"],
        },
        {
          type: "mcq",
          prompt: "Which conversion is correct?",
          choices: ["3.0 m = 300 cm", "3.0 m = 30 cm", "3.0 m = 3 cm", "3.0 m = 3000 cm"],
          correct_index: 0,
          tags: ["unit_conversion"],
        },
      ],
    },
    {
      id: "cap_scalars_vectors",
      title: "Scalars vs Vectors",
      objectiveTags: ["scalar_vs_vector"],
      content: [
        {
          kind: "text",
          value:
            "A scalar has size only (temperature, mass, time). A vector has size + direction (displacement, velocity, force).",
        },
        {
          kind: "text",
          value:
            "If direction matters, it’s a vector. If direction doesn’t matter, it’s a scalar.",
        },
      ],
      microChecks: [
        {
          type: "mcq",
          prompt: "Which quantity is a vector?",
          choices: ["temperature", "mass", "displacement", "time"],
          correct_index: 2,
          tags: ["scalar_vs_vector"],
        },
        {
          type: "mcq",
          prompt: "Speed is a scalar because it has:",
          choices: ["magnitude only", "direction only", "no units", "negative values only"],
          correct_index: 0,
          tags: ["scalar_vs_vector"],
        },
      ],
    },
    {
      id: "cap_scales_uncertainty",
      title: "Reading Scales & Uncertainty",
      objectiveTags: ["reading_scales", "uncertainty_estimation", "random_vs_systematic_error"],
      content: [
        {
          kind: "text",
          value:
            "Your precision is limited by the smallest division on the instrument. A common uncertainty estimate is half the smallest division (±½ least count).",
        },
        {
          kind: "text",
          value:
            "Systematic error shifts results in one direction (e.g., zero error). Random error causes scatter (small unpredictable changes).",
        },
      ],
      microChecks: [
        {
          type: "mcq",
          prompt:
            "A ruler’s smallest division is 1 mm. A reasonable reported uncertainty is closest to:",
          choices: ["±1 mm", "±0.5 mm", "±0.1 mm", "±2 mm"],
          correct_index: 1,
          tags: ["reading_scales", "uncertainty_estimation"],
        },
        {
          type: "mcq",
          prompt: "If you consistently read too high due to a zero error, this is:",
          choices: ["random error", "systematic error", "no error", "rounding error only"],
          correct_index: 1,
          tags: ["random_vs_systematic_error"],
        },
      ],
    },
    {
      id: "cap_sigfig_rounding",
      title: "Significant Figures & Rounding (Honesty Rules)",
      objectiveTags: ["significant_figures", "rounding_rules", "precision_vs_accuracy"],
      content: [
        {
          kind: "text",
          value:
            "Significant figures are honesty rules: your final answer can’t be more precise than your measurements.",
        },
        {
          kind: "text",
          value:
            "Rounding: keep the requested sig figs and round based on the next digit. Extra digits can mislead.",
        },
      ],
      microChecks: [
        {
          type: "mcq",
          prompt: "How many significant figures are in 0.00450?",
          choices: ["2", "3", "4", "5"],
          correct_index: 1,
          tags: ["significant_figures"],
        },
        {
          type: "mcq",
          prompt: "Round 12.349 to 3 significant figures:",
          choices: ["12.3", "12.4", "12.35", "12.34"],
          correct_index: 1,
          tags: ["rounding_rules", "significant_figures"],
        },
      ],
    },
    {
      id: "cap_density_units",
      title: "Density (Meaning + Units + Conversions)",
      objectiveTags: ["density_concept", "density_units", "unit_conversion"],
      content: [
        {
          kind: "text",
          value:
            "Density describes how tightly packed matter is. It’s mass per volume. Units matter: kg/m³ or g/cm³.",
        },
        {
          kind: "text",
          value:
            "A common mistake is flipping the relationship. Always ask: ‘mass per volume’ means divide mass by volume.",
        },
      ],
      microChecks: [
        {
          type: "mcq",
          prompt: "Density is defined as:",
          choices: ["mass × volume", "mass ÷ volume", "volume ÷ mass", "mass + volume"],
          correct_index: 1,
          tags: ["density_concept"],
        },
        {
          type: "mcq",
          prompt: "Which unit is appropriate for density?",
          choices: ["kg", "m³", "kg/m³", "N"],
          correct_index: 2,
          tags: ["density_units"],
        },
      ],
    },
  ];
}

function makeStyles() {
  const bg = {
    minHeight: "calc(100vh - 80px)",
    padding: "28px 18px 60px",
    display: "flex",
    justifyContent: "center",
  } as const;

  const shell = {
    width: "100%",
    maxWidth: 980,
  } as const;

  const card = {
    border: "1px solid #2a2a2a",
    borderRadius: 18,
    padding: 20,
    background: "rgba(0,0,0,0.35)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
  } as const;

  const heroTitle = {
    fontSize: 46,
    lineHeight: 1.05,
    fontWeight: 900,
    textAlign: "center" as const,
    margin: "6px 0 10px",
    letterSpacing: 0.2,
  };

  const sub = {
    textAlign: "center" as const,
    opacity: 0.88,
    fontSize: 18,
    marginBottom: 18,
  };

  const stepPill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #333",
    borderRadius: 999,
    padding: "8px 14px",
    fontWeight: 800,
    fontSize: 14,
    opacity: 0.95,
    background: "rgba(255,255,255,0.03)",
  } as const;

  const bigPrompt = {
    fontSize: 26,
    fontWeight: 850,
    lineHeight: 1.25,
    textAlign: "center" as const,
    margin: "18px 0 10px",
  };

  const choiceTile = (active: boolean) =>
    ({
      border: active ? "2px solid #ffffff" : "1px solid #333",
      borderRadius: 14,
      padding: "14px 14px",
      cursor: "pointer",
      background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
      fontSize: 20,
      fontWeight: 800,
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    } as const);

  const primaryBtn = {
    width: "100%",
    marginTop: 14,
    padding: "16px 16px",
    borderRadius: 14,
    border: "1px solid #444",
    background: "rgba(255,255,255,0.08)",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
  } as const;

  const secondaryBtn = {
    width: "100%",
    marginTop: 10,
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid #333",
    background: "rgba(255,255,255,0.03)",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    opacity: 0.95,
  } as const;

  return { bg, shell, card, heroTitle, sub, stepPill, bigPrompt, choiceTile, primaryBtn, secondaryBtn };
}

export default function LessonRunner({ moduleId, lesson, misconceptionAllowlist, viewerRole = "student" }: Props) {
  const styles = useMemo(() => makeStyles(), []);

  // Seeded lesson phases (we reuse these for diagnostics + transfer question pools)
  const phases = lesson?.phases || {};
  const diagnosticItems: Item[] = phases?.diagnostic?.items || [];
  const transferItems: Item[] = phases?.transfer?.items || [];

  // “Analogy” text exists in seeded lessons. We will wrap it as P2.
  const analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  const commitmentPrompt: string = phases?.analogical_grounding?.commitment_prompt || "";

  // Sim lab id exists in some lessons, but ACSRM P3 is module-level; we provide our own mini-lab.
  const sim = phases?.simulation_inquiry || {};
  const simLabId: string | null = sim?.lab_id || null;

  // ---------- state ----------
  const [step, setStep] = useState<Step>("P1");
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [status, setStatus] = useState<string>("");

  // answers
  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});
  const [confidencePct, setConfidencePct] = useState<number>(70);

  // feedback
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // progress
  const [progress, setProgress] = useState<ProgressMe | null>(null);

  // ACSRM P3 simulation cycles
  const [simCycle, setSimCycle] = useState<number>(1); // 1..3
  const [simTool, setSimTool] = useState<"rough" | "precise">("rough");
  const [simMass, setSimMass] = useState<string>("");
  const [simVolume, setSimVolume] = useState<string>("");
  const [simWhy, setSimWhy] = useState<string>("");
  const [simDoneCycles, setSimDoneCycles] = useState<number>(0);

  // P4b concept capsules
  const capsules = useMemo(() => (moduleId === "F1" ? makeF1Capsules() : []), [moduleId]);
  const [capIndex, setCapIndex] = useState<number>(0);
  const [capAnswers, setCapAnswers] = useState<Record<string, any>>({});
  const [capScores, setCapScores] = useState<Record<string, number>>({}); // id -> 0..1

  const title = lesson?.title || "Lesson";
  const showTeacherPanel = viewerRole !== "student";

  useEffect(() => {
    // reset whenever lesson changes
    setStep("P1");
    setStartedAt(Date.now());
    setStatus("");
    setMcq({});
    setShort({});
    setConfidencePct(70);
    setSubmitted(false);
    setLastScore(null);
    setProgress(null);

    setSimCycle(1);
    setSimTool("rough");
    setSimMass("");
    setSimVolume("");
    setSimWhy("");
    setSimDoneCycles(0);

    setCapIndex(0);
    setCapAnswers({});
    setCapScores({});
  }, [lesson?.id, moduleId]);

  function durationSeconds() {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }

  const allTagsFor = (items: Item[]) => {
    const tags: string[] = [];
    for (const it of items) {
      const t = (it as any)?.misconception_tags || [];
      for (const x of t) tags.push(String(x));
    }
    return allowTags(uniq(tags), misconceptionAllowlist);
  };

  const moduleProgress = useMemo(() => {
    const mm = progress?.mastery_map || [];
    return mm.find((x) => x.module_id === moduleId) || null;
  }, [progress, moduleId]);

  async function refreshProgress() {
    try {
      const p = await apipGet<ProgressMe>("/progress/me");
      setProgress(p);
    } catch {
      // ignore
    }
  }

  async function logEvent(
    event_type: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt",
    score?: number,
    tags?: string[],
    details?: Record<string, any>,
    extra?: Record<string, any>
  ) {
    const payload: any = {
      event_type,
      duration_seconds: durationSeconds(),
      confidence: clamp01(confidencePct / 100),
      score: typeof score === "number" ? clamp01(score) : undefined,
      misconception_tags: allowTags(tags || [], misconceptionAllowlist),
      details: {
        lesson_id: lesson?.id,
        phase: step,
        ...details,
      },
      ...extra,
    };

    setStatus("Saving progress…");
    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    setStatus("");
  }

  // ---------- scoring / readiness ----------
  const symbolicThreshold = 0.6;
  const capsuleMinScore = 0.7;
  const labCyclesRequired = 3;

  const capsuleCoverageScore = useMemo(() => {
    if (!capsules.length) return 0;
    const scores = capsules.map((c) => capScores[c.id]).filter((x) => typeof x === "number") as number[];
    if (scores.length === 0) return 0;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return clamp01(avg);
  }, [capsules, capScores]);

  const allCapsulesPassed = useMemo(() => {
    if (!capsules.length) return true; // non-F1
    for (const c of capsules) {
      const s = capScores[c.id];
      if (typeof s !== "number") return false;
      if (s < capsuleMinScore) return false;
    }
    return true;
  }, [capsules, capScores]);

  const warmupScore = useMemo(() => {
    const m = calcMcqScore(diagnosticItems, mcq);
    const s = shortCompletionScore(diagnosticItems, short);
    // If both exist: weighted
    if (typeof m === "number" && typeof s === "number") return clamp01(m * 0.8 + s * 0.2);
    if (typeof m === "number") return m;
    if (typeof s === "number") return s;
    return null;
  }, [diagnosticItems, mcq, short]);

  const localReadiness = useMemo(() => {
    const w = typeof warmupScore === "number" ? warmupScore : 0;
    const c = capsuleCoverageScore;
    // if capsules not started yet, weight warmup more
    const capsStarted = Object.keys(capScores).length > 0;
    if (!capsules.length) return w;
    return clamp01(capsStarted ? (w * 0.45 + c * 0.55) : (w * 0.9 + c * 0.1));
  }, [warmupScore, capsuleCoverageScore, capScores, capsules.length]);

  // ---------- step transitions ----------
  async function submitPredictionGate() {
    setSubmitted(true);

    // Must answer both
    if (!hasAnyAnswer(diagnosticItems, mcq, short)) {
      setStatus("Please answer the questions before continuing.");
      setTimeout(() => setStatus(""), 1600);
      return;
    }

    const m = calcMcqScore(diagnosticItems, mcq);
    const s = shortCompletionScore(diagnosticItems, short);
    let score = 0.0;
    if (typeof m === "number" && typeof s === "number") score = clamp01(m * 0.8 + s * 0.2);
    else if (typeof m === "number") score = m;
    else if (typeof s === "number") score = s;

    setLastScore(score);

    await logEvent(
      "diagnostic",
      score,
      allTagsFor(diagnosticItems),
      { phase: "P1", gate: "prediction", confidence_pct: confidencePct }
    );

    await refreshProgress();
    setStartedAt(Date.now());
    setStep("P2");
    setSubmitted(false);
  }

  async function submitMIM() {
    await logEvent("reflection", undefined, [], { phase: "P2", mim_task: "tool_trust", rationale: short["mim_rationale"] || "" });
    await refreshProgress();
    setStartedAt(Date.now());
    setStep("P3");
    setSubmitted(false);
  }

  function computeDensity(massStr: string, volStr: string) {
    const m = Number(massStr);
    const v = Number(volStr);
    if (!Number.isFinite(m) || !Number.isFinite(v) || v === 0) return null;
    return m / v;
  }

  async function submitSimCycle() {
    // gate: must provide mass, volume, and justification each cycle
    if (!simMass.trim() || !simVolume.trim() || !simWhy.trim()) {
      setStatus("Complete mass, volume, and your explanation to continue.");
      setTimeout(() => setStatus(""), 1600);
      return;
    }

    const d = computeDensity(simMass, simVolume);
    // conflict proxy: rough tool yields higher conflict likelihood
    const conflict_level = simTool === "rough" ? 0.7 : 0.35;

    // Tag inference (safe allowlist filter)
    const simTags = allowTags(
      ["uncertainty_estimation", "precision_vs_accuracy", "density_concept", "reading_scales"],
      misconceptionAllowlist
    );

    await logEvent(
      "simulation",
      undefined,
      simTags,
      {
        phase: "P3",
        sim_lab: simLabId || "acsr_f1_density_explorer",
        cycle: simCycle,
        tool: simTool,
        mass: simMass,
        volume: simVolume,
        density: d,
        why: simWhy,
      },
      { conflict_level, sim_depth: simCycle }
    );

    await refreshProgress();

    const newDone = Math.min(labCyclesRequired, simDoneCycles + 1);
    setSimDoneCycles(newDone);

    if (simCycle < labCyclesRequired) {
      setSimCycle(simCycle + 1);
      setSimMass("");
      setSimVolume("");
      setSimWhy("");
      setStartedAt(Date.now());
      return;
    }

    // done cycles -> P4 readiness gate
    setStartedAt(Date.now());
    setStep("P4");
    setSubmitted(false);
  }

  async function submitSymbolicUnlock() {
    // Gate: readiness >= threshold
    if (localReadiness < symbolicThreshold) {
      // route back to one extra simulation cycle (smart assist)
      await logEvent("reflection", undefined, [], { phase: "P4", symbolic_unlocked: false, route: "extra_sim_cycle", readiness: localReadiness });
      setStartedAt(Date.now());
      setStep("P3");
      // add one extra cycle beyond 3 by reusing cycle 3 UI
      setSimCycle(labCyclesRequired); // keep it stable
      setSimMass("");
      setSimVolume("");
      setSimWhy("");
      setSubmitted(false);
      return;
    }

    await logEvent("reflection", undefined, [], { phase: "P4", symbolic_unlocked: true, readiness: localReadiness });
    await refreshProgress();
    setStartedAt(Date.now());
    setStep("P4b");
    setSubmitted(false);
  }

  function capsuleKey(capsuleId: string, idx: number) {
    return `${capsuleId}__q${idx}`;
  }

  function capsuleScore(c: Capsule) {
    // Score MCQs only; shorts count as completion (small weight)
    let correct = 0;
    let totalMcq = 0;
    let shortAnswered = 0;
    let shortTotal = 0;

    c.microChecks.forEach((q, i) => {
      const k = capsuleKey(c.id, i);
      if (q.type === "mcq") {
        totalMcq += 1;
        if (capAnswers[k] === q.correct_index) correct += 1;
      } else {
        shortTotal += 1;
        if (String(capAnswers[k] || "").trim().length > 0) shortAnswered += 1;
      }
    });

    const mcqScore = totalMcq ? correct / totalMcq : 0;
    const shortScore = shortTotal ? shortAnswered / shortTotal : 0;

    // weight: MCQ dominates
    if (totalMcq && shortTotal) return clamp01(mcqScore * 0.85 + shortScore * 0.15);
    if (totalMcq) return clamp01(mcqScore);
    if (shortTotal) return clamp01(shortScore);
    return 0;
  }

  async function submitCapsule() {
    const c = capsules[capIndex];
    if (!c) {
      setStep("P6");
      return;
    }

    // Require at least 1 micro-check attempted
    const attempted = c.microChecks.some((q, i) => {
      const k = capsuleKey(c.id, i);
      if (q.type === "mcq") return typeof capAnswers[k] === "number";
      return String(capAnswers[k] || "").trim().length > 0;
    });

    if (!attempted) {
      setStatus("Try at least one micro-check before continuing.");
      setTimeout(() => setStatus(""), 1600);
      return;
    }

    const score = capsuleScore(c);
    setCapScores((prev) => ({ ...prev, [c.id]: score }));

    // log as attempt (not persisted)
    const tags = allowTags(c.objectiveTags, misconceptionAllowlist);
    await logEvent("attempt", score, tags, { phase: "P4b", capsule_id: c.id, capsule_score: score });

    await refreshProgress();
    setStartedAt(Date.now());

    if (capIndex < capsules.length - 1) setCapIndex(capIndex + 1);
    else setStep("P6");
  }

  async function submitTransfer() {
    // Gate: objective coverage complete (for F1)
    if (capsules.length && !allCapsulesPassed) {
      setStatus("Finish all Concept Capsules (and score at least 70%) before the Challenge Task.");
      setTimeout(() => setStatus(""), 1900);
      return;
    }

    setSubmitted(true);

    // Must attempt something
    if (!hasAnyAnswer(transferItems, mcq, short)) {
      setStatus("Answer the Challenge Task before submitting.");
      setTimeout(() => setStatus(""), 1600);
      return;
    }

    // Score: MCQ + completion
    const m = calcMcqScore(transferItems, mcq);
    const s = shortCompletionScore(transferItems, short);
    let score = 0.0;
    if (typeof m === "number" && typeof s === "number") score = clamp01(m * 0.75 + s * 0.25);
    else if (typeof m === "number") score = m;
    else if (typeof s === "number") score = s;

    setLastScore(score);

    await logEvent(
      "transfer",
      score,
      allTagsFor(transferItems),
      { phase: "P6", task_id: "F1_transfer", responses_summary: summarizeTransfer(transferItems, mcq, short) }
    );

    await refreshProgress();
    setStep("DONE");
    setSubmitted(false);
  }

  function summarizeTransfer(items: Item[], chosen: Record<string, number>, shorts: Record<string, string>) {
    // Keep it small: do not send full text; just flags
    const out: any = { answered_mcq: 0, answered_short: 0, total: items.length };
    for (const q of items) {
      if (q.type === "mcq") {
        if (typeof chosen[q.question_id] === "number") out.answered_mcq += 1;
      } else {
        if ((shorts[q.question_id] || "").trim().length > 0) out.answered_short += 1;
      }
    }
    return out;
  }

  // ---------- student-facing UI blocks ----------
  const headerBlock = (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={styles.stepPill}>
          <span style={{ opacity: 0.85 }}>ACSRM™</span>
          <span style={{ opacity: 0.55 }}>•</span>
          <span>{labelizeStep(step)}</span>
        </div>
      </div>

      <div style={styles.heroTitle}>{title}</div>

      <div style={styles.sub}>
        {step === "P1"
          ? "Mission start: predict first. No teaching yet."
          : step === "P2"
          ? "Anchor the idea with a real engineering analogy."
          : step === "P3"
          ? `Lab cycles completed: ${simDoneCycles}/${labCyclesRequired}`
          : step === "P4"
          ? "Unlock symbols only when you’re ready."
          : step === "P4b"
          ? "Short concept capsules so you’re fully prepared for the Challenge."
          : step === "P6"
          ? "Challenge Task: apply everything."
          : "Great work — you’ve completed this run."}
      </div>

      {/* Simple, student-friendly progress */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        <MiniStat label="Readiness" value={`${Math.round(localReadiness * 100)}%`} />
        <MiniStat label="Confidence" value={`${Math.round(confidencePct)}%`} />
        {moduleProgress ? (
          <MiniStat label="Module mastery" value={`${Math.round((moduleProgress.mastery_score || 0) * 100)}%`} />
        ) : (
          <MiniStat label="Module mastery" value="—" />
        )}
      </div>
    </div>
  );

  const statusBlock = status ? (
    <div style={{ margin: "12px 0", border: "1px solid #333", borderRadius: 14, padding: 12, textAlign: "center" }}>
      <b>{status}</b>
    </div>
  ) : null;

  // ---------- render ----------
  return (
    <div style={styles.bg}>
      <div style={styles.shell}>
        {headerBlock}
        {statusBlock}

        <div style={styles.card}>
          {/* student confidence slider (friendly label) */}
          <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, opacity: 0.9 }}>
              <span>How sure are you?</span>
              <span>{Math.round(confidencePct)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={confidencePct}
              onChange={(e) => setConfidencePct(Number(e.target.value))}
            />
          </div>

          {step === "P1" ? (
            <PredictionGate
              styles={styles}
              items={diagnosticItems}
              mcq={mcq}
              setMcq={setMcq}
              short={short}
              setShort={setShort}
              submitted={submitted}
              viewerRole={viewerRole}
            />
          ) : null}

          {step === "P1" ? (
            <button style={styles.primaryBtn} onClick={submitPredictionGate}>
              Submit Prediction Gate →
            </button>
          ) : null}

          {step === "P2" ? (
            <MIMBlock styles={styles} analogyText={analogyText} commitmentPrompt={commitmentPrompt} short={short} setShort={setShort} />
          ) : null}

          {step === "P2" ? (
            <button style={styles.primaryBtn} onClick={submitMIM}>
              Continue →
            </button>
          ) : null}

          {step === "P3" ? (
            <SimLabBlock
              styles={styles}
              cycle={simCycle}
              tool={simTool}
              setTool={setSimTool}
              mass={simMass}
              setMass={setSimMass}
              volume={simVolume}
              setVolume={setSimVolume}
              why={simWhy}
              setWhy={setSimWhy}
            />
          ) : null}

          {step === "P3" ? (
            <button style={styles.primaryBtn} onClick={submitSimCycle}>
              Save Lab Cycle {simCycle}/{labCyclesRequired} →
            </button>
          ) : null}

          {step === "P4" ? (
            <SymbolicUnlockBlock styles={styles} readiness={localReadiness} threshold={symbolicThreshold} />
          ) : null}

          {step === "P4" ? (
            <button style={styles.primaryBtn} onClick={submitSymbolicUnlock}>
              {localReadiness >= symbolicThreshold ? "Unlock Symbols →" : "Not ready yet — help me practice more"}
            </button>
          ) : null}

          {step === "P4b" ? (
            <CapsuleBlock
              styles={styles}
              capsule={capsules[capIndex]}
              capIndex={capIndex}
              total={capsules.length}
              answers={capAnswers}
              setAnswers={setCapAnswers}
              score={capsules[capIndex] ? capScores[capsules[capIndex].id] : undefined}
            />
          ) : null}

          {step === "P4b" ? (
            <button style={styles.primaryBtn} onClick={submitCapsule}>
              {capIndex < capsules.length - 1 ? "Save & Next Capsule →" : "Finish Capsules →"}
            </button>
          ) : null}

          {step === "P6" ? (
            <TransferBlock
              styles={styles}
              items={transferItems}
              mcq={mcq}
              setMcq={setMcq}
              short={short}
              setShort={setShort}
              submitted={submitted}
              locked={capsules.length > 0 && !allCapsulesPassed}
            />
          ) : null}

          {step === "P6" ? (
            <button style={styles.primaryBtn} onClick={submitTransfer} disabled={capsules.length > 0 && !allCapsulesPassed}>
              Submit Challenge Task ✓
            </button>
          ) : null}

          {step === "DONE" ? (
            <DoneBlock
              styles={styles}
              lastScore={lastScore}
              moduleProgress={moduleProgress}
              onRefresh={refreshProgress}
            />
          ) : null}

          {showTeacherPanel ? (
            <TeacherPanel
              moduleId={moduleId}
              lesson={lesson}
              step={step}
              readiness={localReadiness}
              threshold={symbolicThreshold}
              capsuleScores={capScores}
              capsuleCoverage={capsuleCoverageScore}
              simDoneCycles={simDoneCycles}
              labCyclesRequired={labCyclesRequired}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------- UI Components -------------------- */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #333", borderRadius: 999, padding: "8px 12px", fontWeight: 800, fontSize: 13, opacity: 0.92 }}>
      <span style={{ opacity: 0.7 }}>{label}:</span> <span>{value}</span>
    </div>
  );
}

function PredictionGate({
  styles,
  items,
  mcq,
  setMcq,
  short,
  setShort,
  submitted,
  viewerRole,
}: {
  styles: any;
  items: Item[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
  submitted: boolean;
  viewerRole: ViewerRole;
}) {
  return (
    <div>
      <div style={styles.bigPrompt}>Mission Brief</div>
      <div style={{ textAlign: "center", opacity: 0.9, fontSize: 18, lineHeight: 1.5 }}>
        A space agency is building a rover.
        <br />
        It must measure length accurately, estimate mass, and calculate density of unknown rocks.
        <br />
        <b>If measurements are wrong, the rover fails.</b>
      </div>

      <div style={{ marginTop: 18, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 10 }}>
          Prediction Gate (No teaching yet)
        </div>
        <div style={{ textAlign: "center", opacity: 0.85, marginBottom: 12 }}>
          Answer first. Then we’ll learn.
        </div>

        <StudentQuestionList
          items={items}
          mcq={mcq}
          setMcq={setMcq}
          short={short}
          setShort={setShort}
          submitted={submitted}
          showIds={viewerRole !== "student"}
          styles={styles}
        />
      </div>
    </div>
  );
}

function MIMBlock({
  styles,
  analogyText,
  commitmentPrompt,
  short,
  setShort,
}: {
  styles: any;
  analogyText: string;
  commitmentPrompt: string;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
}) {
  return (
    <div>
      <div style={styles.bigPrompt}>Measurement Infrastructure Model (MIM)</div>

      <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
        <MIMRow left="SI Unit" right="Standard construction code" />
        <MIMRow left="SI Prefix" right="Permit category (kilo-, milli-, micro-)" />
        <MIMRow left="Scalar" right="Single-lane measurement" />
        <MIMRow left="Vector" right="Directed pathway measurement" />
        <MIMRow left="Significant figures" right="Precision tolerance limit" />
        <MIMRow left="Error" right="Construction deviation" />
        <MIMRow left="Density" right="Mass-per-capacity" />
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900, textAlign: "center", marginBottom: 10 }}>
          Tool Trust Task
        </div>

        <div style={{ textAlign: "center", fontSize: 18, opacity: 0.9, marginBottom: 12 }}>
          Choose a tool to measure a steel beam.
          <br />
          Which would engineers trust more — and why?
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ border: "1px solid #333", borderRadius: 14, padding: 14, fontWeight: 850, fontSize: 18 }}>
            Rough ruler <span style={{ opacity: 0.8 }}>(±1 cm)</span>
          </div>
          <div style={{ border: "1px solid #333", borderRadius: 14, padding: 14, fontWeight: 850, fontSize: 18 }}>
            Precision caliper <span style={{ opacity: 0.8 }}>(±0.01 cm)</span>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Your explanation</div>
          <textarea
            rows={3}
            value={short["mim_rationale"] || ""}
            onChange={(e) => setShort({ ...short, mim_rationale: e.target.value })}
            style={{ width: "100%", borderRadius: 14, padding: 12, border: "1px solid #333", background: "rgba(255,255,255,0.03)" }}
            placeholder="Explain in 1–2 sentences…"
          />
        </div>

        {analogyText ? (
          <div style={{ marginTop: 12, opacity: 0.92, whiteSpace: "pre-wrap" }}>
            <b>Hint:</b> {analogyText}
          </div>
        ) : null}

        {commitmentPrompt ? (
          <div style={{ marginTop: 12, opacity: 0.85 }}>
            <b>Commitment:</b> {commitmentPrompt}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MIMRow({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 10, border: "1px solid #333", borderRadius: 14, padding: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>{left}</div>
      <div style={{ opacity: 0.9, fontWeight: 750, fontSize: 16 }}>{right}</div>
    </div>
  );
}

function SimLabBlock({
  styles,
  cycle,
  tool,
  setTool,
  mass,
  setMass,
  volume,
  setVolume,
  why,
  setWhy,
}: {
  styles: any;
  cycle: number;
  tool: "rough" | "precise";
  setTool: (x: "rough" | "precise") => void;
  mass: string;
  setMass: (x: string) => void;
  volume: string;
  setVolume: (x: string) => void;
  why: string;
  setWhy: (x: string) => void;
}) {
  const density = (() => {
    const m = Number(mass);
    const v = Number(volume);
    if (!Number.isFinite(m) || !Number.isFinite(v) || v === 0) return null;
    return m / v;
  })();

  return (
    <div>
      <div style={styles.bigPrompt}>Virtual Lab — Density Explorer (Cycle {cycle}/3)</div>

      <div style={{ textAlign: "center", opacity: 0.88, fontSize: 18, lineHeight: 1.5 }}>
        Use measurements to compute <b>mass per volume</b>.
        <br />
        (Formula stays locked for now.)
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10, textAlign: "center" }}>
          Choose measurement tool
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 800, fontSize: 18 }}>
            <input type="radio" checked={tool === "rough"} onChange={() => setTool("rough")} />
            Rough tool (lower precision)
          </label>
          <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 800, fontSize: 18 }}>
            <input type="radio" checked={tool === "precise"} onChange={() => setTool("precise")} />
            Precise tool (higher precision)
          </label>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <BigInput label="Mass (g)" value={mass} onChange={setMass} placeholder="e.g., 200" />
          <BigInput label="Volume (cm³)" value={volume} onChange={setVolume} placeholder="e.g., 50" />
        </div>

        <div style={{ marginTop: 14, textAlign: "center", fontSize: 20, fontWeight: 900 }}>
          Density (mass per volume):{" "}
          <span style={{ opacity: 0.9 }}>
            {density === null ? "—" : `${density.toFixed(3)} g/cm³`}
          </span>
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6, textAlign: "center" }}>
            Why might density change if the object didn’t?
          </div>
          <textarea
            rows={3}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            style={{ width: "100%", borderRadius: 14, padding: 12, border: "1px solid #333", background: "rgba(255,255,255,0.03)" }}
            placeholder="Explain in 1–2 sentences…"
          />
        </div>
      </div>
    </div>
  );
}

function BigInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (x: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "14px 12px",
          borderRadius: 14,
          border: "1px solid #333",
          background: "rgba(255,255,255,0.03)",
          fontSize: 18,
          fontWeight: 800,
        }}
      />
    </div>
  );
}

function SymbolicUnlockBlock({ styles, readiness, threshold }: { styles: any; readiness: number; threshold: number }) {
  return (
    <div>
      <div style={styles.bigPrompt}>Symbolic Readiness Check</div>

      <div style={{ textAlign: "center", opacity: 0.9, fontSize: 18, lineHeight: 1.55 }}>
        We unlock formulas only when your understanding is strong enough.
        <br />
        Current readiness: <b>{Math.round(readiness * 100)}%</b> (needs <b>{Math.round(threshold * 100)}%</b>)
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 950, textAlign: "center", marginBottom: 8 }}>
          Symbol Preview (Locked until ready)
        </div>

        <div style={{ textAlign: "center", fontSize: 18, opacity: 0.88 }}>
          When unlocked, you’ll see:
          <div style={{ fontSize: 26, fontWeight: 950, marginTop: 8 }}>
            Density = Mass / Volume
          </div>
          <div style={{ marginTop: 8 }}>
            Plus: significant figures, rounding, uncertainty, precision vs accuracy.
          </div>
        </div>
      </div>
    </div>
  );
}

function CapsuleBlock({
  styles,
  capsule,
  capIndex,
  total,
  answers,
  setAnswers,
  score,
}: {
  styles: any;
  capsule: Capsule | undefined;
  capIndex: number;
  total: number;
  answers: Record<string, any>;
  setAnswers: (x: Record<string, any>) => void;
  score?: number;
}) {
  if (!capsule) return <div style={{ opacity: 0.85, textAlign: "center" }}>No capsules.</div>;

  return (
    <div>
      <div style={styles.bigPrompt}>
        Concept Capsule {capIndex + 1}/{total}
      </div>

      <div style={{ textAlign: "center", fontSize: 24, fontWeight: 950, marginBottom: 10 }}>
        {capsule.title}
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {capsule.content.map((b, i) => (
          <div key={i} style={{ border: "1px solid #333", borderRadius: 16, padding: 16, opacity: 0.92 }}>
            {b.value}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 950, textAlign: "center", marginBottom: 10 }}>
          Micro-checks
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {capsule.microChecks.map((q, idx) => {
            const k = `${capsule.id}__q${idx}`;

            if (q.type === "mcq") {
              return (
                <div key={k} style={{ border: "1px solid #333", borderRadius: 14, padding: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10, textAlign: "center" }}>
                    {q.prompt}
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {q.choices.map((c, i) => {
                      const active = answers[k] === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setAnswers({ ...answers, [k]: i })}
                          style={{
                            border: active ? "2px solid #fff" : "1px solid #333",
                            borderRadius: 14,
                            padding: "12px 12px",
                            cursor: "pointer",
                            background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                            fontSize: 18,
                            fontWeight: 850,
                          }}
                        >
                          {c}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={k} style={{ border: "1px solid #333", borderRadius: 14, padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10, textAlign: "center" }}>
                  {q.prompt}
                </div>
                <textarea
                  rows={3}
                  value={String(answers[k] || "")}
                  onChange={(e) => setAnswers({ ...answers, [k]: e.target.value })}
                  style={{ width: "100%", borderRadius: 14, padding: 12, border: "1px solid #333", background: "rgba(255,255,255,0.03)" }}
                  placeholder="Write your answer…"
                />
              </div>
            );
          })}
        </div>

        {typeof score === "number" ? (
          <div style={{ marginTop: 12, textAlign: "center", fontWeight: 950, fontSize: 18 }}>
            Capsule score: {Math.round(score * 100)}%
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TransferBlock({
  styles,
  items,
  mcq,
  setMcq,
  short,
  setShort,
  submitted,
  locked,
}: {
  styles: any;
  items: Item[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
  submitted: boolean;
  locked: boolean;
}) {
  return (
    <div>
      <div style={styles.bigPrompt}>Challenge Task</div>

      {locked ? (
        <div style={{ border: "1px solid #800", borderRadius: 16, padding: 14, textAlign: "center", marginBottom: 14 }}>
          <b>Locked:</b> Finish all Concept Capsules with at least 70% first.
        </div>
      ) : null}

      <div style={{ textAlign: "center", opacity: 0.9, fontSize: 18, lineHeight: 1.55 }}>
        Apply what you learned. This is scored.
      </div>

      <div style={{ marginTop: 16 }}>
        <StudentQuestionList
          items={items}
          mcq={mcq}
          setMcq={setMcq}
          short={short}
          setShort={setShort}
          submitted={submitted}
          showIds={false}
          styles={styles}
        />
      </div>
    </div>
  );
}

function DoneBlock({
  styles,
  lastScore,
  moduleProgress,
  onRefresh,
}: {
  styles: any;
  lastScore: number | null;
  moduleProgress: any;
  onRefresh: () => Promise<void>;
}) {
  return (
    <div>
      <div style={styles.bigPrompt}>✅ You’re done!</div>

      <div style={{ textAlign: "center", fontSize: 20, fontWeight: 900, opacity: 0.95 }}>
        {typeof lastScore === "number" ? `Challenge score: ${Math.round(lastScore * 100)}%` : "Challenge submitted."}
      </div>

      <div style={{ marginTop: 14, border: "1px solid #333", borderRadius: 16, padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 900, textAlign: "center", marginBottom: 8 }}>
          What you can now do
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, opacity: 0.9, lineHeight: 1.7, fontSize: 16 }}>
          <li>Use SI units and prefixes correctly.</li>
          <li>Tell scalars from vectors in context.</li>
          <li>Read instruments with a sensible uncertainty.</li>
          <li>Apply significant figures and rounding rules.</li>
          <li>Compute density and report units correctly.</li>
          <li>Explain precision vs accuracy.</li>
        </ul>

        <div style={{ textAlign: "center", marginTop: 12, opacity: 0.9 }}>
          Module mastery:{" "}
          <b>{moduleProgress ? `${Math.round((moduleProgress.mastery_score || 0) * 100)}%` : "—"}</b>
        </div>

        <button style={styles.secondaryBtn} onClick={onRefresh}>
          Refresh progress
        </button>
      </div>
    </div>
  );
}

function TeacherPanel({
  moduleId,
  lesson,
  step,
  readiness,
  threshold,
  capsuleScores,
  capsuleCoverage,
  simDoneCycles,
  labCyclesRequired,
}: {
  moduleId: string;
  lesson: any;
  step: Step;
  readiness: number;
  threshold: number;
  capsuleScores: Record<string, number>;
  capsuleCoverage: number;
  simDoneCycles: number;
  labCyclesRequired: number;
}) {
  return (
    <details style={{ marginTop: 16, opacity: 0.95 }}>
      <summary style={{ cursor: "pointer", fontWeight: 900, fontSize: 16 }}>
        Teacher Panel (instructor/admin only)
      </summary>

      <div style={{ marginTop: 10, border: "1px solid #333", borderRadius: 14, padding: 12, fontSize: 14 }}>
        <div><b>moduleId:</b> {moduleId}</div>
        <div><b>lessonId:</b> {lesson?.id}</div>
        <div><b>step:</b> {step}</div>
        <div><b>readiness:</b> {readiness.toFixed(2)} (threshold {threshold.toFixed(2)})</div>
        <div><b>sim cycles:</b> {simDoneCycles}/{labCyclesRequired}</div>
        <div><b>capsule coverage avg:</b> {Math.round(capsuleCoverage * 100)}%</div>
        <div style={{ marginTop: 8 }}>
          <b>capsule scores:</b>{" "}
          <span style={{ opacity: 0.85 }}>{Object.keys(capsuleScores).length ? JSON.stringify(capsuleScores) : "—"}</span>
        </div>
      </div>
    </details>
  );
}

/* -------------------- Student Question Renderer -------------------- */

function StudentQuestionList({
  items,
  mcq,
  setMcq,
  short,
  setShort,
  submitted,
  showIds,
  styles,
}: {
  items: Item[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
  submitted: boolean;
  showIds: boolean;
  styles: any;
}) {
  if (!items?.length) {
    return <div style={{ opacity: 0.85, textAlign: "center" }}>No tasks found.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
      {items.map((q) => {
        const key = q.question_id;

        const isMcq = q.type === "mcq";
        const chosen = isMcq ? mcq[key] : undefined;

        const correct =
          submitted && isMcq && typeof (q as McqItem).correct_index === "number"
            ? chosen === (q as McqItem).correct_index
            : null;

        return (
          <div key={key} style={{ border: "1px solid #333", borderRadius: 16, padding: 16 }}>
            <div style={{ textAlign: "center", fontSize: 22, fontWeight: 950, lineHeight: 1.25 }}>
              {showIds ? <span style={{ opacity: 0.65 }}>{key}: </span> : null}
              {q.prompt}
            </div>

            {isMcq ? (
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {(q as McqItem).choices.map((c, idx) => {
                  const active = chosen === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setMcq({ ...mcq, [key]: idx })}
                      style={styles.choiceTile(active)}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 999, border: "2px solid #777", display: "grid", placeItems: "center", marginTop: 2 }}>
                        {active ? "●" : ""}
                      </div>
                      <div style={{ flex: 1 }}>{c}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <textarea
                  rows={3}
                  value={short[key] || ""}
                  onChange={(e) => setShort({ ...short, [key]: e.target.value })}
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    padding: 12,
                    border: "1px solid #333",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 18,
                    fontWeight: 750,
                  }}
                  placeholder="Type your answer…"
                />
              </div>
            )}

            {submitted && correct !== null ? (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 14,
                  padding: 12,
                  textAlign: "center",
                  fontWeight: 950,
                  border: correct ? "1px solid #2a6" : "1px solid #a22",
                  background: correct ? "rgba(0,255,120,0.06)" : "rgba(255,60,60,0.06)",
                }}
              >
                {correct ? "✅ Correct" : "❌ Not yet"}
                <div style={{ marginTop: 6, opacity: 0.9, fontWeight: 800, fontSize: 14 }}>
                  {correct
                    ? "Good — keep going."
                    : "Try again: focus on the core idea, not the numbers."}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}