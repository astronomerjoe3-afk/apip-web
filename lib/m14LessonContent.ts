"use client";

import {
  type M15QuestionVisualMeta,
  m15QuestionVisualMeta,
  m15ReflectionVisualCheck,
  m15ScaffoldCoreBullets,
  m15ScaffoldFocusExtras,
  m15ScaffoldMediaCards,
  m15SimulationCopy,
} from "./m15LessonContent";

type UnknownRecord = Record<string, unknown>;

export type M14QuestionVisualMeta = M15QuestionVisualMeta;

type M14SimulationCopy = NonNullable<ReturnType<typeof m15SimulationCopy>>;

function remapItemId(itemId: string): string {
  return String(itemId || "").replace(/^M14L/i, "M15L");
}

function remapLessonCode(code: string): string {
  return String(code || "").replace(/^M14_/i, "M15_");
}

export function m14QuestionVisualMeta(itemId: string): M14QuestionVisualMeta | undefined {
  return m15QuestionVisualMeta(remapItemId(itemId));
}

export function m14SimulationCopy(code: string): M14SimulationCopy | undefined {
  return m15SimulationCopy(remapLessonCode(code));
}

export function m14ScaffoldFocusExtras(code: string): string[] {
  return m15ScaffoldFocusExtras(remapLessonCode(code));
}

export function m14ScaffoldCoreBullets(code: string): string[] {
  return m15ScaffoldCoreBullets(remapLessonCode(code));
}

export function m14ScaffoldMediaCards(code: string): UnknownRecord[] {
  return m15ScaffoldMediaCards(remapLessonCode(code));
}

export function m14ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  return m15ReflectionVisualCheck(remapLessonCode(code));
}
