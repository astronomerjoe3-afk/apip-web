import type { Metadata } from "next";

import ForceSystemBuilderClient from "./ForceSystemBuilderClient";

export const metadata: Metadata = {
  title: "Force System Builder",
  description:
    "Use Cognispark's public force system builder to compare resultants, third-law pairs, torque, and stability before signup.",
  alternates: {
    canonical: "/force-builder",
  },
  openGraph: {
    url: "/force-builder",
    title: "Cognispark Force System Builder",
    description:
      "A no-login mechanics tool for resultant force, pair-force comparison, torque, and stability reasoning.",
  },
};

export default function ForceBuilderPage() {
  return <ForceSystemBuilderClient />;
}
