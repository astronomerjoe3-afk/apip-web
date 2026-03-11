
export type Role = "student" | "instructor" | "admin" | "unknown";
export type ReadinessFilter = "all" | "ready" | "watch" | "support";
export type SupportAction = "Monitor" | "Reteach" | "Office hours" | "Celebrate";
export type RiskLevel = "low" | "medium" | "high";
export type LoadLevel = "steady" | "watch" | "heavy";

export type MisconceptionRow = {
  tag: string;
  p: number;
};

export type ScoredSnapshot = {
  score: number | null;
  utc?: string;
};

export type LessonSnapshot = {
  diagnostic?: ScoredSnapshot;
  transfer?: ScoredSnapshot;
};
export type ActivityCounters = {
  attempts?: number;
  reflections?: number;
};

export type StudentRow = {
  uid: string;
  email?: string;
  display_name?: string;
  module_id: string;
  mastery_score: number;
  readiness: string;
  readiness_reason?: string;
  last_event_utc?: string;
  engagement_seconds?: number;
  activity_counters?: ActivityCounters;
  top_misconceptions: MisconceptionRow[];
  last_diagnostic?: ScoredSnapshot;
  last_transfer?: ScoredSnapshot;
  per_lesson?: Record<string, LessonSnapshot>;
};

export type ApiResp = {
  ok: boolean;
  utc?: string;
  module_id: string;
  students: StudentRow[];
  warnings?: string[];
};
export type UploadItem = {
  id: string;
  name: string;
  sizeLabel: string;
  section: string;
  tag: string;
  status: "Queued" | "Sorted";
};

export type RiskProfile = {
  level: RiskLevel;
  score: number;
  reason: string;
};

export type LoadProfile = {
  level: LoadLevel;
  score: number;
  reason: string;
};

export type AnalysedStudent = {
  row: StudentRow;
  risk: RiskProfile;
  load: LoadProfile;
  readinessBucket: Exclude<ReadinessFilter, "all">;
};
export type SummaryMetrics = {
  cohortSize: number;
  averageMastery: number;
  averageDiagnostic: number | null;
  averageTransfer: number | null;
  averageEngagementSeconds: number;
  highRisk: number;
  readyCount: number;
  heavyLoad: number;
};

export type MisconceptionSummary = {
  tag: string;
  learners: number;
  pressure: number;
  peak: number;
};

export type LessonInsight = {
  lessonId: string;
  learners: number;
  diagnostic: number | null;
  transfer: number | null;
  drag: number;
};
