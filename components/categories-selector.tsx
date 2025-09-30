import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import React, { useState } from "react";
import { loadCategories } from "../lib/ademe-api";
import classNames from "classnames";
import styles from "../styles/categories-selector.module.scss";
import { Item } from "../types/item";
import Button from "./button";
import { loadCategoryItems } from "../lib/ademe-api";
import { useLingui } from "@lingui/react";
import { Locale } from "../types/i18n";

interface CategoriesSelectorProps {
  setSelectedItems: (selectedItems: Item[]) => void;
  setCategoriesMode: (categoriesMode: boolean) => void;
}

export default function CategoriesSelector({setSelectedItems, setCategoriesMode}: CategoriesSelectorProps) {
  const { i18n } = useLingui();
  const locale = i18n.locale as Locale;
  const categories = loadCategories();

  const [selectedCategories, setSelectedCategories] = useState(new Set<number>());

  const updateCategories = (id: number) => {
    // Some categories are not available yet
    if (id === 10) {
      alert(t`This category is not yet available.`);
    } else {
      setSelectedCategories(prevSet => {
        const newSet = new Set(prevSet); // We create a new Set to force a React rerender
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    }
  };

  return (
    <>
      <div>
        <h3><Trans>Select the categories you want to play with:</Trans></h3>
        <div className={classNames(styles.categoriesSelection)}>
          {[...categories.values()].map((category) => {
            const id = category.id;
            return (
              <div key={id} className={selectedCategories.has(id) ? classNames(styles.selected) : ""} onClick={() => updateCategories(id)}>
                <div>
                  <h3>{category.name[locale]}</h3>
                  <img src={`./images/ademe/${category.slug}.svg`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.startGameContainer}>
        <Button onClick={() => { setSelectedItems(getItemsFromCategories(selectedCategories, locale)); }} disabled={selectedCategories.size === 0}><Trans>Start game</Trans></Button>
        <Button onClick={() => setCategoriesMode(false)} minimal={true}><Trans>Back</Trans></Button>
      </div>
    </>
  );
}

function getItemsFromCategories(selectedCategories: Set<number>, locale: Locale) {
  const items: Item[] = [];
  selectedCategories.forEach(id => items.push(...loadCategoryItems(id, locale)));
  return items;
}
