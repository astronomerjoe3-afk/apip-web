import Link from "next/link";

const supportItems = [
  {
    title: "Student support",
    body: "Use this route for login issues, lesson progress problems, payment access questions, and content or simulation feedback.",
  },
  {
    title: "School and teacher support",
    body: "Use this route for class setup, rostering, assignment flows, and institutional workspace issues.",
  },
  {
    title: "Privacy and account deletion",
    body: "Use the linked privacy and delete-account pages for data requests, account deletion, or questions about what Cognispark stores.",
  },
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #dbe5ff",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 16,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "12px 18px",
  background: "#0b1736",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 700,
};

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  background: "#ffffff",
  color: "#102041",
  border: "1px solid #cddcff",
};

export default function SupportPage() {
  return (
    <main style={shell}>
      <div style={container}>
        <section style={hero}>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.82 }}>Support center</div>
          <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>Cognispark support is built around actual student, teacher, and subscription workflows.</h1>
          <p style={{ margin: 0, maxWidth: 760, fontSize: 17, lineHeight: 1.7 }}>
            Public support email: <a style={{ color: "#7cc5ff" }} href="mailto:astronomerjoe3@gmail.com">astronomerjoe3@gmail.com</a>
            <br />
            Privacy email: <a style={{ color: "#7cc5ff" }} href="mailto:josephjobescape@gmail.com">josephjobescape@gmail.com</a>
          </p>
        </section>

        <section style={grid}>
          {supportItems.map((item) => (
            <article key={item.title} style={card}>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>{item.title}</h2>
              <p style={{ marginBottom: 0, lineHeight: 1.7 }}>{item.body}</p>
            </article>
          ))}
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Quick links</h2>
          <div style={buttonRow}>
            <Link href="/login" style={primaryButton} prefetch={false}>
              Login
            </Link>
            <Link href="/register" style={secondaryButton} prefetch={false}>
              Create account
            </Link>
            <Link href="/privacy" style={secondaryButton}>
              Privacy policy
            </Link>
            <Link href="/delete-account" style={secondaryButton}>
              Delete account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
