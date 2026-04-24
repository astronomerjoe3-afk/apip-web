export type DiagnosticFeedbackLike = {
  explanation: string;
  correct_answer: string | string[];
  is_correct: boolean;
  teaching_focus?: string;
  misconception_tag?: string;
};

const GENERIC_RETRY_EXPLANATIONS = new Set([
  "review the lesson idea and try again",
  "review the lesson idea and try again.",
  "review this idea carefully before trying again",
  "review this idea carefully before trying again.",
]);

export function feedbackAnswer(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(", ") : answer;
}

export function feedbackBody(item: DiagnosticFeedbackLike): string {
  const normalized = item.explanation.trim().toLowerCase();
  if (!GENERIC_RETRY_EXPLANATIONS.has(normalized)) {
    return item.explanation;
  }

  if (item.is_correct) {
    const answerText = feedbackAnswer(item.correct_answer);
    if (item.teaching_focus) {
      return `Correct. ${answerText} is right because ${item.teaching_focus.charAt(0).toLowerCase()}${item.teaching_focus.slice(1)}`;

    }
    return `Correct. ${answerText} is right.`;
  }

  return item.teaching_focus || item.explanation;
}
