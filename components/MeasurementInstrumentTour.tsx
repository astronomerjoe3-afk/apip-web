"use client";

import { useMemo, useState } from "react";

type ToolKey = "ruler" | "caliper" | "micrometer";
type ObjectKey = "card" | "wire" | "marble" | "chalk";

type ToolConfig = {
  label: string;
  smallestDivision: string;
  uncertainty: string;
  step: number;
  decimals: number;
  accent: string;
  accentBg: string;
  accentBorder: string;
  bestFor: string;
  watchFor: string;
  explainerSteps: string[];
};

type ObjectConfig = {
  label: string;
  length: number;
  note: string;
};

const TOOL_CONFIG: Record<ToolKey, ToolConfig> = {
  ruler: {
    label: "Ruler",
    smallestDivision: "0.1 cm (1 mm)",
    uncertainty: "+/- 0.05 cm",
    step: 0.1,
    decimals: 1,
    accent: "text-amber-800",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    bestFor: "Rough checks on larger classroom objects like chalk or book edges.",
    watchFor: "A ruler is not honest enough for very thin objects because its smallest marks are too coarse.",
    explainerSteps: [
      "Line the object up with the zero mark before reading anything.",
      "Read the last clear mark the object reaches on the main scale.",
      "Report only the detail the 1 mm divisions can honestly support.",
    ],
  },
  caliper: {
    label: "Caliper",
    smallestDivision: "0.01 cm",
    uncertainty: "+/- 0.005 cm",
    step: 0.01,
    decimals: 2,
    accent: "text-teal-800",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
    bestFor: "Small diameters and thicknesses like marbles, bolts, and thicker wire.",
    watchFor: "The jaws help with curved objects, but the tool is still less fine than a micrometer.",
    explainerSteps: [
      "Close the jaws gently until they just hold the object.",
      "Read the main scale first, then the finer sliding scale.",
      "Keep the extra digit only because the smaller divisions genuinely support it.",
    ],
  },
  micrometer: {
    label: "Micrometer screw gauge",
    smallestDivision: "0.001 cm",
    uncertainty: "+/- 0.0005 cm",
    step: 0.001,
    decimals: 3,
    accent: "text-slate-800",
    accentBg: "bg-slate-100",
    accentBorder: "border-slate-300",
    bestFor: "Very small thicknesses like sheet of card and thin wire.",
    watchFor: "The tool is best when tiny differences matter, not for every large object.",
    explainerSteps: [
      "Place the tiny object in the measuring gap so the faces touch it evenly.",
      "Turn the screw until the object is held without crushing it.",
      "Read the sleeve and fine scale together because the smallest divisions justify the finest detail.",
    ],
  },
};

