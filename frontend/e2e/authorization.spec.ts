import {
  test,
  expect,
  makeUser,
  registerViaUi,
  loginViaUi,
  ADMIN,
  API,
} from "./fixtures";

/**
 * The UI hides what a user may not do; the API must refuse it regardless.
 * These tests check both layers, because a hidden button is not security.
 */

test.describe("Route guards", () => {
  test("an anonymous visitor is sent to login from private pages", async ({
    page,
  }) => {
    for (const path of ["/favorites", "/lists", "/reservations", "/profile"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("a normal user is bounced off every admin route", async ({ page }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    for (const path of [
      "/admin",
      "/admin/users",
      "/admin/restaurants",
      "/admin/reservations",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL("/");
    }
  });

  test("an admin reaches the admin panel", async ({ page }) => {
    await loginViaUi(page, ADMIN);

    await page.goto("/admin");
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
  });

  test("login sends the user back to where they were headed", async ({
    page,
  }) => {
    const user = makeUser();
    await registerViaUi(page, user);
    await page.getByRole("button", { name: /log out/i }).click();

    await page.goto("/reservations");
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL("/reservations");
  });
});

test.describe("The API enforces authorization itself", () => {
  test("a normal user's token cannot reach admin endpoints", async ({
    page,
    request,
  }) => {
    const user = makeUser();
    await registerViaUi(page, user);

    const token = await page.evaluate(() => localStorage.getItem("token"));

    const dashboard = await request.get(`${API}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dashboard.status()).toBe(403);

    const create = await request.post(`${API}/restaurants`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: "Hack", address: "a", city: "b", categoryId: 1 },
    });
    expect(create.status()).toBe(403);
  });

  test("no token means no access", async ({ request }) => {
    const res = await request.get(`${API}/admin/users`);
    expect(res.status()).toBe(401);
  });

  test("the public reviews endpoint never leaks a password hash", async ({
    request,
  }) => {
    const res = await request.get(`${API}/reviews/restaurant/1`);
    expect(res.ok()).toBeTruthy();
    expect(await res.text()).not.toContain("password");
  });
});
