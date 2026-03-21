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

export default function M12SimulationPanels({
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
  simSpread,
  simBias,
  setSimBias,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M12_L1") {
    const sourceMode = clamp(Math.round(simBias), 0, 1) === 1 ? "wire" : "magnet";
    const distance = clamp(simMetricMeters, 1, 10);
    const current = clamp(simVectorMagnitude, 0, 8);
    const reverseWire = clamp(Math.round(simDensityMass), 0, 1) === 1;
    const relativeStrength = sourceMode === "magnet" ? 9 / (distance + 1) : (Math.max(current, 0.5) * 4) / (distance + 1);
    const directionLabel = sourceMode === "magnet" ? "tower field fixed" : reverseWire ? "wire field reversed" : "wire field standard";
    return renderPanel(
      "Weave Mapper",
      <>
        {sliderField("Source type", sourceMode, <input className="w-full" type="range" min="0" max="1" step="1" value={sourceMode === "wire" ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Probe distance", `${formatSimulationNumber(distance, 1)} cm`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={distance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Wire current", `${formatSimulationNumber(current, 1)} A`, <input className="w-full" type="range" min="0" max="8" step="0.2" value={current} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Wire direction", reverseWire ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={reverseWire ? 1 : 0} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Field map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill={sourceMode === "magnet" ? "#eff6ff" : "#ecfeff"} />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">
          {sourceMode === "magnet" ? "Compass flags reveal direction around the field tower" : "A live wire throws circular weave around the carrier route"}
        </text>
        {sourceMode === "magnet" ? (
          <>
            <rect x="278" y="76" width="44" height="104" rx="14" fill="#ef4444" />
            <rect x="322" y="76" width="44" height="104" rx="14" fill="#3b82f6" />
            <text x="292" y="98" fill="#fff" fontSize="18" fontWeight="700">N</text>
            <text x="336" y="98" fill="#fff" fontSize="18" fontWeight="700">S</text>
            <path d="M210 128C228 84 414 84 430 128" stroke="#60a5fa" strokeWidth="8" fill="none" />
            <path d="M230 156C248 124 394 124 410 156" stroke="#93c5fd" strokeWidth="6" fill="none" />
            <path d="M210 128C228 172 414 172 430 128" stroke="#60a5fa" strokeWidth="8" fill="none" />
            <path d="M178 128h30m224 0h30" stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
            <polygon points="208,128 196,122 196,134" fill="#1d4ed8" />
            <polygon points="462,128 450,122 450,134" fill="#1d4ed8" />
          </>
        ) : (
          <>
            <circle cx="320" cy="128" r="16" fill="#0f172a" />
            <circle cx="320" cy="128" r="6" fill="#fff" />
            <path d="M320 62a68 68 0 1 1 0 132a68 68 0 1 1 0-132" stroke="#0ea5e9" strokeWidth="8" fill="none" strokeDasharray="10 9" />
            <path d="M320 82a46 46 0 1 1 0 92a46 46 0 1 1 0-92" stroke="#38bdf8" strokeWidth="6" fill="none" strokeDasharray="8 8" />
            <text x="370" y="95" fill="#0369a1" fontSize="16">{reverseWire ? "clockwise" : "anticlockwise"}</text>
            <path d={reverseWire ? "M404 116l14 12l-12 14" : "M418 142l-14-12l12-14"} stroke="#0369a1" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        <text x="72" y="204" fill="#475569" fontSize="16">
          {`probe farther out -> lower weave density | source: ${directionLabel}`}
        </text>
      </svg>,
      <>
        {metricCard("Source", sourceMode, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Relative strength", formatSimulationNumber(relativeStrength, 2), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Probe distance", `${formatSimulationNumber(distance, 1)} cm`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Direction cue", directionLabel, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Field lines show the direction a compass flag would align.", "Line density stands in for field strength.", "A wire field is circular rather than bar-magnet shaped."],
      "This board keeps the field-direction story and the field-strength story separate, which is the easiest way to stop field lines turning into imaginary travel tracks.",
    );
  }

  if (lessonKey === "M12_L2") {
    const current = clamp(simMetricMeters, 0.5, 8);
    const turns = clamp(simDensityMass, 20, 140);
    const coreOn = clamp(Math.round(simBias), 0, 1) === 1;
    const pickupLoad = clamp(simDensityVolume, 0, 8);
    const strength = current * (turns / 25) * (coreOn ? 1.7 : 1);
    return renderPanel(
      "Core Boost",
      <>
        {sliderField("Current", `${formatSimulationNumber(current, 1)} A`, <input className="w-full" type="range" min="0.5" max="8" step="0.1" value={current} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Turn count", `${formatSimulationNumber(turns, 0)} turns`, <input className="w-full" type="range" min="20" max="140" step="5" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Core spine", coreOn ? "inserted" : "absent", <input className="w-full" type="range" min="0" max="1" step="1" value={coreOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Pickup load", `${formatSimulationNumber(pickupLoad, 0)} paper clips`, <input className="w-full" type="range" min="0" max="8" step="1" value={pickupLoad} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Coil tower board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#fefce8" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Coiling reinforces the field; the core spine concentrates it</text>
        <rect x="150" y="98" width="340" height="52" rx="26" fill={coreOn ? "#94a3b8" : "#e5e7eb"} />
        {Array.from({ length: 11 }).map((_, index) => (
          <path key={index} d={`M${172 + index * 28} 92c10 0 10 64 0 64`} stroke="#f59e0b" strokeWidth="10" fill="none" strokeLinecap="round" />
        ))}
        <text x="188" y="82" fill="#b45309" fontSize="16">coil turns</text>
        <text x="280" y="184" fill="#334155" fontSize="18">{coreOn ? "soft-iron core inserted" : "air core only"}</text>
        <path d="M520 120c22 0 40 18 40 40s-18 26-34 26" stroke="#16a34a" strokeWidth="10" fill="none" strokeLinecap="round" />
        <circle cx="554" cy="186" r="12" fill="#bbf7d0" />
        <circle cx="580" cy="186" r="12" fill="#bbf7d0" />
      </svg>,
      <>
        {metricCard("Electromagnet strength", formatSimulationNumber(strength, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Turn count", `${formatSimulationNumber(turns, 0)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Core state", coreOn ? "strengthened" : "uncored", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Load margin", pickupLoad <= strength ? "lifted" : "too heavy", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["More turns reinforce the field from each loop.", "A larger current strengthens the electromagnet.", "The soft-iron core concentrates the field instead of replacing it."],
      "This explorer keeps all three strength levers visible so students can explain one stronger electromagnet story instead of memorizing disconnected tricks.",
    );
  }

  if (lessonKey === "M12_L3") {
    const fieldStrength = clamp(simMetricMeters, 1, 10);
    const current = clamp(simVectorMagnitude, 1, 8);
    const crossingAngle = clamp(simVectorAngle, 0, 90);
    const fieldReversed = clamp(Math.round(simBias), 0, 1) === 1;
    const currentReversed = clamp(Math.round(simDensityMass), 0, 1) === 1;
    const angleFactor = Math.sin((crossingAngle * Math.PI) / 180);
    const force = fieldStrength * current * Math.max(angleFactor, 0) * 0.28;
    const direction = fieldReversed === currentReversed ? "upward side-kick" : "downward side-kick";
    return renderPanel(
      "Side-Kick Challenge",
      <>
        {sliderField("Field strength", `${formatSimulationNumber(fieldStrength, 1)} mT`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={fieldStrength} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Current", `${formatSimulationNumber(current, 1)} A`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={current} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Crossing angle", `${formatSimulationNumber(crossingAngle, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="5" value={crossingAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Field direction", fieldReversed ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={fieldReversed ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Current direction", currentReversed ? "reversed" : "standard", <input className="w-full" type="range" min="0" max="1" step="1" value={currentReversed ? 1 : 0} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Force board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#fdf2f8" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">The magnetic side-kick is perpendicular to current and field</text>
        {Array.from({ length: 7 }).map((_, index) => (
          <path key={index} d={`M120 ${92 + index * 18}H520`} stroke="#a78bfa" strokeWidth="4" strokeDasharray="8 8" />
        ))}
        <text x="76" y="90" fill="#7c3aed" fontSize="16">{fieldReversed ? "field -> left" : "field -> right"}</text>
        <path d={crossingAngle < 10 ? "M320 170L460 170" : `M320 170L${320 + 110 * Math.cos(((90 - crossingAngle) * Math.PI) / 180)} ${170 - 110 * Math.sin(((90 - crossingAngle) * Math.PI) / 180)}`} stroke="#2563eb" strokeWidth="10" strokeLinecap="round" />
        <circle cx="320" cy="170" r="8" fill="#0f172a" />
        <path d={direction.startsWith("up") ? "M320 156V92" : "M320 184V232"} stroke="#059669" strokeWidth="8" strokeLinecap="round" />
        <polygon points={direction.startsWith("up") ? "320,74 306,104 334,104" : "320,238 306,208 334,208"} fill="#059669" />
        <text x="352" y="162" fill="#1d4ed8" fontSize="16">current route</text>
        <text x="340" y={direction.startsWith("up") ? 94 : 226} fill="#047857" fontSize="16">{direction}</text>
      </svg>,
      <>
        {metricCard("Force size", `${formatSimulationNumber(force, 2)} N`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Direction", direction, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Angle factor", formatSimulationNumber(angleFactor, 2), "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Strongest case", "90 deg crossing", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["A conductor parallel to the field gets little or no side-kick.", "Perpendicular crossing gives the biggest force.", "Reverse the field or the current and the force reverses."],
      "This board forces the learner to keep three directions distinct at once, which is exactly what the sideways-force idea needs.",
    );
  }

  if (lessonKey === "M12_L4") {
    const fieldStrength = clamp(simMetricMeters, 1, 10);
    const current = clamp(simVectorMagnitude, 1, 8);
    const turns = clamp(simDensityMass, 1, 20);
    const commutatorOn = clamp(Math.round(simBias), 0, 1) === 1;
    const coilAngle = clamp(simSpread, 0, 90);
    const torque = fieldStrength * current * turns * (commutatorOn ? 0.18 : 0.12) * Math.max(Math.sin((coilAngle * Math.PI) / 180), 0.2);
    return renderPanel(
      "Spin Boss",
      <>
        {sliderField("Field strength", `${formatSimulationNumber(fieldStrength, 1)} mT`, <input className="w-full" type="range" min="1" max="10" step="0.5" value={fieldStrength} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Current", `${formatSimulationNumber(current, 1)} A`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={current} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Turn count", `${formatSimulationNumber(turns, 0)} turns`, <input className="w-full" type="range" min="1" max="20" step="1" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Commutator", commutatorOn ? "active" : "inactive", <input className="w-full" type="range" min="0" max="1" step="1" value={commutatorOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Coil angle", `${formatSimulationNumber(coilAngle, 0)} deg`, <input className="w-full" type="range" min="0" max="90" step="5" value={coilAngle} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Motor board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eef2ff" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Opposite side-kicks create a turning pair on the motor coil</text>
        <rect x="96" y="84" width="44" height="88" rx="18" fill="#ef4444" />
        <rect x="500" y="84" width="44" height="88" rx="18" fill="#3b82f6" />
        <text x="110" y="104" fill="#fff" fontSize="18" fontWeight="700">N</text>
        <text x="514" y="104" fill="#fff" fontSize="18" fontWeight="700">S</text>
        <path d={`M240 ${164 - coilAngle * 0.7}L400 ${98 + coilAngle * 0.7}L430 ${132}L270 ${198 - coilAngle * 0.7}Z`} stroke="#1d4ed8" strokeWidth="8" fill="rgba(59,130,246,0.08)" />
        <path d="M250 118V84" stroke="#059669" strokeWidth="8" strokeLinecap="round" />
        <polygon points="250,70 238,94 262,94" fill="#059669" />
        <path d="M410 146V182" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
        <polygon points="410,196 398,172 422,172" fill="#dc2626" />
        <text x="214" y="82" fill="#047857" fontSize="16">upward force</text>
        <text x="386" y="208" fill="#b91c1c" fontSize="16">downward force</text>
        <text x="222" y="224" fill="#475569" fontSize="16">{commutatorOn ? "commutator keeps the next half-turn driving the same overall rotation" : "without current swap, the coil would tend to stall at the turning point"}</text>
      </svg>,
      <>
        {metricCard("Torque index", formatSimulationNumber(torque, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Turns", `${formatSimulationNumber(turns, 0)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Commutator", commutatorOn ? "continuous spin" : "stall risk", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Energy story", "electrical -> kinetic", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["A motor is built from the same side-kick idea as Lesson 3.", "Opposite sides of the loop feel opposite forces.", "The commutator swaps current direction each half-turn to keep the rotation going."],
      "The motor board makes the torque visible as a pair of opposite forces, so the motor effect stays connected to the simpler force-on-a-wire idea.",
    );
  }

  if (lessonKey === "M12_L5") {
    const changeRate = clamp(simMetricMeters, 0, 10);
    const turns = clamp(simDensityMass, 20, 200);
    const generatorMode = clamp(Math.round(simBias), 0, 1) === 1;
    const motionSpeed = clamp(simVectorMagnitude, 0, 8);
    const inducedEmf = changeRate * Math.max(turns / 40, 0.5) * (generatorMode ? 0.85 : 0.55) + motionSpeed * 0.25;
    const modeLabel = generatorMode ? "generator rotation" : "magnet sweep";
    return renderPanel(
      "Induction Alarm",
      <>
        {sliderField("Flux-change rate", `${formatSimulationNumber(changeRate, 1)} units/s`, <input className="w-full" type="range" min="0" max="10" step="0.2" value={changeRate} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Turn count", `${formatSimulationNumber(turns, 0)} turns`, <input className="w-full" type="range" min="20" max="200" step="10" value={turns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Mode", modeLabel, <input className="w-full" type="range" min="0" max="1" step="1" value={generatorMode ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Motion speed", `${formatSimulationNumber(motionSpeed, 1)}`, <input className="w-full" type="range" min="0" max="8" step="0.1" value={motionSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Induction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#ecfdf5" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">Only changing field-thread produces a sustained induced push</text>
        <rect x="116" y="88" width="54" height="94" rx="18" fill="#ef4444" />
        <text x="132" y="108" fill="#fff" fontSize="18" fontWeight="700">N</text>
        {Array.from({ length: 6 }).map((_, index) => (
          <path key={index} d={`M250 ${90 + index * 18}c12 0 12 72 0 72`} stroke="#2563eb" strokeWidth="8" fill="none" strokeLinecap="round" />
        ))}
        {generatorMode ? (
          <path d="M470 82c34 18 56 48 56 82s-22 64-56 82" stroke="#059669" strokeWidth="10" fill="none" strokeLinecap="round" />
        ) : (
          <path d={`M174 136H${174 + changeRate * 22}`} stroke="#059669" strokeWidth="10" strokeLinecap="round" />
        )}
        <text x="250" y="204" fill="#475569" fontSize="16">{changeRate === 0 ? "no changing flux -> no sustained induced output" : `${modeLabel} keeps the field-thread changing`}</text>
      </svg>,
      <>
        {metricCard("Induced emf index", formatSimulationNumber(inducedEmf, 2), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Flux change", changeRate === 0 ? "static" : "changing", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Turn count", `${formatSimulationNumber(turns, 0)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Mode", modeLabel, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["No change means no sustained induction.", "More turns increase the induced effect.", "A generator is repeated induction caused by continuous rotation."],
      "This board keeps the word changing at the center of the induction story so the learner does not treat any nearby field as automatically enough.",
    );
  }

  if (lessonKey === "M12_L6") {
    const primaryVoltage = clamp(simMetricMeters, 12, 400);
    const primaryTurns = clamp(simDensityMass, 20, 400);
    const secondaryTurns = clamp(simDensityVolume, 20, 400);
    const powerKw = clamp(simVectorMagnitude, 1, 8);
    const acOn = clamp(Math.round(simBias), 0, 1) === 1;
    const secondaryVoltage = acOn ? primaryVoltage * (secondaryTurns / primaryTurns) : 0;
    const powerW = powerKw * 1000;
    const lineCurrent = secondaryVoltage > 0 ? powerW / secondaryVoltage : 0;
    const cableLoss = lineCurrent * lineCurrent * 0.4;
    const modeLabel = secondaryTurns > primaryTurns ? "step-up" : secondaryTurns < primaryTurns ? "step-down" : "one-to-one";
    return renderPanel(
      "Grid Bridge",
      <>
        {sliderField("Primary voltage", `${formatSimulationNumber(primaryVoltage, 0)} V`, <input className="w-full" type="range" min="12" max="400" step="4" value={primaryVoltage} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Primary turns", `${formatSimulationNumber(primaryTurns, 0)}`, <input className="w-full" type="range" min="20" max="400" step="10" value={primaryTurns} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Secondary turns", `${formatSimulationNumber(secondaryTurns, 0)}`, <input className="w-full" type="range" min="20" max="400" step="10" value={secondaryTurns} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Supply type", acOn ? "a.c." : "steady d.c.", <input className="w-full" type="range" min="0" max="1" step="1" value={acOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Power transfer", `${formatSimulationNumber(powerKw, 1)} kW`, <input className="w-full" type="range" min="1" max="8" step="0.1" value={powerKw} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Transformer board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eff6ff" />
        <text x="50" y="56" fill="#0f172a" fontSize="22" fontWeight="700">A changing core field links two coils; turns ratio sets the voltage change</text>
        <rect x="270" y="74" width="100" height="104" rx="18" fill="#94a3b8" />
        {Array.from({ length: 5 }).map((_, index) => (
          <path key={`p-${index}`} d={`M212 ${84 + index * 18}c-12 0 -12 72 0 72`} stroke="#2563eb" strokeWidth="8" fill="none" strokeLinecap="round" />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <path key={`s-${index}`} d={`M428 ${78 + index * 14}c12 0 12 56 0 56`} stroke="#16a34a" strokeWidth="8" fill="none" strokeLinecap="round" />
        ))}
        <text x="150" y="188" fill="#1d4ed8" fontSize="18" fontWeight="700">primary</text>
        <text x="430" y="188" fill="#15803d" fontSize="18" fontWeight="700">secondary</text>
        <text x="224" y="214" fill="#475569" fontSize="16">{acOn ? `${modeLabel} transformer active` : "steady d.c. -> no sustained secondary emf"}</text>
      </svg>,
      <>
        {metricCard("Mode", modeLabel, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Secondary voltage", `${formatSimulationNumber(secondaryVoltage, 1)} V`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Line current", `${formatSimulationNumber(lineCurrent, 2)} A`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Cable loss clue", acOn ? `${formatSimulationNumber(cableLoss, 1)} units` : "no sustained transfer", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Ordinary transformers need changing current in the primary.", "Voltage ratio follows turns ratio in the school model.", "For the same power, higher voltage means lower line current and lower cable loss."],
      "This board keeps induction, turns ratio, and transmission reasoning as separate layers of one system, which is what makes transformer questions finally feel coherent.",
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the task above to test the field-weave idea with a few clear examples before you continue.</div>;
}
