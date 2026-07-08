import { expect, test } from "./fixtures";
import {
  correctIndex,
  hearts,
  loseGame,
  nextCard,
  placeNextCard,
  playedCards,
  startDefaultGame,
} from "./helpers/game";

test("losing five lives ends the game, play again restarts it", async ({
  page,
}) => {
  await startDefaultGame(page);
  await loseGame(page);

  await expect(page.getByRole("heading", { name: "Game over" })).toBeVisible();
  await expect(page.getByText("This streak")).toBeVisible();
  await expect(page.getByText("Best streak")).toBeVisible();
  // Five incorrect placements: both streaks are 0.
  await expect(page.locator('[class*="score_value__"]')).toHaveText(["0", "0"]);

  await page.getByRole("button", { name: "Play again" }).click();
  await expect(playedCards(page)).toHaveCount(1);
  await expect(hearts(page)).toHaveText("5");
  await expect(nextCard(page)).toBeVisible();
});

test.describe("share", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("the score can be shared to the clipboard", async ({ page }) => {
    await startDefaultGame(page);
    await loseGame(page);

    await page.getByText("Share your score").click();
    await expect(page.getByText("Copied!")).toBeVisible();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain("disCO2very");
    expect(clipboard).toContain("This streak: 0");
    expect(clipboard).toContain("https://disco2very.org");
  });
});

test("placing all the cards of a category wins the game", async ({ page }) => {
  // Furniture is the smallest category (6 items): 5 correct placements win.
  await page.goto("/");
  await page.getByRole("button", { name: "Pick categories" }).click();
  await page.getByRole("heading", { name: "Furniture" }).click();
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(playedCards(page)).toHaveCount(1);

  for (let guard = 0; (await nextCard(page).count()) > 0; guard++) {
    expect(
      guard,
      "the deck should be exhausted after a few placements",
    ).toBeLessThan(40);
    await placeNextCard(page, await correctIndex(page));
  }

  await expect(
    page.getByRole("heading", { name: "Congratulations!" }),
  ).toBeVisible();
  await expect(page.getByText("You ordered all the cards!")).toBeVisible();
  // No mistake was made.
  await expect(hearts(page)).toHaveText("5");
  await expect(page.locator('[class*="item-card_incorrect__"]')).toHaveCount(0);
});

test("the highscore is shown on the home screen and survives a reload", async ({
  page,
}) => {
  await startDefaultGame(page);
  await placeNextCard(page, await correctIndex(page));

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Best streak")).toBeVisible();
  await expect(page.locator('[class*="score_value__"]')).toHaveText(["1"]);

  await page.reload();
  await expect(page.getByText("Best streak")).toBeVisible();
  await expect(page.locator('[class*="score_value__"]')).toHaveText(["1"]);
});
