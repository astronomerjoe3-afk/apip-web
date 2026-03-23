"use client";

import lessonData from "./a6ToA11LessonContentData.json";

type UnknownRecord = Record<string, unknown>;

export type A6ToA11QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type LessonEntry = {
  slug: string;
  lessonTitle: string;
  visualTitle: string;
  visualCaption: string;
  visualCallouts: string[];
  tryFirst: string;
  takeaway: string;
};

type A6ToA11SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

const LESSONS = lessonData as Record<string, LessonEntry>;

function normalizeLessonCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase();
}

function assetPath(code: string, slug: string): string {
  const moduleId = normalizeLessonCode(code).split("_")[0];
  return `/lesson_assets/${moduleId}/${normalizeLessonCode(code)}/diagrams/${slug}.svg`;
}

function lessonFromQuestionItem(itemId: string): [string, LessonEntry] | undefined {
  const match = String(itemId || "").toUpperCase().match(/^(A(?:6|7|8|9|10|11))L([1-6])_[A-Z]+\d+$/);
  if (!match) return undefined;
  const code = `${match[1]}_L${match[2]}`;
  const lesson = LESSONS[code];
  return lesson ? [code, lesson] : undefined;
}

function lessonFromCode(code: string): [string, LessonEntry] | undefined {
  const normalized = normalizeLessonCode(code);
  const lesson = LESSONS[normalized];
  return lesson ? [normalized, lesson] : undefined;
}

function simulationTitleFor(lesson: LessonEntry): string {
  return `${lesson.lessonTitle} explorer`;
}

function simulationInstructionsFor(lesson: LessonEntry): string {
  return `${lesson.visualCaption} Use the board to compare the named quantities before you compress the idea into a formal relation.`;
}

function simulationTaskPromptFor(lesson: LessonEntry): string {
  const firstCallout = lesson.visualCallouts[0] ?? lesson.takeaway;
  return `Change one main variable, then explain why ${firstCallout.charAt(0).toLowerCase()}${firstCallout.slice(1)}`;
}

function exploreStepsFor(lesson: LessonEntry): string[] {
  const [first, second, third] = lesson.visualCallouts;
  return [
    `Start with the baseline ${lesson.lessonTitle.toLowerCase()} case and read the main comparison first.`,
    first ?? "Compare the first key relationship on the board.",
    second ?? third ?? "State what changes and what stays fixed in the comparison.",
  ];
}

export function a6ToA11QuestionVisualMeta(itemId: string): A6ToA11QuestionVisualMeta | undefined {
  const resolved = lessonFromQuestionItem(itemId);
  if (!resolved) return undefined;
  const [code, lesson] = resolved;
  return {
    image_url: assetPath(code, lesson.slug),
    visual_title: lesson.visualTitle,
    visual_caption: lesson.visualCaption,
    visual_callouts: [...lesson.visualCallouts],
  };
}

export function a6ToA11SimulationCopy(code: string): A6ToA11SimulationCopy | undefined {
  const resolved = lessonFromCode(code);
  if (!resolved) return undefined;
  const [, lesson] = resolved;
  return {
    title: simulationTitleFor(lesson),
    instructions: simulationInstructionsFor(lesson),
    taskPrompt: simulationTaskPromptFor(lesson),
    exploreSteps: exploreStepsFor(lesson),
    watchFor: [...lesson.visualCallouts],
    tryFirst: lesson.tryFirst,
    takeaway: lesson.takeaway,
  };
}

export function a6ToA11ScaffoldFocusExtras(code: string): string[] {
  const resolved = lessonFromCode(code);
  return resolved ? [...resolved[1].visualCallouts] : [];
}

export function a6ToA11ScaffoldCoreBullets(code: string): string[] {
  const resolved = lessonFromCode(code);
  return resolved ? [...resolved[1].visualCallouts] : [];
}

export function a6ToA11ScaffoldMediaCards(code: string): UnknownRecord[] {
  const resolved = lessonFromCode(code);
  if (!resolved) return [];
  const [lessonCode, lesson] = resolved;
  return [
    {
      kind: "visual",
      title: lesson.visualTitle,
      caption: lesson.visualCaption,
      image_url: assetPath(lessonCode, lesson.slug),
      highlights: [...lesson.visualCallouts],
    },
  ];
}

export function a6ToA11ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  const resolved = lessonFromCode(code);
  if (!resolved) return undefined;
  const [lessonCode, lesson] = resolved;
  return {
    title: lesson.visualTitle,
    prompt: `Use this lesson board in your reflection and explain why ${lesson.takeaway.charAt(0).toLowerCase()}${lesson.takeaway.slice(1)}`,
    image_url: assetPath(lessonCode, lesson.slug),
    callouts: [...lesson.visualCallouts],
  };
}
