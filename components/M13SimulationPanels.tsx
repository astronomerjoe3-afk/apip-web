import type { ReactNode } from "react";

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

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sliderField(label: string, value: string, input: ReactNode): ReactNode {
  return (
    <label className="mt-4 block">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-700">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold tabular-nums text-slate-900">
          {value}
        </span>
      </div>
      <div className="mt-2">{input}</div>
    </label>
  );
}

function metricCard(title: string, value: string, tone: string): ReactNode {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function renderPanel(
  title: string,
  controls: ReactNode,
  boardTitle: string,
  board: ReactNode,
  readings: ReactNode,
  lens: string[],
  note: string,
): ReactNode {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(360px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
          {controls}
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Reasoning lens</h4>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700">
            {lens.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid gap-4">
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">{boardTitle}</h4>
          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">{board}</div>
        </div>
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );
}

function elementNameFromZ(z: number): string {
  const table: Record<number, string> = {
    1: "Hydrogen",
    2: "Helium",
    6: "Carbon",
    8: "Oxygen",
    11: "Sodium",
    12: "Magnesium",
    13: "Aluminium",
    14: "Silicon",
    15: "Phosphorus",
    17: "Chlorine",
    20: "Calcium",
    26: "Iron",
    82: "Lead",
    84: "Polonium",
    86: "Radon",
    88: "Radium",
    92: "Uranium",
  };
  return table[Math.round(z)] ?? `Element Z=${Math.round(z)}`;
}

type SignalInfo = {
  color: string;
  daughterA: number;
  daughterZ: number;
  emission: string;
  name: string;
  penetration: string;
  shield: string;
};

function signalInfo(signalIndex: number, parentA: number, parentZ: number): SignalInfo {
  if (signalIndex === 0) {
    return {
      name: "Chunk Burst",
      emission: "alpha",
      color: "#f97316",
      daughterA: parentA - 4,
      daughterZ: parentZ - 2,
      penetration: "lowest penetration",
      shield: "paper or skin blocks it",
    };
  }
  if (signalIndex === 1) {
    return {
      name: "Switch Spark",
      emission: "beta-minus",
      color: "#38bdf8",
      daughterA: parentA,
      daughterZ: parentZ + 1,
      penetration: "medium penetration",
      shield: "foil or plastic blocks it",
    };
  }
  return {
    name: "Glow Flash",
    emission: "gamma",
    color: "#a78bfa",
    daughterA: parentA,
    daughterZ: parentZ,
    penetration: "highest penetration",
    shield: "lead or concrete weakens it best",
  };
}

function shieldOutcome(signalIndex: number, shieldIndex: number): string {
  if (signalIndex === 0) {
    return shieldIndex === 0 ? "stopped" : "more than enough shielding";
  }
  if (signalIndex === 1) {
    if (shieldIndex === 0) {
      return "still leaks through";
    }
    return shieldIndex === 1 ? "stopped" : "well blocked";
  }
  if (shieldIndex === 2) {
    return "greatly reduced";
  }
  return "still gets through strongly";
}

export default function M13SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simDensityMass,
  setSimDensityMass,
  simDensityVolume,
  setSimDensityVolume,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M13_L1") {
    const protonCount = Math.round(clamp(simMetricMeters, 1, 20));
    const neutronCount = Math.round(clamp(simDensityMass, 0, 24));
    const electronCount = Math.round(clamp(simDensityVolume, 0, 24));
    const massNumber = protonCount + neutronCount;
    const charge = protonCount - electronCount;
    const orbitPositions = [
      [320, 42],
      [394, 64],
      [446, 122],
      [430, 194],
      [366, 236],
      [274, 236],
      [210, 194],
      [194, 122],
      [246, 64],
      [320, 18],
      [424, 92],
      [424, 152],
    ] as const;
    const visibleElectrons = Math.min(electronCount, orbitPositions.length);
    const chargeLabel =
      charge === 0 ? "neutral atom" : charge > 0 ? `${charge}+ ion` : `${Math.abs(charge)}- ion`;

    return renderPanel(
      "Build the Vault-House",
      <>
        {sliderField(
          "Badge count (protons)",
          `${protonCount}`,
          <input className="w-full" type="range" min="1" max="20" step="1" value={protonCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Stone count (neutrons)",
          `${neutronCount}`,
          <input className="w-full" type="range" min="0" max="24" step="1" value={neutronCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Orbit count (electrons)",
          `${electronCount}`,
          <input className="w-full" type="range" min="0" max="24" step="1" value={electronCount} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Vault-house board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#eef2ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Identity stays in the Core Vault even when the Orbit Ring changes
        </text>
        <circle cx="320" cy="130" r="102" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray="10 10" />
        <circle cx="320" cy="130" r="56" fill="#0f172a" stroke="#334155" strokeWidth="4" />
        <text x="320" y="122" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle">
          Core Vault
        </text>
        <text x="320" y="148" fill="#cbd5e1" fontSize="16" textAnchor="middle">
          P = {protonCount} | N = {neutronCount}
        </text>
        <text x="454" y="68" fill="#334155" fontSize="18" fontWeight="700">
          Orbit Ring
        </text>
        <line x1="442" y1="74" x2="396" y2="94" stroke="#475569" strokeWidth="3" />
        {Array.from({ length: visibleElectrons }).map((_, index) => {
          const [x, y] = orbitPositions[index];
          return <circle key={`${x}-${y}`} cx={x} cy={y} r="9" fill="#facc15" />;
        })}
        {electronCount > visibleElectrons ? (
          <text x="176" y="210" fill="#b45309" fontSize="16">
            +{electronCount - visibleElectrons} more electrons
          </text>
        ) : null}
        <rect x="72" y="82" width="118" height="74" rx="18" fill="#dcfce7" />
        <text x="131" y="112" fill="#166534" fontSize="18" fontWeight="700" textAnchor="middle">
          Z = {protonCount}
        </text>
        <text x="131" y="138" fill="#166534" fontSize="16" textAnchor="middle">
          fixes the element
        </text>
        <rect x="72" y="166" width="118" height="48" rx="18" fill="#dbeafe" />
        <text x="131" y="196" fill="#1d4ed8" fontSize="18" fontWeight="700" textAnchor="middle">
          A = {massNumber}
        </text>
        <rect x="454" y="164" width="126" height="50" rx="18" fill="#fef3c7" />
        <text x="517" y="194" fill="#92400e" fontSize="18" fontWeight="700" textAnchor="middle">
          {chargeLabel}
        </text>
      </svg>,
      <>
        {metricCard("Element family", elementNameFromZ(protonCount), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Atomic number Z", `${protonCount}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Mass number A", `${massNumber}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Charge state", chargeLabel, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Badge count sets the element identity.",
        "Stone count changes mass number without changing the element.",
        "Electron changes affect charge state, not the element itself.",
      ],
      "This board keeps the nucleus story and the electron story visible at the same time so radioactivity stays anchored in the Core Vault.",
    );
  }

  if (lessonKey === "M13_L2") {
    const badgeCount = Math.round(clamp(simMetricMeters, 2, 18));
    const leftStones = Math.round(clamp(simDensityMass, 0, 24));
    const rightStones = Math.round(clamp(simDensityVolume, 0, 24));
    const restlessRight = clamp(Math.round(simBias), 0, 1) === 1;
    const leftA = badgeCount + leftStones;
    const rightA = badgeCount + rightStones;

    return renderPanel(
      "Same-Badge Sort",
      <>
        {sliderField(
          "Shared badge count",
          `${badgeCount}`,
          <input className="w-full" type="range" min="2" max="18" step="1" value={badgeCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Vault A stones",
          `${leftStones}`,
          <input className="w-full" type="range" min="0" max="24" step="1" value={leftStones} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Vault B stones",
          `${rightStones}`,
          <input className="w-full" type="range" min="0" max="24" step="1" value={rightStones} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
        {sliderField(
          "Vault B stability",
          restlessRight ? "restless" : "stable",
          <input className="w-full" type="range" min="0" max="1" step="1" value={restlessRight ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Isotope family board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#ecfdf5" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Same badge count keeps the element; changing stones changes the isotope
        </text>
        <rect x="74" y="82" width="212" height="118" rx="24" fill="#0f172a" stroke="#22c55e" strokeWidth="3" />
        <rect x="354" y="82" width="212" height="118" rx="24" fill="#0f172a" stroke={restlessRight ? "#ef4444" : "#22c55e"} strokeWidth="3" />
        <text x="180" y="112" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle">
          Vault A
        </text>
        <text x="460" y="112" fill="#f8fafc" fontSize="20" fontWeight="700" textAnchor="middle">
          Vault B
        </text>
        <text x="180" y="144" fill="#93c5fd" fontSize="18" textAnchor="middle">
          Z = {badgeCount}, A = {leftA}
        </text>
        <text x="460" y="144" fill="#93c5fd" fontSize="18" textAnchor="middle">
          Z = {badgeCount}, A = {rightA}
        </text>
        <text x="180" y="172" fill="#bbf7d0" fontSize="18" textAnchor="middle">
          {leftStones} stones | stable
        </text>
        <text x="460" y="172" fill={restlessRight ? "#fecaca" : "#bbf7d0"} fontSize="18" textAnchor="middle">
          {rightStones} stones | {restlessRight ? "restless" : "stable"}
        </text>
        <line x1="286" y1="140" x2="354" y2="140" stroke="#0ea5e9" strokeWidth="5" />
        <polygon points="354,140 336,130 336,150" fill="#0ea5e9" />
        <text x="320" y="128" fill="#0369a1" fontSize="16" textAnchor="middle">
          same element
        </text>
        <text x="320" y="164" fill="#475569" fontSize="16" textAnchor="middle">
          neutron balance changes stability
        </text>
      </svg>,
      <>
        {metricCard("Element family", elementNameFromZ(badgeCount), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Vault A isotope", `A = ${leftA}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Vault B isotope", `A = ${rightA}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Shared rule", "same Z = same element", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Check badge count before anything else.",
        "Different stone counts change A, not the element family.",
        "Stability can differ even when the element stays the same.",
      ],
      "This comparison board makes isotope family and isotope stability visible as two separate stories so learners do not merge them into one label.",
    );
  }

  if (lessonKey === "M13_L3") {
    const signalIndex = Math.round(clamp(simBias, 0, 2));
    const parentZ = Math.round(clamp(simMetricMeters, 6, 92));
    const neutronCount = Math.round(clamp(simDensityMass, 4, 146));
    const parentA = parentZ + neutronCount;
    const shieldIndex = Math.round(clamp(simDensityVolume, 0, 2));
    const shields = ["paper", "foil", "lead"];
    const signal = signalInfo(signalIndex, parentA, parentZ);

    return renderPanel(
      "Escape Signal Lab",
      <>
        {sliderField(
          "Escape signal",
          signal.name,
          <input className="w-full" type="range" min="0" max="2" step="1" value={signalIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Parent badge count",
          `${parentZ}`,
          <input className="w-full" type="range" min="6" max="92" step="1" value={parentZ} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Parent stone count",
          `${neutronCount}`,
          <input className="w-full" type="range" min="4" max="146" step="1" value={neutronCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Shield choice",
          shields[shieldIndex],
          <input className="w-full" type="range" min="0" max="2" step="1" value={shieldIndex} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Signal and shielding board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#fff7ed" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Count change and shielding depend on what actually leaves the restless vault
        </text>
        <circle cx="136" cy="136" r="48" fill="#111827" stroke="#475569" strokeWidth="4" />
        <text x="136" y="128" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="middle">
          parent
        </text>
        <text x="136" y="152" fill="#cbd5e1" fontSize="14" textAnchor="middle">
          A={parentA} Z={parentZ}
        </text>
        <line x1="190" y1="136" x2="300" y2="136" stroke={signal.color} strokeWidth="8" />
        <polygon points="300,136 280,124 280,148" fill={signal.color} />
        <text x="248" y="118" fill={signal.color} fontSize="18" fontWeight="700" textAnchor="middle">
          {signal.emission}
        </text>
        <rect x="322" y="98" width="76" height="76" rx="18" fill="#e5e7eb" stroke="#94a3b8" strokeWidth="3" />
        <text x="360" y="128" fill="#334155" fontSize="18" fontWeight="700" textAnchor="middle">
          {shields[shieldIndex]}
        </text>
        <text x="360" y="152" fill="#475569" fontSize="14" textAnchor="middle">
          shield
        </text>
        <line
          x1="398"
          y1="136"
          x2={signalIndex === 0 && shieldIndex === 0 ? 430 : signalIndex === 1 && shieldIndex > 0 ? 430 : signalIndex === 2 && shieldIndex === 2 ? 466 : 520}
          y2="136"
          stroke={signal.color}
          strokeWidth="8"
          strokeDasharray={signalIndex === 2 ? "10 8" : undefined}
        />
        <circle cx="544" cy="136" r="46" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
        <text x="544" y="128" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="middle">
          daughter
        </text>
        <text x="544" y="152" fill="#cbd5e1" fontSize="14" textAnchor="middle">
          A={signal.daughterA} Z={signal.daughterZ}
        </text>
        <text x="320" y="206" fill="#475569" fontSize="16" textAnchor="middle">
          {signal.penetration} | {signal.shield}
        </text>
      </svg>,
      <>
        {metricCard("Emission", signal.emission, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Daughter numbers", `A=${signal.daughterA}, Z=${signal.daughterZ}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Shield result", shieldOutcome(signalIndex, shieldIndex), "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Penetration", signal.penetration, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Alpha changes both A and Z because a 2P + 2N chunk leaves.",
        "Beta-minus raises Z by 1 while A stays the same.",
        "Gamma changes the energy state, not the nuclear counts.",
      ],
      "This lab keeps count change, shielding, and penetration on the same board so alpha, beta, and gamma stay clearly distinct.",
    );
  }

  if (lessonKey === "M13_L4") {
    const initialCount = Math.round(clamp(simMetricMeters, 32, 256));
    const settleSpans = Math.round(clamp(simDensityMass, 0, 4));
    const halfLifeHours = clamp(simVectorMagnitude, 1, 8);
    const remainingCount = Math.round(initialCount / 2 ** settleSpans);
    const elapsedTime = settleSpans * halfLifeHours;
    const fractions = [1, 0.5, 0.25, 0.125, 0.0625];

    return renderPanel(
      "Settle Span Arena",
      <>
        {sliderField(
          "Starting crowd",
          `${initialCount} vaults`,
          <input className="w-full" type="range" min="32" max="256" step="16" value={initialCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Settle spans passed",
          `${settleSpans}`,
          <input className="w-full" type="range" min="0" max="4" step="1" value={settleSpans} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Half-life duration",
          `${formatSimulationNumber(halfLifeHours, 1)} h`,
          <input className="w-full" type="range" min="1" max="8" step="0.5" value={halfLifeHours} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
      </>,
      "Population-halving board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#eff6ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Equal intervals halve the crowd that remains
        </text>
        {fractions.map((fraction, index) => {
          const x = 90 + index * 108;
          const height = 120 * fraction;
          const y = 194 - height;
          const count = Math.round(initialCount * fraction);
          const highlight = index === settleSpans;
          return (
            <g key={index}>
              <rect x={x} y={y} width="54" height={height} rx="14" fill={highlight ? "#ef4444" : "#60a5fa"} opacity={highlight ? 0.9 : 0.75} />
              <text x={x + 27} y="214" fill="#334155" fontSize="14" textAnchor="middle">
                {index} span
              </text>
              <text x={x + 27} y={y - 10} fill={highlight ? "#991b1b" : "#1d4ed8"} fontSize="14" textAnchor="middle">
                {count}
              </text>
            </g>
          );
        })}
        <text x="320" y="84" fill="#475569" fontSize="16" textAnchor="middle">
          single nuclei are random, but the crowd trend is predictable
        </text>
      </svg>,
      <>
        {metricCard("Remaining crowd", `${remainingCount}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Remaining fraction", `1 / ${2 ** settleSpans || 1}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Elapsed time", `${formatSimulationNumber(elapsedTime, 1)} h`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Single-vault rule", "random decay moment", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Half-life is a crowd rule, not a personal timer.",
        "Equal intervals halve what remains, not the same fixed number.",
        "Counts, fractions, and elapsed time should all tell the same story.",
      ],
      "The bar pattern makes the halving trend visible while the readout keeps the randomness of single nuclei separate from the predictability of the group.",
    );
  }

  if (lessonKey === "M13_L5") {
    const baseBackground = Math.round(clamp(simMetricMeters, 5, 24));
    const sourceLevel = Math.round(clamp(simDensityMass, 0, 50));
    const locationIndex = Math.round(clamp(simBias, 0, 2));
    const locationLabels = ["classroom", "mountain", "granite hillside"];
    const locationBoost = [0, 6, 10];
    const background = baseBackground + locationBoost[locationIndex];
    const measured = background + sourceLevel;

    return renderPanel(
      "Ambient Buzz Detective",
      <>
        {sliderField(
          "Base background",
          `${baseBackground} cpm`,
          <input className="w-full" type="range" min="5" max="24" step="1" value={baseBackground} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Source strength",
          `${sourceLevel} cpm`,
          <input className="w-full" type="range" min="0" max="50" step="1" value={sourceLevel} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Location mode",
          locationLabels[locationIndex],
          <input className="w-full" type="range" min="0" max="2" step="1" value={locationIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Detector field board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#ecfeff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Background is always present, so the detector is rarely silent
        </text>
        <rect x="246" y="88" width="148" height="92" rx="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        <text x="320" y="122" fill="#f8fafc" fontSize="22" fontWeight="700" textAnchor="middle">
          Detector
        </text>
        <text x="320" y="154" fill="#fde68a" fontSize="20" textAnchor="middle">
          {measured} cpm
        </text>
        <text x="110" y="96" fill="#0369a1" fontSize="18">
          cosmic rays
        </text>
        <line x1="160" y1="102" x2="246" y2="118" stroke="#38bdf8" strokeWidth="4" />
        <text x="94" y="198" fill="#0369a1" fontSize="18">
          rocks + soil
        </text>
        <line x1="166" y1="186" x2="246" y2="154" stroke="#38bdf8" strokeWidth="4" />
        <text x="470" y="94" fill="#0369a1" fontSize="18">
          air + buildings
        </text>
        <line x1="458" y1="102" x2="394" y2="118" stroke="#38bdf8" strokeWidth="4" />
        {sourceLevel > 0 ? (
          <>
            <circle cx="514" cy="182" r="20" fill="#f97316" />
            <text x="514" y="188" fill="#fff7ed" fontSize="14" fontWeight="700" textAnchor="middle">
              src
            </text>
            <line x1="494" y1="168" x2="394" y2="154" stroke="#f97316" strokeWidth="4" />
          </>
        ) : null}
        <text x="320" y="210" fill="#475569" fontSize="16" textAnchor="middle">
          location mode: {locationLabels[locationIndex]}
        </text>
      </svg>,
      <>
        {metricCard("Measured rate", `${measured} cpm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Background rate", `${background} cpm`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Source-only rate", `${sourceLevel} cpm`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Inference", sourceLevel > 0 ? "subtract first, then conclude" : "non-zero can still be normal", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "A raw reading mixes background with any source you add.",
        "Background varies with location and conditions.",
        "A non-zero reading does not automatically mean contamination.",
      ],
      "This board keeps normal background and added source counts on separate channels so practical detector reasoning stays grounded.",
    );
  }

  if (lessonKey === "M13_L6") {
    const decayIndex = Math.round(clamp(simBias, 0, 2));
    const parentZ = Math.round(clamp(simMetricMeters, 6, 92));
    const neutronCount = Math.round(clamp(simDensityMass, 4, 146));
    const parentA = parentZ + neutronCount;
    const outcome = signalInfo(decayIndex, parentA, parentZ);
    const elementChange = outcome.daughterZ === parentZ ? "same element" : "different element";

    return renderPanel(
      "Vault Ledger Boss",
      <>
        {sliderField(
          "Decay type",
          outcome.emission,
          <input className="w-full" type="range" min="0" max="2" step="1" value={decayIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Parent atomic number",
          `${parentZ}`,
          <input className="w-full" type="range" min="6" max="92" step="1" value={parentZ} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Parent neutron count",
          `${neutronCount}`,
          <input className="w-full" type="range" min="4" max="146" step="1" value={neutronCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "Decay-ledger board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="24" width="580" height="208" rx="28" fill="#f8fafc" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          The ledger is correct only when both A and Z balance across the arrow
        </text>
        <rect x="64" y="94" width="154" height="84" rx="22" fill="#0f172a" />
        <text x="141" y="124" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="middle">
          parent nucleus
        </text>
        <text x="141" y="152" fill="#cbd5e1" fontSize="18" textAnchor="middle">
          A={parentA}, Z={parentZ}
        </text>
        <line x1="228" y1="136" x2="324" y2="136" stroke="#38bdf8" strokeWidth="6" />
        <polygon points="324,136 306,126 306,146" fill="#38bdf8" />
        <rect x="354" y="94" width="154" height="84" rx="22" fill="#0f172a" />
        <text x="431" y="124" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="middle">
          daughter nucleus
        </text>
        <text x="431" y="152" fill="#cbd5e1" fontSize="18" textAnchor="middle">
          A={outcome.daughterA}, Z={outcome.daughterZ}
        </text>
        <rect x="522" y="106" width="70" height="58" rx="16" fill={outcome.color} />
        <text x="557" y="142" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">
          {outcome.emission}
        </text>
        <text x="320" y="204" fill="#475569" fontSize="16" textAnchor="middle">
          {outcome.emission} keeps the ledger balanced in a different way from the other signals
        </text>
      </svg>,
      <>
        {metricCard("Parent numbers", `A=${parentA}, Z=${parentZ}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Daughter numbers", `A=${outcome.daughterA}, Z=${outcome.daughterZ}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Ledger check", "both counts tracked", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Element result", elementChange, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Alpha changes both A and Z.",
        "Beta-minus changes Z but keeps A the same.",
        "Gamma keeps both numbers the same because it is energy only.",
      ],
      "The equation board keeps the daughter nucleus and the emitted radiation on one line so balancing feels like bookkeeping for a real physical event.",
    );
  }

  return null;
}
