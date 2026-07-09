// Black-box test of scripts/update-ademe-data.mjs: build a miniature
// repository and impactco2 checkout in a temporary directory, run the real
// script on them (it locates the repository root relative to its own path,
// so it is copied into the fixture), then check the files it writes and
// what it reports.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));

// Slugs come from the copied category files (upstream single quotes and
// prettier double quotes must both work), except transports where they come
// from transport-distances.json. "sanslogo" has no icon upstream.
const alimentationTs = `export const alimentation = [
  { id: 1, slug: 'pomme' },
  { id: 2, slug: "poire" },
  { id: 3, slug: 'sanslogo' },
];
`;
const deplacementTs = `export const deplacements = [
  { id: 4, slug: 'avion', ecvs: [{ subtitle: 'courtcourrier' }] },
  { id: 5, slug: 'tgv' },
  { id: 6, slug: 'tramway' },
];
`;
const emptyCategories = [
  "numerique.ts",
  "repas.ts",
  "boisson.ts",
  "habillement.ts",
  "electromenager.ts",
  "mobilier.ts",
  "chauffage.ts",
  "fruitsetlegumes.ts",
  "caspratiques.ts",
];

// "poire" has no English name, "inutile" is not used by any category.
const values = {
  pomme: { fr: "Pomme", en: "Apple", es: "Manzana", value: 1 },
  poire: { fr: "Poire", es: "Pera", value: 2 },
  sanslogo: { fr: "Sans logo", en: "No logo", es: "Sin logo", value: 3 },
  "avion-courtcourrier": { fr: "Avion court", en: "Short flight", es: "Vuelo corto", value: 4 },
  tgv: { fr: "TGV", en: "TGV", es: "TGV", value: 5 },
  inutile: { fr: "Inutile", en: "Unused", es: "Inútil", value: 6 },
};

// English is missing the footprint label 6.
const frMessages = {
  equivalent: {
    hypothesis: { pre: { pomme: "Hypothèse pomme" }, post: {} },
    ecv: { 5: "Fabrication", 6: "Usage" },
  },
};
const enMessages = {
  equivalent: { hypothesis: { pre: {}, post: {} }, ecv: { 5: "Manufacturing" } },
};
const esMessages = {
  equivalent: { hypothesis: { pre: {}, post: {} }, ecv: { 5: "Fabricación", 6: "Uso" } },
};

// de.json is missing the "poire" name, the "pomme" hypothesis and label 6.
const deLocale = {
  names: {
    pomme: "Apfel",
    sanslogo: "Ohne Logo",
    "avion-courtcourrier": "Kurzstreckenflug",
    tgv: "TGV",
  },
  hypothesis: { pre: {}, post: {} },
  ecv: { 5: "Herstellung" },
};

function writeTree(root, files) {
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, typeof content === "string" ? content : JSON.stringify(content));
  }
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "update-ademe-test-"));
  writeTree(root, {
    "scripts/update-ademe-data.mjs": fs.readFileSync(
      path.join(repo, "scripts", "update-ademe-data.mjs"),
      "utf8"
    ),
    "data/transport-distances.json": { "avion-courtcourrier": 500, tgv: 450 },
    "data/ademe/0-categories.json": { data: [{ id: 2, slug: "alimentation" }] },
    "data/ademe/locales/de.json": deLocale,
    // pomme.svg is outdated, tgv.svg is up to date, vieux.svg is unused.
    "public/images/ademe/pomme.svg": "<svg>pomme v1</svg>",
    "public/images/ademe/tgv.svg": "<svg>tgv</svg>",
    "public/images/ademe/vieux.svg": "<svg>vieux</svg>",
    "impactco2/src/data/categories/alimentation.ts": alimentationTs,
    "impactco2/src/data/categories/deplacement.ts": deplacementTs,
    ...Object.fromEntries(
      emptyCategories.map((file) => [
        `impactco2/src/data/categories/${file}`,
        "export const empty = [];\n",
      ])
    ),
    "impactco2/src/utils/Equivalent/values.json": values,
    "impactco2/src/providers/locales/fr.json": frMessages,
    "impactco2/src/providers/locales/en.json": enMessages,
    "impactco2/src/providers/locales/es.json": esMessages,
    "impactco2/public/icons/avion.svg": "<svg>avion</svg>",
    "impactco2/public/icons/tgv.svg": "<svg>tgv</svg>",
    "impactco2/public/icons/tramway.svg": "<svg>tramway</svg>",
    "impactco2/public/icons/pomme.svg": "<svg>pomme v2</svg>",
    "impactco2/public/icons/poire.svg": "<svg>poire</svg>",
    "impactco2/public/icons/alimentation.svg": "<svg>alimentation</svg>",
    "impactco2/public/icons/inutile.svg": "<svg>inutile</svg>",
  });
  return root;
}

