import { formatter } from "@lingui/format-po";

export { locales, sourceLocale } from "./lib/locales";

/** @type {import('@lingui/conf').LinguiConfig} */
export const catalogs = [
  {
    path: "<rootDir>/locales/{locale}/messages",
    include: ["components", "lib"],
  },
];
export const format = formatter();
