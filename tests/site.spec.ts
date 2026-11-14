import { expect, test } from "@playwright/test";

test("starts directly with search and cards", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("search")).toBeVisible();
  await expect(page.getByRole("heading", { name: "每一个名字，都从某处借来。" })).toHaveCount(0);
  await expect(page.locator("#catalog")).toBeVisible();
});

test("searches aliases and restores a clean catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("显示 500 个词条")).toBeVisible();
  await page.getByLabel("搜索词条").fill("索尼");
  await expect(page.getByText("显示 1 个词条")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sony" })).toBeVisible();
  await page.getByRole("button", { name: "清除条件" }).click();
  await expect(page.getByText("显示 500 个词条")).toBeVisible();
});

test("defaults to popular brands with full name origins before brand introductions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("排序")).toHaveValue("popular");
  const cards = page.locator("[data-entry]");
  await expect(cards.first().getByRole("link", { name: "Apple" })).toBeVisible();
  await expect(cards.first()).toContainText("中文名：苹果");
  await expect(cards.first()).toContainText("它做什么");
  await expect(cards.first()).toContainText("名称来历");
  await expect(cards.first().getByRole("button", { name: /生成 Apple 的分享卡/ })).toBeVisible();
  const ordering = await cards.first().evaluate((item) => {
    const story = item.querySelector("[data-entry-story]");
    const introduction = item.querySelector("[data-entry-intro]");
    const storyStyle = story ? getComputedStyle(story) : null;
    return {
      storyBeforeIntroduction: !!story && !!introduction && Boolean(story.compareDocumentPosition(introduction) & Node.DOCUMENT_POSITION_FOLLOWING),
      textOverflow: storyStyle?.textOverflow,
      overflow: storyStyle?.overflow,
    };
  });
  expect(ordering.storyBeforeIntroduction).toBe(true);
  expect(ordering.textOverflow).not.toBe("ellipsis");
  expect(ordering.overflow).toBe("visible");
});

test("generates a branded share card with full brand content and a QR code", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /生成 Apple 的分享卡/ }).click();
  const dialog = page.locator("[data-share-dialog]");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "分享 Apple" })).toBeVisible();
  await expect(dialog.getByText("分享卡已生成。")).toBeVisible();
  const canvas = dialog.locator("canvas");
  await expect(canvas).toHaveAttribute("width", /1080/);
  await expect(canvas).toHaveAttribute("height", /[1-9]\d{3}/);
  await expect(dialog.getByRole("button", { name: "下载 PNG" })).toBeVisible();
});

test("combines country and category filters", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("国家").selectOption("德国");
  await page.getByLabel("类别").selectOption("汽车与出行");
  await expect(page.getByText("显示 8 个词条")).toBeVisible();
  await expect(page).toHaveURL(/country=/);
});

test("detail page exposes evidence and back navigation", async ({ page }) => {
  await page.goto("/brand/sony/");
  await expect(page.getByRole("heading", { name: /Sony/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "命名谱系" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "可信来源" })).toBeVisible();
  await expect(page.getByRole("link", { name: /返回全部词条/ })).toHaveAttribute("href", "/#catalog");
  const logo = page.locator('img[src="/logos/sony.svg"]');
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("renders local logos and country flags", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('img[src^="/logos/"]')).toHaveCount(80);
  const countryLabels = await page.locator("#country option").allTextContents();
  expect(countryLabels).toContain("🇨🇳 中国");
  expect(countryLabels).toContain("🇯🇵 日本");
  expect(countryLabels).toContain("🇩🇪 德国");
  expect(countryLabels).toContain("🇨🇦 加拿大");
});

test("initial page load makes no third-party requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") external.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});
