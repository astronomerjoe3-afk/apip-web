"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { apipPost } from "../lib/apipApi";

type HelpRequestResponse = {
  ok: boolean;
  request?: {
    id?: string;
  };
};

type StudentHelpCardProps = {
  moduleId?: string | null;
  moduleTitle?: string | null;
  lessonId?: string | null;
  lessonTitle?: string | null;
  pagePath?: string | null;
  compact?: boolean;
};

function defaultSubject(props: StudentHelpCardProps): string {
  if (props.lessonId && props.lessonTitle) {
    return `Question about ${props.lessonId}: ${props.lessonTitle}`;
  }
  if (props.moduleId && props.moduleTitle) {
    return `Question about ${props.moduleId}: ${props.moduleTitle}`;
  }
  if (props.moduleId) {
    return `Question about ${props.moduleId}`;
  }
  return "Student help request";
}

export default function StudentHelpCard(props: StudentHelpCardProps) {
  const currentDefaultSubject = defaultSubject(props);
  const previousDefaultSubjectRef = useRef<string>(currentDefaultSubject);
  const [category, setCategory] = useState<string>("stuck");
  const [subject, setSubject] = useState<string>(currentDefaultSubject);
  const [message, setMessage] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    setSubject((current) =>
      current === previousDefaultSubjectRef.current || current.trim().length === 0
        ? currentDefaultSubject
        : current,
    );
    previousDefaultSubjectRef.current = currentDefaultSubject;
  }, [currentDefaultSubject]);

  const contextLine = useMemo(() => {
    if (props.lessonId && props.lessonTitle) {
      return `Context: ${props.lessonId} | ${props.lessonTitle}`;
    }
    if (props.moduleId && props.moduleTitle) {
      return `Context: ${props.moduleId} | ${props.moduleTitle}`;
    }
    if (props.moduleId) {
      return `Context: ${props.moduleId}`;
    }
    return "Context: student workspace";
  }, [props.lessonId, props.lessonTitle, props.moduleId, props.moduleTitle]);

  async function submitInquiry(): Promise<void> {
    if (busy) return;

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    if (trimmedSubject.length < 3 || trimmedMessage.length < 10) {
      setError("Add a short subject and enough detail for the admin to help.");
      setSuccess("");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const response = await apipPost<HelpRequestResponse, {
        category: string;
        subject: string;
        message: string;
        module_id?: string | null;
        module_title?: string | null;
        lesson_id?: string | null;
        lesson_title?: string | null;
        page_path?: string | null;
      }>("/student/help-requests", {
        category,
        subject: trimmedSubject,
        message: trimmedMessage,
        module_id: props.moduleId || null,
        module_title: props.moduleTitle || null,
        lesson_id: props.lessonId || null,
        lesson_title: props.lessonTitle || null,
        page_path: props.pagePath || (typeof window !== "undefined" ? window.location.pathname : null),
      });

      setSuccess(
        response.request?.id
          ? `Your note has been sent to the admin inbox. Reference: ${response.request.id}.`
          : "Your note has been sent to the admin inbox.",
      );
      setMessage("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : String(submissionError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      style={{
        border: "1px solid rgba(16, 35, 63, 0.12)",
        borderRadius: 24,
        padding: props.compact ? 18 : 22,
        background: "rgba(255, 255, 255, 0.82)",
        boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
        display: "grid",
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: props.compact ? 22 : 24, fontWeight: 900, color: "#10233f" }}>
          Need help or want to ask the admin something?
        </div>
        <div style={{ marginTop: 6, color: "#46566b", lineHeight: 1.65 }}>
          Send a short note here if you are stuck, spotted a content issue, or need support.
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#64748b", fontWeight: 700 }}>
          {contextLine}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <label style={{ display: "grid", gap: 6, fontWeight: 700, color: "#334155" }}>
          Help type
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(16, 35, 63, 0.18)",
              padding: "12px 14px",
              background: "#fff",
              color: "#10233f",
            }}
          >
            <option value="stuck">I am stuck in the lesson</option>
            <option value="content">Question about the lesson content</option>
            <option value="technical">Technical problem</option>
            <option value="billing">Billing or account issue</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6, fontWeight: 700, color: "#334155" }}>
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="What do you need help with?"
            style={{
              borderRadius: 12,
              border: "1px solid rgba(16, 35, 63, 0.18)",
              padding: "12px 14px",
              background: "#fff",
              color: "#10233f",
            }}
          />
        </label>
      </div>

      <label style={{ display: "grid", gap: 6, fontWeight: 700, color: "#334155" }}>
        Message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell the admin what happened, where you are in the lesson, and what you expected."
          rows={5}
          style={{
            borderRadius: 14,
            border: "1px solid rgba(16, 35, 63, 0.18)",
            padding: "12px 14px",
            background: "#fff",
            color: "#10233f",
            resize: "vertical",
          }}
        />
      </label>

      {error ? (
        <div style={{ border: "1px solid rgba(153, 27, 27, 0.22)", borderRadius: 14, padding: 12, background: "#fef2f2", color: "#991b1b" }}>
          {error}
        </div>
      ) : null}

      {success ? (
        <div style={{ border: "1px solid rgba(22, 101, 52, 0.18)", borderRadius: 14, padding: 12, background: "#f0fdf4", color: "#166534" }}>
          {success}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => void submitInquiry()}
          disabled={busy}
          style={{
            padding: "12px 18px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #10233f 0%, #0b1a32 100%)",
            color: "#fff",
            fontWeight: 900,
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Sending your note..." : "Send to admin"}
        </button>
        <span style={{ color: "#64748b", fontSize: 14 }}>
          Include enough detail so someone can follow up without asking you to repeat the problem.
        </span>
      </div>
    </section>
  );
}
