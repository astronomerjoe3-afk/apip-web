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

function boardFrame(title: string, body: ReactNode): ReactNode {
  return (
    <div className={panelClass}>
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">{body}</div>
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

function plazaState(pulse: number, grip: number): "Lock Mode" | "Slide Mode" | "Drift Mode" {
  if (grip >= pulse + 2) return "Lock Mode";
  if (grip >= pulse - 1) return "Slide Mode";
  return "Drift Mode";
}

function stateTone(state: string): string {
  switch (state) {
    case "Lock Mode":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "Slide Mode":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

export default function M5SimulationPanels({
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
  const render = (
    title: string,
    controls: ReactNode,
    boardTitle: string,
    board: ReactNode,
    readings: ReactNode,
    lens: string[],
    note: string,
  ) => (
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
        {boardFrame(boardTitle, board)}
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );

  if (lessonKey === "M5_L1") {
    const pulse = clamp(simVectorMagnitude, 1, 10);
    const grip = clamp(simMetricMeters, 1, 10);
    const crowd = clamp(simDensityMass, 8, 36);
    const state = plazaState(pulse, grip);
    const spacingIndex = clamp(10 - grip + pulse / 2, 2, 12);
    return render(
      "Particle rules lab",
      <>
        {sliderField("Pulse Dial", `${formatSimulationNumber(pulse, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={pulse} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Grip Dial", `${formatSimulationNumber(grip, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={grip} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Crowd size", `${formatSimulationNumber(crowd, 0)} pucks`, <input className="w-full" type="range" min="8" max="36" step="2" value={crowd} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
      </>,
      "Pulse-Plaza starter board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="18" y="18" width="604" height="214" rx="28" fill="#eff6ff" />
        <text x="42" y="46" fill="#0f172a" fontSize="22" fontWeight="700">Same-size micro-pucks, changing crowd pattern</text>
        {[0, 1, 2, 3, 4].map((row) =>
          [0, 1, 2, 3, 4, 5].map((col) => (
            <circle key={`${row}-${col}`} cx={86 + col * 42 + (row % 2 ? 10 : 0)} cy={92 + row * 26} r="10" fill="#38bdf8" />
          )),
        )}
        <rect x="376" y="74" width="190" height="104" rx="22" fill={state === "Lock Mode" ? "#dbeafe" : state === "Slide Mode" ? "#dcfce7" : "#fef3c7"} stroke={state === "Lock Mode" ? "#3b82f6" : state === "Slide Mode" ? "#22c55e" : "#f59e0b"} strokeWidth="4" />
        <text x="406" y="110" fill="#0f172a" fontSize="20" fontWeight="700">{state}</text>
        <text x="406" y="140" fill="#334155" fontSize="16">Particle size: fixed</text>
        <text x="406" y="164" fill="#334155" fontSize="16">Spacing index: {formatSimulationNumber(spacingIndex, 1)}</text>
        <text x="42" y="210" fill="#475569" fontSize="15">Heating and changing grip alter motion and spacing patterns, not the size of the particles.</text>
      </svg>,
      <>
        {metricCard("State mode", state, stateTone(state))}
        {metricCard("Particle size", "1.0 unit fixed", "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Pulse Level", formatSimulationNumber(pulse, 0), "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Grip Level", formatSimulationNumber(grip, 0), "border-cyan-200 bg-cyan-50 text-cyan-900")}
        {metricCard("Crowd size", `${formatSimulationNumber(crowd, 0)} pucks`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Spacing index", formatSimulationNumber(spacingIndex, 1), "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Ask what belongs to one particle and what belongs to the whole material.",
        "Heating changes motion and spacing tendencies, not particle size.",
        "State language needs motion, spacing, and attraction together.",
      ],
      "This board protects the lesson's first rule: the particles stay the same size, even while the whole crowd becomes more lively or more spread out.",
    );
  }

  if (lessonKey === "M5_L2") {
    const pulse = clamp(simVectorMagnitude, 1, 10);
    const grip = clamp(simMetricMeters, 1, 10);
    const neighborSwaps = clamp(simSpread, 0, 20);
    const state = neighborSwaps <= 2 ? "Lock Mode" : "Slide Mode";
    return render(
      "Lock and slide builder",
      <>
        {sliderField("Pulse Dial", `${formatSimulationNumber(pulse, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={pulse} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Grip Dial", `${formatSimulationNumber(grip, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={grip} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Neighbor swaps / interval", `${formatSimulationNumber(neighborSwaps, 0)}`, <input className="w-full" type="range" min="0" max="20" step="1" value={neighborSwaps} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Lock and Slide board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="26" width="262" height="186" rx="24" fill="#e0f2fe" />
        <rect x="358" y="26" width="262" height="186" rx="24" fill="#dcfce7" />
        <text x="58" y="54" fill="#1d4ed8" fontSize="20" fontWeight="700">Lock Mode</text>
        <text x="396" y="54" fill="#15803d" fontSize="20" fontWeight="700">Slide Mode</text>
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <circle key={`l-${row}-${col}`} cx={76 + col * 42} cy={92 + row * 34} r="12" fill="#3b82f6" />
          )),
        )}
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <circle key={`s-${row}-${col}`} cx={414 + col * 42 + (row === 1 ? 8 : 0)} cy={92 + row * 34} r="12" fill="#22c55e" />
          )),
        )}
        <text x="54" y="192" fill="#334155" fontSize="15">Close particles, fixed positions</text>
        <text x="392" y="192" fill="#334155" fontSize="15">Close particles, changing neighbors</text>
      </svg>,
      <>
        {metricCard("Current mode", state, state === "Lock Mode" ? "border-sky-200 bg-sky-50 text-sky-900" : "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Neighbor swaps", formatSimulationNumber(neighborSwaps, 0), "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Spacing clue", "Still close-packed", "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Motion clue", state === "Lock Mode" ? "Vibration in place" : "Ready to flow", "border-violet-200 bg-violet-50 text-violet-900")}
      </>,
      [
        "Keep spacing close in both states so flow is not confused with huge gaps.",
        "Use neighbor mobility to separate solid from liquid.",
        "A liquid is not just a faster gas; it is still crowded matter.",
      ],
      "The board holds spacing nearly constant while mobility changes, so students can see that liquids differ from solids more in neighbor freedom than in particle separation.",
    );
  }

  if (lessonKey === "M5_L3") {
    const pulse = clamp(simVectorMagnitude, 2, 10);
    const grip = clamp(simMetricMeters, 0, 6);
    const pebbleOn = clamp(simBias, 0, 1) > 0.4;
    const collisionRate = pulse * (12 - grip);
    const jitter = pebbleOn ? collisionRate / 6 : 0;
    return render(
      "Drift and jostle lab",
      <>
        {sliderField("Pulse Dial", `${formatSimulationNumber(pulse, 0)}`, <input className="w-full" type="range" min="2" max="10" step="1" value={pulse} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Grip Dial", `${formatSimulationNumber(grip, 0)}`, <input className="w-full" type="range" min="0" max="6" step="1" value={grip} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Wander Pebble", pebbleOn ? "On" : "Off", <input className="w-full" type="range" min="0" max="1" step="1" value={pebbleOn ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Drift Mode board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="18" y="18" width="604" height="214" rx="28" fill="#f8fafc" />
        <text x="40" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Gas crowd and Wander Pebble path</text>
        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
          <circle key={n} cx={64 + n * 78} cy={80 + ((n % 3) * 42)} r="8" fill="#38bdf8" />
        ))}
        {pebbleOn ? (
          <>
            <path d="M270 168 C295 140 315 176 344 146 S392 188 426 140 S488 172 520 128" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
            <circle cx="520" cy="128" r="14" fill="#f97316" />
          </>
        ) : null}
        <text x="42" y="212" fill="#475569" fontSize="15">Brownian motion appears when a visible pebble is jostled by many unseen collisions.</text>
      </svg>,
      <>
        {metricCard("State mode", "Drift Mode", "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Collision rate", formatSimulationNumber(collisionRate, 0), "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Wander Pebble", pebbleOn ? "Tracing path" : "Hidden", "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Brownian jitter", pebbleOn ? formatSimulationNumber(jitter, 1) : "0.0", "border-violet-200 bg-violet-50 text-violet-900")}
      </>,
      [
        "Gas particles are far apart and move freely between collisions.",
        "The visible pebble only reveals the collision story; it does not cause it.",
        "Raising the pulse increases the strength of the random jostling.",
      ],
      "This board turns invisible molecular motion into a visible shaky path, which is why Brownian motion is such strong evidence for the particle model.",
    );
  }

  if (lessonKey === "M5_L4") {
    const pulse = clamp(simVectorMagnitude, 1, 10);
    const crowdA = clamp(simDensityMass, 8, 40);
    const crowdB = clamp(simDensityVolume, 8, 40);
    const totalA = pulse * crowdA;
    const totalB = pulse * crowdB;
    return render(
      "Pulse level comparer",
      <>
        {sliderField("Shared Pulse Level", `${formatSimulationNumber(pulse, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={pulse} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Crowd A size", `${formatSimulationNumber(crowdA, 0)} pucks`, <input className="w-full" type="range" min="8" max="40" step="2" value={crowdA} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Crowd B size", `${formatSimulationNumber(crowdB, 0)} pucks`, <input className="w-full" type="range" min="8" max="40" step="2" value={crowdB} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Same Pulse board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="28" width="250" height="176" rx="24" fill="#dbeafe" />
        <rect x="366" y="28" width="250" height="176" rx="24" fill="#dcfce7" />
        <text x="54" y="58" fill="#1d4ed8" fontSize="20" fontWeight="700">Crowd A</text>
        <text x="396" y="58" fill="#166534" fontSize="20" fontWeight="700">Crowd B</text>
        <text x="50" y="94" fill="#1e3a8a" fontSize="16">Pulse Level: {formatSimulationNumber(pulse, 0)}</text>
        <text x="392" y="94" fill="#166534" fontSize="16">Pulse Level: {formatSimulationNumber(pulse, 0)}</text>
        <text x="50" y="130" fill="#334155" fontSize="16">Crowd size: {formatSimulationNumber(crowdA, 0)}</text>
        <text x="392" y="130" fill="#334155" fontSize="16">Crowd size: {formatSimulationNumber(crowdB, 0)}</text>
        <rect x="50" y="154" width={Math.min(180, totalA * 3)} height="18" rx="9" fill="#3b82f6" />
        <rect x="392" y="154" width={Math.min(180, totalB * 3)} height="18" rx="9" fill="#22c55e" />
        <text x="50" y="198" fill="#475569" fontSize="15">Same pulse, different whole-system totals</text>
      </svg>,
      <>
        {metricCard("Temperature reading", `Same pulse ${formatSimulationNumber(pulse, 0)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Crowd A total-motion proxy", formatSimulationNumber(totalA, 0), "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Crowd B total-motion proxy", formatSimulationNumber(totalB, 0), "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Average jiggle", "Matched", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Temperature answers an average-motion question.",
        "Matching the pulse does not force the same total internal energy.",
        "Crowd size can change the whole-system total while the average stays fixed.",
      ],
      "The matched Pulse Level keeps the temperature story fixed, so any remaining difference belongs to the size of the system rather than to the average particle motion.",
    );
  }

  if (lessonKey === "M5_L5") {
    const pulse = clamp(simVectorMagnitude, 1, 10);
    const crowd = clamp(simDensityMass, 8, 40);
    const linkShare = clamp(simSpread, 0, 100);
    const kinetic = pulse * crowd;
    const potential = (crowd * linkShare) / 5;
    const total = kinetic + potential;
    return render(
      "Plaza Store ledger",
      <>
        {sliderField("Pulse Dial", `${formatSimulationNumber(pulse, 0)}`, <input className="w-full" type="range" min="1" max="10" step="1" value={pulse} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Crowd size", `${formatSimulationNumber(crowd, 0)} pucks`, <input className="w-full" type="range" min="8" max="40" step="2" value={crowd} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Link-share level", `${formatSimulationNumber(linkShare, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="5" value={linkShare} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Plaza Store board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="20" y="24" width="600" height="190" rx="26" fill="#f8fafc" />
        <text x="42" y="50" fill="#0f172a" fontSize="22" fontWeight="700">Whole-system store = motion part + link part</text>
        <rect x="72" y="112" width="180" height="22" rx="11" fill="#3b82f6" />
        <rect x="72" y="150" width={Math.min(220, potential * 1.2)} height="22" rx="11" fill="#22c55e" />
        <rect x="368" y="112" width={Math.min(220, total)} height="30" rx="15" fill="#8b5cf6" />
        <text x="72" y="102" fill="#1d4ed8" fontSize="16" fontWeight="700">Kinetic part</text>
        <text x="72" y="142" fill="#166534" fontSize="16" fontWeight="700">Link part</text>
        <text x="368" y="102" fill="#6d28d9" fontSize="16" fontWeight="700">Plaza Store total</text>
        <text x="368" y="170" fill="#334155" fontSize="16">Same pulse does not force same total</text>
      </svg>,
      <>
        {metricCard("Kinetic share", `${formatSimulationNumber(kinetic, 0)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Link share", `${formatSimulationNumber(potential, 0)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Plaza Store", `${formatSimulationNumber(total, 0)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Temperature question", `Pulse ${formatSimulationNumber(pulse, 0)}`, "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Internal energy includes both motion and arrangement contributions.",
        "Same pulse can still leave different totals when crowd size or arrangement changes.",
        "The store meter is answering a whole-system question, not an average one.",
      ],
      "The purple total depends on more than the pulse bar alone, which is why internal energy is broader than temperature.",
    );
  }

  const energyInput = clamp(simVectorMagnitude, 0, 200);
  const pulseShare = clamp(simMetricMeters, 0, 100);
  const linkShare = 100 - pulseShare;
  const pulseRise = (energyInput * pulseShare) / 100;
  const linkRise = (energyInput * linkShare) / 100;
  const stateProgress = linkRise / 10;

  return render(
    "State-change mission deck",
    <>
      {sliderField("Added mission energy", `${formatSimulationNumber(energyInput, 0)} units`, <input className="w-full" type="range" min="0" max="200" step="10" value={energyInput} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      {sliderField("Share to pulse rise", `${formatSimulationNumber(pulseShare, 0)}%`, <input className="w-full" type="range" min="0" max="100" step="5" value={pulseShare} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center justify-between gap-4 text-sm text-emerald-900">
          <span>Share to link release</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold tabular-nums text-emerald-950">
            {formatSimulationNumber(linkShare, 0)}%
          </span>
        </div>
        <p className="mt-2 text-sm text-emerald-800">
          This is the complementary share left after the pulse-rise share is chosen.
        </p>
      </div>
    </>,
    "State-change energy board",
    <svg viewBox="0 0 640 250" className="w-full">
      <rect x="20" y="24" width="600" height="194" rx="26" fill="#f8fafc" />
      <text x="42" y="50" fill="#0f172a" fontSize="22" fontWeight="700">Added energy can split between pulse and links</text>
      <rect x="66" y="96" width={Math.min(220, pulseRise * 2)} height="26" rx="13" fill="#3b82f6" />
      <rect x="66" y="144" width={Math.min(220, linkRise * 2)} height="26" rx="13" fill="#22c55e" />
      <text x="66" y="88" fill="#1d4ed8" fontSize="16" fontWeight="700">Pulse rise share</text>
      <text x="66" y="136" fill="#166534" fontSize="16" fontWeight="700">Link release share</text>
      <rect x="388" y="90" width="170" height="82" rx="24" fill="#ede9fe" stroke="#8b5cf6" strokeWidth="4" />
      <text x="416" y="122" fill="#6d28d9" fontSize="18" fontWeight="700">State progress</text>
      <text x="452" y="150" fill="#6d28d9" fontSize="18" fontWeight="700">{formatSimulationNumber(stateProgress, 1)}</text>
      <text x="66" y="202" fill="#475569" fontSize="15">Large link share means the store can rise strongly while temperature changes only a little.</text>
    </svg>,
    <>
      {metricCard("Pulse rise share", `${formatSimulationNumber(pulseRise, 0)}`, "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Link release share", `${formatSimulationNumber(linkRise, 0)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("State progress", formatSimulationNumber(stateProgress, 1), "border-violet-200 bg-violet-50 text-violet-900")}
      {metricCard("Internal-energy rise", `${formatSimulationNumber(energyInput, 0)}`, "border-slate-200 bg-slate-50 text-slate-900")}
    </>,
    [
      "Added energy does not always mainly show up as a temperature rise.",
      "State change often needs energy for arrangement change as well as motion change.",
      "Tracking the energy destination explains why internal energy can rise faster than temperature.",
    ],
    "This board makes the capstone point visible: during a state change, the whole store can climb strongly even when the pulse meter only nudges upward.",
  );
}
