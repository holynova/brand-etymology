import { readFile, writeFile } from "node:fs/promises";
import { expandedEntries } from "../src/data/expanded-brands";

type Entity = {
  id: string;
  label: string;
  description: string;
  namedAfter: Array<{ id: string; label: string; description: string }>;
};

const endpoint = "https://www.wikidata.org/w/api.php";
const output = new URL("../src/data/wikidata-name-origins.json", import.meta.url);
const limit = Number(process.env.ORIGIN_AUDIT_LIMIT ?? expandedEntries.length);
const offset = Number(process.env.ORIGIN_AUDIT_OFFSET ?? 0);

async function api(params: Record<string, string>) {
  const url = new URL(endpoint);
  Object.entries({ format: "json", origin: "*", ...params }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url, { headers: { "user-agent": "brand-etymology-origin-audit/1.0 (research@holynova.github.io)" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<any>;
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchScore(name: string, candidate: { label: string; aliases?: string[] }) {
  const target = normalize(name);
  const candidates = [candidate.label, ...(candidate.aliases ?? [])].map(normalize);
  if (candidates.includes(target)) return 1;
  if (candidates.some((value) => value.length > 4 && (value.includes(target) || target.includes(value)))) return 0.8;
  return 0;
}

async function search(name: string) {
  const data = await api({ action: "wbsearchentities", search: name, language: "en", type: "item", limit: "8" });
  const candidates = (data.search ?? []) as Array<{ id: string; label: string; description?: string; aliases?: string[] }>;
  return candidates.map((candidate) => ({ candidate, score: matchScore(name, candidate) }))
    .sort((left, right) => right.score - left.score)[0]?.candidate;
}

async function entity(id: string) {
  const data = await api({ action: "wbgetentities", ids: id, props: "claims|labels|descriptions", languages: "en" });
  return data.entities?.[id];
}

function itemId(claim: any) {
  return claim?.mainsnak?.datavalue?.value?.id as string | undefined;
}

async function audit(name: string): Promise<Entity | null> {
  const match = await search(name);
  if (!match || matchScore(name, match) < 0.8) return null;
  const record = await entity(match.id);
  const namedAfterIds = (record?.claims?.P138 ?? []).map(itemId).filter(Boolean) as string[];
  const references = await Promise.all(namedAfterIds.map(async (id) => {
    const named = await entity(id);
    return {
      id,
      label: named?.labels?.en?.value ?? id,
      description: named?.descriptions?.en?.value ?? "",
    };
  }));
  return {
    id: match.id,
    label: record?.labels?.en?.value ?? match.label,
    description: record?.descriptions?.en?.value ?? match.description ?? "",
    namedAfter: references,
  };
}

const inputs = expandedEntries.slice(offset, offset + limit);
const result: Record<string, Entity | null> = await readFile(output, "utf8").then((raw) => JSON.parse(raw)).catch(() => ({}));
let cursor = 0;
const failures: string[] = [];

async function worker() {
  while (cursor < inputs.length) {
    const entry = inputs[cursor++];
    try {
      result[entry.id] = await audit(entry.name);
    } catch (error) {
      failures.push(`${entry.name}: ${error instanceof Error ? error.message : String(error)}`);
      result[entry.id] = null;
    }
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);

const matched = Object.values(result).filter(Boolean) as Entity[];
const named = matched.filter((item) => item.namedAfter.length > 0);
console.log(`Audited ${inputs.length} brands from offset ${offset}: ${matched.length} total entity matches, ${named.length} total direct named-after claims, ${failures.length} failures.`);
if (failures.length) console.log(failures.slice(0, 12).join("\n"));
