"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getLessonRunner, postProgressEvent, restartLessonProgress } from "@/lib/lessonRunnerApi";
import { misconceptionSummaryForContext } from "@/lib/misconceptionRepair";
import { describeReviewProgress, describeReviewTiming } from "@/lib/spacedReview";
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
import M12NuclearSimulationPanels from "./M12NuclearSimulationPanels";
import M13SimulationPanels from "./M13SimulationPanels";
import M14SimulationPanels from "./M14SimulationPanels";
import F5SimulationPanels from "./F5SimulationPanels";
import A1SimulationPanels from "./A1SimulationPanels";
import A3SimulationPanels from "./A3SimulationPanels";
import A5SimulationPanels from "./A5SimulationPanels";
import A4SimulationPanels from "./A4SimulationPanels";
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
  prompt?: string;
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

const ASSESSMENT_TEXT_ACRONYMS = [
  "AC",
  "DC",
  "EM",
  "EMF",
  "GPE",
  "IGCSE",
  "IR",
  "IV",
  "KE",
  "RMS",
  "SHM",
  "SI",
  "SUVAT",
  "UV",
] as const;
const ASSESSMENT_TEXT_LOWERCASE_TOKENS = [
  "cm",
  "g",
  "kg",
  "km",
  "m",
  "mm",
  "ms",
  "nm",
  "s",
] as const;
const ASSESSMENT_TEXT_LOWERCASE_PREFIXES = [
  "centi-",
  "deci-",
  "kilo-",
  "mega-",
  "micro-",
  "milli-",
  "nano-",
] as const;
const LESSON_TEXT_PROPER_NOUNS = [
  "Brownian",
  "Cambridge",
  "Earth",
  "Einstein",
  "Faraday",
  "Fleming",
  "Jupiter",
  "Kepler",
  "Kirchhoff",
  "Lenz",
  "Mars",
  "Mercury",
  "Moon",
  "Neptune",
  "Newton",
  "Ohm",
  "Planck",
  "Pluto",
  "Saturn",
  "Sun",
  "Uranus",
  "Venus",
] as const;

const LESSON_UNIT_SYMBOL_MAP: Record<string, string> = {
  cm: "cm",
  ev: "eV",
  gev: "GeV",
  g: "g",
  hz: "Hz",
  kev: "keV",
  kg: "kg",
  km: "km",
  m: "m",
  mev: "MeV",
  mg: "mg",
  ml: "mL",
  mm: "mm",
  ms: "ms",
  nm: "nm",
  pa: "Pa",
  s: "s",
};

function canonicalizeLessonUnitTokens(value: string): string {
  let normalized = value.replace(
    /\b(cm|ev|gev|g|hz|kev|kg|km|m|mev|mg|ml|mm|ms|nm|pa|s)\b/gi,
    (token) => LESSON_UNIT_SYMBOL_MAP[token.toLowerCase()] ?? token
  );

  normalized = normalized.replace(
    /(\d(?:[\d.]*))\s+n\b/g,
    (_match, valueText: string) => `${valueText} N`
  );

  normalized = normalized.replace(
    /(\d(?:[\d.]*))\s+ma\b/gi,
    (_match, valueText: string) => `${valueText} mA`
  );

  normalized = normalized.replace(
    /\b([A-Za-z]+)\^([23])\b/g,
    (_match, symbol: string, power: string) =>
      `${LESSON_UNIT_SYMBOL_MAP[symbol.toLowerCase()] ?? symbol}${"^"}${power}`
  );

  normalized = normalized.replace(
    /(^|:\s*|,\s*|\(\s*)([GM])(?=,|\)|$)/g,
    (_match, prefix: string, unit: string) => `${prefix}${unit.toLowerCase()}`
  );

  normalized = normalized.replace(
    /(^|:\s*|,\s*|\(\s*)ma(?=,|\)|$)/gi,
    (_match, prefix: string) => `${prefix}mA`
  );

  return normalized;
}

function repairDamagedLessonProse(value: string): string {
  let normalized = value.replace(/\b([A-Za-z][A-Za-z'-]{2,})\b/g, (word) => {
    const lower = word.toLowerCase();
    const upper = word.toUpperCase();
    if (ASSESSMENT_TEXT_ACRONYMS.includes(upper as typeof ASSESSMENT_TEXT_ACRONYMS[number])) {
      return upper;
    }
    if (ASSESSMENT_TEXT_LOWERCASE_TOKENS.includes(lower as typeof ASSESSMENT_TEXT_LOWERCASE_TOKENS[number])) {
      return lower;
    }
    if (/^[A-Z][a-z]+(?:['-][A-Za-z]+)*$/.test(word) || /^[a-z]+(?:['-][a-z]+)*$/.test(word)) {
      return word;
    }
    const hasUpper = /[A-Z]/.test(word);
    const hasLower = /[a-z]/.test(word);
    if (hasUpper && !hasLower && word.length <= 2) {
      return word;
    }
    if (!hasUpper && hasLower) {
      return word;
    }
    return lower;
  });

  normalized = normalized
    .replace(/\b(km|cm|mm|kg|nm|ms|hz|pa|ev|kev|mev|gev)\b/gi, (token) => token.toLowerCase())
    .replace(/\b(AN|AS|AT|BE|BY|DO|IF|IN|IS|IT|OF|ON|OR|SO|TO|UP|WE)\b/g, (token) => token.toLowerCase())
    .replace(/(\d(?:[\d.]*))\s+([GMS])\b/g, (_match, valueText: string, unit: string) => `${valueText} ${unit.toLowerCase()}`)
    .replace(/\b(to|in|into|from|as|per|of|by)\s+([GMS])\b/g, (_match, prep: string, unit: string) => `${prep} ${unit.toLowerCase()}`)
    .replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (_match, prefix: string, first: string) => `${prefix}${first.toUpperCase()}`);

  for (const noun of LESSON_TEXT_PROPER_NOUNS) {
    normalized = normalized.replace(new RegExp(`\\b${noun.toLowerCase()}\\b`, "g"), noun);
  }

  return canonicalizeLessonUnitTokens(normalized);
}

