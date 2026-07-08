import { test as base } from "@playwright/test";

// Every test runs with requests to the production server (telemetry,
// newsletter, stats) blocked, so CI never reaches www.disco2very.org.
// A test can still mock a specific endpoint with page.route(), which takes
// precedence over this context-wide route.
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route("https://www.disco2very.org/**", (route) => route.abort());
    await use(context);
  },
});

export { expect } from "@playwright/test";
