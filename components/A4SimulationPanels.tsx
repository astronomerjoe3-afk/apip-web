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
          <h4 className="text-lg font-semibold text-slate-900">Vector-Rig lens</h4>
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

function horizontalArrow(
  x1: number,
  y: number,
  length: number,
  color: string,
): ReactNode {
  const direction = length >= 0 ? 1 : -1;
  const x2 = x1 + length;
  const arrowSize = 12;
  return (
    <>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="6" strokeLinecap="round" />
      <polygon
        points={
          direction > 0
            ? `${x2},${y} ${x2 - arrowSize},${y - 7} ${x2 - arrowSize},${y + 7}`
            : `${x2},${y} ${x2 + arrowSize},${y - 7} ${x2 + arrowSize},${y + 7}`
        }
        fill={color}
      />
    </>
  );
}

function sampleProjectilePoints(
  speed: number,
  angleDeg: number,
  gravity: number,
  width: number,
  height: number,
): string {
  const angle = (angleDeg * Math.PI) / 180;
  const vx = speed * Math.cos(angle);
  const vy = speed * Math.sin(angle);
  const flightTime = Math.max((2 * vy) / gravity, 0.1);
  const range = Math.max(vx * flightTime, 1);
  const maxHeight = Math.max((vy * vy) / (2 * gravity), 1);
  const points: string[] = [];

  for (let index = 0; index <= 50; index += 1) {
    const t = (flightTime * index) / 50;
    const x = vx * t;
    const y = vy * t - 0.5 * gravity * t * t;
    const px = 36 + (x / range) * (width - 72);
    const py = height - 28 - (y / maxHeight) * (height - 76);
    points.push(`${px},${py}`);
  }

  return points.join(" ");
}

