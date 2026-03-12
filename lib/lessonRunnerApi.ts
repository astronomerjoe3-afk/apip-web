"use client";

import { apipGet, apipPost } from "./apipApi";

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
  };
  diagnostic?: {
    askedIds: string[];
    answers: Record<string, string>;
    feedback?: UnknownRecord[];
    recentFeedback?: UnknownRecord;
    complete?: boolean;
  };
  conceptGate?: {
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
  };
};

type LessonResources = {
  runner: UnknownRecord;
  lesson: UnknownRecord;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CONCEPT_GATE_MAX_RETRIES = 2;
const MASTERY_DEFAULT_MIN = 5;
const MASTERY_DEFAULT_MAX = 10;
const SUPPLEMENTAL_LESSON_CODES = ["F1_L1", "F1_L2", "F1_L3", "F1_L4", "F1_L5", "F1_L6", "F2_L1", "F2_L2", "F2_L3", "F2_L4", "F2_L5", "F2_L6"];

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
  "you measure length as 12 4 cm with a ruler of 1 mm divisions report the value with a reasonable uncertainty": { id: "F1L6_T1", acceptedAnswers: ["12.4 +/- 0.05 cm", "12.4 cm +/- 0.05 cm", "12.40 +/- 0.05 cm", "12.40 cm +/- 0.05 cm"], correctAnswer: "12.4 +/- 0.05 cm", explanation: "A ruler with 1 mm divisions supports about +/- 0.05 cm uncertainty, so 12.4 cm should be reported with that uncertainty.", teachingFocus: "Report the measured value with a reasonable uncertainty based on the instrument's smallest division.", misconceptionTag: "uncertainty_estimation" },
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

function inferredStageFromServerProgress(lesson: UnknownRecord, runnerLesson: UnknownRecord): string | null {
  const completed = new Set(completedStageKeys(runnerLesson));
  const orderedStages = [
    ...(firstStageForLesson(lesson) === "diagnostic" ? ["diagnostic"] : []),
    "scaffolded_teaching",
    "concept_gate",
    "simulation",
    "reflection",
    "mastery_check",
  ];

  for (const stage of orderedStages) {
    if (!completed.has(stage)) {
      return stage;
    }
  }

  return completed.has("mastery_check") ? "done" : null;
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
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOpenAnswer(value: unknown): string {
  return text(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/,/g, "")
    .replace(/metres?/g, "m")
    .replace(/meters?/g, "m")
    .replace(/kilograms?/g, "kg")
    .replace(/grams?/g, "g")
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
  if (itemId === "F1-L2-D1") {
    return { id: "F1-L2-D1", answerIndex: 2, correctAnswer: "displacement", explanation: "Displacement is a vector because it has both size and direction.", teachingFocus: "Vectors need magnitude and direction, while scalars only need magnitude.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (itemId === "F1-L2-D2") {
    return { id: "F1-L2-D2", answerIndex: 2, correctAnswer: "Vectors have magnitude and direction", explanation: "A vector combines size and direction.", teachingFocus: "Do not treat vectors and scalars as interchangeable descriptions.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (itemId === "F1-L2-T1") {
    return { id: "F1-L2-T1", answerIndex: 1, correctAnswer: "Vector", explanation: "The direction east makes it a vector.", teachingFocus: "Direction is the feature that turns a scalar description into a vector one.", misconceptionTag: "vector_scalar_confusion" };
  }
  if (itemId === "F1L3_D1" || itemId === "F1-L3-D1") {
    return { id: "F1L3_D1", answerIndex: 1, correctAnswer: "+/- 0.5 mm", explanation: "+/- 0.5 mm is reasonable because a common estimate is about half of the smallest 1 mm division.", teachingFocus: "For a simple scale reading, a reasonable uncertainty is often about half the smallest division.", misconceptionTag: "uncertainty_estimation" };
  }
  if (itemId === "F1L3_D2" || itemId === "F1-L3-D2") {
    return { id: "F1L3_D2", answerIndex: 1, correctAnswer: "systematic error", explanation: "This is systematic error because the same zero error shifts every reading in the same direction.", teachingFocus: "Systematic error pushes measurements the same way each time, often because of zero error or poor calibration.", misconceptionTag: "random_vs_systematic_error" };
  }
  if (itemId === "F1L3_T2" || itemId === "F1-L3-T2") {
    return { id: "F1-L3-T2", acceptedAnswers: ["0.1 cm", "+/- 0.1 cm"], correctAnswer: "+/- 0.1 cm", explanation: "A reasonable uncertainty is often half the smallest division, so 0.2 cm divisions suggest +/- 0.1 cm.", teachingFocus: "Estimate uncertainty from the instrument scale instead of inventing extra precision.", misconceptionTag: "uncertainty_estimation" };
  }
  if (itemId === "F1L4_D1" || itemId === "F1-L4-D1") {
    return { id: "F1L4_D1", answerIndex: 1, correctAnswer: "3", explanation: "0.00450 has 3 significant figures because the leading zeros do not count, but the trailing zero after the decimal does count.", teachingFocus: "Count significant figures from the first non-zero digit; leading zeros only place the decimal point, but trailing zeros after a decimal can show real precision.", misconceptionTag: "significant_figures" };
  }
  if (itemId === "F1L4_D2" || itemId === "F1-L4-D2") {
    return { id: "F1L4_D2", answerIndex: 0, correctAnswer: "12.3", explanation: "12.349 rounds to 12.3 to 3 significant figures because you keep 1, 2, and 3, then the next digit 4 leaves the 3 unchanged.", teachingFocus: "For significant figures, keep the required digits and use the next digit only to decide whether to round up.", misconceptionTag: "rounding_rules" };
  }
  if (itemId === "F1L4_T1" || itemId === "F1-L4-T1") {
    return { id: "F1-L4-T1", acceptedAnswers: ["8.6"], correctAnswer: "8.6", explanation: "2.5 x 3.42 = 8.55, which rounds to 8.6 because the result should keep 2 significant figures.", teachingFocus: "In multiplication and division, the result usually keeps the same number of significant figures as the least precise measurement.", misconceptionTag: "significant_figures" };
  }
  if (itemId === "F1L6_D1" || itemId === "F1-L6-D1") {
    return { id: "F1L6_D1", answerIndex: 1, correctAnswer: "precise but not accurate", explanation: "The measurements are tightly grouped, so they are precise, but they are far from the true value, so they are not accurate.", teachingFocus: "Precision is about closeness among repeated readings, while accuracy is about closeness to the accepted or true value.", misconceptionTag: "precision_vs_accuracy" };
  }
  if (itemId === "F1L6_D2" || itemId === "F1-L6-D2") {
    return { id: "F1L6_D2", acceptedAnswers: ["Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", "Systematic: zero error. Random: reaction time.", "Systematic: poor calibration. Random: reading fluctuations."], correctAnswer: "Systematic error can come from zero error or poor calibration, while random error can come from reaction time or small reading fluctuations.", explanation: "A strong answer names one cause that shifts readings the same way each time and one cause that makes readings scatter from trial to trial.", teachingFocus: "Systematic error adds a consistent bias, while random error causes scatter between repeated readings.", misconceptionTag: "random_vs_systematic_error" };
  }
  if (itemId === "F1L6_T1" || itemId === "F1-L6-T1") {
    return { id: "F1L6_T1", acceptedAnswers: ["12.4 +/- 0.05 cm", "12.4 cm +/- 0.05 cm", "12.40 +/- 0.05 cm", "12.40 cm +/- 0.05 cm"], correctAnswer: "12.4 +/- 0.05 cm", explanation: "A ruler with 1 mm divisions supports about +/- 0.05 cm uncertainty, so 12.4 cm should be reported with that uncertainty.", teachingFocus: "Report the measured value with a reasonable uncertainty based on the instrument's smallest division.", misconceptionTag: "uncertainty_estimation" };
  }
  if (itemId === "F1-L2-C1") {
    return { id: "F1-L2-C1", answerIndex: 2, correctAnswer: "distance", explanation: "Distance only needs size, so it is scalar.", teachingFocus: "Scalars tell how much, not which way.", misconceptionTag: "vector_scalar_confusion" };
  }
  return FALLBACK_ANSWER_METADATA[normalizePromptKey(item.prompt)];
}

function includesAnyPhrase(source: string, phrases: string[]): boolean {
  return phrases.some((phrase) => source.includes(normalizeOpenAnswer(phrase)));
}

function customShortAnswerMatch(item: UnknownRecord, answer: unknown): boolean | null {
  const itemId = text(item.id);
  const promptKey = normalizePromptKey(item.prompt);
  const isLessonSixErrorPrompt =
    itemId === "F1L6_D2" ||
    itemId === "F1-L6-D2" ||
    promptKey === "give one source of systematic error and one source of random error in a measurement";

  if (!isLessonSixErrorPrompt) return null;

  const candidate = normalizeOpenAnswer(answer);
  if (!candidate) return false;

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
  return {
    ...item,
    id: resolvedItemId(item, key, index),
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

function conceptGateItems(lesson: UnknownRecord): UnknownRecord[] {
  const capsules = asList(asRecord(phases(lesson).concept_reconstruction).capsules).map(asRecord);
  return capsules.flatMap((capsule, capsuleIndex) =>
    asList(capsule.checks).map((entry, checkIndex) =>
      withResolvedItem(asRecord(entry), `concept_gate_${capsuleIndex + 1}`, checkIndex)
    )
  );
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
  return {
    id: text(item.id),
    prompt: text(item.prompt),
    type: choices.length > 0 ? "multiple_choice" : "short_answer",
    options,
  };
}

function choiceLabel(item: UnknownRecord, answer: unknown): string | null {
  const choices = asList(item.choices).map((choice) => text(choice));
  const index = valueIndex(answer);
  return index >= 0 && index < choices.length ? choices[index] : null;
}

function teachingFocus(prompt: string, title: string): string {
  const source = `${title} ${prompt}`.toLowerCase();
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

function resolvedAnswerIndex(item: UnknownRecord): number {
  const itemId = text(item.id);
  const exactMetaIndex = itemId ? fallbackMeta({ id: itemId })?.answerIndex : undefined;
  if (typeof exactMetaIndex === "number" && Number.isFinite(exactMetaIndex)) return exactMetaIndex;
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

  const accepted = shortAnswerAccepted(item);
  if (accepted.length > 0) {
    return accepted.find((entry) => /[A-Za-z]/.test(entry)) || accepted[0];
  }

  return fallbackMeta(item)?.correctAnswer || "Review the lesson idea and try again.";
}

function resolvedExplanation(item: UnknownRecord, answerIndex: number): string {
  const feedback = asList(item.feedback).map((entry) => text(entry));
  const answerFeedback = answerIndex >= 0 && answerIndex < feedback.length ? feedback[answerIndex] : "";
  const metaExplanation = fallbackMeta(item)?.explanation;
  if (hasMeaningfulFeedback(metaExplanation || "")) {
    return metaExplanation || "";
  }

  if (hasMeaningfulFeedback(answerFeedback)) {
    return answerFeedback;
  }

  const hint = text(item.hint);
  if (hasMeaningfulFeedback(hint)) {
    return hint;
  }

  return "Review the lesson idea and try again.";
}

function shortAnswerAccepted(item: UnknownRecord): string[] {
  const accepted = asList(item.accepted_answers).map((entry) => text(entry)).filter(Boolean);
  const meta = fallbackMeta(item);
  const values = [...accepted, ...(meta?.acceptedAnswers || []), meta?.correctAnswer || ""]
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
      ? answerIndex === resolvedAnswerIndex(item)
      : shortAnswerMatches(answer, acceptedAnswers, item);
  const explanation = resolvedExplanation(item, answerIndex);
  const focus = meta?.teachingFocus || teachingFocus(prompt, title);
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
    misconception_tag: isCorrect ? undefined : meta?.misconceptionTag || misconceptionTag(prompt),
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
  if (code.startsWith("F2_")) {
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
      ];
    case "F1_L3":
      return [
        mcItem("F1-L3-M1", "Which tool is best for measuring the diameter of a thin wire?", ["metre rule", "vernier caliper", "micrometer screw gauge", "measuring tape"], 2, "Choose the finest suitable scale for the tiny object.", "A micrometer screw gauge is best for a thin wire because its very fine scale is designed for tiny diameters."),
        mcItem("F1-L3-M2", "A ruler has 1 mm divisions. What uncertainty is often reasonable to report?", ["+/- 1 mm", "+/- 0.5 mm", "+/- 0.1 mm", "+/- 2 mm"], 1, "A common estimate is about half the smallest division.", "+/- 0.5 mm is reasonable because it is about half of a 1 mm smallest division."),
        mcItem("F1-L3-M3", "If repeated readings are tightly grouped, what does that suggest?", ["low precision", "greater precision", "wrong unit", "systematic error only"], 1, "Think about how closely the readings agree with each other.", "Tightly grouped readings suggest greater precision because the measurements agree closely."),
        mcItem("F1-L3-M4", "A balance always reads 0.2 g too high before any mass is placed on it. This is...", ["random error", "systematic error", "rounding only", "no error"], 1, "A repeated shift in the same direction is the clue.", "A constant offset is systematic error because it shifts every reading the same way."),
        mcItem("F1-L3-M5", "Why is a caliper usually more trustworthy than a rough ruler for a tiny object?", ["It is always digital", "It has finer divisions and smaller uncertainty", "It uses larger units", "It removes all error"], 1, "Trust comes from finer resolution, not from magic.", "A caliper is usually more trustworthy because its finer divisions reduce the uncertainty in the reading."),
        mcItem("F1-L3-M6", "What does resolution describe?", ["The color of the instrument", "The smallest change the instrument can show", "The true value exactly", "The number of repeated trials"], 1, "Resolution is about the instrument's smallest visible change.", "Resolution is the smallest change an instrument can show."),
        shortItem("F1-L3-M7", "A scale has 0.2 cm divisions. What uncertainty is often reasonable to report?", ["0.1 cm", "+/- 0.1 cm"], "Use about half the smallest division."),
        shortItem("F1-L3-M8", "Name one reason repeated measurements improve trust in a result.", ["they show variation", "they show how much the readings vary", "they help estimate uncertainty", "they help us estimate uncertainty", "they show consistency", "they let you average the readings", "they help average out random error", "they reduce random error", "they help spot anomalous readings", "they help spot outliers"], "Think about spread, consistency, uncertainty, averaging, and outliers."),
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
        shortItem("F1-L4-M8", "State the addition and subtraction rule for significant figures in a few words.", ["least decimal places", "match the least decimal places", "use the least decimal places", "follow the least decimal places"], "Think about decimal places rather than total significant figures."),
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

function masteryVariantsFromPool(items: UnknownRecord[], code: string): UnknownRecord[] {
  switch (code) {
    case "F2_L1":
      return [
        mcItem("F2-L1-X1", "A drone flies 18 m north and then 18 m south. Which statement is correct?", ["distance 0 m, displacement 0 m", "distance 18 m, displacement 18 m north", "distance 36 m, displacement 0 m", "distance 36 m, displacement 36 m north"], 2, "Distance totals the full route, while displacement compares the finish with the start.", "The drone travelled 36 m in total and finished back at the start, so its displacement is 0 m."),
        shortItem("F2-L1-X2", "A shuttle covers 210 m in 35 s. What is the average speed?", ["6", "6 m/s"], "Use total distance divided by total time."),
        mcItem("F2-L1-X3", "A hiker walks 14 m east, 9 m west, and then 4 m east. Which pair is correct?", ["distance 9 m, displacement 9 m east", "distance 27 m, displacement 9 m east", "distance 27 m, displacement 27 m east", "distance 18 m, displacement 9 m east"], 1, "Add every stage for distance, then compare the finishing point with the starting point for displacement.", "The full path is 27 m and the net change is 9 m east."),
        mcItem("F2-L1-X4", "Which quantity can be zero even when a journey covers a long route?", ["distance", "average speed", "displacement", "time"], 2, "A round trip can return to the starting point even though distance was covered.", "Displacement can be zero if the object finishes where it started."),
      ];
    case "F2_L2":
      return [
        mcItem("F2-L2-X1", "Velocity changes from 3 m/s to 11 m/s in 4 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "8 m/s^2"], 1, "Use change in velocity divided by time.", "The velocity changes by 8 m/s in 4 s, so the acceleration is 2 m/s^2."),
        shortItem("F2-L2-X2", "Velocity changes from -2 m/s to 4 m/s in 3 s. What is the acceleration?", ["2 m/s^2"], "Subtract initial velocity from final velocity before dividing by time."),
        mcItem("F2-L2-X3", "An object keeps the same velocity for 5 s. What is its acceleration?", ["-5 m/s^2", "0 m/s^2", "1 m/s^2", "5 m/s^2"], 1, "No change in velocity means zero acceleration.", "If velocity does not change, the acceleration is 0 m/s^2."),
        mcItem("F2-L2-X4", "Why can acceleration be non-zero even if speed stays the same?", ["Because acceleration depends on mass only", "Because a change in direction also changes velocity", "Because time becomes negative", "Because speed and velocity are identical"], 1, "Velocity depends on direction as well as speed.", "Acceleration can be non-zero because a direction change is still a velocity change."),
      ];
    case "F2_L3":
      return [
        mcItem("F2-L3-X1", "A horizontal section on a distance-time graph shows that the object is...", ["speeding up", "stopped", "moving backwards", "accelerating negatively"], 1, "If the distance does not change, the object is not moving.", "A horizontal section means the distance stays constant, so the object is stopped."),
        shortItem("F2-L3-X2", "A graph rises by 18 m in 6 s on one straight section. What speed does that section show?", ["3 m/s"], "Use slope = distance change / time change for that section."),
        mcItem("F2-L3-X3", "Which section of a distance-time graph shows the greater speed?", ["the steeper straight section", "the flatter straight section", "the horizontal section", "all sections show the same speed"], 0, "Steeper slope means greater speed on a distance-time graph.", "The steeper straight section represents the greater speed."),
        mcItem("F2-L3-X4", "If a distance-time graph becomes less steep later, what does that mean?", ["the object is moving faster", "the object is moving slower", "the object must be moving backwards", "the object has zero distance"], 1, "A smaller slope means a smaller speed.", "A less-steep section means the speed is smaller later."),
      ];
    case "F2_L4":
      return [
        mcItem("F2-L4-X1", "What does the area under a velocity-time graph represent?", ["force", "displacement", "acceleration", "mass"], 1, "Area combines velocity with time.", "The area under a velocity-time graph represents displacement."),
        shortItem("F2-L4-X2", "An object moves at 6 m/s for 4 s. What displacement is shown by the graph area?", ["24 m"], "For constant velocity, displacement is velocity multiplied by time."),
        mcItem("F2-L4-X3", "Velocity rises from 4 m/s to 10 m/s in 3 s. What is the acceleration?", ["1 m/s^2", "2 m/s^2", "3 m/s^2", "6 m/s^2"], 1, "Use slope = change in velocity / time.", "The velocity changes by 6 m/s in 3 s, so the acceleration is 2 m/s^2."),
        mcItem("F2-L4-X4", "Which statement correctly matches the graph feature to the quantity?", ["slope gives displacement and area gives acceleration", "slope gives acceleration and area gives displacement", "both slope and area give velocity only", "neither slope nor area has physical meaning"], 1, "Do not swap the two interpretations.", "On a velocity-time graph, slope gives acceleration and area gives displacement."),
      ];
    case "F2_L5":
      return [
        mcItem("F2-L5-X1", "8 N right and 8 N left give a resultant force of...", ["0 N", "8 N right", "16 N right", "4 N right"], 0, "Equal opposite forces cancel completely.", "The resultant force is 0 N because the forces are equal and opposite."),
        shortItem("F2-L5-X2", "11 N right and 4 N left give what resultant force?", ["7 N right"], "Subtract opposite forces and keep the direction of the larger force."),
        mcItem("F2-L5-X3", "If the resultant force on a moving object is zero, the object can...", ["keep moving at constant velocity", "only stop", "speed up automatically", "reverse direction without a force"], 0, "Zero resultant force means zero acceleration.", "The object can keep moving at constant velocity because zero resultant force means no acceleration."),
        mcItem("F2-L5-X4", "Two forces of 3 N and 5 N both act to the right. What is the resultant force?", ["2 N right", "8 N right", "5 N right", "0 N"], 1, "Forces in the same direction add together.", "The resultant force is 8 N right because the forces act in the same direction."),
      ];
    case "F2_L6":
      return [
        mcItem("F2-L6-X1", "A 15 N resultant force acts on a 5 kg trolley. What is the acceleration?", ["2 m/s^2", "3 m/s^2", "5 m/s^2", "15 m/s^2"], 1, "Use a = F / m.", "15 N divided by 5 kg gives 3 m/s^2."),
        shortItem("F2-L6-X2", "A 4 kg trolley accelerates at 2.5 m/s^2. What resultant force acts on it?", ["10 N"], "Use F = ma."),
        mcItem("F2-L6-X3", "The same force acts on a 2 kg trolley and a 6 kg trolley. Which trolley accelerates more?", ["the 2 kg trolley", "the 6 kg trolley", "both equally", "neither trolley"], 0, "For the same force, the smaller mass accelerates more.", "The 2 kg trolley accelerates more because a smaller mass gives a larger acceleration for the same force."),
        mcItem("F2-L6-X4", "If the mass doubles while the same resultant force acts, the acceleration...", ["doubles", "halves", "stays the same", "must become negative"], 1, "Acceleration is inversely related to mass when force is fixed.", "The acceleration halves if the mass doubles while the force stays the same."),
      ];
    default:
      return items.flatMap((item, itemIndex) => [
        {
          ...asRecord(item),
          id: code + "_VAR_" + String(itemIndex + 1),
          prompt: "Try the same lesson idea in a fresh context: " + text(asRecord(item).prompt),
        },
      ]);
  }
}


function masterySourceKey(item: UnknownRecord): string {
  const prompt = text(item.prompt)
    .replace(/^(Apply the same lesson idea in a new check: |Use the rule carefully here: |Try the concept again in a fresh question: |Use the lesson idea one more time here: )/i, "")
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
      default:
        return SUPPLEMENTAL_LESSON_CODES.filter((entry) => entry !== code);
    }
  })();
  const promptForPoint = (point: string, index: number): string => {
    const normalized = normalizePromptKey(point);

    if (code === "F1_L5") {
      return ["Which density reminder is correct?", "Which idea best explains density?", "Which statement fits density and floating?", "Which density rule should you remember?"][index % 4];
    }

    switch (code) {
      case "F2_L1":
        if (normalized.includes("round trip")) return "Which option correctly explains what a round trip can show about distance and displacement?";
        if (normalized.includes("distance")) return "Which option correctly explains how distance is worked out for a journey?";
        if (normalized.includes("displacement") || normalized.includes("starting point") || normalized.includes("finishing point")) return "Which option correctly explains what displacement compares?";
        if (normalized.includes("average speed")) return "Which option gives the correct whole-journey rule for average speed?";
        if (normalized.includes("direction")) return "Which option correctly explains why some motion answers must keep a direction word?";
        return "Which option is the clearest match for this journey lesson?";
      case "F2_L2":
        if (normalized.includes("velocity is a vector") || normalized.includes("direction change")) return "Which option correctly explains why velocity can change?";
        if (normalized.includes("final velocity minus initial velocity")) return "Which option gives the correct setup for calculating acceleration?";
        if (normalized.includes("positive direction") || normalized.includes("sign")) return "Which option correctly explains how signs should be interpreted?";
        if (normalized.includes("acceleration")) return "Which option correctly defines acceleration in this lesson?";
        return "Which option is the clearest match for this velocity and acceleration lesson?";
      case "F2_L3":
        if (normalized.includes("distance time graph")) return "Which option correctly describes what a distance-time graph shows?";
        if (normalized.includes("flat")) return "Which option correctly interprets a flat section on a distance-time graph?";
        if (normalized.includes("steeper") || normalized.includes("steepness")) return "Which option correctly compares steeper and less steep segments?";
        if (normalized.includes("slope")) return "Which option correctly explains what the slope means on this graph?";
        return "Which option is the clearest match for this distance-time graph lesson?";
      case "F2_L4":
        if (normalized.includes("velocity time graph")) return "Which option correctly describes what a velocity-time graph shows?";
        if (normalized.includes("horizontal line")) return "Which option correctly interprets a horizontal line on a velocity-time graph?";
        if (normalized.includes("positive") || normalized.includes("negative")) return "Which option correctly explains what positive and negative regions mean?";
        if (normalized.includes("slope") || normalized.includes("area")) return "Which option correctly matches slope and area to their meanings?";
        return "Which option is the clearest match for this velocity-time graph lesson?";
      case "F2_L5":
        if (normalized.includes("balanced forces")) return "Which option correctly describes balanced forces?";
        if (normalized.includes("zero resultant force") || normalized.includes("zero acceleration")) return "Which option correctly explains what zero resultant force tells you?";
        if (normalized.includes("unbalanced forces") || normalized.includes("acceleration")) return "Which option correctly explains what unbalanced forces do?";
        if (normalized.includes("resultant force")) return "Which option correctly explains what resultant force means?";
        return "Which option is the clearest match for this forces lesson?";
      case "F2_L6":
        if (normalized.includes("inertia")) return "Which option correctly explains inertia in this lesson?";
        if (normalized.includes("mass")) return "Which option correctly explains the effect of mass in F = ma problems?";
        if (normalized.includes("force")) return "Which option correctly explains the effect of force in F = ma problems?";
        if (normalized.includes("f ma")) return "Which option correctly explains what F = ma is linking?";
        return "Which option is the clearest match for this force, mass, and acceleration lesson?";
      default:
        return "Which statement belongs in this lesson?";
    }
  };

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
        "Pick the statement that matches this lesson's main distinction.",
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
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const diagnosticRecords = itemsFrom(lesson, "diagnostic").map(asRecord);
  const diagnosticSourceKeys = new Set(diagnosticRecords.map((item) => masterySourceKey(item)).filter(Boolean));
  const generated = generatedMasteryItems(lesson);
  const fallback = [...itemsFrom(lesson, "transfer"), ...conceptGateItems(lesson)]
    .filter((item) => hasUsableMasteryAnswer(asRecord(item)));
  const baseItems = generated.length > 0 ? [...generated, ...fallback] : [...fallback];
  const ordered = baseItems.length >= MASTERY_DEFAULT_MAX ? baseItems : [...baseItems, ...supplementalMasteryItems(lesson)];
  return ordered.filter((item) => {
    const record = asRecord(item);
    const id = text(record.id);
    const sourceKey = masterySourceKey(record);
    if (!id || (sourceKey && diagnosticSourceKeys.has(sourceKey))) return false;
    if (seenIds.has(id) || (sourceKey && seenSources.has(sourceKey))) return false;
    seenIds.add(id);
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
  switch (code) {
    case "F1_L5": return "Density explorer";
    case "F1_L4": return "Significant figures explorer";
    case "F1_L3": return "Measurement explorer";
    case "F2_L1": return "Motion path explorer";
    case "F2_L2": return "Acceleration explorer";
    case "F2_L3": return "Distance-time graph explorer";
    case "F2_L4": return "Velocity-time graph explorer";
    case "F2_L5": return "Resultant force explorer";
    case "F2_L6": return "Force and mass explorer";
    default: return "Simulation inquiry";
  }
}

function simulationStageInstructions(code: string, inquiry: UnknownRecord[]): string {
  switch (code) {
    case "F1_L5": return "Keep the volume fixed and change the mass, then keep the mass fixed and change the volume. Watch how the density comparison changes the float-or-sink result.";
    case "F1_L4": return "Compare rounding with calculation rules. Use the next digit to round, the least decimal places for addition or subtraction, and the least significant figures for multiplication or division.";
    case "F1_L3": return "Use the live tool bench: choose an object, switch instruments, and compare the reading detail, repeated-reading spread, and zero error.";
    case "F2_L1": return "Build one journey and read three different ideas from it: total distance, net displacement, and average speed over the whole trip.";
    case "F2_L2": return "Compare the starting velocity and ending velocity over a chosen time interval, then connect the sign and size of acceleration to the change in velocity.";
    case "F2_L3": return "Build a moving-stopped-moving journey and read the story from the distance-time graph by matching each segment to what the traveller is doing.";
    case "F2_L4": return "Use one velocity-time graph to answer two different questions: the slope gives acceleration, and the area under the graph gives displacement.";
    case "F2_L5": return "Compare equal and unequal opposing forces so you can separate the balanced case from the case that produces acceleration.";
    case "F2_L6": return "Hold one variable steady while you change the other so you can see clearly how force and mass affect acceleration.";
    default: return text(inquiry[0]?.prompt) || "Explore the activity and notice what changes as you test the idea.";
  }
}

function simulationStageTaskPrompt(code: string, inquiry: UnknownRecord[]): string {
  switch (code) {
    case "F1_L5": return "Find one setup that floats and one that sinks, then explain which density comparison changed.";
    case "F1_L4": return "Try one addition or subtraction example and one multiplication or division example, then explain why the reporting rule changes.";
    case "F1_L3": return "Try one object that suits a ruler and one that needs a finer tool, then test a zero-error offset and explain how it would mislead the reading if you forgot to correct it.";
    case "F2_L1": return "Create one round trip with zero displacement and one trip with a long distance but small displacement, then explain how the same journey can produce both results.";
    case "F2_L2": return "Build one case with positive acceleration, one with negative acceleration, and one with zero acceleration. Explain each sign from the velocity change, not from a guess.";
    case "F2_L3": return "Make a graph with a steep section, a flat section, and a less-steep section, then explain what the traveller is doing in each part.";
    case "F2_L4": return "Choose one setup and explain both the acceleration and the displacement from the same graph without mixing up slope and area.";
    case "F2_L5": return "Create one balanced-force case and one unbalanced-force case, then explain what each case says about acceleration and motion.";
    case "F2_L6": return "Start with one force-mass pair, then compare what happens when you double the force and when you double the mass.";
    default: return text(inquiry[1]?.prompt) || text(inquiry[0]?.hint);
  }
}

function simulationStageExploreSteps(code: string): string[] {
  switch (code) {
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
    default:
      return [];
  }
}
function simulationStageWatchFor(code: string): string[] {
  switch (code) {
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
    default:
      return [];
  }
}
function simulationStageTryFirst(code: string): string | undefined {
  switch (code) {
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
    default:
      return undefined;
  }
}
function simulationStageTakeaway(code: string): string | undefined {
  switch (code) {
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
    default:
      return [];
  }
}
function scaffoldCoreBullets(code: string): string[] {
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
      if (code.startsWith("F2_")) {
        const essentials = [...scaffoldCoreBullets(code), ...scaffoldFocusExtras(code)].filter(Boolean);
        return [{ title: "Lesson essentials", caption: "Keep these key motion or force ideas visible while you work through the lesson.", columns: ["Key idea", "Why it matters"], rows: essentials.slice(0, 6).map((item, index) => ["Idea " + String(index + 1), item]) }];
      }
      return [];
    }
  }
}



function scaffoldMediaCards(lesson: UnknownRecord): UnknownRecord[] {
  switch (lessonCode(lesson)) {
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
          title: "Compare the same object with three tools",
          caption: "Measure the same object with a ruler, caliper, and micrometer. Finer divisions reveal more detail and support smaller uncertainty.",
          image_url: "/lesson-media/f1/f1-l3-measurement-tools.svg",
          highlights: ["The same object looks rougher or finer depending on the tool", "Smaller divisions support smaller uncertainty", "In the next measurement lab, compare how each tool reads the same object"],
        },
        {
          kind: "visual",
          title: "Compare random error and zero error",
          caption: "Repeated readings can disagree in two ways: random error causes scatter, while zero error adds the same offset each time.",
          image_url: "/lesson-media/f1/f1-l3-reading-errors.svg",
          highlights: ["Random error shows up as spread between repeated readings", "Zero error shifts every reading by the same amount", "In the next measurement lab, compare scatter, averaging, and zero-offset effects"],
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
    default: {
      const code = lessonCode(lesson);
      if (code.startsWith("F2_")) {
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
  if (code.startsWith("F2_")) {
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



function scaffoldPayload(title: string, lesson: UnknownRecord, feedback: UnknownRecord[]): UnknownRecord {
  const repairs = feedback.filter((item) => item.is_correct !== true);
  const repairText = repairs.length > 0
    ? repairs.map((item) => (text(item.prompt) + " " + text(item.explanation)).trim()).join("\n")
    : "Your diagnostic was mostly secure, so this lesson widens out to the full sub-unit.";
  const analogyText = text(asRecord(phases(lesson).analogical_grounding).analogy_text);
  const code = lessonCode(lesson);
  const workedExample = scaffoldWorkedExample(lesson);
  const repairTeachingFocus = dedupeText(repairs.map((item) => text(item.teaching_focus)).filter(Boolean)).slice(0, 2);
  const teachingFocus = code.startsWith("F2_")
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
  const serverStage = runnerStageIndex(inferredServerStage || "") > runnerStageIndex(backendStage)
    ? inferredServerStage || backendStage
    : backendStage;
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

  const effectiveStage = shouldResetToStart ? startStage : serverStage;
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
  writeState(moduleId, lessonId, state);

  let activeStage = "diagnostic";
  let stagePayload: UnknownRecord = {};

  if (stage === "diagnostic") {
    activeStage = "diagnostic";
    const pool = itemsFrom(resources.lesson, "diagnostic");
    const askedIds = state.diagnostic?.askedIds || [];
    const answers = state.diagnostic?.answers || {};
    const feedback = state.diagnostic?.feedback || [];
    const correctCount = askedIds.reduce((total, id) => {
      const item = pool.find((entry) => text(asRecord(entry).id) === id);
      return item && grade(asRecord(item), answers[id], title).is_correct === true ? total + 1 : total;
    }, 0);
    const targetCount = diagnosticTarget(correctCount, askedIds.length, pool.length);
    const nextItem = pool.find((entry) => !askedIds.includes(text(asRecord(entry).id))) || null;
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
        questions: nextItem ? [question(asRecord(nextItem))] : [],
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
    const gatePool = conceptGateItems(resources.lesson);
    const gateItem = gatePool.length > 0 ? shuffle(gatePool, `concept:${retryCount}`)[0] : null;
    stagePayload = state.conceptGate?.submitted
      ? {
          instructions: "Use the feedback below to tighten the key idea before moving on.",
          retry_count: retryCount,
          max_retries: CONCEPT_GATE_MAX_RETRIES,
          questions: gateItem ? [question(asRecord(gateItem), `concept:${retryCount}`)] : [],
          submitted: true,
          passed: state.conceptGate.passed,
          feedback: state.conceptGate.feedback,
          micro_reteach: asRecord(state.conceptGate).microReteach,
        }
      : {
          instructions: "Answer this quick check before the activity opens.",
          retry_count: retryCount,
          max_retries: CONCEPT_GATE_MAX_RETRIES,
          questions: gateItem ? [question(asRecord(gateItem), `concept:${retryCount}`)] : [],
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
    const selectedPool = shuffle(pool, "mastery:" + String(masteryState.nonce || 0));
    const selected = selectedPool.slice(0, count);
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
    const pool = itemsFrom(resources.lesson, "diagnostic");
    const answers = asRecord(payload.answers);
    const firstEntry = Object.entries(answers)[0];
    if (!firstEntry) throw new Error("Choose an answer before continuing.");
    const [questionId, answerValue] = firstEntry;
    const item = pool.find((entry) => text(asRecord(entry).id) === questionId);
    if (!item) throw new Error("This question is not available right now.");

    const current = readState(moduleId, lessonId);
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
    writeState(moduleId, lessonId, {
      ...current,
      diagnostic: { askedIds: nextAskedIds, answers: nextAnswers, recentFeedback: currentFeedback, complete, feedback: complete ? graded : undefined },
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
      conceptGate: { retryCount: Math.min((state.conceptGate?.retryCount || 0) + 1, CONCEPT_GATE_MAX_RETRIES) },
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
      profile: state.profile,
      diagnostic: state.diagnostic,
      reflection: state.reflection,
      mastery: state.mastery,
    });
    return;
  }

  if (request.event_type === "concept_gate_submitted") {
    const resources = await loadResources(moduleId, lessonId);
    const title = lessonTitle(resources.lesson, asRecord(resources.runner.lesson));
    const retryCount = readState(moduleId, lessonId).conceptGate?.retryCount || 0;
    const pool = conceptGateItems(resources.lesson);
    const item = pool.length > 0 ? shuffle(pool, `concept:${retryCount}`)[0] : null;
    const answerValue = text(asRecord(payload.answers)[text(asRecord(item).id)]);
    if (!item || !answerValue) throw new Error("Choose an answer before continuing.");
    const graded = grade(asRecord(item), answerValue, title);
    const capsules = asList(asRecord(phases(resources.lesson).concept_reconstruction).capsules).map(asRecord);
    const capsule = capsules.find((entry) => asList(entry.checks).map(asRecord).some((check) => text(check.id) === text(asRecord(item).id)));
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      conceptGate: {
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
        nonce: (state.mastery?.nonce || 0) + 1,
        forceNewAttempt: true,
      },
    });
    return;
  }

  if (request.event_type === "mastery_review_requested") {
    const state = readState(moduleId, lessonId);
    writeState(moduleId, lessonId, {
      ...state,
      mastery: { ...(state.mastery || { nonce: 0 }), reviewRequested: true },
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
    const strengthScore = masteryStrengthScore(runnerLesson, state);
    const count = masteryQuestionCount(masteryMeta, pool.length, strengthScore);
    const selectedPool = shuffle(pool, "mastery:" + String(state.mastery?.nonce || 0));
    const selected = selectedPool.slice(0, count);
    if (selected.length === 0) throw new Error("The mastery check is not available right now.");
    const answers = asRecord(payload.answers);
    const feedback = selected.map((item) => {
      const graded = grade(asRecord(item), answers[text(asRecord(item).id)], title);
      return {
        question_id: text(graded.question_id),
        is_correct: graded.is_correct,
        explanation: graded.is_correct === true ? text(graded.explanation) || "Correct." : `${text(graded.explanation)} Correct answer: ${text(graded.correct_answer)}.`,
      };
    });
    const correctCount = feedback.filter((entry) => entry.is_correct === true).length;
    const score = selected.length > 0 ? correctCount / selected.length : 0;
    const result = { percent: Math.round(score * 100), passed: score >= numberValue(masteryMeta.threshold, 0.8) };
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




