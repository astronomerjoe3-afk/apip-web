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
          <h4 className="text-lg font-semibold text-slate-900">Charge-Terrace lens</h4>
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

export default function A2SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simDensityMass,
  setSimDensityMass,
  simDensityVolume,
  setSimDensityVolume,
  simFluidDensity,
  setSimFluidDensity,
  simBias,
  setSimBias,
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A2_L1") {
    const sourceMagnitude = clamp(simVectorMagnitude, 1, 10);
    const distance = clamp(simMetricMeters, 1, 8);
    const scoutMagnitude = clamp(simDensityMass, 0.5, 4);
    const sourcePositive = Math.round(clamp(simBias, 0, 1)) === 0;
    const scoutPositive = Math.round(clamp(simSpread, 0, 1)) === 0;
    const fieldStrength = (sourceMagnitude * 12) / (distance * distance);
    const forceMagnitude = fieldStrength * scoutMagnitude;
    const fieldDirection = sourcePositive ? "away from source" : "toward source";
    const forceDirection =
      scoutPositive === sourcePositive ? fieldDirection : fieldDirection === "away from source" ? "toward source" : "away from source";

    return renderPanel(
      "Slope-map",
      <>
        {sliderField("Source sign", sourcePositive ? "positive source" : "negative source", <input className="w-full" type="range" min="0" max="1" step="1" value={sourcePositive ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Source strength", `${formatSimulationNumber(sourceMagnitude, 1)} units`, <input className="w-full" type="range" min="1" max="10" step="0.2" value={sourceMagnitude} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Scout sign", scoutPositive ? "positive scout" : "negative scout", <input className="w-full" type="range" min="0" max="1" step="1" value={scoutPositive ? 0 : 1} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Distance from source", `${formatSimulationNumber(distance, 1)} units`, <input className="w-full" type="range" min="1" max="8" step="0.2" value={distance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Scout magnitude", `${formatSimulationNumber(scoutMagnitude, 1)} C`, <input className="w-full" type="range" min="0.5" max="4" step="0.1" value={scoutMagnitude} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Field map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Field direction belongs to the location; force direction depends on the scout</text>
        <circle cx="190" cy="128" r="34" fill={sourcePositive ? "#f97316" : "#1d4ed8"} />
        <text x="190" y="138" fill="#fff" fontSize="28" fontWeight="700" textAnchor="middle">{sourcePositive ? "+" : "-"}</text>
        <circle cx="440" cy="128" r="22" fill={scoutPositive ? "#10b981" : "#8b5cf6"} />
        <text x="440" y="136" fill="#fff" fontSize="22" fontWeight="700" textAnchor="middle">{scoutPositive ? "+" : "-"}</text>
        {sourcePositive ? (
          <>
            <line x1="236" y1="128" x2="400" y2="128" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
            <polygon points="400,128 374,114 374,142" fill="#0ea5e9" />
          </>
        ) : (
          <>
            <line x1="400" y1="128" x2="236" y2="128" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
            <polygon points="236,128 262,114 262,142" fill="#0ea5e9" />
          </>
        )}
        {forceDirection === "away from source" ? (
          <>
            <line x1="440" y1="164" x2="520" y2="164" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
            <polygon points="520,164 494,150 494,178" fill="#0f766e" />
          </>
        ) : (
          <>
            <line x1="440" y1="164" x2="360" y2="164" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
            <polygon points="360,164 386,150 386,178" fill="#0f766e" />
          </>
        )}
        <text x="258" y="104" fill="#0284c7" fontSize="18" fontWeight="700">field arrow</text>
        <text x="422" y="194" fill="#0f766e" fontSize="18" fontWeight="700" textAnchor="middle">force on scout</text>
        <text x="72" y="206" fill="#475569" fontSize="18">The field map stays fixed when only the scout changes sign. What flips is the force on that scout.</text>
      </svg>,
      <>
        {metricCard("Field strength E", `${formatSimulationNumber(fieldStrength, 2)} N/C`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Force on scout", `${formatSimulationNumber(forceMagnitude, 2)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Field direction", fieldDirection, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Force direction", forceDirection, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Define the field arrow using a positive scout.", "A negative scout reverses force direction without redefining the field.", "Distance changes field strength because the electric slope becomes less steep farther out."],
      "This explorer locks in the main advanced-electricity distinction early: field belongs to the location, while force belongs to the chosen charge.",
    );
  }

  if (lessonKey === "A2_L2") {
    const potentialA = clamp(simMetricMeters, 0, 20);
    const freePotentialB = clamp(simVectorMagnitude, 0, 20);
    const sameTerrace = Math.round(clamp(simBias, 0, 1)) === 0;
    const potentialB = sameTerrace ? potentialA : freePotentialB;
    const deltaV = potentialA - potentialB;

    return renderPanel(
      "Equipotential terrace",
      <>
        {sliderField("Potential at point A", `${formatSimulationNumber(potentialA, 1)} V`, <input className="w-full" type="range" min="0" max="20" step="0.5" value={potentialA} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Potential at point B", sameTerrace ? `${formatSimulationNumber(potentialB, 1)} V (locked to A)` : `${formatSimulationNumber(potentialB, 1)} V`, <input className="w-full" type="range" min="0" max="20" step="0.5" value={sameTerrace ? potentialA : potentialB} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} disabled={sameTerrace} />)}
        {sliderField("Route mode", sameTerrace ? "same terrace" : "cross terrace", <input className="w-full" type="range" min="0" max="1" step="1" value={sameTerrace ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Terrace map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Same-height routes give zero terrace drop</text>
        {[0, 1, 2, 3].map((index) => <line key={index} x1="92" y1={92 + index * 32} x2="560" y2={92 + index * 32} stroke="#cbd5e1" strokeWidth="3" strokeDasharray="10 8" />)}
        <line x1="180" y1="78" x2="510" y2="190" stroke="#0ea5e9" strokeWidth="6" />
        <polygon points="510,190 486,178 500,154" fill="#0ea5e9" />
        <circle cx="188" cy={sameTerrace ? 124 : 108} r="10" fill="#1d4ed8" />
        <circle cx="438" cy={sameTerrace ? 124 : 172} r="10" fill="#10b981" />
        <path d={sameTerrace ? "M188 124 C250 124, 320 124, 438 124" : "M188 108 C240 110, 320 140, 438 172"} fill="none" stroke={sameTerrace ? "#7c3aed" : "#f97316"} strokeWidth="6" strokeLinecap="round" />
        <text x="154" y="96" fill="#1d4ed8" fontSize="18" fontWeight="700">point A</text>
        <text x="418" y={sameTerrace ? 110 : 198} fill="#0f766e" fontSize="18" fontWeight="700">point B</text>
        <text x="354" y="92" fill="#0284c7" fontSize="18" fontWeight="700">field direction</text>
        <text x="88" y="206" fill="#475569" fontSize="18">Equipotential travel stays on one terrace. Crossing terrace levels creates Delta V.</text>
      </svg>,
      <>
        {metricCard("Potential at A", `${formatSimulationNumber(potentialA, 1)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Potential at B", `${formatSimulationNumber(potentialB, 1)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Delta V", `${formatSimulationNumber(deltaV, 1)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Path type", sameTerrace ? "equipotential route" : "cross-terrace route", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Potential is electric height per unit charge.", "An equipotential path has zero terrace drop along it.", "Field arrows cross equipotential lines rather than running along them."],
      "The point of this board is to make voltage feel like height difference and equipotential travel feel flat rather than mysterious.",
    );
  }

  if (lessonKey === "A2_L3") {
    const plateVoltage = clamp(simVectorMagnitude, 10, 120);
    const gap = clamp(simMetricMeters, 0.005, 0.05);
    const scoutPositive = Math.round(clamp(simBias, 0, 1)) === 0;
    const fieldStrength = plateVoltage / gap;
    const gapMm = gap * 1000;

    return renderPanel(
      "Uniform plate-field",
      <>
        {sliderField("Plate voltage", `${formatSimulationNumber(plateVoltage, 0)} V`, <input className="w-full" type="range" min="10" max="120" step="1" value={plateVoltage} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Plate gap", `${formatSimulationNumber(gapMm, 1)} mm`, <input className="w-full" type="range" min="0.005" max="0.05" step="0.001" value={gap} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Scout sign", scoutPositive ? "positive scout" : "negative scout", <input className="w-full" type="range" min="0" max="1" step="1" value={scoutPositive ? 0 : 1} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Plate-gap board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Uniform field means one steady terrace drop across the gap</text>
        <rect x="140" y="84" width="20" height="108" rx="8" fill="#ef4444" />
        <rect x="480" y="84" width="20" height="108" rx="8" fill="#2563eb" />
        <text x="150" y="76" fill="#b91c1c" fontSize="18" fontWeight="700" textAnchor="middle">+</text>
        <text x="490" y="76" fill="#1d4ed8" fontSize="18" fontWeight="700" textAnchor="middle">-</text>
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={index}>
            <line x1={194 + index * 52} y1="104" x2={246 + index * 52} y2="104" stroke="#0ea5e9" strokeWidth="6" />
            <polygon points={`${246 + index * 52},104 ${224 + index * 52},92 ${224 + index * 52},116`} fill="#0ea5e9" />
          </g>
        ))}
        {[0, 1, 2].map((index) => <line key={index} x1="194" y1={126 + index * 24} x2="448" y2={126 + index * 24} stroke="#cbd5e1" strokeWidth="3" strokeDasharray="10 8" />)}
        <circle cx="318" cy="154" r="14" fill={scoutPositive ? "#10b981" : "#7c3aed"} />
        <text x="318" y="160" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">{scoutPositive ? "+" : "-"}</text>
        <text x="250" y="198" fill="#475569" fontSize="18">Equipotential layers stay parallel to the plates.</text>
      </svg>,
      <>
        {metricCard("Field strength E", `${formatSimulationNumber(fieldStrength, 0)} V/m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Gap d", `${formatSimulationNumber(gap, 3)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Voltage Delta V", `${formatSimulationNumber(plateVoltage, 0)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Scout response", scoutPositive ? "force along field" : "force opposite field", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Uniform field strength is voltage drop per distance.", "Smaller gap with the same voltage means steeper electric slope.", "Field direction is fixed by the plates even when the scout sign changes."],
      "This plate-gap view keeps Delta V and d physically visible, which is the safest way to teach E = Delta V / d conceptually.",
    );
  }

  if (lessonKey === "A2_L4") {
    const area = clamp(simMetricMeters, 0.2, 2.0);
    const gap = clamp(simVectorMagnitude, 0.2, 2.0);
    const voltage = clamp(simDensityMass, 2, 24);
    const dielectricFactor = clamp(simFluidDensity, 1, 4);
    const capacitance = (3 * area * dielectricFactor) / gap;
    const charge = capacitance * voltage;
    const energy = 0.5 * capacitance * voltage * voltage;

    return renderPanel(
      "Split-deck store",
      <>
        {sliderField("Plate area", `${formatSimulationNumber(area, 2)} m^2`, <input className="w-full" type="range" min="0.2" max="2.0" step="0.05" value={area} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Plate gap", `${formatSimulationNumber(gap, 2)} cm`, <input className="w-full" type="range" min="0.2" max="2.0" step="0.05" value={gap} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Source voltage", `${formatSimulationNumber(voltage, 1)} V`, <input className="w-full" type="range" min="2" max="24" step="0.5" value={voltage} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Gap material factor", `${formatSimulationNumber(dielectricFactor, 1)} x`, <input className="w-full" type="range" min="1" max="4" step="0.1" value={dielectricFactor} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Capacitor board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#f8fafc" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Two facing plates hold separated charge across a field-filled gap</text>
        <rect x="180" y="86" width={90 + area * 55} height="18" rx="8" fill="#ef4444" />
        <rect x="180" y={146 + gap * 12} width={90 + area * 55} height="18" rx="8" fill="#2563eb" />
        <text x="150" y="100" fill="#b91c1c" fontSize="18" fontWeight="700">+Q</text>
        <text x="150" y={160 + gap * 12} fill="#1d4ed8" fontSize="18" fontWeight="700">-Q</text>
        {[0, 1, 2, 3].map((index) => (
          <g key={index}>
            <line x1={220 + index * 32} y1="112" x2={220 + index * 32} y2={142 + gap * 12} stroke="#0ea5e9" strokeWidth="5" strokeDasharray="10 8" />
            <polygon points={`${220 + index * 32},${142 + gap * 12} ${214 + index * 32},${130 + gap * 12} ${226 + index * 32},${130 + gap * 12}`} fill="#0ea5e9" />
          </g>
        ))}
        <text x="378" y="126" fill="#0284c7" fontSize="18" fontWeight="700">field in gap</text>
        <text x="188" y="204" fill="#475569" fontSize="18">Capacitance rises with area and falls with separation.</text>
      </svg>,
      <>
        {metricCard("Capacitance C", `${formatSimulationNumber(capacitance, 2)} F`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Stored charge Q", `${formatSimulationNumber(charge, 2)} C`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Field energy", `${formatSimulationNumber(energy, 1)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Store geometry", gap < 0.8 && area > 1.2 ? "strong split-deck" : "weaker split-deck", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Capacitance is the device ratio Q/V, not the current amount of charge by itself.", "Larger area helps the plates hold more charge per volt.", "The stored energy is in the electric field between the plates, not in one plate alone."],
      "This explorer keeps geometry, stored charge, and field energy on the same board so capacitance feels like a design property rather than a formula to memorize.",
    );
  }

  if (lessonKey === "A2_L5") {
    const sourceVoltage = clamp(simVectorMagnitude, 4, 24);
    const branchOneResistance = clamp(simDensityMass, 1, 20);
    const branchTwoResistance = clamp(simDensityVolume, 1, 20);
    const branchOneCurrent = sourceVoltage / branchOneResistance;
    const branchTwoCurrent = sourceVoltage / branchTwoResistance;
    const totalCurrent = branchOneCurrent + branchTwoCurrent;

    return renderPanel(
      "Node-platform",
      <>
        {sliderField("Source voltage", `${formatSimulationNumber(sourceVoltage, 1)} V`, <input className="w-full" type="range" min="4" max="24" step="0.5" value={sourceVoltage} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Branch 1 resistance", `${formatSimulationNumber(branchOneResistance, 1)} ohm`, <input className="w-full" type="range" min="1" max="20" step="0.2" value={branchOneResistance} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Branch 2 resistance", `${formatSimulationNumber(branchTwoResistance, 1)} ohm`, <input className="w-full" type="range" min="1" max="20" step="0.2" value={branchTwoResistance} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Node map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Branches between the same two nodes share one terrace drop</text>
        <line x1="110" y1="84" x2="530" y2="84" stroke="#0f766e" strokeWidth="10" strokeLinecap="round" />
        <line x1="110" y1="186" x2="530" y2="186" stroke="#1d4ed8" strokeWidth="10" strokeLinecap="round" />
        <line x1="200" y1="84" x2="200" y2="186" stroke="#94a3b8" strokeWidth="8" />
        <line x1="430" y1="84" x2="430" y2="186" stroke="#94a3b8" strokeWidth="8" />
        <rect x="184" y="102" width="32" height="26" rx="6" fill="#f59e0b" />
        <rect x="184" y="144" width="32" height="26" rx="6" fill="#f59e0b" />
        <rect x="414" y="102" width="32" height="26" rx="6" fill="#f59e0b" />
        <rect x="414" y="144" width="32" height="26" rx="6" fill="#f59e0b" />
        <line x1="200" y1="116" x2="430" y2="116" stroke="#ef4444" strokeWidth="6" />
        <line x1="200" y1="158" x2="430" y2="158" stroke="#8b5cf6" strokeWidth="6" />
        <text x="96" y="72" fill="#0f766e" fontSize="18" fontWeight="700">top node = {formatSimulationNumber(sourceVoltage, 0)} V</text>
        <text x="96" y="212" fill="#1d4ed8" fontSize="18" fontWeight="700">bottom node = 0 V</text>
        <text x="258" y="108" fill="#dc2626" fontSize="18" fontWeight="700">branch 1</text>
        <text x="258" y="176" fill="#7c3aed" fontSize="18" fontWeight="700">branch 2</text>
      </svg>,
      <>
        {metricCard("Branch 1 current", `${formatSimulationNumber(branchOneCurrent, 2)} A`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Branch 2 current", `${formatSimulationNumber(branchTwoCurrent, 2)} A`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Total current", `${formatSimulationNumber(totalCurrent, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Branch voltage", `${formatSimulationNumber(sourceVoltage, 1)} V on both branches`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Parallel branches connected between the same two nodes share the same potential difference.", "Different branch resistances can still produce different branch currents.", "The total current equals the sum of the branch currents at the junction."],
      "This node map makes the hidden voltage structure visible first, which is the cleanest way to keep current split and node height from getting mixed together.",
    );
  }

  if (lessonKey === "A2_L6") {
    const sourceRise = clamp(simVectorMagnitude, 8, 28);
    const dropOne = clamp(simDensityMass, 1, 14);
    const dropTwo = clamp(simDensityVolume, 1, 14);
    const guessedMissing = clamp(simMetricMeters, 0, 20);
    const requiredMissing = sourceRise - dropOne - dropTwo;
    const loopSum = sourceRise - dropOne - dropTwo - guessedMissing;
    const topNode = sourceRise;
    const midNode = sourceRise - dropOne;
    const lowNode = midNode - dropTwo;

    return renderPanel(
      "Mesh audit",
      <>
        {sliderField("Source rise", `${formatSimulationNumber(sourceRise, 1)} V`, <input className="w-full" type="range" min="8" max="28" step="0.5" value={sourceRise} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Drop 1", `${formatSimulationNumber(dropOne, 1)} V`, <input className="w-full" type="range" min="1" max="14" step="0.5" value={dropOne} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Drop 2", `${formatSimulationNumber(dropTwo, 1)} V`, <input className="w-full" type="range" min="1" max="14" step="0.5" value={dropTwo} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Your missing-drop guess", `${formatSimulationNumber(guessedMissing, 1)} V`, <input className="w-full" type="range" min="0" max="20" step="0.5" value={guessedMissing} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Loop marker", `${formatSimulationNumber(clamp(simVectorAngle, 0, 360), 0)} deg`, <input className="w-full" type="range" min="0" max="360" step="5" value={clamp(simVectorAngle, 0, 360)} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Loop audit board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">A closed loop must climb and descend back to its starting electric height</text>
        <rect x="112" y="86" width="56" height="78" rx="12" fill="#10b981" />
        <text x="140" y="130" fill="#fff" fontSize="22" fontWeight="700" textAnchor="middle">+{formatSimulationNumber(sourceRise, 0)}</text>
        <rect x="254" y="76" width="72" height="22" rx="8" fill="#f59e0b" />
        <rect x="414" y="76" width="72" height="22" rx="8" fill="#f59e0b" />
        <rect x="414" y="164" width="72" height="22" rx="8" fill="#f59e0b" />
        <line x1="168" y1="124" x2="254" y2="124" stroke="#0f766e" strokeWidth="8" />
        <line x1="326" y1="87" x2="414" y2="87" stroke="#ef4444" strokeWidth="8" />
        <line x1="450" y1="98" x2="450" y2="164" stroke="#1d4ed8" strokeWidth="8" />
        <line x1="414" y1="175" x2="168" y2="175" stroke="#7c3aed" strokeWidth="8" />
        <line x1="140" y1="164" x2="140" y2="86" stroke="#94a3b8" strokeWidth="8" />
        <text x="258" y="70" fill="#c2410c" fontSize="18" fontWeight="700">drop 1 = {formatSimulationNumber(dropOne, 0)} V</text>
        <text x="418" y="70" fill="#c2410c" fontSize="18" fontWeight="700">drop 2 = {formatSimulationNumber(dropTwo, 0)} V</text>
        <text x="388" y="206" fill="#7c3aed" fontSize="18" fontWeight="700">missing drop = {formatSimulationNumber(requiredMissing, 1)} V</text>
        <text x="74" y="206" fill="#475569" fontSize="18">Loop sum should return to zero after every rise and drop is counted.</text>
      </svg>,
      <>
        {metricCard("Required missing drop", `${formatSimulationNumber(requiredMissing, 1)} V`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Loop sum with your guess", `${formatSimulationNumber(loopSum, 1)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Node heights", `top ${formatSimulationNumber(topNode, 1)} V, mid ${formatSimulationNumber(midNode, 1)} V, low ${formatSimulationNumber(lowNode, 1)} V`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Audit status", Math.abs(loopSum) < 0.01 ? "balanced loop" : "loop not balanced yet", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["List every source rise and every component drop with sign.", "Use node heights to check component voltages independently of the loop walk.", "KVL is a conservation audit, not a claim that all component voltages match."],
      "This final A2 board turns Kirchhoff voltage reasoning into terrain bookkeeping: when the audit is complete, the loop must come back to the same electric height where it started.",
    );
  }

  return (
    <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">
      Use the task above to compare electric slope, terrace drop, or mesh balance before you continue.
    </div>
  );
}
