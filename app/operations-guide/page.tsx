
const ADMIN_SECTIONS = [
  {
    id: "admin-dashboard",
    product: "Admin dashboard",
    title: "Operations workspace header",
    route: "/dashboard",
    screenshot: "Capture the dashboard hero and the first admin control-room card immediately after signing in as an admin.",
    purpose: "Use this area to confirm you are on the right account before making any operational change.",
    actions: [
      "Check the signed-in email, UID, and role claim.",
      "Use Refresh access if anything looks stale.",
      "Open this guide from the toolbar whenever a new admin needs orientation.",
    ],
  },
  {
    id: "admin-health",
    product: "Admin dashboard",
    title: "System health and platform posture",
    route: "/dashboard",
    screenshot: "Capture the Total keys, Active keys, Auto-disabled, and Blocked requests cards together with the System health panel.",
    purpose: "Read this section before touching credentials so you know whether the platform is healthy or already under strain.",
    actions: [
      "Click Reload metrics at the start of each session.",
      "Treat a rise in auto-disabled keys or blocked requests as a containment-first situation.",
      "Only move on to key creation when the health summary looks calm.",
    ],
  },
  {
    id: "admin-create-key",
    product: "Admin dashboard",
    title: "Create a narrowly scoped API key",
    route: "/dashboard",
    screenshot: "Capture the Key creation panel with label, scopes, window limit, bucket seconds, and daily limit fields visible.",
    purpose: "Create the smallest safe key possible so every integration stays traceable and rate-limited.",
    actions: [
      "Use a label that names the owner and purpose.",
      "Keep scopes narrow and align limits to the real use case.",
      "Copy the one-time secret immediately into a secure vault.",
    ],
  },
  {
    id: "admin-inventory",
    product: "Admin dashboard",
    title: "Key inventory and incident response",
    route: "/dashboard",
    screenshot: "Capture the Key inventory search area, selected key details, and action buttons in one frame.",
    purpose: "This is the section you use when a key must be inspected, disabled, or rehabilitated quickly.",
    actions: [
      "Search by label, key ID, or scope.",
      "Disable a suspicious key before investigating further.",
      "Use Reset counters only after the incident is understood.",
    ],
  },
  {
    id: "admin-playbook",
    product: "Admin dashboard",
    title: "Admin playbook and protected tasks",
    route: "/dashboard",
    screenshot: "Capture the Admin playbook and Protected tasks cards together because they define the boundary of safe browser-based administration.",
    purpose: "Use these panels to separate routine dashboard work from privileged backend tasks such as role changes and content seeding.",
    actions: [
      "Keep live operations in the dashboard.",
      "Use secure backend scripts for identity, role, and seeding tasks.",
      "Treat this section as the policy boundary for admin operations.",
    ],
  },
] as const;

