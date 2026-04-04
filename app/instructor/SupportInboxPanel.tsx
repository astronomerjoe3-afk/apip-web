"use client";

import type { SupportInquiry } from "./types";

type SupportInboxPanelProps = {
  inquiries: SupportInquiry[];
  loading: boolean;
  moduleId: string;
  resolvingId?: string;
  onResolve?: (inquiryId: string) => Promise<void> | void;
};

function formatTimestamp(value?: string | null): string {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function startCase(value?: string | null): string {
  const normalized = String(value || "").replace(/[_-]+/g, " ").trim();
  if (!normalized) return "-";
  return normalized
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function contextLabel(inquiry: SupportInquiry): string | null {
  const modulePart = inquiry.module_id || inquiry.module_title;
  const lessonPart = inquiry.lesson_title || inquiry.lesson_id;
  const parts = [modulePart, lessonPart].filter(Boolean);
  return parts.length ? parts.join(" | ") : null;
}

export default function SupportInboxPanel({ inquiries, loading, moduleId, resolvingId, onResolve }: SupportInboxPanelProps) {
  return (
    <section className="admin-card">
      <div className="admin-section-header admin-section-header-compact">
        <div>
          <p className="admin-kicker">Student inquiries</p>
          <h2 className="admin-section-subtitle">Recent help requests for {moduleId}</h2>
        </div>
      </div>

      <p className="admin-section-copy">
        Students can now send questions or issue reports from the lesson flow. Use this inbox to spot blockers early and reply through the student email on the card.
      </p>

      {loading ? (
        <div className="admin-empty-state">Loading student inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="admin-empty-state">No open help requests for this module right now.</div>
      ) : (
        <div style={{ display: "grid", gap: "0.9rem", marginTop: "1rem" }}>
          {inquiries.map((inquiry) => (
            <article
              key={inquiry.id}
              style={{
                border: "1px solid rgba(16, 35, 63, 0.12)",
                borderRadius: "18px",
                padding: "1rem",
                background: "rgba(255,255,255,0.74)",
                display: "grid",
                gap: "0.7rem",
              }}
            >
              <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", alignItems: "center" }}>
                <span
                  className="admin-chip"
                  style={{ background: "rgba(219, 234, 254, 0.9)", color: "#1d4ed8" }}
                >
                  {startCase(inquiry.category)}
                </span>
                <span className="admin-chip">{startCase(inquiry.status)}</span>
                <span style={{ opacity: 0.7 }}>{formatTimestamp(inquiry.created_utc)}</span>
              </div>

              <div>
                <div style={{ fontSize: "1.02rem", fontWeight: 900, color: "#10233f" }}>{inquiry.subject}</div>
                <div style={{ marginTop: "0.35rem", color: "#46566b", lineHeight: 1.65 }}>{inquiry.message}</div>
              </div>

              <div style={{ display: "grid", gap: "0.3rem", color: "#64748b", fontSize: "0.94rem" }}>
                <div>
                  From: <strong>{inquiry.student_email || inquiry.student_uid || "Unknown student"}</strong>
                </div>
                {contextLabel(inquiry) ? (
                  <div>
                    Context: {contextLabel(inquiry)}
                  </div>
                ) : null}
                {inquiry.page_path ? <div>Page: {inquiry.page_path}</div> : null}
              </div>

              {inquiry.student_email || onResolve ? (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  {inquiry.student_email ? (
                    <a
                      className="admin-btn admin-btn-secondary"
                      href={`mailto:${inquiry.student_email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}
                    >
                      Reply by email
                    </a>
                  ) : null}
                  {onResolve ? (
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => void onResolve(inquiry.id)}
                      type="button"
                      disabled={resolvingId === inquiry.id}
                    >
                      {resolvingId === inquiry.id ? "Resolving..." : "Mark resolved"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
