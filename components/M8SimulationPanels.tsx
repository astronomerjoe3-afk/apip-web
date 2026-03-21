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
}

export default function M8SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M8_L1") {
    const incident = clamp(simVectorMagnitude, 5, 80);
    const surface = 90 - incident;
    const objectDistance = clamp(simMetricMeters, 2, 12);
    return renderPanel(
      "Mirror Match",
      <>
        {sliderField("Incident angle", `${formatSimulationNumber(incident, 0)} deg`, <input className="w-full" type="range" min="5" max="80" step="1" value={incident} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Object distance", `${formatSimulationNumber(objectDistance, 0)} cm`, <input className="w-full" type="range" min="2" max="12" step="1" value={objectDistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Bounce Panel board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="302" y="36" width="16" height="188" rx="8" fill="#94a3b8" />
        <line x1="310" y1="38" x2="310" y2="224" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="310" y1="130" x2={310 - 150 * Math.sin((incident * Math.PI) / 180)} y2={130 - 150 * Math.cos((incident * Math.PI) / 180)} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="130" x2={310 + 150 * Math.sin((incident * Math.PI) / 180)} y2={130 - 150 * Math.cos((incident * Math.PI) / 180)} stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="130" x2={310 + objectDistance * 18} y2="130" stroke="#a855f7" strokeWidth="4" strokeDasharray="8 8" />
        <text x="58" y="50" fill="#1d4ed8" fontSize="18" fontWeight="700">Incident</text>
        <text x="448" y="50" fill="#0f766e" fontSize="18" fontWeight="700">Reflected</text>
        <text x="330" y="64" fill="#0ea5e9" fontSize="18" fontWeight="700">Guide Line</text>
        <text x="330" y="150" fill="#7c3aed" fontSize="17" fontWeight="700">Ghost image</text>
      </svg>,
      <>
        {metricCard("Incident", `${formatSimulationNumber(incident, 0)} deg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Reflected", `${formatSimulationNumber(incident, 0)} deg`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Surface angle", `${formatSimulationNumber(surface, 0)} deg`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Ghost image", `${formatSimulationNumber(objectDistance, 0)} cm behind`, "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Mirror angles match around the Guide Line.",
        "Surface angle and normal angle are not interchangeable.",
        "The image line behind the mirror is only an extension.",
      ],
      "This panel keeps the normal, the mirror, and the ghost-image extension visible in the same frame so the line roles stay distinct.",
    );
  }

  if (lessonKey === "M8_L2") {
    const incident = clamp(simVectorMagnitude, 5, 70);
    const speedRatio = clamp(simMetricMeters, 0.6, 1.4);
    const toSlow = speedRatio < 1;
    const refracted = toSlow ? incident * speedRatio : Math.min(84, incident + (speedRatio - 1) * 22);
    return renderPanel(
      "Bend Gate",
      <>
        {sliderField("Incident angle", `${formatSimulationNumber(incident, 0)} deg`, <input className="w-full" type="range" min="5" max="70" step="1" value={incident} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
        {sliderField("Zone speed ratio", `${formatSimulationNumber(speedRatio, 2)}`, <input className="w-full" type="range" min="0.6" max="1.4" step="0.05" value={speedRatio} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Bend Gate board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="32" y="36" width="576" height="188" rx="26" fill="#eff6ff" />
        <rect x="310" y="36" width="298" height="188" rx="0" fill={toSlow ? "#dbeafe" : "#dcfce7"} />
        <line x1="310" y1="36" x2="310" y2="224" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="310" y1="130" x2={310 - 150 * Math.sin((incident * Math.PI) / 180)} y2={130 - 150 * Math.cos((incident * Math.PI) / 180)} stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="310" y1="130" x2={310 + 150 * Math.sin((refracted * Math.PI) / 180)} y2={130 - 150 * Math.cos((refracted * Math.PI) / 180)} stroke="#16a34a" strokeWidth="8" strokeLinecap="round" />
        <text x="78" y="58" fill="#1d4ed8" fontSize="18" fontWeight="700">Entry zone</text>
        <text x="350" y="58" fill="#166534" fontSize="18" fontWeight="700">{toSlow ? "Slow zone" : "Fast zone"}</text>
        <text x="330" y="90" fill="#0ea5e9" fontSize="18" fontWeight="700">Guide Line</text>
      </svg>,
      <>
        {metricCard("Incident", `${formatSimulationNumber(incident, 0)} deg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Refracted", `${formatSimulationNumber(refracted, 0)} deg`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Case", toSlow ? "toward normal" : "away from normal", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Cause", toSlow ? "slower medium" : "faster medium", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Refraction is a speed-change story.",
        "Toward the Guide Line means the new zone is slower.",
        "Away from the Guide Line means the new zone is faster.",
      ],
      "The panel keeps the zone labels and the normal together so the bend direction feels causal instead of arbitrary.",
    );
  }

  if (lessonKey === "M8_L3") {
    const objectF = clamp(simMetricMeters, 1.4, 3.6);
    const mode = objectF <= 2 ? "between F and 2F" : "beyond 2F";
    const imageRegion = objectF <= 2 ? "beyond 2F" : "between F and 2F";
    return renderPanel(
      "Gather Lens",
      <>
        {sliderField("Object distance", `${formatSimulationNumber(objectF, 1)} F`, <input className="w-full" type="range" min="1.4" max="3.6" step="0.1" value={objectF} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      </>,
      "Gather Lens board",
      <svg viewBox="0 0 640 260" className="w-full">
        <line x1="30" y1="130" x2="610" y2="130" stroke="#cbd5e1" strokeWidth="4" />
        <ellipse cx="320" cy="130" rx="22" ry="76" fill="#c4b5fd" />
        <line x1="150" y1="130" x2="320" y2="130" stroke="#0f172a" strokeWidth="8" />
        <line x1="150" y1="130" x2="320" y2="130" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="320" y1="130" x2="480" y2="90" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
        <line x1="150" y1="130" x2="320" y2="80" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
        <line x1="320" y1="80" x2="480" y2="90" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
        <circle cx="430" cy="90" r="10" fill="#f59e0b" />
        <text x="70" y="58" fill="#1d4ed8" fontSize="18" fontWeight="700">Object: {mode}</text>
        <text x="384" y="58" fill="#d97706" fontSize="18" fontWeight="700">Image: {imageRegion}</text>
        <text x="282" y="50" fill="#6d28d9" fontSize="18" fontWeight="700">Gather Lens</text>
      </svg>,
      <>
        {metricCard("Object region", mode, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Image region", imageRegion, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Image type", "real", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Crossing", "True Meeting Point", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Parallel route points to the far focus.",
        "Center route is the quick second route.",
        "A True Meeting Point is a real crossing actual routes can reach.",
      ],
      "The board is simplified on purpose: it keeps the selected-ray method visible without asking the learner to track every possible beam.",
    );
  }

  if (lessonKey === "M8_L4") {
    const objectDistance = clamp(simMetricMeters, 3, 12);
    const focus = clamp(simVectorMagnitude, 2, 6);
    const ghostDistance = Math.max(1.4, focus * 0.55);
    return renderPanel(
      "Ghost Finder",
      <>
        {sliderField("Object distance", `${formatSimulationNumber(objectDistance, 0)} cm`, <input className="w-full" type="range" min="3" max="12" step="1" value={objectDistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Near focus", `${formatSimulationNumber(focus, 1)} cm`, <input className="w-full" type="range" min="2" max="6" step="0.5" value={focus} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Spread Lens board",
      <svg viewBox="0 0 640 260" className="w-full">
        <line x1="30" y1="130" x2="610" y2="130" stroke="#cbd5e1" strokeWidth="4" />
        <path d="M320 52 C296 76 296 184 320 208 C344 184 344 76 320 52Z" fill="#bfdbfe" />
        <line x1="160" y1="130" x2="320" y2="130" stroke="#2563eb" strokeWidth="8" />
        <line x1="320" y1="130" x2="500" y2="80" stroke="#2563eb" strokeWidth="8" />
        <line x1="320" y1="130" x2="500" y2="170" stroke="#0f766e" strokeWidth="8" />
        <line x1="320" y1="130" x2={320 - ghostDistance * 20} y2="94" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="320" y1="130" x2={320 - ghostDistance * 20} y2="164" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8" />
        <circle cx={320 - ghostDistance * 20} cy="130" r="10" fill="#a855f7" />
        <text x="70" y="58" fill="#1d4ed8" fontSize="18" fontWeight="700">Real routes spread</text>
        <text x="378" y="58" fill="#7c3aed" fontSize="18" fontWeight="700">Ghost image by extension</text>
      </svg>,
      <>
        {metricCard("Image type", "virtual", "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Image posture", "upright and smaller", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Location", `${formatSimulationNumber(ghostDistance, 1)} cm from lens`, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Line status", "dashed = extension", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Real routes spread after the lens.",
        "The ghost image is found by backward extensions.",
        "Extensions are still useful even though they are not actual light.",
      ],
      "This panel makes the virtual-image method feel deliberate: first real spread routes, then dashed extensions, then the ghost image label.",
    );
  }

  if (lessonKey === "M8_L5") {
    const critical = clamp(simMetricMeters, 30, 60);
    const incident = clamp(simVectorMagnitude, 20, 80);
    const state = incident < critical ? "escape" : incident === critical ? "skim" : "lock-bounce";
    return renderPanel(
      "Escape Edge",
      <>
        {sliderField("Critical angle", `${formatSimulationNumber(critical, 0)} deg`, <input className="w-full" type="range" min="30" max="60" step="1" value={critical} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
        {sliderField("Incident angle", `${formatSimulationNumber(incident, 0)} deg`, <input className="w-full" type="range" min="20" max="80" step="1" value={incident} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />)}
      </>,
      "Escape Edge board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="30" y="36" width="580" height="188" rx="26" fill="#e0f2fe" />
        <line x1="30" y1="130" x2="610" y2="130" stroke="#0f172a" strokeWidth="4" />
        <line x1="320" y1="36" x2="320" y2="224" stroke="#0ea5e9" strokeWidth="4" strokeDasharray="8 8" />
        <line x1="320" y1="130" x2={320 - 140 * Math.sin((incident * Math.PI) / 180)} y2={130 + 140 * Math.cos((incident * Math.PI) / 180)} stroke="#2563eb" strokeWidth="8" />
        {state === "escape" ? <line x1="320" y1="130" x2="470" y2="74" stroke="#16a34a" strokeWidth="8" /> : null}
        {state === "skim" ? <line x1="320" y1="130" x2="540" y2="130" stroke="#d97706" strokeWidth="8" /> : null}
        {state === "lock-bounce" ? <line x1="320" y1="130" x2="170" y2="74" stroke="#7c3aed" strokeWidth="8" /> : null}
        <text x="74" y="58" fill="#0369a1" fontSize="18" fontWeight="700">Slow medium</text>
        <text x="428" y="58" fill="#0f172a" fontSize="18" fontWeight="700">{state}</text>
      </svg>,
      <>
        {metricCard("Critical", `${formatSimulationNumber(critical, 0)} deg`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Incident", `${formatSimulationNumber(incident, 0)} deg`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("State", state, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Direction", "slow to fast boundary", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      [
        "Below the limit some light still escapes.",
        "At the limit the refracted route skims the boundary.",
        "Above the limit there is total internal reflection.",
      ],
      "The panel uses one boundary and three states so the critical angle reads like a limit in a process rather than a standalone fact.",
    );
  }

  const mirrorMode = simBias > 0.5;
  const objectDistance = clamp(simMetricMeters, 4, 12);
  return renderPanel(
    "Route Sketch",
    <>
      {sliderField("Object distance", `${formatSimulationNumber(objectDistance, 0)} cm`, <input className="w-full" type="range" min="4" max="12" step="1" value={objectDistance} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />)}
      {sliderField("Sketch mode", mirrorMode ? "ghost image" : "true image", <input className="w-full" type="range" min="0" max="1" step="1" value={mirrorMode ? 1 : 0} onChange={(e) => setSimBias(Number(e.target.value))} />)}
    </>,
    "Route Sketch board",
    <svg viewBox="0 0 640 260" className="w-full">
      {mirrorMode ? (
        <>
          <rect x="300" y="40" width="16" height="180" rx="8" fill="#94a3b8" />
          <line x1="316" y1="40" x2="316" y2="220" stroke="#7c3aed" strokeWidth="4" strokeDasharray="8 8" />
          <line x1="180" y1="118" x2="300" y2="94" stroke="#2563eb" strokeWidth="8" />
          <line x1="180" y1="142" x2="300" y2="166" stroke="#0f766e" strokeWidth="8" />
          <line x1="300" y1="94" x2="420" y2="118" stroke="#2563eb" strokeWidth="4" strokeDasharray="8 8" />
          <line x1="300" y1="166" x2="420" y2="142" stroke="#0f766e" strokeWidth="4" strokeDasharray="8 8" />
          <circle cx="420" cy="130" r="10" fill="#a855f7" />
          <text x="76" y="54" fill="#1d4ed8" fontSize="18" fontWeight="700">Real routes</text>
          <text x="366" y="54" fill="#7c3aed" fontSize="18" fontWeight="700">Ghost Meeting Point</text>
        </>
      ) : (
        <>
          <line x1="40" y1="130" x2="600" y2="130" stroke="#cbd5e1" strokeWidth="4" />
          <ellipse cx="320" cy="130" rx="22" ry="76" fill="#c4b5fd" />
          <line x1="150" y1="130" x2="320" y2="130" stroke="#2563eb" strokeWidth="8" />
          <line x1="320" y1="130" x2="475" y2="86" stroke="#2563eb" strokeWidth="8" />
          <line x1="150" y1="130" x2="320" y2="84" stroke="#0f766e" strokeWidth="8" />
          <line x1="320" y1="84" x2="475" y2="86" stroke="#0f766e" strokeWidth="8" />
          <circle cx="475" cy="86" r="10" fill="#d97706" />
          <text x="76" y="54" fill="#1d4ed8" fontSize="18" fontWeight="700">Selected real routes</text>
          <text x="410" y="54" fill="#d97706" fontSize="18" fontWeight="700">True Meeting Point</text>
        </>
      )}
    </svg>,
    <>
      {metricCard("Mode", mirrorMode ? "ghost image" : "true image", "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Real routes", mirrorMode ? "left of panel only" : "cross on far side", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("Guide Line", mirrorMode ? "reference only" : "axis and focus references", "border-violet-200 bg-violet-50 text-violet-900")}
      {metricCard("Extensions", mirrorMode ? "needed" : "not needed here", "border-amber-200 bg-amber-50 text-amber-900")}
    </>,
    [
      "A route sketch can mix real routes, references, and extensions.",
      "True and Ghost Meeting Points come from different line behaviors.",
      "Screenability is a good clue for real versus ghost images.",
    ],
    "The capstone board makes the line roles visible on purpose so the learner reads the sketch as a map of reasoning instead of a pile of lines.",
  );
}
