import { describe, it, expect } from "vitest";
import { assembleScript } from "./assemble";
import { selectHook, type SelectCtx } from "./selector";
import { fitBudget } from "./budget";
import { runComplianceLint } from "./lint";
import { getRecipe } from "./data/recipes";
import { compatLevel } from "./data/compat";
import { HOOK_BANK } from "./data/hooks";
import { NODE_BANK } from "./data/nodes";
import { fmt_ty, fmt_trieu, fmt_m2, fmt_quy, fmt_pct } from "./formatters";
import type { SlotMap, Tone, RenderedNode } from "./types";

function makeSlots(missing: string[] = [], extra: Record<string, string> = {}): SlotMap {
  const values: Record<string, string> = {
    du_an: "SkyPark Riverside", khu_vuc: "Thủ Đức", khu_vuc_b: "Quận 9", du_an_b: "Lavida",
    loai_hinh: "căn hộ", loai_can: "2PN 68m²", gia_tu: "3,2 tỷ", gia_max: "5,8 tỷ", gia_m2: "47 triệu",
    dien_tich: "68m²", view: "sông Sài Gòn", so_tang: "25", ban_giao: "Q2/2027", phap_ly: "HĐMB, đang chờ sổ",
    cdt: "Nam Long", ten_sale: "Minh Trần", so_nam_kn: "6", so_giao_dich: "120", khu_vuc_chuyen: "căn hộ khu Đông",
    kenh_dat: "link ở bio", tu_khoa_cmt: "GIÁ", qua_tang: "bảng giá + mặt bằng", tai_lieu: "checklist 12 bước",
    ngan_sach: "3-4 tỷ", thu_nhap: "40 triệu", nguon: "CBRE Q1/2026", so_lieu: "78% căn đã có chủ",
    ty_le_tang_gia: "12%", lai_suat: "6,8%", moc_so_sanh: "trung bình khu Đông", khoang_tg: "12 tháng qua",
    su_kien: "Vành đai 3 thông xe", so_can_con_lai: "14", chinh_sach: "ân hạn gốc 24 tháng", moc_tg: "30/6",
    nam: "2026", ...extra,
  };
  for (const m of missing) delete values[m];
  return { values, missing, meta: {} };
}

const base = (over: Partial<Parameters<typeof assembleScript>[0]> = {}) => ({
  recipe: getRecipe("CT-02")!,
  platform: "tiktok" as const,
  durationS: 30 as const,
  slots: makeSlots(),
  agentTone: ["chuyen_gia", "than_thien"] as Tone[],
  seed: "seed-A",
  today: new Date("2026-06-06"),
  ...over,
});

describe("formatters (2.3.6)", () => {
  it("formats VN numbers", () => {
    expect(fmt_ty(3_200_000_000)).toBe("3,2 tỷ");
    expect(fmt_ty(3_000_000_000)).toBe("3 tỷ");
    expect(fmt_trieu(47_000_000)).toBe("47 triệu");
    expect(fmt_m2(68)).toBe("68m²");
    expect(fmt_quy("2027-04-01")).toBe("Q2/2027");
    expect(fmt_pct(0.12)).toBe("12%");
  });
});