const OBJECT_CONFIG: Record<ObjectKey, ObjectConfig> = {
  card: {
    label: "Sheet of card",
    length: 0.042,
    note: "This is where the micrometer screw gauge becomes the best match because the thickness is tiny.",
  },
  wire: {
    label: "Thin wire",
    length: 0.428,
    note: "Wire is still small enough that the finer tools show a real advantage over a ruler.",
  },
  marble: {
    label: "Marble diameter",
    length: 1.86,
    note: "A caliper often feels like the natural fit because it grips both edges cleanly.",
  },
  chalk: {
    label: "Chalk length",
    length: 7.42,
    note: "For a larger classroom object, the ruler is usually already a sensible choice.",
  },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function formatMeasurement(value: number, decimals: number): string {
  return value
    .toFixed(decimals)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
}

function ToolCanvas({ tool, length, reading, accentClass }: { tool: ToolKey; length: number; reading: number; accentClass: string }) {
  const ratio = clamp(length / 8, 0.04, 0.92);
  const rulerEndX = 70 + ratio * 220;
  const caliperJawX = 150 + ratio * 110;
  const micrometerGapX = 170 + ratio * 48;

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        <span>Clean view</span>
        <span className={accentClass}>Justified reading {formatMeasurement(reading, TOOL_CONFIG[tool].decimals)} cm</span>
      </div>

      {tool === "ruler" ? (
        <svg viewBox="0 0 360 220" role="img" aria-label="Ruler view" className="mt-4 h-60 w-full rounded-[1.4rem] bg-[radial-gradient(circle_at_top,_rgba(254,243,199,0.55),_rgba(255,255,255,1)_62%)] p-4">
          <rect x="44" y="118" width="272" height="38" rx="19" fill="#fde68a" />
          {Array.from({ length: 10 }).map((_, index) => {
            const x = 58 + index * 28;
            return (
              <g key={`tour-ruler-${index}`}>
                <line x1={x} y1="118" x2={x} y2={index % 2 === 0 ? "86" : "98"} stroke="#92400e" strokeWidth="3.5" strokeLinecap="round" />
                <text x={x - 4} y="178" fontSize="12" fill="#64748b">{index}</text>
              </g>
            );
          })}
          <rect x="70" y="86" width={Math.max(12, rulerEndX - 70)} height="16" rx="8" fill="#60a5fa" opacity="0.35" />
          <line x1={rulerEndX} y1="74" x2={rulerEndX} y2="164" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <text x="70" y="66" fontSize="12" fill="#2563eb">True object span</text>
          <text x={Math.min(rulerEndX + 10, 248)} y="74" fontSize="12" fill="#0f172a">Reported mark</text>
          <text x="44" y="206" fontSize="14" fill="#64748b">One decimal place is the honest stopping point here.</text>
        </svg>
      ) : tool === "caliper" ? (
        <svg viewBox="0 0 360 220" role="img" aria-label="Caliper view" className="mt-4 h-60 w-full rounded-[1.4rem] bg-[radial-gradient(circle_at_top,_rgba(204,251,241,0.55),_rgba(255,255,255,1)_62%)] p-4">
          <rect x="48" y="124" width="264" height="22" rx="11" fill="#475569" />
          <rect x="88" y="74" width="18" height="98" rx="9" fill="#0f766e" />
          <rect x={caliperJawX} y="74" width="18" height="98" rx="9" fill="#0f766e" />
          <rect x="106" y="114" width={Math.max(16, caliperJawX - 106)} height="30" rx="15" fill="#93c5fd" opacity="0.82" />
          <rect x={caliperJawX - 28} y="102" width="56" height="14" rx="7" fill="#94a3b8" />
          <text x="82" y="194" fontSize="12" fill="#0f766e">Fixed jaw</text>
          <text x={Math.max(200, caliperJawX - 42)} y="194" fontSize="12" fill="#0f766e">Moving jaw</text>
          <text x="48" y="206" fontSize="14" fill="#64748b">The finer sliding scale supports an extra justified digit.</text>
        </svg>
      ) : (
        <svg viewBox="0 0 360 220" role="img" aria-label="Micrometer view" className="mt-4 h-60 w-full rounded-[1.4rem] bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.55),_rgba(255,255,255,1)_62%)] p-4">
          <path d="M94 74 C56 74 56 154 94 154" fill="none" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
          <line x1="94" y1="74" x2="170" y2="74" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
          <line x1="94" y1="154" x2="170" y2="154" stroke="#334155" strokeWidth="18" strokeLinecap="round" />
          <rect x="158" y="106" width={Math.max(14, micrometerGapX - 158)} height="20" rx="10" fill="#60a5fa" opacity="0.8" />
          <rect x={micrometerGapX} y="98" width="82" height="36" rx="18" fill="#475569" />
          <rect x="234" y="94" width="48" height="44" rx="14" fill="#94a3b8" />
          <text x="180" y="182" fontSize="12" fill="#2563eb" textAnchor="middle">
            <tspan x="180" dy="0">Tiny object held</tspan>
            <tspan x="180" dy="14">in the measuring gap</tspan>
          </text>
          <text x="180" y="212" fontSize="12" fill="#64748b" textAnchor="middle">
            Best when the thickness is very small.
          </text>
        </svg>
      )}
    </div>
  );
}

