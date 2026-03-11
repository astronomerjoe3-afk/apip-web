
import { displayName, formatHours, loadBadgeClass, pct, riskBadgeClass } from "./analytics";
import type { AnalysedStudent, SupportAction } from "./types";

type SidebarProps = {
  riskQueue: AnalysedStudent[];
  loadQueue: AnalysedStudent[];
  actionCounts: Record<SupportAction, number>;
};

export default function InstructorSidebar(props: SidebarProps) {
  const { riskQueue, loadQueue, actionCounts } = props;

  return (
    <aside className="admin-side-column">
      <section className="admin-card">
        <div className="admin-section-header admin-section-header-compact">
          <div>
            <p className="admin-kicker">Predictive dropout risk</p>
            <h2 className="admin-section-subtitle">Intervene before learners go quiet</h2>
          </div>
        </div>

        {riskQueue.length ? (
          <div className="admin-stack" style={{ marginTop: "1rem" }}>
            {riskQueue.map((entry) => (
              <article className="admin-step-card" key={entry.row.uid}>
                <div className="admin-step-heading">
                  <div>
                    <strong>{displayName(entry.row)}</strong>
                    <p className="admin-muted-copy">{entry.row.email || entry.row.uid}</p>
                  </div>
                  <span className={riskBadgeClass(entry.risk.level)}>{entry.risk.level} risk</span>
                </div>
                <p>{entry.risk.reason}</p>
                <div className="admin-chip-list">
                  <span className="admin-chip">Mastery {pct(entry.row.mastery_score)}</span>
                  <span className="admin-chip">Engagement {formatHours(entry.row.engagement_seconds)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state" style={{ marginTop: "1rem" }}>No learners are currently flagged above the normal watch threshold.</div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-section-header admin-section-header-compact">
          <div>
            <p className="admin-kicker">Cognitive load monitoring</p>
            <h2 className="admin-section-subtitle">Spot when effort becomes overload</h2>
          </div>
        </div>
        {loadQueue.length ? (
          <div className="admin-stack" style={{ marginTop: "1rem" }}>
            {loadQueue.map((entry) => (
              <article className="admin-step-card" key={entry.row.uid}>
                <div className="admin-step-heading">
                  <div>
                    <strong>{displayName(entry.row)}</strong>
                    <p className="admin-muted-copy">{entry.load.reason}</p>
                  </div>
                  <span className={loadBadgeClass(entry.load.level)}>{entry.load.level}</span>
                </div>
                <div className="admin-chip-list">
                  <span className="admin-chip">Attempts {entry.row.activity_counters?.attempts || 0}</span>
                  <span className="admin-chip">Reflections {entry.row.activity_counters?.reflections || 0}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state" style={{ marginTop: "1rem" }}>Cognitive load looks balanced right now.</div>
        )}
      </section>

      <section className="admin-card">
        <div className="admin-section-header admin-section-header-compact">
          <div>
            <p className="admin-kicker">Class management summary</p>
            <h2 className="admin-section-subtitle">Your planned next moves</h2>
          </div>
        </div>

        <div className="admin-stat-grid" style={{ marginTop: "1rem" }}>
          <div className="admin-stat-card"><span className="admin-stat-label">Monitor</span><div className="admin-stat-value">{actionCounts.Monitor}</div></div>
          <div className="admin-stat-card"><span className="admin-stat-label">Reteach</span><div className="admin-stat-value">{actionCounts.Reteach}</div></div>
          <div className="admin-stat-card"><span className="admin-stat-label">Office hours</span><div className="admin-stat-value">{actionCounts["Office hours"]}</div></div>
          <div className="admin-stat-card"><span className="admin-stat-label">Celebrate</span><div className="admin-stat-value">{actionCounts.Celebrate}</div></div>
        </div>

        <div className="admin-notice admin-notice-success" style={{ marginTop: "1rem" }}>
          <strong>Recommended routine</strong>
          <p className="admin-section-copy">
            Start with the high-risk learners, then check the heavy-load queue, and finally pick one misconception from the map to address in tomorrow&apos;s opening activity.
          </p>
        </div>
      </section>
    </aside>
  );
}
