import Link from "next/link";

const requestItems = [
  "your full name",
  "your registered email address",
  "the account role you use in Cognispark",
  "the country where the account was created",
  "any note that helps us confirm the request safely",
];

const deleteItems = [
  "your account profile and sign-in access",
  "non-essential support history",
  "personal preferences not required for security or compliance",
  "classroom access links that are no longer required",
];

const retainItems = [
  "billing, refund, and invoice records where legally required",
  "security, abuse, and audit logs needed to protect the platform",
  "records tied to active disputes, investigations, or legal obligations",
];

const shell: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f4f7ff 0%, #ffffff 100%)",
  color: "#102041",
  padding: "32px 20px 56px",
  fontFamily: "system-ui, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
  display: "grid",
  gap: 24,
};

const hero: React.CSSProperties = {
  background: "#0b1736",
  color: "#f8fbff",
  borderRadius: 28,
  padding: 28,
  boxShadow: "0 24px 60px rgba(11, 23, 54, 0.18)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gap: 16,
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
};

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #dbe5ff",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "12px 18px",
  background: "#0b1736",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
  marginTop: 16,
};

export default function DeleteAccountPage() {
  return (
    <main style={shell}>
      <div style={container}>
        <section style={hero}>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.82 }}>Account and data deletion</div>
          <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>Cognispark account deletion starts here.</h1>
          <p style={{ margin: 0, maxWidth: 760, fontSize: 17, lineHeight: 1.7 }}>
            Effective date: <strong>2026-03-31</strong>. If you want to delete your Cognispark account and associated personal data, you can use the request form linked below or email{" "}
            <a style={{ color: "#7cc5ff" }} href="mailto:astronomerjoe3@gmail.com">astronomerjoe3@gmail.com</a>.
          </p>
        </section>

        <section style={grid}>
          <article style={card}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>How to request deletion</h2>
            <p style={{ lineHeight: 1.7 }}>
              Send the request from the email linked to your account when possible, or include enough detail for us to verify you safely.
            </p>
            <ul style={{ marginBottom: 0, lineHeight: 1.8 }}>
              {requestItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href="/delete-account/request" style={buttonStyle}>
              Open deletion request form
            </Link>
          </article>

          <article style={card}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>What we delete</h2>
            <ul style={{ marginBottom: 0, lineHeight: 1.8 }}>
              {deleteItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article style={card}>
            <h2 style={{ marginTop: 0, fontSize: 22 }}>What we may retain</h2>
            <ul style={{ marginBottom: 0, lineHeight: 1.8 }}>
              {retainItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
