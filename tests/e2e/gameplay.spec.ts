import { expect, test } from "./fixtures";
import { ecvOf } from "./helpers/ecv";
import {
  correctIndex,
  hearts,
  nextCard,
  placeNextCard,
  playedCards,
  startDefaultGame,
  timelineSlugs,
} from "./helpers/game";

test("a correct placement reveals the card and keeps the lives", async ({ page }) => {
  await startDefaultGame(page);

  const index = await correctIndex(page);
  await placeNextCard(page, index);

  await expect(playedCards(page)).toHaveCount(2);
  // Both the initial card and the newly placed one are marked correct.
  await expect(page.locator('[class*="item-card_correct__"]')).toHaveCount(2);
  await expect(page.locator('[class*="item-card_incorrect__"]')).toHaveCount(0);
  // The placed card now shows its footprint.
  await expect(playedCards(page).nth(index).locator('[class*="item-card_bottom__"]')).toContainText(
    /\d+(\.\d+)? kg CO/
  );
  await expect(hearts(page)).toHaveText("5");
  // A new next card was dealt.
  await expect(nextCard(page)).toBeVisible();
});

test("an incorrect placement costs a life and the card moves to its place", async ({ page }) => {
  await startDefaultGame(page);

  const index = await correctIndex(page);
  await placeNextCard(page, index === 0 ? 1 : 0);

  await expect(page.locator('[class*="item-card_incorrect__"]')).toHaveCount(1);
  await expect(hearts(page)).toHaveText("4");
  // After the auto-move animation, the timeline is sorted by footprint again.
  const values = (await timelineSlugs(page)).map(ecvOf);
  expect(values).toEqual([...values].sort((a, b) => a - b));
});

test("clicking a played card opens the explanation dialog", async ({ page }) => {
  await startDefaultGame(page);

  await playedCards(page).first().click();

  const dialog = page.locator('[class*="explanation-dialog_explanationDialog__"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Total:" })).toBeVisible();
  await expect(dialog.locator("footer strong")).toContainText(/\d+(\.\d+)? kg CO/);

  await dialog.locator('img[src*="cross.svg"]').click();
  await expect(dialog).toHaveCount(0);
});
