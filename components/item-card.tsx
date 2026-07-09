import { getCategories } from "../lib/ademe-api";
import { cx } from "../lib/cx";
import { round2 } from "../lib/items";
import styles from "../styles/item-card.module.scss";
import { Locale } from "../types/i18n";
import { useLingui } from "@lingui/react/macro";
import { Item, PlayedItem } from "../types/item";

type Props = {
  item: Item | PlayedItem;
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ItemCard(props: Props) {
  const { i18n } = useLingui();
  const locale = i18n.locale as Locale;
  const { item } = props;
  const categories = getCategories();

  return (
    <div className={styles.front}>
      <header className={styles.top}>
        <h2 className={styles.label}>{capitalize(item.label)}</h2>
        <img
          className={styles.categoryLogo}
          src={`./images/ademe/${categories.get(item.categoryId)!.slug}.svg`}
          alt={`${categories.get(item.categoryId)!.name[locale]} logo`}
        />
      </header>
      <main>
        <div
          className={styles.description}
          // The descriptions come from the bundled ADEME data and contain
          // markup (e.g. <sub>), they are not user input.
          // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
          dangerouslySetInnerHTML={{ __html: item.description }}
        ></div>
        <div className={styles.imageContainer}>
          <img
            src={`./images/ademe/${item.id}.svg`}
            alt={`${item.label} logo`}
          />
        </div>
      </main>
      <div
        className={cx(styles.bottom, {
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
