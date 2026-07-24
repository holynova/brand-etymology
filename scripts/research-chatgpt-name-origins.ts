import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { brands } from "../src/data/brands";

type Root = { label: string; language: string; meaning: string };
type ChatGPTOrigin = {
  id: string;
  name: string;
  ipa: string;
  reading: string;
  story: string;
  background: string;
  methods: string[];
  roots: Root[];
  confidence: "probable" | "pending";
  evidence: string;
};

const target = fileURLToPath(new URL("../src/data/chatgpt-name-origins.json", import.meta.url));
const existing = JSON.parse(readFileSync(target, "utf8")) as Record<string, ChatGPTOrigin>;
const targets = brands.filter((brand) => !existing[brand.id]);

const envInt = (name: string, fallback: number, min: number, max: number) => {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value >= min && value <= max ? value : fallback;
};

const batchSize = envInt("CHATGPT_BATCH_SIZE", 15, 5, 20);
const readIntervalMs = envInt("CHATGPT_READ_INTERVAL_SECONDS", 15, 10, 60) * 1_000;
const configuredMinBatchDelayMs = envInt("CHATGPT_DELAY_MIN_SECONDS", 45, 20, 300) * 1_000;
const configuredMaxBatchDelayMs = envInt("CHATGPT_DELAY_MAX_SECONDS", 90, 20, 300) * 1_000;
const minBatchDelayMs = Math.min(configuredMinBatchDelayMs, configuredMaxBatchDelayMs);
const maxBatchDelayMs = Math.max(configuredMinBatchDelayMs, configuredMaxBatchDelayMs);

const parseJson = (response: string) => {
  const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? response;
  const start = fenced.indexOf("[");
  const end = fenced.lastIndexOf("]");
  if (start < 0 || end < start) throw new Error("ChatGPT response did not contain a JSON array");
  return JSON.parse(fenced.slice(start, end + 1)) as ChatGPTOrigin[];
};

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const readConversation = (conversationId: string) => JSON.parse(execFileSync("opencli", ["chatgpt", "detail", conversationId, "--site-session", "ephemeral", "-f", "json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
  maxBuffer: 2_000_000,
})) as Array<{ Role: string; Text: string; Generating?: boolean }>;

const waitForBatchJson = async (conversationId: string, expectedIds: Set<string>) => {
  let lastFailure = "尚未收到完整回复";
  for (let attempt = 0; attempt < 24; attempt += 1) {
    await pause(readIntervalMs);
    try {
      const messages = readConversation(conversationId);
      const latest = [...messages].reverse().find((message) => message.Role === "Assistant");
      if (!latest || latest.Generating) throw new Error("ChatGPT 仍在生成");
      const rows = parseJson(latest.Text);
      if (rows.length !== expectedIds.size) throw new Error(`returned ${rows.length}, expected ${expectedIds.size}`);
      if (rows.some((row) => !expectedIds.has(row.id))) throw new Error("returned an unexpected id");
      return rows;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`ChatGPT response did not become valid JSON within ${24 * readIntervalMs / 1_000} seconds: ${lastFailure}`);
};

const requestBatchConversation = async (prompt: string) => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const result = JSON.parse(execFileSync("opencli", ["chatgpt", "ask", prompt, "--new", "true", "--wait", "false", "--site-session", "ephemeral", "-f", "json", "--trace", "retain-on-failure"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 2_000_000,
      })) as Array<{ conversationId?: string }>;
      const conversationId = result[0]?.conversationId;
      if (!conversationId) throw new Error("ChatGPT did not return a conversation ID");
      return conversationId;
    } catch (error) {
      lastError = error;
      if (attempt === 2) break;
      const delay = minBatchDelayMs + Math.floor(Math.random() * (maxBatchDelayMs - minBatchDelayMs + 1));
      console.log(`Send attempt ${attempt} failed. Waiting ${Math.ceil(delay / 1_000)}s before one retry.`);
      await pause(delay);
    }
  }
  throw lastError;
};

console.log(`ChatGPT queue: ${targets.length} brands remaining; batch size ${batchSize}; randomized gap ${minBatchDelayMs / 1_000}-${maxBatchDelayMs / 1_000}s.`);

for (let offset = 0; offset < targets.length; offset += batchSize) {
  const batch = targets.slice(offset, offset + batchSize);
  const brands = batch.map((entry) => ({ id: entry.id, name: entry.name, country: entry.country, category: entry.category }));
  const prompt = `你是品牌命名史研究员。请只使用你已知的可核验公开资料，不要虚构来源或把营销话术当作唯一词源。对下面 ${brands.length} 个品牌逐项解释名称来源，并且只输出一个 JSON 数组，不要 Markdown、不要前后说明。

每个对象必须严格使用以下字段：
id, name, ipa, reading, story, background, methods, roots, confidence, evidence。

字段规则：
- id 和 name 必须原样回传。
- ipa 为常见英语或原语言 IPA；无法可靠给出时填 "待补官方音标"。
- reading 为简洁中文读音。
- story 用中文 45 到 100 字，直接说名称来自什么；若资料不足，要明确说“目前未找到可核验的命名来源”，并说明已知的名称形式，禁止空泛套话。
- background 用中文 55 到 130 字，说明该命名与创始人、地点、产品、语言或公司历史的关系；资料不足时说明缺口，不要猜测。
- methods 是 1 到 3 个中文短标签，例如 ["创始人姓氏"]、["首字母缩写"]、["描述性名称"]、["造词"]、["待考证"]。
- roots 是 1 到 3 个对象，每个对象有 label、language、meaning 三个中文字段；资料不足也要给出品牌形式和“命名来源待考”的根节点。
- confidence 只能是 probable 或 pending。只有广泛可核验的来源填 probable；无法核验填 pending。
- evidence 用中文一句话说明你依据的是哪类公开资料或缺少什么，不要编造 URL、书名、文章标题或引号。

品牌列表：${JSON.stringify(brands)}`;
  console.log(`ChatGPT batch ${offset / 10 + 1}: ${brands.map((brand) => brand.name).join(", ")}`);
  try {
    const conversationId = await requestBatchConversation(prompt);
    const expectedIds = new Set(batch.map((entry) => entry.id));
    const rows = await waitForBatchJson(conversationId, expectedIds);
    for (const row of rows) {
      if (!expectedIds.has(row.id)) throw new Error(`ChatGPT returned an unexpected id: ${row.id}`);
      if (!row.story || !row.background || !Array.isArray(row.roots) || row.roots.length === 0) throw new Error(`ChatGPT returned an incomplete record: ${row.id}`);
      existing[row.id] = row;
    }
    writeFileSync(target, `${JSON.stringify(existing, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`ChatGPT batch ${offset / 10 + 1} failed: ${message}`);
  }
  if (offset + batchSize < targets.length) {
    const delay = minBatchDelayMs + Math.floor(Math.random() * (maxBatchDelayMs - minBatchDelayMs + 1));
    console.log(`Batch saved. Waiting ${Math.ceil(delay / 1_000)}s before the next request.`);
    await pause(delay);
  }
}

console.log(`Saved ${Object.keys(existing).length} ChatGPT name-origin records to ${target}`);
