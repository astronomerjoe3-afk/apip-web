
import type {
  AnalysedStudent,
  LessonInsight,
  LoadLevel,
  LoadProfile,
  MisconceptionSummary,
  ReadinessFilter,
  RiskLevel,
  RiskProfile,
  StudentRow,
  SummaryMetrics,
} from "./types";

export function pct(value: number | null | undefined): string {
  if (typeof value !== "number") return "-";
  const clamped = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return String(clamped) + "%";
}

export function averageScore(values: Array<number | null | undefined>): number | null {
  const numbers = values.filter((value): value is number => typeof value === "number");
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function formatHours(seconds?: number): string {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  if (safeSeconds < 3600) {
    const minutes = Math.max(1, Math.round(safeSeconds / 60));
    return String(minutes) + "m";
  }
  const hours = safeSeconds / 3600;
  return hours >= 10 ? String(Math.round(hours)) + "h" : hours.toFixed(1) + "h";
}
export function formatWhen(value?: string): string {
  if (!value) return "No recent activity";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function daysSince(value?: string): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
}

export function displayName(row: StudentRow): string {
  const name = row.display_name?.trim();
  if (name) return name;
  const email = row.email?.trim();
  if (email) return email.split("@")[0];
  return row.uid.slice(0, 8);
}

export function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "ST";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

export function lessonLabel(lessonId: string): string {
  const match = lessonId.match(/L(\d+)/i);
  return match ? "Lesson " + match[1] : lessonId;
}

export function sizeLabel(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  if (bytes >= 1024) return String(Math.round(bytes / 1024)) + " KB";
  return String(bytes) + " B";
}
export function readinessBucket(readiness: string): Exclude<ReadinessFilter, "all"> {
  const normalized = readiness.toLowerCase();
  if (normalized === "ready") return "ready";
  if (normalized === "not_ready" || normalized === "reteach" || normalized === "struggling") {
    return "support";
  }
  return "watch";
}

export function readinessBadgeClass(readiness: string): string {
  const bucket = readinessBucket(readiness);
  if (bucket === "ready") return "admin-badge admin-badge-success";
  if (bucket === "watch") return "admin-badge admin-badge-warning";
  return "admin-badge admin-badge-muted";
}

export function riskBadgeClass(level: RiskLevel): string {
  if (level === "high") return "admin-badge admin-badge-warning";
  if (level === "medium") return "admin-badge admin-badge-muted";
  return "admin-badge admin-badge-success";
}
export function loadBadgeClass(level: LoadLevel): string {
  if (level === "heavy") return "admin-badge admin-badge-warning";
  if (level === "watch") return "admin-badge admin-badge-muted";
  return "admin-badge admin-badge-success";
}

export function riskProfile(row: StudentRow): RiskProfile {
  let score = 0;
  const reasons: string[] = [];
  const mastery = Number(row.mastery_score || 0);
  const readiness = row.readiness.toLowerCase();
  const engagement = Number(row.engagement_seconds || 0);
  const attempts = Number(row.activity_counters?.attempts || 0);
  const reflections = Number(row.activity_counters?.reflections || 0);
  const topMisconception = row.top_misconceptions?.[0];

  if (mastery < 0.55) {
    score += 2;
    reasons.push("low mastery");
  } else if (mastery < 0.72) {
    score += 1;
    reasons.push("slipping mastery");
  }
  if (readiness === "not_ready" || readiness === "reteach") {
    score += 2;
    reasons.push("not ready yet");
  } else if (readiness !== "ready") {
    score += 1;
    reasons.push("needs another pass");
  }

  if (engagement < 900) {
    score += 1;
    reasons.push("light engagement");
  }

  if (attempts >= 8 && mastery < 0.7) {
    score += 1;
    reasons.push("many retries");
  }

  if (reflections === 0 && attempts >= 4) {
    score += 1;
    reasons.push("no reflection evidence");
  }

  if (topMisconception && topMisconception.p >= 0.55) {
    score += 1;
    reasons.push("stuck on " + topMisconception.tag);
  }

  if (score >= 4) return { level: "high", score, reason: reasons.slice(0, 2).join(" - ") || "Needs prompt follow-up" };
  if (score >= 2) return { level: "medium", score, reason: reasons.slice(0, 2).join(" - ") || "Watch this learner" };
  return { level: "low", score, reason: reasons[0] || "Stable participation" };
}
export function loadProfile(row: StudentRow): LoadProfile {
  let score = 0;
  const reasons: string[] = [];
  const attempts = Number(row.activity_counters?.attempts || 0);
  const reflections = Number(row.activity_counters?.reflections || 0);
  const engagement = Number(row.engagement_seconds || 0);
  const mastery = Number(row.mastery_score || 0);

  if (attempts >= 10) {
    score += 2;
    reasons.push("high retry count");
  } else if (attempts >= 6) {
    score += 1;
    reasons.push("effort load rising");
  }

  if (engagement >= 7200) {
    score += 1;
    reasons.push("long time on task");
  }

  if (mastery < 0.65 && attempts >= 6) {
    score += 1;
    reasons.push("working hard without lift yet");
  }
  if (reflections > 0 && mastery >= 0.7) {
    score = Math.max(0, score - 1);
  }

  if (score >= 3) return { level: "heavy", score, reason: reasons.slice(0, 2).join(" - ") || "Reduce the mental load" };
  if (score >= 1) return { level: "watch", score, reason: reasons.slice(0, 2).join(" - ") || "Monitor pacing" };
  return { level: "steady", score, reason: "Healthy pace" };
}

export function matchesFilter(row: AnalysedStudent, filter: ReadinessFilter, search: string): boolean {
  const trimmed = search.trim().toLowerCase();
  const matchesSearch = !trimmed || displayName(row.row).toLowerCase().includes(trimmed) || (row.row.email || "").toLowerCase().includes(trimmed) || row.row.top_misconceptions.some((item) => item.tag.toLowerCase().includes(trimmed));
  const matchesReadiness = filter === "all" ? true : row.readinessBucket === filter;
  return matchesSearch && matchesReadiness;
}

export function buildAnalysedRows(rows: StudentRow[]): AnalysedStudent[] {
  return rows
    .map((row) => ({
      row,
      risk: riskProfile(row),
      load: loadProfile(row),
      readinessBucket: readinessBucket(row.readiness),
    }))
    .sort((left, right) => {
      if (right.risk.score !== left.risk.score) return right.risk.score - left.risk.score;
      if (right.row.mastery_score !== left.row.mastery_score) return left.row.mastery_score - right.row.mastery_score;
      return displayName(left.row).localeCompare(displayName(right.row));
    });
}
export function buildSummary(rows: AnalysedStudent[]): SummaryMetrics {
  const cohortSize = rows.length;
  const averageMastery = averageScore(rows.map((entry) => entry.row.mastery_score)) || 0;
  const averageDiagnostic = averageScore(rows.map((entry) => entry.row.last_diagnostic?.score));
  const averageTransfer = averageScore(rows.map((entry) => entry.row.last_transfer?.score));
  const averageEngagementSeconds = cohortSize > 0 ? rows.reduce((sum, entry) => sum + Number(entry.row.engagement_seconds || 0), 0) / cohortSize : 0;
  const highRisk = rows.filter((entry) => entry.risk.level === "high").length;
  const readyCount = rows.filter((entry) => entry.readinessBucket === "ready").length;
  const heavyLoad = rows.filter((entry) => entry.load.level === "heavy").length;

  return {
    cohortSize,
    averageMastery,
    averageDiagnostic,
    averageTransfer,
    averageEngagementSeconds,
    highRisk,
    readyCount,
    heavyLoad,
  };
}
export function buildMisconceptionMap(rows: AnalysedStudent[]): MisconceptionSummary[] {
  const aggregate = new Map<string, { learners: number; total: number; peak: number }>();

  rows.forEach(({ row }) => {
    row.top_misconceptions.forEach((misconception) => {
      const current = aggregate.get(misconception.tag) || { learners: 0, total: 0, peak: 0 };
      current.learners += 1;
      current.total += misconception.p;
      current.peak = Math.max(current.peak, misconception.p);
      aggregate.set(misconception.tag, current);
    });
  });

  return Array.from(aggregate.entries())
    .map(([tag, value]) => ({
      tag,
      learners: value.learners,
      pressure: value.total / value.learners,
      peak: value.peak,
    }))
    .sort((left, right) => {
      if (right.learners !== left.learners) return right.learners - left.learners;
      return right.pressure - left.pressure;
    })
    .slice(0, 8);
}
export function buildLessonInsights(rows: AnalysedStudent[]): LessonInsight[] {
  const aggregate = new Map<string, { diagnostic: number[]; transfer: number[]; learners: number }>();

  rows.forEach(({ row }) => {
    Object.entries(row.per_lesson || {}).forEach(([lessonId, snapshot]) => {
      const current = aggregate.get(lessonId) || { diagnostic: [], transfer: [], learners: 0 };
      current.learners += 1;
      if (typeof snapshot.diagnostic?.score === "number") current.diagnostic.push(snapshot.diagnostic.score);
      if (typeof snapshot.transfer?.score === "number") current.transfer.push(snapshot.transfer.score);
      aggregate.set(lessonId, current);
    });
  });

  return Array.from(aggregate.entries())
    .map(([lessonId, value]) => {
      const diagnostic = averageScore(value.diagnostic);
      const transfer = averageScore(value.transfer);
      const drag = (diagnostic || 0) - (transfer || 0);
      return { lessonId, learners: value.learners, diagnostic, transfer, drag };
    })
    .sort((left, right) => {
      if (right.drag !== left.drag) return right.drag - left.drag;
      return left.lessonId.localeCompare(right.lessonId);
    })
    .slice(0, 6);
}
