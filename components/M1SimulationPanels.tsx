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
  formatSimulationNumber: (value: number, digits?: number) => string;
};

const panelGridStyle = {
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  alignItems: "start",
} as const;

const panelClass = "rounded-2xl border bg-white p-5 shadow-sm";

export default function M1SimulationPanels({
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
  formatSimulationNumber,
}: Props) {
  const render = (title: string, controls: ReactNode, readings: ReactNode, note: string) => (
    <div style={panelGridStyle}>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">{title} controls</h4>
        {controls}
      </div>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">What the model is showing</h4>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{readings}</div>
        <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-slate-700">{note}</div>
      </div>
    </div>
  );

  if (lessonKey === "M1_L1") {
    const speedA = Math.max(1, Math.min(8, simVectorMagnitude));
    const pauseTime = Math.max(0, Math.min(6, simMetricMeters));
    const speedB = Math.max(1, Math.min(8, simVectorAngle));
    const finishDistance = speedA * 4 + speedB * 4;
    const comparisonSpeed = finishDistance / Math.max(8 + pauseTime, 1);
    return render(
      "Route-log",
      <>
        <label className="mt-4 block text-sm text-slate-700">First segment speed (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Pause time (s)<input className="mt-2 w-full" type="range" min="0" max="6" step="1" value={pauseTime} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Second segment speed (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Final distance:</span> {formatSimulationNumber(finishDistance, 0)} m</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Same-finish comparison:</span> about {formatSimulationNumber(comparisonSpeed, 2)} m/s with no pause</div>
      </>,
      "One graph can end at the same distance as another while telling a completely different motion story."
    );
  }
  if (lessonKey === "M1_L2") {
    const startSpeed = Math.max(0, Math.min(12, simVectorMagnitude));
    const endSpeed = Math.max(0, Math.min(12, simVectorAngle));
    const duration = Math.max(1, Math.min(8, simMetricMeters));
    const acceleration = (endSpeed - startSpeed) / duration;
    return render(
      "Speed-strip",
      <>
        <label className="mt-4 block text-sm text-slate-700">Start speed (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={startSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">End speed (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={endSpeed} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Time interval (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={duration} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Height now:</span> start {startSpeed} m/s, end {endSpeed} m/s</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Slope:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
      </>,
      "On a speed-time graph, height tells the speed at an instant, while slope tells how that speed is changing."
    );
  }

  if (lessonKey === "M1_L3") {
    const startVelocity = Math.max(-10, Math.min(10, simVectorMagnitude));
    const endVelocity = Math.max(-10, Math.min(10, simVectorAngle));
    const duration = Math.max(1, Math.min(8, simMetricMeters));
    const acceleration = (endVelocity - startVelocity) / duration;
    const story = acceleration === 0 ? "no acceleration" : startVelocity > 0 && acceleration < 0 ? "slowing in the positive direction" : startVelocity < 0 && acceleration > 0 ? "slowing in the negative direction" : "velocity changing with the acceleration sign";
    return render(
      "Change-rate dial",
      <>
        <label className="mt-4 block text-sm text-slate-700">Initial velocity (m/s)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={startVelocity} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Final velocity (m/s)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={endVelocity} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Time interval (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={duration} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Velocity change:</span> {formatSimulationNumber(endVelocity - startVelocity, 1)} m/s</div>
        <div className="rounded-xl bg-rose-50 p-4 text-rose-800"><span className="font-medium text-rose-900">Acceleration:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
      </>,
      story
    );
  }
  if (lessonKey === "M1_L4") {
    const u = Math.max(0, Math.min(15, simVectorMagnitude));
    const a = Math.max(-4, Math.min(4, simVectorAngle));
    const t = Math.max(1, Math.min(8, simMetricMeters));
    const valid = simBias >= 0.5;
    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;
    return render(
      "Forecast-console",
      <><label className="mt-4 block text-sm text-slate-700">u (m/s)<input className="mt-2 w-full" type="range" min="0" max="15" step="1" value={u} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">a (m/s^2)<input className="mt-2 w-full" type="range" min="-4" max="4" step="1" value={a} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">t (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={t} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label></>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">v = u + at:</span> {formatSimulationNumber(v, 1)} m/s</div><div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">s = ut + 0.5at^2:</span> {formatSimulationNumber(s, 1)} m</div></>,
      valid ? "Choose the equation by the missing variable." : "This toolkit only works directly when acceleration is constant."
    );
  }
  if (lessonKey === "M1_L5") {
    const gradient = Math.max(1, Math.min(6, simVectorMagnitude));
    return render(
      "Slope-gauge",
      <label className="mt-4 block text-sm text-slate-700">Common gradient<input className="mt-2 w-full" type="range" min="1" max="6" step="1" value={gradient} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">On distance-time:</span> {gradient} m/s</div><div className="rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">On speed-time:</span> {gradient} m/s^2</div></>,
      "The same tilt means a different quantity when the graph axes change."
    );
  }

  if (lessonKey === "M1_L6") {
    const u = Math.max(0, Math.min(10, simVectorMagnitude));
    const v = Math.max(0, Math.min(14, simVectorAngle));
    const t = Math.max(1, Math.min(8, simMetricMeters));
    const rectangle = Math.min(u, v) * t;
    const triangle = 0.5 * Math.abs(v - u) * t;
    const distance = rectangle + triangle;
    return render(
      "Distance-accumulator",
      <><label className="mt-4 block text-sm text-slate-700">u (m/s)<input className="mt-2 w-full" type="range" min="0" max="10" step="1" value={u} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">v (m/s)<input className="mt-2 w-full" type="range" min="0" max="14" step="1" value={v} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">t (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={t} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label></>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Rectangle:</span> {formatSimulationNumber(rectangle, 1)} m</div><div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Triangle:</span> {formatSimulationNumber(triangle, 1)} m</div><div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Total:</span> {formatSimulationNumber(distance, 1)} m</div></>,
      "Area is the total distance. Different graphs can still represent the same distance if they enclose the same area."
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the M1 controls to compare the graph meaning with the motion story.</div>;
}
