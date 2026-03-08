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
  "which quantity is a vector": { id: "F1-L2-D1", answerIndex: 2, correctAnswer: "velocity", explanation: "Velocity is a vector because it needs both size and direction.", teachingFocus: "Vectors need magnitude and direction, while scalars only need magnitude.", misconceptionTag: "vector_scalar_confusion" },
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
  return !["correct", "correct.", "no", "no.", "incorrect", "incorrect.", "incomplete", "incomplete."].includes(normalized);
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
  return FALLBACK_ANSWER_METADATA[normalizePromptKey(item.prompt)];
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
  if (source.includes("precision") || source.includes("uncertainty") || source.includes("trust") || source.includes("ruler") || source.includes("caliper")) return "More precise tools reduce uncertainty, which makes a measurement more trustworthy.";
  if (source.includes("vector") || source.includes("direction")) return "Vectors need both size and direction, while scalars only need size.";
  if (source.includes("density")) return "Density compares mass to volume, so both quantities matter together.";
  return "Reconnect the main idea to the quantity, unit, and meaning in the question.";
}

function misconceptionTag(prompt: string): string | undefined {
  const source = prompt.toLowerCase();
  if (source.includes("unit") || source.includes("measurement")) return "unit_as_label_only";
  if (source.includes("prefix") || source.includes("kilo") || source.includes("centi") || source.includes("milli")) return "prefix_scale_error";
  if (source.includes("precision") || source.includes("uncertainty") || source.includes("trust") || source.includes("ruler") || source.includes("caliper")) return "precision_trust_error";
  return undefined;
}

function resolvedAnswerIndex(item: UnknownRecord): number {
  const explicit = item.answer_index;
  if (typeof explicit === "number" && Number.isFinite(explicit)) return explicit;
  return fallbackMeta(item)?.answerIndex ?? -1;
}

function resolvedCorrectAnswer(item: UnknownRecord): string {
  const choices = asList(item.choices).map((choice) => text(choice));
  const correctIndex = resolvedAnswerIndex(item);
  if (correctIndex >= 0 && correctIndex < choices.length) return choices[correctIndex];

  const accepted = shortAnswerAccepted(item);
  if (accepted.length > 0) return accepted[0];

  return fallbackMeta(item)?.correctAnswer || "Review the lesson idea and try again.";
}

function resolvedExplanation(item: UnknownRecord, answerIndex: number): string {
  const feedback = asList(item.feedback).map((entry) => text(entry));
  if (answerIndex >= 0 && answerIndex < feedback.length && feedback[answerIndex]) {
    return feedback[answerIndex];
  }
  return text(item.hint) || fallbackMeta(item)?.explanation || "Review the lesson idea and try again.";
}

function shortAnswerAccepted(item: UnknownRecord): string[] {
  const accepted = asList(item.accepted_answers).map((entry) => text(entry)).filter(Boolean);
  const meta = fallbackMeta(item);
  const values = [...accepted, ...(meta?.acceptedAnswers || []), meta?.correctAnswer || ""]
    .map((entry) => text(entry).trim())
    .filter(Boolean);
  return [...new Set(values)];
}

