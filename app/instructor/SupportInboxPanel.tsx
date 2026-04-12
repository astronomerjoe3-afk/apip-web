"use client";

import { useCallback, useState } from "react";

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

function previewMessage(value?: string | null, maxLength = 180): string {
  const text = String(value || "").trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

function gmailDraftUrl(inquiry: SupportInquiry): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: inquiry.student_email || "",
    su: `Re: ${inquiry.subject}`,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function SupportInboxPanel({ inquiries, loading, moduleId, resolvingId, onResolve }: SupportInboxPanelProps) {
  const [copiedToken, setCopiedToken] = useState<string>("");

  const copyText = useCallback(async (value: string, token: string): Promise<void> => {
    const text = String(value || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToken(token);
      window.setTimeout(() => {
        setCopiedToken((current) => (current === token ? "" : current));
      }, 1600);
    } catch {
      setCopiedToken(`manual-${token}`);
      window.setTimeout(() => {
        setCopiedToken((current) => (current === `manual-${token}` ? "" : current));
      }, 2200);
    }
  }, []);

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
                <div
                  style={{
                    marginTop: "0.35rem",
                    color: "#46566b",
                    lineHeight: 1.65,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {previewMessage(inquiry.message)}
                </div>
                {String(inquiry.message || "").trim().length > 180 ? (
                  <details style={{ marginTop: "0.55rem" }}>
                    <summary style={{ cursor: "pointer", color: "#1d4ed8", fontWeight: 700 }}>
                      View full message
                    </summary>
                    <div
                      style={{
                        marginTop: "0.65rem",
                        padding: "0.9rem",
                        borderRadius: "14px",
                        border: "1px solid rgba(16, 35, 63, 0.12)",
                        background: "rgba(248, 250, 252, 0.92)",
                        color: "#334155",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {inquiry.message}
                    </div>
                  </details>
                ) : null}
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
                    <>
                      <a
                        className="admin-btn admin-btn-secondary"
                        href={`mailto:${inquiry.student_email}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`}
                      >
                        Reply by email
                      </a>
                      <a
                        className="admin-btn admin-btn-secondary"
                        href={gmailDraftUrl(inquiry)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Gmail draft
                      </a>
                      <button
                        className="admin-btn admin-btn-secondary"
                        onClick={() => void copyText(inquiry.student_email || "", `email-${inquiry.id}`)}
                        type="button"
                      >
                        {copiedToken === `email-${inquiry.id}` ? "Email copied" : copiedToken === `manual-email-${inquiry.id}` ? "Copy blocked" : "Copy email"}
                      </button>
                    </>
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
              {copiedToken === `manual-email-${inquiry.id}` ? (
                <div style={{ color: "#64748b", fontSize: "0.92rem" }}>
                  Clipboard access was blocked in this browser. You can still use the Gmail draft or copy the address manually from the card.
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
