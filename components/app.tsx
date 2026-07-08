import React from "react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import { messages as frMessages } from "../locales/fr/messages";
import { messages as esMessages } from "../locales/es/messages";
import { messages as deMessages } from "../locales/de/messages";
import { t } from "@lingui/core/macro";
import { locales, sourceLocale } from "../lingui.config";

const Game = React.lazy(() => import("./game"));

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

export default function App() {
  const lang = navigator.language.substring(0, 2);
  const locale = locales.includes(lang) ? lang : sourceLocale;
  let messages = enMessages;
  switch (locale) {
    case "fr":
      messages = frMessages;
      break;
    case "es":
      messages = esMessages;
      break;
    case "de":
      messages = deMessages;
      break;
  }
  i18n.load(locale, messages);
  i18n.activate(locale);

  const title = "disCO2very - " + t`Order items to discover their CO2 footprint!`;
  const description = t`disCO2very is a free game to discover the orders of magnitude of the CO2 footprint`;
  const imageAlt = t`The disCO2very logo, featuring a molecule of CO2.`;

  // index.html ships the English tags; localize them once the app is up.
  React.useEffect(() => {
    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:image:alt"]', imageAlt);
  }, [title, description, imageAlt]);

  return (
    <I18nProvider i18n={i18n}>
      <React.Suspense fallback={null}>
        <Game />
      </React.Suspense>
    </I18nProvider>
  );
}
