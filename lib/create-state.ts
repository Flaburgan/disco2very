import { GameState } from "../types/game";
import { Item } from "../types/item";
import { drawRandomItem } from "./items";

export default function createState(items: Item[]): GameState {
  // Copy the array so we never mutate the caller's list
  const deck = [...items];

  // Randomly pick the first card on the board (selections always have at
  // least one item) and the card the player has to order.
  const first = drawRandomItem(deck)!;
  const played = [{ ...first, played: { correct: true } }];
  const next = drawRandomItem(deck);

  return {
    badlyPlaced: null,
    deck,
    lives: 5,
    next,
    played,
  };
}