const INSTRUCTOR_SECTIONS = [
  {
    id: "instructor-overview",
    product: "Instructor workspace",
    title: "Teaching studio header and cohort command center",
    route: "/instructor",
    screenshot: "Capture the instructor hero, identity cards, and Cohort command center summary cards in one image.",
    purpose: "This is the instructor's start-of-day view: it shows cohort pulse, average mastery, dropout risk, cognitive load watch, and average engagement.",
    actions: [
      "Confirm the module in view.",
      "Look at cohort pulse before drilling into individuals.",
      "Use the module field to switch the analytics lens when another module is being taught.",
    ],
  },
  {
    id: "instructor-map",
    product: "Instructor workspace",
    title: "Cohort misconception map",
    route: "/instructor",
    screenshot: "Capture the misconception map with at least three visible bars so the spread and pressure cues are readable.",
    purpose: "This section shows which concepts are blocking the largest share of the class and how strongly those misconceptions interfere with transfer.",
    actions: [
      "Prioritize the widest bars first when choosing reteach topics.",
      "Use peak and pressure together rather than relying on one signal.",
      "Convert the top misconception into the next opening activity or worked example.",
    ],
  },
  {
    id: "instructor-roster",
    product: "Instructor workspace",
    title: "Class management tools and student spotlight",
    route: "/instructor",
    screenshot: "Capture the roster list on the left and one selected Student spotlight panel on the right.",
    purpose: "This view lets an instructor search, filter, spotlight a learner, inspect lesson snapshots, and assign a support move without leaving the page.",
    actions: [
      "Filter by readiness when triaging the class.",
      "Open one student at a time and read the risk reason before assigning a support move.",
      "Use Monitor, Reteach, Office hours, and Celebrate as planning tags for the next teaching cycle.",
    ],
  },
] as const;
const EXTRA_INSTRUCTOR_SECTIONS = [
  {
    id: "instructor-insights",
    product: "Instructor workspace",
    title: "Engagement and performance analytics",
    route: "/instructor",
    screenshot: "Capture the Readiness breakdown, Assignment auto-grading, Lesson hotspots, and Students gaining traction panels together.",
    purpose: "This section helps you decide whether the class needs reteaching, extension, or a reorganization of the next lesson run.",
    actions: [
      "Compare diagnostic and transfer averages to judge whether learning is transferring.",
      "Use Lesson hotspots to target the next reteach block.",
      "Use Students gaining traction to identify peer coaches or extension candidates.",
    ],
  },
  {
    id: "instructor-risk",
    product: "Instructor workspace",
    title: "Predictive dropout risk and cognitive load monitoring",
    route: "/instructor",
    screenshot: "Capture the right sidebar with the Predictive dropout risk, Cognitive load monitoring, and Class management summary cards.",
    purpose: "This is the instructor's intervention queue. It highlights students at risk of disengaging and those showing signs of overload.",
    actions: [
      "Work the high-risk queue first.",
      "Then check the heavy-load queue for students who may need task simplification or pacing support.",
      "Use the class management summary as the end-state for today's follow-up plan.",
    ],
  },
  {
    id: "instructor-content",
    product: "Instructor workspace",
    title: "Easy content upload and organisation",
    route: "/instructor",
    screenshot: "Capture the content staging form and at least one queued item with its section, tag, and status.",
    purpose: "Use this panel to stage lesson visuals, notes, and assessment assets before formal review or publishing.",
    actions: [
      "Group uploads by section so the next teaching pack stays coherent.",
      "Use tags such as Priority reteach or Extension.",
      "Mark items sorted only after you have checked their placement in the upcoming pack.",
    ],
  },
] as const;

const DAILY_CHECKLIST = [
  {
    title: "Daily start-of-day routine",
    items: [
      "Open /dashboard as an admin and reload metrics before changing anything.",
      "Open /instructor and check cohort pulse, predictive dropout risk, and cognitive load watch.",
      "Write down the top misconception and the top two at-risk learners for same-day follow-up.",
    ],
  },
  {
    title: "Before class or intervention",
    items: [
      "Use Lesson hotspots and the misconception map to choose one teaching focus.",
      "Open the roster spotlight for any learner on today's watch list.",
      "Tag the planned moves: Monitor, Reteach, Office hours, or Celebrate.",
    ],
  },
  {
    title: "End-of-day closeout",
    items: [
      "Review the high-risk and heavy-load queues one more time.",
      "Stage any new visuals, worked examples, or remediation assets in the content panel.",
      "Log off and leave key management only to named admins.",
    ],
  },
] as const;

const WEEKLY_CHECKLIST = [
  "Audit key inventory for stale, unknown, or auto-disabled credentials.",
  "Review lesson hotspots across the full module, not just the current lesson.",
  "Spot students who are gaining traction and plan extension work for them.",
  "Review whether engagement time and mastery are moving together or drifting apart.",
] as const;

const INCIDENT_RULES = [
  "If a key is suspicious, disable first and investigate second.",
  "If the cohort pulse worsens suddenly, inspect the misconception map and risk queue before changing content.",
  "If analytics look stale, reload before making a teaching decision.",
] as const;

type GuideSection = {
  id: string;
  product: string;
  title: string;
  route: string;
  screenshot: string;
  purpose: string;
  actions: readonly string[];
};
const ALL_INSTRUCTOR_SECTIONS: GuideSection[] = [...INSTRUCTOR_SECTIONS, ...EXTRA_INSTRUCTOR_SECTIONS];

