import { expect, test } from "@playwright/test";

test("graph lab modes are reachable and the first checkpoint responds", async ({ page }) => {
  await page.goto("/graph-lab");

  await expect(page.getByRole("tab", { name: /story board/i })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("tab", { name: /pace log/i }).click();
  await expect(page.getByRole("heading", { name: /speed-time graph/i }).first()).toBeVisible();

  await page.getByRole("tab", { name: /gradient meaning/i }).click();
  await expect(page.getByRole("heading", { name: /same steepness can mean different physics/i })).toBeVisible();

  await page.getByRole("tab", { name: /area builder/i }).click();
  await expect(page.getByRole("heading", { name: /area under a speed-time graph/i })).toBeVisible();

  await page.getByRole("tab", { name: /story board/i }).click();
  await page.getByRole("button", { name: /object is stopped at a constant distance/i }).click();
  await expect(page.getByText(/Good read|Exactly|right/i).first()).toBeVisible();
});

test("force builder and energy ledger expose interactive mode tabs", async ({ page }) => {
  await page.goto("/force-builder");
  await expect(page.getByRole("heading", { name: /build the force story/i })).toBeVisible();
  await page.getByRole("tab", { name: /pair-force contrast/i }).click();
  await expect(page.getByText(/equal and opposite pair forces/i).first()).toBeVisible();
  await page.getByRole("tab", { name: /torque reach/i }).click();
  await expect(page.getByText(/farther from the pivot/i).first()).toBeVisible();

  await page.goto("/energy-ledger");
  await expect(page.getByRole("heading", { name: /track where the energy goes/i })).toBeVisible();
  await page.getByRole("tab", { name: /height store/i }).click();
  await expect(page.getByText(/mass, field strength, and height/i).first()).toBeVisible();
  await page.getByRole("tab", { name: /rate and yield/i }).click();
  await expect(page.getByText(/power and efficiency separate/i).first()).toBeVisible();
});