function shortAnswerMatches(answer: unknown, acceptedAnswers: string[]): boolean {
  const candidate = normalizeOpenAnswer(answer);
  if (!candidate) return false;

  const compactCandidate = compactOpenAnswer(answer);
  const accepted = acceptedAnswers.map((entry) => normalizeOpenAnswer(entry));
  const compactAccepted = acceptedAnswers.map((entry) => compactOpenAnswer(entry));

  if (accepted.includes(candidate) || compactAccepted.includes(compactCandidate)) {
    return true;
  }

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
      : shortAnswerMatches(answer, acceptedAnswers);
  return {
    question_id: text(item.id),
    prompt,
    learner_answer: choices.length > 0 ? choiceLabel(item, answer) : text(answer).trim() || null,
    is_correct: isCorrect,
    correct_answer: resolvedCorrectAnswer(item),
    explanation: resolvedExplanation(item, answerIndex),
    teaching_focus: meta?.teachingFocus || teachingFocus(prompt, title),
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
  switch (lessonCode(lesson)) {
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
    default:
      return [];
  }
}

function masteryVariantsFromPool(items: UnknownRecord[], code: string): UnknownRecord[] {
  const prefixes = [
    "Apply the same lesson idea in a new check: ",
    "Use the rule carefully here: ",
    "Try the concept again in a fresh question: ",
    "Use the lesson idea one more time here: ",
  ];
  return items.flatMap((item, itemIndex) =>
    prefixes.map((prefix, prefixIndex) => ({
      ...asRecord(item),
      id: code + "_VAR_" + String(itemIndex + 1) + "_" + String(prefixIndex + 1),
      prompt: prefix + text(asRecord(item).prompt),
    }))
  );
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
function masteryItems(lesson: UnknownRecord): UnknownRecord[] {
  const seenIds = new Set<string>();
  const seenSources = new Set<string>();
  const generated = generatedMasteryItems(lesson);
  const fallback = [...itemsFrom(lesson, "transfer"), ...conceptGateItems(lesson)];
  const variants = masteryVariantsFromPool(fallback, lessonCode(lesson));
  const ordered = generated.length > 0 ? [...generated, ...fallback, ...variants] : [...fallback, ...variants];
  return ordered.filter((item) => {
    const record = asRecord(item);
    const id = text(record.id);
    const sourceKey = masterySourceKey(record);
    if (!id || seenIds.has(id) || (sourceKey && seenSources.has(sourceKey))) return false;
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

function postEvent(moduleId: string, lessonId: string, body: UnknownRecord): Promise<unknown> {
  return apipPost<unknown, JsonObject>(`/progress/${encodeURIComponent(moduleId)}/event`, {
    ...body,
    details: {
      lesson_id: normalizeLessonId(lessonId),
      ...asRecord(body.details),
    },
  } as JsonObject);
}

function scaffoldPayload(title: string, lesson: UnknownRecord, feedback: UnknownRecord[]): UnknownRecord {
  const repairs = feedback.filter((item) => item.is_correct !== true);
  const repairText = repairs.length > 0
    ? repairs.map((item) => (text(item.prompt) + " " + text(item.explanation)).trim()).join("\n")
    : "Your diagnostic was mostly secure, so this lesson widens out to the full sub-unit.";
  const analogyText = text(asRecord(phases(lesson).analogical_grounding).analogy_text);
  return {
    title,
    intro: "This lesson covers the whole sub-unit while giving extra attention to any ideas that still need work.",
    teaching_focus: dedupeText([...repairs.map((item) => text(item.teaching_focus)).filter(Boolean), ...itemsFrom(lesson, "diagnostic").map((item) => text(item.hint)).filter(Boolean), ...itemsFrom(lesson, "transfer").map((item) => text(item.hint)).filter(Boolean), ...asList(asRecord(phases(lesson).concept_reconstruction).capsules).map((capsule) => text(asRecord(capsule).prompt)).filter(Boolean), ...asList(asRecord(phases(lesson).analogical_grounding).micro_prompts).map((prompt) => text(asRecord(prompt).hint) || text(asRecord(prompt).prompt)).filter(Boolean), "Every measurement has two parts: a number and a unit.", "The unit tells what physical quantity the number belongs to.", "SI units are shared standards, so measurements can be compared anywhere.", "Prefixes such as kilo-, centi-, and milli- create larger or smaller versions of the same base unit.", "Convert by replacing the prefixed unit with its value in the base unit.", "Never compare or combine measurements until the units match."]),
    misconception_targets: repairs.map((item) => text(item.misconception_tag)).filter(Boolean),
    sections: [
      { heading: "Fix these ideas", body: repairText },
      { heading: "Core idea", body: lessonCode(lesson) === "F1_L1" ? "A scientific measurement only makes sense when the number, the unit, and the quantity stay together.\n\nA bare number does not tell the full story in physics. 5 could mean 5 metres, 5 seconds, or 5 kilograms. The unit gives the number meaning, and SI units make that meaning standard everywhere." : "Use the main rule from this lesson before you calculate or classify the quantity." },
      { heading: "Think of it like this", body: lessonCode(lesson) === "F1_L1" ? (analogyText || "Units work like money. One dollar, one cent, and one thousand dollars are all money, but they are not the same size. Prefixes do the same job for measurements: kilo- makes a larger unit, while centi- and milli- make smaller sub-units.") : (analogyText || "Use the shared idea from this lesson to decide what the quantity means before you answer.") },
      { heading: "Worked example", body: lessonCode(lesson) === "F1_L1" ? "Question: Convert 2.5 km to m. Then convert 35 cm to m." : "Question: Use the main idea from this lesson to solve a similar problem.", worked_example: lessonCode(lesson) === "F1_L1" ? { prompt: "How do we solve this step by step?", steps: ["Identify the prefix first. kilo- means 1000 times the base unit, while centi- means 1/100 of the base unit.", "Replace the prefixed unit with the base-unit relationship: 1 km = 1000 m and 1 cm = 0.01 m.", "Do the number change carefully: 2.5 x 1000 = 2500 and 35 x 0.01 = 0.35.", "Write each new value with the new unit before you compare or combine anything."], answer: "2.5 km = 2500 m and 35 cm = 0.35 m" } : { prompt: "What should you identify first?", steps: ["Name the quantity or idea being tested.", "Match it to the correct rule, unit, or relationship.", "Work step by step before choosing the answer."], answer: "Use the lesson idea first, then calculate or classify carefully." } },
    ],
    review_refs: reviewRefs(lesson),
  };
}

export async function getLessonRunner(moduleId: string, lessonId: string): Promise<UnknownRecord> {
  const resources = await loadResources(moduleId, lessonId);
  const runnerLesson = asRecord(resources.runner.lesson);
  const state = readState(moduleId, lessonId);
  const title = lessonTitle(resources.lesson, runnerLesson);
  const backendStage = text(runnerLesson.active_stage);
  const stage = (
    backendStage === "diagnostic" ||
    backendStage === "scaffolded_teaching" ||
    backendStage === "concept_gate" ||
    backendStage === "simulation" ||
    backendStage === "reflection" ||
    backendStage === "mastery_check" ||
    backendStage === "done"
  )
    ? backendStage
    : itemsFrom(resources.lesson, "diagnostic").length > 0
      ? "diagnostic"
      : "mastery_check";

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
        action_label: askedIds.length + 1 >= targetCount ? "Check this answer" : "Check and continue",
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
    stagePayload = {
      title: "Simulation inquiry",
      instructions: text(inquiry[0]?.prompt) || "Explore the activity and notice what changes as you test the idea.",
      task_prompt: text(inquiry[1]?.prompt) || text(inquiry[0]?.hint),
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
    const pool = masteryItems(resources.lesson);
    const strengthScore = masteryStrengthScore(runnerLesson, state);
    const count = masteryQuestionCount(masteryMeta, pool.length, strengthScore);
    const selected = shuffle(pool, `mastery:${masteryState.nonce || 0}`).slice(0, count);
    stagePayload = masteryState.submitted || stage === "done"
      ? {
          instructions: stage === "done" ? "You have already shown mastery for this lesson." : "Use the feedback below to decide whether to retest or review first.",
          questions: [],
          submitted: true,
          feedback: masteryState.feedback || [],
          result: masteryState.result || { percent: Math.round(numberValue(runnerLesson.best_score) * 100), passed: true },
          review_refs: masteryState.reviewRefs || reviewRefs(resources.lesson, asList(masteryMeta.recommended_review_refs)), review_requested: Boolean(asRecord(masteryState).reviewRequested),
          min_questions: numberValue(masteryMeta.min_questions, 5),
          max_questions: numberValue(masteryMeta.max_questions, 10),
          passing_percent: Math.round(numberValue(masteryMeta.threshold, 0.8) * 100),
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

  return {
    module_id: text(asRecord(resources.runner.module).module_id) || moduleId,
    lesson_id: text(runnerLesson.lesson_id) || normalizeLessonId(lessonId),
    lesson_title: title,
    lesson_status: text(runnerLesson.lesson_status) === "completed" ? "completed" : text(runnerLesson.lesson_status) === "not_started" ? "not_started" : "in_progress",
    active_stage: activeStage,
    stage_payload: stagePayload,
    progress_summary: {
      attempts: numberValue(asRecord(runnerLesson.mastery_check).attempt_count),
      mastery_percent: Math.round(numberValue(runnerLesson.best_score) * 100),
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
      mastery: { nonce: (state.mastery?.nonce || 0) + 1 },
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
    const selected = shuffle(pool, `mastery:${state.mastery?.nonce || 0}`).slice(0, count);
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


