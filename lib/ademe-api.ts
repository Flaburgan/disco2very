
import { Item } from "../types/item";
import ademeCategories from "../data/ademe/0-categories.json";
import footprintDetailCategories from "../data/ademe/footprintDetailCategories.json";
import { AdemeCategory, AdemeECV, FootprintDetails } from "../types/AdemeECV";
import { Locale } from "../types/i18n";
//import usageNumerique from "../data/ademe/10-usagenumerique.json";


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
    "avionmoyencourrier",
    "tgv",
    "voiturethermique",
    "voitureelectrique"
  ];

  const selectedItems: Item[] = [];
  getAllItems(locale).forEach(item => {
    if (slugs.includes(item.source.slug)) {
      selectedItems.push(item);
    }
  });
  return selectedItems;
}

export function getItemFromSlug(slug: string, locale: Locale): Item | undefined {
  const allItems = getAllItems(locale);
  for (let i = 0; i < allItems.length; i++) {
    if (allItems[i].source.slug === slug) {
      return allItems[i];
    }
  }
  return undefined;
}

const allItems: Item[] = [];
function getAllItems(locale: Locale): Item[] {
  if (allItems.length === 0) {
    for (let i = 1; i <= loadCategories().length; i++) {
      allItems.push(...loadCategory(i, locale));
    }
  }
  return allItems;
}

let categories: AdemeCategory[] = [];
export function loadCategories(): AdemeCategory[] {
  if (categories.length === 0) {
    categories = ademeCategories.data;
  }
  return categories;
}

export function loadCategory(id: number, locale: Locale): Item[] {
  // Hardcoded at the moment, to be seen with ADEME if we don't need to extend their data at some point
  switch (id) {
    case 1:
      return loadDigital(locale);
    case 2:
      return loadMeals(locale);
    case 3:
      return loadDrinks(locale);
    case 4:
      return loadTransports(locale);
    case 5:
      return loadClothes(locale);
    case 6:
      return loadHouseholdAppliances(locale);
    case 7:
      return loadFurnitures(locale);
    case 8:
      return loadHeating(locale);
    case 9:
      return loadVegetablesAndFruits(locale);
    case 10:
      return []; // TODO Usage numérique needs more work
    default:
      return [];
  }
}

const digitalItems: Item[] = [];
function loadDigital(locale: Locale): Item[] {
  console.log("toto")
  if (digitalItems.length === 0) {
    import(`../data/ademe/${locale}/1-numerique.json`).then(numerique => {
      console.log(numerique)
      numerique.data.forEach((element: AdemeECV) => {

        console.log(element)
        const item: Item = {
          id: element.slug,
          categoryId: 1,
          label: element.name,
          description: locale === "fr" ?
            "Achat et usage pendant " + element.usage?.defaultyears + " ans." :
            "Purchase and usage for " + element.usage?.defaultyears + " years.",
          explanation: "",
          image: "📱 💻 🖥️",
          source: element
        }
        digitalItems.push(item);
      })}
    );
  }
  return digitalItems;
}

const mealItems: Item[] = [];
function loadMeals(locale: Locale): Item[] {
  if (mealItems.length === 0) {
    import(`../data/ademe/${locale}/2-repas.json`).then(repas => 
      repas.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 2,
          label: element.name,
          description: "",
          explanation: "",
          image: "🐟 🍽 🥩",
          source: element
        }
        mealItems.push(item);
      })
    );
  }
  return mealItems;
}

const drinkItems: Item[] = [];
function loadDrinks(locale: Locale): Item[] {
  if (drinkItems.length === 0) {
    import(`../data/ademe/${locale}/3-boisson.json`).then(boisson => 
      boisson.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 3,
          label: element.name + " (1L)",
          description: "",
          explanation: "",
          image: "🍺 🍹 🥛",
          source: element
        }
        drinkItems.push(item);
      })
    );
  }
  return drinkItems;
}

const transportItems: Item[] = [];
function loadTransports(locale: Locale): Item[] {
  if (transportItems.length === 0) {
    import(`../data/ademe/${locale}/4-transport.json`).then(transport => 
      transport.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 4,
          label: element.name,
          description: "",
          explanation: "",
          image: "🚗 🚄 ✈️",
          source: element
        }
        transportItems.push(item);
      })
    );
  }
  return transportItems;
}

const clotheItems: Item[] = [];
function loadClothes(locale: Locale): Item[] {
  if (clotheItems.length === 0) {
    import(`../data/ademe/${locale}/5-habillement.json`).then(habillement => 
      habillement.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 5,
          label: element.name,
          description: "",
          explanation: "",
          image: "👞 👔 👗",
          source: element
        }
        clotheItems.push(item);
      })
    );
  }
  return clotheItems;
}

const householdApplianceItems: Item[] = [];
function loadHouseholdAppliances(locale: Locale): Item[] {
  if (householdApplianceItems.length === 0) {
    import(`../data/ademe/${locale}/6-electromenager.json`).then(electromenager => 
      electromenager.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 6,
          label: element.name,
          description: element.usage ? "Achat et usage pendant " + element.usage.defaultyears + " ans." : "",
          explanation: "",
          image: "🧊 🛁 ☕",
          source: element
        }
        householdApplianceItems.push(item);
      })
    );
  }
  return householdApplianceItems;
}

const furnitureItems: Item[] = [];
function loadFurnitures(locale: Locale): Item[] {
  if (furnitureItems.length === 0) {
    import(`../data/ademe/${locale}/7-mobilier.json`).then(mobilier => 
      mobilier.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 7,
          label: element.name,
          description: "",
          explanation: "",
          image: "🛏️ 🪑 🛋️",
          source: element
        }
        furnitureItems.push(item);
      })
    );
  }
  return furnitureItems;
}

const heatingItems: Item[] = [];
function loadHeating(locale: Locale): Item[] {
  if (heatingItems.length === 0) {
    import(`../data/ademe/${locale}/8-chauffage.json`).then(chauffage => 
      chauffage.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 8,
          label: element.name,
          description: locale === "fr" ?
            "60m2 par mois en moyenne annuel." :
            "60m2 per month on yearly average.",
          explanation: "",
          image: "🪵 🏠 🌡️",
          source: element
        }
        heatingItems.push(item);
      })
    );
  }
  return heatingItems;
}

const vegetablesAndFruitsItems: Item[] = [];
function loadVegetablesAndFruits(locale: Locale): Item[] {
  if (vegetablesAndFruitsItems.length === 0) {
    import(`../data/ademe/${locale}/9-fruitsetlegumes.json`).then(fruitsetlegumes => 
      fruitsetlegumes.data.forEach((element: AdemeECV) => {
        const item: Item = {
          id: element.slug,
          categoryId: 9,
          label: element.name + " (1kg)",
          description: "Consommé le mois de mars",
          explanation: "",
          image: "🥑 🍇 🍅",
          source: element
        }
        vegetablesAndFruitsItems.push(item);
      })
    );
  }
  return vegetablesAndFruitsItems;
}



// Not ready on Ademe side, they should explain with which device, on which network, how much, etc.
// usageNumerique.data.forEach(element => {
//   const item: Item = {
//     id: element.slug,
//     category: "digital",
//     label: element.name,
//     description: "Achat et usage pendant " + element.usage.defaultyears + " ans.",
//     explanation: "",
//     image: "",
//     source: element
//   }
//   items.push(item);
// });

export function getFootprintDetails(): FootprintDetails {
  return footprintDetailCategories;
}