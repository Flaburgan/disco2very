import React from "react";
import { Item } from "../types/item";
import DraggableItemCard from "./draggable-item-card";
import styles from "../styles/next-item-list.module.scss";

interface NextItemListProps {
  next: Item | null;
  onCardPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

export default function NextItemList(props: NextItemListProps) {
  const { next, onCardPointerDown } = props;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper + " bordered-area"}>
        {next && (
          <DraggableItemCard
            draggable
            item={next}
            key={next.id}
            onPointerDown={onCardPointerDown}
          />
        )}
      </div>
    </div>
  );
}
