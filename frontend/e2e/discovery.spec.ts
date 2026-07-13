import { test, expect } from "./fixtures";

test.describe("Home", () => {
  test("renders the hero and loads categories from the API", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /discover amazing/i }),
    ).toBeVisible();

    // Seeded categories (prisma/seed.ts).
    await expect(
      page.getByRole("link", { name: /Fast Food/i }).first(),
    ).toBeVisible();
  });

  test("shows featured restaurants from the database", async ({ page }) => {
    await page.goto("/");

    const cards = page.getByRole("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("hero search hands its terms to the listing page", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search restaurants or cuisine/i).fill("Monal");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(/\/restaurants\?search=Monal/);
    await expect(
      page.getByRole("heading", { name: /Monal/i }).first(),
    ).toBeVisible();
  });
});

test.describe("Restaurant listing", () => {
  test("search filters the results", async ({ page }) => {
    await page.goto("/restaurants?search=Monal");

    const cards = page.getByRole("article");
    await expect(cards.first()).toBeVisible();

    for (const name of await cards
      .getByRole("heading")
      .allTextContents()) {
      expect(name.toLowerCase()).toContain("monal");
    }
  });

  test("a nonsense search shows the empty state, not an error", async ({
    page,
  }) => {
    await page.goto("/restaurants?search=zzzznotarestaurant");

    await expect(page.getByText(/no restaurants found/i)).toBeVisible();
    await expect(page.getByRole("alert")).toBeHidden();
  });

  test("clearing filters brings the full list back", async ({ page }) => {
    await page.goto("/restaurants?search=zzzznotarestaurant");
    await expect(page.getByText(/no restaurants found/i)).toBeVisible();

    await page.getByRole("button", { name: /clear/i }).first().click();

    await expect(page.getByRole("article").first()).toBeVisible();
  });

  test("the category filter narrows the list", async ({ page }) => {
    await page.goto("/restaurants");
    await expect(page.getByRole("article").first()).toBeVisible();

    await page.getByRole("combobox").selectOption({ label: "Desi" });

    await expect(page).toHaveURL(/categoryId=/);
    // Either matching cards, or an honest empty state — never a crash.
    await expect(
      page.getByRole("article").first().or(page.getByText(/no restaurants/i)),
    ).toBeVisible();
  });
});

test.describe("Restaurant detail", () => {
  test("shows the rating, address and review list", async ({ page }) => {
    await page.goto("/restaurants/1");

    await expect(
      page.getByRole("heading", { name: /Monal/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Reviews/ })).toBeVisible();
    await expect(page.getByText(/Islamabad/i).first()).toBeVisible();
  });

  test("asks a signed-out visitor to log in before reviewing or booking", async ({
    page,
  }) => {
    await page.goto("/restaurants/1");

    await expect(
      page.getByRole("link", { name: /log in to reserve/i }),
    ).toBeVisible();
    await expect(page.getByText(/log in.*to write a review/i)).toBeVisible();
  });

  test("an unknown id shows an error state rather than a blank page", async ({
    page,
  }) => {
    await page.goto("/restaurants/99999999");

    await expect(page.getByRole("alert")).toContainText(/not found/i);
  });
});

test("an unknown URL renders the 404 page", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");

  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByRole("link", { name: /back home/i })).toBeVisible();
});
