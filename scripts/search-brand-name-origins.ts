import { readFile, writeFile } from "node:fs/promises";
import { expandedEntries } from "../src/data/expanded-brands";

type Result = { title: string; url: string; domain: string; snippet: string };
type Research = {
  query: string;
  status: "found" | "empty" | "failed";
  results: Result[];
  error?: string;
};

const output = new URL("../src/data/web-name-origin-research.json", import.meta.url);
const limit = Number(process.env.ORIGIN_SEARCH_LIMIT ?? expandedEntries.length);
const offset = Number(process.env.ORIGIN_SEARCH_OFFSET ?? 0);
const concurrency = Math.max(1, Math.min(3, Number(process.env.ORIGIN_SEARCH_CONCURRENCY ?? 2)));
const inputs = expandedEntries.slice(offset, offset + limit);
const result: Record<string, Research> = await readFile(output, "utf8").then(JSON.parse).catch(() => ({}));

function decode(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function text(value: string) {
  return decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function targetUrl(value: string) {
  const url = decode(value);
  try {
    const parsed = new URL(url.startsWith("//") ? `https:${url}` : url);
    return parsed.searchParams.get("uddg") ?? parsed.toString();
  } catch {
    return url;
  }
}

function parse(html: string): Result[] {
  const blocks = html.split(/<div class="result results_links[^>]*>/).slice(1);
  return blocks.slice(0, 5).flatMap((block) => {
    const anchor = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!anchor) return [];
    const snippet = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>|class="result__snippet"[^>]*>([\s\S]*?)<\/div>/);
    const url = targetUrl(anchor[1]);
    try {
      return [{ title: text(anchor[2]), url, domain: new URL(url).hostname.replace(/^www\./, ""), snippet: text(snippet?.[1] ?? snippet?.[2] ?? "") }];
    } catch {
      return [];
    }
  });
}

async function search(name: string): Promise<Research> {
  const query = `\"${name}\" brand name origin`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=us-en`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 (compatible; brand-etymology-research/1.0)" } });
    if (!response.ok) return { query, status: "failed", results: [], error: `HTTP ${response.status}` };
    const results = parse(await response.text());
    return { query, status: results.length ? "found" : "empty", results };
  } catch (error) {
    return { query, status: "failed", results: [], error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timeout);
  }
}

let cursor = 0;
async function worker() {
  while (cursor < inputs.length) {
    const entry = inputs[cursor++];
    if (result[entry.id]) continue;
    result[entry.id] = await search(entry.name);
    if (cursor % 25 === 0) {
      await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
      console.log(`Saved ${cursor}/${inputs.length}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);

const values = Object.values(result);
console.log(`Web research cache: ${values.filter((item) => item.status === "found").length} found, ${values.filter((item) => item.status === "empty").length} empty, ${values.filter((item) => item.status === "failed").length} failed.`);
