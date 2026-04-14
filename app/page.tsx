import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Interactive Physics Learning Platform",
  description:
    "Cognispark helps students learn physics through guided missions, real lesson visuals, instant feedback, and clear progression from foundations to advanced modules.",
};

const highlightCards = [
  {
    label: "Lesson structure",
    title: "Students see what the concept means before they calculate it.",
    body: "Lessons are staged with visual setup, checks, simulations, and worked examples so the next move feels understandable instead of arbitrary.",
  },
  {
    label: "Coverage",
    title: "The route climbs from foundations into deeper physics.",
    body: "Students can move from first-contact understanding into graph reasoning, force systems, energy analysis, circuits, particles, and astrophysics.",
  },
  {
    label: "Feedback",
    title: "Wrong answers become steering, not dead ends.",
    body: "Cognispark explains what changed, what matters, and what to notice next so students keep their momentum.",
  },
];

const moduleCards = [
  {
    code: "M1",
    title: "Kinematics and graph meaning",
    body: "Read pace logs, slopes, and areas as physics meaning instead of disconnected graph tricks.",
    accent: "moduleBlue",
  },
  {
    code: "M2",
    title: "Forces, torque, and system thinking",
    body: "Track master arrows, action-reaction pairs, turning effect, and stability as one connected force world.",
    accent: "moduleAmber",
  },
  {
    code: "M3",
    title: "Energy stores and mission planning",
    body: "Plan long Lift-Launch missions with stores, hand-offs, leaks, power, efficiency, and ledger logic.",
    accent: "moduleGreen",
  },
];

const launchSteps = [
  {
    step: "01",
    title: "See it",
    body: "Meet the idea through a visual story before equations start crowding the page.",
  },
  {
    step: "02",
    title: "Try it",
    body: "Manipulate simulations, compare cases, and watch the important variables react live.",
  },
  {
    step: "03",
    title: "Lock it in",
    body: "Use feedback, worked examples, and mastery checks that push understanding instead of rote recall.",
  },
];

const institutionCards = [
  {
    label: "Institution admin",
    title: "Launch a school space without giving away platform control.",
    body: "Cognispark now supports institution accounts with seat-based onboarding, teacher setup, class organization, and school-scoped visibility.",
  },
  {
    label: "Teacher workflow",
    title: "Assign platform missions, custom tasks, and outside resources in one place.",
    body: "Teachers can build class work from Cognispark topics, add extra instructions, collect submissions, grade, and return feedback inside the same system.",
  },
  {
    label: "Student experience",
    title: "Keep class delivery and personal momentum on the same platform.",
    body: "Institutional students can join classes, submit coursework, review grades and feedback, and still participate in approved topic communities.",
  },
];

const proofScreens = [
  {
    src: "/lesson_assets/F1/F1_L1/videos/thumbnail.png",
    alt: "Cognispark foundation lesson on units and measurement",
    label: "Foundation screen",
    title: "Students see why units change meaning before they practise conversions.",
    body: "This is a real lesson screen from F1, where the platform turns a bare number into an actual physical statement.",
  },
  {
    src: "/lesson_assets/M1/M1_L1/videos/thumbnail.png",
    alt: "Cognispark Motion and Kinematics lesson screen",
    label: "Core module screen",
    title: "Distance-time graphs are taught as records of motion, not picture puzzles.",
    body: "The platform uses mission language and visual framing so graph interpretation becomes conceptual before it becomes procedural.",
  },
  {
    src: "/lesson_assets/M2/M2_L1/videos/thumbnail.png",
    alt: "Cognispark Forces and Equilibrium lesson screen",
    label: "Mechanics screen",
    title: "Forces are separated from motion state so Newtonian reasoning starts cleanly.",
    body: "Learners get clearer distinctions, less formula blur, and a stronger base for later problem solving.",
  },
];

