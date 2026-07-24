import { readFile, writeFile } from "node:fs/promises";
import { expandedEntries } from "../src/data/expanded-brands";

type Result = { title: string; url: string; domain: string; snippet: string };
type Research = { query: string; status: "found" | "empty" | "failed"; results: Result[]; error?: string };
const output = new URL("../src/data/bing-name-origin-research.json", import.meta.url);
const cache: Record<string, Research> = await readFile(output, "utf8").then(JSON.parse).catch(() => ({}));
const inputs = expandedEntries.filter((entry) => !(entry.id in cache));
const concurrency = Math.max(1, Math.min(4, Number(process.env.BING_SEARCH_CONCURRENCY ?? 3)));

function decode(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function field(block: string, name: string) {
  return decode(block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`))?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
function parse(xml: string): Result[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5).flatMap((match) => {
    const title = field(match[1], "title");
    const url = field(match[1], "link");
    const snippet = field(match[1], "description");
    try { return title && url ? [{ title, url, domain: new URL(url).hostname.replace(/^www\./, ""), snippet }] : []; } catch { return []; }
  });
}
async function search(name: string): Promise<Research> {
  const query = `${name} brand name origin`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`, { signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; brand-etymology-research/1.0)" } });
    if (!response.ok) return { query, status: "failed", results: [], error: `HTTP ${response.status}` };
    const results = parse(await response.text());
    return { query, status: results.length ? "found" : "empty", results };
  } catch (error) {
    return { query, status: "failed", results: [], error: error instanceof Error ? error.message : String(error) };
  } finally { clearTimeout(timeout); }
}

let cursor = 0;
let saved = 0;
async function worker() {
  while (cursor < inputs.length) {
    const entry = inputs[cursor++];
    cache[entry.id] = await search(entry.name);
    saved += 1;
    if (saved % 25 === 0) {
      await writeFile(output, `${JSON.stringify(cache, null, 2)}\n`);
      console.log(`Saved Bing research ${saved}/${inputs.length}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
await writeFile(output, `${JSON.stringify(cache, null, 2)}\n`);
const values = Object.values(cache);
console.log(`Bing research complete: ${values.filter((item) => item.status === "found").length} found, ${values.filter((item) => item.status === "empty").length} empty, ${values.filter((item) => item.status === "failed").length} failed.`);
