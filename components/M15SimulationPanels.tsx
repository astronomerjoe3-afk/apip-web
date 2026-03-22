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
          <h4 className="text-lg font-semibold text-slate-900">Stretchmap lens</h4>
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

function starStageLabel(stageIndex: number, highMass: boolean): string {
  const lowerMass = ["glow cradle", "young spark", "steady beacon", "swollen ember", "white ember"] as const;
  const higherMass = ["glow cradle", "young spark", "steady beacon", "super swollen ember", "blast bloom", "dense spark / dark well"] as const;
  return highMass ? higherMass[stageIndex] ?? higherMass[higherMass.length - 1] : lowerMass[Math.min(stageIndex, lowerMass.length - 1)];
}

export default function M15SimulationPanels({
  lessonKey,
  simMetricMeters,
  setSimMetricMeters,
  simVectorMagnitude,
  setSimVectorMagnitude,
  simVectorAngle,
  setSimVectorAngle,
  simBias,
  setSimBias,
  formatSimulationNumber,
}: Props) {
  if (lessonKey === "M15_L1") {
    const sourceIndex = Math.round(clamp(simBias, 0, 1));
    const brightness = clamp(simMetricMeters, 0.8, 2.4);
    const fusionLevel = clamp(simVectorMagnitude, 0, 1);
    const isStar = sourceIndex === 0;
    const sourceLabel = isStar ? "self-lit beacon" : "reflective world";
    const lightOrigin = isStar && fusionLevel > 0.35 ? "core fusion emission" : "borrowed reflected light";

    return renderPanel(
      "Beacon light",
      <>
        {sliderField(
          "Object type",
          sourceLabel,
          <input className="w-full" type="range" min="0" max="1" step="1" value={sourceIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Fusion level",
          `${formatSimulationNumber(fusionLevel, 2)}`,
          <input className="w-full" type="range" min="0" max="1" step="0.01" value={fusionLevel} onChange={(e) => setSimVectorMagnitude(Number(e.target.value))} />,
        )}
        {sliderField(
          "Apparent brightness",
          `${formatSimulationNumber(brightness, 2)} a.u.`,
          <input className="w-full" type="range" min="0.8" max="2.4" step="0.05" value={brightness} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Star vs planet board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="24" y="18" width="272" height="212" rx="24" fill="#0f172a" />
        <rect x="344" y="18" width="272" height="212" rx="24" fill="#0f172a" />
        <circle cx="160" cy="122" r={52 + fusionLevel * 10} fill="#facc15" stroke="#fde68a" strokeWidth="4" />
        <text x="160" y="198" fill="#fde68a" fontSize="22" fontWeight="700" textAnchor="middle">
          star beacon
        </text>
        <circle cx="480" cy="138" r="44" fill="#2563eb" stroke="#93c5fd" strokeWidth="3" />
        <line x1="222" y1="120" x2="426" y2="120" stroke="#fbbf24" strokeWidth="8" />
        <polygon points="426,120 394,104 394,136" fill="#fbbf24" />
        <text x="320" y="96" fill="#fde68a" fontSize="20" textAnchor="middle">
          incoming starlight
        </text>
        <text x="480" y="204" fill="#bfdbfe" fontSize="22" fontWeight="700" textAnchor="middle">
          reflective world
        </text>
        <text x="160" y="54" fill="#e2e8f0" fontSize="18" textAnchor="middle">
          fusion powered
        </text>
        <text x="480" y="54" fill="#e2e8f0" fontSize="18" textAnchor="middle">
          bright by reflection
        </text>
      </svg>,
      <>
        {metricCard("Classification", isStar && fusionLevel > 0.35 ? "star" : isStar ? "weak beacon case" : "planet-like world", "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Light origin", lightOrigin, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Brightness test", brightness > 1.7 ? "looks bright" : "looks dimmer", "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Correct rule", "classify by source", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Ask where the light comes from.", "Brightness can mislead if cause is ignored.", "Fusion is the internal source clue for stars."],
      "This board keeps the classification tied to light source rather than letting apparent brightness decide everything.",
    );
  }

  if (lessonKey === "M15_L2") {
    const stellarMass = clamp(simMetricMeters, 0.5, 25);
    const highMass = stellarMass >= 8;
    const stageIndex = Math.round(clamp(simVectorAngle, 0, highMass ? 5 : 4));
    const stage = starStageLabel(stageIndex, highMass);
    const remnant = highMass ? (stellarMass >= 18 ? "dark well" : "dense spark") : "white ember";

    return renderPanel(
      "Star path",
      <>
        {sliderField(
          "Stellar mass",
          `${formatSimulationNumber(stellarMass, 1)} solar masses`,
          <input className="w-full" type="range" min="0.5" max="25" step="0.1" value={stellarMass} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Life stage",
          stage,
          <input className="w-full" type="range" min="0" max={highMass ? "5" : "4"} step="1" value={stageIndex} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Lifecycle branch board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="24" y="40" width="128" height="48" rx="20" fill="#1d4ed8" />
        <rect x="186" y="40" width="128" height="48" rx="20" fill="#7c3aed" />
        <rect x="348" y="40" width="128" height="48" rx="20" fill="#0f766e" />
        <text x="88" y="70" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">glow cradle</text>
        <text x="250" y="70" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">young spark</text>
        <text x="412" y="70" fill="#fff" fontSize="18" fontWeight="700" textAnchor="middle">steady beacon</text>
        <line x1="152" y1="64" x2="186" y2="64" stroke="#38bdf8" strokeWidth="4" />
        <line x1="314" y1="64" x2="348" y2="64" stroke="#38bdf8" strokeWidth="4" />
        <line x1="476" y1="64" x2="540" y2="118" stroke="#38bdf8" strokeWidth="4" />
        <line x1="476" y1="64" x2="540" y2="186" stroke="#38bdf8" strokeWidth="4" />
        <rect x="520" y="94" width="100" height="48" rx="20" fill="#ea580c" />
        <rect x="500" y="162" width="120" height="48" rx="20" fill={highMass ? "#dc2626" : "#64748b"} />
        <text x="570" y="124" fill="#fff" fontSize="16" fontWeight="700" textAnchor="middle">swollen ember</text>
        <text x="560" y="192" fill="#fff" fontSize="16" fontWeight="700" textAnchor="middle">{highMass ? remnant : "white ember"}</text>
        <circle cx={stageIndex < 3 ? 88 + stageIndex * 162 : 560} cy={stageIndex < 3 ? 116 : highMass && stageIndex >= 4 ? 186 : 118} r="12" fill="#f8fafc" stroke="#0f172a" strokeWidth="3" />
      </svg>,
      <>
        {metricCard("Mass route", highMass ? "high-mass branch" : "lower-mass branch", "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Current stage", stage, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Likely remnant", remnant, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Key rule", "mass changes fate", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Shared early stages do not guarantee the same ending.", "Use mass to choose the later branch.", "Massive stars can reach the blast-bloom route."],
      "The branch view turns stellar evolution into a mass-shaped pathway instead of a single memorized chain.",
    );
  }

  if (lessonKey === "M15_L3") {
    const galaxyTypeIndex = Math.round(clamp(simBias, 0, 2));
    const scaleView = Math.round(clamp(simMetricMeters, 0, 2));
    const sunPlacement = Math.round(clamp(simVectorAngle, 0, 1));
    const galaxyType = ["spiral", "elliptical", "irregular"][galaxyTypeIndex];
    const scaleLabel = ["one star", "Solar System", "galaxy"][scaleView];

    return renderPanel(
      "Beacon-city builder",
      <>
        {sliderField(
          "Galaxy type",
          galaxyType,
          <input className="w-full" type="range" min="0" max="2" step="1" value={galaxyTypeIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Scale view",
          scaleLabel,
          <input className="w-full" type="range" min="0" max="2" step="1" value={scaleView} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Sun placement",
          sunPlacement === 1 ? "shown inside city" : "hidden",
          <input className="w-full" type="range" min="0" max="1" step="1" value={sunPlacement} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Milky Way board",
      <svg viewBox="0 0 640 260" className="w-full">
        <rect x="24" y="20" width="392" height="220" rx="24" fill="#0f172a" />
        {galaxyType === "spiral" ? (
          <>
            <ellipse cx="220" cy="128" rx="142" ry="56" fill="none" stroke="#60a5fa" strokeWidth="3" />
            <path d="M100 112 C170 32, 278 36, 330 108" fill="none" stroke="#38bdf8" strokeWidth="12" />
            <path d="M116 144 C196 208, 292 210, 346 152" fill="none" stroke="#7dd3fc" strokeWidth="12" />
          </>
        ) : galaxyType === "elliptical" ? (
          <ellipse cx="220" cy="128" rx="160" ry="84" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
        ) : (
          <path d="M88 118 C118 60, 196 50, 244 92 C296 74, 344 96, 348 146 C316 206, 196 212, 118 180 Z" fill="#1e293b" stroke="#93c5fd" strokeWidth="4" />
        )}
        <circle cx="220" cy="128" r="16" fill="#f8fafc" stroke="#bfdbfe" strokeWidth="3" />
        {sunPlacement === 1 ? (
          <>
            <circle cx="304" cy="112" r="7" fill="#facc15" stroke="#fff" strokeWidth="2" />
            <text x="332" y="118" fill="#fde68a" fontSize="16">Sun</text>
          </>
        ) : null}
        <rect x="446" y="34" width="170" height="172" rx="20" fill="#111827" />
        <text x="530" y="70" fill="#fff" fontSize="20" fontWeight="700" textAnchor="middle">{scaleLabel}</text>
        <text x="530" y="112" fill="#cbd5e1" fontSize="18" textAnchor="middle">{scaleView === 0 ? "one beacon only" : scaleView === 1 ? "one star system" : "many beacons bound together"}</text>
        <text x="530" y="150" fill="#86efac" fontSize="18" textAnchor="middle">gravity-bound</text>
        <text x="530" y="182" fill="#bfdbfe" fontSize="18" textAnchor="middle">Milky Way = home spiral city</text>
      </svg>,
      <>
        {metricCard("Selected city", galaxyType, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Scale view", scaleLabel, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Sun marker", sunPlacement === 1 ? "inside Milky Way" : "not shown", "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Correct hierarchy", "star < galaxy < universe", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["A galaxy is a bound city of many stars.", "The Solar System belongs inside the Milky Way.", "Do not let galaxy and universe collapse into the same thing."],
      "This board helps students keep star, Solar System, galaxy, and universe on different scales while still linking them together.",
    );
  }

  if (lessonKey === "M15_L4") {
    const distanceIndex = Math.round(clamp(simMetricMeters, 0, 3));
    const distances = [
      { label: "Moon-scale comparison", value: "tiny by cosmic standards" },
      { label: "nearby star", value: "a few light-years" },
      { label: "nebula region", value: "hundreds of light-years" },
      { label: "Milky Way span", value: "about 100,000 light-years" },
    ] as const;
    const current = distances[distanceIndex];

    return renderPanel(
      "Signal-year scale",
      <>
        {sliderField(
          "Distance marker",
          current.label,
          <input className="w-full" type="range" min="0" max="3" step="1" value={distanceIndex} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
      </>,
      "Distance ladder",
      <svg viewBox="0 0 640 260" className="w-full">
        <line x1="72" y1="132" x2="568" y2="132" stroke="#64748b" strokeWidth="6" />
        {[72, 210, 356, 520].map((x, index) => (
          <g key={x}>
            <circle cx={x} cy="132" r={index === distanceIndex ? "14" : "10"} fill={index === distanceIndex ? "#38bdf8" : "#e2e8f0"} stroke="#0f172a" strokeWidth="2" />
            <text x={x} y="176" fill="#334155" fontSize="16" textAnchor="middle">{distances[index].label}</text>
          </g>
        ))}
        <rect x="142" y="24" width="356" height="64" rx="18" fill="#111827" />
        <text x="320" y="64" fill="#fff" fontSize="24" fontWeight="700" textAnchor="middle">1 light-year = distance traveled by light in 1 year</text>
      </svg>,
      <>
        {metricCard("Current scale", current.label, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Distance reading", current.value, "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Unit type", "distance", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Common trap", "not a time unit", "border-amber-200 bg-amber-50 text-amber-900")}
      </>,
      ["Use the unit to answer how far.", "The word year names the travel interval used to define the distance.", "Large astronomy scales need larger units than km."],
      "The ladder converts light-year language into a distance-scale decision rather than a timing misconception.",
    );
  }

  if (lessonKey === "M15_L5") {
    const stretch = clamp(simMetricMeters, 1, 2.8);
    const distanceRank = Math.round(clamp(simBias, 0, 2));
    const emittedWavelength = 500;
    const observedWavelength = emittedWavelength * stretch * (1 + distanceRank * 0.18);
    const redshiftRank = distanceRank === 0 ? "smaller" : distanceRank === 1 ? "medium" : "larger";

    return renderPanel(
      "Stretch-red drift",
      <>
        {sliderField(
          "Stretch factor",
          `${formatSimulationNumber(stretch, 2)}x`,
          <input className="w-full" type="range" min="1" max="2.8" step="0.02" value={stretch} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Distance rank",
          ["nearer city", "middle city", "farther city"][distanceRank],
          <input className="w-full" type="range" min="0" max="2" step="1" value={distanceRank} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
      </>,
      "Redshift board",
      <svg viewBox="0 0 640 260" className="w-full">
        <text x="154" y="44" fill="#334155" fontSize="18" textAnchor="middle">emitted</text>
        <text x="484" y="44" fill="#334155" fontSize="18" textAnchor="middle">observed</text>
        <rect x="84" y="82" width="140" height="42" rx="16" fill="#38bdf8" />
        <rect x="364" y="82" width={Math.min(220, 140 + (observedWavelength - emittedWavelength) * 0.35)} height="42" rx="16" fill="#f87171" />
        <line x1="240" y1="104" x2="340" y2="104" stroke="#fbbf24" strokeWidth="6" />
        <polygon points="340,104 308,88 308,120" fill="#fbbf24" />
        <text x="320" y="82" fill="#f59e0b" fontSize="18" textAnchor="middle">space stretches light during travel</text>
        <text x="320" y="176" fill="#0f172a" fontSize="26" fontWeight="700" textAnchor="middle">{redshiftRank} redshift</text>
        <text x="320" y="212" fill="#475569" fontSize="18" textAnchor="middle">farther city usually means larger stretch-red drift</text>
      </svg>,
      <>
        {metricCard("Emitted wavelength", `${emittedWavelength} nm`, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Observed wavelength", `${formatSimulationNumber(observedWavelength, 0)} nm`, "border-rose-200 bg-rose-50 text-rose-900")}
        {metricCard("Distance rank", ["near", "middle", "far"][distanceRank], "border-violet-200 bg-violet-50 text-violet-900")}
        {metricCard("Evidence clue", `${redshiftRank} stretch`, "border-emerald-200 bg-emerald-50 text-emerald-900")}
      </>,
      ["Redshift is about wavelength stretching.", "The farther city tends to show the larger redshift.", "Use the emitted-observed comparison to explain the evidence."],
      "The board turns redshift into a changing wavelength story rather than a detached vocabulary word.",
    );
  }

  if (lessonKey === "M15_L6") {
    const expansionRate = clamp(simMetricMeters, 0.4, 2.4);
    const evidenceIndex = Math.round(clamp(simBias, 0, 2));
    const modelIndex = Math.round(clamp(simVectorAngle, 0, 1));
    const evidenceLabel = ["weak pattern", "partial pattern", "farther city -> bigger redshift"][evidenceIndex];
    const modelLabel = modelIndex === 0 ? "ordinary explosion from one spot" : "expanding space from hot dense early state";

    return renderPanel(
      "Great Unfurling evidence",
      <>
        {sliderField(
          "Stretchmap rate",
          `${formatSimulationNumber(expansionRate, 2)}x`,
          <input className="w-full" type="range" min="0.4" max="2.4" step="0.02" value={expansionRate} onChange={(e) => setSimMetricMeters(Number(e.target.value))} />,
        )}
        {sliderField(
          "Evidence pattern",
          evidenceLabel,
          <input className="w-full" type="range" min="0" max="2" step="1" value={evidenceIndex} onChange={(e) => setSimBias(Number(e.target.value))} />,
        )}
        {sliderField(
          "Model phrase",
          modelLabel,
          <input className="w-full" type="range" min="0" max="1" step="1" value={modelIndex} onChange={(e) => setSimVectorAngle(Number(e.target.value))} />,
        )}
      </>,
      "Expansion story board",
      <svg viewBox="0 0 640 260" className="w-full">
        <circle cx="118" cy="132" r="28" fill="#f97316" stroke="#fde68a" strokeWidth="4" />
        <text x="118" y="184" fill="#ea580c" fontSize="16" textAnchor="middle">hot dense early state</text>
        <line x1="152" y1="132" x2="312" y2="132" stroke="#38bdf8" strokeWidth="6" />
        <polygon points="312,132 280,116 280,148" fill="#38bdf8" />
        <ellipse cx="426" cy="132" rx={74 + expansionRate * 22} ry={40 + expansionRate * 12} fill="none" stroke="#60a5fa" strokeWidth="4" />
        <ellipse cx="426" cy="132" rx={118 + expansionRate * 24} ry={64 + expansionRate * 14} fill="none" stroke="#93c5fd" strokeWidth="3" />
        <text x="426" y="210" fill="#334155" fontSize="18" textAnchor="middle">space itself expands</text>
        <rect x="468" y="26" width="150" height="82" rx="18" fill={modelIndex === 1 ? "#dcfce7" : "#fee2e2"} />
        <text x="543" y="56" fill="#0f172a" fontSize="16" fontWeight="700" textAnchor="middle">model phrase</text>
        <text x="543" y="84" fill="#334155" fontSize="14" textAnchor="middle">{modelIndex === 1 ? "expanding-space match" : "weaker center-blast wording"}</text>
        <rect x="468" y="138" width="150" height="82" rx="18" fill={evidenceIndex === 2 ? "#dcfce7" : "#fef3c7"} />
        <text x="543" y="168" fill="#0f172a" fontSize="16" fontWeight="700" textAnchor="middle">evidence</text>
        <text x="543" y="196" fill="#334155" fontSize="14" textAnchor="middle">{evidenceLabel}</text>
      </svg>,
      <>
        {metricCard("Early-state model", "hot and dense", "border-amber-200 bg-amber-50 text-amber-900")}
        {metricCard("Evidence pattern", evidenceLabel, "border-sky-200 bg-sky-50 text-sky-900")}
        {metricCard("Best wording", modelIndex === 1 && evidenceIndex === 2 ? "expanding universe" : "check wording again", "border-emerald-200 bg-emerald-50 text-emerald-900")}
        {metricCard("Common trap", "center explosion picture", "border-rose-200 bg-rose-50 text-rose-900")}
      </>,
      ["Use expanding-space language to keep the geometry right.", "Connect the model to the redshift evidence trend.", "The Big Bang model is more than just 'stuff flying from a point'."],
      "This final board pairs the model wording with the evidence trend so the Big Bang remains an expansion story rather than a casual explosion metaphor.",
    );
  }

  return renderPanel(
    "Universe explorer",
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-700">
      This lesson has no dedicated explorer branch wired yet. Use the authored diagram and the lesson readout instead of relying on a generic fallback panel.
    </div>,
    "Placeholder board",
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
      Add a lesson-specific M15 explorer panel here if a new lesson key is introduced.
    </div>,
    <>
      {metricCard("Lesson status", "no generic fallback used", "border-slate-200 bg-slate-50 text-slate-900")}
      {metricCard("Action", "author a lesson-specific panel", "border-sky-200 bg-sky-50 text-sky-900")}
      {metricCard("Support path", "diagram + scaffold still available", "border-emerald-200 bg-emerald-50 text-emerald-900")}
      {metricCard("Quality rule", "explicit branches only", "border-violet-200 bg-violet-50 text-violet-900")}
    </>,
    ["Every M15 lesson should have an explicit explorer path.", "Unknown lesson keys should fail safely, not silently reuse another panel.", "This placeholder keeps the fallback neutral and visible."],
    "The neutral placeholder makes missing explorer coverage obvious, which protects lesson-specific simulation design across the module.",
  );
}
