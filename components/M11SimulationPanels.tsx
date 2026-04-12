"use client";

type Props = {
  lessonKey: string;
  simMetricMeters: number;
  setSimMetricMeters: (value: number) => void;
  simVectorMagnitude: number;
  setSimVectorMagnitude: (value: number) => void;
  simVectorAngle: number;
  setSimVectorAngle: (value: number) => void;
  simDensityMass: number;
  setSimDensityMass: (value: number) => void;
  simDensityVolume: number;
  setSimDensityVolume: (value: number) => void;
  simFluidDensity: number;
  setSimFluidDensity: (value: number) => void;
  simBias: number;
  setSimBias: (value: number) => void;
  simSpread: number;
  setSimSpread: (value: number) => void;
  formatSimulationNumber: (value: number, digits?: number) => string;
};

type LegacyPanelMeta = {
  title: string;
  description: string;
  simUrl: string;
  checks: string[];
  note: string;
};

const LEGACY_M11_PANELS: Record<string, LegacyPanelMeta> = {
  M11_L1: {
    title: "Atomic structure vault lab",
    description: "Adjust proton, neutron, and electron counts while keeping element identity, mass number, and charge as separate ideas.",
    simUrl: "/lesson_assets/M13/M13_L1/simulations/m13_core_vault_lab/index.html",
    checks: [
      "Proton number fixes the element identity.",
      "Mass number counts protons and neutrons together.",
      "Changing electrons changes charge, not the element.",
    ],
    note: "This legacy atomic simulator is intentionally kept for M11 while the dedicated M11 media namespace is rebuilt.",
  },
  M11_L2: {
    title: "Isotope comparison lab",
    description: "Hold proton number steady, vary neutron number, and compare isotope identity with isotope stability.",
    simUrl: "/lesson_assets/M13/M13_L2/simulations/m13_same_badge_lab/index.html",
    checks: [
      "Same proton number means same element.",
      "Different neutron number changes the isotope.",
      "Stability is a separate question from identity.",
    ],
    note: "The simulator keeps isotope identity and isotope stability visibly separate.",
  },
  M11_L3: {
    title: "Radiation type lab",
    description: "Switch between alpha, beta-minus, and gamma while comparing nuclear changes, penetration, and shielding.",
    simUrl: "/lesson_assets/M13/M13_L3/simulations/m13_escape_signal_lab/index.html",
    checks: [
      "Alpha changes both mass number and atomic number.",
      "Beta-minus changes atomic number while mass number stays fixed.",
      "Gamma changes nuclear energy state without changing the counts.",
    ],
    note: "This keeps emitted radiation, ledger change, and shielding requirement tied together.",
  },
  M11_L4: {
    title: "Half-life arena",
    description: "Run equal half-life intervals and compare remaining count, remaining fraction, and elapsed time.",
    simUrl: "/lesson_assets/M13/M13_L4/simulations/m13_settle_span_lab/index.html",
    checks: [
      "Half-life halves what remains, not a fixed amount.",
      "Large samples show a predictable halving trend.",
      "The number lost each interval shrinks as the sample shrinks.",
    ],
    note: "The group-halving picture is the key bridge from random single decay to measurable population behavior.",
  },
  M11_L5: {
    title: "Background subtraction lab",
    description: "Measure background first, then compare measured count rate with corrected source count rate.",
    simUrl: "/lesson_assets/M13/M13_L5/simulations/m13_ambient_buzz_lab/index.html",
    checks: [
      "Background radiation is a normal environmental signal.",
      "Corrected source count = measured count - background count.",
      "A non-zero detector reading alone is not enough evidence.",
    ],
    note: "Detector reasoning stays stronger when background and source are not mixed into one vague reading.",
  },
  M11_L6: {
    title: "Decay-ledger lab",
    description: "Balance decay equations by tracking parent nucleus, daughter nucleus, emitted radiation, and both conserved counts.",
    simUrl: "/lesson_assets/M13/M13_L6/simulations/m13_vault_ledger_lab/index.html",
    checks: [
      "Mass number must balance across the equation.",
      "Atomic number must also balance across the equation.",
      "The emitted radiation is part of the bookkeeping.",
    ],
    note: "This preserves M11's nuclear-equation practice without depending on the corrected Earth-and-Solar-System M13 surface.",
  },
};

export default function M11SimulationPanels({ lessonKey }: Props) {
  const panel = LEGACY_M11_PANELS[lessonKey];
  if (!panel) return null;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
        <h3 className="text-xl font-semibold text-slate-900">{panel.title}</h3>
        <p className="mt-2 max-w-4xl text-base text-slate-600">{panel.description}</p>
        <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-950">
          <iframe
            key={panel.simUrl}
            src={panel.simUrl}
            title={panel.title}
            className="h-[760px] w-full bg-white"
            loading="lazy"
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
        <h4 className="text-lg font-semibold text-slate-900">What to verify</h4>
        <ul className="mt-4 grid gap-3 text-sm text-slate-700">
          {panel.checks.map((item) => (
            <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {panel.note}
        </p>
      </section>
    </div>
  );
}
