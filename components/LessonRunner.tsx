"use client";

import { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";

type ViewMode = "student" | "instructor" | "admin";

type Props = {
  view?: ViewMode;
  moduleId: string;
  lesson: any;
  misconceptionAllowlist: string[];
};

type McqItem = {
  type: "mcq";
  question_id: string;
  prompt: string;
  choices: string[];
  correct_index?: number; // exists in seeded content (OK for internal test)
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

function toPct(score01: number) {
  const x = Math.round(clamp01(score01) * 100);
  return `${x}%`;
}

function gradeLabel(score01: number) {
  const s = clamp01(score01);
  if (s >= 0.9) return "Excellent";
  if (s >= 0.75) return "Good";
  if (s >= 0.6) return "Developing";
  return "Needs Work";
}

export default function LessonRunner({ view = "student", moduleId, lesson, misconceptionAllowlist }: Props) {
  const isStudent = view === "student";

  const phases = lesson?.phases || {};

  const diagnosticItems: Item[] = phases?.diagnostic?.items || [];
  const transferItems: Item[] = phases?.transfer?.items || [];
  const analogyText: string = phases?.analogical_grounding?.analogy_text || "";
  const commitmentPrompt: string = phases?.analogical_grounding?.commitment_prompt || "";
  const reconPrompts: string[] = phases?.concept_reconstruction?.prompts || [];
  const sim = phases?.simulation_inquiry || {};
  const simLabId: string | null = sim?.lab_id || null;
  const simPrompts: string[] = sim?.inquiry_prompts || [];

  const [step, setStep] = useState<"diagnostic" | "analogy" | "simulation" | "reconstruction" | "transfer" | "done">(
    "diagnostic"
  );
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  // responses
  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});

  // Hidden for students (but still used internally for logging)
  const [confidence, setConfidence] = useState<number>(0.7);
  const [selfScore, setSelfScore] = useState<number>(0.8);

  // progress (hidden for students)
  const [progress, setProgress] = useState<ProgressMe | null>(null);

  // Student-facing "grade" feedback after submits
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastScoreLabel, setLastScoreLabel] = useState<string>("");

  useEffect(() => {
    // reset on lesson change
    setStep("diagnostic");
    setStartedAt(Date.now());
    setMcq({});
    setShort({});
    setConfidence(0.7);
    setSelfScore(0.8);
    setProgress(null);
    setLastScore(null);
    setLastScoreLabel("");
  }, [lesson?.id]);

  const title = lesson?.title || lesson?.id || "Lesson";

  const allTagsFor = (items: Item[]) => {
    const tags: string[] = [];
    for (const it of items) {
      const t = (it as any)?.misconception_tags || [];
      for (const x of t) tags.push(String(x));
    }
    return allowTags([...new Set(tags)], misconceptionAllowlist);
  };

  function durationSeconds() {
    const ms = Date.now() - startedAt;
    return Math.max(0, Math.round(ms / 1000));
  }

  function scoreMcq(items: Item[]) {
    const mcqItems = items.filter((x) => x.type === "mcq") as McqItem[];
    if (mcqItems.length === 0) return null;

    let correct = 0;
    let total = 0;
    for (const q of mcqItems) {
      const chosen = mcq[q.question_id];
      if (typeof chosen !== "number") continue;
      total += 1;
      if (typeof q.correct_index === "number" && chosen === q.correct_index) correct += 1;
    }
    if (total === 0) return 0;
    return clamp01(correct / total);
  }

  async function logEvent(
    event_type: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt",
    score?: number,
    tags?: string[]
  ) {
    const payload: any = {
      event_type,
      duration_seconds: durationSeconds(),
      confidence: clamp01(confidence),
      score: typeof score === "number" ? clamp01(score) : undefined,
      misconception_tags: allowTags(tags || [], misconceptionAllowlist),
      details: {
        lesson_id: lesson?.id,
        step: event_type,
      },
    };

    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
  }

  async function refreshProgress() {
    try {
      const p = await apipGet<ProgressMe>("/progress/me");
      setProgress(p);
    } catch {
      // non-fatal
    }
  }

  function computeScore(items: Item[]) {
    const mcqScore = scoreMcq(items);

    // If there are MCQs we can grade deterministically, use that.
    if (typeof mcqScore === "number") return mcqScore;

    // Otherwise: short-answer grading not implemented yet.
    // Student view should NOT see self-score. We use a neutral 0.5 for mastery stability.
    if (isStudent) return 0.5;

    // Instructor/admin test: allow manual self-score until rubric/autograder exists.
    return clamp01(selfScore);
  }

  function setStudentGrade(score01: number, context: "diagnostic" | "transfer") {
    const label = context === "diagnostic" ? "Checkpoint result" : "Scored result";
    setLastScore(score01);
    setLastScoreLabel(`${label}: ${gradeLabel(score01)} (${toPct(score01)})`);
  }

  async function submitDiagnostic() {
    const score = computeScore(diagnosticItems);
    const tags = allTagsFor(diagnosticItems);

    await logEvent("diagnostic", score, tags);
    await refreshProgress();

    if (isStudent) setStudentGrade(score, "diagnostic");

    setStartedAt(Date.now());
    setStep("analogy");
  }

  async function submitAnalogy() {
    // reflection event (not persisted per-event by backend)
    await logEvent("reflection", undefined, []);
    await refreshProgress();
    setStartedAt(Date.now());
    setStep(simLabId ? "simulation" : "reconstruction");
  }

  async function submitSimulation() {
    await logEvent("simulation", undefined, []);
    await refreshProgress();
    setStartedAt(Date.now());
    setStep("reconstruction");
  }

  async function submitReconstruction() {
    await logEvent("reflection", undefined, []);
    await refreshProgress();
    setStartedAt(Date.now());
    setStep("transfer");
  }

  async function submitTransfer() {
    const score = computeScore(transferItems);
    const tags = allTagsFor(transferItems);

    await logEvent("transfer", score, tags);
    await refreshProgress();

    if (isStudent) setStudentGrade(score, "transfer");

    setStep("done");
  }

  const moduleProgress = useMemo(() => {
    const mm = progress?.mastery_map || [];
    return mm.find((x) => x.module_id === moduleId) || null;
  }, [progress, moduleId]);

  // ----------------------------
  // UI helpers (student-friendly)
  // ----------------------------

  const cardStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: 18,
    padding: 18,
  };

  const primaryBtn: React.CSSProperties = {
    height: 48,
    padding: "0 18px",
    borderRadius: 14,
    fontSize: 18,
    fontWeight: 900,
  };

  const secondaryBtn: React.CSSProperties = {
    height: 44,
    padding: "0 16px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 800,
    opacity: 0.95,
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "6px 0 14px 0" }}>
        <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -0.3 }}>{title}</div>

        {/* Students shouldn't see internal step names */}
        {!isStudent ? (
          <div style={{ opacity: 0.8, marginTop: 8 }}>
            Step: <b>{step}</b>
          </div>
        ) : null}

        {/* Students shouldn't see mastery/readiness; instructors/admin can */}
        {!isStudent && moduleProgress ? (
          <div style={{ opacity: 0.85, marginTop: 10 }}>
            Mastery: <b>{moduleProgress.mastery_score?.toFixed?.(2) ?? moduleProgress.mastery_score}</b>{" "}
            • Readiness: <b>{moduleProgress.readiness}</b>
          </div>
        ) : null}
      </div>

      {/* Student-grade feedback */}
      {isStudent && lastScoreLabel ? (
        <div
          style={{
            ...cardStyle,
            marginBottom: 14,
            textAlign: "center",
            padding: 16,
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 950 }}>{lastScoreLabel}</div>
          <div style={{ opacity: 0.85, marginTop: 6 }}>
            Continue to the next step when ready.
          </div>
        </div>
      ) : null}

      {/* Main card */}
      <div style={cardStyle}>
        {/* Hidden tools: confidence + self-score only for non-students */}
        {!isStudent ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ opacity: 0.9 }}>
              Confidence (0–1):{" "}
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                style={{ width: 100, marginLeft: 8 }}
              />
            </div>

            <div style={{ opacity: 0.9 }}>
              Short-answer score (0–1):{" "}
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={selfScore}
                onChange={(e) => setSelfScore(Number(e.target.value))}
                style={{ width: 100, marginLeft: 8 }}
              />
            </div>
          </div>
        ) : null}

        {/* DIAGNOSTIC */}
        {step === "diagnostic" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 24, fontWeight: 950 }}>Checkpoint</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                Answer the questions. Then continue.
              </div>
            </div>

            <QuestionList view={view} items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button onClick={submitDiagnostic} style={primaryBtn}>
                Submit & Continue →
              </button>
            </div>
          </>
        ) : null}

        {/* ANALOGY */}
        {step === "analogy" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 24, fontWeight: 950 }}>Explanation</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                Read carefully. Then respond.
              </div>
            </div>

            {analogyText ? (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 18,
                  lineHeight: 1.6,
                  opacity: 0.95,
                  marginBottom: 14,
                }}
              >
                {analogyText}
              </div>
            ) : (
              <div style={{ opacity: 0.85, textAlign: "center", padding: 10 }}>No explanation text yet.</div>
            )}

            {commitmentPrompt ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 950, marginBottom: 10, fontSize: 18, textAlign: "center" }}>
                  {commitmentPrompt}
                </div>
                <textarea
                  rows={4}
                  value={short["commitment"] || ""}
                  onChange={(e) => setShort({ ...short, commitment: e.target.value })}
                  style={{ width: "100%", fontSize: 16, borderRadius: 14, padding: 12 }}
                  placeholder="Write your response…"
                />
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button onClick={submitAnalogy} style={primaryBtn}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {/* SIMULATION */}
        {step === "simulation" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 24, fontWeight: 950 }}>Lab Task</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                Complete the activity and record observations.
              </div>
            </div>

            {/* Students should NOT see lab IDs */}
            {!isStudent && simLabId ? (
              <div style={{ opacity: 0.9, marginBottom: 10 }}>
                Lab ID: <b>{simLabId}</b>
              </div>
            ) : null}

            {simPrompts?.length ? (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {simPrompts.map((p: string, i: number) => (
                  <div key={i} style={{ fontSize: 18, fontWeight: 850, lineHeight: 1.35 }}>
                    • {p}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.85, textAlign: "center", padding: 10 }}>No lab prompts provided.</div>
            )}

            <div style={{ marginTop: 12 }}>
              <textarea
                rows={5}
                placeholder="Write what you observed…"
                value={short["sim_notes"] || ""}
                onChange={(e) => setShort({ ...short, sim_notes: e.target.value })}
                style={{ width: "100%", fontSize: 16, borderRadius: 14, padding: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button onClick={submitSimulation} style={primaryBtn}>
                Finish Lab →
              </button>
            </div>
          </>
        ) : null}

        {/* RECONSTRUCTION */}
        {step === "reconstruction" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 24, fontWeight: 950 }}>Explain in Your Words</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                Answer using complete sentences.
              </div>
            </div>

            {reconPrompts?.length ? (
              <div style={{ display: "grid", gap: 14 }}>
                {reconPrompts.map((p: string, i: number) => (
                  <div key={i} style={{ border: "1px solid #333", borderRadius: 18, padding: 16 }}>
                    <div style={{ fontWeight: 950, marginBottom: 10, fontSize: 20, lineHeight: 1.25 }}>{p}</div>
                    <textarea
                      rows={4}
                      value={short[`recon_${i}`] || ""}
                      onChange={(e) => setShort({ ...short, [`recon_${i}`]: e.target.value })}
                      style={{ width: "100%", fontSize: 16, borderRadius: 14, padding: 12 }}
                      placeholder="Write your answer…"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.85, textAlign: "center", padding: 10 }}>No prompts.</div>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button onClick={submitReconstruction} style={primaryBtn}>
                Continue →
              </button>
            </div>
          </>
        ) : null}

        {/* TRANSFER */}
        {step === "transfer" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 24, fontWeight: 950 }}>Scored Task</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                Do your best — this counts.
              </div>
            </div>

            <QuestionList view={view} items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <button onClick={submitTransfer} style={primaryBtn}>
                Submit Score ✓
              </button>
            </div>

            {/* Instructor/admin helper */}
            {!isStudent ? (
              <div style={{ textAlign: "center", marginTop: 12, opacity: 0.8, fontSize: 13 }}>
                Note: Short-answer grading not implemented; uses “Short-answer score” above.
              </div>
            ) : null}
          </>
        ) : null}

        {/* DONE */}
        {step === "done" ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 26, fontWeight: 950 }}>Completed</div>
              <div style={{ opacity: 0.9, marginTop: 6, fontSize: 16 }}>
                You finished this lesson.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12 }}>
              <button onClick={refreshProgress} style={secondaryBtn}>
                Refresh
              </button>
            </div>

            {!isStudent && moduleProgress ? (
              <div style={{ textAlign: "center", marginTop: 14, opacity: 0.85 }}>
                Mastery: <b>{moduleProgress.mastery_score?.toFixed?.(2) ?? moduleProgress.mastery_score}</b> • Readiness:{" "}
                <b>{moduleProgress.readiness}</b>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function QuestionList({
  view,
  items,
  mcq,
  setMcq,
  short,
  setShort,
}: {
  view: ViewMode;
  items: any[];
  mcq: Record<string, number>;
  setMcq: (x: Record<string, number>) => void;
  short: Record<string, string>;
  setShort: (x: Record<string, string>) => void;
}) {
  const isStudent = view === "student";

  if (!items?.length) return <div style={{ opacity: 0.85, textAlign: "center", padding: 10 }}>No questions.</div>;

  return (
    <div style={{ display: "grid", gap: 14, marginTop: 10, marginBottom: 12 }}>
      {items.map((q: any, idx: number) => (
        <div
          key={q.question_id || idx}
          style={{
            border: "1px solid #333",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div style={{ fontWeight: 950, marginBottom: 12, fontSize: 22, lineHeight: 1.25 }}>
            {/* Students should not see internal question IDs */}
            {q.prompt}
          </div>

          {q.type === "mcq" ? (
            <div style={{ display: "grid", gap: 10 }}>
              {(q.choices || []).map((c: string, cIdx: number) => (
                <label
                  key={cIdx}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    padding: "8px 10px",
                    borderRadius: 14,
                    border: "1px solid #2a2a2a",
                  }}
                >
                  <input
                    type="radio"
                    name={q.question_id}
                    checked={mcq[q.question_id] === cIdx}
                    onChange={() => setMcq({ ...mcq, [q.question_id]: cIdx })}
                    style={{ transform: "scale(1.25)" }}
                  />
                  <span style={{ fontSize: 18 }}>{c}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={5}
              value={short[q.question_id] || ""}
              onChange={(e) => setShort({ ...short, [q.question_id]: e.target.value })}
              style={{ width: "100%", fontSize: 16, borderRadius: 14, padding: 12 }}
              placeholder={isStudent ? "Write your answer…" : "Answer (short)"}
            />
          )}
        </div>
      ))}
    </div>
  );
}