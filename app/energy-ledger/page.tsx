import type { Metadata } from "next";

import EnergyLedgerWorkspaceClient from "./EnergyLedgerWorkspaceClient";

export const metadata: Metadata = {
  title: "Energy Ledger Workspace",
  description:
    "Use Cognispark's public energy ledger workspace to compare stores, work hand-offs, power, efficiency, and mission-stage energy planning before signup.",
  alternates: {
    canonical: "/energy-ledger",
  },
  openGraph: {
    url: "/energy-ledger",
    title: "Cognispark Energy Ledger Workspace",
    description:
      "A no-login energy tool for store tracking, work hand-offs, efficiency, power, and multi-stage mission planning.",
  },
};

export default function EnergyLedgerWorkspacePage() {
  return <EnergyLedgerWorkspaceClient />;
}
