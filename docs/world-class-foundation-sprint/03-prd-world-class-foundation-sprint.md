# PRD: World-Class Foundation Sprint

## Summary

Build a 2-week foundation release that makes Cognispark more trustworthy, more measurable, and more clearly differentiated around concept-first physics learning.

## Problem

Cognispark has promising public tools and a coherent mission-based learning idea, but the current public surface does not yet prove world-class quality strongly enough.

The platform needs:

- a stronger public proof flow
- a measurable mastery model
- a flagship module definition
- school-ready trust and pilot materials
- regression tests and accessibility checks

## Goals

- Improve public trust and conversion readiness.
- Make the public mission demo the strongest proof of Cognispark's teaching method.
- Define a reusable mastery and misconception model.
- Define the flagship M1 Motion and Kinematics build.
- Prepare teacher dashboards and pilot materials for school conversations.

## Non-Goals

- Rebuild the entire 30-module route in 2 weeks.
- Add a general-purpose AI tutor without guardrails.
- Launch full LMS replacement features before teacher workflows are validated.
- Claim learning impact before pilot evidence exists.

## Personas

### Student

Needs:

- understand physics without feeling lost
- get feedback that explains the mistake
- see progress and know what to do next

Success:

- completes public mission
- understands one misconception better
- signs up or continues to another public lab

### Teacher

Needs:

- assign targeted work
- see who is stuck and why
- reduce marking time without losing insight

Success:

- can identify class misconceptions
- can assign a mission or review set
- can export or share progress evidence

### School Leader

Needs:

- trust the product is safe, serious, and supportable
- understand the curriculum fit
- see proof of impact

Success:

- agrees to a pilot
- understands support, privacy, and data handling
- sees clear teacher value

## Requirements

### R1: Public Trust Foundation

Acceptance criteria:

- support, privacy, delete-account, and terms pages are reviewed for school readiness
- public support and privacy identity plan is documented
- deployed `robots.txt`, `sitemap.xml`, canonical URLs, Open Graph, favicon, and manifest are verified
- homepage copy avoids claims that are not demonstrable

### R2: Public Mission Funnel

Acceptance criteria:

- public mission has a clear start, active learning loop, completion state, and next step
- each wrong answer maps to a named misconception
- final debrief summarizes what the learner mastered and what to try next
- mobile viewport has no overlapping controls or clipped primary actions
- mission route has Playwright regression coverage

### R3: Mastery Model V1

Acceptance criteria:

- each checkpoint records concept, skill, misconception, attempt count, hint use, answer state, and time
- mastery score combines correctness, retry pattern, hint use, and delayed review
- review queue rules are documented
- teacher-facing metrics are named and defined

### R4: Flagship M1 Blueprint

Acceptance criteria:

- M1 has six mission specs
- each mission has target concepts, misconceptions, interactions, checks, and mastery events
- one public demo slice is selected
- all future M1 content uses the shared lesson schema

### R5: Teacher Dashboard Definition

Acceptance criteria:

- dashboard views are defined for class overview, assignment progress, misconception heatmap, student profile, and intervention queue
- analytics events required for those views are specified
- pilot teacher workflow is documented from class setup to weekly review

### R6: QA And Accessibility

Acceptance criteria:

- public route smoke tests exist
- mission completion flow test exists
- mobile screenshot checks exist for homepage, mission, graph lab, force builder, energy ledger, learn, register, and login
- accessibility checklist covers keyboard, focus, labels, contrast, reduced motion, semantic headings, and screen-reader behavior

## Metrics

### Product Metrics

- public mission start rate
- public mission completion rate
- CTA click rate after mission completion
- graph lab to registration click rate
- mobile completion rate

### Learning Metrics

- first-attempt correctness by checkpoint
- retry success rate
- misconception repair rate
- hint use rate
- delayed review success rate
- mastery gain per mission

### Teacher Metrics

- assignment completion rate
- class misconception concentration
- number of students needing intervention
- average time to identify weakest concept
- weekly teacher active use

## Release Gates

Do not mark the sprint complete until:

- public mission and top public routes pass regression tests
- SEO/trust assets are verified in deployed environment
- M1 flagship spec is complete enough for implementation
- school pilot materials are ready to send
- analytics events are documented and implementation-ready

## Open Decisions

- Which domain-based support inboxes will be active before school pilots?
- Which standards alignment comes first: GCSE/IGCSE, AP Physics 1, NGSS, or local school syllabus?
- Will pilot schools use direct student accounts, institution tenants, or teacher-created class codes?
- What age range is the first flagship pilot targeting?

