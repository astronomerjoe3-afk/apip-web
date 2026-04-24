import type { Metadata } from "next";
import Link from "next/link";

import PublicMissionClient from "./PublicMissionClient";
import styles from "./missionDemo.module.css";

export const metadata: Metadata = {
  title: "Public Physics Mission Demo",
  description:
    "Try a public Cognispark mission with live graph reasoning, instant feedback, and a clearer way to learn motion concepts before signup.",
  alternates: {
    canonical: "/mission-demo",
  },
  openGraph: {
    url: "/mission-demo",
    title: "Cognispark public mission demo",
    description:
      "A no-login physics mission that shows how Cognispark teaches graph meaning through interaction and feedback.",
  },
};

const missionSignals = [
  {
    label: "Mission type",
    value: "Graph meaning before equations",
  },
  {
    label: "Public access",
    value: "No login required for the first interaction",
  },
  {
    label: "Full route",
    value: "Foundation, Core, and Advanced missions unlock after signup",
  },
];

const whyItWorks = [
  {
    title: "Meaning first",
    body: "Students meet the graph as a record of motion, not as a shape to memorize.",
  },
  {
    title: "Targeted feedback",
    body: "The feedback targets the likely wrong idea instead of only marking the answer wrong.",
  },
  {
    title: "Next-step energy",
    body: "Every result points naturally toward the full Cognispark lesson path instead of stopping at one quiz.",
  },
];

export default function MissionDemoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroNav}>
          <Link href="/" className={styles.homeLink}>
            Cognispark
          </Link>
          <div className={styles.heroNavActions}>
          <Link href="/login" className={styles.navLink} prefetch={false}>
            Login
          </Link>
          <Link href="/register" className={styles.navButton} prefetch={false}>
            Create account
          </Link>
          </div>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Public mission demo</p>
            <h1>Show the physics lesson, not just the promise around it.</h1>
            <p className={styles.heroText}>
              This open mission lets students feel Cognispark&apos;s teaching model before signup: visual setup, graph
              meaning, targeted correction, and a clear next move.
            </p>

            <div className={styles.heroActions}>
              <a href="#play-mission" className={styles.primaryButton}>
                Play the mission
              </a>
              <Link href="/energy-ledger" className={styles.secondaryButton}>
                Plan energy ledgers
              </Link>
              <Link href="/force-builder" className={styles.secondaryButton}>
                Build force systems
              </Link>
              <Link href="/graph-lab" className={styles.secondaryButton}>
                Open graph lab
              </Link>
            </div>

            <div className={styles.heroSignals}>
              {missionSignals.map((signal) => (
                <article key={signal.label} className={styles.signalItem}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.heroBoard}>
            <p className={styles.boardEyebrow}>Why this mission exists</p>
            <h2>The fastest way to trust a learning platform is to try one real thinking move inside it.</h2>
            <div className={styles.boardList}>
              {whyItWorks.map((item, index) => (
                <article key={item.title} className={styles.boardItem}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="play-mission">
        <PublicMissionClient />
      </div>

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Next step</p>
          <h2>Keep the momentum and open the full Cognispark pathway.</h2>
          <p>
            The public mission proves the teaching style. The full platform adds progression, richer lessons, account
            memory, feedback history, and the rest of the physics route.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link href="/register" className={styles.primaryButton} prefetch={false}>
            Create account
          </Link>
          <Link href="/energy-ledger" className={styles.secondaryButton}>
            Plan energy ledgers
          </Link>
          <Link href="/force-builder" className={styles.secondaryButton}>
            Build force systems
          </Link>
          <Link href="/graph-lab" className={styles.secondaryButton}>
            Open graph lab
          </Link>
        </div>
      </section>
    </main>
  );
}
