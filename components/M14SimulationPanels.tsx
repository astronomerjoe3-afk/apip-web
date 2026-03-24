import type { ComponentProps } from "react";

import M15SimulationPanels from "./M15SimulationPanels";

type Props = ComponentProps<typeof M15SimulationPanels>;

function remapLessonKey(lessonKey: string): string {
  return String(lessonKey || "").replace(/^M14_/i, "M15_");
}

export default function M14SimulationPanels(props: Props) {
  return <M15SimulationPanels {...props} lessonKey={remapLessonKey(props.lessonKey)} />;
}
