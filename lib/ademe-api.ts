
import { t } from "@lingui/core/macro";
import ademeCategories from "../data/ademe/0-categories.json";
import enNumerique from "../data/ademe/en/1-numerique.json";
import enPracticalCases from "../data/ademe/en/13-caspratiques.json";
import enAlimentation from "../data/ademe/en/2-alimentation.json";
import enBoisson from "../data/ademe/en/3-boisson.json";
import enTransport from "../data/ademe/en/4-transport.json";
import enHabillement from "../data/ademe/en/5-habillement.json";
import enElectromenager from "../data/ademe/en/6-electromenager.json";
import enMobilier from "../data/ademe/en/7-mobilier.json";
import enChauffage from "../data/ademe/en/8-chauffage.json";
import enVegetablesAndFruits from "../data/ademe/en/9-fruitsetlegumes.json";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories.json";
import frNumerique from "../data/ademe/fr/1-numerique.json";
import frPracticalCases from "../data/ademe/fr/13-caspratiques.json";
import frAlimentation from "../data/ademe/fr/2-alimentation.json";
import frBoisson from "../data/ademe/fr/3-boisson.json";
import frTransport from "../data/ademe/fr/4-transport.json";
import frHabillement from "../data/ademe/fr/5-habillement.json";
import frElectromenager from "../data/ademe/fr/6-electromenager.json";
import frMobilier from "../data/ademe/fr/7-mobilier.json";
import frChauffage from "../data/ademe/fr/8-chauffage.json";
import frVegetablesAndFruits from "../data/ademe/fr/9-fruitsetlegumes.json";
import esNumerique from "../data/ademe/es/1-numerique.json";
import esPracticalCases from "../data/ademe/es/13-caspratiques.json";
import esAlimentation from "../data/ademe/es/2-alimentation.json";
import esBoisson from "../data/ademe/es/3-boisson.json";
import esTransport from "../data/ademe/es/4-transport.json";
import esHabillement from "../data/ademe/es/5-habillement.json";
import esElectromenager from "../data/ademe/es/6-electromenager.json";
import esMobilier from "../data/ademe/es/7-mobilier.json";
import esChauffage from "../data/ademe/es/8-chauffage.json";
import deNumerique from "../data/ademe/de/1-numerique.json";
import dePracticalCases from "../data/ademe/de/13-caspratiques.json";
import deAlimentation from "../data/ademe/de/2-alimentation.json";
import deBoisson from "../data/ademe/de/3-boisson.json";
import deTransport from "../data/ademe/de/4-transport.json";
import deHabillement from "../data/ademe/de/5-habillement.json";
import deElectromenager from "../data/ademe/de/6-electromenager.json";
import deMobilier from "../data/ademe/de/7-mobilier.json";
import deChauffage from "../data/ademe/de/8-chauffage.json";
import deVegetablesAndFruits from "../data/ademe/de/9-fruitsetlegumes.json";
import esVegetablesAndFruits from "../data/ademe/es/9-fruitsetlegumes.json";
import { AdemeCategory, AdemeECV, FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";
import { Item } from "../types/item";

// The raw ADEME files, one per locale and category id.
// Imports have to stay literal so the bundler can resolve them.
const rawDataByLocale: { [L in Locale]: { [categoryId: number]: { data: AdemeECV[] } } } = {
  en: {
    1: enNumerique,
    2: enAlimentation,
    3: enBoisson,
    4: enTransport,
    5: enHabillement,
    6: enElectromenager,
    7: enMobilier,
    8: enChauffage,
    9: enVegetablesAndFruits,
    13: enPracticalCases,
  },
  fr: {
    1: frNumerique,
    2: frAlimentation,
    3: frBoisson,
    4: frTransport,
    5: frHabillement,
    6: frElectromenager,
    7: frMobilier,
    8: frChauffage,
    9: frVegetablesAndFruits,
    13: frPracticalCases,
  },
  es: {
    1: esNumerique,
    2: esAlimentation,
    3: esBoisson,
    4: esTransport,
    5: esHabillement,
    6: esElectromenager,
    7: esMobilier,
    8: esChauffage,
    9: esVegetablesAndFruits,
    13: esPracticalCases,
  },
  de: {
    1: deNumerique,
    2: deAlimentation,
    3: deBoisson,
    4: deTransport,
    5: deHabillement,
    6: deElectromenager,
    7: deMobilier,
    8: deChauffage,
    9: deVegetablesAndFruits,
    13: dePracticalCases,
  },
};

const allItemsByLocale = {} as { [L in Locale]: Item[] };
const itemsBySlugByLocale = {} as { [L in Locale]: Map<string, Item> };

for (const locale of Object.keys(rawDataByLocale) as Locale[]) {
  const items: Item[] = [];
  for (const [categoryId, file] of Object.entries(rawDataByLocale[locale])) {
    items.push(...computeItemsForCategory(Number(categoryId), file.data));
  }
  allItemsByLocale[locale] = items;

  // Index by slug for direct lookups. Keep the first occurrence, like the
  // previous linear scan did.
  const itemsBySlug = new Map<string, Item>();
  for (const item of items) {
    if (!itemsBySlug.has(item.source.slug)) {
      itemsBySlug.set(item.source.slug, item);
    }
  }
  itemsBySlugByLocale[locale] = itemsBySlug;
}

const categories: Map<number, AdemeCategory> = new Map();
ademeCategories.data.forEach(category => categories.set(category.id, category));

const defaultItemSlugs = new Set([
  "smartphone",
  "television",
  "ordinateurportable",
  "repasavecduboeuf",
  "repasvegetarien",
  "repasavecdupoulet",
  "eauenbouteille",
  "vin",
  "laitdevache",
  "jeans",
  "tshirtencoton",
  "pullenlaine",
  "fourelectrique",
  "lavelinge",
  "refrigirateur",
  "chaiseenbois",
  "lit",
  "chauffagegaz",
  "chauffagefioul",
  "chauffageelectrique",
  "pompeachaleur",
  "avion-moyencourrier",
  "tgv",
  "voiturethermique",
  "voitureelectrique"
]);

export function getDefaultItems(locale: Locale): Item[] {
  return allItemsByLocale[locale].filter(item => defaultItemSlugs.has(item.source.slug));
}

export function getItemFromSlug(slug: string, locale: Locale): Item | undefined {
  return itemsBySlugByLocale[locale].get(slug);
}

export function getCategories(): Map<number, AdemeCategory> {
  return categories;
}

export function getFootprintDetails(): FootprintDetails {
  return footprintDetailCategories;
}

export function getItemsFromCategoryId(categoryId: number, locale: Locale): Item[] {
  return allItemsByLocale[locale].filter(item => item.categoryId === categoryId);
}

// We have to make some computation on the data to make it better for users
// Functions below are only doing that

type ComputeItemFunc = (element: AdemeECV, coeff: number) => { label: string, description: string, explanation: string };

const transportCoeff: { [key: string]: number } = {
  "avion-courtcourrier": 800,
  "avion-moyencourrier": 2000,
  "avion-longcourrier": 6000,
  "tgv": 700,
  "intercites": 400,
  "voiturethermique": 100,
  "voitureelectrique": 100,
  "autocar": 400,
  "velo": 5,
  "veloelectrique": 5,
  "busthermique": 5,
  "tramway": 5,
  "metro": 5,
  "scooter": 5,
  "moto": 100,
  "rer": 20,
  "ter": 100,
  "buselectrique": 5,
  "trottinette": 5,
  "busgnv": 5,
  "marche": 2
}

function computeItemsForCategory(categoryId: number, data: AdemeECV[]): Item[] {
  const computeItemFunc: ComputeItemFunc = getComputeFunction(categoryId);
  return data.map(element => {
    const coeff = getCoefficient(categoryId, element);
    const source = withCoefficient(element, coeff);
    return {
      id: source.slug,
      categoryId: categoryId,
      source,
      ...computeItemFunc(source, coeff)
    }
  });
}

function getCoefficient(categoryId: number, element: AdemeECV): number {
  switch (categoryId) {
    case 4: { // Transport: from 1km to a typical journey length
      const coeff = transportCoeff[element.slug];
      if (coeff === undefined) {
        console.warn(`Missing transport coefficient for "${element.slug}", keeping the 1km value`);
        return 1;
      }
      return coeff;
    }
    case 8: // Heating: from 1m² to 60m², from 12 months to 1 month
      return 60 / 12;
    default:
      return 1;
  }
}

// Returns a scaled copy: the imported JSON objects are shared module state
// and must never be mutated.
function withCoefficient(element: AdemeECV, coeff: number): AdemeECV {
  const copy: AdemeECV = {
    ...element,
    ecv: element.ecv * coeff,
    footprintDetail: element.footprintDetail?.map(detail => ({ ...detail, value: detail.value * coeff })),
    usage: element.usage ? { ...element.usage } : undefined,
  };
  if (copy.footprint !== undefined) {
    copy.footprint = copy.footprint * coeff;
  }
  return copy;
}

function getComputeFunction(categoryId: number): ComputeItemFunc {
  switch (categoryId) {
    case 1: // Digital
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: getDescriptionForDefaultYear(element),
          explanation: ""
        }
      };
    case 2: // Food
      return (element: AdemeECV) => {
        return {
          label: element.name + (element.slug.startsWith("repas") ? "" : " (1kg)"),
          description: "",
          explanation: ""
        }
      };
    case 3: // Drinks
      return (element: AdemeECV) => {
        return {
          label: element.name + " (1L)",
          description: "",
          explanation: ""
        }
      };
    case 4: // Transport
      return (element: AdemeECV, coeff: number) => {
        return {
          label: element.name + ` (${coeff}km)`,
          description: "",
          explanation: ""
        }
      };
    case 5: // Clothing
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: "",
          explanation: ""
        }
      };
    case 6: // Household appliance
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: getDescriptionForDefaultYear(element),
          explanation: ""
        }
      };
    case 7: // Furnitures
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: getDescriptionForDefaultYear(element),
          explanation: ""
        }
      };
    case 8: // Heating
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: t`<strong>per month</strong> for 60m²`,
          explanation: t`Impact of one month of heating a house of 60m², spreading the consumption over the year.`,
        }
      };
    case 9: // Vegetables and fruits
      return (element: AdemeECV) => {
        return {
          label: element.name + " (1kg)",
          description: t`Bought in January`,
          explanation: ""
        }
      };
    // case 10: // TODO Usage numérique needs more work
    case 13: // Practical cases
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: "",
          explanation: ""
        }
      };
    default:
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: "",
          explanation: ""
        }
      };
  }
}

function getDescriptionForDefaultYear(element: AdemeECV) {
  let description = "";
  if (element.usage) {
    const defaultYears = element.usage.defaultyears;
    description = t`Purchase and usage for ${defaultYears} years.`;
  }
  return description;
}
