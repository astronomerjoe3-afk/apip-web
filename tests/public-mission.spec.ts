import { expect, test } from "@playwright/test";

test("public mission gives targeted correction and can be completed", async ({ page }) => {
  await page.goto("/mission-demo");

  await expect(page.getByRole("heading", { name: /read a motion graph/i })).toBeVisible();
  await expect(page.getByRole("img", { name: /distance-time graph/i })).toBeVisible();

  await page.getByRole("button", { name: "Segment A" }).first().click();
  await expect(page.getByText("Useful correction.")).toBeVisible();
  await expect(page.getByText(/Segment A slopes upward/i)).toBeVisible();

  await page.getByRole("button", { name: "Segment B" }).first().click();
  await expect(page.getByText("Good read.")).toBeVisible();
  await expect(page.getByText(/flat line means the distance from base stays constant/i)).toBeVisible();

  await page.getByRole("button", { name: "Segment A" }).nth(1).click();
  await page.getByRole("button", { name: "16 m" }).click();

  const debrief = page.getByRole("region", { name: "Mission debrief" });
  await expect(page.getByText(/3\/3 mission checks locked in/i)).toBeVisible();
  await expect(debrief.getByText("Mastery snapshot")).toBeVisible();
  await expect(debrief.getByText("What Cognispark would remember")).toBeVisible();
  await expect(debrief.getByText(/tracked quantity stayed fixed while time continued/i)).toBeVisible();
  await expect(debrief.getByRole("link", { name: /open graph lab/i })).toHaveAttribute("href", "/graph-lab");
  await expect(debrief.getByRole("link", { name: /save progress/i })).toHaveAttribute("href", "/register");
  await expect(debrief.getByRole("link", { name: /see full route/i })).toHaveAttribute("href", "/learn");
});
