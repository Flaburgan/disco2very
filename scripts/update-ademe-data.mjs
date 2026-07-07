// Refresh the ADEME data in data/ademe/ from a local checkout of the
// impactco2 repository (https://github.com/incubateur-ademe/impactco2).
//
// Usage: npm run update-ademe [-- /path/to/impactco2]
//
// It copies the raw equivalents (.ts data files, they contain no imports),
// extracts the item names, and extracts from the impactco2 locales the few
// sections we use (hypothesis texts and footprint detail labels), so the
// rest of the impactco2 translations never reach our bundle.
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

// Item names, translated in fr/en/es (the "value" field is a precomputed
// total we do not want, our totals are computed from the raw data).
const values = JSON.parse(
  fs.readFileSync(path.join(impactco2, "src", "utils", "Equivalent", "values.json"), "utf8")
);
const names = {};
for (const [slug, value] of Object.entries(values)) {
  names[slug] = { fr: value.fr, en: value.en, es: value.es };
}
fs.writeFileSync(path.join(target, "names.json"), JSON.stringify(names, null, 2) + "\n");
console.log(`Extracted ${Object.keys(names).length} item names to data/ademe/names.json`);

// Hypothesis texts and footprint detail labels.
for (const locale of ["fr", "en", "es"]) {
  const messages = JSON.parse(
    fs.readFileSync(path.join(impactco2, "src", "providers", "locales", `${locale}.json`), "utf8")
  );
  const extract = {
    hypothesis: messages.equivalent.hypothesis,
    ecv: messages.equivalent.ecv,
  };
  fs.writeFileSync(
    path.join(target, "locales", `${locale}.json`),
    JSON.stringify(extract, null, 2) + "\n"
  );
}
console.log("Extracted hypothesis and footprint detail labels to data/ademe/locales/{fr,en,es}.json");

// Report what is missing in the hand-maintained German file. Transports are
// restricted to the ones the game includes (see data/transport-distances.json).
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

const de = JSON.parse(fs.readFileSync(path.join(target, "locales", "de.json"), "utf8"));
const fr = JSON.parse(fs.readFileSync(path.join(target, "locales", "fr.json"), "utf8"));

const missing = [];
for (const slug of [...slugs].sort()) {
  if (names[slug] && !de.names[slug]) {
    missing.push(`name for "${slug}" (fr: "${names[slug].fr}")`);
  }
  for (const part of ["pre", "post"]) {
    if (fr.hypothesis[part][slug] && !de.hypothesis[part][slug]) {
      missing.push(`hypothesis.${part} for "${slug}"`);
    }
  }
}
for (const id of Object.keys(fr.ecv)) {
  if (!de.ecv[id]) {
    missing.push(`ecv label for id ${id} (fr: "${fr.ecv[id]}")`);
  }
}

if (missing.length > 0) {
  console.warn(`\ndata/ademe/locales/de.json needs ${missing.length} German translations:`);
  for (const entry of missing) {
    console.warn(`  - ${entry}`);
  }
} else {
  console.log("data/ademe/locales/de.json is complete.");
}
