"use client";

import type { M12QuestionVisualMeta } from "./m12LessonContent";
import {
  m12QuestionVisualMeta,
  m12ReflectionVisualCheck,
  m12ScaffoldCoreBullets,
  m12ScaffoldFocusExtras,
  m12ScaffoldMediaCards,
  m12SimulationCopy,
} from "./m12LessonContent";

type UnknownRecord = Record<string, unknown>;

export type M10QuestionVisualMeta = M12QuestionVisualMeta;

type M10SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
};

function remapM10ItemId(itemId: string): string {
  return itemId.toUpperCase().replace(/^M10L/, "M12L");
}

function remapM10Code(code: string): string {
  return code.replace(/^M10_/, "M12_");
}

export function m10QuestionVisualMeta(itemId: string): M10QuestionVisualMeta | undefined {
  return m12QuestionVisualMeta(remapM10ItemId(itemId));
}

export function m10SimulationCopy(code: string): M10SimulationCopy | undefined {
  return m12SimulationCopy(remapM10Code(code));
}

export function m10ScaffoldFocusExtras(code: string): string[] {
  return m12ScaffoldFocusExtras(remapM10Code(code));
}

export function m10ScaffoldCoreBullets(code: string): string[] {
  return m12ScaffoldCoreBullets(remapM10Code(code));
}

export function m10ScaffoldMediaCards(code: string): UnknownRecord[] {
  return m12ScaffoldMediaCards(remapM10Code(code));
}

export function m10ReflectionVisualCheck(code: string): UnknownRecord | undefined {
  return m12ReflectionVisualCheck(remapM10Code(code));
}
