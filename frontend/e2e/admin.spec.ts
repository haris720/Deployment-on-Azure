import {
  test,
  expect,
  makeUser,
  registerViaUi,
  loginViaUi,
  ADMIN,
  main,
} from "./fixtures";

test.describe("Admin dashboard", () => {
  test("shows live counts from the database", async ({ page }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin");

    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();

    for (const label of ["Users", "Reviews", "Pending bookings"]) {
      await expect(
        main(page).getByText(label, { exact: true }),
      ).toBeVisible();
    }

    // Real numbers, not spinners or dashes.
    const counts = await main(page).locator("p.text-3xl").allTextContents();
    expect(counts.length).toBeGreaterThan(0);
    for (const c of counts) expect(c.trim()).toMatch(/^\d+$/);
  });

  test("the dashboard reflects a newly registered user", async ({ page }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin");

    const readCount = async () =>
      Number(
        (await main(page).locator("p.text-3xl").first().textContent())?.trim(),
      );

    const before = await readCount();

    await page.getByRole("button", { name: /log out/i }).click();
    await registerViaUi(page, makeUser());
    await page.getByRole("button", { name: /log out/i }).click();

    await loginViaUi(page, ADMIN);
    await page.goto("/admin");

    await expect
      .poll(readCount, { timeout: 10_000 })
      .toBeGreaterThan(before);
  });
});

test.describe("User management", () => {
  test("lists users without exposing password hashes", async ({ page }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin/users");

    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByText(ADMIN.email)).toBeVisible();

    expect(await page.content()).not.toContain("$2b$");
  });

  test("promotes a user to admin and demotes them again", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await page.getByRole("button", { name: /log out/i }).click();

    await loginViaUi(page, ADMIN);
    await page.goto("/admin/users");

    const row = page.getByRole("row").filter({ hasText: user.email });
    await expect(row.getByText("USER")).toBeVisible();

    await row.getByRole("button", { name: /promote/i }).click();
    await expect(row.getByText("ADMIN")).toBeVisible();

    await row.getByRole("button", { name: /demote/i }).click();
    await expect(row.getByText("USER")).toBeVisible();
  });

  test("the admin cannot delete or demote their own account", async ({
    page,
  }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin/users");

    const me = page.getByRole("row").filter({ hasText: ADMIN.email });

    await expect(me.getByText("(you)")).toBeVisible();
    // Buttons are hidden precisely because the API would refuse.
    await expect(me.getByRole("button")).toHaveCount(0);
  });

  test("deletes a user and their data", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await page.getByRole("button", { name: /log out/i }).click();

    await loginViaUi(page, ADMIN);
    await page.goto("/admin/users");

    const row = page.getByRole("row").filter({ hasText: user.email });
    await expect(row).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await row.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText(user.email)).toBeHidden();
  });
});

test.describe("Restaurant management", () => {
  test("creates a restaurant that then appears to the public", async ({
    page,
  }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin/restaurants");

    const name = `E2E Bistro ${Date.now()}`;

    await page.getByRole("button", { name: /add restaurant/i }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Address").fill("1 Test Street");
    await page.getByLabel("City").fill("Testville");
    await page.getByLabel("Category").selectOption({ index: 1 });
    await page.getByRole("button", { name: /create restaurant/i }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText(name)).toBeVisible();

    // Visible to a signed-out visitor via the public search.
    await page.getByRole("button", { name: /log out/i }).click();
    await page.goto(`/restaurants?search=${encodeURIComponent(name)}`);
    await expect(page.getByRole("heading", { name })).toBeVisible();
  });

  test("the API's validation errors surface in the form", async ({ page }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin/restaurants");

    await page.getByRole("button", { name: /add restaurant/i }).click();

    // A single-character name violates the backend's min(2) rule. The
    // browser's `required` check passes, so this reaches the API.
    await page.getByLabel("Name").fill("x");
    await page.getByLabel("Address").fill("1 Test Street");
    await page.getByLabel("City").fill("Testville");
    await page.getByLabel("Category").selectOption({ index: 1 });
    await page.getByRole("button", { name: /create restaurant/i }).click();

    await expect(page.getByRole("alert")).toContainText(/name/i);
  });

  test("disabling a restaurant hides it from customers", async ({ page }) => {
    await loginViaUi(page, ADMIN);
    await page.goto("/admin/restaurants");

    const name = `E2E Doomed ${Date.now()}`;

    await page.getByRole("button", { name: /add restaurant/i }).click();
    await page.getByLabel("Name").fill(name);
    await page.getByLabel("Address").fill("2 Test Street");
    await page.getByLabel("City").fill("Testville");
    await page.getByLabel("Category").selectOption({ index: 1 });
    await page.getByRole("button", { name: /create restaurant/i }).click();
    await expect(page.getByText(name)).toBeVisible();

    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: `Disable ${name}` }).click();

    await expect(page.getByText(name)).toBeHidden();

    // Gone from the public listing too (soft delete).
    await page.goto(`/restaurants?search=${encodeURIComponent(name)}`);
    await expect(page.getByText(/no restaurants found/i)).toBeVisible();
  });
});
