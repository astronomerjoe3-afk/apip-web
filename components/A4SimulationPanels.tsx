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
          <h4 className="text-lg font-semibold text-slate-900">Bounce-Chamber lens</h4>
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

function particleDots(count: number, width: number, height: number, hot: boolean): ReactNode[] {
  const dots: ReactNode[] = [];
  const cols = Math.max(3, Math.min(6, Math.ceil(Math.sqrt(count))));
  const rows = Math.max(2, Math.ceil(count / cols));
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = 40 + ((width - 80) * (col + 0.5)) / cols;
    const y = 36 + ((height - 72) * (row + 0.5)) / rows;
    const dx = hot ? 18 + (index % 3) * 4 : 10 + (index % 3) * 3;
    const dy = hot ? 10 + (index % 4) * 3 : 6 + (index % 4) * 2;
    const fill = hot ? (index % 2 === 0 ? "#f59e0b" : "#38bdf8") : "#60a5fa";
    dots.push(<circle key={`p-${index}`} cx={x} cy={y} r="6" fill={fill} />);
    dots.push(
      <line
        key={`v-${index}`}
        x1={x}
        y1={y}
        x2={x + (index % 2 === 0 ? dx : -dx)}
        y2={y + (index % 3 === 0 ? -dy : dy)}
        stroke={fill}
        strokeWidth="2.5"
      />,
    );
  }
  return dots;
}

