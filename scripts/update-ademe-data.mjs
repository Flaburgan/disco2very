// Refresh the ADEME data in data/ademe/ from a local checkout of the
// impactco2 repository (https://github.com/incubateur-ademe/impactco2).
//
// Usage: npm run update-ademe [-- /path/to/impactco2]
//
// It copies the raw equivalents (.ts data files, they contain no imports),
// and builds one data/ademe/locales/{locale}.json per locale holding the
// item names and the few translated sections we use (hypothesis texts and
// footprint detail labels), so the rest of the impactco2 translations never
// reach our bundle and the app only loads the locale it displays.
// German is not translated upstream: data/ademe/locales/de.json is
// maintained by hand in this repository, and this script only reports the
// entries that are missing in it after an update.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const impactco2 = path.resolve(process.argv[2] ?? path.join(root, "impactco2"));
const target = path.join(root, "data", "ademe");

if (!fs.existsSync(path.join(impactco2, "src", "data", "categories"))) {
  console.error(`impactco2 repository not found at ${impactco2}`);
  console.error("Usage: npm run update-ademe [-- /path/to/impactco2]");
  process.exit(1);
}

// The categories used by the game (see lib/ademe-api.ts).
const dataFiles = [
  "numerique.ts",
  "alimentation.ts",
  "repas.ts",
  "boisson.ts",
  "deplacement.ts",
  "habillement.ts",
  "electromenager.ts",
  "mobilier.ts",
  "chauffage.ts",
  "fruitsetlegumes.ts",
  "caspratiques.ts",
];

fs.mkdirSync(path.join(target, "categories"), { recursive: true });
fs.mkdirSync(path.join(target, "locales"), { recursive: true });

for (const file of dataFiles) {
  fs.copyFileSync(
    path.join(impactco2, "src", "data", "categories", file),
    path.join(target, "categories", file)
  );
}
console.log(`Copied ${dataFiles.length} data files to data/ademe/categories/`);

// The slugs the game includes: every equivalent of the copied categories,
// with transports restricted to the ones with a defined journey length
// (see data/transport-distances.json).
const transportSlugs = Object.keys(
  JSON.parse(fs.readFileSync(path.join(root, "data", "transport-distances.json"), "utf8"))
);
const slugs = new Set(transportSlugs);
for (const file of dataFiles) {
  if (file === "deplacement.ts") {
    continue;
  }
  const content = fs.readFileSync(path.join(target, "categories", file), "utf8");
  for (const [, slug] of content.matchAll(/slug: '([^']+)'/g)) {
    slugs.add(slug);
  }
}

// Item names, translated in fr/en/es (the "value" field is a precomputed
// total we do not want, our totals are computed from the raw data).
const values = JSON.parse(
  fs.readFileSync(path.join(impactco2, "src", "utils", "Equivalent", "values.json"), "utf8")
);
const names = {};
for (const [slug, value] of Object.entries(values)) {
  names[slug] = { fr: value.fr, en: value.en, es: value.es };
}

// One file per locale with everything the app needs for that locale: item
// names (only the slugs the game uses), hypothesis texts and footprint
// detail labels. Same shape as the hand-maintained de.json. Each file must be
// self-sufficient (the app only loads one of them), so a footprint detail
// label missing in a translation gets the French text prefixed with
// MISSING_TRANSLATIONS, plus a warning below, so the gap gets noticed.
const frEcv = JSON.parse(
  fs.readFileSync(path.join(impactco2, "src", "providers", "locales", "fr.json"), "utf8")
).equivalent.ecv;
for (const locale of ["fr", "en", "es"]) {
  const messages = JSON.parse(
    fs.readFileSync(path.join(impactco2, "src", "providers", "locales", `${locale}.json`), "utf8")
  );
  const localeNames = {};
  for (const slug of [...slugs].sort()) {
    if (names[slug]?.[locale]) {
      localeNames[slug] = names[slug][locale];
    } else if (names[slug]) {
      // No fallback for names: the game drops the item entirely at runtime.
      console.warn(`Missing "${locale}" name for "${slug}" (fr: "${names[slug].fr}")`);
    }
  }
  const ecv = {};
  for (const [id, frLabel] of Object.entries(frEcv)) {
    if (messages.equivalent.ecv[id]) {
      ecv[id] = messages.equivalent.ecv[id];
    } else {
      console.warn(`Missing "${locale}" translation for footprint label ${id} (fr: "${frLabel}")`);
      ecv[id] = `MISSING_TRANSLATIONS ${frLabel}`;
    }
  }
  const extract = {
    names: localeNames,
    hypothesis: messages.equivalent.hypothesis,
    ecv,
  };
  fs.writeFileSync(
    path.join(target, "locales", `${locale}.json`),
    JSON.stringify(extract, null, 2) + "\n"
  );
}
console.log("Extracted names, hypothesis and footprint detail labels to data/ademe/locales/{fr,en,es}.json");

// Report what is missing in the hand-maintained files (locales that are not
// translated upstream and are maintained in this repository).
const handMaintainedLocales = ["de"];
const fr = JSON.parse(fs.readFileSync(path.join(target, "locales", "fr.json"), "utf8"));

for (const locale of handMaintainedLocales) {
  const own = JSON.parse(
    fs.readFileSync(path.join(target, "locales", `${locale}.json`), "utf8")
  );

  const missing = [];
  for (const slug of [...slugs].sort()) {
    if (names[slug] && !own.names[slug]) {
      missing.push(`name for "${slug}" (fr: "${names[slug].fr}")`);
    }
    for (const part of ["pre", "post"]) {
      if (fr.hypothesis[part][slug] && !own.hypothesis[part][slug]) {
        missing.push(`hypothesis.${part} for "${slug}"`);
      }
    }
  }
  for (const id of Object.keys(fr.ecv)) {
    if (!own.ecv[id]) {
      missing.push(`ecv label for id ${id} (fr: "${fr.ecv[id]}")`);
    }
  }

  if (missing.length > 0) {
    console.warn(`\ndata/ademe/locales/${locale}.json needs ${missing.length} translations:`);
    for (const entry of missing) {
      console.warn(`  - ${entry}`);
    }
  } else {
    console.log(`data/ademe/locales/${locale}.json is complete.`);
  }
}
