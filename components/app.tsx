import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "../locales/en/messages";
import { messages as frMessages } from "../locales/fr/messages";
import { messages as esMessages } from "../locales/es/messages";
import { messages as deMessages } from "../locales/de/messages";
import { t } from "@lingui/core/macro";
import { locales, sourceLocale } from "../lingui.config";

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

  const Game = dynamic(() => import("./game"));

  return <I18nProvider i18n={i18n}>
    <Head>
      <title>disCO2very - {t`Order items to discover their CO2 footprint!`}</title>
      <meta name="description" content={t`disCO2very is a free game to discover the orders of magnitude of the CO2 footprint`} />
      <meta property="og:description" content={t`disCO2very is a free game to discover the orders of magnitude of the CO2 footprint`} />
      <meta property="og:image:alt" content={t`The disCO2very logo, featuring a molecule of CO2.`} />
    </Head>
    <Game />
  </I18nProvider>
}
