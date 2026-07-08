import { Trans } from "@lingui/react/macro";
import React, { useState } from "react";
import { flushSync } from "react-dom";
import { GameState } from "../types/game";
import useCardDrag from "../lib/use-card-drag";
import { animateBadlyPlacedItem } from "../lib/auto-move";
import { checkCorrect } from "../lib/items";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/board.module.scss";
import Hearts from "./hearts";
import GameOver from "./game-over";
import Button from "./button";

interface Props {
  highscore: number;
  initialState: GameState;
  updateHighscore: (score: number) => void;
  restart: (categoriesMode: boolean) => void;
}

export default function Board(props: Props) {
  const { highscore, initialState, updateHighscore, restart } = props;
  const [state, setState] = useState<GameState>(initialState);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const playedListRef = React.useRef<HTMLDivElement>(null);

  const playAgain = (toCategories: boolean) => {
    if (toCategories) {
      restart(true);
    } else {
      setState(initialState);
    }
  };

  function onDrop(index: number) {
    if (state.next === null) {
      return;
    }

    const item = { ...state.next };
    const newDeck = [...state.deck];
    const newPlayed = [...state.played];
    const { correct, delta } = checkCorrect(newPlayed, item, index);
    newPlayed.splice(index, 0, {
      ...state.next,
      played: { correct },
    });
    const randomIndex = Math.floor(Math.random() * newDeck.length);
    const newNext = newDeck[randomIndex];
    newDeck.splice(randomIndex, 1);

    setState({
      ...state,
      deck: newDeck,
      next: newNext,
      played: newPlayed,
      lives: correct ? state.lives : state.lives - 1,
      badlyPlaced: correct
        ? null
        : {
            index,
            delta,
          },
    });
  }

  const { isDragging, dropIndex, handleCardPointerDown } = useCardDrag({
    disabled:
      state.badlyPlaced !== null || state.next === null || state.lives <= 0,
    scrollContainerRef,
    playedListRef,
    onDrop,
  });

  // Once a badly placed item is rendered at its drop position, slide it to
  // its correct position and commit the new order.
  React.useLayoutEffect(() => {
    if (
      state.badlyPlaced === null ||
      scrollContainerRef.current === null ||
      playedListRef.current === null
    ) {
      return;
    }
    const { index, delta } = state.badlyPlaced;
    const animation = animateBadlyPlacedItem(
      scrollContainerRef.current,
      playedListRef.current,
      index,
      delta,
    );

    animation.finished.then((completed) => {
      if (!completed) {
        return;
      }
      // Commit the new order and only then drop the animated transforms, in
      // the same task, so the browser never paints an intermediate frame.
      flushSync(() => {
        setState((prev) => {
          if (prev.badlyPlaced === null) {
            return prev;
          }
          const newPlayed = [...prev.played];
          const [item] = newPlayed.splice(index, 1);
          newPlayed.splice(index + delta, 0, item);
          return { ...prev, played: newPlayed, badlyPlaced: null };
        });
      });
      animation.cancel();
    });

    return () => animation.cancel();
  }, [state.badlyPlaced]);

  const score = React.useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  React.useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);

  return (
    <div
      className={
        styles.wrapper +
        " " +
        (isDragging || state.badlyPlaced !== null ? "dragging" : "notDragging")
      }
    >
      <div className={styles.gameHeader}>
        <div className={styles.actionsContainer}>
          <Button onClick={() => restart(false)} small>
            <Trans>Back</Trans>
          </Button>
          <Button onClick={() => playAgain(false)} small minimal>
            <Trans>Restart</Trans>
          </Button>
        </div>
        <Hearts lives={state.lives} />
      </div>
      <div ref={scrollContainerRef} className={styles["top-panel"]}>
        <PlayedItemList
          dragging={isDragging}
          dropIndex={dropIndex}
          items={state.played}
          listRef={playedListRef}
        />
      </div>
      <div className={styles["bottom-panel"]}>
        {state.lives > 0 && state.next ? (
          <>
            {/* We keep the container outside of the if so the space is still used when the arrow disappears and the bottom part doesn't move */}
            <div className={styles.arrowContainer}>
              {state.played.length === 1 && (
                <img className={styles.arrow} src="images/arrow.svg" />
              )}
            </div>
            <NextItemList
              next={state.next}
              onCardPointerDown={handleCardPointerDown}
            />
          </>
        ) : (
          <GameOver
            highscore={highscore}
            resetGame={playAgain}
            score={score}
            lives={state.lives}
          />
        )}
      </div>
    </div>
  );
}
