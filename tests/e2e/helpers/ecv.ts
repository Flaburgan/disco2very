// Footprint (ecv) of every item by slug, computed from the same data files as
// the app. The next card is face down ("?"), so the tests must already know
// its footprint to choose where to drop it: they read the item slug from the
// card illustration (images/ademe/<slug>.svg) and look the value up here.
// The computation mirrors lib/ademe-api.ts (toAdemeECV + getCoefficient).

import { alimentation } from "../../../data/ademe/categories/alimentation";
import { boissons } from "../../../data/ademe/categories/boisson";
import { casPratiques } from "../../../data/ademe/categories/caspratiques";
import { chauffage } from "../../../data/ademe/categories/chauffage";
import { deplacements } from "../../../data/ademe/categories/deplacement";
import { electromenager } from "../../../data/ademe/categories/electromenager";
import { fruitsEtLegumes } from "../../../data/ademe/categories/fruitsetlegumes";
import { habillements } from "../../../data/ademe/categories/habillement";
import { mobiliers } from "../../../data/ademe/categories/mobilier";
import { numeriques } from "../../../data/ademe/categories/numerique";
import { repas } from "../../../data/ademe/categories/repas";
import transportDistances from "../../../data/transport-distances.json";
import { RawEquivalent } from "../../../types/AdemeECV";

const distances: Record<string, number> = transportDistances;

function totalEcv(raw: RawEquivalent, coeff: number): number {
  const footprint = raw.ecv ? raw.ecv.reduce((sum, { value }) => sum + value, 0) : raw.total ?? 0;
  const usage = raw.usage ? raw.usage.peryear * raw.usage.defaultyears : 0;
  return (footprint + usage + (raw.end ?? 0)) * coeff;
}

// Transports are declined in variants (avion -> avion-moyencourrier...) and
// scaled from 1km to a typical journey length.
function flattenTransports(equivalents: RawEquivalent[]): RawEquivalent[] {
  return equivalents.flatMap((equivalent) =>
    equivalent.ecvs
      ? equivalent.ecvs.map((sub) => ({
          ...equivalent,
          ecvs: undefined,
          ecv: sub.ecv,
          slug: `${equivalent.slug}-${sub.subtitle}`.replace(/ /g, "").toLowerCase(),
        }))
      : [equivalent]
  );
}

const ecvBySlug = new Map<string, number>();

function add(data: RawEquivalent[], coeff: (raw: RawEquivalent) => number = () => 1) {
  for (const raw of data) {
    if (!ecvBySlug.has(raw.slug)) {
      ecvBySlug.set(raw.slug, totalEcv(raw, coeff(raw)));
    }
  }
}

add(numeriques);
add(alimentation);
add(repas);
add(boissons);
add(
  flattenTransports(deplacements).filter((transport) => distances[transport.slug] !== undefined),
  (raw) => distances[raw.slug]
);
add(habillements);
add(electromenager);
add(mobiliers);
// Heating: from 1m² per year to 60m² per month.
add(chauffage, () => 60 / 12);
add(fruitsEtLegumes);
add(casPratiques);

export function ecvOf(slug: string): number {
  const ecv = ecvBySlug.get(slug);
  if (ecv === undefined) {
    throw new Error(`Unknown item slug "${slug}", cannot compute its footprint`);
  }
  return ecv;
}
