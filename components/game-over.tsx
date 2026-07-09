import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import React from "react";
import styles from "../styles/game-over.module.scss";
import Button from "./button";
import Score from "./score";
import { ScoreTier, scoreTier } from "../lib/items";

interface Props {
  highscore: number;
  resetGame: (categoriesMode: boolean) => void;
  score: number;
  lives: number;
}

const defaultShareText = <Trans>Share your score</Trans>;

const medals: Record<ScoreTier, string> = {
  gold: "🥇 ",
  silver: "🥈 ",
  bronze: "🥉 ",
};

function getMedal(score: number): string {
  return medals[scoreTier(score)];
}

export default function GameOver(props: Props) {
  const { highscore, resetGame, score, lives } = props;

  const [shareText, setShareText] = React.useState(defaultShareText);

  const share = React.useCallback(async () => {
    const guess = t`Guess the CO2 footprint!`;
    const streak = t`This streak`;
    const bestStreak = t`Best streak`;
    await navigator?.clipboard?.writeText(
      `🌍 disCO2very 🚲
${guess}

${getMedal(score)}${streak}: ${score}\n${getMedal(highscore)}${bestStreak}: ${highscore}

https://disco2very.org`,
    );
    setShareText(<Trans>Copied!</Trans>);
    setTimeout(() => {
      setShareText(defaultShareText);
    }, 2000);
  }, [highscore, score]);

  return (
    <div className={styles.gameOver}>
      {lives > 0 ? (
        <>
          <h1>
            <Trans>Congratulations!</Trans>
          </h1>
          <h2>
            <Trans>You ordered all the cards!</Trans>
          </h2>
          <h3>
            <Trans>You should probably select more categories?</Trans>
          </h3>
        </>
      ) : (
        <>
          <h1>
            <Trans>Game over</Trans>
          </h1>
          <h2>
            <Trans>Try again!</Trans>
          </h2>
        </>
      )}
      <div className={styles.scoresWrapper}>
        <div className={styles.score}>
          <Score score={score}>
            <Trans>This streak</Trans>
          </Score>
        </div>
        <div className={styles.score}>
          <Score score={highscore}>
            <Trans>Best streak</Trans>
          </Score>
        </div>
      </div>
      <div onClick={share} className={styles.shareAction}>
        {shareText}
      </div>
      <p className={styles.buttons}>
        <Button onClick={() => resetGame(false)} minimal={lives > 0}>
          <Trans>Play again</Trans>
        </Button>
        <Button onClick={() => resetGame(true)} minimal={lives === 0}>
          <Trans>Select categories</Trans>
        </Button>
      </p>
    </div>
  );
}
