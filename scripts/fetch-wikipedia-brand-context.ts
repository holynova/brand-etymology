import { readFile, writeFile } from "node:fs/promises";
import { expandedEntries } from "../src/data/expanded-brands";

type Context = { title: string; url: string; extract: string } | null;
const output = new URL("../src/data/wikipedia-brand-context.json", import.meta.url);
const cache: Record<string, Context> = await readFile(output, "utf8").then(JSON.parse).catch(() => ({}));
const pending = expandedEntries.filter((entry) => !(entry.id in cache));

function normalized(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

for (let offset = 0; offset < pending.length; offset += 25) {
  const group = pending.slice(offset, offset + 25);
  const url = new URL("https://en.wikipedia.org/w/api.php");
  Object.entries({
    action: "query", format: "json", formatversion: "2", redirects: "1", prop: "extracts|info", inprop: "url",
    exintro: "1", explaintext: "1", exchars: "5000", titles: group.map((entry) => entry.name).join("|"),
  }).forEach(([key, value]) => url.searchParams.set(key, value));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "brand-etymology-research/1.0 (static knowledge-site research)" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { query?: { pages?: Array<{ title: string; missing?: boolean; fullurl?: string; extract?: string }> } };
    const pages = data.query?.pages ?? [];
    for (const entry of group) {
      const page = pages.find((candidate) => normalized(candidate.title) === normalized(entry.name));
      cache[entry.id] = page && !page.missing && page.fullurl
        ? { title: page.title, url: page.fullurl, extract: page.extract ?? "" }
        : null;
    }
  } catch (error) {
    console.warn(`Batch ${offset / 25 + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
    // Keep an explicit miss so later builds remain deterministic; delete an entry to re-run a failed batch.
    for (const entry of group) cache[entry.id] = null;
  } finally {
    clearTimeout(timeout);
  }
  await writeFile(output, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`Saved Wikipedia context ${Math.min(offset + group.length, pending.length)}/${pending.length}`);
  await new Promise((resolve) => setTimeout(resolve, 350));
}

console.log(`Wikipedia context cache complete: ${Object.values(cache).filter(Boolean).length}/${expandedEntries.length} exact-title pages found.`);
