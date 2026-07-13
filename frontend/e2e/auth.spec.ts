import {
  test,
  expect,
  makeUser,
  registerViaUi,
  loginViaUi,
  ADMIN,
  nav,
} from "./fixtures";

test.describe("Registration", () => {
  test("registers a new account and logs the user straight in", async ({
    page,
  }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    await expect(page).toHaveURL("/");
    await expect(nav(page).getByRole("link", { name: user.name })).toBeVisible();

    // The API's JWT really was stored.
    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeTruthy();
  });

  test("shows the backend's 8-character password rule before submitting", async ({
    page,
  }) => {
    const user = makeUser();

    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill("123");
    await page.getByLabel("Confirm password").fill("123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
    await expect(page).toHaveURL(/\/register/);
  });

  test("surfaces the API's duplicate-email error", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    // Same email again, from a signed-out browser.
    await page.evaluate(() => localStorage.clear());
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(user.password);
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByRole("alert")).toContainText(
      /already registered/i,
    );
  });
});

test.describe("Login", () => {
  test("logs in with real credentials", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await page.getByRole("button", { name: /log out/i }).click();

    await loginViaUi(page, user);
    await expect(nav(page).getByRole("link", { name: user.name })).toBeVisible();
  });

  test("rejects a wrong password with the API's message", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await page.getByRole("button", { name: /log out/i }).click();

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("TotallyWrong123");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page.getByRole("alert")).toContainText(
      /invalid email or password/i,
    );
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Session", () => {
  test("survives a full page reload", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    await page.reload();

    // Restored from /auth/profile rather than flashing logged-out.
    await expect(nav(page).getByRole("link", { name: user.name })).toBeVisible();
  });

  test("a rejected token logs the user out instead of hanging", async ({
    page,
  }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    // Simulate an expired / revoked JWT.
    await page.evaluate(() =>
      localStorage.setItem("token", "not.a.valid.token"),
    );
    await page.goto("/favorites");

    await page.waitForURL(/\/login/);
    await page.waitForLoadState("load");

    // The interceptor's redirect is a real navigation, so an evaluate can
    // land mid-flight and throw. Retry until the page settles.
    await expect
      .poll(
        async () => {
          try {
            return await page.evaluate(() => localStorage.getItem("token"));
          } catch {
            return "still-navigating";
          }
        },
        { timeout: 10_000 },
      )
      .toBeNull();
  });

  test("logging out clears the token and the private nav", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    await page.getByRole("button", { name: /log out/i }).click();

    await expect(nav(page).getByRole("link", { name: /^Log in$/ })).toBeVisible();
    await expect(nav(page).getByRole("link", { name: "Favorites" })).toBeHidden();

    const token = await page.evaluate(() => localStorage.getItem("token"));
    expect(token).toBeNull();
  });

  test("an admin sees the admin link, a normal user does not", async ({
    page,
  }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await expect(nav(page).getByRole("link", { name: /admin/i })).toBeHidden();

    await page.getByRole("button", { name: /log out/i }).click();
    await loginViaUi(page, ADMIN);

    await expect(
      nav(page).getByRole("link", { name: /admin/i }).first(),
    ).toBeVisible();
  });
});
