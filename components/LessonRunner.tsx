"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";

type RunnerQuestion =
  | {
      type: "mcq";
      question_id?: string;
      prompt: string;
      choices?: string[] | null;
      correct_index?: number;
      misconception_tags?: string[];
      hint?: string;
    }
  | {
      type: "short";
      question_id?: string;
      prompt: string;
      choices?: null;
      misconception_tags?: string[];
      hint?: string;
    };

type LessonRef = {
  id?: string;
  lesson_id?: string;
  title?: string;
  sequence?: number;
  phases?: {
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
};

type RunnerStageKey =
  | "diagnostic"
  | "scaffolded_teaching"
  | "concept_gate"
  | "simulation"
  | "mastery_check";

type RunnerStage = {
  key: RunnerStageKey;
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
  diagnostic?: {
    min_questions: number;
    max_questions: number;
    target_question_count: number;
    completed: boolean;
    asked_count?: number;
    latest_score?: number;
  };
  mastery_check?: {
    min_questions: number;
    max_questions: number;
    selected_question_count: number;
    threshold: number;
    attempt_count: number;
    best_score: number;
    required_correct?: number;
    eligible_for_immediate_retest?: boolean;
    review_required?: boolean;
    review_recommended?: boolean;
    weak_concepts?: string[];
    recommended_review_refs?: string[];
  };
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

type Props = {
  moduleId: string;
  lesson: LessonRef;
  misconceptionAllowlist: string[];
  onRequestNextLesson?: () => void;
  onRefreshStatus?: () => Promise<void> | void;
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type FeedbackState = {
  kind: "ok" | "warn";
  title: string;
  body?: string;
};

const HINT_BY_TAG: Record<string, string> = {
  unit_conversion: "Tip: write the conversion factor so the units cancel cleanly.",
  si_prefixes: "Tip: kilo = 10^3, milli = 10^-3, micro = 10^-6.",
  scalar_vs_vector: "Tip: a vector needs both magnitude and direction.",
  reading_scales: "Tip: use the smallest division to estimate a reasonable reading.",
  significant_figures:
    "Tip: your final answer cannot claim more precision than your measurement.",
  rounding_rules: "Tip: round the final result carefully, not too early.",
  precision_vs_accuracy:
    "Tip: precision is grouping; accuracy is closeness to the true value.",
  random_vs_systematic_error:
    "Tip: systematic error shifts results one way; random error varies around a value.",
  uncertainty_estimation:
    "Tip: uncertainty is usually tied to instrument resolution.",
  density_concept: "Tip: density means mass packed into each unit volume.",
  density_units: "Tip: keep density units consistent before comparing values.",
};

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizeLessonId(value: string | undefined | null): string {
  return String(value || "").replace(/-/g, "_");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .trim();
}

function isRunnerQuestion(value: unknown): value is RunnerQuestion {
  if (!value || typeof value !== "object") return false;

  const q = value as Record<string, unknown>;
  if (q.type !== "mcq" && q.type !== "short") return false;
  if (typeof q.prompt !== "string") return false;

  if (q.type === "mcq") {
    return q.choices == null || Array.isArray(q.choices);
  }

  return true;
}

function dedupeQuestions(
  items: unknown[] | undefined,
): Array<RunnerQuestion & { __key: string }> {
  const list = Array.isArray(items) ? items.filter(isRunnerQuestion) : [];
  const seen = new Set<string>();
  const out: Array<RunnerQuestion & { __key: string }> = [];

  for (let index = 0; index < list.length; index += 1) {
    const item = list[index];
    const qid = normalizeText(String(item.question_id || ""));
    const prompt = normalizeText(String(item.prompt || ""));
    const choices = Array.isArray(item.choices)
      ? item.choices.map((choice) => normalizeText(String(choice))).join("|")
      : "";

    const fingerprint = qid ? `id:${qid}` : `p:${prompt}::c:${choices}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);

    out.push({
      ...item,
      __key: String(item.question_id || `q_${index}`),
    });
  }

  return out;
}

function scoreMcq(
  items: Array<RunnerQuestion & { __key: string }>,
  chosenMap: Record<string, number>,
): number | null {
  const mcqs = items.filter((item) => item.type === "mcq");
  if (!mcqs.length) return null;

  let total = 0;
  let correct = 0;

  for (const question of mcqs) {
    const key = String(question.question_id || question.__key);
    const chosen = chosenMap[key];
    if (typeof chosen !== "number") continue;

    total += 1;
    if (
      typeof question.correct_index === "number" &&
      chosen === question.correct_index
    ) {
      correct += 1;
    }
  }

  if (total === 0) return 0;
  return clamp01(correct / total);
}

function pickHint(question: RunnerQuestion): string {
  if (typeof question.hint === "string" && question.hint.trim()) {
    return question.hint.trim();
  }

  const tags = Array.isArray(question.misconception_tags)
    ? question.misconception_tags
    : [];
  for (const tag of tags) {
    if (HINT_BY_TAG[tag]) return HINT_BY_TAG[tag];
  }

  return "Tip: show your reasoning clearly and keep your units consistent.";
}

function filterAllowedTags(tags: string[] | undefined, allowlist: string[]): string[] {
  const allow = new Set(allowlist || []);
  return (tags || []).filter((tag) => allow.has(tag));
}

function collectAllowedTags(
  items: Array<RunnerQuestion & { __key: string }>,
  allowlist: string[],
): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    const raw = Array.isArray(item.misconception_tags)
      ? item.misconception_tags
      : [];
    for (const tag of filterAllowedTags(raw, allowlist)) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
}

function getActiveStageKey(stages: RunnerStage[]): RunnerStageKey | null {
  const active = stages.find((stage) => stage.active);
  return active ? active.key : null;
}

function getReviewTitle(reviewRef: string): string {
  const map: Record<string, string> = {
    concept_unit_conversion: "Review: Unit conversion",
    concept_prefix_scaling: "Review: SI prefixes and scaling",
    concept_scalar_vector_difference: "Review: Scalars vs vectors",
    concept_reading_scales: "Review: Reading scales correctly",
    concept_significant_figures: "Review: Significant figures",
    concept_rounding_rules: "Review: Rounding rules",
    concept_precision_accuracy: "Review: Precision vs accuracy",
    concept_random_systematic_error: "Review: Random vs systematic error",
    concept_uncertainty_estimation: "Review: Estimating uncertainty",
    concept_density_meaning: "Review: What density means",
    concept_density_units: "Review: Density units",
  };

  return map[reviewRef] || reviewRef.replace(/_/g, " ");
}

export default function LessonRunner({
  moduleId,
  lesson,
  misconceptionAllowlist,
  onRequestNextLesson,
  onRefreshStatus,
}: Props) {
  const lessonId = useMemo(
    () => normalizeLessonId(lesson.id || lesson.lesson_id),
    [lesson.id, lesson.lesson_id],
  );

  const phases = useMemo(() => lesson.phases || {}, [lesson.phases]);

  const diagnosticItems = useMemo(
    () => dedupeQuestions(phases.diagnostic?.items),
    [phases.diagnostic?.items],
  );

  const transferItems = useMemo(
    () => dedupeQuestions(phases.transfer?.items),
    [phases.transfer?.items],
  );

  const analogyText = useMemo(
    () => String(phases.analogical_grounding?.analogy_text || ""),
    [phases.analogical_grounding?.analogy_text],
  );

  const simPrompts = useMemo(
    () =>
      Array.isArray(phases.simulation_inquiry?.inquiry_prompts)
        ? phases.simulation_inquiry.inquiry_prompts
        : [],
    [phases.simulation_inquiry?.inquiry_prompts],
  );

  const reconPrompts = useMemo(
    () =>
      Array.isArray(phases.concept_reconstruction?.prompts)
        ? phases.concept_reconstruction.prompts
        : [],
    [phases.concept_reconstruction?.prompts],
  );

  const [runner, setRunner] = useState<RunnerResponse | null>(null);
  const [loadingRunner, setLoadingRunner] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [toolChoice, setToolChoice] = useState<"rough" | "precision" | "">("");
  const [toolWhy, setToolWhy] = useState<string>("");
  const [conceptGateAnswer, setConceptGateAnswer] = useState<"rough" | "precision" | "">("");

  const refreshRunner = useCallback(async (): Promise<void> => {
    if (!moduleId || !lessonId) {
      setRunner(null);
      setLoadingRunner(false);
      setError("Missing lesson context.");
      return;
    }

    setLoadingRunner(true);
    try {
      const data = await apipGet<RunnerResponse>(
        `/student/modules/${encodeURIComponent(moduleId)}/lessons/${encodeURIComponent(lessonId)}/runner`,
      );
      setRunner(data);
      setError("");
    } catch (err) {
      setRunner(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingRunner(false);
    }
  }, [lessonId, moduleId]);

  useEffect(() => {
    setStartedAt(Date.now());
    setFeedback(null);
    setStatus("");
    setMcqAnswers({});
    setShortAnswers({});
    setToolChoice("");
    setToolWhy("");
    setConceptGateAnswer("");
    void refreshRunner();
  }, [refreshRunner]);

  const moduleMasteryPct = useMemo(
    () => Math.round(clamp01(Number(runner?.module?.module_mastery || 0)) * 100),
    [runner?.module?.module_mastery],
  );

  const lessonBestScorePct = useMemo(
    () => Math.round(clamp01(Number(runner?.lesson?.best_score || 0)) * 100),
    [runner?.lesson?.best_score],
  );

  const activeStage = useMemo(
    () => getActiveStageKey(runner?.lesson?.stages || []),
    [runner?.lesson?.stages],
  );

  const canAdvance = Boolean(runner?.lesson?.can_advance);
  const lessonCompleted = Boolean(runner?.lesson?.mastery_achieved);
  const masteryMeta = runner?.lesson?.mastery_check;
  const diagnosticMeta = runner?.lesson?.diagnostic;
  const weakConcepts = masteryMeta?.weak_concepts || [];
  const reviewRefs = masteryMeta?.recommended_review_refs || [];

  function durationSeconds(): number {
    return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  }

  async function logProgressEvent(
    eventType: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt",
    score?: number,
    tags?: string[],
    extraDetails?: Record<string, unknown>,
  ): Promise<void> {
    const details: JsonObject = {
      lesson_id: lessonId,
      stage: activeStage,
    };

    if (extraDetails) {
      for (const [key, value] of Object.entries(extraDetails)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value === null
        ) {
          details[key] = value;
        }
      }
    }

    const payload: JsonObject = {
      event_type: eventType,
      duration_seconds: durationSeconds(),
      misconception_tags: tags || [],
      details,
    };

    if (typeof score === "number") {
      payload.score = clamp01(score);
    }

    setStatus("Saving...");
    try {
      await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    } finally {
      setStatus("");
    }
  }

  async function refreshAllStatus(): Promise<void> {
    if (onRefreshStatus) {
      await onRefreshStatus();
    }
    await refreshRunner();
  }

  async function submitDiagnostic(): Promise<void> {
    const mcqQuestions = diagnosticItems.filter((item) => item.type === "mcq");
    const shortQuestions = diagnosticItems.filter((item) => item.type === "short");

    const missingMcq = mcqQuestions.some(
      (question) =>
        typeof mcqAnswers[String(question.question_id || question.__key)] !== "number",
    );
    if (missingMcq) {
      setFeedback({
        kind: "warn",
        title: "Answer all diagnostic multiple-choice items first.",
      });
      return;
    }

    const missingShort = shortQuestions.some(
      (question) =>
        !(shortAnswers[String(question.question_id || question.__key)] || "").trim(),
    );
    if (missingShort) {
      setFeedback({
        kind: "warn",
        title: "Write an answer for every diagnostic written item first.",
      });
      return;
    }

    const score = scoreMcq(diagnosticItems, mcqAnswers) ?? 0;
    const tags = collectAllowedTags(diagnosticItems, misconceptionAllowlist);

    await logProgressEvent("diagnostic", score, tags, {
      source: "student_runner_diagnostic",
      asked_count: diagnosticItems.length,
      target_question_count: diagnosticMeta?.target_question_count ?? diagnosticItems.length,
    });

    setStartedAt(Date.now());
    setFeedback({
      kind: "ok",
      title: `Diagnostic recorded: ${Math.round(score * 100)}%`,
      body: "Now the runner can move into guided concept building.",
    });
    await refreshAllStatus();
  }

  async function submitTeachingCheckpoint(): Promise<void> {
    if (!toolChoice) {
      setFeedback({
        kind: "warn",
        title: "Choose the tool you would trust more.",
      });
      return;
    }
    if (!toolWhy.trim()) {
      setFeedback({
        kind: "warn",
        title: "Write your explanation before continuing.",
      });
      return;
    }

    await logProgressEvent("reflection", undefined, [], {
      source: "student_runner_scaffolded_teaching",
      tool_choice: toolChoice,
      tool_why: toolWhy.slice(0, 300),
    });

    setStartedAt(Date.now());
    setFeedback({
      kind: "ok",
      title: "Guided concept building saved.",
      body: "Next you will pass through a concept gate before the lab or mastery check.",
    });
    await refreshAllStatus();
  }

  async function submitCapsules(): Promise<void> {
    const missing = reconPrompts.some(
      (_, index) => !(shortAnswers[`cap_${index}`] || "").trim(),
    );
    if (missing) {
      setFeedback({
        kind: "warn",
        title: "Complete each guided concept response before continuing.",
      });
      return;
    }

    if (!toolChoice) {
      setFeedback({
        kind: "warn",
        title: "Choose the tool you would trust more before continuing.",
      });
      return;
    }

    if (!toolWhy.trim()) {
      setFeedback({
        kind: "warn",
        title: "Write your explanation before continuing.",
      });
      return;
    }

    await logProgressEvent("reflection", undefined, [], {
      source: "student_runner_concept_reconstruction",
      tool_choice: toolChoice,
      tool_why: toolWhy.slice(0, 300),
    });

    setStartedAt(Date.now());
    setFeedback({
      kind: "ok",
      title: "Concept reconstruction saved.",
      body: "Next you will face a concept gate.",
    });
    await refreshAllStatus();
  }

  async function submitConceptGate(): Promise<void> {
    if (!conceptGateAnswer) {
      setFeedback({
        kind: "warn",
        title: "Answer the concept-gate question before continuing.",
      });
      return;
    }

    const isCorrect = conceptGateAnswer === "precision";

    await logProgressEvent("reflection", isCorrect ? 1 : 0, [], {
      source: "student_runner_concept_gate",
      stage: "concept_gate",
      concept_gate_answer: conceptGateAnswer,
      concept_gate_correct: isCorrect,
    });

    setStartedAt(Date.now());
    setFeedback({
      kind: isCorrect ? "ok" : "warn",
      title: isCorrect ? "Concept gate passed." : "Concept gate recorded.",
      body: isCorrect
        ? "You can now move forward in the lesson flow."
        : "That answer was not ideal, but the system has recorded your concept-gate result and updated your guidance.",
    });
    await refreshAllStatus();
  }

  async function submitSimulation(): Promise<void> {
    const observation = (shortAnswers.lab_notes || "").trim();
    if (!observation) {
      setFeedback({
        kind: "warn",
        title: "Write one observation before leaving the lab.",
      });
      return;
    }

    await logProgressEvent("simulation", undefined, [], {
      source: "student_runner_simulation",
      observation: observation.slice(0, 300),
    });

    setStartedAt(Date.now());
    setFeedback({
      kind: "ok",
      title: "Simulation progress saved.",
      body: "You can proceed to the mastery check when the runner refreshes.",
    });
    await refreshAllStatus();
  }

  async function submitMasteryCheck(): Promise<void> {
    const mcqQuestions = transferItems.filter((item) => item.type === "mcq");
    const shortQuestions = transferItems.filter((item) => item.type === "short");

    const missingMcq = mcqQuestions.some(
      (question) =>
        typeof mcqAnswers[String(question.question_id || question.__key)] !== "number",
    );
    if (missingMcq) {
      setFeedback({
        kind: "warn",
        title: "Answer all mastery-check multiple-choice items first.",
      });
      return;
    }

    const missingShort = shortQuestions.some(
      (question) =>
        !(shortAnswers[String(question.question_id || question.__key)] || "").trim(),
    );
    if (missingShort) {
      setFeedback({
        kind: "warn",
        title: "Write an answer for every mastery-check written item first.",
      });
      return;
    }

    const score = scoreMcq(transferItems, mcqAnswers) ?? 0;
    const tags = collectAllowedTags(transferItems, misconceptionAllowlist);

    await logProgressEvent("transfer", score, tags, {
      source: "student_runner_mastery_check",
      question_count: transferItems.length,
    });

    await refreshAllStatus();

    const pct = Math.round(score * 100);
    const threshold = Number(runner?.lesson?.mastery_threshold || 0.8);

    if (score >= threshold) {
      setFeedback({
        kind: "ok",
        title: `Mastery check passed: ${pct}%`,
        body: "Lesson completed. You can move to the next sub-unit.",
      });
    } else {
      setFeedback({
        kind: "warn",
        title: `Mastery check score: ${pct}%`,
        body:
          "This does not yet meet the 80% threshold. You can retest immediately or review the targeted lecture references below.",
      });
    }
  }

  async function retestNow(): Promise<void> {
    setFeedback({
      kind: "ok",
      title: "Retest prepared.",
      body:
        "The runner will reuse the mastery stage, and the backend can choose a reshuffled or fresh set of questions where available.",
    });
    setStartedAt(Date.now());
    setMcqAnswers({});
    setShortAnswers({});
    await refreshAllStatus();
  }

  async function reviewWeakAreas(): Promise<void> {
    const message =
      reviewRefs.length > 0
        ? `Recommended review sections: ${reviewRefs.map(getReviewTitle).join(", ")}`
        : weakConcepts.length > 0
          ? `Weak concepts: ${weakConcepts.join(", ")}`
          : "Review the guided concept building section, then try the mastery check again.";

    setFeedback({
      kind: "warn",
      title: "Targeted review recommended.",
      body: message,
    });

    setStartedAt(Date.now());
    setMcqAnswers({});
    setShortAnswers({});
  }

  const styles = {
    wrap: {
      maxWidth: 980,
      margin: "0 auto",
      padding: "22px 16px 26px 16px",
    } as React.CSSProperties,
    header: { textAlign: "center", marginBottom: 18 } as React.CSSProperties,
    lessonTitle: {
      fontSize: 56,
      fontWeight: 900,
      lineHeight: 1.05,
      margin: "0 0 10px 0",
      letterSpacing: -0.5,
    } as React.CSSProperties,
    subtitle: { fontSize: 18, opacity: 0.85, marginBottom: 14 } as React.CSSProperties,
    chipsRow: {
      display: "flex",
      justifyContent: "center",
      gap: 10,
      flexWrap: "wrap",
      marginBottom: 18,
    } as React.CSSProperties,
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
    bigH2: {
      fontSize: 34,
      fontWeight: 900,
      textAlign: "center",
      margin: "4px 0 10px 0",
      letterSpacing: -0.2,
    } as React.CSSProperties,
    bodyText: {
      fontSize: 18,
      opacity: 0.9,
      textAlign: "center",
      lineHeight: 1.55,
      margin: "0 0 14px 0",
    } as React.CSSProperties,
    divider: {
      height: 1,
      background: "rgba(255,255,255,0.10)",
      margin: "14px 0",
    } as React.CSSProperties,
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
    questionCard: {
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 16,
      marginTop: 12,
    } as React.CSSProperties,
    prompt: {
      fontSize: 22,
      fontWeight: 900,
      marginBottom: 12,
      lineHeight: 1.25,
    } as React.CSSProperties,
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
      }) as React.CSSProperties,
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
    hint: {
      marginTop: 10,
      fontSize: 15,
      opacity: 0.85,
      lineHeight: 1.45,
    } as React.CSSProperties,
    footerRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 14,
      opacity: 0.9,
      alignItems: "center",
      flexWrap: "wrap",
    } as React.CSSProperties,
  };

  if (loadingRunner) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", opacity: 0.85 }}>
            Loading lesson runner...
          </div>
        </div>
      </div>
    );
  }

  if (error || !runner) {
    return (
      <div style={styles.wrap}>
        <div style={styles.feedbackWarn}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            Runner load failed
          </div>
          <div style={{ marginTop: 6 }}>{error || "Unknown error."}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.lessonTitle}>
          {runner.lesson.title || lesson.title || "Lesson"}
        </div>

        <div style={styles.chipsRow}>
          <div style={styles.chip}>
            Module mastery: <b>{moduleMasteryPct}%</b>
          </div>
          <div style={styles.chip}>
            Best mastery check: <b>{lessonBestScorePct}%</b>
          </div>
          <div style={styles.chip}>
            Lesson: <b>{lessonCompleted ? "Completed" : "In progress"}</b>
          </div>
          {diagnosticMeta ? (
            <div style={styles.chip}>
              Diagnostic target: <b>{diagnosticMeta.target_question_count}</b>
            </div>
          ) : null}
          {masteryMeta ? (
            <div style={styles.chip}>
              Mastery questions: <b>{masteryMeta.selected_question_count}</b>
            </div>
          ) : null}
        </div>

        <div style={styles.subtitle}>
          This flow is backend-driven. Diagnostic does not count toward mastery.
          Only the final mastery check does.
        </div>
      </div>

      {feedback ? (
        <div style={feedback.kind === "ok" ? styles.feedbackOk : styles.feedbackWarn}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{feedback.title}</div>
          {feedback.body ? (
            <div style={{ marginTop: 6, opacity: 0.9 }}>{feedback.body}</div>
          ) : null}
        </div>
      ) : null}

      {status ? (
        <div
          style={{
            ...styles.card,
            textAlign: "center",
            marginBottom: 14,
            opacity: 0.9,
          }}
        >
          {status}
        </div>
      ) : null}

      <div style={styles.card}>
        {activeStage === "diagnostic" ? (
          <>
            <div style={styles.bigH2}>Initial Diagnostic</div>
            <p style={styles.bodyText}>
              Answer first. This identifies misconceptions, but it does not count
              toward mastery.
            </p>
            <QuestionListStudent
              items={diagnosticItems}
              mcq={mcqAnswers}
              setMcq={setMcqAnswers}
              short={shortAnswers}
              setShort={setShortAnswers}
            />
            <div style={styles.divider} />
            <button style={styles.btnPrimary} onClick={() => void submitDiagnostic()}>
              Continue →
            </button>
          </>
        ) : null}

        {activeStage === "scaffolded_teaching" ? (
          <>
            <div style={styles.bigH2}>Guided Concept Building</div>

            {analogyText ? (
              <p style={{ ...styles.bodyText, whiteSpace: "pre-wrap" }}>
                {analogyText}
              </p>
            ) : null}

            <div style={styles.questionCard}>
              <div style={styles.prompt}>Tool Trust</div>
              <div style={{ ...styles.bodyText, marginTop: -6, marginBottom: 12 }}>
                Choose the tool engineers would trust more, then explain why.
              </div>

              <div style={styles.choiceGrid}>
                <button
                  style={styles.choiceBtn(toolChoice === "rough")}
                  onClick={() => setToolChoice("rough")}
                >
                  Rough ruler (±1 cm)
                </button>
                <button
                  style={styles.choiceBtn(toolChoice === "precision")}
                  onClick={() => setToolChoice("precision")}
                >
                  Precision caliper (±0.01 cm)
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
                  Your explanation
                </div>
                <textarea
                  style={styles.textarea}
                  placeholder="Explain in 1–2 sentences..."
                  value={toolWhy}
                  onChange={(event) => setToolWhy(event.target.value)}
                />
                <div style={styles.hint}>
                  Hint: precision affects what level of confidence you can reasonably claim.
                </div>
              </div>
            </div>

            {reconPrompts.length ? (
              <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                {reconPrompts.map((prompt, index) => (
                  <div key={`cap_${index}`} style={styles.questionCard}>
                    <div style={styles.prompt}>{prompt}</div>
                    <textarea
                      style={styles.textarea}
                      value={shortAnswers[`cap_${index}`] || ""}
                      onChange={(event) =>
                        setShortAnswers((prev) => ({
                          ...prev,
                          [`cap_${index}`]: event.target.value,
                        }))
                      }
                      placeholder="Write 2–4 sentences..."
                    />
                    <div style={styles.hint}>
                      Hint: keep the explanation concrete and tied to the lesson idea.
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: 14 }}>
              <button
                style={styles.btnPrimary}
                onClick={() =>
                  reconPrompts.length
                    ? void submitCapsules()
                    : void submitTeachingCheckpoint()
                }
              >
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {activeStage === "concept_gate" ? (
          <>
            <div style={styles.bigH2}>Concept Gate</div>
            <p style={styles.bodyText}>
              Before you continue, answer this conceptual check.
            </p>

            <div style={styles.questionCard}>
              <div style={styles.prompt}>
                Which tool gives the more reliable measurement for careful engineering work?
              </div>

              <div style={styles.choiceGrid}>
                <button
                  style={styles.choiceBtn(conceptGateAnswer === "rough")}
                  onClick={() => setConceptGateAnswer("rough")}
                >
                  Rough ruler (±1 cm)
                </button>
                <button
                  style={styles.choiceBtn(conceptGateAnswer === "precision")}
                  onClick={() => setConceptGateAnswer("precision")}
                >
                  Precision caliper (±0.01 cm)
                </button>
              </div>

              <div style={styles.hint}>
                Hint: the more precise instrument supports tighter uncertainty and stronger trust.
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={() => void submitConceptGate()}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {activeStage === "simulation" ? (
          <>
            <div style={styles.bigH2}>Sim Lab</div>
            <p style={styles.bodyText}>
              Run the lab once, then record one observation.
            </p>

            {simPrompts.length ? (
              <div
                style={{
                  marginTop: 8,
                  textAlign: "center",
                  opacity: 0.95,
                  fontSize: 18,
                  lineHeight: 1.6,
                }}
              >
                {simPrompts.map((prompt, index) => (
                  <div key={`sim_${index}`} style={{ marginBottom: 6 }}>
                    • {prompt}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>
                Your observation
              </div>
              <textarea
                style={styles.textarea}
                placeholder="Write what you observed..."
                value={shortAnswers.lab_notes || ""}
                onChange={(event) =>
                  setShortAnswers((prev) => ({
                    ...prev,
                    lab_notes: event.target.value,
                  }))
                }
              />
              <div style={styles.hint}>
                Hint: focus on what changed, what stayed constant, and what that means.
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <button style={styles.btnPrimary} onClick={() => void submitSimulation()}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {activeStage === "mastery_check" ? (
          <>
            <div style={styles.bigH2}>Mastery Check</div>
            <p style={styles.bodyText}>
              This final check determines lesson mastery. You need 80% or higher
              to complete the lesson.
            </p>

            {masteryMeta ? (
              <div style={{ ...styles.questionCard, marginTop: 0 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Assessment contract</div>
                <div style={{ opacity: 0.9, lineHeight: 1.5 }}>
                  Question count: <b>{masteryMeta.selected_question_count}</b>
                  {" · "}
                  Required threshold: <b>{Math.round(masteryMeta.threshold * 100)}%</b>
                  {typeof masteryMeta.required_correct === "number" ? (
                    <>
                      {" · "}
                      Minimum correct answers: <b>{masteryMeta.required_correct}</b>
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            <QuestionListStudent
              items={transferItems}
              mcq={mcqAnswers}
              setMcq={setMcqAnswers}
              short={shortAnswers}
              setShort={setShortAnswers}
            />

            <div style={{ marginTop: 14 }}>
              <button
                style={styles.btnPrimary}
                onClick={() => void submitMasteryCheck()}
              >
                Submit mastery check ✓
              </button>
            </div>

            {masteryMeta?.attempt_count && masteryMeta.attempt_count > 0 && !lessonCompleted ? (
              <div style={styles.footerRow}>
                <button style={styles.btnGhost} onClick={() => void retestNow()}>
                  Retest now
                </button>
                <button style={styles.btnGhost} onClick={() => void reviewWeakAreas()}>
                  Review weak areas
                </button>
              </div>
            ) : null}

            {weakConcepts.length > 0 || reviewRefs.length > 0 ? (
              <div style={styles.questionCard}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Targeted review guidance</div>

                {weakConcepts.length > 0 ? (
                  <div style={{ marginBottom: 10, opacity: 0.9 }}>
                    Weak concepts: {weakConcepts.join(", ")}
                  </div>
                ) : null}

                {reviewRefs.length > 0 ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {reviewRefs.map((reviewRef) => (
                      <div
                        key={reviewRef}
                        style={{
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        {getReviewTitle(reviewRef)}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}

        {!activeStage && lessonCompleted ? (
          <>
            <div style={styles.bigH2}>Lesson Finished</div>
            <p style={styles.bodyText}>
              Completed ✅ You can move on to the next sub-unit.
            </p>

            <div style={styles.footerRow}>
              <button
                style={styles.btnGhost}
                onClick={() => {
                  setFeedback(null);
                  setStartedAt(Date.now());
                  void refreshAllStatus();
                }}
              >
                Refresh status
              </button>

              <button
                style={styles.btnGhost}
                onClick={() => {
                  if (onRequestNextLesson) onRequestNextLesson();
                }}
                disabled={!canAdvance}
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
  items: Array<RunnerQuestion & { __key: string }>;
  mcq: Record<string, number>;
  setMcq: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  short: Record<string, string>;
  setShort: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  if (!items.length) {
    return <div style={{ opacity: 0.85, textAlign: "center" }}>No questions available.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
      {items.map((question, index) => {
        const key = String(question.question_id || question.__key || `q_${index}`);
        const prompt = String(question.prompt || "");

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
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                marginBottom: 12,
                lineHeight: 1.25,
              }}
            >
              {prompt}
            </div>

            {question.type === "mcq" ? (
              <div style={{ display: "grid", gap: 10 }}>
                {(question.choices || []).map((choice, choiceIndex) => {
                  const active = mcq[key] === choiceIndex;
                  return (
                    <button
                      key={`${key}_${choiceIndex}`}
                      onClick={() =>
                        setMcq((prev) => ({ ...prev, [key]: choiceIndex }))
                      }
                      style={{
                        textAlign: "left",
                        padding: "14px 14px",
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: active
                          ? "rgba(155, 81, 224, 0.22)"
                          : "rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {choice}
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
                  onChange={(event) =>
                    setShort((prev) => ({ ...prev, [key]: event.target.value }))
                  }
                  placeholder="Write your answer..."
                />
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    opacity: 0.85,
                    lineHeight: 1.45,
                  }}
                >
                  Hint: {pickHint(question)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}