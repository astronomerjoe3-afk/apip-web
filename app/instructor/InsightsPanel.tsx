
import { pct } from "./analytics";
import type { AnalysedStudent, LessonInsight, SummaryMetrics } from "./types";

type InsightsPanelProps = {
  rows: AnalysedStudent[];
  summary: SummaryMetrics;
  lessons: LessonInsight[];
};

export default function InsightsPanel(props: InsightsPanelProps) {
  const { rows, summary, lessons } = props;
  const tractionRows = rows.filter((entry) => entry.row.mastery_score >= 0.75 && entry.row.last_transfer?.score).slice(0, 4);

  return (
    <section className="admin-card">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Engagement and performance analytics</p>
          <h2 className="admin-section-subtitle">Auto-grading insights for the whole class</h2>
          <p className="admin-section-copy">
            Compare diagnostics, transfer tasks, and engagement so you can decide whether to reteach, enrich, or reorganize the next lesson run.
          </p>
        </div>
      </div>

      <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
        <article className="admin-subpanel">
          <p className="admin-kicker">Readiness breakdown</p>
          <div className="admin-stat-grid" style={{ marginTop: "0.8rem" }}>
            <div className="admin-stat-card"><span className="admin-stat-label">Ready</span><div className="admin-stat-value">{rows.filter((item) => item.readinessBucket === "ready").length}</div></div>
            <div className="admin-stat-card"><span className="admin-stat-label">Watch</span><div className="admin-stat-value">{rows.filter((item) => item.readinessBucket === "watch").length}</div></div>
            <div className="admin-stat-card"><span className="admin-stat-label">Support</span><div className="admin-stat-value">{rows.filter((item) => item.readinessBucket === "support").length}</div></div>
          </div>
        </article>

        <article className="admin-subpanel">
          <p className="admin-kicker">Assignment auto-grading</p>
          <div className="admin-stat-grid" style={{ marginTop: "0.8rem" }}>
            <div className="admin-stat-card"><span className="admin-stat-label">Avg diagnostic</span><div className="admin-stat-value">{pct(summary.averageDiagnostic)}</div></div>
            <div className="admin-stat-card"><span className="admin-stat-label">Avg transfer</span><div className="admin-stat-value">{pct(summary.averageTransfer)}</div></div>
          </div>
          <p className="admin-muted-copy" style={{ marginTop: "0.7rem" }}>
            Use this gap to decide whether students are simply recalling facts or actually transferring the idea into new tasks.
          </p>
        </article>
        <article className="admin-subpanel">
          <p className="admin-kicker">Lesson hotspots</p>
          {lessons.length ? (
            <div className="admin-stack" style={{ marginTop: "0.8rem" }}>
              {lessons.slice(0, 4).map((lesson) => (
                <div className="admin-detail-card" key={lesson.lessonId}>
                  <div className="admin-section-header admin-section-header-compact">
                    <strong>{lesson.lessonId}</strong>
                    <span className="admin-chip">{lesson.learners} learners</span>
                  </div>
                  <div className="admin-chip-list" style={{ marginTop: "0.6rem" }}>
                    <span className="admin-chip">Diagnostic {pct(lesson.diagnostic)}</span>
                    <span className="admin-chip">Transfer {pct(lesson.transfer)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state" style={{ marginTop: "0.8rem" }}>Lesson hotspots will appear once enough scored events arrive.</div>
          )}
        </article>

        <article className="admin-subpanel">
          <p className="admin-kicker">Students gaining traction</p>
          <div className="admin-stack" style={{ marginTop: "0.8rem" }}>
            {tractionRows.map((entry) => (
              <div className="admin-detail-card" key={entry.row.uid}>
                <div className="admin-section-header admin-section-header-compact">
                  <strong>{entry.row.display_name || entry.row.email || entry.row.uid}</strong>
                  <span className="admin-badge admin-badge-success">{pct(entry.row.last_transfer?.score)} transfer</span>
                </div>
                <p className="admin-muted-copy">Ready for extension or peer coaching.</p>
              </div>
            ))}
            {!tractionRows.length ? <div className="admin-empty-state">No clear extension candidates yet.</div> : null}
          </div>
        </article>
      </div>
    </section>
  );
}
