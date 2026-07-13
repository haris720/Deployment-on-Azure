import {
  test,
  expect,
  makeUser,
  registerViaUi,
  loginViaUi,
  ADMIN,
} from "./fixtures";

/** A datetime-local string safely in the future (the API rejects past dates). */
function futureDate(daysAhead = 30) {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  d.setHours(19, 30, 0, 0);
  return d.toISOString().slice(0, 16);
}

test.describe("Booking a table", () => {
  test("a customer books and sees it as PENDING", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants/1");
    await page.locator('input[type="datetime-local"]').fill(futureDate());
    await page.getByLabel("People").fill("4");
    await page.getByPlaceholder(/window seat/i).fill("Window seat please");
    await page.getByRole("button", { name: /request reservation/i }).click();

    await expect(page.getByText(/reservation requested/i)).toBeVisible();

    await page.goto("/reservations");
    await expect(page.getByText("PENDING").first()).toBeVisible();
    await expect(page.getByText("Window seat please")).toBeVisible();
    await expect(page.getByText(/4 people/)).toBeVisible();
  });

  test("the API's past-date rule is surfaced, not swallowed", async ({
    page,
  }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants/1");

    // The picker's `min` blocks this in the UI, so push a past date in
    // directly — the server must still refuse it.
    await page.locator('input[type="datetime-local"]').evaluate((el) => {
      const input = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )!.set!;
      setter.call(input, "2020-01-01T19:30");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await page.getByRole("button", { name: /request reservation/i }).click();

    await expect(page.getByRole("alert")).toContainText(/future/i);
  });

  test("a customer can cancel their own booking", async ({ page }) => {
    await registerViaUi(page, makeUser());

    await page.goto("/restaurants/1");
    await page.locator('input[type="datetime-local"]').fill(futureDate(31));
    await page.getByRole("button", { name: /request reservation/i }).click();
    await expect(page.getByText(/reservation requested/i)).toBeVisible();

    await page.goto("/reservations");
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /cancel reservation/i }).click();

    await expect(page.getByText("CANCELLED").first()).toBeVisible();
  });
});

test.describe("The full lifecycle across both roles", () => {
  test("customer books -> admin confirms -> customer sees CONFIRMED", async ({
    page,
  }) => {
    const customer = makeUser();
    await registerViaUi(page, customer);

    // 1. The customer books a table.
    await page.goto("/restaurants/1");
    await page.locator('input[type="datetime-local"]').fill(futureDate(45));
    await page.getByLabel("People").fill("2");
    await page
      .getByPlaceholder(/window seat/i)
      .fill(`Lifecycle test ${customer.email}`);
    await page.getByRole("button", { name: /request reservation/i }).click();
    await expect(page.getByText(/reservation requested/i)).toBeVisible();

    await page.goto("/reservations");
    await expect(page.getByText("PENDING").first()).toBeVisible();

    // 2. The admin sees it and confirms it.
    await page.getByRole("button", { name: /log out/i }).click();
    await loginViaUi(page, ADMIN);

    await page.goto("/admin/reservations");

    const booking = page
      .getByRole("article")
      .filter({ hasText: `Lifecycle test ${customer.email}` });

    await expect(booking).toBeVisible();
    await expect(booking.getByText("PENDING")).toBeVisible();

    await booking.getByRole("button", { name: /^Confirm$/ }).click();
    await expect(booking.getByText("CONFIRMED")).toBeVisible();

    // 3. The customer sees the confirmation.
    await page.getByRole("button", { name: /log out/i }).click();
    await loginViaUi(page, customer);

    await page.goto("/reservations");
    await expect(page.getByText("CONFIRMED").first()).toBeVisible();
    await expect(page.getByText("PENDING")).toBeHidden();
  });

  test("an admin declining a booking shows the customer CANCELLED", async ({
    page,
  }) => {
    const customer = makeUser();
    await registerViaUi(page, customer);

    await page.goto("/restaurants/1");
    await page.locator('input[type="datetime-local"]').fill(futureDate(46));
    await page
      .getByPlaceholder(/window seat/i)
      .fill(`Decline test ${customer.email}`);
    await page.getByRole("button", { name: /request reservation/i }).click();
    await expect(page.getByText(/reservation requested/i)).toBeVisible();

    await page.getByRole("button", { name: /log out/i }).click();
    await loginViaUi(page, ADMIN);

    await page.goto("/admin/reservations");
    const booking = page
      .getByRole("article")
      .filter({ hasText: `Decline test ${customer.email}` });

    await booking.getByRole("button", { name: /decline/i }).click();
    await expect(booking.getByText("CANCELLED")).toBeVisible();

    await page.getByRole("button", { name: /log out/i }).click();
    await loginViaUi(page, customer);

    await page.goto("/reservations");
    await expect(page.getByText("CANCELLED").first()).toBeVisible();
  });
});
