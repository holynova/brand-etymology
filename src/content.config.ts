import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { brands } from "./data/brands";

const brandsCollection = defineCollection({
  loader: async () => brands,
  schema: z.object({
    name: z.string().min(1),
    nativeName: z.string().min(1),
    zhName: z.string().min(1),
    aliases: z.array(z.string()),
    countryCode: z.enum(["CN", "JP", "KR", "US", "GB", "FR", "IT", "DE", "CA", "CH", "SE", "NL", "ES", "IN", "BR", "AU", "TW", "SG", "DK", "FI", "NO", "AT", "BE", "TR", "MX", "ID"]),
    country: z.string().min(1),
    category: z.string().min(1),
    countryRank: z.number().int().positive().max(100),
    founded: z.number().int().min(1600).max(2026).nullable(),
    ipa: z.string().min(3),
    reading: z.string().min(1),
    story: z.string().min(16),
    background: z.string().min(16),
    methods: z.array(z.string()).min(1),
    roots: z.array(z.object({
      label: z.string().min(1),
      language: z.string().min(1),
      meaning: z.string().min(1),
    })).min(1),
    sources: z.array(z.object({
      title: z.string().min(1),
      publisher: z.string().min(1),
      url: z.url(),
      kind: z.enum(["official", "ranking", "dictionary", "archive", "report"]),
      supports: z.string().min(1),
    })).min(2),
    confidence: z.enum(["confirmed", "probable", "disputed"]),
    related: z.array(z.string()).min(2),
    verifiedAt: z.string(),
  }),
});

export const collections = { brands: brandsCollection };
