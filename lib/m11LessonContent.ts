"use client";

import {
  m13QuestionVisualMeta,
  m13ReflectionVisualCheck,
  m13ScaffoldCoreBullets,
  m13ScaffoldFocusExtras,
  m13ScaffoldMediaCards,
  m13SimulationCopy,
} from "./m13LessonContent";

type UnknownRecord = Record<string, unknown>;

export type M11QuestionVisualMeta = Exclude<ReturnType<typeof m13QuestionVisualMeta>, undefined>;
type M11SimulationCopy = Exclude<ReturnType<typeof m13SimulationCopy>, undefined>;

function remapItemId(itemId: string): string {
  return String(itemId || "").trim().replace(/-/g, "_").toUpperCase().replace(/^M11L/, "M13L");
}

function remapCode(code: string): string {
  return String(code || "").trim().replace(/-/g, "_").toUpperCase().replace(/^M11_/, "M13_");
}

export function m11QuestionVisualMeta(itemId: string): M11QuestionVisualMeta | undefined {
  return m13QuestionVisualMeta(remapItemId(itemId));
}

export function m11SimulationCopy(code: string): M11SimulationCopy | undefined {
  return m13SimulationCopy(remapCode(code));
}

export function m11ScaffoldFocusExtras(code: string): string[] {
  return m13ScaffoldFocusExtras(remapCode(code));
}

export function m11ScaffoldCoreBullets(code: string): string[] {
  return m13ScaffoldCoreBullets(remapCode(code));
}

export function m11ScaffoldMediaCards(code: string): UnknownRecord[] {
  return m13ScaffoldMediaCards(remapCode(code));
}

export function m11ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  return m13ReflectionVisualCheck(remapCode(code));
}