function normalizeAssessmentText(value: string): string {
  const singleLine = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b([A-Za-z]{3,})_([A-Za-z]{3,})\b/g, "$1-$2")
    .replace(/\b([A-Za-z]{3,})_(?=\s|$|[!?.,:;])/g, "$1-");
  if (!singleLine) return singleLine;

  const letters = singleLine.match(/[A-Za-z]/g) ?? [];
  if (letters.length < 2) {
    const numericLowercaseUnit = singleLine.match(/^([0-9.]+)\s+([GMS])$/);
    if (numericLowercaseUnit) {
      return `${numericLowercaseUnit[1]} ${numericLowercaseUnit[2].toLowerCase()}`;
    }
    const lowered = singleLine.toLowerCase();
    if (ASSESSMENT_TEXT_LOWERCASE_TOKENS.includes(lowered as typeof ASSESSMENT_TEXT_LOWERCASE_TOKENS[number])) {
      return lowered;
    }
    const uppered = singleLine.toUpperCase();
    if (ASSESSMENT_TEXT_ACRONYMS.includes(uppered as typeof ASSESSMENT_TEXT_ACRONYMS[number])) {
      return uppered;
    }
    return singleLine;
  }

  const uppercaseCount = letters.filter((letter) => letter === letter.toUpperCase()).length;
  const lowercaseCount = letters.filter((letter) => letter === letter.toLowerCase()).length;
  const isShouty = lowercaseCount === 0 || uppercaseCount / letters.length > 0.92;
  if (!isShouty || /[<>]/.test(singleLine)) {
    return repairDamagedLessonProse(singleLine);
  }

  let normalized = singleLine.toLowerCase();
  normalized = normalized.replace(
    /^(\s*["'“”‘’(\[]*)([a-z])/,
    (_match, prefix: string, first: string) => `${prefix}${first.toUpperCase()}`
  );

  for (const acronym of ASSESSMENT_TEXT_ACRONYMS) {
    const titleCaseAcronym = acronym.charAt(0) + acronym.slice(1).toLowerCase();
    normalized = normalized.replace(new RegExp(`\\b${titleCaseAcronym}\\b`, "gi"), acronym);
  }

  for (const token of ASSESSMENT_TEXT_LOWERCASE_TOKENS) {
    const capitalizedToken = token.charAt(0).toUpperCase() + token.slice(1);
    normalized = normalized.replace(new RegExp(`\\b${capitalizedToken}\\b`, "gi"), token);
  }

  for (const prefix of ASSESSMENT_TEXT_LOWERCASE_PREFIXES) {
    const capitalizedPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    normalized = normalized.replace(new RegExp(capitalizedPrefix.replace("-", "\\-"), "g"), prefix);
  }

  normalized = normalized.replace(/(\d(?:[\d.]*))\s+([GMS])\b/g, (_match, valueText: string, unit: string) => {
    return `${valueText} ${unit.toLowerCase()}`;
  });

  normalized = normalized.replace(/\b([a-z]{1,2})-(\d+)\b/g, (_match, symbol: string, count: string) => {
    const formattedSymbol = symbol.length === 1
      ? symbol.toUpperCase()
      : symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    return `${formattedSymbol}-${count}`;
  });

  return repairDamagedLessonProse(normalized);
}

function normalizeLessonDisplayText(value: string): string {
  return canonicalizeLessonUnitTokens(normalizeAssessmentText(value));
}

function normalizeFormulaDisplayText(value: string): string {
  return normalizeLessonDisplayText(value)
    .replace(/^\s*A(?=\s*=\s*(?:gradient\b|Δv\b|F\b|F_resultant\b))/u, "a");
}

function normalizeLessonDisplayMultiline(value: string): string {
  return String(value || "")
    .split("\n")
    .map((line) => normalizeLessonDisplayText(line))
    .join("\n");
}

function preserveLeadingTechnicalWordSymbol(term: string, meaning: string): string {
  const normalizedTerm = String(term || "").trim();
  const normalizedMeaning = String(meaning || "").trim();
  if (!normalizedTerm || !normalizedMeaning) return normalizedMeaning;
  if (normalizedTerm.length !== 1) return normalizedMeaning;
  if (normalizedTerm !== normalizedTerm.toLowerCase() || normalizedTerm === normalizedTerm.toUpperCase()) {
    return normalizedMeaning;
  }

  const capitalizedTerm = normalizedTerm.toUpperCase();
  if (!normalizedMeaning.startsWith(capitalizedTerm)) return normalizedMeaning;

  const nextChar = normalizedMeaning.charAt(capitalizedTerm.length);
  if (nextChar && !/[\s=:(-]/.test(nextChar)) return normalizedMeaning;

  return `${normalizedTerm}${normalizedMeaning.slice(capitalizedTerm.length)}`;
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
  image_url?: string;
  video_url?: string;
  poster_url?: string;
  captions_url?: string;
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

function ScaffoldVideoPlayer({
  src,
  poster,
  captionsUrl,
}: {
  src: string;
  poster?: string;
  captionsUrl?: string;
}) {
  return (
    <div>
      <video
        key={src}
        className="h-72 w-full rounded-2xl bg-slate-950 object-contain md:h-80"
        controls
        playsInline
        preload="metadata"
        poster={poster}
      >
        <source src={src} type="video/mp4" />
        {captionsUrl ? (
          <track
            kind="captions"
            label="English"
            srcLang="en"
            src={captionsUrl}
          />
        ) : null}
      </video>
      <div className="mt-3 text-sm">
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="text-sky-700 underline underline-offset-4"
        >
          Open video in a new tab
        </a>
      </div>
    </div>
  );
}

type ScaffoldIntroSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

type ScaffoldStagePayload = {
  title?: string;
  intro?: string;
  lesson_introduction?: ScaffoldIntroSection[];
  teaching_focus?: string[];
  misconception_targets?: string[];
  teaching_focus_cards?: TeachingFocusCard[];
  reference_tables?: ScaffoldReferenceTable[];
  media_cards?: ScaffoldMediaCard[];
  sections: ScaffoldSection[];
  review_refs?: ReviewReference[];
};

type ScaffoldRoleplayOption = {
  value: string;
  label: string;
  feedback: string;
  isCorrect?: boolean;
};

type ScaffoldRoleplayCard = {
  id: string;
  badge: string;
  title: string;
  scenario: string;
  prompt: string;
  options: ScaffoldRoleplayOption[];
  successLabel?: string;
  retryLabel?: string;
};

function getOrderedScaffoldRoleplayOptions(card: ScaffoldRoleplayCard): ScaffoldRoleplayOption[] {
  if (card.options.length <= 1) return card.options;
  const correctIndex = card.options.findIndex((option) => option.isCorrect);
  if (correctIndex < 0) return card.options;

  const targetIndex =
    [...card.id].reduce((sum, character, index) => sum + character.charCodeAt(0) * (index + 1), 0) %
    card.options.length;

  if (targetIndex === correctIndex) return card.options;

  const reordered = [...card.options];
  const [correctOption] = reordered.splice(correctIndex, 1);
  reordered.splice(targetIndex, 0, correctOption);
  return reordered;
}

type ConceptGateFeedbackItem = {
  question_id: string;
  prompt?: string;
  is_correct: boolean;
  explanation: string;
  correct_answer?: string | string[];
  misconception_tag?: string;
  teaching_focus?: string;
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
  correct_answer?: string | string[];
  learner_answer?: string | string[] | null;
  misconception_tag?: string;
  teaching_focus?: string;
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
    review_state?: string;
    review_due_utc?: string | null;
    review_count?: number;
    last_review_score?: number | null;
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
      <p className="mb-2 text-sm font-medium text-slate-500">{normalizeAssessmentText(eyebrow)}</p>
      <h2 className="lesson-stage-title text-2xl font-semibold text-slate-900">{normalizeAssessmentText(title)}</h2>
      {subtitle ? <p className="lesson-stage-subtitle mt-2 text-slate-600">{normalizeAssessmentText(subtitle)}</p> : null}
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

type QuestionReasoningCue = {
  intuition: string;
  whyRight: string;
  temptingWrong: string;
  examMove: string;
};

type ExamQuestionDifficulty = "Foundation" | "Core" | "Advanced";

type ExamQuestionMeta = {
  focus: string;
  watchFor: string;
  difficulty: ExamQuestionDifficulty;
};

function buildExamQuestionMetaFromText(source: string): ExamQuestionMeta {
  const text = normalizeAssessmentText(source).toLowerCase();

  if (/(graph|slope|gradient|distance-time|speed-time|area)/.test(text)) {
    return {
      focus: /(area|interpolate|distance at|speed-time)/.test(text)
        ? "Graph interpretation and calculation"
        : "Graph interpretation and physical meaning",
      watchFor: /(area)/.test(text)
        ? "treating the line itself as the total quantity instead of using the graph meaning"
        : "matching the shape without checking what the axes say it means",
      difficulty: /(area|interpolate|gradient|compare)/.test(text) ? "Core" : "Foundation",
    };
  }

  if (/(force|resultant|torque|pivot|stability|weight line|free-body)/.test(text)) {
    return {
      focus: /(torque|pivot|stability)/.test(text)
        ? "Turning effect and stability reasoning"
        : "Force balance and resultant reasoning",
      watchFor: /(third law|equal and opposite)/.test(text)
        ? "cancelling forces that act on different objects"
        : "using arrow appearance instead of the actual object or pivot",
      difficulty: /(torque|pivot|stability|third law)/.test(text) ? "Core" : "Foundation",
    };
  }

  if (/(energy|power|efficiency|useful|store|work|ledger|leak)/.test(text)) {
    return {
      focus: /(power|efficiency)/.test(text)
        ? "Energy rate and useful-yield reasoning"
        : /(planner|multi-stage|sequence|chain)/.test(text)
          ? "Multi-stage energy transfer reasoning"
          : "Energy transfer and conservation reasoning",
      watchFor: /(power|efficiency)/.test(text)
        ? "calling a faster transfer more efficient without checking the useful fraction"
        : /(planner|multi-stage|sequence|chain)/.test(text)
          ? "jumping to the final stage without following the transfer chain in order"
          : "ignoring leaks or losses when comparing useful output",
      difficulty: /(planner|multi-stage|sequence|chain)/.test(text)
        ? "Advanced"
        : /(power|efficiency|work)/.test(text)
          ? "Core"
          : "Foundation",
    };
  }

  if (/(vector|scalar|displacement|velocity|direction|acceleration)/.test(text)) {
    return {
      focus: "Quantity classification and directional meaning",
      watchFor: "treating related quantities as identical because they share units",
      difficulty: /(acceleration|velocity|displacement)/.test(text) ? "Core" : "Foundation",
    };
  }

  if (/(measurement|uncertainty|zero error|resolution|scale|significant|unit|prefix|decimal)/.test(text)) {
    return {
      focus: /(uncertainty|zero error|resolution)/.test(text)
        ? "Measurement quality and instrument reading"
        : "Unit conversion and scale reasoning",
      watchFor: /(decimal|prefix|unit)/.test(text)
        ? "using a decimal trick without stating the conversion factor underneath it"
        : "reporting a reading without checking the instrument scale or uncertainty",
      difficulty: /(uncertainty|zero error|significant)/.test(text) ? "Core" : "Foundation",
    };
  }

  return {
    focus: "Concept interpretation and exam reasoning",
    watchFor: "answering by surface pattern instead of naming the quantity or relationship being tested",
    difficulty: "Core",
  };
}

function buildReasoningCueFromText(source: string): QuestionReasoningCue {
  const text = normalizeAssessmentText(source).toLowerCase();

  if (/(graph|slope|gradient|distance-time|speed-time|area)/.test(text)) {
    return {
      intuition: "Name the axes first, then translate the graph into a plain-language motion story before touching any numbers.",
      whyRight: "The right answer comes from matching the graph feature to the physics meaning it represents, not from treating the graph as a picture.",
      temptingWrong: "The tempting wrong move is to match shape by eye or grab a familiar number without checking what the axes say that feature means.",
      examMove: "In exams, say what the graph shows physically, then choose the quantity or relationship that follows from that story.",
    };
  }

  if (/(force|resultant|torque|pivot|stability|weight line|free-body)/.test(text)) {
    return {
      intuition: "Identify the object or pivot first, then decide which forces or turning effects really belong to that situation.",
      whyRight: "The right answer comes from keeping the force story tied to one object or one turning effect instead of mixing diagrams together.",
      temptingWrong: "The tempting wrong move is to let equal-looking arrows cancel automatically or to ignore where the force acts relative to the pivot.",
      examMove: "In exams, name the object, direction, and pivot clearly before deciding what changes the motion or turning effect.",
    };
  }

  if (/(energy|power|efficiency|useful|store|work|ledger|leak)/.test(text)) {
    return {
      intuition: "Track the hand-off in words first: input, useful gain, leak, and the store or rate being compared.",
      whyRight: "The right answer comes from conserving the transfer story all the way through, so every gain, leak, and comparison still balances physically.",
      temptingWrong: "The tempting wrong move is to jump to the biggest number or final output without checking which energy actually remains available at that stage.",
      examMove: "In exams, write the transfer chain in order before choosing the statement or calculation that fits it.",
    };
  }

  if (/(vector|scalar|displacement|velocity|direction|acceleration)/.test(text)) {
    return {
      intuition: "Separate size from direction before you decide what the quantity really means.",
      whyRight: "The right answer comes from classifying the quantity by the information it needs, especially whether direction changes its meaning.",
      temptingWrong: "The tempting wrong move is to treat two related quantities as identical just because they share the same units.",
      examMove: "In exams, name the quantity, then ask whether direction is essential to that definition.",
    };
  }

  if (/(measurement|uncertainty|zero error|resolution|scale|significant|unit|prefix|decimal)/.test(text)) {
    return {
      intuition: "Start with what the instrument or unit scale can honestly justify before you commit to a number rule.",
      whyRight: "The right answer comes from matching the measurement or conversion to the scale, uncertainty, or factor that actually controls it.",
      temptingWrong: "The tempting wrong move is to apply a remembered decimal trick without showing the physical scale or conversion factor underneath it.",
      examMove: "In exams, state the scale step, conversion factor, or uncertainty rule first, then finish the number work.",
    };
  }

  return {
    intuition: "State the physical story in plain language before you try to spot the answer pattern.",
    whyRight: "The right answer follows from naming the quantity, relationship, or change the question is really testing.",
    temptingWrong: "The tempting wrong move is to answer by surface pattern instead of checking what stays fixed, what changes, and which idea the question targets.",
    examMove: "In exams, say the idea first, then use the numbers or labels to support it.",
  };
}

function AssessmentReasoningPanel({ cue }: { cue: QuestionReasoningCue }) {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Intuition first</p>
        <p className="mt-2 text-sm leading-6 text-slate-700 normal-case">{cue.intuition}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Exam move</p>
        <p className="mt-2 text-sm leading-6 text-slate-700 normal-case">{cue.examMove}</p>
      </div>
    </div>
  );
}

function AssessmentMetaRow({ meta }: { meta: ExamQuestionMeta }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="inline-flex min-h-[2.1rem] items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold tracking-[0.01em] text-slate-700 normal-case">
        Focus: {meta.focus}
      </span>
      <span className="inline-flex min-h-[2.1rem] items-center rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-xs font-semibold tracking-[0.01em] text-sky-800 normal-case">
        Difficulty: {meta.difficulty}
      </span>
      <span className="inline-flex min-h-[2.1rem] items-center rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-semibold tracking-[0.01em] text-emerald-800 normal-case">
        Watch for: {meta.watchFor}
      </span>
    </div>
  );
}

function AssessmentFeedbackBreakdown({ cue }: { cue: QuestionReasoningCue }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div>
        <p className="font-semibold text-slate-800 normal-case">Why this answer is right</p>
        <p className="mt-1 leading-6 normal-case">{cue.whyRight}</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800 normal-case">Tempting wrong move</p>
        <p className="mt-1 leading-6 normal-case">{cue.temptingWrong}</p>
      </div>
      <div>
        <p className="font-semibold text-slate-800 normal-case">Exam move</p>
        <p className="mt-1 leading-6 normal-case">{cue.examMove}</p>
      </div>
    </div>
  );
}

function MisconceptionRepairPanel({
  tag,
  prompt,
  learnerAnswer,
  correctAnswer,
  teachingFocus,
}: {
  tag?: string;
  prompt?: string;
  learnerAnswer?: string | string[] | null;
  correctAnswer?: string | string[];
  teachingFocus?: string;
}) {
  const summary = misconceptionSummaryForContext({
    tag,
    prompt,
    learnerAnswer,
    correctAnswer,
    teachingFocus,
  });

  if (!summary && !teachingFocus) {
    return null;
  }

    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Use this correction</p>
        {summary ? (
          <div className="mt-3 space-y-3">
            <div>
              <p className="font-semibold text-slate-800 normal-case">Right idea</p>
              <p className="mt-1 leading-6 text-slate-700 normal-case">{summary.repair}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 normal-case">Why</p>
              <p className="mt-1 leading-6 text-slate-700 normal-case">{summary.diagnosis}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 normal-case">Next time</p>
              <p className="mt-1 leading-6 text-slate-600 normal-case">{summary.noticeNext}</p>
            </div>
          </div>
        ) : null}
      {!summary && teachingFocus ? (
        <p className="mt-3 leading-6 text-slate-700 normal-case">{normalizeAssessmentText(normalizeTeachingFocusText(teachingFocus))}</p>
      ) : null}
    </div>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
  showReasoningFrame = false,
}: {
  question: Question;
  value: string;
  onChange: (questionId: string, value: string) => void;
  showReasoningFrame?: boolean;
}) {
  const prompt = normalizeAssessmentText(question.prompt);
  const visualTitle = question.visual_title ? normalizeAssessmentText(question.visual_title) : "";
  const visualCaption = question.visual_caption ? normalizeAssessmentText(question.visual_caption) : "";
  const visualCallouts = (question.visual_callouts ?? [])
    .map(normalizeAssessmentText)
    .filter((item) => item.length > 0);
  const questionMeta = showReasoningFrame
    ? buildExamQuestionMetaFromText(
        [question.prompt, question.visual_title, question.visual_caption, ...(question.visual_callouts ?? [])]
          .filter(Boolean)
          .join(" "),
      )
    : null;
  const reasoningCue = showReasoningFrame
    ? buildReasoningCueFromText(
        [question.prompt, question.visual_title, question.visual_caption, ...(question.visual_callouts ?? [])]
          .filter(Boolean)
          .join(" "),
      )
    : null;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm normal-case">
      {question.image_url ? (
        <div className="mb-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(224,242,254,0.9),_rgba(255,255,255,1)_62%)] p-4">
            {visualTitle ? (
              <p className="text-sm font-semibold normal-case text-sky-700">{visualTitle}</p>
            ) : null}
            {visualCaption ? (
              <p className="mt-2 text-sm leading-6 text-slate-700 normal-case">{visualCaption}</p>
            ) : null}
          </div>
          <img
            src={question.image_url}
            alt={visualTitle || prompt}
            className="h-auto max-h-[24rem] w-full bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.98),_rgba(255,255,255,1))] object-contain p-4"
            loading="lazy"
          />
          {visualCallouts.length ? (
            <div className="grid gap-3 border-t border-slate-200 bg-slate-50/90 p-4 md:grid-cols-3">
              {visualCallouts.map((item) => (
                <div key={item} className="rounded-2xl border border-sky-100 bg-white/95 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mb-4 font-medium text-slate-900 normal-case">{prompt}</p>
      {questionMeta ? <AssessmentMetaRow meta={questionMeta} /> : null}
      {reasoningCue ? <AssessmentReasoningPanel cue={reasoningCue} /> : null}

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
                <span className="normal-case">{normalizeAssessmentText(option.label)}</span>
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

  const promptPrefix = item.prompt ? `${normalizeAssessmentText(item.prompt)}\n\n` : "";
  if (!hasPlaceholder) {
    return normalizeAssessmentText(promptPrefix + explanation);
  }

  if (item.is_correct) {
    return normalizeAssessmentText(promptPrefix + "Correct. You used the lesson idea correctly.");
  }

  return normalizeAssessmentText(`${promptPrefix}Review ${lessonTitle} again, especially the key ideas from this lesson.`);
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
  const [scaffoldRoleplaySelections, setScaffoldRoleplaySelections] = useState<Record<string, string>>({});
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
    setScaffoldRoleplaySelections({});
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
        return "Opening questions.";
      case "scaffold":
        return "Study the key ideas for this sub-unit.";
      case "concept_gate":
        return "Checkpoint question before the activity.";
      case "simulation":
        return "Change one thing at a time, watch what changes, and explain the pattern you notice.";
      case "reflection":
        return "Explain the idea in your own words.";
      case "mastery":
        return "Final assessment.";
      default:
        return "";
    }
  }, [canGoNextLesson, runner]);

  type ClarityLensCard = {
    label: string;
    body: string;
  };

  const firstClarityText = (...values: Array<string | undefined | null>) => {
    for (const value of values) {
      const trimmed = (value ?? "").trim();
      if (trimmed) return trimmed;
    }
    return "";
  };

  const firstClarityFromList = (values?: Array<string | undefined | null>) => firstClarityText(...(values ?? []));

  const createClarityCard = (label: string, body?: string | null): ClarityLensCard | null => {
    const trimmed = (body ?? "").trim();
    return trimmed ? { label, body: trimmed } : null;
  };

  const buildClarityCards = (cards: Array<ClarityLensCard | null>): ClarityLensCard[] =>
    cards.filter((card): card is ClarityLensCard => Boolean(card));

  const renderClarityLensPanel = (eyebrow: string, title: string, cards: ClarityLensCard[]) => {
    if (!cards.length) return null;

    return (
      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{eyebrow}</p>
        <h4 className="mt-2 text-lg font-semibold text-slate-900">{normalizeLessonDisplayText(title)}</h4>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{normalizeLessonDisplayMultiline(card.body)}</p>
            </article>
          ))}
        </div>
      </section>
    );
  };

  const renderScaffoldRoleplayCard = (card: ScaffoldRoleplayCard, selectionKey: string) => {
    const selectedValue = scaffoldRoleplaySelections[selectionKey] ?? "";
    const selectedOption = card.options.find((option) => option.value === selectedValue) ?? null;
    const orderedOptions = getOrderedScaffoldRoleplayOptions(card);

    return (
      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            {card.badge}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Mission sim
          </span>
        </div>
        <h4 className="mt-3 text-xl font-semibold text-slate-900">{normalizeLessonDisplayText(card.title)}</h4>
        <p className="mt-3 text-sm leading-6 text-slate-700">{normalizeLessonDisplayMultiline(card.scenario)}</p>
        <div className="mt-4 rounded-2xl border border-white/90 bg-white/90 p-4 shadow-sm">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">Your move</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{normalizeLessonDisplayText(card.prompt)}</p>
          <div className="mt-4 grid gap-3">
            {orderedOptions.map((option) => {
              const isSelected = selectedValue === option.value;
              const isCorrect = Boolean(isSelected && option.isCorrect);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setScaffoldRoleplaySelections((current) => ({
                      ...current,
                      [selectionKey]: option.value,
                    }))
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-amber-300 bg-amber-50 text-amber-900"
                      : "border-slate-200 bg-white text-slate-800 hover:border-sky-200 hover:bg-sky-50/70"
                  }`}
                >
                  {normalizeLessonDisplayMultiline(option.label)}
                </button>
              );
            })}
          </div>
        </div>
        {selectedOption ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-4 shadow-sm ${
              selectedOption.isCorrect
                ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="text-sm font-semibold">
              {selectedOption.isCorrect
                ? card.successLabel ?? "That move keeps the mission readable."
                : card.retryLabel ?? "That move would send the crew off track."}
            </p>
            <p className="mt-2 text-sm leading-6">{normalizeLessonDisplayMultiline(selectedOption.feedback)}</p>
          </div>
        ) : null}
      </section>
    );
  };

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
      const normalizedLearnerAnswer = normalizeAssessmentText(learnerAnswer);
      const normalizedCorrectAnswer = normalizeAssessmentText(feedbackAnswer(item.correct_answer));
      const normalizedTeachingFocus = item.teaching_focus
        ? normalizeAssessmentText(normalizeTeachingFocusText(item.teaching_focus))
        : "";

      return (
        <div className="space-y-1">
          {normalizedLearnerAnswer ? (
            <p>
              <span className="font-medium">Your answer:</span> {normalizedLearnerAnswer}
            </p>
          ) : null}
          {showCorrectAnswer ? (
            <p>
              <span className="font-medium">Correct answer:</span> {normalizedCorrectAnswer}
            </p>
          ) : null}
          {normalizedTeachingFocus ? (
            <p>
              <span className="font-medium">Key idea:</span> {normalizedTeachingFocus}
            </p>
          ) : null}
          {item.is_correct ? null : (
            <MisconceptionRepairPanel
              tag={item.misconception_tag}
              prompt={item.prompt}
              learnerAnswer={item.learner_answer}
              correctAnswer={item.correct_answer}
              teachingFocus={item.teaching_focus}
            />
          )}
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
              body={normalizeAssessmentText(feedbackBody(item))}
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
            body={normalizeAssessmentText(feedbackBody(payload.recent_feedback))}
            extra={feedbackExtra(payload.recent_feedback)}
          />
        ) : null}
        {payload.instructions ? (
          <div className="rounded-2xl border bg-white p-5 shadow-sm text-slate-700">{normalizeLessonDisplayMultiline(payload.instructions)}</div>
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

    const scaffoldFocusCards = payload.teaching_focus_cards?.slice(0, 4) ?? [];
    const normalizedTeachingFocus = (payload.teaching_focus ?? []).map(normalizeTeachingFocusText);
    const introSections = (payload.lesson_introduction ?? []).map((section) => ({
      heading: normalizeLessonDisplayText(section.heading),
      body: normalizeLessonDisplayMultiline(section.body),
      bullets: (section.bullets ?? []).map(normalizeLessonDisplayMultiline),
    }));
    const hasIntroContent = Boolean(payload.intro || introSections.length);
    const hasTeachingFocus = normalizedTeachingFocus.length > 0;
    const separateTeachingFocusStep =
      (lessonId.startsWith("F1_") || lessonId.startsWith("F2_") || lessonId.startsWith("F3_")) &&
      hasIntroContent &&
      hasTeachingFocus;
    const scaffoldFocusItems = scaffoldFocusCards.length > 0
      ? scaffoldFocusCards.map((card) => card.title + ": " + card.detail + (card.why_it_matters ? " Why it matters: " + card.why_it_matters : ""))
      : normalizedTeachingFocus.slice(0, 4);
    const scaffoldClarityCards = buildClarityCards([
      createClarityCard("What is happening", firstClarityText(payload.title, scaffoldFocusItems[0])),
      createClarityCard("What to notice", scaffoldFocusItems[0]),
      createClarityCard("What changes", scaffoldFocusItems[1] ?? "The examples change one feature at a time so the concept stays readable."),
      createClarityCard("What stays the same", scaffoldFocusItems[2] ?? "The quantity definitions stay fixed while the examples change."),
      createClarityCard("Common mistake", firstClarityText(payload.misconception_targets?.[0], "Do not rush to a formula before naming what is changing and what is staying the same.")),
    ]);
    const introCount = hasIntroContent || (hasTeachingFocus && !separateTeachingFocusStep) ? 1 : 0;
    const teachingFocusCount = separateTeachingFocusStep ? 1 : 0;
    const clarityCount = scaffoldClarityCards.length ? 1 : 0;
    const tableCount = payload.reference_tables?.length ?? 0;
    const mediaCount = payload.media_cards?.length ?? 0;
    const sectionCount = payload.sections.length;
    const totalScaffoldActivities = introCount + clarityCount + teachingFocusCount + tableCount + mediaCount + sectionCount;
    const clampedScaffoldStepIndex = Math.max(0, Math.min(scaffoldStepIndex, Math.max(totalScaffoldActivities - 1, 0)));
    const clarityStart = introCount;
    const teachingFocusStart = clarityStart + clarityCount;
    const tableStart = teachingFocusStart + teachingFocusCount;
    const mediaStart = tableStart + tableCount;
    const sectionStart = mediaStart + mediaCount;
    const isIntroStep = introCount === 1 && clampedScaffoldStepIndex === 0;
    const isTeachingFocusStep = teachingFocusCount === 1 && clampedScaffoldStepIndex === teachingFocusStart;
    const isClarityStep = clarityCount === 1 && clampedScaffoldStepIndex === clarityStart;
    const isTableStep = clampedScaffoldStepIndex >= tableStart && clampedScaffoldStepIndex < mediaStart;
    const isMediaStep = clampedScaffoldStepIndex >= mediaStart && clampedScaffoldStepIndex < sectionStart;
    const isSectionStep = clampedScaffoldStepIndex >= sectionStart;
    const activeTable = isTableStep ? payload.reference_tables?.[clampedScaffoldStepIndex - tableStart] : null;
    const activeMediaCard = isMediaStep ? payload.media_cards?.[clampedScaffoldStepIndex - mediaStart] : null;
    const activeMediaHighlights = activeMediaCard
      ? dedupeSupportTextItems(activeMediaCard.highlights || [], [activeMediaCard.title, activeMediaCard.caption])
      : [];
    const activeSection = isSectionStep ? payload.sections[clampedScaffoldStepIndex - sectionStart] : null;
    const activeSectionFocus = firstClarityText(
      activeSection?.technical_words?.[0]?.meaning,
      activeSection?.formula_reference_rows?.[0]?.meaning,
      activeSection?.worked_example?.prompt,
      activeSection?.check_for_understanding,
    );
    const activeSectionChange = firstClarityText(
      activeSection?.worked_example?.steps?.[0],
      activeSection?.visual?.highlights?.[0],
      activeSection?.formula_reference_rows?.[0]?.conditions,
      activeSection?.analogy,
    );
    const activeSectionInvariant = firstClarityText(
      activeSection?.formula_constants_note,
      activeSection?.shared_formula_analogy,
      activeSection?.formula_reference_rows?.[0]?.units_text,
      activeSection?.technical_words?.[0]?.why_it_matters,
    );
    const activeTableIndex = isTableStep ? clampedScaffoldStepIndex - tableStart : -1;
    const activeMediaIndex = isMediaStep ? clampedScaffoldStepIndex - mediaStart : -1;
    const activeSectionHeading = isSectionStep ? normalizeLessonDisplayText(activeSection?.heading || "").toLowerCase() : "";
    const scaffoldClarityPanel = renderClarityLensPanel(
      "Concept-first frame",
      "Understand this idea before you move on",
      scaffoldClarityCards,
    );
      const scaffoldRoleplayCard =
        lessonId === "M1_L1" || lessonId === "F1_L1" || lessonId === "F1_L2" || lessonId === "F1_L3" || lessonId === "F1_L4" || lessonId === "F1_L5" || lessonId === "F1_L6" || lessonId === "F2_L1" || lessonId === "F2_L2" || lessonId === "F2_L3" || lessonId === "F2_L4" || lessonId === "F2_L5" || lessonId === "F2_L6" || lessonId === "F3_L1" || lessonId === "F3_L2" || lessonId === "F3_L3" || lessonId === "F3_L4" || lessonId === "F3_L5" || lessonId === "F3_L6" || lessonId === "F4_L1" || lessonId === "F4_L2" || lessonId === "F4_L3" || lessonId === "F4_L4" || lessonId === "F4_L5" || lessonId === "F4_L6"
          ? (() => {
              if (lessonId === "F4_L6") {
                if (isMediaStep && activeMediaIndex === 0) {
                  return {
                    id: "f4-l6-safety-board",
                    badge: "Safety board",
                    title: "Read the power-and-safety deck",
                    scenario:
                      "The Flow-Grid room is comparing a normal device run, a longer run, and a fault-current case. One trainee keeps mixing them up by saying a fuse measures total energy used and that a longer run must raise the power.",
                    prompt: "Choose the note to pin on the display.",
                    options: [
                      {
                        value: "power-time-current-limit",
                        label: "Power tells how much electrical energy is transferred each second. Letting the same power run longer increases total energy, while the fuse only responds if the current rises above its safe limit.",
                        feedback:
                          "Exactly. That keeps rate, total transfer, and safety cut-off in their proper roles.",
                        isCorrect: true,
                      },
                      {
                        value: "fuse-measures-total-energy",
                        label: "A fuse mainly tracks the total energy a device has used, so a longer run always makes the fuse more likely to melt even if the current stays normal.",
                        feedback:
                          "That is the trap. A fuse responds to dangerously large current, not to total energy by itself.",
                      },
                      {
                        value: "longer-run-raises-power",
                        label: "If the device stays on longer, the power must rise, because a longer run means the circuit transfers more energy each second than before.",
                        feedback:
                          "Longer time can raise the total transferred energy, but it does not by itself change the power per second.",
                      },
                    ],
                    successLabel: "Pinned. The room can now read power, total transfer, and safety as one connected story.",
                    retryLabel: "That note would blur the rate, time, and safety-limit roles the lesson is trying to secure.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (isSectionStep && !activeSection?.worked_example) {
                  if (activeSectionHeading === "fix these ideas") {
                    return {
                      id: "f4-l6-fix-ideas",
                      badge: "Signal repair",
                      title: "Repair the first safety note",
                      scenario:
                        "A trainee has written that a fuse boosts power when a device needs extra energy and only opens after the device has used too much total energy. You need the correction that fixes that note before the lesson moves on.",
                      prompt: "Choose the correction to send.",
                      options: [
                        {
                          value: "fuse-stops-large-current",
                          label: "A fuse is a safety device that breaks the circuit when current becomes dangerously large. It does not boost power and it does not measure total energy used over time.",
                          feedback:
                            "Exactly. That correction puts the fuse back in its proper current-limit role.",
                          isCorrect: true,
                        },
                        {
                          value: "fuse-adds-extra-push",
                          label: "A fuse adds extra push when a device needs more power, then disconnects the route only after the device has finished using the extra energy.",
                          feedback:
                            "That keeps both mistakes alive. A fuse does not increase push; it interrupts unsafe current.",
                        },
                        {
                          value: "fuse-stores-charge",
                          label: "A fuse stores spare charge in the route, so if the current rises it can soak up the extra charge before the wire overheats.",
                          feedback:
                            "A fuse is not a charge store. Its role is to break the route if current becomes unsafe.",
                        },
                      ],
                      successLabel: "Repair sent. The room now treats the fuse as a current safety gate, not a power booster.",
                      retryLabel: "That would leave the fuse story blurred into power or energy storage.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "core idea") {
                    return {
                      id: "f4-l6-core-idea",
                      badge: "Ops summary",
                      title: "Post the one-line safety rule",
                      scenario:
                        "Control wants one sentence on the wall so every learner starts the power-and-safety lesson with the right anchor.",
                      prompt: "Choose the line to post.",
                      options: [
                        {
                          value: "power-time-safety-anchor",
                          label: "Power tells how fast energy is transferred, total energy depends on power and time together, and safety depends on keeping current below the fuse or breaker limit.",
                          feedback:
                            "Exactly. That is the clean anchor sentence this lesson needs.",
                          isCorrect: true,
                        },
                        {
                          value: "power-is-total-energy",
                          label: "Power is the total energy used by the device, while the fuse checks whether the device has been running for too long.",
                          feedback:
                            "That mixes up the lesson roles. Power is a rate, and the fuse responds to current, not simply to running time.",
                        },
                        {
                          value: "fuse-controls-power-directly",
                          label: "The main safety idea is that the fuse controls how much power the circuit can have, so energy and current do not need to be separated in the analysis.",
                          feedback:
                            "The lesson needs those ideas separated. The fuse limits unsafe current; power and total energy still need their own reasoning.",
                        },
                      ],
                      successLabel: "Posted. The room now starts from rate, total transfer, and safety-limit roles that stay distinct.",
                      retryLabel: "That line would keep the power and safety story blurred together.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "how to reason through it") {
                    return {
                      id: "f4-l6-how-to-reason",
                      badge: "Coach move",
                      title: "Coach the safety analyst",
                      scenario:
                        "A trainee keeps skipping between formulas and missing whether the question is about rate, total transfer, or safety cut-off. You need the coaching note that gives them a reliable order.",
                      prompt: "Choose the coaching note to send.",
                      options: [
                        {
                          value: "power-then-energy-then-safety",
                          label: "First use P = VI to find the transfer rate each second. Then use E = Pt if the question asks for total energy over a running time. After that, compare the current with the fuse or breaker rating to decide whether the route stays safe.",
                          feedback:
                            "Exactly. That keeps the analysis ordered around rate first, total transfer second, and safety check third.",
                          isCorrect: true,
                        },
                        {
                          value: "time-first-then-voltage",
                          label: "First decide how long the device runs, because a longer time tells you the power. Then compare the voltage with the fuse rating to decide whether the route is safe.",
                          feedback:
                            "Time alone does not tell you the power, and fuse ratings are about current, not voltage.",
                        },
                        {
                          value: "fuse-first-everything-else-follows",
                          label: "First check the fuse rating, because once you know that you can treat power and total energy as the same quantity for the rest of the calculation.",
                          feedback:
                            "The fuse check matters, but power and total energy still answer different questions and cannot be collapsed into one quantity.",
                        },
                      ],
                      successLabel: "Coaching note sent. The analyst now has a stable power-energy-safety method instead of a blur of formulas.",
                      retryLabel: "That method would scramble the lesson sequence instead of clarifying it.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "common trap") {
                    return {
                      id: "f4-l6-common-trap",
                      badge: "Trap shield",
                      title: "Block the longer-time-means-more-power shortcut",
                      scenario:
                        "The next learner note says: 'If the same device runs for longer, its power becomes bigger because the total energy is larger.' You need the warning that blocks that shortcut before it spreads.",
                      prompt: "Choose the warning to pin beside the trap.",
                      options: [
                        {
                          value: "time-changes-total-not-rate",
                          label: "Running for longer can increase the total transferred energy, but it does not by itself change the power. Power is the rate of energy transfer each second.",
                          feedback:
                            "Exactly. That warning blocks the time-changes-power shortcut cleanly.",
                          isCorrect: true,
                        },
                        {
                          value: "longer-time-raises-current",
                          label: "A longer run always raises the current, so the power must rise too even if the circuit itself has not changed.",
                          feedback:
                            "Current does not rise just because time passes. The circuit conditions have to change for the current to change.",
                        },
                        {
                          value: "fuse-responds-to-long-time",
                          label: "The fuse becomes the main reason power rises over time, because the safety gate delays the transfer at first and then releases it later.",
                          feedback:
                            "That would invent the wrong fuse story. A fuse responds to unsafe current; it does not gradually change the power over time.",
                        },
                      ],
                      successLabel: "Trap blocked. The room now keeps transfer rate and total transfer in the right places.",
                      retryLabel: "That warning would let the power-versus-total-energy shortcut survive.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "analogy") {
                    return {
                      id: "f4-l6-analogy",
                      badge: "Story relay",
                      title: "Choose the safety-gate bridge",
                      scenario:
                        "The team wants one analogy line that helps learners picture rate, total transfer, and safety cut-off together without turning the fuse into a power source.",
                      prompt: "Choose the analogy line to send.",
                      options: [
                        {
                          value: "stream-rate-run-time-safety-gate",
                          label: "Use the analogy by keeping a stream rate for power, a longer running time for the growing total transfer, and a safety gate that opens only when the stream becomes dangerously large.",
                          feedback:
                            "Exactly. That keeps the analogy serving all three lesson moves without giving the safety gate the wrong job.",
                          isCorrect: true,
                        },
                        {
                          value: "gate-adds-extra-stream",
                          label: "Use the analogy by saying the safety gate adds more stream whenever the device needs extra energy, because that makes the role of the fuse feel more active.",
                          feedback:
                            "That breaks the lesson meaning. The safety gate cuts off unsafe current; it does not add extra stream.",
                        },
                        {
                          value: "longer-run-means-faster-stream",
                          label: "Use the analogy by saying the stream automatically gets faster the longer the route stays open, because that shows why long runs give more total energy.",
                          feedback:
                            "Longer running time can give more total transfer without making the stream faster. The analogy needs time and rate kept separate.",
                        },
                      ],
                      successLabel: "Analogy chosen. It supports power, total transfer, and safety cut-off without mixing their roles.",
                      retryLabel: "That analogy would blur the safety story instead of clarifying it.",
                    } satisfies ScaffoldRoleplayCard;
                  }
                }
              }

              if (lessonId === "F4_L5") {
                if (isMediaStep && activeMediaIndex === 0) {
                  return {
                    id: "f4-l5-branch-board",
                    badge: "Branch board",
                    title: "Read the split-route comparison",
                    scenario:
                      "The Flow-Grid room is comparing one branch deck with another branch added in parallel. One trainee keeps saying the voltage must split between the branches because the current splits there too.",
                    prompt: "Choose the note to pin on the display.",
                    options: [
                      {
                        value: "same-voltage-current-splits",
                        label: "Each branch spans the same two supply points, so each branch gets the same voltage. The current is what splits between the branches and recombines afterward.",
                        feedback:
                          "Exactly. That keeps the branch story anchored to shared endpoints, shared voltage, and split current.",
                        isCorrect: true,
                      },
                      {
                        value: "voltage-splits-between-branches",
                        label: "The voltage must split between the branches first, and then the current adjusts itself inside each branch afterward.",
                        feedback:
                          "That is the trap. In parallel, each branch connects across the same two points, so the branch voltage is the same.",
                      },
                      {
                        value: "same-current-in-every-branch",
                        label: "The current must be the same in every branch, because the source sends out one stream that each branch has to copy exactly.",
                        feedback:
                          "Current only stays the same everywhere in one-route series circuits. In parallel, it splits between the branches.",
                      },
                    ],
                    successLabel: "Pinned. The room can now read the branch deck with shared voltage and split current.",
                    retryLabel: "That note would break the parallel branch story the lesson is trying to secure.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (isSectionStep && !activeSection?.worked_example) {
                  if (activeSectionHeading === "fix these ideas") {
                    return {
                      id: "f4-l5-fix-ideas",
                      badge: "Signal repair",
                      title: "Repair the first parallel note",
                      scenario:
                        "A trainee has written that each parallel branch gets only part of the battery voltage because the current has to split there. You need the correction that fixes that note before the lesson moves on.",
                      prompt: "Choose the correction to send.",
                      options: [
                        {
                          value: "same-endpoints-same-voltage",
                          label: "Parallel branches connect across the same two points, so each branch gets the same potential difference as the supply across those points.",
                          feedback:
                            "Exactly. That correction secures the shared-endpoint idea that makes the branch voltage the same.",
                          isCorrect: true,
                        },
                        {
                          value: "voltage-halves-when-current-splits",
                          label: "When current splits, the voltage must split with it, so each branch only keeps part of the original push.",
                          feedback:
                            "That keeps the mistake alive. Voltage does not split in parallel branches that share the same two endpoints.",
                        },
                        {
                          value: "branch-voltage-depends-only-on-current",
                          label: "The branch with more current automatically gets the larger voltage, because current determines the push on that route.",
                          feedback:
                            "Current and voltage are linked through resistance, but the shared branch endpoints still make the branch voltage the same.",
                        },
                      ],
                      successLabel: "Repair sent. The room now keeps branch voltage tied to shared endpoints.",
                      retryLabel: "That would leave the voltage-splitting shortcut active.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "core idea") {
                    return {
                      id: "f4-l5-core-idea",
                      badge: "Ops summary",
                      title: "Post the one-line parallel rule",
                      scenario:
                        "Control wants one sentence on the wall so every learner starts the parallel lesson with the right anchor.",
                      prompt: "Choose the line to post.",
                      options: [
                        {
                          value: "shared-voltage-split-current",
                          label: "A parallel circuit is a split-route network: each branch gets the same voltage, while current splits between branches and recombines afterward.",
                          feedback:
                            "Exactly. That is the clean anchor sentence this lesson needs.",
                          isCorrect: true,
                        },
                        {
                          value: "same-current-shared-voltage",
                          label: "A parallel circuit keeps the same current in every branch, while the voltage is shared between the routes depending on branch size.",
                          feedback:
                            "That flips the lesson story. In parallel, voltage is shared across each branch, while current is what splits.",
                        },
                        {
                          value: "more-branches-same-total-current",
                          label: "A parallel circuit just gives the source more routes to choose from, but the total current stays fixed because the battery decides it in advance.",
                          feedback:
                            "The source current is not fixed in advance. Adding branches usually changes the total resistance and raises the total current.",
                        },
                      ],
                      successLabel: "Posted. The room now starts from the split-route meaning instead of a series-circuit shortcut.",
                      retryLabel: "That line would blur the branch-voltage and branch-current roles.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "how to reason through it") {
                    return {
                      id: "f4-l5-how-to-reason",
                      badge: "Coach move",
                      title: "Coach the branch analyst",
                      scenario:
                        "A trainee keeps jumping straight into numbers and losing track of which quantity is shared across the branches. You need the coaching note that gives them a reliable order.",
                      prompt: "Choose the coaching note to send.",
                      options: [
                        {
                          value: "branch-voltage-first-then-add-currents",
                          label: "First mark that each branch gets the same voltage. Then find each branch current from its own resistance and add the branch currents to get the total source current.",
                          feedback:
                            "Exactly. That keeps the branch-voltage story and the current-adds-at-the-junction story in the right order.",
                          isCorrect: true,
                        },
                        {
                          value: "split-voltage-then-share-current",
                          label: "First split the voltage between the branches, then keep the same current in each branch so the total stays simple.",
                          feedback:
                            "That uses the series rule in the wrong place. Parallel branches share voltage, while current depends on each branch resistance.",
                        },
                        {
                          value: "add-resistances-before-branches",
                          label: "First add every branch resistance directly, then use one current for the entire circuit so you do not need to think about each branch separately.",
                          feedback:
                            "That skips the branch logic the lesson is trying to secure. Branch currents have to be reasoned through branch by branch.",
                        },
                      ],
                      successLabel: "Coaching note sent. The analyst now has a stable parallel-circuit method instead of a series shortcut.",
                      retryLabel: "That method would scramble the branch quantities instead of ordering them.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "common trap") {
                    return {
                      id: "f4-l5-common-trap",
                      badge: "Trap shield",
                      title: "Block the voltage-splits-in-parallel shortcut",
                      scenario:
                        "The next learner note says: 'Two branches means half the voltage in each branch.' You need the warning that blocks that shortcut before it spreads.",
                      prompt: "Choose the warning to pin beside the trap.",
                      options: [
                        {
                          value: "same-two-points-same-voltage",
                          label: "Branches connected across the same two points share the same potential difference. What changes between branches is the current, not the branch voltage.",
                          feedback:
                            "Exactly. That warning blocks the series-style voltage-sharing shortcut.",
                          isCorrect: true,
                        },
                        {
                          value: "current-decides-voltage-share",
                          label: "The branch with the greater current automatically takes the greater voltage, so voltage only matches if the branch currents happen to match too.",
                          feedback:
                            "Branch currents can differ, but the branch voltage is still the same when the endpoints are the same.",
                        },
                        {
                          value: "more-branches-means-less-push-per-branch",
                          label: "Every new branch makes the push weaker in all the other branches, because the supply has to spread itself thinner as the routes multiply.",
                          feedback:
                            "Adding branches changes the total current and equivalent resistance, but it does not force the branch voltage to split.",
                        },
                      ],
                      successLabel: "Trap blocked. The room now keeps shared branch voltage and split current in the right places.",
                      retryLabel: "That warning would let the parallel-voltage shortcut survive.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "analogy") {
                    return {
                      id: "f4-l5-analogy",
                      badge: "Story relay",
                      title: "Choose the branch-deck bridge",
                      scenario:
                        "The team wants one analogy line that helps learners picture several routes between the same two points without turning the lesson into a one-lane series story.",
                      prompt: "Choose the analogy line to send.",
                      options: [
                        {
                          value: "same-start-finish-split-stream",
                          label: "Use the analogy by keeping the same start and finish points for each route. The push across each route is the same, while the stream divides between the routes and recombines later.",
                          feedback:
                            "Exactly. That keeps the analogy serving the split-route parallel meaning cleanly.",
                          isCorrect: true,
                        },
                        {
                          value: "one-lane-many-gates",
                          label: "Use the analogy by keeping one lane and adding more gates on the same route, because that shows why each branch should keep the same current.",
                          feedback:
                            "That would build a series picture, not a parallel one. Parallel needs multiple routes between the same two points.",
                        },
                        {
                          value: "different-starts-different-voltages",
                          label: "Use the analogy by giving each route a different starting point so learners can see why each branch can end up with its own voltage.",
                          feedback:
                            "That breaks the key lesson idea. The same start and finish points are what make the branch voltage the same.",
                        },
                      ],
                      successLabel: "Analogy chosen. It supports shared branch voltage without slipping back into series language.",
                      retryLabel: "That analogy would blur the branch structure instead of clarifying it.",
                    } satisfies ScaffoldRoleplayCard;
                  }
                }
              }

              if (lessonId === "F4_L4") {
                if (isMediaStep && activeMediaIndex === 0) {
                  return {
                    id: "f4-l4-series-board",
                    badge: "Loop board",
                    title: "Read the one-route comparison",
                    scenario:
                      "The Flow-Grid room is comparing one series loop with an added resistor in the same route. One trainee keeps saying only the new resistor should be affected, while the rest of the loop should stay unchanged.",
                    prompt: "Choose the note to pin on the display.",
                    options: [
                      {
                        value: "whole-loop-changes",
                        label: "In a series circuit there is one route, so adding another resistor makes the whole route harder. The current falls everywhere, while the source voltage is shared across the components.",
                        feedback:
                          "Exactly. That keeps the one-route idea tied to both the shared current and the voltage-sharing story.",
                        isCorrect: true,
                      },
                      {
                        value: "only-new-resistor-changes",
                        label: "Only the new resistor changes, because the original part of the circuit already had its own current and voltage before the extra component was added.",
                        feedback:
                          "That is the trap. In one route, the whole loop responds together, so the current changes everywhere.",
                      },
                      {
                        value: "series-splits-current",
                        label: "The current splits between the series components, so each resistor gets a smaller current after the extra resistor is added.",
                        feedback:
                          "Current does not split in series. The same current passes every component on the single route.",
                      },
                    ],
                    successLabel: "Pinned. The room can now read a series circuit as one shared route that changes as a whole.",
                    retryLabel: "That note would break the one-route story the lesson is trying to secure.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (isSectionStep && !activeSection?.worked_example) {
                  if (activeSectionHeading === "fix these ideas") {
                    return {
                      id: "f4-l4-fix-ideas",
                      badge: "Signal repair",
                      title: "Repair the first series note",
                      scenario:
                        "A trainee has written that series circuits split the current between components the same way branch circuits do. You need the correction that fixes that note before the lesson moves on.",
                      prompt: "Choose the correction to send.",
                      options: [
                        {
                          value: "same-current-one-route",
                          label: "A series circuit has one route, so the same current passes through every component. What gets shared is the source voltage, not the current.",
                          feedback:
                            "Exactly. That correction secures the series current rule and the shared-voltage idea together.",
                          isCorrect: true,
                        },
                        {
                          value: "current-splits-in-series",
                          label: "Series circuits split the current between resistors because each resistor takes the part it needs before the rest of the loop continues.",
                          feedback:
                            "That keeps the mistake alive. Current splitting belongs to parallel branches, not to one-route series circuits.",
                        },
                        {
                          value: "voltage-same-everywhere",
                          label: "Series circuits keep the voltage the same across every component, so current must change instead to balance the loop.",
                          feedback:
                            "This swaps the rules. In series, the current stays the same while the supply voltage is shared.",
                        },
                      ],
                      successLabel: "Repair sent. The room now treats series circuits as one-route current stories.",
                      retryLabel: "That would leave the series-versus-parallel mix-up in place.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "core idea") {
                    return {
                      id: "f4-l4-core-idea",
                      badge: "Ops summary",
                      title: "Post the one-line series rule",
                      scenario:
                        "Control wants one sentence on the wall so every learner starts the series-circuit lesson with the right anchor.",
                      prompt: "Choose the line to post.",
                      options: [
                        {
                          value: "one-route-same-current",
                          label: "A series circuit is one complete route: the same current flows through every component, and the supply voltage is shared across the route sections.",
                          feedback:
                            "Exactly. That is the clean anchor sentence this lesson needs.",
                          isCorrect: true,
                        },
                        {
                          value: "series-shares-current",
                          label: "A series circuit shares the current between its components, while each component gets the full supply voltage from the battery.",
                          feedback:
                            "That reverses the lesson story. In series, current stays common and voltage is shared.",
                        },
                        {
                          value: "series-components-independent",
                          label: "Each series component mainly responds on its own, so adding a new resistor changes the voltage at that resistor only and leaves the rest of the loop alone.",
                          feedback:
                            "One-route networks respond together. Adding difficulty affects the current everywhere in the loop.",
                        },
                      ],
                      successLabel: "Rule posted. The room now has one clean series-circuit anchor.",
                      retryLabel: "That line would blur current sharing and voltage sharing into the wrong pattern.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "how to reason through it") {
                    return {
                      id: "f4-l4-how-to-reason",
                      badge: "Guidance channel",
                      title: "Coach the series-circuit analyst",
                      scenario:
                        "A trainee analyst wants to calculate each resistor separately before deciding what stays the same in a one-route circuit or what should be added first.",
                      prompt: "Choose the coaching instruction.",
                      options: [
                        {
                          value: "add-resistance-find-current-first",
                          label: "First identify one route. Add the series resistances, use the supply voltage to find the one shared current, then work out how the voltage is shared across the components.",
                          feedback:
                            "Exactly. That keeps the arithmetic tied to the one-route story instead of letting the learner guess locally.",
                          isCorrect: true,
                        },
                        {
                          value: "solve-each-resistor-alone",
                          label: "Treat each resistor as its own little circuit first, because the current and voltage through one component do not depend much on the others in series.",
                          feedback:
                            "That misses the whole-loop structure. In series, the components are linked by one shared route.",
                        },
                        {
                          value: "split-current-first",
                          label: "Start by splitting the current between the resistors, then add the voltage drops afterward if there is time.",
                          feedback:
                            "That brings in the wrong rule. Current does not split in a series circuit.",
                        },
                      ],
                      successLabel: "Good coaching. The analyst now has a reliable one-route method.",
                      retryLabel: "That instruction would push the analyst back toward disconnected component guessing.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "common trap") {
                    return {
                      id: "f4-l4-common-trap",
                      badge: "Trap alert",
                      title: "Block the current-splits-in-series shortcut",
                      scenario:
                        "One crew member keeps saying each resistor in series should get a different current because each one has a different resistance. You need the warning that shuts that shortcut down.",
                      prompt: "Choose the trap warning.",
                      options: [
                        {
                          value: "same-current-shared-voltage",
                          label: "In one route, the same current must pass every component. Different resistances take different shares of the supply voltage instead of different shares of the current.",
                          feedback:
                            "Exactly. That warning protects the lesson's most important series distinction.",
                          isCorrect: true,
                        },
                        {
                          value: "bigger-resistor-less-current-through-it",
                          label: "A bigger resistor must have less current through it, even in series, because harder components always take a smaller share of the loop current.",
                          feedback:
                            "That keeps the trap alive. In series, harder components take a bigger voltage drop, not a smaller current.",
                        },
                        {
                          value: "series-gets-full-voltage-each",
                          label: "Each resistor keeps the full battery voltage in series, so the current can change from one component to the next as needed.",
                          feedback:
                            "The supply voltage is shared in series, so each resistor does not keep the full battery voltage.",
                        },
                      ],
                      successLabel: "Trap blocked. The room now keeps series current and voltage roles in the right places.",
                      retryLabel: "That warning would leave the series-current shortcut active.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "analogy") {
                    return {
                      id: "f4-l4-analogy",
                      badge: "Story relay",
                      title: "Choose the one-lane chain bridge",
                      scenario:
                        "The team wants one analogy line that helps learners picture several difficult sections on the same single route, without turning the lesson into a branch or split-current story.",
                      prompt: "Choose the analogy line to send.",
                      options: [
                        {
                          value: "one-lane-more-gates",
                          label: "Use the analogy by keeping one lane and adding more gates to that same route. The stream rate is common everywhere, but the total route gets harder and the source push is shared across the gates.",
                          feedback:
                            "Exactly. That keeps the analogy serving the one-route series meaning cleanly.",
                          isCorrect: true,
                        },
                        {
                          value: "many-lanes-series",
                          label: "Use the analogy by showing several side lanes, because that is the easiest way to explain why different components can take different amounts of current.",
                          feedback:
                            "That would build a parallel-circuit picture, not a series one.",
                        },
                        {
                          value: "each-gate-gets-full-push",
                          label: "Use the analogy by saying each gate in the same lane receives the full original push, because source push does not need to be shared in a single route.",
                          feedback:
                            "The lesson needs the source push shared across the route sections, not repeated in full at each gate.",
                        },
                      ],
                      successLabel: "Analogy chosen. It supports the one-route current story without slipping into branch language.",
                      retryLabel: "That analogy would blur the series structure instead of clarifying it.",
                    } satisfies ScaffoldRoleplayCard;
                  }
                }
              }

              if (lessonId === "F4_L3") {
                if (isMediaStep && activeMediaIndex === 0) {
                  return {
                    id: "f4-l3-route-board",
                    badge: "Route board",
                    title: "Read the push-difficulty comparison",
                    scenario:
                      "The Flow-Grid room is comparing two ohmic routes and their straight I-V lines. One trainee keeps saying the steeper line must show greater resistance because it climbs faster.",
                    prompt: "Choose the note to pin on the display.",
                    options: [
                      {
                        value: "steeper-means-lower-resistance",
                        label: "A steeper straight I-V line means more current flows for each extra volt, so the route is easier and the resistance is lower.",
                        feedback:
                          "Exactly. That keeps the graph shape tied to current response per volt, which is the key lesson move here.",
                        isCorrect: true,
                      },
                      {
                        value: "steeper-means-higher-resistance",
                        label: "A steeper straight I-V line means the route is harder, because the graph rises more sharply and so the resistance must be greater.",
                        feedback:
                          "That is the trap. Greater resistance gives less current for each volt, so its straight line is flatter, not steeper.",
                      },
                      {
                        value: "slope-does-not-matter",
                        label: "Once the graph is a straight line through the origin, the slope no longer matters because any straight ohmic line shows the same resistance.",
                        feedback:
                          "Straightness shows the proportional pattern, but the slope still matters because it shows how much current you get for each volt.",
                      },
                    ],
                    successLabel: "Pinned. The room can now read steeper I-V lines as easier routes with lower resistance.",
                    retryLabel: "That note would keep the steeper-means-harder shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (isSectionStep && !activeSection?.worked_example) {
                  if (activeSectionHeading === "fix these ideas") {
                    return {
                      id: "f4-l3-fix-ideas",
                      badge: "Signal repair",
                      title: "Repair the first resistance note",
                      scenario:
                        "A trainee has written that resistance is basically stored charge waiting inside the resistor. You need the correction that fixes that note before the lesson moves on.",
                      prompt: "Choose the correction to send.",
                      options: [
                        {
                          value: "resistance-is-path-difficulty",
                          label: "Resistance is how strongly the route opposes current. It is the path difficulty, not stored charge and not extra energy inside the component.",
                          feedback:
                            "Exactly. That correction puts resistance back in its proper role as opposition to current.",
                          isCorrect: true,
                        },
                        {
                          value: "resistance-is-stored-charge",
                          label: "Resistance is the amount of charge the component can hold back, so a resistor with more stored charge has the greater resistance.",
                          feedback:
                            "That keeps the mistake alive. Resistance is not stored charge; it is the route difficulty faced by moving charge.",
                        },
                        {
                          value: "resistance-is-voltage",
                          label: "Resistance is really just another name for potential difference, because both tell you how strong the electrical push is.",
                          feedback:
                            "Voltage and resistance play different roles. Voltage is the push; resistance is the path difficulty that responds to that push.",
                        },
                      ],
                      successLabel: "Repair sent. The room now treats resistance as route difficulty instead of stored charge.",
                      retryLabel: "That would leave the resistance story blurred into charge storage or voltage.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "core idea") {
                    return {
                      id: "f4-l3-core-idea",
                      badge: "Ops summary",
                      title: "Post the one-line resistance rule",
                      scenario:
                        "Control wants one sentence on the wall so every learner starts the resistance lesson with the right anchor.",
                      prompt: "Choose the line to post.",
                      options: [
                        {
                          value: "current-needs-push-and-difficulty",
                          label: "For an ohmic component, current depends on both push and path difficulty: more voltage gives more current, while more resistance gives less current.",
                          feedback:
                            "Exactly. That is the clean anchor sentence this lesson needs.",
                          isCorrect: true,
                        },
                        {
                          value: "resistance-creates-current",
                          label: "Resistance is what creates current in the route, so a bigger resistance gives a stronger stream once the battery is connected.",
                          feedback:
                            "That reverses the lesson story. Resistance opposes current; it does not create it.",
                        },
                        {
                          value: "current-only-needs-voltage",
                          label: "Only the voltage matters once a battery is chosen, because resistance just changes the component label and not the stream itself.",
                          feedback:
                            "Resistance matters directly. At the same voltage, a harder path gives less current.",
                        },
                      ],
                      successLabel: "Rule posted. The room now has one clean resistance anchor.",
                      retryLabel: "That line would blur current, voltage, and resistance into the wrong relationship.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "how to reason through it") {
                    return {
                      id: "f4-l3-how-to-reason",
                      badge: "Guidance channel",
                      title: "Coach the I-V analyst",
                      scenario:
                        "A trainee analyst wants to divide numbers immediately without first deciding what is being held fixed, or whether the question is about current, resistance, or graph meaning.",
                      prompt: "Choose the coaching instruction.",
                      options: [
                        {
                          value: "hold-one-variable-fixed",
                          label: "First decide what is being held fixed. At fixed resistance, compare how current responds to voltage. At fixed voltage, compare how current responds to resistance. Then use I = V / R or R = V / I.",
                          feedback:
                            "Exactly. That keeps the formula tied to the push-and-difficulty story instead of turning it into blind substitution.",
                          isCorrect: true,
                        },
                        {
                          value: "always-divide-voltage-by-current",
                          label: "Start by dividing voltage by current in every resistance question, because once you have a number the graph meaning will take care of itself.",
                          feedback:
                            "That is too mechanical. This lesson needs the fixed quantity and the graph meaning identified before the arithmetic starts.",
                        },
                        {
                          value: "focus-on-steepness-only",
                          label: "Start with the graph slope only, because once the line is steeper or flatter you can ignore which quantity changed or what stayed fixed.",
                          feedback:
                            "Graph slope matters, but the lesson still needs the push-versus-difficulty comparison kept explicit.",
                        },
                      ],
                      successLabel: "Good coaching. The analyst now has a reliable push-and-difficulty method.",
                      retryLabel: "That instruction would push the analyst back toward formula guessing.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "common trap") {
                    return {
                      id: "f4-l3-common-trap",
                      badge: "Trap alert",
                      title: "Block the steeper-means-harder shortcut",
                      scenario:
                        "One crew member keeps saying the steeper straight I-V line must show greater resistance because the line rises faster. You need the warning that shuts that shortcut down.",
                      prompt: "Choose the trap warning.",
                      options: [
                        {
                          value: "more-current-per-volt",
                          label: "A steeper straight I-V line means more current flows for each volt, so the route is easier and the resistance is lower.",
                          feedback:
                            "Exactly. That warning protects the lesson's most important graph distinction.",
                          isCorrect: true,
                        },
                        {
                          value: "steeper-means-more-resistance",
                          label: "A steeper line must mean the current is fighting harder to rise, so the component has the greater resistance.",
                          feedback:
                            "That keeps the trap alive. Higher resistance gives less current per volt, so its straight line is flatter.",
                        },
                        {
                          value: "all-straight-lines-same",
                          label: "Any straight I-V line through the origin shows the same resistance, so there is no need to compare steepness once the line is ohmic.",
                          feedback:
                            "Straightness shows proportionality, but the slope still shows how easily current rises for each volt.",
                        },
                      ],
                      successLabel: "Trap blocked. The room now reads steeper I-V lines the right way.",
                      retryLabel: "That warning would leave the steeper-equals-greater-resistance shortcut active.",
                    } satisfies ScaffoldRoleplayCard;
                  }

                  if (activeSectionHeading === "analogy") {
                    return {
                      id: "f4-l3-analogy",
                      badge: "Story relay",
                      title: "Choose the route-difficulty bridge",
                      scenario:
                        "The team wants one analogy line that helps learners picture the same source push acting on an easier route and a harder route, without turning resistance into stored charge or a second kind of current.",
                      prompt: "Choose the analogy line to send.",
                      options: [
                        {
                          value: "same-push-easier-route",
                          label: "Use the analogy by keeping the same push and comparing two routes: the easier route gives the bigger stream rate, while the harder route gives the smaller stream rate.",
                          feedback:
                            "Exactly. That keeps the analogy serving the push-and-difficulty meaning cleanly.",
                          isCorrect: true,
                        },
                        {
                          value: "harder-route-stores-packets",
                          label: "Use the analogy by showing the harder route holding extra packets inside itself, because that is the easiest way to picture higher resistance.",
                          feedback:
                            "That would build the exact misconception this lesson is trying to remove.",
                        },
                        {
                          value: "push-and-difficulty-are-same",
                          label: "Use the analogy by treating push and route difficulty as two names for the same idea, because both change the current response.",
                          feedback:
                            "The lesson needs them kept separate. Push and route difficulty both matter, but they play different roles.",
                        },
                      ],
                      successLabel: "Analogy chosen. It supports resistance as route difficulty without slipping into storage or current confusion.",
                      retryLabel: "That analogy would blur the push-and-difficulty story instead of clarifying it.",
                    } satisfies ScaffoldRoleplayCard;
                  }
                }
              }

              if (lessonId === "F4_L2") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f4-l2-push-board",
                  badge: "Source board",
                  title: "Read the energy-per-charge comparison",
                  scenario:
                    "The Flow-Grid room is comparing a weaker source and a stronger source using the same moving charge packets. One trainee keeps treating a bigger potential difference as if it means more charge is moving rather than more energy per coulomb.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "voltage-is-energy-per-charge",
                      label: "Potential difference tells how much energy each coulomb gains or loses. A bigger voltage means each charge packet carries more energy change, not that extra charge has appeared.",
                      feedback:
                        "Exactly. That keeps voltage tied to energy per charge instead of to total charge or current.",
                      isCorrect: true,
                    },
                    {
                      value: "voltage-means-more-charge",
                      label: "A bigger potential difference means more charge must be moving through the circuit, because voltage is the amount of charge being pushed around the loop.",
                      feedback:
                        "That is the trap. Voltage is not the amount of charge; it is the energy transferred for each coulomb of charge.",
                    },
                    {
                      value: "voltage-is-total-energy-only",
                      label: "Potential difference gives the total energy in the whole circuit, so you can ignore how much charge is involved once the source is chosen.",
                      feedback:
                        "Potential difference still needs the 'per charge' part. Total energy transferred depends on both voltage and how much charge moves.",
                    },
                  ],
                  successLabel: "Pinned. The room can now read voltage as energy per charge instead of as extra charge in the loop.",
                  retryLabel: "That note would blur voltage back into charge amount or total energy.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f4-l2-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first voltage note",
                    scenario:
                      "A trainee has written that potential difference is just the amount of charge in the circuit. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "energy-per-coulomb",
                        label: "Potential difference tells how much energy is transferred to or from each coulomb. The amount of charge and the energy per charge must stay separate.",
                        feedback:
                          "Exactly. That correction separates charge amount from energy per charge, which is the key lesson move here.",
                        isCorrect: true,
                      },
                      {
                        value: "voltage-is-charge",
                        label: "Potential difference is really just the amount of charge in the circuit, written in a different unit so the battery story sounds more electrical.",
                        feedback:
                          "That keeps the mistake alive. Voltage is about energy per charge, not how much charge exists.",
                      },
                      {
                        value: "voltage-is-current-speed",
                        label: "Potential difference tells how quickly the charge is moving, so a bigger voltage always means the current must already be larger too.",
                        feedback:
                          "Current and potential difference are different ideas. This lesson needs energy per charge secured before current-rate links come later.",
                      },
                    ],
                    successLabel: "Repair sent. The energy-per-charge story is now back in place.",
                    retryLabel: "That would leave the voltage-equals-charge mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f4-l2-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line voltage rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner starts the potential-difference lesson with the right anchor.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "voltage-energy-per-charge",
                        label: "Potential difference is the energy transferred per unit charge, so it tells how much energy each coulomb gains from a source or loses in a component.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "voltage-is-total-energy",
                        label: "Potential difference is the total energy in the circuit, which is why you do not need to think about charge once voltage is known.",
                        feedback:
                          "That drops the 'per charge' meaning. This lesson needs voltage tied to each coulomb, not to the whole circuit total by itself.",
                      },
                      {
                        value: "voltage-is-route-difficulty",
                        label: "Potential difference mainly tells how hard the route is for charge, so it is effectively the same idea as resistance in a simpler form.",
                        feedback:
                          "That swaps this lesson with the resistance lesson. Here, voltage is the energy transfer per charge, not the path difficulty.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean voltage anchor.",
                    retryLabel: "That line would blur voltage back into total energy or resistance.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f4-l2-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the potential-difference analyst",
                    scenario:
                      "A trainee analyst wants to plug numbers into V = E / Q immediately without first deciding whether the question is asking about energy per charge or total energy transferred.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "name-per-charge-first",
                        label: "First ask whether the question wants energy per coulomb or total energy. If it wants energy per charge, use V = E / Q. If it wants total energy, keep the per-charge meaning and use E = VQ after that story is secure.",
                        feedback:
                          "Exactly. That keeps the formula tied to the meaning instead of turning it into a blind substitution step.",
                        isCorrect: true,
                      },
                      {
                        value: "always-divide-by-charge",
                        label: "Start by dividing by charge in every voltage question, because potential difference is always the only quantity that matters once a battery is mentioned.",
                        feedback:
                          "That is too mechanical. Some questions ask for total energy transferred, so the lesson needs the quantity identified before the formula step.",
                      },
                      {
                        value: "focus-on-charge-only",
                        label: "Start by finding how much charge moved, because once the charge is known the energy story takes care of itself automatically.",
                        feedback:
                          "Charge still needs an energy-per-charge link before the answer is meaningful. This lesson needs that link made explicit first.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable energy-per-charge method.",
                    retryLabel: "That instruction would push the analyst back toward formula guessing.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f4-l2-common-trap",
                    badge: "Trap alert",
                    title: "Block the more-charge-equals-more-voltage shortcut",
                    scenario:
                      "One crew member keeps saying a bigger potential difference simply means more charge is moving. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "same-charge-different-energy",
                        label: "The same amount of charge can pass through sources with different voltages. What changes is the energy transferred to each coulomb, not the amount of charge itself.",
                        feedback:
                          "Exactly. That warning protects the lesson's main distinction.",
                        isCorrect: true,
                      },
                      {
                        value: "more-voltage-more-charge",
                        label: "A bigger voltage must mean more charge has been supplied, because a stronger battery always creates extra charge in the loop.",
                        feedback:
                          "That keeps the trap alive. Batteries give energy per charge; they do not create extra charge as the meaning of voltage.",
                      },
                      {
                        value: "voltage-uses-up-charge",
                        label: "A larger potential difference means each charge packet gets used up more quickly, so the charge quantity itself becomes smaller after the component.",
                        feedback:
                          "This mixes energy transfer with charge disappearance. The lesson needs charge kept circulating while energy per charge changes.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps charge amount separate from energy per charge.",
                    retryLabel: "That warning would leave the voltage-equals-charge shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f4-l2-analogy",
                    badge: "Story relay",
                    title: "Choose the source-push bridge",
                    scenario:
                      "The team wants one analogy line that helps learners picture the same charge packets leaving one source with a smaller boost and another source with a larger boost, without confusing that with extra charge being created.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "same-packets-more-boost",
                        label: "Use the analogy by keeping the same packets in view and comparing how much boost each packet gets from the source. A larger source push means more energy per packet, not extra packets.",
                        feedback:
                          "Exactly. That keeps the analogy serving the energy-per-charge meaning cleanly.",
                        isCorrect: true,
                      },
                      {
                        value: "bigger-source-more-packets",
                        label: "Use the analogy by showing a stronger source creating extra packets, because that is the easiest way to picture a bigger potential difference.",
                        feedback:
                          "That would build the exact misconception this lesson is trying to remove.",
                      },
                      {
                        value: "energy-whole-circuit-only",
                        label: "Use the analogy by talking only about the total energy in the whole circuit, because the packet-by-packet picture is not needed once a source is named.",
                        feedback:
                          "The packet-by-packet picture is the point here. This lesson needs the 'per charge' meaning kept explicit.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports voltage as energy per charge without slipping into extra-charge thinking.",
                    retryLabel: "That analogy would blur the source-push idea instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F4_L1") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f4-l1-stream-board",
                  badge: "Flow board",
                  title: "Read the closed-loop stream",
                  scenario:
                    "The Flow-Grid room is comparing a complete loop with an open switch. One trainee keeps saying the lamp uses some current up, so the current after the lamp must be smaller than the current before it.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "same-current-one-route",
                      label: "In one complete route, the same charge stream passes every checkpoint each second. The lamp transfers energy, but it does not use current up.",
                      feedback:
                        "Exactly. That keeps current as charge-flow rate while leaving the energy transfer job to the lamp.",
                      isCorrect: true,
                    },
                    {
                      value: "lamp-uses-current",
                      label: "The lamp must reduce the current after it, because part of the current gets used to make light and heat.",
                      feedback:
                        "That is the trap. The lamp transfers energy from the moving charge, but the same current keeps circulating in a closed single loop.",
                    },
                    {
                      value: "current-grows-after-lamp",
                      label: "The current becomes larger after the lamp because the charge has already been energized by the source and now moves faster through the rest of the loop.",
                      feedback:
                        "Current is not a store that grows after the lamp. In this lesson, one complete loop keeps one common stream rate everywhere.",
                    },
                  ],
                  successLabel: "Pinned. The room can now read the circuit as one common charge stream around a complete route.",
                  retryLabel: "That note would keep the 'current gets used up' mistake alive.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f4-l1-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first circuit note",
                    scenario:
                      "A trainee has written that a lamp uses up current, so less current leaves the lamp than enters it. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "current-is-flow-rate",
                        label: "Current is the rate of charge flow. In one closed loop, the same charge keeps circulating, while the lamp transfers some electrical energy from that moving charge.",
                        feedback:
                          "Exactly. That correction separates charge flow from energy transfer, which is the main lesson move here.",
                        isCorrect: true,
                      },
                      {
                        value: "lamp-destroys-current",
                        label: "A lamp uses current up because light and heat have to come from somewhere, so the current must be smaller after the lamp.",
                        feedback:
                          "That keeps the mistake alive. Light and heat come from transferred energy, not from charge disappearing out of the loop.",
                      },
                      {
                        value: "battery-restores-current",
                        label: "The current really does drop after the lamp, but the battery restores it later so the loop average stays the same.",
                        feedback:
                          "This lesson needs a stronger idea than that: in one complete loop, the same current passes every checkpoint the whole time the route stays closed.",
                      },
                    ],
                    successLabel: "Repair sent. The charge-flow story is now back in place.",
                    retryLabel: "That would leave the used-up-current mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f4-l1-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line current rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner starts the electricity sequence with the right current anchor.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "current-charge-per-second",
                        label: "Current measures how much charge passes a point each second, and in one complete loop that same current passes every point in the route.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "current-is-energy-per-charge",
                        label: "Current tells how much energy each charge carries, which is why a lamp changes the current as it transfers energy.",
                        feedback:
                          "That swaps current with potential difference reasoning. This lesson needs current kept as charge per second.",
                      },
                      {
                        value: "current-stored-in-components",
                        label: "Current is the amount of charge stored inside each component, so every component can hold a different current in the same loop.",
                        feedback:
                          "Current is not stored in components. The lesson needs current treated as a flow rate through the complete route.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean current anchor.",
                    retryLabel: "That line would blur current back into stored charge or energy per charge.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f4-l1-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the circuit analyst",
                    scenario:
                      "A trainee analyst wants to jump straight into a number calculation without first deciding whether the question is about charge moved, time taken, current everywhere in a loop, or whether the loop is even complete.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify-loop-and-quantity",
                        label: "First decide whether the route is closed or open, then name the quantity: charge moved, time, or current. Use I = Q / t only after the circuit story is clear.",
                        feedback:
                          "Exactly. That keeps the loop meaning and the current formula tied together before the arithmetic starts.",
                        isCorrect: true,
                      },
                      {
                        value: "always-divide-first",
                        label: "Start with I = Q / t for every question, because once you have a current value the circuit meaning will take care of itself automatically.",
                        feedback:
                          "That is too mechanical. This lesson wants the closed-loop meaning secured before the formula is used.",
                      },
                      {
                        value: "focus-on-lamp-first",
                        label: "Start by deciding how much current the lamp uses up, then compare what is left in the rest of the loop.",
                        feedback:
                          "That instruction starts from the very misconception the lesson is trying to remove.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable current-first method.",
                    retryLabel: "That instruction would push the analyst back toward formula guessing or used-up-current thinking.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f4-l1-common-trap",
                    badge: "Trap alert",
                    title: "Block the used-up-current shortcut",
                    scenario:
                      "One crew member keeps saying that a bright lamp must remove some current from the loop because it transfers more energy. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "energy-not-current-used",
                        label: "The lamp changes the electrical energy carried by the moving charge, not the amount of charge passing each second in the closed loop.",
                        feedback:
                          "Exactly. That warning protects the lesson's most important distinction.",
                        isCorrect: true,
                      },
                      {
                        value: "brighter-means-less-current-after",
                        label: "A brighter lamp must leave less current after it, because stronger energy transfer always means less charge continues around the route.",
                        feedback:
                          "That keeps the trap alive. Energy transfer and current are not the same quantity.",
                      },
                      {
                        value: "lamp-stores-current-briefly",
                        label: "The current looks the same only because the lamp stores some current briefly and releases it again farther around the loop.",
                        feedback:
                          "This lesson does not need a hidden storage story. In one closed loop, the same current passes each checkpoint continuously.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps charge flow separate from energy transfer.",
                    retryLabel: "That warning would leave the used-up-current shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f4-l1-analogy",
                    badge: "Story relay",
                    title: "Choose the Flow-Grid bridge",
                    scenario:
                      "The team wants one analogy line that helps learners picture one shared stream rate moving around a complete route, while still leaving room for components to transfer energy without making charge disappear.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "one-stream-one-route",
                        label: "Use the analogy by tracking one packet stream around one complete route: the stream rate stays the same at each checkpoint, while a device on the route can still take energy from the moving packets.",
                        feedback:
                          "Exactly. That keeps the analogy serving both the current idea and the energy-transfer idea.",
                        isCorrect: true,
                      },
                      {
                        value: "stream-gets-smaller-after-device",
                        label: "Use the analogy by showing the stream shrinking after a device, because that is the easiest way to picture the device using current up.",
                        feedback:
                          "That would build the exact misconception this lesson is trying to remove.",
                      },
                      {
                        value: "route-only-matters-at-source",
                        label: "Use the analogy mainly at the battery, because once the charge leaves the source the rest of the route no longer matters to the current story.",
                        feedback:
                          "The whole route matters. This lesson needs the complete closed loop kept visible from source to component and back again.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the current story without slipping into 'current gets used up.'",
                    retryLabel: "That analogy would blur the one-stream closed-loop idea instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L6") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l6-braking-board",
                  badge: "Safety board",
                  title: "Read the braking-risk comparison",
                  scenario:
                    "The safety room is comparing the same car at a normal speed and at a doubled speed, then comparing a short stop with a longer stop. One trainee keeps treating all the changes as one simple force story.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "momentum-energy-time-together",
                      label: "Higher speed raises momentum directly and kinetic energy even more strongly, while longer stopping time reduces the average force for the same momentum change.",
                      feedback:
                        "Exactly. That keeps the lesson’s three linked safety ideas working together.",
                      isCorrect: true,
                    },
                    {
                      value: "speed-only-affects-force",
                      label: "Speed changes only the braking force, because momentum and kinetic energy are just two names for the same speed effect.",
                      feedback:
                        "That is the trap. This lesson needs momentum and kinetic energy kept distinct, with speed affecting them by different amounts.",
                    },
                    {
                      value: "longer-stop-removes-energy",
                      label: "A longer stopping time makes the danger vanish because it removes the momentum change and kinetic energy problem altogether.",
                      feedback:
                        "Longer stopping time reduces average force, but the momentum change and the energy to be dissipated still have to be dealt with.",
                    },
                  ],
                  successLabel: "Pinned. The room can now read the braking story without collapsing the linked ideas together.",
                  retryLabel: "That note would flatten the safety lesson back into one vague force story.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l6-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first braking note",
                    scenario:
                      "A trainee has written that high-speed braking is dangerous only because the force becomes larger, and that momentum and kinetic energy do not add anything important to the explanation. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "speed-raises-both",
                        label: "High speed makes the momentum change larger and also makes the kinetic energy much larger, so braking has to manage both the force story and the energy story.",
                        feedback:
                          "Exactly. That correction keeps the lesson using both linked ideas instead of shrinking everything into force alone.",
                        isCorrect: true,
                      },
                      {
                        value: "force-only-matters",
                        label: "The only useful explanation is that the force becomes larger, because momentum and kinetic energy are just extra labels for the same thing.",
                        feedback:
                          "That keeps the mistake alive. This lesson needs momentum, kinetic energy, and stopping time all visible together.",
                      },
                      {
                        value: "energy-only-matters",
                        label: "Only kinetic energy matters in braking, so the momentum change and stopping-time comparison can be ignored once the speed is known.",
                        feedback:
                          "That drops too much of the safety story. The force still depends on how quickly the momentum is changed during the stop.",
                      },
                    ],
                    successLabel: "Repair sent. The full braking-safety story is now back in place.",
                    retryLabel: "That would leave the one-factor braking mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l6-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line braking rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner begins this lesson with the right integrated safety anchor.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "braking-anchor",
                        label: "Braking force depends on the rate of change of momentum, while high speed also makes the kinetic energy much larger, so safer stopping depends on both slowing the momentum change and managing the energy.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "momentum-only-anchor",
                        label: "Braking is only about momentum change, so kinetic energy adds no extra reason for high speed to be dangerous.",
                        feedback:
                          "That is too narrow. This lesson needs the stronger speed effect in kinetic energy kept visible as well.",
                      },
                      {
                        value: "time-only-anchor",
                        label: "Stopping time is the whole braking story, because once you lengthen the stop every other safety quantity becomes unimportant.",
                        feedback:
                          "Longer stopping time matters, but the lesson still needs the momentum change and energy demand in view.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean braking-safety anchor.",
                    retryLabel: "That line would blur the linked safety ideas at the start of the lesson.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l6-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the safety analyst",
                    scenario:
                      "A trainee analyst wants to grab one familiar formula and stop there instead of deciding whether the question is about momentum, kinetic energy, or average force from stopping time.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify-which-story",
                        label: "First decide which part of the safety story the question is asking about: momentum now, kinetic energy now, or force from changing momentum over time. Then connect the results instead of treating them as separate unrelated answers.",
                        feedback:
                          "Exactly. That method keeps the lesson using one linked safety story rather than disconnected formulas.",
                        isCorrect: true,
                      },
                      {
                        value: "always-start-with-force",
                        label: "Start with force in every braking question, because once the force is known the momentum and energy ideas can be ignored.",
                        feedback:
                          "That is too narrow. Some questions start from momentum or kinetic energy first, and the lesson wants those linked before force is discussed.",
                      },
                      {
                        value: "speed-alone-solves-it",
                        label: "Start with speed alone, because high speed already tells you every braking answer without needing mass or stopping time.",
                        feedback:
                          "Speed matters a lot, but the lesson still needs mass for momentum and kinetic energy, and stopping time for force.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable braking-safety method.",
                    retryLabel: "That instruction would push the analyst back toward one-formula shortcut thinking.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l6-common-trap",
                    badge: "Trap alert",
                    title: "Block the momentum-equals-energy shortcut",
                    scenario:
                      "One crew member keeps saying that momentum and kinetic energy rise in the same way with speed, so there is no need to keep them separate in braking questions. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "different-speed-effects",
                        label: "Momentum rises directly with speed, but kinetic energy rises with speed squared, so high-speed braking becomes especially demanding if you blur those trends together.",
                        feedback:
                          "Exactly. That warning protects one of the key comparisons this lesson is building.",
                        isCorrect: true,
                      },
                      {
                        value: "same-speed-effect",
                        label: "Momentum and kinetic energy change in the same way with speed, so you can safely use either one as a full replacement for the other in braking explanations.",
                        feedback:
                          "That keeps the trap alive. This lesson needs the direct momentum trend and the squared energy trend kept separate.",
                      },
                      {
                        value: "time-removes-difference",
                        label: "Once stopping time is included, the difference between momentum and kinetic energy no longer matters in the safety explanation.",
                        feedback:
                          "Stopping time matters for force, but it does not erase the stronger speed effect in kinetic energy.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps momentum and kinetic energy doing different jobs in the safety story.",
                    retryLabel: "That warning would leave the momentum-equals-energy shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l6-analogy",
                    badge: "Story relay",
                    title: "Choose the braking-safety bridge",
                    scenario:
                      "The team wants one analogy line that keeps learners asking what has to be removed, how fast that removal happens, and why higher speed makes the job disproportionately harder before any formula is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "removal-rate-and-load",
                        label: "Use the analogy by asking how much motion load must be removed, how quickly the stop tries to remove it, and why a faster start makes both the motion change and the energy burden more demanding.",
                        feedback:
                          "Exactly. That keeps the analogy serving the full braking-safety meaning instead of replacing it.",
                        isCorrect: true,
                      },
                      {
                        value: "force-only-bridge",
                        label: "Use the analogy mainly to compare force spikes, because once the strongest force is identified the rest of the braking story is already settled.",
                        feedback:
                          "That would flatten the lesson into force alone. The analogy still has to protect momentum change, stopping time, and the stronger speed effect in energy.",
                      },
                      {
                        value: "time-only-bridge",
                        label: "Use the analogy mainly to compare stopping times, because longer time automatically explains every other safety quantity in the lesson.",
                        feedback:
                          "Longer time matters, but the analogy still has to keep the changing momentum and energy demand in play.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the braking-safety story without flattening it into a single-factor shortcut.",
                    retryLabel: "That analogy would blur the integrated safety story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L5") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l5-impulse-board",
                  badge: "Impact board",
                  title: "Read the same-area comparison",
                  scenario:
                    "The collision room is comparing a short sharp stop with a longer softer stop. One trainee keeps thinking the longer stop must mean a larger impulse because it lasts longer.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "same-area-same-impulse",
                      label: "If the force-time area is the same, the impulse is the same, so the same momentum change can happen with a smaller force spread over more time.",
                      feedback:
                        "Exactly. That keeps area, impulse, and safer longer stops linked in one clear picture.",
                      isCorrect: true,
                    },
                    {
                      value: "longer-time-more-impulse",
                      label: "A longer stopping time always means a larger impulse, because more time automatically adds more effect even when the area stays the same.",
                      feedback:
                        "That is the trap. For this lesson, the same area means the same impulse even if the width changes.",
                    },
                    {
                      value: "force-only-decides-impulse",
                      label: "Only the peak force decides the impulse, so the wider lower block must count for less even when the areas match.",
                      feedback:
                        "Impulse needs both force and time together. The whole area matters, not just the height of the block.",
                    },
                  ],
                  successLabel: "Pinned. The room can now read equal-area impacts without losing the safety idea.",
                  retryLabel: "That note would blur area and impulse back apart.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l5-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first impulse note",
                    scenario:
                      "A trainee has written that impulse is a separate extra quantity unrelated to momentum change. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "impulse-is-change-in-momentum",
                        label: "Impulse is the change in momentum during the interaction, and the same quantity can also be found from force multiplied by time or the area under a force-time graph.",
                        feedback:
                          "Exactly. That correction ties the three lesson views back to one physical quantity.",
                        isCorrect: true,
                      },
                      {
                        value: "impulse-is-extra-formula",
                        label: "Impulse is its own separate effect, so it should be treated as different from momentum change even if the numbers sometimes look similar.",
                        feedback:
                          "That keeps the mistake alive. This lesson needs impulse and momentum change treated as the same quantity described in different ways.",
                      },
                      {
                        value: "impulse-is-force-only",
                        label: "Impulse is really just another name for force, because a stronger force always means the bigger impulse regardless of time.",
                        feedback:
                          "Time still matters. Impulse needs force and time together, not force alone.",
                      },
                    ],
                    successLabel: "Repair sent. The impulse-and-momentum link is now clear.",
                    retryLabel: "That would leave impulse floating away from momentum change.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l5-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line impulse rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner begins this lesson with the right anchor for impacts and safer stopping.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "impulse-anchor",
                        label: "Impulse is the change in momentum, and for the same impulse a longer stopping time means a smaller average force.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "impulse-is-bigger-force",
                        label: "Impulse mainly tells you how large the force is, so stopping time matters only after the force has already been found.",
                        feedback:
                          "That drops too much of the idea. This lesson needs the force-time trade-off visible from the start.",
                      },
                      {
                        value: "impulse-needs-no-time",
                        label: "Impulse depends only on momentum size, so time can be ignored once the moving object has been identified.",
                        feedback:
                          "Time is essential when the lesson moves to force and safety. The same momentum change over longer time gives a smaller force.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean impulse anchor.",
                    retryLabel: "That line would blur the impulse-and-safety story at the start of the lesson.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l5-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the impact analyst",
                    scenario:
                      "A trainee analyst wants to grab whichever equation looks familiar first instead of deciding whether the question gives force and time, a graph area, or a momentum change.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify-representation-first",
                        label: "First decide how the same quantity is being represented: force × time, force-time area, or momentum change. Then translate that impulse into the needed force or safety comparison.",
                        feedback:
                          "Exactly. That method keeps all three lesson views tied to one quantity before the arithmetic starts.",
                        isCorrect: true,
                      },
                      {
                        value: "always-use-force-time",
                        label: "Start with force × time for every question, because impulse questions always have to be converted into that form before you can reason further.",
                        feedback:
                          "That is too narrow. Some questions already give the momentum change or a graph area directly, and the lesson wants those seen as the same quantity.",
                      },
                      {
                        value: "time-only-safety",
                        label: "Start with the stopping time alone, because once you know the time you already know whether the collision is safe.",
                        feedback:
                          "Time matters, but only together with the same momentum change. The lesson still needs the impulse link kept visible.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable impulse method.",
                    retryLabel: "That instruction would push the analyst back toward formula guessing.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l5-common-trap",
                    badge: "Trap alert",
                    title: "Block the longer-time-bigger-impulse shortcut",
                    scenario:
                      "One crew member keeps saying a longer stop must always mean a bigger impulse because the interaction lasts longer. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "same-impulse-less-force",
                        label: "A longer stop can still have the same impulse if the force is lower, and that is exactly why longer stopping time can make the collision safer.",
                        feedback:
                          "Exactly. That warning protects the lesson’s key safety distinction.",
                        isCorrect: true,
                      },
                      {
                        value: "longer-means-bigger-impulse",
                        label: "More stopping time automatically means more impulse, because impulse grows whenever the interaction lasts longer.",
                        feedback:
                          "That keeps the trap alive. The lesson needs force and time considered together through the area or Ft relationship.",
                      },
                      {
                        value: "same-area-same-force",
                        label: "If two force-time graphs have the same area, they must also have the same force, because equal impulse means equal impact strength in every sense.",
                        feedback:
                          "Equal area means equal impulse, not equal force. The same area can be tall-and-narrow or short-and-wide.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps impulse and stopping-time safety connected correctly.",
                    retryLabel: "That warning would leave the longer-time shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l5-analogy",
                    badge: "Story relay",
                    title: "Choose the impact-area bridge",
                    scenario:
                      "The team wants one analogy line that keeps learners asking what total change must stay the same and how stretching the event changes the force before any formula is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "same-change-stretched-time",
                        label: "Use the analogy by asking what total change must be delivered, then compare whether that same change is packed into a short sharp burst or spread over a longer safer interval.",
                        feedback:
                          "Exactly. That keeps the analogy serving the impulse-and-safety meaning instead of replacing it.",
                        isCorrect: true,
                      },
                      {
                        value: "time-alone-story",
                        label: "Use the analogy mainly to compare which impact lasts longer, because the longest event automatically carries the largest impulse.",
                        feedback:
                          "That would flatten the lesson into time alone. The analogy still has to protect the same-change idea.",
                      },
                      {
                        value: "peak-force-only-story",
                        label: "Use the analogy to focus on the tallest force spike only, because the biggest peak tells you everything important about the impulse.",
                        feedback:
                          "That would break the area story. The analogy needs to protect force and time together, not peak force alone.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the same-impulse / different-force story without flattening it into time-only or peak-force shortcuts.",
                    retryLabel: "That analogy would blur the impulse story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L4") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l4-system-board",
                  badge: "System board",
                  title: "Read the whole-collision comparison",
                  scenario:
                    "The collision room is comparing a light second trolley with a heavier one joining the motion. One trainee keeps following only the incoming trolley and ignoring the whole-system total.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "whole-system-total",
                      label: "Track the total momentum of the whole system before and after the collision. If more mass shares the same total momentum, the shared final speed can be smaller.",
                      feedback:
                        "Exactly. That keeps the lesson centered on the whole-system momentum total.",
                      isCorrect: true,
                    },
                    {
                      value: "incoming-object-keeps-momentum",
                      label: "Follow only the incoming trolley, because conservation means each object keeps its own original momentum through the collision.",
                      feedback:
                        "That is the trap. Conservation belongs to the system total, not to each object keeping its old momentum unchanged.",
                    },
                    {
                      value: "heavier-object-always-wins",
                      label: "The heavier trolley automatically decides the final motion, so you do not need to total the momenta if one object is much heavier.",
                      feedback:
                        "Mass matters, but the lesson still needs the whole-system momentum total before and after the interaction.",
                    },
                  ],
                  successLabel: "Pinned. The room can now read the collision as one system story.",
                  retryLabel: "That note would keep the collision reasoning tied to one object instead of the total.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l4-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first conservation note",
                    scenario:
                      "A trainee has written that conservation of momentum means every trolley keeps its own momentum unchanged. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "system-total-stays-same",
                        label: "Conservation of momentum is a whole-system rule: the total momentum before the interaction equals the total momentum after if external forces are negligible.",
                        feedback:
                          "Exactly. That correction keeps conservation attached to the system total instead of to each object separately.",
                        isCorrect: true,
                      },
                      {
                        value: "each-object-keeps-own-momentum",
                        label: "Each object keeps its own momentum unchanged, which is why conservation works even when the objects collide.",
                        feedback:
                          "That keeps the mistake alive. Individual momenta can change a lot during the interaction while the system total stays the same.",
                      },
                      {
                        value: "rest-object-means-no-conservation",
                        label: "Conservation matters only when both objects are already moving, because a stationary object contributes no useful momentum information.",
                        feedback:
                          "A stationary object can still be part of the momentum total. Zero is still part of the system bookkeeping.",
                      },
                    ],
                    successLabel: "Repair sent. The system-total idea is now clear.",
                    retryLabel: "That would leave the one-object conservation mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l4-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line momentum rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner begins this lesson with the right momentum anchor.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "momentum-system-rule",
                        label: "Momentum equals mass times velocity, and the total momentum of an isolated system stays constant through the interaction.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "momentum-is-mass-only",
                        label: "Momentum is mostly about mass, so direction and velocity are secondary details that can be added later if needed.",
                        feedback:
                          "That drops too much of the idea. Momentum needs mass, velocity, and direction from the start.",
                      },
                      {
                        value: "collision-removes-momentum",
                        label: "Collisions usually remove momentum, so the main job is to estimate how much is lost during the impact.",
                        feedback:
                          "This lesson wants the total momentum preserved for the isolated system. What changes is how that total is shared afterward.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean system-momentum anchor.",
                    retryLabel: "That line would blur the momentum idea at the start of the lesson.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l4-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the collision analyst",
                    scenario:
                      "A trainee analyst wants to jump straight to a final speed without first building the signed momentum total before the collision.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "total-before-then-after",
                        label: "First calculate the total momentum before the interaction with directions or signs included, then set that equal to the total after and solve for the unknown speed.",
                        feedback:
                          "Exactly. That method keeps the whole-system bookkeeping intact before the algebra starts.",
                        isCorrect: true,
                      },
                      {
                        value: "use-only-heaviest-object",
                        label: "Start with the heaviest object only, because the largest mass usually sets the final collision speed closely enough.",
                        feedback:
                          "That shortcut breaks the system idea. Every momentum contribution belongs in the total before you solve.",
                      },
                      {
                        value: "drop-direction-until-end",
                        label: "Ignore direction until the very end, because momentum size matters more than sign while the equation is being built.",
                        feedback:
                          "Direction cannot be postponed like that. Opposite momenta can cancel in the total, so the sign or direction words matter from the start.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable collision method.",
                    retryLabel: "That instruction would push the analyst back toward shortcut reasoning.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l4-common-trap",
                    badge: "Trap alert",
                    title: "Block the direction-drop shortcut",
                    scenario:
                      "One crew member keeps removing direction from every momentum term because they think only the sizes matter in collisions. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "momentum-needs-direction",
                        label: "Momentum is a vector, so opposite directions can cancel in the total. Keep direction or a sign convention all the way through the system calculation.",
                        feedback:
                          "Exactly. That warning protects one of the key ideas this lesson is building.",
                        isCorrect: true,
                      },
                      {
                        value: "direction-is-optional",
                        label: "Direction is only a presentation detail, so you can ignore it until the final answer and still conserve momentum safely.",
                        feedback:
                          "That keeps the trap alive. Direction can change the total itself because opposite contributions can cancel.",
                      },
                      {
                        value: "zero-total-means-no-motion",
                        label: "If the total momentum is zero, that proves every object in the collision is motionless before and after the interaction.",
                        feedback:
                          "Zero total momentum can still come from equal and opposite moving objects. The total and the individual motions are not the same thing.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps direction inside the momentum total.",
                    retryLabel: "That warning would leave the direction-drop shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l4-analogy",
                    badge: "Story relay",
                    title: "Choose the collision-balance bridge",
                    scenario:
                      "The team wants one analogy line that keeps the focus on the whole-system balance and the signed contributions before any collision formula is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "system-balance",
                        label: "Use the analogy by asking which objects bring positive or negative motion tokens into the interaction and what total balance the whole system must keep before and after.",
                        feedback:
                          "Exactly. That keeps the analogy serving the system-total meaning instead of replacing it.",
                        isCorrect: true,
                      },
                      {
                        value: "winner-loser-story",
                        label: "Use the analogy as a winner-versus-loser story, because the main job in a collision is to decide which object dominates the result.",
                        feedback:
                          "That would flatten the lesson into a contest story. The analogy needs to protect the total system balance instead.",
                      },
                      {
                        value: "mass-only-story",
                        label: "Use the analogy mainly to compare which object has more mass, because mass alone decides how momentum conservation will work out.",
                        feedback:
                          "Mass matters, but the analogy still has to keep speed, direction, and whole-system total in play.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the system-balance story without flattening the collision into a winner-loser shortcut.",
                    retryLabel: "That analogy would blur the momentum-conservation story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L3") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l3-rate-yield-board",
                  badge: "Rate board",
                  title: "Read the fast-versus-useful comparison",
                  scenario:
                    "The energy room is comparing two machines. One transfers energy very quickly but wastes a lot, while the other gives a better useful fraction but works more slowly. One trainee keeps collapsing both ideas into one score.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "separate-rate-and-fraction",
                      label: "Power tells how quickly energy is transferred, while efficiency tells what fraction of the input becomes useful output.",
                      feedback:
                        "Exactly. That keeps rate and usefulness separate right from the first comparison.",
                      isCorrect: true,
                    },
                    {
                      value: "power-means-efficient",
                      label: "A more powerful machine must be more efficient, because transferring energy quickly already proves less is being wasted.",
                      feedback:
                        "That is the lesson's main trap. Fast transfer does not guarantee a high useful fraction.",
                    },
                    {
                      value: "efficiency-means-faster",
                      label: "The more efficient machine is automatically the more powerful one, because useful machines always finish the transfer sooner.",
                      feedback:
                        "Efficiency and power answer different questions. A machine can waste little energy and still transfer energy slowly.",
                    },
                  ],
                  successLabel: "Pinned. The room can now keep fast transfer separate from useful fraction.",
                  retryLabel: "That note would blur power and efficiency back together.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l3-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first power note",
                    scenario:
                      "A trainee has written that a high-power machine must also be highly efficient because it gets the job done quickly. You need the correction that separates the two ideas before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "power-vs-efficiency",
                        label: "Power is about rate, while efficiency is about useful fraction. A machine can be powerful and still waste a large part of its input.",
                        feedback:
                          "Exactly. That correction keeps the lesson anchored on two different questions instead of one blended score.",
                        isCorrect: true,
                      },
                      {
                        value: "high-power-high-efficiency",
                        label: "High power usually proves high efficiency, because fast transfer means less time for waste to happen.",
                        feedback:
                          "That keeps the mistake alive. This lesson needs rate and usefulness kept separate.",
                      },
                      {
                        value: "one-percentage-explains-both",
                        label: "As long as you know the efficiency percentage, you already know how quickly the machine transfers energy as well.",
                        feedback:
                          "Efficiency is not a rate. It does not tell you how many joules are transferred each second.",
                      },
                    ],
                    successLabel: "Repair sent. The rate-versus-usefulness mix-up is now cleared.",
                    retryLabel: "That would leave the power-equals-efficiency mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l3-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line rate rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner begins this lesson with the right split between transfer rate and useful fraction.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "power-and-efficiency-rule",
                        label: "Power measures how quickly energy is transferred, while efficiency measures how much of the input becomes useful output.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "power-is-useful-output",
                        label: "Power is the amount of useful output a machine gives, so it already includes efficiency inside it.",
                        feedback:
                          "That folds the two ideas together too early. This lesson needs power and efficiency treated as different measurements.",
                      },
                      {
                        value: "efficiency-is-speed",
                        label: "Efficiency tells how quickly the useful output appears, while power tells how much is wasted.",
                        feedback:
                          "That swaps the jobs around. Power is the rate; efficiency is the useful fraction.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean power-and-efficiency anchor.",
                    retryLabel: "That line would blur the lesson’s two key quantities together.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l3-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the power analyst",
                    scenario:
                      "A trainee analyst wants to divide or multiply numbers straight away without first deciding whether the question is asking about transfer rate, total transferred energy, running time, or useful fraction.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify-quantity-first",
                        label: "First decide whether the question is asking for power, energy, time, or efficiency. Use P = E / t for the rate relationship, and keep efficiency as a separate useful-output comparison.",
                        feedback:
                          "Exactly. That method keeps the rate relationship and the usefulness check from being mixed together.",
                        isCorrect: true,
                      },
                      {
                        value: "always-use-efficiency-first",
                        label: "Start with efficiency whenever a machine is mentioned, because efficiency is the main quantity and power can be inferred later.",
                        feedback:
                          "That is too narrow. Many questions in this lesson are about transfer rate or total transferred energy, not about useful fraction first.",
                      },
                      {
                        value: "same-formula-for-all",
                        label: "Use one formula chain for every question, because power, energy, time, and efficiency are all versions of the same relationship.",
                        feedback:
                          "This lesson needs two different structures kept apart: the rate relation and the useful-fraction relation.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable power-and-efficiency method.",
                    retryLabel: "That instruction would push the analyst back toward formula guessing.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l3-common-trap",
                    badge: "Trap alert",
                    title: "Block the fast-means-efficient shortcut",
                    scenario:
                      "One crew member keeps saying the machine that finishes sooner must also be the more efficient one. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "fast-not-equal-efficient",
                        label: "Finishing sooner can mean greater power, but efficiency still depends on the useful fraction of the input, not on speed alone.",
                        feedback:
                          "Exactly. That warning protects the lesson’s main distinction.",
                        isCorrect: true,
                      },
                      {
                        value: "fast-proves-efficient",
                        label: "The faster machine must be more efficient because less running time always means less wasted energy.",
                        feedback:
                          "That keeps the trap alive. A process can be powerful without being efficient.",
                      },
                      {
                        value: "same-energy-same-efficiency",
                        label: "If two machines transfer the same total energy, they must also have the same efficiency, even if the useful output differs.",
                        feedback:
                          "Total transferred energy alone does not fix the useful fraction. Efficiency needs the useful-output comparison.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now treats speed and usefulness as separate checks.",
                    retryLabel: "That warning would leave the fast-equals-efficient shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l3-analogy",
                    badge: "Story relay",
                    title: "Choose the rate-and-yield bridge",
                    scenario:
                      "The team wants one analogy line that keeps learners asking how quickly the transfer happens and how much of it becomes useful before any formula is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "rate-and-yield",
                        label: "Use the analogy by asking how fast the transfer meter is running and what useful share reaches the target, because rate and yield answer different questions.",
                        feedback:
                          "Exactly. That keeps the analogy serving both lesson ideas without blending them.",
                        isCorrect: true,
                      },
                      {
                        value: "yield-is-rate",
                        label: "Use the analogy to treat the useful share as the same thing as transfer speed, because the better machine should always do both at once.",
                        feedback:
                          "That would collapse the two lesson ideas together again. The analogy needs to preserve rate and useful fraction as separate readings.",
                      },
                      {
                        value: "time-only",
                        label: "Use the analogy mainly to compare finishing times, because once you know which machine is faster the efficiency story is already settled.",
                        feedback:
                          "Finishing time alone cannot settle the efficiency story. The analogy still has to protect the useful-output comparison.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports rate and yield without flattening them into one score.",
                    retryLabel: "That analogy would blur the power-and-efficiency story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L1") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l1-work-transfer-board",
                  badge: "Transfer board",
                  title: "Read the moving-versus-stuck comparison",
                  scenario:
                    "The energy room is comparing a crate that moves under a pull with a wall that never moves under a push. One trainee keeps saying the bigger effort always means more work, even if nothing moves.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "movement-in-force-direction",
                      label: "Work is done when the force causes displacement in its direction, so the moving crate gains transferred energy while the stuck wall case gives zero work on the wall.",
                      feedback:
                        "Exactly. That keeps work tied to energy transfer through displacement, not to effort alone.",
                      isCorrect: true,
                    },
                    {
                      value: "force-alone-means-work",
                      label: "A large force always means a large amount of work, even if the object stays still, because the force is still being applied.",
                      feedback:
                        "That is the trap. Force by itself is not enough; without displacement in the force direction, the work on the object is zero.",
                    },
                    {
                      value: "any-movement-counts",
                      label: "Any movement in the scene counts as work, even if the object does not move in the direction of the force that is being considered.",
                      feedback:
                        "This lesson keeps the displacement tied to the same force interaction. The movement has to be in the force direction for that force to do work in the simple model.",
                    },
                  ],
                  successLabel: "Pinned. The room can now separate effort from energy transfer cleanly.",
                  retryLabel: "That note would keep the first work-done misunderstanding alive.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l1-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first work note",
                    scenario:
                      "A trainee has written that pushing hard on a wall is a lot of work because the person is trying hard. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "no-displacement-no-work",
                        label: "In physics, the push does zero work on the wall if the wall does not move, because no displacement happens in the force direction.",
                        feedback:
                          "Exactly. That keeps the lesson using the physics meaning of work instead of the everyday meaning of effort.",
                        isCorrect: true,
                      },
                      {
                        value: "effort-equals-work",
                        label: "The push still counts as a lot of work because effort alone decides the size of the work done.",
                        feedback:
                          "That is the mistake to remove. Work in this lesson depends on force and displacement together, not on effort by itself.",
                      },
                      {
                        value: "time-makes-work",
                        label: "The longer the person pushes, the more work must be done on the wall, even if the wall stays still.",
                        feedback:
                          "Time can matter in power questions, but this lesson's work idea still needs displacement in the force direction.",
                      },
                    ],
                    successLabel: "Repair sent. The zero-displacement trap is now cleared.",
                    retryLabel: "That would leave the effort-equals-work mistake in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l1-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line work rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner starts the work-and-energy sequence from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "work-is-energy-transfer",
                        label: "Work is the energy transferred when a force moves an object through a distance in the force direction.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "work-is-force-only",
                        label: "Work is just the size of the force, provided the force acts for long enough.",
                        feedback:
                          "That drops the displacement idea. This lesson needs force and movement in the force direction together.",
                      },
                      {
                        value: "work-is-effort",
                        label: "Work is how hard the person feels they are trying, which is why the physical motion matters less than the effort.",
                        feedback:
                          "The lesson is moving away from everyday effort language. The core idea is energy transfer through displacement caused by a force.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean work-and-energy anchor.",
                    retryLabel: "That line would blur work back into force or effort.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l1-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the work analyst",
                    scenario:
                      "A trainee analyst wants to multiply numbers straight away without checking whether the chosen force actually causes displacement in its direction.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "match-force-and-displacement",
                        label: "First identify the force and the displacement from the same interaction, confirm the displacement is in the force direction, then use W = F × s and read the answer as energy transferred.",
                        feedback:
                          "Exactly. That method keeps the physics story intact before the arithmetic starts.",
                        isCorrect: true,
                      },
                      {
                        value: "multiply-any-force-distance",
                        label: "As soon as a force and a distance appear anywhere in the question, multiply them because work is always force times distance.",
                        feedback:
                          "That shortcut is too loose. The force and displacement must belong to the same interaction, and the displacement has to count in the force direction.",
                      },
                      {
                        value: "read-joules-last",
                        label: "Ignore the physical meaning until the end; the important part is to get a number first and only then decide whether it represents work.",
                        feedback:
                          "This lesson wants the energy-transfer meaning present from the start, not added as an afterthought.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable work-done method.",
                    retryLabel: "That instruction would send the analyst into calculator-first thinking.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l1-common-trap",
                    badge: "Trap alert",
                    title: "Block the force-alone shortcut",
                    scenario:
                      "One crew member keeps saying that any force automatically means work is being done. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "force-needs-displacement",
                        label: "A force alone does not guarantee work. In this lesson, work needs displacement in the force direction as well.",
                        feedback:
                          "Exactly. That warning protects the key distinction this lesson is building.",
                        isCorrect: true,
                      },
                      {
                        value: "all-forces-do-work",
                        label: "Any force does work because the force itself carries energy whether or not the object moves.",
                        feedback:
                          "That keeps the trap alive. The lesson is specifically separating force from work done by that force.",
                      },
                      {
                        value: "time-replaces-displacement",
                        label: "If the force acts for long enough, time can replace displacement and still guarantee work.",
                        feedback:
                          "Time becomes important in power, but this work model still needs displacement in the force direction.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now checks for displacement before calling it work.",
                    retryLabel: "That warning would leave the force-alone shortcut active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l1-analogy",
                    badge: "Story relay",
                    title: "Choose the transfer-story bridge",
                    scenario:
                      "The team wants one analogy line that keeps the focus on what is transferred and what has to change before the work equation is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "transfer-story",
                        label: "Use the analogy by asking what is being transferred, what force causes the change, and what displacement shows that the transfer really happened.",
                        feedback:
                          "Exactly. That keeps the analogy serving the work-and-energy meaning instead of replacing it.",
                        isCorrect: true,
                      },
                      {
                        value: "effort-story",
                        label: "Use an effort story, because as long as the person is straining the analogy already proves that work is being done.",
                        feedback:
                          "That sends the lesson back to everyday effort language, which is exactly what this section is trying to clean up.",
                      },
                      {
                        value: "formula-story",
                        label: "Use the analogy only to remember the symbols W, F, and s, because the physical transfer story matters less once the formula is known.",
                        feedback:
                          "This lesson wants the analogy to support the physics meaning before the formula is used, not to shrink the idea into symbol recall.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the transfer story without flattening it into effort or symbols.",
                    retryLabel: "That analogy would pull the lesson away from its core transfer meaning.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F3_L2") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f3-l2-store-board",
                  badge: "Store board",
                  title: "Read the motion-versus-height comparison",
                  scenario:
                    "The energy room is comparing a fast trolley near the floor with a slower trolley higher up the ramp. One trainee keeps mixing the stores and saying height directly makes the kinetic energy bigger.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "separate-ke-and-gpe",
                      label: "Kinetic energy belongs to motion and depends on mass and speed, while gravitational potential energy belongs to height and depends on mass, g, and height.",
                      feedback:
                        "Exactly. That keeps the two stores separate and stops height from being pushed into the kinetic-energy story.",
                      isCorrect: true,
                    },
                    {
                      value: "height-raises-ke",
                      label: "Height makes kinetic energy larger in the same direct way speed does, because higher objects automatically count as moving-energy cases.",
                      feedback:
                        "That is the store mix-up. Height changes gravitational potential energy directly, not kinetic energy.",
                    },
                    {
                      value: "mass-only-for-gpe",
                      label: "Mass matters only for gravitational potential energy, while kinetic energy is decided by speed alone.",
                      feedback:
                        "Mass matters in both stores. The big difference is that speed is squared in kinetic energy, while height enters directly in gravitational potential energy.",
                    },
                  ],
                  successLabel: "Pinned. The room can now separate motion energy from height energy cleanly.",
                  retryLabel: "That note would keep the two energy stores blurred together.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f3-l2-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first store mix-up",
                    scenario:
                      "A trainee has written that an object high on a ramp must have more kinetic energy because it has gained more energy overall. You need the correction that separates the stores before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "height-is-gpe",
                        label: "Being higher increases gravitational potential energy. Kinetic energy is the motion store, so you still need the speed to judge that store.",
                        feedback:
                          "Exactly. That correction separates the height store from the motion store straight away.",
                        isCorrect: true,
                      },
                      {
                        value: "higher-means-more-ke",
                        label: "A higher object must have more kinetic energy because the total energy is larger and kinetic energy is the main moving store.",
                        feedback:
                          "That keeps the mistake alive. Height points you toward gravitational potential energy, not automatically toward more kinetic energy.",
                      },
                      {
                        value: "one-energy-label-is-enough",
                        label: "There is no need to separate the stores here. As long as you say the object has energy, the lesson meaning is already complete.",
                        feedback:
                          "This lesson needs the stores named properly. The whole point is to distinguish motion energy from height energy so comparisons stay honest.",
                      },
                    ],
                    successLabel: "Repair sent. The energy-store mix-up is now cleared.",
                    retryLabel: "That would leave the height-versus-motion confusion in place.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f3-l2-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line store rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner begins this lesson with the right energy-store map in mind.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "ke-and-gpe-rule",
                        label: "Kinetic energy is the store linked to motion, while gravitational potential energy is the store linked to height in a gravitational field.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "same-store-different-formulas",
                        label: "Kinetic energy and gravitational potential energy are really the same store, and the formulas only change because the numbers are arranged differently.",
                        feedback:
                          "That collapses the two stores together too early. This lesson needs them kept distinct so transfers can be tracked properly.",
                      },
                      {
                        value: "mass-decides-store",
                        label: "Mass decides which energy store applies, while speed and height only change the number after the correct store is chosen.",
                        feedback:
                          "Mass appears in both stores, so it cannot choose the store by itself. Motion points to kinetic energy; height points to gravitational potential energy.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean energy-store anchor.",
                    retryLabel: "That line would blur the two stores right at the start.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f3-l2-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the energy analyst",
                    scenario:
                      "A trainee analyst wants to grab whichever formula looks familiar first instead of deciding which store the question is actually asking about.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify-store-first",
                        label: "First decide which energy store is being asked about, then match the variables: mass and speed for kinetic energy, mass, g, and height for gravitational potential energy, and compare transfers if both stores appear.",
                        feedback:
                          "Exactly. That keeps the energy story clear before any calculation begins.",
                        isCorrect: true,
                      },
                      {
                        value: "pick-formula-with-most-numbers",
                        label: "Use whichever formula has the most numbers from the question, because the store identity matters less than using all the given values.",
                        feedback:
                          "That is a calculator-first shortcut. This lesson needs the store identified before the formula is chosen.",
                      },
                      {
                        value: "start-with-mgh",
                        label: "Start with mgh whenever height is mentioned, then decide afterwards whether the result should really count as kinetic or potential energy.",
                        feedback:
                          "The store decision cannot be postponed like that. The learner has to know what is being found before the calculation starts.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable energy-store method.",
                    retryLabel: "That instruction would push the analyst back toward formula-first guessing.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f3-l2-common-trap",
                    badge: "Trap alert",
                    title: "Block the speed-versus-mass shortcut",
                    scenario:
                      "One crew member keeps saying doubling speed and doubling mass change kinetic energy by the same amount. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "speed-is-squared",
                        label: "In kinetic energy, doubling mass only doubles the store, but doubling speed quadruples it because speed is squared.",
                        feedback:
                          "Exactly. That warning protects the strongest comparison this lesson is building.",
                        isCorrect: true,
                      },
                      {
                        value: "speed-and-mass-equal",
                        label: "Mass and speed affect kinetic energy equally, so doubling either one always gives the same change.",
                        feedback:
                          "That keeps the trap alive. This lesson needs the squared speed effect kept visible.",
                      },
                      {
                        value: "height-replaces-speed",
                        label: "Height can stand in for speed when comparing kinetic energy, because both show how much energy the object has.",
                        feedback:
                          "Height belongs to gravitational potential energy in this lesson. It cannot replace the speed role in kinetic energy.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now treats speed as the stronger kinetic-energy driver.",
                    retryLabel: "That warning would leave the key speed-squared trap active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f3-l2-analogy",
                    badge: "Story relay",
                    title: "Choose the energy-store bridge",
                    scenario:
                      "The team wants one analogy line that keeps learners asking which store is changing and which variable drives the comparison most strongly before any formula is used.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "store-and-driver",
                        label: "Use the analogy by asking which store is being filled or emptied, what transfer connects the stores, and which variable changes most strongly in this comparison.",
                        feedback:
                          "Exactly. That keeps the analogy serving the store-and-transfer meaning instead of replacing it.",
                        isCorrect: true,
                      },
                      {
                        value: "symbol-memory",
                        label: "Use the analogy mainly to remember the symbols in 1/2mv^2 and mgh, because once the symbols are recalled the store meaning matters less.",
                        feedback:
                          "This lesson wants the analogy to support the physics meaning before the formula is used, not to shrink the idea into symbol recall.",
                      },
                      {
                        value: "higher-means-more-total",
                        label: "Use the analogy to say that the higher object must always have more total energy than a lower faster one, because height is the clearest sign of stored energy.",
                        feedback:
                          "That would overclaim from the picture. This lesson needs the analogy to keep the stores and drivers separate, not to jump straight to a blanket ranking.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the store comparison without flattening it into symbols or a height-only shortcut.",
                    retryLabel: "That analogy would blur the energy-store story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L6") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l6-same-push-different-mass",
                  badge: "Mass board",
                  title: "Read the same-push comparison",
                  scenario:
                    "The dynamics room is comparing a light trolley and a heavy trolley under the same push. One trainee keeps expecting both trolleys to change motion by the same amount because the force arrow is the same size.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "same-force-different-acceleration",
                      label: "The same resultant force gives the smaller mass the larger acceleration, while the larger mass changes motion less because it has more inertia.",
                      feedback:
                        "Exactly. The force is the same, but the smaller mass responds with the bigger acceleration.",
                      isCorrect: true,
                    },
                    {
                      value: "same-force-same-acceleration",
                      label: "If the force arrows match, both trolleys must accelerate equally because acceleration depends only on force.",
                      feedback:
                        "Mass still matters. F = ma links all three quantities, so the same force does not guarantee the same acceleration.",
                    },
                    {
                      value: "heavier-faster-because-bigger",
                      label: "The heavier trolley should accelerate more because it has more mass for the force to act on.",
                      feedback:
                        "That reverses the relationship. More mass means more inertia, so the same force changes the heavier trolley less.",
                    },
                  ],
                  successLabel: "Pinned. The crew can now read the same-push comparison without losing the mass effect.",
                  retryLabel: "That note would keep force and mass disconnected.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l6-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first F = ma note",
                    scenario:
                      "A trainee has written that inertia is an extra backward force that always fights the push. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "inertia-is-not-a-force",
                        label: "Inertia is not an extra force. It is the resistance to changes in motion, which is why a larger mass accelerates less under the same resultant force.",
                        feedback:
                          "Exactly. That keeps inertia as a property of matter, not a new arrow in the force diagram.",
                        isCorrect: true,
                      },
                      {
                        value: "inertia-cancels-force",
                        label: "Inertia is the backward force that cancels part of the forward push, so the acceleration becomes smaller.",
                        feedback:
                          "That is the trap. The lesson needs inertia kept separate from the force arrows.",
                      },
                      {
                        value: "mass-does-not-matter",
                        label: "Ignore inertia and mass completely once the resultant force is known, because F = ma is really only about force.",
                        feedback:
                          "Mass is essential here. The same resultant force can give different accelerations because the mass changes.",
                      },
                    ],
                    successLabel: "Repair sent. The first inertia misunderstanding is now cleared.",
                    retryLabel: "That would leave inertia acting like a fake extra force.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l6-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line F = ma rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner starts these force-mass questions from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "fma-anchor",
                        label: "F = ma links resultant force, mass, and acceleration: the same force changes a smaller mass more than a larger mass.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "force-alone-anchor",
                        label: "Acceleration is decided by force alone, while mass only affects how heavy the trolley feels.",
                        feedback:
                          "That drops one of the key lesson links. Mass changes the acceleration too.",
                      },
                      {
                        value: "mass-alone-anchor",
                        label: "Mass decides acceleration, so force only matters after you know whether the object is heavy or light.",
                        feedback:
                          "Force and mass both matter. The lesson needs them linked in one relationship.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean force-mass anchor.",
                    retryLabel: "That line would leave the force-mass-acceleration link broken.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l6-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the acceleration analyst",
                    scenario:
                      "A trainee analyst wants to divide numbers immediately without first deciding which force belongs in the formula or what happens when one quantity changes.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "resultant-then-relationship",
                        label: "Find the resultant force first, then use F = ma to link force, mass, and acceleration before substituting values.",
                        feedback:
                          "Exactly. That method keeps the physics relationship in place before the arithmetic starts.",
                        isCorrect: true,
                      },
                      {
                        value: "any-force-arrow",
                        label: "Pick any force from the diagram and divide by the mass, because the biggest arrow should be close enough for F = ma.",
                        feedback:
                          "The formula needs the resultant force, not just any one force shown in the situation.",
                      },
                      {
                        value: "memorize-only",
                        label: "Memorize that heavier objects are slower and lighter objects are faster, then choose the nearest option without checking the force relationship.",
                        feedback:
                          "That turns the lesson into a shortcut. The analyst needs the actual F = ma relationship, not a rough slogan.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable F = ma method.",
                    retryLabel: "That instruction would send the analyst into shortcut maths.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l6-common-trap",
                    badge: "Trap alert",
                    title: "Block the inertia shortcut",
                    scenario:
                      "One crew member keeps saying that a heavier trolley should accelerate less because inertia pushes back like an extra hidden force. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "inertia-property-not-force",
                        label: "Inertia is a property of matter, not an extra force. The same resultant force gives a larger mass a smaller acceleration because a = F / m.",
                        feedback:
                          "Exactly. That warning keeps the lesson using the formula and the meaning of inertia together.",
                        isCorrect: true,
                      },
                      {
                        value: "inertia-backward-force",
                        label: "Treat inertia as a backward force arrow whenever the object is hard to accelerate, because that shows why the motion change becomes small.",
                        feedback:
                          "That is the trap. Inertia explains resistance to change, but it is not another force arrow to subtract.",
                      },
                      {
                        value: "mass-stops-acceleration",
                        label: "A large enough mass can switch acceleration off completely even when a non-zero resultant force still acts.",
                        feedback:
                          "A larger mass reduces the acceleration for the same force, but it does not make a non-zero resultant produce zero acceleration.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps inertia separate from the force diagram.",
                    retryLabel: "That warning would keep the biggest F = ma shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l6-analogy",
                    badge: "Story relay",
                    title: "Choose the shopping-cart analogy",
                    scenario:
                      "The team wants one analogy that makes the same-force / different-mass story obvious before the algebra begins.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "shopping-cart-shove",
                        label: "Use a shopping cart comparison: the same shove changes an empty cart more than a loaded cart because the loaded cart has more mass and more inertia.",
                        feedback:
                          "Exactly. That analogy keeps same force, different mass, and inertia in one clear picture.",
                        isCorrect: true,
                      },
                      {
                        value: "bigger-cart-bigger-force",
                        label: "Use a bigger-cart picture, because a larger cart automatically creates a larger force even before anyone pushes it.",
                        feedback:
                          "Mass does not automatically create the push. The analogy should keep the force the same and compare the response.",
                      },
                      {
                        value: "cart-weight-only",
                        label: "Use a heavy-cart picture only to show that more weight means more downward force, because that alone explains the acceleration difference.",
                        feedback:
                          "That misses the lesson target. The analogy needs the same shove with different masses, not a switch into weight alone.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the F = ma story without flattening it.",
                    retryLabel: "That analogy would blur the same-force comparison right when it needs to stay clear.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L4") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l4-slope-area",
                  badge: "Graph board",
                  title: "Separate slope from area",
                  scenario:
                    "The motion room is using one velocity-time graph to answer two different questions. One trainee keeps trying to use the same graph feature for everything.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "height-slope-area",
                      label: "On a velocity-time graph, height gives velocity, slope gives acceleration, and area gives displacement change.",
                      feedback:
                        "Exactly. That keeps the three graph features doing three different jobs.",
                      isCorrect: true,
                    },
                    {
                      value: "height-does-all",
                      label: "Use the graph height for acceleration and displacement too, because it is the most visible feature on the graph.",
                      feedback:
                        "That collapses three different ideas into one. Height gives velocity here, not acceleration or displacement.",
                    },
                    {
                      value: "horizontal-means-zero-displacement",
                      label: "A horizontal section means zero displacement, because the graph is not rising anymore.",
                      feedback:
                        "A horizontal section means zero acceleration. If the line is above or below zero velocity, area still builds up and displacement still changes.",
                    },
                  ],
                  successLabel: "Pinned. The crew can now use the same graph for velocity, acceleration, and displacement without mixing them up.",
                  retryLabel: "That note would keep slope and area blurred together.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l4-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first velocity-time note",
                    scenario:
                      "A trainee has written that a flat velocity-time section means nothing happens, so both acceleration and displacement are zero. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "flat-zero-acc-not-zero-displacement",
                        label: "A flat section means zero acceleration, but if the velocity is not zero then displacement still builds up through the area under the graph.",
                        feedback:
                          "Exactly. That separates the slope idea from the area idea properly.",
                        isCorrect: true,
                      },
                      {
                        value: "flat-zero-everything",
                        label: "A flat section means the graph has stopped changing, so acceleration and displacement must both be zero there.",
                        feedback:
                          "That is the trap. Flat means zero slope, not zero area.",
                      },
                      {
                        value: "height-means-acceleration",
                        label: "The graph height tells the acceleration, so a non-zero flat section means constant acceleration.",
                        feedback:
                          "Height gives velocity on this graph, not acceleration. Acceleration comes from the slope.",
                      },
                    ],
                    successLabel: "Repair sent. The first velocity-time misunderstanding is now cleared.",
                    retryLabel: "That would leave the key slope-versus-area confusion alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l4-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line graph rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner uses the same anchor idea when reading a velocity-time graph.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "vt-height-slope-area",
                        label: "On a velocity-time graph, height gives velocity, slope gives acceleration, and area gives displacement change.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "vt-height-speed-slope-distance",
                        label: "On a velocity-time graph, height gives speed, slope gives distance, and area just confirms the motion shape.",
                        feedback:
                          "That swaps the meanings around. Slope gives acceleration and area gives displacement change.",
                      },
                      {
                        value: "vt-one-feature",
                        label: "A velocity-time graph mainly needs one feature at a time, so the safest method is to treat slope, height, and area as different ways of estimating the same thing.",
                        feedback:
                          "They are not estimates of the same thing. Each graph feature answers a different physics question.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean velocity-time anchor.",
                    retryLabel: "That line would blur the graph features together again.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l4-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the graph analyst",
                    scenario:
                      "A trainee analyst sees one velocity-time graph and wants to start calculating before deciding what quantity the question is asking for.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "name-quantity-then-feature",
                        label: "Name the target quantity first, then choose the graph feature that matches it: height for velocity, slope for acceleration, area for displacement.",
                        feedback:
                          "Exactly. That method stops the analyst from grabbing the wrong feature.",
                        isCorrect: true,
                      },
                      {
                        value: "start-with-height",
                        label: "Start with the graph height because it is the easiest value to read, then adjust it later if the question turns out to want something else.",
                        feedback:
                          "That invites the wrong start. The first step is to identify the quantity, not the easiest visible feature.",
                      },
                      {
                        value: "slope-for-all-change",
                        label: "Use the slope whenever the question mentions change, because displacement and acceleration are both changes in motion.",
                        feedback:
                          "Displacement on this graph comes from area, not slope. The feature depends on the quantity being asked for.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable graph-reading method.",
                    retryLabel: "That instruction would send the analyst into the usual feature mix-up.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l4-common-trap",
                    badge: "Trap alert",
                    title: "Block the slope-area mix-up",
                    scenario:
                      "One crew member keeps saying that if a question is about change, the slope must always be the right answer. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "quantity-decides-feature",
                        label: "The quantity decides the feature: slope for acceleration, area for displacement, height for velocity.",
                        feedback:
                          "Exactly. That warning keeps the shortcut from taking over.",
                        isCorrect: true,
                      },
                      {
                        value: "change-means-slope",
                        label: "Any motion question about change should use the slope first, because slope is the cleanest graph measure.",
                        feedback:
                          "That shortcut fails on displacement questions. Area can be the right feature even when the motion is changing.",
                      },
                      {
                        value: "horizontal-no-displacement",
                        label: "A horizontal line means no displacement can build up, so area questions can be ignored there.",
                        feedback:
                          "A horizontal line can still sit above or below zero velocity, so displacement can keep building through the area.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now picks the graph feature from the quantity, not from a shortcut.",
                    retryLabel: "That warning would leave the biggest velocity-time shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l4-analogy",
                    badge: "Story relay",
                    title: "Choose the motion-ledger analogy",
                    scenario:
                      "The team wants one analogy that keeps current velocity, change in velocity, and accumulated displacement separate on the same graph.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "ledger-height-slope-area",
                        label: "Use a motion ledger: the graph height is the current signed entry, the slope is how fast that entry is being updated, and the area is the running signed total.",
                        feedback:
                          "Exactly. That analogy keeps all three roles visible without collapsing them together.",
                        isCorrect: true,
                      },
                      {
                        value: "single-speedometer",
                        label: "Use one speedometer reading, because if the learner knows the current velocity the slope and area ideas will look after themselves.",
                        feedback:
                          "A single speedometer cannot show how the velocity is changing or how displacement accumulates.",
                      },
                      {
                        value: "distance-logbook",
                        label: "Use a distance logbook, because area and slope are both really just more detailed ways of restating the journey length.",
                        feedback:
                          "That collapses the graph too far. This lesson needs one analogy that preserves velocity, acceleration, and displacement as different readings.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the graph meanings instead of flattening them.",
                    retryLabel: "That analogy would blur the ledger roles right when they need to stay separate.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L5") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l5-balanced-unbalanced",
                  badge: "Force board",
                  title: "Read the leftover pull",
                  scenario:
                    "The mechanics room is comparing one balanced tug and one unbalanced tug. A trainee keeps counting arrows without deciding whether any pull is left over.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "resultant-is-leftover-pull",
                      label: "Combine the opposite pulls with their directions. Equal pulls leave zero resultant, but unequal pulls leave a resultant in the direction of the larger force.",
                      feedback:
                        "Exactly. That keeps the focus on the single leftover force, not on the number of arrows drawn.",
                      isCorrect: true,
                    },
                    {
                      value: "two-forces-means-motion",
                      label: "If two forces are shown, the object must accelerate because more than one force always means a change in motion.",
                      feedback:
                        "Two forces can still balance. The motion changes only if a non-zero resultant force is left over.",
                    },
                    {
                      value: "bigger-force-only-matters",
                      label: "Ignore the smaller force and just follow the larger arrow, because only the biggest force decides the motion.",
                      feedback:
                        "The smaller force still matters because the resultant comes from combining both forces, not from pretending one force disappears.",
                    },
                  ],
                  successLabel: "Pinned. The crew can now look for the leftover pull before predicting any motion change.",
                  retryLabel: "That note would keep the room counting arrows instead of finding the resultant.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l5-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first force note",
                    scenario:
                      "A trainee has written that zero resultant force means the object must be stationary. You need the correction that fixes that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "zero-resultant-zero-acceleration",
                        label: "Zero resultant force means zero acceleration, so the object can stay at rest or keep moving with constant velocity.",
                        feedback:
                          "Exactly. That separates 'no change in motion' from 'no motion at all.'",
                        isCorrect: true,
                      },
                      {
                        value: "zero-resultant-stopped",
                        label: "Zero resultant force means the pushes cancel completely, so the object must stop immediately.",
                        feedback:
                          "That is the trap. Balanced forces stop the velocity changing; they do not force the velocity to become zero.",
                      },
                      {
                        value: "any-force-means-acceleration",
                        label: "As long as at least one force is acting, the object must accelerate, even if the forces are balanced.",
                        feedback:
                          "Forces can act and still balance. Acceleration depends on the resultant force, not on whether any individual force is present.",
                      },
                    ],
                    successLabel: "Repair sent. The first resultant-force misunderstanding is now cleared.",
                    retryLabel: "That would leave the zero-resultant mistake active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l5-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line force rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner starts these force questions from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "resultant-decides-acceleration",
                        label: "Resultant force is the single overall force left after the pushes and pulls are combined, and that resultant decides the acceleration.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "largest-force-decides-motion",
                        label: "The largest single force decides the motion, so the smaller forces are mostly background detail.",
                        feedback:
                          "The lesson needs the combined effect of all the forces. Smaller forces still change the resultant.",
                      },
                      {
                        value: "balanced-means-no-forces",
                        label: "Balanced forces mean there are really no forces acting, so the diagram can be treated as empty.",
                        feedback:
                          "Balanced means the forces cancel in the combination. It does not mean the forces themselves vanish from the situation.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean resultant-force anchor.",
                    retryLabel: "That line would blur force balance and motion change together again.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l5-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the force analyst",
                    scenario:
                      "A trainee analyst sees opposing arrows and wants to predict the motion before combining them properly. You can send one method instruction before they start.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "combine-forces-first",
                        label: "Choose a direction, combine the forces along that line, then decide whether the leftover resultant is zero or points with the larger side.",
                        feedback:
                          "Exactly. That method keeps the force combination and the motion prediction in the right order.",
                        isCorrect: true,
                      },
                      {
                        value: "predict-from-arrow-count",
                        label: "Count how many arrows point each way first, because the side with more arrows should control the motion.",
                        feedback:
                          "Arrow count is not the rule. The force sizes and directions decide the resultant.",
                      },
                      {
                        value: "motion-first-force-second",
                        label: "Decide whether the object is speeding up or slowing down from the story first, then match a force diagram afterward.",
                        feedback:
                          "That reverses the method. The force analysis should come first, because acceleration depends on the resultant.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable resultant-force method.",
                    retryLabel: "That instruction would send the analyst back into force-diagram guesswork.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l5-common-trap",
                    badge: "Trap alert",
                    title: "Block the zero-force shortcut",
                    scenario:
                      "One crew member keeps saying that if the resultant force is zero, the object cannot be moving. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "zero-resultant-not-zero-velocity",
                        label: "Zero resultant force means zero acceleration, not zero velocity. The object can keep moving at constant velocity.",
                        feedback:
                          "Exactly. That warning protects the lesson’s main distinction.",
                        isCorrect: true,
                      },
                      {
                        value: "zero-resultant-no-motion",
                        label: "Zero resultant force means the object has no motion, because balanced pulls always freeze the object in place.",
                        feedback:
                          "That is the trap. Balanced pulls stop changes in motion, but they do not automatically stop existing motion.",
                      },
                      {
                        value: "unbalanced-only-speeding",
                        label: "An unbalanced force only matters if the object is already speeding up; otherwise the force story can be ignored.",
                        feedback:
                          "Any non-zero resultant matters because it causes acceleration, even if the object started from rest.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now keeps zero acceleration separate from zero velocity.",
                    retryLabel: "That warning would leave the biggest resultant-force shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l5-analogy",
                    badge: "Story relay",
                    title: "Choose the tug-of-war analogy",
                    scenario:
                      "The team wants one analogy that makes balanced and unbalanced forces obvious without flattening the lesson into 'bigger wins' language.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "tug-of-war-leftover-pull",
                        label: "Use a tug-of-war rope: equal opposite teams leave no net pull, but if one side pulls harder there is a leftover pull in that direction.",
                        feedback:
                          "Exactly. That analogy keeps the resultant as the leftover pull after the forces are combined.",
                        isCorrect: true,
                      },
                      {
                        value: "single-strongest-pull",
                        label: "Use the strongest single pull only, because the lesson mainly needs the learner to follow the biggest force arrow.",
                        feedback:
                          "That loses the balancing idea. The smaller pull still matters because it changes the leftover resultant.",
                      },
                      {
                        value: "rope-means-no-motion",
                        label: "Use a tied rope picture, because if the rope does not move then the lesson can treat every balanced case as complete rest.",
                        feedback:
                          "The key idea is not 'rope equals no motion.' It is that equal opposite pulls leave zero resultant, which means no acceleration.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports force balance without collapsing the lesson into a shortcut.",
                    retryLabel: "That analogy would blur the resultant-force story instead of clarifying it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L3") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l3-journey-graph",
                  badge: "Journey graph",
                  title: "Translate the graph into a motion story",
                  scenario:
                    "The distance-time board shows a steep section, a flat section, and then a shallower section. One trainee keeps reading the picture shape instead of the journey story.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "steep-flat-shallow-story",
                      label: "Steep means the traveller is covering distance faster, flat means the traveller is stopped, and a shallower rise means the traveller is still moving but more slowly.",
                      feedback:
                        "Exactly. That reads the graph segment by segment as a motion story.",
                      isCorrect: true,
                    },
                    {
                      value: "height-means-speed",
                      label: "The higher part of the graph must be the faster part, because a larger height always means greater speed.",
                      feedback:
                        "Height gives the distance reached, not the speed. Speed comes from the steepness of the segment.",
                    },
                    {
                      value: "flat-means-no-time",
                      label: "A flat section means the graph pauses there, so no time passes until the line starts rising again.",
                      feedback:
                        "Time keeps moving along the horizontal axis. Flat means distance stays constant while time continues.",
                    },
                  ],
                  successLabel: "Pinned. The crew can now read the graph one segment at a time instead of matching it by shape.",
                  retryLabel: "That note would keep the distance-time story blurred.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l3-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first graph note",
                    scenario:
                      "A trainee has written that a flat section means time stops and that a higher graph section means faster motion. You need the correction that clears both mistakes before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "flat-time-height-slope",
                        label: "Time still moves along the horizontal axis, so a flat section means the distance stays constant, while speed comes from the segment steepness, not the graph height.",
                        feedback:
                          "Exactly. That repairs both the flat-line mistake and the height-versus-speed mistake together.",
                        isCorrect: true,
                      },
                      {
                        value: "flat-no-distance-or-time",
                        label: "A flat section means both time and distance pause, so the graph is really blank at that part.",
                        feedback:
                          "The graph is not blank. Time still passes there; only the distance value stays fixed.",
                      },
                      {
                        value: "higher-faster",
                        label: "The higher graph section is always the faster part, because the traveller is farther from the start there.",
                        feedback:
                          "Being farther away does not automatically mean moving faster. Speed comes from how steeply the line rises.",
                      },
                    ],
                    successLabel: "Repair sent. The first distance-time misunderstandings are now cleared.",
                    retryLabel: "That would leave the main graph-reading mistakes active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l3-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line distance-time rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner reads a distance-time graph from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "height-distance-slope-speed",
                        label: "On a distance-time graph, height gives the distance reached by that time and slope gives the speed on that segment.",
                        feedback:
                          "Exactly. That is the clean anchor sentence this lesson needs.",
                        isCorrect: true,
                      },
                      {
                        value: "height-speed-slope-distance",
                        label: "On a distance-time graph, height gives the speed and slope gives how far from the start the traveller is.",
                        feedback:
                          "That swaps the meanings. Height gives distance and slope gives speed here.",
                      },
                      {
                        value: "flat-no-story",
                        label: "A distance-time graph mostly tells one overall route story, so individual segments do not need separate meanings.",
                        feedback:
                          "The segments are exactly what tell the motion story. Each one can represent a different stage of the journey.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean distance-time anchor.",
                    retryLabel: "That line would blur the graph meanings together again.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l3-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the graph analyst",
                    scenario:
                      "A trainee analyst sees three graph segments and wants to jump straight to an answer without checking what each section says physically.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "read-one-segment-at-a-time",
                        label: "Read one segment at a time: say whether distance is rising or flat, then use the steepness of that segment to decide how the speed compares.",
                        feedback:
                          "Exactly. That method keeps the motion story tied to each segment instead of to the whole shape at once.",
                        isCorrect: true,
                      },
                      {
                        value: "read-highest-point-first",
                        label: "Start with the highest point on the graph, because that tells you the fastest moment and the rest of the graph can be estimated from it.",
                        feedback:
                          "The highest point tells you the greatest distance reached, not the fastest moment. Speed comes from the slope.",
                      },
                      {
                        value: "average-the-slopes-immediately",
                        label: "Average the steepness of the visible segments first, because that gives the cleanest overall motion answer.",
                        feedback:
                          "That skips the story each segment is telling. The first job is to understand each stage before combining anything.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable segment-by-segment method.",
                    retryLabel: "That instruction would send the analyst back into shape-matching.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l3-common-trap",
                    badge: "Trap alert",
                    title: "Block the height-means-speed shortcut",
                    scenario:
                      "One crew member keeps pointing to the highest part of the graph whenever the question asks about speed. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "speed-from-steepness",
                        label: "On a distance-time graph, speed comes from the segment steepness, not from how high the graph sits above the axis.",
                        feedback:
                          "Exactly. That warning keeps height and speed from being mixed up.",
                        isCorrect: true,
                      },
                      {
                        value: "higher-means-faster",
                        label: "The higher segment is the faster segment, because the traveller has reached more distance there.",
                        feedback:
                          "That is the trap. Higher means farther from the start, not automatically faster.",
                      },
                      {
                        value: "flat-means-backwards",
                        label: "A flat segment means the traveller is probably turning back, because the graph stops rising for a while.",
                        feedback:
                          "Flat means stopped in this lesson, not turning back. Distance stays constant while time continues.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now uses steepness, not height, to judge speed.",
                    retryLabel: "That warning would leave the most tempting distance-time shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l3-analogy",
                    badge: "Story relay",
                    title: "Choose the travel-diary analogy",
                    scenario:
                      "The team wants one analogy that makes each graph segment feel like a stage of the journey instead of a decorative line shape.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "travel-diary",
                        label: "Use a travel diary: each graph segment is one diary entry showing how quickly distance was being added during that stage of the journey.",
                        feedback:
                          "Exactly. That analogy keeps the graph readable as a sequence of motion stages.",
                        isCorrect: true,
                      },
                      {
                        value: "mountain-silhouette",
                        label: "Use a mountain silhouette, because the graph mainly shows how high or low the route looks at different times.",
                        feedback:
                          "That turns the graph into a picture of the path. This lesson needs the graph read as a record of distance over time.",
                      },
                      {
                        value: "single-odometer",
                        label: "Use one odometer reading only, because once the total distance is visible the segment meanings will take care of themselves.",
                        feedback:
                          "The total distance alone cannot tell the stage-by-stage motion story. The segment changes still matter.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports segment-by-segment graph reading instead of flattening the lesson.",
                    retryLabel: "That analogy would push the graph back toward a picture-reading mistake.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L2") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l2-velocity-arrows",
                  badge: "Arrow screen",
                  title: "Read the velocity change before the sign",
                  scenario:
                    "The acceleration room is comparing the starting and finishing velocity arrows. One trainee keeps naming the sign from intuition before checking what actually changed.",
                  prompt: "Choose the note you pin on the display.",
                  options: [
                    {
                      value: "compare_final_minus_initial",
                      label: "Write the initial and final velocities with signs first, then use final velocity minus initial velocity before deciding what the acceleration sign means.",
                      feedback:
                        "Exactly. That keeps the sign tied to the actual change in velocity instead of to a quick guess about speeding up or slowing down.",
                      isCorrect: true,
                    },
                    {
                      value: "speed_change_only",
                      label: "Ignore the direction arrows and just compare the speeds, because acceleration is really about how fast the object is moving.",
                      feedback:
                        "That would lose the whole point of this lesson. Acceleration is based on change in velocity, and velocity keeps direction.",
                    },
                    {
                      value: "negative_means_slowing",
                      label: "If the final speed is smaller, call the acceleration negative immediately because negative always means slowing down.",
                      feedback:
                        "That shortcut fails as soon as the chosen positive direction changes. The sign only makes sense after you compare the signed velocities.",
                    },
                  ],
                  successLabel: "Pinned. The display now forces the crew to compare signed velocities before naming the acceleration.",
                  retryLabel: "That note would keep the room guessing from speed words instead of from the velocity change.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l2-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first acceleration note",
                    scenario:
                      "A trainee has written that acceleration just means speeding up. You need the one correction that keeps turning, slowing, and sign convention visible.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "acceleration_is_velocity_change",
                        label: "Acceleration measures change in velocity, so a change in speed or a change in direction can both produce acceleration.",
                        feedback:
                          "Exactly. That is the core repair the trainee needs before the lesson can move on.",
                        isCorrect: true,
                      },
                      {
                        value: "acceleration_means_speeding",
                        label: "Acceleration is the same as speeding up, so a constant-speed turn cannot involve acceleration.",
                        feedback:
                          "That is the mistake we need to remove. A turn changes velocity because the direction changes even if the speed stays the same.",
                      },
                      {
                        value: "negative_equals_slowing",
                        label: "Negative acceleration means the object must always be slowing down, whatever direction convention was chosen.",
                        feedback:
                          "That ignores the sign convention. Negative only tells you the acceleration points in the chosen negative direction.",
                      },
                    ],
                    successLabel: "Repair sent. The lesson note now treats acceleration as change in velocity, not just speed change.",
                    retryLabel: "That would leave the first acceleration misunderstanding active.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l2-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line acceleration rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner solves signed acceleration questions from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "delta_v_over_t_with_signs",
                        label: "Acceleration comes from final velocity minus initial velocity, divided by time, with the sign interpreted using the chosen positive direction.",
                        feedback:
                          "Exactly. That keeps the calculation, the sign, and the direction convention tied together.",
                        isCorrect: true,
                      },
                      {
                        value: "speed_change_only",
                        label: "Acceleration comes from the change in speed only, because the direction has already been handled by the motion question.",
                        feedback:
                          "That drops the most important feature of velocity. The sign and direction still matter when you calculate acceleration.",
                      },
                      {
                        value: "sign_before_calculation",
                        label: "Choose the acceleration sign first from the story words, then calculate only the size of the change afterward.",
                        feedback:
                          "That invites guessing. The sign should come from the signed velocity change after the calculation is set up properly.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean acceleration method to follow.",
                    retryLabel: "That line would blur the sign convention and the actual velocity change.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l2-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the velocity analyst",
                    scenario:
                      "A trainee analyst is about to rush into a signed acceleration problem. You can send one method instruction before they start.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "sign_velocities_then_subtract",
                        label: "Choose the positive direction, write the initial and final velocities with signs, then do final minus initial before dividing by time.",
                        feedback:
                          "Exactly. That method keeps the sign logic under control and prevents story-word guessing.",
                        isCorrect: true,
                      },
                      {
                        value: "subtract_speeds_only",
                        label: "Compare the speeds first, because using signed velocities will only make the calculation harder than it needs to be.",
                        feedback:
                          "That shortcut breaks signed questions. You need signed velocities if the lesson is asking about direction-aware acceleration.",
                      },
                      {
                        value: "divide_before_change",
                        label: "Divide each velocity by the time first, then compare the two results to get acceleration.",
                        feedback:
                          "That changes the structure of the calculation. Acceleration comes from the change in velocity over the time interval, not from dividing each velocity separately first.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a reliable signed-acceleration method.",
                    retryLabel: "That instruction would send the analyst into the usual sign mistake.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l2-common-trap",
                    badge: "Trap alert",
                    title: "Block the negative-means-slowing shortcut",
                    scenario:
                      "One crew member keeps saying that any negative acceleration means the object is slowing down. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "sign_depends_on_chosen_direction",
                        label: "Negative acceleration only tells you the acceleration points in the chosen negative direction; whether the speed rises or falls depends on the direction of the velocity too.",
                        feedback:
                          "Exactly. The sign convention and the current velocity direction both have to stay visible.",
                        isCorrect: true,
                      },
                      {
                        value: "negative_always_slowing",
                        label: "Negative acceleration is the universal slowing-down sign, so direction conventions do not really matter after that.",
                        feedback:
                          "That is the trap. Negative does not automatically mean slowing down in every signed motion story.",
                      },
                      {
                        value: "positive_always_speeding",
                        label: "Positive acceleration always means speeding up, so the sign can be read before you know the direction of motion.",
                        feedback:
                          "That is just the same shortcut in reverse. Speeding up or slowing down depends on how acceleration compares with the current velocity direction.",
                      },
                    ],
                    successLabel: "Trap blocked. The room now treats sign and speeding/slowing as related but not identical ideas.",
                    retryLabel: "That warning would leave the most tempting acceleration shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l2-analogy",
                    badge: "Story relay",
                    title: "Choose the arrow-change analogy",
                    scenario:
                      "The team wants one analogy that keeps acceleration tied to the change between two velocity arrows instead of to a vague feeling about speed.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "before_after_velocity_arrows",
                        label: "Use a before-and-after velocity-arrow comparison, then measure how much that arrow changes over the time interval.",
                        feedback:
                          "Exactly. That analogy keeps acceleration tied to the change in velocity itself.",
                        isCorrect: true,
                      },
                      {
                        value: "single_speedometer",
                        label: "Use one speedometer reading, because the fastest way to see acceleration is just to watch whether the speed number feels larger or smaller.",
                        feedback:
                          "One speed reading cannot show the change on its own. Acceleration needs a before-and-after velocity comparison.",
                      },
                      {
                        value: "distance_logbook",
                        label: "Use a distance logbook, because acceleration is really just a more detailed version of distance covered over time.",
                        feedback:
                          "That confuses acceleration with route tracking. This lesson needs velocity change, not distance accumulation.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the acceleration idea instead of flattening it into a speed guess.",
                    retryLabel: "That analogy would blur velocity change right when it should be clarified.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F2_L1") {
              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f2-l1-route-arrow",
                  badge: "Route board",
                  title: "Separate the route from the arrow",
                  scenario:
                    "The motion room can see the journey path and the straight start-to-finish arrow at the same time. You get one note to stop the crew from reading both as the same quantity.",
                  prompt: "Choose the note to pin on the display.",
                  options: [
                    {
                      value: "distance_route_displacement_arrow",
                      label: "Distance follows the whole route, while displacement is the single start-to-finish arrow with direction.",
                      feedback:
                        "Exactly. That keeps route length and net change separate before any numbers are added.",
                      isCorrect: true,
                    },
                    {
                      value: "distance_arrow_displacement_route",
                      label: "Distance is the straight arrow, while displacement follows every bend and return in the route.",
                      feedback:
                        "That swaps the two ideas. The whole route belongs to distance, while the straight start-to-finish change belongs to displacement.",
                    },
                    {
                      value: "same_if_same_finish",
                      label: "If the journey ends at the same place it started, distance and displacement are both zero.",
                      feedback:
                        "A round trip can make displacement zero, but the full route distance can still be large.",
                    },
                  ],
                  successLabel: "Display pinned. The crew can now read the journey with two different motion questions in mind.",
                  retryLabel: "That note would blur route length and net change together again.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f2-l1-fix-ideas",
                    badge: "Signal repair",
                    title: "Repair the first journey note",
                    scenario:
                      "A trainee has written that distance and displacement are basically the same unless the object turns round completely. You need to correct that note before the lesson moves on.",
                    prompt: "Choose the correction to send.",
                    options: [
                      {
                        value: "route_vs_finish",
                        label: "Distance uses the whole route, but displacement only compares the finishing point with the starting point and keeps direction.",
                        feedback:
                          "Exactly. That is the clean distinction the trainee needs before solving any journey question.",
                        isCorrect: true,
                      },
                      {
                        value: "same_unless_return",
                        label: "Distance and displacement stay the same for most journeys, so only complete round trips really separate them.",
                        feedback:
                          "Even a partial return can make distance and displacement different. They answer different questions on every multi-stage trip.",
                      },
                      {
                        value: "distance_needs_direction",
                        label: "Distance is the one that needs the direction word, because it follows the real path.",
                        feedback:
                          "Direction belongs to displacement here. Distance just adds the route length.",
                      },
                    ],
                    successLabel: "Repair sent. The journey note now separates route length from net change properly.",
                    retryLabel: "That would leave the first mechanics misunderstanding alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f2-l1-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line motion rule",
                    scenario:
                      "Control wants one sentence on the wall so every learner solves journey questions from the same anchor idea.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "distance_route_displacement_net_speed_total",
                        label: "Distance adds the route, displacement keeps the net start-to-finish change with direction, and average speed uses total distance over total time.",
                        feedback:
                          "Exactly. That line keeps the three lesson quantities separate and useful.",
                        isCorrect: true,
                      },
                      {
                        value: "distance_speed_same",
                        label: "Distance and average speed are both route quantities, so they can be solved from the same number line without using time carefully.",
                        feedback:
                          "Average speed still depends on total time. It is linked to the route, but not identical to distance.",
                      },
                      {
                        value: "displacement_is_shorter_distance",
                        label: "Displacement is just the shorter version of distance, so it usually needs the same method with fewer steps.",
                        feedback:
                          "Displacement is not a shortened distance. It is a different question about the net change from start to finish.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean mechanics anchor.",
                    retryLabel: "That line would collapse three different motion ideas into one blur.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reason through it") {
                  return {
                    id: "f2-l1-how-to-reason",
                    badge: "Guidance channel",
                    title: "Coach the route analyst",
                    scenario:
                      "A trainee analyst sees a multi-stage journey and wants to subtract or average numbers too early. You can send one method instruction before they start.",
                    prompt: "Choose the coaching instruction.",
                    options: [
                      {
                        value: "identify_quantity_first",
                        label: "First decide whether the question wants the whole route, the net start-to-finish change, or the whole-journey average speed.",
                        feedback:
                          "Exactly. That choice decides whether to add the route, compare positions, or divide total distance by total time.",
                        isCorrect: true,
                      },
                      {
                        value: "average_stage_speeds",
                        label: "Work out the speed of each stage first, then average those stage speeds for every average-speed question.",
                        feedback:
                          "That shortcut is unsafe. Average speed for the whole trip uses total distance and total time, not a casual average of stage speeds.",
                      },
                      {
                        value: "subtract_returns_for_distance",
                        label: "Subtract any return part immediately, because backwards motion cancels distance the same way it cancels displacement.",
                        feedback:
                          "Return parts still count toward total distance. Only displacement uses the net change after directions are considered.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a real journey-solving method.",
                    retryLabel: "That instruction would send the analyst into the standard route-question trap.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common trap") {
                  return {
                    id: "f2-l1-common-trap",
                    badge: "Trap alert",
                    title: "Block the average-speed shortcut",
                    scenario:
                      "One crew member keeps saying average speed is found by averaging the speeds of the visible stages. You need the warning that shuts that shortcut down.",
                    prompt: "Choose the trap warning.",
                    options: [
                      {
                        value: "use_total_distance_time",
                        label: "Average speed for the whole trip comes from total distance divided by total time, not from averaging stage speeds by habit.",
                        feedback:
                          "Exactly. The whole-journey totals decide average speed, especially when stage times differ.",
                        isCorrect: true,
                      },
                      {
                        value: "use_displacement_instead",
                        label: "Average speed should use displacement because it is the cleaner route number.",
                        feedback:
                          "That would switch to a different quantity. Average speed uses total distance, not displacement.",
                      },
                      {
                        value: "largest_stage_only",
                        label: "The largest stage speed should dominate the answer because it tells the strongest motion part of the trip.",
                        feedback:
                          "A fast stage can matter, but average speed still depends on the full journey totals, not the biggest single stage.",
                      },
                    ],
                    successLabel: "Trap blocked. The room will now use the whole-journey rule instead of the shortcut.",
                    retryLabel: "That warning would leave the most tempting average-speed mistake alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f2-l1-analogy",
                    badge: "Story relay",
                    title: "Choose the journey analogy",
                    scenario:
                      "The team wants one analogy that keeps route length and start-to-finish change separate without weakening the lesson into a vague travel story.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "odometer_and_arrow",
                        label: "Use an odometer for the whole route and a straight map arrow for the start-to-finish change.",
                        feedback:
                          "Exactly. That analogy keeps distance and displacement doing different jobs in one journey.",
                        isCorrect: true,
                      },
                      {
                        value: "single_map_line",
                        label: "Use one map line for both quantities, because the route itself already contains the start and finish.",
                        feedback:
                          "That collapses the two ideas. The route and the straight start-to-finish change need different representations here.",
                      },
                      {
                        value: "clock_only",
                        label: "Use only a travel clock, because once time is tracked carefully the distance-displacement difference becomes obvious automatically.",
                        feedback:
                          "Time matters for average speed, but a clock alone cannot separate route length from net position change.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the mechanics idea instead of flattening it.",
                    retryLabel: "That analogy would blur the lesson right when it should clarify it.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L6") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l6-table-${activeTableIndex}`,
                  badge: "Target board",
                  title: "Separate accuracy from precision",
                  scenario:
                    "The target-board crew is mixing up closeness to the centre with closeness among repeated readings. You need the board note that keeps those ideas apart.",
                  prompt: "Choose the board note you send.",
                  options: [
                    {
                      value: "accuracy_vs_precision",
                      label: "Accuracy asks how close the result is to the accepted value, while precision asks how closely repeated readings agree with each other.",
                      feedback:
                        "Exactly. That note keeps target position separate from clustering.",
                      isCorrect: true,
                    },
                    {
                      value: "accuracy_is_clustering",
                      label: "Accuracy means the readings are tightly clustered, even if the whole cluster misses the accepted value.",
                      feedback:
                        "Tight clustering shows precision, not accuracy. Accuracy still depends on closeness to the accepted value.",
                    },
                    {
                      value: "precision_is_centre",
                      label: "Precision means the readings land near the centre, because being near the accepted value is the same thing as agreement.",
                      feedback:
                        "Near the centre shows accuracy. Precision is about the readings agreeing closely with one another.",
                    },
                  ],
                  successLabel: "Target board aligned. The crew now has the right two-question test.",
                  retryLabel: "That note would collapse two different measurement ideas into one.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 1) {
                return {
                  id: `f1-l6-table-${activeTableIndex}`,
                  badge: "Pattern map",
                  title: "Call the result pattern correctly",
                  scenario:
                    "The pattern map is live, but a trainee keeps naming every tight cluster as a 'good result' without checking where it sits relative to the target.",
                  prompt: "Choose the pattern rule you send.",
                  options: [
                    {
                      value: "tight_and_off_target",
                      label: "A tight cluster away from the target is precise but not accurate, while a spread-out set around the target can be accurate on average but not very precise.",
                      feedback:
                        "Exactly. The pattern name depends on both spread and position, not one feature alone.",
                      isCorrect: true,
                    },
                    {
                      value: "tight_means_both",
                      label: "Any tight cluster is automatically both accurate and precise because agreement among readings proves the method is good.",
                      feedback:
                        "A tight cluster can still miss the accepted value. That would make it precise but not accurate.",
                    },
                    {
                      value: "spread_means_wrong",
                      label: "Any spread-out set is automatically neither accurate nor precise because scatter always makes the average useless.",
                      feedback:
                        "A spread-out set can still average near the accepted value, so it can be accurate but not very precise.",
                    },
                  ],
                  successLabel: "Pattern map secured. The crew can now name the reading pattern honestly.",
                  retryLabel: "That rule would mislabel at least one common result pattern.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l6-target-board-visual",
                  badge: "Aim check",
                  title: "Send the target-board call",
                  scenario:
                    "The visual is frozen on a target board with clustered hits. The team needs one call that explains what the shape and position are telling them.",
                  prompt: "Choose the call you send.",
                  options: [
                    {
                      value: "shape_and_position",
                      label: "The cluster shape tells you about precision, and the cluster position relative to the centre tells you about accuracy.",
                      feedback:
                        "Exactly. That keeps the two visual clues doing different jobs.",
                      isCorrect: true,
                    },
                    {
                      value: "centre_only",
                      label: "Only the distance from the centre matters, because the spread never changes the judgement of a measurement pattern.",
                      feedback:
                        "Spread still matters. A result can sit near the centre on average but have poor precision if the readings scatter widely.",
                    },
                    {
                      value: "cluster_only",
                      label: "Only the tightness of the cluster matters, because agreement between readings is enough to show the result is trustworthy.",
                      feedback:
                        "Agreement alone is not enough. A tight cluster can still be shifted away from the accepted value.",
                    },
                  ],
                  successLabel: "Call sent. The crew can now read the target board without mixing up the clues.",
                  retryLabel: "That call would make the target board tell only half the story.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l6-measurement-report-lab",
                  badge: "Report lab",
                  title: "Approve the measurement report",
                  scenario:
                    "The report lab is assembling a final measurement statement. One version looks tidy, but only one version matches the tool, the stated value, and the uncertainty honestly.",
                  prompt: "Choose the report rule you approve.",
                  options: [
                    {
                      value: "tool_value_uncertainty_match",
                      label: "Use a suitable instrument, state the measured value with its unit, and report a reasonable uncertainty that matches what the instrument can support.",
                      feedback:
                        "Exactly. A trustworthy report needs the method and the written claim to support each other.",
                      isCorrect: true,
                    },
                    {
                      value: "value_only",
                      label: "Write the measured value only, because uncertainty just makes the report look less confident and less scientific.",
                      feedback:
                        "Leaving out uncertainty makes the report pretend to more certainty than the instrument supports.",
                    },
                    {
                      value: "smallest_uncertainty_always",
                      label: "Choose the smallest uncertainty you can write, because that makes the result look most accurate to the reader.",
                      feedback:
                        "Uncertainty should be honest, not decorative. Writing an unrealistically small uncertainty weakens trustworthiness.",
                    },
                  ],
                  successLabel: "Report approved. The lab statement now matches the real quality of the measurement.",
                  retryLabel: "That rule would let the written report overclaim what the method can support.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l6-fix-ideas",
                    badge: "Repair desk",
                    title: "Correct the measurement-quality shortcut",
                    scenario:
                      "A trainee has written that one word, 'accurate', can describe any good-looking set of readings. You need the repair note that stops that shortcut from spreading.",
                    prompt: "Choose the repair note you send.",
                    options: [
                      {
                        value: "different_questions",
                        label: "Accuracy and precision answer different questions, so you have to test closeness to the accepted value separately from agreement between readings.",
                        feedback:
                          "Exactly. The shortcut fails because it tries to make one word do two jobs.",
                        isCorrect: true,
                      },
                      {
                        value: "accuracy_covers_all",
                        label: "Accuracy is the umbrella word for all strong measurements, so precision and uncertainty are really optional extra detail.",
                        feedback:
                          "That would erase important differences. Precision and uncertainty still matter because a result can be accurate in one sense and weak in another.",
                      },
                      {
                        value: "precision_proves_accuracy",
                        label: "If readings agree closely, that automatically proves they are accurate, so there is no need to compare with an accepted value.",
                        feedback:
                          "Close agreement alone can still miss the accepted value. That would be precise but not accurate.",
                      },
                    ],
                    successLabel: "Repair sent. The quality shortcut is gone.",
                    retryLabel: "That would keep the lesson stuck in one-word judgement instead of careful measurement analysis.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l6-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line quality rule",
                    scenario:
                      "Quest Control wants one line the crew can repeat before they judge any set of measurements.",
                    prompt: "Choose the line you post.",
                    options: [
                      {
                        value: "accuracy_precision_different",
                        label: "Accuracy asks whether you are close to the accepted value, while precision asks whether repeated readings agree closely.",
                        feedback:
                          "Exactly. That is the anchor sentence for the lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "accuracy_is_best_word",
                        label: "Accuracy is the only idea that matters, because closeness to the truth automatically includes precision and trustworthiness.",
                        feedback:
                          "That collapses three different judgements into one. Precision and trustworthiness still need their own checks.",
                      },
                      {
                        value: "precision_is_enough",
                        label: "Precision is the most important idea, because tightly grouped readings are always the safest measurements to trust.",
                        feedback:
                          "A tight cluster can still be shifted away from the accepted value or come from a poor method. Precision alone is not enough.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has a clear measurement-quality anchor.",
                    retryLabel: "That line would blur the lesson’s main distinction.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "possible measurement patterns") {
                  return {
                    id: "f1-l6-patterns",
                    badge: "Pattern desk",
                    title: "Name the reading pattern correctly",
                    scenario:
                      "The pattern desk is sorting measurement sets, but one trainee keeps calling every off-target set 'bad' without checking whether the readings at least agree with one another.",
                    prompt: "Choose the sorting rule you send.",
                    options: [
                      {
                        value: "check_spread_and_position",
                        label: "Check two things every time: the spread shows precision, and the average or cluster position relative to the accepted value shows accuracy.",
                        feedback:
                          "Exactly. That two-part rule lets the crew name all four common patterns properly.",
                        isCorrect: true,
                      },
                      {
                        value: "off_target_means_neither",
                        label: "If the readings miss the accepted value, the set must be neither accurate nor precise no matter how tightly grouped it is.",
                        feedback:
                          "Missing the accepted value does not erase precision. A tight off-target cluster is precise but not accurate.",
                      },
                      {
                        value: "wide_spread_means_never_accurate",
                        label: "If the readings are spread out, the set can never count as accurate because only tight clusters can be close to the accepted value.",
                        feedback:
                          "A spread-out set can still average near the accepted value, so it can be accurate on average but not very precise.",
                      },
                    ],
                    successLabel: "Pattern desk aligned. The crew can now read the four measurement patterns honestly.",
                    retryLabel: "That sorting rule would misclassify one of the standard result patterns.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "what makes a result trustworthy") {
                  return {
                    id: "f1-l6-trustworthy",
                    badge: "Trust check",
                    title: "Approve the trustworthy-measurement rule",
                    scenario:
                      "The trust check team wants one rule for deciding whether a result deserves confidence before it goes into the final report.",
                    prompt: "Choose the rule you approve.",
                    options: [
                      {
                        value: "method_and_reporting_support",
                        label: "A result is more trustworthy when the instrument suits the job, readings are repeated or checked, errors are controlled, and the report includes honest uncertainty.",
                        feedback:
                          "Exactly. Trustworthiness comes from the method and the reporting working together.",
                        isCorrect: true,
                      },
                      {
                        value: "single_reading_enough",
                        label: "One clean reading is enough to prove trustworthiness, as long as the number looks neat and the unit is present.",
                        feedback:
                          "A neat-looking single reading does not prove much on its own. Trust grows when the method and uncertainty are both checked carefully.",
                      },
                      {
                        value: "small_uncertainty_proves_method",
                        label: "Any result with a very small stated uncertainty is automatically trustworthy, even if the tool choice was poor.",
                        feedback:
                          "Uncertainty has to match the method honestly. A small uncertainty written beside a poor method does not create trust.",
                      },
                    ],
                    successLabel: "Trust rule approved. The team now knows what makes a result worth believing.",
                    retryLabel: "That rule would let tidy-looking numbers pass without enough method behind them.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l6-analogy",
                    badge: "Analogy relay",
                    title: "Choose the target-board analogy",
                    scenario:
                      "The lesson team wants one everyday picture that helps beginners feel the difference between accuracy and precision without flattening them into one idea.",
                    prompt: "Choose the analogy you send.",
                    options: [
                      {
                        value: "darts_target",
                        label: "A dartboard works well: a tight cluster shows precision, a cluster near the centre shows accuracy, and the strongest set does both at once.",
                        feedback:
                          "Exactly. That analogy keeps spread and target position doing different jobs.",
                        isCorrect: true,
                      },
                      {
                        value: "centre_only",
                        label: "Use a race finish line analogy where only winning matters, because being near the target already tells you everything important.",
                        feedback:
                          "That analogy loses the idea of clustering. The lesson needs both closeness to target and agreement among repeated readings.",
                      },
                      {
                        value: "tight_group_only",
                        label: "Use a marching analogy where walking in step is enough, because tight grouping already guarantees the result is good.",
                        feedback:
                          "That analogy would overvalue agreement alone. A tight group can still miss the accepted value.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the lesson’s two-part quality judgement.",
                    retryLabel: "That analogy would blur accuracy and precision together again.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L5") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l5-table-${activeTableIndex}`,
                  badge: "Packing board",
                  title: "Lock the density rule first",
                  scenario:
                    "The density desk is live, but one trainee keeps treating density as if it were just another word for weight. You need the board note that keeps mass, volume, and density in the right relationship.",
                  prompt: "Choose the board note you send.",
                  options: [
                    {
                      value: "mass_packed_into_volume",
                      label: "Density tells how much mass is packed into each unit of volume, so you have to compare mass and space together.",
                      feedback:
                        "Exactly. Density is about how tightly mass is packed into the available space.",
                      isCorrect: true,
                    },
                    {
                      value: "heavier_means_denser",
                      label: "The heavier object is always denser, because density is just the same thing as mass written differently.",
                      feedback:
                        "Heavier alone is not enough. A large object can have more mass but still be less dense if that mass is spread through much more volume.",
                    },
                    {
                      value: "size_only_decides",
                      label: "Density is really a size idea, so the smaller object is always denser no matter what its mass is.",
                      feedback:
                        "Size alone cannot decide density either. You need both the mass and the volume together.",
                    },
                  ],
                  successLabel: "Packing board secured. The crew now has the right density language.",
                  retryLabel: "That note would blur density into only mass or only size.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l5-equal-sized-blocks",
                  badge: "Block compare",
                  title: "Call the equal-size comparison",
                  scenario:
                    "Two equal-sized blocks are on the scan table. One is clearly heavier, and the trainee wants to describe that without accidentally talking only about mass.",
                  prompt: "Choose the comparison call you send.",
                  options: [
                    {
                      value: "same_volume_more_mass",
                      label: "If the volume stays the same, the block with more mass is denser because more mass is packed into the same space.",
                      feedback:
                        "Exactly. Keeping the same volume fixed makes the mass comparison a density comparison.",
                      isCorrect: true,
                    },
                    {
                      value: "same_volume_same_density",
                      label: "If two blocks have the same size, they must have the same density because density depends only on volume.",
                      feedback:
                        "Same size does not force the same density. The heavier block can be denser because it packs more mass into that same volume.",
                    },
                    {
                      value: "more_mass_only_heavier",
                      label: "You can only say the block is heavier; density cannot be compared until the blocks are different sizes.",
                      feedback:
                        "You can compare density here precisely because the blocks are the same size. More mass in the same volume means greater density.",
                    },
                  ],
                  successLabel: "Comparison sent. The crew can now separate mass from density properly.",
                  retryLabel: "That call would miss why equal-sized blocks are such a clean density comparison.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l5-float-sink",
                  badge: "Tank check",
                  title: "Send the float-or-sink rule",
                  scenario:
                    "The float tank is ready, but one teammate still wants to predict floating from weight alone. You need the rule that keeps the comparison tied to density.",
                  prompt: "Choose the tank rule you broadcast.",
                  options: [
                    {
                      value: "compare_object_to_fluid",
                      label: "Compare the object density with the fluid density: less dense objects float, more dense objects sink.",
                      feedback:
                        "Exactly. The float-or-sink call comes from the density comparison, not just the object's mass on its own.",
                      isCorrect: true,
                    },
                    {
                      value: "lighter_always_floats",
                      label: "A lighter object always floats because floating depends only on having less mass than something else.",
                      feedback:
                        "Floating is not decided by mass alone. A small metal object can be heavier than a foam block and still the comparison has to be made through density.",
                    },
                    {
                      value: "larger_always_floats",
                      label: "A larger object floats more easily because more size means more support from the liquid.",
                      feedback:
                        "Size by itself does not decide the outcome. The key comparison is still object density against fluid density.",
                    },
                  ],
                  successLabel: "Tank rule sent. The crew will now predict floating from density, not guesswork.",
                  retryLabel: "That rule would send the tank team back to mass-only thinking.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l5-fix-ideas",
                    badge: "Repair desk",
                    title: "Correct the heavy-means-dense myth",
                    scenario:
                      "A trainee has written that the heavier object must always be denser. You need the one repair note that stops that shortcut from spreading.",
                    prompt: "Choose the repair note you send.",
                    options: [
                      {
                        value: "density_needs_mass_and_volume",
                        label: "Density compares mass with volume, so an object can be heavy but not very dense if it also takes up a lot of space.",
                        feedback:
                          "Exactly. Density is about mass for the size, not mass alone.",
                        isCorrect: true,
                      },
                      {
                        value: "heavy_objects_always_dense",
                        label: "Heavier objects are always denser because they contain more matter, and more matter always means tighter packing.",
                        feedback:
                          "More matter helps only if you also know how much space it occupies. Density can only be judged with both mass and volume.",
                      },
                      {
                        value: "small_objects_always_dense",
                        label: "Smaller objects are always denser because density is really just about fitting into less space.",
                        feedback:
                          "Small size alone is not enough either. A small object can still have low density if it has very little mass in that small volume.",
                      },
                    ],
                    successLabel: "Repair sent. The shortcut between heavy and dense is broken.",
                    retryLabel: "That would keep the mass-only shortcut alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l5-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line density idea",
                    scenario:
                      "Quest Control wants one sentence the whole crew can repeat before they compare blocks, calculate answers, or predict floating.",
                    prompt: "Choose the line you post.",
                    options: [
                      {
                        value: "mass_per_unit_volume",
                        label: "Density tells how much mass is packed into each unit of volume.",
                        feedback:
                          "Exactly. That line keeps mass and volume tied together in one usable idea.",
                        isCorrect: true,
                      },
                      {
                        value: "mass_only",
                        label: "Density tells how much matter an object has, so the densest object is just the one with the most mass.",
                        feedback:
                          "That drops the volume part of the idea. Density is not just a mass ranking.",
                      },
                      {
                        value: "volume_only",
                        label: "Density tells how much space an object occupies, so denser objects are simply the ones that are smaller.",
                        feedback:
                          "That drops the mass part of the idea. Density compares how much mass is packed into the space.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has a clear density anchor.",
                    retryLabel: "That line would split the density idea in half.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "mass, volume, and density") {
                  return {
                    id: "f1-l5-mass-volume-density",
                    badge: "Compare lab",
                    title: "Send the comparison verdict",
                    scenario:
                      "The compare lab is running two tests: same-volume blocks and same-mass samples. You need the one verdict note that works in both situations.",
                    prompt: "Choose the verdict note you send.",
                    options: [
                      {
                        value: "more_mass_same_volume_or_less_volume_same_mass",
                        label: "For the same volume, the heavier object is denser; for the same mass, the smaller-volume object is denser.",
                        feedback:
                          "Exactly. That note keeps the two standard density comparisons clean and separate.",
                        isCorrect: true,
                      },
                      {
                        value: "heavier_and_bigger",
                        label: "The heavier object is always denser, and the larger-volume object is always denser because it has more material in it.",
                        feedback:
                          "That mixes up the comparison rules. Larger volume can actually make density smaller if the mass does not rise with it.",
                      },
                      {
                        value: "same_mass_same_density",
                        label: "If the mass is the same, the density must also be the same because mass is the thing density is measuring.",
                        feedback:
                          "Equal mass does not force equal density. If one sample squeezes that mass into less space, it is denser.",
                      },
                    ],
                    successLabel: "Verdict sent. The compare lab can now read both density cases correctly.",
                    retryLabel: "That verdict would confuse the two main comparison cases.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "use the formula carefully") {
                  return {
                    id: "f1-l5-use-formula-carefully",
                    badge: "Formula desk",
                    title: "Approve the calculation line",
                    scenario:
                      "A trainee is about to calculate density, but the notebook has one risky line that would spoil the answer before the division even starts.",
                    prompt: "Choose the calculation line you approve.",
                    options: [
                      {
                        value: "density_mass_over_volume",
                        label: "Write density = mass / volume, convert any mixed units first, then divide and keep the compound density unit with the answer.",
                        feedback:
                          "Exactly. That keeps both the calculation and the reporting honest.",
                        isCorrect: true,
                      },
                      {
                        value: "density_volume_over_mass",
                        label: "Write density = volume / mass, because you are checking how much space each gram occupies.",
                        feedback:
                          "That reverses the relationship. Density compares mass packed into volume, so the formula is mass divided by volume.",
                      },
                      {
                        value: "ignore_unit_mismatch",
                        label: "Substitute the numbers as they appear first, because unit conversions can be cleaned up after the density has been calculated.",
                        feedback:
                          "Mixed units can distort the value itself. The units need to be made consistent before you calculate.",
                      },
                    ],
                    successLabel: "Calculation line approved. The notebook now protects both the number and its unit.",
                    retryLabel: "That line would send the trainee into a unit or formula mistake straight away.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l5-analogy",
                    badge: "Packing crate",
                    title: "Choose the density analogy",
                    scenario:
                      "The team wants one everyday comparison that helps beginners feel density without drifting into a fluffy shortcut.",
                    prompt: "Choose the analogy you send.",
                    options: [
                      {
                        value: "same_size_boxes_more_books",
                        label: "Imagine two boxes of the same size. The box packed with more books is like the denser material because more mass is packed into the same space.",
                        feedback:
                          "Exactly. That analogy keeps the focus on packing more matter into equal space.",
                        isCorrect: true,
                      },
                      {
                        value: "bigger_box_means_denser",
                        label: "Imagine the bigger box is always denser because it holds more things, even if the packing is loose.",
                        feedback:
                          "That would confuse capacity with density. The density idea is about how tightly mass is packed, not just how big the box is.",
                      },
                      {
                        value: "heaviest_box_only",
                        label: "Imagine whichever box feels heavier is automatically denser, so there is no need to think about the box size at all.",
                        feedback:
                          "That drops the size comparison. The analogy works only when you keep the shared box size visible.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the density idea instead of flattening it.",
                    retryLabel: "That analogy would push students back into a mass-only shortcut.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L4") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l4-table-${activeTableIndex}`,
                  badge: "Digits desk",
                  title: "Mark which digits really count",
                  scenario:
                    "A lab partner is about to publish a counting rule for significant figures, but one line would make the whole board unreliable. You need the version that keeps the counting honest.",
                  prompt: "Choose the counting rule you send.",
                  options: [
                    {
                      value: "leading_zeros_place_only",
                      label: "Leading zeros only place the decimal point; they do not add significant figures, but trailing zeros after a decimal can show real precision.",
                      feedback:
                        "Exactly. That rule keeps placeholder zeros separate from digits that carry measured precision.",
                      isCorrect: true,
                    },
                    {
                      value: "all_zeros_count",
                      label: "Every zero counts as significant because it is still a written digit in the number.",
                      feedback:
                        "That would overcount numbers like 0.0045. Some zeros only position the decimal point and do not show measured precision.",
                    },
                    {
                      value: "decimal_zeros_never_count",
                      label: "Zeros after a decimal never count, because decimals are only there to make the number easier to read.",
                      feedback:
                        "That throws away real precision. In a value like 2.300, the trailing zeros after the decimal can show measured detail.",
                    },
                  ],
                  successLabel: "Digits desk secured. The count now reflects real precision.",
                  retryLabel: "That rule would make the crew count placeholder digits as if they were measured ones.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 1) {
                return {
                  id: `f1-l4-table-${activeTableIndex}`,
                  badge: "Rounding tower",
                  title: "Approve the rounding call",
                  scenario:
                    "The rounding tower is ready to issue one instruction to the whole team. It has to stop people from guessing based on the last kept digit alone.",
                  prompt: "Choose the rounding instruction you broadcast.",
                  options: [
                    {
                      value: "look_at_next_digit",
                      label: "Keep the digits you want, then check the next digit only: 0 to 4 means keep it, 5 to 9 means round up.",
                      feedback:
                        "Exactly. The next digit is the control point for the rounding decision.",
                      isCorrect: true,
                    },
                    {
                      value: "round_from_last_digit",
                      label: "Decide whether to round by looking only at the last digit you plan to keep.",
                      feedback:
                        "That misses the deciding digit. You need the next digit after the last kept one before you round.",
                    },
                    {
                      value: "decimal_places_first",
                      label: "Use the decimal point position first, because significant-figure rounding and decimal-place rounding are basically the same move.",
                      feedback:
                        "The rules overlap sometimes, but they are not the same. Significant-figure rounding still depends on which digits actually count.",
                    },
                  ],
                  successLabel: "Rounding tower aligned. The crew now knows exactly where to look.",
                  retryLabel: "That instruction would make the tower round by habit instead of by rule.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 2) {
                return {
                  id: `f1-l4-table-${activeTableIndex}`,
                  badge: "Notebook check",
                  title: "Choose the reporting rule",
                  scenario:
                    "A trainee keeps using one reporting rule for every calculation. You need the notebook line that separates addition or subtraction from multiplication or division.",
                  prompt: "Choose the notebook line you send.",
                  options: [
                    {
                      value: "operation_sets_rule",
                      label: "Use least decimal places for addition or subtraction, but least significant figures for multiplication or division.",
                      feedback:
                        "Exactly. The operation decides which precision rule controls the final answer.",
                      isCorrect: true,
                    },
                    {
                      value: "always_least_sig_figs",
                      label: "Always keep the least significant figures, because that rule is safest for every calculation.",
                      feedback:
                        "That would misreport addition and subtraction. Those answers are controlled by decimal places, not total significant figures.",
                    },
                    {
                      value: "calculator_digits_rule",
                      label: "Follow however many digits the calculator shows, then trim only if the result looks awkward.",
                      feedback:
                        "The calculator does not decide the reporting rule. The measurements and the operation do.",
                    },
                  ],
                  successLabel: "Notebook rule posted. The crew can now report each calculation honestly.",
                  retryLabel: "That line would mix up two different reporting rules.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l4-last-kept-digit",
                  badge: "Precision screen",
                  title: "Freeze the last-kept-digit moment",
                  scenario:
                    "The crew is watching the significant-figures visual. You can pin one coaching note to the display before the demonstration continues.",
                  prompt: "Pin the note that keeps the rounding step clean.",
                  options: [
                    {
                      value: "next_digit_controls_rounding",
                      label: "Look at the next digit after the last one you want to keep. That one decides whether the kept digit stays or rounds up.",
                      feedback:
                        "Exactly. That keeps the crew looking at the right place in the number.",
                      isCorrect: true,
                    },
                    {
                      value: "keep_all_decimal_digits",
                      label: "If the number has a decimal point, keep all the digits after it because they are all automatically significant.",
                      feedback:
                        "A decimal point does not make every digit significant. You still have to decide which digits count and then round from the next one.",
                    },
                    {
                      value: "first_non_zero_sets_answer",
                      label: "Once you find the first non-zero digit, the rest of the number can be copied straight across without any extra check.",
                      feedback:
                        "Finding the first significant digit only starts the count. The next digit after the last kept one still controls the rounding.",
                    },
                  ],
                  successLabel: "Pinned. The display now shows where the rounding decision really happens.",
                  retryLabel: "That note would send the crew to the wrong digit.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l4-calculator-notebook",
                  badge: "Lab notebook",
                  title: "Stop the calculator copy habit",
                  scenario:
                    "A trainee wants to copy the calculator screen into the lab notebook exactly as it appears. You need the one correction that protects the final answer.",
                  prompt: "Choose the correction you send.",
                  options: [
                    {
                      value: "screen_is_not_final_report",
                      label: "Do the calculation first, then apply the correct reporting rule before writing the final answer in the notebook.",
                      feedback:
                        "Exactly. The calculator gives the raw result, but the notebook must reflect justified precision.",
                      isCorrect: true,
                    },
                    {
                      value: "copy_if_precise",
                      label: "Copy every calculator digit if the question looks precise enough, because the machine is more exact than the student.",
                      feedback:
                        "The screen can show more digits than the measurements justify. Precision still has to be limited by the reporting rule.",
                    },
                    {
                      value: "round_only_if_asked",
                      label: "Only round if the question explicitly says to; otherwise every displayed digit belongs in the final answer.",
                      feedback:
                        "Physics answers still need justified precision even when the question does not use the word round.",
                    },
                  ],
                  successLabel: "Notebook protected. The crew will not confuse calculator output with the final report.",
                  retryLabel: "That advice would let unsupported digits slip into the notebook.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l4-fix-ideas",
                    badge: "Repair desk",
                    title: "Correct the precision myth",
                    scenario:
                      "A trainee has written that more digits always make a physics answer better. You need one repair note before that idea gets copied into the whole pack.",
                    prompt: "Choose the repair you send.",
                    options: [
                      {
                        value: "justified_digits_only",
                        label: "A better answer uses only the digits the measurement or calculation rule can honestly justify.",
                        feedback:
                          "Exactly. More digits only help when the measurement really supports them.",
                        isCorrect: true,
                      },
                      {
                        value: "longer_means_better",
                        label: "A longer answer is always stronger because it gives the examiner more detail to work with.",
                        feedback:
                          "Extra digits can pretend to a precision the measurement never gave you. Longer is not automatically better.",
                      },
                      {
                        value: "units_make_digits_safe",
                        label: "As long as the unit is correct, extra digits cannot do any harm to the final answer.",
                        feedback:
                          "Correct units matter, but they do not rescue unsupported precision. The number itself still has to be reported honestly.",
                      },
                    ],
                    successLabel: "Repair sent. The idea of honest precision is back in place.",
                    retryLabel: "That would keep the bad precision habit alive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l4-core-idea",
                    badge: "Ops summary",
                    title: "Post the one-line precision rule",
                    scenario:
                      "Quest Control wants a single line the whole team can repeat before they write any final number.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "precision_must_be_justified",
                        label: "Use enough digits to show the justified precision, but not so many that the answer pretends to more certainty than it has.",
                        feedback:
                          "Exactly. That is the anchor idea for this lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "keep_every_digit_seen",
                        label: "Keep every digit you can see, then let the examiner decide which ones matter.",
                        feedback:
                          "That hands off a decision the student must make. The final answer should already reflect justified precision.",
                      },
                      {
                        value: "round_everything_aggressively",
                        label: "Round every final answer hard to keep it simple, even if the calculation supports more detail.",
                        feedback:
                          "Oversimplifying can lose justified information. The goal is not shorter answers; it is honest answers.",
                      },
                    ],
                    successLabel: "Rule posted. The room now has one clean precision standard.",
                    retryLabel: "That line would confuse honesty with convenience.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "which digits count") {
                  return {
                    id: "f1-l4-which-digits-count",
                    badge: "Count board",
                    title: "Mark the zeros correctly",
                    scenario:
                      "The count board is almost right, but one crew member still treats every zero the same. You need the note that fixes that mistake.",
                    prompt: "Choose the note you pin to the board.",
                    options: [
                      {
                        value: "zeros_have_different_jobs",
                        label: "Some zeros only place the decimal point, while others show measured precision, so you have to judge them by position.",
                        feedback:
                          "Exactly. Position decides whether a zero is a placeholder or part of the measured precision.",
                        isCorrect: true,
                      },
                      {
                        value: "zeros_never_count",
                        label: "Zeros are only placeholders, so they never count as significant figures in any position.",
                        feedback:
                          "That would wrongly remove zeros that do show precision, like trailing zeros after a decimal or zeros between non-zero digits.",
                      },
                      {
                        value: "zeros_always_count",
                        label: "If the number is written down, every zero counts because the instrument displayed it somehow.",
                        feedback:
                          "That would overcount leading zeros that only locate the decimal point.",
                      },
                    ],
                    successLabel: "Count board corrected. The crew can now judge zeros by what they do.",
                    retryLabel: "That note would keep the zero-counting rule blurred.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "rounding with purpose") {
                  return {
                    id: "f1-l4-rounding-with-purpose",
                    badge: "Round-off relay",
                    title: "Send the rounding move",
                    scenario:
                      "The team is about to round by instinct instead of by rule. You need one short instruction that makes the decision process reliable.",
                    prompt: "Choose the instruction you send.",
                    options: [
                      {
                        value: "keep_then_check_next",
                        label: "Keep the digits you want first, then look at the next digit and let that digit decide whether to round up.",
                        feedback:
                          "Exactly. That gives the team a repeatable rounding move instead of a guess.",
                        isCorrect: true,
                      },
                      {
                        value: "nearest_whole_first",
                        label: "Round to the nearest whole number first, then rebuild the significant figures afterward.",
                        feedback:
                          "That changes the number too early. The rounding move should happen at the place value you are actually targeting.",
                      },
                      {
                        value: "always_round_up_if_decimal",
                        label: "Any decimal digit means the answer should usually round up to look safer.",
                        feedback:
                          "Rounding is not about playing safe. It depends on the next digit after the last kept one.",
                      },
                    ],
                    successLabel: "Rounding move sent. The crew can now round with purpose instead of instinct.",
                    retryLabel: "That would turn a rule-governed step into guesswork.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "rules for calculations") {
                  return {
                    id: "f1-l4-rules-for-calculations",
                    badge: "Calculation dispatch",
                    title: "Call the right precision rule",
                    scenario:
                      "Two teams are solving the same worksheet, but one is using sig figs for every answer and the other is using decimal places for every answer. You need the line that stops both mistakes.",
                    prompt: "Choose the dispatch line.",
                    options: [
                      {
                        value: "operation_decides_precision",
                        label: "Ask what operation was used first: addition or subtraction uses decimal places, while multiplication or division uses significant figures.",
                        feedback:
                          "Exactly. The operation tells you which reporting rule belongs to the final answer.",
                        isCorrect: true,
                      },
                      {
                        value: "same_rule_everywhere",
                        label: "Pick one precision rule at the start of the lesson and keep using it so the answers stay consistent.",
                        feedback:
                          "Consistency matters, but the operation still changes the rule. One rule cannot handle every calculation honestly.",
                      },
                      {
                        value: "look_only_at_biggest_number",
                        label: "Let the largest number in the question decide the precision rule, because it dominates the calculation.",
                        feedback:
                          "The size of the number is not the deciding feature. The operation and the least precise measurement are what matter.",
                      },
                    ],
                    successLabel: "Dispatch sent. Each calculation can now follow the right reporting rule.",
                    retryLabel: "That would leave one of the teams using the wrong rule again.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "calculator answers need a final check") {
                  return {
                    id: "f1-l4-calculator-final-check",
                    badge: "Final check",
                    title: "Approve the notebook entry",
                    scenario:
                      "The calculator has finished, and the trainee is about to ink the answer straight into the notebook. You need the one approval rule that keeps the final line honest.",
                    prompt: "Choose the approval rule.",
                    options: [
                      {
                        value: "apply_rule_after_calculation",
                        label: "Write the raw result only in rough work, then apply the correct rounding or reporting rule before the final notebook answer.",
                        feedback:
                          "Exactly. The final line belongs to the notebook only after the precision rule has been checked.",
                        isCorrect: true,
                      },
                      {
                        value: "screen_is_final",
                        label: "If the calculator produced the number, the notebook should copy it exactly because the machine has already done the hard work.",
                        feedback:
                          "The machine gives a raw result, not the final reported answer. The precision rule still has to be applied.",
                      },
                      {
                        value: "only_units_need_checking",
                        label: "Once the unit is right, the digits can stay exactly as shown because the final check is only about units.",
                        feedback:
                          "Units matter, but the digit count matters too. The final check is about honest reporting, not just the unit label.",
                      },
                    ],
                    successLabel: "Notebook entry approved. The final answer now matches the physics, not just the calculator screen.",
                    retryLabel: "That approval would let unsupported digits slip through the final check.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l4-analogy",
                    badge: "Analogy relay",
                    title: "Pick the precision analogy",
                    scenario:
                      "The team wants one everyday comparison that helps beginners understand why extra digits can be dishonest without making the idea fluffy.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "photo_quality",
                        label: "A measurement is like a photo saved at a certain quality: you cannot honestly add sharper detail after the picture has been taken.",
                        feedback:
                          "Exactly. That analogy keeps the idea of limited captured detail without drifting away from the precision lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "guess_more_for_better",
                        label: "A measurement is like filling in the missing parts of a sketch: the more detail you imagine, the stronger the final image becomes.",
                        feedback:
                          "That pushes learners toward invented detail. The whole lesson is about not pretending to more precision than was captured.",
                      },
                      {
                        value: "calculator_is_camera",
                        label: "A calculator is like a camera that always records the exact scene perfectly, so the notebook should trust it completely.",
                        feedback:
                          "That gives too much authority to the calculator. The measurement quality still limits what the final report can claim.",
                      },
                    ],
                    successLabel: "Analogy chosen. It supports the lesson instead of weakening the honesty rule.",
                    retryLabel: "That analogy would encourage the wrong instinct about extra digits.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L3") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l3-table-${activeTableIndex}`,
                  badge: "Instrument bay",
                  title: "Match the job to the tool",
                  scenario:
                    "The lab crew is about to measure a desk, a wire thickness, and a short time interval. You need the assignment note that stops them using one tool for every job.",
                  prompt: "Choose the setup note you send.",
                  options: [
                    {
                      value: "match_tool_to_scale",
                      label: "Match each job to the tool that suits its scale and the detail you need before taking the reading.",
                      feedback:
                        "Exactly. Tool choice should follow the size of the object and the resolution the job demands.",
                      isCorrect: true,
                    },
                    {
                      value: "same_tool_everywhere",
                      label: "Use the metre rule first for every job, then convert carefully afterward if the numbers look awkward.",
                      feedback:
                        "A later conversion cannot rescue a poor tool choice. The instrument has to suit the measurement from the start.",
                    },
                    {
                      value: "smallest_tool_always",
                      label: "Always use the finest tool available because more decimal places automatically mean the reading is better.",
                      feedback:
                        "Finer tools help only when they match the job. A tool must suit both the object and the way the reading is taken.",
                    },
                  ],
                  successLabel: "Instrument bay aligned. Each job now has a sensible setup.",
                  retryLabel: "That note would weaken at least one measurement before it begins.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 1) {
                return {
                  id: `f1-l3-table-${activeTableIndex}`,
                  badge: "Readout desk",
                  title: "Protect the honest digits",
                  scenario:
                    "A trainee is writing down more digits than the scale can really support. You need the guidance line that protects the report.",
                  prompt: "Choose the guidance line.",
                  options: [
                    {
                      value: "report_supported_precision",
                      label: "Write only the detail the scale can justify, then attach an uncertainty that matches the instrument.",
                      feedback:
                        "Exactly. The report has to match what the instrument can honestly support.",
                      isCorrect: true,
                    },
                    {
                      value: "copy_all_digits",
                      label: "Copy every digit you can imagine from the scale because more digits always make the result stronger.",
                      feedback:
                        "Extra digits can pretend to a precision the instrument never gave you. Only justified detail belongs in the report.",
                    },
                    {
                      value: "uncertainty_optional",
                      label: "If the scale looks clear enough, leave uncertainty off and just trust the number itself.",
                      feedback:
                        "Uncertainty is part of honest reporting. It tells the reader how much confidence the instrument really supports.",
                    },
                  ],
                  successLabel: "Readout protected. The report now matches the instrument honestly.",
                  retryLabel: "That would make the reading look more certain than it really is.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 2) {
                return {
                  id: `f1-l3-table-${activeTableIndex}`,
                  badge: "Quality board",
                  title: "Call the error type correctly",
                  scenario:
                    "The crew has three strange result patterns on the quality board. You need the rule that stops them using one error label for all of them.",
                  prompt: "Choose the classification note.",
                  options: [
                    {
                      value: "different_patterns_need_different_responses",
                      label: "Random scatter, systematic shift, and one-off reading mistakes look different and need different fixes.",
                      feedback:
                        "Exactly. Error patterns only become useful when they are classified by how they behave and how they are reduced.",
                      isCorrect: true,
                    },
                    {
                      value: "all_error_same",
                      label: "All error is basically the same, so the best fix is always to repeat the reading a few times.",
                      feedback:
                        "Repeats help with random error, but they do not automatically remove a systematic shift or a bad instrument setup.",
                    },
                    {
                      value: "systematic_is_random",
                      label: "If the readings keep landing high in the same way, that just means the random error is unusually strong.",
                      feedback:
                        "A fixed shift in one direction is the sign of systematic error, not stronger random scatter.",
                    },
                  ],
                  successLabel: "Quality board sorted. The crew can now choose the right fix for each pattern.",
                  retryLabel: "That note would blur error patterns that need different responses.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l3-resolution-ladder",
                  badge: "Resolution ladder",
                  title: "Post the ladder rule",
                  scenario:
                    "The crew is comparing ruler, caliper, and micrometer views of the same object. You get one note before they start chasing extra digits.",
                  prompt: "Choose the note to post.",
                  options: [
                    {
                      value: "finer_scale_more_justified_detail",
                      label: "A finer scale can justify smaller differences and usually supports a smaller uncertainty for the same object.",
                      feedback:
                        "Exactly. The object stays the same, but the instrument resolution changes what you can honestly claim.",
                      isCorrect: true,
                    },
                    {
                      value: "object_changes_precision",
                      label: "The object becomes more precise when you swap to a finer instrument, so the reading itself changes quality automatically.",
                      feedback:
                        "The object does not become more precise. The instrument simply lets you resolve and report the same object more carefully.",
                    },
                    {
                      value: "same_digits_every_tool",
                      label: "If the object is the same, every tool should produce the same number of useful digits once you look hard enough.",
                      feedback:
                        "Different instruments support different justified detail. The digits must match the scale, not your effort level.",
                    },
                  ],
                  successLabel: "Rule posted. The ladder now tells the right measurement story.",
                  retryLabel: "That note would turn resolution into guesswork.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l3-instrument-tour",
                  badge: "Instrument tour",
                  title: "Choose the tour instruction",
                  scenario:
                    "A trainee is jumping between controls on the instrument tour and losing track of what each tool actually improves. You get one coaching line.",
                  prompt: "Choose the instruction you send.",
                  options: [
                    {
                      value: "change_one_thing",
                      label: "Switch one instrument at a time and compare what happens to the smallest visible step and the uncertainty you can justify.",
                      feedback:
                        "Exactly. One controlled change at a time is what makes the instrument comparison meaningful.",
                      isCorrect: true,
                    },
                    {
                      value: "change_everything",
                      label: "Change several controls quickly so you can reach the most detailed reading as fast as possible.",
                      feedback:
                        "That makes it hard to tell what actually caused the better or worse reading. A clean comparison needs one change at a time.",
                    },
                    {
                      value: "ignore_uncertainty",
                      label: "Focus only on the last displayed number because uncertainty is a later reporting issue, not part of the tour.",
                      feedback:
                        "The tour is exactly where uncertainty becomes visible. It should travel with the reading from the start.",
                    },
                  ],
                  successLabel: "Coaching sent. The tour now behaves like an investigation instead of a scramble.",
                  retryLabel: "That would make the tour look busy without teaching what changed.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 2) {
                return {
                  id: "f1-l3-error-compare",
                  badge: "Pattern check",
                  title: "Separate the two error stories",
                  scenario:
                    "The crew is looking at the random-error and zero-error visual. You need one sentence that stops them treating every bad result as the same kind of problem.",
                  prompt: "Choose the sentence to send.",
                  options: [
                    {
                      value: "scatter_vs_shift",
                      label: "Random error makes readings scatter around a best value, but zero error shifts every reading by the same amount.",
                      feedback:
                        "Exactly. That is the clean split the crew needs before they decide how to improve the method.",
                      isCorrect: true,
                    },
                    {
                      value: "both_random",
                      label: "Both pictures show random error; one just happens to look tidier than the other.",
                      feedback:
                        "A fixed offset is not random. It is the clue that the instrument or setup is shifting every reading the same way.",
                    },
                    {
                      value: "average_fixes_all",
                      label: "Averaging repeated readings will remove both patterns as long as enough trials are taken.",
                      feedback:
                        "Averaging helps reduce random scatter, but it does not automatically remove a systematic shift like zero error.",
                    },
                  ],
                  successLabel: "Pattern check sent. The two error stories are now clearly separated.",
                  retryLabel: "That would flatten two different problems into one blurry idea.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l3-fix-ideas",
                    badge: "Repair desk",
                    title: "Fix the shaky measurement note",
                    scenario:
                      "A trainee has written that any measured number is trustworthy as long as it looks neat. You need one correction before that note gets copied.",
                    prompt: "Choose the correction you send.",
                    options: [
                      {
                        value: "tool_and_method_set_trust",
                        label: "A reading is only as trustworthy as the tool and method behind it, not just the neatness of the number.",
                        feedback:
                          "Exactly. Trust comes from the instrument, the method, and the uncertainty the reading can support.",
                        isCorrect: true,
                      },
                      {
                        value: "neat_number_enough",
                        label: "If the number is written clearly with a unit, that is enough to treat the measurement as trustworthy.",
                        feedback:
                          "Clear writing helps, but it does not prove the instrument or method justified the reading.",
                      },
                      {
                        value: "decimal_places_mean_trust",
                        label: "The reading with the most decimal places is always the most trustworthy one.",
                        feedback:
                          "Extra decimal places can be misleading if the instrument did not support them. Trust depends on justified detail, not just longer numbers.",
                      },
                    ],
                    successLabel: "Repair sent. The measurement note now has a solid foundation.",
                    retryLabel: "That would leave the trust question dangerously vague.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l3-core-idea",
                    badge: "Ops summary",
                    title: "Post the trust rule",
                    scenario:
                      "Quest Control wants one short rule the whole team can repeat before they touch any measurement question.",
                    prompt: "Choose the rule to post.",
                    options: [
                      {
                        value: "instrument_sets_detail",
                        label: "The instrument sets the smallest trustworthy detail you can claim, so the report must match the tool.",
                        feedback:
                          "Exactly. That is the anchor idea for the lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "reader_sets_detail",
                        label: "The careful reader decides how many digits are trustworthy once the scale is visible.",
                        feedback:
                          "Care helps, but the instrument still sets the limit. You cannot invent detail the scale does not support.",
                      },
                      {
                        value: "average_sets_detail",
                        label: "Repeating a reading enough times automatically makes any extra digits trustworthy.",
                        feedback:
                          "Repeats help with scatter, but they do not overrule the instrument’s resolution or erase systematic limits.",
                      },
                    ],
                    successLabel: "Rule posted. The whole room now has the same anchor idea.",
                    retryLabel: "That rule would give the team too much confidence in unsupported digits.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words") {
                  return {
                    id: "f1-l3-technical-words",
                    badge: "Term desk",
                    title: "Clean up the measurement language",
                    scenario:
                      "The examples are good, but the crew keeps mixing up scale step, resolution, and uncertainty. You need the vocabulary card that separates them.",
                    prompt: "Choose the card to post.",
                    options: [
                      {
                        value: "scale_resolution_uncertainty",
                        label: "The smallest division is what you can see on the scale, resolution is the smallest meaningful change shown, and uncertainty is the range you can honestly justify around the reading.",
                        feedback:
                          "Exactly. That gives the crew three different jobs instead of one blurry measurement word.",
                        isCorrect: true,
                      },
                      {
                        value: "all_same",
                        label: "Smallest division, resolution, and uncertainty all mean the same thing in practice, so one definition is enough.",
                        feedback:
                          "They are connected, but they are not identical. Each one answers a slightly different question about the reading.",
                      },
                      {
                        value: "resolution_is_digits",
                        label: "Resolution is simply the number of digits the instrument display happens to show.",
                        feedback:
                          "Displayed digits can mislead. Resolution is about the smallest meaningful change the instrument can actually show.",
                      },
                    ],
                    successLabel: "Vocabulary sorted. The crew can now talk about readings precisely.",
                    retryLabel: "That wording would keep the measurement language tangled.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words continued") {
                  return {
                    id: "f1-l3-technical-words-continued",
                    badge: "Term relay",
                    title: "Finish the error glossary",
                    scenario:
                      "A second glossary card is about to go up. It needs to separate random error from systematic error without making them sound interchangeable.",
                    prompt: "Choose the follow-up line.",
                    options: [
                      {
                        value: "random_vs_systematic",
                        label: "Random error makes readings spread out, while systematic error pushes them in the same wrong direction each time.",
                        feedback:
                          "Exactly. That is the split the crew needs before they choose how to respond.",
                        isCorrect: true,
                      },
                      {
                        value: "random_is_small",
                        label: "Random error is just the smaller version of systematic error, so the same fix works for both.",
                        feedback:
                          "They are different patterns, not small and large versions of the same thing. The fixes are different too.",
                      },
                      {
                        value: "systematic_is_mistake",
                        label: "Systematic error just means one careless misread that should be ignored if the other readings look fine.",
                        feedback:
                          "A one-off careless read is different. Systematic error affects the whole set in the same direction.",
                      },
                    ],
                    successLabel: "Glossary handoff complete.",
                    retryLabel: "That would blur two error patterns the crew needs to keep apart.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "resolution and uncertainty") {
                  return {
                    id: "f1-l3-resolution-uncertainty",
                    badge: "Readout desk",
                    title: "Choose the honest report",
                    scenario:
                      "The crew has a reading from a ruler and wants to report it with extra confidence. You need the note that keeps the report honest.",
                    prompt: "Choose the note to post.",
                    options: [
                      {
                        value: "match_uncertainty_to_scale",
                        label: "Tie the uncertainty to the instrument scale, because the report should never claim more detail than the tool supports.",
                        feedback:
                          "Exactly. The uncertainty is what stops the report from pretending to a precision it never earned.",
                        isCorrect: true,
                      },
                      {
                        value: "best_digit_only",
                        label: "Keep the neatest final digit and leave uncertainty out so the result looks cleaner.",
                        feedback:
                          "Clean formatting is not the goal. Honest reporting means showing the limit of what the tool could support.",
                      },
                      {
                        value: "more_digits_is_safer",
                        label: "Add one extra digit if you feel confident, because a more detailed answer gives the reader more information.",
                        feedback:
                          "Unsupported detail gives the reader false confidence. Extra digits are only useful when the instrument justified them.",
                      },
                    ],
                    successLabel: "Report protected. The reading now looks honest instead of overclaimed.",
                    retryLabel: "That would make the report look stronger than the instrument allowed.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "reading a scale honestly") {
                  return {
                    id: "f1-l3-reading-scale",
                    badge: "Scale check",
                    title: "Coach the reading method",
                    scenario:
                      "A trainee is trying to impress the crew by inventing digits between marks. You get one instruction before they write the result down.",
                    prompt: "Choose the instruction you send.",
                    options: [
                      {
                        value: "read_then_estimate_carefully",
                        label: "Read to the smallest clear division, estimate carefully only where the tool allows it, and never invent digits the scale cannot support.",
                        feedback:
                          "Exactly. That is the habit that keeps the reading matched to the instrument.",
                        isCorrect: true,
                      },
                      {
                        value: "fill_gaps_with_digits",
                        label: "If there is any empty space between marks, add enough extra digits to make the answer look smooth.",
                        feedback:
                          "That turns guessing into fake precision. A reading should reflect the scale, not the wish for a cleaner number.",
                      },
                      {
                        value: "always_halfway",
                        label: "Whenever you are unsure, write a halfway digit automatically because that is the fairest compromise.",
                        feedback:
                          "A default halfway guess is not a method. The estimate must come from what the scale actually lets you see.",
                      },
                    ],
                    successLabel: "Method sent. The trainee now has a trustworthy reading routine.",
                    retryLabel: "That instruction would encourage invented precision.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "different types of error") {
                  return {
                    id: "f1-l3-different-errors",
                    badge: "Pattern board",
                    title: "Choose the right response",
                    scenario:
                      "The crew has identified two different error patterns and wants one response that fixes both. You need the note that keeps the strategy honest.",
                    prompt: "Choose the response note.",
                    options: [
                      {
                        value: "match_fix_to_pattern",
                        label: "Use repeats and averaging for random scatter, but check zero error and calibration for a fixed shift.",
                        feedback:
                          "Exactly. The response has to match the error pattern instead of treating every problem the same way.",
                        isCorrect: true,
                      },
                      {
                        value: "average_everything",
                        label: "Average every set of readings and the error problem is solved, no matter what pattern caused it.",
                        feedback:
                          "Averaging helps with scatter, but it does not automatically remove a systematic shift from every reading.",
                      },
                      {
                        value: "recalibrate_everything",
                        label: "Recalibrate first for every problem, because all error patterns come from the instrument eventually.",
                        feedback:
                          "Calibration matters for systematic issues, but random scatter often needs repeated readings and averaging instead.",
                      },
                    ],
                    successLabel: "Response chosen. The crew can now treat each pattern properly.",
                    retryLabel: "That would apply the wrong fix to at least one kind of error.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to reduce error") {
                  return {
                    id: "f1-l3-reduce-error",
                    badge: "Method board",
                    title: "Post the improvement plan",
                    scenario:
                      "Quest Control wants one improvement plan the crew can follow before the worked example. It has to reduce error without pretending perfect measurement is possible.",
                    prompt: "Choose the plan to post.",
                    options: [
                      {
                        value: "repeat_check_zero_choose_tool",
                        label: "Repeat readings, average when scatter matters, check for zero error, and choose a tool that suits the scale of the job.",
                        feedback:
                          "Exactly. That is a realistic plan for reducing error while still reporting honest uncertainty.",
                        isCorrect: true,
                      },
                      {
                        value: "repeat_until_exact",
                        label: "Repeat the reading until the numbers match exactly, then stop because the uncertainty has effectively disappeared.",
                        feedback:
                          "Repeats improve confidence, but they do not erase uncertainty completely. Honest reporting still matters.",
                      },
                      {
                        value: "ignore_small_errors",
                        label: "Ignore small offsets once the main reading looks reasonable, because only large mistakes affect physics conclusions.",
                        feedback:
                          "Small shifts can still matter, especially if they affect every reading in the same direction. They should be checked, not ignored.",
                      },
                    ],
                    successLabel: "Plan posted. The crew now has a realistic route to stronger measurements.",
                    retryLabel: "That plan would promise more certainty than the method can deliver.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l3-analogy",
                    badge: "Story relay",
                    title: "Pick the analogy that keeps measurement honest",
                    scenario:
                      "The team wants an analogy that helps beginners feel the difference between blurry and trustworthy measurement without weakening the science.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "blurry_photo",
                        label: "Treat a low-resolution reading like a blurry photo: you can see the big shape, but not the tiny detail reliably.",
                        feedback:
                          "Exactly. That captures why low resolution limits what details you can honestly claim.",
                        isCorrect: true,
                      },
                      {
                        value: "zoom_makes_truth",
                        label: "Treat a finer tool like digital zoom, because the main job is to make the number look bigger and more detailed.",
                        feedback:
                          "That risks the wrong idea. A better tool reveals more genuine detail; it is not just enlarging the same weak reading.",
                      },
                      {
                        value: "photo_never_wrong",
                        label: "Treat any measured reading like a clear photo once it has been written down, because the number itself locks the truth.",
                        feedback:
                          "A written number can still overclaim if the instrument and method did not support it. The tool still matters.",
                      },
                    ],
                    successLabel: "Good analogy. It supports the trust idea instead of distorting it.",
                    retryLabel: "That analogy would weaken the lesson’s honesty about measurement limits.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L2") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l2-table-${activeTableIndex}`,
                  badge: "Classification desk",
                  title: "Stabilize the scalar board",
                  scenario:
                    "The crew is filling the scalar board, but they keep slipping direction words into the list. You need the note that keeps the board honest.",
                  prompt: "Choose the note you pin to the board.",
                  options: [
                    {
                      value: "how_much_only",
                      label: "Put a quantity on the scalar board only if it answers how much without needing a direction.",
                      feedback:
                        "Exactly. That is the clean test for a scalar quantity.",
                      isCorrect: true,
                    },
                    {
                      value: "motion_means_vector",
                      label: "If a quantity is about motion, it must always go on the vector board.",
                      feedback:
                        "Not always. Speed is about motion but does not need a direction, so it is scalar.",
                    },
                    {
                      value: "big_numbers_only",
                      label: "Put quantities with larger values on the scalar board because vectors are only for small changes.",
                      feedback:
                        "Size has nothing to do with the scalar-vector test. The key question is whether direction is required.",
                    },
                  ],
                  successLabel: "Scalar board secured. The crew can sort the rest cleanly.",
                  retryLabel: "That note would let the sorting rule drift.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isTableStep && activeTableIndex === 1) {
                return {
                  id: `f1-l2-table-${activeTableIndex}`,
                  badge: "Vector board",
                  title: "Mark what makes a vector",
                  scenario:
                    "The vector board is up, but one crew member still thinks any changing quantity counts as a vector. You need the rule that fixes the board.",
                  prompt: "Choose the rule to post.",
                  options: [
                    {
                      value: "needs_direction",
                      label: "A quantity belongs on the vector board only if its description needs both size and direction.",
                      feedback:
                        "Exactly. Magnitude plus direction is what makes the quantity a vector.",
                      isCorrect: true,
                    },
                    {
                      value: "changes_fast",
                      label: "A quantity is a vector whenever it changes quickly enough to affect the motion story.",
                      feedback:
                        "Rate of change is not the test. Direction is the missing ingredient that turns a quantity into a vector.",
                    },
                    {
                      value: "arrow_picture_only",
                      label: "A quantity is only a vector if it is drawn as an arrow in the textbook diagram.",
                      feedback:
                        "Arrows help show vectors, but the real test is whether the physical quantity itself needs a direction.",
                    },
                  ],
                  successLabel: "Vector board corrected. The sorting rule is clear now.",
                  retryLabel: "That rule would misclassify the next few quantities.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l2-arrow-map",
                  badge: "Map room",
                  title: "Pin the arrow note",
                  scenario:
                    "The crew is looking at the arrow-on-a-map visual. You get one sentence to stop them treating the arrow like a plain number.",
                  prompt: "Choose the note to pin to the display.",
                  options: [
                    {
                      value: "magnitude_and_direction",
                      label: "The arrow shows both how much and which way, so it behaves like a vector.",
                      feedback:
                        "Exactly. The arrow keeps magnitude and direction together in one picture.",
                      isCorrect: true,
                    },
                    {
                      value: "length_only",
                      label: "Only the arrow length matters here; the direction is decorative.",
                      feedback:
                        "Direction is the key extra ingredient. Without it, the arrow would not be modelling a vector idea.",
                    },
                    {
                      value: "route_shape",
                      label: "The arrow mainly draws the route shape, so its direction does not change the quantity meaning.",
                      feedback:
                        "That misses the point of the diagram. The arrow is there to show a quantity that points somewhere.",
                    },
                  ],
                  successLabel: "Pinned. The map room can now read the arrow properly.",
                  retryLabel: "That note would flatten the vector idea into a plain amount.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l2-thermometer-reading",
                  badge: "Sensor check",
                  title: "Keep the reading scalar",
                  scenario:
                    "The crew is comparing the thermometer visual with the arrow visual. One trainee wants to add a direction to temperature just to stay consistent.",
                  prompt: "Choose the correction you send.",
                  options: [
                    {
                      value: "no_direction_needed",
                      label: "Temperature tells how much only, so it stays scalar because no direction is needed.",
                      feedback:
                        "Exactly. Temperature has magnitude, but it does not point anywhere.",
                      isCorrect: true,
                    },
                    {
                      value: "upward_hotter",
                      label: "Temperature becomes a vector if the reading is increasing upward on the thermometer scale.",
                      feedback:
                        "The display direction is not the same as physical direction. Temperature still does not need a direction in its description.",
                    },
                    {
                      value: "all_measurements_need_direction",
                      label: "Every measurement needs a direction eventually, so temperature is only temporarily scalar.",
                      feedback:
                        "That overreaches. Many quantities stay scalar because direction never becomes part of the quantity description.",
                    },
                  ],
                  successLabel: "Correction sent. The scalar example stays clean.",
                  retryLabel: "That would force direction into a quantity that does not need it.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l2-fix-ideas",
                    badge: "Repair desk",
                    title: "Stop the mixed-up motion note",
                    scenario:
                      "A trainee has written that distance and displacement mean the same thing as long as the journey looks simple. You need one repair note before the page is copied.",
                    prompt: "Choose the repair you send.",
                    options: [
                      {
                        value: "distance_vs_displacement",
                        label: "Distance asks how much path was travelled, but displacement asks for the start-to-finish change with direction.",
                        feedback:
                          "Exactly. That is the difference the trainee needs to keep the two ideas apart.",
                        isCorrect: true,
                      },
                      {
                        value: "same_if_straight",
                        label: "They are basically the same whenever the journey is straight enough to picture easily.",
                        feedback:
                          "A straight route can make the values match, but the questions are still different: path length versus directional change.",
                        isCorrect: false,
                      },
                      {
                        value: "distance_needs_direction",
                        label: "Distance becomes the vector version when you add a direction word to it.",
                        feedback:
                          "Adding a direction word does not change what distance asks. Displacement is the vector quantity, not distance with an extra label.",
                      },
                    ],
                    successLabel: "Repair sent. The motion note is back on track.",
                    retryLabel: "That would keep the two journey questions blurred together.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l2-core-idea",
                    badge: "Ops summary",
                    title: "Post the scalar-vector rule",
                    scenario:
                      "Quest Control wants one short line the team can repeat while sorting quantities.",
                    prompt: "Choose the line to post.",
                    options: [
                      {
                        value: "how_much_and_which_way",
                        label: "Scalars tell how much only; vectors tell how much and which way.",
                        feedback:
                          "Exactly. That is the core rule for the whole lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "vector_means_motion",
                        label: "Vectors are the quantities that involve motion, while scalars are the ones that stay still.",
                        feedback:
                          "Motion alone is not enough. Speed involves motion but is scalar because it does not need a direction.",
                      },
                      {
                        value: "bigger_is_vector",
                        label: "Vectors are the quantities that feel more important or larger in physics problems.",
                        feedback:
                          "Importance and size are not the test. The real test is whether direction is part of the quantity.",
                      },
                    ],
                    successLabel: "Rule posted. The whole room has the same anchor idea now.",
                    retryLabel: "That line would send the team toward the wrong sorting rule.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words") {
                  return {
                    id: "f1-l2-technical-words",
                    badge: "Term desk",
                    title: "Clean up the quantity language",
                    scenario:
                      "The examples are right, but the crew keeps swapping magnitude, direction, scalar, and vector as if they were interchangeable.",
                    prompt: "Choose the vocabulary card to post.",
                    options: [
                      {
                        value: "magnitude_direction",
                        label: "Magnitude tells the size of the quantity, while direction tells where it points when the quantity is a vector.",
                        feedback:
                          "Exactly. That keeps the language precise before the examples get more complicated.",
                        isCorrect: true,
                      },
                      {
                        value: "magnitude_is_unit",
                        label: "Magnitude is just the unit attached to the quantity, so direction is the only real extra part.",
                        feedback:
                          "Magnitude is the size or amount, not the unit. The unit tells scale; magnitude tells how much.",
                      },
                      {
                        value: "direction_for_all",
                        label: "Direction is present in every quantity, but some questions simply ignore it for convenience.",
                        feedback:
                          "That overstates it. Many quantities are genuinely scalar because direction is not part of their description at all.",
                      },
                    ],
                    successLabel: "Vocabulary cleaned up. The crew can speak clearly again.",
                    retryLabel: "That wording would keep the key terms tangled.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words continued") {
                  return {
                    id: "f1-l2-technical-words-continued",
                    badge: "Term relay",
                    title: "Finish the motion glossary",
                    scenario:
                      "A second glossary card is about to go up. It needs to separate the motion pairs without repeating the first card badly.",
                    prompt: "Choose the follow-up line.",
                    options: [
                      {
                        value: "speed_velocity_pair",
                        label: "Speed is how fast only, while velocity is speed with direction.",
                        feedback:
                          "Exactly. That carries the scalar-vector rule into one of the most important motion pairs.",
                        isCorrect: true,
                      },
                      {
                        value: "speed_same_as_velocity",
                        label: "Speed and velocity are the same unless the object changes direction suddenly.",
                        feedback:
                          "They are different questions even before any turn happens. Velocity always includes direction; speed does not.",
                      },
                      {
                        value: "velocity_bigger_speed",
                        label: "Velocity is just the larger or more advanced version of speed.",
                        feedback:
                          "Velocity is not a larger speed. It is a different quantity because direction changes the meaning.",
                      },
                    ],
                    successLabel: "Glossary handoff complete.",
                    retryLabel: "That line would keep the motion pair blurry.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "how to test any quantity") {
                  return {
                    id: "f1-l2-how-to-test",
                    badge: "Guidance channel",
                    title: "Coach the two-question test",
                    scenario:
                      "The trainee analyst wants to sort a quantity by instinct. You get one instruction before they answer.",
                    prompt: "Choose the instruction you send.",
                    options: [
                      {
                        value: "two_question_test",
                        label: "Ask how much first, then ask which way. If the second question matters, treat the quantity as a vector.",
                        feedback:
                          "Exactly. That gives the analyst a reliable test instead of a guess.",
                        isCorrect: true,
                      },
                      {
                        value: "use_context_only",
                        label: "Look at the context and trust your first impression, because most quantities sort themselves automatically.",
                        feedback:
                          "That invites avoidable mistakes. The two-question test is what makes the classification reliable.",
                      },
                      {
                        value: "motion_words_only",
                        label: "If the question mentions movement, classify it as a vector immediately and skip the rest.",
                        feedback:
                          "Movement words are not enough. Speed is still scalar, so the quantity must be tested, not assumed.",
                      },
                    ],
                    successLabel: "Good coaching. The analyst now has a real method.",
                    retryLabel: "That would send the analyst back into guesswork.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l2-analogy",
                    badge: "Story relay",
                    title: "Pick the analogy that keeps vectors clean",
                    scenario:
                      "The team wants an analogy that helps beginners feel the difference between scalar and vector without muddying the physics.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "steps_vs_arrow",
                        label: "Distance is like counting how many steps you took, while displacement is like drawing one arrow from where you started to where you ended.",
                        feedback:
                          "Exactly. That keeps the path-length idea separate from the directed change.",
                        isCorrect: true,
                      },
                      {
                        value: "both_are_steps",
                        label: "Distance and displacement are both just step counts, but one sounds more formal in exam questions.",
                        feedback:
                          "That removes the key difference. Displacement is not just a more formal distance; it includes direction.",
                      },
                      {
                        value: "arrow_for_everything",
                        label: "Every quantity is best imagined as an arrow, even when direction is not part of the definition.",
                        feedback:
                          "That overuses the arrow picture. It helps with vectors, but scalar quantities do not need direction.",
                      },
                    ],
                    successLabel: "Good analogy. It supports the lesson instead of blurring the two ideas.",
                    retryLabel: "That analogy would weaken the vector-scalar split.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "common patterns to remember") {
                  return {
                    id: "f1-l2-common-patterns",
                    badge: "Memory board",
                    title: "Send the classification shortcut",
                    scenario:
                      "The crew wants one quick memory aid before the worked example begins. It has to help without replacing the actual rule.",
                    prompt: "Choose the memory aid to send.",
                    options: [
                      {
                        value: "examples_follow_rule",
                        label: "Remember common examples like distance, speed, mass, and time as scalars, and displacement, velocity, force, and acceleration as vectors, but still test any new quantity with the rule.",
                        feedback:
                          "Exactly. The examples help memory, but the classification rule still stays in charge.",
                        isCorrect: true,
                      },
                      {
                        value: "memorize_only",
                        label: "Memorize the listed examples and skip the rule, because the exam will only use the familiar quantities anyway.",
                        feedback:
                          "That is too risky. Memory lists help, but the rule is what protects you when the quantity is new or phrased differently.",
                      },
                      {
                        value: "all_forces_only",
                        label: "Only force-type quantities really matter as vectors; the rest can be treated as scalar unless the diagram says otherwise.",
                        feedback:
                          "That would misclassify several important vectors like displacement and velocity. The examples need to stay broader than that.",
                      },
                    ],
                    successLabel: "Memory board sent. The crew has a shortcut that still respects the rule.",
                    retryLabel: "That shortcut would collapse the lesson into memorization alone.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "F1_L1") {
              if (isTableStep && activeTableIndex === 0) {
                return {
                  id: `f1-l1-table-${activeTableIndex}`,
                  badge: "Lab bench",
                  title: "Lock the measurement language first",
                  scenario:
                    "The reference board is live, but the crew keeps mixing up quantities, units, and sub-units. You need the setup note that keeps the board usable.",
                  prompt: "Choose the note you pin to the board.",
                  options: [
                    {
                      value: "match_quantity_unit",
                      label: "Match each quantity to its unit and common sub-units before you compare any numbers.",
                      feedback:
                        "Exactly. Once the quantity and unit are matched, the rest of the lesson has a clear measurement language to work with.",
                      isCorrect: true,
                    },
                    {
                      value: "units_are_quantities",
                      label: "Treat the unit itself as the quantity, because m, s, and kg already tell the whole story.",
                      feedback:
                        "The unit alone is not the quantity. Length, time, and mass are quantities; metre, second, and kilogram are the agreed units used to measure them.",
                    },
                    {
                      value: "skip_subunits",
                      label: "Ignore sub-units until later, because only the base unit matters in real measurements.",
                      feedback:
                        "Sub-units matter whenever the object is small. They keep the number readable without changing the physical quantity.",
                    },
                  ],
                  successLabel: "Board aligned. The lesson now starts with clean measurement language.",
                  retryLabel: "That would blur the language before the lesson even begins.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 0) {
                return {
                  id: "f1-l1-unit-ladder",
                  badge: "Scale ladder",
                  title: "Send the unit-swap rule",
                  scenario:
                    "The crew is staring at the unit ladder. You can post one rule before they start converting values blindly.",
                  prompt: "Choose the rule to post.",
                  options: [
                    {
                      value: "smaller_unit_more_numbers",
                      label: "When the unit gets smaller, the number usually gets larger, but the physical quantity stays the same.",
                      feedback:
                        "Exactly. Smaller units need more copies of themselves, so the written number grows while the actual length stays fixed.",
                      isCorrect: true,
                    },
                    {
                      value: "smaller_unit_smaller_number",
                      label: "When the unit gets smaller, the number should also get smaller because the object has not changed.",
                      feedback:
                        "The object does stay the same, but that is why the number usually grows in a smaller unit: it takes more small units to describe the same quantity.",
                    },
                    {
                      value: "prefix_changes_quantity",
                      label: "Changing the prefix changes the physical quantity itself, so each conversion describes a new measurement.",
                      feedback:
                        "The physical quantity stays fixed. Only the unit size and the written number change.",
                    },
                  ],
                  successLabel: "Rule sent. The crew can now climb the ladder safely.",
                  retryLabel: "That rule would make every later conversion shakier.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isMediaStep && activeMediaIndex === 1) {
                return {
                  id: "f1-l1-unit-meaning",
                  badge: "Report check",
                  title: "Attach the missing meaning",
                  scenario:
                    "A trainee has written the number 5 on the board and thinks the measurement is complete. You need the line that fixes the report.",
                  prompt: "Choose the correction you send.",
                  options: [
                    {
                      value: "number_needs_unit",
                      label: "The number is incomplete by itself; the unit tells what quantity and scale the 5 belongs to.",
                      feedback:
                        "Exactly. 5 m, 5 s, and 5 kg are very different statements because the unit carries the physical meaning.",
                      isCorrect: true,
                    },
                    {
                      value: "context_enough",
                      label: "If the context feels obvious, the unit can be left off because the number still says enough.",
                      feedback:
                        "That leaves the measurement unsafe. Physics needs the unit attached so the reader knows the quantity and scale.",
                    },
                    {
                      value: "unit_only_final",
                      label: "The unit only matters in the final line of a calculation, not while the lesson idea is being built.",
                      feedback:
                        "The unit matters from the start. It is part of the measurement, not decoration added at the end.",
                    },
                  ],
                  successLabel: "Correction sent. The report now says something real.",
                  retryLabel: "That would leave the number floating without meaning.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (isSectionStep && !activeSection?.worked_example) {
                if (activeSectionHeading === "fix these ideas") {
                  return {
                    id: "f1-l1-fix-ideas",
                    badge: "Repair desk",
                    title: "Stop the shaky lab note",
                    scenario:
                      "A learner has written a bare number in the lab book and moved on. You get one note to fix the mistake before the rest of the page is copied.",
                    prompt: "Choose the note you send back.",
                    options: [
                      {
                        value: "number_and_unit",
                        label: "A scientific measurement is incomplete until the number and the unit stay together.",
                        feedback:
                          "Exactly. Without the unit, the number does not tell the reader what quantity or scale is being reported.",
                        isCorrect: true,
                      },
                      {
                        value: "number_enough",
                        label: "A bare number is fine as long as the student remembers what it meant while answering.",
                        feedback:
                          "That does not protect the measurement. The unit has to travel with the number so another reader can interpret it correctly.",
                      },
                      {
                        value: "unit_later",
                        label: "Leave the unit until the worked example, because the early lesson is only about the number.",
                        feedback:
                          "The unit matters from the first line. It is part of the measurement itself, not something to add later.",
                      },
                    ],
                    successLabel: "Good repair. The lab note is safe again.",
                    retryLabel: "That would let the weak measurement habit survive.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "core idea") {
                  return {
                    id: "f1-l1-core-idea",
                    badge: "Ops summary",
                    title: "Post the measurement rule",
                    scenario:
                      "Quest Control wants one short rule the whole team can repeat while working with units and prefixes.",
                    prompt: "Choose the rule to post.",
                    options: [
                      {
                        value: "unit_changes_number_not_quantity",
                        label: "Changing the unit changes the written number, but not the physical quantity being measured.",
                        feedback:
                          "Exactly. That is the anchor idea for the whole lesson.",
                        isCorrect: true,
                      },
                      {
                        value: "bigger_number_bigger_quantity",
                        label: "A bigger number always means a bigger physical quantity, even if the unit changes.",
                        feedback:
                          "Unit choice can make the number bigger or smaller without changing the quantity itself.",
                      },
                      {
                        value: "unit_is_decoration",
                        label: "The unit is only there to make the answer look scientific after the main idea is already clear.",
                        feedback:
                          "The unit is part of the main idea. It tells the reader what quantity and scale the number belongs to.",
                      },
                    ],
                    successLabel: "Rule posted. The whole room now has the same anchor idea.",
                    retryLabel: "That would point the room toward the wrong rule.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words") {
                  return {
                    id: "f1-l1-technical-words",
                    badge: "Term desk",
                    title: "Sort the measurement vocabulary",
                    scenario:
                      "The crew has the right examples, but their words are drifting. You need the vocabulary card that keeps quantity and unit separate.",
                    prompt: "Choose the card to post.",
                    options: [
                      {
                        value: "quantity_vs_unit",
                        label: "A quantity names what is being measured, and a unit names the agreed size used to measure it.",
                        feedback:
                          "Exactly. That keeps the language clean before prefixes and conversions are added.",
                        isCorrect: true,
                      },
                      {
                        value: "same_thing",
                        label: "Quantity and unit mean the same thing as long as the example is simple enough.",
                        feedback:
                          "They do different jobs. Quantity tells what is being measured; unit tells the measurement scale.",
                      },
                      {
                        value: "prefix_is_quantity",
                        label: "A prefix is the quantity, because milli and kilo already say what is being measured.",
                        feedback:
                          "A prefix only changes the size of the unit. It does not name the physical quantity itself.",
                      },
                    ],
                    successLabel: "Vocabulary sorted. The crew can speak cleanly now.",
                    retryLabel: "That wording would muddle the basic terms again.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "technical words continued") {
                  return {
                    id: "f1-l1-technical-words-continued",
                    badge: "Term relay",
                    title: "Finish the prefix handoff",
                    scenario:
                      "A second glossary card is about to go up. It needs to explain what sub-units actually do without repeating the first card badly.",
                    prompt: "Choose the follow-up line.",
                    options: [
                      {
                        value: "subunits_for_scale",
                        label: "Sub-units keep the same quantity but use smaller measurement chunks, which makes small objects easier to report sensibly.",
                        feedback:
                          "Exactly. That extends the vocabulary into the real reason sub-units exist.",
                        isCorrect: true,
                      },
                      {
                        value: "subunits_change_object",
                        label: "Sub-units are for physically smaller objects, so changing the unit also changes the object being measured.",
                        feedback:
                          "The object stays the same. Only the unit size changes so the report matches the scale better.",
                      },
                      {
                        value: "always_base_unit",
                        label: "Sub-units are mostly optional because every serious report should return to the base unit immediately.",
                        feedback:
                          "Base units are important, but sensible reporting often uses sub-units so the number stays readable.",
                      },
                    ],
                    successLabel: "Prefix handoff complete.",
                    retryLabel: "That follow-up would blur what sub-units actually do.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "quantities, units, and sub-units") {
                  return {
                    id: "f1-l1-quantities-units-subunits",
                    badge: "Report desk",
                    title: "Choose the readable report",
                    scenario:
                      "The team has measured a notebook and a coin. You need the report line that keeps both values readable without changing the physical sizes.",
                    prompt: "Choose the report to send.",
                    options: [
                      {
                        value: "sensible_units",
                        label: "Report the notebook width in centimetres and the coin thickness in millimetres so the numbers match the object scale.",
                        feedback:
                          "Exactly. Sensible units keep the quantity fixed while making the measurement easy to read and compare.",
                        isCorrect: true,
                      },
                      {
                        value: "smallest_unit_always",
                        label: "Always choose the smallest possible unit so the numbers become as large as they can be.",
                        feedback:
                          "Very large numbers can become awkward. The goal is readable reporting, not just making the number bigger.",
                      },
                      {
                        value: "base_unit_only",
                        label: "Always use the base unit even when it makes the number awkward, because prefixes weaken the measurement.",
                        feedback:
                          "Prefixes do not weaken the measurement. They help the report fit the scale of the object.",
                      },
                    ],
                    successLabel: "Report chosen. The measurements now fit the objects properly.",
                    retryLabel: "That choice would make the report harder to read than it needs to be.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "choose units and tools wisely") {
                  return {
                    id: "f1-l1-choose-units-tools",
                    badge: "Instrument bay",
                    title: "Assign the right tool and unit",
                    scenario:
                      "Three jobs just came in: desk length, object mass, and coin thickness. You need the setup that matches each job with a sensible tool and unit.",
                    prompt: "Choose the setup order.",
                    options: [
                      {
                        value: "match_scale_and_tool",
                        label: "Use a metre rule for desk length, a balance for mass, and a caliper or micrometer for coin thickness, then report each in a sensible unit.",
                        feedback:
                          "Exactly. Tool choice and unit choice should both match the scale of the job.",
                        isCorrect: true,
                      },
                      {
                        value: "one_tool_all_jobs",
                        label: "Use the metre rule for everything, then fix the problem by converting the values carefully afterward.",
                        feedback:
                          "A later conversion cannot rescue a poor tool choice. The instrument has to suit the job from the start.",
                      },
                      {
                        value: "base_unit_for_all",
                        label: "Choose any tool you want, as long as every final answer ends up written in the base unit.",
                        feedback:
                          "The final unit matters, but the first priority is matching the tool and unit to the scale of the measurement.",
                      },
                    ],
                    successLabel: "Bay assigned. Each job now has the right setup.",
                    retryLabel: "That setup would make at least one measurement weaker than it needs to be.",
                  } satisfies ScaffoldRoleplayCard;
                }

                if (activeSectionHeading === "analogy") {
                  return {
                    id: "f1-l1-analogy",
                    badge: "Story relay",
                    title: "Pick the analogy that keeps the unit idea clean",
                    scenario:
                      "The team wants an analogy that explains prefixes without making students think the quantity itself changes.",
                    prompt: "Choose the analogy line to send.",
                    options: [
                      {
                        value: "money_analogy",
                        label: "Treat units like money sizes: dollars, cents, and thousands are all money, but the unit size changes how many are needed.",
                        feedback:
                          "Exactly. That keeps the quantity fixed while showing why the number changes with unit size.",
                        isCorrect: true,
                      },
                      {
                        value: "different_objects",
                        label: "Treat each unit as a different object entirely, because changing from cm to mm creates a new measurement.",
                        feedback:
                          "That breaks the lesson idea. The quantity stays the same; only the unit size changes.",
                      },
                      {
                        value: "same_number",
                        label: "Treat prefixes like labels that should never change the number, because the object has not changed.",
                        feedback:
                          "The object stays the same, but the written number changes because different unit sizes count the quantity in different chunks.",
                      },
                    ],
                    successLabel: "Good analogy. It supports the lesson instead of distorting it.",
                    retryLabel: "That analogy would confuse the unit idea.",
                  } satisfies ScaffoldRoleplayCard;
                }
              }
            }

            if (lessonId === "M1_L1") {
            if (isTableStep && activeTableIndex === 0) {
              return {
                id: `m1-l1-table-${activeTableIndex}`,
                badge: "Control room",
                title: "The data wall is live",
                scenario:
                  "The mission table just lit up in Control. Your job is to stop the crew from jumping to a story before they have matched the quantities and units properly.",
                prompt: "Choose the crew's next move.",
                options: [
                  {
                    value: "match_axes",
                    label: "“Match each column or axis to the quantity and unit before telling the motion story.”",
                    feedback:
                      "Exactly. The crew needs to lock the quantities and units first so each later conclusion rests on the right measurement meaning.",
                    isCorrect: true,
                  },
                  {
                    value: "pick_highest",
                    label: "“Jump straight to the biggest number because the largest value always tells the fastest motion.”",
                    feedback:
                      "A large value can be total distance, not speed. The quantities have to be matched to their meanings before the story is safe to tell.",
                  },
                  {
                    value: "ignore_units",
                    label: "“Ignore the units for now and focus only on whether the numbers rise or fall.”",
                    feedback:
                      "That loses the physics. Units decide what the numbers mean and stop distance, time, and speed from collapsing into one idea.",
                  },
                ],
                successLabel: "Control room aligned. The data now means something.",
                retryLabel: "That move would rush the crew past the evidence.",
              } satisfies ScaffoldRoleplayCard;
            }

            if (isMediaStep && activeMediaIndex === 0) {
              return {
                id: "m1-l1-visual-axes",
                badge: "Playback challenge",
                title: "Freeze the mission log at the teaching moment",
                scenario:
                  "The crew is watching the distance-time visual. You can pin one coaching note to the display before the playback continues.",
                prompt: "Pin the right note to the screen.",
                options: [
                  {
                    value: "height_speed",
                    label: "“Height tells the speed and steepness tells the total distance travelled so far.”",
                    feedback:
                      "That swaps the graph jobs. On a distance-time graph, height shows the recorded distance by that time, while steepness shows how quickly distance is being added.",
                  },
                  {
                    value: "height_distance_slope_speed",
                    label: "“Height shows distance by that time, and steepness shows the speed on that segment.”",
                    feedback:
                      "Exactly. That is the sentence that keeps the graph readable without turning it into a road picture.",
                    isCorrect: true,
                  },
                  {
                    value: "graph_is_lane",
                    label: "“The graph line is the lane itself, so steeper parts mean the road became steeper.”",
                    feedback:
                      "That collapses the graph world into the route world. The line records changing distance over time; it does not draw the physical lane.",
                  },
                ],
                successLabel: "Pinned. The screen now tells the right story.",
                retryLabel: "That note would scramble the graph jobs.",
              } satisfies ScaffoldRoleplayCard;
            }

            if (isMediaStep && activeMediaIndex === 1) {
              return {
                id: "m1-l1-visual-same-finish",
                badge: "Mission compare",
                title: "Same finish, different journey",
                scenario:
                  "The crew sees two mission logs end at the same final point and assumes the journeys must have been identical. You need one correction before that mistake spreads.",
                prompt: "Send the comparison call.",
                options: [
                  {
                    value: "same_story",
                    label: "“Same finish means the journeys had the same pace at every moment.”",
                    feedback:
                      "Equal final distance and time do not lock the whole story. One run can pause or change pace and still finish at the same point.",
                  },
                  {
                    value: "different_histories",
                    label: "“Same finish can still hide different pauses and pace patterns on the way there.”",
                    feedback:
                      "Exactly. Final point alone is not the full motion story; the segment history still matters.",
                    isCorrect: true,
                  },
                  {
                    value: "one_must_reverse",
                    label: "“If the logs look different, one rover must have reversed direction at some point.”",
                    feedback:
                      "Different graph shapes can come from different pace histories without any reversal. The safe move is to read each segment one at a time.",
                  },
                ],
                successLabel: "Call sent. The crew can now compare the stories properly.",
                retryLabel: "That would hide the real difference between the runs.",
              } satisfies ScaffoldRoleplayCard;
            }
            if (isSectionStep && !activeSection?.worked_example) {
              if (activeSectionHeading === "fix these ideas") {
                return {
                  id: "m1-l1-fix-ideas",
                  badge: "Signal check",
                  title: "Repair the first bad briefing",
                  scenario:
                    "A trainee sends a shaky opening note to the rover crew. You need to stop the wrong graph story before it becomes the team habit.",
                  prompt: "Choose the fix you send back.",
                  options: [
                    {
                      value: "route_shape",
                      label: "Tell them the line is mainly a sketch of the route shape, so they should picture the road first.",
                      feedback:
                        "That keeps the trainee in the wrong world. The line is a record of distance changing with time, not a map of the road shape.",
                    },
                    {
                      value: "record_story",
                      label: "Tell them to read what the graph records: distance on the vertical axis and time on the horizontal axis.",
                      feedback:
                        "Exactly. That puts the trainee back in the graph world before any story about motion is added.",
                      isCorrect: true,
                    },
                    {
                      value: "highest_first",
                      label: "Tell them to find the highest point first because it always reveals the fastest motion.",
                      feedback:
                        "Highest point only shows the greatest recorded distance so far. Speed still comes from the steepness of the segment.",
                    },
                  ],
                  successLabel: "Good catch. The briefing is back on track.",
                  retryLabel: "That reply would reinforce the wrong habit.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "core idea") {
                return {
                  id: "m1-l1-core-idea",
                  badge: "Ops summary",
                  title: "Send the one-line rule",
                  scenario:
                    "Quest Control wants a single sentence the whole team can repeat while reading the graph.",
                  prompt: "Choose the line that should go on the ops board.",
                  options: [
                    {
                      value: "height_speed",
                      label: "Graph height tells speed, and graph steepness tells how far away the rover is.",
                      feedback:
                        "That swaps the graph jobs. Height gives recorded distance by that time, while steepness gives speed.",
                    },
                    {
                      value: "height_distance_slope_speed",
                      label: "Graph height shows distance by that time, and graph steepness shows speed on that segment.",
                      feedback:
                        "Exactly. That is the clean rule the crew needs before they compare segments.",
                      isCorrect: true,
                    },
                    {
                      value: "shape_is_route",
                      label: "The graph shape is the route, so curves and slopes tell you how the road itself bends.",
                      feedback:
                        "That confuses the graph with the physical path. The graph is a motion record, not a map.",
                    },
                  ],
                  successLabel: "Rule posted. Everyone is reading from the same idea now.",
                  retryLabel: "That rule would confuse the whole team.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "technical words") {
                return {
                  id: "m1-l1-technical-words",
                  badge: "Term desk",
                  title: "Clean up the vocabulary board",
                  scenario:
                    "The crew can see the graph, but their labels are getting sloppy. You need the term card that keeps the quantities straight.",
                  prompt: "Pick the vocabulary note to post.",
                  options: [
                    {
                      value: "distance_speed_mix",
                      label: "Distance and speed are interchangeable as long as the graph is moving upward.",
                      feedback:
                        "Those are different quantities. Distance is how far has been recorded by that time; speed is how quickly distance is changing.",
                    },
                    {
                      value: "distance_time_speed_terms",
                      label: "Distance is the recorded height, time is the horizontal progress, and speed is read from the segment gradient.",
                      feedback:
                        "Exactly. That keeps the language tied to the graph jobs instead of loose impressions.",
                      isCorrect: true,
                    },
                    {
                      value: "height_only",
                      label: "Use the graph height for every motion quantity because it is the easiest number to see.",
                      feedback:
                        "That makes every quantity collapse into one reading. Different graph features answer different questions.",
                    },
                  ],
                  successLabel: "Vocabulary board cleaned up.",
                  retryLabel: "That wording would blur the quantities again.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "technical words continued") {
                return {
                  id: "m1-l1-technical-words-continued",
                  badge: "Term relay",
                  title: "Finish the glossary handoff",
                  scenario:
                    "A second crew member is writing the glossary card that follows the first one. It needs to extend the vocabulary without repeating it badly.",
                  prompt: "Choose the follow-up line.",
                  options: [
                    {
                      value: "segment_meaning",
                      label: "Each segment can tell a different motion story, so the crew should name what distance and time are doing in that interval.",
                      feedback:
                        "Exactly. That extends the glossary into actual graph reading instead of repeating the first card.",
                      isCorrect: true,
                    },
                    {
                      value: "all_same_story",
                      label: "Once you know the final point, you do not need segment language because the story is already complete.",
                      feedback:
                        "Final point alone does not tell the whole journey. Segment language is what reveals pauses and pace changes.",
                    },
                    {
                      value: "speed_is_point",
                      label: "Speed is always a single point reading, so segment language only adds clutter.",
                      feedback:
                        "On a distance-time graph, speed comes from the gradient of a segment, not just a point label.",
                    },
                  ],
                  successLabel: "Glossary relay complete.",
                  retryLabel: "That follow-up would flatten the segment story.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "how to reason through it") {
                return {
                  id: "m1-l1-how-to-reason",
                  badge: "Guidance channel",
                  title: "Coach the analyst's first move",
                  scenario:
                    "The trainee analyst is ready to answer a graph question, but they still rush straight to a guess. You get one coaching instruction.",
                  prompt: "Choose the instruction you send.",
                  options: [
                    {
                      value: "segment_story",
                      label: "Read one segment at a time and say what distance and time are doing before you calculate anything.",
                      feedback:
                        "Exactly. Segment-by-segment reading is what makes the graph story trustworthy.",
                      isCorrect: true,
                    },
                    {
                      value: "highest_first",
                      label: "Find the highest point first because that always reveals the fastest part of the motion.",
                      feedback:
                        "Highest point only gives the greatest recorded distance so far. Speed still comes from the segment slope.",
                    },
                    {
                      value: "skip_flat",
                      label: "Ignore flat sections until the end because they do not affect the important parts of the story.",
                      feedback:
                        "Flat sections matter. They show that time is passing while the recorded distance is not changing.",
                    },
                  ],
                  successLabel: "Good coaching. The analyst has a real method now.",
                  retryLabel: "That would send the analyst back into guesswork.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "common trap") {
                return {
                  id: "m1-l1-common-trap",
                  badge: "Trap alert",
                  title: "Cut off the shortcut before it spreads",
                  scenario:
                    "One crew member keeps saying the highest point must be the fastest moment. You need the correction that kills that shortcut cleanly.",
                  prompt: "Choose the trap warning.",
                  options: [
                    {
                      value: "highest_is_fastest",
                      label: "That shortcut is safe because bigger graph height always means bigger speed.",
                      feedback:
                        "That is exactly the trap. Height gives recorded distance by that time; speed comes from steepness.",
                    },
                    {
                      value: "slope_not_height",
                      label: "Speed comes from the slope of the segment, not from the highest point on the graph.",
                      feedback:
                        "Exactly. That one sentence blocks the most common shortcut in this lesson.",
                      isCorrect: true,
                    },
                    {
                      value: "ignore_points",
                      label: "Ignore the graph points completely and only read the captions around the graph.",
                      feedback:
                        "The graph still matters. The fix is to read the right graph feature, not to stop reading the graph.",
                    },
                  ],
                  successLabel: "Trap blocked. The shortcut will not take over the room.",
                  retryLabel: "That warning would leave the trap alive.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "analogy") {
                return {
                  id: "m1-l1-analogy",
                  badge: "Story relay",
                  title: "Pick the analogy that keeps the physics clean",
                  scenario:
                    "The team wants a story comparison that helps beginners without slipping back into route-shape thinking.",
                  prompt: "Choose the analogy line to send.",
                  options: [
                    {
                      value: "scoreboard",
                      label: "Treat the graph like a scoreboard or mission log that records what has happened as time passes.",
                      feedback:
                        "Exactly. That keeps the idea of a running record without pretending the graph line is the physical path.",
                      isCorrect: true,
                    },
                    {
                      value: "road_map",
                      label: "Treat the graph like a road map that draws the bends and slopes of the route itself.",
                      feedback:
                        "That drags the learner back into the wrong picture. The graph is not a map of the lane.",
                    },
                    {
                      value: "photo_snapshot",
                      label: "Treat the graph like one still photo, because the final picture tells you the whole journey.",
                      feedback:
                        "A single snapshot misses the time story. This lesson needs a record that updates as time goes on.",
                    },
                  ],
                  successLabel: "Good analogy. It supports the idea instead of warping it.",
                  retryLabel: "That analogy would pull the team back off course.",
                } satisfies ScaffoldRoleplayCard;
              }

              if (activeSectionHeading === "lesson relation") {
                return {
                  id: "m1-l1-lesson-relation",
                  badge: "Rule dispatch",
                  title: "Send the bridge into the next lesson",
                  scenario:
                    "Quest Control wants one compact line that links this graph reading lesson to the formal motion work coming next.",
                  prompt: "Choose the bridge line.",
                  options: [
                    {
                      value: "distance_slope_link",
                      label: "Distance-time reading prepares the crew to use graph slope as a speed idea before moving into more formal motion analysis.",
                      feedback:
                        "Exactly. That is the right bridge: keep the graph meaning, then carry it into the formal motion language.",
                      isCorrect: true,
                    },
                    {
                      value: "formula_first",
                      label: "Forget the graph story now and move straight to formulas, because the graph was only a warm-up picture.",
                      feedback:
                        "The graph story is the foundation. The next lesson should build on it, not throw it away.",
                    },
                    {
                      value: "route_only",
                      label: "The main lesson is still just about route shape, and the next lesson will prove that more carefully.",
                      feedback:
                        "That keeps the wrong frame alive. The lesson relation should carry forward the motion-record idea instead.",
                    },
                  ],
                  successLabel: "Bridge line sent. The next lesson has a clean runway.",
                  retryLabel: "That would connect this lesson to the wrong next step.",
                } satisfies ScaffoldRoleplayCard;
              }
            }
            }
            return null;
          })()
        : null;
    const scaffoldRoleplaySelectionKey = scaffoldRoleplayCard
      ? `${lessonId}:scaffold:${clampedScaffoldStepIndex}:${scaffoldRoleplayCard.id}`
      : "";
    return (
        <div className="space-y-6">
          {isIntroStep ? (
            <div className="lesson-stage-hero rounded-2xl border p-6 shadow-sm">
              {payload.intro ? <p className="lesson-stage-subtitle text-slate-700">{normalizeLessonDisplayMultiline(payload.intro)}</p> : null}

              {introSections.length ? (
                <div className={`${payload.intro ? "mt-4" : ""} grid gap-4`}>
                  {introSections.map((section) => (
                    <div key={section.heading} className="rounded-2xl border border-slate-200 bg-white/90 p-5">
                      <p className="font-medium text-slate-900">{section.heading}</p>
                      <p className="mt-3 whitespace-pre-line text-slate-700">{section.body}</p>
                      {section.bullets.length ? (
                        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
                          {section.bullets.map((item, index) => (
                            <li key={`${section.heading}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

            {normalizedTeachingFocus.length && !separateTeachingFocusStep ? (
              <div className={`${payload.intro || introSections.length ? "mt-4" : ""} rounded-2xl bg-slate-50 p-5`}>
                <p className="font-medium text-slate-900">Core concepts in this sub-unit</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                  {normalizedTeachingFocus.slice(0, 6).map((item, index) => (
                  <li key={`${index}-${item}`}>{normalizeLessonDisplayMultiline(item)}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        ) : null}
        {isTeachingFocusStep ? (
          <div className="lesson-stage-hero rounded-2xl border p-6 shadow-sm">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-medium text-slate-900">Core concepts in this sub-unit</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                {normalizedTeachingFocus.slice(0, 6).map((item, index) => (
                  <li key={`teaching-focus-${index}-${item}`}>{normalizeLessonDisplayMultiline(item)}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        {scaffoldRoleplayCard ? renderScaffoldRoleplayCard(scaffoldRoleplayCard, scaffoldRoleplaySelectionKey) : null}
        {isClarityStep ? scaffoldClarityPanel : null}
        {payload.reference_tables?.length && isTableStep ? (
          <div className="lesson-display-deck">
            {payload.reference_tables.map((table, index) => (
              clampedScaffoldStepIndex === tableStart + index ? (
              <div key={table.title} className="lesson-display-slide overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="border-b bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">{normalizeLessonDisplayText(table.title)}</h4>
                  {table.caption ? <p className="mt-2 text-sm text-slate-600">{normalizeLessonDisplayMultiline(table.caption)}</p> : null}
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
                          <th key={column} className="border-b px-5 py-3 pr-8 align-top text-left font-semibold leading-6 whitespace-normal break-words">{normalizeLessonDisplayText(column)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={`${table.title}-${rowIndex}`} className="even:bg-slate-50/70">
                          {row.map((cell, cellIndex) => (
                            <td key={`${table.title}-${rowIndex}-${cellIndex}`} className="border-b border-slate-100 px-5 py-3 pr-8 align-top text-left whitespace-normal break-words leading-6">{normalizeLessonDisplayMultiline(cell)}</td>
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
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{normalizeLessonDisplayText(card.title)}</h4>
                {!isConceptSupportCard ? <p className="mt-2 text-slate-700">{normalizeLessonDisplayMultiline(card.caption)}</p> : null}

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
                        <p className="mt-4 text-base leading-7 text-slate-700">{normalizeLessonDisplayMultiline(card.caption)}</p>
                        {supportHighlights.length ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {supportHighlights.slice(0, 3).map((item) => (
                              <div key={item} className="rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                                {normalizeLessonDisplayMultiline(item)}
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
                      <li key={item} className="rounded-xl bg-white/80 px-3 py-2 shadow-sm ring-1 ring-sky-100">{normalizeLessonDisplayMultiline(item)}</li>
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

            <h4 className="text-lg font-semibold text-slate-900">{normalizeLessonDisplayText(section.heading === "Fix these ideas" && !payload.misconception_targets?.length ? "What this lesson will sharpen" : section.heading)}</h4>
            {section.heading === "Fix these ideas" ? (
              <div className="mt-3 space-y-4">
                <p className="text-slate-700">{normalizeLessonDisplayText(payload.misconception_targets?.length ? "Focus on these deeper explanations as you move through the next activities." : "Your opening check was fairly strong. Use this lesson to deepen the meaning behind these ideas before the next check.")}</p>
                {scaffoldFocusItems.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {scaffoldFocusItems.map((item) => (
                      <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-700">{normalizeLessonDisplayMultiline(item)}</div>
                    ))}
                  </div>
                ) : section.body && !section.worked_example ? (
                  <p className="whitespace-pre-line text-slate-700">{normalizeLessonDisplayMultiline(section.body)}</p>
                ) : null}
                {payload.misconception_targets?.length && section.body ? (
                  <p className="text-sm whitespace-pre-line text-slate-600">{normalizeLessonDisplayMultiline(section.body)}</p>
                ) : (
                  <p className="text-sm text-slate-600">{normalizeLessonDisplayText("The next activities, examples, and simulation are arranged to strengthen these ideas one at a time.")}</p>
                )}
              </div>
            ) : null}
            {section.body && !section.worked_example && section.heading !== "Fix these ideas" ? (
                <p className="mt-3 whitespace-pre-line text-slate-700">{normalizeLessonDisplayMultiline(section.body)}</p>
            ) : null}

            {section.technical_words?.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.technical_words.map((entry) => {
                  const displayTerm = normalizeLessonDisplayText(entry.term);
                  const displayMeaning = preserveLeadingTechnicalWordSymbol(
                    displayTerm,
                    normalizeLessonDisplayMultiline(entry.meaning),
                  );
                  return (
                    <div key={entry.term} className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 shadow-sm">
                      <p className="text-base font-semibold text-slate-900">{displayTerm}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{displayMeaning}</p>
                      {entry.why_it_matters ? (
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          <span className="font-medium text-slate-700">Why it matters:</span>{" "}
                          {normalizeLessonDisplayMultiline(entry.why_it_matters)}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}

            {section.formula_reference_rows?.length ? (
              (() => {
                const formulaRows = section.formula_reference_rows ?? [];
                const normalizedRowAnalogies = formulaRows
                  .map((row) =>
                    typeof row.analogy_equivalent === "string"
                      ? row.analogy_equivalent.replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim()
                      : "",
                  )
                  .filter(Boolean);
                const repeatedRowAnalogies = Array.from(new Set(normalizedRowAnalogies));
                const firstRowAnalogy =
                  formulaRows.find((row) => typeof row.analogy_equivalent === "string" && row.analogy_equivalent.trim())
                    ?.analogy_equivalent
                    ?.trim() ?? "";
                const derivedSharedFormulaAnalogy =
                  typeof section.shared_formula_analogy === "string" && section.shared_formula_analogy.trim()
                    ? section.shared_formula_analogy.trim()
                    : repeatedRowAnalogies.length === 1 && formulaRows.length > 1
                      ? firstRowAnalogy
                      : "";
                const hasSharedFormulaAnalogy = Boolean(derivedSharedFormulaAnalogy);
                const hasRowAnalogies = !hasSharedFormulaAnalogy && formulaRows.some((row) => row.analogy_equivalent);
                const hasRowConstants = formulaRows.some((row) => row.constants);
                return (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                    {derivedSharedFormulaAnalogy ? (
                      <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-medium text-slate-900">Shared analogy match:</span>{" "}
                        {normalizeLessonDisplayMultiline(derivedSharedFormulaAnalogy)}
                      </div>
                    ) : null}
                    {section.formula_constants_note ? (
                      <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-slate-700">
                        <span className="font-medium text-slate-900">Constants for this lesson:</span>{" "}
                        {normalizeLessonDisplayMultiline(section.formula_constants_note)}
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
                                <p className="font-mono text-sm text-slate-900">{normalizeFormulaDisplayText(row.standard_formula)}</p>
                                {row.meaning ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-700">
                                    <span className="font-medium text-slate-800">Meaning:</span>{" "}
                                    {normalizeLessonDisplayMultiline(row.meaning)}
                                  </p>
                                ) : null}
                                {row.units_text ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    <span className="font-medium text-slate-700">Units:</span>{" "}
                                    {normalizeLessonDisplayMultiline(row.units_text)}
                                  </p>
                                ) : null}
                                {row.conditions ? (
                                  <p className="mt-2 text-sm leading-6 text-slate-600">
                                    <span className="font-medium text-slate-700">Best use:</span>{" "}
                                    {normalizeLessonDisplayMultiline(row.conditions)}
                                  </p>
                                ) : null}
                              </td>
                              {hasRowAnalogies ? (
                                <td className="border-b border-slate-100 px-5 py-4 pr-8 align-top text-left whitespace-normal break-words leading-6">{normalizeLessonDisplayMultiline(row.analogy_equivalent)}</td>
                              ) : null}
                              {hasRowConstants ? (
                                <td className="border-b border-slate-100 px-5 py-4 pr-8 align-top text-left whitespace-normal break-words leading-6">
                                  {row.constants ? normalizeLessonDisplayMultiline(row.constants) : "None"}
                                </td>
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
                <p className="mt-2 text-slate-700">{normalizeLessonDisplayMultiline(section.analogy)}</p>
              </div>
            ) : null}

            {section.visual && (section.visual.video_url || section.visual.image_url) ? (
              <div className="mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm">
                <div className="bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.7),_rgba(255,255,255,0.96)_62%)] p-4 md:p-5">
                  {section.visual.video_url ? (
                    <ScaffoldVideoPlayer
                      src={section.visual.video_url}
                      poster={section.visual.poster_url}
                      captionsUrl={section.visual.captions_url}
                    />
                  ) : (
                    <img
                      src={section.visual.image_url}
                      alt={section.visual.caption || section.heading}
                      className="h-72 w-full object-contain md:h-80"
                      loading="lazy"
                    />
                  )}
                </div>
                {section.visual.caption || section.visual.highlights?.length ? (
                  <div className="border-t bg-slate-50/80 p-5">
                    {section.visual.caption ? (
                      <p className="text-slate-700">{normalizeLessonDisplayMultiline(section.visual.caption)}</p>
                    ) : null}
                    {section.visual.highlights?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {section.visual.highlights.slice(0, 4).map((item) => (
                          <div key={item} className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
                            {normalizeLessonDisplayMultiline(item)}
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
                <p className="mt-2 text-slate-700">{normalizeLessonDisplayMultiline(section.worked_example.prompt)}</p>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.12em] text-slate-500">Step-by-step solution</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
                  {section.worked_example.steps.map((step, i) => (
                    <li key={i}>{normalizeLessonDisplayMultiline(step)}</li>
                  ))}
                </ol>
                <p className="mt-4 text-slate-800">
                  <span className="font-medium">Final answer:</span>{" "}
                  {normalizeLessonDisplayMultiline(section.worked_example.answer)}
                </p>
                {section.worked_example.answer_reason ? (
                  <p className="mt-3 text-slate-700">
                    <span className="font-medium">Why this answer is right:</span>{" "}
                    {normalizeLessonDisplayMultiline(section.worked_example.answer_reason)}
                  </p>
                ) : null}
              </div>
            ) : null}

            {section.check_for_understanding ? (
                <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-slate-800">
                <span className="font-medium">Think about this:</span>{" "}
                {normalizeLessonDisplayMultiline(section.check_for_understanding)}
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

        {payload.feedback.map((item, index) => {
            return (
              <FeedbackCard
                key={item.question_id}
                correct={item.is_correct}
                title={`Check ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
                body={normalizeAssessmentText(item.explanation)}
                extra={
                  item.is_correct ? null : (
                    <MisconceptionRepairPanel
                      tag={item.misconception_tag}
                      prompt={item.prompt}
                      correctAnswer={item.correct_answer}
                      teachingFocus={item.teaching_focus}
                    />
                  )
                }
              />
            );
          })}

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
            {normalizeLessonDisplayMultiline(payload.instructions)}
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
            <h3 className="text-lg font-semibold text-slate-900">{normalizeLessonDisplayText(payload.title)}</h3>
          ) : null}
          {payload.instructions ? (
            <p className="mt-2 text-slate-700">{normalizeLessonDisplayMultiline(payload.instructions)}</p>
          ) : null}
          {payload.task_prompt ? (
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-800">
              <span className="font-medium">Your task:</span> {normalizeLessonDisplayMultiline(payload.task_prompt)}
            </div>
          ) : null}
          {payload.try_first ? (
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
              <span className="font-medium">Try this first:</span> {normalizeLessonDisplayMultiline(payload.try_first)}
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
                    <span className="font-medium text-slate-900">Step {index + 1}:</span> {normalizeLessonDisplayMultiline(step)}
                  </li>
                ))}
              </ol>
            ) : null}
            {payload.watch_for?.length ? (
              <div className="mt-4 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Watch for:</span> {normalizeLessonDisplayMultiline(payload.watch_for.join(" "))}
              </div>
            ) : null}
            {payload.takeaway ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <span className="font-medium">What this should show:</span> {normalizeLessonDisplayMultiline(payload.takeaway)}
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
        ) : simulationLessonKey.startsWith("A1_") ? (
          <A1SimulationPanels
            lessonKey={simulationLessonKey}
            simMetricMeters={simMetricMeters}
            setSimMetricMeters={setSimMetricMeters}
            simVectorMagnitude={simVectorMagnitude}
            setSimVectorMagnitude={setSimVectorMagnitude}
            simVectorAngle={simVectorAngle}
            setSimVectorAngle={setSimVectorAngle}
          />
        ) : simulationLessonKey.startsWith("A3_") ? (
          <A3SimulationPanels
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
        ) : simulationLessonKey.startsWith("A4_") ? (
          <A4SimulationPanels
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
        ) : simulationLessonKey.startsWith("A5_") ? (
          <A5SimulationPanels
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
          <M12NuclearSimulationPanels
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
          {normalizeLessonDisplayText(payload.completion_text ?? "I have finished this activity")}
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
                  {normalizeLessonDisplayText(payload.title)}
                </h3>
              ) : null}
              <p className="mt-3 text-base leading-7 text-slate-700">
                {normalizeLessonDisplayMultiline(payload.prompt)}
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
                  {normalizeLessonDisplayMultiline(card.text)}
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
                  {normalizeLessonDisplayText(payload.visual_check.title)}
                </h4>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {normalizeLessonDisplayMultiline(payload.visual_check.prompt)}
                </p>
                {payload.visual_check.callouts?.length ? (
                  <div className="mt-4 grid gap-3">
                    {payload.visual_check.callouts.map((item) => (
                      <div key={item} className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-slate-700">
                        {normalizeLessonDisplayMultiline(item)}
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
                <p className="mt-3 text-sm leading-6 text-slate-700">{normalizeLessonDisplayMultiline(item)}</p>
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
      const reviewTiming = describeReviewTiming(
        runner.progress_summary?.review_state === "due",
        runner.progress_summary?.review_due_utc,
      );
      const reviewProgress = describeReviewProgress(
        runner.progress_summary?.review_count || 0,
        runner.progress_summary?.last_review_score,
      );
      const passed = typeof masteryPercent === "number"
        ? masteryPercent >= threshold
        : typeof payload.result?.passed === "boolean"
          ? payload.result.passed
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
            {passed ? (
              <>
                <p className="mt-2 text-sm text-slate-600">
                  Next spaced review: {reviewTiming.label}.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {reviewProgress}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                This lesson stays near the front of your review plan until the idea feels steady.
              </p>
            )}
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
          {payload.feedback?.map((item, index) => {
            return (
              <FeedbackCard
                key={item.question_id}
                correct={item.is_correct}
                title={`Question ${index + 1}: ${item.is_correct ? "Correct" : "Needs attention"}`}
                body={masteryFeedbackBody(item, runner.lesson_title)}
                extra={
                  item.is_correct ? null : (
                    <MisconceptionRepairPanel
                      tag={item.misconception_tag}
                      prompt={item.prompt}
                      learnerAnswer={item.learner_answer}
                      correctAnswer={item.correct_answer}
                      teachingFocus={item.teaching_focus}
                    />
                  )
                }
              />
            );
          })}

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
            {normalizeLessonDisplayMultiline(payload.instructions ?? "Answer the final assessment questions carefully.")}
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












