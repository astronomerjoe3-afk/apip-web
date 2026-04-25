import { expect, test } from "@playwright/test";

const routes = ["/", "/mission-demo", "/graph-lab", "/force-builder", "/energy-ledger", "/learn", "/register", "/login"];

for (const route of routes) {
  test(`${route} has no mobile horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(layout.scrollWidth, `${route} should not overflow horizontally on mobile`).toBeLessThanOrEqual(
      layout.clientWidth + 1,
    );
  });
}

