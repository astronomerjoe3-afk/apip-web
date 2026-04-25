# Product Teardown

Date audited: 2026-04-25  
Surface audited: public website and public no-login tools

## Scope

This teardown covers the public product surface:

- homepage
- graph lab
- force builder
- energy ledger
- public mission demo
- coverage explorer
- register and login public screens
- support, privacy, and delete-account pages

Logged-in student, teacher, institution, payment, and admin flows were not audited with authenticated credentials.

## Current Product Thesis

Cognispark is strongest when it behaves like a concept repair engine:

1. show the learner a physical situation
2. ask for a reasoning move
3. detect the likely misconception
4. correct the idea in plain physics language
5. carry the weakness into review or teacher insight

This is the wedge that can differentiate Cognispark from large content libraries.

## Scorecard

| Dimension | Current Rating | Notes |
| --- | --- | --- |
| Pedagogical clarity | 7/10 | Public mission and labs explain graph, force, and energy reasoning well. |
| Interactivity | 6/10 | Strong early no-login tools, but much smaller library than PhET or Brilliant. |
| Feedback quality | 7/10 | Wrong-answer responses are more useful than ordinary quiz feedback. |
| Curriculum breadth | 6/10 | Public route claims 30 modules, but only limited depth is publicly proven. |
| Teacher readiness | 4/10 | School/institution promise exists, but dashboards and adoption proof need stronger evidence. |
| Trust and credibility | 5/10 | Privacy/delete/support exist, but personal email addresses and missing deployed SEO assets weaken trust. |
| Accessibility | 5/10 | Good semantic structure in parts, but needs formal keyboard, contrast, label, motion, and screen-reader audit. |
| Measurement | 4/10 | Progress and mastery are promised, but public analytics model is not visible. |
| Global competitiveness | 3/10 | Early-stage specialist with a strong wedge, not yet a global category leader. |

## Verified Strengths

- Public no-login product proof exists.
- Public mission has concept-first scaffolding.
- Graph, force, and energy tools align with high-friction physics misconceptions.
- Public feedback does more than mark correct or incorrect.
- Homepage has real lesson screenshots and product proof sections.
- Registration screen includes password-strength guidance.
- Privacy and account deletion pages are present.
- Security headers are strong, including CSP, HSTS, frame protections, referrer policy, and permissions policy.

## Critical Gaps

### Trust Gaps

- Support and privacy use personal Gmail addresses.
- School-facing trust signals are not yet strong enough.
- Public claims need more evidence, especially around mastery tracking, institutional workflows, and module depth.
- Deployed `robots.txt`, `sitemap.xml`, and manifest should be verified because the live public check returned 404 during audit.

### Product Gaps

- Public mission is promising but should be treated as the conversion-grade flagship demo.
- Completion state should do more after all checks are solved: summarize mastery, name repaired misconceptions, and show the next best route.
- Public labs are conceptually strong but could feel more polished with richer state transitions, challenge levels, and saved progress prompts.
- Full curriculum map shows breadth, but not enough proof of depth.

### Learning Science Gaps

- Misconception categories are implied but not formalized.
- Mastery scoring needs a clear model that combines first attempt, retries, hint usage, confidence, and delayed review.
- Spaced review should be triggered by concept weakness, not just lesson completion.
- Teacher insights should explain what a student misunderstands, not only what they scored.

### School Adoption Gaps

- Teachers need assignment workflows, class progress, intervention lists, printable/exportable reports, and curriculum alignment.
- Pilot materials and efficacy evidence are not visible.
- Accessibility and privacy documentation should be school procurement ready.

## Highest-Leverage Fixes

| Priority | Fix | Why It Matters |
| --- | --- | --- |
| P0 | Make public mission the flagship proof flow | It is the fastest way to make the product credible. |
| P0 | Formalize misconception and mastery model | This creates a defensible learning advantage. |
| P0 | Verify deployed SEO/trust assets | Basic credibility and discoverability. |
| P1 | Replace personal support identity with domain-based support plan | Schools need institutional trust. |
| P1 | Create school pilot kit | Converts product promise into evidence. |
| P1 | Build teacher intervention dashboard spec | Turns student learning data into teacher value. |
| P2 | Add standards alignment pages | Helps school search and procurement. |
| P2 | Add public efficacy and methodology page | Builds trust with parents and schools. |

## 14-Day Definition Of Done

- Public mission has an improved final debrief and named misconception feedback paths.
- Public route map explains the flagship module and what is already fully available.
- Trust pages and support identity plan are owner-approved.
- SEO assets are deployed and verified.
- Accessibility checklist is converted into fix tickets.
- Playwright smoke tests cover all public learning routes.
- M1 flagship PRD and lesson schema are implementation ready.

