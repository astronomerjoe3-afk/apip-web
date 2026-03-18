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

function explainerCard(title: string, body: string, tone: string): ReactNode {
  return (
    <div className={`sm:col-span-2 rounded-2xl border p-4 ${tone}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{title}</div>
      <div className="mt-2 text-sm leading-6">{body}</div>
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

export default function M2SimulationPanels({
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
  const render = (
    title: string,
    controls: ReactNode,
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
        {boardFrame("Thruster-Deck board", board)}
        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Readout</h4>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
          <div className="mt-4 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">{note}</div>
        </div>
      </div>
    </div>
  );

  if (lessonKey === "M2_L1") {
    const forwardArrow = clamp(simVectorMagnitude, 0, 16);
    const backwardArrow = clamp(simVectorAngle, 0, 16);
    const cruiseSpeed = clamp(simMetricMeters, 0, 8);
    const masterArrow = forwardArrow - backwardArrow;
    const masterLabel =
      Math.abs(masterArrow) < 0.01
        ? "0 N"
        : `${formatSimulationNumber(Math.abs(masterArrow), 1)} N ${masterArrow > 0 ? "forward" : "backward"}`;
    const forceStory =
      Math.abs(masterArrow) < 0.01
        ? forwardArrow === 0 && backwardArrow === 0
          ? "No Drive Arrows acting"
          : "Balanced Drive Arrows acting"
        : masterLabel;
    const motionStory =
      Math.abs(masterArrow) < 0.01
        ? cruiseSpeed > 0
          ? `keeps cruising at ${formatSimulationNumber(cruiseSpeed, 1)} m/s`
          : "stays at rest"
        : `changes motion ${masterArrow > 0 ? "forward" : "backward"}`;
    return render(
      "Master Arrow explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Forward Drive Arrow (N)<input className="mt-2 w-full" type="range" min="0" max="16" step="1" value={forwardArrow} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Backward Drive Arrow (N)<input className="mt-2 w-full" type="range" min="0" max="16" step="1" value={backwardArrow} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Starting cruise speed (m/s)<input className="mt-2 w-full" type="range" min="0" max="8" step="1" value={cruiseSpeed} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#eff6ff" />
        <text x="36" y="44" fill="#1e3a8a" fontSize="22" fontWeight="700">Many Drive Arrows {"->"} one Master Arrow</text>
        <line x1="110" y1="120" x2={110 + forwardArrow * 16} y2="120" stroke="#f97316" strokeWidth="14" strokeLinecap="round" />
        <line x1="530" y1="162" x2={530 - backwardArrow * 16} y2="162" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" />
        <rect x="258" y="108" width="124" height="48" rx="20" fill="#0f172a" />
        <rect x="286" y="92" width="68" height="20" rx="10" fill="#38bdf8" />
        <text x="190" y="84" fill="#9a3412" fontSize="16" fontWeight="700">Forward {formatSimulationNumber(forwardArrow, 0)} N</text>
        <text x="368" y="200" fill="#1d4ed8" fontSize="16" fontWeight="700">Backward {formatSimulationNumber(backwardArrow, 0)} N</text>
        <text x="224" y="210" fill="#0f172a" fontSize="18" fontWeight="700">Master Arrow: {masterLabel}</text>
        <text x="36" y="222" fill="#475569" fontSize="16">Cruise state now: {cruiseSpeed > 0 ? `${formatSimulationNumber(cruiseSpeed, 1)} m/s` : "at rest"}</text>
      </svg>,
      <>
        {metricCard("Master Arrow", masterLabel, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Force story", forceStory, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Motion story", motionStory, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Key contrast", "Zero Master Arrow does not force zero velocity.", "border-sky-200 bg-sky-50 text-sky-900")}
      </>,
      [
        "Collapse the visible arrows into one resultant before talking about motion.",
        "A zero Master Arrow means zero acceleration, not one special speed value.",
        "Cruising and resting can share the same resultant even when the force stories differ.",
      ],
      "Balanced arrows and no arrows can share the same Master Arrow while still telling different force stories.",
    );
  }

  if (lessonKey === "M2_L2") {
    const masterArrow = clamp(simVectorMagnitude, 2, 20);
    const craftAMass = clamp(simDensityMass, 1, 10);
    const craftBMass = clamp(simDensityVolume, 1, 12);
    const pairForce = clamp(simVectorAngle, 2, 16);
    const aShift = masterArrow / craftAMass;
    const bShift = masterArrow / craftBMass;
    const pairAShift = pairForce / craftAMass;
    const pairBShift = pairForce / craftBMass;
    return render(
      "Load rating explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Master Arrow on both craft (N)<input className="mt-2 w-full" type="range" min="2" max="20" step="1" value={masterArrow} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Craft A Load Rating (kg)<input className="mt-2 w-full" type="range" min="1" max="10" step="1" value={craftAMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Craft B Load Rating (kg)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={craftBMass} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Interaction pair force (N)<input className="mt-2 w-full" type="range" min="2" max="16" step="1" value={pairForce} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="36" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Two force comparisons, not one shared calculation</text>
        <text x="36" y="66" fill="#475569" fontSize="14">Top readouts use the Master Arrow slider. Pair-force readouts use the separate interaction-pair slider.</text>
        <rect x="48" y="76" width="240" height="134" rx="22" fill="#eff6ff" />
        <rect x="352" y="76" width="240" height="134" rx="22" fill="#fff7ed" />
        <text x="74" y="106" fill="#1d4ed8" fontSize="18" fontWeight="700">Craft A</text>
        <text x="378" y="106" fill="#c2410c" fontSize="18" fontWeight="700">Craft B</text>
        <text x="74" y="138" fill="#334155" fontSize="16">{formatSimulationNumber(craftAMass, 0)} kg {"->"} {formatSimulationNumber(aShift, 2)} m/s^2</text>
        <text x="378" y="138" fill="#334155" fontSize="16">{formatSimulationNumber(craftBMass, 0)} kg {"->"} {formatSimulationNumber(bShift, 2)} m/s^2</text>
        <rect x="74" y="160" width={Math.min(aShift * 30, 160)} height="12" rx="6" fill="#0ea5e9" />
        <rect x="378" y="160" width={Math.min(bShift * 30, 160)} height="12" rx="6" fill="#f59e0b" />
        <text x="154" y="220" fill="#334155" fontSize="16">Equal pair force: {formatSimulationNumber(pairForce, 0)} N each</text>
      </svg>,
      <>
        {explainerCard(
          "Master Arrow response",
          "These two readouts use the Master Arrow slider only. They show the acceleration each craft gets from that one-object resultant-force case.",
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
        {metricCard("Craft A Motion Shift from Master Arrow", `${formatSimulationNumber(aShift, 2)} m/s^2`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Craft B Motion Shift from Master Arrow", `${formatSimulationNumber(bShift, 2)} m/s^2`, "border-orange-200 bg-orange-50 text-orange-900")}
        {explainerCard(
          "Third-law pair comparison",
          "These two readouts use the separate interaction-pair slider. They compare equal forces on two objects, so they only match the Motion Shift cards if the pair force happens to equal the Master Arrow.",
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard("Third-law pair force on each craft", `${formatSimulationNumber(pairForce, 0)} N on A and ${formatSimulationNumber(pairForce, 0)} N on B`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Acceleration from pair force alone", `A ${formatSimulationNumber(pairAShift, 2)} | B ${formatSimulationNumber(pairBShift, 2)} m/s^2`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      [
        "Name the Master Arrow first and the mass second before predicting acceleration.",
        "Use third-law pairs only to compare forces across two objects, not to cancel forces on one object.",
        "The same force can buy a bigger motion shift on the lighter craft.",
      ],
      "The panel is showing two separate force stories side by side: a Master Arrow response case and a third-law pair comparison case. Their numbers only match when those force sliders are set equal.",
    );
  }

  if (lessonKey === "M2_L3") {
    const craftAMass = clamp(simDensityMass, 1, 8);
    const craftBMass = clamp(simDensityVolume, 1, 8);
    const craftAVelocity = clamp(simVectorMagnitude, -8, 8);
    const craftBVelocity = clamp(simVectorAngle, -8, 8);
    const momentumA = craftAMass * craftAVelocity;
    const momentumB = craftBMass * craftBVelocity;
    const totalMomentum = momentumA + momentumB;
    const totalMass = craftAMass + craftBMass;
    const sharedVelocity = totalMass === 0 ? 0 : totalMomentum / totalMass;
    return render(
      "Dock exchange explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Craft A Load Rating (kg)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={craftAMass} onChange={(e) => setSimDensityMass(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Craft A velocity (m/s)<input className="mt-2 w-full" type="range" min="-8" max="8" step="1" value={craftAVelocity} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Craft B Load Rating (kg)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={craftBMass} onChange={(e) => setSimDensityVolume(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Craft B velocity (m/s)<input className="mt-2 w-full" type="range" min="-8" max="8" step="1" value={craftBVelocity} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="36" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Closed-system ledger before and after docking</text>
        <rect x="48" y="76" width="248" height="134" rx="22" fill="#eff6ff" />
        <rect x="344" y="76" width="248" height="134" rx="22" fill="#f0fdf4" />
        <text x="74" y="106" fill="#1d4ed8" fontSize="18" fontWeight="700">Before docking</text>
        <text x="370" y="106" fill="#166534" fontSize="18" fontWeight="700">After docking</text>
        <text x="74" y="136" fill="#334155" fontSize="16">A: {formatSimulationNumber(momentumA, 1)} kg m/s</text>
        <text x="74" y="162" fill="#334155" fontSize="16">B: {formatSimulationNumber(momentumB, 1)} kg m/s</text>
        <text x="74" y="194" fill="#0f172a" fontSize="18" fontWeight="700">Total: {formatSimulationNumber(totalMomentum, 1)} kg m/s</text>
        <text x="370" y="150" fill="#166534" fontSize="18">Shared speed: {formatSimulationNumber(sharedVelocity, 2)} m/s</text>
        <text x="370" y="182" fill="#166534" fontSize="18">Combined mass: {formatSimulationNumber(totalMass, 0)} kg</text>
      </svg>,
      <>
        {metricCard("Carry Score A", `${formatSimulationNumber(momentumA, 1)} kg m/s`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Carry Score B", `${formatSimulationNumber(momentumB, 1)} kg m/s`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Closed-system total", `${formatSimulationNumber(totalMomentum, 1)} kg m/s`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Shared docking speed", `${formatSimulationNumber(sharedVelocity, 2)} m/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      [
        "Compute each craft's momentum before the collision, then switch to the system total.",
        "The conserved quantity is the whole-system Carry Score, not each craft's own speed.",
        "A slower final speed can still be correct if the same total momentum is shared across more mass.",
      ],
      "Conserve the total Carry Score for the whole docked system. What changes is how that total is shared after the collision.",
    );
  }

  if (lessonKey === "M2_L4") {
    const forceA = clamp(simVectorMagnitude, 1, 12);
    const reachA = clamp(simMetricMeters, 0, 1.5);
    const forceB = clamp(simVectorAngle, 1, 12);
    const reachB = clamp(simFluidDensity, 0, 1.5);
    const torqueA = forceA * reachA;
    const torqueB = forceB * reachB;
    const comparison = Math.abs(torqueA - torqueB) < 0.15 ? "about the same Spin Pull" : torqueA > torqueB ? "setup A turns harder" : "setup B turns harder";
    return render(
      "Spin Pull / torque explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Force A (N)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={forceA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Perpendicular reach A (m)<input className="mt-2 w-full" type="range" min="0" max="1.5" step="0.05" value={reachA} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Force B (N)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={forceB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Perpendicular reach B (m)<input className="mt-2 w-full" type="range" min="0" max="1.5" step="0.05" value={reachB} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="36" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Same push size can buy different Spin Pull / torque</text>
        <text x="74" y="200" fill="#9a3412" fontSize="16">A torque (moment): {formatSimulationNumber(torqueA, 2)} N m</text>
        <text x="366" y="200" fill="#1d4ed8" fontSize="16">B torque (moment): {formatSimulationNumber(torqueB, 2)} N m</text>
        <text x="74" y="232" fill="#475569" fontSize="16">Comparison: {comparison}</text>
      </svg>,
      <>
        {metricCard("Spin Pull / torque A", `${formatSimulationNumber(torqueA, 2)} N m`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Spin Pull / torque B", `${formatSimulationNumber(torqueB, 2)} N m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Zero-reach check", reachA < 0.01 ? "setup A gives zero turning effect" : "moving off the pivot creates turning", "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Comparison", comparison, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      [
        "Torque, also called the moment of a force, needs both the push size and the perpendicular reach from the pivot.",
        "A force through the pivot can still translate the object while creating no turning effect.",
        "Equal torque can come from different force-reach trades.",
      ],
      "Force size alone is not enough. Torque, the moment of a force, changes when the same push acts with a different perpendicular reach.",
    );
  }

  if (lessonKey === "M2_L5") {
    const cargoOffset = clamp(simBias, -4, 4);
    const baseWidth = clamp(simMetricMeters, 4, 12);
    const loadHeight = clamp(simSpread, 1, 8);
    const supportHalfWidth = baseWidth / 2;
    const tipMargin = supportHalfWidth - Math.abs(cargoOffset);
    const stableNow = tipMargin >= 0;
    const tipAngle = stableNow ? (Math.atan(tipMargin / loadHeight) * 180) / Math.PI : 0;
    return render(
      "Balance Core explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Balance Core offset (m)<input className="mt-2 w-full" type="range" min="-4" max="4" step="0.25" value={cargoOffset} onChange={(e) => setSimBias(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Footprint Zone width (m)<input className="mt-2 w-full" type="range" min="4" max="12" step="0.5" value={baseWidth} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Load height (m)<input className="mt-2 w-full" type="range" min="1" max="8" step="0.5" value={loadHeight} onChange={(e) => setSimSpread(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="36" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Stability comes from where the weight line lands</text>
        <text x="36" y="204" fill="#475569" fontSize="16">{stableNow ? "Balance Core line still lands inside the support zone." : "Balance Core line has crossed the support edge."}</text>
      </svg>,
      <>
        {metricCard("Balance Core line", cargoOffset === 0 ? "centered" : `${formatSimulationNumber(Math.abs(cargoOffset), 2)} m ${cargoOffset > 0 ? "right" : "left"} of center`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Footprint margin", stableNow ? `${formatSimulationNumber(tipMargin, 2)} m before tipping` : "already outside the support zone", "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Stability now", stableNow ? "stable" : "tipping", stableNow ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Tilt tolerance", `about ${formatSimulationNumber(tipAngle, 1)} degrees`, "border-sky-200 bg-sky-50 text-sky-900")}
      </>,
      [
        "Track the Balance Core line, not just the total mass number.",
        "Widening the Footprint Zone can improve stability without changing mass at all.",
        "A higher load usually reduces the tipping margin because the geometry is less forgiving.",
      ],
      "A wider base increases the margin, while a taller load lowers the tilt tolerance. Stability is about geometry, not just how heavy the craft is.",
    );
  }

  if (lessonKey === "M2_L6") {
    const magnitude = clamp(simVectorMagnitude, 2, 20);
    const angleDegrees = clamp(simVectorAngle, 0, 90);
    const extraHorizontal = clamp(simMetricMeters, -10, 10);
    const extraVertical = clamp(simBias, -10, 10);
    const radians = (angleDegrees * Math.PI) / 180;
    const horizontal = magnitude * Math.cos(radians);
    const vertical = magnitude * Math.sin(radians);
    const netHorizontal = horizontal + extraHorizontal;
    const netVertical = vertical + extraVertical;
    const rebuiltMagnitude = Math.sqrt(netHorizontal * netHorizontal + netVertical * netVertical);
    const rebuiltAngle = (Math.atan2(netVertical, netHorizontal) * 180) / Math.PI;
    return render(
      "Arrow Split explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Diagonal Drive Arrow magnitude (N)<input className="mt-2 w-full" type="range" min="2" max="20" step="1" value={magnitude} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Angle above the deck x-axis (deg)<input className="mt-2 w-full" type="range" min="0" max="90" step="1" value={angleDegrees} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Extra horizontal component (N)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={extraHorizontal} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Extra vertical component (N)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={extraVertical} onChange={(e) => setSimBias(Number(e.target.value))} /></label>
      </>,
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="12" width="616" height="226" rx="24" fill="#f8fafc" />
        <text x="36" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Resolve, combine by axis, then rebuild</text>
        <text x="36" y="120" fill="#334155" fontSize="16">Original components: x {formatSimulationNumber(horizontal, 2)} N, y {formatSimulationNumber(vertical, 2)} N</text>
        <text x="36" y="150" fill="#334155" fontSize="16">Net components: x {formatSimulationNumber(netHorizontal, 2)} N, y {formatSimulationNumber(netVertical, 2)} N</text>
        <text x="36" y="180" fill="#0f172a" fontSize="18" fontWeight="700">Rebuilt resultant: {formatSimulationNumber(rebuiltMagnitude, 2)} N at {formatSimulationNumber(rebuiltAngle, 1)} deg</text>
      </svg>,
      <>
        {metricCard("Arrow Split", `${formatSimulationNumber(horizontal, 2)} N x | ${formatSimulationNumber(vertical, 2)} N y`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Net components", `${formatSimulationNumber(netHorizontal, 2)} N x | ${formatSimulationNumber(netVertical, 2)} N y`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Rebuilt resultant", `${formatSimulationNumber(rebuiltMagnitude, 2)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Direction", `${formatSimulationNumber(rebuiltAngle, 1)} degrees from +x`, "border-sky-200 bg-sky-50 text-sky-900")}
      </>,
      [
        "Resolve the diagonal force into axis-aligned parts first.",
        "Combine horizontal with horizontal and vertical with vertical before rebuilding the final vector.",
        "Arrow Split is bookkeeping, not a claim that one force became several different physical pushes.",
      ],
      "Components are not extra forces. They are one angled force rewritten on the deck axes so you can combine each direction cleanly.",
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the Thruster-Deck controls to compare Master Arrow, Carry Score, Spin Pull, and Balance Core stories.</div>;
}
