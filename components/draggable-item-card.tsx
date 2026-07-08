import React from "react";
import { cx } from "../lib/cx";
import { Item, PlayedItem } from "../types/item";
import ExplanationDialog from "./explanation-dialog";
import styles from "../styles/draggable-item-card.module.scss";
import ItemCard from "./item-card";

type Props = {
  className?: string;
  draggable?: boolean;
  item: Item | PlayedItem;
  onPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
};

export default function DraggableItemCard(props: Props) {
  const { className, draggable, item, onPointerDown } = props;
  const [showExplanation, setShowExplanation] = React.useState<boolean>(false);
  const played = "played" in item;

  return (<>
    <div
      className={cx(styles.itemCard, className, {
        [styles.draggable]: draggable,
        played,
      })}
      data-timeline-card={played ? "" : undefined}
      onPointerDown={draggable ? onPointerDown : undefined}
      onClick={() => {
        if (played) {
          setShowExplanation(true);
        }
      }}
    >
      <ItemCard item={item} />
      <div className="hoverInterrogation">
        <div>?</div>
      </div>
      <div className="clickInterrogation">
        <span>?</span>
      </div>
    </div>
    {showExplanation && <ExplanationDialog item={item} onExit={() => setShowExplanation(false)} />}
  </>);
}
