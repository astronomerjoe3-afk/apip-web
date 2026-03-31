"use client";

import { FormEvent, useMemo, useState } from "react";

const CONTACT_EMAIL = "astronomerjoe3@gmail.com";

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f4f7ff 0%, #ffffff 100%)",
  color: "#102041",
  padding: "32px 20px 56px",
  fontFamily: "system-ui, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
  display: "grid",
  gap: 24,
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
};

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #dbe5ff",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
};

const field: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const input: React.CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #cddcff",
  padding: "12px 14px",
  font: "inherit",
};

const button: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "12px 18px",
  background: "#0b1736",
  color: "#ffffff",
  border: "none",
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
};

function encodeMailto(subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}

export default function RequestClient() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountRole, setAccountRole] = useState("student");
  const [country, setCountry] = useState("Nigeria");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("Complete this form to generate your deletion request.");

  const emailBody = useMemo(() => {
    return [
      "Cognispark Account Deletion Request",
      "",
      `Full name: ${fullName || "-"}`,
      `Registered email address: ${email || "-"}`,
      `Account role: ${accountRole || "-"}`,
      `Country of account creation: ${country || "-"}`,
      "",
      "Additional notes:",
      note || "-",
    ].join("\n");
  }, [accountRole, country, email, fullName, note]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Opening your email app with a prefilled Cognispark deletion request.");
    window.location.href = encodeMailto("Cognispark Account Deletion Request", emailBody);
  }

  return (
    <main style={shell}>
      <div style={container}>
        <section style={{ ...card, background: "#0b1736", color: "#f8fbff" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.82 }}>Delete account request</div>
          <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>Generate your Cognispark deletion request.</h1>
          <p style={{ margin: 0, lineHeight: 1.8 }}>
            This page creates a prefilled email to <strong>{CONTACT_EMAIL}</strong> so users have a public web path for account deletion requests.
          </p>
          <p style={{ marginTop: 16, marginBottom: 0, lineHeight: 1.7 }}>{status}</p>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Deletion request details</h2>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <label style={field}>
              <span>Full name</span>
              <input onChange={(event) => setFullName(event.target.value)} required style={input} type="text" value={fullName} />
            </label>

            <label style={field}>
              <span>Registered email address</span>
              <input onChange={(event) => setEmail(event.target.value)} required style={input} type="email" value={email} />
            </label>

            <label style={field}>
              <span>Account role</span>
              <select onChange={(event) => setAccountRole(event.target.value)} style={input} value={accountRole}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="institution-admin">Institution admin</option>
              </select>
            </label>

            <label style={field}>
              <span>Country of account creation</span>
              <input onChange={(event) => setCountry(event.target.value)} required style={input} type="text" value={country} />
            </label>

            <label style={field}>
              <span>Additional notes</span>
              <textarea onChange={(event) => setNote(event.target.value)} rows={5} style={input} value={note} />
            </label>

            <div>
              <button style={button} type="submit">
                Open deletion email
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
