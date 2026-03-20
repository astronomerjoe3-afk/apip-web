import Link from "next/link";

import styles from "./home.module.css";

const highlightCards = [
  {
    label: "Mission flow",
    title: "Students see the route, not just the rule.",
    body: "Every lesson is staged with visuals, checks, simulations, and worked examples so the next move feels earned instead of guessed.",
  },
  {
    label: "Module depth",
    title: "Modules climb beyond the foundations.",
    body: "Learners move from first-contact understanding into richer graph reasoning, force systems, and energy-ledger planning.",
  },
  {
    label: "Instant feedback",
    title: "Wrong answers become steering, not dead ends.",
    body: "Cognispark explains what changed, what matters, and what to notice next so students keep momentum.",
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
            <h1 className={styles.heroTitle}>Make every module lesson feel like a launch students want to try.</h1>
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
                <span>Guided route</span>
                <strong>Visuals / Simulations / Mastery</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Built for students</span>
                <strong>Understand first, then calculate</strong>
              </article>
              <article className={styles.signalCard}>
                <span>Progress style</span>
                <strong>Clear missions with live feedback</strong>
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
