import type { Metadata } from "next";

import GraphReasoningLabClient from "./GraphReasoningLabClient";

export const metadata: Metadata = {
  title: "Graph Reasoning Lab",
  description:
    "Use Cognispark's public graph reasoning lab to explore distance-time and speed-time meaning, compare slope across graph types, and build area-under-graph understanding before signup.",
  alternates: {
    canonical: "/graph-lab",
  },
  openGraph: {
    url: "/graph-lab",
    title: "Cognispark Graph Reasoning Lab",
    description:
      "A no-login graph reasoning tool with live physics explorers, instant checks, and clearer motion understanding.",
  },
};

export default function GraphLabPage() {
  return <GraphReasoningLabClient />;
}
