// Rate & schedule presets. Deliberately bank-agnostic: we never assert a
// specific bank's live rate (that would be unverifiable). These are common
// SHAPES — agent picks one then edits the actual numbers to match the real offer.

import type { AmortMethod, Installment } from "./types";

export interface RatePreset {
  id: string;
  label: string;
  promoRate: number; // %/năm trong kỳ ưu đãi
  promoMonths: number;
  floatingRate: number; // %/năm sau ưu đãi (thả nổi)
  method: AmortMethod;
}

export const RATE_PRESETS: RatePreset[] = [
  { id: "promo12", label: "Ưu đãi 12 tháng → thả nổi", promoRate: 7.5, promoMonths: 12, floatingRate: 11, method: "reducing" },
  { id: "promo24", label: "Ưu đãi 24 tháng → thả nổi", promoRate: 8, promoMonths: 24, floatingRate: 11.5, method: "reducing" },
  { id: "flat", label: "Lãi cố định cả kỳ", promoRate: 0, promoMonths: 0, floatingRate: 10.5, method: "reducing" },
  { id: "fixed_principal", label: "Gốc đều (gốc cố định)", promoRate: 8, promoMonths: 12, floatingRate: 11, method: "fixed_principal" },
];

// Typical progress-payment templates (% of price). Agent edits to match the
// developer's actual đợt. Sums to 100.
export interface SchedulePreset {
  id: string;
  label: string;
  installments: Installment[];
}

export const SCHEDULE_PRESETS: SchedulePreset[] = [
  {
    id: "standard",
    label: "Tiến độ chuẩn (5 đợt)",
    installments: [
      { label: "Đặt cọc", percent: 10 },
      { label: "Đợt 1 — ký HĐMB", percent: 20 },
      { label: "Đợt 2 — xây thô", percent: 30 },
      { label: "Đợt 3 — hoàn thiện", percent: 25 },
      { label: "Nhận nhà + sổ", percent: 15 },
    ],
  },
  {
    id: "fast",
    label: "Thanh toán nhanh (chiết khấu)",
    installments: [
      { label: "Đặt cọc", percent: 30 },
      { label: "Ký HĐMB", percent: 65 },
      { label: "Nhận nhà + sổ", percent: 5 },
    ],
  },
];
