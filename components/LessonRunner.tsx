"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessonRunner, postProgressEvent, restartLessonProgress } from "@/lib/lessonRunnerApi";
import { feedbackAnswer, feedbackBody } from "./lessonRunnerFeedback";

type StageName =
  | "diagnostic"
  | "scaffold"
  | "concept_gate"
  | "simulation"
  | "reflection"
  | "mastery";

type LessonStatus = "not_started" | "in_progress" | "completed";

type QuestionOption = {
  value: string;
  label: string;
};

type Question = {
  id: string;
  prompt: string;
  type?: "multiple_choice" | "short_answer" | "true_false";
  options?: QuestionOption[];
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
  kind?: "visual" | "video";
  title: string;
  caption: string;
  highlights?: string[];
  image_url?: string;
  embed_url?: string;
};

type ScaffoldSection = {
  heading: string;
  body: string;
  analogy?: string;
  worked_example?: {
    prompt: string;
    steps: string[];
    answer: string;
  };
  check_for_understanding?: string;
};

type ScaffoldStagePayload = {
  title?: string;
  intro?: string;
  teaching_focus?: string[];
  misconception_targets?: string[];
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
  task_prompt?: string;
  completion_text?: string;
};

type ReflectionStagePayload = {
  title?: string;
  prompt: string;
  guidance?: string[];
  submitted?: boolean;
  learner_response?: string;
};

type MasteryFeedbackItem = {
  question_id: string;
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
  previousLessonLabel?: string;

};

