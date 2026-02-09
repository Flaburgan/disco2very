import React, { useState } from "react";
import Board from "./board";
import Instructions from "./instructions";
import { Item } from "../types/item";
import createState from "../lib/create-state";
import { recordNewGame } from "../lib/server";

export default function Game() {
  if (!localStorage.getItem("app-id") && self.crypto.randomUUID) {
    localStorage.setItem("app-id", self.crypto.randomUUID());
  }

  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [categoriesMode, setCategoriesMode] = useState(false);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  const restart = (categoriesMode: boolean) => {
    setSelectedItems([]);
    setCategoriesMode(categoriesMode);
  };

  const startGame = (selectedItems: Item[]) => {
    setSelectedItems(selectedItems);
    recordNewGame(categoriesMode);
  }

  return (selectedItems.length > 0 ?
    <Board highscore={highscore} initialState={createState(selectedItems)} updateHighscore={updateHighscore} restart={restart} />
    :
    <Instructions highscore={highscore} setSelectedItems={startGame} categoriesMode={categoriesMode} setCategoriesMode={setCategoriesMode} />
  );
}