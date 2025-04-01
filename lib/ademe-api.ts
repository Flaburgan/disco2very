
import { Item } from "../types/item";
import ademeCategories from "../data/ademe/0-categories.json";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories.json";
import { AdemeCategory, AdemeECV, FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";
import { t } from "@lingui/macro";

export async function getDefaultItems(locale: Locale): Promise<Item[]> {
  const slugs = [
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
  ];

  const selectedItems: Item[] = [];
  const allItems = await getAllItems(locale);
  allItems.forEach(item => {
    if (slugs.includes(item.source.slug)) {
      selectedItems.push(item);
    }
  });
  return selectedItems;
}

export async function getItemFromSlug(slug: string, locale: Locale): Promise<Item | undefined> {
  const allItems = await getAllItems(locale);
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].source.slug === slug) {
      return allItems[i];
    }
  }
  return undefined;
}

async function getAllItems(locale: Locale): Promise<Item[]> {
  const allItems: Item[] = [];
  for (const [id, category] of loadCategories()) {
      allItems.push(...(await loadCategoryItems(category, locale)));
  }
  return allItems;
}

export function loadCategories(): Map<number, AdemeCategory> {
  const categories: Map<number, AdemeCategory> = new Map();
  ademeCategories.data.forEach(category => categories.set(category.id, category));
  return categories;
}

export function getFootprintDetails(): FootprintDetails {
  return footprintDetailCategories;
}

type ComputeItemFunc = (element: AdemeECV) => { label: string, description: string, explanation: string };

export async function loadCategoryItems(category: AdemeCategory, locale: Locale): Promise<Item[]> {
  const pathToData = `../data/ademe/${locale}/${category.id}-${category.slug}.json`;
  console.log("Loading " + pathToData);
  const data: AdemeECV[] = (await import(pathToData)).data;
  console.log(data);
  const computeItemFunc: ComputeItemFunc = getComputeFunction(category.id);
  return data.map(element => {
    return {
      id: element.slug,
      categoryId: category.id,
      source: element,
      ...computeItemFunc(element)
    }
  });
}

function getComputeFunction(categoryId: number): ComputeItemFunc {
  switch (categoryId) {
    case 1: // Digital
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: !element.usage ? "" : t`Purchase and usage for ${element.usage.defaultyears} years.`,
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
      return (element: AdemeECV) => {
        const coeff = transportCoeff[element.slug];
        applyCoefficient(element, coeff);
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
          description: !element.usage ? "" : t`Purchase and usage for ${element.usage.defaultyears} years.`,
          explanation: ""
        }
      };
    case 7: // Furnitures
      return (element: AdemeECV) => {
        return {
          label: element.name,
          description: !element.usage ? "" : t`Purchase and usage for ${element.usage.defaultyears} years.`,
          explanation: ""
        }
      };
    case 8: // Heating
      return (element: AdemeECV) => {
        applyCoefficient(element, 60 / 12); // From 1m2 to 60m2, from 12 months to 1 month
        return {
          label: element.name.replace(" par m²", "").replace(" per m²", ""),
          description: t`<strong>per month</strong> for 60m²`,
          explanation: t`Impact of one month of heating a house of 60m², spreading the consumption over the year.`,
        }
      };
    case 9: // Vegetables and fruits
      return (element: AdemeECV) => {
        return {
          label: element.name + " (1kg)",
          description: t`Bought in March`,
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
      };;
  }
}

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
  "marche": 5
}

function applyCoefficient(element: AdemeECV, coeff: number) {
  element.ecv = element.ecv * coeff;
  if (element.footprint) {
    element.footprint = element.footprint * coeff;
  }
  if (element.footprintDetail) {
    element.footprintDetail.forEach(detail => detail.value = detail.value * coeff);
  }
}