import { I18nString } from "./i18n";

export interface AdemeSource {
  label: string;
  href: string;
}

// An equivalent as found in the raw impactco2 data files (data/ademe/categories/*.ts).
export interface RawEquivalent {
  slug: string;
  category: number;
  // Detailed footprint of the item itself (manufacture, transport...).
  ecv?: {
    id: number;
    value: number;
  }[];
  // Sub-equivalents ("avion" declines into courtcourrier, moyencourrier...).
  ecvs?: {
    subtitle: string;
    ecv: {
      id: number;
      value: number;
    }[];
  }[];
  // Total footprint, for items without an "ecv" detail.
  total?: number;
  usage?: {
    peryear: number;
    defaultyears: number;
  };
  end?: number;
  // In-season months for fruits and vegetables, 0-indexed (0 = January).
  months?: number[];
  sources?: AdemeSource[];
}

export interface AdemeECV {
  name: string;
  ecv: number;
  slug: string;
  footprint?: number;
  footprintDetail?: {
    id: number;
    value: number;
  }[];
  usage?: {
    peryear: number;
    defaultyears: number;
  };
  endOfLife?: number;
  months?: number[];
  hypothesis?: string;
  sources?: AdemeSource[];
}

export interface AdemeCategory {
  id: number;
  name: I18nString;
  slug: string;
  sources: AdemeSource[];
}

// Labels of the footprint detail categories, in the loaded locale.
export interface FootprintDetails {
  [key: number]: string;
}
