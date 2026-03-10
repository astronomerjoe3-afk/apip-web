"use client";

import { useMemo, useState } from "react";

type ToolKey = "ruler" | "caliper" | "micrometer";

const TOOL_CONFIG: Record<ToolKey, {
  label: string;
  scale: string;
  supportedDecimals: number;
  uncertainty: string;
}> = {
  ruler: {
    label: "Ruler",
    scale: "1 mm divisions",
    supportedDecimals: 1,
    uncertainty: "+/- 0.05 cm",
  },
  caliper: {
    label: "Vernier caliper",
    scale: "0.1 mm divisions",
    supportedDecimals: 2,
    uncertainty: "+/- 0.005 cm",
  },
  micrometer: {
    label: "Micrometer",
    scale: "0.01 mm divisions",
    supportedDecimals: 3,
    uncertainty: "+/- 0.0005 cm",
  },
};

export default function MeasurementReportLab() {
  const [tool, setTool] = useState<ToolKey>("ruler");
  const [measurement, setMeasurement] = useState(12.4);
  const [writtenDecimals, setWrittenDecimals] = useState(1);
  const [includesTool, setIncludesTool] = useState(true);
  const [includesUncertainty, setIncludesUncertainty] = useState(true);

  const config = TOOL_CONFIG[tool];

  const coach = useMemo(() => {
    const reportValue = measurement.toFixed(writtenDecimals);
    const observedValue = measurement.toFixed(config.supportedDecimals);
    const decimalLabel = writtenDecimals === 1 ? "decimal place" : "decimal places";
    const supportedLabel = config.supportedDecimals === 1 ? "decimal place" : "decimal places";
    const tooPrecise = writtenDecimals > config.supportedDecimals;
    const preview = (includesTool ? config.label + ": " : "") + reportValue + " cm" + (includesUncertainty ? " " + config.uncertainty : "");
    const verdictTone = tooPrecise || !includesTool || !includesUncertainty
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : writtenDecimals === config.supportedDecimals
        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
        : "border-sky-200 bg-sky-50 text-sky-900";
    const verdictTitle = tooPrecise
      ? "Too precise"
      : !includesTool || !includesUncertainty
        ? "Almost there"
        : writtenDecimals === config.supportedDecimals
          ? "Trustworthy report"
          : "Safe but rounded";
    const verdictBody = tooPrecise
      ? "This report claims " + writtenDecimals + " " + decimalLabel + ", but the " + config.label.toLowerCase() + " only supports " + config.supportedDecimals + " " + supportedLabel + "."
      : !includesTool
        ? "Add the tool name so the reader knows what instrument supports the claim."
        : !includesUncertainty
          ? "Add the uncertainty so the report does not pretend the result is exact."
          : writtenDecimals === config.supportedDecimals
            ? "This report names the tool, gives the value, and states the uncertainty honestly."
            : "This is safe, but the " + config.label.toLowerCase() + " can support " + config.supportedDecimals + " " + supportedLabel + ".";

    return {
      observedValue,
      preview,
      verdictTone,
      verdictTitle,
      verdictBody,
      checks: [
        {
          title: "Name the tool",
          ok: includesTool,
          note: includesTool
            ? config.label + " tells the reader how fine the measurement could be."
            : "Add the instrument so the reader can judge the claim.",
        },
        {
          title: "State the uncertainty",
          ok: includesUncertainty,
          note: includesUncertainty
            ? config.uncertainty + " shows the trustworthy range around the reading."
            : "Without uncertainty, the report sounds more exact than it really is.",
        },
        {
          title: "Match the claim to the instrument",
          ok: !tooPrecise,
          note: tooPrecise
            ? "Trim the written value down to " + config.supportedDecimals + " " + supportedLabel + "."
            : writtenDecimals === config.supportedDecimals
              ? "Good: this matches the " + config.label.toLowerCase() + " resolution."
              : "Safe, but the " + config.label.toLowerCase() + " can support " + config.supportedDecimals + " " + supportedLabel + ".",
        },
      ],
    };
  }, [config, includesTool, includesUncertainty, measurement, writtenDecimals]);

  return (
    <div className="grid gap-4 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.72),_rgba(255,255,255,0.98)_58%)] p-5 md:grid-cols-[1.05fr,0.95fr] md:items-start">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h5 className="text-base font-semibold text-slate-900">Mini report builder</h5>
        <p className="mt-2 text-sm leading-6 text-slate-700">Switch tools, change the written precision, and see when the report becomes trustworthy.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["ruler", "caliper", "micrometer"] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => {
                setTool(entry);
                setWrittenDecimals(TOOL_CONFIG[entry].supportedDecimals);
              }}
              className={`rounded-xl border px-4 py-2 text-sm ${tool === entry ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"}`}
            >
              {TOOL_CONFIG[entry].label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Instrument readout</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{coach.observedValue} cm</p>
          <p className="mt-2 text-sm">{config.scale}. A reasonable uncertainty is {config.uncertainty}.</p>
        </div>

        <label className="mt-4 block text-sm text-slate-700">
          Sample reading: {measurement.toFixed(3)} cm
          <input className="mt-2 w-full" type="range" min="11.8" max="13.2" step="0.001" value={measurement} onChange={(e) => setMeasurement(Number(e.target.value))} />
        </label>

        <label className="mt-4 block text-sm text-slate-700">
          Written decimal places: {writtenDecimals}
          <input className="mt-2 w-full" type="range" min="0" max="4" step="1" value={writtenDecimals} onChange={(e) => setWrittenDecimals(Number(e.target.value))} />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={includesTool} onChange={(e) => setIncludesTool(e.target.checked)} />
            Include the tool name
          </label>
          <label className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={includesUncertainty} onChange={(e) => setIncludesUncertainty(e.target.checked)} />
            Include the uncertainty
          </label>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h5 className="text-base font-semibold text-slate-900">Coach feedback</h5>
        <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Report preview</p>
          <p className="mt-3 text-2xl font-semibold">{coach.preview}</p>
        </div>
        <div className={`mt-4 rounded-2xl border px-4 py-4 text-sm ${coach.verdictTone}`}>
          <p className="font-semibold">{coach.verdictTitle}</p>
          <p className="mt-2 leading-6">{coach.verdictBody}</p>
        </div>
        <div className="mt-4 space-y-3">
          {coach.checks.map((check) => (
            <div key={check.title} className={`rounded-2xl border px-4 py-3 text-sm ${check.ok ? "border-emerald-200 bg-emerald-50/70 text-slate-800" : "border-amber-200 bg-amber-50/70 text-slate-800"}`}>
              <p className="font-semibold text-slate-900">{check.title}</p>
              <p className="mt-1 leading-6">{check.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
