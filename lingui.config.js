/** @type {import('@lingui/conf').LinguiConfig} */
export const locales = ["en", "fr", "es"];
export const sourceLocale = "en";
export const catalogs = [
  {
    path: "<rootDir>/locales/{locale}/messages",
    include: ["components", "lib"]
  },
];
export const format = "po";