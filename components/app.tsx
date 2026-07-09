import React from "react";
import { i18n, Messages } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages.po";
import { messages as frMessages } from "../locales/fr/messages.po";
import { messages as esMessages } from "../locales/es/messages.po";
import { messages as deMessages } from "../locales/de/messages.po";
import { t } from "@lingui/core/macro";
import { locales, sourceLocale } from "../lib/locales";
import { Locale } from "../types/i18n";

const Game = React.lazy(() => import("./game"));

const messagesByLocale: { [L in Locale]: Messages } = {
  en: enMessages,
  fr: frMessages,
  es: esMessages,
  de: deMessages,
};

// Detect the locale and activate it once at module load, before the first
// render (the app is client-only, so navigator is always available here).
const lang = navigator.language.substring(0, 2);
const locale = (locales.includes(lang) ? lang : sourceLocale) as Locale;
i18n.load(locale, messagesByLocale[locale]);
i18n.activate(locale);

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute("content", content);
}

export default function App() {
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
