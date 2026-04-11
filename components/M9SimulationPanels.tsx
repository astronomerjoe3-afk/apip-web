import type { ReactNode } from "react";

import M10SimulationPanels from "./M10SimulationPanels";

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

function metricCard(title: string, value: string, tone: string): ReactNode {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
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

export default function M9SimulationPanels(props: Props) {
  const { lessonKey } = props;

  if (/^M9_L[1-5]$/.test(lessonKey)) {
    return (
      <M10SimulationPanels
        {...props}
        lessonKey={lessonKey.replace(/^M9_/, "M10_")}
      />
    );
  }

  if (lessonKey === "M9_L6") {
    const sourceVoltage = clamp(props.simMetricMeters, 6, 24);
    const resistorA = clamp(props.simDensityMass, 1, 12);
    const resistorB = clamp(props.simDensityVolume, 1, 12);
    const parallelMode = clamp(Math.round(props.simBias), 0, 1) === 1;

    const seriesCurrent = sourceVoltage / (resistorA + resistorB);
    const seriesDropA = seriesCurrent * resistorA;
    const seriesDropB = seriesCurrent * resistorB;

    const branchCurrentA = sourceVoltage / resistorA;
    const branchCurrentB = sourceVoltage / resistorB;
    const totalParallelCurrent = branchCurrentA + branchCurrentB;

    return renderPanel(
      "Series and parallel compare",
      <>
        {sliderField(
          "Route type",
          parallelMode ? "parallel branches" : "series chain",
          <input
            className="w-full"
            type="range"
            min="0"
            max="1"
            step="1"
            value={parallelMode ? 1 : 0}
            onChange={(e) => props.setSimBias(Number(e.target.value))}
          />,
        )}
        {sliderField(
          "Source voltage",
          `${props.formatSimulationNumber(sourceVoltage, 0)} V`,
          <input
            className="w-full"
            type="range"
            min="6"
            max="24"
            step="1"
            value={sourceVoltage}
            onChange={(e) => props.setSimMetricMeters(Number(e.target.value))}
          />,
        )}
        {sliderField(
          parallelMode ? "Branch A resistance" : "Series resistor A",
          `${props.formatSimulationNumber(resistorA, 1)} ohm`,
          <input
            className="w-full"
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={resistorA}
            onChange={(e) => props.setSimDensityMass(Number(e.target.value))}
          />,
        )}
        {sliderField(
          parallelMode ? "Branch B resistance" : "Series resistor B",
          `${props.formatSimulationNumber(resistorB, 1)} ohm`,
          <input
            className="w-full"
            type="range"
            min="1"
            max="12"
            step="0.5"
            value={resistorB}
            onChange={(e) => props.setSimDensityVolume(Number(e.target.value))}
          />,
        )}
      </>,
      "Circuit comparison board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill={parallelMode ? "#ecfdf5" : "#eff6ff"} />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          {parallelMode
            ? "Parallel branches share the same voltage"
            : "Series chains keep one common current"}
        </text>
        {parallelMode ? (
          <>
            <line x1="126" y1="90" x2="126" y2="184" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <line x1="520" y1="90" x2="520" y2="184" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <line x1="126" y1="90" x2="520" y2="90" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
            <line x1="126" y1="184" x2="520" y2="184" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
            <rect x="236" y="72" width="86" height="36" rx="14" fill="#dbeafe" />
            <rect x="348" y="166" width="86" height="36" rx="14" fill="#bbf7d0" />
            <text x="268" y="96" fill="#1e3a8a" fontSize="18" fontWeight="700">A</text>
            <text x="380" y="190" fill="#166534" fontSize="18" fontWeight="700">B</text>
            <text x="190" y="136" fill="#475569" fontSize="16">same two junctions {"->"} same branch voltage</text>
          </>
        ) : (
          <>
            <rect x="78" y="106" width="40" height="54" rx="10" fill="#f59e0b" />
            <path d="M118 132H228" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <rect x="228" y="96" width="96" height="72" rx="16" fill="#dbeafe" />
            <path d="M324 132H420" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <rect x="420" y="96" width="96" height="72" rx="16" fill="#bfdbfe" />
            <path d="M516 132H572" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <text x="86" y="92" fill="#b45309" fontSize="16">source</text>
            <text x="268" y="139" fill="#1e3a8a" fontSize="18" fontWeight="700">A</text>
            <text x="460" y="139" fill="#1d4ed8" fontSize="18" fontWeight="700">B</text>
            <text x="170" y="198" fill="#475569" fontSize="16">one uninterrupted path {"->"} same current everywhere</text>
          </>
        )}
      </svg>,
      parallelMode ? (
        <>
          {metricCard("Branch voltage", `${props.formatSimulationNumber(sourceVoltage, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
          {metricCard("Current in A", `${props.formatSimulationNumber(branchCurrentA, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
          {metricCard("Current in B", `${props.formatSimulationNumber(branchCurrentB, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
          {metricCard("Total current", `${props.formatSimulationNumber(totalParallelCurrent, 2)} A`, "border-amber-200 bg-amber-50 text-amber-900")}
        </>
      ) : (
        <>
          {metricCard("Series current", `${props.formatSimulationNumber(seriesCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
          {metricCard("Drop across A", `${props.formatSimulationNumber(seriesDropA, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
          {metricCard("Drop across B", `${props.formatSimulationNumber(seriesDropB, 2)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
          {metricCard("Total resistance", `${props.formatSimulationNumber(resistorA + resistorB, 2)} ohm`, "border-amber-200 bg-amber-50 text-amber-900")}
        </>
      ),
      [
        "Decide first whether the route is one path or a branching network.",
        parallelMode
          ? "In parallel, the branch voltage stays the same while the current splits."
          : "In series, the same current passes through every component in turn.",
        "Do not use the series rule on a parallel circuit or the parallel rule on a series circuit.",
      ],
      parallelMode
        ? "This comparison keeps the branch-voltage rule and the junction-current rule visible together, so the network is read from shared junctions rather than from page layout."
        : "This comparison keeps the one-path rule clear: resistances add in series, the source current is common, and the supply voltage is shared across the chain.",
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      Each M9 lesson should now own a circuits explorer directly. If you see this fallback, the M9 lesson key is missing a dedicated electrical panel.
    </div>
  );
}
