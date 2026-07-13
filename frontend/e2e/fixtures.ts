import { test as base, expect, type Page } from "@playwright/test";

export const API = "http://localhost:5000/api";

/** Seeded admin (see backend step 4). Override via env in CI. */
export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "haris@test.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "123456",
};

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

/** A fresh account per test, so tests never collide on the unique email. */
export function makeUser(): TestUser {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  return {
    name: "E2E Tester",
    email: `e2e-${id}@example.com`,
    password: "TestPassword123",
  };
}

export async function registerViaUi(page: Page, user: TestUser) {
  await page.goto("/register");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByLabel("Confirm password").fill(user.password);
  await page.getByRole("button", { name: /create account/i }).click();

  // The logout button lives behind the burger menu on mobile, so assert on
  // the stored token — true on every viewport.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("token")), {
      timeout: 10_000,
    })
    .toBeTruthy();
}

/**
 * The header, so "Log in" doesn't also match the footer's link. Scoped to
 * the banner rather than <nav>, because the mobile burger menu renders as a
 * sibling of <nav> inside the header.
 */
export function nav(page: Page) {
  return page.getByRole("banner");
}

/** The admin panel's content column, so stat cards don't clash with the sidebar. */
export function main(page: Page) {
  return page.getByRole("main");
}

export async function loginViaUi(
  page: Page,
  creds: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(creds.email);
  await page.getByLabel("Password").fill(creds.password);
  await page.getByRole("button", { name: /log in/i }).click();

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("token")), {
      timeout: 10_000,
    })
    .toBeTruthy();
}

/**
 * Fails the test on any uncaught JS error or console error. A page that
 * renders but throws in the console is a broken page.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: async ({ page }, use) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(`Uncaught: ${err.message}`));

    await use(errors);

    expect(errors, "console errors on the page").toEqual([]);
  },
});

export { expect };
