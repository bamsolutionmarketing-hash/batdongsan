// Pure types + labels for the customer pipeline — no server imports, so client
// components (e.g. the compare widget) can use them without pulling in the
// Supabase server client.
import type { Tier } from "@/lib/finance/lead";

export type CustomerStatus = "moi" | "dang_cham" | "da_hen" | "da_coc" | "da_chot" | "ngung";

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  moi: "Mới",
  dang_cham: "Đang chăm",
  da_hen: "Đã hẹn",
  da_coc: "Đã cọc",
  da_chot: "Đã chốt",
  ngung: "Ngừng",
};

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  source: string | null;
  status: CustomerStatus;
  leadScore: number | null;
  leadTier: Tier | null;
  incomeLow: number | null;
  incomeHigh: number | null;
  discovery: Record<string, unknown> | null;
  assessment: Record<string, unknown> | null;
  note: string | null;
  nextFollowupAt: string | null;
  updatedAt: string;
}