function runScript(root, impactco2Path) {
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts", "update-ademe-data.mjs"), impactco2Path],
    { encoding: "utf8" }
  );
  assert.equal(result.error, undefined);
  return result;
}

test("updates data, locales and images from an impactco2 checkout", (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const { status, stdout, stderr } = runScript(root, path.join(root, "impactco2"));
  assert.equal(status, 0, stderr);
  const read = (...relative) => fs.readFileSync(path.join(root, ...relative), "utf8");
  const readJson = (...relative) => JSON.parse(read(...relative));

  // The category data files are copied verbatim.
  assert.equal(read("data", "ademe", "categories", "alimentation.ts"), alimentationTs);
  assert.equal(read("data", "ademe", "categories", "repas.ts"), "export const empty = [];\n");

  // Names cover the category slugs (both quote styles) and the transports
  // with a journey length ("tramway" has none), nothing else ("inutile").
  const fr = readJson("data", "ademe", "locales", "fr.json");
  assert.deepEqual(fr.names, {
    "avion-courtcourrier": "Avion court",
    pomme: "Pomme",
    poire: "Poire",
    sanslogo: "Sans logo",
    tgv: "TGV",
  });
  assert.deepEqual(fr.hypothesis, frMessages.equivalent.hypothesis);
  assert.deepEqual(fr.ecv, frMessages.equivalent.ecv);

  // A name missing in a locale is dropped with a warning, a missing
  // footprint label falls back to the marked French text.
  const en = readJson("data", "ademe", "locales", "en.json");
  assert.equal(en.names.poire, undefined);
  assert.match(stderr, /Missing "en" name for "poire" \(fr: "Poire"\)/);
  assert.equal(en.ecv[6], "MISSING_TRANSLATIONS Usage");
  assert.match(stderr, /Missing "en" translation for footprint label 6/);
  assert.equal(readJson("data", "ademe", "locales", "es.json").ecv[6], "Uso");

  // Images: new slugs and the category icon are imported, a transport
  // variant falls back to the icon of its base equivalent, an outdated
  // image is refreshed and an up-to-date one is left alone.
  const image = (name) => path.join(root, "public", "images", "ademe", `${name}.svg`);
  assert.equal(read("public", "images", "ademe", "poire.svg"), "<svg>poire</svg>");
  assert.equal(read("public", "images", "ademe", "alimentation.svg"), "<svg>alimentation</svg>");
  assert.equal(read("public", "images", "ademe", "avion-courtcourrier.svg"), "<svg>avion</svg>");
  assert.equal(read("public", "images", "ademe", "pomme.svg"), "<svg>pomme v2</svg>");
  assert.match(stdout, /Copied icons to public\/images\/ademe\/ \(3 added, 1 updated\)/);
  assert.equal(fs.existsSync(image("sanslogo")), false);
  assert.match(stderr, /No icon for "sanslogo"/);
  assert.equal(fs.existsSync(image("inutile")), false);
  assert.match(stderr, /1 images no slug uses.*: vieux/);

  // The gaps in the hand-maintained German file are reported.
  assert.match(stderr, /de\.json needs 3 translations/);
  assert.match(stderr, /name for "poire"/);
  assert.match(stderr, /hypothesis\.pre for "pomme"/);
  assert.match(stderr, /ecv label for id 6/);
});

test("rejects a path that is not an impactco2 checkout", (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const { status, stderr } = runScript(root, path.join(root, "nulle-part"));
  assert.equal(status, 1);
  assert.match(stderr, /impactco2 repository not found/);
});
