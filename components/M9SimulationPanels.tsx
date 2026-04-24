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

function scientificText(value: number): string {
  return value.toExponential(2);
}

export default function M9SimulationPanels(props: Props) {
  const { lessonKey } = props;

  if (lessonKey === "M9_L1") {
    const sourceVoltage = clamp(props.simMetricMeters, 3, 24);
    const lampResistance = clamp(props.simDensityMass, 1, 12);
    const motorResistance = clamp(props.simDensityVolume, 1, 12);
    const switchClosed = clamp(Math.round(props.simBias), 0, 1) === 1;
    const totalResistance = lampResistance + motorResistance;
    const loopCurrent = switchClosed ? sourceVoltage / totalResistance : 0;
    const chargeInFiveSeconds = loopCurrent * 5;

    return renderPanel(
      "Complete-loop ledger",
      <>
        {sliderField(
          "Switch state",
          switchClosed ? "closed" : "open",
          <input className="w-full" type="range" min="0" max="1" step="1" value={switchClosed ? 1 : 0} onChange={(e) => props.setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Source voltage",
          `${props.formatSimulationNumber(sourceVoltage, 0)} V`,
          <input className="w-full" type="range" min="3" max="24" step="1" value={sourceVoltage} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Lamp resistance",
          `${props.formatSimulationNumber(lampResistance, 1)} ohm`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={lampResistance} onChange={(e) => props.setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Motor resistance",
          `${props.formatSimulationNumber(motorResistance, 1)} ohm`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={motorResistance} onChange={(e) => props.setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Simple-loop board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill={switchClosed ? "#eff6ff" : "#fff7ed"} />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          {switchClosed ? "Closed route: same current at every checkpoint" : "Open route: the path is broken so steady current collapses"}
        </text>
        <rect x="90" y="100" width="40" height="60" rx="10" fill="#f59e0b" />
        <text x="96" y="92" fill="#b45309" fontSize="16">cell</text>
        <path d="M130 130H220" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <circle cx="200" cy="130" r="18" fill="#dbeafe" stroke="#2563eb" strokeWidth="4" />
        <text x="193" y="137" fill="#1e3a8a" fontSize="18" fontWeight="700">A1</text>
        <rect x="240" y="92" width="100" height="76" rx="18" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
        <text x="270" y="138" fill="#92400e" fontSize="20" fontWeight="700">lamp</text>
        <path d="M340 130H460" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <path d={switchClosed ? "M460 130H520" : "M460 130H490"} stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <path d={switchClosed ? "M520 130V180" : "M506 114L532 146"} stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        {!switchClosed ? <path d="M520 180V146" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" /> : null}
        <path d={switchClosed ? "M520 180H448" : "M520 180H430"} stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <rect x="290" y="164" width="112" height="34" rx="16" fill="#bfdbfe" />
        <text x="316" y="187" fill="#1d4ed8" fontSize="18" fontWeight="700">motor</text>
        <circle cx="430" cy="180" r="18" fill="#dbeafe" stroke="#2563eb" strokeWidth="4" />
        <text x="423" y="187" fill="#1e3a8a" fontSize="18" fontWeight="700">A2</text>
        <path d="M290 180H130V160" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <text x="146" y="214" fill="#475569" fontSize="16">
          same route {"->"} same current | component drops {"->"} energy transfer
        </text>
      </svg>,
      <>
        {metricCard("Current at A1", `${props.formatSimulationNumber(loopCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Current at A2", `${props.formatSimulationNumber(loopCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Energy per coulomb", switchClosed ? `${props.formatSimulationNumber(sourceVoltage, 1)} J/C` : "0 J/C", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Charge in 5 s", `${props.formatSimulationNumber(chargeInFiveSeconds, 2)} C`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "A simple loop keeps one common current all the way around the route.",
        "Opening the route kills the steady current even though charge carriers remain in the metal.",
        "Components transfer energy while the charge continues to circulate.",
      ],
      "This board keeps the route condition and the current equality visible together, which is the quickest way to correct the idea that current gets used up.",
    );
  }

  if (lessonKey === "M9_L2") {
    const charge = clamp(props.simMetricMeters, 0.5, 40);
    const time = clamp(props.simVectorMagnitude, 0.5, 20);
    const current = charge / time;
    const slowerCaseCurrent = charge / (time * 2);
    const electronCount = charge / 1.6e-19;

    return renderPanel(
      "Checkpoint rate",
      <>
        {sliderField(
          "Charge passed",
          `${props.formatSimulationNumber(charge, 1)} C`,
          <input className="w-full" type="range" min="0.5" max="40" step="0.5" value={charge} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Time interval",
          `${props.formatSimulationNumber(time, 1)} s`,
          <input className="w-full" type="range" min="0.5" max="20" step="0.5" value={time} onChange={(e) => props.setSimVectorMagnitude(Number(e.target.value))} />,
        )}
      </>,
      "Checkpoint board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#ecfeff" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          Current asks how much charge passes one checkpoint each second
        </text>
        <line x1="96" y1="128" x2="544" y2="128" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <line x1="320" y1="78" x2="320" y2="188" stroke="#0f172a" strokeWidth="6" strokeDasharray="10 10" />
        <text x="290" y="70" fill="#0f172a" fontSize="16">checkpoint</text>
        {Array.from({ length: 6 }).map((_, index) => (
          <circle key={index} cx={118 + index * 64} cy="128" r="14" fill="#38bdf8" />
        ))}
        <text x="108" y="198" fill="#475569" fontSize="16">
          amount and time must stay together {"->"} ampere = coulomb per second
        </text>
      </svg>,
      <>
        {metricCard("Current", `${props.formatSimulationNumber(current, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Charge per second", `${props.formatSimulationNumber(current, 2)} C/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Electron count", scientificText(electronCount), "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Same charge in double time", `${props.formatSimulationNumber(slowerCaseCurrent, 2)} A`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "A large charge does not automatically mean a large current because time also matters.",
        "1 A is exactly 1 C of charge passing a point every second.",
        "The same charge spread over longer time gives a smaller current.",
      ],
      "This explorer turns amperes back into coulombs per second so the symbol keeps its checkpoint-rate meaning instead of becoming a detached label.",
    );
  }

  if (lessonKey === "M9_L3") {
    const sourceVoltage = clamp(props.simMetricMeters, 3, 24);
    const componentVoltage = clamp(props.simVectorMagnitude, 0.5, sourceVoltage);
    const charge = clamp(props.simDensityMass, 0.5, 10);
    const sourceEnergy = sourceVoltage * charge;
    const componentEnergy = componentVoltage * charge;
    const remainingEnergy = Math.max(sourceVoltage - componentVoltage, 0) * charge;

    return renderPanel(
      "Energy-per-charge lift",
      <>
        {sliderField(
          "Source voltage",
          `${props.formatSimulationNumber(sourceVoltage, 0)} V`,
          <input className="w-full" type="range" min="3" max="24" step="1" value={sourceVoltage} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Component voltage",
          `${props.formatSimulationNumber(componentVoltage, 1)} V`,
          <input className="w-full" type="range" min="0.5" max={String(sourceVoltage)} step="0.5" value={componentVoltage} onChange={(e) => props.setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Charge moved",
          `${props.formatSimulationNumber(charge, 1)} C`,
          <input className="w-full" type="range" min="0.5" max="10" step="0.5" value={charge} onChange={(e) => props.setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "Voltage share board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#f5f3ff" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          The source gives energy per coulomb, and components take defined shares of it
        </text>
        <rect x="92" y="88" width="74" height="90" rx="18" fill="#fde68a" />
        <text x="112" y="134" fill="#92400e" fontSize="18" fontWeight="700">cell</text>
        <path d="M166 132H282" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round" />
        <rect x="282" y="94" width="108" height="76" rx="18" fill="#ddd6fe" />
        <text x="304" y="137" fill="#5b21b6" fontSize="20" fontWeight="700">lamp</text>
        <path d="M390 132H528" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round" />
        <text x="94" y="202" fill="#475569" fontSize="16">
          source energy = component drop + rest-of-loop drop for the same charge
        </text>
      </svg>,
      <>
        {metricCard("Source energy", `${props.formatSimulationNumber(sourceEnergy, 2)} J`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Component energy", `${props.formatSimulationNumber(componentEnergy, 2)} J`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Remaining loop energy", `${props.formatSimulationNumber(remainingEnergy, 2)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Energy per coulomb in lamp", `${props.formatSimulationNumber(componentVoltage, 1)} J/C`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Voltage is read as joules transferred to or from each coulomb.",
        "The same amount of charge can transfer different total energies at different voltages.",
        "Source voltage and component voltage belong to the same loop-energy ledger.",
      ],
      "This panel keeps voltage tied to the energy-per-charge story, which makes source values and component drops feel like one coherent circuit account rather than isolated numbers.",
    );
  }

  if (lessonKey === "M9_L4") {
    const supplyVoltage = clamp(props.simMetricMeters, 1, 12);
    const materialFactor = clamp(props.simVectorMagnitude, 0.5, 3);
    const length = clamp(props.simDensityMass, 1, 10);
    const area = clamp(props.simDensityVolume, 0.5, 5);
    const relativeResistance = (materialFactor * length) / area;
    const routeCurrent = supplyVoltage / relativeResistance;
    const doubledLengthResistance = (materialFactor * length * 2) / area;
    const doubledAreaResistance = (materialFactor * length) / (area * 2);

    return renderPanel(
      "Resistance route designer",
      <>
        {sliderField(
          "Supply voltage",
          `${props.formatSimulationNumber(supplyVoltage, 0)} V`,
          <input className="w-full" type="range" min="1" max="12" step="1" value={supplyVoltage} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Material factor",
          `${props.formatSimulationNumber(materialFactor, 2)}`,
          <input className="w-full" type="range" min="0.5" max="3" step="0.1" value={materialFactor} onChange={(e) => props.setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Route length",
          `${props.formatSimulationNumber(length, 1)} units`,
          <input className="w-full" type="range" min="1" max="10" step="0.5" value={length} onChange={(e) => props.setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Cross-sectional area",
          `${props.formatSimulationNumber(area, 1)} units`,
          <input className="w-full" type="range" min="0.5" max="5" step="0.5" value={area} onChange={(e) => props.setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Route-property board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#fef2f2" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          Resistance rises with longer routes and falls with wider routes for the same material
        </text>
        <rect x="90" y={118 - area * 5} width={60 + length * 28} height={20 + area * 10} rx="14" fill="#fb7185" />
        <rect x="90" y={118 - area * 5} width={22 + materialFactor * 18} height={20 + area * 10} rx="14" fill="#ef4444" opacity="0.5" />
        <text x="98" y="198" fill="#475569" fontSize="16">
          route factor = material x length / area
        </text>
      </svg>,
      <>
        {metricCard("Relative resistance", `${props.formatSimulationNumber(relativeResistance, 2)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Current on same source", `${props.formatSimulationNumber(routeCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("If length doubles", `${props.formatSimulationNumber(doubledLengthResistance, 2)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("If area doubles", `${props.formatSimulationNumber(doubledAreaResistance, 2)}`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Resistance belongs to the route or component, not to the source.",
        "For the same material, doubling length doubles resistance.",
        "For the same material, doubling area halves resistance.",
      ],
      "This route designer makes the material-and-geometry story explicit before the current response is discussed, which keeps resistance explanations precise instead of vague.",
    );
  }

  if (lessonKey === "M9_L5") {
    const voltage = clamp(props.simMetricMeters, 0, 24);
    const nominalResistance = clamp(props.simDensityMass, 1, 12);
    const ohmicMode = clamp(Math.round(props.simBias), 0, 1) === 1;
    const current = ohmicMode
      ? voltage / nominalResistance
      : voltage / (nominalResistance * (1 + voltage / 12));
    const doubledVoltage = Math.min(voltage * 2, 24);
    const doubledVoltageCurrent = ohmicMode
      ? doubledVoltage / nominalResistance
      : doubledVoltage / (nominalResistance * (1 + doubledVoltage / 12));
    const effectiveResistance = voltage > 0.2 ? voltage / current : nominalResistance;
    const graphPoints = Array.from({ length: 7 }, (_, index) => {
      const pointVoltage = index * 4;
      const pointCurrent = ohmicMode
        ? pointVoltage / nominalResistance
        : pointVoltage / (nominalResistance * (1 + pointVoltage / 12));
      const x = 120 + (pointVoltage / 24) * 360;
      const y = 190 - (Math.min(pointCurrent, 8) / 8) * 110;
      return `${x},${y}`;
    }).join(" ");

    return renderPanel(
      "I-V characteristic",
      <>
        {sliderField(
          "Mode",
          ohmicMode ? "ohmic" : "non-ohmic",
          <input className="w-full" type="range" min="0" max="1" step="1" value={ohmicMode ? 1 : 0} onChange={(e) => props.setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Applied voltage",
          `${props.formatSimulationNumber(voltage, 1)} V`,
          <input className="w-full" type="range" min="0" max="24" step="1" value={voltage} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Nominal resistance",
          `${props.formatSimulationNumber(nominalResistance, 1)} ohm`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={nominalResistance} onChange={(e) => props.setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "I-V graph board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill={ohmicMode ? "#eef2ff" : "#fef3c7"} />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          {ohmicMode ? "Ohmic mode: straight origin line means constant resistance" : "Non-ohmic mode: curve means the effective resistance is changing"}
        </text>
        <line x1="112" y1="190" x2="520" y2="190" stroke="#0f172a" strokeWidth="4" />
        <line x1="120" y1="200" x2="120" y2="74" stroke="#0f172a" strokeWidth="4" />
        <polyline points={graphPoints} fill="none" stroke={ohmicMode ? "#2563eb" : "#d97706"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={120 + (voltage / 24) * 360} cy={190 - (Math.min(current, 8) / 8) * 110} r="8" fill="#0f172a" />
        <text x="474" y="208" fill="#475569" fontSize="16">voltage</text>
        <text x="84" y="86" fill="#475569" fontSize="16">current</text>
      </svg>,
      <>
        {metricCard("Current", `${props.formatSimulationNumber(current, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Effective resistance", `${props.formatSimulationNumber(effectiveResistance, 2)} ohm`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("If voltage doubles", `${props.formatSimulationNumber(doubledVoltageCurrent, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Graph cue", ohmicMode ? "straight through origin" : "curved response", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "For an ohmic component, doubling voltage doubles current when conditions stay fixed.",
        "A straight I-V graph through the origin signals constant resistance over the measured range.",
        "A curved I-V response shows that the effective resistance is changing.",
      ],
      "This graph explorer keeps formula, graph, and physical meaning aligned so Ohm's law stays a tested relationship rather than a memorized chant.",
    );
  }

  if (lessonKey === "M9_L6") {
    const sourceVoltage = clamp(props.simMetricMeters, 6, 24);
    const resistorA = clamp(props.simDensityMass, 1, 12);
    const resistorB = clamp(props.simDensityVolume, 1, 12);
    const resistorC = clamp(props.simSpread, 1, 12);
    const topologyIndex = clamp(Math.round(props.simBias), 0, 2);
    const topologyLabels = ["series chain", "parallel pair", "mixed network"] as const;
    const topology = topologyLabels[topologyIndex];

    const seriesResistance = resistorA + resistorB;
    const seriesCurrent = sourceVoltage / seriesResistance;
    const seriesDropA = seriesCurrent * resistorA;
    const seriesDropB = seriesCurrent * resistorB;

    const parallelResistance = 1 / (1 / resistorA + 1 / resistorB);
    const branchCurrentA = sourceVoltage / resistorA;
    const branchCurrentB = sourceVoltage / resistorB;
    const totalParallelCurrent = branchCurrentA + branchCurrentB;

    const mixedParallelResistance = 1 / (1 / resistorB + 1 / resistorC);
    const mixedTotalResistance = resistorA + mixedParallelResistance;
    const mixedSourceCurrent = sourceVoltage / mixedTotalResistance;
    const mixedSeriesDrop = mixedSourceCurrent * resistorA;
    const mixedBranchVoltage = sourceVoltage - mixedSeriesDrop;
    const mixedBranchCurrentB = mixedBranchVoltage / resistorB;
    const mixedBranchCurrentC = mixedBranchVoltage / resistorC;

    return renderPanel(
      "Network reduction",
      <>
        {sliderField(
          "Topology",
          topology,
          <input className="w-full" type="range" min="0" max="2" step="1" value={topologyIndex} onChange={(e) => props.setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Source voltage",
          `${props.formatSimulationNumber(sourceVoltage, 0)} V`,
          <input className="w-full" type="range" min="6" max="24" step="1" value={sourceVoltage} onChange={(e) => props.setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          topology === "parallel pair" ? "Branch A resistance" : "Resistor A",
          `${props.formatSimulationNumber(resistorA, 1)} ohm`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistorA} onChange={(e) => props.setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          topology === "parallel pair" ? "Branch B resistance" : topology === "mixed network" ? "Branch B resistance" : "Resistor B",
          `${props.formatSimulationNumber(resistorB, 1)} ohm`,
          <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistorB} onChange={(e) => props.setSimDensityVolume(Number(e.target.value))} />,
        )}
        {topology === "mixed network"
          ? sliderField(
              "Branch C resistance",
              `${props.formatSimulationNumber(resistorC, 1)} ohm`,
              <input className="w-full" type="range" min="1" max="12" step="0.5" value={resistorC} onChange={(e) => props.setSimSpread(Number(e.target.value))} />,
            )
          : null}
      </>,
      "Circuit comparison board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="32" y="26" width="576" height="188" rx="28" fill={topology === "mixed network" ? "#fdf2f8" : topology === "parallel pair" ? "#ecfdf5" : "#eff6ff"} />
        <text x="54" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          {topology === "series chain"
            ? "Series chain: one route keeps one common current"
            : topology === "parallel pair"
              ? "Parallel pair: same branch voltage, current splits"
              : "Mixed network: reduce the branch block before finding the source current"}
        </text>
        {topology === "series chain" ? (
          <>
            <rect x="78" y="106" width="40" height="54" rx="10" fill="#f59e0b" />
            <path d="M118 132H228" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <rect x="228" y="96" width="96" height="72" rx="16" fill="#dbeafe" />
            <path d="M324 132H420" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <rect x="420" y="96" width="96" height="72" rx="16" fill="#bfdbfe" />
            <path d="M516 132H572" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <text x="268" y="139" fill="#1e3a8a" fontSize="18" fontWeight="700">A</text>
            <text x="460" y="139" fill="#1d4ed8" fontSize="18" fontWeight="700">B</text>
            <text x="170" y="198" fill="#475569" fontSize="16">same current everywhere | supply voltage is shared</text>
          </>
        ) : topology === "parallel pair" ? (
          <>
            <line x1="126" y1="90" x2="126" y2="184" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <line x1="520" y1="90" x2="520" y2="184" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
            <line x1="126" y1="90" x2="520" y2="90" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
            <line x1="126" y1="184" x2="520" y2="184" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
            <rect x="236" y="72" width="86" height="36" rx="14" fill="#dbeafe" />
            <rect x="348" y="166" width="86" height="36" rx="14" fill="#bbf7d0" />
            <text x="268" y="96" fill="#1e3a8a" fontSize="18" fontWeight="700">A</text>
            <text x="380" y="190" fill="#166534" fontSize="18" fontWeight="700">B</text>
            <text x="180" y="136" fill="#475569" fontSize="16">same two junctions {"->"} same branch voltage</text>
          </>
        ) : (
          <>
            <rect x="72" y="108" width="40" height="48" rx="10" fill="#f59e0b" />
            <path d="M112 132H226" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <rect x="226" y="96" width="84" height="72" rx="16" fill="#ddd6fe" />
            <text x="260" y="139" fill="#5b21b6" fontSize="18" fontWeight="700">A</text>
            <path d="M310 132H372" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
            <line x1="372" y1="80" x2="372" y2="184" stroke="#64748b" strokeWidth="8" />
            <line x1="518" y1="80" x2="518" y2="184" stroke="#64748b" strokeWidth="8" />
            <line x1="372" y1="80" x2="518" y2="80" stroke="#1d4ed8" strokeWidth="8" />
            <line x1="372" y1="184" x2="518" y2="184" stroke="#1d4ed8" strokeWidth="8" />
            <rect x="410" y="64" width="70" height="32" rx="14" fill="#dbeafe" />
            <rect x="410" y="168" width="70" height="32" rx="14" fill="#bbf7d0" />
            <text x="438" y="86" fill="#1e3a8a" fontSize="18" fontWeight="700">B</text>
            <text x="438" y="190" fill="#166534" fontSize="18" fontWeight="700">C</text>
            <text x="128" y="202" fill="#475569" fontSize="16">series first, then branch block {"->"} reduce section by section</text>
          </>
        )}
      </svg>,
      topology === "series chain" ? (
        <>
          {metricCard("Source current", `${props.formatSimulationNumber(seriesCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
          {metricCard("Voltage across A", `${props.formatSimulationNumber(seriesDropA, 2)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
          {metricCard("Voltage across B", `${props.formatSimulationNumber(seriesDropB, 2)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
          {metricCard("Total resistance", `${props.formatSimulationNumber(seriesResistance, 2)} ohm`, "border-amber-200 bg-amber-50 text-amber-900")}
        </>
      ) : topology === "parallel pair" ? (
        <>
          {metricCard("Branch voltage", `${props.formatSimulationNumber(sourceVoltage, 2)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
          {metricCard("Current in A", `${props.formatSimulationNumber(branchCurrentA, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
          {metricCard("Current in B", `${props.formatSimulationNumber(branchCurrentB, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
          {metricCard("Equivalent resistance", `${props.formatSimulationNumber(parallelResistance, 2)} ohm`, "border-amber-200 bg-amber-50 text-amber-900")}
          {metricCard("Source current", `${props.formatSimulationNumber(totalParallelCurrent, 2)} A`, "border-rose-200 bg-rose-50 text-rose-900")}
        </>
      ) : (
        <>
          {metricCard("Equivalent resistance", `${props.formatSimulationNumber(mixedTotalResistance, 2)} ohm`, "border-sky-200 bg-sky-50 text-sky-900")}
          {metricCard("Source current", `${props.formatSimulationNumber(mixedSourceCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
          {metricCard("Parallel-block voltage", `${props.formatSimulationNumber(mixedBranchVoltage, 2)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
          {metricCard("Current in B", `${props.formatSimulationNumber(mixedBranchCurrentB, 2)} A`, "border-amber-200 bg-amber-50 text-amber-900")}
          {metricCard("Current in C", `${props.formatSimulationNumber(mixedBranchCurrentC, 2)} A`, "border-rose-200 bg-rose-50 text-rose-900")}
        </>
      ),
      [
        "Series rules belong only to one uninterrupted current path.",
        "Parallel rules belong only to branches sharing the same two junctions.",
        "Mixed circuits are solved by reducing the valid series or parallel block first.",
      ],
      topology === "mixed network"
        ? "This mixed-network mode is the step above F4: you have to identify the branch block first, reduce it, then rebuild the source current and branch currents from the correct section rules."
        : "This comparison keeps topology first, which is the safest habit for avoiding the wrong current or voltage rule in circuit questions.",
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      Each M9 lesson should now own a circuits explorer directly. If you see this fallback, the M9 lesson key is missing a dedicated electrical panel.
    </div>
  );
}
