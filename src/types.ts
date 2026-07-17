export const COUNTRY_CODES = [
  "CN", "JP", "KR", "US", "GB", "FR", "IT", "DE",
  "CA", "CH", "SE", "NL", "ES", "IN", "BR", "AU", "TW", "SG",
  "DK", "FI", "NO", "AT", "BE", "TR", "MX", "ID",
] as const;
export const CONFIDENCE_LEVELS = ["confirmed", "probable", "disputed"] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export interface Source {
  title: string;
  publisher: string;
  url: string;
  kind: "official" | "ranking" | "dictionary" | "archive" | "report";
  supports: string;
}

export interface RootNode {
  label: string;
  language: string;
  meaning: string;
}

export interface Brand {
  id: string;
  name: string;
  nativeName: string;
  zhName: string;
  aliases: string[];
  countryCode: CountryCode;
  country: string;
  category: string;
  countryRank: number;
  founded: number | null;
  ipa: string;
  reading: string;
  story: string;
  background: string;
  methods: string[];
  roots: RootNode[];
  sources: Source[];
  confidence: Confidence;
  related: string[];
  verifiedAt: string;
}
