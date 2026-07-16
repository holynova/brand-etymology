import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as currentIcons from "simple-icons";
import * as legacyIcons from "simple-icons-v10";
import iconifyData from "@iconify-json/logos/icons.json" with { type: "json" };
import { brands } from "../src/data/brands";

type SimpleIcon = { slug: string; svg: string };

const outputDirectory = join(process.cwd(), "public", "logos");
const force = process.argv.includes("--force");
const simpleIcons = new Map<string, SimpleIcon>();

for (const icon of [...Object.values(legacyIcons), ...Object.values(currentIcons)] as SimpleIcon[]) {
  if (icon?.slug && icon?.svg) simpleIcons.set(icon.slug, icon);
}

const commonsFiles: Record<string, string> = {
  alibaba: "Alibaba en logo.svg",
  tencent: "Tencent logo 2017.svg",
  byd: "BYD Company, Ltd. - Logo.svg",
  haier: "Haier logo.svg",
  canon: "Canon wordmark.svg",
  muji: "MUJI logo.svg",
  softbank: "SoftBank Group logo.svg",
  coupang: "Coupang logo.svg",
  amorepacific: "AMOREPACIFIC logo.svg",
  lotte: "Lotte logo.svg",
  bbc: "BBC Logo 2021.svg",
  burberry: "Burberry Logo.svg",
  dyson: "Dyson logo.svg",
  chanel: "Chanel logo.svg",
  "louis-vuitton": "Louis Vuitton logo.svg",
  loreal: "L'Oréal logo.svg",
  michelin: "Michelin Wordmark.svg",
  gucci: "1960s Gucci Logo.svg",
  prada: "Prada-Logo.svg",
  versace: "Versace old logo.svg",
  barilla: "Barilla logo.svg",
  lavazza: "Lavazza - logo (Italy, 1995).svg",
  armani: "Armani logo.svg",
  bulgari: "Bulgari logo.svg",
  "mercedes-benz": "Mercedes-Benz Logo 2010.svg",
};

const fallbackWordmarks: Record<string, string> = {
  tsingtao: "TSINGTAO",
};

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let commonsRateLimited = false;

const fetchCommonsSvg = async (url: string, brandName: string) => {
  if (commonsRateLimited) return undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": "BrandEtymology/0.1 static asset builder" } });
    if (response.ok) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      const isUtf16Le = bytes[0] === 0xff && bytes[1] === 0xfe;
      const svg = new TextDecoder(isUtf16Le ? "utf-16le" : "utf-8")
        .decode(bytes)
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .trimEnd() + "\n";
      if (!svg.includes("<svg")) throw new Error(`${brandName}: downloaded asset is not SVG`);
      await pause(650);
      return svg;
    }
    if (response.status === 429) {
      commonsRateLimited = true;
      return undefined;
    }
    if (attempt === 2) {
      throw new Error(`${brandName}: Commons returned ${response.status}`);
    }
    await pause(attempt * 1200);
  }
  return undefined;
};

const wordmarkSvg = (label: string) => {
  const safeLabel = label.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const fontSize = label.length > 10 ? 40 : label.length > 7 ? 48 : 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 96" role="img"><title>${safeLabel}</title><text x="180" y="62" fill="#1f1b17" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="2" text-anchor="middle">${safeLabel}</text></svg>`;
};

const iconifySvg = (name: string) => {
  const icon = iconifyData.icons[name as keyof typeof iconifyData.icons];
  if (!icon) return undefined;
  const width = "width" in icon ? icon.width : iconifyData.width ?? 24;
  const height = "height" in icon ? icon.height : iconifyData.height ?? 24;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img"><title>${name}</title>${icon.body}</svg>`;
};

await mkdir(outputDirectory, { recursive: true });

const commonsApi = new URL("https://commons.wikimedia.org/w/api.php");
commonsApi.search = new URLSearchParams({
  action: "query",
  titles: Object.values(commonsFiles).map((file) => `File:${file}`).join("|"),
  prop: "imageinfo",
  iiprop: "url",
  redirects: "1",
  format: "json",
  origin: "*",
}).toString();
const commonsResponse = await fetch(commonsApi, { headers: { "User-Agent": "BrandEtymology/0.1 static asset builder" } });
if (!commonsResponse.ok) throw new Error(`Commons API returned ${commonsResponse.status}`);
const commonsJson = await commonsResponse.json() as {
  query?: { pages?: Record<string, { title: string; imageinfo?: Array<{ url: string }> }> };
};
const commonsUrls = new Map(
  Object.values(commonsJson.query?.pages ?? {})
    .filter((page) => page.imageinfo?.[0]?.url)
    .map((page) => [page.title.replace(/^File:/, ""), page.imageinfo![0].url]),
);

for (const brand of brands) {
  const outputPath = join(outputDirectory, `${brand.id}.svg`);
  if (!force) {
    try {
      await access(outputPath);
      continue;
    } catch {
      // Generate the missing asset below.
    }
  }
  const slug = brand.id.replaceAll("-", "");
  const simpleIcon = simpleIcons.get(slug);

  if (simpleIcon) {
    await writeFile(outputPath, simpleIcon.svg);
    continue;
  }

  if (brand.id === "sk-hynix") {
    const svg = iconifySvg("sk-hynix");
    if (svg) {
      await writeFile(outputPath, svg);
      continue;
    }
  }

  const commonsFile = commonsFiles[brand.id];
  if (commonsFile) {
    const commonsUrl = commonsUrls.get(commonsFile);
    if (!commonsUrl) throw new Error(`${brand.name}: Commons file URL could not be resolved`);
    const svg = await fetchCommonsSvg(commonsUrl, brand.name);
    await writeFile(outputPath, svg ?? wordmarkSvg(brand.name.toUpperCase()));
    continue;
  }

  const label = fallbackWordmarks[brand.id];
  if (!label) throw new Error(`${brand.name}: no logo source configured`);
  await writeFile(outputPath, wordmarkSvg(label));
}

console.log(`Generated ${brands.length} local SVG logo assets.`);
