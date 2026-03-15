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

const panelClass = "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

export default function M1SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simBias,
  formatSimulationNumber,
}: Props) {
  const render = (title: string, controls: ReactNode, readings: ReactNode, note: string) => (
    <div style={panelGridStyle}>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">{title} mission controls</h4>
        {controls}
      </div>
      <div className={panelClass}>
        <h4 className="text-lg font-semibold text-slate-900">Quest-Log readout</h4>
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
      "Quest lane and mission log",
      <>
        <label className="mt-4 block text-sm text-slate-700">Opening pace (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedA} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Pause tiles (s)<input className="mt-2 w-full" type="range" min="0" max="6" step="1" value={pauseTime} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Closing pace (m/s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={speedB} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Final progress score:</span> {formatSimulationNumber(finishDistance, 0)} m</div>
        <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Same-score speed run:</span> about {formatSimulationNumber(comparisonSpeed, 2)} m/s with no pause</div>
      </>,
      "The lane is where motion happens, and the mission log is how motion is recorded. Matching final scores do not force matching run stories."
    );
  }
  if (lessonKey === "M1_L2") {
    const startSpeed = Math.max(0, Math.min(12, simVectorMagnitude));
    const endSpeed = Math.max(0, Math.min(12, simVectorAngle));
    const duration = Math.max(1, Math.min(8, simMetricMeters));
    const acceleration = (endSpeed - startSpeed) / duration;
    return render(
      "Pace log",
      <>
        <label className="mt-4 block text-sm text-slate-700">Start pace (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={startSpeed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">End pace (m/s)<input className="mt-2 w-full" type="range" min="0" max="12" step="1" value={endSpeed} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Mission clock interval (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={duration} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Pace meter now:</span> start {startSpeed} m/s, end {endSpeed} m/s</div>
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Boost shift:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
      </>,
      "On a pace log, height tells the speed now while slope tells how the pace is changing. A flat line above zero still means the avatar is moving."
    );
  }

  if (lessonKey === "M1_L3") {
    const startVelocity = Math.max(-10, Math.min(10, simVectorMagnitude));
    const endVelocity = Math.max(-10, Math.min(10, simVectorAngle));
    const duration = Math.max(1, Math.min(8, simMetricMeters));
    const acceleration = (endVelocity - startVelocity) / duration;
    const story = acceleration === 0 ? "boost shift = 0, so the pace arrow is unchanged" : startVelocity > 0 && acceleration < 0 ? "positive-direction run with a braking boost shift" : startVelocity < 0 && acceleration > 0 ? "negative-direction run with a positive boost shift" : "the pace arrow changes in the direction set by the boost shift sign";
    return render(
      "Boost shift",
      <>
        <label className="mt-4 block text-sm text-slate-700">Opening pace arrow (m/s)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={startVelocity} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Closing pace arrow (m/s)<input className="mt-2 w-full" type="range" min="-10" max="10" step="1" value={endVelocity} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label>
        <label className="mt-4 block text-sm text-slate-700">Mission clock interval (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={duration} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label>
      </>,
      <>
        <div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Signed velocity change:</span> {formatSimulationNumber(endVelocity - startVelocity, 1)} m/s</div>
        <div className="rounded-xl bg-rose-50 p-4 text-rose-800"><span className="font-medium text-rose-900">Boost shift rate:</span> {formatSimulationNumber(acceleration, 2)} m/s^2</div>
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
      "Quest forecast board",
      <><label className="mt-4 block text-sm text-slate-700">Starting pace u (m/s)<input className="mt-2 w-full" type="range" min="0" max="15" step="1" value={u} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">Boost shift a (m/s^2)<input className="mt-2 w-full" type="range" min="-4" max="4" step="1" value={a} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">Mission time t (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={t} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label></>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Forecast pace v = u + at:</span> {formatSimulationNumber(v, 1)} m/s</div><div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Block + triangle distance:</span> {formatSimulationNumber(s, 1)} m</div></>,
      valid ? "Choose the equation from the story: knowns, unknown, and the constant-boost condition." : "The Quest-Log forecast board only works directly when the boost shift stays constant."
    );
  }
  if (lessonKey === "M1_L5") {
    const gradient = Math.max(1, Math.min(6, simVectorMagnitude));
    return render(
      "Dual-log gradient",
      <label className="mt-4 block text-sm text-slate-700">Shared tilt<input className="mt-2 w-full" type="range" min="1" max="6" step="1" value={gradient} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">On the progress log:</span> {gradient} m/s</div><div className="rounded-xl bg-violet-50 p-4 text-violet-800"><span className="font-medium text-violet-900">On the pace log:</span> {gradient} m/s^2</div></>,
      "The same tilt can mean pace on one Quest-Log screen and boost shift on another because the axes decide the rate."
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
      "Area hunter",
      <><label className="mt-4 block text-sm text-slate-700">Starting pace u (m/s)<input className="mt-2 w-full" type="range" min="0" max="10" step="1" value={u} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">Final pace v (m/s)<input className="mt-2 w-full" type="range" min="0" max="14" step="1" value={v} onChange={(e) => setSimVectorAngle(Number(e.target.value))} /></label><label className="mt-4 block text-sm text-slate-700">Mission time t (s)<input className="mt-2 w-full" type="range" min="1" max="8" step="1" value={t} onChange={(e) => setSimMetricMeters(Number(e.target.value))} /></label></>,
      <><div className="rounded-xl bg-slate-50 p-4 text-slate-700"><span className="font-medium text-slate-900">Block area:</span> {formatSimulationNumber(rectangle, 1)} m</div><div className="rounded-xl bg-amber-50 p-4 text-amber-800"><span className="font-medium text-amber-900">Triangle area:</span> {formatSimulationNumber(triangle, 1)} m</div><div className="rounded-xl bg-emerald-50 p-4 text-emerald-800"><span className="font-medium text-emerald-900">Total progress:</span> {formatSimulationNumber(distance, 1)} m</div></>,
      "Each strip under the pace log is progress earned during one time beat. Equal total area means equal total distance even when the speed story differs."
    );
  }

  return <div className="rounded-2xl border bg-slate-50 p-6 text-slate-700">Use the Quest-Log controls to compare the lane world with the graph world.</div>;
}
