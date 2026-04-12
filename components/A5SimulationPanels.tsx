"use client";

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
          <h4 className="text-lg font-semibold text-slate-900">Swing-Return lens</h4>
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

function arrowLine(x1: number, y1: number, x2: number, y2: number, color: string): ReactNode {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / length;
  const uy = dy / length;
  const head = 12;
  const hx1 = x2 - ux * head - uy * 6;
  const hy1 = y2 - uy * head + ux * 6;
  const hx2 = x2 - ux * head + uy * 6;
  const hy2 = y2 - uy * head - ux * 6;
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="6" strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${hx1},${hy1} ${hx2},${hy2}`} fill={color} />
    </>
  );
}

function plotPath(
  startX: number,
  endX: number,
  samples: number,
  valueAt: (ratio: number) => number,
  mapY: (value: number) => number,
): string {
  const points: string[] = [];
  for (let index = 0; index <= samples; index += 1) {
    const ratio = index / samples;
    const x = startX + (endX - startX) * ratio;
    points.push(`${x},${mapY(valueAt(ratio))}`);
  }
  return points.join(" ");
}

function responseGain(ratio: number, dampingRatio: number): number {
  const denominator = Math.sqrt((1 - ratio * ratio) ** 2 + (2 * dampingRatio * ratio) ** 2);
  return 1 / Math.max(denominator, 0.04);
}

function dampedDisplacement(zeta: number, omegaN: number, initial: number, time: number): number {
  if (zeta < 0.999) {
    const omegaD = omegaN * Math.sqrt(1 - zeta * zeta);
    const phaseFactor = zeta / Math.sqrt(1 - zeta * zeta);
    return (
      initial *
      Math.exp(-zeta * omegaN * time) *
      (Math.cos(omegaD * time) + phaseFactor * Math.sin(omegaD * time))
    );
  }

  if (zeta <= 1.001) {
    return initial * (1 + omegaN * time) * Math.exp(-omegaN * time);
  }

  const root = Math.sqrt(zeta * zeta - 1);
  const r1 = -omegaN * (zeta - root);
  const r2 = -omegaN * (zeta + root);
  const c1 = (initial * r2) / (r2 - r1);
  const c2 = (-initial * r1) / (r2 - r1);
  return c1 * Math.exp(r1 * time) + c2 * Math.exp(r2 * time);
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
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A5_L1") {
    const amplitude = clamp(simMetricMeters, 0.08, 0.22);
    const displacement = clamp(simVectorMagnitude, -amplitude, amplitude);
    const springConstant = clamp(simBias, 12, 48);
    const restoringForce = -springConstant * displacement;
    const centerX = 320;
    const bobX = centerX + (displacement / amplitude) * 170;
    const arrowSize = clamp(Math.abs(restoringForce) * 2.4, 18, 90);
    const arrowDirection = displacement >= 0 ? -1 : 1;
    const turningPoint = Math.abs(Math.abs(displacement) - amplitude) < 0.01;

    return renderPanel(
      "Oscillation basics",
      <>
        {sliderField(
          "Amplitude",
          `${formatSimulationNumber(amplitude * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min="0.08"
            max="0.22"
            step="0.005"
            value={amplitude}
            onChange={(event) => setSimMetricMeters(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Current displacement",
          `${formatSimulationNumber(displacement * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min={-amplitude}
            max={amplitude}
            step="0.005"
            value={displacement}
            onChange={(event) => setSimVectorMagnitude(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Return strength k",
          `${formatSimulationNumber(springConstant, 0)} N/m`,
          <input
            className="w-full"
            type="range"
            min="12"
            max="48"
            step="1"
            value={springConstant}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
      </>,
      "Equilibrium board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eef2ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Oscillation needs a restoring pull back toward equilibrium
        </text>
        <line x1="90" y1="138" x2="550" y2="138" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1={centerX} y1="72" x2={centerX} y2="198" stroke="#0f172a" strokeWidth="3" strokeDasharray="8 8" />
        <line x1="150" y1="120" x2="150" y2="156" stroke="#475569" strokeWidth="3" />
        <line x1="490" y1="120" x2="490" y2="156" stroke="#475569" strokeWidth="3" />
        <circle cx={bobX} cy="138" r="26" fill="#2563eb" />
        <text x="320" y="210" fill="#334155" fontSize="18" textAnchor="middle">
          Left turning point = -A, center = 0, right turning point = +A
        </text>
        <text x="320" y="92" fill="#334155" fontSize="18" textAnchor="middle">
          The restoring direction always points back to the center line
        </text>
        {displacement !== 0
          ? arrowLine(
              bobX,
              92,
              bobX + arrowDirection * arrowSize,
              92,
              Math.abs(displacement) > amplitude * 0.7 ? "#dc2626" : "#0f766e",
            )
          : null}
      </svg>,
      <>
        {metricCard(
          "Amplitude",
          `${formatSimulationNumber(amplitude, 3)} m`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Displacement",
          `${formatSimulationNumber(displacement, 3)} m`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Restoring force",
          `${formatSimulationNumber(restoringForce, 2)} N`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Motion state",
          turningPoint ? "turning point" : displacement === 0 ? "equilibrium" : "returning",
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
      </>,
      [
        "Amplitude is the maximum displacement from equilibrium, not the total path length.",
        "The restoring force changes sign with displacement so it always points inward.",
        "At a turning point the speed is zero even though the restoring effect is largest.",
      ],
      "This panel keeps equilibrium, displacement, and restoring direction on one board so the lesson starts from the actual oscillation geometry instead of from vague 'back and forth' language.",
    );
  }

  if (lessonKey === "A5_L2") {
    const mass = clamp(simDensityMass, 0.2, 1.2);
    const springConstant = clamp(simBias, 8, 60);
    const x1 = clamp(simVectorMagnitude, -0.16, 0.16);
    const x2 = clamp(simVectorAngle, -0.16, 0.16);
    const slope = -(springConstant / mass);
    const a1 = slope * x1;
    const a2 = slope * x2;
    const maxAcceleration = Math.max(Math.abs(slope * 0.16), 1);
    const startX = 88;
    const endX = 552;
    const pointX = (x: number) => 320 + (x / 0.16) * 190;
    const pointY = (a: number) => 132 - (a / maxAcceleration) * 54;
    const lineStartY = pointY(slope * -0.16);
    const lineEndY = pointY(slope * 0.16);

    return renderPanel(
      "SHM rule",
      <>
        {sliderField(
          "Mass",
          `${formatSimulationNumber(mass, 2)} kg`,
          <input
            className="w-full"
            type="range"
            min="0.2"
            max="1.2"
            step="0.02"
            value={mass}
            onChange={(event) => setSimDensityMass(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Spring constant",
          `${formatSimulationNumber(springConstant, 0)} N/m`,
          <input
            className="w-full"
            type="range"
            min="8"
            max="60"
            step="1"
            value={springConstant}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Sample displacement x1",
          `${formatSimulationNumber(x1, 3)} m`,
          <input
            className="w-full"
            type="range"
            min="-0.16"
            max="0.16"
            step="0.005"
            value={x1}
            onChange={(event) => setSimVectorMagnitude(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Sample displacement x2",
          `${formatSimulationNumber(x2, 3)} m`,
          <input
            className="w-full"
            type="range"
            min="-0.16"
            max="0.16"
            step="0.005"
            value={x2}
            onChange={(event) => setSimVectorAngle(Number(event.target.value))}
          />,
        )}
      </>,
      "Acceleration-displacement board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eff6ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          SHM keeps acceleration proportional to displacement and opposite in sign
        </text>
        <line x1="80" y1="132" x2="560" y2="132" stroke="#94a3b8" strokeWidth="3" />
        <line x1="320" y1="72" x2="320" y2="196" stroke="#94a3b8" strokeWidth="3" />
        <line x1={startX} y1={lineStartY} x2={endX} y2={lineEndY} stroke="#2563eb" strokeWidth="5" />
        <circle cx={pointX(x1)} cy={pointY(a1)} r="10" fill="#0f766e" />
        <circle cx={pointX(x2)} cy={pointY(a2)} r="10" fill="#dc2626" />
        <text x={pointX(x1) + 14} y={pointY(a1) - 8} fill="#0f766e" fontSize="16" fontWeight="700">
          x1, a1
        </text>
        <text x={pointX(x2) + 14} y={pointY(a2) + 22} fill="#dc2626" fontSize="16" fontWeight="700">
          x2, a2
        </text>
        <text x="548" y="148" fill="#334155" fontSize="18" textAnchor="end">
          slope = -k/m = {formatSimulationNumber(slope, 1)} s^-2
        </text>
      </svg>,
      <>
        {metricCard(
          "a at x1",
          `${formatSimulationNumber(a1, 2)} m/s^2`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "a at x2",
          `${formatSimulationNumber(a2, 2)} m/s^2`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Force at x1",
          `${formatSimulationNumber(mass * a1, 2)} N`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Rule check",
          x1 === 0 || x2 === 0 ? "zero x gives zero a" : "sign flips across center",
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
      </>,
      [
        "SHM is stricter than ordinary oscillation because it demands a straight-line a against x rule through the origin.",
        "The negative slope matters: positive x gives negative a, and negative x gives positive a.",
        "Doubling the displacement doubles the acceleration magnitude for the same system.",
      ],
      "This panel makes the defining SHM law visible as a graph and a calculation at the same time, which is sharper than treating SHM as just another word for repeated motion.",
    );
  }

  if (lessonKey === "A5_L3") {
    const amplitude = clamp(simMetricMeters, 0.04, 0.12);
    const frequency = clamp(simBias, 0.5, 2.5);
    const phaseDeg = clamp(simVectorAngle, 0, 360);
    const omega = 2 * Math.PI * frequency;
    const phase = (phaseDeg * Math.PI) / 180;
    const period = 1 / frequency;
    const displacement = amplitude * Math.cos(phase);
    const velocity = -omega * amplitude * Math.sin(phase);
    const acceleration = -omega * omega * displacement;
    const velocityMax = omega * amplitude;
    const accelerationMax = omega * omega * amplitude;
    const startX = 92;
    const endX = 560;
    const markerX = startX + ((endX - startX) * phaseDeg) / 360;
    const tracePath = (midY: number, scale: number, phaseShift: number) =>
      plotPath(startX, endX, 120, (ratio) => Math.cos(2 * Math.PI * ratio + phaseShift), (value) => midY - value * scale);

    return renderPanel(
      "Trace reading",
      <>
        {sliderField(
          "Amplitude",
          `${formatSimulationNumber(amplitude * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min="0.04"
            max="0.12"
            step="0.002"
            value={amplitude}
            onChange={(event) => setSimMetricMeters(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Frequency",
          `${formatSimulationNumber(frequency, 2)} Hz`,
          <input
            className="w-full"
            type="range"
            min="0.5"
            max="2.5"
            step="0.02"
            value={frequency}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Phase point",
          `${formatSimulationNumber(phaseDeg, 0)} deg`,
          <input
            className="w-full"
            type="range"
            min="0"
            max="360"
            step="1"
            value={phaseDeg}
            onChange={(event) => setSimVectorAngle(Number(event.target.value))}
          />,
        )}
      </>,
      "Linked-trace board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#0f172a" />
        <text x="52" y="54" fill="#f8fafc" fontSize="22" fontWeight="700">
          One oscillator, three linked traces: x, v, and a
        </text>
        {[86, 136, 186].map((y) => (
          <line key={y} x1={startX} y1={y} x2={endX} y2={y} stroke="#334155" strokeWidth="2" strokeDasharray="6 6" />
        ))}
        <polyline fill="none" stroke="#38bdf8" strokeWidth="4" points={tracePath(86, 20, 0)} />
        <polyline fill="none" stroke="#34d399" strokeWidth="4" points={tracePath(136, 20, Math.PI / 2)} />
        <polyline fill="none" stroke="#f97316" strokeWidth="4" points={tracePath(186, 20, Math.PI)} />
        <line x1={markerX} y1="68" x2={markerX} y2="204" stroke="#e2e8f0" strokeWidth="3" strokeDasharray="8 6" />
        <text x="48" y="90" fill="#38bdf8" fontSize="16" fontWeight="700">
          x trace
        </text>
        <text x="48" y="140" fill="#34d399" fontSize="16" fontWeight="700">
          v trace
        </text>
        <text x="48" y="190" fill="#f97316" fontSize="16" fontWeight="700">
          a trace
        </text>
      </svg>,
      <>
        {metricCard(
          "Period",
          `${formatSimulationNumber(period, 3)} s`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Current x",
          `${formatSimulationNumber(displacement, 3)} m`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Current v",
          `${formatSimulationNumber(velocity, 3)} m/s`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Current a",
          `${formatSimulationNumber(acceleration, 2)} m/s^2`,
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
        {metricCard(
          "v max",
          `${formatSimulationNumber(velocityMax, 3)} m/s`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "a max",
          `${formatSimulationNumber(accelerationMax, 2)} m/s^2`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
      </>,
      [
        "Frequency and period are two ways of describing the same cycle spacing.",
        "Velocity is a quarter-cycle out of phase with displacement, so it is largest at equilibrium.",
        "Acceleration always mirrors displacement with the opposite sign in SHM.",
      ],
      "This board makes the graph-reading lesson mathematically honest: the traces are not independent sketches, they are linked by one frequency, one phase clock, and one oscillator.",
    );
  }

  if (lessonKey === "A5_L4") {
    const amplitude = clamp(simMetricMeters, 0.05, 0.18);
    const displacement = clamp(simVectorMagnitude, -amplitude, amplitude);
    const springConstant = clamp(simBias, 10, 70);
    const mass = clamp(simDensityMass, 0.2, 1.2);
    const totalEnergy = 0.5 * springConstant * amplitude * amplitude;
    const potentialEnergy = 0.5 * springConstant * displacement * displacement;
    const kineticEnergy = Math.max(totalEnergy - potentialEnergy, 0);
    const speed = Math.sqrt((2 * kineticEnergy) / mass);
    const maxSpeed = amplitude * Math.sqrt(springConstant / mass);
    const energyScale = 120 / Math.max(totalEnergy, 0.05);

    return renderPanel(
      "Energy split",
      <>
        {sliderField(
          "Amplitude",
          `${formatSimulationNumber(amplitude * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min="0.05"
            max="0.18"
            step="0.005"
            value={amplitude}
            onChange={(event) => setSimMetricMeters(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Current displacement",
          `${formatSimulationNumber(displacement * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min={-amplitude}
            max={amplitude}
            step="0.005"
            value={displacement}
            onChange={(event) => setSimVectorMagnitude(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Spring constant",
          `${formatSimulationNumber(springConstant, 0)} N/m`,
          <input
            className="w-full"
            type="range"
            min="10"
            max="70"
            step="1"
            value={springConstant}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Mass",
          `${formatSimulationNumber(mass, 2)} kg`,
          <input
            className="w-full"
            type="range"
            min="0.2"
            max="1.2"
            step="0.02"
            value={mass}
            onChange={(event) => setSimDensityMass(Number(event.target.value))}
          />,
        )}
      </>,
      "Energy-swap board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eef2ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          SHM trades elastic and kinetic energy while keeping the total fixed
        </text>
        <rect x="120" y={194 - totalEnergy * energyScale} width="96" height={totalEnergy * energyScale} rx="18" fill="#2563eb" />
        <rect x="272" y={194 - potentialEnergy * energyScale} width="96" height={potentialEnergy * energyScale} rx="18" fill="#f97316" />
        <rect x="424" y={194 - kineticEnergy * energyScale} width="96" height={kineticEnergy * energyScale} rx="18" fill="#22c55e" />
        <text x="168" y="212" fill="#334155" fontSize="18" textAnchor="middle">
          total
        </text>
        <text x="320" y="212" fill="#334155" fontSize="18" textAnchor="middle">
          elastic
        </text>
        <text x="472" y="212" fill="#334155" fontSize="18" textAnchor="middle">
          kinetic
        </text>
        <text x="320" y="88" fill="#334155" fontSize="18" textAnchor="middle">
          At x = 0, elastic is smallest and kinetic is largest
        </text>
      </svg>,
      <>
        {metricCard(
          "Total energy",
          `${formatSimulationNumber(totalEnergy, 3)} J`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Elastic energy",
          `${formatSimulationNumber(potentialEnergy, 3)} J`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Kinetic energy",
          `${formatSimulationNumber(kineticEnergy, 3)} J`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Current speed",
          `${formatSimulationNumber(speed, 3)} m/s`,
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
        {metricCard(
          "Max speed",
          `${formatSimulationNumber(maxSpeed, 3)} m/s`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Energy balance",
          `${formatSimulationNumber(potentialEnergy + kineticEnergy, 3)} J`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
      </>,
      [
        "Amplitude fixes the total energy in the ideal oscillator.",
        "Elastic energy depends on x squared, so halving displacement quarters that part of the energy.",
        "The missing share of the total is kinetic energy, which peaks at equilibrium.",
      ],
      "This panel prevents the common rigor slip of treating the energy forms as unrelated snapshots. It keeps the total visible so the learner must do the bookkeeping correctly at every position.",
    );
  }

  if (lessonKey === "A5_L5") {
    const naturalFrequency = clamp(simMetricMeters, 0.6, 3.0);
    const drivingFrequency = clamp(simVectorMagnitude, 0.6, 3.8);
    const dampingRatio = clamp(simBias, 0.08, 0.6);
    const ratio = drivingFrequency / naturalFrequency;
    const gain = responseGain(ratio, dampingRatio);
    const peakFrequency =
      dampingRatio < 1 / Math.sqrt(2)
        ? naturalFrequency * Math.sqrt(1 - 2 * dampingRatio * dampingRatio)
        : naturalFrequency;
    const startX = 84;
    const endX = 562;
    const maxDisplayGain = 4.5;
    const curve = plotPath(
      startX,
      endX,
      120,
      (progress) => {
        const frequency = 0.5 + progress * 4.0;
        return Math.min(responseGain(frequency / naturalFrequency, dampingRatio), maxDisplayGain);
      },
      (value) => 196 - (value / maxDisplayGain) * 108,
    );
    const currentX = startX + ((drivingFrequency - 0.5) / 4.0) * (endX - startX);
    const currentY = 196 - (Math.min(gain, maxDisplayGain) / maxDisplayGain) * 108;

    return renderPanel(
      "Forced response",
      <>
        {sliderField(
          "Natural frequency",
          `${formatSimulationNumber(naturalFrequency, 2)} Hz`,
          <input
            className="w-full"
            type="range"
            min="0.6"
            max="3.0"
            step="0.02"
            value={naturalFrequency}
            onChange={(event) => setSimMetricMeters(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Driving frequency",
          `${formatSimulationNumber(drivingFrequency, 2)} Hz`,
          <input
            className="w-full"
            type="range"
            min="0.6"
            max="3.8"
            step="0.02"
            value={drivingFrequency}
            onChange={(event) => setSimVectorMagnitude(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Damping ratio",
          `${formatSimulationNumber(dampingRatio, 2)}`,
          <input
            className="w-full"
            type="range"
            min="0.08"
            max="0.6"
            step="0.01"
            value={dampingRatio}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
      </>,
      "Resonance board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#0f172a" />
        <text x="52" y="54" fill="#f8fafc" fontSize="22" fontWeight="700">
          Resonance is a frequency-match condition, and damping reshapes the peak
        </text>
        <line x1={startX} y1="196" x2={endX} y2="196" stroke="#64748b" strokeWidth="3" />
        <line x1={startX} y1="74" x2={startX} y2="196" stroke="#64748b" strokeWidth="3" />
        <polyline fill="none" stroke="#38bdf8" strokeWidth="5" points={curve} />
        <line x1={currentX} y1="196" x2={currentX} y2={currentY} stroke="#e2e8f0" strokeWidth="3" strokeDasharray="8 6" />
        <circle cx={currentX} cy={currentY} r="9" fill="#22c55e" />
        <line
          x1={startX + ((naturalFrequency - 0.5) / 4.0) * (endX - startX)}
          y1="72"
          x2={startX + ((naturalFrequency - 0.5) / 4.0) * (endX - startX)}
          y2="196"
          stroke="#f97316"
          strokeWidth="3"
          strokeDasharray="8 6"
        />
        <text x="536" y="92" fill="#f8fafc" fontSize="18" textAnchor="end">
          largest response when f drive is close to f natural
        </text>
      </svg>,
      <>
        {metricCard(
          "f natural",
          `${formatSimulationNumber(naturalFrequency, 2)} Hz`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "f drive",
          `${formatSimulationNumber(drivingFrequency, 2)} Hz`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Response gain",
          `${formatSimulationNumber(gain, 2)} x`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Peak position",
          `${formatSimulationNumber(peakFrequency, 2)} Hz`,
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
        {metricCard(
          "Mismatch",
          `${formatSimulationNumber(Math.abs(drivingFrequency - naturalFrequency), 2)} Hz`,
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Peak shape",
          dampingRatio < 0.2 ? "sharp" : dampingRatio < 0.4 ? "moderate" : "broad",
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
      </>,
      [
        "Natural frequency belongs to the oscillator; driving frequency belongs to the external source.",
        "Near resonance, small frequency mismatches matter less when damping is heavy because the peak becomes broader.",
        "Damping lowers the maximum steady response as well as widening the peak.",
      ],
      "This panel forces the learner to read resonance from a response curve, which is more rigorous than memorizing 'resonance means big amplitude' without the frequency and damping structure.",
    );
  }

  if (lessonKey === "A5_L6") {
    const initialAmplitude = clamp(simMetricMeters, 0.04, 0.12);
    const elapsedTime = clamp(simVectorMagnitude, 0, 6);
    const omegaN = clamp(simDensityMass, 2.0, 6.0);
    const dampingRatio = clamp(simBias, 0.15, 1.8);
    const currentDisplacement = dampedDisplacement(dampingRatio, omegaN, initialAmplitude, elapsedTime);
    const responseType =
      dampingRatio < 0.95 ? "underdamped" : dampingRatio <= 1.05 ? "critical" : "overdamped";
    const startX = 88;
    const endX = 560;
    const mapX = (time: number) => startX + (time / 6) * (endX - startX);
    const mapY = (value: number) => 176 - (value / initialAmplitude) * 76;
    const referencePath = (zeta: number, color: string) => (
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        opacity="0.45"
        points={plotPath(startX, endX, 140, (progress) => dampedDisplacement(zeta, omegaN, initialAmplitude, progress * 6), mapY)}
      />
    );

    return renderPanel(
      "Damping response",
      <>
        {sliderField(
          "Initial displacement",
          `${formatSimulationNumber(initialAmplitude * 100, 0)} cm`,
          <input
            className="w-full"
            type="range"
            min="0.04"
            max="0.12"
            step="0.002"
            value={initialAmplitude}
            onChange={(event) => setSimMetricMeters(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Elapsed time",
          `${formatSimulationNumber(elapsedTime, 2)} s`,
          <input
            className="w-full"
            type="range"
            min="0"
            max="6"
            step="0.05"
            value={elapsedTime}
            onChange={(event) => setSimVectorMagnitude(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Natural angular frequency",
          `${formatSimulationNumber(omegaN, 2)} rad/s`,
          <input
            className="w-full"
            type="range"
            min="2"
            max="6"
            step="0.05"
            value={omegaN}
            onChange={(event) => setSimDensityMass(Number(event.target.value))}
          />,
        )}
        {sliderField(
          "Damping ratio",
          `${formatSimulationNumber(dampingRatio, 2)}`,
          <input
            className="w-full"
            type="range"
            min="0.15"
            max="1.8"
            step="0.01"
            value={dampingRatio}
            onChange={(event) => setSimBias(Number(event.target.value))}
          />,
        )}
      </>,
      "Settling-style board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="28" fill="#eff6ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">
          Damping changes how the oscillator settles, not just how small the motion gets
        </text>
        <line x1={startX} y1="176" x2={endX} y2="176" stroke="#94a3b8" strokeWidth="3" />
        {referencePath(0.25, "#2563eb")}
        {referencePath(1.0, "#0f766e")}
        {referencePath(1.6, "#f97316")}
        <polyline
          fill="none"
          stroke="#111827"
          strokeWidth="5"
          points={plotPath(startX, endX, 140, (progress) => dampedDisplacement(dampingRatio, omegaN, initialAmplitude, progress * 6), mapY)}
        />
        <line x1={mapX(elapsedTime)} y1="78" x2={mapX(elapsedTime)} y2="196" stroke="#475569" strokeWidth="3" strokeDasharray="8 6" />
        <circle cx={mapX(elapsedTime)} cy={mapY(currentDisplacement)} r="9" fill="#111827" />
        <text x="92" y="92" fill="#2563eb" fontSize="16" fontWeight="700">
          under
        </text>
        <text x="160" y="92" fill="#0f766e" fontSize="16" fontWeight="700">
          critical
        </text>
        <text x="250" y="92" fill="#f97316" fontSize="16" fontWeight="700">
          over
        </text>
      </svg>,
      <>
        {metricCard("Response type", responseType, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard(
          "Current x",
          `${formatSimulationNumber(currentDisplacement, 3)} m`,
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
        {metricCard(
          "Time marker",
          `${formatSimulationNumber(elapsedTime, 2)} s`,
          "border-emerald-200 bg-emerald-50 text-emerald-900",
        )}
        {metricCard(
          "Overshoot risk",
          dampingRatio < 1 ? "present" : "none",
          "border-amber-200 bg-amber-50 text-amber-900",
        )}
        {metricCard(
          "Best fit",
          responseType === "critical"
            ? "fast settle without overshoot"
            : responseType === "underdamped"
              ? "oscillates while fading"
              : "slow but monotonic return",
          "border-sky-200 bg-sky-50 text-sky-900",
        )}
        {metricCard(
          "Energy loss",
          dampingRatio < 0.6 ? "light" : dampingRatio < 1.2 ? "medium" : "heavy",
          "border-violet-200 bg-violet-50 text-violet-900",
        )}
      </>,
      [
        "Underdamped systems still cross equilibrium repeatedly while the envelope shrinks.",
        "Critical damping gives the fastest non-oscillatory return.",
        "Overdamping avoids overshoot too, but it settles more slowly than the critical case.",
      ],
      "This panel sharpens the application lesson by making the three settling styles directly comparable on one time axis instead of leaving damping as a vague 'more friction' statement.",
    );
  }

  return renderPanel(
    "Lesson explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its lesson-specific Swing-Return panel.
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
      "Oscillation lessons should not silently fall through to unrelated content.",
    ],
    "This safety fallback is intentionally neutral so an unhandled A5 lesson key cannot masquerade as a different explorer.",
  );
}
