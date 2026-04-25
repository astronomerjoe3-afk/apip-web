import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  { path: "/", heading: /make every module lesson feel like a mission/i },
  { path: "/mission-demo", heading: /show the physics lesson/i },
  { path: "/graph-lab", heading: /use graph meaning/i },
  { path: "/force-builder", heading: /build the force story/i },
  { path: "/energy-ledger", heading: /track where the energy goes/i },
  { path: "/learn", heading: /see the full physics route/i },
  { path: "/register", heading: /create account|start with structure/i },
  { path: "/login", heading: /login|sign in|come back to the mission route/i },
  { path: "/support", heading: /cognispark support/i },
  { path: "/privacy", heading: /cognispark handles learning/i },
  { path: "/terms", heading: /cognispark terms/i },
  { path: "/delete-account", heading: /account deletion/i },
];

async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
}

for (const route of publicRoutes) {
  test(`${route.path} renders with metadata and no console errors`, async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    const response = await page.goto(route.path);

    expect(response?.ok(), `${route.path} should return a successful response`).toBeTruthy();
    await expect(page).toHaveTitle(/Cognispark|Graph Reasoning Lab|Force System Builder|Energy Ledger|Physics Coverage|Mission|Login|Create account/i);
    await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(route.heading);
    await expect(page.locator("meta[name='description']")).toHaveAttribute("content", /.+/);
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /^https:\/\/app\.cognispark\.tech/);

    expect(errors, `${route.path} should not emit browser console errors`).toEqual([]);
  });
}
