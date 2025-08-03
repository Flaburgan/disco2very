import React from "react";
import styles from "../styles/hearts.module.scss";


interface Props {
  lives: number;
}

export default function Hearts(props: Props) {
  const { lives } = props;

  return (
    <div className={styles.hearts}>
      {lives}
      <img className={styles.heart} src="./images/heart.svg" />
    </div>
  );
}
