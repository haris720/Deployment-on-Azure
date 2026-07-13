import { defineConfig, devices } from "@playwright/test";

const FRONTEND = "http://localhost:5173";
const BACKEND = "http://localhost:5000";

export default defineConfig({
  testDir: "./e2e",

  // These tests share one database. Running them in parallel lets an
  // admin test delete a user another test is mid-way through using.
  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],

  use: {
    baseURL: FRONTEND,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      // The responsive checks are meaningless at desktop width.
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], channel: "chrome" },
      testMatch: /responsive\.spec\.ts/,
    },
  ],

  // Boots the real stack: Postgres-backed API + Vite. `npm run test:e2e`
  // is the only command a developer (or CI) needs.
  webServer: [
    {
      command: "npm run dev",
      cwd: "../backend",
      url: `${BACKEND}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        // A browser run makes far more requests than the production
        // rate limits allow; without this the suite 429s midway.
        RATE_LIMIT_MAX: "100000",
        AUTH_RATE_LIMIT_MAX: "10000",
      },
    },
    {
      command: "npm run dev",
      url: FRONTEND,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
