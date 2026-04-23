import type { Metadata } from "next";
import Link from "next/link";

import {
  MODULE_GROUP_ORDER,
  curriculumModules,
  curriculumModulesByGroup,
  type ModuleGroupKey,
} from "../../lib/moduleCurriculum";
import styles from "./learn.module.css";

export const metadata: Metadata = {
  title: "Physics Coverage Explorer",
  description:
    "Explore Cognispark's full physics route across Foundation, Core, and Advanced modules, from measurement and graphs to circuits, nuclear physics, and astrophysics.",
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    url: "/learn",
  },
};

const TRACK_DETAILS: Record<
  ModuleGroupKey,
  {
    eyebrow: string;
    title: string;
    summary: string;
    outcomes: string[];
  }
> = {
  foundation: {
    eyebrow: "Foundation",
    title: "Build first-contact understanding that does not collapse later.",
    summary:
      "Students begin with measurement, graphs, motion, energy, particles, waves, electricity, and the observable sky before the route becomes more demanding.",
    outcomes: [
      "Clear language for units, graphs, and physical meaning",
      "Introductory mechanics, energy, thermal ideas, and circuits",
      "Early Earth-space and observational physics",
    ],
  },
  corePhysics: {
    eyebrow: "Core route",
    title: "Move into the full school physics spine with stronger quantitative reasoning.",
    summary:
      "The core route expands into kinematics, equilibrium, energy transfer, thermal behaviour, optics, electrical analysis, radioactivity, and cosmology.",
    outcomes: [
      "Stronger graph reasoning and connected mechanics",
      "Wave, optics, electric, magnetic, and nuclear breadth",
      "A full path through Earth, stars, and the universe",
    ],
  },
  advancedPhysics: {
    eyebrow: "Advanced",
    title: "Step into higher-level physics without losing conceptual structure.",
    summary:
      "Advanced modules cover quantum phenomena, oscillations, electric and magnetic fields, induction, particle physics, gravitation, and cosmology.",
    outcomes: [
      "Advanced mechanics, materials, and thermal modelling",
      "Field theory, induction, capacitors, and power systems",
      "Quantum, particle, nuclear, and astrophysics progression",
    ],
  },
};

const COVERAGE_PILLARS = [
  "Measurement and representation",
  "Graphs and kinematics",
  "Forces and equilibrium",
  "Energy, work, and power",
  "Materials, pressure, and thermal physics",
  "Waves, light, and optics",
  "Electricity and magnetism",
  "Atomic, nuclear, and particle physics",
  "Earth, stars, gravitation, and cosmology",
];

const PATHWAY_STEPS = [
  {
    step: "01",
    title: "Start with what students can see",
    body: "Foundation modules anchor meaning first, so students do not enter later physics through memorised fragments.",
  },
  {
    step: "02",
    title: "Climb into connected school physics",
    body: "Core modules expand the route into mechanics, thermal behaviour, waves, circuits, radioactivity, and astronomy.",
  },
  {
    step: "03",
    title: "Push into deeper models and higher-level reasoning",
    body: "Advanced modules carry that structure into quantum ideas, fields, induction, oscillations, particle physics, and cosmology.",
  },
];

