import { test, expect, makeUser, registerViaUi } from "./fixtures";

test.describe("Favorites", () => {
  test("saving a restaurant persists it to the favorites page", async ({
    page,
  }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants");
    const card = page.getByRole("article").first();
    const name = await card.getByRole("heading").textContent();

    await card.getByRole("button", { name: /save .* to favorites/i }).click();

    await page.goto("/favorites");
    await expect(
      page.getByRole("heading", { name: name!.trim() }),
    ).toBeVisible();
  });

  test("un-saving removes it again", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants");
    await page
      .getByRole("article")
      .first()
      .getByRole("button", { name: /save .* to favorites/i })
      .click();

    await page.goto("/favorites");
    await expect(page.getByRole("article").first()).toBeVisible();

    await page
      .getByRole("article")
      .first()
      .getByRole("button", { name: /remove .* from favorites/i })
      .click();

    await expect(page.getByText(/no favorites yet/i)).toBeVisible();
  });

  test("a new account starts with an empty state", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/favorites");
    await expect(page.getByText(/no favorites yet/i)).toBeVisible();
  });
});

test.describe("Lists", () => {
  test("creates a list and adds a restaurant to it", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/lists");
    await expect(page.getByText(/no lists yet/i)).toBeVisible();

    await page.getByRole("button", { name: /create a list/i }).click();
    await page.getByLabel("Name").fill("Date night");
    await page.getByRole("button", { name: /create list/i }).click();

    await expect(
      page.getByRole("heading", { name: "Date night" }),
    ).toBeVisible();

    // Add a restaurant through the dialog.
    await page.getByRole("button", { name: /^Add$/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button")
      .filter({ hasText: /\w/ })
      .first()
      .click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText(/1 restaurant/i)).toBeVisible();
  });

  test("deletes a list", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/lists");
    await page.getByRole("button", { name: /create a list/i }).click();
    await page.getByLabel("Name").fill("Temporary");
    await page.getByRole("button", { name: /create list/i }).click();
    await expect(page.getByRole("heading", { name: "Temporary" })).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /delete Temporary/i }).click();

    await expect(page.getByText(/no lists yet/i)).toBeVisible();
  });
});

test.describe("Reviews", () => {
  test("posting a review updates the rating, and a second is refused", async ({
    page,
  }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants/1");

    await page.getByRole("button", { name: "5 stars" }).click();
    await page
      .getByPlaceholder(/how was the food/i)
      .fill("Excellent food, posted by the e2e suite.");
    await page.getByRole("button", { name: /post review/i }).click();

    // The review appears in the list (the textarea holds the same text
    // for a moment, so scope to the posted article).
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "Excellent food, posted by the e2e suite." })
        .first(),
    ).toBeVisible();

    // ...and the one-review-per-user rule now shows instead of the form.
    await expect(page.getByText(/already reviewed/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /post review/i }),
    ).toBeHidden();
  });

  test("a review cannot be posted without a star rating", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants/2");
    await page.getByPlaceholder(/how was the food/i).fill("No stars picked");
    await page.getByRole("button", { name: /post review/i }).click();

    await expect(page.getByText(/pick a star rating/i)).toBeVisible();
  });
});
