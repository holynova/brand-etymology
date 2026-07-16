import { brands } from "../src/data/brands";
import { COUNTRY_CODES } from "../src/types";

const errors: string[] = [];
const ids = new Set<string>();

for (const brand of brands) {
  if (ids.has(brand.id)) errors.push(`duplicate id: ${brand.id}`);
  ids.add(brand.id);
  if (!/^[a-z0-9-]+$/.test(brand.id)) errors.push(`invalid id: ${brand.id}`);
  if (brand.story.length < 32) errors.push(`${brand.id}: story too short`);
  if (brand.background.length < 32) errors.push(`${brand.id}: background too short`);
  if (brand.sources.length < 2) errors.push(`${brand.id}: fewer than two sources`);
  if (brand.roots.length === 0) errors.push(`${brand.id}: no lineage roots`);
  if (brand.related.length < 2) errors.push(`${brand.id}: fewer than two related entries`);
  for (const source of brand.sources) {
    try { new URL(source.url); } catch { errors.push(`${brand.id}: invalid source URL ${source.url}`); }
  }
}

for (const brand of brands) {
  for (const related of brand.related) {
    if (!ids.has(related)) errors.push(`${brand.id}: missing related entry ${related}`);
    if (related === brand.id) errors.push(`${brand.id}: relates to itself`);
  }
}

for (const code of COUNTRY_CODES) {
  const count = brands.filter((brand) => brand.countryCode === code).length;
  if (count !== 10) errors.push(`${code}: expected 10 golden entries, got ${count}`);
  const ranks = new Set(brands.filter((brand) => brand.countryCode === code).map((brand) => brand.countryRank));
  if (ranks.size !== count) errors.push(`${code}: duplicate country ranks`);
}

if (brands.length !== 80) errors.push(`expected 80 entries, got ${brands.length}`);

if (errors.length > 0) {
  throw new Error(`Content validation failed with ${errors.length} issue(s):\n${errors.map((error) => `- ${error}`).join("\n")}`);
}

const sources = new Set(brands.flatMap((brand) => brand.sources.map((source) => source.url)));
console.log(`Validated ${brands.length} brands, ${sources.size} unique sources, and ${brands.reduce((sum, brand) => sum + brand.roots.length, 0)} lineage nodes.`);