function SectionCard(props: { section: GuideSection }) {
  const { section } = props;

  return (
    <article className="admin-card" id={section.id}>
      <div className="admin-section-header">
        <div>
          <p className="admin-kicker">{section.product}</p>
          <h2 className="admin-section-subtitle">{section.title}</h2>
          <p className="admin-section-copy" style={{ marginTop: "0.55rem" }}>{section.purpose}</p>
        </div>
        <div className="admin-chip-list">
          <span className="admin-chip">Route {section.route}</span>
          <span className="admin-chip">Training asset</span>
        </div>
      </div>

      <div className="admin-empty-state" style={{ marginTop: "1rem", borderStyle: "dashed", background: "rgba(232, 238, 252, 0.45)" }}>
        <strong>Screenshot slot</strong>
        <p className="admin-section-copy" style={{ marginTop: "0.45rem" }}>{section.screenshot}</p>
      </div>

      <div className="admin-step-list" style={{ marginTop: "1rem" }}>
        {section.actions.map((item) => (
          <div className="admin-step-card" key={item}>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
export default function OperationsGuidePage() {
  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="admin-section-header">
          <div>
            <p className="dashboard-eyebrow">Operations guide</p>
            <h1 className="dashboard-title">Admin and instructor walkthrough</h1>
            <p className="dashboard-subtitle">
              This guide turns the live Cognispark control rooms into a trainable routine. Each section includes the exact screen to capture, what the section is for, and what to do there day to day.
            </p>
          </div>
          <div className="admin-toolbar">
            <a className="admin-btn admin-btn-secondary" href="/dashboard">Back to dashboard</a>
            <a className="admin-btn admin-btn-primary" href="/instructor">Open instructor workspace</a>
          </div>
        </div>

        <div className="admin-notice admin-notice-info" style={{ marginTop: "1rem" }}>
          <strong>About the screenshot boxes</strong>
          <p className="admin-section-copy">
            I could not reliably capture authenticated browser screenshots from this terminal, so each section includes an exact screenshot prompt you can follow while building your training deck or handbook.
          </p>
        </div>
      </section>

      <section className="admin-card" style={{ marginTop: "1.5rem" }}>
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">How to use this guide</p>
            <h2 className="admin-section-subtitle">Train with the live screen beside the checklist</h2>
          </div>
        </div>
        <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
          <div className="admin-subpanel">
            <strong>For onboarding</strong>
            <p className="admin-section-copy" style={{ marginTop: "0.5rem" }}>
              Walk a new admin or instructor through each section in order and pause after each screenshot slot to confirm they know what decisions belong there.
            </p>
          </div>
          <div className="admin-subpanel">
            <strong>For documentation</strong>
            <p className="admin-section-copy" style={{ marginTop: "0.5rem" }}>
              Use the screenshot prompts to capture a clean handbook. One screenshot per section is enough if the heading and main controls are visible.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <div className="admin-section-header" style={{ marginBottom: "1rem" }}>
          <div>
            <p className="admin-kicker">Section by section</p>
            <h2 className="admin-section-title">Admin dashboard walkthrough</h2>
          </div>
        </div>
        <div className="admin-stack">
          {ADMIN_SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <section style={{ marginTop: "1.5rem" }}>
        <div className="admin-section-header" style={{ marginBottom: "1rem" }}>
          <div>
            <p className="admin-kicker">Section by section</p>
            <h2 className="admin-section-title">Instructor workspace walkthrough</h2>
          </div>
        </div>
        <div className="admin-stack">
          {ALL_INSTRUCTOR_SECTIONS.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>

      <section className="admin-card" style={{ marginTop: "1.5rem" }}>
        <div className="admin-section-header">
          <div>
            <p className="admin-kicker">Daily use</p>
            <h2 className="admin-section-title">Operating checklist</h2>
            <p className="admin-section-copy">Use this as the real-world rhythm for running the site and the classroom side of the platform.</p>
          </div>
        </div>

        <div className="admin-panel-grid" style={{ marginTop: "1rem" }}>
          {DAILY_CHECKLIST.map((block) => (
            <article className="admin-subpanel" key={block.title}>
              <strong>{block.title}</strong>
              <ul className="admin-bullet-list" style={{ marginTop: "0.7rem", paddingLeft: "1.1rem" }}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
          <article className="admin-subpanel">
            <strong>Weekly review</strong>
            <ul className="admin-bullet-list" style={{ marginTop: "0.7rem", paddingLeft: "1.1rem" }}>
              {WEEKLY_CHECKLIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="admin-notice admin-notice-warning" style={{ marginTop: "1rem" }}>
          <strong>Incident rules</strong>
          <ul className="admin-bullet-list" style={{ marginTop: "0.6rem", paddingLeft: "1.1rem" }}>
            {INCIDENT_RULES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
