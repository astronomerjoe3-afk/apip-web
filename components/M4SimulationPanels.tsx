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

function arrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
): ReactNode {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 12;
  const leftX = x2 - head * Math.cos(angle - Math.PI / 6);
  const leftY = y2 - head * Math.sin(angle - Math.PI / 6);
  const rightX = x2 - head * Math.cos(angle + Math.PI / 6);
  const rightY = y2 - head * Math.sin(angle + Math.PI / 6);
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${leftX},${leftY} ${rightX},${rightY}`} fill={color} />
    </>
  );
}

export default function M4SimulationPanels({
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

  if (lessonKey === "M4_L1") {
    const totalPush = clamp(simVectorMagnitude, 200, 1200);
    const narrowPatches = clamp(Math.round(simDensityMass), 1, 6);
    const widePatches = clamp(Math.round(simBias), 4, 12);
    const patchArea = 0.01;
    const narrowArea = narrowPatches * patchArea;
    const wideArea = widePatches * patchArea;
    const narrowPatchLoad = totalPush / narrowPatches;
    const widePatchLoad = totalPush / widePatches;
    const narrowPressure = totalPush / narrowArea;
    const widePressure = totalPush / wideArea;

    return render(
      "Patch spread explorer",
      <>
        {sliderField(
          "Total push (N)",
          `${formatSimulationNumber(totalPush, 0)} N`,
          <input className="w-full" type="range" min="200" max="1200" step="50" value={totalPush} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Narrow footprint patches",
          `${formatSimulationNumber(narrowPatches, 0)} patches`,
          <input className="w-full" type="range" min="1" max="6" step="1" value={narrowPatches} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Wide footprint patches",
          `${formatSimulationNumber(widePatches, 0)} patches`,
          <input className="w-full" type="range" min="4" max="12" step="1" value={widePatches} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Patch-Dome floor board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="12" y="18" width="616" height="212" rx="24" fill="#eef6ff" />
        <text x="34" y="44" fill="#0f172a" fontSize="22" fontWeight="700">Same push, different patch spread</text>
        <rect x="44" y="188" width="220" height="16" rx="8" fill="#94a3b8" />
        <rect x="376" y="188" width="220" height="16" rx="8" fill="#94a3b8" />
        <rect x="110" y={132 - narrowPatches * 4} width="88" height="44" rx="16" fill="#bfdbfe" stroke="#2563eb" strokeWidth="4" />
        <rect x="430" y={132 - widePatches * 2} width="110" height="44" rx="16" fill="#dcfce7" stroke="#16a34a" strokeWidth="4" />
        {arrow(154, 86, 154, 132 - narrowPatches * 4, "#2563eb", 10)}
        {arrow(485, 86, 485, 132 - widePatches * 2, "#16a34a", 10)}
        <text x="84" y="84" fill="#1d4ed8" fontSize="18" fontWeight="700">Narrow footprint</text>
        <text x="418" y="84" fill="#166534" fontSize="18" fontWeight="700">Wide footprint</text>
        <text x="70" y="222" fill="#334155" fontSize="15">{formatSimulationNumber(narrowPatches, 0)} patches share {formatSimulationNumber(totalPush, 0)} N</text>
        <text x="392" y="222" fill="#334155" fontSize="15">{formatSimulationNumber(widePatches, 0)} patches share {formatSimulationNumber(totalPush, 0)} N</text>
      </svg>,
      <>
        {metricCard("Narrow patch load", `${formatSimulationNumber(narrowPatchLoad, 0)} N per patch`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Wide patch load", `${formatSimulationNumber(widePatchLoad, 0)} N per patch`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Narrow pressure", `${formatSimulationNumber(narrowPressure, 0)} Pa`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Wide pressure", `${formatSimulationNumber(widePressure, 0)} Pa`, "border-lime-200 bg-lime-50 text-lime-900")}
        {metricCard("Narrow area", `${formatSimulationNumber(narrowArea, 2)} m^2`, "border-slate-200 bg-slate-50 text-slate-900")}
        {metricCard("Wide area", `${formatSimulationNumber(wideArea, 2)} m^2`, "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Pressure and force separate as soon as the same push is spread over different numbers of patches.",
        "Patch load makes the concentration visible before the formal formula appears.",
        "Doubling the patch spread halves both patch load and pressure when the push stays fixed.",
      ],
      "Patch pressure is the crowdedness of the push. The floor feels the same total push in both cases, but the narrow footprint overloads each patch far more.",
    );
  }

  if (lessonKey === "M4_L2") {
    const totalPush = clamp(simVectorMagnitude, 200, 1800);
    const limit = clamp(simSpread, 1000, 10000);
    const candidateArea = clamp(simDensityMass / 100, 0.05, 1);
    const requiredArea = totalPush / limit;
    const candidatePressure = totalPush / candidateArea;
    const safe = candidatePressure <= limit;

    return render(
      "Footprint rescue lab",
      <>
        {sliderField(
          "Total push (N)",
          `${formatSimulationNumber(totalPush, 0)} N`,
          <input className="w-full" type="range" min="200" max="1800" step="50" value={totalPush} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Safe pressure limit (Pa)",
          `${formatSimulationNumber(limit, 0)} Pa`,
          <input className="w-full" type="range" min="1000" max="10000" step="500" value={limit} onChange={(e) => setSimSpread(Number(e.target.value))} />,
        )}
        {sliderField(
          "Candidate footprint area (m^2)",
          `${formatSimulationNumber(candidateArea, 2)} m^2`,
          <input className="w-full" type="range" min="5" max="100" step="5" value={candidateArea * 100} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
      </>,
      "Rescue design board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="18" y="22" width="604" height="206" rx="24" fill="#f8fafc" />
        <text x="38" y="48" fill="#0f172a" fontSize="22" fontWeight="700">Patch safety limit</text>
        <rect x="60" y="108" width="520" height="28" rx="14" fill="#e2e8f0" />
        <rect x="60" y="108" width={Math.min(520, (limit / 10000) * 520)} height="28" rx="14" fill="#86efac" />
        <line x1={60 + Math.min(520, (candidatePressure / 10000) * 520)} y1="94" x2={60 + Math.min(520, (candidatePressure / 10000) * 520)} y2="150" stroke={safe ? "#16a34a" : "#dc2626"} strokeWidth="6" strokeLinecap="round" />
        <text x="60" y="90" fill="#166534" fontSize="16" fontWeight="700">Safe up to {formatSimulationNumber(limit, 0)} Pa</text>
        <text x="60" y="182" fill={safe ? "#166534" : "#b91c1c"} fontSize="18" fontWeight="700">
          {safe ? "Footprint survives the limit" : "Footprint overloads the floor"}
        </text>
        <text x="60" y="206" fill="#475569" fontSize="15">Required minimum area = {formatSimulationNumber(requiredArea, 2)} m^2</text>
      </svg>,
      <>
        {metricCard("Candidate pressure", `${formatSimulationNumber(candidatePressure, 0)} Pa`, safe ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Required area", `${formatSimulationNumber(requiredArea, 2)} m^2`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Candidate area", `${formatSimulationNumber(candidateArea, 2)} m^2`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Safety verdict", safe ? "Safe design" : "Unsafe design", safe ? "border-lime-200 bg-lime-50 text-lime-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Rearranged link", `A = F / P = ${formatSimulationNumber(totalPush, 0)} / ${formatSimulationNumber(limit, 0)}`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Total push", `${formatSimulationNumber(totalPush, 0)} N`, "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "The safe limit belongs to pressure, so design starts from patch load instead of from force alone.",
        "Working backward to a minimum area is still pressure physics because the relation never changed.",
        "The design becomes safe exactly when the footprint grows enough to pull pressure under the limit.",
      ],
      "A fragile floor never asks for the total push by itself; it asks how much of that push lands on each unit area. That is why the minimum-area answer matters.",
    );
  }

  if (lessonKey === "M4_L3") {
    const depthA = clamp(simMetricMeters, 0.5, 10);
    const depthB = clamp(simBias, 0.5, 10);
    const density = clamp(simFluidDensity, 800, 1400);
    const g = clamp(simDensityVolume, 8, 12);
    const pressureA = density * g * depthA;
    const pressureB = density * g * depthB;

    return render(
      "Liquid stack explorer",
      <>
        {sliderField(
          "Patch A depth (m)",
          `${formatSimulationNumber(depthA, 1)} m`,
          <input className="w-full" type="range" min="0.5" max="10" step="0.5" value={depthA} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Patch B depth (m)",
          `${formatSimulationNumber(depthB, 1)} m`,
          <input className="w-full" type="range" min="0.5" max="10" step="0.5" value={depthB} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Liquid density (kg/m^3)",
          `${formatSimulationNumber(density, 0)} kg/m^3`,
          <input className="w-full" type="range" min="800" max="1400" step="50" value={density} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />,
        )}
        {sliderField(
          "World Pull g (N/kg)",
          `${formatSimulationNumber(g, 1)} N/kg`,
          <input className="w-full" type="range" min="8" max="12" step="0.5" value={g} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Liquid chamber board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="30" y="30" width="236" height="180" rx="18" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
        <rect x="374" y="30" width="180" height="180" rx="18" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
        <line x1="30" y1="56" x2="266" y2="56" stroke="#2563eb" strokeWidth="4" />
        <line x1="374" y1="56" x2="554" y2="56" stroke="#2563eb" strokeWidth="4" />
        <circle cx="250" cy={56 + depthA * 13} r="12" fill="#f97316" />
        <circle cx="538" cy={56 + depthB * 13} r="12" fill="#16a34a" />
        <line x1="250" y1="56" x2="250" y2={56 + depthA * 13} stroke="#f97316" strokeDasharray="6 6" strokeWidth="4" />
        <line x1="538" y1="56" x2="538" y2={56 + depthB * 13} stroke="#16a34a" strokeDasharray="6 6" strokeWidth="4" />
        <text x="50" y="42" fill="#1d4ed8" fontSize="18" fontWeight="700">Wide tank</text>
        <text x="394" y="42" fill="#1d4ed8" fontSize="18" fontWeight="700">Narrow tank</text>
        <text x="52" y="226" fill="#475569" fontSize="15">Pressure depends on depth, density, and g - not width.</text>
      </svg>,
      <>
        {metricCard("Patch A pressure", `${formatSimulationNumber(pressureA, 0)} Pa`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Patch B pressure", `${formatSimulationNumber(pressureB, 0)} Pa`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Density", `${formatSimulationNumber(density, 0)} kg/m^3`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("World Pull", `${formatSimulationNumber(g, 1)} N/kg`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Pressure difference", `${formatSimulationNumber(Math.abs(pressureA - pressureB), 0)} Pa`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Hydrostatic rule", "p = rhogh", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Deeper patches carry a taller layer stack above them, so pressure rises with depth.",
        "Liquid density and World Pull change how heavy each layer stack is.",
        "The tank can be narrow or wide and still give the same pressure at the same depth in the same liquid.",
      ],
      "Hydrostatic pressure is a location rule. The patch cares about what is above it, not about the width of the chamber elsewhere.",
    );
  }

  if (lessonKey === "M4_L4") {
    const leftDepth = clamp(simMetricMeters, 0.5, 8);
    const offset = clamp(simBias, -2, 2);
    const rightDepth = clamp(leftDepth + offset, 0.5, 10);
    const density = clamp(simFluidDensity, 800, 1400);
    const g = clamp(simDensityVolume, 8, 12);
    const leftPressure = density * g * leftDepth;
    const rightPressure = density * g * rightDepth;
    const match = Math.abs(leftPressure - rightPressure) < 1e-9;

    return render(
      "Same-level showdown",
      <>
        {sliderField(
          "Left-vessel depth (m)",
          `${formatSimulationNumber(leftDepth, 1)} m`,
          <input className="w-full" type="range" min="0.5" max="8" step="0.5" value={leftDepth} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Right-vessel depth offset (m)",
          `${formatSimulationNumber(offset, 1)} m`,
          <input className="w-full" type="range" min="-2" max="2" step="0.5" value={offset} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Liquid density (kg/m^3)",
          `${formatSimulationNumber(density, 0)} kg/m^3`,
          <input className="w-full" type="range" min="800" max="1400" step="50" value={density} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />,
        )}
        {sliderField(
          "World Pull g (N/kg)",
          `${formatSimulationNumber(g, 1)} N/kg`,
          <input className="w-full" type="range" min="8" max="12" step="0.5" value={g} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />,
        )}
      </>,
      "Equal-level vessel board",
      <svg viewBox="0 0 640 250" className="w-full">
        <path d="M48 40 H190 V204 H80 V120 H48 Z" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
        <path d="M352 40 H592 V204 H442 V140 H352 Z" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
        <line x1="48" y1="56" x2="190" y2="56" stroke="#2563eb" strokeWidth="4" />
        <line x1="352" y1="56" x2="592" y2="56" stroke="#2563eb" strokeWidth="4" />
        <circle cx="174" cy={56 + leftDepth * 16} r="11" fill="#f97316" />
        <circle cx="576" cy={56 + rightDepth * 16} r="11" fill="#16a34a" />
        <line x1="174" y1={56 + leftDepth * 16} x2="576" y2={56 + leftDepth * 16} stroke="#94a3b8" strokeDasharray="6 6" strokeWidth="3" />
        <text x="60" y="42" fill="#1d4ed8" fontSize="18" fontWeight="700">Vessel A</text>
        <text x="364" y="42" fill="#1d4ed8" fontSize="18" fontWeight="700">Vessel B</text>
        <text x="56" y="228" fill={match ? "#166534" : "#b91c1c"} fontSize="16" fontWeight="700">
          {match ? "Same level -> same pressure" : "Depth changed -> pressure changed"}
        </text>
      </svg>,
      <>
        {metricCard("Left pressure", `${formatSimulationNumber(leftPressure, 0)} Pa`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Right pressure", `${formatSimulationNumber(rightPressure, 0)} Pa`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Left depth", `${formatSimulationNumber(leftDepth, 1)} m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Right depth", `${formatSimulationNumber(rightDepth, 1)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Comparison", match ? "Pressures match" : "Pressures do not match", match ? "border-lime-200 bg-lime-50 text-lime-900" : "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("What matters", "Depth and liquid, not shape", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Two patches at the same depth in the same resting liquid match even when the vessels look very different.",
        "The equal-level rule is a direct attack on the shape misconception.",
        "The moment one patch moves deeper, the equality breaks for a real physical reason.",
      ],
      "Container outline is not one of the hydrostatic variables. Pressure follows the location in the liquid, so equal depth wins over visual shape.",
    );
  }

  if (lessonKey === "M4_L5") {
    const depth = clamp(simMetricMeters, 0.5, 8);
    const density = clamp(simFluidDensity, 800, 1400);
    const g = clamp(simDensityVolume, 8, 12);
    const angle = clamp(simVectorAngle, 0, 75);
    const areaA = clamp(simDensityMass / 100, 0.1, 0.8);
    const areaB = clamp(simSpread / 100, 0.1, 0.8);
    const pressure = density * g * depth;
    const forceA = pressure * areaA;
    const forceB = pressure * areaB;
    const centerX = 318;
    const centerY = 132;
    const halfLength = 62;
    const radians = angle * Math.PI / 180;
    const dx = Math.cos(radians) * halfLength;
    const dy = Math.sin(radians) * halfLength;
    const normalAngle = radians - Math.PI / 2;
    const nx = Math.cos(normalAngle) * 84;
    const ny = Math.sin(normalAngle) * 84;

    return render(
      "Surface patch explorer",
      <>
        {sliderField(
          "Depth of the location (m)",
          `${formatSimulationNumber(depth, 1)} m`,
          <input className="w-full" type="range" min="0.5" max="8" step="0.5" value={depth} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Patch angle (deg from horizontal)",
          `${formatSimulationNumber(angle, 0)} deg`,
          <input className="w-full" type="range" min="0" max="75" step="5" value={angle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
        {sliderField(
          "Patch A area (m^2)",
          `${formatSimulationNumber(areaA, 2)} m^2`,
          <input className="w-full" type="range" min="10" max="80" step="5" value={areaA * 100} onChange={(e) => setSimDensityMass(Number(e.target.value))} />,
        )}
        {sliderField(
          "Patch B area (m^2)",
          `${formatSimulationNumber(areaB, 2)} m^2`,
          <input className="w-full" type="range" min="10" max="80" step="5" value={areaB * 100} onChange={(e) => setSimSpread(Number(e.target.value))} />,
        )}
        {sliderField(
          "Liquid density (kg/m^3)",
          `${formatSimulationNumber(density, 0)} kg/m^3`,
          <input className="w-full" type="range" min="800" max="1400" step="50" value={density} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />,
        )}
      </>,
      "Patch direction board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="46" y="30" width="548" height="176" rx="22" fill="#dbeafe" />
        <line x1="318" y1="56" x2="318" y2="206" stroke="#38bdf8" strokeDasharray="8 8" strokeWidth="4" />
        <circle cx={centerX} cy={centerY} r="10" fill="#0f172a" />
        <line x1={centerX - dx} y1={centerY - dy} x2={centerX + dx} y2={centerY + dy} stroke="#f97316" strokeWidth="10" strokeLinecap="round" />
        {arrow(centerX, centerY, centerX + nx, centerY + ny, "#16a34a", 8)}
        <text x="68" y="54" fill="#1d4ed8" fontSize="18" fontWeight="700">Same point in the fluid</text>
        <text x="404" y="90" fill="#166534" fontSize="18" fontWeight="700">Force stays normal to the patch</text>
        <text x="58" y="224" fill="#475569" fontSize="15">Pressure stays with the location; surface choice sets the force direction.</text>
      </svg>,
      <>
        {metricCard("Point pressure", `${formatSimulationNumber(pressure, 0)} Pa`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Patch A force", `${formatSimulationNumber(forceA, 0)} N`, "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Patch B force", `${formatSimulationNumber(forceB, 0)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Direction rule", "Force is perpendicular to the patch", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Area effect", `${formatSimulationNumber(areaA, 2)} -> ${formatSimulationNumber(areaB, 2)} m^2`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Pressure status", "Same location, same pressure", "border-slate-200 bg-slate-50 text-slate-900")}
      </>,
      [
        "Pressure is scalar at a point, so it belongs to the location rather than to one special direction.",
        "The patch chooses the force direction because the force is normal to the surface.",
        "At fixed pressure, total force grows with patch area even though the pressure value does not change.",
      ],
      "This is the key fluid distinction: pressure itself is not a downward arrow. The pressure value belongs to the location; the force on a chosen surface turns to stay perpendicular to that surface.",
    );
  }

  const seaLevelPressure = clamp(simVectorMagnitude, 95000, 105000);
  const altitude = clamp(simMetricMeters, 0, 3000);
  const liquidDepth = clamp(simBias, 0, 8);
  const density = clamp(simFluidDensity, 800, 1400);
  const g = clamp(simDensityVolume, 8, 12);
  const atmospheric = Math.max(50000, seaLevelPressure - altitude * 12);
  const liquidPressure = density * g * liquidDepth;
  const totalPressure = atmospheric + liquidPressure;

  return render(
    "Sky blanket explorer",
    <>
      {sliderField(
        "Sea-level atmospheric pressure (Pa)",
        `${formatSimulationNumber(seaLevelPressure, 0)} Pa`,
        <input className="w-full" type="range" min="95000" max="105000" step="500" value={seaLevelPressure} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
      )}
      {sliderField(
        "Station altitude (m)",
        `${formatSimulationNumber(altitude, 0)} m`,
        <input className="w-full" type="range" min="0" max="3000" step="250" value={altitude} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
      )}
      {sliderField(
        "Liquid depth below open surface (m)",
        `${formatSimulationNumber(liquidDepth, 1)} m`,
        <input className="w-full" type="range" min="0" max="8" step="0.5" value={liquidDepth} onChange={(e) => setSimBias(Number(e.target.value))} />,
      )}
      {sliderField(
        "Liquid density (kg/m^3)",
        `${formatSimulationNumber(density, 0)} kg/m^3`,
        <input className="w-full" type="range" min="800" max="1400" step="50" value={density} onChange={(e) => setSimFluidDensity(Number(e.target.value))} />,
      )}
    </>,
    "Sky blanket and tank board",
    <svg viewBox="0 0 640 250" className="w-full">
      <rect x="24" y="26" width="270" height="190" rx="22" fill="#eff6ff" />
      <path d="M364 70 H548 V208 H404 V92 H364 Z" fill="#dbeafe" stroke="#60a5fa" strokeWidth="4" />
      <line x1="364" y1="92" x2="548" y2="92" stroke="#2563eb" strokeWidth="4" />
      <rect x="50" y={52 + altitude / 30} width="72" height="52" rx="16" fill="#bfdbfe" stroke="#2563eb" strokeWidth="4" />
      <line x1="86" y1={104 + altitude / 30} x2="86" y2="188" stroke="#64748b" strokeWidth="4" />
      <circle cx="528" cy={92 + liquidDepth * 12} r="11" fill="#16a34a" />
      <line x1="528" y1="92" x2="528" y2={92 + liquidDepth * 12} stroke="#16a34a" strokeDasharray="6 6" strokeWidth="4" />
      <text x="46" y="50" fill="#1d4ed8" fontSize="18" fontWeight="700">Sky deck</text>
      <text x="380" y="50" fill="#1d4ed8" fontSize="18" fontWeight="700">Open liquid</text>
      <text x="42" y="216" fill="#475569" fontSize="15">Lower altitude means more sky blanket.</text>
      <text x="378" y="226" fill="#475569" fontSize="15">Total pressure = p_atm + rhogh</text>
    </svg>,
    <>
      {metricCard("Atmospheric pressure here", `${formatSimulationNumber(atmospheric, 0)} Pa`, "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Liquid contribution", `${formatSimulationNumber(liquidPressure, 0)} Pa`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("Total pressure", `${formatSimulationNumber(totalPressure, 0)} Pa`, "border-amber-200 bg-amber-50 text-amber-900")}
      {metricCard("Altitude", `${formatSimulationNumber(altitude, 0)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
      {metricCard("Liquid depth", `${formatSimulationNumber(liquidDepth, 1)} m`, "border-rose-200 bg-rose-50 text-rose-900")}
      {metricCard("Total-pressure rule", "p_total = p_atm + rhogh", "border-slate-200 bg-slate-50 text-slate-900")}
    </>,
    [
      "Air is also a fluid, so atmospheric pressure belongs in the same Patch-Dome world as liquid pressure.",
      "Climbing to higher altitude reduces the sky blanket because there is less air above the patch.",
      "Below an open liquid surface, total pressure is the atmospheric part plus the liquid-stack part.",
    ],
    "The pressure at an open submerged point is a ledger of two loads: the sky blanket above the liquid surface and the liquid stack from the surface down to the patch.",
  );
}
