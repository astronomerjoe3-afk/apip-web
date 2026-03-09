"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
      <p className="mb-2 text-sm font-medium text-slate-500">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
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
      className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="space-y-2">
          {(question.options ?? []).map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border p-3"
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(question.id, e.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
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
  const [reflectionText, setReflectionText] = useState("");
  const [resumeChoiceMade, setResumeChoiceMade] = useState(false);
  const [simTool, setSimTool] = useState<"ruler" | "caliper" | "micrometer">("ruler");
  const [simLength, setSimLength] = useState(3.276);

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
    setResumeChoiceMade(false);
  }, [lessonId, moduleId]);

  const restartMission = useCallback(async (fromBeginning = false) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (fromBeginning && onRestartFromBeginning) {
        await onRestartFromBeginning();
      } else {
        await restartLessonProgress(moduleId, lessonId);
        setAnswers({});
        setReflectionText("");
        setResumeChoiceMade(false);
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
        setError("Something went wrong while saving your progress.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [lessonId, loadRunner, moduleId]
  );

  const setAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const showResumeChoice = useMemo(() => {
    if (!runner || resumeChoiceMade) return false;
    const payload = runner.stage_payload as Partial<MasteryStagePayload>;
    return runner.active_stage === "mastery" && runner.lesson_status !== "not_started" && payload.submitted !== true;
  }, [resumeChoiceMade, runner]);

  const stageTitle = useMemo(() => {
    if (!runner) return "";
    if (showResumeChoice) return "Choose how to continue";
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
  }, [runner, showResumeChoice]);

  const showRestartAction = useMemo(() => {
    if (!runner || showResumeChoice) return false;
    return runner.lesson_status !== "not_started" && runner.active_stage !== "diagnostic";
  }, [runner, showResumeChoice]);

  const restartCopy = useMemo(() => {
    if (!runner) return "";
    return runner.active_stage === "mastery"
      ? "Saved progress found. Restart if you want to replay this mission from the beginning."
      : "Restart to take this mission again.";
  }, [runner]);

  const stageSubtitle = useMemo(() => {
    if (!runner) return "";
    if (showResumeChoice) {
      return "Continue where you stopped or start this mission again.";
    }
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
  }, [runner, showResumeChoice]);

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
    const activeQuestion = payload.questions[0]; const hasAnswer = activeQuestion ? Boolean(answers[activeQuestion.id]?.trim()) : false;
    if (payload.submitted && payload.feedback?.length) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Diagnostic review
            </h3>
            <p className="mt-2 text-slate-700">
              See what was right and what to fix.
            </p>
          </div>

          {payload.feedback.map((item, index) => (
            <FeedbackCard
              key={item.question_id}
              correct={item.is_correct}
              title={`Question ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
              body={feedbackBody(item)}
              extra={item.is_correct ? undefined : (<p><span className="font-medium">Correct answer:</span> {feedbackAnswer(item.correct_answer)}</p>)}
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
          <FeedbackCard correct={payload.recent_feedback.is_correct} title={payload.recent_feedback.is_correct ? "Correct" : "Wrong"} body={feedbackBody(payload.recent_feedback)} extra={payload.recent_feedback.is_correct ? undefined : <p><span className="font-medium">Correct answer:</span> {feedbackAnswer(payload.recent_feedback.correct_answer)}</p>} />
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
          onClick={() =>
            void sendEvent("diagnostic_submitted", {
              from_stage: "diagnostic",
              answers,
            })
          }
          disabled={isSubmitting || !hasAnswer}
        >
          {payload.action_label ?? "Check answer"}
        </PrimaryButton>
      </div>
    );
  };

  const renderScaffold = () => {
    const payload = runner.stage_payload as ScaffoldStagePayload;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {payload.intro ? <p className="text-slate-700">{payload.intro}</p> : null}

          {payload.teaching_focus?.length ? (
            <div className={`${payload.intro ? "mt-4" : ""} rounded-xl bg-slate-50 p-4`}>
              <p className="font-medium text-slate-900">Core concepts in this sub-unit</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                {payload.teaching_focus.slice(0, 6).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {payload.reference_tables?.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {payload.reference_tables.map((table) => (
              <div key={table.title} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
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
          <div className="grid gap-4 md:grid-cols-2">
            {payload.media_cards.map((card) => (
              <div key={`${card.kind ?? "visual"}-${card.title}`} className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  {card.kind === "video" ? "Video support" : "Visual support"}
                </span>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h4>
                <p className="mt-2 text-slate-700">{card.caption}</p>

                {card.embed_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <iframe src={card.embed_url} title={card.title} className="h-64 w-full" allowFullScreen />
                  </div>
                ) : card.image_url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="h-64 w-full bg-slate-50 object-contain"
                      loading="lazy"
                    />
                  </div>
                ) : card.kind !== "video" ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
                    <svg viewBox="0 0 520 240" className="h-64 w-full" role="img" aria-label={card.title}>
                      <rect width="520" height="240" rx="24" fill="#f8fbff" />
                      <rect x="24" y="24" width="472" height="192" rx="24" fill="#ffffff" opacity="0.94" />
                      <circle cx="132" cy="112" r="52" fill="#dbeafe" />
                      <path d="M102 142 C128 92 154 92 180 142" fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                      <path d="M192 98 L222 82 L216 116" fill="#0f766e" />
                      <rect x="230" y="62" width="214" height="36" rx="18" fill="#eff6ff" />
                      <text x="246" y="85" fontSize="18" fontWeight="700" fill="#0f172a">{card.title}</text>
                      <text x="246" y="122" fontSize="15" fill="#475569">{card.caption}</text>
                      {card.highlights?.slice(0, 2).map((item, index) => (
                        <g key={item}>
                          <rect x="230" y={142 + index * 34} width="214" height="24" rx="12" fill="#f8fafc" stroke="#dbeafe" />
                          <text x="244" y={158 + index * 34} fontSize="13" fill="#334155">{item}</text>
                        </g>
                      ))}
                    </svg>
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
            ))}
          </div>
        ) : null}

        {payload.sections.map((section, index) => (
          <div key={`${section.heading}-${index}`} className="rounded-2xl border bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">{section.heading}</h4>
            {section.body && !section.worked_example ? (
              <p className="mt-2 whitespace-pre-line text-slate-700">{section.body}</p>
            ) : null}

            {section.analogy ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Analogy bridge</p>
                <p className="mt-2 text-slate-700">{section.analogy}</p>
              </div>
            ) : null}

            {section.worked_example ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Example</p>
                <p className="mt-2 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Question</p>
                <p className="mt-2 text-slate-700">{section.worked_example.prompt}</p>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Step-by-step solution</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-700">
                  {section.worked_example.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="mt-3 text-slate-800">
                  <span className="font-medium">Final answer:</span>{" "}
                  {section.worked_example.answer}
                </p>
              </div>
            ) : null}

            {section.check_for_understanding ? (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-slate-800">
                <span className="font-medium">Think about this:</span>{" "}
                {section.check_for_understanding}
              </div>
            ) : null}
          </div>
        ))}

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
    const simulationReading = Math.round(simLength / simulationToolConfig.step) * simulationToolConfig.step;
    const simulationRepeated = [-2, -1, 0, 1, 2].map((offset) =>
      (Math.round((simLength + offset * simulationToolConfig.spread) / simulationToolConfig.step) * simulationToolConfig.step)
        .toFixed(3)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*?)0+$/, "$1")
    );


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
              <h4 className="text-lg font-semibold text-slate-900">Instrument comparison</h4>
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
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Reported reading:</span> {simulationReading.toFixed(3).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")} cm</div>
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Estimated uncertainty:</span> {simulationToolConfig.uncertainty}</div>
            </div>
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-900">Repeated readings</h4>
              <div className="mt-4 grid gap-2 sm:grid-cols-5">
                {simulationRepeated.map((item, index) => (
                  <div key={`${item}-${index}`} className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm font-medium text-slate-800">
                    {item} cm
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-slate-700">
                Finer tools usually give a tighter cluster of readings, which makes the result more trustworthy.
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
            Use the task above to test the idea with a few examples before you continue.
          </div>
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

    if (payload.submitted) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-green-50 p-5">
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
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {payload.title ? (
            <h3 className="text-lg font-semibold text-slate-900">{payload.title}</h3>
          ) : null}
          <p className="mt-2 text-slate-700">{payload.prompt}</p>

          {payload.guidance?.length ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
              {payload.guidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <textarea
            className="min-h-[180px] w-full rounded-xl border p-3"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Explain the idea in your own words"
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
          Submit my explanation
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

      {!showResumeChoice ? (
        <StageHeader
          eyebrow={runner.lesson_title}
          title={stageTitle}
          subtitle={stageSubtitle}
        />
      ) : null}

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

      {showResumeChoice ? (
        <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">Saved progress found</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Continue this unit or start again</h3>
          <p className="mt-3 max-w-3xl text-slate-700">Continue from where you stopped or start this unit all over again.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => setResumeChoiceMade(true)} disabled={isSubmitting}>Continue from where I stopped</PrimaryButton>
            <SecondaryButton onClick={() => void restartMission()} disabled={isSubmitting}>Start this unit all over again</SecondaryButton>
          </div>
        </div>
      ) : renderStage()}
    </div>
  );
}
