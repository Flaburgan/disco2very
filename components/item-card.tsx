import React from "react";
import classNames from "classnames";
import { Item, PlayedItem } from "../types/item";
import { round2 } from "../lib/items";
import { getCategories } from "../lib/ademe-api";
import styles from "../styles/item-card.module.scss";

type Props = {
  item: Item | PlayedItem;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { item } = props;
  const categories = getCategories();

  return (
    <div
      className={styles.front}
    >
      <header className={styles.top}>
        <h2 className={styles.label}>{capitalize(item.label)}</h2>
        <img className={styles.categoryLogo} src={`./images/ademe/${categories.get(item.categoryId)!.slug}.svg`} />
      </header>
      <main>
        <div className={styles.description} dangerouslySetInnerHTML={{__html: item.description}}></div>
        <div className={styles.imageContainer}>
          <img src={`./images/ademe/${item.id}.svg`} />
        </div>
      </main>
      <div
        className={classNames(styles.bottom, {
          [styles.correct]: "played" in item && item.played.correct,
          [styles.incorrect]: "played" in item && !item.played.correct,
        })}
      >
        <span>
          {"played" in item ? round2(item.source.ecv) : "?"} kg CO<sub>2</sub>
        </span>
      </div>
    </div>
  );
}