const sampleMission = [
  {
    step: "01",
    title: "Set the meaning first",
    body: "Open with one visual idea that makes the concept legible before the worked example begins.",
  },
  {
    step: "02",
    title: "Stress the misconception",
    body: "Call out the trap explicitly so students know what not to confuse while they learn the right mental model.",
  },
  {
    step: "03",
    title: "Lock it with feedback",
    body: "Use checks, feedback, and worked examples to turn the concept into something students can actually reuse.",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.heroShell}>
        <header className={styles.navbar}>
          <div className={styles.brandCluster}>
            <div className={styles.brandMark}>C</div>
            <div>
              <p className={styles.brandName}>Cognispark</p>
              <p className={styles.brandTag}>Physics, mission by mission.</p>
            </div>
          </div>

          <div className={styles.navActions}>
            <Link className={styles.navLink} href="/login">
              Login
            </Link>
            <Link className={styles.navButton} href="/register">
              Create account
            </Link>
          </div>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Interactive physics that feels like progress</p>
            <h1 className={styles.heroTitle}>Make every module lesson feel like a mission students want to start.</h1>
            <p className={styles.heroText}>
              Cognispark turns physics into guided missions with visuals, simulations, instant feedback, and a clear route from foundational understanding into higher-level module challenges.
            </p>

            <div className={styles.ctaRow}>
              <Link className={styles.primaryCta} href="/register">
                Start your first mission
              </Link>
              <Link className={styles.secondaryCta} href="#mission-map">
                Explore the module map
              </Link>
            </div>

            <div className={styles.signalRow}>
              <article className={styles.signalCard}>
                <span>Coverage</span>
                <strong>30 modules across Foundation, Core, and Advanced</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Lesson proof</span>
                <strong>Real lesson visuals already inside the platform</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Learning model</span>
                <strong>Mission flow, feedback, and mastery tracking</strong>
              </article>
            </div>
          </div>

          <div className={styles.heroPreview}>
            <div className={styles.previewAura} />
            <section className={styles.launchBoard}>
              <div className={styles.boardHeader}>
                <div>
                  <p className={styles.boardEyebrow}>Mission launch board</p>
                  <h2>Physics stops feeling flat when students can see the climb.</h2>
                </div>
                <div className={styles.boardChip}>Live route</div>
              </div>

              <div className={styles.missionStack}>
                <article className={`${styles.missionCard} ${styles.foundationCard}`}>
                  <span className={styles.missionLabel}>Foundation ramp</span>
                  <strong>Build confidence with guided warm-up lessons</strong>
                  <p>Clear visuals, slower pacing, and direct corrections set up the deeper modules.</p>
                </article>

                <article className={`${styles.missionCard} ${styles.moduleFocusCard}`}>
                  <div className={styles.missionCode}>M3</div>
                  <div>
                    <span className={styles.missionLabel}>Featured module</span>
                    <strong>Energy ledger missions</strong>
                    <p>Plan stores, hand-offs, leaks, and targets like a real physics mission instead of a formula chase.</p>
                  </div>
                </article>

                <div className={styles.miniGrid}>
                  <article className={styles.metricTile}>
                    <span>Mission style</span>
                    <strong>Stepwise and visual</strong>
                  </article>
                  <article className={styles.metricTile}>
                    <span>Student feel</span>
                    <strong>Less stress, more traction</strong>
                  </article>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.proofSection}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Product proof</p>
          <h2>Show the real lesson experience, not just the promise around it.</h2>
          <p>
            These are actual Cognispark lesson screens. The product earns trust faster when students and schools can see the interface, the explanation style, and the learning shape before signup.
          </p>
        </div>

        <div className={styles.proofGrid}>
          {proofScreens.map((screen) => (
            <figure key={screen.src} className={styles.proofCard}>
              <div className={styles.proofImageFrame}>
                <Image src={screen.src} alt={screen.alt} width={1365} height={768} className={styles.proofImage} />
              </div>
              <figcaption className={styles.proofCaption}>
                <span>{screen.label}</span>
                <h3>{screen.title}</h3>
                <p>{screen.body}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={styles.sampleMissionBand}>
          <div className={styles.sampleMissionHeader}>
            <p className={styles.sectionEyebrow}>Sample mission preview</p>
            <h3>What one strong mission should feel like inside Cognispark.</h3>
            <p>
              The fastest way to prove quality is to show one concrete mission arc from concept setup to misconception repair to mastery.
            </p>
          </div>

          <div className={styles.sampleMissionSteps}>
            {sampleMission.map((item) => (
              <article key={item.step} className={styles.sampleMissionStep}>
                <span>{item.step}</span>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="mission-map">
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Why students stay with it</p>
          <h2>Designed to pull learners forward instead of leaving them to guess.</h2>
          <p>
            The experience is built to make the next lesson feel achievable, interesting, and worth clicking into.
          </p>
        </div>

        <div className={styles.highlightGrid}>
          {highlightCards.map((card) => (
            <article key={card.title} className={styles.highlightCard}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.modulesSection}`}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Module spotlight</p>
          <h2>Deeper lessons, stronger visuals, and richer physics stories.</h2>
          <p>
            Students do not just unlock harder numbers. They unlock more deliberate reasoning across motion, forces, and energy.
          </p>
        </div>

        <div className={styles.moduleGrid}>
          {moduleCards.map((card) => (
            <article key={card.code} className={`${styles.moduleCard} ${styles[card.accent]}`}>
              <div className={styles.moduleCode}>{card.code}</div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <Link href="/register">Try this mission track</Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>How the launch feels</p>
          <h2>A cleaner start for students who are tired of memorizing without understanding.</h2>
        </div>

        <div className={styles.stepGrid}>
          {launchSteps.map((item) => (
            <article key={item.step} className={styles.stepCard}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>For Schools And Organizations</p>
          <h2>Bring Cognispark into classrooms with an institutional layer built on top of the mission platform.</h2>
          <p>
            Schools can subscribe by student volume, onboard teachers, run classes, assign work, track performance, and keep discussion scoped to the right learners.
          </p>
        </div>

        <div className={styles.highlightGrid}>
          {institutionCards.map((card) => (
            <article key={card.title} className={styles.highlightCard}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>

        <div className={styles.ctaRow} style={{ marginTop: 32 }}>
          <Link className={styles.primaryCta} href="/login?next=/institution">
            School team login
          </Link>
          <Link className={styles.secondaryCta} href="/register">
            Create student account
          </Link>
        </div>
      </section>

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Ready to launch</p>
          <h2>Start the first mission and let the modules do the persuading.</h2>
          <p>
            Students see the structure, feel the momentum, and keep moving because the page promises a better way to learn before the first lesson even begins.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link className={styles.primaryCta} href="/register">
            Create account
          </Link>
          <Link className={styles.secondaryCta} href="/login">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
