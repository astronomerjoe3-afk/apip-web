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
          <h4 className="text-lg font-semibold text-slate-900">Packet-Pattern Frame lens</h4>
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

function hitDotX(index: number, width: number): number {
  return 70 + ((index * 41) % (width - 140));
}

function hitDotY(index: number, height: number, spread: number): number {
  const center = height * 0.5;
  const pattern = Math.sin(index * 0.65) * spread * 0.6 + Math.sin(index * 0.17) * spread * 0.35;
  return center + pattern;
}

export default function A5SimulationPanels({
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
  simBias,
  setSimBias,
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A5_L1") {
    const packetGrade = clamp(simVectorMagnitude, 0.5, 3.0);
    const beamCount = Math.round(clamp(simMetricMeters, 1, 12));
    const unlockToll = clamp(simBias, 0.7, 2.6);
    const emission = packetGrade >= unlockToll;
    const emissionCount = emission ? beamCount : 0;
    const kick = emission ? packetGrade - unlockToll : 0;
    return renderPanel(
      "Release gate",
      <>
        {sliderField("Packet grade", `${formatSimulationNumber(packetGrade, 2)} eV`, <input className="w-full" type="range" min="0.5" max="3.0" step="0.05" value={packetGrade} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Beam count", `${beamCount} packets/s`, <input className="w-full" type="range" min="1" max="12" step="1" value={beamCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Unlock toll", `${formatSimulationNumber(unlockToll, 2)} eV`, <input className="w-full" type="range" min="0.7" max="2.6" step="0.05" value={unlockToll} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Threshold board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eef2ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Each photon must beat the release gate on its own</text>
        <rect x="290" y="82" width="24" height="110" rx="12" fill="#1e293b" />
        <line x1="302" y1="70" x2="302" y2="204" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" />
        {Array.from({ length: beamCount }).map((_, index) => {
          const y = 92 + index * 9;
          return <line key={y} x1="92" y1={y} x2="250" y2={y} stroke={packetGrade >= unlockToll ? "#22c55e" : "#ef4444"} strokeWidth="6" strokeLinecap="round" />;
        })}
        <text x="88" y="208" fill="#475569" fontSize="18">{packetGrade < unlockToll ? "Low-grade packets still fail" : "Packets clear the gate"}</text>
        <text x="334" y="116" fill="#0f172a" fontSize="18">unlock toll = {formatSimulationNumber(unlockToll, 2)} eV</text>
        <text x="334" y="150" fill="#0f766e" fontSize="18">packet grade = {formatSimulationNumber(packetGrade, 2)} eV</text>
      </svg>,
      <>
        {metricCard("Gate status", emission ? "open" : "closed", emission ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Emission count", `${emissionCount} / s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Max kick", `${formatSimulationNumber(kick, 2)} eV`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Main clue", emission ? "threshold crossed" : "threshold not met", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Threshold is per photon.", "Beam count changes how many tries happen.", "Crossing threshold starts immediate emission."],
      "This board keeps packet grade and beam count separate so brightness never sneaks back in as photon energy.",
    );
  }

  if (lessonKey === "A5_L2") {
    const photonEnergy = clamp(simVectorMagnitude, 1.0, 6.0);
    const workFunction = clamp(simBias, 0.8, 4.5);
    const beamCount = Math.round(clamp(simMetricMeters, 1, 10));
    const kick = Math.max(0, photonEnergy - workFunction);
    return renderPanel(
      "Packet kick",
      <>
        {sliderField("Photon energy", `${formatSimulationNumber(photonEnergy, 2)} eV`, <input className="w-full" type="range" min="1.0" max="6.0" step="0.05" value={photonEnergy} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Work function", `${formatSimulationNumber(workFunction, 2)} eV`, <input className="w-full" type="range" min="0.8" max="4.5" step="0.05" value={workFunction} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Beam count", `${beamCount} packets/s`, <input className="w-full" type="range" min="1" max="10" step="1" value={beamCount} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Energy budget board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Photon energy splits into toll plus leftover kick</text>
        <rect x="96" width="120" height={Math.max(20, photonEnergy * 18)} y={176 - Math.max(20, photonEnergy * 18)} fill="#38bdf8" rx="16" />
        <rect x="278" width="120" height={Math.max(20, Math.min(photonEnergy, workFunction) * 18)} y={176 - Math.max(20, Math.min(photonEnergy, workFunction) * 18)} fill="#f97316" rx="16" />
        <rect x="460" width="120" height={Math.max(12, kick * 18)} y={176 - Math.max(12, kick * 18)} fill="#22c55e" rx="16" />
        <text x="156" y="196" textAnchor="middle" fill="#0f172a" fontSize="18">hf</text>
        <text x="338" y="196" textAnchor="middle" fill="#0f172a" fontSize="18">phi</text>
        <text x="520" y="196" textAnchor="middle" fill="#0f172a" fontSize="18">Kmax</text>
        <text x="314" y="84" textAnchor="middle" fill="#475569" fontSize="18">Threshold case appears when Kmax falls to zero</text>
      </svg>,
      <>
        {metricCard("Photon energy", `${formatSimulationNumber(photonEnergy, 2)} eV`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Work function", `${formatSimulationNumber(workFunction, 2)} eV`, "border-orange-200 bg-orange-50 text-orange-900")}
        {metricCard("Kmax", `${formatSimulationNumber(kick, 2)} eV`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Event rate clue", `${beamCount} / s`, "border-violet-200 bg-violet-50 text-violet-900")}
      </>,
      ["Read hf = phi + Kmax as bookkeeping.", "Threshold means the leftover bar shrinks to zero.", "Beam count still changes rate, not Kmax."],
      "The three bars keep incoming energy, unlock toll, and leftover kick on one line of thought.",
    );
  }

  if (lessonKey === "A5_L3") {
    const particleCount = Math.round(clamp(simDensityMass, 6, 80));
    const momentum = clamp(simVectorMagnitude, 0.6, 4.0);
    const baseSpread = clamp(simSpread, 18, 70);
    const visualSpread = clamp(baseSpread * (1.6 / momentum), 12, 78);
    const wavelength = 1 / momentum;
    return renderPanel(
      "Pattern map",
      <>
        {sliderField("Particle count", `${particleCount}`, <input className="w-full" type="range" min="6" max="80" step="1" value={particleCount} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Momentum", `${formatSimulationNumber(momentum, 2)} arb`, <input className="w-full" type="range" min="0.6" max="4.0" step="0.05" value={momentum} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Pattern spread", `${formatSimulationNumber(visualSpread, 1)}`, <input className="w-full" type="range" min="18" max="70" step="1" value={baseSpread} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Hit-pattern board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#0f172a" />
        <text x="48" y="54" fill="#f8fafc" fontSize="22" fontWeight="700">Hit dots stay local while the map grows wave-like</text>
        <text x="48" y="80" fill="#cbd5e1" fontSize="18">More momentum -&gt; shorter de Broglie wavelength -&gt; tighter pattern scale</text>
        {Array.from({ length: particleCount }).map((_, index) => (
          <circle key={index} cx={hitDotX(index, 640)} cy={hitDotY(index, 250, visualSpread)} r="3.4" fill="#38bdf8" opacity={0.78} />
        ))}
        <line x1="64" y1="125" x2="576" y2="125" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 6" />
      </svg>,
      <>
        {metricCard("Count", `${particleCount} hits`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("lambda", `${formatSimulationNumber(wavelength, 3)} h/p units`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Pattern width", `${formatSimulationNumber(visualSpread, 1)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Board lesson", particleCount < 18 ? "mostly dots" : "pattern emerging", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["One event gives one dot.", "Many dots reveal the distribution.", "Momentum changes wavelength and therefore pattern scale."],
      "The dot field never hides the fact that localization and pattern-building answer different modern-physics questions.",
    );
  }

  if (lessonKey === "A5_L4") {
    const bindingBefore = clamp(simDensityMass, 4.5, 8.5);
    const bindingAfter = clamp(simDensityVolume, 5.0, 10.0);
    const released = Math.max(0, bindingAfter - bindingBefore);
    const massDefect = released * 0.0025;
    return renderPanel(
      "Core bundle",
      <>
        {sliderField("Initial binding", `${formatSimulationNumber(bindingBefore, 2)} arb`, <input className="w-full" type="range" min="4.5" max="8.5" step="0.05" value={bindingBefore} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Final binding", `${formatSimulationNumber(bindingAfter, 2)} arb`, <input className="w-full" type="range" min="5.0" max="10.0" step="0.05" value={bindingAfter} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Mass scale", `${formatSimulationNumber(simMetricMeters, 2)} u`, <input className="w-full" type="range" min="1.0" max="6.0" step="0.05" value={clamp(simMetricMeters, 1.0, 6.0)} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Binding board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#f8fafc" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">More tightly bound bundles can release energy</text>
        <g transform="translate(170 136)">
          {Array.from({ length: 6 }).map((_, index) => (
            <circle key={`b-${index}`} cx={Math.cos((index / 6) * Math.PI * 2) * 34} cy={Math.sin((index / 6) * Math.PI * 2) * 34} r="15" fill="#93c5fd" />
          ))}
          <text x="0" y="72" textAnchor="middle" fill="#475569" fontSize="18">before</text>
        </g>
        <g transform="translate(462 136)">
          {Array.from({ length: 6 }).map((_, index) => (
            <circle key={`a-${index}`} cx={Math.cos((index / 6) * Math.PI * 2) * Math.max(18, 42 - released * 7)} cy={Math.sin((index / 6) * Math.PI * 2) * Math.max(18, 42 - released * 7)} r="15" fill="#60a5fa" />
          ))}
          <text x="0" y="72" textAnchor="middle" fill="#475569" fontSize="18">after</text>
        </g>
        <text x="318" y="138" textAnchor="middle" fill="#0f766e" fontSize="20" fontWeight="700">Delta E = Delta m c^2</text>
      </svg>,
      <>
        {metricCard("Binding gain", `${formatSimulationNumber(released, 2)} arb`, released > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Mass defect", `${formatSimulationNumber(massDefect, 4)} u`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Energy release", `${formatSimulationNumber(released * 2.4, 2)} x10^13 J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Main story", released > 0 ? "tighter final bundle" : "no release yet", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Binding change lives inside the nucleus.", "Mass defect is bookkeeping for the energy change.", "Nuclear energy is not just bigger chemistry."],
      "This comparison board keeps binding, mass defect, and energy release inside one before-and-after nuclear story.",
    );
  }

  if (lessonKey === "A5_L5") {
    const beta = clamp(simVectorMagnitude, 0, 0.92);
    const properTick = clamp(simMetricMeters, 1.0, 5.0);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const dilatedTick = gamma * properTick;
    const diagonalLift = 90 + beta * 110;
    return renderPanel(
      "Pulse clock",
      <>
        {sliderField("Relative speed", `${formatSimulationNumber(beta, 2)} c`, <input className="w-full" type="range" min="0" max="0.92" step="0.01" value={beta} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Proper tick", `${formatSimulationNumber(properTick, 2)} us`, <input className="w-full" type="range" min="1.0" max="5.0" step="0.05" value={properTick} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Clock height", `${formatSimulationNumber(clamp(simVectorAngle, 40, 120), 0)} units`, <input className="w-full" type="range" min="40" max="120" step="1" value={clamp(simVectorAngle, 40, 120)} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Light-clock board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#eff6ff" />
        <text x="48" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Same c plus a longer light path means a longer tick</text>
        <line x1="176" y1="88" x2="176" y2="182" stroke="#0f172a" strokeWidth="6" />
        <line x1="452" y1="88" x2="452" y2="182" stroke="#0f172a" strokeWidth="6" />
        <line x1="176" y1="182" x2={176 + diagonalLift} y2="88" stroke="#38bdf8" strokeWidth="6" />
        <line x1={176 + diagonalLift} y1="88" x2="452" y2="182" stroke="#38bdf8" strokeWidth="6" opacity="0.8" />
        <text x="120" y="206" fill="#475569" fontSize="18">rest path</text>
        <text x="392" y="206" fill="#0f766e" fontSize="18">moving-frame diagonal path</text>
      </svg>,
      <>
        {metricCard("Gamma", `${formatSimulationNumber(gamma, 3)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Proper tick", `${formatSimulationNumber(properTick, 2)} us`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Dilated tick", `${formatSimulationNumber(dilatedTick, 2)} us`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Cause", beta < 0.05 ? "frames agree" : "same c, longer path", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Start from invariant c.", "A longer path with the same c needs more time.", "The clock is not broken in its own frame."],
      "The light-clock board keeps the geometry and the timing on one comparison so time dilation never turns into a broken-clock myth.",
    );
  }

  if (lessonKey === "A5_L6") {
    const beta = clamp(simVectorMagnitude, 0, 0.92);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    const properLength = clamp(simMetricMeters, 6, 24);
    const contracted = properLength / gamma;
    const eventGap = clamp(simSpread, 50, 170);
    const slip = clamp(simBias, 0, 1) * beta * 50;
    return renderPanel(
      "Frame map",
      <>
        {sliderField("Relative speed", `${formatSimulationNumber(beta, 2)} c`, <input className="w-full" type="range" min="0" max="0.92" step="0.01" value={beta} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Proper length", `${formatSimulationNumber(properLength, 1)} m`, <input className="w-full" type="range" min="6" max="24" step="0.2" value={properLength} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Event spacing", `${formatSimulationNumber(eventGap, 0)} units`, <input className="w-full" type="range" min="50" max="170" step="1" value={eventGap} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Relativity map board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="24" y="22" width="592" height="196" rx="28" fill="#0f172a" />
        <text x="48" y="54" fill="#f8fafc" fontSize="22" fontWeight="700">Moving frames compare different spans and different same-now lines</text>
        <rect x="92" y="100" width={properLength * 12} height="18" rx="9" fill="#38bdf8" />
        <rect x="92" y="156" width={contracted * 12} height="18" rx="9" fill="#22c55e" />
        <line x1={360 - eventGap * 0.5} y1="82" x2={360 - eventGap * 0.5 + slip} y2="194" stroke="#f97316" strokeWidth="4" />
        <line x1={360 + eventGap * 0.5} y1="82" x2={360 + eventGap * 0.5 + slip} y2="194" stroke="#f97316" strokeWidth="4" />
        <text x="94" y="92" fill="#cbd5e1" fontSize="18">proper length</text>
        <text x="94" y="148" fill="#cbd5e1" fontSize="18">contracted length</text>
        <text x="388" y="206" fill="#f8fafc" fontSize="18">same-now slip grows with speed</text>
      </svg>,
      <>
        {metricCard("Gamma", `${formatSimulationNumber(gamma, 3)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Proper length", `${formatSimulationNumber(properLength, 1)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Contracted span", `${formatSimulationNumber(contracted, 1)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Simultaneity", beta < 0.05 ? "shared now" : "frame-dependent", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Proper length belongs to the rest frame.", "Contraction is along the motion direction.", "Same-now judgments need not match across moving frames."],
      "This map board keeps rods and event timing together so contraction and simultaneity stay inside one relativity rulebook.",
    );
  }

  return renderPanel(
    "Lesson explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its lesson-specific Packet-Pattern Frame panel.
    </div>,
    "Explorer placeholder",
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600">
      No generic fallback panel is being substituted here.
    </div>,
    <>
      {metricCard("Lesson", lessonKey, "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Status", "explicit panel required", "border-amber-200 bg-amber-50 text-amber-900")}
    </>,
    [
      "Each A5 lesson should own its explorer directly.",
      "If this appears, the lesson wiring needs a dedicated panel.",
      "Modern physics lessons should not silently fall through to a generic activity.",
    ],
    "This safety fallback is intentionally neutral so an unhandled A5 lesson key cannot masquerade as a different explorer.",
  );
}
