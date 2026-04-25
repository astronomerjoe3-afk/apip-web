# SEO, Accessibility, And Playwright QA

## Trust And SEO Fixes

### Deployment Verification Checklist

Verify these against the deployed production domain:

- `https://app.cognispark.tech/robots.txt`
- `https://app.cognispark.tech/sitemap.xml`
- `https://app.cognispark.tech/manifest.webmanifest` or generated manifest route
- canonical URLs are absolute
- Open Graph image resolves
- title and description exist on public routes
- public routes return 200
- private routes redirect or gate correctly

### Metadata Requirements

Each public learning route should have:

- unique title
- unique meta description
- absolute canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter card metadata

Priority routes:

- `/`
- `/mission-demo`
- `/graph-lab`
- `/force-builder`
- `/energy-ledger`
- `/learn`
- `/register`
- `/login`
- `/support`
- `/privacy`
- `/terms`
- `/delete-account`

### Structured Data

Add JSON-LD for:

- `Organization`
- `WebSite`
- `Course` for flagship M1
- `LearningResource` for public labs
- `FAQPage` for school support questions

## Accessibility Audit

### WCAG-Oriented Checklist

Keyboard:

- all buttons, tabs, sliders, links, and mission controls are reachable
- focus order follows visual order
- focus indicator is visible
- no keyboard trap

Screen reader:

- headings are nested correctly
- graph and simulation components have text alternatives
- buttons have descriptive accessible names
- feedback state changes are announced
- tab panels use correct ARIA patterns

Visual:

- text contrast passes WCAG AA
- button text does not clip on mobile
- graph labels are readable on small screens
- layout works at 320px width
- no hover-only critical information

Motion:

- animated replays respect reduced-motion settings
- no flashing or rapid motion that could trigger discomfort

Forms:

- inputs have labels
- autocomplete is configured where appropriate
- error messages are tied to fields
- password requirements are announced clearly

## Playwright Regression Plan

### Public Route Smoke Tests

Test:

- route returns 200
- page title exists
- primary heading visible
- no console errors
- primary CTA visible

Routes:

- `/`
- `/mission-demo`
- `/graph-lab`
- `/force-builder`
- `/energy-ledger`
- `/learn`
- `/register`
- `/login`
- `/support`
- `/privacy`
- `/terms`
- `/delete-account`

### Public Mission Flow Test

Steps:

1. open `/mission-demo`
2. verify graph is visible
3. answer first checkpoint incorrectly
4. verify targeted correction appears
5. answer first checkpoint correctly
6. answer remaining checkpoints
7. verify completion state and next CTA

### Public Lab Flow Tests

Graph lab:

- switch each mode tab
- adjust sliders
- submit one checkpoint
- verify feedback

Force builder:

- switch each mode
- adjust force controls
- submit one checkpoint
- verify resultant or concept output changes

Energy ledger:

- switch each mode
- adjust ledger controls
- submit one checkpoint
- verify balance or feedback state

### Mobile Visual Checks

Viewports:

- 390 x 844
- 360 x 740
- 768 x 1024
- 1366 x 768

Screenshots:

- homepage hero
- public mission checkpoint area
- graph lab controls and board
- force builder controls and board
- energy ledger controls and board
- registration form
- login form

Fail on:

- overlapping text
- clipped buttons
- inaccessible primary controls
- horizontal overflow
- hidden feedback

## Suggested Test File Structure

```text
tests/
  public-routes.spec.ts
  public-mission.spec.ts
  public-labs.spec.ts
  mobile-visual.spec.ts
  accessibility-smoke.spec.ts
```

## Release Gate

The public foundation release should not ship unless:

- route smoke tests pass
- mission flow test passes
- top mobile screenshots are reviewed
- no console errors appear on public routes
- critical accessibility violations are fixed or documented with owner and date

