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

const panelGridStyle = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  alignItems: "start",
} as const;

const panelClass = "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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
  const render = (title: string, controls: ReactNode, readings: ReactNode, note: string) => (
    <div style={panelGridStyle}>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
        {controls}
      </div>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">Thruster-Deck readout</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">{note}</div>
      </div>
    </div>
  );

  if (lessonKey === "M2_L1") {
    const forwardArrow = clamp(simVectorMagnitude, 0, 16);
    const backwardArrow = clamp(simVectorAngle, 0, 16);
    const cruiseSpeed = clamp(simMetricMeters, 0, 8);
    const masterArrow = forwardArrow - backwardArrow;
    const masterLabel = Math.abs(masterArrow) < 0.01 ? "0 N" : formatSimulationNumber(Math.abs(masterArrow), 1) + " N " + (masterArrow > 0 ? "forward" : "backward");
    const forceStory = Math.abs(masterArrow) < 0.01 ? (forwardArrow === 0 && backwardArrow === 0 ? "no Drive Arrows acting" : "balanced Drive Arrows acting") : masterLabel;
    const motionStory = Math.abs(masterArrow) < 0.01 ? (cruiseSpeed > 0 ? "keeps cruising at " + formatSimulationNumber(cruiseSpeed, 1) + " m/s" : "stays at rest") : "changes motion " + (masterArrow > 0 ? "forward" : "backward");
    return render(
      "Master Arrow explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Forward Drive Arrow (N)<input className="mt-2 w-full" type="range" min="0" max="16" step="1" value={forwardArrow} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Backward Drive Arrow (N)<input className="mt-2 w-full" type="range" min="0" max="16" step="1" value={backwardArrow} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Starting cruise speed (m/s)<input className="mt-2 w-full" type="range" min="0" max="8" step="1" value={cruiseSpeed} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Master Arrow:</span> {masterLabel}</div>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Force story:</span> {forceStory}</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Motion story:</span> {motionStory}</div>
        <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Contrast:</span> zero Master Arrow does not tell you whether the craft is stopped or cruising.</div>
      </>,
      "Balanced arrows and no arrows can share the same Master Arrow while still telling different force stories."
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
      <>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Craft A Motion Shift:</span> {formatSimulationNumber(aShift, 2)} m/s^2</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Craft B Motion Shift:</span> {formatSimulationNumber(bShift, 2)} m/s^2</div>
        <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Third-law pair:</span> {formatSimulationNumber(pairForce, 0)} N on A and {formatSimulationNumber(pairForce, 0)} N on B</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Pair-force accelerations:</span> A {formatSimulationNumber(pairAShift, 2)} m/s^2, B {formatSimulationNumber(pairBShift, 2)} m/s^2</div>
      </>,
      "Equal interaction forces do not guarantee equal accelerations. Load Rating decides how much the same push changes each craft."
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
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Carry Score A:</span> {formatSimulationNumber(momentumA, 1)} kg m/s</div>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Carry Score B:</span> {formatSimulationNumber(momentumB, 1)} kg m/s</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Closed-system total:</span> {formatSimulationNumber(totalMomentum, 1)} kg m/s</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Shared docking speed:</span> {formatSimulationNumber(sharedVelocity, 2)} m/s</div>
      </>,
      "Conserve the total Carry Score for the whole docked system. What changes is how that total is shared after the collision."
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
      "Spin Pull explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Force A (N)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={forceA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Perpendicular reach A (m)<input className="mt-2 w-full" type="range" min="0" max="1.5" step="0.05" value={reachA} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Force B (N)<input className="mt-2 w-full" type="range" min="1" max="12" step="1" value={forceB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Perpendicular reach B (m)<input className="mt-2 w-full" type="range" min="0" max="1.5" step="0.05" value={reachB} onChange={(e) => setSimFluidDensity(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Spin Pull A:</span> {formatSimulationNumber(torqueA, 2)} N m</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Spin Pull B:</span> {formatSimulationNumber(torqueB, 2)} N m</div>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Centered push check:</span> {reachA < 0.01 ? "reach is 0, so the turning effect is 0" : "moving the line of action away from the pivot creates turning effect"}</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Comparison:</span> {comparison}</div>
      </>,
      "Force size alone is not enough. The turning story changes when the same push acts with a different perpendicular reach."
    );
  }

  if (lessonKey === "M2_L5") {
    const cargoOffset = clamp(simBias, -4, 4);
    const baseWidth = clamp(simMetricMeters, 4, 12);
    const loadHeight = clamp(simSpread, 1, 8);
    const supportHalfWidth = baseWidth / 2;
    const tipMargin = supportHalfWidth - Math.abs(cargoOffset);
    const stableNow = tipMargin >= 0;
    const tipAngle = stableNow ? Math.atan(tipMargin / loadHeight) * 180 / Math.PI : 0;
    return render(
      "Balance Core explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Balance Core offset (m)<input className="mt-2 w-full" type="range" min="-4" max="4" step="0.25" value={cargoOffset} onChange={(e) => setSimBias(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Footprint Zone width (m)<input className="mt-2 w-full" type="range" min="4" max="12" step="0.5" value={baseWidth} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Load height (m)<input className="mt-2 w-full" type="range" min="1" max="8" step="0.5" value={loadHeight} onChange={(e) => setSimSpread(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Balance Core line:</span> {cargoOffset === 0 ? "centered" : formatSimulationNumber(Math.abs(cargoOffset), 2) + " m " + (cargoOffset > 0 ? "right" : "left") + " of center"}</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Footprint edge margin:</span> {stableNow ? formatSimulationNumber(tipMargin, 2) + " m before tipping begins" : "already outside the support zone"}</div>
        <div className={"rounded-xl p-4 " + (stableNow ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800")}><span className={"font-medium " + (stableNow ? "text-emerald-900" : "text-rose-900")}>Stability now:</span> {stableNow ? "stable" : "tipping"}</div>
        <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Tilt tolerance:</span> about {formatSimulationNumber(tipAngle, 1)} degrees before the weight line reaches the edge</div>
      </>,
      "A wider base increases the margin, while a taller load lowers the tilt tolerance. Stability is about geometry, not just how heavy the craft is."
    );
  }

  if (lessonKey === "M2_L6") {
    const magnitude = clamp(simVectorMagnitude, 2, 20);
    const angleDegrees = clamp(simVectorAngle, 0, 90);
    const extraHorizontal = clamp(simMetricMeters, -10, 10);
    const extraVertical = clamp(simBias, -10, 10);
    const radians = angleDegrees * Math.PI / 180;
    const horizontal = magnitude * Math.cos(radians);
    const vertical = magnitude * Math.sin(radians);
    const netHorizontal = horizontal + extraHorizontal;
    const netVertical = vertical + extraVertical;
    const rebuiltMagnitude = Math.sqrt(netHorizontal * netHorizontal + netVertical * netVertical);
    const rebuiltAngle = Math.atan2(netVertical, netHorizontal) * 180 / Math.PI;
    return render(
      "Arrow Split explorer",
      <>
        <label className="mt-4 block text-sm text-slate-700">Diagonal Drive Arrow magnitude (N)<input className="mt-2 w-full" type="range" min="2" max="20" step="1" value={magnitude} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Angle above the deck x-axis (deg)<input className="mt-2 w-full" type="range" min="0" max="90" step="1" value={angleDegrees} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Extra horizontal component (N)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={extraHorizontal} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Extra vertical component (N)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={extraVertical} onChange={(e) => setSimBias(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Arrow Split:</span> {formatSimulationNumber(horizontal, 2)} N x, {formatSimulationNumber(vertical, 2)} N y</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Net components:</span> {formatSimulationNumber(netHorizontal, 2)} N x, {formatSimulationNumber(netVertical, 2)} N y</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Rebuilt resultant:</span> {formatSimulationNumber(rebuiltMagnitude, 2)} N</div>
        <div className="rounded-xl bg-sky-50 p-4 text-sky-800"><span className="font-medium text-sky-900">Direction:</span> {formatSimulationNumber(rebuiltAngle, 1)} degrees from +x</div>
      </>,
      "Components are not extra forces. They are one angled force rewritten on the deck axes so you can combine each direction cleanly."
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the Thruster-Deck controls to compare Master Arrow, Carry Score, Spin Pull, and Balance Core stories.</div>;
}