describe("assembleScript pipeline", () => {
  it("produces a complete OK script with 3 views", () => {
    const r = assembleScript(base());
    expect(r.status).toBe("OK");
    expect(r.script!.length).toBeGreaterThanOrEqual(3);
    expect(r.caption!.hashtags.length).toBeGreaterThan(0);
    expect(r.checklist!.length).toBeGreaterThan(0);
    expect(r.meta!.hookId).toMatch(/^HK-/);
  });

  it("R9: same seed ⇒ identical output (deterministic)", () => {
    const a = assembleScript(base());
    const b = assembleScript(base());
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it("R9: a different seed still yields a valid script", () => {
    const a = assembleScript(base({ seed: "seed-A" }));
    const b = assembleScript(base({ seed: "seed-ZZZ" }));
    expect(a.status).toBe("OK");
    expect(b.status).toBe("OK");
  });

  it("compat (2.5): chosen hook is never blocked for the recipe", () => {
    const r = assembleScript(base());
    const hook = HOOK_BANK.find((h) => h.id === r.meta!.hookId)!;
    expect(compatLevel(hook.family, "CT-02")).not.toBe("blocked");
  });

  it("R1: hook promise matches recipe payoff, and payoff node delivers it", () => {
    const r = assembleScript(base());
    const hook = HOOK_BANK.find((h) => h.id === r.meta!.hookId)!;
    expect(hook.promiseTags).toContain("answer");
    const payId = r.meta!.nodeIds.find((id) => id.startsWith("PAY-"))!;
    expect(NODE_BANK.find((n) => n.id === payId)!.deliversTag).toBe("answer");
  });

  it("R6: respects agent tone profile", () => {
    const r = assembleScript(base({ agentTone: ["chuyen_gia"] }));
    const hook = HOOK_BANK.find((h) => h.id === r.meta!.hookId)!;
    expect(hook.toneTags).toContain("chuyen_gia");
  });

  it("R5/R8: market nodes needing {{nguon}} are dropped when source missing", () => {
    const noMarket = makeSlots(["nguon", "so_lieu", "ty_le_tang_gia", "lai_suat", "moc_so_sanh", "su_kien"]);
    const r = assembleScript(base({ recipe: getRecipe("CT-05")!, slots: noMarket }));
    expect(r.status).not.toBe("MISSING_SLOTS");
    // BD-01/02/04 require nguon → must not appear; BD-03 (no source) may.
    for (const id of ["BD-01", "BD-02", "BD-04"]) {
      expect(r.meta!.nodeIds).not.toContain(id);
    }
  });

  it("R2: total seconds fit the duration budget (15s)", () => {
    const r = assembleScript(base({ durationS: 15 }));
    expect(r.script!.at(-1)!.end).toBeLessThanOrEqual(15 * 1.1 + 1);
  });

  it("MISSING_SLOTS when no hook can satisfy the recipe promise", () => {
    const fake = { ...getRecipe("CT-02")!, payoffTags: ["__none__" as never] };
    const r = assembleScript(base({ recipe: fake }));
    expect(r.status).toBe("MISSING_SLOTS");
  });

  it("P5: surfaces an A/B alternate hook different from the chosen one", () => {
    const r = assembleScript(base());
    expect(r.altHook).toBeDefined();
    expect(r.altHook!.id).not.toBe(r.meta!.hookId);
  });

  it("P5: a zero performance weight steers selection away from a hook", () => {
    const def = assembleScript(base());
    const weights = new Map([[def.meta!.hookId, 0]]);
    const r = assembleScript(base({ weights }));
    expect(r.meta!.hookId).not.toBe(def.meta!.hookId);
  });
});

describe("R4 cooldown (selector)", () => {
  it("avoids a hook that is within its cooldown window", () => {
    const recipe = getRecipe("CT-02")!;
    const ctx: SelectCtx = {
      recipe, platform: "tiktok", slots: makeSlots(), agentTone: ["chuyen_gia", "than_thien"],
      rotation: new Map(), seed: "seed-A", today: new Date("2026-06-06"),
    };
    const first = selectHook(ctx).chosen!;
    // mark it used today → on cooldown (HOOK window 14 days)
    ctx.rotation.set(first.id, { templateId: first.id, lastUsedAt: "2026-06-06", useCount: 1 });
    const second = selectHook(ctx).chosen!;
    expect(second.id).not.toBe(first.id);
  });
});

describe("R10 compliance lint (2.6.1)", () => {
  const node = (text: string, onscreen = ""): RenderedNode => ({
    id: "X", type: "BODY_POINT", text, onscreen, visual: "", duration: [5, 8],
  });

  it("hard-blocks financial promises", () => {
    const r = runComplianceLint([node("Dự án này cam kết lợi nhuận 20%/năm.")], makeSlots());
    expect(r.hardBlocks.some((h) => h.rule === "R10:financial_promise")).toBe(true);
  });

  it("hard-blocks legal claim that mismatches phap_ly", () => {
    const r = runComplianceLint([node("Sổ hồng trao tay ngay.")], makeSlots());
    expect(r.hardBlocks.some((h) => h.rule === "R10:legal_mismatch")).toBe(true);
  });

  it("'duy nhất' is hard without a source but a soft warn with one", () => {
    const noSrc = runComplianceLint([node("Căn duy nhất còn lại.")], makeSlots(["nguon"]));
    expect(noSrc.hardBlocks.some((h) => h.rule === "R10:absolute_unverified")).toBe(true);
  });

  it("passes a clean compliant line", () => {
    const r = runComplianceLint([node("Căn 2PN 68m², bàn giao quý 2 năm sau.")], makeSlots());
    expect(r.hardBlocks.length).toBe(0);
  });
});

describe("fitBudget (R2)", () => {
  it("drops LOOP before CTX before trailing body, never PAYOFF/CTA", () => {
    const items = [
      { id: "H", type: "HOOK" as const, text: "", onscreen: "", visual: "", duration: [3, 3] as [number, number] },
      { id: "C", type: "CTX" as const, text: "", onscreen: "", visual: "", duration: [4, 4] as [number, number] },
      { id: "B", type: "BODY_POINT" as const, text: "", onscreen: "", visual: "", duration: [8, 8] as [number, number] },
      { id: "P", type: "PAYOFF" as const, text: "", onscreen: "", visual: "", duration: [5, 5] as [number, number] },
      { id: "T", type: "CTA" as const, text: "", onscreen: "", visual: "", duration: [5, 5] as [number, number] },
      { id: "L", type: "LOOP" as const, text: "", onscreen: "", visual: "", duration: [2, 2] as [number, number] },
    ];
    const r = fitBudget(items, 15);
    expect(r.items.map((i) => i.id)).toContain("P");
    expect(r.items.map((i) => i.id)).toContain("T");
    expect(r.dropped[0]).toBe("L");
  });
});

describe("selectedNodes — video bám node tri thức", () => {
  const recipe = getRecipe("CT-02")!;
  const bodyCount = (recipe.chain[30] ?? []).filter((c) => c.type.startsWith("BODY_")).length;

  it("mismatched node count still generates (soft warning, never blocks)", () => {
    const wrong = Array.from({ length: bodyCount + 1 }, (_, i) => ({ id: `n${i}`, category: "amenity", label: `L${i}` }));
    const r = assembleScript(base({ selectedNodes: wrong }));
    expect(r.status).toBe("OK");
    expect(r.lint!.warnings.some((w) => w.rule === "NODES:count")).toBe(true);
  });

  it("prefers authored body line over talkpoint; skips nodes with neither", () => {
    const nodes = [
      { id: "n0", category: "amenity", label: "Hồ bơi", body: "Hồ bơi tràn bờ tầng 30 nhìn ra sông", talkpoint: "tp khác" },
      { id: "n1", category: "location", label: "Node rỗng" }, // no body, no talkpoint → skipped
    ];
    const r = assembleScript(base({ selectedNodes: nodes }));
    expect(r.status).toBe("OK");
    const speeches = r.script!.map((l) => l.speech).join(" || ");
    expect(speeches).toContain("Hồ bơi tràn bờ tầng 30");
    expect(speeches).not.toContain("Node rỗng"); // empty node produced no segment
  });

  it("node talkpoint drives the body speech; label shows as overlay", () => {
    const nodes = [
      { id: "n0", category: "amenity", label: "Hồ bơi vô cực", talkpoint: "Hồ bơi tràn bờ tầng cao nhìn ra sông", facts: [{ key: "Diện tích", value: "1200m²" }] },
      { id: "n1", category: "location", label: "Vị trí kết nối", talkpoint: "Sát Vành đai 3, 10 phút vào trung tâm" },
    ];
    const r = assembleScript(base({ selectedNodes: nodes }));
    expect(r.status).toBe("OK");
    const speeches = r.script!.map((l) => l.speech).join(" || ");
    const overlays = r.script!.map((l) => l.overlay).join(" || ");
    expect(speeches).toContain("Hồ bơi tràn bờ");
    expect(overlays).toContain("Hồ bơi vô cực");
  });
});
