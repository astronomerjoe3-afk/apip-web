"use client";

import { apipGet, apipPost } from "./apipApi";
import { m2ContrastCodes, m2GeneratedConceptGateItems, m2GeneratedDiagnosticItems, m2GeneratedMasteryItems, m2PaddingPrompt, m2QuestionVisualMeta, m2ReflectionVisualCheck, m2ScaffoldCoreBullets, m2ScaffoldFocusExtras, m2ScaffoldMediaCards, m2SimulationCopy } from "./m2LessonContent";

type UnknownRecord = Record<string, unknown>;
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type RunnerRequest = {
  lesson_id: string;
  event_type: string;
  payload?: UnknownRecord;
};

type LocalState = {
  profile?: {
    diagnosticScore?: number;
    conceptGateReady?: boolean;
  };
  diagnostic?: {
    nonce?: number;
    askedIds: string[];
    answers: Record<string, string>;
    feedback?: UnknownRecord[];
    recentFeedback?: UnknownRecord;
    complete?: boolean;
  };
  conceptGate?: {
    nonce?: number;
    retryCount: number;
    submitted?: boolean;
    passed?: boolean;
    feedback?: UnknownRecord[];
    microReteach?: UnknownRecord;
  };
  reflection?: {
    submitted?: boolean;
    learnerResponse?: string;
  };
  mastery?: {
    nonce: number;
    submitted?: boolean;
    feedback?: UnknownRecord[];
    result?: UnknownRecord;
    reviewRefs?: UnknownRecord[];
    reviewRequested?: boolean;
    forceNewAttempt?: boolean;
    displayedItems?: UnknownRecord[];
  };
};

type LessonResources = {
  runner: UnknownRecord;
  lesson: UnknownRecord;
};

type AttemptHistory = {
  diagnosticUsedIds?: string[];
  diagnosticLastIds?: string[];
  conceptGateUsedIds?: string[];
  conceptGateLastIds?: string[];
  masteryUsedIds?: string[];
  masteryLastIds?: string[];
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CONCEPT_GATE_MAX_RETRIES = 2;
const MASTERY_DEFAULT_MIN = 5;
const MASTERY_DEFAULT_MAX = 10;
const SUPPLEMENTAL_LESSON_CODES = ["F1_L1", "F1_L2", "F1_L3", "F1_L4", "F1_L5", "F1_L6", "F2_L1", "F2_L2", "F2_L3", "F2_L4", "F2_L5", "F2_L6", "F3_L1", "F3_L2", "F3_L3", "F3_L4", "F3_L5", "F3_L6", "F4_L1", "F4_L2", "F4_L3", "F4_L4", "F4_L5", "F4_L6", "M1_L1", "M1_L2", "M1_L3", "M1_L4", "M1_L5", "M1_L6", "M2_L1", "M2_L2", "M2_L3", "M2_L4", "M2_L5", "M2_L6"];

function isExtendedNextgenLessonCode(code: string): boolean {
  return code.startsWith("F2_") || code.startsWith("F3_") || code.startsWith("F4_") || code.startsWith("M1_") || code.startsWith("M2_");
}

function isStructuredMasteryPaddingLessonCode(code: string): boolean {
  return code.startsWith("F3_") || code.startsWith("F4_") || code.startsWith("M1_") || code.startsWith("M2_");
}

type QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

const M1_VISUAL_SUFFIXES: Record<string, string[]> = {
  M1L1: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
  M1L2: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
  M1L3: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
  M1L4: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
  M1L5: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
  M1L6: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12", "T13", "T14", "T15", "T16", "T17"],
};

function m1QuestionVisualMeta(lessonKey: string): QuestionVisualMeta | undefined {
  switch (lessonKey) {
    case "M1L1":
      return {
        image_url: "/lesson-media/m1/m1-l1-distance-time.svg",
        visual_title: "Quest lane and mission log",
        visual_caption: "The lane is where motion happens, and the mission log records how the progress score changes with time.",
        visual_callouts: [
          "Height shows recorded progress by that time.",
          "A flat section means the avatar is paused.",
          "Steeper rise means greater pace.",
        ],
      };
    case "M1L2":
      return {
        image_url: "/lesson-media/m1/m1-l2-speed-time.svg",
        visual_title: "Pace log",
        visual_caption: "On a pace log, height tells speed now while slope tells how the pace is changing.",
        visual_callouts: [
          "A high point means large speed now.",
          "A rising line means positive acceleration.",
          "Flat above zero still means motion.",
        ],
      };
    case "M1L3":
      return {
        image_url: "/lesson-media/m1/m1-l3-acceleration.svg",
        visual_title: "Pace arrow and boost shift",
        visual_caption: "Acceleration comes from the signed change in velocity over time, not from a guess about feeling faster.",
        visual_callouts: [
          "Compare the starting and finishing velocity arrows before naming the acceleration sign.",
          "The same velocity change over less time means a larger acceleration magnitude.",
          "Negative acceleration only tells you the direction of the change, not automatically slowing down in every story.",
        ],
      };
    case "M1L4":
      return {
        image_url: "/lesson-media/m1/m1-l4-suvat.svg",
        visual_title: "Quest forecast board",
        visual_caption: "Choose equations from the knowns, the unknown, and the constant-acceleration condition.",
        visual_callouts: [
          "u, v, a, s, and t each answer a different question in the story.",
          "Pick the relation that reaches the unknown while avoiding the variable you do not know.",
          "This board only applies directly when acceleration stays constant.",
        ],
      };
    case "M1L5":
      return {
        image_url: "/lesson-media/m1/m1-l5-gradient.svg",
        visual_title: "Same tilt, different log",
        visual_caption: "The same slope can mean pace on a progress log or acceleration on a pace log because the axes are different.",
        visual_callouts: [
          "On distance-time, slope compares distance change with time, so it gives speed.",
          "On speed-time, slope compares speed change with time, so it gives acceleration.",
          "A zero slope tells a different motion story on each graph type.",
        ],
      };
    case "M1L6":
      return {
        image_url: "/lesson-media/m1/m1-l6-area.svg",
        visual_title: "Area hunter",
        visual_caption: "Every strip under the pace log is progress earned during one time beat, so the whole area is total distance.",
        visual_callouts: [
          "The rectangle shows distance from the constant-speed part of the story.",
          "The triangle shows the extra distance added while the speed changes steadily.",
          "Different graph shapes can still represent the same total distance if the total area matches.",
        ],
      };
    default:
      return undefined;
  }
}

function questionVisualMeta(item: UnknownRecord): QuestionVisualMeta | undefined {
  const id = text(item.id).toUpperCase();
  const m2Visual = m2QuestionVisualMeta(id);
  if (m2Visual) return m2Visual;
  const match = id.match(/^(M1L[1-6])_([DCT]\d+)$/);
  if (!match) return undefined;
  const lessonKey = match[1];
  const suffix = match[2];
  return M1_VISUAL_SUFFIXES[lessonKey]?.includes(suffix) ? m1QuestionVisualMeta(lessonKey) : undefined;
}

type FallbackAnswerMeta = {
  id: string;
  answerIndex?: number;
  acceptedAnswers?: string[];
  correctAnswer: string;
  explanation: string;
  teachingFocus?: string;
  misconceptionTag?: string;
};

const FALLBACK_ANSWER_METADATA: Record<string, FallbackAnswerMeta> = {
  "which is the correct si unit for mass": {
    id: "F1L1_D1",
    answerIndex: 1,
    correctAnswer: "kilogram (kg)",
    explanation: "Kilogram (kg) is the SI base unit for mass.",
    teachingFocus: "Match each physical quantity to its agreed SI unit.",
    misconceptionTag: "unit_quantity_mismatch",
  },
  "1 millimeter mm equals": {
    id: "F1L1_D2",
    answerIndex: 0,
    correctAnswer: "10^-3 m",
    explanation: "milli- means one-thousandth, so 1 mm = 10^-3 m.",
    teachingFocus: "Prefixes change the size of the base unit, so conversions must keep the scale consistent.",
    misconceptionTag: "prefix_scale_error",
  },
  "convert 2 5 km to meters": {
    id: "F1L1_D3",
    acceptedAnswers: ["2500", "2500 m", "2500 meter", "2500 meters", "2500 metre", "2500 metres"],
    correctAnswer: "2500 m",
    explanation: "kilo- means 1000, so 2.5 km = 2500 m.",
    teachingFocus: "Convert prefixes by scaling the base unit before you compare or combine values.",
    misconceptionTag: "prefix_scale_error",
  },
  "which conversion is correct": {
    id: "F1L1_T1",
    answerIndex: 0,
    correctAnswer: "3.0 m = 300 cm",
    explanation: "Each meter is 100 centimeters, so 3.0 m = 300 cm.",
    teachingFocus: "Unit conversions must keep the measurement equivalent after the scale changes.",
    misconceptionTag: "unit_conversion_error",
  },
  "convert 4500 g to kg": {
    id: "F1L1_T2",
    acceptedAnswers: ["4.5", "4.5 kg", "4.5 kilogram", "4.5 kilograms"],
    correctAnswer: "4.5 kg",
    explanation: "1000 g = 1 kg, so 4500 g = 4.5 kg.",
    teachingFocus: "Use unit factors so the number changes when the unit size changes.",
    misconceptionTag: "unit_conversion_error",
  },
};

Object.assign(FALLBACK_ANSWER_METADATA, {
  "which pair correctly matches quantity to si unit": { id: "F1-L1-D1", answerIndex: 1, correctAnswer: "length -> m", explanation: "The metre (m) is the SI base unit for length.", teachingFocus: "Match each physical quantity to its agreed SI unit before you use it in a calculation.", misconceptionTag: "unit_quantity_mismatch" },
  "which is the si base unit for mass": { id: "F1-L1-D2", answerIndex: 1, correctAnswer: "kilogram (kg)", explanation: "Kilogram (kg) is the SI base unit for mass.", teachingFocus: "Base units are fixed standards, so each quantity must keep its correct SI unit.", misconceptionTag: "unit_quantity_mismatch" },
  "a student records 25 for the length of a table what is the scientific problem with this result": { id: "F1-L1-T1", answerIndex: 1, correctAnswer: "No unit is given", explanation: "A measurement must include a unit.", teachingFocus: "A complete measurement always combines a number with a unit.", misconceptionTag: "unit_as_label_only" },
  "which is a complete measurement": { id: "F1-L1-C1", answerIndex: 1, correctAnswer: "12 cm", explanation: "A complete measurement includes both the number and the unit.", teachingFocus: "Measurements are only meaningful when the number and the unit stay together.", misconceptionTag: "unit_as_label_only" },
});

Object.assign(FALLBACK_ANSWER_METADATA, {
  "a ruler s smallest division is 1 mm a reasonable reported uncertainty is closest to": { id: "F1L3_D1", answerIndex: 1, correctAnswer: "+/- 0.5 mm", explanation: "+/- 0.5 mm is reasonable because a common estimate is about half of the smallest 1 mm division.", teachingFocus: "For a simple scale reading, a reasonable uncertainty is often about half the smallest division.", misconceptionTag: "uncertainty_estimation" },
  "if you consistently read too high due to a zero error this is best described as": { id: "F1L3_D2", answerIndex: 1, correctAnswer: "systematic error", explanation: "This is systematic error because the same zero error shifts every reading in the same direction.", teachingFocus: "Systematic error pushes measurements the same way each time, often because of zero error or poor calibration.", misconceptionTag: "random_vs_systematic_error" },
  "a scale has 0 2 cm divisions what is a reasonable uncertainty to report": { id: "F1-L3-T2", acceptedAnswers: ["0.1 cm", "+/- 0.1 cm"], correctAnswer: "+/- 0.1 cm", explanation: "A reasonable uncertainty is often half the smallest division, so 0.2 cm divisions suggest +/- 0.1 cm.", teachingFocus: "Estimate uncertainty from the instrument scale instead of inventing extra precision.", misconceptionTag: "uncertainty_estimation" },
  "state one difference between random error and systematic error": { id: "F1-L3-T1", acceptedAnswers: ["random error varies unpredictably while systematic error shifts all readings the same way", "random error makes readings scatter while systematic error gives a consistent offset", "random error is unpredictable while systematic error is consistent", "random error scatters readings while systematic error shifts them all in one direction"], correctAnswer: "Random error varies unpredictably, while systematic error shifts readings in the same direction each time.", explanation: "Random error causes scatter from reading to reading, while systematic error adds the same bias each time.", teachingFocus: "Separate changing scatter from repeated one-direction bias when you classify error.", misconceptionTag: "random_vs_systematic_error" },
});


Object.assign(FALLBACK_ANSWER_METADATA, {
  "how many significant figures are in 0 00450": { id: "F1L4_D1", answerIndex: 1, correctAnswer: "3", explanation: "0.00450 has 3 significant figures because the leading zeros do not count, but the trailing zero after the decimal does count.", teachingFocus: "Count significant figures from the first non-zero digit; leading zeros only place the decimal point, but trailing zeros after a decimal can show real precision.", misconceptionTag: "significant_figures" },
  "round 12 349 to 3 significant figures": { id: "F1L4_D2", answerIndex: 0, correctAnswer: "12.3", explanation: "12.349 rounds to 12.3 to 3 significant figures because you keep 1, 2, and 3, then the next digit 4 leaves the 3 unchanged.", teachingFocus: "For significant figures, keep the required digits and use the next digit only to decide whether to round up.", misconceptionTag: "rounding_rules" },
  "calculate 2 5 3 42 and report the result with correct significant figures": { id: "F1-L4-T1", acceptedAnswers: ["8.6"], correctAnswer: "8.6", explanation: "2.5 x 3.42 = 8.55, which rounds to 8.6 because the result should keep 2 significant figures.", teachingFocus: "In multiplication and division, the result usually keeps the same number of significant figures as the least precise measurement.", misconceptionTag: "significant_figures" },
});

Object.assign(FALLBACK_ANSWER_METADATA, {
  "a set of measurements are very close to each other but far from the true value this is": { id: "F1L6_D1", answerIndex: 1, correctAnswer: "precise but not accurate", explanation: "The measurements are tightly grouped, so they are precise, but they are far from the true value, so they are not accurate.", teachingFocus: "Precision is about closeness among repeated readings, while accuracy is about closeness to the accepted or true value.", misconceptionTag: "precision_vs_accuracy" },
  "give one source of systematic error and one source of random error in a measurement": { id: "F1L6_D2", acceptedAnswers: ["Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", "Systematic: zero error. Random: reaction time.", "Systematic: poor calibration. Random: reading fluctuations."], correctAnswer: "Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", explanation: "A strong answer names one cause that shifts readings the same way each time and one cause that makes readings scatter from trial to trial.", teachingFocus: "Systematic error adds a consistent bias, while random error causes scatter between repeated readings.", misconceptionTag: "random_vs_systematic_error" },
  "you measure length as 12 4 cm with a ruler of 1 mm divisions report the value with a reasonable uncertainty": { id: "F1L6_T1", acceptedAnswers: ["12.4 +/- 0.05 cm", "12.4 cm +/- 0.05 cm", "12.4 cm +/- 0.05", "12.40 +/- 0.05 cm", "12.40 cm +/- 0.05 cm", "12.40 cm +/- 0.05"], correctAnswer: "12.4 +/- 0.05 cm", explanation: "A ruler with 1 mm divisions supports about +/- 0.05 cm uncertainty, so 12.4 cm should be reported with that uncertainty.", teachingFocus: "Report the measured value with a reasonable uncertainty based on the instrument's smallest division.", misconceptionTag: "uncertainty_estimation" },
});
Object.assign(FALLBACK_ANSWER_METADATA, {
  "which quantity is a vector": { id: "F1L2_D1", answerIndex: 2, correctAnswer: "displacement", explanation: "Displacement is a vector because it has both size and direction.", teachingFocus: "Vectors need magnitude and direction, while scalars only need magnitude.", misconceptionTag: "vector_scalar_confusion" },
  "speed is a scalar because it has": { id: "F1L2_D2", answerIndex: 0, correctAnswer: "magnitude only", explanation: "Speed is a scalar because it has magnitude only and no direction.", teachingFocus: "Scalars tell how much only, while vectors add direction.", misconceptionTag: "vector_scalar_confusion" },
  "which statement is correct": { id: "F1-L2-D2", answerIndex: 2, correctAnswer: "Vectors have magnitude and direction", explanation: "A vector combines size and direction.", teachingFocus: "Do not treat vectors and scalars as interchangeable descriptions.", misconceptionTag: "vector_scalar_confusion" },
  "a car moves 5 km east is this a scalar or vector description": { id: "F1-L2-T1", answerIndex: 1, correctAnswer: "Vector", explanation: "The direction east makes it a vector.", teachingFocus: "Direction is the feature that turns a scalar description into a vector one.", misconceptionTag: "vector_scalar_confusion" },
  "which is a scalar quantity": { id: "F1-L2-C1", answerIndex: 2, correctAnswer: "distance", explanation: "Distance only needs size, so it is scalar.", teachingFocus: "Scalars tell how much, not which way.", misconceptionTag: "vector_scalar_confusion" },
});

function normalizeLessonId(value: unknown): string {
  return String(value || "").replace(/-/g, "_");
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stateKey(moduleId: string, lessonId: string): string {
  return `lesson-runner:${moduleId}:${normalizeLessonId(lessonId)}`;
}

function readState(moduleId: string, lessonId: string): LocalState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(stateKey(moduleId, lessonId));
    return raw ? (JSON.parse(raw) as LocalState) : {};
  } catch {
    return {};
  }
}

function writeState(moduleId: string, lessonId: string, state: LocalState): void {
  if (typeof window === "undefined") return;
  if (Object.keys(state).length === 0) {
    window.sessionStorage.removeItem(stateKey(moduleId, lessonId));
    return;
  }
  window.sessionStorage.setItem(stateKey(moduleId, lessonId), JSON.stringify(state));
}

function clearState(moduleId: string, lessonId: string): void {
  writeState(moduleId, lessonId, {});
}

function clearModuleState(moduleId: string): void {
  if (typeof window === "undefined") return;
  const prefix = `lesson-runner:${moduleId}:`;
  const keys: string[] = [];
  for (let index = 0; index < window.sessionStorage.length; index += 1) {
    const key = window.sessionStorage.key(index);
    if (key && key.startsWith(prefix)) keys.push(key);
  }
  for (const key of keys) window.sessionStorage.removeItem(key);
}

function attemptHistoryKey(moduleId: string, lessonId: string): string {
  return `lesson-runner-history:${moduleId}:${normalizeLessonId(lessonId)}`;
}

function readAttemptHistory(moduleId: string, lessonId: string): AttemptHistory {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(attemptHistoryKey(moduleId, lessonId));
    return raw ? (JSON.parse(raw) as AttemptHistory) : {};
  } catch {
    return {};
  }
}

function writeAttemptHistory(moduleId: string, lessonId: string, history: AttemptHistory): void {
  if (typeof window === "undefined") return;
  if (Object.keys(history).length === 0) {
    window.sessionStorage.removeItem(attemptHistoryKey(moduleId, lessonId));
    return;
  }
  window.sessionStorage.setItem(attemptHistoryKey(moduleId, lessonId), JSON.stringify(history));
}

function poolIds(items: UnknownRecord[]): string[] {
  return items.map((item) => text(asRecord(item).id)).filter(Boolean);
}

function prioritizePoolForAttempt(pool: UnknownRecord[], nonce: unknown, seedLabel: string, usedIds: string[], lastIds: string[]): UnknownRecord[] {
  const ordered = shuffle(pool, seedLabel + ':' + String(nonce || 0));
  const availableIds = poolIds(ordered);
  if (availableIds.length < 2) return ordered;

  const usedSet = new Set((usedIds || []).filter((id) => availableIds.includes(id)));
  const lastSet = new Set((lastIds || []).filter((id) => availableIds.includes(id)));
  const blockedIds = availableIds.some((id) => !usedSet.has(id)) ? usedSet : lastSet;

  if (blockedIds.size === 0 || blockedIds.size >= availableIds.length) return ordered;

  const preferred = ordered.filter((item) => !blockedIds.has(text(asRecord(item).id)));
  return preferred.length > 0
    ? [...preferred, ...ordered.filter((item) => blockedIds.has(text(asRecord(item).id)))]
    : ordered;
}
function mergeAttemptIds(poolIdsForLesson: string[], priorUsedIds: string[], askedIds: string[]): { lastIds: string[]; usedIds: string[] } {
  const cleanAskedIds = askedIds.filter((id) => poolIdsForLesson.includes(id));
  const mergedUsedIds = Array.from(new Set([
    ...(priorUsedIds || []).filter((id) => poolIdsForLesson.includes(id)),
    ...cleanAskedIds,
  ]));
  return {
    lastIds: cleanAskedIds,
    usedIds: mergedUsedIds.length >= poolIdsForLesson.length ? cleanAskedIds : mergedUsedIds,
  };
}

function diagnosticPoolForAttempt(moduleId: string, lessonId: string, lesson: UnknownRecord, nonce: unknown): UnknownRecord[] {
  const pool = diagnosticItems(lesson).map(asRecord);
  const history = readAttemptHistory(moduleId, lessonId);
  return prioritizePoolForAttempt(pool, nonce, "diagnostic", history.diagnosticUsedIds || [], history.diagnosticLastIds || []);
}

function writeDiagnosticAttemptHistory(moduleId: string, lessonId: string, lesson: UnknownRecord, askedIds: string[]): void {
  const availableIds = poolIds(diagnosticItems(lesson));
  if (availableIds.length === 0) return;

  const history = readAttemptHistory(moduleId, lessonId);
  const merged = mergeAttemptIds(availableIds, history.diagnosticUsedIds || [], askedIds);
  if (merged.lastIds.length === 0) return;

  writeAttemptHistory(moduleId, lessonId, {
    ...history,
    diagnosticLastIds: merged.lastIds,
    diagnosticUsedIds: merged.usedIds,
  });
}

function conceptGatePoolForAttempt(moduleId: string, lessonId: string, lesson: UnknownRecord, nonce: unknown): UnknownRecord[] {
  const pool = conceptGateBank(lesson);
  const history = readAttemptHistory(moduleId, lessonId);
  return prioritizePoolForAttempt(pool, nonce, "concept_gate", history.conceptGateUsedIds || [], history.conceptGateLastIds || []);
}

function writeConceptGateAttemptHistory(moduleId: string, lessonId: string, lesson: UnknownRecord, askedIds: string[]): void {
  const availableIds = poolIds(conceptGateBank(lesson));
  if (availableIds.length === 0) return;

  const history = readAttemptHistory(moduleId, lessonId);
  const merged = mergeAttemptIds(availableIds, history.conceptGateUsedIds || [], askedIds);
  if (merged.lastIds.length === 0) return;

  writeAttemptHistory(moduleId, lessonId, {
    ...history,
    conceptGateLastIds: merged.lastIds,
    conceptGateUsedIds: merged.usedIds,
  });
}

function masteryPoolForAttempt(moduleId: string, lessonId: string, lesson: UnknownRecord, nonce: unknown): UnknownRecord[] {
  const pool = masteryItems(lesson).map(asRecord);
  const history = readAttemptHistory(moduleId, lessonId);
  return prioritizePoolForAttempt(pool, nonce, "mastery", history.masteryUsedIds || [], history.masteryLastIds || []);
}

function writeMasteryAttemptHistory(moduleId: string, lessonId: string, lesson: UnknownRecord, askedIds: string[]): void {
  const availableIds = poolIds(masteryItems(lesson));
  if (availableIds.length === 0) return;

  const history = readAttemptHistory(moduleId, lessonId);
  const merged = mergeAttemptIds(availableIds, history.masteryUsedIds || [], askedIds);
  if (merged.lastIds.length === 0) return;

  writeAttemptHistory(moduleId, lessonId, {
    ...history,
    masteryLastIds: merged.lastIds,
    masteryUsedIds: merged.usedIds,
  });
}

function freshAttemptSeed(): number {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

function firstStageForLesson(lesson: UnknownRecord): string {
  return itemsFrom(lesson, "diagnostic").length > 0 ? "diagnostic" : "scaffolded_teaching";
}

function completedStageKeys(runnerLesson: UnknownRecord): string[] {
  return asList(runnerLesson.stages)
    .map(asRecord)
    .filter((entry) => entry.completed === true)
    .map((entry) => text(entry.key))
    .filter(Boolean);
}

function stageRowForKey(runnerLesson: UnknownRecord, key: string): UnknownRecord | undefined {
  return asList(runnerLesson.stages)
    .map(asRecord)
    .find((entry) => text(entry.key) === key);
}

function availableStageKeys(lesson: UnknownRecord, runnerLesson: UnknownRecord): string[] {
  const stageRows = asList(runnerLesson.stages)
    .map(asRecord)
    .filter((entry) => entry.available !== false)
    .map((entry) => text(entry.key))
    .filter(Boolean);

  if (stageRows.length > 0) {
    return stageRows;
  }

  const orderedStages = [
    ...(firstStageForLesson(lesson) === "diagnostic" ? ["diagnostic"] : []),
    "scaffolded_teaching",
    "concept_gate",
    "simulation",
    "reflection",
    "mastery_check",
  ];

  return orderedStages.filter((stage) => {
    if (stage === "diagnostic") return itemsFrom(lesson, "diagnostic").length > 0;
    if (stage === "scaffolded_teaching") {
      const phaseMap = phases(lesson);
      return Boolean(
        text(asRecord(phaseMap.analogical_grounding).analogy_text) ||
        asList(asRecord(phaseMap.analogical_grounding).micro_prompts).length > 0 ||
        asList(asRecord(phaseMap.concept_reconstruction).prompts).length > 0 ||
        asList(asRecord(phaseMap.concept_reconstruction).capsules).length > 0
      );
    }
    if (stage === "concept_gate") return conceptGateBank(lesson).length > 0;
    if (stage === "simulation") return Boolean(text(asRecord(phases(lesson).simulation_inquiry).lab_id));
    if (stage === "reflection") {
      const reconstruction = asRecord(phases(lesson).concept_reconstruction);
      return (
        asList(reconstruction.prompts).length > 0 ||
        asList(reconstruction.capsules).map(asRecord).some((capsule) => Boolean(text(capsule.prompt)))
      );
    }
    if (stage === "mastery_check") return itemsFrom(lesson, "transfer").length > 0;
    return false;
  });
}

function inferredStageFromServerProgress(lesson: UnknownRecord, runnerLesson: UnknownRecord): string | null {
  const completed = new Set(completedStageKeys(runnerLesson));
  const orderedStages = availableStageKeys(lesson, runnerLesson);

  for (const stage of orderedStages) {
    if (!completed.has(stage)) {
      return stage;
    }
  }

  return orderedStages.includes("mastery_check") && completed.has("mastery_check") ? "done" : null;
}

function runnerStageIndex(stage: string): number {
  return ["diagnostic", "scaffolded_teaching", "concept_gate", "simulation", "reflection", "mastery_check", "done"].indexOf(stage);
}

function hasProgressBeforeMastery(runnerLesson: UnknownRecord, state: LocalState): boolean {
  const diagnosticProgress = Boolean(
    state.diagnostic?.complete ||
    (state.diagnostic?.askedIds?.length || 0) > 0 ||
    Object.keys(state.diagnostic?.answers || {}).length > 0 ||
    state.diagnostic?.recentFeedback
  );

  return completedStageKeys(runnerLesson).some((key) =>
    key === "diagnostic" ||
    key === "scaffolded_teaching" ||
    key === "concept_gate" ||
    key === "simulation" ||
    key === "reflection"
  ) || Boolean(diagnosticProgress || state.conceptGate?.submitted || state.reflection?.submitted);
}

function shouldInjectConceptGate(
  lesson: UnknownRecord,
  runnerLesson: UnknownRecord,
  serverStage: string,
  state: LocalState,
): boolean {
  const conceptGateRow = stageRowForKey(runnerLesson, "concept_gate");
  const serverBackedConceptGate =
    text(conceptGateRow?.key) === "concept_gate" && conceptGateRow?.available !== false;
  const localConceptGateReady = Boolean(state.profile?.conceptGateReady);
  const stageIndex = runnerStageIndex(serverStage);

  return (
    !serverBackedConceptGate &&
    !localConceptGateReady &&
    conceptGateBank(lesson).length > 0 &&
    stageIndex > runnerStageIndex("concept_gate") &&
    stageIndex < runnerStageIndex("done")
  );
}

function mcItem(id: string, prompt: string, choices: string[], answerIndex: number, hint: string, explanation: string): UnknownRecord {
  return {
    id,
    prompt,
    choices,
    answer_index: answerIndex,
    hint,
    feedback: choices.map((_, index) => (index === answerIndex ? explanation : hint)),
  };
}

function shortItem(id: string, prompt: string, acceptedAnswers: string[], hint: string): UnknownRecord {
  return {
    id,
    prompt,
    choices: [],
    accepted_answers: acceptedAnswers,
    hint,
    feedback: [hint],
  };
}

function lessonCode(lesson: UnknownRecord, runnerLesson: UnknownRecord = {}): string {
  return normalizeLessonId(lesson.lesson_id || lesson.id || runnerLesson.lesson_id || runnerLesson.id)
    .toUpperCase();
}

function hasMeaningfulFeedback(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return !["correct", "correct.", "no", "no.", "incorrect", "incorrect.", "incomplete", "incomplete.", "review the lesson idea and try again", "review the lesson idea and try again.", "review this idea carefully before trying again", "review this idea carefully before trying again."].includes(normalized);
}

function hash(input: string): number {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function shuffle<T>(items: T[], seed: string): T[] {
  return [...items]
    .map((item, index) => ({ item, order: hash(`${seed}:${index}:${JSON.stringify(item)}`) }))
    .sort((left, right) => left.order - right.order)
    .map((entry) => entry.item);
}

function optionValue(index: number): string {
  return LETTERS[index] || String(index + 1);
}

function valueIndex(value: unknown): number {
  const raw = text(value).toUpperCase();
  const letterIndex = LETTERS.indexOf(raw);
  if (letterIndex >= 0) return letterIndex;
  const numeric = Number.parseInt(raw, 10);
  return Number.isFinite(numeric) ? numeric : -1;
}

function normalizePromptKey(value: unknown): string {
  return text(value)
    .replace(/^(Try the same lesson idea in a fresh context: |Apply the same lesson idea in a new check: |Use the rule carefully here: |Try the concept again in a fresh question: |Use the lesson idea one more time here: )/i, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOpenAnswer(value: unknown): string {
  return text(value)
    .replace(/^(Try the same lesson idea in a fresh context: |Apply the same lesson idea in a new check: |Use the rule carefully here: |Try the concept again in a fresh question: |Use the lesson idea one more time here: )/i, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/,/g, "")
    .replace(/[\u00B1]/g, "+/-")
    .replace(/joules?/g, "j")
    .replace(/metres?/g, "m")
    .replace(/meters?/g, "m")
    .replace(/newtons?/g, "n")
    .replace(/kilograms?/g, "kg")
    .replace(/grams?/g, "g")
    .replace(/watts?/g, "w")
    .replace(/m\/s\/s/g, "m/s^2")
    .replace(/[^a-z0-9.+\-^/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactOpenAnswer(value: unknown): string {
  return normalizeOpenAnswer(value).replace(/\s+/g, "");
}

function numericAnswer(value: unknown): number | null {
  const raw = compactOpenAnswer(value);
  if (!raw) return null;
  const match = raw.match(/^[-+]?\d*\.?\d+$/);
  return match ? Number.parseFloat(match[0]) : null;
}

function fallbackMeta(item: UnknownRecord): FallbackAnswerMeta | undefined {
  const itemId = text(item.id);
  const promptKey = normalizePromptKey(item.prompt);
  if (itemId === "F1-L2-D1") {
    return { id: "F1-L2-D1", answerIndex: 2, correctAnswer: "displacement", explanation: "Displacement is a vector because it has both size and direction.", teachingFocus: "Vectors need magnitude and direction, while scalars only need magnitude.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (itemId === "F1-L2-D2") {
    return { id: "F1-L2-D2", answerIndex: 2, correctAnswer: "Vectors have magnitude and direction", explanation: "A vector combines size and direction.", teachingFocus: "Do not treat vectors and scalars as interchangeable descriptions.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (itemId === "F1-L2-T1") {
    return { id: "F1-L2-T1", answerIndex: 1, correctAnswer: "Vector", explanation: "The direction east makes it a vector.", teachingFocus: "Direction is the feature that turns a scalar description into a vector one.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (
    (itemId === "F1L3_D1" || itemId === "F1-L3-D1") &&
    promptKey === "a ruler s smallest division is 1 mm a reasonable reported uncertainty is closest to"
  ) {
    return { id: "F1L3_D1", answerIndex: 1, correctAnswer: "+/- 0.5 mm", explanation: "+/- 0.5 mm is reasonable because a common estimate is about half of the smallest 1 mm division.", teachingFocus: "For a simple scale reading, a reasonable uncertainty is often about half the smallest division.", misconceptionTag: "uncertainty_estimation" };
  }
  if (
    (itemId === "F1L3_D2" || itemId === "F1-L3-D2") &&
    promptKey === "if you consistently read too high due to a zero error this is best described as"
  ) {
    return { id: "F1L3_D2", answerIndex: 1, correctAnswer: "systematic error", explanation: "This is systematic error because the same zero error shifts every reading in the same direction.", teachingFocus: "Systematic error pushes measurements the same way each time, often because of zero error or poor calibration.", misconceptionTag: "random_vs_systematic_error" };
  }
  if (
    (itemId === "F1L3_T2" || itemId === "F1-L3-T2") &&
    promptKey === "a scale has 0 2 cm divisions what is a reasonable uncertainty to report"
  ) {
    return { id: "F1-L3-T2", acceptedAnswers: ["0.1 cm", "+/- 0.1 cm"], correctAnswer: "+/- 0.1 cm", explanation: "A reasonable uncertainty is often half the smallest division, so 0.2 cm divisions suggest +/- 0.1 cm.", teachingFocus: "Estimate uncertainty from the instrument scale instead of inventing extra precision.", misconceptionTag: "uncertainty_estimation" };
  }
  if (
    (itemId === "F1L4_D1" || itemId === "F1-L4-D1") &&
    promptKey === "how many significant figures are in 0 00450"
  ) {
    return { id: "F1L4_D1", answerIndex: 1, correctAnswer: "3", explanation: "0.00450 has 3 significant figures because the leading zeros do not count, but the trailing zero after the decimal does count.", teachingFocus: "Count significant figures from the first non-zero digit; leading zeros only place the decimal point, but trailing zeros after a decimal can show real precision.", misconceptionTag: "significant_figures" };
  }
  if (
    (itemId === "F1L4_D2" || itemId === "F1-L4-D2") &&
    promptKey === "round 12 349 to 3 significant figures"
  ) {
    return { id: "F1L4_D2", answerIndex: 0, correctAnswer: "12.3", explanation: "12.349 rounds to 12.3 to 3 significant figures because you keep 1, 2, and 3, then the next digit 4 leaves the 3 unchanged.", teachingFocus: "For significant figures, keep the required digits and use the next digit only to decide whether to round up.", misconceptionTag: "rounding_rules" };
  }
  if (
    (itemId === "F1L4_T1" || itemId === "F1-L4-T1") &&
    promptKey === "calculate 2 5 3 42 and report the result with correct significant figures"
  ) {
    return { id: "F1-L4-T1", acceptedAnswers: ["8.6"], correctAnswer: "8.6", explanation: "2.5 x 3.42 = 8.55, which rounds to 8.6 because the result should keep 2 significant figures.", teachingFocus: "In multiplication and division, the result usually keeps the same number of significant figures as the least precise measurement.", misconceptionTag: "significant_figures" };
  }
  if (
    (itemId === "F1L6_D1" || itemId === "F1-L6-D1") &&
    promptKey === "a set of measurements are very close to each other but far from the true value this is"
  ) {
    return { id: "F1L6_D1", answerIndex: 1, correctAnswer: "precise but not accurate", explanation: "The measurements are tightly grouped, so they are precise, but they are far from the true value, so they are not accurate.", teachingFocus: "Precision is about closeness among repeated readings, while accuracy is about closeness to the accepted or true value.", misconceptionTag: "precision_vs_accuracy" };
  }
  if (
    (itemId === "F1L6_D2" || itemId === "F1-L6-D2") &&
    promptKey === "give one source of systematic error and one source of random error in a measurement"
  ) {
    return { id: "F1L6_D2", acceptedAnswers: ["Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", "Systematic: zero error. Random: reaction time.", "Systematic: poor calibration. Random: reading fluctuations."], correctAnswer: "Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", explanation: "A strong answer names one cause that shifts readings the same way each time and one cause that makes readings scatter from trial to trial.", teachingFocus: "Systematic error adds a consistent bias, while random error causes scatter between repeated readings.", misconceptionTag: "random_vs_systematic_error" };
  }
  if (
    (itemId === "F1L6_T1" || itemId === "F1-L6-T1") &&
    promptKey === "you measure length as 12 4 cm with a ruler of 1 mm divisions report the value with a reasonable uncertainty"
  ) {
    return { id: "F1L6_T1", acceptedAnswers: ["12.4 +/- 0.05 cm", "12.4 cm +/- 0.05 cm", "12.4 cm +/- 0.05", "12.40 +/- 0.05 cm", "12.40 cm +/- 0.05 cm", "12.40 cm +/- 0.05"], correctAnswer: "12.4 +/- 0.05 cm", explanation: "A ruler with 1 mm divisions supports about +/- 0.05 cm uncertainty, so 12.4 cm should be reported with that uncertainty.", teachingFocus: "Report the measured value with a reasonable uncertainty based on the instrument's smallest division.", misconceptionTag: "uncertainty_estimation" };
  }
  if (itemId === "F1-L2-C1") {
    return { id: "F1-L2-C1", answerIndex: 2, correctAnswer: "distance", explanation: "Distance only needs size, so it is scalar.", teachingFocus: "Scalars tell how much, not which way.", misconceptionTag: "vector_scalar_confusion" };
  }
  return FALLBACK_ANSWER_METADATA[normalizePromptKey(item.prompt)];
}

function canonicalAssessmentOverride(item: UnknownRecord): UnknownRecord | null {
  const promptKey = normalizePromptKey(item.prompt);

  if (promptKey === "which tool is most suitable for measuring the thickness of a sheet of card") {
    const choices = ["metre rule", "kitchen scale", "caliper", "micrometer screw gauge"];
    const answerIndex = 3;
    const hint = "A very small thickness needs the finest suitable length tool.";
    const explanation = "A micrometer screw gauge is best because the card is very thin and needs the finest suitable resolution.";
    return {
      ...item,
      id: text(item.id) || "F1L3_D1",
      prompt: "Which tool is most suitable for measuring the thickness of a sheet of card?",
      choices,
      answer_index: answerIndex,
      hint,
      feedback: choices.map((_, index) => (index === answerIndex ? explanation : hint)),
      correct_answer: choices[answerIndex],
    };
  }

  return null;
}

function includesAnyPhrase(source: string, phrases: string[]): boolean {
  return phrases.some((phrase) => source.includes(normalizeOpenAnswer(phrase)));
}

function customShortAnswerMatch(item: UnknownRecord, answer: unknown): boolean | null {
  const itemId = text(item.id);
  const promptKey = normalizePromptKey(item.prompt);
  const candidate = normalizeOpenAnswer(answer);
  if (!candidate) return false;

  const isRepeatedTrustPrompt =
    itemId === "F1-L3-M8" ||
    promptKey === "name one reason repeated measurements improve trust in a result";

  if (isRepeatedTrustPrompt) {
    return includesAnyPhrase(candidate, [
      "shows variation",
      "show variation",
      "shows how much the readings vary",
      "show how much the readings vary",
      "shows the spread",
      "show the spread",
      "shows consistency",
      "show consistency",
      "estimate uncertainty",
      "average the readings",
      "average out random error",
      "reduce random error",
      "reduce the effect of random error",
      "spot anomalous readings",
      "spot outliers",
      "identify outliers",
      "identify anomalous readings",
    ]);
  }

  const isAdditionDecimalRulePrompt =
    itemId === "F1-L4-M8" ||
    promptKey === "state the addition and subtraction rule for significant figures in a few words";

  if (isAdditionDecimalRulePrompt) {
    const hasDecimalIdea = includesAnyPhrase(candidate, [
      "decimal place",
      "decimal places",
      "decimal point",
      "decimal points",
      "least precise decimal place",
      "least precise decimal places",
    ]);
    const hasLeastIdea = includesAnyPhrase(candidate, [
      "least",
      "fewest",
      "smallest",
      "least precise",
    ]);
    return hasDecimalIdea && hasLeastIdea;
  }

  const isLessonSixErrorPrompt =
    itemId === "F1L6_D2" ||
    itemId === "F1-L6-D2" ||
    promptKey === "give one source of systematic error and one source of random error in a measurement";

  if (!isLessonSixErrorPrompt) return null;

  const systematicPhrases = [
    "zero error",
    "poor calibration",
    "bad calibration",
    "miscalibration",
    "instrument not zeroed",
    "constant offset",
    "bias",
  ];
  const randomPhrases = [
    "reaction time",
    "human reaction",
    "reading fluctuation",
    "reading fluctuations",
    "small reading differences",
    "scatter",
    "noise",
    "vibration",
  ];

  return includesAnyPhrase(candidate, systematicPhrases) && includesAnyPhrase(candidate, randomPhrases);
}

function resolvedItemId(item: UnknownRecord, key: string, index: number): string {
  const explicitId = text(item.id);
  if (explicitId) return explicitId;

  const meta = fallbackMeta(item);
  if (meta?.id) return meta.id;

  const promptKey = normalizePromptKey(item.prompt).replace(/\s+/g, "_").slice(0, 36);
  return `${normalizeLessonId(key)}_${index + 1}_${promptKey || "item"}`;
}

function withResolvedItem(item: UnknownRecord, key: string, index: number): UnknownRecord {
  const canonical = canonicalAssessmentOverride(item);
  const normalized = canonical ? { ...item, ...canonical } : item;
  return {
    ...normalized,
    id: resolvedItemId(normalized, key, index),
  };
}

function phases(lesson: UnknownRecord): UnknownRecord {
  return asRecord(lesson.phases);
}

function itemsFrom(lesson: UnknownRecord, key: string): UnknownRecord[] {
  return asList(asRecord(phases(lesson)[key]).items).map((entry, index) =>
    withResolvedItem(asRecord(entry), key, index)
  );
}

function generatedDiagnosticItems(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  if (code.startsWith("M2_")) return m2GeneratedDiagnosticItems(code);
  switch (code) {
    case "F2_L1":
      return [
        mcItem("F2-L1-DG1", "A learner walks 16 m east and then 16 m west. Which quantity is zero at the end?", ["distance", "displacement", "average speed", "time"], 1, "A round trip finishes where it started.", "The displacement is zero because the learner finishes back at the starting point."),
        shortItem("F2-L1-DG2", "A scooter covers 150 m in 30 s. What is the average speed?", ["5", "5 m/s"], "Use total distance divided by total time."),
        mcItem("F2-L1-DG3", "A walker goes 20 m north and then 5 m south. What is the displacement?", ["15 m north", "15 m", "25 m north", "25 m"], 0, "Displacement keeps the net change and the direction.", "The walker finishes 15 m north of the start, so the displacement is 15 m north."),
      ];
    case "F2_L2":
      return [
        mcItem("F2-L2-DG1", "A car moves at constant speed around a bend. Why can its acceleration be non-zero?", ["Because its direction is changing", "Because its mass is changing", "Because time has stopped", "Because speed is a vector"], 0, "A change in direction still changes velocity.", "Acceleration can be non-zero because turning changes the direction of the velocity."),
        shortItem("F2-L2-DG2", "Velocity changes from -1 m/s to 5 m/s in 2 s. What is the acceleration?", ["3 m/s^2", "3 m/s/s"], "Use change in velocity divided by time."),
        mcItem("F2-L2-DG3", "What does a negative acceleration sign tell you by itself?", ["It points in the chosen negative direction", "The object must be slowing down", "The object must move backward", "The speed must be zero"], 0, "The sign shows direction relative to the chosen positive direction.", "A negative acceleration sign only tells you that the acceleration points in the chosen negative direction."),
      ];
    case "F2_L3":
      return [
        mcItem("F2-L3-DG1", "On a distance-time graph, what does the graph height at 8 s show?", ["the speed at 8 s", "the total distance covered by 8 s", "the acceleration at 8 s", "the direction of motion"], 1, "Graph height on a distance-time graph is distance, not speed.", "The graph height shows how much distance has been covered by that time."),
        shortItem("F2-L3-DG2", "A distance-time graph is flat from 2 s to 6 s. For how long is the object stopped?", ["4", "4 s"], "Use the time interval covered by the flat section."),
        mcItem("F2-L3-DG3", "Two straight sections have the same steepness on a distance-time graph. What does that mean?", ["the object moved with the same speed in both sections", "the object was stopped in both sections", "the object moved backwards in one section", "the object covered the same total distance in both sections"], 0, "Equal slope means equal speed on a distance-time graph.", "The same steepness means the same speed because slope represents speed."),
      ];
    case "F2_L4":
      return [
        mcItem("F2-L4-DG1", "What does a section below the time axis mean on a velocity-time graph?", ["velocity in the chosen negative direction", "zero time", "negative mass", "negative displacement only"], 0, "Below the time axis means negative velocity in the chosen sign convention.", "A section below the time axis shows velocity in the chosen negative direction."),
        shortItem("F2-L4-DG2", "An object moves at 5 m/s for 6 s. What displacement is shown by the graph area?", ["30 m"], "For constant velocity, displacement is velocity multiplied by time."),
        mcItem("F2-L4-DG3", "If one section of a velocity-time graph has a steeper slope than another, what does that mean?", ["The acceleration magnitude is larger on the steeper section", "The displacement must be smaller on the steeper section", "The object is stopped on the steeper section", "The mass is larger on the steeper section"], 0, "Slope on a velocity-time graph tells you acceleration.", "A steeper slope means the velocity is changing faster, so the acceleration magnitude is larger."),
      ];
    case "F2_L5":
      return [
        mcItem("F2-L5-DG1", "Two forces of 4 N and 7 N both act to the right. What is the resultant force?", ["3 N right", "7 N right", "11 N right", "0 N"], 2, "Forces in the same direction add together.", "The resultant force is 11 N right because same-direction forces add."),
        shortItem("F2-L5-DG2", "14 N right and 9 N left act on a box. What is the resultant force?", ["5 N right"], "Subtract opposite forces and keep the direction of the larger side."),
        mcItem("F2-L5-DG3", "If a moving object has zero resultant force, what can it do?", ["keep moving at constant velocity", "speed up by itself", "reverse direction automatically", "lose its mass"], 0, "Zero resultant force means zero acceleration.", "A moving object can keep moving at constant velocity when the resultant force is zero."),
      ];
    case "F2_L6":
      return [
        mcItem("F2-L6-DG1", "Which force should be used in F = ma?", ["the resultant force", "the smallest force only", "the friction force only", "the first force listed"], 0, "F = ma uses the net force after all forces are combined.", "You must use the resultant force in F = ma."),
        shortItem("F2-L6-DG2", "An 18 N resultant force acts on a 6 kg trolley. What is the acceleration?", ["3 m/s^2", "3 m/s/s"], "Use a = F / m."),
        mcItem("F2-L6-DG3", "If the same force acts on two trolleys and one trolley has three times the mass, how does its acceleration compare?", ["it is one-third as large", "it is three times as large", "it stays the same", "it becomes zero"], 0, "For the same force, larger mass gives smaller acceleration.", "If the mass is three times larger under the same force, the acceleration is one-third as large."),
      ];
    case "M1_L1":
      return [
        mcItem("M1L1_D6", "A progress log that curves upward more steeply most strongly suggests that...", ["the avatar's pace is increasing", "the lane itself becomes steeper", "time is speeding up", "the graph has become a map"], 0, "Think about how the slope changes from one beat to the next.", "An upward-curving progress log suggests the pace is increasing because each later segment becomes steeper."),
        mcItem("M1L1_D7", "Two avatars have the same progress score at 10 s. What can still be different?", ["their pace histories", "the recorded time", "the final progress score", "the fact that one of them moved"], 0, "Same finishing progress does not fix the whole motion story.", "They can share the same progress score at 10 s while having different pace histories on the way there."),
        shortItem("M1L1_D8", "A mission log rises by 18 m in 6 s on one straight segment. What pace does that segment show?", ["3", "3 m/s"], "Use change in distance divided by change in time for that segment."),
      ];
    case "M1_L2":
      return [
        mcItem("M1L2_D6", "A flat pace log at 7 m/s means the avatar is...", ["moving at constant speed", "stopped", "speeding up", "changing direction each second"], 0, "Flat above zero is not rest.", "A flat pace log at 7 m/s means the avatar keeps moving at a constant speed of 7 m/s."),
        mcItem("M1L2_D7", "Two pace logs have the same height at 4 s, but one is steeper. Which statement is correct?", ["They have the same speed then but different acceleration", "They have different speed and the same acceleration", "They must show the same motion story", "The steeper one must be slower then"], 0, "Height and slope answer different questions.", "Equal height at that instant means equal speed then, but the steeper graph has the larger acceleration."),
        shortItem("M1L2_D8", "A pace log rises from 2 m/s to 8 m/s in 3 s. What is the acceleration?", ["2", "2 m/s^2", "2 m/s/s"], "Use change in speed divided by time."),
      ];
    case "M1_L3":
      return [
        mcItem("M1L3_D6", "Velocity changes from -5 m/s to +1 m/s in 3 s. The acceleration is...", ["positive", "negative", "zero", "impossible to tell"], 0, "Look at the signed change in velocity.", "The velocity increases by 6 m/s overall, so the acceleration is positive."),
        mcItem("M1L3_D7", "Which situation can show negative acceleration while the avatar speeds up?", ["moving in the negative direction and becoming more negative", "moving in the positive direction and becoming less positive", "stopped for the whole interval", "moving in the positive direction with zero acceleration"], 0, "Speeding up depends on both the velocity sign and the acceleration sign.", "If the motion is already negative and the acceleration is negative too, the speed can increase while the acceleration stays negative."),
        shortItem("M1L3_D8", "Velocity changes from +6 m/s to -2 m/s in 4 s. What is the acceleration?", ["-2", "-2 m/s^2", "-2 m/s/s"], "Find the signed velocity change first, then divide by time."),
      ];
    case "M1_L4":
      return [
        mcItem("M1L4_D6", "Why is s = (u + v) / 2 x t trustworthy for this lesson's motion stories?", ["Because constant acceleration makes average velocity the midpoint between u and v", "Because it works for any changing acceleration", "Because time does not matter in kinematics", "Because u and v are always equal"], 0, "Think about the condition behind the equation.", "Under constant acceleration, the average velocity is the midpoint between u and v, so multiplying by time gives the displacement."),
        mcItem("M1L4_D7", "If u, a, and t are known and s is required, which equation is the direct choice?", ["s = ut + 1/2at^2", "v = u + at", "a = (v - u) / t", "s = (u + v) / 2 x t with no other work"], 0, "Choose the relation that uses only the knowns and the unknown.", "s = ut + 1/2at^2 is the direct choice because it links u, a, t, and s without introducing another unknown first."),
        shortItem("M1L4_D8", "For a constant-acceleration run, u = 5 m/s, a = 3 m/s^2, and t = 4 s. What is v?", ["17", "17 m/s"], "Use v = u + at because the acceleration is constant."),
      ];
    case "M1_L5":
      return [
        mcItem("M1L5_D6", "Zero slope on a progress log means that the avatar is...", ["stopped", "moving at constant speed", "speeding up", "reversing"], 0, "Progress is not changing while time passes.", "Zero slope on a progress log means distance is not changing, so the avatar is stopped."),
        mcItem("M1L5_D7", "Zero slope on a pace log means that the avatar is...", ["stopped for sure", "moving with constant speed or at rest", "speeding up steadily", "reversing every second"], 1, "The pace is not changing, but it might still be above zero.", "Zero slope on a pace log means the speed is constant, which can describe steady motion or rest."),
        shortItem("M1L5_D8", "A straight progress-log segment rises by 15 m in 5 s. What pace does that slope represent?", ["3", "3 m/s"], "On a progress log, slope is change in distance divided by time."),
      ];
    case "M1_L6":
      return [
        mcItem("M1L6_D6", "Why does the area rule not transfer directly to a distance-time graph?", ["Because the axes are different", "Because area never has meaning in physics", "Because distance-time graphs have no slope", "Because time disappears on that graph"], 0, "Area meaning depends on what the axes measure.", "The area rule belongs to speed-time graphs because the axes are speed and time; changing the axes changes the meaning."),
        mcItem("M1L6_D7", "Two pace logs enclose the same total area but have different peaks. Which statement is correct?", ["They show the same total distance but not the same speed story", "They must show the same speed at every instant", "The graph with the higher peak always gives more distance", "Area is irrelevant once the peaks differ"], 0, "Equal area secures equal total distance, not identical motion at each instant.", "Equal area means equal total distance, even though the speed story can still differ from one graph to another."),
        shortItem("M1L6_D8", "A pace log is a rectangle 5 m/s high and 6 s wide. What distance does the area show?", ["30", "30 m"], "Rectangle area on a speed-time graph is speed multiplied by time."),
      ];
    case "F4_L1":
      return [
        mcItem("F4-L1-DG1", "In a closed single-loop circuit, what is the current after one lamp compared with the current before it?", ["the same current", "smaller because the lamp used some current", "zero current", "greater current"], 0, "One complete route keeps the same charge stream rate at every checkpoint.", "The current is the same because a simple closed loop carries one common charge stream."),
        mcItem("F4-L1-DG2", "What does current measure in a circuit?", ["how much charge passes a point each second", "how much energy each charge carries", "how hard the route is", "how much charge is stored in a lamp"], 0, "Current is a flow rate, not stored charge or energy per charge.", "Current measures how much charge passes a point each second."),
        mcItem("F4-L1-DG3", "Why can a lamp get hot even though the current is the same before and after it?", ["It transfers electrical energy while the same charge keeps flowing", "It creates extra charge inside the lamp", "It stores current and releases it later", "It removes charge from the loop"], 0, "Separate charge flow from energy transfer.", "The lamp transfers electrical energy even though the same charge continues flowing through the loop."),
        mcItem("F4-L1-DG4", "If a switch opens anywhere in one simple loop, what happens to the current?", ["it stops everywhere in the loop", "it only stops after the switch", "it doubles before the switch", "it keeps flowing through the lamp only"], 0, "Breaking one single route stops the charge stream everywhere.", "The current stops everywhere because the whole loop is broken."),
        mcItem("F4-L1-DG5", "Two loops move the same 12 C of charge. Loop A takes 3 s and Loop B takes 6 s. Which loop has the greater current?", ["Loop A", "Loop B", "both have the same current", "you need the resistance first"], 0, "Current compares how much charge passes each second.", "Loop A has the greater current because the same charge passes in less time."),
        shortItem("F4-L1-DG6", "18 C of charge pass a checkpoint in 6 s. What current flows?", ["3 A", "3a", "3"], "Use current = charge / time."),
      ];
    case "F4_L2":
      return [
        shortItem("F4-L2-DG1", "20 J are transferred to 4 C of charge. What is the potential difference?", ["5 V"], "Use V = E / Q to find energy transferred per charge."),
        mcItem("F4-L2-DG2", "If the same charge passes through a source with a larger potential difference, what changes?", ["each coulomb gains more energy", "more charge must exist in the circuit", "the resistance becomes zero", "the current must stop"], 0, "Potential difference tells you the energy transferred per charge.", "A larger potential difference means each coulomb gains more energy."),
        mcItem("F4-L2-DG3", "If the potential difference stays the same but twice as much charge moves, what happens to the total energy transferred?", ["it doubles", "it stays the same", "it halves", "it becomes zero"], 0, "Total energy depends on both volts and charge moved.", "The total energy transferred doubles because E = VQ."),
      ];
    case "F4_L3":
      return [
        mcItem("F4-L3-DG1", "In the Flow-Grid model, what does resistance represent?", ["how much charge is stored", "how hard the path is for charge to move through", "how much energy each charge gains", "how long the battery lasts"], 1, "Resistance is about route difficulty, not stored charge or battery life.", "In the Flow-Grid model, resistance represents how hard the path is for charge to move through."),
        mcItem("F4-L3-DG2", "If the same push acts on two ohmic routes, which route gives the greater current?", ["the harder route", "the easier route", "both give the same current", "the one with the larger battery mass"], 1, "At the same push, the easier path gives the greater stream rate.", "With the same push, the easier route gives the greater current."),
        mcItem("F4-L3-DG3", "On a straight I-V graph through the origin, which line shows the greater resistance?", ["the flatter line", "the steeper line", "they are always equal", "the higher-voltage line"], 0, "More current per volt means less resistance, not more.", "The flatter straight line shows the greater resistance because it gives less current for each volt."),
        mcItem("F4-L3-DG4", "What does a straight I-V graph through the origin show for an ohmic component?", ["current is proportional to voltage", "resistance gets used up", "current stays fixed whatever the voltage", "voltage depends on time only"], 0, "A straight line through the origin shows direct proportionality.", "For an ohmic component, a straight line through the origin shows that current is proportional to voltage."),
        mcItem("F4-L3-DG5", "If the voltage across an ohmic resistor doubles while the resistance stays the same, what happens to the current?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "At fixed resistance, current changes in step with voltage.", "The current doubles because I = V / R for an ohmic resistor."),
        mcItem("F4-L3-DG6", "If the same voltage acts across two resistors and one gives less current, what must be true?", ["it has the lower resistance", "it has the higher resistance", "it must be non-ohmic", "it must be storing charge"], 1, "At the same voltage, less current means a harder path.", "If the voltage is the same and the current is smaller, that resistor has the higher resistance."),
      ];
    case "F4_L4":
      return [
        mcItem("F4-L4-X1", "In a series circuit, the current in one component compared with the current in the next component is...", ["the same", "always larger", "always smaller", "zero in the second component"], 0, "One route means one stream rate everywhere in the loop.", "The current is the same in each component of a series circuit."),
        mcItem("F4-L4-X2", "What happens to total resistance when resistors are added in series?", ["It decreases", "It stays the same", "It adds up", "It becomes zero"], 2, "Series difficulties stack along one route.", "In series, resistances add together."),
        mcItem("F4-L4-X3", "Why does adding another resistor in series usually make every lamp in the loop dimmer?", ["The battery voltage disappears", "The total resistance rises so the current falls everywhere", "Each resistor creates extra current", "Current stops depending on resistance"], 1, "A one-route network responds as a whole when the route gets harder.", "Adding another resistor in series raises the total resistance, so the current falls everywhere in the loop."),
        mcItem("F4-L4-X4", "If you add another resistor in series to the same battery, what happens to the current everywhere in the loop?", ["It increases everywhere", "It decreases everywhere", "It stays the same everywhere", "It only changes after the new resistor"], 1, "One-path circuits respond as a whole network.", "Adding resistance in series reduces the current everywhere in the loop."),
        mcItem("F4-L4-X5", "Two equal resistors are connected in series across a battery. How is the battery voltage shared?", ["equally between the resistors", "all across the first resistor", "all across the second resistor", "voltage is not shared in series"], 0, "Equal components in series share the source push equally.", "Equal resistors in series share the battery voltage equally."),
        mcItem("F4-L4-X6", "Two identical lamps are connected in series to one battery. Why are they usually dimmer than one lamp on the same battery?", ["They share the supply voltage and the total current is lower", "Potential difference cannot exist in series", "Each lamp creates extra current", "The current doubles through both lamps"], 0, "In series, identical lamps share the push and the one-route current is lower.", "Identical lamps in series share the supply voltage and the total current is lower, so each lamp is dimmer."),
        mcItem("F4-L4-X7", "What happens to the whole series circuit if one lamp breaks and opens the path?", ["Only the broken lamp turns off", "Current keeps flowing around the rest of the loop", "The whole loop stops because the route is broken", "The battery increases its voltage to keep current flowing"], 2, "A series circuit needs one complete route.", "If one lamp breaks in series, the whole route is broken and current stops everywhere."),
        mcItem("F4-L4-X8", "Two resistors of different sizes are connected in series. Which resistor has the larger potential difference across it?", ["the larger resistor", "the smaller resistor", "they must always be equal", "you cannot compare voltages in series"], 0, "The harder section of the route takes a bigger share of the source push.", "In series, the larger resistor takes a larger share of the total potential difference."),
        mcItem("F4-L4-X9", "Which statement best describes a series circuit?", ["There is one complete route, the same current passes every component, and the supply voltage is shared", "There are several routes and current always splits equally", "Each component gets the full supply voltage and creates its own current", "The battery sends different currents to different parts of the same loop"], 0, "Pull the current rule and the voltage-sharing rule together.", "A series circuit has one complete route, the same current through each component, and a shared supply voltage."),
        mcItem("F4-L4-X10", "A student adds a second identical lamp in series and says only the new lamp should be affected. What is the best correction?", ["Only the second lamp changes because it is new", "The whole loop changes because adding difficulty affects the one route everywhere", "The battery cancels the extra resistance", "Series circuits keep the same brightness no matter how many lamps are added"], 1, "One-route networks respond together, not component by component.", "The whole loop changes because adding difficulty to a one-route circuit affects the current everywhere."),
        mcItem("F4-L4-X11", "In the Flow-Grid analogy, what does adding another gate to the same single route represent?", ["adding a branch in parallel", "reducing the battery push to zero", "adding resistance in series so the stream slows everywhere", "making charge disappear at the lamp"], 2, "Tie the analogy back to the circuit behavior directly.", "Adding another gate to the same single route represents adding resistance in series, so the stream slows everywhere."),
        mcItem("F4-L4-X12", "Why does a series circuit with more total resistance draw less current from the same battery?", ["The source push stays the same but the route becomes harder", "The battery sends less charge into the circuit each hour only", "Current can no longer pass through resistors", "Resistance changes into voltage"], 0, "Return to push divided by path difficulty.", "With the same battery push, a harder total route gives a smaller current."),
      ];
    case "F4_L5":
      return [
        mcItem("F4-L5-DG1", "What is the potential difference across each parallel branch compared with the supply?", ["the same as the supply", "half the supply", "different in every branch", "zero in one branch"], 0, "Each branch spans the same two supply points.", "Each parallel branch has the same potential difference as the supply."),
        shortItem("F4-L5-DG2", "One branch carries 0.25 A and another carries 0.35 A. What total current leaves the source?", ["0.6 A", "0.60 A"], "Add the branch currents to get the total current."),
        mcItem("F4-L5-DG3", "What usually happens to the total current when an extra branch is added in parallel?", ["it increases", "it decreases to zero", "it stays fixed", "it becomes equal to one branch current"], 0, "An extra branch gives the system another route and reduces overall difficulty.", "The total current increases because another parallel route makes the overall circuit easier for charge to flow through."),
      ];
    case "F4_L6":
      return [
        shortItem("F4-L6-DG1", "A device works at 24 V and 2 A. What power does it use?", ["48 W"], "Use power = voltage x current."),
        shortItem("F4-L6-DG2", "A 100 W device runs for 20 s. How much electrical energy is transferred?", ["2000 J", "2000"], "Use energy = power x time."),
        mcItem("F4-L6-DG3", "Two devices use the same voltage, but one draws the larger current. Which statement is correct?", ["it has the larger power", "it has the smaller power", "both have the same power", "you need the resistance first"], 0, "At fixed voltage, more current means more energy transferred each second.", "The device with the larger current has the larger power because P = VI."),
      ];
    default:
      return [];
  }
}

function diagnosticItems(lesson: UnknownRecord): UnknownRecord[] {
  const authored = itemsFrom(lesson, "diagnostic").map(asRecord);
  const preferAuthored = prefersLessonOwnedDiagnosticBank(lesson, authored.length);
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const seenPrompts = new Set<string>();
  const bank = preferAuthored ? [...authored] : [...authored, ...generatedDiagnosticItems(lesson).map(asRecord)];
  return bank.filter((item) => {
    const record = asRecord(item);
    const id = text(record.id);
    const sourceKey = masterySourceKey(record);
    const promptKey = normalizePromptKey(text(record.prompt));
    if (!id || seenIds.has(id) || (sourceKey && seenSources.has(sourceKey)) || (promptKey && seenPrompts.has(promptKey))) return false;
    seenIds.add(id);
    if (sourceKey) seenSources.add(sourceKey);
    if (promptKey) seenPrompts.add(promptKey);
    return true;
  });
}
function conceptGateItems(lesson: UnknownRecord): UnknownRecord[] {
  const capsules = asList(asRecord(phases(lesson).concept_reconstruction).capsules).map(asRecord);
  return capsules.flatMap((capsule, capsuleIndex) =>
    asList(capsule.checks).map((entry, checkIndex) =>
      withResolvedItem(asRecord(entry), `concept_gate_${capsuleIndex + 1}`, checkIndex)
    )
  );
}

function assessmentBankTargets(lesson: UnknownRecord): UnknownRecord {
  return asRecord(asRecord(lesson.authoring_contract).assessment_bank_targets);
}

function declaredAssessmentPoolMin(lesson: UnknownRecord, key: string): number {
  return Math.max(numberValue(assessmentBankTargets(lesson)[key], 0), 0);
}

function prefersLessonOwnedDiagnosticBank(lesson: UnknownRecord, authoredCount = itemsFrom(lesson, "diagnostic").length): boolean {
  const declaredMin = declaredAssessmentPoolMin(lesson, "diagnostic_pool_min");
  return declaredMin > 0 && authoredCount >= declaredMin;
}

function prefersLessonOwnedConceptGateBank(lesson: UnknownRecord, authoredCount = conceptGateItems(lesson).length): boolean {
  const declaredMin = declaredAssessmentPoolMin(lesson, "concept_gate_pool_min");
  return declaredMin > 0 && authoredCount >= declaredMin;
}

function prefersLessonOwnedMasteryBank(lesson: UnknownRecord, authoredCount = itemsFrom(lesson, "transfer").filter((item) => hasUsableMasteryAnswer(asRecord(item))).length): boolean {
  const declaredMin = declaredAssessmentPoolMin(lesson, "mastery_pool_min");
  return declaredMin > 0 && authoredCount >= declaredMin;
}

function conceptGateBank(lesson: UnknownRecord): UnknownRecord[] {
  const authoredConceptItems = conceptGateItems(lesson);
  const authoredMasteryItems = itemsFrom(lesson, "transfer").map(asRecord).filter((item) => hasUsableMasteryAnswer(item));
  const preferAuthored = prefersLessonOwnedConceptGateBank(lesson, authoredConceptItems.length);
  const baseItems = preferAuthored
    ? [...authoredConceptItems]
    : [
        ...authoredConceptItems,
        ...generatedConceptGateItems(lesson),
        ...authoredMasteryItems,
      ];
  const fallbackItems = preferAuthored || baseItems.length >= 3 ? [] : generatedMasteryItems(lesson).slice(0, 4);
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const seenPrompts = new Set<string>();
  return [...baseItems, ...fallbackItems].filter((item) => {
    const record = asRecord(item);
    const id = text(record.id);
    const sourceKey = masterySourceKey(record);
    const promptKey = normalizePromptKey(text(record.prompt));
    if (!id || seenIds.has(id) || (sourceKey && seenSources.has(sourceKey)) || (promptKey && seenPrompts.has(promptKey))) return false;
    seenIds.add(id);
    if (sourceKey) seenSources.add(sourceKey);
    if (promptKey) seenPrompts.add(promptKey);
    return true;
  });
}

function conceptGateItemForAttempt(moduleId: string, lessonId: string, lesson: UnknownRecord, nonce: unknown, retryCount: number): UnknownRecord | null {
  const ordered = conceptGatePoolForAttempt(moduleId, lessonId, lesson, nonce);
  if (ordered.length === 0) return null;
  return asRecord(ordered[retryCount % ordered.length]);
}
function lessonTitle(lesson: UnknownRecord, runnerLesson: UnknownRecord): string {
  return text(lesson.title) || text(runnerLesson.title) || normalizeLessonId(lesson.lesson_id || runnerLesson.lesson_id);
}

async function loadResources(moduleId: string, lessonId: string): Promise<LessonResources> {
  const normalized = normalizeLessonId(lessonId);
  const runnerPath = "/student/modules/" +
    encodeURIComponent(moduleId) +
    "/lessons/" +
    encodeURIComponent(normalized) +
    "/runner";
  const lessonPath = "/modules/" +
    encodeURIComponent(moduleId) +
    "/lessons/" +
    encodeURIComponent(normalized);
  const [runnerResponse, lessonResponse] = await Promise.all([
    apipGet<UnknownRecord>(runnerPath),
    apipGet<UnknownRecord>(lessonPath),
  ]);
  return { runner: runnerResponse, lesson: asRecord(lessonResponse.lesson) };
}

function question(item: UnknownRecord, seed = ""): UnknownRecord {
  const choices = asList(item.choices).map((choice) => text(choice));
  const options = seed
    ? shuffle(choices.map((label, index) => ({ value: optionValue(index), label })), seed)
    : choices.map((label, index) => ({ value: optionValue(index), label }));
  const visual = questionVisualMeta(item);
  return {
    id: text(item.id),
    prompt: text(item.prompt),
    type: choices.length > 0 ? "multiple_choice" : "short_answer",
    options,
    ...(visual || {}),
  };
}

function choiceLabel(item: UnknownRecord, answer: unknown): string | null {
  const choices = asList(item.choices).map((choice) => text(choice));
  const index = valueIndex(answer);
  return index >= 0 && index < choices.length ? choices[index] : null;
}

function multipleChoiceMatches(item: UnknownRecord, answer: unknown): boolean {
  const answerIndex = valueIndex(answer);
  if (answerIndex === resolvedAnswerIndex(item)) {
    return true;
  }

  const correctAnswer = normalizeOpenAnswer(resolvedCorrectAnswer(item));
  if (!correctAnswer) {
    return false;
  }

  const submittedChoice = normalizeOpenAnswer(choiceLabel(item, answer) || "");
  if (submittedChoice && submittedChoice === correctAnswer) {
    return true;
  }

  const rawAnswer = normalizeOpenAnswer(answer);
  return Boolean(rawAnswer) && rawAnswer === correctAnswer;
}

function teachingFocus(prompt: string, title: string): string {
  const source = `${title} ${prompt}`.toLowerCase();
  if (source.includes("work") || (source.includes("force") && source.includes("distance"))) return "Work is energy transferred by a force only when the object moves in the force direction.";
  if (source.includes("kinetic energy")) return "Kinetic energy depends on mass and speed, and speed matters more strongly because it is squared.";
  if (source.includes("gravitational potential energy") || source.includes("gpe") || (source.includes("lifted") && source.includes("height"))) return "Gravitational potential energy depends on mass, gravitational field strength, and height above the reference level.";
  if (source.includes("efficiency") || (source.includes("useful output") && source.includes("input"))) return "Efficiency compares useful output with total input, so it is about how much of the transfer is useful, not how fast it happens.";
  if (source.includes("power")) return "Power compares how quickly energy is transferred or work is done.";
  if (source.includes("impulse") || source.includes("force-time") || source.includes("force time")) return "Impulse equals force multiplied by time, and it matches the change in momentum.";
  if (source.includes("momentum")) {
    if (source.includes("conservation") || source.includes("collision") || source.includes("stick together") || source.includes("system")) {
      return "Conservation of momentum is a whole-system rule that works when external forces are negligible during the interaction.";
    }
    return "Momentum equals mass multiplied by velocity, so it must keep both size and direction.";
  }
  if (source.includes("airbag") || source.includes("crumple") || source.includes("braking") || source.includes("stopping time") || source.includes("injury risk")) return "Safer stopping comes from increasing the stopping time so the same momentum change needs a smaller average force.";
  if (source.includes("unit")) return "A scientific measurement needs both a number and a unit.";
  if (source.includes("prefix") || source.includes("kilo") || source.includes("centi") || source.includes("milli")) return "Prefixes change the size of the base unit, so conversions must keep the scale consistent.";
  if (source.includes("distance-time") || source.includes("distance time graph") || (source.includes("slope") && source.includes("distance"))) return "On a distance-time graph, slope shows speed and a flat section means the object is stopped.";
  if (source.includes("velocity-time") || source.includes("velocity time graph") || source.includes("area under") || (source.includes("slope") && source.includes("velocity"))) return "On a velocity-time graph, slope shows acceleration while area shows displacement.";
  if (source.includes("resultant force") || source.includes("balanced force") || source.includes("unbalanced force") || source.includes("net force")) return "Balanced forces give zero resultant force, while unbalanced forces change velocity in the direction of the resultant.";
  if (source.includes("seatbelt") || source.includes("inertia") || source.includes("f = ma") || (source.includes("force") && source.includes("mass"))) return "Resultant force, mass, and acceleration are linked by F = ma, and inertia resists changes in motion.";
  if (source.includes("distance") || source.includes("displacement") || source.includes("average speed")) return "Distance counts the full path, displacement keeps the start-to-finish change with direction, and average speed compares total distance with total time.";
  if (source.includes("velocity") || source.includes("acceleration") || source.includes("direction")) return "Velocity includes direction, and acceleration compares how velocity changes with time.";
  if (source.includes("accuracy") || source.includes("accepted value") || source.includes("true value")) return "Accuracy is closeness to the accepted value, while precision is closeness among repeated readings.";
  if (source.includes("systematic error") || source.includes("random error") || source.includes("zero error")) return "Systematic error shifts readings the same way each time, while random error causes scatter from one reading to the next.";
  if (source.includes("precision") || source.includes("uncertainty") || source.includes("trust") || source.includes("ruler") || source.includes("caliper")) return "More precise tools reduce uncertainty, which makes a measurement more trustworthy.";
  if (source.includes("vector") || source.includes("scalar")) return "Vectors need both size and direction, while scalars only need size.";
  if (source.includes("density")) return "Density compares mass to volume, so both quantities matter together.";
  return "Reconnect the main idea to the quantity, unit, and meaning in the question.";
}

function misconceptionTag(prompt: string): string | undefined {
  const source = prompt.toLowerCase();
  if (source.includes("work") || (source.includes("force") && source.includes("distance"))) return "work_energy_transfer_confusion";
  if (source.includes("kinetic energy")) return "kinetic_energy_relationship_error";
  if (source.includes("gravitational potential energy") || source.includes("gpe") || (source.includes("lifted") && source.includes("height"))) return "gravitational_potential_energy_error";
  if (source.includes("efficiency") || (source.includes("useful output") && source.includes("input"))) return "efficiency_calculation_error";
  if (source.includes("power")) return "power_rate_confusion";
  if (source.includes("impulse") || source.includes("force-time") || source.includes("force time")) return "impulse_force_time_confusion";
  if (source.includes("momentum")) {
    if (source.includes("conservation") || source.includes("collision") || source.includes("stick together") || source.includes("system")) {
      return "momentum_conservation_confusion";
    }
    return "momentum_vector_confusion";
  }
  if (source.includes("airbag") || source.includes("crumple") || source.includes("stopping time") || source.includes("injury risk")) return "collision_safety_reasoning_confusion";
  if (source.includes("braking")) return "braking_energy_comparison_confusion";
  if (source.includes("unit") || source.includes("measurement")) return "unit_as_label_only";
  if (source.includes("prefix") || source.includes("kilo") || source.includes("centi") || source.includes("milli")) return "prefix_scale_error";
  if (source.includes("distance") || source.includes("displacement") || source.includes("average speed") || source.includes("journey")) return "distance_displacement_confusion";
  if (source.includes("velocity") || source.includes("direction") || source.includes("acceleration")) return source.includes("acceleration") ? "acceleration_sign_confusion" : "velocity_direction_confusion";
  if (source.includes("distance-time") || source.includes("distance time graph") || (source.includes("graph") && source.includes("distance"))) return "distance_time_graph_error";
  if (source.includes("velocity-time") || source.includes("velocity time graph") || source.includes("area under") || (source.includes("graph") && source.includes("velocity"))) return "velocity_time_graph_error";
  if (source.includes("resultant force") || source.includes("balanced force") || source.includes("unbalanced force") || source.includes("net force")) return source.includes("balanced") ? "balanced_force_motion_confusion" : "resultant_force_error";
  if (source.includes("seatbelt") || source.includes("inertia")) return "inertia_force_confusion";
  if (source.includes("f = ma") || source.includes("force") && source.includes("mass")) return "fma_relationship_error";
  if (source.includes("accuracy") || source.includes("accepted value") || source.includes("true value")) return "precision_vs_accuracy";
  if (source.includes("systematic error") || source.includes("random error") || source.includes("zero error")) return "random_vs_systematic_error";
  if (source.includes("precision") || source.includes("uncertainty") || source.includes("trust") || source.includes("ruler") || source.includes("caliper")) return "precision_trust_error";
  return undefined;
}

function resolvedMisconceptionTag(item: UnknownRecord, prompt: string): string | undefined {
  const explicit = text(item.misconception_tag).trim();
  if (explicit) return explicit;

  const listed = asList(item.misconception_tags)
    .map((entry) => text(entry).trim())
    .find(Boolean);
  if (listed) return listed;

  const meta = fallbackMeta(item);
  if (meta?.misconceptionTag) return meta.misconceptionTag;

  return misconceptionTag(prompt);
}


function resolvedAnswerIndex(item: UnknownRecord): number {
  const explicit = item.answer_index;
  if (typeof explicit === "number" && Number.isFinite(explicit)) return explicit;
  const metaIndex = fallbackMeta(item)?.answerIndex;
  if (typeof metaIndex === "number" && Number.isFinite(metaIndex)) return metaIndex;
  return -1;
}
function resolvedCorrectAnswer(item: UnknownRecord): string {
  const choices = asList(item.choices).map((choice) => text(choice));
  const correctIndex = resolvedAnswerIndex(item);
  if (correctIndex >= 0 && correctIndex < choices.length) return choices[correctIndex];

  const explicitCorrect = text(item.correct_answer || item.correctAnswer).trim();
  if (explicitCorrect) return explicitCorrect;

  const accepted = shortAnswerAccepted(item);
  if (accepted.length > 0) {
    return accepted.find((entry) => /[A-Za-z]/.test(entry)) || accepted[0];
  }

  return fallbackMeta(item)?.correctAnswer || "Review the lesson idea and try again.";
}

function resolvedExplanation(item: UnknownRecord, answerIndex: number): string {
  const feedback = asList(item.feedback).map((entry) => text(entry));
  const answerFeedback = answerIndex >= 0 && answerIndex < feedback.length ? feedback[answerIndex] : "";
  if (hasMeaningfulFeedback(answerFeedback)) {
    return answerFeedback;
  }

  const hint = text(item.hint);
  if (hasMeaningfulFeedback(hint)) {
    return hint;
  }

  const metaExplanation = fallbackMeta(item)?.explanation;
  if (hasMeaningfulFeedback(metaExplanation || "")) {
    return metaExplanation || "";
  }

  return "Review the lesson idea and try again.";
}

function shortAnswerAccepted(item: UnknownRecord): string[] {
  const accepted = [...asList(item.accepted_answers), ...asList(item.acceptedAnswers)]
    .map((entry) => text(entry))
    .filter(Boolean);
  const explicitCorrect = text(item.correct_answer || item.correctAnswer).trim();
  const explicitValues = [...accepted, explicitCorrect]
    .map((entry) => text(entry).trim())
    .filter(Boolean);
  if (explicitValues.length > 0) {
    return [...new Set(explicitValues)];
  }

  const meta = fallbackMeta(item);
  const values = [...(meta?.acceptedAnswers || []), meta?.correctAnswer || ""]
    .map((entry) => text(entry).trim())
    .filter(Boolean);
  return [...new Set(values)];
}

function shortAnswerMatches(answer: unknown, acceptedAnswers: string[], item: UnknownRecord): boolean {
  const candidate = normalizeOpenAnswer(answer);
  if (!candidate) return false;

  const compactCandidate = compactOpenAnswer(answer);
  const accepted = acceptedAnswers.map((entry) => normalizeOpenAnswer(entry));
  const compactAccepted = acceptedAnswers.map((entry) => compactOpenAnswer(entry));

  if (accepted.includes(candidate) || compactAccepted.includes(compactCandidate)) {
    return true;
  }

  const customMatch = customShortAnswerMatch(item, answer);
  if (customMatch !== null) return customMatch;

  const candidateNumeric = numericAnswer(answer);
  if (candidateNumeric === null) return false;

  return acceptedAnswers.some((entry) => {
    const expectedNumeric = numericAnswer(entry);
    return expectedNumeric !== null && Math.abs(expectedNumeric - candidateNumeric) < 1e-9;
  });
}

function grade(item: UnknownRecord, answer: unknown, title: string): UnknownRecord {
  const prompt = text(item.prompt);
  const meta = fallbackMeta(item);
  const choices = asList(item.choices).map((choice) => text(choice));
  const answerIndex = valueIndex(answer);
  const acceptedAnswers = shortAnswerAccepted(item);
  const isCorrect =
    choices.length > 0
      ? multipleChoiceMatches(item, answer)
      : shortAnswerMatches(answer, acceptedAnswers, item);
  const explanation = resolvedExplanation(item, answerIndex);
  const focus = meta?.teachingFocus || text(item.hint) || teachingFocus(prompt, title);
  const explanationFallback = isCorrect
    ? `Correct. ${resolvedCorrectAnswer(item)} is right because ${focus.charAt(0).toLowerCase()}${focus.slice(1)}`
    : focus;
  return {
    question_id: text(item.id),
    prompt,
    learner_answer: choices.length > 0 ? choiceLabel(item, answer) : text(answer).trim() || null,
    is_correct: isCorrect,
    correct_answer: resolvedCorrectAnswer(item),
    explanation: hasMeaningfulFeedback(explanation) ? explanation : explanationFallback,
    teaching_focus: focus,
    misconception_tag: isCorrect ? undefined : resolvedMisconceptionTag(item, prompt),
  };
}

function diagnosticTarget(correctCount: number, askedCount: number, availableCount: number): number {
  const maxCount = Math.max(2, Math.min(5, availableCount || 5));
  if (askedCount < 2) return Math.min(2, maxCount);
  const ratio = askedCount > 0 ? correctCount / askedCount : 0;
  if (ratio < 0.4) return Math.min(2, maxCount);
  if (ratio < 0.6) return Math.min(3, maxCount);
  if (ratio < 0.8) return Math.min(4, maxCount);
  return Math.min(5, maxCount);
}

function dedupeText(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function reviewRefs(lesson: UnknownRecord, explicitRefs: unknown[] = []): UnknownRecord[] {
  const refs: UnknownRecord[] = [];
  const addRef = (id: string, label: string) => {
    if (!label || refs.some((entry) => text(entry.id) === id)) return;
    refs.push({ id, label });
  };
  for (const ref of explicitRefs) {
    addRef(text(ref), text(ref).replace(/^concept_/, "").replace(/_/g, " "));
  }
  const microPrompts = asList(asRecord(phases(lesson).analogical_grounding).micro_prompts)
    .map(asRecord);
  for (const prompt of microPrompts) addRef(`focus_${refs.length + 1}`, text(prompt.prompt));
  const capsules = asList(asRecord(phases(lesson).concept_reconstruction).capsules)
    .map(asRecord);
  for (const capsule of capsules) addRef(`capsule_${refs.length + 1}`, text(capsule.prompt));
  return refs.slice(0, 4);
}

function generatedMasteryItems(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  if (code.startsWith("M2_")) return m2GeneratedMasteryItems(code);
  if (isExtendedNextgenLessonCode(code)) {
    const f2Base = [...itemsFrom(lesson, "transfer"), ...conceptGateItems(lesson)]
      .map(asRecord)
      .filter((item) => hasUsableMasteryAnswer(item));
    const lessonSpecificVariants = masteryVariantsFromPool(f2Base, code).map(asRecord);
    return lessonSpecificVariants.slice(0, MASTERY_DEFAULT_MAX);
  }

  switch (code) {
    case "F1_L1":
      return [
        mcItem("F1-L1-M1", "Why do SI units matter in science?", ["They make numbers look larger", "They give measurements a shared standard", "They remove all uncertainty", "They replace calculations"], 1, "Think about communication and consistency.", "SI units let scientists compare measurements using the same standard."),
        mcItem("F1-L1-M2", "Which is a complete measurement?", ["18", "18 s", "seconds", "time"], 1, "A complete measurement needs a number and a unit.", "18 s is complete because it includes both value and unit."),
        mcItem("F1-L1-M3", "Which SI unit matches time?", ["kg", "m", "s", "K"], 2, "Time is measured with the second.", "The second (s) is the SI base unit for time."),
        mcItem("F1-L1-M4", "Which prefix means one-thousandth of the base unit?", ["kilo-", "centi-", "milli-", "mega-"], 2, "Think about the smallest of these prefixes.", "milli- means 1/1000 of the base unit."),
        mcItem("F1-L1-M5", "Which conversion is correct?", ["0.8 m = 80 cm", "0.8 m = 8 cm", "0.8 m = 800 cm", "0.8 m = 0.08 cm"], 0, "One metre contains 100 centimetres.", "0.8 m equals 80 cm because 1 m equals 100 cm."),
        mcItem("F1-L1-M6", "A student writes 14 for the mass of a book. What is missing?", ["A graph", "A direction", "A unit", "A decimal point"], 2, "A scientific measurement is incomplete without one key part.", "The unit is missing, so the measurement does not yet tell us what the number means."),
        shortItem("F1-L1-M7", "Convert 0.35 m to cm.", ["35", "35 cm", "35 centimetres"], "Use 1 m = 100 cm."),
        shortItem("F1-L1-M8", "Convert 250 cm to m.", ["2.5", "2.5 m", "2.5 metres"], "Use 100 cm = 1 m."),
        mcItem("F1-L1-M9", "Which unit is most suitable for the thickness of a coin?", ["km", "m", "cm", "mm"], 3, "Choose the unit that matches a very small length.", "Millimetre is most suitable because a coin's thickness is only a few small divisions of a centimetre."),
        shortItem("F1-L1-M10", "Convert 3.2 kg to g.", ["3200", "3200 g", "3200 gram", "3200 grams"], "Use 1 kg = 1000 g."),
      ];
    case "F1_L2":
      return [
        mcItem("F1-L2-M1", "Which quantity is a scalar?", ["velocity", "force", "distance", "displacement"], 2, "A scalar needs size only.", "Distance is a scalar because it has magnitude only."),
        mcItem("F1-L2-M2", "Which quantity is a vector?", ["speed", "mass", "temperature", "displacement"], 3, "A vector needs direction.", "Displacement is a vector because it includes both size and direction."),
        mcItem("F1-L2-M3", "Which statement is true?", ["Scalars need direction", "Vectors have only magnitude", "Vectors have magnitude and direction", "Scalars are always positive"], 2, "Think about what extra information a vector needs.", "Vectors combine magnitude with direction."),
        mcItem("F1-L2-M4", "A jogger runs 3 km west. This description is a...", ["scalar", "vector", "unit", "formula"], 1, "The word west matters here.", "It is a vector because it includes direction."),
        mcItem("F1-L2-M5", "Which pair contains only scalars?", ["speed and mass", "velocity and force", "displacement and velocity", "force and acceleration"], 0, "Pick the quantities that do not need direction.", "Speed and mass are both scalar quantities."),
        mcItem("F1-L2-M6", "Which pair contains only vectors?", ["distance and speed", "mass and temperature", "velocity and force", "time and volume"], 2, "Both quantities should need direction.", "Velocity and force are both vectors."),
        mcItem("F1-L2-M7", "What extra information turns speed into velocity?", ["mass", "direction", "unit prefix", "temperature"], 1, "Velocity is speed with one extra feature.", "Direction turns speed into velocity."),
        mcItem("F1-L2-M8", "Why can two vectors with the same magnitude still be different?", ["They can have different units", "They can have different directions", "They can only be different at night", "Vectors never differ once magnitudes match"], 1, "Magnitude alone is not enough for vectors.", "Two vectors can differ if their directions are different."),
        mcItem("F1-L2-M9", "If an object keeps the same speed but turns around, which quantity must change?", ["mass", "velocity", "temperature", "time"], 1, "A direction change matters for vectors.", "Velocity must change because it includes direction as well as speed."),
        mcItem("F1-L2-M10", "Which statement best compares distance and displacement?", ["Both always need direction", "Distance is scalar, while displacement is a vector from start to finish", "Displacement ignores direction", "Distance is always smaller than displacement"], 1, "One quantity is scalar and the other is vector.", "Distance is scalar, while displacement is a vector from the starting point to the finishing point."),
      ];
    case "F1_L3":
      return [
        mcItem("F1-L3-M1", "Which tool is most suitable for measuring the diameter of a very thin wire with the smallest uncertainty?", ["metre rule", "vernier caliper", "micrometer screw gauge", "measuring tape"], 2, "For a very thin wire, choose the tool with the finest suitable scale.", "A micrometer screw gauge is most suitable because it is designed for very small diameters and usually gives a smaller uncertainty than a vernier caliper."),
        mcItem("F1-L3-M2", "A ruler has 1 mm divisions. What uncertainty is often reasonable to report?", ["+/- 1 mm", "+/- 0.5 mm", "+/- 0.1 mm", "+/- 2 mm"], 1, "A common estimate is about half the smallest division.", "+/- 0.5 mm is reasonable because it is about half of a 1 mm smallest division."),
        mcItem("F1-L3-M3", "If repeated readings are tightly grouped, what does that suggest?", ["low precision", "greater precision", "wrong unit", "systematic error only"], 1, "Think about how closely the readings agree with each other.", "Tightly grouped readings suggest greater precision because the measurements agree closely."),
        mcItem("F1-L3-M4", "A balance always reads 0.2 g too high before any mass is placed on it. This is...", ["random error", "systematic error", "rounding only", "no error"], 1, "A repeated shift in the same direction is the clue.", "A constant offset is systematic error because it shifts every reading the same way."),
        mcItem("F1-L3-M5", "Why is a caliper usually more trustworthy than a rough ruler for a tiny object?", ["It is always digital", "It has finer divisions and smaller uncertainty", "It uses larger units", "It removes all error"], 1, "Trust comes from finer resolution, not from magic.", "A caliper is usually more trustworthy because its finer divisions reduce the uncertainty in the reading."),
        mcItem("F1-L3-M6", "What does resolution describe?", ["The color of the instrument", "The smallest change the instrument can show", "The true value exactly", "The number of repeated trials"], 1, "Resolution is about the instrument's smallest visible change.", "Resolution is the smallest change an instrument can show."),
        shortItem("F1-L3-M7", "A scale has 0.2 cm divisions. What uncertainty is often reasonable to report?", ["0.1 cm", "+/- 0.1 cm"], "Use about half the smallest division."),
        shortItem("F1-L3-M8", "Name one reason repeated measurements improve trust in a result.", ["they show variation", "it shows variation", "shows variation", "they show how much the readings vary", "it shows how much the readings vary", "they help estimate uncertainty", "it helps estimate uncertainty", "they help us estimate uncertainty", "they show consistency", "it shows consistency", "they let you average the readings", "it lets you average the readings", "they help average out random error", "it helps average out random error", "they reduce random error", "it reduces random error", "they help spot anomalous readings", "it helps spot anomalous readings", "they help spot outliers", "it helps spot outliers"], "Think about spread, consistency, uncertainty, averaging, and outliers."),
        mcItem("F1-L3-M9", "Which action best reduces random error when timing a repeated motion?", ["Add extra digits to one reading", "Take several readings and average them", "Ignore any reading that looks unusual without checking", "Change the unit from seconds to minutes"], 1, "Random error is reduced by repeated measurements, not decorative precision.", "Taking several readings and averaging them helps reduce the effect of random error."),
        mcItem("F1-L3-M10", "What is the clearest sign of zero error?", ["Readings scatter above and below the best value", "The instrument starts with a constant offset before measurement", "The unit label is missing", "The scale has fine divisions"], 1, "Zero error is a built-in offset before the real reading even begins.", "A constant offset at the start is the clearest sign of zero error."),
      ];
    case "F1_L4":
      return [
        mcItem("F1-L4-M1", "How many significant figures are in 0.00450?", ["2", "3", "4", "5"], 1, "Leading zeros do not count, but trailing zeros after a decimal can count.", "0.00450 has 3 significant figures: 4, 5, and the trailing 0."),
        mcItem("F1-L4-M2", "Round 12.349 to 3 significant figures.", ["12.3", "12.4", "12.35", "12.34"], 0, "Keep 1, 2, and 3, then look at the next digit.", "12.349 rounds to 12.3 to 3 significant figures because the next digit is 4."),
        mcItem("F1-L4-M3", "Which zeros do not count as significant figures?", ["Zeros between non-zero digits", "Leading zeros before the first non-zero digit", "Trailing zeros after a decimal point", "All zeros always count"], 1, "Think about zeros that only place the decimal point.", "Leading zeros do not count because they only locate the decimal point."),
        mcItem("F1-L4-M4", "In multiplication or division, your final answer should usually keep...", ["the most significant figures from any number", "the least significant figures from the measurements", "all digits shown by the calculator", "no significant figures at all"], 1, "The least precise measurement controls the final precision.", "For multiplication or division, the final answer usually keeps the least number of significant figures among the measurements."),
        mcItem("F1-L4-M5", "Why should you avoid writing extra digits in a final physics answer?", ["Extra digits always improve the science", "They can pretend the measurement is more precise than it is", "They remove units", "They change the formula"], 1, "Think about honesty in reporting precision.", "Extra digits can falsely suggest more precision than the measurement supports."),
        mcItem("F1-L4-M6", "Which statement about a calculator display is best?", ["Every displayed digit must be reported", "Displayed digits are always exact", "You should report only the digits justified by the measurement", "Calculator digits replace uncertainty"], 2, "The measurement, not the screen, sets the justified precision.", "You should report only digits justified by the measurement."),
        shortItem("F1-L4-M7", "Round 0.00678 to 2 significant figures.", ["0.0068", "6.8 x 10^-3", "6.8x10^-3"], "Keep the first two significant digits and round using the next digit."),
        shortItem("F1-L4-M8", "State the addition and subtraction rule for significant figures in a few words.", ["least decimal places", "least decimal points", "least decimal point", "least number of decimal places", "least number of decimal points", "fewest decimal places", "fewest decimal points", "smallest number of decimal places", "match the least decimal places", "match the fewest decimal places", "match the least precise decimal place", "use the least decimal places", "use the fewest decimal places", "use the least precise decimal place", "follow the least decimal places", "follow the fewest decimal places", "keep the least decimal places", "keep the fewest decimal places", "round to the least decimal place", "round to the fewest decimal places", "same number of decimal places as the least precise measurement"], "Think about decimal places rather than total significant figures."),
        mcItem("F1-L4-M9", "When adding 12.34 and 1.2, which reporting rule controls the final answer?", ["least decimal places", "least significant figures", "most decimal places", "calculator display digits"], 0, "Addition and subtraction are controlled by decimal places.", "For addition, the final answer should match the least number of decimal places."),
        shortItem("F1-L4-M10", "Calculate 6.40 / 2.0 and report the answer with correct significant figures.", ["3.2"], "First divide, then keep the least number of significant figures from the measurements."),
      ];
    case "F1_L5":
      return [
        mcItem("F1-L5-M1", "What does density compare?", ["mass and time", "mass packed into a given volume", "volume and direction", "force and area"], 1, "Density compares how much mass is packed into space.", "Density compares how much mass is packed into a given volume."),
        mcItem("F1-L5-M2", "Which equation gives density?", ["density = mass x volume", "density = volume / mass", "density = mass / volume", "density = mass + volume"], 2, "Use the relationship that compares mass with volume.", "Density is given by mass divided by volume."),
        mcItem("F1-L5-M3", "Two cubes have the same volume. Which one is denser?", ["The one with more mass", "The one with less mass", "They must have the same density", "You cannot compare them"], 0, "For the same space, the heavier object packs in more mass.", "If the volume is the same, the object with more mass is denser."),
        mcItem("F1-L5-M4", "Two samples have the same mass. Which one is denser?", ["The larger-volume sample", "The smaller-volume sample", "They must have the same density", "Density depends only on temperature"], 1, "Packing the same mass into less space gives greater density.", "If the mass is the same, the smaller-volume sample is denser."),
        mcItem("F1-L5-M5", "Which unit is suitable for density?", ["kg", "m^3", "kg/m^3", "N"], 2, "Density is mass per unit volume.", "kg/m^3 is suitable because density compares mass with volume."),
        mcItem("F1-L5-M6", "Why can a small metal block be denser than a larger foam block?", ["Density depends only on size", "Density compares how much mass is packed into the space", "Large objects are always denser", "Foam has no volume"], 1, "Density is about mass for the size, not just mass alone.", "A small object can be denser if it packs more mass into each unit of volume."),
        shortItem("F1-L5-M7", "A block has mass 120 g and volume 40 cm^3. What is its density?", ["3", "3 g/cm^3", "3 g per cm^3"], "Use density = mass / volume and keep the compound unit."),
        shortItem("F1-L5-M8", "A material has density 2 g/cm^3 and volume 5 cm^3. What is its mass?", ["10", "10 g", "10 grams"], "Rearrange to mass = density x volume."),
        mcItem("F1-L5-M9", "Why should units be made consistent before using the density formula?", ["Mixed units can distort the value of the calculated density", "Density has no unit", "The formula only works with kilograms", "Consistent units remove all uncertainty"], 0, "The formula compares mass and volume directly, so mismatched units can spoil the answer.", "You need consistent units because mixed units can distort the calculated density."),
        mcItem("F1-L5-M10", "An object floats in a liquid when...", ["its density is greater than the liquid's density", "its density is less than the liquid's density", "its mass is always smaller than the liquid's mass", "its volume is always larger than the liquid's volume"], 1, "Floating depends on density comparison, not just mass alone.", "An object floats when its density is less than the liquid's density."),
      ];
    case "F1_L6":
      return [
        mcItem("F1-L6-M1", "What does accuracy describe?", ["How close repeated readings are to each other", "How close a result is to the accepted or true value", "How many digits a calculator shows", "How large the unit is"], 1, "Accuracy is about closeness to the accepted value.", "Accuracy describes how close a result is to the accepted or true value."),
        mcItem("F1-L6-M2", "A set of readings is tightly grouped but all are far from the true value. This set is...", ["accurate and precise", "accurate but not precise", "precise but not accurate", "neither accurate nor precise"], 2, "Tight grouping shows precision, but distance from the true value means low accuracy.", "The readings are precise but not accurate because they agree closely while missing the true value."),
        mcItem("F1-L6-M3", "A set of readings is spread out, but the average is close to the accepted value. This set is...", ["accurate but not very precise", "precise but not accurate", "accurate and precise", "systematic only"], 0, "Think about the difference between the average position and the spread.", "The set is accurate but not very precise because the average is close to the accepted value even though the readings are spread out."),
        mcItem("F1-L6-M4", "Which pattern best shows both good accuracy and good precision?", ["Readings tightly grouped around the accepted value", "Readings tightly grouped far from the accepted value", "Readings spread widely around the accepted value", "One single reading with no uncertainty"], 0, "Look for closeness to the accepted value and a small spread.", "Good accuracy and good precision means the readings are tightly grouped around the accepted value."),
        mcItem("F1-L6-M5", "A balance always reads 0.20 g too high. What does this suggest?", ["random scatter only", "systematic error such as zero error", "perfect accuracy", "the unit is wrong"], 1, "A constant offset points to a systematic shift.", "A constant positive offset suggests a systematic error such as zero error."),
        mcItem("F1-L6-M6", "Why should a trustworthy measurement report include uncertainty?", ["To make the answer look more advanced", "To show the result is not pretending to be exact", "To remove the need for units", "To guarantee the value is true"], 1, "Uncertainty makes the report more honest, not more decorative.", "Reporting uncertainty shows the result is not pretending to be exact."),
        mcItem("F1-L6-M7", "Which action usually improves the trustworthiness of a measurement?", ["Use any tool and report extra digits", "Choose a suitable instrument and report a reasonable uncertainty", "Ignore repeat readings once you get one value", "Remove the unit to simplify the answer"], 1, "Think about suitable tools and honest reporting.", "Trustworthiness improves when you use a suitable instrument and report a reasonable uncertainty."),
        shortItem("F1-L6-M8", "In a few words, what does precision describe?", ["closeness of repeated readings", "how close repeated readings are", "spread of repeated readings", "how tightly grouped repeated readings are", "agreement among repeated readings"], "Think about how repeated readings compare with each other."),
        mcItem("F1-L6-M9", "Why can a very precise set of readings still be untrustworthy?", ["Precision guarantees accuracy", "A shared systematic error can shift all the readings away from the true value", "Precise readings do not need units", "Precision removes uncertainty completely"], 1, "Tight agreement does not automatically mean the readings are correct.", "A set can be very precise but still be shifted away from the true value by a systematic error."),
        shortItem("F1-L6-M10", "In a few words, what does accuracy describe?", ["closeness to the accepted value", "how close the result is to the true value", "how close the result is to the accepted value", "closeness to the true value"], "Think about closeness to the accepted or true value, not the spread of repeated readings."),
      ];
    case "F2_L1":
      return [
        mcItem("F2-L1-M1", "Which quantity needs direction to be complete?", ["distance", "speed", "displacement", "time"], 2, "Only one option needs both size and direction.", "Displacement needs both size and direction."),
        mcItem("F2-L1-M2", "A cyclist covers 150 m in 30 s. What is the average speed?", ["3 m/s", "4 m/s", "5 m/s", "6 m/s"], 2, "Use average speed = total distance / total time.", "150 m divided by 30 s gives 5 m/s."),
        mcItem("F2-L1-M3", "A learner walks 12 m east, then 5 m west. Which pair is correct?", ["distance 7 m, displacement 7 m east", "distance 17 m, displacement 7 m east", "distance 17 m, displacement 17 m east", "distance 7 m, displacement 17 m east"], 1, "Distance adds the whole path, while displacement keeps the net change with direction.", "The total path is 17 m and the net change is 7 m east."),
        mcItem("F2-L1-M4", "Which quantity is scalar?", ["displacement", "velocity", "force", "speed"], 3, "Pick the one that does not need direction.", "Speed is scalar because it needs magnitude only."),
        mcItem("F2-L1-M5", "Why can distance and displacement be different for the same trip?", ["Distance ignores all motion", "Displacement measures the start-to-finish change while distance measures the full path", "Displacement is always larger", "Distance always needs direction"], 1, "One quantity uses the whole path and the other uses the net change.", "Distance measures the whole path, while displacement measures the start-to-finish change with direction."),
        shortItem("F2-L1-M6", "A runner covers 240 m in 40 s. What is the average speed?", ["6", "6 m/s"], "Divide total distance by total time."),
      ];
    default:
      return [];
  }
}

function generatedConceptGateItems(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  if (code.startsWith("M2_")) return m2GeneratedConceptGateItems(code);
  switch (code) {
    case "F1_L1":
      return [
        mcItem("F1-L1-G1", "Why must a physics measurement include a unit?", ["So the number looks scientific", "So the number can be rounded", "So the reader knows what quantity and scale the number represents", "So calculations become optional"], 2, "A bare number is incomplete in physics.", "A unit tells the reader what quantity and scale the number represents."),
        mcItem("F1-L1-G2", "Which prefix makes the base unit 1000 times smaller?", ["kilo-", "centi-", "milli-", "mega-"], 2, "Think about one-thousandth of the base unit.", "milli- means one-thousandth of the base unit."),
        mcItem("F1-L1-G3", "Why is '35 cm' more useful than just '35'?", ["It includes both the value and the unit", "It proves the answer is exact", "It removes the need to convert", "It always uses SI base units"], 0, "A complete measurement needs two parts.", "'35 cm' is more useful because it includes both the number and the unit."),
      ];
    case "F1_L2":
      return [
        mcItem("F1-L2-G1", "Which description must be a vector?", ["6 m north", "6 m", "6 kg", "6 s"], 0, "Look for the one that includes direction.", "'6 m north' is a vector because it has magnitude and direction."),
        mcItem("F1-L2-G2", "Which extra feature turns speed into velocity?", ["mass", "direction", "time", "temperature"], 1, "Velocity is speed with one extra feature.", "Direction turns speed into velocity."),
        mcItem("F1-L2-G3", "Which statement best separates distance from displacement?", ["Both always need direction", "Distance describes route length, while displacement is the start-to-finish change with direction", "Displacement ignores direction", "Distance is always smaller"], 1, "One quantity is scalar and the other is vector.", "Distance describes route length, while displacement is the directed change from start to finish."),
      ];
    case "F1_L3":
      return [
        mcItem("F1-L3-G1", "A balance reads 0.2 g too high every time. What type of error is this?", ["random error", "systematic error", "no error", "rounding error"], 1, "A repeated one-way shift is the clue.", "A repeated offset in the same direction is systematic error."),
        mcItem("F1-L3-G2", "Why do repeated readings help?", ["They make units unnecessary", "They reveal spread and help reduce the effect of random error", "They guarantee the true value", "They remove calibration errors automatically"], 1, "Think about scatter and averaging.", "Repeated readings reveal spread and help reduce the effect of random error."),
        mcItem("F1-L3-G3", "What sets the finest detail an instrument can reliably show?", ["its color", "its resolution", "its battery", "its unit name"], 1, "This is about the smallest change the tool can show.", "An instrument's resolution sets the finest detail it can reliably show."),
      ];
    case "F1_L4":
      return [
        mcItem("F1-L4-G1", "Which zeros do not count as significant figures?", ["Zeros between non-zero digits", "Leading zeros before the first non-zero digit", "Trailing zeros after a decimal point", "All zeros count"], 1, "Think about zeros that only place the decimal point.", "Leading zeros do not count because they only place the decimal point."),
        mcItem("F1-L4-G2", "Why should you not copy every calculator digit into a physics answer?", ["Because calculators are always wrong", "Because extra digits can pretend to show more precision than the measurement supports", "Because units disappear", "Because rounding is banned"], 1, "The measurement sets the justified precision.", "Extra digits can falsely suggest more precision than the measurement really supports."),
        mcItem("F1-L4-G3", "For addition or subtraction, which rule controls the final answer?", ["least decimal places", "most significant figures", "largest unit prefix", "smallest unit only"], 0, "This rule is about decimal places, not total significant figures.", "For addition or subtraction, the final answer should match the least number of decimal places."),
      ];
    case "F1_L5":
      return [
        mcItem("F1-L5-G1", "What does density compare?", ["mass and time", "mass packed into a given volume", "volume and direction", "force and area"], 1, "Density tells how much mass is packed into space.", "Density compares how much mass is packed into a given volume."),
        mcItem("F1-L5-G2", "Which unit matches density?", ["kg", "m^3", "kg/m^3", "A"], 2, "Density is mass per volume.", "kg/m^3 is a density unit because it combines mass and volume."),
        mcItem("F1-L5-G3", "Two blocks have the same volume. Which is denser?", ["The one with more mass", "The one with less mass", "They must have the same density", "You cannot compare density this way"], 0, "Think about mass packed into the same space.", "For the same volume, the one with more mass is denser."),
      ];
    case "F1_L6":
      return [
        mcItem("F1-L6-G1", "Which situation shows precision without accuracy?", ["Readings tightly grouped around the true value", "Readings tightly grouped but shifted away from the true value", "Readings spread widely around the true value", "One reading with no unit"], 1, "Tight grouping and being off target should appear together.", "Precision without accuracy means the readings are tightly grouped but shifted away from the true value."),
        mcItem("F1-L6-G2", "Why report uncertainty with a measured value?", ["To make the answer longer", "To show the result is an estimate with a reasonable range", "To remove the need for units", "To guarantee accuracy"], 1, "Uncertainty is about honest reporting.", "Uncertainty shows that the measured value is an estimate with a reasonable range."),
        mcItem("F1-L6-G3", "Which statement best describes random error?", ["It shifts every reading by the same amount", "It makes readings scatter unpredictably", "It changes the unit", "It guarantees low precision and low accuracy together"], 1, "Random error shows up as scatter.", "Random error makes readings scatter unpredictably around the best estimate."),
      ];
    case "M1_L1":
      return [
        mcItem("M1L1_C4", "Why is it wrong to say the line on a distance-time graph is the road itself?", ["Because the graph records progress over time rather than route shape", "Because roads are always curved", "Because graphs cannot show time", "Because distance has no unit"], 0, "Keep the motion world and graph world separate.", "The graph records how distance changes with time; it is not a sketch of the physical route."),
        mcItem("M1L1_C5", "Two straight progress-log segments are parallel but start at different heights. What do they share?", ["the same pace", "the same starting point", "the same total distance", "the same pause time"], 0, "Parallel segments have the same slope.", "Parallel straight progress-log segments share the same slope, so they show the same pace."),
        mcItem("M1L1_C6", "Why can two runs end at the same final progress score yet still be different?", ["Because the pace pattern over time can differ", "Because final progress never matters", "Because only the starting point matters", "Because equal distance forces equal acceleration"], 0, "A final score does not tell the whole story of the run.", "The same final progress can come from different pace patterns, pauses, and segment timings."),
        mcItem("M1L1_C7", "If time keeps passing but the mission log stays flat, what must be true?", ["The avatar is not gaining distance in that interval", "The avatar must be reversing", "The pace is definitely increasing", "The lane has disappeared"], 0, "Distance is not changing while time is.", "A flat section means no new distance is being gained during that interval."),
      ];
    case "M1_L2":
      return [
        mcItem("M1L2_C4", "A flat pace log at 6 m/s above the axis means...", ["constant motion at 6 m/s", "the avatar is stopped", "the acceleration is 6 m/s^2", "distance is increasing faster and faster"], 0, "Flat above zero is cruising, not rest.", "A flat pace log above zero means the avatar keeps moving at a constant speed."),
        mcItem("M1L2_C5", "Why can two pace logs show the same speed at one instant but different acceleration?", ["Because equal height does not force equal slope", "Because speed and acceleration are the same quantity", "Because time is missing from the graph", "Because acceleration depends only on distance"], 0, "Height and slope do different jobs.", "They can have the same height at that instant while having different slopes and therefore different accelerations."),
        mcItem("M1L2_C6", "A straight rising pace log tells you that the avatar is...", ["speeding up at a steady rate", "covering equal distances each second", "stopped but ready to move", "moving backward with zero acceleration"], 0, "A straight rising line means a constant positive slope.", "A straight rising pace log shows the speed increasing by equal amounts each second, so the acceleration is steady and positive."),
        mcItem("M1L2_C7", "Why is the highest point on a pace log not automatically the point of greatest acceleration?", ["Because acceleration comes from slope, not height", "Because acceleration only appears on distance-time graphs", "Because a high speed forbids acceleration", "Because height and slope always match"], 0, "Keep current speed separate from rate of change.", "Acceleration is read from the slope of the graph, not from how high the graph is."),
      ];
    case "M1_L3":
      return [
        mcItem("M1L3_C4", "How can an avatar have positive acceleration while slowing down?", ["It is moving in the negative direction while the acceleration points positive", "Positive acceleration always means speeding up, so it cannot happen", "The time interval must be zero", "Velocity must also be positive"], 0, "Combine the signs of velocity and acceleration carefully.", "If the velocity is negative but the acceleration is positive, the speed can decrease while the acceleration stays positive."),
        mcItem("M1L3_C5", "Zero acceleration guarantees that the velocity is...", ["zero", "constant", "positive", "negative"], 1, "Zero acceleration means no change in velocity.", "Zero acceleration guarantees constant velocity, which may be zero or non-zero."),
        mcItem("M1L3_C6", "What decides the sign of acceleration in this lesson?", ["the signed change in velocity relative to the chosen positive direction", "whether the object feels faster", "whether the speed is large", "the size of the mass"], 0, "Set the sign convention first, then compare the velocities.", "The sign comes from the signed change in velocity relative to the chosen positive direction."),
        mcItem("M1L3_C7", "Why does the same velocity change over a shorter time mean a larger acceleration magnitude?", ["Because acceleration is a rate of change", "Because short times create extra velocity", "Because acceleration ignores time", "Because the sign becomes positive automatically"], 0, "The same change spread over less time is a stronger rate.", "Acceleration is the rate of velocity change, so the same change over less time means a larger magnitude."),
      ];
    case "M1_L4":
      return [
        mcItem("M1L4_C4", "What should you check before using any suvat equation in this lesson?", ["that acceleration is constant", "that the graph is curved", "that time is zero", "that u and v are equal"], 0, "Every equation here has a condition attached.", "You should first check that acceleration is constant because the suvat equations summarize that specific motion pattern."),
        mcItem("M1L4_C5", "Why is choosing an equation by the knowns and the unknown better than choosing by memory?", ["Because it ties the formula to the motion story and avoids unnecessary variables", "Because every equation gives the same answer in all stories", "Because the symbols do not matter", "Because unit checks are optional"], 0, "Equation choice should be strategic and story-based.", "Choosing by the knowns and the unknown keeps the formula tied to the motion story and avoids introducing extra unnecessary variables."),
        mcItem("M1L4_C6", "In s = ut + 1/2at^2, what does the ut part represent conceptually?", ["the distance from the starting velocity alone", "the extra distance from acceleration only", "the final velocity", "the acceleration divided by time"], 0, "Think of the rectangle under the pace log.", "ut represents the distance the object would cover if it kept only its starting velocity for the whole time."),
        mcItem("M1L4_C7", "Why does s = (u + v) / 2 x t work only under constant acceleration here?", ["Because the average velocity sits halfway between u and v only for uniform change", "Because distance never depends on time", "Because u and v must both be zero", "Because the equation ignores acceleration completely"], 0, "The average-velocity shortcut depends on uniform change.", "It works because the average velocity sits halfway between u and v only when the velocity changes uniformly under constant acceleration."),
      ];
    case "M1_L5":
      return [
        mcItem("M1L5_C4", "Why must you name the graph before interpreting the slope?", ["Because slope meaning depends on the axes", "Because all slopes mean speed", "Because only speed-time graphs have slope", "Because units never matter"], 0, "The same steepness can describe different rates.", "You must name the graph first because the axes decide whether slope means speed, acceleration, or something else."),
        mcItem("M1L5_C5", "The same tilt appears on a progress log and a pace log. What can stay the same and what must change?", ["the visual steepness can stay the same, but the physical meaning must change", "both the steepness and the meaning must stay the same", "the meaning stays the same, but the steepness must change", "neither can be compared"], 0, "Separate geometry from physics meaning.", "The tilt can look the same, but the physical meaning changes because the axes are different."),
        mcItem("M1L5_C6", "Why does zero slope mean stop on a progress log but constant speed on a pace log?", ["Because the graphs record different quantities on the vertical axis", "Because zero always means rest on every graph", "Because pace logs do not use time", "Because progress logs ignore distance"], 0, "The vertical axis changes the story told by zero slope.", "Zero slope means different things because one graph records distance while the other records speed."),
        mcItem("M1L5_C7", "A point sits high on a pace log but the line there is flat. What is true?", ["the speed is high there and the acceleration is zero there", "the acceleration is high there and the speed is zero there", "both speed and acceleration must be high", "the graph cannot be physical"], 0, "Height and slope still do different jobs on the same graph.", "A high point shows high speed there, while a flat line shows zero acceleration there."),
      ];
    case "M1_L6":
      return [
        mcItem("M1L6_C4", "What does one thin strip under a pace log represent?", ["the distance gained during that small time interval", "the current speed only", "the acceleration only", "the graph height with no physical meaning"], 0, "A strip combines speed height and time width.", "One thin strip represents the distance gained during that small time interval because it is speed multiplied by time width."),
        mcItem("M1L6_C5", "Why can two different pace-log shapes give the same total distance?", ["Because equal total area can come from different shapes", "Because only the highest point matters", "Because the time axis can be ignored", "Because distance never depends on speed"], 0, "Area, not shape alone, controls the total distance.", "Two different pace-log shapes can give the same total distance if their total shaded areas are equal."),
        mcItem("M1L6_C6", "Why does a triangle under a pace log still count as distance?", ["Because its area still multiplies speed by time", "Because triangles always mean acceleration only", "Because only rectangles have physical meaning", "Because the height is distance directly"], 0, "Any area piece under a speed-time graph contributes distance.", "A triangle still counts as distance because its area still combines speed height with time width."),
        mcItem("M1L6_C7", "Which statement best explains why the area rule belongs to the pace log?", ["The axes are speed and time, so area accumulates distance", "Every graph area always gives distance", "Area works only when the graph is horizontal", "Distance-time area and speed-time area always mean the same thing"], 0, "The axes give the area its meaning.", "The area rule belongs to the pace log because the axes are speed and time, so the area accumulates distance."),
      ];
    case "F4_L1":
      return [
        mcItem("F4-L1-G1", "In the Flow-Grid model, what does stream rate represent in a circuit?", ["the battery voltage", "the current", "the resistance", "the switch state"], 1, "Stream rate tells how much passes a point each second.", "In the Flow-Grid model, stream rate represents current."),
        mcItem("F4-L1-G2", "Why is the current the same before and after a lamp in one complete loop?", ["The lamp creates extra charge", "The battery adds more charge after the lamp", "The same charge keeps circulating around one route", "Current gets stored briefly inside the lamp"], 2, "Think about one continuous route with no missing charge.", "In one complete loop, the same charge keeps circulating, so the current is the same before and after the lamp."),
        mcItem("F4-L1-G3", "Why is the statement 'the lamp uses up current' wrong?", ["Because lamps block all current", "Because current is the rate of charge flow, while the lamp transfers energy from the moving charge", "Because current only exists inside the battery", "Because current turns into voltage"], 1, "Separate charge flow from energy transfer.", "The statement is wrong because current is the rate of charge flow, while the lamp transfers energy from the moving charge."),
        mcItem("F4-L1-G4", "If a switch opens anywhere in a single-route circuit, what happens to the current everywhere else?", ["It keeps flowing past the battery only", "It becomes larger near the source", "It stops everywhere in the loop", "It splits into two smaller currents"], 2, "A broken single route stops the whole circulation.", "If a switch opens anywhere in a single-route circuit, the current stops everywhere in the loop."),
        mcItem("F4-L1-G5", "A current of 2 A means that each second...", ["2 C of charge pass a point", "2 J of energy are destroyed", "the battery loses 2 V", "2 charges stop at the lamp"], 0, "Current tells charge flow each second.", "A current of 2 A means 2 C of charge pass a point each second."),
        mcItem("F4-L1-G6", "What changes at a lamp even when the same current enters and leaves it?", ["the total amount of charge in the loop", "the direction of every charge permanently", "the electrical energy carried by the moving charge", "the number of routes in the circuit"], 2, "The charge keeps moving, but something useful is transferred.", "At a lamp, the electrical energy carried by the moving charge changes even though the same current enters and leaves it."),
      ];
    case "F4_L3":
      return [
        mcItem("F4-L3-G1", "In the Flow-Grid model, what does path difficulty stand for in an electric circuit?", ["resistance", "current", "voltage", "charge amount"], 0, "Path difficulty is the route's opposition to flow.", "In the Flow-Grid model, path difficulty stands for resistance."),
        mcItem("F4-L3-G2", "Why does a steeper straight I-V graph slope mean lower resistance?", ["Because more current flows for each volt", "Because voltage disappears faster", "Because charge is stored in the component", "Because steeper always means greater resistance"], 0, "The steeper line gives more current for the same voltage change.", "A steeper straight I-V graph slope means lower resistance because more current flows for each volt."),
        mcItem("F4-L3-G3", "If the path becomes harder but the source push stays the same, what happens to the current?", ["it increases", "it decreases", "it stays the same", "it becomes voltage"], 1, "Harder path means smaller stream rate at the same push.", "If the path becomes harder while the push stays the same, the current decreases."),
        mcItem("F4-L3-G4", "What does a straight I-V graph through the origin show for an ohmic component?", ["current is proportional to voltage", "resistance is being used up", "current does not depend on voltage", "the component stores charge"], 0, "A straight line through the origin shows direct proportionality.", "For an ohmic component, a straight I-V graph through the origin shows that current is proportional to voltage."),
        mcItem("F4-L3-G5", "At fixed voltage, which resistor carries the greater current?", ["the one with higher resistance", "the one with lower resistance", "both carry the same current", "you need the charge amount first"], 1, "At the same push, the easier path gives the greater flow.", "At fixed voltage, the resistor with lower resistance carries the greater current."),
        mcItem("F4-L3-G6", "Which relationship captures the Flow-Grid idea of stream rate = push / path difficulty?", ["I = V / R", "V = I / R", "R = V x I", "P = VI"], 0, "Current responds to push and difficulty in the same pattern.", "I = V / R matches the Flow-Grid idea that stream rate equals push divided by path difficulty."),
      ];
    default:
      return [];
  }
}

function masteryVariantsFromPool(items: UnknownRecord[], code: string): UnknownRecord[] {
  switch (code) {
    case "F2_L1":
      return [
        mcItem("F2-L1-X1", "A drone flies 18 m north and then 18 m south. Which statement is correct?", ["distance 0 m, displacement 0 m", "distance 18 m, displacement 18 m north", "distance 36 m, displacement 0 m", "distance 36 m, displacement 36 m north"], 2, "Distance totals the full route, while displacement compares the finish with the start.", "The drone travelled 36 m in total and finished back at the start, so its displacement is 0 m."),
        shortItem("F2-L1-X2", "A shuttle covers 210 m in 35 s. What is the average speed?", ["6", "6 m/s"], "Use total distance divided by total time."),
        mcItem("F2-L1-X3", "A hiker walks 14 m east, 9 m west, and then 4 m east. Which pair is correct?", ["distance 9 m, displacement 9 m east", "distance 27 m, displacement 9 m east", "distance 27 m, displacement 27 m east", "distance 18 m, displacement 9 m east"], 1, "Add every stage for distance, then compare the finishing point with the starting point for displacement.", "The full path is 27 m and the net change is 9 m east."),
        mcItem("F2-L1-X4", "Which quantity can be zero even when a journey covers a long route?", ["distance", "average speed", "displacement", "time"], 2, "A round trip can return to the starting point even though distance was covered.", "Displacement can be zero if the object finishes where it started."),
        mcItem("F2-L1-X5", "A runner goes 30 m east and then 12 m west. What is the displacement?", ["18 m east", "18 m", "42 m east", "42 m"], 0, "Displacement keeps the net change and the direction.", "The runner ends 18 m east of the start, so the displacement is 18 m east."),
        mcItem("F2-L1-X6", "Which quantity is a vector in this lesson?", ["distance", "average speed", "displacement", "time"], 2, "Look for the quantity that needs both size and direction.", "Displacement is a vector because it needs both magnitude and direction."),
        shortItem("F2-L1-X7", "A cyclist travels 180 m in 30 s. What is the average speed?", ["6", "6 m/s"], "Use the whole distance and the whole time."),
        mcItem("F2-L1-X8", "Why can distance and displacement be different for the same trip?", ["Distance uses the whole path but displacement only compares finish with start", "Displacement includes time but distance does not", "Distance is always smaller than displacement", "Displacement ignores direction"], 0, "One quantity totals the route while the other looks only at the net change.", "Distance adds every part of the path, but displacement only compares the finishing point with the starting point."),
        mcItem("F2-L1-X9", "A learner walks 8 m north and then 6 m south. Which pair is correct?", ["distance 2 m, displacement 2 m north", "distance 14 m, displacement 2 m north", "distance 14 m, displacement 14 m north", "distance 2 m, displacement 14 m north"], 1, "Distance adds both stages, while displacement compares the final position with the starting point.", "The learner travels 14 m in total and ends 2 m north of the start."),
        mcItem("F2-L1-X10", "Which statement about average speed is correct?", ["Use total distance and total time for the whole journey", "Use displacement divided by time for every average-speed question", "Use only the fastest stage of the trip", "Average speed must include a direction word"], 0, "Average speed is based on the entire journey, not a single segment.", "Average speed uses the total distance covered divided by the total time taken."),
      ];
    case "F2_L2":
      return [
        mcItem("F2-L2-X1", "Velocity changes from 3 m/s to 11 m/s in 4 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "8 m/s^2"], 1, "Use change in velocity divided by time.", "The velocity changes by 8 m/s in 4 s, so the acceleration is 2 m/s^2."),
        shortItem("F2-L2-X2", "Velocity changes from -2 m/s to 4 m/s in 3 s. What is the acceleration?", ["2 m/s^2"], "Subtract initial velocity from final velocity before dividing by time."),
        mcItem("F2-L2-X3", "An object keeps the same velocity for 5 s. What is its acceleration?", ["-5 m/s^2", "0 m/s^2", "1 m/s^2", "5 m/s^2"], 1, "No change in velocity means zero acceleration.", "If velocity does not change, the acceleration is 0 m/s^2."),
        mcItem("F2-L2-X4", "Why can acceleration be non-zero even if speed stays the same?", ["Because acceleration depends on mass only", "Because a change in direction also changes velocity", "Because time becomes negative", "Because speed and velocity are identical"], 1, "Velocity depends on direction as well as speed.", "Acceleration can be non-zero because a direction change is still a velocity change."),
        mcItem("F2-L2-X5", "If forward is positive, a velocity changes from 8 m/s to 2 m/s in 3 s. What is the acceleration?", ["-2 m/s^2", "2 m/s^2", "-6 m/s^2", "6 m/s^2"], 0, "Use final velocity minus initial velocity, then divide by time.", "The change in velocity is -6 m/s over 3 s, so the acceleration is -2 m/s^2."),
        mcItem("F2-L2-X6", "Which statement best defines acceleration?", ["Rate of change of velocity", "Distance travelled each second", "Force divided by time", "Mass multiplied by speed"], 0, "Acceleration tells you how velocity changes with time.", "Acceleration is the rate of change of velocity."),
        shortItem("F2-L2-X7", "Velocity changes from 5 m/s to -1 m/s in 2 s. What is the acceleration?", ["-3 m/s^2", "-3 m/s/s"], "Use final velocity minus initial velocity, then divide by the time."),
        mcItem("F2-L2-X8", "A car moves east and has an acceleration toward the west. What happens to its speed?", ["It gets slower", "It gets faster", "It must stay constant", "It becomes zero immediately"], 0, "Acceleration opposite to the current velocity reduces the speed.", "If acceleration points opposite to the motion, the speed decreases."),
        mcItem("F2-L2-X9", "What does a negative acceleration tell you by itself?", ["The acceleration points in the chosen negative direction", "The object must be slowing down", "The object must move backwards", "The object must be stationary"], 0, "The sign tells you direction relative to the chosen positive direction, not automatically whether the speed rises or falls.", "A negative acceleration points in the chosen negative direction."),
        mcItem("F2-L2-X10", "Which setup is correct for calculating acceleration?", ["(final velocity - initial velocity) / time", "(initial velocity - final velocity) / time always", "distance / time", "force x mass"], 0, "Use the change in velocity over the time taken.", "Acceleration is calculated as final velocity minus initial velocity, divided by time."),
      ];
    case "F2_L3":
      return [
        mcItem("F2-L3-X1", "A horizontal section on a distance-time graph shows that the object is...", ["speeding up", "stopped", "moving backwards", "accelerating negatively"], 1, "If the distance does not change, the object is not moving.", "A horizontal section means the distance stays constant, so the object is stopped."),
        shortItem("F2-L3-X2", "A graph rises by 18 m in 6 s on one straight section. What speed does that section show?", ["3 m/s"], "Use slope = distance change / time change for that section."),
        mcItem("F2-L3-X3", "If the graph is at 24 m when t = 6 s, what does 24 m mean?", ["the speed at 6 s is 24 m/s", "the total distance covered by 6 s is 24 m", "the object has 24 s left to move", "the acceleration is 24 m/s^2"], 1, "Read the graph height as distance, not speed.", "The graph height tells you the total distance covered by that time, so 24 m means 24 m has been covered by 6 s."),
        mcItem("F2-L3-X4", "Two straight sections have the same steepness. What does that mean?", ["the object stopped in both sections", "the object moved with the same speed in both sections", "the object moved backwards in one section", "the object had zero distance in both sections"], 1, "Equal slope means equal speed on a distance-time graph.", "The same steepness means the same speed because slope represents speed."),
        mcItem("F2-L3-X5", "If a distance-time graph becomes less steep later, what does that mean?", ["the object is moving faster", "the object is moving slower", "the object must be moving backwards", "the object has zero distance"], 1, "A smaller slope means a smaller speed.", "A less-steep section means the speed is smaller later."),
        shortItem("F2-L3-X6", "A graph is flat from 3 s to 7 s. For how long is the object stopped?", ["4 s", "4"], "Use the time interval covered by the flat section."),
        mcItem("F2-L3-X7", "Which section of a distance-time graph shows the greater speed?", ["the steeper straight section", "the flatter straight section", "the horizontal section", "all sections show the same speed"], 0, "Steeper slope means greater speed on a distance-time graph.", "The steeper straight section represents the greater speed."),
        mcItem("F2-L3-X8", "Why does a flat section not mean the object is moving backwards?", ["Because time is not changing", "Because the distance stays unchanged while time still passes", "Because the graph has become vertical", "Because the speed must be negative"], 1, "A flat line means no change in distance.", "A flat section means the distance is staying the same while time passes, so the object is stationary rather than moving backwards."),
        mcItem("F2-L3-X9", "A straight distance-time graph keeps the same slope for the whole interval. The object is...", ["speeding up", "stopping and starting", "moving at constant speed", "moving backwards"], 2, "A constant slope means the speed stays the same.", "If the slope stays the same, the object is moving at constant speed."),
        mcItem("F2-L3-X10", "Which statement about a distance-time graph is correct?", ["A higher point always means a greater speed", "Slope shows speed, while graph height shows distance covered", "A flat section means the object moves backward", "A steeper line means less distance is added each second"], 1, "Keep graph height and slope doing different jobs.", "Slope tells you the speed, while the graph height tells you how much distance has been covered by that time."),
      ];
    case "F2_L4":
      return [
        mcItem("F2-L4-X1", "What does the area under a velocity-time graph represent?", ["force", "displacement", "acceleration", "mass"], 1, "Area combines velocity with time.", "The area under a velocity-time graph represents displacement."),
        shortItem("F2-L4-X2", "An object moves at 6 m/s for 4 s. What displacement is shown by the graph area?", ["24 m"], "For constant velocity, displacement is velocity multiplied by time."),
        mcItem("F2-L4-X3", "Velocity rises from 4 m/s to 10 m/s in 3 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "6 m/s^2"], 1, "Use slope = change in velocity / time.", "The velocity changes by 6 m/s in 3 s, so the acceleration is 2 m/s^2."),
        mcItem("F2-L4-X4", "Which statement correctly matches the graph feature to the quantity?", ["slope gives displacement and area gives acceleration", "slope gives acceleration and area gives displacement", "both slope and area give velocity only", "neither slope nor area has physical meaning"], 1, "Do not swap the two interpretations.", "On a velocity-time graph, slope gives acceleration and area gives displacement."),
        mcItem("F2-L4-X5", "A horizontal line at 5 m/s on a velocity-time graph means...", ["constant velocity of 5 m/s", "constant acceleration of 5 m/s^2", "zero displacement", "the object is stopped"], 0, "A horizontal line means the velocity is staying the same.", "A horizontal line at 5 m/s means the object keeps a constant velocity of 5 m/s."),
        mcItem("F2-L4-X6", "What does a section below the time axis mean on a velocity-time graph?", ["The object has velocity in the chosen negative direction", "The object has zero time", "The mass has become negative", "The graph is measuring force instead"], 0, "Below the time axis means negative velocity relative to the chosen positive direction.", "A region below the time axis shows velocity in the negative direction."),
        shortItem("F2-L4-X7", "Velocity falls from 9 m/s to 3 m/s in 2 s. What is the acceleration?", ["-3 m/s^2", "-3 m/s/s"], "Use the slope: change in velocity divided by time."),
        mcItem("F2-L4-X8", "Why can one velocity-time graph answer two different questions?", ["Because slope gives acceleration while area gives displacement", "Because the graph also shows mass directly", "Because every graph automatically shows force", "Because the time axis changes units halfway through"], 0, "Slope and area are two different readings from the same graph.", "The slope tells you acceleration, while the area under the graph tells you displacement."),
        mcItem("F2-L4-X9", "An object travels at 4 m/s for 5 s. What displacement does the velocity-time area show?", ["9 m", "20 m", "1.25 m", "4 m"], 1, "For a constant-velocity rectangle, multiply velocity by time.", "The displacement is 4 x 5 = 20 m."),
        mcItem("F2-L4-X10", "Which statement about slope on a velocity-time graph is correct?", ["A steeper slope means a larger acceleration magnitude", "Slope tells you displacement directly", "A horizontal line always means zero displacement", "Slope and area always give the same quantity"], 0, "On a velocity-time graph, slope is about how quickly velocity changes.", "A steeper slope means the velocity is changing more quickly, so the acceleration magnitude is larger."),
      ];
    case "F2_L5":
      return [
        mcItem("F2-L5-X1", "8 N right and 8 N left give a resultant force of...", ["0 N", "8 N right", "16 N right", "4 N right"], 0, "Equal opposite forces cancel completely.", "The resultant force is 0 N because the forces are equal and opposite."),
        shortItem("F2-L5-X2", "11 N right and 4 N left give what resultant force?", ["7 N right"], "Subtract opposite forces and keep the direction of the larger force."),
        mcItem("F2-L5-X3", "If the resultant force on a moving object is zero, the object can...", ["keep moving at constant velocity", "only stop", "speed up automatically", "reverse direction without a force"], 0, "Zero resultant force means zero acceleration.", "The object can keep moving at constant velocity because zero resultant force means no acceleration."),
        mcItem("F2-L5-X4", "Two forces of 3 N and 5 N both act to the right. What is the resultant force?", ["2 N right", "8 N right", "5 N right", "0 N"], 1, "Forces in the same direction add together.", "The resultant force is 8 N right because the forces act in the same direction."),
        mcItem("F2-L5-X5", "What does resultant force mean?", ["the net force left after combining all the forces with direction", "the largest single force in the diagram", "the force that appears first in the question", "the same thing as mass"], 0, "Resultant force is the overall force after the vector combination.", "Resultant force is the net force left after all the forces have been combined with direction."),
        mcItem("F2-L5-X6", "Balanced forces mean...", ["zero resultant force", "the object must be at rest", "the forces are always small", "the object must move left"], 0, "Balanced forces cancel to zero resultant force.", "Balanced forces mean the resultant force is zero."),
        mcItem("F2-L5-X7", "A car is moving to the right and the resultant force becomes zero. What happens next?", ["It keeps moving to the right at constant velocity", "It must stop immediately", "It speeds up to the right", "It reverses direction"], 0, "Zero resultant force means no acceleration, so the current motion stays unchanged.", "The car keeps moving to the right at constant velocity because zero resultant force means zero acceleration."),
        mcItem("F2-L5-X8", "A box has 9 N right, 5 N left, and 2 N right acting on it. What is the resultant force?", ["2 N right", "6 N right", "6 N left", "16 N right"], 1, "Add the forces on the same side before comparing the two directions.", "The total rightward force is 11 N and the leftward force is 5 N, so the resultant force is 6 N right."),
        mcItem("F2-L5-X9", "If the forces on an object are unbalanced, what must be true?", ["It has acceleration in the direction of the resultant", "It must already be moving", "Its mass must be changing", "Its velocity must be zero"], 0, "Unbalanced forces create a non-zero resultant force, so there is acceleration.", "If the forces are unbalanced, the object accelerates in the direction of the resultant force."),
        shortItem("F2-L5-X10", "6 N left and 6 N right act on a trolley. What is the resultant force?", ["0 N", "0"], "Equal opposite forces cancel completely, so no force is left over."),
      ];
    case "F2_L6":
      return [
        mcItem("F2-L6-X1", "A 15 N resultant force acts on a 5 kg trolley. What is the acceleration?", ["2 m/s^2", "3 m/s^2", "5 m/s^2", "15 m/s^2"], 1, "Use a = F / m.", "15 N divided by 5 kg gives 3 m/s^2."),
        shortItem("F2-L6-X2", "A 4 kg trolley accelerates at 2.5 m/s^2. What resultant force acts on it?", ["10 N"], "Use F = ma."),
        mcItem("F2-L6-X3", "The same force acts on a 2 kg trolley and a 6 kg trolley. Which trolley accelerates more?", ["the 2 kg trolley", "the 6 kg trolley", "both equally", "neither trolley"], 0, "For the same force, the smaller mass accelerates more.", "The 2 kg trolley accelerates more because a smaller mass gives a larger acceleration for the same force."),
        mcItem("F2-L6-X4", "If the mass doubles while the same resultant force acts, the acceleration...", ["doubles", "halves", "stays the same", "must become negative"], 1, "Acceleration is inversely related to mass when force is fixed.", "The acceleration halves if the mass doubles while the force stays the same."),
        mcItem("F2-L6-X5", "If the resultant force doubles while the same mass acts, the acceleration...", ["doubles", "halves", "stays the same", "must become zero"], 0, "For fixed mass, acceleration changes in the same ratio as force.", "If the force doubles while the mass stays fixed, the acceleration doubles too."),
        mcItem("F2-L6-X6", "If both the resultant force and the mass double, what happens to the acceleration?", ["It stays the same", "It doubles", "It halves", "It becomes zero"], 0, "Use a = F / m and compare the ratio before and after.", "If both force and mass double, their ratio stays the same, so the acceleration stays the same."),
        mcItem("F2-L6-X7", "Which force should be used in F = ma?", ["the resultant force", "the smallest force only", "the friction force only", "the first force mentioned"], 0, "The equation uses the net force after all forces are combined.", "F = ma uses the resultant force, not just any one force from the diagram."),
        mcItem("F2-L6-X8", "Why is a heavier trolley harder to accelerate with the same push?", ["A larger mass gives a smaller acceleration for the same force", "A larger mass removes the force", "A larger mass always makes acceleration negative", "A larger mass changes the units of force"], 0, "Mass resists changes in motion.", "A heavier trolley is harder to accelerate because a larger mass gives less acceleration for the same force."),
        mcItem("F2-L6-X9", "What does inertia describe?", ["resistance to changes in motion", "the force that always makes objects speed up", "the area under a graph", "the unit of acceleration"], 0, "Inertia is not an extra force; it is a property of matter.", "Inertia describes resistance to changes in motion."),
        mcItem("F2-L6-X10", "If a trolley's mass doubles and you want the same acceleration, what must happen to the resultant force?", ["It must double", "It must halve", "It must stay the same", "It must reverse direction"], 0, "Rearrange F = ma and keep the acceleration fixed.", "If the mass doubles and the acceleration is to stay the same, the resultant force must double."),
      ];
    case "F3_L1":
      return [
        mcItem("F3-L1-X1", "Which situation definitely involves work being done on an object?", ["A box moves in the direction of the push", "A wall is pushed but never moves", "A book rests on a desk", "A force is mentioned without movement"], 0, "Work needs movement in the force direction.", "Work is done when a force transfers energy by moving the object in its direction."),
        shortItem("F3-L1-X2", "A 20 N force pulls a crate 4 m in the same direction. What work is done?", ["80 J"], "Use work = force x distance."),
        mcItem("F3-L1-X3", "If the object does not move, the work done by that force on the object is...", ["zero", "equal to the force size", "equal to the mass", "always positive"], 0, "No movement means no work by that force.", "Without displacement in the force direction, no work is done on the object."),
        shortItem("F3-L1-X4", "A force does 120 J of work while moving an object 6 m. What is the force?", ["20 N"], "Rearrange work = force x distance."),
        shortItem("F3-L1-X5", "A 15 N force does 90 J of work in the same direction as the motion. How far does the object move?", ["6 m", "6"], "Rearrange work = force x distance to distance = work / force."),
        mcItem("F3-L1-X6", "Why does direction matter in a simple work calculation?", ["Because work uses movement in the force direction", "Because mass changes the direction automatically", "Because work is always a vector", "Because time replaces distance"], 0, "Keep the displacement aligned with the force in this lesson's work model.", "Direction matters because only movement in the force direction counts in the simple work calculation."),
        mcItem("F3-L1-X7", "A student pushes hard on a wall for 10 s, but the wall never moves. What work is done on the wall by that push?", ["0 J", "10 J", "equal to the push force", "it must be negative"], 0, "A force alone is not enough; there must be displacement in the force direction.", "No displacement means no work is done on the wall by that force."),
        mcItem("F3-L1-X8", "Which statement best explains what work means in this lesson?", ["Work is energy transferred by a force through displacement", "Work is the same thing as effort", "Work depends only on how long the force acts", "Work is the mass of the object multiplied by distance"], 0, "Treat work as an energy-transfer idea, not as everyday effort.", "Work is the energy transferred when a force moves an object through a distance in its direction."),
        mcItem("F3-L1-X9", "Two pushes act in the same direction on identical boxes. Push A is 10 N for 5 m and Push B is 20 N for 5 m. Which does more work?", ["Push A", "Push B", "They do the same work", "You need the time taken"], 1, "Compare force x distance in each case.", "Push B does more work because 20 x 5 is larger than 10 x 5."),
        mcItem("F3-L1-X10", "Two pulls both use a 12 N force. Pull A moves 2 m and Pull B moves 6 m in the force direction. Which transfers more energy as work?", ["Pull A", "Pull B", "They transfer the same work", "Neither because the force is the same"], 1, "For the same force, the greater distance gives the greater work.", "Pull B transfers more energy as work because the same force acts through a larger distance."),
      ];
    case "F3_L2":
      return [
        mcItem("F3-L2-X1", "If speed doubles while mass stays the same, kinetic energy becomes...", ["twice as large", "four times as large", "six times as large", "unchanged"], 1, "Speed is squared in the kinetic energy formula.", "Doubling speed quadruples kinetic energy because v is squared."),
        mcItem("F3-L2-X2", "If mass doubles while speed stays the same, kinetic energy becomes...", ["half as large", "twice as large", "four times as large", "unchanged"], 1, "Mass changes kinetic energy in direct proportion when speed stays fixed.", "Doubling the mass doubles the kinetic energy because mass is a direct multiplier in KE = 0.5mv^2."),
        mcItem("F3-L2-X3", "Two identical trolleys move at 3 m/s and 6 m/s. How does the faster trolley's kinetic energy compare?", ["It is twice as large", "It is three times as large", "It is four times as large", "It is six times as large"], 2, "Compare the speeds using the squared relationship.", "Doubling the speed from 3 m/s to 6 m/s makes the kinetic energy four times as large."),
        shortItem("F3-L2-X4", "A 2 kg trolley moves at 5 m/s. What is its kinetic energy?", ["25 J", "25 j", "25"], "Use KE = 0.5mv^2."),
        mcItem("F3-L2-X5", "Which change directly increases gravitational potential energy for the same object near Earth?", ["Making it move faster", "Raising it higher above the reference level", "Reducing the time taken to lift it", "Changing its direction only"], 1, "GPE depends on mass, g, and height.", "Gravitational potential energy increases when the object's height above the chosen reference level increases."),
        mcItem("F3-L2-X6", "A 4 kg bag is lifted 3 m. Take g = 10 N/kg. What gravitational potential energy is gained?", ["30 J", "40 J", "120 J", "240 J"], 2, "Use GPE = mgh.", "4 x 10 x 3 = 120 J."),
        mcItem("F3-L2-X7", "A climber raises the same backpack from 2 m to 5 m above the ground. What happens to its gravitational potential energy?", ["It decreases because the backpack is farther from the ground", "It stays the same because the mass did not change", "It increases because the height above the reference level increased", "It becomes kinetic energy immediately"], 2, "Use the change in height relative to the reference level.", "The backpack gains gravitational potential energy because its height above the reference level increases."),
        mcItem("F3-L2-X8", "Which situation gives an object mainly gravitational potential energy rather than kinetic energy?", ["A ball rolling quickly along the floor", "A cyclist speeding downhill", "A book resting on a high shelf", "A trolley moving at constant speed on a flat track"], 2, "Look for stored energy due to position, not motion.", "A book resting on a high shelf has gravitational potential energy because of its height, not because it is moving."),
        mcItem("F3-L2-X9", "As an object falls freely, which change is correct?", ["GPE rises while KE falls", "GPE falls while KE rises", "both stay fixed", "both become zero"], 1, "Falling converts gravitational potential energy into kinetic energy.", "As the object falls, gravitational potential energy decreases while kinetic energy increases."),
        mcItem("F3-L2-X10", "Which comparison best explains why speed affects kinetic energy more strongly than mass?", ["Doubling speed quadruples KE, while doubling mass only doubles KE", "Doubling speed doubles KE, while doubling mass quadruples KE", "Mass and speed always change KE by exactly the same factor", "Only mass matters in the kinetic energy formula"], 0, "Compare the direct mass factor with the squared speed factor.", "Mass changes KE directly, but speed is squared, so speed changes have the stronger effect."),
      ];
    case "F3_L3":
      return [
        mcItem("F3-L3-X1", "A machine transfers 600 J in 3 s. What is its power?", ["50 W", "100 W", "200 W", "600 W"], 2, "Use power = energy transferred / time.", "600 / 3 = 200 W."),
        mcItem("F3-L3-X2", "A device takes in 500 J and gives 350 J useful output. What is its efficiency?", ["35%", "50%", "70%", "85%"], 2, "Efficiency = useful output / input x 100%.", "350 / 500 = 70%."),
        shortItem("F3-L3-X3", "A motor with power 120 W runs for 5 s. How much energy is transferred?", ["600 J", "600 j", "600"], "Use energy = power x time."),
        mcItem("F3-L3-X4", "Which statement is true?", ["A process can be powerful without being very efficient", "Power and efficiency always mean the same thing", "Efficiency can be more than 100%", "A slow process must be efficient"], 0, "Power and efficiency describe different ideas.", "A machine can transfer energy quickly yet still waste a large fraction of the input."),
        mcItem("F3-L3-X5", "Two machines each transfer 800 J. Machine A takes 4 s and Machine B takes 8 s. Which is more powerful?", ["Machine A", "Machine B", "They have the same power", "It depends on efficiency only"], 0, "For the same energy transfer, the shorter time means the greater power.", "Machine A is more powerful because it transfers the same 800 J in less time."),
        shortItem("F3-L3-X6", "A machine is 80% efficient and takes in 500 J. How much useful output does it deliver?", ["400 J", "400 j", "400"], "Find 80% of the total input energy."),
        mcItem("F3-L3-X7", "A device takes in 1000 J and delivers 600 J as useful output. How much energy is wasted?", ["400 J", "600 J", "1000 J", "1600 J"], 0, "Wasted energy is the input minus the useful output.", "The wasted energy is 1000 J - 600 J = 400 J."),
        mcItem("F3-L3-X8", "Which statement best separates power from efficiency?", ["Power tells how quickly energy is transferred, while efficiency tells what fraction becomes useful output", "Power and efficiency are just two names for the same quantity", "Efficiency tells how quickly work is done, while power tells how much is wasted", "A more powerful device is always more efficient"], 0, "Keep rate and useful fraction as two separate ideas.", "Power measures the rate of energy transfer, while efficiency measures the useful fraction of the input."),
        shortItem("F3-L3-X9", "A heater transfers 900 J with a power of 150 W. How long does it run for?", ["6 s", "6", "6 sec", "6 seconds"], "Rearrange power = energy / time to time = energy / power."),
        mcItem("F3-L3-X10", "Two devices are both 60% efficient. One transfers 1200 J in 6 s and the other transfers 1200 J in 3 s. What is true?", ["They are equally efficient, but the second device is more powerful", "They have the same power because their efficiency matches", "The first device is more powerful because it runs longer", "The second device must be more efficient because it is faster"], 0, "Matching efficiency does not force the power to match as well.", "Both devices convert the same fraction of input into useful output, but the second transfers the energy in less time so it has the greater power."),
      ];
    case "F3_L4":
      return [
        mcItem("F3-L4-X1", "A 3 kg trolley moves at 4 m/s east. What is its momentum?", ["7 kg m/s east", "12 kg m/s east", "12 kg m/s", "1 kg m/s east"], 1, "Use momentum = mass x velocity and keep direction.", "3 x 4 = 12 kg m/s east."),
        shortItem("F3-L4-X2", "A 2 kg trolley moving at 6 m/s sticks to a 4 kg trolley at rest. What common speed do they have afterward?", ["2 m/s"], "Use conservation of momentum for the whole system."),
        mcItem("F3-L4-X3", "Two equal trolleys move in opposite directions with equal speed. The total momentum is...", ["zero", "equal to one trolley", "double one trolley", "impossible to tell"], 0, "Equal and opposite momenta cancel in the total.", "Opposite equal momenta give zero total momentum."),
        mcItem("F3-L4-X4", "Conservation of momentum is most direct when...", ["external forces during the interaction are negligible", "the heavier object always wins", "one object is stationary", "the collision lasts a long time"], 0, "Treat conservation as a whole-system rule for isolated interactions.", "You use conservation most directly when outside forces are negligible during the interaction."),
        shortItem("F3-L4-X5", "A 4 kg trolley moves at 3 m/s west. What is its momentum?", ["12 kg m/s west", "12 kg m/s to the west"], "Use momentum = mass x velocity and keep the direction."),
        mcItem("F3-L4-X6", "Why must momentum keep direction in collision problems?", ["Because momentum is a vector quantity", "Because momentum is always positive", "Because direction only matters for force", "Because mass cancels the direction"], 0, "Momentum depends on velocity, and velocity includes direction.", "Momentum is a vector quantity, so direction must be included."),
        mcItem("F3-L4-X7", "Which statement best gives the law of conservation of linear momentum?", ["Total momentum before an interaction equals total momentum after if external forces are negligible", "Each object keeps its own momentum unchanged in every collision", "The faster object always has the greater final momentum", "Momentum is only conserved when both masses are equal"], 0, "Treat conservation as a whole-system rule, not a one-object rule.", "For an isolated system, total momentum before the interaction equals total momentum after it."),
        mcItem("F3-L4-X8", "A 2 kg trolley moves right at 5 m/s and a 2 kg trolley moves left at 5 m/s. What is the total momentum?", ["0 kg m/s", "10 kg m/s right", "20 kg m/s right", "5 kg m/s left"], 0, "Equal and opposite momenta cancel when combined.", "The total momentum is zero because the two momenta are equal and opposite."),
        mcItem("F3-L4-X9", "After a sticking collision, why can the shared speed be smaller than the original incoming speed?", ["The same total momentum is shared by a larger total mass", "Momentum disappears during the collision", "The heavier object always stops the lighter one completely", "The final velocity must always be zero"], 0, "The total momentum stays the same, but the combined mass is larger.", "When the objects stick, the same total momentum is carried by a larger total mass, so the shared speed can be smaller."),
        shortItem("F3-L4-X10", "A 3 kg trolley moving at 4 m/s hits a 1 kg trolley at rest and they stick together. What common speed do they have afterward?", ["3 m/s"], "Use total momentum before = total momentum after, then divide by the combined mass."),
      ];
    case "F3_L5":
      return [
        mcItem("F3-L5-X1", "Impulse is equal to...", ["force x time", "force / time", "momentum / time", "mass x acceleration only"], 0, "Impulse is the product of force and time.", "Impulse equals force multiplied by time, and it matches the change in momentum."),
        shortItem("F3-L5-X2", "A force of 150 N acts for 0.4 s. What impulse is delivered?", ["60 N s", "60 Ns", "60 kg m/s"], "Use impulse = force x time."),
        mcItem("F3-L5-X3", "If the same momentum change happens over a longer time, the average force is...", ["larger", "smaller", "unchanged", "zero"], 1, "For a fixed impulse, more time means less force.", "The same momentum change spread over longer time gives a smaller average force."),
        mcItem("F3-L5-X4", "What does the area under a force-time graph represent?", ["velocity", "impulse", "power", "mass"], 1, "Force-time area gives impulse.", "The area represents impulse, which equals the change in momentum."),
        shortItem("F3-L5-X5", "A 300 N force acts for 0.2 s. What impulse is delivered?", ["60 N s", "60 Ns", "60 kg m/s"], "Use impulse = force x time."),
        mcItem("F3-L5-X6", "If two force-time rectangles have the same area, they have the same...", ["impulse", "power", "mass", "velocity"], 0, "Equal area under a force-time graph means equal impulse.", "Equal force-time area means equal impulse."),
        mcItem("F3-L5-X7", "Why does catching an egg with moving hands reduce the force?", ["It increases the stopping time for the same momentum change", "It removes the egg's mass", "It makes the egg's speed increase", "It reduces gravity to zero"], 0, "Stretching the stop over more time reduces the average force.", "Moving your hands backward increases the stopping time, so the same momentum change happens with a smaller average force."),
        mcItem("F3-L5-X8", "Which statement best links impulse to momentum?", ["Impulse equals the change in momentum", "Impulse is momentum divided by time", "Impulse is the same as speed", "Impulse only applies when objects stop"], 0, "Impulse measures how much the momentum changes.", "Impulse equals the change in momentum."),
        mcItem("F3-L5-X9", "For the same impulse, what happens if the interaction time halves?", ["The average force doubles", "The average force halves", "The momentum change becomes zero", "The mass must double"], 0, "The same impulse delivered in less time needs more force.", "If the same impulse happens in half the time, the average force doubles."),
        mcItem("F3-L5-X10", "What is the clearest reason the area under a force-time graph matters in collision physics?", ["It tells you the impulse and therefore the momentum change", "It tells you the mass of the object", "It gives the velocity directly", "It shows the power used in the collision"], 0, "The area links graph reading to impulse and momentum change.", "The area under a force-time graph gives the impulse, which tells you the change in momentum."),
      ];
    case "F3_L6":
      return [
        mcItem("F3-L6-X1", "A 1000 kg car moves at 12 m/s. What is its momentum?", ["1200 kg m/s", "12000 kg m/s", "120000 kg m/s", "6000 kg m/s"], 1, "Use momentum = mass x velocity.", "1000 x 12 = 12000 kg m/s."),
        shortItem("F3-L6-X2", "A 900 kg car moves at 10 m/s. What is its kinetic energy?", ["45000 J", "45000 j", "45000"], "Use KE = 1/2 mv^2."),
        mcItem("F3-L6-X3", "If the speed of the same car doubles, its kinetic energy becomes...", ["twice as large", "three times as large", "four times as large", "unchanged"], 2, "Kinetic energy depends on speed squared.", "Doubling speed quadruples kinetic energy."),
        shortItem("F3-L6-X4", "A car changes momentum by 6000 kg m/s in 0.3 s. What average force acts?", ["20000 N"], "Use force = change in momentum / time."),
        mcItem("F3-L6-X5", "Why does a crumple zone reduce injury risk?", ["It removes mass", "It increases stopping time and lowers average force", "It increases speed", "It makes kinetic energy disappear instantly"], 1, "Safety features often work by stretching the stop over more time.", "A longer stopping time reduces the average force for the same momentum change."),
        mcItem("F3-L6-X6", "A car and a truck move at the same speed. Which has the greater momentum?", ["the car", "the truck", "they have the same momentum", "you need the stopping time first"], 1, "At the same speed, the vehicle with the larger mass has the greater momentum.", "The truck has the greater momentum because momentum depends on mass as well as speed."),
        mcItem("F3-L6-X7", "Which comparison is correct when the same car doubles its speed?", ["momentum doubles and kinetic energy quadruples", "momentum quadruples and kinetic energy doubles", "both momentum and kinetic energy only double", "momentum stays the same and kinetic energy doubles"], 0, "Momentum depends directly on speed, but kinetic energy depends on speed squared.", "Doubling speed doubles the momentum and quadruples the kinetic energy."),
        mcItem("F3-L6-X8", "If the same momentum change happens over twice the stopping time, the average braking force is...", ["twice as large", "half as large", "unchanged", "zero"], 1, "For the same momentum change, increasing the stopping time reduces the average force.", "Doubling the stopping time halves the average force for the same momentum change."),
        mcItem("F3-L6-X9", "Why is high-speed braking especially dangerous?", ["Only the mass matters once the brakes are applied", "Momentum and kinetic energy are both larger, and kinetic energy rises especially quickly", "Stopping time always falls to zero at higher speed", "The car becomes lighter as it moves faster"], 1, "Use both momentum and energy reasoning together here.", "Higher speed makes the momentum change larger and also increases kinetic energy very strongly because speed is squared."),
        shortItem("F3-L6-X10", "A 900 kg car slows from 20 m/s to rest in 2 s. What average braking force acts?", ["9000 N"], "Find the momentum change first, then divide by the stopping time."),
      ];
    case "M1_L1":
      return [
        mcItem("M1L1_T8", "Which statement best captures the Quest-Log warning about graphs?", ["The lane is where motion happens, and the log is how motion is recorded", "The graph is the road drawn from above", "The highest point is always the fastest point", "A flat graph always means moving backward"], 0, "This lesson begins by separating the motion world from the graph world.", "The key rule is that the lane is where motion happens, and the log is how motion is recorded."),
        mcItem("M1L1_T9", "A progress log is steep, then flat, then steep again. Which story fits best?", ["move, pause, move again", "high speed, reverse, disappear", "uphill, flat road, downhill", "stop, then move backward, then stop"], 0, "Read each segment as a motion story, not a road picture.", "A steep rise, then a flat section, then another rise means move, pause, then move again."),
        mcItem("M1L1_T10", "Why does a later point that is higher on the graph not have to be faster than an earlier point?", ["Because speed depends on slope, not graph height", "Because later times remove the idea of speed", "Because distance-time graphs do not show time", "Because higher points always mean lower speed"], 0, "Keep height and slope doing different jobs.", "A higher point only means more distance has been recorded by that time; speed still comes from the slope."),
        mcItem("M1L1_T11", "Two mission logs finish at 40 m. Log A has a pause and Log B does not. What is true?", ["They can have the same final distance but different pace histories", "They must have the same speed at every moment", "The paused run must have gone farther", "The unpaused run cannot be real"], 0, "Equal finish does not force equal story.", "The same final distance can come from different pace histories, including runs with pauses."),
        mcItem("M1L1_T12", "A student says a curved progress log proves the lane is curved. What is the best correction?", ["The curve is telling you that the pace is changing, not that the lane bends", "Curved graphs always mean circular motion", "Only straight graphs can represent real motion", "The student is correct"], 0, "The graph records how progress changes with time.", "A curved progress log means the pace is changing; it does not prove the physical lane bends."),
        shortItem("M1L1_T13", "A straight progress-log segment rises by 24 m in 6 s. What pace does that segment represent?", ["4", "4 m/s"], "Use the gradient of the straight segment."),
        mcItem("M1L1_T14", "What do parallel straight segments on a progress log show?", ["the same pace at different starting distances", "the same starting point only", "the same pause length only", "the same total distance only"], 0, "Parallel segments share the same slope.", "Parallel straight segments show the same pace even if they sit at different heights on the graph."),
        mcItem("M1L1_T15", "If the mission log is flat from 3 s to 7 s, what must be true during that interval?", ["No extra distance is being added", "The avatar must be reversing", "The pace must be increasing", "Time has stopped on the graph"], 0, "Distance stays constant while time advances.", "A flat section means no additional distance is being added during that interval."),
        mcItem("M1L1_T16", "Which comparison is valid when two straight segments rise by the same amount over the same time?", ["They show the same pace even if one is drawn higher", "The higher segment is faster", "The lower segment is faster", "They cannot be compared without mass"], 0, "Equal rise over equal run means equal slope.", "Equal change in distance over equal time means the segments show the same pace."),
        mcItem("M1L1_T17", "Why is graph-as-picture such a damaging misconception for later motion work?", ["Because it hides the idea that graphs encode relationships between quantities over time", "Because pictures are never allowed in physics", "Because only tables can show motion", "Because it makes calculations too easy"], 0, "Students need graph meaning, not surface shape matching.", "It is damaging because it hides the fact that the graph is encoding how quantities change with time, not drawing the path itself."),
      ];
    case "M1_L2":
      return [
        mcItem("M1L2_T8", "What does the height of a pace log tell you?", ["the speed at that instant", "the distance covered so far", "the acceleration for the whole graph", "the shape of the route"], 0, "Height is about current speed on this graph.", "The height of a pace log tells you the speed at that instant."),
        mcItem("M1L2_T9", "What does the slope of a pace log tell you?", ["how the speed is changing", "the total distance covered", "the direction of the road", "the mass of the object"], 0, "Slope is a rate of change here.", "The slope of a pace log tells you how the speed is changing, so it represents acceleration."),
        mcItem("M1L2_T10", "Why can a flat pace log above zero still represent motion?", ["Because the speed is constant rather than zero", "Because all flat graphs mean no motion", "Because height is irrelevant on this graph", "Because acceleration has become distance"], 0, "Flat above zero is cruising.", "A flat pace log above zero still represents motion because the speed is constant rather than zero."),
        mcItem("M1L2_T11", "Two pace logs have the same speed at 5 s, but one is steeper. Which statement is correct?", ["They match in speed at that instant but not in acceleration", "They match in acceleration but not in speed", "They must show the same total distance", "The steeper one must be slower then"], 0, "Equal height does not force equal slope.", "They match in speed at that instant because the heights match, but the steeper one has the larger acceleration."),
        mcItem("M1L2_T12", "A pace log slopes downward while staying above zero. What story fits best?", ["the avatar is slowing down but still moving forward", "the avatar is stopped", "the avatar has zero acceleration and zero speed", "the graph is impossible"], 0, "The speed can fall without reaching zero.", "A downward slope above zero means the avatar is slowing down while still moving."),
        shortItem("M1L2_T13", "A pace log changes from 4 m/s to 10 m/s in 2 s. What acceleration does that show?", ["3", "3 m/s^2", "3 m/s/s"], "Use change in speed divided by time."),
        mcItem("M1L2_T14", "Why is the statement 'a higher point means more acceleration' unreliable on a pace log?", ["Because acceleration depends on slope, not height", "Because pace logs cannot show acceleration", "Because high speed removes acceleration", "Because height always equals distance"], 0, "Separate current value from change rate.", "The statement is unreliable because acceleration depends on the slope of the graph, not on its height."),
        mcItem("M1L2_T15", "A straight rising pace log and a steeper straight rising pace log are compared. What differs?", ["the rate at which the speed is increasing", "whether time is passing", "whether the graph is a speed-time graph", "the existence of speed itself"], 0, "A steeper rising line means a larger acceleration.", "The steeper line has the larger rate of increase of speed, so it has the larger acceleration."),
        mcItem("M1L2_T16", "Which statement best resists F2-style duplication and stays true to Module 1?", ["A pace log is a record of speed now, not a picture of distance gained", "A pace log is another name for a distance-time graph", "The area under any graph always gives distance", "Acceleration is just a bigger speed"], 0, "Module 1 keeps representations distinct.", "A pace log records speed now; it is not another way of drawing distance-time motion."),
        mcItem("M1L2_T17", "What does a horizontal line on the time axis itself mean on a pace log?", ["the object is at rest for that interval", "the object moves at constant speed above zero", "the object accelerates steadily", "the graph is measuring distance"], 0, "Flat on zero is different from flat above zero.", "A horizontal line on the time axis means the speed is zero, so the object is at rest for that interval."),
      ];
    case "M1_L3":
      return [
        mcItem("M1L3_T8", "What is acceleration in the strongest conceptual language for this lesson?", ["the signed rate of change of velocity", "the same thing as speed", "distance divided by time", "the force on the object"], 0, "Velocity change and sign are central here.", "Acceleration is the signed rate of change of velocity."),
        mcItem("M1L3_T9", "Why does positive acceleration not always mean speeding up?", ["Because the object may be moving in the negative direction", "Because positive signs have no meaning in physics", "Because acceleration ignores direction", "Because only force can be positive"], 0, "Combine the sign of velocity with the sign of acceleration.", "Positive acceleration does not always mean speeding up because the object may be moving in the negative direction."),
        mcItem("M1L3_T10", "An avatar moves west at -8 m/s and then -2 m/s. What is true if east is positive?", ["the acceleration is positive and the avatar is slowing down", "the acceleration is negative and the avatar is speeding up", "the acceleration is zero", "the motion is impossible"], 0, "The velocity becomes less negative over time.", "The velocity becomes less negative, so the acceleration is positive while the avatar slows down."),
        mcItem("M1L3_T11", "What does zero acceleration guarantee?", ["constant velocity", "zero velocity", "positive velocity", "that the object is at rest"], 0, "No acceleration means no change in velocity.", "Zero acceleration guarantees constant velocity, not necessarily zero velocity."),
        mcItem("M1L3_T12", "Why does the chosen positive direction matter before you name the acceleration sign?", ["Because the sign compares the velocity change with that chosen direction", "Because it changes the mass of the object", "Because time can reverse", "Because speed has no sign"], 0, "The sign convention anchors the whole interpretation.", "The chosen positive direction matters because the sign of acceleration depends on how the velocity change compares with it."),
        shortItem("M1L3_T13", "Velocity changes from -2 m/s to +6 m/s in 4 s. What acceleration does that show?", ["2", "2 m/s^2", "2 m/s/s"], "Use the signed velocity change divided by the time."),
        mcItem("M1L3_T14", "Which pairing definitely means the object is speeding up?", ["velocity negative and acceleration negative", "velocity positive and acceleration negative", "velocity zero and acceleration zero", "velocity negative and acceleration positive"], 0, "Speed increases when velocity and acceleration point the same way.", "If both velocity and acceleration are negative, the speed is increasing in the negative direction."),
        mcItem("M1L3_T15", "The same velocity change happens in half the time. What happens to the acceleration magnitude?", ["it doubles", "it halves", "it stays the same", "it becomes zero"], 0, "Acceleration is a rate.", "If the same velocity change happens in half the time, the acceleration magnitude doubles."),
        mcItem("M1L3_T16", "Why is 'negative acceleration means slowing down' an unsafe rule?", ["Because an object moving in the negative direction can speed up with negative acceleration", "Because acceleration has no direction", "Because all motion graphs use only positive axes", "Because speed and velocity are identical"], 0, "The sign alone does not decide whether speed rises or falls.", "It is unsafe because an object moving in the negative direction can speed up while the acceleration stays negative."),
        mcItem("M1L3_T17", "What should you compare first when judging the acceleration sign from a story?", ["the starting and ending velocity values with a sign convention", "the total distance traveled", "the size of the time interval only", "the mass of the object"], 0, "Start with signed velocities before any verbal guess.", "You should compare the starting and ending velocity values using the chosen sign convention before naming the acceleration sign."),
      ];
    case "M1_L4":
      return [
        mcItem("M1L4_T8", "What must be true before using suvat directly?", ["acceleration is constant", "distance is constant", "velocity is positive", "the graph is flat"], 0, "Check the condition first.", "Suvat works directly only when acceleration is constant."),
        mcItem("M1L4_T9", "Why should equation choice start with the knowns and the unknown?", ["so the formula matches the story directly", "because all equations are interchangeable", "because symbols do not matter", "because the longest formula is best"], 0, "Choose for fit.", "Equation choice should start with the knowns and the unknown so the formula matches the story directly."),
        mcItem("M1L4_T10", "If u, v, and t are known and s is required, which equation is direct?", ["s = (u + v) / 2 x t", "v = u + at", "a = (v - u) / t", "s = ut + 1/2at^2"], 0, "Use the direct match.", "s = (u + v) / 2 x t is the direct choice here."),
        mcItem("M1L4_T11", "In s = ut + 1/2at^2, ut represents...", ["distance from the starting velocity alone", "extra distance from acceleration only", "the final velocity", "time without motion"], 0, "Think rectangle first.", "ut is the distance from carrying the starting velocity through the interval."),
      ];
    case "M1_L5":
      return [
        mcItem("M1L5_T8", "Why must you name the graph before naming the slope meaning?", ["Because the axes decide what rate the slope represents", "Because all slopes mean speed", "Because only pace logs have slope", "Because height and slope are the same thing"], 0, "Axes first.", "You must name the graph first because the axes decide what rate the slope represents."),
        mcItem("M1L5_T9", "The same tilt appears on a progress log and a pace log. What changes?", ["the physical meaning of the slope", "the amount of time on the axis", "the existence of a slope", "the need for units"], 0, "Geometry can stay the same while meaning changes.", "The physical meaning of the slope changes because the axes are different even if the tilt looks the same."),
        mcItem("M1L5_T10", "Why does zero slope mean stop on a progress log but not always on a pace log?", ["Because one graph records distance while the other records speed", "Because zero means different times", "Because pace logs ignore time", "Because progress logs have no units"], 0, "Different vertical axes, different stories.", "Zero slope means different things because one graph records distance and the other records speed."),
        mcItem("M1L5_T11", "A pace log is high but flat at one instant. What is true there?", ["speed is high and acceleration is zero", "speed is zero and acceleration is high", "both speed and acceleration are high", "the graph is impossible"], 0, "Height and slope stay separate.", "A high but flat point means the speed is high there while the acceleration is zero there."),
      ];
    case "M1_L6":
      return [
        mcItem("M1L6_T8", "What does the whole shaded area under a pace log represent?", ["total distance traveled", "current speed only", "acceleration only", "the shape of the lane"], 0, "Add the strips under the graph.", "The whole shaded area under a pace log represents the total distance traveled."),
        mcItem("M1L6_T9", "Why can two different pace-log shapes still give the same total distance?", ["Because equal total area can come from different shapes", "Because only the highest point matters", "Because time can be ignored", "Because all graphs with triangles are equal"], 0, "Area controls the total distance here.", "Two different pace-log shapes can give the same total distance if their total areas are equal."),
        mcItem("M1L6_T10", "Why does a triangle under the graph still count toward distance?", ["Because its area still combines speed and time", "Because triangles always mean acceleration only", "Because only rectangles have units", "Because height alone is distance"], 0, "Any area piece under a speed-time graph contributes distance.", "A triangle still counts because its area still combines speed and time."),
        mcItem("M1L6_T11", "Why is saying 'the graph with the higher peak traveled farther' unsafe?", ["Because total distance depends on area, not peak height alone", "Because higher peaks always mean less time", "Because peaks have no meaning", "Because only flat graphs can show distance"], 0, "Peak height alone does not fix the total area.", "It is unsafe because total distance depends on the full area under the graph, not on peak height alone."),
      ];
    case "F4_L1":
    case "F4_L2":
    case "F4_L3":
    case "F4_L4":
    case "F4_L5":
    case "F4_L6":
      return f4MasteryVariants(code);
    default:
      return items.flatMap((item, itemIndex) => [
        {
          ...asRecord(item),
          id: code + "_VAR_" + String(itemIndex + 1),
          prompt: text(asRecord(item).prompt),
        },
      ]);
  }
}

function f4MasteryVariants(code: string): UnknownRecord[] {
  switch (code) {
    case "F4_L1":
      return [
        mcItem("F4-L1-X1", "What does current measure in a simple circuit?", ["rate of charge flow", "energy transferred per charge", "path difficulty", "total energy transferred"], 0, "Current tells you how much charge passes a point each second.", "Current is the rate of charge flow past a point in the circuit."),
        mcItem("F4-L1-X2", "What does a current of 2 A mean?", ["2 C pass a point each second", "2 C stay stored in the bulb", "each charge gains 2 J of energy", "2 routes are available to the charge"], 0, "Amperes tell you the rate of charge flow.", "A current of 2 A means 2 C pass a point each second."),
        mcItem("F4-L1-X3", "In one closed single-path loop, the current before and after a lamp is...", ["the same", "smaller after the lamp", "larger after the lamp", "zero after the lamp"], 0, "The same charge stream passes every point on one continuous route.", "A single closed loop has the same current before and after the lamp."),
        mcItem("F4-L1-X4", "Why can a lamp get hot even though the current stays the same through it?", ["It transfers electrical energy while the same charge keeps flowing", "It creates extra charge inside the filament", "It stores current and releases it later", "It removes charge from the loop"], 0, "Separate charge flow from energy transfer.", "The lamp transfers electrical energy even though the same charge keeps flowing through it."),
        mcItem("F4-L1-X5", "What happens to the current everywhere if the switch opens in a single loop?", ["It increases near the cell", "It stays the same at the battery only", "It drops to zero everywhere", "It becomes larger after the resistor"], 2, "An open route stops the whole stream in a single-path network.", "Opening the switch breaks the route, so the current falls to zero everywhere in the loop."),
        mcItem("F4-L1-X6", "Why is the statement 'the lamp uses current up' wrong?", ["The same charge keeps circulating while the lamp transfers energy", "The lamp creates extra charge after it", "Current always increases across a component", "A lamp removes charge only when it glows"], 0, "Separate charge flow from energy transfer.", "The lamp transfers energy from the moving charge but does not use the current up."),
        mcItem("F4-L1-X7", "At which point in a simple closed loop is the current largest?", ["it is the same at every point in the loop", "just after the battery", "inside the lamp only", "just before the switch"], 0, "A single route carries one common stream rate.", "The current is the same at every point in a simple closed loop."),
        mcItem("F4-L1-X8", "Two loops each move 12 C of charge. Loop A takes 3 s and Loop B takes 6 s. Which loop has the greater current?", ["Loop A", "Loop B", "both have the same current", "you need the voltage first"], 0, "Current compares how much charge passes each second.", "Loop A has the greater current because the same charge passes in less time."),
        mcItem("F4-L1-X9", "Which statement best separates charge from current?", ["Charge is an amount, while current is a rate of flow", "Charge and current are exactly the same idea", "Current is stored charge inside a component", "Charge is energy per coulomb"], 0, "One idea is an amount; the other is an amount-per-second rate.", "Charge is an amount, while current is the rate at which charge flows."),
        mcItem("F4-L1-X10", "Why is 'the bulb stores current and releases it later' a poor explanation in a normal simple circuit?", ["Current is the ongoing flow through the whole loop, not a stockpile kept inside the bulb", "Bulbs are not allowed to contain any charge at all", "The battery always creates new charge after the bulb", "Current only exists inside the cell"], 0, "Current describes flow through the loop, not a stored substance.", "Current is the ongoing flow through the circuit, not something the bulb stores and later returns."),
        mcItem("F4-L1-X11", "If no charge passes a checkpoint for several seconds, what current is there at that point?", ["0 A", "1 A", "the same as before", "you cannot tell without resistance"], 0, "No charge per second means zero current.", "If no charge is passing the checkpoint, the current there is 0 A."),
        mcItem("F4-L1-X12", "At a lamp in a simple loop, what changes even when the charge stream rate does not?", ["the electrical energy carried by the charge", "the total amount of charge in the loop", "the number of routes", "the existence of current"], 0, "The same charge stream can keep moving while transferring energy.", "The electrical energy carried by the charge changes as the lamp transfers energy."),
        mcItem("F4-L1-X13", "Two checkpoints are marked on one simple loop: one just after the cell and one just after the lamp. Which statement is correct?", ["The current is the same at both points, but the electrical energy per charge can differ", "The current is always larger just after the cell", "The lamp removes charge, so less charge exists after it", "The current disappears briefly inside the lamp"], 0, "Keep charge flow and energy transfer separate.", "The current is the same at both points, but the charge can carry different amounts of electrical energy after the lamp."),
        mcItem("F4-L1-X14", "Which pair of situations shows the same current?", ["6 C in 2 s and 3 C in 1 s", "6 C in 2 s and 6 C in 4 s", "8 C in 2 s and 4 C in 2 s", "10 C in 5 s and 12 C in 4 s"], 0, "Current compares charge moved per second in each case.", "Both situations show 3 C passing each second, so they have the same current."),
      ];
    case "F4_L2":
      return [
        mcItem("F4-L2-X1", "Potential difference is best described as...", ["energy transferred per unit charge", "charge passing each second", "path difficulty", "power multiplied by time"], 0, "Voltage tells how much energy each coulomb gains or loses.", "Potential difference is the energy transferred per unit charge."),
        shortItem("F4-L2-X2", "18 J are transferred by 3 C. What potential difference is involved?", ["6 V", "6v", "6"], "Use V = E / Q."),
        shortItem("F4-L2-X3", "A charge of 5 C passes through a component with a potential difference of 4 V. How much energy is transferred?", ["20 J", "20j", "20"], "Use E = VQ."),
        mcItem("F4-L2-X4", "Two cells drive the same amount of charge. Which gives more energy to each coulomb?", ["the cell with the larger potential difference", "the cell with the smaller potential difference", "both give the same energy per coulomb", "the one with the smaller current"], 0, "For the same charge, larger voltage means more energy per charge.", "The cell with the larger potential difference transfers more energy to each coulomb."),
        mcItem("F4-L2-X5", "Which statement correctly compares a cell and a lamp in one circuit?", ["The cell gives charge electrical energy, while the lamp transfers some of that energy away", "The lamp creates charge, while the cell removes it", "Both always use current up", "The lamp increases the energy per charge and the cell decreases it"], 0, "Cells and components play different energy roles.", "The cell gives electrical energy to the charges, while the lamp transfers some of that energy to other stores."),
        mcItem("F4-L2-X6", "Why can the same charge return to the cell with less electrical energy than it had before a lamp?", ["The lamp transferred some electrical energy away while the same charge kept moving", "Some charge disappeared inside the lamp", "The potential difference became current", "The circuit stopped for part of the loop"], 0, "Charge can stay the same while energy per charge changes.", "The same charge can keep circulating even though it leaves the lamp with less electrical energy."),
      ];
    case "F4_L3":
      return [
        mcItem("F4-L3-X1", "What does resistance mean in the Flow-Grid model?", ["how much charge is available", "how hard the route is for charge to move through", "how much energy each charge gains", "how fast the battery runs out"], 1, "Resistance is route difficulty, not stored charge or energy per charge.", "In the Flow-Grid model, resistance means how hard the route is for charge to move through."),
        mcItem("F4-L3-X2", "If the source push increases while the path difficulty stays the same for an ohmic component, what happens to the current?", ["it increases", "it decreases", "it stays the same", "it must become zero"], 0, "At fixed resistance, more push gives more flow.", "If the source push increases while resistance stays the same, the current increases."),
        mcItem("F4-L3-X3", "If the path difficulty increases while the push stays the same, what happens to the current?", ["it increases", "it decreases", "it stays the same", "it becomes potential difference"], 1, "At fixed voltage, a harder path gives less flow.", "If resistance increases while the push stays the same, the current decreases."),
        mcItem("F4-L3-X4", "Why does a steeper straight I-V graph slope mean lower resistance?", ["Because more current flows for each volt", "Because the component stores extra charge", "Because current stops depending on voltage", "Because steeper always means larger resistance"], 0, "A steeper slope shows more current gained per volt.", "A steeper straight I-V graph slope means lower resistance because more current flows for each volt."),
        mcItem("F4-L3-X5", "Which line on a straight I-V graph has the greater resistance?", ["the flatter line", "the steeper line", "both are equal", "you cannot tell"], 0, "Less current per volt means higher resistance.", "The flatter straight line has the greater resistance because it gives less current for each volt."),
        mcItem("F4-L3-X6", "What does a straight I-V graph through the origin show for an ohmic component?", ["current is proportional to voltage", "resistance is used up as current flows", "current stays the same while voltage changes", "voltage depends only on time"], 0, "A straight line through the origin shows direct proportionality.", "For an ohmic component, a straight I-V graph through the origin shows that current is proportional to voltage."),
        mcItem("F4-L3-X7", "Two resistors have the same voltage across them. Resistor A carries more current than resistor B. Which statement is correct?", ["A has the lower resistance", "A has the higher resistance", "They must have the same resistance", "B must be non-ohmic"], 0, "At the same voltage, the larger current means the easier path.", "If the voltage is the same, the resistor carrying more current has the lower resistance."),
        mcItem("F4-L3-X8", "Route A and Route B have the same push. Route A gives a larger stream rate. What does that tell you?", ["Route A has the higher resistance", "Route A has the lower resistance", "Route A has the lower voltage", "Route A stores more charge"], 1, "At the same push, the larger stream rate means the easier route.", "If Route A gives the larger stream rate under the same push, Route A has the lower resistance."),
        mcItem("F4-L3-X9", "Which statement correctly links the graph view and the Flow-Grid view?", ["A steeper I-V graph slope matches an easier route", "A steeper I-V graph slope matches a harder route", "A flatter I-V graph slope means no resistance", "The graph slope is unrelated to route difficulty"], 0, "Steeper graph response means the current rises more easily.", "A steeper I-V graph slope matches an easier route and therefore a lower resistance."),
        mcItem("F4-L3-X10", "Why is it wrong to say resistance is a second kind of current?", ["Resistance describes path difficulty, while current describes the rate of charge flow", "Resistance is just the current after a resistor", "Resistance is the energy in each charge", "Current only exists when resistance is zero"], 0, "These are different roles in the circuit story.", "Resistance describes path difficulty, while current describes the rate of charge flow."),
        mcItem("F4-L3-X11", "For the same ohmic resistor, what comparison is correct when the voltage is doubled?", ["current doubles", "current halves", "resistance doubles", "current stays fixed"], 0, "Same resistor means same resistance, so current rises in step with voltage.", "For the same ohmic resistor, doubling the voltage doubles the current."),
        mcItem("F4-L3-X12", "Which statement best explains why Ohm's law works for an ohmic component?", ["The current responds to push and difficulty in a regular way, so I = V / R summarizes the pattern", "The battery creates new charge whenever voltage rises", "Resistance disappears when current flows", "Current and voltage are the same quantity"], 0, "The law summarizes a pattern students can already observe conceptually.", "Ohm's law works because the current responds to push and difficulty in a regular way, so I = V / R summarizes the pattern."),
      ];
    case "F4_L4":
      return [
        mcItem("F4-L4-X1", "In a series circuit, the current in one component compared with the current in the next component is...", ["the same", "always larger", "always smaller", "zero in the second component"], 0, "One route means one stream rate everywhere in the loop.", "The current is the same in each component of a series circuit."),
        mcItem("F4-L4-X2", "What happens to total resistance when resistors are added in series?", ["It decreases", "It stays the same", "It adds up", "It becomes zero"], 2, "Series difficulties stack along one route.", "In series, resistances add together."),
        mcItem("F4-L4-X3", "Why does adding another resistor in series usually make every lamp in the loop dimmer?", ["The battery voltage disappears", "The total resistance rises so the current falls everywhere", "Each resistor creates extra current", "Current stops depending on resistance"], 1, "A one-route network responds as a whole when the route gets harder.", "Adding another resistor in series raises the total resistance, so the current falls everywhere in the loop."),
        mcItem("F4-L4-X4", "If you add another resistor in series to the same battery, what happens to the current everywhere in the loop?", ["It increases everywhere", "It decreases everywhere", "It stays the same everywhere", "It only changes after the new resistor"], 1, "One-path circuits respond as a whole network.", "Adding resistance in series reduces the current everywhere in the loop."),
        mcItem("F4-L4-X5", "Two equal resistors are connected in series across a battery. How is the battery voltage shared?", ["equally between the resistors", "all across the first resistor", "all across the second resistor", "voltage is not shared in series"], 0, "Equal components in series share the source push equally.", "Equal resistors in series share the battery voltage equally."),
        mcItem("F4-L4-X6", "Two identical lamps are connected in series to one battery. Why are they usually dimmer than one lamp on the same battery?", ["They share the supply voltage and the total current is lower", "Potential difference cannot exist in series", "Each lamp creates extra current", "The current doubles through both lamps"], 0, "In series, identical lamps share the push and the one-route current is lower.", "Identical lamps in series share the supply voltage and the total current is lower, so each lamp is dimmer."),
        mcItem("F4-L4-X7", "What happens to the whole series circuit if one lamp breaks and opens the path?", ["Only the broken lamp turns off", "Current keeps flowing around the rest of the loop", "The whole loop stops because the route is broken", "The battery increases its voltage to keep current flowing"], 2, "A series circuit needs one complete route.", "If one lamp breaks in series, the whole route is broken and current stops everywhere."),
        mcItem("F4-L4-X8", "Two resistors of different sizes are connected in series. Which resistor has the larger potential difference across it?", ["the larger resistor", "the smaller resistor", "they must always be equal", "you cannot compare voltages in series"], 0, "The harder section of the route takes a bigger share of the source push.", "In series, the larger resistor takes a larger share of the total potential difference."),
        mcItem("F4-L4-X9", "Which statement best describes a series circuit?", ["There is one complete route, the same current passes every component, and the supply voltage is shared", "There are several routes and current always splits equally", "Each component gets the full supply voltage and creates its own current", "The battery sends different currents to different parts of the same loop"], 0, "Pull the current rule and the voltage-sharing rule together.", "A series circuit has one complete route, the same current through each component, and a shared supply voltage."),
        mcItem("F4-L4-X10", "A student adds a second identical lamp in series and says only the new lamp should be affected. What is the best correction?", ["Only the second lamp changes because it is new", "The whole loop changes because adding difficulty affects the one route everywhere", "The battery cancels the extra resistance", "Series circuits keep the same brightness no matter how many lamps are added"], 1, "One-route networks respond together, not component by component.", "The whole loop changes because adding difficulty to a one-route circuit affects the current everywhere."),
        mcItem("F4-L4-X11", "In the Flow-Grid analogy, what does adding another gate to the same single route represent?", ["adding a branch in parallel", "reducing the battery push to zero", "adding resistance in series so the stream slows everywhere", "making charge disappear at the lamp"], 2, "Tie the analogy back to the circuit behavior directly.", "Adding another gate to the same single route represents adding resistance in series, so the stream slows everywhere."),
        mcItem("F4-L4-X12", "Why does a series circuit with more total resistance draw less current from the same battery?", ["The source push stays the same but the route becomes harder", "The battery sends less charge into the circuit each hour only", "Current can no longer pass through resistors", "Resistance changes into voltage"], 0, "Return to push divided by path difficulty.", "With the same battery push, a harder total route gives a smaller current."),
      ];
    case "F4_L5":
      return [
        mcItem("F4-L5-X1", "In a parallel circuit, the potential difference across each branch is...", ["the same as the supply across the branch endpoints", "split equally only if the currents match", "always zero in one branch", "different in every branch by default"], 0, "Branches connect across the same two points.", "Each branch in parallel has the same potential difference across it because the endpoints are the same."),
        mcItem("F4-L5-X2", "Why does adding another branch in parallel usually increase the total current from the battery?", ["The extra route makes the overall circuit easier for charge to move through", "The battery automatically doubles its voltage", "Current can only flow in one branch at a time", "Each new branch removes resistance from every component"], 0, "More routes mean less overall difficulty for the network.", "Adding another branch gives charge another route, so the overall circuit becomes easier and the total current usually increases."),
        mcItem("F4-L5-X3", "What usually happens to the total current drawn from a battery when another branch is added in parallel?", ["It decreases", "It stays the same", "It increases", "It becomes zero"], 2, "Extra routes reduce the network difficulty.", "Adding another branch usually increases the total current because the overall resistance falls."),
        mcItem("F4-L5-X4", "Two parallel branches have the same voltage across them. Which branch carries more current?", ["the branch with greater resistance", "the branch with lower resistance", "both always carry the same current", "you need the battery mass"], 1, "At the same voltage, lower resistance gives greater current.", "The lower-resistance branch carries more current when the branch voltage is the same."),
        mcItem("F4-L5-X5", "Which statement best describes current in a parallel circuit?", ["It splits at a junction and recombines later", "It stays identical in every branch regardless of resistance", "It disappears in one branch", "It can only flow in the branch with the largest resistor"], 0, "Think of the total stream dividing between routes.", "Current splits between the branches and recombines when the branches join again."),
        mcItem("F4-L5-X6", "Why can branch currents be different even though the branch voltages are the same?", ["The branch resistances can be different", "Voltage and current are unrelated", "Charge is used up in one branch", "Parallel circuits force equal current in every route"], 0, "Different path difficulties produce different stream rates.", "Branch currents can differ because the branches can have different resistances even though the voltages are the same."),
        mcItem("F4-L5-X7", "If two identical lamps are connected in parallel across one battery, how does the potential difference across one lamp compare with the battery supply?", ["it is the full supply potential difference", "it is half the supply because there are two branches", "it is zero unless the other lamp is removed", "it depends only on current, not on the supply"], 0, "Each branch spans the same supply points.", "Each parallel lamp is connected across the same two supply points, so each gets the full supply potential difference."),
        mcItem("F4-L5-X8", "If one lamp in a simple parallel pair breaks and opens its branch, what usually happens to the other lamp?", ["It stays on because its branch is still complete", "It always goes out because the whole circuit is broken", "Its branch current must become zero too", "It gets no potential difference at all"], 0, "Parallel branches can keep working independently if one route opens.", "The other lamp stays on because its own branch is still a complete route across the supply."),
        mcItem("F4-L5-X9", "Two identical resistors are connected in parallel. Which statement is correct?", ["The branch currents are equal because the branch voltages and resistances are equal", "One branch must carry more current because it is closer to the battery", "The branch voltages must be different to keep charge moving", "Current cannot split equally in a circuit"], 0, "Equal voltage plus equal resistance gives equal branch current.", "For identical parallel branches, the voltage is the same and the resistance is the same, so the branch currents are equal."),
        mcItem("F4-L5-X10", "What happens to the total current at a junction where branch currents recombine?", ["It becomes the sum of the branch currents", "It becomes the current in the smallest branch only", "It always halves", "It disappears after the junction"], 0, "The total stream after recombining matches the branch contributions added together.", "When branch currents recombine, the total current is the sum of the branch currents."),
        shortItem("F4-L5-X11", "One branch carries 2 A and another branch carries 3 A. What total current leaves the source?", ["5 A", "5a", "5"], "Add the branch currents to get the total current."),
        mcItem("F4-L5-X12", "Why is it wrong to say that current must be the same in every parallel branch?", ["Branch currents depend on branch resistance even though the branch voltage is the same", "Current can only flow in one branch at a time", "Parallel branches have no potential difference", "The battery sends less charge into the lower-resistance branch"], 0, "Same voltage does not force same current when the path difficulties differ.", "Current does not have to be the same in every branch because branch resistance can differ even when the branch voltage is the same."),
      ];
    case "F4_L6":
      return [
        mcItem("F4-L6-X1", "What does the power of an electrical device tell you?", ["how much electrical energy it transfers each second", "how much charge is stored inside it", "how many branches the circuit has", "how long it must run before current starts"], 0, "Power is a rate, not a stored amount.", "Power tells you how much electrical energy a device transfers each second."),
        shortItem("F4-L6-X2", "A device has 12 V across it and a current of 2 A. What power does it use?", ["24 W", "24w", "24"], "Use P = VI."),
        mcItem("F4-L6-X3", "Two heaters run on the same voltage. Heater A draws 2 A and heater B draws 5 A. Which has the greater power?", ["heater A", "heater B", "they have the same power", "you need the running time first"], 1, "At fixed voltage, the larger current means the larger power.", "At the same voltage, heater B has the greater power because it draws the larger current."),
        shortItem("F4-L6-X4", "A 60 W heater runs for 30 s. How much energy does it transfer?", ["1800 J", "1800j", "1800"], "Use E = Pt."),
        mcItem("F4-L6-X5", "If a device keeps the same power but runs for twice as long, what happens to the total energy transferred?", ["it halves", "it stays the same", "it doubles", "it becomes zero"], 2, "Total energy depends on how long the power acts.", "If the power stays the same and the running time doubles, the total energy transferred doubles."),
        mcItem("F4-L6-X6", "What is the job of a fuse in a circuit?", ["to stop excessive current before overheating causes damage", "to increase the voltage across every device", "to store extra charge for the battery", "to make every branch carry the same current"], 0, "A fuse is a safety device, not a power booster.", "A fuse breaks the circuit if the current becomes dangerously large."),
        mcItem("F4-L6-X7", "Why can a low-power device still transfer a large total energy if it is left on for a long time?", ["because total energy depends on time as well as power", "because low power means high current", "because the fuse adds extra voltage over time", "because charge builds up inside the device"], 0, "Distinguish power per second from total energy over time.", "A low-power device can still transfer a large total energy if it runs for long enough because total energy depends on both power and time."),
        mcItem("F4-L6-X8", "A route is protected by a 6 A fuse but the current rises to 8 A. Why should the safety gate trip?", ["because the current is above the safe limit and overheating risk rises sharply", "because the voltage has dropped to zero", "because the device has stored too much current", "because high current means the battery has stopped working"], 0, "The fuse responds to dangerous current, not to a broken battery.", "The safety gate should trip because the current is above the safe limit, so the wire can overheat dangerously."),
        mcItem("F4-L6-X9", "Two kettles are both rated 100 W. Kettle A runs for 10 s and kettle B runs for 30 s. Which transfers more energy?", ["kettle A", "kettle B", "they transfer the same energy", "you need the voltage first"], 1, "At the same power, the longer-running device transfers more total energy.", "Kettle B transfers more energy because both have the same power but kettle B runs for longer."),
        mcItem("F4-L6-X10", "Why does a device on the same voltage usually get hotter faster when it draws a larger current?", ["because it transfers more electrical energy each second", "because it stores more charge instead of using energy", "because current turns into resistance", "because a larger current means the fuse has already opened"], 0, "Link greater current at fixed voltage to greater power.", "At the same voltage, a larger current means a larger power, so the device transfers more electrical energy each second and can heat faster."),
        mcItem("F4-L6-X11", "In the Flow-Grid model, what should the safety gate respond to?", ["a dangerously large packet stream through the route", "the total number of lamps in the room only", "whether the battery is full of unused charge", "any device that has run for more than one second"], 0, "Tie the analogy directly to current overload.", "In the Flow-Grid model, the safety gate should respond to a dangerously large packet stream, which matches excessive current in a circuit."),
        mcItem("F4-L6-X12", "Why is it wrong to say that a fuse measures the total energy a device has used?", ["a fuse responds to current that is too large, not to the total energy accumulated over time", "a fuse only works in parallel circuits", "a fuse is the same thing as a battery", "a fuse always raises the resistance to zero"], 0, "Separate current safety from total energy transfer.", "It is wrong because a fuse responds to dangerously large current, not to the total energy a device has used over time."),
      ];
    default:
      return [];
  }
}

function masterySourceKey(item: UnknownRecord): string {
  const prompt = text(item.prompt)
    .replace(/^(Try the same lesson idea in a fresh context: |Apply the same lesson idea in a new check: |Use the rule carefully here: |Try the concept again in a fresh question: |Use the lesson idea one more time here: )/i, "")
    .trim();
  const choices = asList(item.choices)
    .map((choice) => normalizeOpenAnswer(choice))
    .filter(Boolean)
    .sort();
  const accepted = shortAnswerAccepted(item)
    .map((answer) => compactOpenAnswer(answer))
    .filter(Boolean)
    .sort();
  return [normalizePromptKey(prompt), choices.join("|"), accepted.join("|")].join("::");
}
function supplementalMasteryItems(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  const lessonPoints = Array.from(new Set([
    ...scaffoldCoreBullets(code),
    ...scaffoldFocusExtras(code),
    ...itemsFrom(lesson, "diagnostic").map((item) => text(item.hint)).filter(Boolean),
    ...itemsFrom(lesson, "transfer").map((item) => text(item.hint)).filter(Boolean),
    ...asList(asRecord(phases(lesson).concept_reconstruction).prompts).map((entry) => text(entry)).filter(Boolean),
    ...asList(asRecord(phases(lesson).analogical_grounding).micro_prompts).map((entry) => text(asRecord(entry).hint) || text(asRecord(entry).prompt)).filter(Boolean),
  ].map((item) => item.trim()).filter(Boolean)));
  const contrastCodes = (() => {
    switch (code) {
      case "F2_L1":
        return ["F1_L3", "F1_L4", "F1_L5", "F2_L3", "F2_L5", "F2_L6"];
      case "F2_L2":
        return ["F1_L1", "F1_L4", "F1_L5", "F2_L3", "F2_L5", "F2_L6"];
      case "F2_L3":
        return ["F1_L2", "F1_L4", "F1_L5", "F2_L5", "F2_L6"];
      case "F2_L4":
        return ["F1_L2", "F1_L4", "F1_L5", "F2_L1", "F2_L5"];
      case "F2_L5":
        return ["F1_L3", "F1_L4", "F1_L5", "F2_L3", "F2_L6"];
      case "F2_L6":
        return ["F1_L2", "F1_L3", "F1_L5", "F2_L3", "F2_L4"];
      case "F3_L1":
        return ["F2_L5", "F2_L6", "F3_L2", "F3_L3", "F3_L4", "F3_L5"];
      case "F3_L2":
        return ["F2_L2", "F2_L6", "F3_L1", "F3_L3", "F3_L4", "F3_L6"];
      case "F3_L3":
        return ["F2_L1", "F2_L6", "F3_L1", "F3_L2", "F3_L5", "F3_L6"];
      case "F3_L4":
        return ["F2_L2", "F2_L5", "F3_L2", "F3_L5", "F3_L6"];
      case "F3_L5":
        return ["F2_L4", "F2_L5", "F3_L3", "F3_L4", "F3_L6"];
      case "F3_L6":
        return ["F2_L2", "F2_L5", "F3_L2", "F3_L4", "F3_L5"];
      case "F4_L1":
        return ["F1_L1", "F2_L1", "F4_L2", "F4_L3", "F4_L4"];
      case "F4_L2":
        return ["F3_L1", "F4_L1", "F4_L3", "F4_L4", "F4_L6"];
      case "F4_L3":
        return ["F2_L2", "F3_L3", "F4_L1", "F4_L4", "F4_L5"];
      case "F4_L4":
        return ["F4_L1", "F4_L2", "F4_L3", "F4_L5", "F4_L6"];
      case "F4_L5":
        return ["F4_L1", "F4_L2", "F4_L3", "F4_L4", "F4_L6"];
      case "F4_L6":
        return ["F3_L3", "F3_L6", "F4_L2", "F4_L3", "F4_L5"];
      case "M1_L1":
        return ["F2_L1", "F2_L3", "M1_L2", "M1_L5", "M1_L6"];
      case "M1_L2":
        return ["F2_L2", "F2_L4", "M1_L1", "M1_L3", "M1_L5"];
      case "M1_L3":
        return ["F2_L2", "F2_L6", "M1_L2", "M1_L4", "M1_L5"];
      case "M1_L4":
        return ["M1_L3", "M1_L5", "M1_L6", "F2_L6", "F3_L6"];
      case "M1_L5":
        return ["F2_L3", "F2_L4", "M1_L1", "M1_L2", "M1_L6"];
      case "M1_L6":
        return ["F2_L4", "F3_L1", "M1_L2", "M1_L4", "M1_L5"];
      case "M2_L1":
      case "M2_L2":
      case "M2_L3":
      case "M2_L4":
      case "M2_L5":
      case "M2_L6":
        return m2ContrastCodes(code);
      default:
        return [];
    }
  })();

  const promptForPoint = (point: string, index: number): string => {
    if (code === "F4_L1") return "Which option is the clearest match for this charge and current lesson?";
    if (code === "F4_L2") return "Which option is the clearest match for this potential difference lesson?";
    if (code === "F4_L3") return "Which option is the clearest match for this resistance and I-V lesson?";
    if (code === "F4_L4") return "Which option is the clearest match for this series circuit lesson?";
    if (code === "F4_L5") return "Which option is the clearest match for this parallel circuit lesson?";
    if (code === "F4_L6") return "Which option is the clearest match for this power and safety lesson?";
    if (code.startsWith("M1_")) return index % 2 === 0 ? "Which statement best matches this motion-graph lesson point?" : "Choose the option that keeps the motion representation and its meaning aligned.";
    if (code.startsWith("M2_")) return m2PaddingPrompt(index);
    if (code.startsWith("F3_")) return "Which option directly answers this lesson point?";
    if (code.startsWith("F2_")) return "Which statement best fits this lesson point?";
    return index % 2 === 0 ? "Which statement best fits this lesson point?" : "Choose the statement that directly answers this lesson point.";
  };

  const paddingHint = isStructuredMasteryPaddingLessonCode(code) ? "Choose the statement that directly answers this lesson point." : "Pick the statement that matches this lesson's main distinction.";
  return lessonPoints.slice(0, MASTERY_DEFAULT_MAX).flatMap((point, index) => {
    const pointKey = normalizePromptKey(point);
    const distractors = Array.from(new Set(
      contrastCodes
        .flatMap((entry) => [...scaffoldCoreBullets(entry), ...scaffoldFocusExtras(entry)])
        .map((item) => item.trim())
        .filter((item) => item && normalizePromptKey(item) !== pointKey)
    ));
    if (distractors.length < 3) return [];
    return [
      mcItem(
        `${code}-AUTO-M${String(index + 1)}`,
        promptForPoint(point, index),
        [
          point,
          distractors[(index * 3) % distractors.length],
          distractors[(index * 3 + 1) % distractors.length],
          distractors[(index * 3 + 2) % distractors.length],
        ],
        0,
        paddingHint,
        point
      ),
    ];
  });
}

function hasUsableMasteryAnswer(item: UnknownRecord): boolean {
  const choices = asList(item.choices);
  const answerIndex = resolvedAnswerIndex(item);
  if (choices.length > 0 && answerIndex >= 0 && answerIndex < choices.length) return true;
  if (shortAnswerAccepted(item).length > 0) return true;
  return hasMeaningfulFeedback(resolvedCorrectAnswer(item));
}

function masteryItems(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const seenPrompts = new Set<string>();
  const diagnosticRecords = diagnosticItems(lesson).map(asRecord);
  const diagnosticSourceKeys = new Set(diagnosticRecords.map((item) => masterySourceKey(item)).filter(Boolean));
  const generated = generatedMasteryItems(lesson);
  const authoredTransfer = itemsFrom(lesson, "transfer")
    .map(asRecord)
    .filter((item) => hasUsableMasteryAnswer(item));
  const preferAuthored = prefersLessonOwnedMasteryBank(lesson, authoredTransfer.length);
  const fallback = [...itemsFrom(lesson, "transfer"), ...conceptGateItems(lesson)]
    .filter((item) => hasUsableMasteryAnswer(asRecord(item)));
  const baseItems = preferAuthored
    ? [...authoredTransfer]
    : generated.length >= MASTERY_DEFAULT_MAX
      ? [...generated]
      : generated.length > 0 ? [...generated, ...fallback] : [...fallback];
  const ordered = preferAuthored || baseItems.length >= MASTERY_DEFAULT_MAX
    ? baseItems
    : [...baseItems, ...supplementalMasteryItems(lesson)];
  return ordered.filter((item) => {
    const record = asRecord(item);
    const id = text(record.id);
    const promptKey = normalizePromptKey(text(record.prompt));
    const sourceKey = masterySourceKey(record);
    if (!id || (sourceKey && diagnosticSourceKeys.has(sourceKey))) return false;
    if (seenIds.has(id) || (sourceKey && seenSources.has(sourceKey)) || (promptKey && seenPrompts.has(promptKey))) return false;
    seenIds.add(id);
    if (promptKey) seenPrompts.add(promptKey);
    if (sourceKey) seenSources.add(sourceKey);
    return true;
  });
}

function masteryStrengthScore(runnerLesson: UnknownRecord, state: LocalState): number | null {
  const diagnosticMeta = asRecord(runnerLesson.diagnostic);
  const latestDiagnostic = typeof diagnosticMeta.latest_score === "number"
    ? numberValue(diagnosticMeta.latest_score, 0)
    : typeof state.profile?.diagnosticScore === "number"
      ? state.profile.diagnosticScore
      : null;
  const bestScore = typeof runnerLesson.best_score === "number" ? numberValue(runnerLesson.best_score, 0) : 0;
  return bestScore > 0 ? bestScore : latestDiagnostic;
}

function masteryQuestionCount(masteryMeta: UnknownRecord, poolLength: number, strengthScore: number | null): number {
  if (poolLength <= 0) return 0;

  const minQuestions = Math.min(Math.max(numberValue(masteryMeta.min_questions, MASTERY_DEFAULT_MIN), 1), poolLength);
  const maxQuestions = Math.max(minQuestions, Math.min(numberValue(masteryMeta.max_questions, MASTERY_DEFAULT_MAX), poolLength));
  const adaptiveTarget = strengthScore === null
    ? minQuestions
    : strengthScore < 0.4
      ? 5
      : strengthScore < 0.55
        ? 6
        : strengthScore < 0.7
          ? 7
          : strengthScore < 0.8
            ? 8
            : strengthScore < 0.9
              ? 9
              : 10;
  const preferred = Math.max(numberValue(masteryMeta.selected_question_count, 0), adaptiveTarget);

  return Math.max(minQuestions, Math.min(maxQuestions, preferred));
}

function simulationStageTitle(code: string): string {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.title;
  switch (code) {
    case "F1_L1": return "Unit and prefix explorer";
    case "F1_L2": return "Vector direction explorer";
    case "F1_L6": return "Accuracy and precision explorer";
    case "F1_L5": return "Density explorer";
    case "F1_L4": return "Significant figures explorer";
    case "F1_L3": return "Measurement explorer";
    case "F2_L1": return "Motion path explorer";
    case "F2_L2": return "Acceleration explorer";
    case "F2_L3": return "Distance-time graph explorer";
    case "F2_L4": return "Velocity-time graph explorer";
    case "F2_L5": return "Resultant force explorer";
    case "F2_L6": return "Force and mass explorer";
    case "F3_L1": return "Work transfer explorer";
    case "F3_L2": return "Energy stores explorer";
    case "F3_L3": return "Power and efficiency explorer";
    case "F3_L4": return "Momentum system explorer";
    case "F3_L5": return "Impulse-time explorer";
    case "F3_L6": return "Braking safety explorer";
    case "F4_L1": return "Charge and current explorer";
    case "F4_L2": return "Potential difference explorer";
    case "F4_L3": return "Resistance and I-V explorer";
    case "F4_L4": return "Series circuit explorer";
    case "F4_L5": return "Parallel circuit explorer";
    case "F4_L6": return "Power and safety explorer";
    case "M1_L1": return "Quest lane and mission log explorer";
    case "M1_L2": return "Pace log explorer";
    case "M1_L3": return "Boost-shift explorer";
    case "M1_L4": return "Quest forecast explorer";
    case "M1_L5": return "Dual-log gradient explorer";
    case "M1_L6": return "Area hunter explorer";
    default: return "Simulation inquiry";
  }
}

function simulationStageInstructions(code: string, inquiry: UnknownRecord[]): string {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.instructions;
  switch (code) {
    case "F1_L1": return "Hold the physical quantity fixed while you swap unit size. Compare what happens when the same length is written in km, m, cm, or mm, and decide which unit keeps the report readable without changing the quantity itself.";
    case "F1_L2": return "Use the route board and arrow panel together so you keep route length separate from start-to-finish change. Then hold either magnitude or direction fixed to see what really changes a vector.";
    case "F1_L6": return "Use the target board and reading table together so cluster position, cluster spread, and uncertainty stay separate. Compare bias with scatter instead of collapsing everything into the word error.";
    case "F1_L5": return "Keep the volume fixed and change the mass, then keep the mass fixed and change the volume. Watch how the density comparison changes the float-or-sink result.";
    case "F1_L4": return "Compare rounding with calculation rules. Use the next digit to round, the least decimal places for addition or subtraction, and the least significant figures for multiplication or division.";
    case "F1_L3": return "Move through four short checks: match the object to the tool, read the scale honestly, compare repeated-reading spread, then test zero-error bias.";
    case "F2_L1": return "Build one journey and read three different ideas from it: total distance, net displacement, and average speed over the whole trip.";
    case "F2_L2": return "Compare the starting velocity and ending velocity over a chosen time interval, then connect the sign and size of acceleration to the change in velocity.";
    case "F2_L3": return "Build a moving-stopped-moving journey and read the story from the distance-time graph by matching each segment to what the traveller is doing.";
    case "F2_L4": return "Use one velocity-time graph to answer two different questions: the slope gives acceleration, and the area under the graph gives displacement.";
    case "F2_L5": return "Compare equal and unequal opposing forces so you can separate the balanced case from the case that produces acceleration.";
    case "F2_L6": return "Hold one variable steady while you change the other so you can see clearly how force and mass affect acceleration.";
    case "F3_L1": return "Change force and distance together so work is seen as energy transfer, not just as effort.";
    case "F3_L2": return "Compare how mass, speed, and height affect kinetic and gravitational potential energy.";
    case "F3_L3": return "Use the explorer to separate the rate relationship from the usefulness relationship: change time to change power, hold power to track energy transferred, and change useful output to change efficiency.";
    case "F3_L4": return "Track the whole-system momentum before and after the collision, then compare what happens when the second trolley is lighter or heavier.";
    case "F3_L5": return "Keep the momentum change fixed, stretch the stopping time, and use the force-time blocks to see why equal area can mean different forces.";
    case "F3_L6": return "Use the same car to compare three linked ideas at once: momentum now, kinetic energy now, and how force comes from the rate of change of momentum during the stop.";
    case "F4_L1": return "Use the Flow-Grid loop to compare a closed route with a broken route, then watch how the same charge stream passes every checkpoint in one single path.";
    case "F4_L2": return "Use the Flow-Grid source station to compare how much energy each packet gains, so voltage becomes the energy boost per charge rather than just another number beside current.";
    case "F4_L3": return "Change the source push and the path difficulty separately so current is seen as the stream response to voltage and resistance before Ohm's law is introduced formally.";
    case "F4_L4": return "Build one single-route Flow-Grid network and watch how adding difficulty anywhere changes the stream everywhere while the source push is shared across the route.";
    case "F4_L5": return "Open a split-route Flow-Grid network so branch voltage stays tied to the same endpoints while the current divides and recombines across the branches.";
    case "F4_L6": return "Use the Flow-Grid source station, stream rate, and safety gate together so power, total energy transfer, and protective cut-off become one system story.";
    case "M1_L1": return "Use the Quest-Log lane and mission log together so you keep the motion world separate from the graph world and stop reading the graph as the shape of the route.";
    case "M1_L2": return "Use the Quest-Log pace log to keep speed-now and change-of-speed separate, so graph height and graph slope stop collapsing into one idea.";
    case "M1_L3": return "Use signed pace arrows and boost shift so acceleration becomes a directional rate of velocity change rather than a vague idea of getting faster.";
    case "M1_L4": return "Use the Quest-Log forecast board only when the boost shift stays constant, then choose the equation from the story instead of by pattern matching.";
    case "M1_L5": return "Lay the same tilt across a progress log and a pace log so the class sees that slope meaning comes from the axes, not from steepness alone.";
    case "M1_L6": return "Treat the shaded pace-log region as accumulated progress strips so area becomes total distance and different shapes can still represent the same distance.";
    default: return text(inquiry[0]?.prompt) || "Explore the activity and notice what changes as you test the idea.";
  }
}

function simulationStageTaskPrompt(code: string, inquiry: UnknownRecord[]): string {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.taskPrompt;
  switch (code) {
    case "F1_L1": return "Use one classroom-sized object and one tiny object, then report each in a sensible unit. Explain why the number changes when the unit changes even though the physical quantity does not.";
    case "F1_L2": return "Create one journey where the distance is large but the displacement is small, then rotate one arrow without changing its length and explain what changed in the vector description.";
    case "F1_L6": return "Build one reading set that is precise but inaccurate and one that is accurate on average but less precise. Then estimate the uncertainty and explain the difference between bias and scatter.";
    case "F1_L5": return "Find one setup that floats and one that sinks, then explain which density comparison changed.";
    case "F1_L4": return "Try one addition or subtraction example and one multiplication or division example, then explain why the reporting rule changes.";
    case "F1_L3": return "Work through the four stages in order and explain what each stage adds to the trustworthiness of the final measurement.";
    case "F2_L1": return "Create one round trip with zero displacement and one trip with a long distance but small displacement, then explain how the same journey can produce both results.";
    case "F2_L2": return "Build one case with positive acceleration, one with negative acceleration, and one with zero acceleration. Explain each sign from the velocity change, not from a guess.";
    case "F2_L3": return "Make a graph with a steep section, a flat section, and a less-steep section, then explain what the traveller is doing in each part.";
    case "F2_L4": return "Choose one setup and explain both the acceleration and the displacement from the same graph without mixing up slope and area.";
    case "F2_L5": return "Create one balanced-force case and one unbalanced-force case, then explain what each case says about acceleration and motion.";
    case "F2_L6": return "Start with one force-mass pair, then compare what happens when you double the force and when you double the mass.";
    case "F3_L1": return "Create one moving case and one no-movement case, then explain why only one transfers energy as work.";
    case "F3_L2": return "Build one comparison where speed matters more than mass, and one where changing height changes the energy store.";
    case "F3_L3": return "Build one case where the same energy is transferred in less time, one case where the same power runs for longer, and a third case where only the useful fraction changes. Then explain which quantity changed in each case.";
    case "F3_L4": return "Start with one incoming momentum, then compare how a lighter second trolley and a heavier second trolley change the shared final speed.";
    case "F3_L5": return "Hold the momentum change fixed, compare a short stop with a longer stop, and explain why the same impulse can still give a safer collision.";
    case "F3_L6": return "Use one car to compare the current stop, a doubled-speed stop, and a longer stopping-time case, then explain how force depends on the rate of change of momentum as well as why speed is such a demanding safety variable.";
    case "F4_L1": return "Build one closed loop and one open loop, then explain why a single-route network keeps the same stream rate at each checkpoint only when the route is complete.";
    case "F4_L2": return "Compare one case with a bigger source push and another with more charge moved, then explain why voltage is energy transferred per charge rather than the amount of charge itself.";
    case "F4_L3": return "Hold the path difficulty fixed and raise the source push, then hold the push fixed and make the path harder. Explain how both changes alter stream rate in the Flow-Grid model.";
    case "F4_L4": return "Start with one route, add a second resistor in series, and explain why the whole network stream rate changes everywhere while the source push is shared between the components.";
    case "F4_L5": return "Start with one branch, add a second branch between the same two points, and explain why branch voltage stays the same while total current rises.";
    case "F4_L6": return "Use one route to compare a safe case, a higher-current case, and a longer-running case, then explain how power, total energy, and fuse action are linked in the Flow-Grid story.";
    case "M1_L1": return "Build one Quest-Log run with motion, a pause tile, and more motion, then compare it with a different mission log that reaches the same final progress score.";
    case "M1_L2": return "Create one flat, one rising, and one falling pace log, then explain what height and slope each say at the same instant.";
    case "M1_L3": return "Choose one positive, one negative, and one zero boost-shift case, then explain each sign from the signed velocity change over time.";
    case "M1_L4": return "Use one constant-boost story to decide which equation finds the missing value, then explain why the same forecast board should not be trusted when acceleration changes.";
    case "M1_L5": return "Hold one common gradient across two Quest-Log screens and explain why the same tilt means pace on one graph but acceleration on another.";
    case "M1_L6": return "Split one pace log into rectangle and triangle parts, then compare it with a different graph that encloses the same total area.";
    default: return text(inquiry[1]?.prompt) || text(inquiry[0]?.hint);
  }
}

function simulationStageExploreSteps(code: string): string[] {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.exploreSteps;
  switch (code) {
    case "F1_L1":
      return [
        "Start with one fixed length and rewrite it in a larger unit and then in a smaller unit.",
        "Keep the quantity fixed while you compare how the reported number grows or shrinks with unit size.",
        "Test one tiny object and one long journey so you can justify unit choice instead of converting mechanically.",
      ];
    case "F1_L2":
      return [
        "Hold the arrow length fixed and rotate it so the magnitude stays the same while the direction changes.",
        "Reset, then hold the direction fixed while you change the magnitude only.",
        "Build one out-and-back route and compare total route length with the start-to-finish arrow.",
      ];
    case "F1_L3":
      return [
        "Stage 1: choose an object and decide which instrument is the best fit for its size.",
        "Stage 2: keep the object fixed while you compare the smallest division, the reported reading, and the uncertainty.",
        "Stage 3: inspect repeated readings so you can judge whether the scatter is tight or wide.",
        "Stage 4: switch on a zero error and compare the observed reading with the corrected reading.",
      ];
    case "F1_L4":
      return [
        "Round one raw value to different significant-figure targets so the kept digits are easy to track.",
        "Use one addition example and one multiplication example with the same numbers.",
        "Explain which reporting rule came from decimal places and which came from significant figures.",
      ];
    case "F1_L5":
      return [
        "Keep the volume fixed and increase the mass so the packing becomes tighter.",
        "Reset, then keep the mass fixed and increase the volume so the same mass is spread out.",
        "Compare the resulting density with water to explain floating and sinking from density rather than from size alone.",
      ];
    case "F1_L6":
      return [
        "Start with a tight reading cluster centered on the true value.",
        "Move the cluster away from the true value while keeping it tight so you isolate bias from spread.",
        "Now widen the spread around the true value and estimate an uncertainty from the repeated readings.",
      ];
    case "F2_L1":
      return [
        "Start with no return path so distance and displacement are the same, then add a return path and compare the change.",
        "Keep the outward path fixed while you increase the return path to see which quantity follows the full route and which quantity follows the finishing point.",
        "Change the travel time only, then decide which quantity changes because time changed and which two do not.",
      ];
    case "F2_L2":
      return [
        "Keep the time interval fixed and make the end velocity larger than the start velocity.",
        "Reverse that pattern so the end velocity is smaller than the start velocity.",
        "Match the start and end velocities to test the zero-acceleration case.",
      ];
    case "F2_L3":
      return [
        "Choose a first speed and notice the slope of the first segment.",
        "Add a pause and identify the flat section where distance stops changing.",
        "Change the second speed and compare which segment is steeper and therefore faster.",
      ];
    case "F2_L4":
      return [
        "Pick a start velocity, end velocity, and time interval for one motion.",
        "Read the slope of the line as the acceleration by comparing the velocity change over the time.",
        "Read the shaded area under the graph as the displacement and compare it with the slope result.",
      ];
    case "F2_L5":
      return [
        "Make both forces equal to test the balanced case first.",
        "Increase one side to create a non-zero resultant force.",
        "Swap which side is larger and see how the direction of the resultant changes.",
      ];
    case "F2_L6":
      return [
        "Keep the mass fixed and increase the force so you can compare the acceleration directly.",
        "Reset, then keep the force fixed and increase the mass.",
        "Compare the ratios so you can describe the pattern, not just one number.",
      ];
    case "F3_L1":
      return [
        "Keep the force fixed and increase the distance to watch work grow in direct proportion.",
        "Keep the distance fixed and change the force to compare the energy transferred.",
        "Switch to a zero-movement case and explain why the work becomes zero.",
      ];
    case "F3_L2":
      return [
        "Hold mass fixed and raise the speed so you can compare the strong change in kinetic energy.",
        "Reset and raise the mass with the same speed to compare the weaker effect.",
        "Now raise the height and watch gravitational potential energy change without needing motion.",
      ];
    case "F3_L3":
      return [
        "Keep the input energy fixed and shorten the time so you can isolate the change in power only.",
        "Keep the input and time fixed while you change the useful output so only the efficiency changes.",
        "Compare the faster case with the less-wasteful case and explain why they are not automatically the same process.",
      ];
    case "F3_L4":
      return [
        "Set the incoming trolley mass and speed first so the starting momentum is clear.",
        "Change only the second trolley mass while it starts at rest.",
        "Explain why the same total momentum leads to a smaller shared speed when more mass joins the motion.",
      ];
    case "F3_L5":
      return [
        "Choose one momentum change and calculate the average force for a short stopping time.",
        "Increase the stopping time while keeping the momentum change fixed, then compare the new force.",
        "Use the force-time blocks to explain why the same area can still have a different height and width.",
      ];
    case "F3_L6":
      return [
        "Keep the mass fixed and raise the speed so you can compare how momentum and kinetic energy change by different amounts.",
        "Now lengthen the stopping time and compare how much the average force falls when the same momentum change happens more slowly.",
        "Use the three comparisons to explain why force is the rate of change of momentum and what safety features are trying to change during a crash.",
      ];
    case "F4_L1":
      return [
        "Start with a closed loop and count the packet stream at two checkpoints so current is seen as a whole-route flow, not a quantity that gets used up.",
        "Break the loop at one point and compare what happens to every checkpoint in the network.",
        "Keep the loop closed but raise the source push, then explain what changes and what stays common around one complete route.",
      ];
    case "F4_L2":
      return [
        "Keep the same charge moving but raise the source push so each packet gains more energy from the source station.",
        "Now keep the source push fixed and move more charge so you can separate energy per charge from total energy transferred.",
        "Compare the source station with a lamp and explain how the same charge can keep moving while its electrical energy per packet changes.",
      ];
    case "F4_L3":
      return [
        "Hold the path difficulty fixed and raise the source push so you can watch the packet stream rate increase.",
        "Now hold the push fixed and make the route harder so you can see the stream rate fall.",
        "Compare two straight I-V graph lines and explain why the steeper I-V slope means an easier path and therefore a lower resistance.",
      ];
    case "F4_L4":
      return [
        "Start with one single-route loop and note the same packet stream rate at each point on the route.",
        "Add a second difficult section in series and compare how the current changes everywhere in the loop.",
        "Use equal and unequal series components to explain how the source push is shared across the route sections.",
      ];
    case "F4_L5":
      return [
        "Begin with one branch, then open a second branch between the same two supply points.",
        "Compare the current in each branch with the total current leaving the source station.",
        "Explain why branch push stays the same while the total stream rate rises when another route opens.",
      ];
    case "F4_L6":
      return [
        "Hold the voltage fixed and raise the current so power rises as the Flow-Grid moves more energy each second.",
        "Keep the power fixed but run the route for longer so total transferred energy keeps increasing.",
        "Raise the current above the safety-gate threshold and explain why the protective cut-off opens the route.",
      ];
    case "M1_L1":
      return [
        "Start with one steady run segment, then add a pause tile so only the flat part of the mission log changes.",
        "Rebuild the journey with different segment slopes but a similar finishing height so the final distance stays separate from the story of how it was reached.",
        "Name which information comes from graph height and which comes from graph steepness before you describe the motion.",
      ];
    case "M1_L2":
      return [
        "Begin with a flat pace log so the speed is constant and the slope is zero.",
        "Raise the end speed to create a positive slope, then lower it below the start to create a negative slope.",
        "Compare one instant on two graphs and decide what the height says there and what the slope says there.",
      ];
    case "M1_L3":
      return [
        "Choose a positive direction and write the initial and final velocities with signs.",
        "Compare the same velocity change over a short time and a longer time so the rate idea becomes visible.",
        "Build one positive, one negative, and one zero case, then decide whether the object is speeding up, slowing down, or changing direction.",
      ];
    case "M1_L4":
      return [
        "Start with a constant-acceleration story and list the known and unknown variables.",
        "Choose the equation whose missing-variable pattern fits the story instead of the one that simply looks familiar.",
        "Switch off the constant-acceleration condition and explain why the Quest-Log forecast board should no longer be used directly.",
      ];
    case "M1_L5":
      return [
        "Set one common tilt and read it first on a distance-time graph, then on a speed-time graph.",
        "Keep the gradient fixed while changing the starting height on the speed-time graph so height and slope stay separate.",
        "Explain the meaning from the axes before you name the quantity.",
      ];
    case "M1_L6":
      return [
        "Choose start speed, end speed, and time for one straight-line speed-time graph.",
        "Split the shaded area into a rectangle and a triangle, then add them for the total distance.",
        "Compare that total with a different graph that encloses the same area so equal distance does not imply identical motion.",
      ];
    default:
      return [];
  }
}
function simulationStageWatchFor(code: string): string[] {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.watchFor;
  switch (code) {
    case "F1_L1":
      return [
        "The physical quantity stays fixed while the unit size changes.",
        "Smaller units need more copies of themselves, so the number usually grows.",
        "A complete measurement keeps the number and the unit together.",
      ];
    case "F1_L2":
      return [
        "Scalars need magnitude only.",
        "Vectors need magnitude and direction.",
        "Distance follows the route, while displacement follows the start-to-finish change.",
      ];
    case "F1_L3":
      return [
        "A suitable tool matches the object scale and the needed resolution.",
        "Reported uncertainty should match the smallest useful scale division.",
        "Random scatter and systematic bias are different trust problems.",
      ];
    case "F1_L4":
      return [
        "Leading zeros place the decimal point but do not usually count as significant figures.",
        "Addition and subtraction follow decimal-place limits.",
        "Multiplication and division follow significant-figure limits.",
      ];
    case "F1_L5":
      return [
        "Density compares mass with volume, so both matter together.",
        "Greater density means more mass packed into the same volume.",
        "Float-or-sink reasoning comes from density comparison, not mass alone.",
      ];
    case "F1_L6":
      return [
        "Accuracy is about closeness to the accepted value.",
        "Precision is about closeness among repeated readings.",
        "Uncertainty should describe the spread or trust limit shown by the data.",
      ];
    case "F2_L1":
      return [
        "Distance adds every part of the route.",
        "Displacement compares the finishing point with the starting point and keeps direction.",
        "Average speed uses total distance divided by total time for the whole journey.",
      ];
    case "F2_L2":
      return [
        "Acceleration comes from final velocity minus initial velocity, divided by time.",
        "The sign tells you the direction of the velocity change relative to the chosen positive direction.",
        "Negative acceleration does not automatically mean slowing down in every situation.",
      ];
    case "F2_L3":
      return [
        "The slope of a distance-time graph tells you the speed.",
        "A flat section means the traveller is stopped, not moving backward.",
        "The graph height is distance from the start, not speed.",
      ];
    case "F2_L4":
      return [
        "Slope and area come from the same graph but answer different questions.",
        "Slope gives acceleration.",
        "Area under the graph gives displacement.",
      ];
    case "F2_L5":
      return [
        "Equal and opposite forces give zero resultant force.",
        "Zero resultant force means zero acceleration, not automatically zero velocity.",
        "The direction of the resultant follows the larger side when the forces are unequal.",
      ];
    case "F2_L6":
      return [
        "Acceleration is proportional to force when mass stays fixed.",
        "Acceleration is inversely related to mass when force stays fixed.",
        "The force in F = ma is the resultant force, not just any one force in a diagram.",
      ];
    case "F3_L1":
      return [
        "Work measures energy transferred by a force.",
        "A force alone is not enough; movement in the force direction is required.",
        "For the simple cases in this lesson, work = force x distance moved in the force direction.",
      ];
    case "F3_L2":
      return [
        "Kinetic energy depends on mass and speed.",
        "Speed is squared, so doubling speed quadruples kinetic energy.",
        "Gravitational potential energy depends on mass, g, and height.",
      ];
    case "F3_L3":
      return [
        "Power is a rate: P = E / t, so less time for the same energy means more power.",
        "The same relationship can be rearranged to E = Pt or t = E / P when energy or time is the missing quantity.",
        "Efficiency is still a separate fraction: useful output divided by total input.",
      ];
    case "F3_L4":
      return [
        "The law of conservation of linear momentum says total system momentum before the collision equals total system momentum after the collision for an isolated system.",
        "Momentum equals mass multiplied by velocity, so both mass and direction matter in the total.",
        "Apply the law to the whole system only when external forces are negligible during the interaction.",
      ];
    case "F3_L5":
      return [
        "Impulse equals force multiplied by time, so both the height and width of the force-time block matter.",
        "Impulse also equals the change in momentum, which is why the total area must stay the same if the momentum change stays the same.",
        "The same impulse over more time means less average force because the same area is spread wider.",
      ];
    case "F3_L6":
      return [
        "Average force is the rate of change of momentum, so the same momentum change in less time means a larger force.",
        "Momentum rises directly with speed, so doubling speed doubles the momentum that must be changed during the stop.",
        "Kinetic energy rises with speed squared, so doubling speed quadruples the energy that must be removed.",
      ];
    case "F4_L1":
      return [
        "Current is charge flow rate, so it depends on how much charge passes each second.",
        "In one closed single-route loop, the same current passes every checkpoint.",
        "A lamp transfers energy but does not use current up.",
      ];
    case "F4_L2":
      return [
        "Potential difference is energy transferred per unit charge, not the amount of charge moving.",
        "A cell raises electrical energy per charge, while a component transfers some of that energy away.",
        "The same charge can keep circulating even though its electrical energy per charge changes.",
      ];
    case "F4_L3":
      return [
        "At fixed resistance, more voltage gives more current for an ohmic component.",
        "At fixed voltage, greater resistance gives less current because the path is harder.",
        "A steeper straight I-V graph line means more current per volt and therefore lower resistance.",
      ];
    case "F4_L4":
      return [
        "A series circuit is one complete route, so the same current flows through every component.",
        "Adding series resistance makes the whole route harder and reduces the current everywhere.",
        "The supply voltage is shared across the series components.",
      ];
    case "F4_L5":
      return [
        "Each parallel branch spans the same two supply points, so each branch has the same potential difference.",
        "Current splits between branches and recombines afterward.",
        "Adding another branch usually lowers the overall difficulty and increases the total current.",
      ];
    case "F4_L6":
      return [
        "Power tells how fast electrical energy is transferred: P = VI.",
        "Total electrical energy still depends on how long that power runs: E = Pt.",
        "Safety devices protect circuits by cutting off dangerously large current before overheating becomes severe.",
      ];
    case "M1_L1":
      return [
        "Graph height tells the recorded total distance by that time.",
        "Graph steepness tells how quickly distance is being added, so it represents speed.",
        "A flat section means the object is stopped for that interval, and the same finishing height can still come from a different journey story.",
      ];
    case "M1_L2":
      return [
        "On a speed-time graph, height tells the speed at that instant.",
        "Slope tells how the speed or velocity is changing, so it is about acceleration, not distance.",
        "A flat section above zero still means motion, and equal graph height does not guarantee equal acceleration.",
      ];
    case "M1_L3":
      return [
        "Acceleration is change in velocity divided by time.",
        "The sign of acceleration depends on the chosen positive direction and the signed change in velocity.",
        "Negative acceleration does not automatically mean slowing down in every situation.",
      ];
    case "M1_L4":
      return [
        "The standard motion equations in this lesson assume constant acceleration.",
        "Equation choice should come from the known variables, the unknown variable, and which variable you want to avoid.",
        "A sensible unit check and motion-story check help catch a wrong equation choice.",
      ];
    case "M1_L5":
      return [
        "Gradient meaning depends on the axes, not on steepness alone.",
        "Distance-time gradient gives speed, while speed-time gradient gives acceleration.",
        "Graph height and graph gradient must be kept separate on both graph types.",
      ];
    case "M1_L6":
      return [
        "Area under a speed-time graph gives total distance traveled over the interval.",
        "Rectangle and triangle pieces can be added to build the total distance.",
        "Two different graph shapes can enclose the same total area and therefore the same total distance.",
      ];
    default:
      return [];
  }
}
function simulationStageTryFirst(code: string): string | undefined {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.tryFirst;
  switch (code) {
    case "F1_L1":
      return "Try 2.5 m first. Rewrite it as cm and then as mm. The physical length stays the same, but the number grows because the unit chunks got smaller.";
    case "F1_L2":
      return "Try a 6 m east arrow, then rotate it north without changing the length. After that, build a 10 m out, 4 m back journey and compare the 14 m distance with the 6 m displacement.";
    case "F1_L3":
      return "Start with Stage 1 using chalk and the ruler, then move to Stage 2 with the marble or wire so you can feel when a finer tool becomes justified.";
    case "F1_L4":
      return "Try 12.349 to 3 significant figures first, then compare 12.4 + 0.33 with 12.4 x 0.33 so you can see why the reporting rule changes with the operation.";
    case "F1_L5":
      return "Try 40 g in 20 cm^3 first. The density is 2 g/cm^3, so it is denser than water. Then keep the mass fixed and double the volume so the density falls.";
    case "F1_L6":
      return "Start with a true value of 10.0, a mean reading of 9.6, and a spread of 0.2. That gives a precise but biased set. Then move the mean to 10.0 and widen the spread to compare accuracy with precision.";
    case "F2_L1":
      return "Try outward 12 m, return 10 m, and time 4 s. You should get 22 m distance, 2 m east displacement, and 5.5 m/s average speed.";
    case "F2_L2":
      return "Try start velocity 4 m/s, end velocity 12 m/s, and time 2 s. The acceleration should be +4 m/s^2.";
    case "F2_L3":
      return "Try first speed 2 m/s, pause 3 s, and second speed 6 m/s. The final segment should be steeper than the first, and the middle should be flat.";
    case "F2_L4":
      return "Try start velocity 2 m/s, end velocity 8 m/s, and time 4 s. The acceleration is 1.5 m/s^2 and the displacement is 20 m.";
    case "F2_L5":
      return "Try 5 N left and 9 N right. The resultant force is 4 N to the right, so the motion changes rightward.";
    case "F2_L6":
      return "Try 8 N and 4 kg first. Then double the force to 16 N and compare it with doubling the mass to 8 kg.";
    case "F3_L1":
      return "Try 20 N over 4 m with movement enabled. The work should be 80 J.";
    case "F3_L2":
      return "Try mass 4 kg, speed 6 m/s, and height 3 m. KE should be 72 J and GPE should be 120 J if g = 10 N/kg.";
    case "F3_L3":
      return "Try 800 J input, 400 J useful output, and 4 s first. The power is 200 W and the efficiency is 50%. Then cut the time to 2 s so power rises to 400 W without changing efficiency, and finally keep power at 200 W for 6 s to see energy transferred rise to 1200 J.";
    case "F3_L4":
      return "Try incoming mass 2 kg, speed 6 m/s, and second mass 4 kg. The total momentum before is 12 kg m/s, so the shared speed after should be 2 m/s because the law of conservation of linear momentum keeps the whole-system total the same. Then reduce the second mass and notice that the shared speed increases.";
    case "F3_L5":
      return "Try a momentum change of 600 kg m/s over 0.3 s. That means the impulse is 600 N s as well, so the average force is 2000 N. Then double the time and notice the same impulse and momentum change with half the force.";
    case "F3_L6":
      return "Try mass 1000 kg, speed 12 m/s, and stopping time 0.6 s. The momentum is 12000 kg m/s, so stopping in 0.6 s gives an average force of 20000 N. Then double the speed and compare how momentum doubles, kinetic energy quadruples, and the same stop time would demand a larger force.";
    case "F4_L1":
      return "Try 12 C in 3 s on a closed loop. The current should be 4 A at every checkpoint. Then open the loop and compare what happens everywhere.";
    case "F4_L2":
      return "Try 3 C and 12 J first. The potential difference is 4 V because each coulomb gains 4 J of energy.";
    case "F4_L3":
      return "Try 12 V with 4 ohms first. The current is 3 A. Then keep 12 V and raise the resistance to 8 ohms so the current falls to 1.5 A.";
    case "F4_L4":
      return "Try a 12 V supply with two 3 ohm resistors in series. The total resistance is 6 ohms, the current is 2 A everywhere, and each resistor has a 6 V drop.";
    case "F4_L5":
      return "Try branch currents of 2 A and 1 A across the same 12 V supply. The total current should be 3 A while each branch still has the same 12 V across it.";
    case "F4_L6":
      return "Try 12 V, 2 A, and 10 s first. The power is 24 W and the total transferred energy is 240 J. Then raise the current to 4 A and compare the larger power.";
    case "M1_L1":
      return "Try Run A with 3 m/s for 2 s, pause for 2 s, then 5 m/s for 4 s. The log should reach 12 m, stay flat, then finish at 32 m after 8 s. Now compare it with a steady 4 m/s run that reaches the same 32 m after 8 s.";
    case "M1_L2":
      return "Try 6 m/s to 12 m/s over 3 s. Height shows speed in m/s, while slope is +2 m/s^2. Then compare it with a flat 12 m/s line so the same final speed does not force the same acceleration.";
    case "M1_L3":
      return "Try +8 m/s to +2 m/s in 3 s with east positive. The acceleration is -2 m/s^2. Then swap to -8 m/s to -2 m/s in 3 s and explain why the acceleration becomes +2 m/s^2 while the object is still slowing down.";
    case "M1_L4":
      return "Try u = 4 m/s, a = 3 m/s^2, and t = 4 s. Use v = u + at first to get 16 m/s, then use the same story to see why s = ut + 1/2at^2 gives 40 m only because the acceleration stays constant.";
    case "M1_L5":
      return "Try a gradient of 3. On distance-time it means 3 m/s; on speed-time it means 3 m/s^2. Then test a zero gradient and compare why one graph means stopped while the other means constant speed.";
    case "M1_L6":
      return "Try u = 4 m/s, v = 10 m/s, and t = 6 s. Rectangle plus triangle gives 42 m. Then design a second graph with the same 42 m total area but a different speed history.";
    default:
      return undefined;
  }
}
function simulationStageTakeaway(code: string): string | undefined {
  const m2 = m2SimulationCopy(code);
  if (m2) return m2.takeaway;
  switch (code) {
    case "F1_L1":
      return "Units are not decorations; they are part of the measurement, and changing the unit size changes the number without changing the physical quantity.";
    case "F1_L2":
      return "Vectors become clearer when you treat direction as part of the quantity, while distance and displacement are kept as different questions about the same journey.";
    case "F1_L3":
      return "A trustworthy measurement is built in stages: choose the right tool, read only what the scale supports, check the scatter, and then rule out zero-error bias.";
    case "F1_L4":
      return "A reported answer should carry only the precision the data truly supports, which is why rounding rules depend on the type of calculation.";
    case "F1_L5":
      return "Density is the packing story behind mass, volume, floating, and sinking, so size alone can never tell the whole story.";
    case "F1_L6":
      return "Measurement trust improves when you separate accuracy, precision, bias, scatter, and uncertainty instead of treating them as one idea.";
    case "F2_L1":
      return "One journey can cover a long route yet finish close to the start, so distance and displacement are not interchangeable.";
    case "F2_L2":
      return "Acceleration tells the story of how velocity changes, including direction, not just whether an object feels faster.";
    case "F2_L3":
      return "Distance-time graphs become clear when you read each segment as part of a motion story.";
    case "F2_L4":
      return "A velocity-time graph is powerful because one feature tells you acceleration and another tells you displacement.";
    case "F2_L5":
      return "Balanced forces do not create acceleration; only a non-zero resultant force changes motion.";
    case "F2_L6":
      return "More resultant force produces more acceleration, while more mass makes the same force less effective.";
    case "F3_L1":
      return "Work is the language of energy transfer by forces, so the number tells you how much energy moved into or out of the object.";
    case "F3_L2":
      return "Energy can be stored in motion or in position, and the formulas show which physical change matters most in each case.";
    case "F3_L3":
      return "Power, energy, and time are tied by one rate relationship, while efficiency is a separate useful-fraction check. Keep those two ideas apart when you explain a process.";
    case "F3_L4":
      return "The law of conservation of linear momentum becomes clearer when you total the whole-system momentum before and after the interaction instead of following only one object.";
    case "F3_L5":
      return "Impulse is the name for the momentum change during the interaction, so stretching the collision over more time can reduce force even though exactly the same momentum change still has to happen.";
    case "F3_L6":
      return "High-speed braking is dangerous because force depends on how quickly momentum is changed, while kinetic energy also rises especially quickly as speed rises.";
    case "F4_L1":
      return "A current story becomes clearer when you see the whole loop carrying one common charge stream instead of treating current as something a device uses up.";
    case "F4_L2":
      return "Potential difference makes sense when you treat it as energy transferred per charge, not as a second kind of current.";
    case "F4_L3":
      return "Resistance is best understood as the route difficulty that controls how much current a given voltage can drive.";
    case "F4_L4":
      return "Series reasoning is one route, one current, and one supply push shared across all the difficult sections.";
    case "F4_L5":
      return "Parallel reasoning is shared branch voltage with current splitting and recombining across the branches.";
    case "F4_L6":
      return "Electrical power, total energy transfer, and safety all fit one story: how fast energy moves, how long it moves, and when excessive current must be cut off.";
    case "M1_L1":
      return "A distance-time graph becomes readable when you keep route, graph height, and graph steepness doing different jobs.";
    case "M1_L2":
      return "A speed-time graph only becomes clear when graph height means current speed and graph slope means acceleration.";
    case "M1_L3":
      return "Acceleration is a signed rate of velocity change, so its sign must be read from the chosen direction and the change in velocity.";
    case "M1_L4":
      return "The constant-acceleration equations are a forecast toolkit that only works when the motion story really has one steady acceleration.";
    case "M1_L5":
      return "The same slope can tell different physics stories because axes decide whether the rate is speed or acceleration.";
    case "M1_L6":
      return "Area under a speed-time graph is total distance because each strip combines a time width with a speed height.";
    default:
      return undefined;
  }
}
function postEvent(moduleId: string, lessonId: string, body: UnknownRecord): Promise<unknown> {
  return apipPost<unknown, JsonObject>(`/progress/${encodeURIComponent(moduleId)}/event`, {
    ...body,
    details: {
      lesson_id: normalizeLessonId(lessonId),
      ...asRecord(body.details),
    },
  } as JsonObject);
}

function scaffoldFocusExtras(code: string): string[] {
  const m2 = m2ScaffoldFocusExtras(code);
  if (m2.length > 0) return m2;
  switch (code) {
    case "F1_L1":
      return [
        "A quantity names what is being measured, while a unit names the agreed size used to measure it.",
        "Common classroom sub-units include cm, mm, g, mg, ms, and mL.",
        "Pick a unit size that matches the object so the number stays readable.",
        "Precision depends on the smallest division the tool can reliably show.",
      ];
    case "F1_L2":
      return [
        "Scalars describe how much only.",
        "Vectors describe how much and which way.",
        "Direction words such as north, east, upward, and backward are strong vector clues.",
        "Speed and velocity are related, but only velocity includes direction.",
      ];
    case "F1_L3":
      return [
        "Resolution is the smallest change an instrument can show.",
        "A more precise tool usually has finer divisions and a smaller uncertainty.",
        "A measurement should not pretend to be more exact than the instrument allows.",
        "Repeated careful readings increase trust when they agree closely.",
        "Random errors make repeated readings scatter unpredictably around a value.",
        "Systematic errors shift readings the same way each time, often because of zero error or poor calibration.",
      ];
    case "F1_L4":
      return [
        "Significant figures show how much precision a reported number really carries.",
        "Leading zeros do not count as significant figures.",
        "Rounding depends on the next digit after the last figure you want to keep.",
        "Calculated answers should not claim more precision than the measurements used.",
      ];
    case "F1_L5":
      return [
        "Density compares mass with volume, so both quantities matter together.",
        "Dense materials pack more mass into the same volume.",
        "Keep the compound density unit with the answer, such as g/cm^3 or kg/m^3.",
        "Unit consistency matters before substituting values into the formula.",
      ];
    case "F1_L6":
      return [
        "Precision is about closeness among repeated readings.",
        "Accuracy is about closeness to the accepted or true value.",
        "A set of readings can be precise without being accurate, and accurate without being very precise.",
        "Trustworthy measurements balance good technique, suitable tools, and honest uncertainty.",
      ];

    case "F2_L1":
      return [
        "Do not subtract stages until you have checked whether the question asks for distance or displacement.",
        "Compare the finishing point with the starting point before you write a displacement answer.",
        "Average speed must use the whole journey, not just the fastest stage.",
        "Keep direction words with displacement and velocity answers.",
      ];
    case "F2_L2":
      return [
        "Keep the sign on both velocities before subtracting to find the change in velocity.",
        "A negative acceleration is about direction relative to the sign convention, not automatically about slowing down.",
        "Changing direction changes velocity even when the speed stays the same.",
        "Decide whether velocity and acceleration point together or opposite ways before you say the object is speeding up or slowing down.",
      ];
    case "F2_L3":
      return [
        "The height of a distance-time graph is distance, but the slope tells the speed.",
        "Compare segments separately instead of judging the whole graph by its overall shape.",
        "A flat section means the object is stopped, not moving backwards.",
        "A steeper segment means a greater speed because more distance is added each second.",
      ];
    case "F2_L4":
      return [
        "Do not confuse slope with area because they answer different questions from the same graph.",
        "A horizontal line can have zero acceleration and still produce a non-zero displacement.",
        "Positive and negative velocity affect the sign of the displacement, not just its size.",
        "Check the time interval before you calculate either slope or area.",
      ];
    case "F2_L5":
      return [
        "Forces cancel only when they are equal and opposite.",
        "Zero resultant force means zero acceleration, not zero velocity.",
        "Subtract opposite forces but add forces that act in the same direction.",
        "Keep the direction of the larger side when the forces are unequal.",
      ];
    case "F2_L6":
      return [
        "Use the resultant force in F = ma, not just one force from the diagram.",
        "If force doubles with mass fixed, acceleration doubles.",
        "If mass doubles with force fixed, acceleration halves.",
        "Inertia is not an extra force; it is the resistance to motion change.",
      ];
    case "F3_L1":
      return [
        "Work is not the same as effort; it is an energy-transfer quantity.",
        "In this lesson, only movement in the force direction counts in the simple work calculation.",
        "No movement means no work is done on the object by that force.",
        "Interpret the work value as energy transferred, not just as a multiplication result.",
      ];
    case "F3_L2":
      return [
        "Kinetic energy depends on speed more strongly than mass because speed is squared.",
        "Gravitational potential energy depends on how high the object is lifted above the reference level.",
        "The same object can store energy in different ways depending on motion and position.",
        "Track which variable changed before deciding which store changed.",
      ];
    case "F3_L3":
      return [
        "Power links transferred energy and time through P = E / t, so the same energy in less time means more power.",
        "Rearrange the same relationship as E = Pt when energy is unknown and t = E / P when time is unknown.",
        "Efficiency still answers a different question: how much of the input becomes useful output.",
        "Fast does not automatically mean efficient, so keep the power calculation separate from the efficiency calculation.",
      ];
    case "F3_L4":
      return [
        "The law of conservation of linear momentum says the total linear momentum of an isolated system stays constant through the interaction.",
        "Momentum keeps direction because velocity keeps direction, so signs or direction words matter in the total.",
        "Total momentum belongs to the whole system, not to one object alone.",
        "Opposite momenta can partly or completely cancel in the system total.",
      ];
    case "F3_L5":
      return [
        "Impulse is the same physical quantity as the change in momentum, so Ft, graph area, and momentum change are three views of one idea.",
        "Start by identifying the momentum change, then connect it to impulse before you compare different force-time combinations.",
        "Longer interaction time reduces force when the impulse is fixed.",
        "Safer collisions often come from spreading the same change over more time.",
      ];
    case "F3_L6":
      return [
        "Average force = change in momentum / time, so force is the rate of change of momentum.",
        "Speed affects momentum and kinetic energy differently, so do not treat them as the same trend.",
        "A heavier vehicle at the same speed carries more momentum and more kinetic energy.",
        "Safety features often work by increasing stopping time or stopping distance so the same momentum change happens more slowly.",
      ];
    case "F4_L1":
      return [
        "Current is about how much charge passes a point each second, not about how much charge exists in total.",
        "A closed loop lets the same packet stream pass every checkpoint in one route.",
        "Opening the route stops the stream everywhere because the whole loop is broken.",
        "Components transfer energy without using current up.",
      ];
    case "F4_L2":
      return [
        "Potential difference tells how much electrical energy each coulomb gains or loses.",
        "The same charge can move with different electrical energy per charge at different parts of the loop.",
        "Cells give charge electrical energy; components transfer it away to other stores.",
        "Total energy transfer depends on both volts and the amount of charge moved.",
      ];
    case "F4_L3":
      return [
        "Resistance is the difficulty of the route, so a harder path gives less current for the same push.",
        "Ohm's law becomes intuitive when students first see stream rate respond to push and difficulty.",
        "At fixed resistance, current rises with voltage; at fixed voltage, current falls with resistance.",
        "A steeper straight I-V graph slope means lower resistance because more current flows per volt.",
      ];
    case "F4_L4":
      return [
        "A series circuit is one single-route network, so the current is the same everywhere.",
        "Adding another component in series increases total path difficulty for the whole network.",
        "The supply push is shared across the series components as separate voltage drops.",
        "Position in the route does not let one resistor take more current than another.",
      ];
    case "F4_L5":
      return [
        "A parallel circuit is a split-route network with the same branch endpoints.",
        "Each branch gets the same potential difference because each spans the same two points.",
        "Current divides between branches and recombines after the junction.",
        "Adding another branch gives the source an easier overall network and usually raises the total current.",
      ];
    case "F4_L6":
      return [
        "Electrical power is the rate of energy transfer, so it depends on both voltage and current.",
        "Total energy transferred still depends on how long that rate continues.",
        "Large current increases heating risk, so safety devices are designed to interrupt dangerous current.",
        "A complete explanation should link power, total energy over time, and protection in one circuit story.",
      ];
    case "M1_L1":
      return [
        "The mission log is a record of motion, not a picture of the lane.",
        "A higher point means more distance has been recorded by that time, not that the avatar is moving faster there.",
        "Compare the graph one segment at a time before telling the whole motion story.",
        "Steeper distance-time sections mean more distance is added each second.",
      ];
    case "M1_L2":
      return [
        "Separate speed-now from change-in-speed whenever you read a speed-time graph.",
        "A speed-time graph does not encode direction by itself, so a downward slope is not reverse travel automatically.",
        "Compare flat, rising, and falling sections as different speed stories across time.",
        "Two sections can show similar speeds but different accelerations if their slopes differ.",
      ];
    case "M1_L3":
      return [
        "Choose a positive direction before you interpret any acceleration sign.",
        "Keep the signs on both velocities before you subtract to find the velocity change.",
        "A negative acceleration does not automatically mean slowing down; it depends on the velocity direction too.",
        "A direction change can create acceleration even when the speed does not change.",
      ];
    case "M1_L4":
      return [
        "Check the constant-acceleration condition before you use a forecast equation.",
        "The equations compress one steady boost pattern; they are not magic spells for every motion story.",
        "The block-plus-triangle picture explains why displacement grows from both starting pace and added pace.",
        "Use consistent units and signs before substituting into the equation board.",
      ];
    case "M1_L5":
      return [
        "Name the graph type before you interpret any slope.",
        "Zero gradient means different physics on different graphs, so context comes first.",
        "Height and gradient answer different questions even on the same graph.",
        "The same numerical slope can carry different units and meanings when the axes change.",
      ];
    case "M1_L6":
      return [
        "Area meaning comes from the speed-time axes, not from the word graph alone.",
        "The final graph height is final speed, not total distance.",
        "Mixed journeys need the areas from all sections added together.",
        "Words, equations, and graphs must still tell the same motion story after the area is found.",
      ];
    default:
      return [];
  }
}
function scaffoldCoreBullets(code: string): string[] {
  const m2 = m2ScaffoldCoreBullets(code);
  if (m2.length > 0) return m2;
  switch (code) {
    case "F1_L1":
      return [
        "Every measurement has two parts: a number and a unit.",
        "The unit tells what physical quantity the number belongs to.",
        "SI units are shared standards, so measurements can be compared anywhere.",
        "Prefixes such as kilo-, centi-, and milli- create larger or smaller versions of the same base unit.",
        "Convert by replacing the prefixed unit with its value in the base unit.",
        "Never compare or combine measurements until the units match.",
      ];
    case "F1_L2":
      return [
        "Vectors need both magnitude and direction.",
        "Scalars need magnitude only.",
        "Direction words help you spot vectors quickly.",
        "Distance is not the same idea as displacement, and speed is not the same idea as velocity.",
      ];
    case "F1_L3":
      return [
        "State only the precision your instrument supports.",
        "Smaller scale divisions usually reduce uncertainty.",
        "Repeat readings to check consistency.",
        "Choose the tool that matches the size of the object you are measuring.",
        "Use repeated readings to spot random error.",
        "Check for zero error or poor calibration to catch systematic error.",
      ];
    case "F1_L4":
      return [
        "Count only the digits that carry measured meaning.",
        "Leading zeros do not add significant figures.",
        "Round from the first digit you do not plan to keep.",
        "Final answers should match the precision of the original measurement.",
      ];
    case "F1_L5":
      return [
        "Density = mass / volume.",
        "Mass and volume must be in consistent units before calculation.",
        "Denser materials pack more mass into the same space.",
        "Keep the compound density unit in the final answer.",
      ];
    case "F1_L6":
      return [
        "Precision is about the spread of repeated readings.",
        "Accuracy is about closeness to the accepted value.",
        "A result can show one of these strengths without the other.",
        "Trustworthy measurements report uncertainty honestly.",
      ];

    case "F2_L1":
      return [
        "Distance adds every part of the route, even when the traveller doubles back.",
        "Displacement connects the starting point to the finishing point and must keep direction.",
        "Average speed uses the total distance and the total time for the whole journey.",
        "A round trip can have a large distance and zero displacement.",
      ];
    case "F2_L2":
      return [
        "Velocity is a vector, so either speed change or direction change can alter it.",
        "Acceleration measures the rate of change of velocity, not just how fast something is moving.",
        "Use final velocity minus initial velocity before dividing by time.",
        "Interpret the sign only after choosing a positive direction.",
      ];
    case "F2_L3":
      return [
        "A distance-time graph shows how total distance changes across the journey.",
        "The slope of each segment gives the speed on that segment.",
        "A flat segment means no change in distance, so the object is stationary.",
        "Changing steepness means the speed is changing.",
      ];
    case "F2_L4":
      return [
        "A velocity-time graph shows how velocity changes with time.",
        "Slope gives acceleration, while area gives displacement.",
        "A horizontal line can mean constant non-zero velocity even though acceleration is zero.",
        "Positive and negative regions carry direction, not just size.",
      ];
    case "F2_L5":
      return [
        "Resultant force is the net force left after combining all forces with direction.",
        "Balanced forces give zero resultant force.",
        "Zero resultant force means zero acceleration, so the motion stays unchanged.",
        "Unbalanced forces cause acceleration in the direction of the resultant.",
      ];
    case "F2_L6":
      return [
        "F = ma connects the size of the resultant force to the acceleration it produces.",
        "Mass resists changes in motion, so a larger mass lowers the acceleration for the same force.",
        "Force and acceleration change together when mass stays fixed.",
        "Inertia explains why heavier systems are harder to speed up or slow down.",
      ];
    case "F3_L1":
      return [
        "Work = force x distance moved in the force direction.",
        "Work measures energy transferred by a force.",
        "No displacement means no work is done on the object by that force.",
        "Force and distance must be linked to the same interaction.",
      ];
    case "F3_L2":
      return [
        "Kinetic energy = 0.5mv^2.",
        "Gravitational potential energy = mgh.",
        "Speed has a squared effect on kinetic energy.",
        "Height changes gravitational potential energy directly when g stays fixed.",
      ];
    case "F3_L3":
      return [
        "Power = energy transferred / time.",
        "Energy transferred = power x time.",
        "Time = energy transferred / power.",
        "Efficiency = useful output / total input.",
      ];
    case "F3_L4":
      return [
        "Linear momentum = mass x velocity.",
        "The law of conservation of linear momentum says total system momentum before an isolated interaction equals total system momentum after it.",
        "Momentum needs direction or a sign convention because opposite directions can cancel in the total.",
        "After a collision, compare the whole-system total, not one object by itself.",
      ];
    case "F3_L5":
      return [
        "Impulse = force x time.",
        "Impulse = change in momentum.",
        "Area under a force-time graph gives impulse.",
        "For a fixed impulse, more time means less average force.",
      ];
    case "F3_L6":
      return [
        "Average force = change in momentum / time.",
        "Force is the rate of change of momentum, so the same change spread over more time gives a smaller average force.",
        "Momentum changes with speed directly, but kinetic energy changes with speed squared.",
        "Crash safety depends on managing both the momentum change and the energy dissipation.",
      ];
    case "F4_L1":
      return [
        "Current = charge / time.",
        "In one simple loop, the current is the same everywhere.",
        "Opening the loop stops current everywhere.",
        "A component can transfer energy without using current up.",
      ];
    case "F4_L2":
      return [
        "Potential difference = energy transferred / charge.",
        "Energy transferred = potential difference x charge.",
        "A cell raises electrical energy per charge, while a component lowers it.",
        "Charge can keep circulating while electrical energy per charge changes.",
      ];
    case "F4_L3":
      return [
        "Resistance = voltage / current for an ohmic component.",
        "Current = voltage / resistance for an ohmic component.",
        "Greater resistance means less current for the same voltage.",
        "A steeper straight I-V graph slope means lower resistance.",
      ];
    case "F4_L4":
      return [
        "Series circuits have one continuous route.",
        "The current is the same through every series component.",
        "Total series resistance adds.",
        "The supply voltage is shared across the series components.",
      ];
    case "F4_L5":
      return [
        "Parallel circuits have multiple routes between the same two points.",
        "Each branch has the same potential difference as the supply.",
        "Total current equals the sum of the branch currents.",
        "Adding another branch usually increases the total current.",
      ];
    case "F4_L6":
      return [
        "Electrical power = VI.",
        "Electrical energy transferred = Pt.",
        "Electrical energy transferred can also be written as VIt.",
        "Fuses and circuit breakers protect circuits by breaking the route when current becomes too large.",
      ];
    case "M1_L1":
      return [
        "A distance-time graph shows how recorded distance changes with time.",
        "Distance-time graph slope gives speed on that segment.",
        "A flat section means distance stays unchanged, so the avatar is paused.",
        "The same final distance can come from different motion stories.",
      ];
    case "M1_L2":
      return [
        "A speed-time graph shows the speed at each moment.",
        "Speed-time graph slope gives acceleration.",
        "A flat line above zero means constant speed, not rest.",
        "A downward slope means the speed is decreasing.",
      ];
    case "M1_L3":
      return [
        "Acceleration is the rate of change of velocity.",
        "The sign of acceleration comes from the signed velocity change.",
        "Zero acceleration can still describe steady non-zero motion.",
        "Velocity and acceleration directions together decide whether speed grows or shrinks.",
      ];
    case "M1_L4":
      return [
        "Constant-acceleration equations summarize one steady-change motion pattern.",
        "Choose the equation from the knowns, the unknown, and the conditions.",
        "v = u + at updates velocity under constant acceleration.",
        "s = ut + 1/2at^2 combines starting pace with added pace.",
      ];
    case "M1_L5":
      return [
        "Gradient meaning depends on the graph type.",
        "Distance-time gradient = speed.",
        "Speed-time gradient = acceleration.",
        "The same steepness can represent different physical quantities.",
      ];
    case "M1_L6":
      return [
        "Area under a speed-time graph = total distance traveled.",
        "Rectangle area handles constant-speed sections.",
        "Triangle or trapezium area handles uniformly changing-speed sections.",
        "Different speed-time shapes can still produce the same total distance.",
      ];
    default:
      return [];
  }
}
function scaffoldTeachingFocusBullets(code: string): string[] {
  switch (code) {
    case "F2_L1":
      return [
        "Distance counts route length, so every stage adds to it even if later motion partly cancels the position change.",
        "Displacement compares the finishing position with the starting position, so only the net change and its direction matter.",
        "Average speed uses total distance over total time, so you need whole-journey totals rather than a quick average of stage speeds.",
        "Direction is what makes displacement and velocity vectors, so east or west must stay in the final answer while distance and speed do not need direction words.",
      ];
    case "F2_L2":
      return [
        "Velocity can change because speed changes or because direction changes, which is why turning motion still has changing velocity.",
        "Acceleration is the rate of change of velocity, so it tracks how quickly the velocity vector changes each second.",
        "Choose a positive direction first and keep the signs on the initial and final velocities before subtracting.",
        "To decide whether motion speeds up or slows down, compare the directions of velocity and acceleration; a negative sign alone does not decide it.",
      ];
    case "F2_L3":
      return [
        "Read the axes first: the graph shows total distance against time, so graph height tells how much distance has been covered by that time.",
        "Speed comes from slope because slope tells how much distance is added each second, not how high the graph sits.",
        "A flat section means distance is unchanged while time passes, so the object is stationary during that interval.",
        "Different segments can represent different speeds, so interpret the graph one stage at a time before summarizing the whole journey.",
      ];
    case "F2_L4":
      return [
        "On a velocity-time graph, the vertical value is velocity at that instant, including direction relative to the chosen sign convention.",
        "Slope answers the acceleration question because it shows how quickly velocity changes with time.",
        "Area under the graph answers the displacement question because it adds velocity over time, with sign included.",
        "A horizontal line can still mean motion if the velocity is non-zero, while negative sections show motion opposite to the chosen positive direction.",
      ];
    case "F2_L5":
      return [
        "Resultant force is the vector sum of all forces, so direction must be included before adding or subtracting.",
        "Balanced forces mean zero resultant force and therefore zero acceleration, not automatically zero velocity.",
        "With zero resultant force, motion stays unchanged: the object can remain at rest or continue at constant velocity.",
        "When forces are unbalanced, the acceleration points in the direction of the resultant force.",
      ];
    case "F2_L6":
      return [
        "F = ma says resultant force causes acceleration, so the law is about changing motion rather than speed alone.",
        "The force in the equation must be the net force after all forces are combined, not just one force copied from the diagram.",
        "For the same force, a larger mass gives less acceleration because mass measures resistance to motion change.",
        "For a fixed mass, acceleration increases with force; for a fixed force, acceleration decreases as mass increases.",
      ];
    case "F3_L1":
      return [
        "Work is the energy transferred by a force, so the quantity only becomes meaningful when you connect the force to an actual displacement in its direction.",
        "A force can exist without doing work on an object if there is no movement in the force direction during that interaction.",
        "When the same force acts through a greater distance, more energy is transferred, which is why the work value grows directly with distance.",
        "Treat the final answer as a statement about energy transfer, not just as a calculator result.",
      ];
    case "F3_L2":
      return [
        "Kinetic energy belongs to motion, so both mass and speed matter, but speed matters more strongly because it is squared.",
        "Gravitational potential energy belongs to position in a gravitational field, so the relevant change is height above the chosen reference level.",
        "When a moving object climbs or falls, energy can move between kinetic and gravitational stores as the situation changes.",
        "Identify which store the question is asking about before substituting numbers.",
      ];
    case "F3_L3":
      return [
        "Power connects three quantities at once: transferred energy, time, and rate, so the lesson should begin by deciding which of the three is missing.",
        "If the same amount of energy is transferred in less time, the power rises; if the same power runs for longer, the energy transferred rises.",
        "A machine can be very powerful because it transfers energy quickly while still being inefficient because too much of the input becomes wasted output.",
        "After using P = E / t or one of its rearrangements, keep efficiency as a separate useful-output comparison that can never exceed 100%.",
      ];
    case "F3_L4":
      return [
        "The law of conservation of linear momentum says the total momentum of an isolated system before the interaction must equal the total momentum after the interaction.",
        "Momentum combines how much matter is moving with how fast and in which direction it moves, so direction must stay in the reasoning.",
        "Equal and opposite momenta can cancel, which is why zero total momentum does not mean the objects are motionless individually.",
        "Before using the law, check that external forces are negligible during the interaction you are analysing.",
      ];
    case "F3_L5":
      return [
        "Start from the law impulse = change in momentum, so any force-time calculation is really another way of describing the momentum change.",
        "Because impulse also equals force x time, the same momentum change can be delivered by a large force acting briefly or a smaller force acting for longer.",
        "A force-time graph is not decorative here: its area is the impulse, so geometry and physics are telling the same story.",
        "Safety reasoning improves when you stop asking how to remove the momentum change and start asking how to spread it over more time.",
      ];
    case "F3_L6":
      return [
        "Braking and collisions are not explained well by one formula alone because the vehicle must both change momentum and dissipate kinetic energy, and the stopping force depends on how quickly that momentum changes.",
        "Force can be written as change in momentum divided by time, so a short, sharp stop produces a larger force than the same momentum change spread over longer time.",
        "Higher speed raises momentum directly, but kinetic energy rises even faster, which is why high-speed braking becomes disproportionately demanding.",
        "A complete safety explanation should identify the momentum change, the stopping time, and how that time changes the force as the rate of change of momentum.",
      ];
    default:
      return [];
  }
}
function scaffoldWorkedExample(lesson: UnknownRecord): UnknownRecord {
  const code = lessonCode(lesson);
  const firstPrompt = text(asRecord(itemsFrom(lesson, "transfer")[0]).prompt) || text(asRecord(itemsFrom(lesson, "diagnostic")[0]).prompt) || "Use the key idea from this lesson to solve a similar problem.";

  switch (code) {
    case "F1_L1":
      return {
        body: "Start with a real conversion question and solve it step by step.",
        worked_example: {
          prompt: "A hiking trail is 2.5 km long, and a wire is 35 cm long. Write both lengths in metres.",
          steps: [
            "Name the base unit you want at the end. Here the target unit is the metre.",
            "Replace each prefix with its scale: 1 km = 1000 m and 1 cm = 0.01 m.",
            "Convert one value at a time: 2.5 x 1000 = 2500 and 35 x 0.01 = 0.35.",
            "Rewrite the two answers with the same unit so they can now be compared safely.",
          ],
          answer: "2.5 km = 2500 m and 35 cm = 0.35 m",
        },
      };
    case "F1_L2":
      return {
        body: "Start with a real classification question and solve it step by step.",
        worked_example: {
          prompt: "A delivery robot moves 12 m east. Is that description scalar or vector?",
          steps: [
            "Look for magnitude first. The 12 m tells you the size of the motion.",
            "Look for direction next. The word east gives a direction.",
            "A quantity that has both magnitude and direction is a vector.",
            "So the description is a vector, not a scalar.",
          ],
          answer: "It is a vector because it includes both magnitude and direction.",
        },
      };
    case "F1_L3":
      return {
        body: "Start with a real precision question and solve it step by step.",
        worked_example: {
          prompt: "A ruler has 1 mm divisions and a line reads 6.4 cm. What uncertainty is reasonable to report?",
          steps: [
            "Start with the smallest division on the instrument, which is 1 mm.",
            "For a simple scale reading, a reasonable uncertainty is about half the smallest division.",
            "Half of 1 mm is 0.5 mm, which is the same as 0.05 cm.",
            "Attach that uncertainty to the measured value instead of pretending the ruler is more precise than it is.",
          ],
          answer: "6.4 cm +/- 0.05 cm is a reasonable report.",
        },
      };
    case "F1_L4":
      return {
        body: "Start with a real significant-figures question and solve it step by step.",
        worked_example: {
          prompt: "A measurement is 4.5607 g. Write it to 3 significant figures.",
          steps: [
            "Count significant figures from the first non-zero digit: 4, 5, and 6 are the first three.",
            "Look at the next digit, which is 0, to decide whether to round the third figure up or keep it.",
            "Because the next digit is less than 5, keep the 6 unchanged.",
            "Write the answer as 4.56 g.",
          ],
          answer: "4.56 g",
        },
      };
    case "F1_L5":
      return {
        body: "Start with a real density question and solve it step by step.",
        worked_example: {
          prompt: "A block has mass 120 g and volume 40 cm^3. What is its density?",
          steps: [
            "Start with the density relationship: density = mass / volume.",
            "Substitute the values carefully: 120 g / 40 cm^3.",
            "Carry out the division: 120 / 40 = 3.",
            "Keep the compound unit with the answer.",
          ],
          answer: "3 g/cm^3",
        },
      };
    case "F1_L6":
      return {
        body: "Start with a real measurement-quality question and solve it step by step.",
        worked_example: {
          prompt: "Two scales give 50.0 g and 49.9 g for the same object. Which reading is more precise?",
          steps: [
            "Look at the resolution each reading suggests. A value written to 0.1 g is more precise than one written to 1 g.",
            "Precision is about how finely the tool can distinguish values, not whether the reading is exactly true.",
            "A reading like 49.9 g shows finer resolution than a reading rounded to the nearest whole gram.",
            "So the scale reporting to 0.1 g is the more precise one.",
          ],
          answer: "The 49.9 g reading is more precise because it shows finer resolution.",
        },
      };
    case "F2_L1":
      return {
        body: "Separate the full route from the start-to-finish change before you compare any numbers.",
        worked_example: {
          prompt: "A learner walks 10 m east and then 4 m west. Find the distance travelled and the displacement.",
          steps: [
            "Distance is the full path travelled, so add both parts of the journey: 10 m + 4 m = 14 m.",
            "Displacement compares the finishing point with the starting point, so keep the net change in direction.",
            "After walking 10 m east and then 4 m west, the learner finishes 6 m east of the start.",
            "State the two answers separately because distance and displacement describe different ideas.",
          ],
          answer: "Distance = 14 m, displacement = 6 m east.",
        },
      };
    case "F2_L2":
      return {
        body: "Track the signed change in velocity first, then decide what the sign of the acceleration means.",
        worked_example: {
          prompt: "A cyclist moving east slows from 12 m/s to 4 m/s in 2 s. Take east as positive. Find the acceleration and interpret its sign.",
          steps: [
            "Write the relationship first: acceleration = change in velocity / time.",
            "Use the sign convention in the question, so the initial velocity is +12 m/s and the final velocity is +4 m/s.",
            "Calculate the change in velocity: 4 - 12 = -8 m/s, then divide by 2 s to get -4 m/s^2.",
            "The negative sign shows that the acceleration points west, opposite the chosen positive direction.",
          ],
          answer: "Acceleration = -4 m/s^2, so the acceleration points west.",
        },
      };
    case "F2_L3":
      return {
        body: "Read one segment at a time so the slope tells the speed on that part of the journey.",
        worked_example: {
          prompt: "On a distance-time graph, one straight segment rises from 6 m at 2 s to 18 m at 6 s. Find the speed on that segment.",
          steps: [
            "Use the two points from the same straight segment rather than the whole graph.",
            "Calculate the distance change: 18 - 6 = 12 m.",
            "Calculate the time change: 6 - 2 = 4 s, then use slope = distance change / time change.",
            "12 / 4 = 3, so the segment shows a constant speed of 3 m/s.",
          ],
          answer: "Speed = 3 m/s.",
        },
      };
    case "F2_L4":
      return {
        body: "Use slope and area separately so the same graph section can tell you both motion change and motion gained.",
        worked_example: {
          prompt: "A velocity-time graph shows a horizontal section at 4 m/s lasting 5 s. Find the displacement for that section and state the acceleration.",
          steps: [
            "A horizontal section means the velocity stays constant, so its slope is zero.",
            "Zero slope on a velocity-time graph means zero acceleration for that section.",
            "Displacement comes from the area under the graph; here the area is a rectangle.",
            "Area = velocity x time = 4 x 5 = 20, so the object gains 20 m of displacement.",
          ],
          answer: "Displacement = 20 m and acceleration = 0 m/s^2.",
        },
      };
    case "F2_L5":
      return {
        body: "Combine the forces first, then use the resultant to decide whether the motion can change.",
        worked_example: {
          prompt: "A cart is pulled with 10 N to the right and 6 N to the left. Find the resultant force and predict the motion change.",
          steps: [
            "The forces act in opposite directions, so compare them rather than adding their sizes.",
            "Subtract the smaller force from the larger one: 10 - 6 = 4 N.",
            "Keep the direction of the larger force, so the resultant force is 4 N to the right.",
            "Because the resultant is not zero, the cart accelerates to the right.",
          ],
          answer: "Resultant force = 4 N to the right, so the cart accelerates to the right.",
        },
      };
    case "F2_L6":
      return {
        body: "Use F = ma for the calculation, then reason about how changing the mass would alter the response.",
        worked_example: {
          prompt: "A 12 N resultant force acts on a 3 kg trolley. Find the acceleration and explain what happens if the mass doubles.",
          steps: [
            "Start with a = F / m because the question gives the resultant force and the mass.",
            "Substitute the values: a = 12 / 3 = 4 m/s^2.",
            "Now imagine the mass doubling to 6 kg while the force stays 12 N.",
            "The new acceleration would be 12 / 6 = 2 m/s^2, so doubling the mass halves the acceleration.",
          ],
          answer: "Acceleration = 4 m/s^2; if the mass doubles, the acceleration becomes 2 m/s^2.",
        },
      };
    case "F3_L1":
      return {
        body: "Tie the calculation to an energy-transfer statement so the number has physical meaning.",
        worked_example: {
          prompt: "A 20 N force pulls a crate 6 m along the floor in the same direction as the pull. How much work is done, and what does the answer mean?",
          steps: [
            "Start with work = force x distance moved in the force direction.",
            "Substitute the values carefully: work = 20 x 6.",
            "Calculate the result: work = 120 J.",
            "Interpret the answer: 120 J means the pulling force transferred 120 J of energy to the crate.",
          ],
          answer: "Work = 120 J, meaning 120 J of energy is transferred by the force.",
        },
      };
    case "F3_L2":
      return {
        body: "Use the energy-store idea to connect motion and height, not just to plug into one formula.",
        worked_example: {
          prompt: "A 2 kg trolley moves at 5 m/s and then climbs a ramp. What kinetic energy does it start with, and what height would have the same amount of gravitational potential energy if g = 10 N/kg?",
          steps: [
            "First calculate the kinetic energy: KE = 0.5 x 2 x 5^2 = 25 J.",
            "Now match that to gravitational potential energy: 2 x 10 x h = 25.",
            "Solve for the height: h = 25 / 20 = 1.25 m.",
            "So the same 25 J can appear as gravitational potential energy at 1.25 m.",
          ],
          answer: "The trolley starts with 25 J of kinetic energy, which matches a gravitational potential energy gain at 1.25 m.",
        },
      };
    case "F3_L3":
      return {
        body: "Start by linking power, energy, and time explicitly: P = E / t, E = Pt, and t = E / P. Then keep that rate relationship separate from the efficiency calculation.",
        worked_example: {
          prompt: "A machine transfers 900 J in 15 s and delivers 540 J as useful output. Find its power, find how much energy it would transfer in 5 s at the same power, and then find its efficiency.",
          steps: [
            "Start with power: P = E / t = 900 / 15 = 60 W, so the machine transfers energy at 60 joules each second.",
            "Now use the rearranged form E = Pt to find the energy transferred in 5 s at the same power: E = 60 x 5 = 300 J.",
            "Keep efficiency separate from that rate relationship: efficiency = useful output / total input = 540 / 900 = 0.60.",
            "Convert the fraction to 60%, then state the two ideas separately: 60 W describes how fast energy is transferred, while 60% describes how much of the input is useful.",
          ],
          answer: "Power = 60 W, the same machine would transfer 300 J in 5 s, and its efficiency = 60%.",
        },
      };
    case "F3_L4":
      return {
        body: "Start from the law of conservation of linear momentum: in an isolated system, total momentum before the collision equals total momentum after it. Then use that whole-system balance to interpret the shared final motion.",
        worked_example: {
          prompt: "A 2 kg trolley moving at 5 m/s hits a 3 kg trolley at rest and they stick together. Find their common speed after the collision.",
          steps: [
            "Write the law of conservation of linear momentum for the whole system: total momentum before = total momentum after.",
            "Find the total momentum before the collision: 2 x 5 = 10 kg m/s.",
            "Because the trolleys stick together, the total mass afterward is 5 kg.",
            "Apply the law: 10 = 5v, so the shared speed must satisfy the same total momentum after the collision.",
            "Solve to get v = 2 m/s. The same total momentum is now shared by more mass.",
          ],
          answer: "The common speed after the collision is 2 m/s.",
        },
      };
    case "F3_L5":
      return {
        body: "Start from the identity impulse = change in momentum, then connect that same quantity to force and time so the safety interpretation follows naturally.",
        worked_example: {
          prompt: "A cyclist's momentum changes by 240 kg m/s in 0.8 s while braking. Find the average force and explain what would happen if the stopping time doubled.",
          steps: [
            "Start with the momentum link: impulse = change in momentum = 240 kg m/s.",
            "Now connect that impulse to force and time by using average force = change in momentum / time = 240 / 0.8 = 300 N.",
            "If the stopping time doubles to 1.6 s, the momentum change stays the same, so the impulse stays 240 kg m/s.",
            "The force then becomes 240 / 1.6 = 150 N, so spreading the same impulse over more time halves the average force.",
          ],
          answer: "The impulse equals the 240 kg m/s momentum change, so the average force is 300 N; if the stopping time doubles, the same impulse gives 150 N.",
        },
      };
    case "F3_L6":
      return {
        body: "Start from the momentum side as well: average force equals change in momentum divided by time, so braking force depends on how quickly the vehicle is brought to a different momentum as well as how much kinetic energy must be removed.",
        worked_example: {
          prompt: "A 1000 kg car moving at 20 m/s is brought to rest in 0.5 s. Find the change in momentum and the average braking force, then explain what happens to the force if the same stop takes 1.0 s.",
          steps: [
            "Find the starting momentum: p = mv = 1000 x 20 = 20000 kg m/s, and the final momentum is 0 because the car stops.",
            "So the change in momentum is 20000 kg m/s in magnitude during the stop.",
            "Use average force = change in momentum / time = 20000 / 0.5 = 40000 N.",
            "If the same momentum change happens in 1.0 s instead, the average force becomes 20000 / 1.0 = 20000 N, so doubling the stopping time halves the force.",
          ],
          answer: "The stopping car changes momentum by 20000 kg m/s, so the average braking force is 40000 N in 0.5 s and 20000 N if the same stop takes 1.0 s.",
        },
      };
    case "F4_L1":
      return {
        body: "Start with the whole closed route, because current is a rate of charge flow around the loop rather than something one lamp keeps or loses.",
        worked_example: {
          prompt: "18 C pass a checkpoint in 3 s in a simple closed loop. Find the current and explain whether the current after the lamp is different.",
          steps: [
            "Use current = charge / time because the question gives total charge moved and the time taken.",
            "Substitute the values: I = 18 / 3 = 6 A.",
            "Now switch from the number to the loop idea: a simple series loop is one continuous route.",
            "The same 6 A current passes the checkpoint after the lamp as well, because the lamp transfers energy without using current up.",
          ],
          answer: "Current = 6 A, and it is still 6 A after the lamp in the same closed loop.",
        },
      };
    case "F4_L2":
      return {
        body: "Treat voltage as energy transferred per charge first, then use the same idea to explain why a cell and a lamp affect the same circulating charge differently.",
        worked_example: {
          prompt: "A cell transfers 15 J to 3 C of charge. Find the potential difference and explain what that means for each coulomb.",
          steps: [
            "Use potential difference = energy transferred / charge because the question is about energy per charge.",
            "Substitute the values: V = 15 / 3 = 5 V.",
            "Interpret the number instead of stopping at the calculation: 5 V means each coulomb gains 5 J of electrical energy from the cell.",
            "That is why voltage is about the energy boost per charge, not about how many charges are moving.",
          ],
          answer: "Potential difference = 5 V, meaning each coulomb gains 5 J of energy.",
        },
      };
    case "F4_L3":
      return {
        body: "Use the Flow-Grid idea of push and path difficulty before turning it into Ohm's law and graph interpretation.",
        worked_example: {
          prompt: "An ohmic resistor has 12 V across it and a current of 3 A. Find its resistance, then say what happens to the current if the same voltage acts on 6 ohms instead.",
          steps: [
            "Use resistance = voltage / current for the first part: R = 12 / 3 = 4 ohms.",
            "Now keep the voltage fixed at 12 V but make the path difficulty 6 ohms instead.",
            "Use current = voltage / resistance: I = 12 / 6 = 2 A.",
            "The current falls because the same push is trying to drive charge through a harder route.",
          ],
          answer: "The first resistor is 4 ohms, and with 6 ohms at the same 12 V the current becomes 2 A.",
        },
      };
    case "F4_L4":
      return {
        body: "Reason from one route first: same current everywhere, but extra series difficulty changes the whole loop and makes the supply push split across the components.",
        worked_example: {
          prompt: "A 12 V supply is connected to two identical 3 ohm resistors in series. Find the total resistance, the loop current, and the potential difference across each resistor.",
          steps: [
            "Series resistors add because the route difficulties stack: total resistance = 3 + 3 = 6 ohms.",
            "Use the whole-loop relationship to find the current: I = V / R = 12 / 6 = 2 A.",
            "Because it is one route, that 2 A current passes through both resistors.",
            "Each resistor has V = IR = 2 x 3 = 6 V, so the 12 V supply is shared equally across the identical components.",
          ],
          answer: "Total resistance = 6 ohms, current = 2 A everywhere, and each resistor has a 6 V drop.",
        },
      };
    case "F4_L5":
      return {
        body: "Begin with the split-route picture: branch voltage stays the same because each branch spans the same two points, while the total current is the sum of the branch currents.",
        worked_example: {
          prompt: "Two parallel branches carry 0.3 A and 0.5 A from the same supply. Find the total current and explain whether the potential difference across the two branches is the same or different.",
          steps: [
            "Add the branch currents because the total current splits and then recombines: 0.3 A + 0.5 A = 0.8 A.",
            "Now think about the geometry of the circuit: both branches connect across the same two supply points.",
            "Because the branches share the same start and finish points, each branch has the same potential difference as the supply.",
            "Different branch currents can still happen because the branch resistances can differ even while the branch voltage stays the same.",
          ],
          answer: "Total current = 0.8 A, and the potential difference across the two branches is the same.",
        },
      };
    case "F4_L6":
      return {
        body: "Keep the circuit story whole: voltage and current set the power, power over time sets the energy transferred, and safety devices respond when the current becomes dangerously large.",
        worked_example: {
          prompt: "A device operates at 12 V and 2 A for 15 s. Find its power, find the total electrical energy transferred, and explain why a fuse would be needed if the current became much larger than the safe rating.",
          steps: [
            "Start with power because the question gives voltage and current: P = VI = 12 x 2 = 24 W.",
            "Now use that rate to find the total transferred energy over time: E = Pt = 24 x 15 = 360 J.",
            "Keep the safety idea separate but connected: a much larger current would mean more energy transferred each second and more heating in the wires.",
            "A fuse or breaker protects the circuit by opening the route when the current becomes too large, rather than allowing dangerous heating to continue.",
          ],
          answer: "Power = 24 W, total electrical energy transferred = 360 J, and the fuse protects by cutting off dangerously large current.",
        },
      };
    default:
      return {
        body: "Start with a real question and solve it step by step.",
        worked_example: {
          prompt: firstPrompt,
          steps: [
            "Read the question carefully and identify the quantity or idea being tested.",
            "Choose the correct rule, definition, formula, or unit relationship for that idea.",
            "Work through the reasoning one step at a time before deciding on the answer.",
            "Check that the final statement keeps the right unit, meaning, or classification.",
          ],
          answer: "Use the lesson rule carefully and finish with a clear, correctly labelled answer.",
        },
      };
  }
}
function scaffoldReferenceTables(lesson: UnknownRecord): UnknownRecord[] {
  switch (lessonCode(lesson)) {
    case "F1_L1":
      return [
        {
          title: "Standard quantities, units, and common sub-units",
          caption: "Use this as a quick reference while learning the language of measurement.",
          columns: ["Quantity", "Standard unit", "Common sub-units or related units"],
          rows: [
            ["Length", "metre (m)", "km, cm, mm"],
            ["Mass", "kilogram (kg)", "g, mg"],
            ["Time", "second (s)", "ms, min"],
            ["Temperature", "kelvin (K)", "degree Celsius in everyday use"],
            ["Electric current", "ampere (A)", "mA"],
            ["Volume", "cubic metre (m^3)", "L, mL, cm^3"],
          ],
        },
        {
          title: "Prefix ladder",
          caption: "Move between unit sizes by replacing the prefix with its value in the base unit.",
          columns: ["Prefix", "Scale", "Example"],
          rows: [
            ["kilo-", "1000 times base unit", "1 km = 1000 m"],
            ["centi-", "1/100 of base unit", "1 cm = 0.01 m"],
            ["milli-", "1/1000 of base unit", "1 mm = 0.001 m"],
          ],
        },
      ];
    case "F1_L2":
      return [
        {
          title: "Common scalar quantities",
          caption: "Scalars tell how much only.",
          columns: ["Scalar quantity", "Why it is scalar"],
          rows: [
            ["Distance", "No direction is required"],
            ["Speed", "How fast only"],
            ["Mass", "Amount of matter only"],
            ["Time", "Duration only"],
            ["Temperature", "Hotter or colder only"],
            ["Energy", "Amount only"],
          ],
        },
        {
          title: "Common vector quantities",
          caption: "Vectors tell how much and which way.",
          columns: ["Vector quantity", "What makes it a vector"],
          rows: [
            ["Displacement", "Distance with direction"],
            ["Velocity", "Speed with direction"],
            ["Force", "Push or pull in a direction"],
            ["Acceleration", "Change in velocity with direction"],
            ["Weight", "Force acting downward"],
            ["Momentum", "Motion with direction"],
          ],
        },
      ];
    case "F1_L3":
      return [
        {
          title: "Common measurement tools",
          caption: "Different tools give different resolution and uncertainty.",
          columns: ["Tool", "Typical use", "What to notice"],
          rows: [
            ["Metre rule", "Desk or book length", "Good for medium lengths, moderate resolution"],
            ["Vernier caliper", "Small diameters or thicknesses", "Finer scale, lower uncertainty"],
            ["Micrometer screw gauge", "Very small thicknesses", "Very fine resolution"],
            ["Stopwatch", "Time intervals", "Reaction time affects uncertainty"],
          ],
        },
        {
          title: "Reading and uncertainty guide",
          caption: "Report only the precision your instrument can support.",
          columns: ["Instrument feature", "Meaning", "Example"],
          rows: [
            ["Smallest division", "Smallest scale step visible", "1 mm on a ruler"],
            ["Resolution", "Smallest meaningful change shown", "0.01 cm on a caliper"],
            ["Reasonable uncertainty", "Often about half the smallest division", "+/-0.5 mm for a 1 mm ruler"],
          ],
        },
        {
          title: "Types of measurement error",
          caption: "Different error patterns need different responses.",
          columns: ["Error type", "What it looks like", "How to reduce it"],
          rows: [
            ["Random error", "Readings scatter above and below the best value", "Repeat readings and average them"],
            ["Systematic error", "Every reading is shifted the same way", "Check zero error and calibrate the instrument"],
            ["Reading mistake", "A single careless misread stands out", "Read carefully and compare with repeat readings"],
          ],
        },
      ];
    case "F1_L4":
      return [
        {
          title: "Significant-figure rules",
          caption: "Use these rules when deciding which digits count.",
          columns: ["Pattern", "Rule", "Example"],
          rows: [
            ["Leading zeros", "Do not count", "0.0045 has 2 significant figures"],
            ["Non-zero digits", "Always count", "456 has 3 significant figures"],
            ["Zeros between non-zero digits", "Count", "4.05 has 3 significant figures"],
            ["Trailing zeros after a decimal", "Count", "2.300 has 4 significant figures"],
          ],
        },
        {
          title: "Rounding guide",
          caption: "Look at the next digit before you round.",
          columns: ["Target", "Look at", "Result"],
          rows: [
            ["3 significant figures in 12.349", "the next digit 4", "12.3"],
            ["2 decimal places in 7.186", "the next digit 6", "7.19"],
            ["3 significant figures in 0.00456", "the next digit after the last kept figure", "0.00456"],
          ],
        },
        {
          title: "Calculation reporting rules",
          caption: "Use one rule for addition or subtraction and a different rule for multiplication or division.",
          columns: ["Operation", "What controls the final answer", "Example"],
          rows: [
            ["Addition or subtraction", "Least decimal places", "12.34 + 1.2 = 13.5"],
            ["Multiplication or division", "Least significant figures", "2.5 x 3.42 = 8.6"],
            ["Calculator display", "Do not copy every digit blindly", "Write only the justified answer"],
          ],
        },
      ];
    case "F1_L5":
      return [
        {
          title: "Density relationships",
          caption: "Density links mass and volume in one idea.",
          columns: ["Quantity", "Meaning", "Common unit"],
          rows: [
            ["Mass", "How much matter is present", "g or kg"],
            ["Volume", "How much space is occupied", "cm^3, m^3, L"],
            ["Density", "Mass packed into each unit volume", "g/cm^3 or kg/m^3"],
          ],
        },
        {
          title: "Before using the formula",
          caption: "Check these steps before substituting numbers.",
          columns: ["Check", "Why it matters", "Example"],
          rows: [
            ["Match the units", "Mixed units can distort the answer", "Convert values into a consistent pair first"],
            ["Choose the formula", "Density = mass / volume", "Not mass x volume"],
            ["Keep the unit", "The number alone is incomplete", "3 g/cm^3"],
          ],
        },
      ];
    case "F1_L6":
      return [
        {
          title: "Accuracy and precision compared",
          caption: "These ideas are related, but they are not the same.",
          columns: ["Idea", "Question to ask", "What good performance looks like"],
          rows: [
            ["Accuracy", "How close is the result to the accepted value?", "The average reading is near the true value"],
            ["Precision", "How close are repeated readings to one another?", "The readings cluster tightly"],
            ["Trustworthiness", "Do the tool and method support the claim?", "Suitable instrument and honest uncertainty"],
          ],
        },
        {
          title: "Common result patterns",
          caption: "A set of readings can fall into four common patterns.",
          columns: ["Pattern", "Meaning", "Example description"],
          rows: [
            ["Accurate and precise", "Close to true value and tightly grouped", "Cluster on target"],
            ["Precise but not accurate", "Tightly grouped but off target", "Cluster away from target"],
            ["Accurate but not very precise", "Average near target but spread out", "Wide spread around target"],
            ["Neither", "Spread out and off target", "Scattered away from target"],
          ],
        },
      ];
    default: {
      const code = lessonCode(lesson);
      if (isExtendedNextgenLessonCode(code)) {
        const essentials = [...scaffoldCoreBullets(code), ...scaffoldFocusExtras(code)].filter(Boolean);
        const isFlowGrid = code.startsWith("F4_");
        const isModuleOne = code.startsWith("M1_");
        return [{ title: isFlowGrid ? "Circuit essentials" : "Lesson essentials", caption: isFlowGrid ? "Keep these Flow-Grid and circuit ideas visible while you work through the lesson." : isModuleOne ? "Keep these key graph, motion, and acceleration ideas visible while you work through the lesson." : "Keep these key motion or force ideas visible while you work through the lesson.", columns: ["Key idea", "Why it matters"], rows: essentials.slice(0, 6).map((item, index) => ["Idea " + String(index + 1), item]) }];
      }
      return [];
    }
  }
}



function scaffoldMediaCards(lesson: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  const m2 = m2ScaffoldMediaCards(code);
  if (m2.length > 0) return m2;
  switch (code) {
    case "F1_L1":
      return [
        {
          kind: "visual",
          title: "See the unit ladder",
          caption: "Picture the unit sizes stacked before you convert.",
          image_url: "/lesson-media/f1/f1-l1-metric-system.svg",
          highlights: ["km -> m -> cm -> mm", "To a smaller unit: the number grows", "To a larger unit: the number shrinks"],
        },
        {
          kind: "visual",
          title: "See why the unit matters",
          caption: "The same number can represent different quantities once the unit changes.",
          image_url: "/lesson-media/f1/f1-l1-unit-meaning.svg",
          highlights: ["5 m means a length", "5 s means a time", "5 kg means a mass"],
        },
      ];
    case "F1_L2":
      return [
        {
          kind: "visual",
          title: "Picture an arrow on a map",
          caption: "An arrow has a size and it points somewhere. That is the feel of a vector.",
          image_url: "/lesson-media/f1/f1-l2-vectors-scalars.svg",
          highlights: ["Arrow length = magnitude", "Arrow direction = where it points", "Displacement and force behave like this"],
        },
        {
          kind: "visual",
          title: "Picture a thermometer reading",
          caption: "A thermometer reading tells how much, but it does not point anywhere.",
          image_url: "/lesson-media/f1/f1-l2-vectors-scalars.svg",
          highlights: ["Magnitude only", "No direction needed", "Temperature, mass, and time behave like this"],
        },
      ];
    case "F1_L3":
      return [
        {
          kind: "visual",
          title: "See the measurement-resolution ladder",
          caption: "Keep the same object fixed and compare how ruler, caliper, and micrometer screw gauge support different justified digits and uncertainties.",
          image_url: "/lesson-media/f1/f1-l3-tool-resolution.svg",
          highlights: ["The object stays the same across all three rows", "Finer divisions support more justified detail", "Resolution controls the uncertainty you can honestly report"],
        },
        {
          kind: "interactive",
          title: "Manipulate one instrument at a time",
          caption: "Use the clean instrument tour to switch between ruler, caliper, and micrometer screw gauge without packing all three into one crowded picture.",
          interaction_key: "measurement_instrument_tour",
          highlights: ["Keep the same object while you swap tools", "See how smaller divisions justify more digits and smaller uncertainty", "Use the explainer steps like a mini walkthrough for each instrument"],
        },
        {
          kind: "visual",
          title: "Compare random error and zero error",
          caption: "Random error makes readings scatter around a best value, while zero error shifts every reading by the same fixed amount and must be corrected.",
          image_url: "/lesson-media/f1/f1-l3-reading-errors.svg",
          highlights: ["Random error varies from reading to reading, so averaging can help", "Zero error is a constant offset, so averaging alone will not fix it", "In the next measurement lab, compare spread, best estimate, and zero correction"],
        },
      ];
    case "F1_L4":
      return [
        {
          kind: "visual",
          title: "Picture the last kept digit",
          caption: "When rounding, your eyes should move to the next digit after the last one you want to keep.",
          image_url: "/lesson-media/f1/f1-l4-significant-figures.svg",
          highlights: ["Next digit 0-4: keep it", "Next digit 5-9: round it up", "Leading zeros do not add precision"],
        },
        {
          kind: "visual",
          title: "Picture a calculator and a lab notebook",
          caption: "A calculator may show many digits, but your final answer must still follow the operation rule: least significant figures for multiplication or division, and least decimal places for addition or subtraction.",
          image_url: "/lesson-media/f1/f1-l4-calculator-notebook.svg",
          highlights: ["Multiply or divide: keep the least significant figures", "Add or subtract: keep the least decimal places", "Calculator digits do not automatically belong in the notebook"],
        },
      ];
    case "F1_L5":
      return [
        {
          kind: "visual",
          title: "Picture equal-sized blocks",
          caption: "Use the density explorer to keep volume the same and raise the mass. The heavier same-size block is denser.",
          image_url: "/lesson-media/f1/f1-l5-density.svg",
          highlights: ["Keep the volume fixed", "Increase the mass and density rises", "Same space, different mass explains density"],
        },
        {
          kind: "visual",
          title: "Picture sinking and floating",
          caption: "In the next density activity, compare object density with fluid density and predict whether the object floats or sinks.",
          image_url: "/lesson-media/f1/f1-l5-float-sink.svg",
          highlights: ["Less dense than the fluid: float", "More dense than the fluid: sink", "In the next density activity, test your prediction"],
        },
      ];
    case "F1_L6":
      return [
        {
          kind: "visual",
          title: "Picture a target board",
          caption: "A tight cluster away from the centre is precise but not accurate. A cluster near the centre is accurate.",
          image_url: "/lesson-media/f1/f1-l6-accuracy-precision.svg",
          highlights: ["Cluster shape shows precision", "Position relative to centre shows accuracy", "You need both for strong measurements"],
        },
        {
          kind: "interactive",
          interaction_key: "measurement_report_lab",
          title: "Build a measurement report",
          caption: "Use the mini lab to test how the tool, the written value, and the uncertainty work together in one trustworthy report.",
          highlights: ["State the measurement", "State the uncertainty", "Match the claim to the instrument"],
        },
      ];
    case "F2_L1":
      return [
        {
          kind: "visual",
          title: "Map the route and the arrow",
          caption: "See the full travel path and the straight displacement arrow at the same time.",
          image_url: "/lesson-media/f2/f2-l1-distance-displacement.svg",
          highlights: ["Distance follows every segment of the path", "Displacement joins start to finish with one direction arrow", "A return leg can increase distance while shrinking displacement"],
        },
      ];
    case "F2_L2":
      return [
        {
          kind: "visual",
          title: "Compare the velocity arrows",
          caption: "Look at the starting and finishing velocity arrows before deciding what the acceleration must be.",
          image_url: "/lesson-media/f2/f2-l2-velocity-acceleration.svg",
          highlights: ["Velocity keeps direction", "Acceleration comes from the change in velocity", "The sign depends on the chosen positive direction"],
        },
      ];
    case "F2_L3":
      return [
        {
          kind: "visual",
          title: "Read the graph like a journey",
          caption: "Use the steep, flat, and shallow parts of the graph to tell the motion story segment by segment.",
          image_url: "/lesson-media/f2/f2-l3-distance-time-graph.svg",
          highlights: ["Steeper segment = faster motion", "Flat segment = stopped", "Each segment can tell a different speed story"],
        },
      ];
    case "F2_L4":
      return [
        {
          kind: "visual",
          title: "See slope and area together",
          caption: "The same velocity-time graph can show acceleration from slope and displacement from area.",
          image_url: "/lesson-media/f2/f2-l4-velocity-time-graph.svg",
          highlights: ["Slope answers how velocity changes", "Area answers how much displacement builds up", "Horizontal sections can still have non-zero displacement"],
        },
      ];
    case "F2_L5":
      return [
        {
          kind: "visual",
          title: "Picture balanced and unbalanced pulls",
          caption: "Compare equal opposite pulls with unequal pulls to see when a resultant force remains.",
          image_url: "/lesson-media/f2/f2-l5-resultant-force.svg",
          highlights: ["Equal opposite forces cancel", "Unequal forces leave a resultant", "The resultant points with the larger side"],
        },
      ];
    case "F2_L6":
      return [
        {
          kind: "visual",
          title: "Same push, different mass",
          caption: "Compare a light and heavy trolley under the same force to see why the lighter one accelerates more.",
          image_url: "/lesson-media/f2/f2-l6-force-mass.svg",
          highlights: ["The same force can produce different accelerations", "More mass means more resistance to motion change", "F = ma links force, mass, and acceleration"],
        },
      ];
    case "F3_L1":
      return [
        {
          kind: "visual",
          title: "See work as transferred energy",
          caption: "Compare a moving crate with a stuck wall so work is tied to motion, not just effort.",
          image_url: "/lesson-media/f3/f3-l1-work-energy.svg",
          highlights: ["Movement in the force direction matters", "No movement means no work on the object", "Work is measured in joules because it is energy transferred"],
        },
      ];
    case "F3_L2":
      return [
        {
          kind: "visual",
          title: "Compare motion energy and height energy",
          caption: "Use one picture to separate kinetic energy from gravitational potential energy.",
          image_url: "/lesson-media/f3/f3-l2-energy-stores.svg",
          highlights: ["Mass matters in both stores", "Speed matters strongly in kinetic energy", "Height matters directly in gravitational potential energy"],
        },
      ];
    case "F3_L3":
      return [
        {
          kind: "visual",
          title: "Split rate from usefulness",
          caption: "The same process can be fast, wasteful, both, or neither.",
          image_url: "/lesson-media/f3/f3-l3-power-efficiency.svg",
          highlights: ["Use P = E / t, E = Pt, and t = E / P", "Power tracks time", "Efficiency tracks useful fraction"],
        },
      ];
    case "F3_L4":
      return [
        {
          kind: "visual",
          title: "Track total momentum through a collision",
          caption: "Follow the whole system before and after impact so conservation feels like one continuous story.",
          image_url: "/lesson-media/f3/f3-l4-momentum-collision.svg",
          highlights: ["Momentum keeps direction", "Total before equals total after in an isolated interaction", "More shared mass can mean a slower joined speed"],
        },
      ];
    case "F3_L5":
      return [
        {
          kind: "visual",
          title: "Read impulse from force and time",
          caption: "The force-time area picture makes the safety idea visible.",
          image_url: "/lesson-media/f3/f3-l5-impulse-time.svg",
          highlights: ["Impulse = force x time = change in momentum", "Same area means same impulse", "Longer time can reduce force"],
        },
      ];
    case "F3_L6":
      return [
        {
          kind: "visual",
          title: "See why speed makes braking harder",
          caption: "Compare momentum, kinetic energy, and stopping force in one safety diagram.",
          image_url: "/lesson-media/f3/f3-l6-braking-safety.svg",
          highlights: ["Force = change in momentum / time", "Momentum grows with speed", "Longer stopping time lowers average force"],
        },
      ];
    case "F4_L1":
      return [
        {
          kind: "visual",
          title: "See the closed-loop stream",
          caption: "The Flow-Grid loop makes current feel like one common packet stream around a complete route.",
          image_url: "/lesson-media/f4/f4-l1-charge-current.svg",
          highlights: ["Current means charge per second", "The same stream rate passes every point in one loop", "A lamp transfers energy without using current up"],
        },
      ];
    case "F4_L2":
      return [
        {
          kind: "visual",
          title: "See energy per charge",
          caption: "Use the Flow-Grid source station to compare how much energy each packet gains before and after a component.",
          image_url: "/lesson-media/f4/f4-l2-potential-difference.svg",
          highlights: ["Voltage = energy per charge", "Cells boost electrical energy per packet", "Components transfer some of that energy away"],
        },
      ];
    case "F4_L3":
      return [
        {
          kind: "visual",
          title: "Compare push, difficulty, and current",
          caption: "One Flow-Grid picture links harder routes with lower current and steeper I-V graph slopes with lower resistance.",
          image_url: "/lesson-media/f4/f4-l3-resistance-iv.svg",
          highlights: ["More push gives more stream rate", "More difficulty gives less stream rate", "Steeper I-V graph slope means lower resistance"],
        },
      ];
    case "F4_L4":
      return [
        {
          kind: "visual",
          title: "Track one route in series",
          caption: "One picture shows same current everywhere and the supply push shared across the route sections.",
          image_url: "/lesson-media/f4/f4-l4-series-circuit.svg",
          highlights: ["Series means one path", "Current is the same everywhere in that path", "Voltage is shared across the components"],
        },
      ];
    case "F4_L5":
      return [
        {
          kind: "visual",
          title: "Track the split route in parallel",
          caption: "The Flow-Grid branch picture keeps branch voltage and current splitting visible at the same time.",
          image_url: "/lesson-media/f4/f4-l5-parallel-circuit.svg",
          highlights: ["Each branch gets the same voltage", "Current splits and recombines", "Adding a branch raises the total current"],
        },
      ];
    case "F4_L6":
      return [
        {
          kind: "visual",
          title: "See power, energy, and safety together",
          caption: "Use one circuit-energy picture to connect power, running time, and fuse protection.",
          image_url: "/lesson-media/f4/f4-l6-power-safety.svg",
          highlights: ["Power tells energy transferred each second", "Total energy depends on time as well", "Fuses respond to dangerously large current"],
        },
      ];
    case "M1_L1":
      return [
        {
          kind: "visual",
          title: "Read the mission log, not the lane",
          caption: "This Quest-Log graphic labels the axes with units and pins each label to the exact feature it explains.",
          image_url: "/lesson-media/m1/m1-l1-distance-time.svg",
          highlights: ["Recorded progress, s (m), is graph height", "Mission clock, t (s), runs on the horizontal axis", "Slope = pace on that segment"],
        },
        {
          kind: "visual",
          title: "Same finish, different run story",
          caption: "A second mission-log comparison shows that equal final distance and time do not force identical motion histories.",
          image_url: "/lesson-media/m1/m1-l1-same-finish.svg",
          highlights: ["Run A pauses then sprints", "Run B climbs steadily", "Same final point can hide different pace stories"],
        },
      ];
    case "M1_L2":
      return [
        {
          kind: "visual",
          title: "Separate level from change",
          caption: "The speed-time strip makes graph height answer a speed question while slope answers an acceleration question.",
          image_url: "/lesson-media/m1/m1-l2-speed-time.svg",
          highlights: ["Height = current speed", "Slope = rate of speed change", "Flat above zero = constant speed"],
        },
      ];
    case "M1_L3":
      return [
        {
          kind: "visual",
          title: "See the signed velocity change",
          caption: "The change-rate diagram makes acceleration a directional rate instead of a synonym for going faster.",
          image_url: "/lesson-media/m1/m1-l3-acceleration.svg",
          highlights: ["Compare start and finish velocity", "Divide the change by time", "Read the sign from the chosen positive direction"],
        },
      ];
    case "M1_L4":
      return [
        {
          kind: "visual",
          title: "Choose the right forecast tool",
          caption: "This suvat board helps students choose equations deliberately only when acceleration stays constant.",
          image_url: "/lesson-media/m1/m1-l4-suvat.svg",
          highlights: ["List what is known", "Pick the equation by the missing variable", "Check the constant-acceleration condition"],
        },
      ];
    case "M1_L5":
      return [
        {
          kind: "visual",
          title: "Keep the same slope, change the axes",
          caption: "The dual-log picture shows why the same tilt can mean pace on one graph and acceleration on another.",
          image_url: "/lesson-media/m1/m1-l5-gradient.svg",
          highlights: ["Distance-time slope = speed", "Speed-time slope = acceleration", "Graph type decides the meaning"],
        },
      ];
    case "M1_L6":
      return [
        {
          kind: "visual",
          title: "Build distance from area",
          caption: "The Area Hunter picture keeps strips, rectangle-plus-triangle reasoning, and total distance visible in one pace-log story.",
          image_url: "/lesson-media/m1/m1-l6-area.svg",
          highlights: ["Rectangle + triangle = total distance", "Area meaning comes from the axes", "Different shapes can still give the same distance"],
        },
      ];
    default: {
      const code = lessonCode(lesson);
      if (isExtendedNextgenLessonCode(code)) {
        const core = scaffoldCoreBullets(code);
        const focus = scaffoldFocusExtras(code);
        return [
          { kind: "visual", title: "Concept snapshot", caption: core[0] || "Use the main rule from this lesson before you answer.", highlights: core.slice(1, 4) },
          { kind: "visual", title: "What to watch for", caption: focus[0] || "Watch the main comparison in this lesson carefully.", highlights: focus.slice(1, 4) },
        ];
      }
      return [];
    }
  }
}



function scaffoldF2SectionCopy(code: string): { coreIdea: string; reasoning: string; checkForUnderstanding: string; commonTrap: string } {
  if (code === "F3_L6") {
    return {
      coreIdea: "Average force is the rate of change of momentum, so force = change in momentum / time. That means the same momentum change produces a smaller force when it happens over a longer stopping time.",
      reasoning: "First work out the momentum change, because that tells you how much motion must be removed or redirected. Then divide that momentum change by the stopping time to find the average force. Only after that should you connect the result to the energy story: high speed is especially dangerous because it increases both the momentum change and the kinetic energy that must be dissipated.",
      checkForUnderstanding: "If the same vehicle has the same momentum change but the stopping time doubles, what happens to the average force and why?",
      commonTrap: "Do not talk about braking force as if it depends on speed alone. The force depends on how quickly the momentum changes, not just on the size of the momentum by itself.",
    };
  }
  if (code === "F3_L5") {
    return {
      coreIdea: "Impulse is the name for the change in momentum during an interaction. Because impulse = change in momentum and impulse = force x time, the same event can be described through momentum change, force-time area, or force multiplied by time.",
      reasoning: "First decide what the momentum change is, because that is the impulse. Then choose how the question represents that same quantity: if force and time are given, multiply them; if the graph is shown, read the area; if the momentum change is given, treat that as the impulse directly. After that, compare how changing the stopping time changes the average force for the same impulse.",
      checkForUnderstanding: "If the same impulse acts over a longer time, what stays the same and what changes?",
      commonTrap: "Do not treat impulse as a separate idea from momentum change. They are the same quantity described in two different ways.",
    };
  }
  if (code === "F3_L4") {
    return {
      coreIdea: "The law of conservation of linear momentum applies to the whole system: total momentum before equals total momentum after when no significant external force acts on the system.",
      reasoning: "Choose a positive direction first. Work out each signed momentum before the collision, add them for the whole system, and set that total equal to the total system momentum after the interaction. Only after conserving the system total should you solve for an unknown speed or compare how the motion is shared.",
      checkForUnderstanding: "What stays fixed through the collision if no significant external force acts: each object's own momentum or the total system momentum?",
      commonTrap: "Do not conserve the momentum of one object by itself. It is the combined system total that stays constant.",
    };
  }
  if (code === "F4_L1") {
    return {
      coreIdea: "Current is the rate at which charge moves through a complete route. In one closed loop, the same current passes every point.",
      reasoning: "First decide whether the route is closed. If it is, current means charge per second at any checkpoint in the loop. Calculate current with I = Q / t, then use the closed-route idea to explain why the same current appears before and after one device.",
      checkForUnderstanding: "If the loop is complete and 24 C pass a checkpoint in 6 s, what current flows everywhere in that loop?",
      commonTrap: "Do not say a device uses current up. Devices transfer energy, but the circulating charge still passes every point in the same single path.",
    };
  }
  if (code === "F4_L2") {
    return {
      coreIdea: "Potential difference is the energy transferred to each coulomb, not the amount of charge moving.",
      reasoning: "Decide first whether the question is about how many coulombs move or how much energy each coulomb gains or loses. Use V = E / Q for energy per charge, and remember that the same charge can keep circulating while its electrical energy per coulomb changes at the source or a component.",
      checkForUnderstanding: "If a source gives each coulomb more energy but the number of coulombs stays the same, what electrical quantity has increased?",
      commonTrap: "Do not confuse total energy transfer with voltage. More charge can increase total energy without changing the energy transferred to each coulomb.",
    };
  }
  if (code === "F4_L3") {
    return {
      coreIdea: "For an ohmic component, current depends directly on voltage and inversely on resistance.",
      reasoning: "Identify whether the question is asking about current, resistance, or I-V graph meaning. Use I = V / R or R = V / I for the numeric part, then interpret the I-V graph slope as current gained for each volt. A steeper straight I-V graph line means lower resistance because the stream responds more strongly to the same push.",
      checkForUnderstanding: "If the driving force stays the same but the path difficulty doubles, what happens to the current?",
      commonTrap: "Do not treat resistance as a second kind of current, and do not assume a steeper I-V line means more resistance.",
    };
  }
  if (code === "F4_L4") {
    return {
      coreIdea: "Series circuits are one-route networks: the same current flows everywhere, while the supply voltage is shared across the route sections.",
      reasoning: "Add the route difficulties to get the total resistance first. Use the supply voltage and total resistance to find the one shared current through the route, then work out how the voltage is shared across each section. The whole route responds together because there is only one path for the charge to follow.",
      checkForUnderstanding: "In a one-route series circuit, which quantity stays the same through every component: current or voltage?",
      commonTrap: "Do not split the current in a series circuit. It is the supply voltage that gets shared across the components.",
    };
  }
  if (code === "F4_L5") {
    return {
      coreIdea: "Parallel circuits are split-route networks: each branch gets the same voltage, while current divides between branches and recombines afterward.",
      reasoning: "Mark the same start and finish points across each branch first, because that tells you the branch voltage is the same as the supply. Then work out each branch current from its own resistance and add the branch currents to find the total current entering the junction.",
      checkForUnderstanding: "In a split-route parallel circuit, which quantity is shared across every branch and which quantity adds at the junction?",
      commonTrap: "Do not share the voltage across parallel branches as if the circuit were series, and do not forget that total current is the sum of the branch currents.",
    };
  }
  if (code === "F4_L6") {
    return {
      coreIdea: "Power tells how fast a circuit transfers energy, total energy depends on power and time, and safety depends on limiting current.",
      reasoning: "Use P = VI to find how quickly the circuit is transferring energy each second. Then use E = Pt to work out the total transferred energy over the running time. After that, compare the current with the fuse or breaker limit to decide whether the route stays safe or must be cut off.",
      checkForUnderstanding: "If the same device runs at the same power for longer, what changes: the power, the total energy transferred, or both?",
      commonTrap: "Do not treat a fuse as a device that boosts power. A fuse or breaker protects the circuit by interrupting dangerously large current.",
    };
  }
  if (code.startsWith("F3_")) {
    const core = scaffoldCoreBullets(code);
    const focus = scaffoldFocusExtras(code);
    const teaching = scaffoldTeachingFocusBullets(code);
    return {
      coreIdea: [core[0], core[1]].filter(Boolean).join(" ") || "Use the main relationship from this lesson before you calculate anything.",
      reasoning: teaching[0] || "Identify what is being transferred, stored, conserved, or changed before you choose a formula.",
      checkForUnderstanding: "Which relationship or conserved quantity should you identify before you start calculating?",
      commonTrap: focus[0] || "Do not rush into a calculation before you know what the quantity means.",
    };
  }
  switch (code) {
    case "F2_L1":
      return {
        coreIdea: "Distance and displacement answer different questions about the same journey. Distance is the total path travelled, while displacement is the net start-to-finish change with direction.",
        reasoning: "First decide whether the question asks for the whole route, the start-to-finish change, or the average speed for the full trip. For distance, add every segment, including any return part. For displacement, compare the finishing point with the starting point and keep the direction. For average speed, divide the total distance by the total time for the whole journey.",
        checkForUnderstanding: "If a traveller goes out and partly back, which answer uses every segment and which answer only uses the starting and finishing positions?",
        commonTrap: "Do not subtract stages for distance, and do not average stage speeds unless the question really asks for the overall average speed.",
      };
    case "F2_L2":
      return {
        coreIdea: "Velocity includes direction, so a change in speed or direction changes velocity. Acceleration measures how quickly the velocity changes.",
        reasoning: "Choose a positive direction first. Write the initial and final velocities with signs. Calculate the change in velocity as final velocity minus initial velocity, then divide by the time taken. Interpret the sign only at the end, after you know which direction counts as positive.",
        checkForUnderstanding: "If forward is positive and the final velocity is smaller than the initial velocity, what sign should the acceleration have?",
        commonTrap: "A negative acceleration does not automatically mean slowing down. It only tells you that the acceleration points opposite the chosen positive direction.",
      };
    case "F2_L3":
      return {
        coreIdea: "On a distance-time graph, the slope of each segment tells the speed on that segment. The graph height shows distance, not speed.",
        reasoning: "Read one segment at a time. Find how much the distance changes and how much time passes on that same segment. Divide the distance change by the time change to get the speed there. If the line is flat, the distance is not changing, so the object is stopped during that interval.",
        checkForUnderstanding: "Which graph feature tells the speed on one segment: the height of the line or its slope?",
        commonTrap: "Do not read speed directly from the vertical axis, and do not describe a flat section as moving backwards.",
      };
    case "F2_L4":
      return {
        coreIdea: "A velocity-time graph tells two different stories from one shape: slope shows acceleration, and area under the graph shows displacement.",
        reasoning: "Decide first whether the question is asking about how velocity changes or how much motion builds up. Use slope when you need acceleration by comparing velocity change with time change. Use area when you need displacement by finding the area under the graph over the interval. Keep the sign of the velocity in mind when you interpret the displacement.",
        checkForUnderstanding: "If the graph is a horizontal line above zero, what happens to the acceleration and what happens to the displacement?",
        commonTrap: "Do not use slope when the question asks for displacement, and do not ignore whether the velocity is positive or negative.",
      };
    case "F2_L5":
      return {
        coreIdea: "Resultant force is the single overall force left after all the pushes and pulls are combined with their directions.",
        reasoning: "First check whether the forces act in the same direction or in opposite directions. Add forces that act together. Subtract opposite forces and keep the direction of the larger side. Then decide whether the resultant force is zero or non-zero before you talk about the motion.",
        checkForUnderstanding: "When two opposite forces are unequal, which direction does the resultant force point?",
        commonTrap: "Zero resultant force means zero acceleration, not zero motion. An object can still move at constant velocity.",
      };
    case "F2_L6":
      return {
        coreIdea: "F = ma links resultant force, mass, and acceleration. The same force changes a smaller mass more than a larger mass.",
        reasoning: "Start with the relationship between force, mass, and acceleration. Use the resultant force, not just one force from the diagram. Rearrange the formula only if needed, then substitute the values with units. After the calculation, compare how changing the force or the mass would change the acceleration.",
        checkForUnderstanding: "If the force stays the same and the mass doubles, what happens to the acceleration?",
        commonTrap: "Do not forget that the formula uses resultant force, and do not treat inertia as if it were an extra force.",
      };
    default:
      return {
        coreIdea: "Use the key idea from the lesson before you calculate or classify anything.",
        reasoning: "Identify the right quantity or graph feature first, then work through the physics step by step.",
        checkForUnderstanding: "What should you identify before you start calculating?",
        commonTrap: "Do not rush into a formula before you know what the quantity means.",
      };
  }
}

function scaffoldF2AnalogyBridge(code: string): { body: string; checkForUnderstanding: string } {
  if (code === "F3_L4") {
    return {
      body: "In the signed movement-budget analogy, each object brings a positive or negative contribution depending on its direction. The law of conservation of linear momentum says the whole account balance cannot change during the collision if no significant outside forces act on the system. Individual objects can exchange momentum with each other, but the total system balance before and after the interaction must match.",
      checkForUnderstanding: "In this analogy, what stays the same through the collision: each object's own momentum or the whole system balance?",
    };
  }
  if (code === "F4_L1") {
    return {
      body: "The Flow-Grid loop works because it keeps the route whole. The moving packets represent charge carriers, and the number of packets passing a checkpoint each second stands for current. If the route is broken, the stream stops everywhere, not just near the break. That is why a single-loop circuit has the same current at every point while it remains complete.",
      checkForUnderstanding: "In the Flow-Grid loop, what does the packet stream rate at a checkpoint represent?",
    };
  }
  if (code === "F4_L2") {
    return {
      body: "The Flow-Grid source station adds an energy boost to each packet. That boost is the analogue of potential difference: the energy transferred to each coulomb. A lamp or resistor does not destroy the packets; it transfers some of their electrical energy to other stores. The model therefore helps students separate charge itself from the energy carried by each unit of charge.",
      checkForUnderstanding: "In the Flow-Grid picture, what changes when the source station becomes stronger: the packet count, the energy boost per packet, or both?",
    };
  }
  if (code === "F4_L3") {
    return {
      body: "The Flow-Grid route difficulty is useful because it changes the stream response without changing what current means. A wider, easier route stands for lower resistance, so the same source push drives more packets each second. A narrower, harder route stands for higher resistance, so the stream slows. The I-V graph then becomes a graph of how strongly the stream responds to push, and its slope shows how much current is gained per volt.",
      checkForUnderstanding: "If the route becomes harder but the source push stays the same, what happens to the stream rate and what electrical idea does that represent?",
    };
  }
  if (code === "F4_L4") {
    return {
      body: "The Flow-Grid single-route network is a strong series analogy because every packet must pass through each difficult section in turn. That is why the same current flows everywhere in a series loop. The total push from the source station is then shared across the sections, which matches how the supply voltage is split across series components.",
      checkForUnderstanding: "In the single-route analogy, why can the same packet stream rate exist everywhere even though the source push is shared across components?",
    };
  }
  if (code === "F4_L5") {
    return {
      body: "The Flow-Grid split-route network captures the key parallel relationships. Each branch begins and ends at the same two points, so each branch gets the same push across it, which stands for equal branch voltage. The packets then divide between branches and recombine afterward, which stands for branch current splitting and total current addition.",
      checkForUnderstanding: "In the split-route analogy, what stays the same across each branch and what divides between the branches?",
    };
  }
  if (code === "F4_L6") {
    return {
      body: "The Flow-Grid safety story links three circuit ideas at once. The number of energised packets pushed through each second stands for electrical power. Letting that stream continue for longer increases the total transferred energy. If the stream rate becomes too large, the safety gate opens the route, which stands for a fuse or breaker interrupting dangerous current before overheating becomes severe.",
      checkForUnderstanding: "In the Flow-Grid safety story, which part stands for power and which part stands for the protective device?",
    };
  }
  if (code.startsWith("F3_")) {
    return {
      body: "Use the analogy by matching each part to the physics before you calculate. Ask what is being transferred, what is stored, what is conserved, and which variable changes most strongly in the comparison.",
      checkForUnderstanding: "Which part of the analogy matches the key quantity or change you are analysing in this lesson?",
    };
  }
  switch (code) {
    case "F2_L1":
      return {
        body: "Use the analogy by matching each part carefully. The odometer stands for the whole route actually travelled, so every detour and return segment makes it increase. The straight map arrow stands for the single start-to-finish change, so it only depends on where the journey ends relative to where it began. That is why a long wandering route can still end with a small displacement or even zero displacement.",
        checkForUnderstanding: "If two travellers finish at the same place but one takes a longer detour, which part of the analogy changes: the odometer reading, the map arrow, or both?",
      };
    case "F2_L2":
      return {
        body: "Think of the velocity arrow as the motion description at one moment: its length shows how fast the motion is and its direction shows which way it points. Acceleration tells how that arrow changes from one moment to the next. If the arrow gets longer, shorter, or swings round, the acceleration is tracking that change rather than the arrow itself.",
        checkForUnderstanding: "If the arrow keeps the same length but turns to a new direction, has the velocity changed? What does that imply about acceleration?",
      };
    case "F2_L3":
      return {
        body: "The travel diary analogy helps because each graph segment is like one diary entry about how quickly distance was being added at that stage. A steep entry means the traveller was covering ground quickly during that interval, while a flat entry means the diary records time passing without extra distance being added. Reading the graph segment by segment is like reading the journey page by page.",
        checkForUnderstanding: "In the travel-diary picture, what kind of diary entry matches a flat section on the graph?",
      };
    case "F2_L4":
      return {
        body: "The motion-ledger analogy works because one graph stores several kinds of motion information at once. The graph height is like the current signed entry telling the present velocity, the slope is like how quickly that entry is being updated, and the area is like the running signed total collected over time. The same graph can therefore answer different questions, but only if you choose the right feature for the quantity you want.",
        checkForUnderstanding: "In the ledger analogy, which part tells the running total of directed motion: the graph height, the slope, or the area?",
      };
    case "F2_L5":
      return {
        body: "The tug-of-war rope is useful because it shows that direction matters before you decide what the overall effect is. Equal teams pull with equal strength in opposite directions, so the rope feels no net pull and the motion does not change. If one side pulls harder, the rope has a leftover pull in that direction, which is like the non-zero resultant force that causes acceleration.",
        checkForUnderstanding: "If one tug-of-war team becomes stronger while the other stays the same, what does that represent in the force diagram?",
      };
    case "F2_L6":
      return {
        body: "The shopping-cart analogy becomes powerful when you compare pushes, not just objects. The same shove changes the empty cart more because less mass means less resistance to changing motion. A heavier loaded cart needs either a bigger push for the same acceleration or it responds with a smaller acceleration to the same push. That is the conceptual meaning behind F = ma before any numbers are substituted.",
        checkForUnderstanding: "If two carts get the same push but one is loaded, which cart shows the greater acceleration and why?",
      };
    default:
      return {
        body: "Use the analogy by matching each object or action in the picture to the physics quantity it represents before you calculate anything.",
        checkForUnderstanding: "Which part of the analogy matches the quantity you are trying to work out?",
      };
  }
}
function scaffoldSections(lesson: UnknownRecord, repairText: string, analogyText: string, workedExample: UnknownRecord): UnknownRecord[] {
  const code = lessonCode(lesson);
  if (isExtendedNextgenLessonCode(code)) {
    const f2Copy = scaffoldF2SectionCopy(code);
    const analogyCopy = scaffoldF2AnalogyBridge(code);
    return [
      { heading: "Fix these ideas", body: repairText },
      { heading: "Core idea", body: f2Copy.coreIdea },
      { heading: "How to reason through it", body: f2Copy.reasoning, check_for_understanding: f2Copy.checkForUnderstanding },
      { heading: "Common trap", body: f2Copy.commonTrap },
      { heading: "Analogy", body: analogyCopy.body, analogy: analogyText || "Use this analogy to compare the whole situation before you choose a formula or answer.", check_for_understanding: analogyCopy.checkForUnderstanding },
      { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
    ];
  }
  switch (code) {
    case "F1_L1":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "A scientific measurement only makes sense when the quantity, the number, and the unit stay together. A bare number does not tell the full story in physics because 5 could mean 5 metres, 5 seconds, or 5 kilograms." },
        { heading: "Quantities, units, and sub-units", body: "A quantity tells what you are measuring: length, mass, time, temperature, and so on. The unit tells the agreed size used to measure it. A sub-unit is a smaller version that helps when the object is small. Use metres for room length, centimetres for notebook width, and millimetres for coin thickness." },
        { heading: "Choose units and tools wisely", body: "Pick a unit and a tool that match the scale of the job. A metre rule suits desk length, a balance suits mass, and a caliper helps with very small thicknesses because its finer divisions reduce uncertainty.", check_for_understanding: "Why is millimetre a better unit than metre for the thickness of a coin?" },
        { heading: "Analogy", body: analogyText || "Units work like money. One dollar, one cent, and one thousand dollars are all money, but they are not the same size. Prefixes do the same job for measurements: kilo- makes a larger unit, while centi- and milli- make smaller sub-units." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    case "F1_L2":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "A scalar tells how much only. A vector tells how much and which way. That extra direction changes the meaning of the quantity, so distance and displacement are not interchangeable, and speed and velocity are not interchangeable either." },
        { heading: "How to test any quantity", body: "Ask two questions. First: how much? Second: which way? If only the first question is needed, the quantity is scalar. If the second question is needed as well, the quantity is vector.", check_for_understanding: "Which single word would turn 15 m into a vector description?" },
        { heading: "Analogy", body: analogyText || "A distance is like saying how many steps you walked. A displacement is like showing an arrow from start to finish. The arrow has both a size and a direction, so it behaves like a vector." },
        { heading: "Common patterns to remember", body: "Distance, speed, mass, time, and temperature are usually scalar. Displacement, velocity, force, acceleration, and weight are vectors because they need direction." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    case "F1_L3":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "A reading is only as trustworthy as the tool and method behind it. The instrument sets the smallest detail you can see, and that limits the certainty you can claim." },
        { heading: "Resolution and uncertainty", body: "Resolution is the smallest change the tool can show. Uncertainty tells the reader the range inside which the true value is likely to lie. A fine tool such as a caliper usually gives a smaller uncertainty than a rough ruler.", check_for_understanding: "Why is a finer scale usually more trustworthy for small objects?" },
        { heading: "Reading a scale honestly", body: "Read to the smallest clear division, estimate carefully between marks when appropriate, and never invent extra digits. The reported value should match the instrument, not the number of digits you wish you had." },
        { heading: "Different types of error", body: "Random error makes repeated readings scatter above and below the best estimate, often because of reaction time or tiny reading differences. Systematic error shifts every reading the same way, often because of zero error or poor calibration.", check_for_understanding: "If a balance always reads 0.2 g too high, which type of error is that?" },
        { heading: "How to reduce error", body: "Use repeated readings and averaging to reduce the effect of random error. Check zero readings, calibrate the instrument, and choose the right tool to reduce systematic error. Honest uncertainty should still be reported after careful work." },
        { heading: "Analogy", body: analogyText || "A blurry photo can show the big shape of an object, but not the tiny details. Low-resolution tools work the same way. A sharper picture is like a finer instrument: it lets you trust smaller differences." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    case "F1_L4":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "Significant figures help you report a number with the right amount of precision. They stop you from pretending the measurement is more exact than it really is." },
        { heading: "Which digits count", body: "Non-zero digits always count. Leading zeros only place the decimal point, so they do not count. Zeros between non-zero digits do count, and trailing zeros after a decimal usually show real precision.", check_for_understanding: "How many significant figures are in 0.0205?" },
        { heading: "Rounding with purpose", body: "Choose how many figures you want to keep, then look at the next digit. If it is 5 or more, round up. If it is less than 5, keep the kept digit unchanged." },
        { heading: "Rules for calculations", body: "Use different reporting rules depending on the operation. For multiplication and division, the final answer usually keeps the same number of significant figures as the measurement with the fewest significant figures. For addition and subtraction, the final answer usually keeps the same number of decimal places as the measurement with the fewest decimal places.", check_for_understanding: "Which rule controls 12.34 + 1.2, and which rule controls 2.5 x 3.42?" },
        { heading: "Calculator answers need a final check", body: "A calculator can show more digits than the measurements justify. Do the calculation first, then apply the correct reporting rule before writing the final answer in your notebook." },
        { heading: "Analogy", body: analogyText || "Think of a measurement like a photo saved at a certain quality. You cannot honestly add sharper detail after the photo has been taken, just as you cannot add justified digits after the measurement is made." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    case "F1_L5":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "Density tells you how much mass is packed into each unit of volume. It is not just about how heavy something is; it is about how heavy it is for its size." },
        { heading: "Mass, volume, and density", body: "Mass tells how much matter is present. Volume tells how much space is occupied. Density compares the two. That is why a small metal block can be denser than a larger foam block.", check_for_understanding: "If two objects have the same volume, which one is denser: the heavier one or the lighter one?" },
        { heading: "Use the formula carefully", body: "Write density = mass / volume, substitute the values with consistent units, divide carefully, and keep the compound unit with the answer. If the units are mixed, convert them before calculating." },
        { heading: "Analogy", body: analogyText || "Imagine packing books into two boxes of the same size. The box with more books packed into the same space is like the denser material." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    case "F1_L6":
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "Accuracy and precision answer different questions. Accuracy asks whether you are close to the accepted value. Precision asks whether repeated readings agree closely with one another." },
        { heading: "Possible measurement patterns", body: "A set of readings can be accurate and precise, precise but not accurate, accurate but spread out, or neither. Looking only at one idea gives an incomplete judgement of the measurement quality.", check_for_understanding: "If readings are tightly grouped but all far from the accepted value, which idea is strong and which is weak?" },
        { heading: "What makes a result trustworthy", body: "Trust comes from using a suitable tool, repeating measurements, controlling errors, and reporting honest uncertainty. A result is stronger when the method and the numbers support each other." },
        { heading: "Analogy", body: analogyText || "Imagine throwing darts at a target. A tight cluster shows precision. A cluster near the centre shows accuracy. The best measurements do both at once." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
    default:
      return [
        { heading: "Fix these ideas", body: repairText },
        { heading: "Core idea", body: "Use the main rule from this lesson before you calculate, classify, or compare anything." },
        { heading: "Analogy", body: analogyText || "Use the shared idea from this lesson to decide what the quantity means before you answer." },
        { heading: "Worked example", body: text(workedExample.body), worked_example: asRecord(workedExample.worked_example) },
      ];
  }
}



function reflectionVisualCheck(lesson: UnknownRecord): UnknownRecord | undefined {
  const code = lessonCode(lesson);
  const m2 = m2ReflectionVisualCheck(code);
  if (m2) return m2;
  switch (code) {
    case "F2_L3":
      return {
        title: "Distance-time graph check",
        prompt: "Study the graph and explain three things in your reflection: which segment is fastest, which segment shows the traveller stopped, and why the final segment is slower than the first. Use the slope in your explanation.",
        image_url: "/lesson-media/f2/f2-l3-reflection-graph-check.svg",
        callouts: [
          "Segment A rises steeply from 0 s to 3 s.",
          "Segment B is flat from 3 s to 5 s.",
          "Segment C rises more gently from 5 s to 8 s.",
        ],
      };
    case "F3_L5":
      return {
        title: "Force-time graph check",
        prompt: "Study the graph and explain three things in your reflection: which section has the larger force, which two sections deliver the same impulse, and why the wider section can still be safer even with a smaller force.",
        image_url: "/lesson-media/f3/f3-l5-force-time-check.svg",
        callouts: [
          "Section A is a tall, narrow rectangle.",
          "Section B is a shorter, wider rectangle with the same area as A.",
          "Section C is the smallest area of the three.",
        ],
      };
    case "M1_L1":
      return {
        title: "Distance-time graph check",
        prompt: "Use the comparison mission-log diagram in your reflection and explain where the axes show metres and seconds, which section is paused, and how two runs can share the same final point without sharing the same motion story.",
        image_url: "/lesson-media/m1/m1-l1-same-finish.svg",
        callouts: [
          "Both graphs finish at 32 m after 8 s.",
          "Run A contains a flat paused section.",
          "Run B keeps one steady slope from start to finish.",
        ],
      };
    case "M1_L2":
      return {
        title: "Speed-time graph check",
        prompt: "Use the pace-log diagram in your reflection and explain what the graph height says at one instant, what the slope says over an interval, and why a flat line above zero still means motion.",
        image_url: "/lesson-media/m1/m1-l2-speed-time.svg",
        callouts: [
          "One section is horizontal above zero.",
          "One section rises steadily.",
          "A high point and a steep point answer different questions.",
        ],
      };
    case "M1_L3":
      return {
        title: "Acceleration sign check",
        prompt: "Use the pace-arrow diagram in your reflection and explain how the acceleration sign comes from the change in velocity and the chosen positive direction.",
        image_url: "/lesson-media/m1/m1-l3-acceleration.svg",
        callouts: [
          "The initial velocity arrow points more strongly east.",
          "The final velocity arrow is smaller or reversed in one example.",
          "The acceleration sign depends on the signed change over time.",
        ],
      };
    case "M1_L4":
      return {
        title: "Equation-choice check",
        prompt: "Use the Quest-Log forecast board in your reflection and explain which known variables make one constant-acceleration equation the best choice and why the same board fails when acceleration is not constant.",
        image_url: "/lesson-media/m1/m1-l4-suvat.svg",
        callouts: [
          "Known variables are grouped together first.",
          "The unknown variable is highlighted before the equation is chosen.",
          "A note warns that the board assumes constant acceleration.",
        ],
      };
    case "M1_L5":
      return {
        title: "Gradient-context check",
        prompt: "Use the twin-graph diagram in your reflection and explain why the same slope can mean speed on one graph and acceleration on another.",
        image_url: "/lesson-media/m1/m1-l5-gradient.svg",
        callouts: [
          "The left graph is distance-time.",
          "The right graph is speed-time.",
          "The marked tilt is the same in both places.",
        ],
      };
    case "M1_L6":
      return {
        title: "Area-distance check",
        prompt: "Use the Area Hunter diagram in your reflection and explain how the rectangle and triangle combine to make total distance and why a different graph shape can still give the same distance.",
        image_url: "/lesson-media/m1/m1-l6-area.svg",
        callouts: [
          "The rectangle shows the base distance contribution.",
          "The triangle adds the extra distance from changing speed.",
          "The full shaded area is the total distance for the interval.",
        ],
      };
    default:
      return undefined;
  }
}

function scaffoldPayload(title: string, lesson: UnknownRecord, feedback: UnknownRecord[]): UnknownRecord {
  const repairs = feedback.filter((item) => item.is_correct !== true);
  const repairText = repairs.length > 0
    ? repairs.map((item) => (text(item.prompt) + " " + text(item.explanation)).trim()).join("\n")
    : "Your diagnostic was mostly secure, so this lesson widens out to the full sub-unit.";
  const analogyText = text(asRecord(phases(lesson).analogical_grounding).analogy_text);
  const code = lessonCode(lesson);
  const workedExample = scaffoldWorkedExample(lesson);
  const repairTeachingFocus = dedupeText(repairs.map((item) => text(item.teaching_focus)).filter(Boolean)).slice(0, 3);
  const teachingFocus = code.startsWith("F3_")
    ? (repairTeachingFocus.length > 0 ? repairTeachingFocus : scaffoldTeachingFocusBullets(code).slice(0, 4))
    : code.startsWith("F2_")
      ? dedupeText([
          ...repairTeachingFocus,
          ...scaffoldTeachingFocusBullets(code),
        ]).slice(0, 4)
    : dedupeText([
        ...repairs.map((item) => text(item.teaching_focus)).filter(Boolean),
        ...itemsFrom(lesson, "diagnostic").map((item) => text(item.hint)).filter(Boolean),
        ...itemsFrom(lesson, "transfer").map((item) => text(item.hint)).filter(Boolean),
        ...asList(asRecord(phases(lesson).concept_reconstruction).capsules).map((capsule) => text(asRecord(capsule).prompt)).filter(Boolean),
        ...asList(asRecord(phases(lesson).analogical_grounding).micro_prompts).map((prompt) => text(asRecord(prompt).hint) || text(asRecord(prompt).prompt)).filter(Boolean),
        ...scaffoldFocusExtras(code),
        ...scaffoldCoreBullets(code),
      ]);
  return {
    title,
    intro: /_L1$/.test(code) ? "This lesson covers the whole sub-unit while giving extra attention to any ideas that still need work." : "",
    teaching_focus: teachingFocus,
    misconception_targets: repairs.map((item) => text(item.misconception_tag)).filter(Boolean),
    reference_tables: scaffoldReferenceTables(lesson),
    media_cards: scaffoldMediaCards(lesson),
    sections: scaffoldSections(lesson, repairText, analogyText, workedExample),
    review_refs: reviewRefs(lesson),
  };
}
export async function getLessonRunner(moduleId: string, lessonId: string): Promise<UnknownRecord> {
  const resources = await loadResources(moduleId, lessonId);
  const runnerLesson = asRecord(resources.runner.lesson);
  let state = readState(moduleId, lessonId);
  const title = lessonTitle(resources.lesson, runnerLesson);
  const lessonStatus = text(runnerLesson.lesson_status);
  const backendStage = text(runnerLesson.active_stage);
  const startStage = firstStageForLesson(resources.lesson);
  const masteryMeta = asRecord(runnerLesson.mastery_check);
  const serverCompletedStages = completedStageKeys(runnerLesson);
  const inferredServerStage = inferredStageFromServerProgress(resources.lesson, runnerLesson);
  const inferredStageIndex = runnerStageIndex(inferredServerStage || "");
  const backendStageIndex = runnerStageIndex(backendStage);
  // The backend owns the lesson state machine; client inference is only a fallback
  // when the stage is missing or malformed.
  const serverStage = backendStageIndex >= 0
    ? backendStage
    : inferredStageIndex >= 0
      ? inferredServerStage || startStage
      : startStage;
  const shouldResetToStart = (
    lessonStatus === "not_started" &&
    serverCompletedStages.length === 0 &&
    !hasProgressBeforeMastery(runnerLesson, state)
  ) || (
    (serverStage === "mastery_check" || serverStage === "done") &&
    numberValue(masteryMeta.attempt_count, 0) < 1 &&
    !hasProgressBeforeMastery(runnerLesson, state)
  );

  if (shouldResetToStart) {
    clearState(moduleId, lessonId);
    state = {};
  }

  const syntheticConceptGate = !shouldResetToStart && shouldInjectConceptGate(resources.lesson, runnerLesson, serverStage, state);
  const effectiveStage = shouldResetToStart
    ? startStage
    : syntheticConceptGate
      ? "concept_gate"
      : serverStage;
  const stage = (
    effectiveStage === "diagnostic" ||
    effectiveStage === "scaffolded_teaching" ||
    effectiveStage === "concept_gate" ||
    effectiveStage === "simulation" ||
    effectiveStage === "reflection" ||
    effectiveStage === "mastery_check" ||
    effectiveStage === "done"
  )
    ? effectiveStage
    : startStage;

  if (stage !== "diagnostic" && stage !== "scaffolded_teaching") delete state.diagnostic;
  if (stage !== "concept_gate") delete state.conceptGate;
  if (stage !== "reflection") delete state.reflection;
  if (stage !== "mastery_check" && stage !== "done") delete state.mastery;

  if (stage === "diagnostic") {
    state.diagnostic = {
      nonce: state.diagnostic?.nonce || freshAttemptSeed(),
      askedIds: state.diagnostic?.askedIds || [],
      answers: state.diagnostic?.answers || {},
      feedback: state.diagnostic?.feedback,
      recentFeedback: state.diagnostic?.recentFeedback,
      complete: state.diagnostic?.complete,
    };
  }

  if (stage === "concept_gate") {
    state.conceptGate = {
      nonce: state.conceptGate?.nonce || freshAttemptSeed(),
      retryCount: state.conceptGate?.retryCount || 0,
      submitted: state.conceptGate?.submitted,
      passed: state.conceptGate?.passed,
      feedback: state.conceptGate?.feedback,
      microReteach: state.conceptGate?.microReteach,
    };
  }

  if (stage === "mastery_check" || stage === "done") {
    state.mastery = {
      nonce: state.mastery?.nonce || freshAttemptSeed(),
      submitted: state.mastery?.submitted,
      feedback: state.mastery?.feedback,
      result: state.mastery?.result,
      reviewRefs: state.mastery?.reviewRefs,
      reviewRequested: state.mastery?.reviewRequested,
      forceNewAttempt: state.mastery?.forceNewAttempt,
    };
  }

  writeState(moduleId, lessonId, state);

  let activeStage = "diagnostic";
  let stagePayload: UnknownRecord = {};

  if (stage === "diagnostic") {
    activeStage = "diagnostic";
    const pool = diagnosticItems(resources.lesson);
    const diagnosticNonce = state.diagnostic?.nonce || 0;
    const orderedPool = diagnosticPoolForAttempt(moduleId, lessonId, resources.lesson, diagnosticNonce);
    const askedIds = state.diagnostic?.askedIds || [];
    const answers = state.diagnostic?.answers || {};
    const feedback = state.diagnostic?.feedback || [];
    const correctCount = askedIds.reduce((total, id) => {
      const item = pool.find((entry) => text(asRecord(entry).id) === id);
      return item && grade(asRecord(item), answers[id], title).is_correct === true ? total + 1 : total;
    }, 0);
    const targetCount = diagnosticTarget(correctCount, askedIds.length, pool.length);
    const nextItem = orderedPool.find((entry) => !askedIds.includes(text(asRecord(entry).id))) || null;
    const isComplete = Boolean(state.diagnostic?.complete) || (!nextItem && feedback.length > 0);
    if (isComplete && feedback.length > 0) {
      stagePayload = {
        instructions: "Here is the answer-by-answer feedback for this opening check.",
        question_count: feedback.length,
        questions: [],
        submitted: true,
        feedback,
      };
    } else {
      stagePayload = {
        instructions: askedIds.length < 2 ? "Question " + String(askedIds.length + 1) + " of at least 2." : "Question " + String(askedIds.length + 1) + " of " + String(targetCount) + ". Strong answers may unlock one more question.",
        question_count: targetCount,
        answered_count: askedIds.length,
        questions: nextItem ? [question(asRecord(nextItem), "diagnostic:" + String(diagnosticNonce) + ":" + String(askedIds.length))] : [],
        recent_feedback: state.diagnostic?.recentFeedback,
        action_label: "Check my answer",
      };
    }
  }

  else if (stage === "scaffolded_teaching") {
    activeStage = "scaffold";
    stagePayload = scaffoldPayload(title, resources.lesson, state.diagnostic?.feedback || []);
  }
  else if (stage === "concept_gate") {
    activeStage = "concept_gate";
    const retryCount = state.conceptGate?.retryCount || 0;
    const conceptNonce = state.conceptGate?.nonce || 0;
    const conceptSeed = "concept:" + String(conceptNonce) + ":" + String(retryCount);
    const gateItem = conceptGateItemForAttempt(moduleId, lessonId, resources.lesson, conceptNonce, retryCount);
    stagePayload = state.conceptGate?.submitted
      ? {
          instructions: "Use the feedback below to tighten the key idea before moving on.",
          retry_count: retryCount,
          max_retries: CONCEPT_GATE_MAX_RETRIES,
          questions: gateItem ? [question(asRecord(gateItem), conceptSeed)] : [],
          submitted: true,
          passed: state.conceptGate.passed,
          feedback: state.conceptGate.feedback,
          micro_reteach: asRecord(state.conceptGate).microReteach,
        }
      : {
          instructions: "Answer this quick check before you move on.",
          retry_count: retryCount,
          max_retries: CONCEPT_GATE_MAX_RETRIES,
          questions: gateItem ? [question(asRecord(gateItem), conceptSeed)] : [],
        };
  }
  else if (stage === "simulation") {
    activeStage = "simulation";
    const inquiry = asList(asRecord(phases(resources.lesson).simulation_inquiry).inquiry_prompts).map(asRecord);
    const simulationCode = lessonCode(resources.lesson);
    stagePayload = {
      title: simulationStageTitle(simulationCode),
      instructions: simulationStageInstructions(simulationCode, inquiry),
      task_prompt: simulationStageTaskPrompt(simulationCode, inquiry),
      explore_steps: simulationStageExploreSteps(simulationCode),
      watch_for: simulationStageWatchFor(simulationCode),
      try_first: simulationStageTryFirst(simulationCode),
      takeaway: simulationStageTakeaway(simulationCode),
      completion_text: "I have finished exploring this activity",
    };
  }
  else if (stage === "reflection") {
    activeStage = "reflection";
    const prompts = asList(asRecord(phases(resources.lesson).concept_reconstruction).prompts).map((entry) => text(entry));
    const inquiry = asList(asRecord(phases(resources.lesson).simulation_inquiry).inquiry_prompts).map(asRecord);
    stagePayload = {
      title: "Explain the idea back",
      prompt: prompts[0] || "Explain the key idea from this lesson in your own words.",
      guidance: inquiry.map((entry) => text(entry.hint) || text(entry.prompt)).filter(Boolean).slice(0, 3),
      visual_check: reflectionVisualCheck(resources.lesson),
      submitted: state.reflection?.submitted,
      learner_response: state.reflection?.learnerResponse,
    };
  }
  else {
    activeStage = "mastery";
    const masteryState = state.mastery || { nonce: 0 };
    const masteryMeta = asRecord(runnerLesson.mastery_check);
    const threshold = numberValue(masteryMeta.threshold, 0.8);
    const thresholdPercent = Math.round(threshold * 100);
    const latestScore = typeof masteryMeta.latest_score === "number"
      ? numberValue(masteryMeta.latest_score, 0)
      : typeof runnerLesson.latest_score === "number"
        ? numberValue(runnerLesson.latest_score, 0)
        : null;
    const persistedResult = typeof latestScore === "number"
      ? { percent: Math.round(latestScore * 100), passed: latestScore >= threshold }
      : undefined;
    const hasPersistedResult = numberValue(masteryMeta.attempt_count, 0) >= 1 && Boolean(persistedResult) && masteryState.forceNewAttempt !== true;
    const pool = masteryItems(resources.lesson);
    const strengthScore = masteryStrengthScore(runnerLesson, state);
    const count = masteryQuestionCount(masteryMeta, pool.length, strengthScore);
    const selectedPool = masteryPoolForAttempt(moduleId, lessonId, resources.lesson, masteryState.nonce || 0);
    const selected = selectedPool.slice(0, count);
    if (!masteryState.submitted && stage !== 'done' && !hasPersistedResult) {
      writeState(moduleId, lessonId, {
        ...state,
        mastery: {
          ...state.mastery,
          nonce: masteryState.nonce || 0,
          displayedItems: selected.map((item) => asRecord(item)),
        },
      });
    }
    stagePayload = masteryState.submitted || stage === "done" || hasPersistedResult
      ? {
          instructions: stage === "done" ? "You have already shown mastery for this lesson." : "This is your latest mastery result.",
          questions: [],
          submitted: true,
          feedback: masteryState.feedback || [],
          result: masteryState.result || persistedResult || { percent: Math.round(numberValue(runnerLesson.best_score) * 100), passed: true },
          review_refs: masteryState.reviewRefs || reviewRefs(resources.lesson, asList(masteryMeta.recommended_review_refs)),
          review_requested: Boolean(asRecord(masteryState).reviewRequested),
          min_questions: numberValue(masteryMeta.min_questions, 5),
          max_questions: numberValue(masteryMeta.max_questions, 10),
          passing_percent: thresholdPercent,
        }
      : {
          instructions: "Use what you learned in " + title + " to answer " + String(selected.length) + " final questions carefully.",
          question_count: selected.length,
          questions: selected.map((item, index) => question(asRecord(item), `mastery:${masteryState.nonce || 0}:${index}`)),
          min_questions: numberValue(masteryMeta.min_questions, 5),
          max_questions: numberValue(masteryMeta.max_questions, 10),
          passing_percent: Math.round(numberValue(masteryMeta.threshold, 0.8) * 100),
        };
  }

  const moduleMeta = asRecord(resources.runner.module);
  const finalMasteryMeta = asRecord(runnerLesson.mastery_check);
  const latestMasteryPercent = typeof finalMasteryMeta.latest_score === "number"
    ? Math.round(numberValue(finalMasteryMeta.latest_score, 0) * 100)
    : typeof runnerLesson.latest_score === "number"
      ? Math.round(numberValue(runnerLesson.latest_score, 0) * 100)
      : null;

  return {
    module_id: text(moduleMeta.module_id) || moduleId,
    lesson_id: text(runnerLesson.lesson_id) || normalizeLessonId(lessonId),
    lesson_title: title,
    lesson_status: text(runnerLesson.lesson_status) === "completed" ? "completed" : text(runnerLesson.lesson_status) === "not_started" ? "not_started" : "in_progress",
    active_stage: activeStage,
    stage_payload: stagePayload,
    progress_summary: {
      attempts: numberValue(finalMasteryMeta.attempt_count),
      latest_mastery_percent: latestMasteryPercent,
      best_mastery_percent: Math.round(numberValue(runnerLesson.best_score) * 100),
      module_mastery_percent: Math.round(numberValue(moduleMeta.module_mastery) * 100),
      concept_gate_passed: asList(runnerLesson.stages).map(asRecord).some((entry) => text(entry.key) === "concept_gate" && entry.completed === true),
    },
  };
}

export async function postProgressEvent(moduleId: string, request: RunnerRequest): Promise<void> {
  const lessonId = normalizeLessonId(request.lesson_id);
  const payload = request.payload || {};

  if (request.event_type === "diagnostic_submitted") {
    const resources = await loadResources(moduleId, lessonId);
    const title = lessonTitle(resources.lesson, asRecord(resources.runner.lesson));
    const pool = diagnosticItems(resources.lesson);
    const answers = asRecord(payload.answers);
    const firstEntry = Object.entries(answers)[0];
    if (!firstEntry) throw new Error("Choose an answer before continuing.");
    const [questionId, answerValue] = firstEntry;
    const item = pool.find((entry) => text(asRecord(entry).id) === questionId);
    if (!item) throw new Error("This question is not available right now.");

    const current = readState(moduleId, lessonId);
    const diagnosticNonce = current.diagnostic?.nonce || freshAttemptSeed();
    const askedIds = current.diagnostic?.askedIds || [];
    const nextAskedIds = askedIds.includes(questionId) ? askedIds : [...askedIds, questionId];
    const nextAnswers = { ...(current.diagnostic?.answers || {}), [questionId]: text(answerValue) };
    const graded = nextAskedIds
      .map((id) => pool.find((entry) => text(asRecord(entry).id) === id))
      .filter(Boolean)
      .map((entry) => grade(asRecord(entry), nextAnswers[text(asRecord(entry).id)], title));
    const currentFeedback = grade(asRecord(item), text(answerValue), title);
    const correctCount = graded.filter((entry) => entry.is_correct === true).length;
    const target = diagnosticTarget(correctCount, graded.length, pool.length);
    const complete = graded.length >= target || nextAskedIds.length >= pool.length;
    if (complete) writeDiagnosticAttemptHistory(moduleId, lessonId, resources.lesson, nextAskedIds);
    writeState(moduleId, lessonId, {
      ...current,
      diagnostic: { nonce: diagnosticNonce, askedIds: nextAskedIds, answers: nextAnswers, recentFeedback: currentFeedback, complete, feedback: complete ? graded : undefined },
      conceptGate: current.conceptGate,
      reflection: current.reflection,
      mastery: current.mastery,
    });
    return;



  }

  if (request.event_type === "diagnostic_feedback_acknowledged") {
    const state = readState(moduleId, lessonId);
    const feedback = state.diagnostic?.feedback || [];
    const correctCount = feedback.filter((entry) => entry.is_correct === true).length;
    const misconceptionTags = feedback
      .filter((entry) => entry.is_correct !== true)
      .map((entry) => text(entry.misconception_tag))
      .filter(Boolean);
    await postEvent(moduleId, lessonId, {
      event_type: "diagnostic",
      score: feedback.length > 0 ? correctCount / feedback.length : 0,
      misconception_tags: misconceptionTags,
      details: { source: "student_runner_diagnostic", asked_count: feedback.length, correct_count: correctCount },
    });
    writeState(moduleId, lessonId, {
      profile: {
        ...(state.profile || {}),
        diagnosticScore: feedback.length > 0 ? correctCount / feedback.length : 0,
      },
      conceptGate: state.conceptGate,
      reflection: state.reflection,
      mastery: state.mastery,
    });
    return;
  }

  if (request.event_type === "scaffold_continue") {
    await postEvent(moduleId, lessonId, {
      event_type: "reflection",
      score: 1,
      details: { source: "student_runner_scaffolded_teaching_viewed" },
    });
    return;
  }

  if (request.event_type === "concept_gate_retry_requested") {
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      conceptGate: { nonce: state.conceptGate?.nonce || freshAttemptSeed(), retryCount: Math.min((state.conceptGate?.retryCount || 0) + 1, CONCEPT_GATE_MAX_RETRIES) },
    });
    return;
  }

  if (request.event_type === "concept_gate_submitted" && payload.acknowledged === true) {
    await postEvent(moduleId, lessonId, {
      event_type: "reflection",
      score: 1,
      details: { source: "student_runner_concept_gate" },
    });
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      profile: {
        ...(state.profile || {}),
        conceptGateReady: true,
      },
      diagnostic: state.diagnostic,
      reflection: state.reflection,
      mastery: state.mastery,
    });
    return;
  }

  if (request.event_type === "concept_gate_submitted") {
    const resources = await loadResources(moduleId, lessonId);
    const title = lessonTitle(resources.lesson, asRecord(resources.runner.lesson));
    const state = readState(moduleId, lessonId);
    const retryCount = state.conceptGate?.retryCount || 0;
    const conceptNonce = state.conceptGate?.nonce || freshAttemptSeed();
    const conceptSeed = "concept:" + String(conceptNonce) + ":" + String(retryCount);
    const item = conceptGateItemForAttempt(moduleId, lessonId, resources.lesson, conceptNonce, retryCount);
    const answerValue = text(asRecord(payload.answers)[text(asRecord(item).id)]);
    if (!item || !answerValue) throw new Error("Choose an answer before continuing.");
    const graded = grade(asRecord(item), answerValue, title);
    const capsules = asList(asRecord(phases(resources.lesson).concept_reconstruction).capsules).map(asRecord);
    writeConceptGateAttemptHistory(moduleId, lessonId, resources.lesson, [text(asRecord(item).id)]);
    const capsule = capsules.find((entry) => asList(entry.checks).map(asRecord).some((check) => text(check.id) === text(asRecord(item).id)));
    writeState(moduleId, lessonId, {
      ...state,
      conceptGate: {
        nonce: conceptNonce,
        retryCount,
        submitted: true,
        passed: graded.is_correct === true,
        feedback: [{ question_id: text(graded.question_id), is_correct: graded.is_correct, explanation: graded.is_correct === true ? "That is right. You have shown the key idea clearly." : `${text(graded.explanation)} Correct answer: ${text(graded.correct_answer)}.` }],
        microReteach: graded.is_correct === true ? undefined : { title: retryCount >= CONCEPT_GATE_MAX_RETRIES ? "Quick refresher" : "Remember this", body: text(capsule?.prompt) || text(graded.teaching_focus) },
      },
    });
    return;
  }

  if (request.event_type === "simulation_completed") {
    await postEvent(moduleId, lessonId, {
      event_type: "simulation",
      score: 1,
      details: { source: "student_runner_simulation" },
    });
    return;
  }

  if (request.event_type === "reflection_submitted" && payload.acknowledged === true) {
    const state = readState(moduleId, lessonId);
    await postEvent(moduleId, lessonId, {
      event_type: "reflection",
      score: 1,
      details: { source: "student_runner_concept_reconstruction", response_text: state.reflection?.learnerResponse || "" },
    });
    writeState(moduleId, lessonId, {
      profile: state.profile,
      diagnostic: state.diagnostic,
      conceptGate: state.conceptGate,
      mastery: state.mastery,
    });
    return;
  }

  if (request.event_type === "reflection_submitted") {
    const responseText = text(payload.response_text).trim();
    if (!responseText) throw new Error("Write your explanation before continuing.");
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      reflection: { submitted: true, learnerResponse: responseText },
    });
    return;
  }

  if (request.event_type === "mastery_retest_requested") {
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      mastery: {
        nonce: (state.mastery?.nonce || freshAttemptSeed()) + 1,
        forceNewAttempt: true,
        displayedItems: [],
      },
    });
    return;
  }

  if (request.event_type === "mastery_review_requested") {
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      mastery: { ...(state.mastery || { nonce: freshAttemptSeed() }), reviewRequested: true },
    });
    return;
  }

  if (request.event_type === "mastery_submitted") {
    const resources = await loadResources(moduleId, lessonId);
    const runnerLesson = asRecord(resources.runner.lesson);
    const title = lessonTitle(resources.lesson, runnerLesson);
    const masteryMeta = asRecord(runnerLesson.mastery_check);
    const state = readState(moduleId, lessonId);
    const pool = masteryItems(resources.lesson);
    const submittedIds = asList(payload.question_ids).map((entry) => text(entry)).filter(Boolean);
    const displayedItems = asList(state.mastery?.displayedItems).map(asRecord).filter((item) => text(item.id));
    const displayedById = new Map(displayedItems.map((item) => [text(item.id), item]));
    const displayedSelected = submittedIds.length && submittedIds.every((id) => displayedById.has(id))
      ? submittedIds.map((id) => displayedById.get(id)).filter(Boolean)
      : [];
    const selected = displayedSelected.length === submittedIds.length && submittedIds.length > 0
      ? displayedSelected
      : submittedIds.length
        ? submittedIds.map((id) => pool.find((item) => text(asRecord(item).id) === id)).filter(Boolean)
        : masteryPoolForAttempt(moduleId, lessonId, resources.lesson, state.mastery?.nonce || 0).slice(0, masteryQuestionCount(masteryMeta, pool.length, masteryStrengthScore(runnerLesson, state)));
    if (submittedIds.length && selected.length !== submittedIds.length) throw new Error("This mastery check is out of date. Start a fresh attempt and try again.");
    if (selected.length === 0) throw new Error("The mastery check is not available right now.");
    const answers = asRecord(payload.answers);
    const feedback = selected.map((item) => {
      const graded = grade(asRecord(item), answers[text(asRecord(item).id)], title);
      return {
        question_id: text(graded.question_id),
        prompt: text(graded.prompt),
        is_correct: graded.is_correct,
        explanation: graded.is_correct === true ? text(graded.explanation) || "Correct." : `${text(graded.explanation)} Correct answer: ${text(graded.correct_answer)}.`,
      };
    });
    const correctCount = feedback.filter((entry) => entry.is_correct === true).length;
    const score = selected.length > 0 ? correctCount / selected.length : 0;
    const result = { percent: Math.round(score * 100), passed: score >= numberValue(masteryMeta.threshold, 0.8) };
    writeMasteryAttemptHistory(moduleId, lessonId, resources.lesson, selected.map((item) => text(asRecord(item).id)).filter(Boolean));
    writeState(moduleId, lessonId, {
      ...state,
      mastery: {
        nonce: state.mastery?.nonce || 0,
        submitted: true,
        feedback,
        result,
        reviewRefs: reviewRefs(resources.lesson, asList(masteryMeta.recommended_review_refs)),
        forceNewAttempt: false,
      },
    });
    await postEvent(moduleId, lessonId, {
      event_type: "transfer",
      score,
      details: { source: "student_runner_mastery_check", correct_count: correctCount },
    });
    return;
  }

  throw new Error(`Unsupported lesson runner event: ${request.event_type}`);
}


export async function restartModuleProgress(moduleId: string): Promise<void> {
  await apipPost<{ ok: boolean }, JsonObject>(
    "/student/modules/" + encodeURIComponent(moduleId) + "/restart",
    {}
  );
  clearModuleState(moduleId);
}

export async function restartLessonProgress(moduleId: string, lessonId: string): Promise<void> {
  const normalized = normalizeLessonId(lessonId);
  await apipPost<{ ok: boolean }, JsonObject>(
    "/student/modules/" + encodeURIComponent(moduleId) + "/lessons/" + encodeURIComponent(normalized) + "/restart",
    {}
  );
  clearState(moduleId, lessonId);
}

