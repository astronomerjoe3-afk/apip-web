
import {
  daysSince,
  displayName,
  formatHours,
  formatWhen,
  initials,
  lessonLabel,
  loadBadgeClass,
  pct,
  readinessBadgeClass,
  riskBadgeClass,
} from "./analytics";
import { avatarLargeStyle, avatarStyle, barFillStyle, barTrackStyle, selectStyle } from "./viewStyles";
import type { AnalysedStudent, LessonSnapshot, ReadinessFilter, SupportAction } from "./types";

type RosterPanelProps = {
  rows: AnalysedStudent[];
  search: string;
  readinessFilter: ReadinessFilter;
  setSearch: (value: string) => void;
  setReadinessFilter: (value: ReadinessFilter) => void;
  selectedStudentId: string;
  setSelectedStudentId: (value: string) => void;
  selectedStudent: AnalysedStudent | null;
  selectedLessons: Array<[string, LessonSnapshot]>;
  supportActions: Record<string, SupportAction>;
  assignAction: (uid: string, action: SupportAction) => void;
};

export default function RosterPanel(props: RosterPanelProps) {
  const {
    rows,
    search,
    readinessFilter,
    setSearch,
    setReadinessFilter,
    selectedStudentId,
    setSelectedStudentId,
    selectedStudent,
    selectedLessons,
    supportActions,
    assignAction,
  } = props;

  return (
    <section className="admin-card">
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">Class management tools</p>
          <h2 className="admin-section-subtitle">Run the class from one roster view</h2>
          <p className="admin-section-copy">
            Search students, filter by readiness, inspect their lesson snapshots, and assign a support move without leaving the page.
          </p>
        </div>
        <div className="admin-inline-hints">
          <span className="admin-chip">Search</span>
          <span className="admin-chip">Filter</span>
          <span className="admin-chip">Spotlight</span>
        </div>
      </div>

      <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
        <div className="admin-subpanel">
          <div className="admin-toolbar" style={{ alignItems: "end" }}>
            <label className="admin-field" style={{ flex: 1, minWidth: "220px" }}>
              <span className="admin-mini-label">Find a learner</span>
              <input
                placeholder="Search by name, email, or misconception"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="admin-field" style={{ minWidth: "180px" }}>
              <span className="admin-mini-label">Readiness filter</span>
              <select value={readinessFilter} onChange={(event) => setReadinessFilter(event.target.value as ReadinessFilter)} style={selectStyle}>
                <option value="all">All students</option>
                <option value="ready">Ready</option>
                <option value="watch">Watch list</option>
                <option value="support">Needs support</option>
              </select>
            </label>
          </div>

          <div className="admin-key-list" style={{ marginTop: "1rem", maxHeight: "760px" }}>
            {rows.map((entry) => {
              const learnerName = displayName(entry.row);
              const assignedAction = supportActions[entry.row.uid];
              const isSelected = selectedStudentId === entry.row.uid;

              return (
                <button
                  key={entry.row.uid}
                  className={"admin-key-row" + (isSelected ? " is-selected" : "")}
                  onClick={() => setSelectedStudentId(entry.row.uid)}
                  type="button"
                >
                  <div className="admin-key-row-top">
                    <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
                      <div style={avatarStyle}>{initials(learnerName)}</div>
                      <div>
                        <strong>{learnerName}</strong>
                        <div className="admin-key-meta">{entry.row.email || entry.row.uid}</div>
                      </div>
                    </div>
                    <span className={riskBadgeClass(entry.risk.level)}>{entry.risk.level} risk</span>
                  </div>
                  <div className="admin-chip-list">
                    <span className={readinessBadgeClass(entry.row.readiness)}>{entry.row.readiness.replace(/_/g, " ")}</span>
                    <span className={loadBadgeClass(entry.load.level)}>{entry.load.level} load</span>
                    {assignedAction ? <span className="admin-chip">{assignedAction}</span> : null}
                  </div>

                  <div className="admin-detail-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                    <div className="admin-detail-card"><div className="admin-mini-label">Mastery</div><strong>{pct(entry.row.mastery_score)}</strong></div>
                    <div className="admin-detail-card"><div className="admin-mini-label">Engagement</div><strong>{formatHours(entry.row.engagement_seconds)}</strong></div>
                    <div className="admin-detail-card"><div className="admin-mini-label">Attempts</div><strong>{entry.row.activity_counters?.attempts || 0}</strong></div>
                  </div>

                  <p className="admin-muted-copy">{entry.risk.reason}</p>
                </button>
              );
            })}

            {rows.length === 0 ? (
              <div className="admin-empty-state">No students match this search yet. Try a broader filter or load another module.</div>
            ) : null}
          </div>
        </div>

        <div className="admin-subpanel">
          {selectedStudent ? (
            <div className="admin-detail-stack">
              <article className="admin-detail-card">
                <div className="admin-section-header">
                  <div style={{ display: "flex", gap: "0.95rem", alignItems: "center" }}>
                    <div style={avatarLargeStyle}>{initials(displayName(selectedStudent.row))}</div>
                    <div>
                      <p className="admin-kicker">Student spotlight</p>
                      <h3 style={{ fontSize: "1.45rem", marginTop: "0.2rem" }}>{displayName(selectedStudent.row)}</h3>
                      <p className="admin-muted-copy">{selectedStudent.row.email || selectedStudent.row.uid}</p>
                    </div>
                  </div>
                  <div className="admin-chip-list">
                    <span className={riskBadgeClass(selectedStudent.risk.level)}>{selectedStudent.risk.level} risk</span>
                    <span className={loadBadgeClass(selectedStudent.load.level)}>{selectedStudent.load.level} load</span>
                    <span className={readinessBadgeClass(selectedStudent.row.readiness)}>{selectedStudent.row.readiness.replace(/_/g, " ")}</span>
                  </div>
                </div>

                <div className="admin-stat-grid" style={{ marginTop: "1rem" }}>
                  <div className="admin-stat-card"><span className="admin-stat-label">Mastery</span><div className="admin-stat-value">{pct(selectedStudent.row.mastery_score)}</div><p className="admin-stat-caption">Overall mastery score</p></div>
                  <div className="admin-stat-card"><span className="admin-stat-label">Time on task</span><div className="admin-stat-value">{formatHours(selectedStudent.row.engagement_seconds)}</div><p className="admin-stat-caption">Tracked module engagement</p></div>
                  <div className="admin-stat-card"><span className="admin-stat-label">Attempts</span><div className="admin-stat-value">{selectedStudent.row.activity_counters?.attempts || 0}</div><p className="admin-stat-caption">Submitted checks and retries</p></div>
                  <div className="admin-stat-card"><span className="admin-stat-label">Reflections</span><div className="admin-stat-value">{selectedStudent.row.activity_counters?.reflections || 0}</div><p className="admin-stat-caption">Explain-it-back responses</p></div>
                </div>

                <div className="admin-notice admin-notice-info" style={{ marginTop: "1rem" }}>
                  <strong>Teaching move</strong>
                  <p className="admin-section-copy">{supportActions[selectedStudent.row.uid] || "Monitor"}: {selectedStudent.risk.reason}. Readiness reason: {selectedStudent.row.readiness_reason || "No reason captured yet"}.</p>
                </div>
              </article>
              <article className="admin-detail-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Likely misconceptions</p>
                    <h4>Where this learner may be stuck</h4>
                  </div>
                  <span className="admin-chip">Last active {formatWhen(selectedStudent.row.last_event_utc)}</span>
                </div>

                {selectedStudent.row.top_misconceptions.length ? (
                  <div className="admin-stack" style={{ marginTop: "0.9rem" }}>
                    {selectedStudent.row.top_misconceptions.slice(0, 4).map((misconception) => (
                      <div key={misconception.tag}>
                        <div className="admin-section-header admin-section-header-compact">
                          <strong>{misconception.tag}</strong>
                          <span className="admin-chip">{Math.round(misconception.p * 100)}%</span>
                        </div>
                        <div style={{ ...barTrackStyle, marginTop: "0.35rem" }}>
                          <div style={{ ...barFillStyle, width: String(Math.round(misconception.p * 100)) + "%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-muted-copy" style={{ marginTop: "0.9rem" }}>No misconception tags yet. This student may just need more evidence.</p>
                )}
              </article>

              <article className="admin-detail-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Assignment auto-grading insights</p>
                    <h4>How this learner is moving from diagnostic to transfer</h4>
                  </div>
                </div>

                <div className="admin-chip-list" style={{ marginTop: "0.8rem" }}>
                  <span className="admin-chip">Diagnostic {pct(selectedStudent.row.last_diagnostic?.score)}</span>
                  <span className="admin-chip">Transfer {pct(selectedStudent.row.last_transfer?.score)}</span>
                  <span className="admin-chip">Last seen {daysSince(selectedStudent.row.last_event_utc) || 0} day(s) ago</span>
                </div>

                {selectedLessons.length ? (
                  <div className="admin-stack" style={{ marginTop: "1rem" }}>
                    {selectedLessons.map(([lessonId, snapshot]) => (
                      <div className="admin-subpanel" key={lessonId}>
                        <div className="admin-step-heading">
                          <strong>{lessonLabel(lessonId)}</strong>
                          <span className="admin-chip">{snapshot.transfer ? "Transfer scored" : "Awaiting transfer"}</span>
                        </div>
                        <div className="admin-detail-grid" style={{ marginTop: "0.7rem" }}>
                          <div className="admin-detail-card"><div className="admin-mini-label">Diagnostic</div><strong>{pct(snapshot.diagnostic?.score)}</strong></div>
                          <div className="admin-detail-card"><div className="admin-mini-label">Transfer</div><strong>{pct(snapshot.transfer?.score)}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-muted-copy" style={{ marginTop: "0.9rem" }}>Lesson-by-lesson snapshots will appear after this learner completes more diagnostic or transfer events.</p>
                )}
              </article>
              <article className="admin-detail-card">
                <div className="admin-section-header admin-section-header-compact">
                  <div>
                    <p className="admin-kicker">Class management tools</p>
                    <h4>Assign the next move</h4>
                  </div>
                  <span className="admin-chip">Current plan: {supportActions[selectedStudent.row.uid] || "Monitor"}</span>
                </div>

                <div className="admin-toolbar" style={{ marginTop: "0.9rem" }}>
                  {(["Monitor", "Reteach", "Office hours", "Celebrate"] as SupportAction[]).map((action) => (
                    <button
                      key={action}
                      className={supportActions[selectedStudent.row.uid] === action ? "admin-btn admin-btn-primary" : "admin-btn admin-btn-secondary"}
                      onClick={() => assignAction(selectedStudent.row.uid, action)}
                      type="button"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            <div className="admin-empty-state">
              Pick a student from the roster to open their misconception profile, readiness signal, and lesson snapshots.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
