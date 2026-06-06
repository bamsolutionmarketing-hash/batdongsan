import type { Recipe, ChainSlot } from "../types";

// 12 RECIPES (Spec §2.4). chain excludes HOOK (selected separately). Per spec:
// 15s drops CTX and trims BODY; 60s multiplies BODY and enables PROOF/LOOP.
// PAYOFF & CTA are mandatory; budget pressure (R2) drops LOOP → CTX → trailing
// BODY, never PAYOFF/CTA.

const point: ChainSlot = { type: "BODY_POINT" };
const data: ChainSlot = { type: "BODY_DATA" };
const demo: ChainSlot = { type: "BODY_DEMO" };
const compare: ChainSlot = { type: "BODY_COMPARE" };
const objection: ChainSlot = { type: "BODY_OBJECTION" };
const story: ChainSlot = { type: "BODY_STORY" };
const ctx: ChainSlot = { type: "CTX" };
const proof: ChainSlot = { type: "PROOF" };
const cta: ChainSlot = { type: "CTA" };
const loop: ChainSlot = { type: "LOOP" };
const pay = (deliversTag: ChainSlot["deliversTag"]): ChainSlot => ({ type: "PAYOFF", deliversTag });

export const RECIPES: Recipe[] = [
  {
    id: "CT-01", nameVi: "Giới thiệu dự án", pillar: "Dự án",
    preferredHooks: ["RVL", "QUE", "PRC"], allowedHooks: ["POV", "DIR"], payoffTags: ["reveal"],
    chain: {
      15: [point, point, pay("reveal"), cta],
      30: [ctx, point, point, point, pay("reveal"), cta],
      60: [ctx, point, point, point, point, proof, pay("reveal"), cta, loop],
    },
  },
  {
    id: "CT-02", nameVi: "X tỷ mua được gì / phân tích giá", pillar: "Giá & ngân sách",
    preferredHooks: ["PRC", "QUE"], allowedHooks: ["DAT", "CMP"], payoffTags: ["answer"],
    chain: {
      15: [data, pay("answer"), cta],
      30: [data, compare, pay("answer"), cta],
      60: [ctx, data, compare, point, proof, pay("answer"), cta],
    },
  },
  {
    id: "CT-03", nameVi: "Tour / review thực tế", pillar: "Dự án",
    preferredHooks: ["POV", "RVL", "MIR"], allowedHooks: ["LUX"], payoffTags: ["reveal", "experience"],
    chain: {
      15: [demo, demo, pay("reveal"), cta],
      30: [demo, demo, demo, pay("reveal"), cta, loop],
      60: [demo, demo, demo, demo, demo, pay("reveal"), cta, loop],
    },
  },
  {
    id: "CT-04", nameVi: "Kiến thức / pháp lý", pillar: "Kiến thức",
    preferredHooks: ["FAQ", "MYT"], allowedHooks: ["TIP", "QUE"], payoffTags: ["answer"],
    chain: {
      15: [point, point, pay("answer"), cta],
      30: [ctx, point, point, point, proof, pay("answer"), cta],
      60: [ctx, point, point, point, point, proof, pay("answer"), cta, loop],
    },
  },
  {
    id: "CT-05", nameVi: "Thị trường / số liệu", pillar: "Thị trường",
    preferredHooks: ["DAT"], allowedHooks: ["MYT", "QUE"], payoffTags: ["verdict"],
    chain: {
      15: [data, pay("verdict"), cta],
      30: [data, data, objection, pay("verdict"), cta],
      60: [ctx, data, data, objection, proof, pay("verdict"), cta],
    },
  },
  {
    id: "CT-06", nameVi: "So sánh A vs B", pillar: "Thị trường",
    preferredHooks: ["CMP"], allowedHooks: ["PRC", "QUE"], payoffTags: ["verdict"],
    chain: {
      15: [compare, pay("verdict"), cta],
      30: [compare, compare, pay("verdict"), cta],
      60: [ctx, compare, compare, compare, proof, pay("verdict"), cta],
    },
  },
  {
    id: "CT-07", nameVi: "Câu chuyện khách hàng", pillar: "Niềm tin",
    preferredHooks: ["EMO", "MIR"], allowedHooks: ["POV"], payoffTags: ["transformation"],
    chain: {
      15: [story, pay("transformation"), cta],
      30: [story, story, proof, pay("transformation"), cta],
      60: [ctx, story, story, proof, pay("transformation"), cta, loop],
    },
  },
  {
    id: "CT-08", nameVi: "Sai lầm / cảnh báo", pillar: "Kiến thức",
    preferredHooks: ["MYT", "EMO"], allowedHooks: ["FAQ", "LST"], payoffTags: ["answer"],
    chain: {
      15: [objection, point, pay("answer"), cta],
      30: [objection, point, point, pay("answer"), cta, loop],
      60: [ctx, objection, point, point, point, proof, pay("answer"), cta, loop],
    },
  },
  {
    id: "CT-09", nameVi: "Lifestyle / trải nghiệm sống", pillar: "Dự án",
    preferredHooks: ["LUX", "POV"], allowedHooks: ["TRD"], payoffTags: ["experience"],
    chain: {
      15: [demo, pay("experience"), cta],
      30: [demo, demo, pay("experience"), cta],
      60: [ctx, demo, demo, demo, demo, pay("experience"), cta, loop],
    },
  },
  {
    id: "CT-10", nameVi: "Listicle Top-N", pillar: "Kiến thức",
    preferredHooks: ["LST", "TIP"], allowedHooks: ["FAQ"], payoffTags: ["list_complete", "best"],
    chain: {
      15: [point, point, pay("list_complete"), cta],
      30: [point, point, point, pay("list_complete"), cta],
      60: [point, point, point, point, pay("list_complete"), cta, loop],
    },
  },
  {
    id: "CT-11", nameVi: "FOMO / tiến độ / sự kiện", pillar: "Dự án",
    preferredHooks: ["FOMO", "DAT"], allowedHooks: ["MIR"], payoffTags: ["proof"],
    chain: {
      15: [data, pay("proof"), cta],
      30: [data, proof, pay("proof"), cta],
      60: [ctx, data, point, proof, pay("proof"), cta],
    },
  },
  {
    id: "CT-12", nameVi: "Q&A nhanh (trả lời 1 câu hỏi)", pillar: "Niềm tin",
    preferredHooks: ["QUE", "FAQ"], allowedHooks: ["DIR"], payoffTags: ["answer"],
    // payoff intentionally BEFORE body (answer-first format)
    chain: {
      15: [pay("answer"), point, cta],
      30: [pay("answer"), point, point, cta],
      60: [pay("answer"), point, point, point, proof, cta],
    },
  },
];

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
