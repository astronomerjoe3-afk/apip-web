type QuestionVisualMeta = {
  image_url: string;
  visual_title: string;
  visual_caption: string;
  visual_callouts: string[];
};

type SimulationCopy = {
  title: string;
  instructions: string;
  taskPrompt: string;
  exploreSteps: string[];
  watchFor: string[];
  tryFirst: string;
  takeaway: string;
} | undefined;

export function a4SimulationCopy(_lessonCode: string): SimulationCopy {
  return undefined;
}

export function a4ScaffoldCoreBullets(_lessonCode: string): string[] {
  return [];
}

export function a4ScaffoldFocusExtras(_lessonCode: string): string[] {
  return [];
}

export function a4ScaffoldMediaCards(_lessonCode: string): Record<string, unknown>[] {
  return [];
}

export function a4ReflectionVisualCheck(_lessonCode: string): Record<string, unknown> | undefined {
  return undefined;
}

export function a4QuestionVisualMeta(_lessonCode: string): QuestionVisualMeta | undefined {
  return undefined;
}