export default function A4SimulationPanels({
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
  if (lessonKey === "A4_L1") {
    const crowd = Math.round(clamp(simFluidDensity, 6, 20));
    const room = clamp(simMetricMeters, 0.8, 2.4);
    const dash = clamp(simVectorMagnitude, 0.8, 2.2);
    const pressure = (crowd * dash) / room;
    return renderPanel(
      "Wall-hit builder",
      <>
        {sliderField("Crowd count", `${crowd}`, <input className="w-full" type="range" min="6" max="20" step="1" value={crowd} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Room size", `${formatSimulationNumber(room, 2)} V-units`, <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={room} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Dash level", `${formatSimulationNumber(dash, 2)} T-units`, <input className="w-full" type="range" min="0.8" max="2.2" step="0.05" value={dash} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Pressure board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width={220 * room} height="150" rx="24" fill="#111827" stroke="#38bdf8" strokeWidth="5" />
        {particleDots(crowd, 220 * room, 150, dash > 1.4)}
        <line x1={60 + 220 * room} y1="74" x2={180 + 220 * room} y2="74" stroke="#f97316" strokeWidth="5" />
        <line x1={60 + 220 * room} y1="118" x2={180 + 220 * room} y2="118" stroke="#f97316" strokeWidth="5" />
        <line x1={60 + 220 * room} y1="162" x2={180 + 220 * room} y2="162" stroke="#f97316" strokeWidth="5" />
        <text x={170 + 220 * room} y="124" fill="#f97316" fontSize="20">wall-hit load</text>
        <text x="54" y="212" fill="#475569" fontSize="18">Smaller room or hotter / more numerous dashers raise pressure.</text>
      </svg>,
      <>
        {metricCard("Pressure", `${formatSimulationNumber(pressure, 2)} arb`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Collision story", crowd > 12 ? "many hits" : "fewer hits", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Room effect", room < 1.2 ? "crowded chamber" : "more room", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Dash effect", dash > 1.4 ? "harder hits" : "gentler hits", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Pressure is a wall-collision story.", "Crowd count, room size, and dash level all matter.", "Equilibrium keeps the averages steady, not the particles still."],
      "This board keeps pressure tied to collisions and chamber geometry before the ideal gas law appears.",
    );
  }

  if (lessonKey === "A4_L2") {
    const amount = clamp(simFluidDensity, 0.8, 2.6);
    const volume = clamp(simMetricMeters, 0.8, 2.4);
    const temperature = clamp(simVectorMagnitude, 0.8, 2.2);
    const pressure = (amount * temperature) / volume;
    const left = pressure * volume;
    const right = amount * temperature;
    return renderPanel(
      "Chamber resize",
      <>
        {sliderField("Amount of gas", `${formatSimulationNumber(amount, 2)} n-units`, <input className="w-full" type="range" min="0.8" max="2.6" step="0.05" value={amount} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Volume", `${formatSimulationNumber(volume, 2)} V-units`, <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={volume} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Temperature", `${formatSimulationNumber(temperature, 2)} T-units`, <input className="w-full" type="range" min="0.8" max="2.2" step="0.05" value={temperature} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Gas-law balance board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="44" y="52" width="200" height="130" rx="24" fill="#dbeafe" />
        <rect x="396" y="52" width="200" height="130" rx="24" fill="#dcfce7" />
        <text x="144" y="118" fill="#0f172a" fontSize="46" fontWeight="700" textAnchor="middle">pV</text>
        <text x="496" y="118" fill="#0f172a" fontSize="46" fontWeight="700" textAnchor="middle">nRT</text>
        <text x="144" y="154" fill="#334155" fontSize="18" textAnchor="middle">wall-hit side</text>
        <text x="496" y="154" fill="#334155" fontSize="18" textAnchor="middle">crowd-dash side</text>
        <line x1="244" y1="116" x2="396" y2="116" stroke="#facc15" strokeWidth="8" />
        <text x="320" y="96" fill="#a16207" fontSize="18" textAnchor="middle">balance</text>
      </svg>,
      <>
        {metricCard("pV", `${formatSimulationNumber(left, 2)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("nRT", `${formatSimulationNumber(right, 2)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Pressure", `${formatSimulationNumber(pressure, 2)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Status", Math.abs(left - right) < 0.01 ? "balanced" : "tracking", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["pV = nRT is a balance rule.", "Holding two variables fixed makes the third easier to explain.", "The particle and mole forms describe the same chamber state."],
      "Use the board as a physical reminder that each symbol stands for part of one chamber story.",
    );
  }

  if (lessonKey === "A4_L3") {
    const count = clamp(simFluidDensity, 0.8, 3.0);
    const mass = clamp(simDensityMass, 0.8, 3.0);
    const meanSquare = clamp(simVectorMagnitude, 0.8, 3.0);
    const volume = clamp(simMetricMeters, 0.8, 2.4);
    const pv = (count * mass * meanSquare) / 3;
    const pressure = pv / volume;
    return renderPanel(
      "Dash-level bridge",
      <>
        {sliderField("Particle count N", `${formatSimulationNumber(count, 2)}`, <input className="w-full" type="range" min="0.8" max="3" step="0.05" value={count} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Molecule mass m", `${formatSimulationNumber(mass, 2)}`, <input className="w-full" type="range" min="0.8" max="3" step="0.05" value={mass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Mean square speed ⟨c²⟩", `${formatSimulationNumber(meanSquare, 2)}`, <input className="w-full" type="range" min="0.8" max="3" step="0.05" value={meanSquare} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Volume V", `${formatSimulationNumber(volume, 2)}`, <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={volume} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Kinetic-theory board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="36" y="44" width="238" height="154" rx="24" fill="#111827" stroke="#38bdf8" strokeWidth="4" />
        {particleDots(9, 238, 154, true)}
        <line x1="280" y1="122" x2="374" y2="122" stroke="#f97316" strokeWidth="6" />
        <rect x="390" y="60" width="214" height="124" rx="24" fill="#eff6ff" />
        <text x="497" y="106" fill="#0f172a" fontSize="26" fontWeight="700" textAnchor="middle">pV = (1/3)Nm⟨c²⟩</text>
        <text x="497" y="144" fill="#0f172a" fontSize="22" textAnchor="middle">compare with pV = NkT</text>
      </svg>,
      <>
        {metricCard("pV", `${formatSimulationNumber(pv, 2)}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Pressure", `${formatSimulationNumber(pressure, 2)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Speed term", meanSquare > 1.8 ? "strong motion term" : "moderate motion term", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Bridge", "micro -> macro", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Pressure is built from wall momentum change.", "Mean square speed belongs in the bridge.", "Comparing the pV equations links temperature to molecular motion."],
      "This explorer keeps the microscopic inputs visible so the gas law feels explained, not duplicated.",
    );
  }

  if (lessonKey === "A4_L4") {
    const temperature = clamp(simVectorMagnitude, 150, 700);
    const massA = clamp(simDensityMass, 1, 5);
    const massB = clamp(simDensityVolume, 1, 5);
    const sampleSize = Math.round(clamp(simFluidDensity, 4, 16));
    const avgEk = 1.5 * temperature;
    const speedA = Math.sqrt(avgEk / massA);
    const speedB = Math.sqrt(avgEk / massB);
    return renderPanel(
      "Average dash energy",
      <>
        {sliderField("Temperature", `${formatSimulationNumber(temperature, 0)} K`, <input className="w-full" type="range" min="150" max="700" step="10" value={temperature} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Gas A mass", `${formatSimulationNumber(massA, 2)} m-units`, <input className="w-full" type="range" min="1" max="5" step="0.1" value={massA} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Gas B mass", `${formatSimulationNumber(massB, 2)} m-units`, <input className="w-full" type="range" min="1" max="5" step="0.1" value={massB} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Sample size", `${sampleSize}`, <input className="w-full" type="range" min="4" max="16" step="1" value={sampleSize} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
      </>,
      "Temperature board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="44" width="250" height="150" rx="24" fill="#dbeafe" />
        <rect x="356" y="44" width="250" height="150" rx="24" fill="#ffedd5" />
        <text x="159" y="78" fill="#0f172a" fontSize="20" fontWeight="700" textAnchor="middle">Gas A</text>
        <text x="481" y="78" fill="#0f172a" fontSize="20" fontWeight="700" textAnchor="middle">Gas B</text>
        <line x1="90" y1="138" x2={90 + speedA * 26} y2="138" stroke="#0ea5e9" strokeWidth="6" />
        <line x1="412" y1="138" x2={412 + speedB * 26} y2="138" stroke="#f97316" strokeWidth="6" />
        <text x="320" y="226" fill="#334155" fontSize="18" textAnchor="middle">{"Same temperature -> same average energy per molecule, not same speed"}</text>
      </svg>,
      <>
        {metricCard("Average energy", `${formatSimulationNumber(avgEk, 0)} arb`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Gas A speed hint", `${formatSimulationNumber(speedA, 2)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Gas B speed hint", `${formatSimulationNumber(speedB, 2)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Total energy note", `${sampleSize} molecules change total, not T`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Temperature is average energy per molecule.", "Same temperature does not force equal molecular speed.", "Sample size changes total energy more easily than temperature."],
      "This board keeps average energy, mass, and speed separate so the temperature idea stays precise.",
    );
  }

  if (lessonKey === "A4_L5") {
    const total = Math.round(clamp(simFluidDensity, 6, 18));
    const leftCount = Math.round(clamp(simBias, 1, total - 1));
    const openLevel = clamp(simMetricMeters, 0, 1);
    const spreadFactor = openLevel === 0 ? leftCount : total;
    const options = openLevel === 0 ? Math.max(4, leftCount * 2) : Math.max(12, total * total);
    return renderPanel(
      "Partition drop",
      <>
        {sliderField("Particle count", `${total}`, <input className="w-full" type="range" min="6" max="18" step="1" value={total} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />)}
        {sliderField("Confined left count", `${leftCount}`, <input className="w-full" type="range" min="1" max={Math.max(2, total - 1)} step="1" value={leftCount} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Partition state", openLevel < 0.5 ? "closed" : "open", <input className="w-full" type="range" min="0" max="1" step="1" value={Math.round(openLevel)} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Macrostate / microstate board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="34" y="44" width="250" height="150" rx="24" fill="#111827" stroke="#60a5fa" strokeWidth="4" />
        <rect x="356" y="44" width="250" height="150" rx="24" fill="#111827" stroke="#22c55e" strokeWidth="4" />
        <line x1="159" y1="44" x2="159" y2="194" stroke="#e2e8f0" strokeWidth="5" />
        {particleDots(leftCount, 120, 110, false)}
        {particleDots(spreadFactor, 250, 150, false)}
        <text x="159" y="214" fill="#334155" fontSize="18" textAnchor="middle">before</text>
        <text x="481" y="214" fill="#334155" fontSize="18" textAnchor="middle">after</text>
      </svg>,
      <>
        {metricCard("Visible macrostate", openLevel < 0.5 ? "confined" : "expanded", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Hidden playbooks", `${options}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Spread trend", openLevel < 0.5 ? "limited volume" : "more accessible volume", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Statistical favorite", openLevel < 0.5 ? "not yet" : "spread state", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Macrostate is the dashboard state.", "Microstate is one exact hidden arrangement.", "Opening more volume increases the number of accessible playbooks."],
      "The partition board helps the learner explain expansion statistically instead of saying the gas just 'likes disorder.'",
    );
  }

  if (lessonKey === "A4_L6") {
    const optionScale = Math.round(clamp(simSpread, 8, 80));
    const sharing = clamp(simVectorAngle, 0, 100);
    const lowW = Math.max(4, Math.round(optionScale / 2));
    const highW = Math.max(lowW + 4, optionScale);
    const entropyGap = Math.log(highW) - Math.log(lowW);
    return renderPanel(
      "Option-count boss",
      <>
        {sliderField("Low option count", `${lowW}`, <input className="w-full" type="range" min="8" max="80" step="1" value={optionScale} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Energy-sharing balance", `${formatSimulationNumber(sharing, 0)}% even`, <input className="w-full" type="range" min="0" max="100" step="1" value={sharing} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Macrostate choice", simBias < 0.5 ? "concentrated" : "spread", <input className="w-full" type="range" min="0" max="1" step="1" value={Math.round(clamp(simBias, 0, 1))} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Entropy board",
      <svg viewBox="0 0 640 250" className="w-full">
        <line x1="76" y1="192" x2="560" y2="192" stroke="#64748b" strokeWidth="4" />
        <line x1="76" y1="44" x2="76" y2="192" stroke="#64748b" strokeWidth="4" />
        <rect x="152" y={192 - lowW} width="110" height={lowW} rx="18" fill="#94a3b8" />
        <rect x="352" y={192 - Math.min(highW, 130)} width="110" height={Math.min(highW, 130)} rx="18" fill="#22c55e" />
        <text x="207" y="214" fill="#334155" fontSize="18" textAnchor="middle">lower W</text>
        <text x="407" y="214" fill="#334155" fontSize="18" textAnchor="middle">higher W</text>
        <text x="490" y="78" fill="#a16207" fontSize="24" fontWeight="700">S = k ln W</text>
        <text x="490" y="112" fill="#475569" fontSize="18">higher W means higher entropy</text>
      </svg>,
      <>
        {metricCard("Low W", `${lowW}`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("High W", `${highW}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Entropy gap", `${formatSimulationNumber(entropyGap, 2)} k-units`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Spontaneous direction", sharing > 50 ? "toward more even sharing" : "still climbing", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Entropy is stronger as option count than as vague messiness.", "Larger W means larger entropy.", "Spontaneous direction follows larger multiplicity."],
      "This final board turns the hidden-playbook story into an explicit entropy comparison that also supports hot-cold energy-sharing reasoning.",
    );
  }

  return renderPanel(
    "Lesson explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its lesson-specific Bounce-Chamber panel.
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
      "Each A4 lesson should own its explorer directly.",
      "If this appears, the lesson wiring needs a dedicated panel.",
      "The advanced thermal module should not silently fall through to another lesson view.",
    ],
    "This safety fallback is intentionally neutral so an unhandled lesson key cannot masquerade as a different A4 activity.",
  );
}
