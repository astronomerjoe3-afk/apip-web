"use client";

import type { SupportInquiry } from "./types";

type SupportInboxPanelProps = {
  inquiries: SupportInquiry[];
  loading: boolean;
  moduleId: string;
};

function formatTimestamp(value?: string | null): string {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export default function SupportInboxPanel({ inquiries, loading, moduleId }: SupportInboxPanelProps) {
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
                  {inquiry.category}
                </span>
                <span className="admin-chip">{inquiry.status}</span>
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
                {(inquiry.lesson_id || inquiry.module_id) ? (
                  <div>
                    Context: {[inquiry.module_id || inquiry.module_title, inquiry.lesson_id || inquiry.lesson_title].filter(Boolean).join(" | ")}
                  </div>
                ) : null}
                {inquiry.page_path ? <div>Page: {inquiry.page_path}</div> : null}
              </div>

              {inquiry.student_email ? (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <a
                    className="admin-btn admin-btn-secondary"
                    href={`mailto:${inquiry.student_email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}
                  >
                    Reply by email
                  </a>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
