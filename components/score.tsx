import React, { JSX } from "react";
import styles from "../styles/score.module.scss";
import { ScoreTier, scoreTier } from "../lib/items";

interface Props {
  score: number;
  children: JSX.Element;
}

const tierColors: Record<ScoreTier, string> = {
  gold: "#FFC940",
  silver: "#A7B6C2",
  bronze: "#C99765",
};

export default function Score(props: Props) {
  const { score, children } = props;

  const backgroundColor = tierColors[scoreTier(score)];

  return (
    <div className={styles.score} style={{ backgroundColor }}>
      <div className={styles.title}>{children}</div>
      <div className={styles.value}>{score}</div>
    </div>
  );
}
