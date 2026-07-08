import { expect, Locator, Page } from "@playwright/test";
import { ecvOf } from "./ecv";

// CSS module class names survive the production build as
// "<file>_<class>__<hash>", so [class*="file_class__"] selectors stay stable.

const itemImage = '[class*="item-card_imageContainer__"] img';

export function playedCards(page: Page): Locator {
  return page.locator("[data-timeline-card]");
}

export function nextCard(page: Page): Locator {
  return page.locator('[class*="next-item-list_wrapper__"] [class*="draggable-item-card_itemCard__"]');
}

export function hearts(page: Page): Locator {
  return page.locator('[class*="hearts_hearts__"]');
}

function slugFromSrc(src: string): string {
  const match = src.match(/images\/ademe\/([^/]+)\.svg$/);
  if (match === null) {
    throw new Error(`Cannot extract an item slug from the illustration "${src}"`);
  }
  return match[1];
}

export async function cardSlug(card: Locator): Promise<string> {
  const src = await card.locator(itemImage).getAttribute("src");
  return slugFromSrc(src ?? "");
}

export async function timelineSlugs(page: Page): Promise<string[]> {
  const srcs = await playedCards(page)
    .locator(itemImage)
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute("src") ?? ""));
  return srcs.map(slugFromSrc);
}

// The index at which the next card must be dropped to be correct.
// checkCorrect() sorts with a stable sort, so on equal footprints the new
// card goes after the already-played ones.
export async function correctIndex(page: Page): Promise<number> {
  const next = ecvOf(await cardSlug(nextCard(page)));
  const played = await timelineSlugs(page);
  return played.filter((slug) => ecvOf(slug) <= next).length;
}

// Viewport coordinates the dragged card's center must reach so that it gets
// inserted at `index` on the timeline.
async function slotCoordinates(page: Page, index: number): Promise<{ x: number; y: number }> {
  const cards = playedCards(page);
  const count = await cards.count();
  // Bring the cards around the target slot on screen: the timeline scrolls
  // horizontally once it grows beyond the viewport.
  await cards
    .nth(Math.min(index, count - 1))
    .evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }));
  const anchor = await cards.nth(Math.min(index, count - 1)).boundingBox();
  if (anchor === null) {
    throw new Error(`Timeline card ${Math.min(index, count - 1)} has no bounding box`);
  }
  const y = anchor.y + anchor.height / 2;
  if (index === 0) {
    // Before the center of the first card.
    return { x: anchor.x + anchor.width / 4, y };
  }
  if (index === count) {
    // Over the trailing "+" area, after the center of the last card.
    return { x: anchor.x + anchor.width + 30, y };
  }
  // In the gap just before the card currently at `index`.
  return { x: anchor.x - 5, y };
}

// Drag the next card and drop it at `index` on the timeline, then wait for
// the game to settle (drop animation, and the auto-move of a badly placed
// card). Uses raw mouse events to drive lib/use-card-drag.ts.
export async function placeNextCard(page: Page, index: number): Promise<void> {
  const before = await playedCards(page).count();
  const card = nextCard(page);
  const box = await card.boundingBox();
  if (box === null) {
    throw new Error("The next card is not visible");
  }
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const { x, y } = await slotCoordinates(page, index);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Cross the 5px threshold so the press becomes a drag and the card is
  // lifted, then move its center over the target slot.
  await page.mouse.move(startX + 10, startY - 10, { steps: 3 });
  await page.mouse.move(x, y, { steps: 15 });
  await page.mouse.up();

  // The card animates into the gap, then the new state is committed.
  await expect(playedCards(page)).toHaveCount(before + 1);
  // A badly placed card then slides to its correct position; the board
  // keeps the "dragging" marker class until everything settled.
  await expect(page.locator(".notDragging")).toBeVisible();
}

export async function startDefaultGame(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "Start game" }).click();
  await expect(playedCards(page)).toHaveCount(1);
}

export async function loseGame(page: Page): Promise<void> {
  for (let lives = 5; lives > 0; lives--) {
    const index = await correctIndex(page);
    // Any other index is an incorrect placement.
    await placeNextCard(page, index === 0 ? 1 : 0);
  }
}