export default function MeasurementInstrumentTour() {
  const [tool, setTool] = useState<ToolKey>("micrometer");
  const [objectKey, setObjectKey] = useState<ObjectKey>("card");
  const [sampleLength, setSampleLength] = useState(OBJECT_CONFIG.card.length);

  const currentObject = OBJECT_CONFIG[objectKey];
  const activeLength = sampleLength;

  const toolConfig = TOOL_CONFIG[tool];

  const measurementCoach = useMemo(() => {
    const reading = Math.round(activeLength / toolConfig.step) * toolConfig.step;
    const formattedLength = formatMeasurement(activeLength, 3);
    const formattedReading = formatMeasurement(reading, toolConfig.decimals);
    const objectFit = objectKey === "card"
      ? tool === "micrometer"
        ? "Best match"
        : tool === "caliper"
          ? "Usable, but not finest"
          : "Too coarse"
      : objectKey === "wire"
        ? tool === "micrometer"
          ? "Best match"
          : tool === "caliper"
            ? "Strong match"
            : "Too coarse"
        : objectKey === "marble"
          ? tool === "caliper"
            ? "Best match"
            : tool === "micrometer"
              ? "More detail than needed"
              : "Usable"
          : tool === "ruler"
            ? "Best match"
            : "Finer than needed";

    return {
      reading,
      formattedLength,
      formattedReading,
      objectFit,
    };
  }, [activeLength, objectKey, tool, toolConfig]);

  return (
    <div className="grid gap-5 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.72),_rgba(255,255,255,0.98)_58%)] p-5 xl:grid-cols-[1.05fr,0.95fr] xl:items-start">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h5 className="text-base font-semibold text-slate-900">One instrument at a time</h5>
        <p className="mt-2 text-sm leading-6 text-slate-700">Switch tools and objects so the comparison stays clean. The object stays the same, but the justified detail changes with the instrument.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["ruler", "caliper", "micrometer"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setTool(entry)}
              className={`rounded-xl border px-4 py-2 text-sm ${tool === entry ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}
            >
              {TOOL_CONFIG[entry].label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["card", "wire", "marble", "chalk"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => {
                setObjectKey(entry);
                setSampleLength(OBJECT_CONFIG[entry].length);
              }}
              className={`rounded-2xl border px-4 py-3 text-left text-sm ${objectKey === entry ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
            >
              <span className="block font-semibold">{OBJECT_CONFIG[entry].label}</span>
              <span className="mt-1 block text-xs opacity-80">{formatMeasurement(OBJECT_CONFIG[entry].length, 3)} cm sample size</span>
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm text-slate-700">
          Fine-tune the sample size: {formatMeasurement(sampleLength, 3)} cm
          <input
            className="mt-2 w-full"
            type="range"
            min="0.02"
            max="8"
            step="0.001"
            value={sampleLength}
            onChange={(e) => setSampleLength(Number(e.target.value))}
          />
        </label>

        <div className={`mt-4 rounded-2xl border px-4 py-4 ${toolConfig.accentBg} ${toolConfig.accentBorder}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Current judgement</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Real object size</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{measurementCoach.formattedLength} cm</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Justified reading with {toolConfig.label.toLowerCase()}</p>
              <p className={`mt-1 text-2xl font-semibold ${toolConfig.accent}`}>{measurementCoach.formattedReading} cm</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Smallest division:</span> {toolConfig.smallestDivision}
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Reasonable uncertainty:</span> {toolConfig.uncertainty}
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium text-slate-900">Fit for this object:</span> {measurementCoach.objectFit}
            </div>
          </div>
        </div>

        <ToolCanvas tool={tool} length={activeLength} reading={measurementCoach.reading} accentClass={toolConfig.accent} />
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h5 className="text-base font-semibold text-slate-900">Instrument explainer</h5>
          <p className="mt-2 text-sm leading-6 text-slate-700">Use this like a guided mini-video: focus on one tool, then walk through how it should be used and what claim it can honestly support.</p>
          <div className={`mt-4 rounded-2xl border px-4 py-4 ${toolConfig.accentBg} ${toolConfig.accentBorder}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Best for</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{toolConfig.bestFor}</p>
          </div>
          <div className="mt-4 space-y-3">
            {toolConfig.explainerSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Step {index + 1}</p>
                <p className="mt-1 leading-6">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Watch for</p>
            <p className="mt-1 leading-6">{toolConfig.watchFor}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h5 className="text-base font-semibold text-slate-900">Object match note</h5>
          <p className="mt-2 text-sm leading-6 text-slate-700">{currentObject.note}</p>
          <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Key idea</p>
            <p className="mt-2 text-sm leading-6">Better resolution does not change the object. It changes how finely and how honestly you can report the measurement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
