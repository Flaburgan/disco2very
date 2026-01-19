/** @type {import('@lingui/conf').LinguiConfig} */
export const locales = ["en", "fr", "es", "de"];
export const sourceLocale = "en";
export const catalogs = [
  {
    path: "<rootDir>/locales/{locale}/messages",
    include: ["components", "lib"]
  },
];
export const format = "po";