"use client";

import { useEffect, useMemo, useState } from "react";
import { apipGet, apipPost } from "../lib/apipApi";

type Props = {
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

export default function LessonRunner({ moduleId, lesson, misconceptionAllowlist }: Props) {
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
  const [status, setStatus] = useState<string>("");

  // responses
  const [mcq, setMcq] = useState<Record<string, number>>({});
  const [short, setShort] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<number>(0.7);

  const [selfScore, setSelfScore] = useState<number>(0.8); // used when short answers exist
  const [progress, setProgress] = useState<ProgressMe | null>(null);

  useEffect(() => {
    // reset on lesson change
    setStep("diagnostic");
    setStartedAt(Date.now());
    setStatus("");
    setMcq({});
    setShort({});
    setConfidence(0.7);
    setSelfScore(0.8);
    setProgress(null);
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

  async function logEvent(event_type: "diagnostic" | "simulation" | "reflection" | "transfer" | "attempt", score?: number, tags?: string[]) {
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

    setStatus("Logging progress...");
    await apipPost(`/progress/${encodeURIComponent(moduleId)}/event`, payload);
    setStatus("");
  }

  async function refreshProgress() {
    try {
      const p = await apipGet<ProgressMe>("/progress/me");
      setProgress(p);
    } catch {
      // non-fatal
    }
  }

  async function submitDiagnostic() {
    // If MCQ exists, use computed score; if only short exists, use selfScore.
    const s1 = scoreMcq(diagnosticItems);
    const score = typeof s1 === "number" ? s1 : clamp01(selfScore);
    const tags = allTagsFor(diagnosticItems);

    await logEvent("diagnostic", score, tags);
    await refreshProgress();
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
    const s1 = scoreMcq(transferItems);
    const score = typeof s1 === "number" ? s1 : clamp01(selfScore);
    const tags = allTagsFor(transferItems);

    await logEvent("transfer", score, tags);
    await refreshProgress();
    setStep("done");
  }

  const moduleProgress = useMemo(() => {
    const mm = progress?.mastery_map || [];
    return mm.find((x) => x.module_id === moduleId) || null;
  }, [progress, moduleId]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{title}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Step: <b>{step}</b>
          </div>
        </div>
        <div style={{ textAlign: "right", opacity: 0.85 }}>
          {moduleProgress ? (
            <>
              <div>Mastery: <b>{moduleProgress.mastery_score?.toFixed?.(2) ?? moduleProgress.mastery_score}</b></div>
              <div>Readiness: <b>{moduleProgress.readiness}</b></div>
            </>
          ) : (
            <div style={{ fontSize: 13 }}>Progress: (load after first log)</div>
          )}
        </div>
      </div>

      {status ? (
        <div style={{ marginTop: 10, border: "1px solid #333", padding: 10, borderRadius: 10 }}>
          {status}
        </div>
      ) : null}

      <div style={{ marginTop: 14, border: "1px solid #333", borderRadius: 12, padding: 12 }}>
        <div style={{ marginBottom: 10, opacity: 0.9 }}>
          Confidence (0–1):{" "}
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            style={{ width: 90, marginLeft: 8 }}
          />
        </div>

        {step === "diagnostic" ? (
          <>
            <h3>Diagnostic</h3>
            <p style={{ opacity: 0.85 }}>
              Answer to reveal misconceptions early. Then continue to the lesson.
            </p>

            <QuestionList items={diagnosticItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <SelfScoreBox selfScore={selfScore} setSelfScore={setSelfScore} hint="If short answers exist, self-score is used." />

            <button onClick={submitDiagnostic}>Submit Diagnostic →</button>
          </>
        ) : null}

        {step === "analogy" ? (
          <>
            <h3>Analogical grounding</h3>
            {analogyText ? (
              <div style={{ whiteSpace: "pre-wrap", opacity: 0.9, marginBottom: 10 }}>{analogyText}</div>
            ) : (
              <div style={{ opacity: 0.8 }}>No analogy text.</div>
            )}

            {commitmentPrompt ? (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Commitment prompt</div>
                <textarea
                  rows={3}
                  value={short["commitment"] || ""}
                  onChange={(e) => setShort({ ...short, commitment: e.target.value })}
                  style={{ width: "100%" }}
                />
              </div>
            ) : null}

            <div style={{ marginTop: 12 }}>
              <button onClick={submitAnalogy}>Continue →</button>
            </div>
          </>
        ) : null}

        {step === "simulation" ? (
          <>
            <h3>Simulation inquiry</h3>
            {simLabId ? (
              <div style={{ opacity: 0.9 }}>
                Lab ID: <b>{simLabId}</b>
              </div>
            ) : null}

            {simPrompts?.length ? (
              <ul style={{ marginTop: 10 }}>
                {simPrompts.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            ) : (
              <div style={{ opacity: 0.8, marginTop: 8 }}>
                No inquiry prompts provided.
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <textarea
                rows={4}
                placeholder="Record your observations here (optional)."
                value={short["sim_notes"] || ""}
                onChange={(e) => setShort({ ...short, sim_notes: e.target.value })}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={submitSimulation}>Done with simulation →</button>
            </div>
          </>
        ) : null}

        {step === "reconstruction" ? (
          <>
            <h3>Concept reconstruction</h3>
            {reconPrompts?.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {reconPrompts.map((p: string, i: number) => (
                  <div key={i}>
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>{p}</div>
                    <textarea
                      rows={3}
                      value={short[`recon_${i}`] || ""}
                      onChange={(e) => setShort({ ...short, [`recon_${i}`]: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: 0.8 }}>No reconstruction prompts.</div>
            )}

            <div style={{ marginTop: 12 }}>
              <button onClick={submitReconstruction}>Continue →</button>
            </div>
          </>
        ) : null}

        {step === "transfer" ? (
          <>
            <h3>Transfer</h3>
            <p style={{ opacity: 0.85 }}>
              This is scored. Submitting will log a <b>transfer</b> event.
            </p>

            <QuestionList items={transferItems} mcq={mcq} setMcq={setMcq} short={short} setShort={setShort} />

            <SelfScoreBox selfScore={selfScore} setSelfScore={setSelfScore} hint="Used when questions are short-answer only." />

            <button onClick={submitTransfer}>Submit Transfer (scored) ✓</button>
          </>
        ) : null}

        {step === "done" ? (
          <>
            <h3>Done</h3>
            <p style={{ opacity: 0.85 }}>
              Transfer event logged. Check mastery/readiness on the right.
            </p>
            <button onClick={refreshProgress}>Refresh progress</button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function QuestionList({
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
  if (!items?.length) return <div style={{ opacity: 0.8 }}>No questions.</div>;

  return (
    <div style={{ display: "grid", gap: 12, marginTop: 10, marginBottom: 12 }}>
      {items.map((q: any) => (
        <div key={q.question_id} style={{ border: "1px solid #333", borderRadius: 12, padding: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            {q.question_id}: {q.prompt}
          </div>

          {q.type === "mcq" ? (
            <div style={{ display: "grid", gap: 6 }}>
              {(q.choices || []).map((c: string, idx: number) => (
                <label key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="radio"
                    name={q.question_id}
                    checked={mcq[q.question_id] === idx}
                    onChange={() => setMcq({ ...mcq, [q.question_id]: idx })}
                  />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              rows={3}
              value={short[q.question_id] || ""}
              onChange={(e) => setShort({ ...short, [q.question_id]: e.target.value })}
              style={{ width: "100%" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SelfScoreBox({
  selfScore,
  setSelfScore,
  hint,
}: {
  selfScore: number;
  setSelfScore: (n: number) => void;
  hint: string;
}) {
  return (
    <div style={{ marginBottom: 12, opacity: 0.9 }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>Self-score (0–1)</div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={selfScore}
          onChange={(e) => setSelfScore(Number(e.target.value))}
          style={{ width: 90 }}
        />
        <span style={{ fontSize: 13, opacity: 0.8 }}>{hint}</span>
      </div>
    </div>
  );
}