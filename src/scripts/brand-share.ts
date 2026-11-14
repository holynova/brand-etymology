import QRCode from "qrcode";

type SharePayload = {
  name: string;
  chineseName: string;
  country: string;
  category: string;
  story: string;
  introduction: string;
  url: string;
};

const colors = {
  paper: "#fff4dd",
  card: "#fffdf7",
  ink: "#26201a",
  inkSoft: "#5c5347",
  accent: "#a6192e",
  sun: "#ffd84d",
  sky: "#a5dcff",
};

const shareFileName = (name: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "") || "brand"}-name-origin.png`;

const wrapText = (context: CanvasRenderingContext2D, value: string, width: number) => {
  const lines: string[] = [];
  value.split(/\n+/).forEach((paragraph) => {
    let line = "";
    for (const character of Array.from(paragraph.trim())) {
      const candidate = `${line}${character}`;
      if (line && context.measureText(candidate).width > width) {
        lines.push(line.trimEnd());
        line = character;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line.trimEnd());
  });
  return lines.length ? lines : [""];
};

const roundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.closePath();
};

const drawLabel = (context: CanvasRenderingContext2D, value: string, x: number, y: number) => {
  context.fillStyle = colors.inkSoft;
  context.font = '800 22px ui-monospace, "SF Mono", Menlo, monospace';
  context.fillText(value, x, y);
};

const drawLines = (context: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) => {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
};

async function renderCard(canvas: HTMLCanvasElement, payload: SharePayload) {
  await document.fonts?.ready;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法创建分享卡画布。");

  const width = 1080;
  canvas.width = width;
  canvas.height = 400;
  context.font = '800 106px "Baloo 2 Variable", "Baloo 2", system-ui, sans-serif';
  const titleLines = wrapText(context, payload.name, 930);
  context.font = '600 46px system-ui, -apple-system, "PingFang SC", sans-serif';
  const chineseLines = wrapText(context, `中文名：${payload.chineseName}`, 930);
  context.font = '500 58px system-ui, -apple-system, "PingFang SC", sans-serif';
  const storyLines = wrapText(context, payload.story, 930);
  context.font = '600 34px system-ui, -apple-system, "PingFang SC", sans-serif';
  const introLines = wrapText(context, payload.introduction, 930);
  const height = Math.max(1320, 850 + titleLines.length * 110 + chineseLines.length * 62 + storyLines.length * 78 + introLines.length * 48);
  canvas.height = height;

  context.fillStyle = colors.paper;
  context.fillRect(0, 0, width, height);
  context.fillStyle = colors.ink;
  context.fillRect(48, 50, width - 96, height - 100);
  roundedRect(context, 38, 38, width - 96, height - 100, 22);
  context.fillStyle = colors.card;
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = colors.ink;
  context.stroke();

  const x = 74;
  let y = 104;
  context.fillStyle = colors.sun;
  roundedRect(context, x, y - 40, 52, 52, 26);
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = colors.ink;
  context.stroke();
  context.fillStyle = colors.ink;
  context.font = '800 22px ui-monospace, "SF Mono", Menlo, monospace';
  context.fillText("名", x + 15, y - 7);
  context.font = '800 36px "Baloo 2 Variable", "Baloo 2", system-ui, sans-serif';
  context.fillText("名从何来", x + 70, y - 3);
  context.fillStyle = colors.inkSoft;
  context.font = '800 16px ui-monospace, "SF Mono", Menlo, monospace';
  context.fillText("BRAND NAME ORIGIN", x + 72, y + 22);

  y += 126;
  context.fillStyle = colors.ink;
  context.font = '800 106px "Baloo 2 Variable", "Baloo 2", system-ui, sans-serif';
  drawLines(context, titleLines, x, y, 110);
  y += titleLines.length * 110;
  context.fillStyle = colors.inkSoft;
  context.font = '600 46px system-ui, -apple-system, "PingFang SC", sans-serif';
  drawLines(context, chineseLines, x, y, 62);
  y += chineseLines.length * 62 + 38;
  context.font = '700 28px ui-monospace, "SF Mono", Menlo, monospace';
  context.fillText(`${payload.country} / ${payload.category}`, x, y);
  y += 78;

  drawLabel(context, "名称来历", x, y);
  y += 54;
  context.fillStyle = colors.ink;
  context.font = '500 58px system-ui, -apple-system, "PingFang SC", sans-serif';
  drawLines(context, storyLines, x, y, 78);
  y += storyLines.length * 78 + 48;

  drawLabel(context, "它做什么", x, y);
  y += 44;
  context.fillStyle = colors.inkSoft;
  context.font = '600 34px system-ui, -apple-system, "PingFang SC", sans-serif';
  drawLines(context, introLines, x, y, 48);

  const qrSize = 156;
  const qrX = width - 74 - qrSize;
  const qrY = height - 74 - qrSize;
  context.fillStyle = colors.sun;
  roundedRect(context, qrX - 18, qrY - 18, qrSize + 36, qrSize + 36, 16);
  context.fill();
  context.lineWidth = 3;
  context.strokeStyle = colors.ink;
  context.stroke();
  const qrCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCanvas, payload.url, { width: qrSize, margin: 1, color: { dark: colors.ink, light: colors.card } });
  context.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
  context.fillStyle = colors.inkSoft;
  context.font = '700 18px ui-monospace, "SF Mono", Menlo, monospace';
  context.fillText("扫码看完整档案", qrX - 8, qrY - 30);
  context.fillText("名从何来 / holynova.github.io", x, height - 78);
  context.fillStyle = colors.accent;
  context.fillRect(x, height - 54, 340, 7);
}

const payloadFrom = (button: HTMLElement): SharePayload => ({
  name: button.dataset.shareName ?? "",
  chineseName: button.dataset.shareChinese ?? "暂无常用中文名",
  country: button.dataset.shareCountry ?? "",
  category: button.dataset.shareCategory ?? "",
  story: button.dataset.shareStory ?? "",
  introduction: button.dataset.shareIntroduction ?? "",
  url: button.dataset.shareUrl ?? location.href,
});

const makeFile = async (canvas: HTMLCanvasElement, payload: SharePayload) => {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("分享卡生成失败，请重试。");
  return new File([blob], shareFileName(payload.name), { type: "image/png" });
};

const download = async (canvas: HTMLCanvasElement, payload: SharePayload) => {
  const file = await makeFile(canvas, payload);
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(file);
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 0);
};

export const initBrandShare = () => {
  if (document.querySelector("[data-share-dialog]")) return;

  const dialog = document.createElement("dialog");
  dialog.className = "brand-share-dialog";
  dialog.dataset.shareDialog = "";
  dialog.innerHTML = `
    <div class="brand-share-dialog__head">
      <div><p class="brand-share-dialog__label">分享卡</p><h2 class="brand-share-dialog__title"></h2></div>
      <button class="brand-share-dialog__close" type="button" aria-label="关闭分享卡">×</button>
    </div>
    <p class="brand-share-dialog__hint">已将完整名称来历、品牌简介和二维码排入图片。</p>
    <div class="brand-share-dialog__preview"><canvas class="brand-share-dialog__canvas" aria-label="品牌分享卡预览"></canvas></div>
    <div class="brand-share-dialog__actions">
      <button class="brand-share-dialog__download" type="button">下载 PNG</button>
      <button class="brand-share-dialog__native" type="button" hidden>系统分享</button>
      <button class="brand-share-dialog__copy" type="button">复制链接</button>
    </div>
    <p class="brand-share-dialog__status" aria-live="polite"></p>
  `;
  document.body.append(dialog);

  const title = dialog.querySelector<HTMLElement>(".brand-share-dialog__title")!;
  const canvas = dialog.querySelector<HTMLCanvasElement>(".brand-share-dialog__canvas")!;
  const close = dialog.querySelector<HTMLButtonElement>(".brand-share-dialog__close")!;
  const downloadButton = dialog.querySelector<HTMLButtonElement>(".brand-share-dialog__download")!;
  const nativeButton = dialog.querySelector<HTMLButtonElement>(".brand-share-dialog__native")!;
  const copyButton = dialog.querySelector<HTMLButtonElement>(".brand-share-dialog__copy")!;
  const status = dialog.querySelector<HTMLElement>(".brand-share-dialog__status")!;
  let active: SharePayload | null = null;

  const closeDialog = () => dialog.close();
  close.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); closeDialog(); });

  document.addEventListener("click", async (event) => {
    const source = (event.target as Element | null)?.closest<HTMLElement>("[data-share-brand]");
    if (!source) return;
    active = payloadFrom(source);
    title.textContent = `分享 ${active.name}`;
    status.textContent = "正在生成分享卡…";
    dialog.showModal();
    try {
      await renderCard(canvas, active);
      status.textContent = "分享卡已生成。";
      nativeButton.hidden = !("share" in navigator && "canShare" in navigator);
      downloadButton.focus();
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : "分享卡生成失败，请重试。";
    }
  });

  downloadButton.addEventListener("click", async () => {
    if (!active) return;
    try { await download(canvas, active); status.textContent = "PNG 已下载。"; }
    catch (error) { status.textContent = error instanceof Error ? error.message : "下载失败，请重试。"; }
  });

  nativeButton.addEventListener("click", async () => {
    if (!active) return;
    try {
      const file = await makeFile(canvas, active);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${active.name} 的名称来历｜名从何来`, text: active.story, url: active.url, files: [file] });
        status.textContent = "已打开系统分享。";
      } else {
        await navigator.share?.({ title: `${active.name} 的名称来历｜名从何来`, text: active.story, url: active.url });
      }
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") status.textContent = "系统分享未完成，可下载图片或复制链接。";
    }
  });

  copyButton.addEventListener("click", async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.url);
      status.textContent = "品牌档案链接已复制。";
    } catch {
      status.textContent = active.url;
    }
  });
};
