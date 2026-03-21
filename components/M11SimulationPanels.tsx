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

export default function M11SimulationPanels({
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
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M11_L1") {
    const sourceVoltage = clamp(simMetricMeters, 6, 24);
    const resistorA = clamp(simDensityMass, 1, 12);
    const resistorB = clamp(simDensityVolume, 1, 12);
    const resistorC = clamp(simSpread, 0, 12);
    const totalResistance = resistorA + resistorB + resistorC;
    const current = sourceVoltage / totalResistance;
    const dropA = current * resistorA;
    const dropB = current * resistorB;
    const dropC = current * resistorC;
    return renderPanel(
      "Series chain",
      <>
        {sliderField("Source voltage", `${formatSimulationNumber(sourceVoltage, 0)} V`, <input className="w-full" type="range" min="6" max="24" step="1" value={sourceVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Station A drag", `${formatSimulationNumber(resistorA, 1)} ohm`, <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistorA} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Station B drag", `${formatSimulationNumber(resistorB, 1)} ohm`, <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistorB} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Station C drag", `${formatSimulationNumber(resistorC, 1)} ohm`, <input className="w-full" type="range" min="0" max="12" step="0.5" value={resistorC} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "One-lane chain board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#eff6ff" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">One uninterrupted path means one common current</text>
        <rect x="78" y="106" width="40" height="54" rx="10" fill="#f59e0b" />
        <path d="M118 132H210" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
        <rect x="210" y="96" width="78" height="72" rx="16" fill="#c7d2fe" />
        <path d="M288 132H354" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
        <rect x="354" y="96" width="78" height="72" rx="16" fill="#bfdbfe" />
        <path d="M432 132H498" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
        <rect x="498" y="96" width="78" height="72" rx="16" fill="#dbeafe" />
        <text x="84" y="92" fill="#b45309" fontSize="16">source</text>
        <text x="228" y="137" fill="#1e3a8a" fontSize="18" fontWeight="700">R1</text>
        <text x="372" y="137" fill="#1e40af" fontSize="18" fontWeight="700">R2</text>
        <text x="516" y="137" fill="#1d4ed8" fontSize="18" fontWeight="700">R3</text>
        <text x="116" y="196" fill="#475569" fontSize="16">same current all along the chain</text>
      </svg>,
      <>
        {metricCard("Total resistance", `${formatSimulationNumber(totalResistance, 2)} ohm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Series current", `${formatSimulationNumber(current, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Drop at A", `${formatSimulationNumber(dropA, 2)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Drop at B + C", `${formatSimulationNumber(dropB + dropC, 2)} V`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["One route means one common current.", "Series drags add before the total current step.", "Voltage is shared across the series stations."],
      "This explorer keeps the series current story and the shared-voltage story visible at the same time so the two do not get collapsed.",
    );
  }

  if (lessonKey === "M11_L2") {
    const sourceVoltage = clamp(simMetricMeters, 6, 24);
    const branchA = clamp(simDensityMass, 1, 12);
    const branchB = clamp(simDensityVolume, 1, 12);
    const branchCurrentA = sourceVoltage / branchA;
    const branchCurrentB = sourceVoltage / branchB;
    const totalCurrent = branchCurrentA + branchCurrentB;
    return renderPanel(
      "Branch deck",
      <>
        {sliderField("Source voltage", `${formatSimulationNumber(sourceVoltage, 0)} V`, <input className="w-full" type="range" min="6" max="24" step="1" value={sourceVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Branch A drag", `${formatSimulationNumber(branchA, 1)} ohm`, <input className="w-full" type="range" min="1" max="12" step="0.5" value={branchA} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Branch B drag", `${formatSimulationNumber(branchB, 1)} ohm`, <input className="w-full" type="range" min="1" max="12" step="0.5" value={branchB} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Branch deck board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#ecfdf5" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Same two junctions give the same branch voltage</text>
        <line x1="112" y1="92" x2="112" y2="182" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
        <line x1="532" y1="92" x2="532" y2="182" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
        <line x1="112" y1="92" x2="532" y2="92" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <line x1="112" y1="182" x2="532" y2="182" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <rect x="244" y="74" width="86" height="36" rx="14" fill="#dbeafe" />
        <rect x="344" y="164" width="86" height="36" rx="14" fill="#bbf7d0" />
        <text x="274" y="98" fill="#1e3a8a" fontSize="18" fontWeight="700">A</text>
        <text x="375" y="188" fill="#166534" fontSize="18" fontWeight="700">B</text>
        <text x="168" y="138" fill="#475569" fontSize="16">shared branch voltage</text>
      </svg>,
      <>
        {metricCard("Branch voltage", `${formatSimulationNumber(sourceVoltage, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Current in A", `${formatSimulationNumber(branchCurrentA, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Current in B", `${formatSimulationNumber(branchCurrentB, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Total current", `${formatSimulationNumber(totalCurrent, 2)} A`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Parallel branches share the same voltage.", "Different branch drag gives different branch current.", "Branch currents add again at the rejoin point."],
      "The branch deck keeps voltage-sharing and current-splitting on separate readouts so students do not import the series rule into parallel circuits.",
    );
  }

  if (lessonKey === "M11_L3") {
    const stationCurrent = clamp(simVectorMagnitude, 0.5, 8);
    const stationVoltage = clamp(simMetricMeters, 1, 20);
    const power = stationCurrent * stationVoltage;
    const energyPerSecond = power;
    return renderPanel(
      "Shed rate",
      <>
        {sliderField("Station current", `${formatSimulationNumber(stationCurrent, 1)} A`, <input className="w-full" type="range" min="0.5" max="8" step="0.1" value={stationCurrent} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Station voltage drop", `${formatSimulationNumber(stationVoltage, 1)} V`, <input className="w-full" type="range" min="1" max="20" step="0.5" value={stationVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Task-station board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#fff7ed" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Power tracks how much energy the station sheds each second</text>
        <rect x="246" y="84" width="148" height="92" rx="24" fill="#fed7aa" />
        <text x="280" y="138" fill="#9a3412" fontSize="24" fontWeight="700">P = IV</text>
        <text x="86" y="138" fill="#1d4ed8" fontSize="20" fontWeight="700">current</text>
        <text x="452" y="138" fill="#166534" fontSize="20" fontWeight="700">voltage drop</text>
        <text x="212" y="198" fill="#475569" fontSize="16">more flow and or more drop gives more shed rate</text>
      </svg>,
      <>
        {metricCard("Current", `${formatSimulationNumber(stationCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Voltage drop", `${formatSimulationNumber(stationVoltage, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Power", `${formatSimulationNumber(power, 2)} W`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Energy each second", `${formatSimulationNumber(energyPerSecond, 2)} J/s`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Power is energy transferred each second.", "The same current can still give different power if the voltage drop differs.", "Brightness and heating are shed-rate stories."],
      "This board keeps power tied to J/s and P = IV so students can compare stations by energy-transfer rate rather than by a vague idea of used-up current.",
    );
  }

  if (lessonKey === "M11_L4") {
    const branchMode = clamp(Math.round(simBias), 0, 1) === 1;
    return renderPanel(
      "Route map",
      <>
        {sliderField("Map mode", branchMode ? "branch deck" : "one-lane chain", <input className="w-full" type="range" min="0" max="1" step="1" value={branchMode ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Route-map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#f8fafc" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Read the schematic from junctions and paths, not from page layout</text>
        {branchMode ? (
          <>
            <circle cx="146" cy="126" r="8" fill="#1d4ed8" />
            <circle cx="496" cy="126" r="8" fill="#1d4ed8" />
            <path d="M146 126H240V82H402V126H496" stroke="#16a34a" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M146 126H240V170H402V126H496" stroke="#7c3aed" strokeWidth="8" fill="none" strokeLinecap="round" />
            <text x="210" y="74" fill="#166534" fontSize="16">branch A</text>
            <text x="210" y="196" fill="#6d28d9" fontSize="16">branch B</text>
          </>
        ) : (
          <>
            <path d="M120 126H520" stroke="#1d4ed8" strokeWidth="8" fill="none" strokeLinecap="round" />
            <rect x="214" y="104" width="66" height="42" rx="12" fill="#dbeafe" />
            <rect x="362" y="104" width="66" height="42" rx="12" fill="#bfdbfe" />
            <text x="236" y="131" fill="#1e3a8a" fontSize="16" fontWeight="700">R1</text>
            <text x="384" y="131" fill="#1e40af" fontSize="16" fontWeight="700">R2</text>
          </>
        )}
        <text x="178" y="214" fill="#475569" fontSize="16">{branchMode ? "same two junctions -> parallel branch deck" : "one uninterrupted path -> series chain"}</text>
      </svg>,
      <>
        {metricCard("Reading move", "mark junctions first", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Current structure", branchMode ? "splits across branches" : "one common current path", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Voltage clue", branchMode ? "same across branches" : "shared across series stations", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Map purpose", "symbolic connection logic", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Schematics are symbolic route maps.", "Shared junctions define parallel sections.", "One uninterrupted path defines a series section."],
      "This explorer makes the route-map reading process explicit so students identify the circuit structure from the connections instead of from the drawing style.",
    );
  }

  if (lessonKey === "M11_L5") {
    const sourceVoltage = clamp(simMetricMeters, 6, 24);
    const healthyResistance = clamp(simDensityMass, 2, 12);
    const faultOn = clamp(Math.round(simBias), 0, 1) === 1;
    const guardLimit = clamp(simVectorMagnitude, 1, 12);
    const effectiveResistance = faultOn ? 0.5 : healthyResistance;
    const current = sourceVoltage / effectiveResistance;
    const tripped = current > guardLimit;
    return renderPanel(
      "Guard link",
      <>
        {sliderField("Source voltage", `${formatSimulationNumber(sourceVoltage, 0)} V`, <input className="w-full" type="range" min="6" max="24" step="1" value={sourceVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Normal route drag", `${formatSimulationNumber(healthyResistance, 1)} ohm`, <input className="w-full" type="range" min="2" max="12" step="0.5" value={healthyResistance} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Fault bridge", faultOn ? "on" : "off", <input className="w-full" type="range" min="0" max="1" step="1" value={faultOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Guard-link rating", `${formatSimulationNumber(guardLimit, 1)} A`, <input className="w-full" type="range" min="1" max="12" step="0.5" value={guardLimit} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Safety board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#fef2f2" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">A low-resistance fault path can drive unsafe current</text>
        <path d="M92 128H198" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <rect x="198" y="108" width="48" height="40" rx="10" fill={tripped ? "#fecaca" : "#bbf7d0"} />
        <path d="M246 128H372" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <rect x="372" y="96" width="86" height="64" rx="16" fill="#dbeafe" />
        <text x="205" y="134" fill="#0f172a" fontSize="16" fontWeight="700">{tripped ? "open" : "guard"}</text>
        <text x="393" y="134" fill="#1e3a8a" fontSize="18" fontWeight="700">load</text>
        {faultOn ? <path d="M92 128C184 50 456 50 548 128" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 10" fill="none" /> : null}
        <text x="90" y="206" fill="#475569" fontSize="16">{faultOn ? "fault bridge gives a dangerous shortcut" : "normal protected path"}</text>
      </svg>,
      <>
        {metricCard("Effective resistance", `${formatSimulationNumber(effectiveResistance, 2)} ohm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Current", `${formatSimulationNumber(current, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Guard-link status", tripped ? "tripped open" : "still closed", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Safety message", faultOn ? "fault path present" : "no fault path", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Short circuits create dangerous low-resistance shortcuts.", "A fuse or breaker protects by opening the circuit.", "Insulation protects in a different way by blocking contact."],
      "The safety board shows why fault paths matter so much: a large current comes from the whole network condition, not just from the battery label alone.",
    );
  }

  if (lessonKey === "M11_L6") {
    const sourceVoltage = clamp(simMetricMeters, 6, 24);
    const seriesDrag = clamp(simDensityMass, 1, 10);
    const parallelA = clamp(simDensityVolume, 1, 10);
    const parallelB = clamp(simSpread, 1, 10);
    const parallelEquivalent = 1 / (1 / parallelA + 1 / parallelB);
    const totalResistance = seriesDrag + parallelEquivalent;
    const totalCurrent = sourceVoltage / totalResistance;
    return renderPanel(
      "Equivalent drag",
      <>
        {sliderField("Source voltage", `${formatSimulationNumber(sourceVoltage, 0)} V`, <input className="w-full" type="range" min="6" max="24" step="1" value={sourceVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Series drag", `${formatSimulationNumber(seriesDrag, 1)} ohm`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={seriesDrag} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Branch A drag", `${formatSimulationNumber(parallelA, 1)} ohm`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={parallelA} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Branch B drag", `${formatSimulationNumber(parallelB, 1)} ohm`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={parallelB} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Reduction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill="#f5f3ff" />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Reduce one valid block at a time until one total drag remains</text>
        <rect x="88" y="108" width="76" height="40" rx="12" fill="#ddd6fe" />
        <path d="M164 128H240" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <path d="M240 128V90H404V128" stroke="#16a34a" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M240 128V166H404V128" stroke="#7c3aed" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M404 128H520" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
        <text x="106" y="134" fill="#5b21b6" fontSize="16" fontWeight="700">series</text>
        <text x="286" y="82" fill="#166534" fontSize="16">A</text>
        <text x="286" y="188" fill="#6d28d9" fontSize="16">B</text>
        <text x="186" y="214" fill="#475569" fontSize="16">first reduce the branch pair, then add the series drag</text>
      </svg>,
      <>
        {metricCard("Parallel equivalent", `${formatSimulationNumber(parallelEquivalent, 2)} ohm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Total resistance", `${formatSimulationNumber(totalResistance, 2)} ohm`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Total current", `${formatSimulationNumber(totalCurrent, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Method", "reduce, redraw, repeat", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Equivalent resistance means one effective drag for the whole network.", "Mixed circuits are reduced step by step.", "The final total resistance unlocks the source-current step."],
      "This reduction board keeps the structure visible while the numbers collapse, so students do not jump straight to adding everything without checking the network logic.",
    );
  }

  return renderPanel(
    "Switchyard loop",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">Pick a Module 11 lesson to load its lesson-specific explorer.</div>,
    "Explorer placeholder",
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
      M11 explorers are lesson-owned: choose a series, parallel, power, diagram, safety, or reduction lesson to load the matching board.
    </div>,
    <>
      {metricCard("Status", "waiting for lesson key", "border-slate-200 bg-slate-50 text-slate-900")}
    </>,
    ["Each M11 lesson uses its own network board.", "The fallback panel is only a placeholder, not a disguised lesson."],
    "This neutral fallback keeps Module 11 from silently borrowing a different lesson's explorer.",
  );
}
