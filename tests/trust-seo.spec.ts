import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const indexedRoutes = [
  "/",
  "/mission-demo",
  "/graph-lab",
  "/force-builder",
  "/energy-ledger",
  "/learn",
  "/login",
  "/register",
  "/support",
  "/privacy",
  "/terms",
  "/delete-account",
  "/operations-guide",
];

test("robots.txt exposes the public trust contract", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  expect(body).toContain("User-Agent: *");
  expect(body).toContain("Sitemap: https://app.cognispark.tech/sitemap.xml");
  expect(body).toContain("Disallow: /api/");
  expect(body).toContain("Disallow: /student/");
  expect(body).toContain("Disallow: /dashboard/");
  expect(body).toContain("Disallow: /delete-account/request");
});

test("sitemap.xml includes public learning and trust routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  for (const route of indexedRoutes) {
    expect(body, `sitemap should include ${route}`).toContain(`https://app.cognispark.tech${route === "/" ? "" : route}`);
  }
});

test("manifest.webmanifest is available for installability and platform trust", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBeTruthy();

  const manifest = await response.json();
  expect(manifest.name).toBe("Cognispark Physics Learning Platform");
  expect(manifest.short_name).toBe("Cognispark");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons?.[0]?.src).toBe("/favicon.ico");
});

test("homepage publishes organization and learning-resource structured data", async ({ page }) => {
  await page.goto("/");

  const scripts = await page.locator("script[type='application/ld+json']").allTextContents();
  const joined = scripts.join("\n");

  expect(joined).toContain('"@type":"Organization"');
  expect(joined).toContain('"@type":"WebSite"');
  expect(joined).toContain('"@type":"LearningResource"');
  expect(joined).toContain("support@cognispark.tech");
});
