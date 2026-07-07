import React from "react";
import classNames from "classnames";
import { Item } from "../types/item";
import DraggableItemCard from "./draggable-item-card";
import styles from "../styles/played-item-list.module.scss";

interface PlayedItemListProps {
  // True while the user is dragging the next card around.
  dragging: boolean;
  // Index at which the dragged card would be inserted: the timeline opens a
  // gap there. Null when no card is hovering over the timeline.
  dropIndex: number | null;
  items: Item[];
  listRef: React.Ref<HTMLDivElement>;
}

export default function PlayedItemList(props: PlayedItemListProps) {
  const { dragging, dropIndex, items, listRef } = props;

  return (
    <div className={styles.listContainer}>
      <div
        ref={listRef}
        className={classNames(styles.items, { [styles.dragging]: dragging })}
      >
        <div className={styles.emptyItem + " bordered-area"}>-</div>
        {items.map((item, index) => (
          <DraggableItemCard
            className={classNames({ [styles.gapBefore]: dropIndex === index })}
            item={item}
            key={item.id}
          />
        ))}
        <div
          className={classNames(styles.emptyItem, "bordered-area", {
            [styles.gapBefore]: dropIndex === items.length,
          })}
        >
          +
        </div>
      </div>
    </div>
  );
}