type ApiEventPayload = Record<string, unknown>;

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
      className={`rounded-2xl border p-4 ${
        correct ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-slate-700">{body}</p>
      {extra ? <div className="mt-3 text-sm text-slate-600">{extra}</div> : null}
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
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="mb-4 font-medium text-slate-900">{question.prompt}</p>

      {question.type === "short_answer" ? (
        <textarea
          className="min-h-[96px] w-full rounded-xl border p-3"
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
                <span>{option.label}</span>
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

  if (!hasPlaceholder) {
    return explanation;
  }

  if (item.is_correct) {
    return "Correct. You used the lesson idea correctly.";
  }

  return `Review ${lessonTitle} again, especially the key ideas from this lesson.`;
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
  const [simTool, setSimTool] = useState<"ruler" | "caliper" | "micrometer">("ruler");
  const [simLength, setSimLength] = useState(3.276);
  const [simZeroError, setSimZeroError] = useState(0.08);

  const [simMetricMeters, setSimMetricMeters] = useState(0.35);
  const [simVectorMagnitude, setSimVectorMagnitude] = useState(6);
  const [simVectorAngle, setSimVectorAngle] = useState(35);
  const [simSigSample, setSimSigSample] = useState("12.349");
  const [simSigFigures, setSimSigFigures] = useState(3);
  const [simDensityMass, setSimDensityMass] = useState(180);
  const [simDensityVolume, setSimDensityVolume] = useState(120);
  const [simFluidDensity, setSimFluidDensity] = useState(1);
  const [simBias, setSimBias] = useState(18);
  const [simSpread, setSimSpread] = useState(24);
  void previousLessonLabel;

  const loadRunner = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getLessonRunner(moduleId, lessonId);
      setRunner(data as RunnerResponse);

      const payload = (data as RunnerResponse).stage_payload;

      if ((data as RunnerResponse).active_stage === "reflection") {
        const reflectionPayload = payload as ReflectionStagePayload;
        setReflectionText(reflectionPayload.learner_response ?? "");
      } else {
        setReflectionText("");
      }

      if (
        (data as RunnerResponse).active_stage === "diagnostic" ||
        (data as RunnerResponse).active_stage === "concept_gate" ||
        (data as RunnerResponse).active_stage === "mastery"
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
  }, [moduleId, lessonId]);

  useEffect(() => {
    void loadRunner();
  }, [loadRunner]);

  useEffect(() => {
    setSimTool("ruler");
    setSimLength(3.276);
    setSimZeroError(0.08);
    setSimMetricMeters(0.35);
    setSimVectorMagnitude(6);
    setSimVectorAngle(35);
    setSimSigSample("12.349");
    setSimSigFigures(3);
    setSimBias(18);
    setSimSpread(24);
    setSimDensityMass(180);
    setSimDensityVolume(120);
    setSimFluidDensity(1);
  }, [lessonId, moduleId]);

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
  }, [runner]);

  const showRestartAction = useMemo(() => {
    if (!runner) return false;
    return runner.lesson_status !== "not_started" && runner.active_stage !== "diagnostic";
  }, [runner]);

  const restartCopy = useMemo(() => {
    if (!runner) return "";
    return runner.active_stage === "mastery"
      ? "Saved progress found. Restart if you want to replay this mission from the beginning."
      : "Restart to take this mission again.";
  }, [runner]);

  const stageSubtitle = useMemo(() => {
    if (!runner) return "";
    switch (runner.active_stage) {
      case "diagnostic":
        return "A few quick questions first.";
      case "scaffold":
        return "Study the key ideas for this sub-unit.";
      case "concept_gate":
        return "One quick check before the activity.";
      case "simulation":
        return "Test the idea.";
      case "reflection":
        return "Explain the idea in your own words.";
      case "mastery":
        return "This check decides mastery.";
      default:
        return "";
    }
  }, [runner]);

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
              <span className="font-medium">Key idea:</span> {item.teaching_focus}
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

    return (
      <div className="space-y-6">
        <div className="lesson-stage-hero rounded-2xl border p-6 shadow-sm">
          {payload.intro ? <p className="lesson-stage-subtitle text-slate-700">{payload.intro}</p> : null}

          {payload.teaching_focus?.length ? (
            <div className={`${payload.intro ? "mt-4" : ""} rounded-2xl bg-slate-50 p-5`}>
              <p className="font-medium text-slate-900">Core concepts in this sub-unit</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                {payload.teaching_focus.slice(0, 6).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {payload.reference_tables?.length ? (
          <div className="lesson-display-deck">
            {payload.reference_tables.map((table) => (
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
            ))}
          </div>
        ) : null}

        {payload.media_cards?.length ? (
          <div className="lesson-display-deck">
            {payload.media_cards.map((card) => {
              const imageUrl = card.image_url || "";
              const shouldShowImage = imageUrl ? !seenMediaImageUrls.has(imageUrl) : false;
              if (shouldShowImage) seenMediaImageUrls.add(imageUrl);

              return (
              <div key={`${card.kind ?? "visual"}-${card.title}`} className="lesson-display-slide rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {card.kind === "video" ? "Video support" : shouldShowImage ? "Visual support" : "Concept support"}
                </span>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h4>
                <p className="mt-2 text-slate-700">{card.caption}</p>

                {card.embed_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <iframe src={card.embed_url} title={card.title} className="h-64 w-full" allowFullScreen />
                  </div>
                ) : shouldShowImage ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <img
                      src={imageUrl}
                      alt={card.title}
                      className="h-64 w-full bg-slate-50 object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : card.kind !== "video" ? (
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
                        {card.highlights?.length ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {card.highlights.slice(0, 3).map((item) => (
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

                {card.highlights?.length ? (
                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {card.highlights.map((item) => (
                      <li key={item} className="rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-sky-100">{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
              );
            })}
          </div>
        ) : null}

        <div className="lesson-display-deck">
          {payload.sections.map((section, index) => (
            <div key={`${section.heading}-${index}`} className="lesson-display-slide rounded-2xl border bg-white p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">{section.heading}</h4>
            {section.body && !section.worked_example ? (
                <p className="mt-3 whitespace-pre-line text-slate-700">{section.body}</p>
            ) : null}

            {section.analogy ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="font-medium text-slate-900">Analogy bridge</p>
                <p className="mt-2 text-slate-700">{section.analogy}</p>
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
              </div>
            ) : null}

            {section.check_for_understanding ? (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-slate-800">
                <span className="font-medium">Think about this:</span>{" "}
                {section.check_for_understanding}
              </div>
            ) : null}
          </div>
          ))}
        </div>

        <PrimaryButton
          onClick={() =>
            void sendEvent("scaffold_continue", {
              from_stage: "scaffold",
            })
          }
          disabled={isSubmitting}
        >
          Continue to the quick concept check
        </PrimaryButton>
      </div>
    );
  };

  const renderConceptGate = () => {
    const payload = runner.stage_payload as ConceptGateStagePayload;
    const activeQuestion = payload.questions[0]; const hasAnswer = activeQuestion ? Boolean(answers[activeQuestion.id]?.trim()) : false;

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
                Continue to the activity
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
              answers,
            })
          }
          disabled={isSubmitting}
        >
          Check this idea
        </PrimaryButton>
      </div>
    );
  };

  const renderSimulation = () => {
    const payload = runner.stage_payload as SimulationStagePayload;
    const simulationLessonKey = runner.lesson_id.replace(/-/g, "_").toUpperCase();
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
    const zeroIndicatorX = 130 + (simZeroError / 0.2) * 56;

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
    const sigFigureCount = Math.max(1, Math.min(5, simSigFigures));
    const sigNumericValue = Number(simSigSample);
    const sigRoundedDisplay = Number.isFinite(sigNumericValue) ? sigNumericValue.toPrecision(sigFigureCount) : "";
    const sigDigits = simSigSample.replace(/[^0-9]/g, "").replace(/^0+/, "");
    const sigNextDigit = sigDigits[sigFigureCount] || "none";

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
        </div>

        {payload.embed_url ? (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <iframe
              src={payload.embed_url}
              title="Simulation"
              className="h-[480px] w-full"
            />
          </div>
        ) : simulationLessonKey === "F1_L3" ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Tool explorer</h4>
              <p className="mt-2 text-slate-700">Compare the same object across tools and notice how the reading detail changes.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {(["ruler", "caliper", "micrometer"] as const).map((toolName) => (
                  <button
                    key={toolName}
                    type="button"
                    onClick={() => setSimTool(toolName)}
                    className={`rounded-xl border px-4 py-2 text-sm ${simTool === toolName ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}
                  >
                    {toolName === "ruler" ? "Ruler" : toolName === "caliper" ? "Caliper" : "Micrometer"}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm text-slate-700">
                Object length (cm)
                <input className="mt-2 w-full" type="range" min="1" max="8" step="0.001" value={simLength} onChange={(e) => setSimLength(Number(e.target.value))} />
              </label>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Reported reading:</span> {formatSimulationNumber(simulationReading)} cm</div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Estimated uncertainty:</span> {simulationToolConfig.uncertainty}</div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Current tool:</span> {simulationToolConfig.label}</div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Scale detail:</span> {toolDivisionLabel}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Repeated readings</h4>
              <p className="mt-2 text-slate-700">Switch tools and watch the cluster tighten as the tool gets finer.</p>
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
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">
                Finer tools usually give a tighter cluster of readings, which makes the result more trustworthy.
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
                <line x1="92" y1="92" x2={92 + Math.cos((simVectorAngle * Math.PI) / 180) * (22 + simVectorMagnitude * 10)} y2={92 - Math.sin((simVectorAngle * Math.PI) / 180) * (22 + simVectorMagnitude * 10)} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
              </svg>
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">Direction rotates the arrow, but a scalar would only keep the size value.</div>
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
    const reflectionLessonKey = runner.lesson_id.replace(/-/g, "_").toUpperCase();
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
        <div className="overflow-hidden rounded-[28px] border border-sky-200 bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.72),_rgba(255,255,255,0.96)_50%),linear-gradient(135deg,rgba(255,247,237,0.94),rgba(239,246,255,0.94))] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
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
              <div className="mt-4 max-w-3xl rounded-2xl bg-white/85 px-4 py-4 text-sm leading-6 text-slate-700 shadow-sm ring-1 ring-sky-100">
                {reflectionMission.intro}
              </div>
            </div>

            <div className="min-w-[220px] rounded-[24px] bg-slate-950 px-5 py-4 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
                Coach meter
              </p>
              <p className="mt-3 text-3xl font-semibold">{reflectionWordCount}</p>
              <p className="text-sm text-slate-300">words written</p>
              <div className="mt-4 space-y-2">
                {reflectionMilestones.map((milestone) => (
                  <div
                    key={milestone.label}
                    className={`rounded-full px-3 py-2 text-sm ${
                      milestone.done
                        ? "bg-emerald-500/20 text-emerald-100"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {milestone.done ? "Unlocked" : "Next"}: {milestone.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {reflectionMission.cards.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => addReflectionStarter(card.starter)}
                className="rounded-[24px] border border-white/90 bg-white/88 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
            className="mt-4 min-h-[220px] w-full rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,1))] p-4 text-base leading-7 text-slate-800 shadow-inner outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
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

      return (
        <div className="space-y-4">
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
              answers,
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



