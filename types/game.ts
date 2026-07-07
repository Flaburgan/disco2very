import { Item, PlayedItem } from "./item";

export interface GameState {
  badlyPlaced: {
    index: number;
    delta: number;
  } | null;
  deck: Item[];
  lives: number;
  next: Item | null;
  nextButOne: Item | null;
  played: PlayedItem[];
}
