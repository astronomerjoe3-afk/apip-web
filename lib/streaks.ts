export type LearningStreakSummary = {
  current_days: number;
  best_days: number;
  total_learning_days: number;
  today_completed: boolean;
  status: "new" | "active" | "at_risk" | "paused" | string;
  last_earned_date_utc?: string | null;
  last_earned_utc?: string | null;
};

function pluralizeDay(days: number): string {
  return `${days}-day${days === 1 ? "" : "s"}`;
}

export function describeLearningStreakValue(summary: LearningStreakSummary | null | undefined): string {
  const currentDays = Math.max(0, Number(summary?.current_days || 0));
  if (currentDays <= 0) {
    return "Start your streak";
  }
  return `${pluralizeDay(currentDays)} learning streak`;
}

export function describeLearningStreakSubtle(summary: LearningStreakSummary | null | undefined): string {
  const currentDays = Math.max(0, Number(summary?.current_days || 0));
  const bestDays = Math.max(0, Number(summary?.best_days || 0));
  const totalLearningDays = Math.max(0, Number(summary?.total_learning_days || 0));
  const status = String(summary?.status || "new");

  if (status === "active") {
    return currentDays > 1
      ? `Protected today. Best run so far: ${pluralizeDay(bestDays)}.`
      : "Protected today. One meaningful learning action already counted.";
  }

  if (status === "at_risk") {
    return currentDays > 1
      ? `At risk today. One focused concept gate or mastery check keeps ${pluralizeDay(currentDays)} going.`
      : "At risk today. One focused concept gate or mastery check keeps it going.";
  }

  if (status === "paused") {
    return bestDays > 0
      ? `Best run so far: ${pluralizeDay(bestDays)}. Restart with one focused learning action today.`
      : "Restart with one focused concept gate or mastery check today.";
  }

  if (totalLearningDays > 0) {
    return `You have already logged ${totalLearningDays} focused learning day${totalLearningDays === 1 ? "" : "s"}.`;
  }

  return "Start with one concept gate or mastery check. The streak measures real learning, not app opens.";
}

export function describeLearningStreakBanner(summary: LearningStreakSummary | null | undefined): {
  kind: "warning" | "success" | "info";
  title: string;
  body: string;
  ctaLabel: string;
} | null {
  const status = String(summary?.status || "new");
  const currentDays = Math.max(0, Number(summary?.current_days || 0));

  if (status === "active") {
    return {
      kind: "success",
      title: "Learning streak protected",
      body: currentDays > 1
        ? `You have already strengthened physics ideas for ${pluralizeDay(currentDays)} in a row. Keep the momentum going with your next review or lesson.`
        : "You have already strengthened a physics idea today. Keep the momentum going with your next review or lesson.",
      ctaLabel: "Keep learning",
    };
  }

  if (status === "at_risk") {
    return {
      kind: "warning",
      title: "Keep your learning streak alive today",
      body: currentDays > 1
        ? `One focused concept gate or mastery check keeps your ${pluralizeDay(currentDays)} going.`
        : "One focused concept gate or mastery check keeps your streak alive today.",
      ctaLabel: "Protect streak",
    };
  }

  if (status === "paused") {
    return {
      kind: "info",
      title: "Restart your learning streak",
      body: "Pick one focused lesson or review now. The streak grows from real understanding, not just showing up.",
      ctaLabel: "Start today",
    };
  }

  return {
    kind: "info",
    title: "Start your learning streak",
    body: "Finish one concept gate or mastery check today and Cognispark will begin tracking your consistency from the first real learning step.",
    ctaLabel: "Start streak",
  };
}
