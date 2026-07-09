import { expect, test } from "./fixtures";
import {
  hearts,
  nextCard,
  playedCards,
  startDefaultGame,
} from "./helpers/game";

test("starting a default game shows the board", async ({ page }) => {
  await startDefaultGame(page);

  // One revealed card on the timeline, showing its footprint.
  await expect(playedCards(page)).toHaveCount(1);
  await expect(playedCards(page).locator('[class*="_bottom_"]')).toContainText(
    /\d+(\.\d+)? kg CO/,
  );
  // The next card is face down.
  await expect(nextCard(page)).toBeVisible();
  await expect(nextCard(page).locator('[class*="_bottom_"]')).toContainText(
    "? kg CO",
  );
  // Five lives and the game actions.
  await expect(hearts(page)).toHaveText("5");
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restart" })).toBeVisible();
});

test("the back button returns to the instructions", async ({ page }) => {
  await startDefaultGame(page);

  await page.getByRole("button", { name: "Back" }).click();

  await expect(page.getByRole("button", { name: "Start game" })).toBeVisible();
  await expect(playedCards(page)).toHaveCount(0);
});

test("categories can be picked before starting a game", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pick categories" }).click();

  await expect(
    page.getByText("Select the categories you want to play with:"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furniture" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Food" })).toBeVisible();
  // Nothing selected yet: the game cannot start.
  await expect(page.getByRole("button", { name: "Start game" })).toBeDisabled();

  // Selecting a category enables the start button.
  await page.getByRole("heading", { name: "Furniture" }).click();
  await expect(page.getByRole("button", { name: "Start game" })).toBeEnabled();
  await page.getByRole("button", { name: "Start game" }).click();

  await expect(playedCards(page)).toHaveCount(1);
  await expect(hearts(page)).toHaveText("5");
});

test("the back button returns from the categories to the instructions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Pick categories" }).click();
  await expect(
    page.getByText("Select the categories you want to play with:"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Back" }).click();

  await expect(
    page.getByRole("button", { name: "Pick categories" }),
  ).toBeVisible();
  await expect(
    page.getByText("Select the categories you want to play with:"),
  ).toHaveCount(0);
});
