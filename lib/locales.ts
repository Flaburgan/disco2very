// Shared between the app (locale detection in components/app.tsx) and the
// Lingui tooling (lingui.config.ts): keeps the app from bundling the config,
// which imports the PO formatter since Lingui 6.
export const locales = ["en", "fr", "es", "de"];
export const sourceLocale = "en";
