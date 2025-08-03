import React, { JSX } from "react";
import styles from "../styles/score.module.scss";

interface Props {
  score: number;
  children: JSX.Element;
}

export default function Score(props: Props) {
  const { score, children } = props;

  let backgroundColor;
  if (score >= 20) {
    backgroundColor = "#FFC940";
  } else if (score >= 10) {
    backgroundColor = "#A7B6C2";
  } else {
    backgroundColor = "#C99765";
  }

  return (
    <div className={styles.score} style={{ backgroundColor }}>
      <div className={styles.title}>{children}</div>
      <div className={styles.value}>{score}</div>
    </div>
  );
}
