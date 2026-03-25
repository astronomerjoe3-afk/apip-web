"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessonRunner, postProgressEvent, restartLessonProgress } from "@/lib/lessonRunnerApi";
import { feedbackAnswer, feedbackBody } from "./lessonRunnerFeedback";
import MeasurementInstrumentTour from "./MeasurementInstrumentTour";
import MeasurementReportLab from "./MeasurementReportLab";
import M1SimulationPanels from "./M1SimulationPanels";
import M2SimulationPanels from "./M2SimulationPanels";
import M3SimulationPanels from "./M3SimulationPanels";
import M4SimulationPanels from "./M4SimulationPanels";
import M5SimulationPanels from "./M5SimulationPanels";
import M6SimulationPanels from "./M6SimulationPanels";
import M7SimulationPanels from "./M7SimulationPanels";
import M8SimulationPanels from "./M8SimulationPanels";
import M9SimulationPanels from "./M9SimulationPanels";
import M10SimulationPanels from "./M10SimulationPanels";
import M11SimulationPanels from "./M11SimulationPanels";
import M12SimulationPanels from "./M12SimulationPanels";
import M13SimulationPanels from "./M13SimulationPanels";
import M14SimulationPanels from "./M14SimulationPanels";
import F5SimulationPanels from "./F5SimulationPanels";
import A1SimulationPanels from "./A1SimulationPanels";
import A6ToA11SimulationPanels from "./A6ToA11SimulationPanels";

type StageName =
  | "diagnostic"
  | "scaffold"
  | "concept_gate"
  | "simulation"
  | "reflection"
  | "mastery";

type LessonStatus = "not_started" | "in_progress" | "completed";
type SimulationToolKey = "ruler" | "caliper" | "micrometer";
type MeasurementPresetKey = "wire" | "marble" | "chalk" | "custom";
type MeasurementExplorerStageKey = "tool_match" | "reading_detail" | "spread_check" | "zero_error";

type QuestionOption = {
  value: string;
  label: string;
};

type Question = {
  id: string;
  prompt: string;
  type?: "multiple_choice" | "short_answer" | "true_false";
  options?: QuestionOption[];
  image_url?: string;
  visual_title?: string;
  visual_caption?: string;
  visual_callouts?: string[];
};

type DiagnosticFeedbackItem = {
  question_id: string;
  learner_answer: string | string[] | null;
  is_correct: boolean;
  correct_answer: string | string[];
  explanation: string;
  misconception_tag?: string;
  teaching_focus?: string;
};

type ReviewReference = {
  id: string;
  label: string;
  anchor?: string;
};

type DiagnosticStagePayload = {
  instructions?: string;
  question_count?: number;
  questions: Question[];
  submitted?: boolean;
  feedback?: DiagnosticFeedbackItem[];
};

type ScaffoldReferenceTable = {
  title: string;
  caption?: string;
  columns: string[];
  rows: string[][];
};

type ScaffoldMediaCard = {
  kind?: "visual" | "video" | "interactive";
  title: string;
  caption: string;
  highlights?: string[];
  image_url?: string;
  embed_url?: string;
  interaction_key?: string;
};

function normalizeTeachingFocusText(value: string): string {
  const trimmed = value.trim();
  if (
    /^No displacement means no work done on the .+\.?$/i.test(trimmed) ||
    /^Without displacement, work done on the .+ is zero\.?$/i.test(trimmed)
  ) {
    return "No displacement in the force direction means no work is done by that force in the simple model.";
  }
  if (/^Multiply force by displacement\.?$/i.test(trimmed)) {
    return "In the simple aligned-force case, work is force multiplied by displacement.";
  }
  if (/^Use KE = 0\.5mv\^2\.?$/i.test(trimmed)) {
    return "Use the kinetic-energy equation: E_k = 0.5mv^2.";
  }
  if (/^Substitute into KE = 0\.5mv\^2\.?$/i.test(trimmed)) {
    return "Substitute the known mass and speed into E_k = 0.5mv^2.";
  }
  if (/^Rearrange\s+[\d.]+\s*=\s*0\.5\s*x\s*[\d.]+\s*x\s*v\^2\.?$/i.test(trimmed)) {
    return "Rearrange E_k = 0.5mv^2 when speed is the unknown.";
  }
  if (/^Use GPE = mgh\.?$/i.test(trimmed)) {
    return "Use the gravitational-potential-energy equation: E_p = mgh.";
  }
  if (/^Use E = Pt\.?$/i.test(trimmed)) {
    return "Use the energy-transfer relation: E = Pt.";
  }
  if (/^Useful output = efficiency x total input\.?$/i.test(trimmed)) {
    return "Useful output is found by multiplying the efficiency fraction by the total input.";
  }
  if (/^Find the work first, then set that equal to GPE\.?$/i.test(trimmed)) {
    return "If a hand-off becomes Height Store with no extra leak, connect the work done to the gravitational-potential-energy gain.";
  }
  if (/^Find total energy with E = Pt,\s*then take [\d.]+% of it\.?$/i.test(trimmed)) {
    return "Find the total transferred energy with E = Pt, then use the efficiency fraction to find the useful output.";
  }
  if (/^Multiply mass, field strength, and height\.?$/i.test(trimmed)) {
    return "Multiply mass, gravitational field strength, and height change.";
  }
  if (/^Rearrange\s+[\d.]+\s*=\s*[\d.]+\s*x\s*[\d.]+\s*x\s*h\.?$/i.test(trimmed)) {
    return "Rearrange E_p = mgh when height is the unknown.";
  }
  if (/^Rearrange\s+[\d.]+\s*=\s*m\s*x\s*[\d.]+\s*x\s*[\d.]+\.?$/i.test(trimmed)) {
    return "Rearrange E_p = mgh when mass is the unknown.";
  }
  if (/^Use the triangle area:\s*0\.5 x [\d.]+ x [\d.]+\.?$/i.test(trimmed)) {
    return "Use the triangle area rule: 0.5 x base x height, with time as the base and speed as the height.";
  }
  if (
    /^Use the right-triangle result for [\d,\s]+\.?$/i.test(trimmed) ||
    /^Use the [\d-]+(?: right)? triangle(?:\:.*)?\.?$/i.test(trimmed) ||
    /^Use the [\d,\s]+ triangle(?:\:.*)?\.?$/i.test(trimmed)
  ) {
    return "Use vector addition: perpendicular components do not add as plain numbers. Rebuild the diagonal resultant from the start-to-finish arrow instead.";
  }
  return trimmed;
}

