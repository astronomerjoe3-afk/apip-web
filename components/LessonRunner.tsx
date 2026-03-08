"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLessonRunner, postProgressEvent, restartLessonProgress } from "@/lib/lessonRunnerApi";

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
    mastery_percent?: number | null;
    concept_gate_passed?: boolean;
  };
  available_actions?: string[];
};

type LessonRunnerProps = {
  moduleId: string;
  lessonId: string;
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

export default function LessonRunner({ moduleId, lessonId }: LessonRunnerProps) {
  const [runner, setRunner] = useState<RunnerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reflectionText, setReflectionText] = useState("");

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

  const restartMission = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await restartLessonProgress(moduleId, lessonId);
      setAnswers({});
      setReflectionText("");
      await loadRunner();
    } catch (err) {
      console.error(err);
      setError("We could not restart this mission right now.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lessonId, loadRunner, moduleId]);

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
    return runner ? runner.lesson_status !== "not_started" && runner.active_stage !== "diagnostic" : false;
  }, [runner]);

  const restartCopy = useMemo(() => {
    if (!runner) return "";
    return runner.active_stage === "mastery"
      ? "This mission already has saved progress. If you want to learn it from the beginning, restart it now."
      : "If you want to replay this mission from the beginning, you can restart it now.";
  }, [runner]);

  const stageSubtitle = useMemo(() => {
    if (!runner) return "";
    switch (runner.active_stage) {
      case "diagnostic":
        return "Answer a few short questions so this lesson can focus on what you need most.";
      case "scaffold":
        return "This guided explanation helps you repair mistakes and understand the concept clearly.";
      case "concept_gate":
        return "Let's make sure the key idea is clear before moving on.";
      case "simulation":
        return "Explore the idea and notice what changes when you test it.";
      case "reflection":
        return "Put the idea into your own words so it becomes easier to remember and use.";
      case "mastery":
        return "This final check shows whether you have understood this lesson well enough to move forward.";
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
    const activeQuestion = payload.questions[0]; const hasAnswer = activeQuestion ? Boolean(answers[activeQuestion.id]?.trim()) : false;
    if (payload.submitted && payload.feedback?.length) {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Let's review your answers
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
              body={item.explanation}
              extra={
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Correct answer:</span>{" "}
                    {Array.isArray(item.correct_answer)
                      ? item.correct_answer.join(", ")
                      : item.correct_answer}
                  </p>
                  {item.teaching_focus ? (
                    <p>
                      <span className="font-medium">Focus:</span> {item.teaching_focus}
                    </p>
                  ) : null}






                </div>
              }
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
          <FeedbackCard correct={payload.recent_feedback.is_correct} title={payload.recent_feedback.is_correct ? "That answer is correct" : "Not quite yet"} body={payload.recent_feedback.explanation} extra={<p><span className="font-medium">Correct answer:</span> {Array.isArray(payload.recent_feedback.correct_answer) ? payload.recent_feedback.correct_answer.join(", ") : payload.recent_feedback.correct_answer}</p>} />
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
          {payload.action_label ?? "Check my answer"}
        </PrimaryButton>
      </div>
    );
  };

  const renderScaffold = () => {
    const payload = runner.stage_payload as ScaffoldStagePayload;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {payload.title ? (
            <h3 className="text-lg font-semibold text-slate-900">{payload.title}</h3>
          ) : null}
          {payload.intro ? <p className="mt-2 text-slate-700">{payload.intro}</p> : null}

          {payload.teaching_focus?.length ? (
            <div className="mt-4">
              <h4 className="font-semibold text-slate-900">What to pay attention to</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
                {payload.teaching_focus.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {payload.sections.map((section, index) => (
          <div key={`${section.heading}-${index}`} className="rounded-2xl border bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900">{section.heading}</h4>
            <p className="mt-2 text-slate-700 whitespace-pre-line">{section.body}</p>

            {section.analogy ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Analogy bridge</p>
                <p className="mt-2 text-slate-700">{section.analogy}</p>
              </div>
            ) : null}

            {section.worked_example ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">Worked example</p>
                <p className="mt-2 text-slate-700">{section.worked_example.prompt}</p>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-700">
                  {section.worked_example.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="mt-3 text-slate-800">
                  <span className="font-medium">Answer:</span>{" "}
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

        <ReviewReferences refs={payload.review_refs} />

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
        ) : (
          <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
            The interactive activity will appear here when it is ready.
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

    if (payload.submitted && payload.result) {
      const passed = payload.result.passed;
      const threshold = payload.passing_percent ?? 80;

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
              You scored {payload.result.percent}%. The target for mastery is {threshold}%.
            </p>
          </div>

          {payload.feedback?.map((item, index) => (
            <FeedbackCard
              key={item.question_id}
              correct={item.is_correct}
              title={`Question ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
              body={item.explanation ?? "Review this idea carefully before trying again."}
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
                  {payload.review_requested ? "Review notes are below" : "Review the lesson first"}
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
            {payload.instructions ??
              `Answer this final set of questions. This part decides whether you have mastered the lesson.`}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            {`This check usually contains ${payload.min_questions ?? 5} to ${
              payload.max_questions ?? 10
            } questions. You need ${payload.passing_percent ?? 80}% to master this lesson.`}
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
          disabled={isSubmitting}
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
      <div className="rounded-2xl border bg-slate-50 p-4">
        <p className="text-sm text-slate-500">{runner.lesson_title}</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{stageTitle}</p>
      </div>

      <StageHeader
        eyebrow="Physics lesson"
        title={stageTitle}
        subtitle={stageSubtitle}
      />

      {showRestartAction ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-slate-800">{restartCopy}</p>
          <div className="mt-3">
            <SecondaryButton onClick={() => void restartMission()} disabled={isSubmitting}>
              Start this mission from the beginning
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
