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

const card: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #dbe5ff",
  boxShadow: "0 18px 48px rgba(15, 23, 42, 0.08)",
};

const terms = [
  "You must provide accurate account details and keep your login credentials secure.",
  "Cognispark provides physics learning content, guided missions, feedback, premium access, and class workflows as available in your plan or institution.",
  "You may not use the product for abuse, cheating, harassment, security testing without permission, or attempts to damage the service or other users.",
  "If you have a paid plan, you authorize applicable subscription or one-time charges and agree that access may change when payment status changes.",
  "Institutions, teachers, and administrators are responsible for using class and assignment tools in line with school policy and applicable law.",
  "We may suspend or terminate access for fraud, abuse, policy breaches, security risk, or legal requirements.",
];

export default function TermsPage() {
  return (
    <main style={shell}>
      <div style={container}>
        <section style={hero}>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.82 }}>Terms of service</div>
          <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>Cognispark terms focus on account integrity, fair product use, and stable learning delivery.</h1>
          <p style={{ margin: 0, maxWidth: 760, fontSize: 17, lineHeight: 1.7 }}>
            Effective date: <strong>2026-03-31</strong>. By using the Cognispark website or Android app, you agree to these terms.
          </p>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Core terms</h2>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
            {terms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Support and contact</h2>
          <p style={{ marginBottom: 0, lineHeight: 1.8 }}>
            Product and account support: <a href="mailto:astronomerjoe3@gmail.com">astronomerjoe3@gmail.com</a>
            <br />
            Privacy requests: <a href="mailto:josephjobescape@gmail.com">josephjobescape@gmail.com</a>
            <br />
            Governing contact: Cognispark, No. 2B Poultry Road, Owere-Eze Orba, Nsukka, Enugu State, Nigeria.
          </p>
        </section>
      </div>
    </main>
  );
}