export default function LearnPage() {
  const groupedModules = curriculumModulesByGroup();
  const allModules = curriculumModules();
  const totalModules = allModules.length;
  const trackCount = MODULE_GROUP_ORDER.length;

  return (
    <main className={styles.page}>
      <section className={styles.heroShell}>
        <header className={styles.heroHeader}>
          <div>
            <p className={styles.eyebrow}>Physics coverage explorer</p>
            <h1>See the full physics route before students ever sign in.</h1>
            <p className={styles.heroText}>
              Cognispark is not a narrow mechanics shell. The platform already spans Foundation, Core, and Advanced
              physics, from measurement and graph meaning through circuits, nuclear physics, and astrophysics.
            </p>
          </div>

          <div className={styles.heroActions}>
            <Link className={styles.primaryCta} href="/graph-lab">
              Open graph lab
            </Link>
            <Link className={styles.secondaryCta} href="/mission-demo">
              Play a public mission
            </Link>
            <Link className={styles.ghostCta} href="/register">
              Create account
            </Link>
          </div>
        </header>

        <div className={styles.heroGrid}>
          <section className={styles.signalPanel}>
            <div className={styles.signalRow}>
              <article className={styles.signalCard}>
                <span>Total coverage</span>
                <strong>{totalModules} modules</strong>
                <p>One continuous route from first-contact understanding into higher-level physics.</p>
              </article>
              <article className={styles.signalCard}>
                <span>Track structure</span>
                <strong>{trackCount} public tracks</strong>
                <p>Foundation, Core, and Advanced make the climb visible instead of hiding it behind login.</p>
              </article>
              <article className={styles.signalCard}>
                <span>Breadth</span>
                <strong>{COVERAGE_PILLARS.length} major topic pillars</strong>
                <p>Motion, forces, energy, thermal physics, circuits, particles, astronomy, and more.</p>
              </article>
            </div>

            <div className={styles.pillarsPanel}>
              <p className={styles.sectionEyebrow}>What the route already covers</p>
              <div className={styles.pillars}>
                {COVERAGE_PILLARS.map((pillar) => (
                  <span key={pillar} className={styles.pillarChip}>
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.routeBoard}>
            <div className={styles.routeHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Route at a glance</p>
                <h2>From foundations into advanced physics.</h2>
              </div>
              <div className={styles.routeChip}>Public map</div>
            </div>

            <div className={styles.routeTracks}>
              {MODULE_GROUP_ORDER.map((groupKey) => {
                const modules = groupedModules[groupKey];
                const details = TRACK_DETAILS[groupKey];
                return (
                  <article key={groupKey} className={styles.routeTrack}>
                    <div className={styles.routeTrackHeader}>
                      <div>
                        <p className={styles.trackEyebrow}>{details.eyebrow}</p>
                        <h3>{modules.length} modules</h3>
                      </div>
                      <span className={styles.trackCode}>{details.eyebrow}</span>
                    </div>

                    <p className={styles.routeSummary}>{details.summary}</p>

                    <div className={styles.routeModulePreview}>
                      {modules.slice(0, 4).map((moduleMeta) => (
                        <span key={moduleMeta.id} className={styles.routeModuleChip}>
                          {moduleMeta.id} {moduleMeta.title}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>How the pathway works</p>
          <h2>Students do not jump straight into difficulty without a structure underneath it.</h2>
          <p>
            The route is designed to show progression clearly: first meaning, then connected school physics, then
            higher-level modelling and abstraction.
          </p>
        </div>

        <div className={styles.pathwayGrid}>
          {PATHWAY_STEPS.map((item) => (
            <article key={item.step} className={styles.pathwayCard}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {MODULE_GROUP_ORDER.map((groupKey) => {
        const modules = groupedModules[groupKey];
        const details = TRACK_DETAILS[groupKey];

        return (
          <section key={groupKey} className={`${styles.section} ${styles.trackSection}`}>
            <div className={styles.trackSectionHeader}>
              <div>
                <p className={styles.sectionEyebrow}>{details.eyebrow}</p>
                <h2>{details.title}</h2>
                <p>{details.summary}</p>
              </div>

              <aside className={styles.trackAside}>
                <span className={styles.trackCount}>{modules.length} modules</span>
                <ul>
                  {details.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </aside>
            </div>

            <div className={styles.moduleGrid}>
              {modules.map((moduleMeta) => (
                <article key={moduleMeta.id} className={styles.moduleCard}>
                  <div className={styles.moduleCode}>{moduleMeta.id}</div>
                  <div className={styles.moduleBody}>
                    <h3>{moduleMeta.title}</h3>
                    <p>{moduleMeta.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className={styles.finalBand}>
        <div>
          <p className={styles.sectionEyebrow}>Next move</p>
          <h2>Try one mission, then step into the full route.</h2>
          <p>
            Use the graph lab or public mission to feel Cognispark&apos;s teaching style, then create an account to move
            through the complete pathway.
          </p>
        </div>

        <div className={styles.finalActions}>
          <Link className={styles.primaryCta} href="/graph-lab">
            Open graph lab
          </Link>
          <Link className={styles.secondaryCta} href="/mission-demo">
            Play the mission
          </Link>
        </div>
      </section>
    </main>
  );
}
