"use server";

import { requireSession } from "@/lib/auth";
import { renderFinanceCard, type FinanceCard } from "@/lib/finance/card";
import { lintShareText } from "@/lib/finance/disclaimer";

// Render a branded finance card (PNG) for the current agent. Returns a data URL
// the client can preview / download / share. Branding (name + phone) must exist.
export async function financeCardAction(
  card: FinanceCard,
): Promise<{ ok: boolean; dataUrl?: string; error?: string }> {
  const session = await requireSession();
  const buf = await renderFinanceCard(session.userId, card);
  if (!buf) {
    return { ok: false, error: "Chưa thiết lập thương hiệu (tên + SĐT) ở mục Hồ sơ." };
  }
  return { ok: true, dataUrl: `data:image/png;base64,${buf.toString("base64")}` };
}

// Compliance guard for any agent-edited copy text before it's shared. Mirrors
// R10 (no guaranteed profit / price growth).
export async function lintShareTextAction(text: string): Promise<{ ok: boolean; match: string | null }> {
  await requireSession();
  return lintShareText(text);
}
