
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
import { AdemeCategory, AdemeECV, FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";
import { Item } from "../types/item";


const allItemsByLocale: {[locale in Locale]: Item[]} = {"en": [], "fr": []};

allItemsByLocale.en.push(...computeItemsForCategory(1, enNumerique.data));
allItemsByLocale.en.push(...computeItemsForCategory(2, enAlimentation.data));
allItemsByLocale.en.push(...computeItemsForCategory(3, enBoisson.data));
allItemsByLocale.en.push(...computeItemsForCategory(4, enTransport.data));
allItemsByLocale.en.push(...computeItemsForCategory(5, enHabillement.data));
allItemsByLocale.en.push(...computeItemsForCategory(6, enElectromenager.data));
allItemsByLocale.en.push(...computeItemsForCategory(7, enMobilier.data));
allItemsByLocale.en.push(...computeItemsForCategory(8, enChauffage.data));
allItemsByLocale.en.push(...computeItemsForCategory(9, enVegetablesAndFruits.data));
allItemsByLocale.en.push(...computeItemsForCategory(13, enPracticalCases.data));

allItemsByLocale.fr.push(...computeItemsForCategory(1, frNumerique.data));
allItemsByLocale.fr.push(...computeItemsForCategory(2, frAlimentation.data));
allItemsByLocale.fr.push(...computeItemsForCategory(3, frBoisson.data));
allItemsByLocale.fr.push(...computeItemsForCategory(4, frTransport.data));
allItemsByLocale.fr.push(...computeItemsForCategory(5, frHabillement.data));
allItemsByLocale.fr.push(...computeItemsForCategory(6, frElectromenager.data));
allItemsByLocale.fr.push(...computeItemsForCategory(7, frMobilier.data));
allItemsByLocale.fr.push(...computeItemsForCategory(8, frChauffage.data));
allItemsByLocale.fr.push(...computeItemsForCategory(9, frVegetablesAndFruits.data));
allItemsByLocale.fr.push(...computeItemsForCategory(13, frPracticalCases.data));

export function getDefaultItems(locale: Locale): Item[] {
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
  const allItems = allItemsByLocale[locale];
  allItems.forEach(item => {
    if (slugs.includes(item.source.slug)) {
      selectedItems.push(item);
    }
  });
  return selectedItems;
}

export function getItemFromSlug(slug: string, locale: Locale): Item | undefined {
  const allItems = allItemsByLocale[locale];
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].source.slug === slug) {
      return allItems[i];
    }
  }
  return undefined;
}

export function getCategories(): Map<number, AdemeCategory> {
  const categories: Map<number, AdemeCategory> = new Map();
  ademeCategories.data.forEach(category => categories.set(category.id, category));
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

type ComputeItemFunc = (element: AdemeECV) => { label: string, description: string, explanation: string };

function computeItemsForCategory(categoryId: number, data: AdemeECV[]): Item[] {
  const computeItemFunc: ComputeItemFunc = getComputeFunction(categoryId);
  return data.map(element => {
    return {
      id: element.slug,
      categoryId: categoryId,
      source: element,
      ...computeItemFunc(element)
    }
  });
}

function getComputeFunction(categoryId: number): ComputeItemFunc {
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
        applyCoefficient(element, 60 / 12); // From 1m2 to 60m2, from 12 months to 1 month
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
    const defaultYears = element.usage?.defaultyears;
    description = t`Purchase and usage for ${defaultYears} years.`;
  }
  return description;
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
