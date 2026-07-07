import React, { useState } from "react";
import Board from "./board";
import Instructions from "./instructions";
import { Item } from "../types/item";
import { GameState } from "../types/game";
import createState from "../lib/create-state";
import { recordNewGame } from "../lib/server";

export default function Game() {
  if (!localStorage.getItem("app-id") && self.crypto.randomUUID) {
    localStorage.setItem("app-id", self.crypto.randomUUID());
  }

  const [initialState, setInitialState] = useState<GameState | null>(null);
  const [categoriesMode, setCategoriesMode] = useState(false);

  const [highscore, setHighscore] = React.useState<number>(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateHighscore = React.useCallback((score: number) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);

  const restart = (categoriesMode: boolean) => {
    setInitialState(null);
    setCategoriesMode(categoriesMode);
  };

  const startGame = (selectedItems: Item[]) => {
    setInitialState(createState(selectedItems));
    recordNewGame(categoriesMode);
  }

  return (initialState !== null ?
    <Board highscore={highscore} initialState={initialState} updateHighscore={updateHighscore} restart={restart} />
    :
    <Instructions highscore={highscore} setSelectedItems={startGame} categoriesMode={categoriesMode} setCategoriesMode={setCategoriesMode} />
  );
}