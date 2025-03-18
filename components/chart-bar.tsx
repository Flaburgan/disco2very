import React from "react";
import styles from "../styles/chart-bar.module.scss";
import { displayCO2 } from "../lib/items";
import classNames from "classnames";

interface ChartBarProps {
  value: number,
  total: number
}

export default function ChartBar(props: ChartBarProps) {
  const {value, total} = props;
  let percent = value * 100 / total;
  let cssClass = "result-negative";
  if (value < 0) {
    percent = -percent;
    cssClass = "result-positive";
  }

  return (<div className={styles.chartBar}>
    <span className={classNames(styles.bar, styles[cssClass])} style={{width: percent + "%"}}></span>
    <span className={styles.co2}>{displayCO2(value)}</span>
  </div>);
}