function normalizeSupportText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupeSupportTextItems(items: string[] = [], reserved: string[] = []): string[] {
  const seen = new Set(reserved.map(normalizeSupportText).filter(Boolean));
  return items.filter((item) => {
    const normalized = normalizeSupportText(item);
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

type TeachingFocusCard = {
  title: string;
  detail: string;
  why_it_matters?: string;
  think_check?: string;
};

type ScaffoldSectionVisual = {
  image_url: string;
  caption?: string;
  highlights?: string[];
};

type TechnicalWordCard = {
  term: string;
  meaning: string;
  why_it_matters?: string;
};

type FormulaReferenceRow = {
  standard_formula: string;
  analogy_equivalent: string;
  constants?: string;
  meaning?: string;
  units_text?: string;
  conditions?: string;
};

type ScaffoldSection = {
  heading: string;
  body: string;
  analogy?: string;
  visual?: ScaffoldSectionVisual;
  technical_words?: TechnicalWordCard[];
  formula_reference_rows?: FormulaReferenceRow[];
  formula_constants_note?: string;
  shared_formula_analogy?: string;
  worked_example?: {
    prompt: string;
    steps: string[];
    answer: string;
    answer_reason?: string;
  };
  check_for_understanding?: string;
};

type ScaffoldStagePayload = {
  title?: string;
  intro?: string;
  teaching_focus?: string[];
  misconception_targets?: string[];
  teaching_focus_cards?: TeachingFocusCard[];
  reference_tables?: ScaffoldReferenceTable[];
  media_cards?: ScaffoldMediaCard[];
  sections: ScaffoldSection[];
  review_refs?: ReviewReference[];
};

type ConceptGateFeedbackItem = {
  question_id: string;
  is_correct: boolean;
  explanation: string;
};

type ConceptGateStagePayload = {
  instructions?: string;
  retry_count?: number;
  max_retries?: number;
  questions: Question[];
  submitted?: boolean;
  passed?: boolean;
  feedback?: ConceptGateFeedbackItem[];
  micro_reteach?: {
    title?: string;
    body: string;
  };
};

type SimulationStagePayload = {
  title?: string;
  instructions?: string;
  embed_url?: string;
  interaction_key?: string;
  task_prompt?: string;
  explore_steps?: string[];
  watch_for?: string[];
  try_first?: string;
  takeaway?: string;
  completion_text?: string;
};

type ReflectionVisualCheck = {
  title: string;
  prompt: string;
  image_url?: string;
  callouts?: string[];
};

type ReflectionStagePayload = {
  title?: string;
  prompt: string;
  guidance?: string[];
  visual_check?: ReflectionVisualCheck;
  submitted?: boolean;
  learner_response?: string;
};

type MasteryFeedbackItem = {
  question_id: string;
  prompt?: string;
  is_correct: boolean;
  explanation?: string;
};

type MasteryResult = {
  percent: number;
  passed: boolean;
};

type MasteryStagePayload = {
  instructions?: string;
  question_count?: number;
  min_questions?: number;
  max_questions?: number;
  passing_percent?: number;
  questions: Question[];
  submitted?: boolean;
  feedback?: MasteryFeedbackItem[];
  result?: MasteryResult;
  review_refs?: ReviewReference[];
  review_requested?: boolean;
};

type RunnerResponse = {
  module_id: string;
  lesson_id: string;
  lesson_title: string;
  lesson_status: LessonStatus;
  active_stage: StageName;
  stage_payload:
    | DiagnosticStagePayload
    | ScaffoldStagePayload
    | ConceptGateStagePayload
    | SimulationStagePayload
    | ReflectionStagePayload
    | MasteryStagePayload;
  progress_summary?: {
    attempts?: number;
    latest_mastery_percent?: number | null;
    best_mastery_percent?: number | null;
    module_mastery_percent?: number | null;
    concept_gate_passed?: boolean;
  };
  available_actions?: string[];
};

type LessonRunnerProps = {
  moduleId: string;
  lessonId: string;
  canGoNextLesson?: boolean;
  onGoNextLesson?: () => void;
  onRestartFromBeginning?: () => Promise<void> | void;
  prefetchedLesson?: Record<string, unknown> | null;
  onProgressSummaryChanged?: (summary: {
    lessonId: string;
    lessonStatus: LessonStatus;
    latestMasteryPercent?: number | null;
    bestMasteryPercent?: number | null;
    moduleMasteryPercent?: number | null;
  }) => void;
  previousLessonLabel?: string;

};

type ApiEventPayload = Record<string, unknown>;

function runnerLessonKey(lessonId: string): string {
  const normalized = lessonId.replace(/-/g, "_").toUpperCase();
  const match = normalized.match(/(?:F\d+|M\d+)_L\d+/);
  return match?.[0] || normalized;
}

function StageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="lesson-stage-hero mb-6 rounded-2xl border p-5 shadow-sm">
      <p className="mb-2 text-sm font-medium text-slate-500">{eyebrow}</p>
      <h2 className="lesson-stage-title text-2xl font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="lesson-stage-subtitle mt-2 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="lesson-action-button rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="lesson-action-button rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function FeedbackCard({
  correct,
  title,
  body,
  extra,
}: {
  correct: boolean;
  title: string;
  body: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 normal-case ${
        correct ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className="font-semibold text-slate-900 normal-case">{title}</p>
      <p className="mt-2 text-slate-700 normal-case">{body}</p>
      {extra ? <div className="mt-3 text-sm text-slate-600 normal-case">{extra}</div> : null}
    </div>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (questionId: string, value: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm normal-case">
      {question.image_url ? (
        <div className="mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(224,242,254,0.9),_rgba(255,255,255,1)_62%)] p-4">
            {question.visual_title ? (
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">{question.visual_title}</p>
            ) : null}
            {question.visual_caption ? (
              <p className="mt-2 text-sm leading-6 text-slate-700">{question.visual_caption}</p>
            ) : null}
          </div>
          <img
            src={question.image_url}
            alt={question.visual_title || question.prompt}
            className="h-auto max-h-[24rem] w-full bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.98),_rgba(255,255,255,1))] object-contain p-4"
            loading="lazy"
          />
          {question.visual_callouts?.length ? (
            <div className="grid gap-3 border-t border-slate-200 bg-slate-50/90 p-4 md:grid-cols-3">
              {question.visual_callouts.map((item) => (
                <div key={item} className="rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mb-4 font-medium text-slate-900 normal-case">{question.prompt}</p>

      {question.type === "short_answer" ? (
        <textarea
          className="min-h-[96px] w-full rounded-xl border p-3 normal-case"
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder="Write your answer here"
        />
      ) : (
        <div className="space-y-2" role="radiogroup" aria-label={question.prompt}>
          {(question.options ?? []).map((option) => {
            const selected = value === option.value;

            return (
              <label
                key={option.value}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left ${
                  selected ? "border-slate-400 bg-slate-50 shadow-sm" : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={selected}
                  onChange={(e) => onChange(question.id, e.target.value)}
                  className="h-5 w-5 shrink-0 border-slate-400 text-slate-900 focus:ring-slate-400"
                />
                <span className="normal-case">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
function masteryFeedbackBody(item: MasteryFeedbackItem, lessonTitle: string): string {
  const explanation = (item.explanation ?? "").trim();
  const placeholder = ["review the lesson idea and try again", "review this idea carefully before trying again"];
  const hasPlaceholder = !explanation
    || placeholder.some((entry) => explanation.toLowerCase().includes(entry));

  const promptPrefix = item.prompt ? `${item.prompt}\n\n` : "";
  if (!hasPlaceholder) {
    return promptPrefix + explanation;
  }

  if (item.is_correct) {
    return promptPrefix + "Correct. You used the lesson idea correctly.";
  }

  return `${promptPrefix}Review ${lessonTitle} again, especially the key ideas from this lesson.`;
}

function ReviewReferences({ refs }: { refs?: ReviewReference[] }) {
  if (!refs || refs.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">Review these lesson ideas</h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
        {refs.map((ref) => (
          <li key={ref.id}>{ref.label}</li>
        ))}
      </ul>
    </div>
  );
}

export default function LessonRunner({
  moduleId,
  lessonId,
  canGoNextLesson = false,
  onGoNextLesson,
  onRestartFromBeginning,
  prefetchedLesson = null,
  onProgressSummaryChanged,
  previousLessonLabel = "the previous mission",
}: LessonRunnerProps) {
  const [runner, setRunner] = useState<RunnerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef<Record<string, string>>({});
  const [reflectionText, setReflectionText] = useState("");
  const reflectionTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [scaffoldStepIndex, setScaffoldStepIndex] = useState(0);
  const [simTool, setSimTool] = useState<SimulationToolKey>("caliper");
  const [simMeasurementPreset, setSimMeasurementPreset] = useState<MeasurementPresetKey>("marble");
  const [simMeasurementStage, setSimMeasurementStage] = useState<MeasurementExplorerStageKey>("tool_match");
  const [simLength, setSimLength] = useState(1.86);
  const [simZeroError, setSimZeroError] = useState(0.08);

  const [simMetricMeters, setSimMetricMeters] = useState(0.35);
  const [simVectorMagnitude, setSimVectorMagnitude] = useState(6);
  const [simVectorAngle, setSimVectorAngle] = useState(35);
  const [simJourneyOutward, setSimJourneyOutward] = useState(10);
  const [simJourneyReturn, setSimJourneyReturn] = useState(4);
  const [simSigSample, setSimSigSample] = useState("12.349");
  const [simSigFigures, setSimSigFigures] = useState(3);
  const [simSigOperation, setSimSigOperation] = useState<"add" | "subtract" | "multiply" | "divide">("multiply");
  const [simDensityMass, setSimDensityMass] = useState(180);
  const [simDensityVolume, setSimDensityVolume] = useState(120);
  const [simFluidDensity, setSimFluidDensity] = useState(1);
  const [simBias, setSimBias] = useState(18);
  const [simSpread, setSimSpread] = useState(24);
  void previousLessonLabel;
  const prefetchedLessonRef = useRef<Record<string, unknown> | null>(prefetchedLesson);

  useEffect(() => {
    prefetchedLessonRef.current = prefetchedLesson;
  }, [prefetchedLesson]);

  const loadRunner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getLessonRunner(moduleId, lessonId, {
        prefetchedLesson: prefetchedLessonRef.current,
      });
      const runnerData = data as RunnerResponse;
      setRunner(runnerData);
      onProgressSummaryChanged?.({
        lessonId,
        lessonStatus: runnerData.lesson_status,
        latestMasteryPercent: runnerData.progress_summary?.latest_mastery_percent ?? null,
        bestMasteryPercent: runnerData.progress_summary?.best_mastery_percent ?? null,
        moduleMasteryPercent: runnerData.progress_summary?.module_mastery_percent ?? null,
      });

      const payload = runnerData.stage_payload;

      if (runnerData.active_stage === "reflection") {
        const reflectionPayload = payload as ReflectionStagePayload;
        setReflectionText(reflectionPayload.learner_response ?? "");
      } else {
        setReflectionText("");
      }

      if (
        runnerData.active_stage === "diagnostic" ||
        runnerData.active_stage === "concept_gate" ||
        runnerData.active_stage === "mastery"
      ) {
        answersRef.current = {};
        setAnswers({});
      }
    } catch (err) {
      console.error(err);
      setError("We could not load this lesson right now.");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId, moduleId, onProgressSummaryChanged]);

  useEffect(() => {
    void loadRunner();
  }, [loadRunner]);

  useEffect(() => {
    setSimTool("caliper");
    setSimMeasurementPreset("marble");
    setSimMeasurementStage("tool_match");
    setSimLength(1.86);
    setSimZeroError(0.08);
    setSimMetricMeters(0.35);
    setSimVectorMagnitude(6);
    setSimVectorAngle(35);
    setSimJourneyOutward(10);
    setSimJourneyReturn(4);
    setSimSigSample("12.349");
    setSimSigFigures(3);
    setSimBias(18);
    setSimSpread(24);
    setSimDensityMass(180);
    setSimDensityVolume(120);
    setSimFluidDensity(1);
  }, [lessonId, moduleId]);

  useEffect(() => {
    setScaffoldStepIndex(0);
  }, [lessonId, moduleId, runner?.active_stage]);

  const restartMission = useCallback(async (fromBeginning = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (fromBeginning && onRestartFromBeginning) {
        await onRestartFromBeginning();
      } else {
        await restartLessonProgress(moduleId, lessonId);
        answersRef.current = {};
        setAnswers({});
        setReflectionText("");
            await loadRunner();
      }
    } catch (err) {
      console.error(err);
      setError("We could not restart this mission right now.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lessonId, loadRunner, moduleId, onRestartFromBeginning]);

  const sendEvent = useCallback(
    async (eventType: string, payload: ApiEventPayload = {}) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await postProgressEvent(moduleId, {
          lesson_id: lessonId,
          event_type: eventType,
          payload,
        }, {
          prefetchedLesson: prefetchedLessonRef.current,
        });

        await loadRunner();
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong while saving your progress.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [lessonId, loadRunner, moduleId]
  );

  const setAnswer = useCallback((questionId: string, value: string) => {
    const nextAnswers = { ...answersRef.current, [questionId]: value };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setError(null);

    if (isSubmitting || !runner || runner.active_stage !== "diagnostic") {
      return;
    }

    const payload = runner.stage_payload as DiagnosticStagePayload;
    const activeQuestion = payload.questions[0];
    if (!activeQuestion || activeQuestion.id !== questionId || activeQuestion.type === "short_answer") {
      return;
    }

    void sendEvent("diagnostic_submitted", {
      from_stage: "diagnostic",
      answers: { [questionId]: value },
    });
  }, [isSubmitting, runner, sendEvent]);


  const stageTitle = useMemo(() => {
    if (!runner) return "";
    const isFinalModuleWrapUp =
      runner.active_stage === "mastery" &&
      runner.lesson_status === "completed" &&
      !canGoNextLesson &&
      /_L6$/.test(runnerLessonKey(lessonId || runner.lesson_id));

    if (isFinalModuleWrapUp) return "Module complete";
    switch (runner.active_stage) {
      case "diagnostic":
        return "Check what you already know";
      case "scaffold":
        return "Learn the idea";
      case "concept_gate":
        return "Quick concept check";
      case "simulation":
        return "Try it in action";
      case "reflection":
        return "Explain it back";
      case "mastery":
        return "Final mastery check";
      default:
        return "";
    }
  }, [canGoNextLesson, runner]);

  const showRestartAction = useMemo(() => {
    if (!runner) return false;
    const isFinalModuleWrapUp =
      runner.active_stage === "mastery" &&
      runner.lesson_status === "completed" &&
      !canGoNextLesson &&
      /_L6$/.test(runnerLessonKey(lessonId || runner.lesson_id));

    if (isFinalModuleWrapUp) return false;
    return (
      runner.lesson_status !== "not_started" &&
      runner.active_stage !== "diagnostic" &&
      runner.active_stage !== "simulation" &&
      runner.active_stage !== "mastery"
    );
  }, [canGoNextLesson, runner]);

  const restartCopy = useMemo(() => {
    if (!runner) return "";
    return runner.active_stage === "mastery"
      ? "Saved progress found. Restart if you want to replay this mission from the beginning."
      : "Restart to take this mission again.";
  }, [runner]);

  const stageSubtitle = useMemo(() => {
    if (!runner) return "";
    const isFinalModuleWrapUp =
      runner.active_stage === "mastery" &&
      runner.lesson_status === "completed" &&
      !canGoNextLesson &&
      /_L6$/.test(runnerLessonKey(lessonId || runner.lesson_id));

    if (isFinalModuleWrapUp) return "Congratulations. You finished the final mission and wrapped up this module.";
    switch (runner.active_stage) {
      case "diagnostic":
        return "A few quick questions first.";
      case "scaffold":
        return "Study the key ideas for this sub-unit.";
      case "concept_gate":
        return "One quick check before the activity.";
      case "simulation":
        return "Change one thing at a time, watch what changes, and explain the pattern you notice.";
      case "reflection":
        return "Explain the idea in your own words.";
      case "mastery":
        return "This check decides mastery.";
      default:
        return "";
    }
  }, [canGoNextLesson, runner]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-slate-700">Loading lesson...</p>
      </div>
    );
  }

  if (error && !runner) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">{error}</p>
      </div>
    );
  }

  if (!runner) return null;

  const renderDiagnostic = () => {
    const payload = runner.stage_payload as DiagnosticStagePayload & { answered_count?: number; action_label?: string; recent_feedback?: DiagnosticFeedbackItem; };
    const activeQuestion = payload.questions[0];
    const actionLabel = payload.action_label ?? "Check my answer";
    const submitDiagnosticAnswer = () => {
      if (!activeQuestion) {
        return;
      }

      const answer = answersRef.current[activeQuestion.id]?.trim();
      if (!answer) {
        setError("Choose an answer before continuing.");
        return;
      }

      void sendEvent("diagnostic_submitted", {
        from_stage: "diagnostic",
        answers: { [activeQuestion.id]: answer },
      });
    };
    const feedbackExtra = (item: DiagnosticFeedbackItem, showCorrectAnswer = !item.is_correct) => {
      const learnerAnswer = item.learner_answer == null
        ? ""
        : Array.isArray(item.learner_answer)
          ? item.learner_answer.join(", ")
          : item.learner_answer;

      return (
        <div className="space-y-1">
          {learnerAnswer ? (
            <p>
              <span className="font-medium">Your answer:</span> {learnerAnswer}
            </p>
          ) : null}
          {showCorrectAnswer ? (
            <p>
              <span className="font-medium">Correct answer:</span> {feedbackAnswer(item.correct_answer)}
            </p>
          ) : null}
          {item.teaching_focus ? (
            <p>
              <span className="font-medium">Key idea:</span> {normalizeTeachingFocusText(item.teaching_focus)}
            </p>
          ) : null}
        </div>
      );
    };
    if (payload.submitted && payload.feedback?.length) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Let&apos;s review your answers
            </h3>
            <p className="mt-2 text-slate-700">
              You will see what was right, what needs fixing, and why.
            </p>
          </div>

          {payload.feedback.map((item, index) => (
            <FeedbackCard
              key={item.question_id}
              correct={item.is_correct}
              title={`Question ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
              body={feedbackBody(item)}
              extra={feedbackExtra(item, true)}
            />
          ))}

          <PrimaryButton
            onClick={() =>
              void sendEvent("diagnostic_feedback_acknowledged", {
                from_stage: "diagnostic",
              })
            }
            disabled={isSubmitting}
          >
            Continue to the lesson explanation
          </PrimaryButton>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {payload.recent_feedback ? (
          <FeedbackCard
            correct={payload.recent_feedback.is_correct}
            title={payload.recent_feedback.is_correct ? "That answer is correct" : "Not quite yet"}
            body={feedbackBody(payload.recent_feedback)}
            extra={feedbackExtra(payload.recent_feedback)}
          />
        ) : null}
        {payload.instructions ? (
          <div className="rounded-2xl border bg-white p-5 shadow-sm text-slate-700">{payload.instructions}</div>
        ) : null}
        {payload.questions.map((question) => (
          <QuestionBlock
            key={question.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={setAnswer}
          />
        ))}

        <PrimaryButton
          onClick={submitDiagnosticAnswer}
          disabled={isSubmitting}
        >
          {actionLabel}
        </PrimaryButton>
      </div>
    );
  };

  const renderScaffold = () => {
    const payload = runner.stage_payload as ScaffoldStagePayload;
    const seenMediaImageUrls = new Set<string>();

    const introCount = payload.intro || payload.teaching_focus?.length ? 1 : 0;
    const tableCount = payload.reference_tables?.length ?? 0;
    const mediaCount = payload.media_cards?.length ?? 0;
    const sectionCount = payload.sections.length;
    const totalScaffoldActivities = introCount + tableCount + mediaCount + sectionCount;
    const clampedScaffoldStepIndex = Math.max(0, Math.min(scaffoldStepIndex, Math.max(totalScaffoldActivities - 1, 0)));
    const tableStart = introCount;
    const mediaStart = tableStart + tableCount;
    const sectionStart = mediaStart + mediaCount;
    const isIntroStep = introCount === 1 && clampedScaffoldStepIndex === 0;
    const isTableStep = clampedScaffoldStepIndex >= tableStart && clampedScaffoldStepIndex < mediaStart;
    const isMediaStep = clampedScaffoldStepIndex >= mediaStart && clampedScaffoldStepIndex < sectionStart;
    const isSectionStep = clampedScaffoldStepIndex >= sectionStart;

    const scaffoldFocusCards = payload.teaching_focus_cards?.slice(0, 4) ?? [];
    const normalizedTeachingFocus = (payload.teaching_focus ?? []).map(normalizeTeachingFocusText);
    const scaffoldFocusItems = scaffoldFocusCards.length > 0
      ? scaffoldFocusCards.map((card) => card.title + ": " + card.detail + (card.why_it_matters ? " Why it matters: " + card.why_it_matters : ""))
      : normalizedTeachingFocus.slice(0, 4);
    return (
      <div className="space-y-6">
        {isIntroStep ? (
          <div className="lesson-stage-hero rounded-2xl border p-6 shadow-sm">
            {payload.intro ? <p className="lesson-stage-subtitle text-slate-700">{payload.intro}</p> : null}

          {normalizedTeachingFocus.length ? (
            <div className={`${payload.intro ? "mt-4" : ""} rounded-2xl bg-slate-50 p-5`}>
              <p className="font-medium text-slate-900">Core concepts in this sub-unit</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                {normalizedTeachingFocus.slice(0, 6).map((item, index) => (
                  <li key={`${index}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        ) : null}
        {payload.reference_tables?.length && isTableStep ? (
          <div className="lesson-display-deck">
            {payload.reference_tables.map((table, index) => (
              clampedScaffoldStepIndex === tableStart + index ? (
              <div key={table.title} className="lesson-display-slide overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">{table.title}</h4>
                  {table.caption ? <p className="mt-2 text-sm text-slate-600">{table.caption}</p> : null}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm text-slate-700">
                    {table.columns.length === 3 ? (
                      <colgroup>
                        <col style={{ width: "24%" }} />
                        <col style={{ width: "28%" }} />
                        <col style={{ width: "48%" }} />
                      </colgroup>
                    ) : null}
                    <thead className="bg-white text-slate-500">
                      <tr>
                        {table.columns.map((column) => (
                          <th key={column} className="border-b px-5 py-3 pr-8 align-top text-left font-semibold leading-6 whitespace-normal break-words">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={`${table.title}-${rowIndex}`} className="even:bg-slate-50/70">
                          {row.map((cell, cellIndex) => (
                            <td key={`${table.title}-${rowIndex}-${cellIndex}`} className="border-b border-slate-100 px-5 py-3 pr-8 align-top text-left whitespace-normal break-words leading-6">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              ) : null
            ))}
          </div>
        ) : null}

        {payload.media_cards?.length && isMediaStep ? (
          <div className="lesson-display-deck">
            {payload.media_cards.map((card, index) => {
              const imageUrl = card.image_url || "";
              const shouldShowImage = imageUrl ? !seenMediaImageUrls.has(imageUrl) : false;
              const isMeasurementInstrumentTour = card.interaction_key === "measurement_instrument_tour";
              const isMeasurementReportLab = card.interaction_key === "measurement_report_lab" || card.title === "Picture a measurement report";
              const isConceptSupportCard =
                !shouldShowImage &&
                !card.embed_url &&
                !isMeasurementInstrumentTour &&
                !isMeasurementReportLab &&
                card.kind !== "video" &&
                card.kind !== "interactive";
              const supportHighlights = dedupeSupportTextItems(card.highlights || [], [card.title, card.caption]);
              if (shouldShowImage) seenMediaImageUrls.add(imageUrl);

              return clampedScaffoldStepIndex === mediaStart + index ? (
              <div key={`${card.kind ?? "visual"}-${card.title}`} className="lesson-display-slide rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {card.kind === "video" ? "Video support" : isMeasurementReportLab || card.kind === "interactive" ? "Interactive support" : shouldShowImage ? "Visual support" : "Concept support"}
                </span>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h4>
                {!isConceptSupportCard ? <p className="mt-2 text-slate-700">{card.caption}</p> : null}

                {isMeasurementInstrumentTour ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <MeasurementInstrumentTour />
                  </div>
                ) : isMeasurementReportLab ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <MeasurementReportLab />
                  </div>
                ) : card.embed_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <iframe src={card.embed_url} title={card.title} className="h-64 w-full" allowFullScreen />
                  </div>
                ) : shouldShowImage ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <img
                      src={imageUrl}
                      alt={card.title}
                      className="h-80 w-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(241,245,249,0.95),_rgba(255,255,255,1))] object-contain p-4 md:h-[26rem]"
                      loading="lazy"
                    />
                  </div>
                ) : isConceptSupportCard ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <div className="grid min-h-64 gap-5 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.75),_rgba(255,255,255,0.96)_58%)] p-5 md:grid-cols-[180px,1fr] md:items-center">
                      <div className="flex items-center justify-center">
                        <div className="relative h-36 w-36 rounded-[2rem] bg-sky-100 shadow-inner">
                          <div className="absolute inset-x-6 top-8 h-4 rounded-full bg-sky-300/80" />
                          <div className="absolute inset-x-8 top-16 h-4 rounded-full bg-sky-400/70" />
                          <div className="absolute inset-x-10 top-24 h-4 rounded-full bg-sky-500/65" />
                          <div className="absolute -right-4 top-14 h-0 w-0 border-y-[18px] border-l-[28px] border-y-transparent border-l-teal-600" />
                        </div>
                      </div>
                      <div>
                        <div className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
                          Concept snapshot
                        </div>
                        <p className="mt-4 text-base leading-7 text-slate-700">{card.caption}</p>
                        {supportHighlights.length ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {supportHighlights.slice(0, 3).map((item) => (
                              <div key={item} className="rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                                {item}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                {supportHighlights.length && !isConceptSupportCard ? (
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {supportHighlights.map((item) => (
                      <li key={item} className="rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-sky-100">{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              ) : null;
            })}
          </div>
        ) : null}

        {isSectionStep ? (
        <div className="lesson-display-deck">
          {payload.sections.map((section, index) => (
            clampedScaffoldStepIndex === sectionStart + index ? (
            <div key={`${section.heading}-${index}`} className="lesson-display-slide rounded-2xl border bg-white p-6 shadow-sm">

            <h4 className="text-lg font-semibold text-slate-900">{section.heading === "Fix these ideas" && !payload.misconception_targets?.length ? "What this lesson will sharpen" : section.heading}</h4>
            {section.heading === "Fix these ideas" ? (
              <div className="mt-3 space-y-4">
                <p className="text-slate-700">{payload.misconception_targets?.length ? "Focus on these deeper explanations as you move through the next activities." : "Your opening check was fairly strong. Use this lesson to deepen the meaning behind these ideas before the next check."}</p>
                {scaffoldFocusItems.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scaffoldFocusItems.map((item) => (
                      <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-700">{item}</div>
                    ))}
                  </div>
                ) : section.body && !section.worked_example ? (
                  <p className="whitespace-pre-line text-slate-700">{section.body}</p>
                ) : null}
                {payload.misconception_targets?.length && section.body ? (
                  <p className="text-sm whitespace-pre-line text-slate-600">{section.body}</p>
                ) : (
                  <p className="text-sm text-slate-600">The next activities, examples, and simulation are arranged to strengthen these ideas one at a time.</p>
                )}
              </div>
            ) : null}
            {section.body && !section.worked_example && section.heading !== "Fix these ideas" ? (
                <p className="mt-3 whitespace-pre-line text-slate-700">{section.body}</p>
            ) : null}

            {section.technical_words?.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.technical_words.map((entry) => (
                  <div key={entry.term} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 shadow-sm">
                    <p className="text-base font-semibold text-slate-900">{entry.term}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{entry.meaning}</p>
                    {entry.why_it_matters ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        <span className="font-medium text-slate-700">Why it matters:</span>{" "}
                        {entry.why_it_matters}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {section.formula_reference_rows?.length ? (
              (() => {
                const formulaRows = section.formula_reference_rows ?? [];
                const hasSharedFormulaAnalogy = Boolean(section.shared_formula_analogy);
                const hasRowAnalogies = !hasSharedFormulaAnalogy && formulaRows.some((row) => row.analogy_equivalent);
                const hasRowConstants = formulaRows.some((row) => row.constants);
                return (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                    {section.shared_formula_analogy ? (
                      <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-medium text-slate-900">Shared analogy match:</span>{" "}
                        {section.shared_formula_analogy}
                      </div>
                    ) : null}
                    {section.formula_constants_note ? (
                      <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-medium text-slate-900">Constants for this lesson:</span>{" "}
                        {section.formula_constants_note}
                      </div>
                    ) : null}
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm text-slate-700">
                        {hasRowAnalogies && hasRowConstants ? (
                          <colgroup>
                            <col style={{ width: "34%" }} />
                            <col style={{ width: "40%" }} />
                            <col style={{ width: "26%" }} />
                          </colgroup>
                        ) : hasRowAnalogies ? (
                          <colgroup>
                            <col style={{ width: "44%" }} />
                            <col style={{ width: "56%" }} />
                          </colgroup>
                        ) : hasRowConstants ? (
                          <colgroup>
                            <col style={{ width: "68%" }} />
                            <col style={{ width: "32%" }} />
                          </colgroup>
                        ) : (
                          <colgroup>
                            <col style={{ width: "100%" }} />
                          </colgroup>
                        )}
                        <thead className="bg-slate-900/95 text-white">
                          <tr>
                            <th className="border-b border-slate-700 px-5 py-3 pr-8 align-top text-left font-semibold leading-6 whitespace-normal break-words">Standard physics formula</th>
                            {hasRowAnalogies ? (
                              <th className="border-b border-slate-700 px-5 py-3 pr-8 align-top text-left font-semibold leading-6 whitespace-normal break-words">Analogy equivalent</th>
                            ) : null}
                            {hasRowConstants ? (
                              <th className="border-b border-slate-700 px-5 py-3 pr-8 align-top text-left font-semibold leading-6 whitespace-normal break-words">Constants if any</th>
                            ) : null}
                          </tr>
                        </thead>
                        <tbody>
                          {formulaRows.map((row, index) => (
                            <tr key={`${row.standard_formula}-${index}`} className="even:bg-white odd:bg-slate-50/70">
                              <td className="border-b border-slate-100 px-5 py-4 pr-8 align-top text-left whitespace-normal break-words leading-6">
                                <p className="font-mono text-sm text-slate-900">{row.standard_formula}</p>
                                {row.meaning ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-700">
                                    <span className="font-medium text-slate-800">Meaning:</span>{" "}
                                    {row.meaning}
                                  </p>
                                ) : null}
                                {row.units_text ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    <span className="font-medium text-slate-700">Units:</span>{" "}
                                    {row.units_text}
                                  </p>
                                ) : null}
                                {row.conditions ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    <span className="font-medium text-slate-700">Best use:</span>{" "}
                                    {row.conditions}
                                  </p>
                                ) : null}
                              </td>
                              {hasRowAnalogies ? (
                                <td className="border-b border-slate-100 px-5 py-4 pr-8 align-top text-left whitespace-normal break-words leading-6">{row.analogy_equivalent}</td>
                              ) : null}
                              {hasRowConstants ? (
                                <td className="border-b border-slate-100 px-5 py-4 pr-8 align-top text-left whitespace-normal break-words leading-6">{row.constants || "—"}</td>
                              ) : null}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()
            ) : null}

            {section.analogy ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="font-medium text-slate-900">Analogy bridge</p>
                <p className="mt-2 text-slate-700">{section.analogy}</p>
              </div>
            ) : null}

            {section.visual?.image_url ? (
              <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.7),_rgba(255,255,255,0.96)_62%)] p-4 md:p-5">
                  <img
                    src={section.visual.image_url}
                    alt={section.visual.caption || section.heading}
                    className="h-72 w-full object-contain md:h-80"
                    loading="lazy"
                  />
                </div>
                {section.visual.caption || section.visual.highlights?.length ? (
                  <div className="border-t bg-slate-50/80 p-5">
                    {section.visual.caption ? (
                      <p className="text-slate-700">{section.visual.caption}</p>
                    ) : null}
                    {section.visual.highlights?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {section.visual.highlights.slice(0, 4).map((item) => (
                          <div key={item} className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {section.worked_example ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="font-medium text-slate-900">Example</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Question</p>
                <p className="mt-2 text-slate-700">{section.worked_example.prompt}</p>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Step-by-step solution</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
                  {section.worked_example.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="mt-4 text-slate-800">
                  <span className="font-medium">Final answer:</span>{" "}
                  {section.worked_example.answer}
                </p>
                {section.worked_example.answer_reason ? (
                  <p className="mt-3 text-slate-700">
                    <span className="font-medium">Why this answer is right:</span>{" "}
                    {section.worked_example.answer_reason}
                  </p>
                ) : null}
              </div>
            ) : null}

            {section.check_for_understanding ? (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-slate-800">
                <span className="font-medium">Think about this:</span>{" "}
                {section.check_for_understanding}
              </div>
            ) : null}
            </div>
            ) : null
          ))}
        </div>
        ) : null}

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Activity {clampedScaffoldStepIndex + 1} of {totalScaffoldActivities}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {clampedScaffoldStepIndex > 0 ? <SecondaryButton onClick={() => setScaffoldStepIndex((current) => Math.max(0, current - 1))} disabled={isSubmitting}>Previous</SecondaryButton> : null}
            <PrimaryButton onClick={() => { if (clampedScaffoldStepIndex < totalScaffoldActivities - 1) { setScaffoldStepIndex((current) => Math.min(totalScaffoldActivities - 1, current + 1)); return; } void sendEvent("scaffold_continue", { from_stage: "scaffold" }); }} disabled={isSubmitting}>
              {clampedScaffoldStepIndex < totalScaffoldActivities - 1 ? "Next activity" : "Continue to the quick concept check"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  };

  const renderConceptGate = () => {
    const payload = runner.stage_payload as ConceptGateStagePayload;
    const activeQuestion = payload.questions[0];
    const activeAnswer = activeQuestion
      ? (answersRef.current[activeQuestion.id] ?? answers[activeQuestion.id] ?? "")
      : "";
    const hasAnswer = Boolean(activeAnswer.trim());

    if (payload.submitted && payload.feedback?.length) {
      return (
        <div className="space-y-4">
          {typeof payload.passed === "boolean" ? (
            <div
              className={`rounded-2xl border p-5 ${
                payload.passed
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {payload.passed
                  ? "You are ready to move on"
                  : "Let's strengthen the idea a little more"}
              </h3>
              <p className="mt-2 text-slate-700">
                {payload.passed
                  ? "You have shown that the key concept is clear enough to continue."
                  : "You are close, but it will help to review the idea once more before moving on."}
              </p>
            </div>
          ) : null}

          {payload.feedback.map((item, index) => (
            <FeedbackCard
              key={item.question_id}
              correct={item.is_correct}
              title={`Check ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
              body={item.explanation}
            />
          ))}

          {payload.micro_reteach ? (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              {payload.micro_reteach.title ? (
                <h4 className="text-lg font-semibold text-slate-900">
                  {payload.micro_reteach.title}
                </h4>
              ) : null}
              <p className="mt-2 text-slate-700">{payload.micro_reteach.body}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {payload.passed ? (
              <PrimaryButton
                onClick={() =>
                  void sendEvent("concept_gate_submitted", {
                    from_stage: "concept_gate",
                    acknowledged: true,
                  })
                }
                disabled={isSubmitting}
              >
                Continue to the next step
              </PrimaryButton>
            ) : (
              <SecondaryButton
                onClick={() =>
                  void sendEvent("concept_gate_retry_requested", {
                    from_stage: "concept_gate",
                  })
                }
                disabled={isSubmitting}
              >
                Try a new quick check
              </SecondaryButton>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {payload.instructions ? (
          <div className="rounded-2xl border bg-white p-5 shadow-sm text-slate-700">
            {payload.instructions}
          </div>
        ) : null}

        {typeof payload.retry_count === "number" && typeof payload.max_retries === "number" ? (
          <div className="rounded-2xl border bg-slate-50 p-4 text-slate-700">
            Attempt {payload.retry_count + 1} of {payload.max_retries + 1}
          </div>
        ) : null}

        {payload.questions.map((question) => (
          <QuestionBlock
            key={question.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={setAnswer}
          />
        ))}

        <PrimaryButton
          onClick={() =>
            void sendEvent("concept_gate_submitted", {
              from_stage: "concept_gate",
              answers: activeQuestion ? { [activeQuestion.id]: activeAnswer } : answersRef.current,
              question_ids: payload.questions.map((question) => question.id),
            })
          }
          disabled={isSubmitting || !hasAnswer}
        >
          Check this idea
        </PrimaryButton>
      </div>
    );
  };

  const renderSimulation = () => {
    const payload = runner.stage_payload as SimulationStagePayload;
    const simulationLessonKey = runnerLessonKey(lessonId || runner.lesson_id);
    const hasStructuredGuidance = Boolean(
      (payload.explore_steps?.length ?? 0) ||
      (payload.watch_for?.length ?? 0) ||
      payload.try_first ||
      payload.takeaway
    );
    const simulationToolConfig = {
      ruler: { label: "Ruler", step: 0.1, uncertainty: "+/- 0.05 cm", spread: 0.12 },
      caliper: { label: "Caliper", step: 0.01, uncertainty: "+/- 0.005 cm", spread: 0.03 },
      micrometer: { label: "Micrometer", step: 0.001, uncertainty: "+/- 0.0005 cm", spread: 0.01 },
    }[simTool];
    const formatSimulationNumber = (value: number, decimals = 3) => value.toFixed(decimals).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
    const simulationReading = Math.round(simLength / simulationToolConfig.step) * simulationToolConfig.step;
    const simulationRepeated = [-2, -1, 0, 1, 2].map((offset) =>
      formatSimulationNumber(Math.round((simLength + offset * simulationToolConfig.spread) / simulationToolConfig.step) * simulationToolConfig.step)
    );
    const repeatedValues = simulationRepeated.map((item) => Number(item));
    const repeatedSpread = Math.max(...repeatedValues) - Math.min(...repeatedValues);
    const toolDivisionLabel = simTool === "ruler" ? "About 0.1 cm scale steps" : simTool === "caliper" ? "About 0.01 cm scale steps" : "About 0.001 cm scale steps";
    const zeroErrorReading = Math.round((simLength + simZeroError) / simulationToolConfig.step) * simulationToolConfig.step;
    const correctedReading = Math.round((zeroErrorReading - simZeroError) / simulationToolConfig.step) * simulationToolConfig.step;
    const zeroErrorRange = 0.12;
    const zeroIndicatorX = 130 + (simZeroError / zeroErrorRange) * 46;
    const zeroIndicatorClamped = Math.max(86, Math.min(174, zeroIndicatorX));
    const zeroErrorDirection = simZeroError > 0 ? "too high" : simZeroError < 0 ? "too low" : "correct";
    const rulerTrueEndX = 56 + (simLength / 8) * 236;
    const rulerReadEndX = 56 + (simulationReading / 8) * 236;
    const caliperJawX = 118 + (simulationReading / 8) * 132;
    const micrometerGapX = 170 + (Math.min(simLength, 0.9) / 0.9) * 38;
    const measurementStageOrder: Array<{
      key: MeasurementExplorerStageKey;
      stageLabel: string;
      title: string;
      description: string;
    }> = [
      {
        key: "tool_match",
        stageLabel: "Stage 1",
        title: "Match the object to the instrument",
        description: "Start by choosing the object and deciding which tool earns your trust before you worry about digits.",
      },
      {
        key: "reading_detail",
        stageLabel: "Stage 2",
        title: "Read the scale honestly",
        description: "Keep the object fixed and compare the reported reading, the smallest division, and the uncertainty the tool can justify.",
      },
      {
        key: "spread_check",
        stageLabel: "Stage 3",
        title: "Check repeated-reading spread",
        description: "Look at several measurements of the same object so random scatter stays separate from resolution.",
      },
      {
        key: "zero_error",
        stageLabel: "Stage 4",
        title: "Test zero-error bias",
        description: "Finish by shifting the zero and comparing the observed reading with the corrected reading.",
      },
    ];
    const activeMeasurementStageIndex = Math.max(0, measurementStageOrder.findIndex((entry) => entry.key === simMeasurementStage));
    const activeMeasurementStage = measurementStageOrder[activeMeasurementStageIndex] || measurementStageOrder[0];
    const currentMeasurementPresetLabel = simMeasurementPreset === "wire"
      ? "Wire thickness"
      : simMeasurementPreset === "marble"
        ? "Marble diameter"
        : simMeasurementPreset === "chalk"
          ? "Chalk length"
          : "Custom object";
    const currentMeasurementPresetNote = simMeasurementPreset === "wire"
      ? "Thin wire needs a very fine scale, so it is a good stress test for the micrometer."
      : simMeasurementPreset === "marble"
        ? "A marble is large enough for a caliper to grip cleanly without needing the very finest scale."
        : simMeasurementPreset === "chalk"
          ? "Chalk is large enough that a ruler is usually already honest enough."
          : simLength < 0.08
            ? "This is extremely small, so the finest tool is usually the honest choice."
            : simLength < 2.5
              ? "This is a small object, so a caliper or micrometer will usually justify the best detail."
              : "This is a larger object, so a ruler may already be enough.";
    const recommendedMeasurementTool: SimulationToolKey = simMeasurementPreset === "wire"
      ? "micrometer"
      : simMeasurementPreset === "marble"
        ? "caliper"
        : simMeasurementPreset === "chalk"
          ? "ruler"
          : simLength < 0.08
            ? "micrometer"
            : simLength < 2.5
              ? "caliper"
              : "ruler";
    const measurementFit = (() => {
      if (simMeasurementPreset === "wire") {
        if (simTool === "micrometer") {
          return {
            tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
            title: "Best match",
            body: "The micrometer screw gauge is the best fit because the wire is tiny and the finest divisions matter.",
          };
        }
        if (simTool === "caliper") {
          return {
            tone: "border-sky-200 bg-sky-50 text-sky-900",
            title: "Usable, but not finest",
            body: "A caliper can still help, but the micrometer supports even smaller uncertainty for a thin wire.",
          };
        }
        return {
          tone: "border-amber-200 bg-amber-50 text-amber-900",
          title: "Too coarse",
          body: "A ruler's 1 mm scale is too coarse to justify a thin-wire thickness confidently.",
        };
      }
      if (simMeasurementPreset === "marble") {
        if (simTool === "caliper") {
          return {
            tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
            title: "Best match",
            body: "A caliper is the natural fit because its jaws hold the curved edges cleanly while still giving fine detail.",
          };
        }
        if (simTool === "micrometer") {
          return {
            tone: "border-sky-200 bg-sky-50 text-sky-900",
            title: "More detail than needed",
            body: "The micrometer can measure it, but the caliper is usually the better-matched tool for a marble.",
          };
        }
        return {
          tone: "border-amber-200 bg-amber-50 text-amber-900",
          title: "Coarse choice",
          body: "A ruler gives only a rough diameter, so it is harder to justify the detail for a rounded object.",
        };
      }
      if (simMeasurementPreset === "chalk") {
        if (simTool === "ruler") {
          return {
            tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
            title: "Best match",
            body: "A ruler is usually enough here because the object is large and the coarse divisions are still honest.",
          };
        }
        return {
          tone: "border-sky-200 bg-sky-50 text-sky-900",
          title: "Finer than needed",
          body: "The finer tools still work, but they are offering more detail than this larger classroom object usually needs.",
        };
      }
      if (simTool === recommendedMeasurementTool) {
        return {
          tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
          title: "Best current match",
          body: "For this custom size, this tool is the best match for the level of detail you are trying to justify.",
        };
      }
      return {
        tone: "border-sky-200 bg-sky-50 text-sky-900",
        title: "Compare with the recommended tool",
        body: `Try switching to the ${recommendedMeasurementTool === "ruler" ? "ruler" : recommendedMeasurementTool === "caliper" ? "caliper" : "micrometer screw gauge"} and see whether the reported detail becomes more honest for this object size.`,
      };
    })();
    const spreadCoach = simTool === "ruler"
      ? "The ruler gives the widest scatter because each reading is limited by the coarse 1 mm divisions."
      : simTool === "caliper"
        ? "The caliper usually gives a tighter cluster because the scale steps are finer and the jaws help you repeat the placement."
        : "The micrometer gives the tightest cluster here because the finest divisions support the most repeatable detail.";
    const zeroErrorCoach = simZeroError === 0
      ? "With no zero error, the observed reading and the corrected reading agree."
      : simZeroError > 0
        ? "A positive zero error makes every observed reading too large by the same amount until you correct it."
        : "A negative zero error makes every observed reading too small by the same amount until you correct it.";

    const simulationPanelGridStyle = { display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" };
    const metricCards = [
      { unit: "km", value: simMetricMeters / 1000, decimals: 5, note: "A larger unit, so the number stays small." },
      { unit: "m", value: simMetricMeters, decimals: 2, note: "The base unit for this distance." },
      { unit: "cm", value: simMetricMeters * 100, decimals: 1, note: "Smaller units need a bigger count." },
      { unit: "mm", value: simMetricMeters * 1000, decimals: 0, note: "The smallest unit here gives the biggest number." },
    ];
    const vectorAngleRadians = (simVectorAngle * Math.PI) / 180;
    const vectorLength = 22 + simVectorMagnitude * 10;
    const vectorEndX = 92 + Math.cos(vectorAngleRadians) * vectorLength;
    const vectorEndY = 92 - Math.sin(vectorAngleRadians) * vectorLength;
    const journeyDistance = simJourneyOutward + simJourneyReturn;
    const journeyDisplacement = simJourneyOutward - simJourneyReturn;
    const journeyDisplacementMagnitude = Math.abs(journeyDisplacement);
    const journeyDisplacementDirection = journeyDisplacement > 0 ? "east" : journeyDisplacement < 0 ? "west" : "zero";
    const journeyScale = 12;
    const journeyStartX = 52;
    const journeyOutwardX = journeyStartX + simJourneyOutward * journeyScale;
    const journeyFinishX = journeyOutwardX - simJourneyReturn * journeyScale;
    const sigFigureCount = Math.max(1, Math.min(5, simSigFigures));
    const sigNumericValue = Number(simSigSample);
    const sigRoundedDisplay = Number.isFinite(sigNumericValue) ? sigNumericValue.toPrecision(sigFigureCount) : "";
    const sigDigits = simSigSample.replace(/[^0-9]/g, "").replace(/^0+/, "");
    const sigNextDigit = sigDigits[sigFigureCount] || "none";
    const sigRoundedNote = sigNextDigit === "none"
      ? "No extra digit remains, so no further rounding decision is needed."
      : Number(sigNextDigit) >= 5
        ? "The next digit is 5 or more, so the last kept digit rounds up."
        : "The next digit is 0 to 4, so the last kept digit stays the same.";
    const sigOperationExample = {
      add: {
        label: "Addition",
        symbol: "+",
        first: "12.34 cm",
        second: "1.2 cm",
        raw: "13.54 cm",
        reported: "13.5 cm",
        ruleLabel: "Least decimal places",
        explanation: "The second measurement has only 1 decimal place, so the final sum keeps 1 decimal place.",
      },
      subtract: {
        label: "Subtraction",
        symbol: "-",
        first: "8.765 s",
        second: "0.4 s",
        raw: "8.365 s",
        reported: "8.4 s",
        ruleLabel: "Least decimal places",
        explanation: "The second measurement has only 1 decimal place, so the final difference keeps 1 decimal place.",
      },
      multiply: {
        label: "Multiplication",
        symbol: "x",
        first: "2.5 cm",
        second: "3.42 cm",
        raw: "8.55 cm^2",
        reported: "8.6 cm^2",
        ruleLabel: "Least significant figures",
        explanation: "The first measurement has 2 significant figures, so the product keeps 2 significant figures.",
      },
      divide: {
        label: "Division",
        symbol: "/",
        first: "9.84 g",
        second: "2.1 cm^3",
        raw: "4.685714... g/cm^3",
        reported: "4.7 g/cm^3",
        ruleLabel: "Least significant figures",
        explanation: "The divisor has 2 significant figures, so the quotient keeps 2 significant figures.",
      },
    }[simSigOperation];

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {payload.title ? (
            <h3 className="text-lg font-semibold text-slate-900">{payload.title}</h3>
          ) : null}
          {payload.instructions ? (
            <p className="mt-2 text-slate-700">{payload.instructions}</p>
          ) : null}
          {payload.task_prompt ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-800">
              <span className="font-medium">Your task:</span> {payload.task_prompt}
            </div>
          ) : null}
          {payload.try_first ? (
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
              <span className="font-medium">Try this first:</span> {payload.try_first}
            </div>
          ) : null}
        </div>

        {hasStructuredGuidance ? (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">How to use this explorer</h4>
            {payload.explore_steps?.length ? (
              <ol className="mt-3 space-y-2 text-sm text-slate-700">
                {payload.explore_steps.map((step, index) => (
                  <li key={`${step}-${index}`}>
                    <span className="font-medium text-slate-900">Step {index + 1}:</span> {step}
                  </li>
                ))}
              </ol>
            ) : null}
            {payload.watch_for?.length ? (
              <div className="mt-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Watch for:</span> {payload.watch_for.join(" ")}
              </div>
            ) : null}
            {payload.takeaway ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <span className="font-medium">What this should show:</span> {payload.takeaway}
              </div>
            ) : null}
          </div>
        ) : null}

        {payload.embed_url ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <iframe
              src={payload.embed_url}
              title="Simulation"
              className="h-[480px] w-full"
            />
          </div>
        ) : simulationLessonKey === "F1_L3" ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                    {activeMeasurementStage.stageLabel} of {measurementStageOrder.length}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">{activeMeasurementStage.title}</h4>
                  <p className="mt-2 max-w-3xl text-slate-700">{activeMeasurementStage.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSimMeasurementStage(measurementStageOrder[Math.max(0, activeMeasurementStageIndex - 1)]!.key)}
                    disabled={activeMeasurementStageIndex === 0}
                    className={`rounded-xl border px-4 py-2 text-sm ${activeMeasurementStageIndex === 0 ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    Previous stage
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimMeasurementStage(measurementStageOrder[Math.min(measurementStageOrder.length - 1, activeMeasurementStageIndex + 1)]!.key)}
                    disabled={activeMeasurementStageIndex === measurementStageOrder.length - 1}
                    className={`rounded-xl border px-4 py-2 text-sm ${activeMeasurementStageIndex === measurementStageOrder.length - 1 ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"}`}
                  >
                    Next stage
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-4">
                {measurementStageOrder.map((entry, index) => (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => setSimMeasurementStage(entry.key)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${entry.key === simMeasurementStage ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                  >
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] opacity-75">Stage {index + 1}</span>
                    <span className="mt-1 block font-semibold">{entry.title}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Object: {currentMeasurementPresetLabel}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Tool: {simulationToolConfig.label}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Reading: {formatSimulationNumber(simulationReading)} cm</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Uncertainty: {simulationToolConfig.uncertainty}</span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">
                  {simMeasurementStage === "tool_match" ? "Object and tool match" : simMeasurementStage === "reading_detail" ? "Scale and reading detail" : "Measurement setup"}
                </h4>
                <p className="mt-2 text-slate-700">
                  {simMeasurementStage === "tool_match"
                    ? "Start small: pick the object, choose the instrument, and justify why that tool is trustworthy."
                    : simMeasurementStage === "reading_detail"
                      ? "Keep the object and tool fixed long enough to see which digits and uncertainty the scale can honestly support."
                      : "These setup controls stay here if you want to jump back and compare another object-tool combination."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(["wire", "marble", "chalk", "custom"] as const).map((presetKey) => (
                    <button
                      key={presetKey}
                      type="button"
                      onClick={() => {
                        setSimMeasurementPreset(presetKey);
                        if (presetKey === "wire") setSimLength(0.428);
                        if (presetKey === "marble") setSimLength(1.86);
                        if (presetKey === "chalk") setSimLength(7.42);
                      }}
                      className={`rounded-xl border px-4 py-3 text-left text-sm ${simMeasurementPreset === presetKey ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                    >
                      <span className="block font-semibold">
                        {presetKey === "wire" ? "Wire thickness" : presetKey === "marble" ? "Marble diameter" : presetKey === "chalk" ? "Chalk length" : "Custom object"}
                      </span>
                      <span className="mt-1 block text-xs opacity-80">
                        {presetKey === "wire" ? "Very small" : presetKey === "marble" ? "Small curved object" : presetKey === "chalk" ? "Larger classroom object" : "Choose by size"}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Current object:</span> {currentMeasurementPresetNote}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {(["ruler", "caliper", "micrometer"] as const).map((toolName) => (
                    <button
                      key={toolName}
                      type="button"
                      onClick={() => setSimTool(toolName)}
                      className={`rounded-xl border px-4 py-2 text-sm ${simTool === toolName ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                    >
                      {toolName === "ruler" ? "Ruler" : toolName === "caliper" ? "Caliper" : "Micrometer screw gauge"}
                    </button>
                  ))}
                </div>

                <div className={`mt-4 rounded-2xl border px-4 py-4 text-sm leading-6 ${measurementFit.tone}`}>
                  <p className="font-semibold">{measurementFit.title}</p>
                  <p className="mt-2">{measurementFit.body}</p>
                </div>

                {simMeasurementStage === "tool_match" ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                    When you can explain why {recommendedMeasurementTool === "ruler" ? "the ruler" : recommendedMeasurementTool === "caliper" ? "the caliper" : "the micrometer screw gauge"} is the best current match, move to Stage 2.
                  </div>
                ) : simMeasurementStage === "reading_detail" ? (
                  <>
                    <label className="mt-4 block text-sm text-slate-700">
                      Object length (cm)
                      <input className="mt-2 w-full" type="range" min="0.1" max="8" step="0.001" value={simLength} onChange={(e) => { setSimMeasurementPreset("custom"); setSimLength(Number(e.target.value)); }} />
                    </label>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Reported reading:</span> {formatSimulationNumber(simulationReading)} cm</div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Estimated uncertainty:</span> {simulationToolConfig.uncertainty}</div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Current tool:</span> {simulationToolConfig.label}</div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Scale detail:</span> {toolDivisionLabel}</div>
                    </div>
                    <div className="mt-4 rounded-2xl border bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Live instrument view</p>
                      <p className="mt-1 text-sm text-slate-600">The object stays the same. The instrument changes how much detail can be justified.</p>
                      {simTool === "ruler" ? (
                        <svg viewBox="0 0 340 180" role="img" aria-label="Ruler measuring the object" className="mt-4 h-48 w-full rounded-2xl bg-white p-4">
                          <rect x="42" y="102" width="256" height="34" rx="17" fill="#fde68a" />
                          {Array.from({ length: 9 }).map((_, index) => {
                            const x = 56 + index * 29.5;
                            return (
                              <g key={`ruler-major-${index}`}>
                                <line x1={x} y1="102" x2={x} y2="76" stroke="#92400e" strokeWidth="3" strokeLinecap="round" />
                                <text x={x - 4} y="154" fontSize="12" fill="#475569">{index}</text>
                              </g>
                            );
                          })}
                          <rect x="56" y="66" width={Math.max(12, rulerTrueEndX - 56)} height="14" rx="7" fill="#60a5fa" opacity="0.35" />
                          <line x1={rulerReadEndX} y1="58" x2={rulerReadEndX} y2="144" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
                          <text x="56" y="58" fontSize="12" fill="#2563eb">True object span</text>
                          <text x={Math.min(rulerReadEndX + 8, 246)} y="70" fontSize="12" fill="#0f172a">Reported mark</text>
                        </svg>
                      ) : simTool === "caliper" ? (
                        <svg viewBox="0 0 340 180" role="img" aria-label="Caliper measuring the object" className="mt-4 h-48 w-full rounded-2xl bg-white p-4">
                          <rect x="58" y="104" width="222" height="18" rx="9" fill="#475569" />
                          <rect x="84" y="70" width="16" height="84" rx="8" fill="#0f766e" />
                          <rect x={caliperJawX} y="70" width="16" height="84" rx="8" fill="#0f766e" />
                          <rect x="100" y="96" width={Math.max(14, caliperJawX - 100)} height="24" rx="12" fill="#93c5fd" opacity="0.8" />
                          <rect x={caliperJawX - 28} y="86" width="56" height="12" rx="6" fill="#94a3b8" />
                          <text x="90" y="156" fontSize="12" fill="#0f766e">Fixed jaw</text>
                          <text x={Math.max(180, caliperJawX - 42)} y="156" fontSize="12" fill="#0f766e">Moving jaw</text>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 340 180" role="img" aria-label="Micrometer measuring the object" className="mt-4 h-48 w-full rounded-2xl bg-white p-4">
                          <path d="M84 58 C48 58 48 130 84 130" fill="none" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                          <line x1="84" y1="58" x2="156" y2="58" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                          <line x1="84" y1="130" x2="156" y2="130" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
                          <rect x="146" y="86" width={Math.max(12, micrometerGapX - 146)} height="20" rx="10" fill="#60a5fa" opacity="0.75" />
                          <rect x={micrometerGapX} y="80" width="74" height="32" rx="16" fill="#475569" />
                          <rect x="220" y="76" width="44" height="40" rx="14" fill="#94a3b8" />
                          <text x="138" y="146" fontSize="12" fill="#2563eb">Object held in the measuring gap</text>
                        </svg>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-2xl border bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                    Stages 3 and 4 focus on trust checks. Use the stage buttons above if you want to change the object or instrument first.
                  </div>
                )}
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">
                  {simMeasurementStage === "spread_check" ? "Random scatter check" : simMeasurementStage === "zero_error" ? "Systematic bias check" : "Trust checks"}
                </h4>
                <p className="mt-2 text-slate-700">
                  {simMeasurementStage === "spread_check"
                    ? "Stay with repeated readings first so random scatter is clear before you add any zero error."
                    : simMeasurementStage === "zero_error"
                      ? "Now hold the object steady and change the instrument zero so the bias pattern becomes obvious."
                      : "Stages 3 and 4 live here. Use the stage buttons above when you are ready to test reading spread and zero-error bias."}
                </p>

                {simMeasurementStage === "spread_check" ? (
                  <>
                    <div className="mt-4 grid gap-2 sm:grid-cols-5">
                      {simulationRepeated.map((item, index) => (
                        <div key={`${item}-${index}`} className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-800">
                          {item} cm
                        </div>
                      ))}
                    </div>
                    <svg viewBox="0 0 260 110" role="img" aria-label="Spread of repeated readings" className="mt-4 h-28 w-full rounded-xl bg-slate-50 p-2">
                      <line x1="26" y1="54" x2="234" y2="54" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                      {simulationRepeated.map((item, index) => (
                        <circle key={`spread-${item}-${index}`} cx={44 + index * 44} cy={54 - (Number(item) - simulationReading) * 220} r="8" fill={Math.abs(Number(item) - simulationReading) <= repeatedSpread / 4 ? "#0f766e" : "#2563eb"} />
                      ))}
                    </svg>
                    <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Current spread:</span> {formatSimulationNumber(repeatedSpread)} cm</div>
                    <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                      {spreadCoach}
                    </div>
                    <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                      Averaging repeated readings can reduce the effect of random error, but it cannot fix a constant offset.
                    </div>
                  </>
                ) : simMeasurementStage === "zero_error" ? (
                  <>
                    <label className="mt-4 block text-sm text-slate-700">
                      Zero error
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          Instrument starts: {zeroErrorDirection}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                          Offset {formatSimulationNumber(simZeroError, 2)} cm
                        </span>
                      </div>
                      <input className="mt-2 w-full" type="range" min={-zeroErrorRange} max={zeroErrorRange} step="0.01" value={simZeroError} onChange={(e) => setSimZeroError(Number(e.target.value))} />
                    </label>
                    <svg viewBox="0 0 260 94" role="img" aria-label="Zero error indicator" className="mt-4 h-28 w-full rounded-2xl bg-slate-50 p-3">
                      <line x1="44" y1="56" x2="216" y2="56" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                      <line x1="130" y1="28" x2="130" y2="78" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
                      <line x1={zeroIndicatorClamped} y1="34" x2={zeroIndicatorClamped} y2="74" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" />
                      <text x="102" y="22" fontSize="11" fill="#0f172a">True zero</text>
                      <text x={Math.max(78, Math.min(162, zeroIndicatorClamped - 18))} y="90" fontSize="11" fill="#ea580c">Instrument zero</text>
                    </svg>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Observed reading:</span> {formatSimulationNumber(zeroErrorReading)} cm</div>
                      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="font-medium text-emerald-900">Corrected reading:</span> {formatSimulationNumber(correctedReading)} cm</div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                      {zeroErrorCoach}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    Use Stages 1 and 2 first to choose the right tool and read the scale honestly. Then come back here for the trust checks.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : simulationLessonKey === "F1_L1" ? (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" }}>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Unit size explorer</h4>
              <p className="mt-2 text-slate-700">Move the slider and compare how the same length looks in larger and smaller units.</p>
              <label className="mt-4 block text-sm text-slate-700">
                Distance in metres
                <input className="mt-2 w-full" type="range" min="0.05" max="2.5" step="0.01" value={simMetricMeters} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />
              </label>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Current distance:</span> {simMetricMeters.toFixed(2).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")} m</div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Equivalent measurements</h4>
              <div className="mt-4" style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-medium text-slate-500">km</p><p className="mt-2 text-lg font-semibold text-slate-900">{(simMetricMeters / 1000).toFixed(5)} km</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-medium text-slate-500">m</p><p className="mt-2 text-lg font-semibold text-slate-900">{simMetricMeters.toFixed(2).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")} m</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-medium text-slate-500">cm</p><p className="mt-2 text-lg font-semibold text-slate-900">{(simMetricMeters * 100).toFixed(1).replace(/\.0+$/, "")} cm</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-sm font-medium text-slate-500">mm</p><p className="mt-2 text-lg font-semibold text-slate-900">{Math.round(simMetricMeters * 1000)} mm</p></div>
              </div>
            </div>
          </div>
        ) : simulationLessonKey === "F1_L2" ? (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" }}>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Vector explorer</h4>
              <p className="mt-2 text-slate-700">Change size and direction. A vector changes when either one changes.</p>
              <label className="mt-4 block text-sm text-slate-700">
                Magnitude
                <input className="mt-2 w-full" type="range" min="1" max="9" step="1" value={simVectorMagnitude} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />
              </label>
              <label className="mt-4 block text-sm text-slate-700">
                Direction (degrees)
                <input className="mt-2 w-full" type="range" min="0" max="360" step="5" value={simVectorAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />
              </label>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Arrow view</h4>
              <svg viewBox="0 0 220 180" role="img" aria-label="Vector direction" style={{ width: "100%", height: 220, background: "#f8fafc", borderRadius: 18 }}>
                <line x1="20" y1="92" x2="170" y2="92" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="92" y1="20" x2="92" y2="160" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="92" cy="92" r="4" fill="#0f172a" />
                <line x1="92" y1="92" x2={vectorEndX} y2={vectorEndY} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
              </svg>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Magnitude:</span> {simVectorMagnitude} units
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <span className="font-medium text-slate-900">Direction:</span> {simVectorAngle}&deg;
                </div>
              </div>
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">Direction rotates the arrow, but a scalar would only keep the size value.</div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm xl:col-span-2">
              <h4 className="text-lg font-semibold text-slate-900">Distance and displacement measure</h4>
              <p className="mt-2 text-slate-700">Adjust the outward and return parts of the journey. Distance tracks the whole route, while displacement only tracks the start-to-finish change.</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
                <div>
                  <label className="block text-sm text-slate-700">
                    Outward distance: {simJourneyOutward} m east
                    <input className="mt-2 w-full" type="range" min="2" max="12" step="1" value={simJourneyOutward} onChange={(e) => setSimJourneyOutward(Number(e.target.value))} />
                  </label>
                  <label className="mt-4 block text-sm text-slate-700">
                    Return distance: {simJourneyReturn} m west
                    <input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={simJourneyReturn} onChange={(e) => setSimJourneyReturn(Number(e.target.value))} />
                  </label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                      <span className="font-medium">Total distance:</span> {journeyDistance} m
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      <span className="font-medium">Displacement:</span>{" "}
                      {journeyDisplacementMagnitude === 0
                        ? "0 m"
                        : `${journeyDisplacementMagnitude} m ${journeyDisplacementDirection}`}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                    Every slider change updates both measures. The purple route adds the full trip, but the green arrow only compares your finishing point with where you began.
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <svg
                    viewBox="0 0 260 200"
                    role="img"
                    aria-label="Distance and displacement comparison"
                    style={{ width: "100%", height: 260, background: "#f8fafc", borderRadius: 18 }}
                  >
                    <defs>
                      <marker id="distance-arrow-f1l2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
                      </marker>
                      <marker id="displacement-arrow-f1l2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
                      </marker>
                    </defs>
                    <line x1="24" y1="96" x2="236" y2="96" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="6 6" />
                    <line x1={journeyStartX} y1="54" x2={journeyOutwardX} y2="54" stroke="#7c3aed" strokeWidth="8" strokeLinecap="round" markerEnd="url(#distance-arrow-f1l2)" />
                    <line x1={journeyOutwardX} y1="78" x2={journeyFinishX} y2="78" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" markerEnd="url(#distance-arrow-f1l2)" />
                    <line x1={journeyStartX} y1="144" x2={journeyFinishX} y2="144" stroke="#059669" strokeWidth="8" strokeLinecap="round" markerEnd={journeyFinishX === journeyStartX ? undefined : "url(#displacement-arrow-f1l2)"} />
                    <circle cx={journeyStartX} cy="96" r="6" fill="#0f172a" />
                    <circle cx={journeyOutwardX} cy="96" r="6" fill="#7c3aed" />
                    <circle cx={journeyFinishX} cy="96" r="6" fill="#059669" />
                    <text x={journeyStartX} y="118" textAnchor="middle" fontSize="12" fill="#334155">Start</text>
                    <text x={journeyOutwardX} y="118" textAnchor="middle" fontSize="12" fill="#6d28d9">Turn</text>
                    <text x={journeyFinishX} y="164" textAnchor="middle" fontSize="12" fill="#047857">Finish</text>
                    <text x={(journeyStartX + journeyOutwardX) / 2} y="38" textAnchor="middle" fontSize="12" fill="#6d28d9">
                      {simJourneyOutward} m out
                    </text>
                    <text x={(journeyOutwardX + journeyFinishX) / 2} y="64" textAnchor="middle" fontSize="12" fill="#7e22ce">
                      {simJourneyReturn} m back
                    </text>
                    <text x={(journeyStartX + journeyFinishX) / 2} y="136" textAnchor="middle" fontSize="12" fill="#047857">
                      {journeyDisplacementMagnitude === 0 ? "0 m displacement" : `${journeyDisplacementMagnitude} m ${journeyDisplacementDirection}`}
                    </text>
                  </svg>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-900">
                      <span className="font-medium">Distance path:</span> follow every section of the trip.
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      <span className="font-medium">Displacement arrow:</span> compare the start and finish only.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : simulationLessonKey === "F1_L4" ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Rounding explorer</h4>
              <p className="mt-2 text-slate-700">Change the sample value or the target number of significant figures, then inspect the next digit before deciding whether to round up.</p>
              <label className="mt-4 block text-sm text-slate-700">
                Sample value
                <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" type="text" value={simSigSample} onChange={(e) => setSimSigSample(e.target.value)} />
              </label>
              <label className="mt-4 block text-sm text-slate-700">
                Target significant figures: {sigFigureCount}
                <input className="mt-2 w-full" type="range" min="1" max="5" step="1" value={simSigFigures} onChange={(e) => setSimSigFigures(Number(e.target.value))} />
              </label>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Rounded result:</span> {sigRoundedDisplay || "Enter a valid number"}</div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Next digit:</span> {sigNextDigit}</div>
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">{sigRoundedNote}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Calculation rule explorer</h4>
              <p className="mt-2 text-slate-700">Switch the operation and notice which reporting rule controls the final written answer.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["add", "subtract", "multiply", "divide"] as const).map((operation) => (
                  <button
                    key={operation}
                    type="button"
                    onClick={() => setSimSigOperation(operation)}
                    className={`rounded-xl border px-4 py-2 text-sm ${simSigOperation === operation ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                  >
                    {operation === "add" ? "Add" : operation === "subtract" ? "Subtract" : operation === "multiply" ? "Multiply" : "Divide"}
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Calculator step</p>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{sigOperationExample.first} {sigOperationExample.symbol} {sigOperationExample.second} = {sigOperationExample.raw}</p>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-slate-800"><span className="font-medium text-slate-900">Rule:</span> {sigOperationExample.ruleLabel}</div>
              <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-slate-800"><span className="font-medium text-slate-900">Report this answer:</span> {sigOperationExample.reported}</div>
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">{sigOperationExample.explanation}</div>
            </div>
          </div>
        ) : simulationLessonKey === "F1_L5" ? (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" }}>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Density tank</h4>
              <p className="mt-2 text-slate-700">Change mass and volume to see how density affects floating and sinking.</p>
              <label className="mt-4 block text-sm text-slate-700">Mass (g)<input className="mt-2 w-full" type="range" min="50" max="300" step="5" value={simDensityMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
              <label className="mt-4 block text-sm text-slate-700">Volume (cm^3)<input className="mt-2 w-full" type="range" min="50" max="250" step="5" value={simDensityVolume} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
              <label className="mt-4 block text-sm text-slate-700">Fluid density (g/cm^3)<input className="mt-2 w-full" type="range" min="0.6" max="1.4" step="0.05" value={simFluidDensity} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Float or sink?</h4>
              <svg viewBox="0 0 260 220" role="img" aria-label="Density tank" style={{ width: "100%", height: 240 }}>
                <rect x="40" y="20" width="180" height="180" rx="24" fill="#eff6ff" stroke="#93c5fd" strokeWidth="4" />
                <rect x="44" y="94" width="172" height="102" rx="18" fill="#bfdbfe" />
                <line x1="44" y1="94" x2="216" y2="94" stroke="#60a5fa" strokeWidth="4" />
                <rect x={130 - Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9)) / 2} y={Math.abs(simDensityMass / Math.max(simDensityVolume, 1) - simFluidDensity) <= 0.05 ? 120 - Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9)) / 2 : simDensityMass / Math.max(simDensityVolume, 1) < simFluidDensity ? 78 - Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9)) / 2 : 190 - Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9))} width={Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9))} height={Math.max(54, Math.min(92, 36 + Math.cbrt(simDensityVolume) * 9))} rx="16" fill={Math.abs(simDensityMass / Math.max(simDensityVolume, 1) - simFluidDensity) <= 0.05 ? "#fbbf24" : simDensityMass / Math.max(simDensityVolume, 1) < simFluidDensity ? "#34d399" : "#f97316"} />
              </svg>
              <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Object density:</span> {(simDensityMass / Math.max(simDensityVolume, 1)).toFixed(2)} g/cm^3</div>
            </div>
          </div>
        ) : simulationLessonKey === "F1_L6" ? (
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", alignItems: "start" }}>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Accuracy and precision tuner</h4>
              <p className="mt-2 text-slate-700">Shift the whole cluster with bias, or spread the points out to reduce precision.</p>
              <label className="mt-4 block text-sm text-slate-700">Bias from the true value<input className="mt-2 w-full" type="range" min="0" max="30" step="1" value={simBias} onChange={(e) => setSimBias(Number(e.target.value))} /></label>
              <label className="mt-4 block text-sm text-slate-700">Spread of readings<input className="mt-2 w-full" type="range" min="4" max="30" step="1" value={simSpread} onChange={(e) => setSimSpread(Number(e.target.value))} /></label>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Target pattern</h4>
              <svg viewBox="0 0 260 220" role="img" aria-label="Accuracy and precision target" style={{ width: "100%", height: 240 }}>
                <circle cx="120" cy="110" r="72" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="4" />
                <circle cx="120" cy="110" r="46" fill="#ffffff" stroke="#93c5fd" strokeWidth="3" />
                <circle cx="120" cy="110" r="20" fill="#dbeafe" stroke="#60a5fa" strokeWidth="3" />
                {([[0, 0], [0.55, -0.4], [-0.55, 0.2], [0.35, 0.6], [-0.3, -0.65]] as const).map(([dx, dy], index) => (
                  <circle key={`${dx}-${dy}-${index}`} cx={120 + simBias * 0.7 + dx * simSpread * 0.65} cy={110 + simBias * 0.35 + dy * simSpread * 0.65} r="6" fill="#0f172a" opacity="0.85" />
                ))}
              </svg>
              <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Pattern:</span> {simBias < 12 ? "Accurate" : "Biased"}, {simSpread < 18 ? "Precise" : "Spread out"}</div>
            </div>
          </div>

        ) : simulationLessonKey.startsWith("F2_") ? (() => {
          if (simulationLessonKey === "F2_L1") {
            const outward = Math.max(4, simMetricMeters);
            const returnDistance = Math.max(0, Math.min(simVectorMagnitude, outward));
            const travelTime = Math.max(2, simVectorAngle);
            const distance = outward + returnDistance;
            const displacement = outward - returnDistance;
            const averageSpeed = distance / travelTime;
            const finishLabel = displacement > 0 ? formatSimulationNumber(displacement, 1) + " m east" : displacement < 0 ? formatSimulationNumber(Math.abs(displacement), 1) + " m west" : "back at the start";
            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Journey builder</h4>
                  <p className="mt-2 text-slate-700">Build an outward path, add a return path, and compare the whole route with the net change.</p>
                  <label className="mt-4 block text-sm text-slate-700">Outward distance (m)<input className="mt-2 w-full" type="range" min="4" max="20" step="1" value={outward} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Return distance (m)<input className="mt-2 w-full" type="range" min="0" max="20" step="1" value={simVectorMagnitude} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Travel time (s)<input className="mt-2 w-full" type="range" min="2" max="20" step="1" value={travelTime} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Distance versus displacement</h4>
                  <svg viewBox="0 0 280 120" role="img" aria-label="Journey line" className="mt-4 h-40 w-full rounded-2xl bg-slate-50 p-4">
                    <line x1="28" y1="66" x2="252" y2="66" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                    <line x1="40" y1="48" x2={40 + outward * 8} y2="48" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                    <line x1={40 + outward * 8} y1="84" x2={40 + (outward - returnDistance) * 8} y2="84" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
                    <text x="40" y="28" fontSize="12" fill="#2563eb">Outward path</text>
                    <text x="40" y="110" fontSize="12" fill="#0f766e">Return path</text>
                  </svg>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Distance:</span> {formatSimulationNumber(distance, 1)} m</div>
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Displacement:</span> {finishLabel}</div>
                    <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Average speed:</span> {formatSimulationNumber(averageSpeed, 2)} m/s</div>
                  </div>
                </div>
              </div>
            );
          }
          if (simulationLessonKey === "F2_L2") {
            const startVelocity = simVectorMagnitude;
            const endVelocity = simVectorAngle;
            const interval = Math.max(1, simMetricMeters);
            const acceleration = (endVelocity - startVelocity) / interval;
            const signLabel = acceleration > 0.01 ? "Positive" : acceleration < -0.01 ? "Negative" : "Zero";
            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Acceleration controls</h4>
                  <label className="mt-4 block text-sm text-slate-700">Start velocity (m/s)<input className="mt-2 w-full" type="range" min="0" max="20" step="1" value={startVelocity} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">End velocity (m/s)<input className="mt-2 w-full" type="range" min="0" max="20" step="1" value={endVelocity} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Time interval (s)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={interval} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Velocity change view</h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Change in velocity:</span> {formatSimulationNumber(endVelocity - startVelocity, 1)} m/s</div>
                    <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Acceleration:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Sign:</span> {signLabel}</div>
                  </div>
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">Positive acceleration means the velocity is increasing in the chosen positive direction. Negative acceleration means the change points the other way.</div>
                </div>
              </div>
            );
          }
          if (simulationLessonKey === "F2_L3") {
            const speedA = Math.max(1, simVectorMagnitude);
            const pauseTime = Math.max(0, simMetricMeters);
            const speedB = Math.max(1, simVectorAngle);
            const d1 = speedA * 4;
            const d2 = speedB * 4;

            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Distance-time graph builder</h4>
                  <label className="mt-4 block text-sm text-slate-700">First section speed (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Pause time (s)<input className="mt-2 w-full" type="range" min="0" max="6" step="1" value={pauseTime} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Second section speed (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Graph story</h4>
                  <svg viewBox="0 0 280 180" role="img" aria-label="Distance time graph" className="mt-4 h-44 w-full rounded-2xl bg-slate-50 p-3">
                    <polyline fill="none" stroke="#2563eb" strokeWidth="6" points={`24,144 84,${144 - d1 * 3} 84,${144 - d1 * 3} ${84 + pauseTime * 18},${144 - d1 * 3} 204,${144 - (d1 + d2) * 3}`} />
                    <line x1="24" y1="144" x2="252" y2="144" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="24" y1="18" x2="24" y2="144" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">First slope:</span> {speedA} m/s</div>
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Flat section:</span> {pauseTime} s stopped</div>
                    <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Second slope:</span> {speedB} m/s</div>
                  </div>
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">Steeper sections are faster. The flat section means the distance stayed unchanged for {pauseTime} s.</div>
                </div>
              </div>
            );
          }
          if (simulationLessonKey === "F2_L4") {
            const startVelocity = simVectorMagnitude;
            const endVelocity = simVectorAngle;
            const duration = Math.max(1, simMetricMeters);
            const acceleration = (endVelocity - startVelocity) / duration;
            const displacement = ((startVelocity + endVelocity) / 2) * duration;
            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Velocity-time controls</h4>
                  <label className="mt-4 block text-sm text-slate-700">Start velocity (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={startVelocity} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">End velocity (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={endVelocity} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Time interval (s)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={duration} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Slope and area view</h4>
                  <svg viewBox="0 0 280 180" role="img" aria-label="Velocity time graph" className="mt-4 h-44 w-full rounded-2xl bg-slate-50 p-3">
                    <polygon points={`24,144 24,${144 - startVelocity * 10} 204,${144 - endVelocity * 10} 204,144`} fill="rgba(125,211,252,0.45)" />
                    <polyline points={`24,${144 - startVelocity * 10} 204,${144 - endVelocity * 10}`} fill="none" stroke="#0f766e" strokeWidth="6" />
                    <line x1="24" y1="144" x2="252" y2="144" stroke="#94a3b8" strokeWidth="2" />
                    <line x1="24" y1="18" x2="24" y2="144" stroke="#94a3b8" strokeWidth="2" />
                  </svg>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Acceleration:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
                    <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Displacement:</span> {formatSimulationNumber(displacement, 1)} m</div>
                  </div>
                </div>
              </div>
            );
          }
          if (simulationLessonKey === "F2_L5") {
            const leftForce = simVectorMagnitude;
            const rightForce = simVectorAngle;
            const resultant = rightForce - leftForce;
            const motionText = Math.abs(resultant) < 0.01 ? "No change in velocity: rest or constant velocity." : resultant > 0 ? "Unbalanced to the right: velocity changes rightward." : "Unbalanced to the left: velocity changes leftward.";
            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Force balance controls</h4>
                  <label className="mt-4 block text-sm text-slate-700">Left force (N)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={leftForce} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Right force (N)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={rightForce} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Resultant force</h4>
                  <svg viewBox="0 0 280 120" role="img" aria-label="Opposing force arrows" className="mt-4 h-36 w-full rounded-2xl bg-slate-50 p-4">
                    <line x1="140" y1="60" x2={140 - leftForce * 9} y2="60" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
                    <line x1="140" y1="84" x2={140 + rightForce * 9} y2="84" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                    <text x="28" y="48" fontSize="12" fill="#f97316">Left pull</text>
                    <text x="178" y="106" fontSize="12" fill="#2563eb">Right pull</text>
                  </svg>
                  <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Resultant:</span> {Math.abs(resultant) < 0.01 ? "0 N" : `${formatSimulationNumber(Math.abs(resultant), 1)} N ${resultant > 0 ? "right" : "left"}`}</div>
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">{motionText}</div>
                </div>
              </div>
            );
          }
          if (simulationLessonKey === "F2_L6") {
            const force = simVectorMagnitude;
            const mass = Math.max(1, simMetricMeters);
            const acceleration = force / mass;
            const doubledForceAcceleration = (force * 2) / mass;
            const doubledMassAcceleration = force / (mass * 2);
            return (
              <div style={simulationPanelGridStyle}>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">F = ma controls</h4>
                  <label className="mt-4 block text-sm text-slate-700">Resultant force (N)<input className="mt-2 w-full" type="range" min="2" max="20" step="1" value={force} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="mt-4 block text-sm text-slate-700">Mass (kg)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={mass} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Acceleration comparison</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Current:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Double force:</span> {formatSimulationNumber(doubledForceAcceleration, 2)} m/s^2</div>
                    <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Double mass:</span> {formatSimulationNumber(doubledMassAcceleration, 2)} m/s^2</div>
                  </div>
                  <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">With the same mass, more force gives more acceleration. With the same force, more mass gives less acceleration.</div>
                </div>
              </div>
            );
          }
          return null;
        })() : simulationLessonKey === "F3_L1" ? (() => {
          const force = Math.max(5, Math.min(40, simVectorMagnitude));
          const distance = Math.max(0, Math.min(8, simMetricMeters));
          const moving = simVectorAngle >= 1;
          const work = moving ? force * distance : 0;
          return (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Quick work tester</h4>
              <p className="mt-2 text-slate-700">Use the controls below to test whether a force is actually doing work.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="block text-sm text-slate-700">Force (N)<input className="mt-2 w-full" type="range" min="5" max="40" step="1" value={force} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                  <label className="block text-sm text-slate-700">Distance moved in the force direction (m)<input className="mt-2 w-full" type="range" min="0" max="8" step="0.5" value={distance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setSimVectorAngle(1)} className={`rounded-xl border px-4 py-2 text-sm ${moving ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}>Movement enabled</button>
                    <button type="button" onClick={() => setSimVectorAngle(0)} className={`rounded-xl border px-4 py-2 text-sm ${!moving ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}>Object held still</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Current work:</span> {formatSimulationNumber(work, 0)} J</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Same force with no movement:</span> 0 J</div>
                  <div className="rounded-xl border bg-slate-50 p-4 text-slate-700">{moving ? `Because the object moves ${formatSimulationNumber(distance, 1)} m in the force direction, the force transfers ${formatSimulationNumber(work, 0)} J of energy as work.` : "The force is present, but without movement in the force direction no work is done."}</div>
                </div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F3_L2" ? (() => {
          const mass = Math.max(1, Math.min(10, simMetricMeters));
          const speed = Math.max(0, Math.min(12, simVectorMagnitude));
          const height = Math.max(0, Math.min(10, simVectorAngle));
          const kineticEnergy = 0.5 * mass * speed * speed;
          const potentialEnergy = mass * 10 * height;
          const doubledMassKineticEnergy = kineticEnergy * 2;
          const doubledSpeedKineticEnergy = kineticEnergy * 4;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Energy store controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Mass (kg)<input className="mt-2 w-full" type="range" min="1" max="10" step="0.5" value={mass} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Speed (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Height (m)<input className="mt-2 w-full" type="range" min="0" max="10" step="0.5" value={height} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Current energy picture</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Kinetic energy:</span> {formatSimulationNumber(kineticEnergy, 0)} J</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Potential energy:</span> {formatSimulationNumber(potentialEnergy, 0)} J</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Double mass, same speed:</span> {formatSimulationNumber(doubledMassKineticEnergy, 0)} J</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Double speed, same mass:</span> {formatSimulationNumber(doubledSpeedKineticEnergy, 0)} J</div>
                </div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Changing height only changes gravitational potential energy. Changing speed has the strongest effect on kinetic energy because speed is squared.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F3_L3" ? (() => {
          const inputEnergy = Math.max(200, Math.min(2000, simDensityMass));
          const usefulEnergy = Math.max(0, Math.min(inputEnergy, simDensityVolume));
          const timeSeconds = Math.max(1, Math.min(10, simFluidDensity));
          const wastedEnergy = inputEnergy - usefulEnergy;
          const inputPower = inputEnergy / timeSeconds;
          const usefulPower = usefulEnergy / timeSeconds;
          const efficiency = inputEnergy === 0 ? 0 : (usefulEnergy / inputEnergy) * 100;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Process controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Input energy (J)<input className="mt-2 w-full" type="range" min="200" max="2000" step="100" value={inputEnergy} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Useful output (J)<input className="mt-2 w-full" type="range" min="0" max={inputEnergy} step="50" value={usefulEnergy} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Time taken (s)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={timeSeconds} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Rate versus usefulness</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Input power:</span> {formatSimulationNumber(inputPower, 0)} W</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Useful power:</span> {formatSimulationNumber(usefulPower, 0)} W</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Efficiency:</span> {formatSimulationNumber(efficiency, 0)}%</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Useful energy:</span> {formatSimulationNumber(usefulEnergy, 0)} J</div>
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Wasted energy:</span> {formatSimulationNumber(wastedEnergy, 0)} J</div>
                </div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Shorter time raises power. A bigger useful fraction raises efficiency. A process can be powerful without being efficient.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F3_L4" ? (() => {
          const incomingMass = Math.max(1, Math.min(8, simMetricMeters));
          const incomingSpeed = Math.max(1, Math.min(10, simVectorMagnitude));
          const secondMass = Math.max(1, Math.min(8, simVectorAngle));
          const totalMomentum = incomingMass * incomingSpeed;
          const totalMass = incomingMass + secondMass;
          const sharedSpeed = totalMomentum / totalMass;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Collision controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Incoming mass (kg)<input className="mt-2 w-full" type="range" min="1" max="8" step="0.5" value={incomingMass} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Incoming speed (m/s)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={incomingSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Second trolley mass (kg)<input className="mt-2 w-full" type="range" min="1" max="8" step="0.5" value={secondMass} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">System momentum</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Momentum before:</span> {formatSimulationNumber(totalMomentum, 1)} kg m/s</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Shared final speed:</span> {formatSimulationNumber(sharedSpeed, 2)} m/s</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Momentum after:</span> {formatSimulationNumber(totalMass * sharedSpeed, 1)} kg m/s</div>
                </div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">The total momentum of the two-trolley system stays the same. If more total mass shares the motion after the collision, the final speed must be smaller.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F3_L5" ? (() => {
          const momentumChange = Math.max(100, Math.min(1000, simDensityMass));
          const stoppingTime = Math.max(0.2, Math.min(1.5, simFluidDensity));
          const longerTime = Math.min(3, stoppingTime * 2);
          const averageForce = momentumChange / stoppingTime;
          const longerStopForce = momentumChange / longerTime;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Impulse controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Momentum change (kg m/s)<input className="mt-2 w-full" type="range" min="100" max="1000" step="50" value={momentumChange} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Stopping time (s)<input className="mt-2 w-full" type="range" min="0.2" max="1.5" step="0.1" value={stoppingTime} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Force-time result</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Average force now:</span> {formatSimulationNumber(averageForce, 0)} N</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">If time doubled:</span> {formatSimulationNumber(longerStopForce, 0)} N</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Impulse:</span> {formatSimulationNumber(momentumChange, 0)} N s</div>
                </div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">The impulse stays equal to the momentum change. Spreading the same change over more time lowers the average force.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F3_L6" ? (() => {
          const vehicleMass = Math.max(800, Math.min(1800, simBias * 50));
          const speed = Math.max(5, Math.min(30, simSpread));
          const stoppingTime = Math.max(0.5, Math.min(2.5, simFluidDensity));
          const momentum = vehicleMass * speed;
          const kineticEnergy = 0.5 * vehicleMass * speed * speed;
          const averageForce = momentum / stoppingTime;
          const doubledTimeForce = momentum / (stoppingTime * 2);
          const doubledSpeedMomentum = vehicleMass * (speed * 2);
          const doubledSpeedKineticEnergy = kineticEnergy * 4;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Braking controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Vehicle mass (kg)<input className="mt-2 w-full" type="range" min="800" max="1800" step="100" value={vehicleMass} onChange={(e) => setSimBias(Number(e.target.value) / 50)} /></label>
                <label className="mt-4 block text-sm text-slate-700">Speed (m/s)<input className="mt-2 w-full" type="range" min="5" max="30" step="1" value={speed} onChange={(e) => setSimSpread(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Stopping time (s)<input className="mt-2 w-full" type="range" min="0.5" max="2.5" step="0.1" value={stoppingTime} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Safety comparison</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Momentum:</span> {formatSimulationNumber(momentum, 0)} kg m/s</div>
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Kinetic energy:</span> {formatSimulationNumber(kineticEnergy, 0)} J</div>
                  <div className="rounded-xl bg-rose-50 p-4 text-rose-800"><span className="font-medium text-rose-900">Average force:</span> {formatSimulationNumber(averageForce, 0)} N</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">If stopping time doubled:</span> {formatSimulationNumber(doubledTimeForce, 0)} N</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">If speed doubled:</span> momentum {formatSimulationNumber(doubledSpeedMomentum, 0)} kg m/s, kinetic energy {formatSimulationNumber(doubledSpeedKineticEnergy, 0)} J</div>
                </div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Longer stopping time lowers the force, but high speed is still much harder to manage because kinetic energy rises much faster than momentum.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L1" ? (() => {
          const chargeMoved = Math.max(4, Math.min(40, simDensityMass));
          const timeSeconds = Math.max(1, Math.min(10, simFluidDensity));
          const loopClosed = simBias >= 0.5;
          const current = loopClosed ? chargeMoved / timeSeconds : 0;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Flow-Grid controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Charge moved around the route (C)<input className="mt-2 w-full" type="range" min="4" max="40" step="2" value={chargeMoved} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Time window (s)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={timeSeconds} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSimBias(1)} className={"rounded-full border px-4 py-2 text-sm font-medium " + (loopClosed ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700")}>Closed route</button>
                  <button type="button" onClick={() => setSimBias(0)} className={"rounded-full border px-4 py-2 text-sm font-medium " + (!loopClosed ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700")}>Open route</button>
                </div>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Closed-loop checkpoints</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">At the source station:</span> {formatSimulationNumber(current, 1)} A</div>
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Before the device:</span> {formatSimulationNumber(current, 1)} A</div>
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">After the device:</span> {formatSimulationNumber(current, 1)} A</div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Flow-Grid reading:</span> {loopClosed ? "The packet stream rate is the same all around one complete route." : "Break the route anywhere and the packet stream stops everywhere."}</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Current is a whole-loop stream rate, not something the device uses up. The device transfers energy, but the circulating charge still passes every checkpoint in the same single path.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L2" ? (() => {
          const chargeMoved = Math.max(1, Math.min(8, simDensityMass));
          const sourceBoost = Math.max(1, Math.min(12, simDensityVolume));
          const totalEnergy = chargeMoved * sourceBoost;
          const doubledChargeEnergy = sourceBoost * chargeMoved * 2;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Source-station controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Energy boost per coulomb (V)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={sourceBoost} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Charge moved (C)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={chargeMoved} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Energy per packet versus total energy</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">Potential difference:</span> {formatSimulationNumber(sourceBoost, 0)} V</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Energy transferred now:</span> {formatSimulationNumber(totalEnergy, 0)} J</div>
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">If charge doubled:</span> {formatSimulationNumber(doubledChargeEnergy, 0)} J</div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Flow-Grid reading:</span> The source station gives each packet the same energy boost, so voltage is energy per charge. More charge means more total energy, not more volts.</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Use V = E / Q after the pattern is clear: the push per packet stays the same even when the number of packets changes.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L3" ? (() => {
          const sourcePush = Math.max(2, Math.min(12, simDensityMass));
          const pathDifficulty = Math.max(1, Math.min(10, simDensityVolume));
          const current = sourcePush / pathDifficulty;
          const doubledPushCurrent = (sourcePush * 2) / pathDifficulty;
          const doubledDifficultyCurrent = sourcePush / (pathDifficulty * 2);
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Push and difficulty controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Driving force (V)<input className="mt-2 w-full" type="range" min="2" max="12" step="1" value={sourcePush} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Path difficulty (ohms)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={pathDifficulty} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Stream-rate comparison</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Current now:</span> {formatSimulationNumber(current, 2)} A</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">If push doubled:</span> {formatSimulationNumber(doubledPushCurrent, 2)} A</div>
                  <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">If difficulty doubled:</span> {formatSimulationNumber(doubledDifficultyCurrent, 2)} A</div>
                </div>
                <div className="mt-4 rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">Flow-Grid rule:</span> Stream rate = driving force / path difficulty. The equation I = V / R is just the formal circuit version of that behavior.</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">A steeper I-V line means more current for each volt, so it represents the lower-resistance route.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L4" ? (() => {
          const supplyVoltage = Math.max(6, Math.min(18, simDensityMass));
          const gateA = Math.max(1, Math.min(8, simDensityVolume));
          const gateB = Math.max(1, Math.min(8, simFluidDensity));
          const totalResistance = gateA + gateB;
          const current = supplyVoltage / totalResistance;
          const dropA = current * gateA;
          const dropB = current * gateB;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Single-route controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Supply voltage (V)<input className="mt-2 w-full" type="range" min="6" max="18" step="1" value={supplyVoltage} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Route difficulty A (ohms)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={gateA} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Route difficulty B (ohms)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={gateB} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Series-route outcome</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Total difficulty:</span> {formatSimulationNumber(totalResistance, 0)} ohms</div>
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Current everywhere:</span> {formatSimulationNumber(current, 2)} A</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Voltage share on A:</span> {formatSimulationNumber(dropA, 1)} V</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Voltage share on B:</span> {formatSimulationNumber(dropB, 1)} V</div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Flow-Grid reading:</span> One continuous route means one shared stream rate. Add difficulty anywhere and the whole network stream slows.</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Series circuits are one-route systems: the packet stream is common, while the source push is shared across the route sections.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L5" ? (() => {
          const supplyVoltage = Math.max(6, Math.min(18, simDensityMass));
          const branchAResistance = Math.max(2, Math.min(12, simDensityVolume));
          const branchBResistance = Math.max(2, Math.min(12, simFluidDensity));
          const branchACurrent = supplyVoltage / branchAResistance;
          const branchBCurrent = supplyVoltage / branchBResistance;
          const totalCurrent = branchACurrent + branchBCurrent;
          const equivalentResistance = totalCurrent === 0 ? 0 : supplyVoltage / totalCurrent;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Split-route controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Supply voltage (V)<input className="mt-2 w-full" type="range" min="6" max="18" step="1" value={supplyVoltage} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Branch A difficulty (ohms)<input className="mt-2 w-full" type="range" min="2" max="12" step="1" value={branchAResistance} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Branch B difficulty (ohms)<input className="mt-2 w-full" type="range" min="2" max="12" step="1" value={branchBResistance} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Parallel-route outcome</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">Voltage on each branch:</span> {formatSimulationNumber(supplyVoltage, 0)} V</div>
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Branch A current:</span> {formatSimulationNumber(branchACurrent, 2)} A</div>
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Branch B current:</span> {formatSimulationNumber(branchBCurrent, 2)} A</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Total current:</span> {formatSimulationNumber(totalCurrent, 2)} A</div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Flow-Grid reading:</span> Split routes keep the same push across each branch, divide the packet stream, and reduce the overall path difficulty to about {formatSimulationNumber(equivalentResistance, 2)} ohms.</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Adding another route makes it easier for packets to move through the system, so the total current rises even though the branch voltage stays the same.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey === "F4_L6" ? (() => {
          const supplyVoltage = Math.max(6, Math.min(24, simDensityMass));
          const current = Math.max(1, Math.min(12, simDensityVolume));
          const timeSeconds = Math.max(5, Math.min(60, simFluidDensity));
          const fuseLimit = Math.max(2, Math.min(10, simSpread));
          const power = supplyVoltage * current;
          const energyTransferred = power * timeSeconds;
          const safe = current <= fuseLimit;
          return (
            <div style={simulationPanelGridStyle}>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Power and safety controls</h4>
                <label className="mt-4 block text-sm text-slate-700">Supply voltage (V)<input className="mt-2 w-full" type="range" min="6" max="24" step="1" value={supplyVoltage} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Current in the route (A)<input className="mt-2 w-full" type="range" min="1" max="12" step="0.5" value={current} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Running time (s)<input className="mt-2 w-full" type="range" min="5" max="60" step="5" value={timeSeconds} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
                <label className="mt-4 block text-sm text-slate-700">Fuse limit (A)<input className="mt-2 w-full" type="range" min="2" max="10" step="0.5" value={fuseLimit} onChange={(e) => setSimSpread(Number(e.target.value))} /></label>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h4 className="text-lg font-semibold text-slate-900">Energy-transfer and protection view</h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Power:</span> {formatSimulationNumber(power, 0)} W</div>
                  <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Energy in this run:</span> {formatSimulationNumber(energyTransferred, 0)} J</div>
                  <div className="rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">Fuse limit:</span> {formatSimulationNumber(fuseLimit, 1)} A</div>
                  <div className={"rounded-xl p-4 " + (safe ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}><span className={"font-medium " + (safe ? "text-emerald-900" : "text-rose-900")}>Protection gate:</span> {safe ? "safe" : "trips"}</div>
                </div>
                <div className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Flow-Grid reading:</span> Power tells how quickly energized packets transfer energy through the route. If the stream grows too large, the safety gate must cut the route before the wires overheat.</div>
                <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">Use P = VI for energy each second, then E = Pt for total energy over time. Safety depends on interrupting excessive current, not on allowing the stream to keep climbing.</div>
              </div>
            </div>
          );
        })() : simulationLessonKey.startsWith("M1_") ? (
          <M1SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M2_") ? (
          <M2SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M3_") ? (
          <M3SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M4_") ? (
          <M4SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M5_") ? (
          <M5SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M6_") ? (
          <M6SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M7_") ? (
          <M7SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M8_") ? (
          <M8SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("F5_") ? (
          <F5SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey === "A1_L1" ? (
          <A1SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
          />
        ) : simulationLessonKey.startsWith("M9_") ? (
          <M9SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M10_") ? (
          <M10SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M11_") ? (
          <M11SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M12_") ? (
          <M12SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M13_") ? (
          <M13SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("M14_") ? (
          <M14SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : simulationLessonKey.startsWith("A6_") ||
          simulationLessonKey.startsWith("A7_") ||
          simulationLessonKey.startsWith("A8_") ||
          simulationLessonKey.startsWith("A9_") ||
          simulationLessonKey.startsWith("A10_") ||
          simulationLessonKey.startsWith("A11_") ? (
          <A6ToA11SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
            simDensityMass={simDensityMass}
            setSimDensityMass={setSimDensityMass}
            simDensityVolume={simDensityVolume}
            setSimDensityVolume={setSimDensityVolume}
            simFluidDensity={simFluidDensity}
            setSimFluidDensity={setSimFluidDensity}
            simBias={simBias}
            setSimBias={setSimBias}
            simSpread={simSpread}
            setSimSpread={setSimSpread}
            formatSimulationNumber={formatSimulationNumber}
          />
        ) : (
          <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the task above to test the idea with a few examples before you continue.</div>
        )}

        <PrimaryButton
          onClick={() =>
            void sendEvent("simulation_completed", {
              from_stage: "simulation",
            })
          }
          disabled={isSubmitting}
        >
          {payload.completion_text ?? "I have finished this activity"}
        </PrimaryButton>
      </div>
    );
  };

  const renderReflection = () => {
    const payload = runner.stage_payload as ReflectionStagePayload;
    const reflectionLessonKey = runnerLessonKey(lessonId || runner.lesson_id);
    const reflectionWordCount = reflectionText.trim()
      ? reflectionText.trim().split(/\s+/).length
      : 0;
    const defaultReflectionCards = [
      {
        title: "Say the main idea",
        text: payload.guidance?.[0] || "State the key idea in one clear sentence first.",
        starter: "The main idea is that ",
      },
      {
        title: "Give an example",
        text: payload.guidance?.[1] || "Use one example that would help a classmate see the idea.",
        starter: "For example, ",
      },
      {
        title: "Warn about a mistake",
        text: payload.guidance?.[2] || "Point out one mistake or misunderstanding to avoid.",
        starter: "A common mistake is to think that ",
      },
    ];
    const reflectionMission =
      reflectionLessonKey === "F1_L3"
        ? {
            badge: "Lab Coach Challenge",
            intro:
              "A classmate measured the same object with different instruments and got confusing results. Coach them so they know which readings to trust.",
            placeholder:
              "Teach a classmate how tool choice, repeated readings, and zero error affect how much you trust a measurement.",
            cards: [
              {
                title: "Choose the right tool",
                text: "Explain why finer divisions let a tool show more detail and smaller uncertainty.",
                starter:
                  "A finer instrument has smaller divisions, so ",
              },
              {
                title: "Use repeated readings",
                text: "Show how repeated measurements reveal random scatter and improve trust.",
                starter: "Repeated readings matter because ",
              },
              {
                title: "Check the zero first",
                text: "Explain what happens if the instrument starts with a zero error.",
                starter: "If the zero is shifted, then ",
              },
            ],
          }
        : {
            badge: "Teach It Like A Coach",
            intro:
              "Pretend a classmate missed this mission. Give them a short explanation they would actually understand.",
            placeholder:
              "Explain the idea clearly in your own words, as if you were helping a classmate catch up.",
            cards: defaultReflectionCards,
          };
    const reflectionMilestones = [
      { label: "Started", done: reflectionWordCount >= 1 },
      { label: "Clear idea", done: reflectionWordCount >= 25 },
      { label: "Strong detail", done: reflectionWordCount >= 45 },
    ];
    const addReflectionStarter = (starter: string) => {
      setReflectionText((current) =>
        current.trim() ? `${current.trim()}\n\n${starter}` : starter
      );
      requestAnimationFrame(() => {
        reflectionTextareaRef.current?.focus();
      });
    };

    if (payload.submitted) {
      return (
        <div className="space-y-4">
          <div className="rounded-[28px] border border-emerald-200 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.98))] p-6 shadow-sm">
            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Explanation saved
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Good work
            </h3>
            <p className="mt-2 text-slate-700">
              Your explanation is ready. Next comes the final mastery check.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h4 className="font-semibold text-slate-900">Your response</h4>
            <p className="mt-3 whitespace-pre-line text-slate-700">
              {payload.learner_response || reflectionText}
            </p>
          </div>

          <PrimaryButton
            onClick={() =>
              void sendEvent("reflection_submitted", {
                from_stage: "reflection",
                acknowledged: true,
              })
            }
            disabled={isSubmitting}
          >
            Continue to the final mastery check
          </PrimaryButton>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[28px] border border-sky-200 bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.72),_rgba(255,255,255,0.96)_50%),linear-gradient(135deg,rgba(255,247,237,0.94),rgba(239,246,255,0.94))] p-5 shadow-sm md:p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                {reflectionMission.badge}
              </span>
              {payload.title ? (
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                  {payload.title}
                </h3>
              ) : null}
              <p className="mt-3 text-base leading-7 text-slate-700">
                {payload.prompt}
              </p>
              <div className="mt-4 max-w-3xl rounded-2xl bg-white/85 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-sky-100">
                {reflectionMission.intro}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/90 bg-white/92 p-4 shadow-sm xl:w-[320px] xl:justify-self-end">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                Coach meter
              </p>
              <p className="mt-3 text-3xl font-semibold">{reflectionWordCount}</p>
              <p className="text-sm text-slate-600">words written</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {reflectionMilestones.map((milestone) => (
                  <div
                    key={milestone.label}
                    className={`rounded-full px-3 py-2 text-sm ${
                      milestone.done
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {milestone.done ? "Unlocked" : "Next"}: {milestone.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reflectionMission.cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => addReflectionStarter(card.starter)}
                className="rounded-[24px] border border-white/90 bg-white/88 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                  Idea card
                </span>
                <h4 className="mt-3 text-lg font-semibold text-slate-900">
                  {card.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {card.text}
                </p>
                <p className="mt-4 text-sm font-medium text-sky-700">
                  Tap to add a starter
                </p>
              </button>
            ))}
          </div>
        </div>

        {payload.visual_check ? (
          <div className="rounded-[28px] border bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
              <div>
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
                  Graph check
                </span>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  {payload.visual_check.title}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {payload.visual_check.prompt}
                </p>
                {payload.visual_check.callouts?.length ? (
                  <div className="mt-4 grid gap-3">
                    {payload.visual_check.callouts.map((item) => (
                      <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              {payload.visual_check.image_url ? (
                <div className="overflow-hidden rounded-2xl border bg-slate-50 shadow-sm">
                  <img
                    src={payload.visual_check.image_url}
                    alt={payload.visual_check.title}
                    className="h-80 w-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(241,245,249,0.95),_rgba(255,255,255,1))] object-contain p-4 md:h-[24rem]"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {payload.guidance?.length ? (
          <div className="grid gap-3 md:grid-cols-3">
            {payload.guidance.map((item, index) => (
              <div
                key={item}
                className="rounded-[24px] border bg-white p-4 shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Strong answer {index + 1}
                </span>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="rounded-[28px] border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Build your explanation
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                Use the idea cards, then make the explanation sound like you.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Aim for 2 to 4 clear sentences
            </div>
          </div>
          <textarea
            ref={reflectionTextareaRef}
            className="mt-4 min-h-[180px] w-full rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,1))] p-4 text-base leading-7 text-slate-800 shadow-inner outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={reflectionMission.placeholder}
          />
        </div>

        <PrimaryButton
          onClick={() =>
            void sendEvent("reflection_submitted", {
              from_stage: "reflection",
              response_text: reflectionText,
            })
          }
          disabled={isSubmitting || !reflectionText.trim()}
        >
          Lock in my explanation
        </PrimaryButton>
      </div>
    );
  };

  const renderMastery = () => {
    const payload = runner.stage_payload as MasteryStagePayload;
    const hasAllAnswers = payload.questions.every((question) => Boolean((answers[question.id] ?? "").trim()));
    const masteryPercentForDisplay =
      typeof payload.result?.percent === "number"
        ? payload.result.percent
        : typeof runner.progress_summary?.latest_mastery_percent === "number"
          ? runner.progress_summary.latest_mastery_percent
          : null;

    if ((payload.submitted || runner.lesson_status === "completed") && typeof masteryPercentForDisplay === "number") {
      const threshold = payload.passing_percent ?? 80;
      const masteryPercent =
        typeof payload.result?.percent === "number"
          ? payload.result.percent
          : typeof runner.progress_summary?.latest_mastery_percent === "number"
            ? runner.progress_summary.latest_mastery_percent
            : null;
      const bestMasteryPercent =
        typeof runner.progress_summary?.best_mastery_percent === "number"
          ? runner.progress_summary.best_mastery_percent
          : null;
      const moduleMasteryPercent =
        typeof runner.progress_summary?.module_mastery_percent === "number"
          ? runner.progress_summary.module_mastery_percent
          : null;
      const passed =
        typeof payload.result?.passed === "boolean"
          ? payload.result.passed
          : typeof masteryPercent === "number"
            ? masteryPercent >= threshold
            : false;
      const isFinalModuleWrapUp =
        passed &&
        runner.lesson_status === "completed" &&
        !canGoNextLesson &&
        /_L6$/.test(runnerLessonKey(lessonId || runner.lesson_id));


      return (
        <div className="space-y-4">
          {isFinalModuleWrapUp ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">Congratulations on completing Lesson 6</h3>
              <p className="mt-2 text-slate-700">
                You finished the full module. Keep connecting each answer to the core ideas, using the right quantities and relationships, and explaining the physics clearly.
              </p>
            </div>
          ) : null}
          <div
            className={`rounded-2xl border p-5 ${
              passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
            }`}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              {passed ? "Lesson mastered" : "Almost there"}
            </h3>
            <p className="mt-2 text-slate-700">
              Your latest mastery score is {masteryPercent}%. The target for mastery is {threshold}%.
            </p>
            {typeof bestMasteryPercent === "number" && bestMasteryPercent !== masteryPercent ? (
              <p className="mt-2 text-sm text-slate-600">
                Best score so far: {bestMasteryPercent}%
              </p>
            ) : null}
            {typeof moduleMasteryPercent === "number" ? (
              <p className="mt-2 text-sm text-slate-600">
                Module mastery average: {moduleMasteryPercent}%
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {passed && canGoNextLesson && onGoNextLesson ? (
              <PrimaryButton onClick={onGoNextLesson} disabled={isSubmitting}>
                Continue to the next mission
              </PrimaryButton>
            ) : null}
            <SecondaryButton onClick={() => void restartMission()} disabled={isSubmitting}>
              Start this unit all over again
            </SecondaryButton>
          </div>
          {payload.feedback?.map((item, index) => (
            <FeedbackCard
              key={item.question_id}
              correct={item.is_correct}
              title={`Question ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
              body={masteryFeedbackBody(item, runner.lesson_title)}
            />
          ))}

          {passed ? null : (
            <>
              {payload.review_requested ? <ReviewReferences refs={payload.review_refs} /> : null}
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={() =>
                    void sendEvent("mastery_retest_requested", {
                      from_stage: "mastery",
                    })
                  }
                  disabled={isSubmitting}
                >
                  Try again with new questions
                </PrimaryButton>

                <SecondaryButton
                  onClick={() =>
                    void sendEvent("mastery_review_requested", {
                      from_stage: "mastery",
                    })
                  }
                  disabled={isSubmitting || payload.review_requested === true}
                >
                  {payload.review_requested ? `${runner.lesson_title} notes are below` : `Review ${runner.lesson_title} first`}
                </SecondaryButton>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-slate-700">
            {payload.instructions ?? "Answer the final questions carefully."}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {String(payload.question_count ?? payload.questions.length) + " questions. Aim for " + String(payload.passing_percent ?? 80) + "% to master this lesson."}
          </p>
        </div>

        {payload.questions.map((question) => (
          <QuestionBlock
            key={question.id}
            question={question}
            value={answers[question.id] ?? ""}
            onChange={setAnswer}
          />
        ))}

        <PrimaryButton
          onClick={() =>
            void sendEvent("mastery_submitted", {
              from_stage: "mastery",
              answers: answersRef.current,
              question_ids: payload.questions.map((question) => question.id),
            })
          }
          disabled={isSubmitting || !hasAllAnswers}
        >
          Submit final mastery check
        </PrimaryButton>
      </div>
    );
  };

  const renderStage = () => {
    switch (runner.active_stage) {
      case "diagnostic":
        return renderDiagnostic();
      case "scaffold":
        return renderScaffold();
      case "concept_gate":
        return renderConceptGate();
      case "simulation":
        return renderSimulation();
      case "reflection":
        return renderReflection();
      case "mastery":
        return renderMastery();
      default:
        return (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-700">This lesson stage is not available yet.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">

      <StageHeader
        eyebrow={runner.lesson_title}
        title={stageTitle}
        subtitle={stageSubtitle}
      />

      {showRestartAction ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-slate-800">{restartCopy}</p>
          <div className="mt-3">
            <SecondaryButton onClick={() => void restartMission()} disabled={isSubmitting}>
              Start this unit all over again
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      ) : null}

      {renderStage()}
    </div>
  );
}












