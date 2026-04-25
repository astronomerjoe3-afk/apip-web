import { expect, test } from "@playwright/test";

const routes = ["/", "/mission-demo", "/graph-lab", "/force-builder", "/energy-ledger", "/learn", "/register", "/login"];

for (const route of routes) {
  test(`${route} has basic semantic and keyboard accessibility`, async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

    const unnamedButtons = await page.locator("button").evaluateAll((buttons) =>
      buttons.filter((button) => !button.textContent?.trim() && !button.getAttribute("aria-label")).length,
    );
    expect(unnamedButtons, `${route} should not have unnamed buttons`).toBe(0);

    const unnamedLinks = await page.locator("a").evaluateAll((links) =>
      links.filter((link) => !link.textContent?.trim() && !link.getAttribute("aria-label")).length,
    );
    expect(unnamedLinks, `${route} should not have unnamed links`).toBe(0);

    await page.keyboard.press("Tab");
    const activeTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    expect(["a", "button", "input", "textarea", "select"].includes(activeTag || "")).toBeTruthy();
  });
}

