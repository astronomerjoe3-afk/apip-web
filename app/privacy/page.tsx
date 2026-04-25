import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Cognispark privacy policy for account data, learning progress, class workflows, support requests, billing status, and deletion requests.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    url: "/privacy",
    title: "Cognispark Privacy Policy",
    description:
      "How Cognispark handles learning, class, account, support, subscription, and deletion-request data.",
  },
};

const SUPPORT_EMAIL = "support@cognispark.tech";
const PRIVACY_EMAIL = "privacy@cognispark.tech";

const sections = [
  {
    title: "What Cognispark collects",
    body: "Cognispark may collect account details such as email address, authentication identifiers, learning progress, lesson responses, subscription or billing status, class membership, assignment submissions, and support requests needed to run the product.",
  },
  {
    title: "Why the data is used",
    body: "We use data to authenticate users, deliver physics lessons, save progress, provide feedback, manage premium access, run school and teacher workflows, respond to support requests, prevent abuse, and improve the product.",
  },
  {
    title: "What may be retained",
    body: "Some records can be deleted on request. Other data may need to be retained for security, fraud prevention, billing, audit, legal compliance, or dispute resolution for the period required by law or policy.",
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

const sectionGrid: React.CSSProperties = {
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

export default function PrivacyPage() {
  return (
    <main style={shell}>
      <div style={container}>
        <section style={hero}>
          <div style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.82 }}>Privacy policy</div>
          <h1 style={{ margin: "12px 0 14px", fontSize: "clamp(2rem, 3vw, 3rem)", lineHeight: 1.05 }}>Cognispark handles learning, class, and account data with a clear product and support purpose.</h1>
          <p style={{ margin: 0, maxWidth: 760, fontSize: 17, lineHeight: 1.7 }}>
            Effective date: <strong>2026-03-31</strong>. This is the public privacy policy for <strong>app.cognispark.tech</strong> and the Cognispark Android app.
          </p>
        </section>

        <section style={sectionGrid}>
          {sections.map((section) => (
            <article key={section.title} style={card}>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>{section.title}</h2>
              <p style={{ marginBottom: 0, lineHeight: 1.7 }}>{section.body}</p>
            </article>
          ))}
        </section>

        <section style={card}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>Contact</h2>
          <p style={{ lineHeight: 1.8 }}>
            Privacy requests: <a href={`mailto:${PRIVACY_EMAIL}`}>{PRIVACY_EMAIL}</a>
            <br />
            Support requests: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            <br />
            Account deletion requests: visit <strong>/delete-account</strong> on this site.
          </p>
          <p style={{ marginBottom: 0, lineHeight: 1.8 }}>
            Operator contact:
            <br />
            Cognispark
            <br />
            No. 2B Poultry Road, Owere-Eze Orba
            <br />
            Nsukka, Enugu State, Nigeria.
          </p>
        </section>
      </div>
    </main>
  );
}
