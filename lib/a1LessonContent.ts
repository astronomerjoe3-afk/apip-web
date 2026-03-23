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

export function a1SimulationCopy(_lessonCode: string): SimulationCopy {
  return undefined;
}

export function a1ScaffoldCoreBullets(_lessonCode: string): string[] {
  return [];
}

export function a1ScaffoldFocusExtras(_lessonCode: string): string[] {
  return [];
}

export function a1ScaffoldMediaCards(_lessonCode: string): Record<string, unknown>[] {
  return [];
}

export function a1ReflectionVisualCheck(_lessonCode: string): Record<string, unknown> | undefined {
  return undefined;
}

export function a1QuestionVisualMeta(_lessonCode: string): QuestionVisualMeta | undefined {
  return undefined;
}
