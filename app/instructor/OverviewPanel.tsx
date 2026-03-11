import { formatHours, pct } from "./analytics";
import type { SummaryMetrics } from "./types";

type OverviewPanelProps = {
  moduleId: string;
  cohortPulse: string;
  summary: SummaryMetrics;
  onModuleChange: (value: string) => void;
};

export default function OverviewPanel(props: OverviewPanelProps) {
  const { moduleId, cohortPulse, summary, onModuleChange } = props;

  return (
    <section className="admin-card admin-card-hero">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Cohort command center</p>
          <h2 className="admin-section-title">Guide intervention before students drift</h2>
          <p className="admin-section-copy">
            This view turns raw progress into next teaching moves: who is secure, who is overloaded, and which lesson ideas need reteaching right now.
          </p>
        </div>

        <div className="admin-toolbar">
          <label className="admin-field admin-field-compact">
            <span className="admin-mini-label">Module</span>
            <input value={moduleId} onChange={(event) => onModuleChange(event.target.value.trim().toUpperCase())} />
          </label>
        </div>
      </div>

      <div className="admin-chip-list" style={{ marginTop: "1rem" }}>
        <span className="admin-chip">Cohort pulse: {cohortPulse}</span>
      </div>

      <div className="admin-stat-grid" style={{ marginTop: "1rem" }}>
        <article className="admin-stat-card"><span className="admin-stat-label">Cohort size</span><div className="admin-stat-value">{summary.cohortSize}</div><p className="admin-stat-caption">Students with progress in {moduleId}</p></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Average mastery</span><div className="admin-stat-value">{pct(summary.averageMastery)}</div><p className="admin-stat-caption">Auto-graded understanding right now</p></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Predictive dropout risk</span><div className="admin-stat-value">{summary.highRisk}</div><p className="admin-stat-caption">Students who need same-day follow-up</p></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Cognitive load watch</span><div className="admin-stat-value">{summary.heavyLoad}</div><p className="admin-stat-caption">Students showing strain in the workflow</p></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Average engagement</span><div className="admin-stat-value">{formatHours(summary.averageEngagementSeconds)}</div><p className="admin-stat-caption">Time spent actively working in this module</p></article>
        <article className="admin-stat-card"><span className="admin-stat-label">Ready for extension</span><div className="admin-stat-value">{summary.readyCount}</div><p className="admin-stat-caption">Students ready for challenge tasks</p></article>
      </div>
    </section>
  );
}
