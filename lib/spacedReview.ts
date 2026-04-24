type ReviewTimingSummary = {
  label: string;
  bucket: "due_now" | "today" | "tomorrow" | "this_week" | "later" | "none";
};

function parseUtcMillis(value?: string | null): number {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function describeReviewTiming(reviewDue: boolean, reviewDueUtc?: string | null): ReviewTimingSummary {
  const dueMs = parseUtcMillis(reviewDueUtc);
  const nowMs = Date.now();

  if (reviewDue || (dueMs > 0 && dueMs <= nowMs)) {
    return { label: "Due now", bucket: "due_now" };
  }

  if (!dueMs) {
    return { label: "No review scheduled yet", bucket: "none" };
  }

  const hoursUntilDue = (dueMs - nowMs) / (1000 * 60 * 60);
  if (hoursUntilDue <= 18) {
    return { label: "Later today", bucket: "today" };
  }
  if (hoursUntilDue <= 36) {
    return { label: "Tomorrow", bucket: "tomorrow" };
  }
  if (hoursUntilDue <= 24 * 7) {
    return {
      label: `In ${Math.max(2, Math.round(hoursUntilDue / 24))} days`,
      bucket: "this_week",
    };
  }
  return {
    label: `In ${Math.max(8, Math.round(hoursUntilDue / 24))} days`,
    bucket: "later",
  };
}

export function describeReviewProgress(reviewCount: number, lastScore?: number | null): string {
  const safeCount = Math.max(0, Number(reviewCount || 0));
  const safeScore = typeof lastScore === "number" ? Math.round(lastScore * 100) : null;

  if (safeCount <= 0) {
    if (safeScore !== null && safeScore >= 65 && safeScore < 80) {
      return "Close result. Bring it back later today before the idea fades.";
    }
    return "First spaced return still ahead.";
  }

  if (safeCount === 1) {
    return safeScore !== null && safeScore >= 90
      ? "1 strong review completed. The next return is spaced further out."
      : "1 steady review completed. Keep the idea active with the next return.";
  }

  return safeScore !== null && safeScore >= 90
    ? `${safeCount} strong reviews completed. This idea is starting to hold over longer gaps.`
    : `${safeCount} steady reviews completed. Keep the return rhythm going.`;
}
