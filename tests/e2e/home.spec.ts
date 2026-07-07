import { expect, test } from "./fixtures";

test("home page shows the game introduction", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("h1 img[title='disCO2very']")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pick categories" })).toBeVisible();
  // The two example cards teasing the game.
  await expect(page.locator('[class*="item-card_front__"]')).toHaveCount(2);
  // The about section.
  await expect(page.getByText("License AGPL")).toBeVisible();
  // No highscore is displayed on a first visit.
  await expect(page.getByText("Best streak")).toHaveCount(0);
});

test.describe("with a French browser locale", () => {
  test.use({ locale: "fr-FR" });

  test("the UI renders in French", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Démarrer la partie" })).toBeVisible();
  });
});

test.describe("with an unsupported browser locale", () => {
  test.use({ locale: "it-IT" });

  test("the UI defaults to English", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  });
});

test("newsletter registration shows a success message", async ({ page }) => {
  // Mock the newsletter endpoint: the test must never hit the real server.
  let submitted = false;
  await page.route("**/newsletter.php", (route) => {
    submitted = true;
    return route.fulfill({
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "",
    });
  });

  await page.goto("/");
  await page.locator('input[name="email"]').fill("test@example.org");
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByText("test@example.org has been successfully registered.")).toBeVisible();
  expect(submitted).toBe(true);
});
