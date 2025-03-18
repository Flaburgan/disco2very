import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import classNames from "classnames";
import { getFootprintDetails } from "../lib/ademe-api";
import { displayCO2, round2 } from "../lib/items";
import styles from "../styles/explanation-dialog.module.scss";
import { FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";
import { Item } from "../types/item";
import ChartBar from "./chart-bar";

interface ExplanationDialogProps {
  item: Item;
  onExit: () => void;
}

export default function ExplanationDialog(props: ExplanationDialogProps) {
  const { i18n } = useLingui();
  const footprintDetails = getFootprintDetails();
  const {item, onExit} = props;
  const details = item.source.footprintDetail;
  const usage = item.source.usage;
  const endOfLife = item.source.endOfLife;
  const total = round2(item.source.ecv);

  return (
    <div className={classNames(styles.explanationDialogContainer)} onClick={onExit}>
      <div className={classNames(styles.explanationDialog)}>
        <header className={styles.top}>
          <h2 className={styles.label}>{item.label}:</h2>
        </header>
        <main>
          {
            item.explanation ? <p>{item.explanation}</p> : (
              <ul>
                {details && details.map((detail) => displayDetail(detail, footprintDetails, total, i18n.locale as Locale))}
                {usage && displayUsage(usage, total)}
                {endOfLife && displayEndOfLife(endOfLife, total)}
              </ul>
            )
          }
        </main>
        <footer>
          <h3><Trans>Total:</Trans></h3>
          <div className={styles.result}>
            <strong className={styles[total > 0 ? "result-negative" : "result-positive"]}>{total} kg CO<sub>2</sub>e</strong>
          </div>
          <div className="warning-box">
            <Trans>These values are computed by the french goverment agency ADEME. You can access the raw data
              at <a href="https://base-empreinte.ademe.fr/" rel="noreferrer" target="_blank">base-empreinte.ademe.fr</a> and <a href="https://agribalyse.ademe.fr/" rel="noreferrer" target="_blank">agribalyse.ademe.fr</a>.
             Other countries may have different values, especially those involving electricity consumption.</Trans>
          </div>
        </footer>
      </div>
    </div>
  );
}

function displayDetail(detail: {id: number, value: number}, footprintDetails: FootprintDetails, total: number, locale: Locale): JSX.Element {
  return <li key={"explanation-" + detail.id}>
    <h3>{footprintDetails[detail.id][locale]}</h3>
    <ChartBar value={detail.value} total={total} />
  </li>;
}

function displayUsage(usage: {peryear: number, defaultyears: number}, total: number): JSX.Element {
  const value = usage.peryear * usage.defaultyears;
  return <li>
    <h3><Trans>Usage:</Trans></h3>
    <ChartBar value={value} total={total} />
    <em>{t`${displayCO2(usage.peryear)} per year, estimated lifetime: ${usage.defaultyears} years.`}</em>
  </li>;
}

function displayEndOfLife(endOfLife: number, total: number): JSX.Element {
  return <li>
    <h3><Trans>End of life:</Trans></h3>
    <ChartBar value={endOfLife} total={total} />
  </li>;
}
