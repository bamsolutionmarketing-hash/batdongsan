"use client";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// Client-side export — renders the actual styled DOM (charts + Vietnamese text
// via the browser's own fonts), so there is no server font dependency and the
// "ô vuông/ảnh vỡ" problem disappears entirely.

const triggerDownload = (dataUrl: string, filename: string) => {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
};

// Give animations one frame to settle, then capture at 2× for crisp output.
async function capture(node: HTMLElement, background: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 650));
  return toPng(node, { pixelRatio: 2, backgroundColor: background, cacheBust: true });
}

export async function exportCardPng(node: HTMLElement, filename = "tai-chinh.png") {
  const dataUrl = await capture(node, "#0b1220");
  triggerDownload(dataUrl, filename);
}

// Capture one tall report node and slice it across A4 pages (classic long-image
// pagination). White background so it prints cleanly.
export async function exportReportPdf(node: HTMLElement, filename = "bao-cao-tai-chinh.pdf") {
  const dataUrl = await capture(node, "#ffffff");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const props = pdf.getImageProperties(dataUrl);
  const imgW = pageW;
  const imgH = (props.height * imgW) / props.width;

  let heightLeft = imgH;
  let position = 0;
  pdf.addImage(dataUrl, "PNG", 0, position, imgW, imgH);
  heightLeft -= pageH;
  while (heightLeft > 0) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(dataUrl, "PNG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }
  pdf.save(filename);
}

// Web Share API (mobile) — share the PNG straight to Zalo/Messenger if supported,
// otherwise fall back to a normal download.
export async function shareCardPng(node: HTMLElement, filename = "tai-chinh.png") {
  const dataUrl = await capture(node, "#0b1220");
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
  } catch {
    /* fall through to download */
  }
  triggerDownload(dataUrl, filename);
}
