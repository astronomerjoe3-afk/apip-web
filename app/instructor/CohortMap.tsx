import { barFillStyle, barTrackStyle } from "./viewStyles";
import type { MisconceptionSummary } from "./types";

type CohortMapProps = {
  cohortSize: number;
  items: MisconceptionSummary[];
};

export default function CohortMap(props: CohortMapProps) {
  const { cohortSize, items } = props;

  return (
    <section className="admin-card">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Cohort misconception map</p>
          <h2 className="admin-section-subtitle">See which ideas are blocking the most learners</h2>
          <p className="admin-section-copy">
            Wider bars mean more students are carrying that misconception. Higher pressure means the misconception is strong enough to interfere with transfer.
          </p>
        </div>
        <div className="admin-chip-list">
          <span className="admin-chip">Top {items.length || 0} tags</span>
          <span className="admin-chip">Learner count + pressure</span>
        </div>
      </div>

      {items.length ? (
        <div className="admin-stack" style={{ marginTop: "1rem" }}>
          {items.map((item) => {
            const learnerWidth = cohortSize ? Math.max(16, Math.round((item.learners / cohortSize) * 100)) : 0;
            const pressureWidth = Math.max(10, Math.round(item.pressure * 100));

            return (
              <article className="admin-subpanel" key={item.tag}>
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <strong>{item.tag}</strong>
                    <p className="admin-stat-caption">{item.learners} learner{item.learners === 1 ? "" : "s"} affected</p>
                  </div>
                  <span className="admin-chip">Peak {Math.round(item.peak * 100)}%</span>
                </div>

                <div style={{ marginTop: "0.8rem", display: "grid", gap: "0.7rem" }}>
                  <div>
                    <div className="admin-mini-label" style={{ marginBottom: "0.3rem" }}>Spread across the cohort</div>
                    <div style={barTrackStyle}>
                      <div style={{ ...barFillStyle, width: String(learnerWidth) + "%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="admin-mini-label" style={{ marginBottom: "0.3rem" }}>Misconception pressure</div>
                    <div style={barTrackStyle}>
                      <div
                        style={{
                          ...barFillStyle,
                          width: String(pressureWidth) + "%",
                          background: "linear-gradient(135deg, rgba(227, 155, 60, 0.96) 0%, rgba(219, 94, 48, 0.94) 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty-state" style={{ marginTop: "1rem" }}>
          Misconception tags will appear here once students generate progress traces for this module.
        </div>
      )}
    </section>
  );
}