function circlePoint(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
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
  simBias,
  setSimBias,
  simSpread,
  setSimSpread,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "A4_L1") {
    const force = clamp(simVectorMagnitude, 20, 160);
    const angleDeg = clamp(simVectorAngle, 10, 80);
    const balanceX = clamp(simBias, 0, 160);
    const balanceY = clamp(simSpread, 0, 160);
    const angle = (angleDeg * Math.PI) / 180;
    const fx = force * Math.cos(angle);
    const fy = force * Math.sin(angle);
    const residualX = fx - balanceX;
    const residualY = fy - balanceY;
    const residual = Math.hypot(residualX, residualY);
    const scale = 1.6;
    const originX = 148;
    const originY = 174;
    const endX = originX + fx * scale;
    const endY = originY - fy * scale;

    return renderPanel(
      "Component balance",
      <>
        {sliderField("Angled force", `${formatSimulationNumber(force, 0)} N`, <input className="w-full" type="range" min="20" max="160" step="1" value={force} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Angle above horizontal", `${formatSimulationNumber(angleDeg, 0)} deg`, <input className="w-full" type="range" min="10" max="80" step="1" value={angleDeg} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Horizontal balancing force", `${formatSimulationNumber(balanceX, 0)} N`, <input className="w-full" type="range" min="0" max="160" step="1" value={balanceX} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("Vertical balancing force", `${formatSimulationNumber(balanceY, 0)} N`, <input className="w-full" type="range" min="0" max="160" step="1" value={balanceY} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
      </>,
      "Vector-resolution board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#eff6ff" />
        <text x="54" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Resolve the angled force before you judge equilibrium</text>
        <line x1={originX} y1="52" x2={originX} y2="194" stroke="#94a3b8" strokeWidth="3" />
        <line x1="72" y1={originY} x2="548" y2={originY} stroke="#94a3b8" strokeWidth="3" />
        <circle cx={originX} cy={originY} r="6" fill="#0f172a" />
        <line x1={originX} y1={originY} x2={endX} y2={endY} stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
        <polygon points={`${endX},${endY} ${endX - 16},${endY + 2} ${endX - 6},${endY + 14}`} fill="#2563eb" />
        <line x1={originX} y1={originY} x2={endX} y2={originY} stroke="#14b8a6" strokeWidth="5" strokeDasharray="8 7" />
        <line x1={endX} y1={originY} x2={endX} y2={endY} stroke="#f97316" strokeWidth="5" strokeDasharray="8 7" />
        {horizontalArrow(originX, 204, -balanceX * 1.2, "#7c3aed")}
        <line x1="574" y1={originY} x2="574" y2={originY - balanceY * 1.1} stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
        <polygon points={`574,${originY - balanceY * 1.1} 566,${originY - balanceY * 1.1 + 12} 582,${originY - balanceY * 1.1 + 12}`} fill="#dc2626" />
        <text x={endX + 12} y={endY - 8} fill="#1d4ed8" fontSize="18" fontWeight="700">F</text>
        <text x={(originX + endX) / 2} y={originY - 10} fill="#0f766e" fontSize="17" fontWeight="700" textAnchor="middle">Fx</text>
        <text x={endX + 14} y={(originY + endY) / 2} fill="#c2410c" fontSize="17" fontWeight="700">Fy</text>
        <text x="68" y="210" fill="#6d28d9" fontSize="17" fontWeight="700">balance x</text>
        <text x="520" y="74" fill="#b91c1c" fontSize="17" fontWeight="700">balance y</text>
        <text x="360" y="210" fill="#334155" fontSize="18">Residual = ({formatSimulationNumber(residualX, 1)}, {formatSimulationNumber(residualY, 1)}) N</text>
      </svg>,
      <>
        {metricCard("Fx", `${formatSimulationNumber(fx, 1)} N`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Fy", `${formatSimulationNumber(fy, 1)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Residual magnitude", `${formatSimulationNumber(residual, 1)} N`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Status", residual < 2 ? "near equilibrium" : "not balanced yet", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Equilibrium is tested by matching x-components and y-components separately.", "A diagonal arrow can look balanced while still leaving a hidden component mismatch.", "The resultant goes to zero only after both axes are checked."],
      "This panel removes the visual-guess trap: the angled force is not compared directly with one opposing arrow; it is resolved first and balanced component by component.",
    );
  }

  if (lessonKey === "A4_L2") {
    const vx0 = clamp(simVectorMagnitude, 2, 18);
    const vy0 = clamp(simVectorAngle, -8, 16);
    const ax = clamp(simBias, -4, 4);
    const ay = clamp(simSpread, -10, 4);
    const time = clamp(simMetricMeters, 0, 4);
    const x = vx0 * time + 0.5 * ax * time * time;
    const y = vy0 * time + 0.5 * ay * time * time;
    const vx = vx0 + ax * time;
    const vy = vy0 + ay * time;
    const xScale = 7;
    const yScale = 7;

    return renderPanel(
      "Two-axis motion",
      <>
        {sliderField("Initial x-velocity", `${formatSimulationNumber(vx0, 1)} m/s`, <input className="w-full" type="range" min="2" max="18" step="0.1" value={vx0} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Initial y-velocity", `${formatSimulationNumber(vy0, 1)} m/s`, <input className="w-full" type="range" min="-8" max="16" step="0.1" value={vy0} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("x-acceleration", `${formatSimulationNumber(ax, 1)} m/s^2`, <input className="w-full" type="range" min="-4" max="4" step="0.1" value={ax} onChange={(e) => setSimBias(Number(e.target.value))} />)}
        {sliderField("y-acceleration", `${formatSimulationNumber(ay, 1)} m/s^2`, <input className="w-full" type="range" min="-10" max="4" step="0.1" value={ay} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Time", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0" max="4" step="0.05" value={time} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Component-story board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#eef2ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Keep x-motion and y-motion separate, then recombine at the end</text>
        <line x1="64" y1="106" x2="576" y2="106" stroke="#94a3b8" strokeWidth="3" />
        <line x1="64" y1="176" x2="576" y2="176" stroke="#94a3b8" strokeWidth="3" />
        <circle cx={clamp(92 + x * xScale, 92, 560)} cy="106" r="10" fill="#2563eb" />
        <circle cx="92" cy={clamp(176 - y * yScale, 68, 196)} r="10" fill="#dc2626" />
        <line x1="92" y1="92" x2={clamp(92 + x * xScale, 92, 560)} y2="92" stroke="#38bdf8" strokeWidth="5" />
        <line x1="92" y1="190" x2="92" y2={clamp(190 - y * yScale, 68, 196)} stroke="#f97316" strokeWidth="5" />
        <text x="68" y="82" fill="#1d4ed8" fontSize="18" fontWeight="700">x(t)</text>
        <text x="68" y="162" fill="#b91c1c" fontSize="18" fontWeight="700">y(t)</text>
        <text x="392" y="82" fill="#334155" fontSize="17">x = ut + 0.5at^2</text>
        <text x="392" y="162" fill="#334155" fontSize="17">y = ut + 0.5at^2</text>
        <text x="392" y="108" fill="#334155" fontSize="17">vx = u + at = {formatSimulationNumber(vx, 1)} m/s</text>
        <text x="392" y="188" fill="#334155" fontSize="17">vy = u + at = {formatSimulationNumber(vy, 1)} m/s</text>
      </svg>,
      <>
        {metricCard("x displacement", `${formatSimulationNumber(x, 2)} m`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("y displacement", `${formatSimulationNumber(y, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("vx at t", `${formatSimulationNumber(vx, 2)} m/s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("vy at t", `${formatSimulationNumber(vy, 2)} m/s`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["A zero change on one axis does not cancel motion on the other axis.", "Velocity components and acceleration components answer different questions.", "Recombining too early hides where the change is actually happening."],
      "The mathematics is the same on each axis, but the inputs can differ. Strong 2D reasoning comes from keeping the two one-dimensional stories separate until the final interpretation.",
    );
  }

  if (lessonKey === "A4_L3") {
    const speed = clamp(simVectorMagnitude, 10, 35);
    const angleDeg = clamp(simVectorAngle, 15, 75);
    const gravity = clamp(simSpread, 5, 12);
    const angle = (angleDeg * Math.PI) / 180;
    const vx = speed * Math.cos(angle);
    const vy0 = speed * Math.sin(angle);
    const flightTime = Math.max((2 * vy0) / gravity, 0.2);
    const maxSliderTime = Math.max(0.2, Math.min(5, flightTime));
    const time = clamp(simMetricMeters, 0, maxSliderTime);
    const x = vx * time;
    const y = Math.max(0, vy0 * time - 0.5 * gravity * time * time);
    const vy = vy0 - gravity * time;
    const range = vx * flightTime;
    const maxHeight = (vy0 * vy0) / (2 * gravity);

    return renderPanel(
      "Projectile split",
      <>
        {sliderField("Launch speed", `${formatSimulationNumber(speed, 1)} m/s`, <input className="w-full" type="range" min="10" max="35" step="0.1" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Launch angle", `${formatSimulationNumber(angleDeg, 0)} deg`, <input className="w-full" type="range" min="15" max="75" step="1" value={angleDeg} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Gravity", `${formatSimulationNumber(gravity, 1)} m/s^2`, <input className="w-full" type="range" min="5" max="12" step="0.1" value={gravity} onChange={(e) => setSimSpread(Number(e.target.value))} />)}
        {sliderField("Time marker", `${formatSimulationNumber(time, 2)} s`, <input className="w-full" type="range" min="0" max={maxSliderTime} step="0.02" value={time} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Projectile board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#eff6ff" />
        <text x="54" y="54" fill="#0f172a" fontSize="22" fontWeight="700">One launch, two linked stories: constant vx and gravity-driven vy</text>
        <line x1="52" y1="196" x2="596" y2="196" stroke="#94a3b8" strokeWidth="3" />
        <line x1="52" y1="42" x2="52" y2="196" stroke="#94a3b8" strokeWidth="3" />
        <polyline points={sampleProjectilePoints(speed, angleDeg, gravity, 640, 250)} fill="none" stroke="#2563eb" strokeWidth="5" />
        <circle
          cx={52 + (x / Math.max(range, 1)) * 540}
          cy={196 - (y / Math.max(maxHeight, 1)) * 134}
          r="8"
          fill="#dc2626"
        />
        <text x="384" y="88" fill="#1d4ed8" fontSize="18" fontWeight="700">vx = {formatSimulationNumber(vx, 2)} m/s (constant)</text>
        <text x="384" y="116" fill="#b91c1c" fontSize="18" fontWeight="700">vy = {formatSimulationNumber(vy, 2)} m/s</text>
        <text x="384" y="144" fill="#334155" fontSize="17">range = {formatSimulationNumber(range, 2)} m</text>
        <text x="384" y="170" fill="#334155" fontSize="17">max height = {formatSimulationNumber(maxHeight, 2)} m</text>
      </svg>,
      <>
        {metricCard("Time of flight", `${formatSimulationNumber(flightTime, 2)} s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Horizontal range", `${formatSimulationNumber(range, 2)} m`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Max height", `${formatSimulationNumber(maxHeight, 2)} m`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Current vy", `${formatSimulationNumber(vy, 2)} m/s`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Horizontal motion is uniform in the ideal model.", "Vertical motion changes because gravity acts vertically throughout the flight.", "Time is the bridge variable shared by both components."],
      "The path looks curved only after the two component stories are recombined. The mathematics stays clearer when you solve x and y separately and link them with the same time value.",
    );
  }

  if (lessonKey === "A4_L4") {
    const m1 = clamp(simDensityMass, 0.5, 3);
    const m2 = clamp(simDensityVolume, 0.5, 3);
    const u1 = clamp(simVectorMagnitude, 2, 14);
    const u2 = clamp(simVectorAngle, -8, 6);
    const mode = Math.round(clamp(simBias, 0, 1));
    const modeLabel = mode === 0 ? "perfectly inelastic" : "elastic";
    const pBefore = m1 * u1 + m2 * u2;
    const v1 =
      mode === 0
        ? pBefore / (m1 + m2)
        : ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2;
    const v2 =
      mode === 0
        ? v1
        : ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2;
    const pAfter = m1 * v1 + m2 * v2;
    const keBefore = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
    const keAfter = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

    return renderPanel(
      "Collision ledger",
      <>
        {sliderField("Mass 1", `${formatSimulationNumber(m1, 2)} kg`, <input className="w-full" type="range" min="0.5" max="3" step="0.05" value={m1} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Velocity 1", `${formatSimulationNumber(u1, 1)} m/s`, <input className="w-full" type="range" min="2" max="14" step="0.1" value={u1} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Mass 2", `${formatSimulationNumber(m2, 2)} kg`, <input className="w-full" type="range" min="0.5" max="3" step="0.05" value={m2} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
        {sliderField("Velocity 2", `${formatSimulationNumber(u2, 1)} m/s`, <input className="w-full" type="range" min="-8" max="6" step="0.1" value={u2} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
        {sliderField("Collision mode", modeLabel, <input className="w-full" type="range" min="0" max="1" step="1" value={mode} onChange={(e) => setSimBias(Number(e.target.value))} />)}
      </>,
      "Before-and-after momentum board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#f8fafc" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Check total momentum first; classify the collision second</text>
        <text x="132" y="88" fill="#334155" fontSize="18" fontWeight="700">Before</text>
        <text x="412" y="88" fill="#334155" fontSize="18" fontWeight="700">After</text>
        {horizontalArrow(84, 128, u1 * 16, "#2563eb")}
        {horizontalArrow(84, 170, u2 * 16, "#14b8a6")}
        {horizontalArrow(364, 128, v1 * 16, "#2563eb")}
        {horizontalArrow(364, 170, v2 * 16, "#14b8a6")}
        <text x="84" y="112" fill="#1d4ed8" fontSize="17" fontWeight="700">m1</text>
        <text x="84" y="154" fill="#0f766e" fontSize="17" fontWeight="700">m2</text>
        <text x="364" y="112" fill="#1d4ed8" fontSize="17" fontWeight="700">m1</text>
        <text x="364" y="154" fill="#0f766e" fontSize="17" fontWeight="700">m2</text>
        <text x="234" y="208" fill="#334155" fontSize="18" textAnchor="middle">p before = {formatSimulationNumber(pBefore, 2)} kg m/s</text>
        <text x="500" y="208" fill="#334155" fontSize="18" textAnchor="middle">p after = {formatSimulationNumber(pAfter, 2)} kg m/s</text>
      </svg>,
      <>
        {metricCard("Total momentum before", `${formatSimulationNumber(pBefore, 2)} kg m/s`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Total momentum after", `${formatSimulationNumber(pAfter, 2)} kg m/s`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("KE before", `${formatSimulationNumber(keBefore, 2)} J`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("KE after", `${formatSimulationNumber(keAfter, 2)} J`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Momentum conservation is the safest first ledger for the whole system.", "Impulse changes one object's momentum; the total-system momentum check comes first.", "Elastic and inelastic labels are decided by kinetic-energy behavior after the momentum ledger is secure."],
      "This explorer deliberately separates the momentum decision from the energy decision. That makes the module less repetitive and more rigorous than treating every collision as a one-equation substitution exercise.",
    );
  }

  if (lessonKey === "A4_L5") {
    const mass = clamp(simDensityMass, 0.5, 5);
    const speed = clamp(simVectorMagnitude, 3, 24);
    const radius = clamp(simMetricMeters, 0.5, 4);
    const markerAngle = clamp(simVectorAngle, 0, 359);
    const aC = (speed * speed) / radius;
    const force = mass * aC;
    const period = (2 * Math.PI * radius) / speed;
    const centerX = 320;
    const centerY = 128;
    const drawRadius = 72;
    const point = circlePoint(centerX, centerY, drawRadius, markerAngle - 90);
    const tangentAngle = ((markerAngle - 90 + 90) * Math.PI) / 180;
    const tangentX = point.x + 46 * Math.cos(tangentAngle);
    const tangentY = point.y + 46 * Math.sin(tangentAngle);

    return renderPanel(
      "Circular-motion turn",
      <>
        {sliderField("Mass", `${formatSimulationNumber(mass, 2)} kg`, <input className="w-full" type="range" min="0.5" max="5" step="0.05" value={mass} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Speed", `${formatSimulationNumber(speed, 1)} m/s`, <input className="w-full" type="range" min="3" max="24" step="0.1" value={speed} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Radius", `${formatSimulationNumber(radius, 2)} m`, <input className="w-full" type="range" min="0.5" max="4" step="0.05" value={radius} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Orbit marker", `${formatSimulationNumber(markerAngle, 0)} deg`, <input className="w-full" type="range" min="0" max="359" step="1" value={markerAngle} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />)}
      </>,
      "Centripetal board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#eef2ff" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Constant speed still needs inward acceleration because the velocity direction keeps changing</text>
        <circle cx={centerX} cy={centerY} r={drawRadius} fill="none" stroke="#94a3b8" strokeWidth="4" />
        <circle cx={point.x} cy={point.y} r="10" fill="#2563eb" />
        <line x1={point.x} y1={point.y} x2={centerX} y2={centerY} stroke="#dc2626" strokeWidth="5" />
        <polygon points={`${centerX},${centerY} ${centerX - 10},${centerY - 6} ${centerX - 10},${centerY + 6}`} fill="#dc2626" />
        <line x1={point.x} y1={point.y} x2={tangentX} y2={tangentY} stroke="#14b8a6" strokeWidth="5" />
        <polygon points={`${tangentX},${tangentY} ${tangentX - 12},${tangentY - 6} ${tangentX - 8},${tangentY + 8}`} fill="#14b8a6" />
        <text x="118" y="96" fill="#b91c1c" fontSize="18" fontWeight="700">inward a and inward F</text>
        <text x="438" y="96" fill="#0f766e" fontSize="18" fontWeight="700">tangent v</text>
        <text x="420" y="206" fill="#334155" fontSize="18">a = v^2 / r, F = mv^2 / r</text>
      </svg>,
      <>
        {metricCard("Centripetal acceleration", `${formatSimulationNumber(aC, 2)} m/s^2`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Resultant inward force", `${formatSimulationNumber(force, 2)} N`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Period", `${formatSimulationNumber(period, 2)} s`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Turning status", speed > 16 || radius < 1 ? "tight / demanding turn" : "gentler turn", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["The velocity vector is tangential, but the acceleration vector is inward.", "Constant speed does not mean zero acceleration when direction is changing.", "There is no extra outward driving force in the inertial-frame explanation."],
      "A4 needs the direction-change story to be explicit. This board makes the inward requirement visible before any number work begins.",
    );
  }

  if (lessonKey === "A4_L6") {
    const force = clamp(simVectorMagnitude, 500, 4000);
    const areaMm2 = clamp(simDensityMass, 0.6, 3.0);
    const originalLength = clamp(simMetricMeters, 0.6, 2.0);
    const extensionMm = clamp(simDensityVolume, 0.2, 4.0);
    const area = areaMm2 * 1e-6;
    const extension = extensionMm / 1000;
    const stressPa = force / area;
    const stressMPa = stressPa / 1e6;
    const strain = extension / originalLength;
    const youngPa = strain > 0 ? stressPa / strain : 0;
    const youngGPa = youngPa / 1e9;
    const regime = strain < 0.002 ? "close to linear-elastic" : strain < 0.01 ? "elastic but check graph" : "beyond simple linear use";

    return renderPanel(
      "Materials response",
      <>
        {sliderField("Force", `${formatSimulationNumber(force, 0)} N`, <input className="w-full" type="range" min="500" max="4000" step="10" value={force} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Cross-sectional area", `${formatSimulationNumber(areaMm2, 2)} mm^2`, <input className="w-full" type="range" min="0.6" max="3.0" step="0.02" value={areaMm2} onChange={(e) => setSimDensityMass(Number(e.target.value))} />)}
        {sliderField("Original length", `${formatSimulationNumber(originalLength, 2)} m`, <input className="w-full" type="range" min="0.6" max="2.0" step="0.02" value={originalLength} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Extension", `${formatSimulationNumber(extensionMm, 2)} mm`, <input className="w-full" type="range" min="0.2" max="4.0" step="0.02" value={extensionMm} onChange={(e) => setSimDensityVolume(Number(e.target.value))} />)}
      </>,
      "Stress-strain board",
      <svg viewBox="0 0 640 250" className="w-full">
        <rect x="28" y="24" width="584" height="194" rx="24" fill="#f8fafc" />
        <text x="52" y="54" fill="#0f172a" fontSize="22" fontWeight="700">Do not compare load alone; normalize by area and original length</text>
        <rect x="144" y="78" width="16" height="102" rx="8" fill="#94a3b8" />
        <rect x="160" y="78" width="16" height={102 + extensionMm * 10} rx="8" fill="#2563eb" />
        <line x1="240" y1="92" x2="374" y2="92" stroke="#dc2626" strokeWidth="6" />
        <polygon points="374,92 360,84 360,100" fill="#dc2626" />
        <text x="306" y="78" fill="#b91c1c" fontSize="18" fontWeight="700" textAnchor="middle">force</text>
        <text x="108" y="198" fill="#334155" fontSize="18">original</text>
        <text x="168" y="214" fill="#334155" fontSize="18">loaded</text>
        <text x="404" y="116" fill="#334155" fontSize="18">stress = F / A</text>
        <text x="404" y="144" fill="#334155" fontSize="18">strain = extension / original length</text>
        <text x="404" y="172" fill="#334155" fontSize="18">E = stress / strain</text>
      </svg>,
      <>
        {metricCard("Stress", `${formatSimulationNumber(stressMPa, 2)} MPa`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Strain", `${formatSimulationNumber(strain, 5)}`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Young modulus", `${formatSimulationNumber(youngGPa, 2)} GPa`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Region check", regime, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Stress compares force with area, so a thicker sample can carry the same load differently.", "Strain is fractional change, not raw extension alone.", "Young modulus is meaningful only when the sample is being treated in the elastic region."],
      "This final panel makes the normalization explicit. That keeps the worked examples mathematically rigorous instead of reducing materials to a simple force-extension slogan.",
    );
  }

  return renderPanel(
    "A4 explorer unavailable",
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
      This lesson is waiting for its Advanced Mechanics and Materials explorer.
    </div>,
    "Explorer placeholder",
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600">
      Load an A4 lesson key to see vector, projectile, momentum, circular-motion, or materials-response reasoning.
    </div>,
    <>
      {metricCard("Status", "not loaded", "border-slate-200 bg-slate-50 text-slate-900")}
    </>,
    ["A4 lessons need module-specific explorers.", "Each board should match the exact lesson physics.", "The panel should support the worked example rather than distract from it."],
    "If this fallback appears during an A4 lesson, the lesson key is not being routed into the right explorer.",
  );
}
