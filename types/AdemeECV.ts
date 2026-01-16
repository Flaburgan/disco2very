import { I18nString } from "./i18n";

export interface AdemeECV {
  name: string;
  ecv: number;
  slug: string;
  footprint?: number;
  footprintDetail?:
    {
      id: number;
      value: number;
    }[]
  ,
  usage?: {
    peryear: number;
    defaultyears: number;
  },
  endOfLife?: number
}

export interface AdemeCategory {
  id: number;
  name: I18nString;
  slug: string;
}

export interface FootprintDetails {
  [key: number]: I18nString;
}