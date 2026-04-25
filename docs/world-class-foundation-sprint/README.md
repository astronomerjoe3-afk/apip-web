# Cognispark World-Class Foundation Sprint

Status: execution program v1  
Date: 2026-04-25  
Time horizon: 2 weeks for foundation sprint, 90 days for flagship proof

## Purpose

This execution program turns the public product audit into a concrete operating system for making Cognispark a world-class physics learning platform.

The immediate goal is not to beat every global platform on volume. The goal is to make Cognispark unmistakably best at one thing:

> diagnosing physics misconceptions and rebuilding intuition through interactive, mission-based learning.

## Current Position

Cognispark is a promising early-stage specialist platform. The public product already proves four important ideas:

- no-login concept tools can attract and qualify students
- mission language can make physics feel more approachable
- checkpoint feedback can target misconceptions instead of only marking answers
- a Foundation, Core, Advanced route can make the curriculum feel coherent

It is not yet in the same world tier as Khan Academy, PhET, Brilliant, Isaac Science, Pearson Mastering Physics, MIT OpenCourseWare, or OpenStax. The biggest gaps are proof, scale, teacher readiness, trust infrastructure, and measurable learning outcomes.

## Sprint North Star

Within 14 days, a new visitor should be able to:

- trust that Cognispark is a real education product
- try one polished public physics mission without friction
- understand the flagship learning method in under 3 minutes
- see a credible path from public tool to full student account
- understand what schools get beyond ordinary self-study

## 90-Day North Star

Within 90 days, Cognispark should have:

- one flagship module good enough to demo to schools
- a reusable mission schema for scaling new modules
- a misconception taxonomy and mastery model
- teacher dashboards that support assignment and intervention workflows
- analytics that show learning gain, retention, drop-off, and misconception repair
- a school pilot kit with measurable success criteria

## Document Map

- `01-product-teardown.md`: audit findings, scorecard, gaps, and immediate product priorities
- `02-competitor-matrix.md`: competitor benchmark and strategic wedge
- `03-prd-world-class-foundation-sprint.md`: product requirements for the 2-week sprint
- `04-curriculum-architecture.md`: curriculum structure and flagship module architecture
- `05-lesson-schema-and-misconception-model.md`: reusable mission, lesson, and feedback schema
- `06-simulation-components.md`: reusable interactive physics component specs
- `07-teacher-dashboard-and-analytics.md`: teacher dashboards, learner analytics, event model
- `08-seo-accessibility-playwright-qa.md`: trust, SEO, accessibility, and regression testing plan
- `09-school-pilot-materials.md`: school pilot package, outreach copy, pilot timeline, success metrics

## Two-Week Workstreams

### Workstream A: Trust And Public Surface

Owner: product and web  
Outcome: the public site feels credible enough for students, parents, and school leaders.

Deliverables:

- support identity cleanup plan
- school-facing trust block
- privacy, terms, deletion, support, and contact route review
- sitemap, robots, canonical, Open Graph, and manifest verification
- homepage proof section refined around actual product interactions

### Workstream B: Public Mission Funnel

Owner: learning product and frontend  
Outcome: the public mission becomes the best 3-minute proof of Cognispark.

Deliverables:

- one flagship graph mission polished end to end
- wrong-answer feedback tied to named misconceptions
- stronger result/debrief state after all checks
- account CTA that explains what unlocks next
- mobile pass for public mission and graph lab

### Workstream C: Mastery Model

Owner: learning science and backend  
Outcome: Cognispark can measure learning, not only completion.

Deliverables:

- misconception taxonomy for flagship M1
- mastery score definition
- spaced review trigger rules
- event names and payloads for checkpoints, retries, hints, and repairs
- teacher-facing mastery metric definitions

### Workstream D: Flagship Module Definition

Owner: curriculum and product  
Outcome: M1 Motion and Kinematics becomes the proof standard.

Deliverables:

- six-mission M1 blueprint
- lesson schema applied to each mission
- public demo slice selected
- simulation component backlog
- success metrics and pilot assessment items

## Day-By-Day Sprint Plan

| Day | Focus | Output |
| --- | --- | --- |
| 1 | Sprint kickoff and owner assignment | task board, decision log, release gate |
| 2 | Trust audit | support/privacy/terms/SEO issue list |
| 3 | Public mission teardown | exact UX, copy, feedback, mobile punch list |
| 4 | Mastery model v1 | mastery formula and misconception taxonomy |
| 5 | M1 flagship blueprint | six-mission scope and public demo slice |
| 6 | Public mission polish | improved mission completion and debrief spec |
| 7 | SEO and technical trust | sitemap, robots, manifest, metadata acceptance checks |
| 8 | Teacher dashboard requirements | class, assignment, intervention, and progress views |
| 9 | Analytics implementation spec | events, dashboards, weekly reporting |
| 10 | Accessibility pass | WCAG checklist and fix backlog |
| 11 | Playwright regression suite | public routes, mission flow, auth route smoke tests |
| 12 | Pilot materials | school one-pager, consent note, teacher guide |
| 13 | Release readiness | QA pass and pilot readiness review |
| 14 | Demo and retro | demo script, decision log, next 30-day backlog |

## Success Gates

The sprint is complete only when:

- public mission can be completed on desktop and mobile with no obvious overlap or blocked controls
- at least three wrong-answer paths identify a misconception and give a repair prompt
- `robots.txt`, `sitemap.xml`, canonical URL, Open Graph metadata, and manifest are verified in deployed environment
- support and privacy contact plan is owner-approved
- M1 flagship module spec is ready for implementation
- pilot materials are ready to send to one school or teacher cohort
- regression tests cover the public homepage, mission demo, graph lab, force builder, energy ledger, learn route, login, and registration

## Operating Cadence

- Daily 15-minute sprint check-in
- Twice-weekly product review against student experience
- Weekly teacher-readiness review
- End-of-sprint demo using the public mission flow

## Decision Rules

- If a feature does not improve learning clarity, trust, or measurable progress, defer it.
- If a feature cannot be explained to a school leader in one sentence, simplify it.
- If a public claim is not verifiable in the product, either prove it or soften it.
- If a metric cannot trigger a product or teaching decision, do not make it a dashboard headline.

