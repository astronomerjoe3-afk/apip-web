import { a6ToA11ScaffoldMediaCards, a6ToA11SimulationCopy } from "../lib/a6ToA11LessonContent";

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

type VisualCard = {
  title?: string;
  caption?: string;
  image_url?: string;
  highlights?: string[];
};

const panelClass =
  "rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur";

function asVisualCard(value: unknown): VisualCard {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    title: typeof record.title === "string" ? record.title : undefined,
    caption: typeof record.caption === "string" ? record.caption : undefined,
    image_url: typeof record.image_url === "string" ? record.image_url : undefined,
    highlights: Array.isArray(record.highlights)
      ? record.highlights.filter((entry): entry is string => typeof entry === "string")
      : [],
  };
}

export default function A6ToA11SimulationPanels({ lessonKey }: Props) {
  const copy = a6ToA11SimulationCopy(lessonKey);
  const visualCard = asVisualCard(a6ToA11ScaffoldMediaCards(lessonKey)[0]);

  if (!copy) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        Use the lesson board and the prompts above to compare the named quantities before you continue.
      </div>
    );
  }

  const highlights = visualCard.highlights ?? [];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.95fr)_minmax(380px,1.05fr)]">
      <div className="grid gap-4">
        <div className={panelClass}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Lesson-specific explorer
          </p>
          <h4 className="mt-3 text-lg font-semibold text-slate-900">{copy.title}</h4>
          <p className="mt-3 text-sm leading-6 text-slate-700">{copy.instructions}</p>

          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Try First
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{copy.tryFirst}</p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Explain while you explore
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{copy.taskPrompt}</p>
          </div>
        </div>

        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Explorer route</h4>
          <ol className="mt-4 grid gap-3">
            {copy.exploreSteps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <span className="text-sm leading-6 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid gap-4">
        <div className={panelClass}>
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-semibold text-slate-900">
              {visualCard.title ?? copy.title}
            </h4>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              {lessonKey.replace("_", " ")}
            </span>
          </div>
          {visualCard.image_url ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={visualCard.image_url}
                alt={visualCard.title ?? copy.title}
                className="w-full rounded-2xl border border-slate-200 bg-white"
              />
            </div>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {visualCard.caption ?? copy.takeaway}
          </p>
        </div>

        <div className={panelClass}>
          <h4 className="text-lg font-semibold text-slate-900">Watch for these physics clues</h4>
          <div className="mt-4 grid gap-3">
            {highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                {highlight}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Takeaway
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{copy.takeaway}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
