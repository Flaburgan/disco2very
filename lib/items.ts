import { Item, PlayedItem } from "../types/item";

export function checkCorrect(
  played: PlayedItem[],
  item: Item,
  index: number,
): { correct: boolean; delta: number } {
  const sorted = [...played, item].sort((a, b) => a.source.ecv - b.source.ecv);
  const correctIndex = sorted.findIndex((i) => {
    return i.id === item.id;
  });

  if (index !== correctIndex) {
    return { correct: false, delta: correctIndex - index };
  }

  return { correct: true, delta: 0 };
}

// Remove a random card from the deck (mutating it) and return it,
// or null when the deck is empty.
export function drawRandomItem(deck: Item[]): Item | null {
  if (deck.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * deck.length);
  return deck.splice(randomIndex, 1)[0];
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function displayCO2(value: number): string {
  return round2(value) + " kg";
}
