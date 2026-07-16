import { brands } from "../src/data/brands";

const urls = [...new Set(brands.flatMap((brand) => brand.sources.map((source) => source.url)))];
const failures: string[] = [];
let cursor = 0;

async function worker() {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const options = { redirect: "follow" as const, signal: controller.signal, headers: { "user-agent": "Mozilla/5.0 brand-etymology-link-check/0.1" } };
      const head = await fetch(url, { ...options, method: "HEAD" });
      const accepted = new Set([403, 405, 429]);
      if (head.status >= 400 && !accepted.has(head.status)) {
        const get = await fetch(url, { ...options, method: "GET", headers: { ...options.headers, range: "bytes=0-1024" } });
        if (get.status >= 400 && !accepted.has(get.status)) failures.push(`${get.status} ${url}`);
      }
    } catch (error) {
      failures.push(`${error instanceof Error ? error.name : "Error"} ${url}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, worker));
if (failures.length) {
  throw new Error(`Link check found ${failures.length} failures:\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
}
console.log(`Checked ${urls.length} unique source URLs.`);
