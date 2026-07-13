import { test, expect, makeUser, registerViaUi, nav } from "./fixtures";

/** Runs on the "mobile" project (Pixel 7) — see playwright.config.ts. */

test("the mobile nav opens and reaches a page", async ({ page }) => {
  await registerViaUi(page, makeUser());

  await page.goto("/");

  // Desktop links are collapsed behind the burger.
  await page.getByRole("button", { name: /open menu/i }).click();

  await expect(page.getByRole("button", { name: /log out/i })).toBeVisible();
  // Scoped to the nav: the footer also links to "My reservations".
  await nav(page).getByRole("link", { name: "Reservations", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /your reservations/i }),
  ).toBeVisible();
});

test("the home page never scrolls sideways on a phone", async ({ page }) => {
  await page.goto("/");

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );

  expect(overflows, "page scrolls horizontally").toBe(false);
});

test("restaurant cards stack in a single column", async ({ page }) => {
  await page.goto("/restaurants");

  const cards = page.getByRole("article");
  await expect(cards.first()).toBeVisible();

  if ((await cards.count()) >= 2) {
    const a = await cards.nth(0).boundingBox();
    const b = await cards.nth(1).boundingBox();

    // Stacked, not side by side.
    expect(b!.y).toBeGreaterThan(a!.y + a!.height - 5);
  }
});
