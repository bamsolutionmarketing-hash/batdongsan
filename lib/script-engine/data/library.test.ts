import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { HOOK_BANK } from "./hooks";
import { NODE_BANK } from "./nodes";
import { RECIPES } from "./recipes";
import { COMPAT } from "./compat";
import { SLOT_REGISTRY } from "./slots";
import { buildSeedSql } from "./exportSql";

describe("script library integrity", () => {
  it("has the expected bank sizes (P2 done-condition)", () => {
    expect(HOOK_BANK.length).toBe(80);
    expect(NODE_BANK.length).toBe(57);
    expect(RECIPES.length).toBe(12);
    expect(Object.keys(COMPAT).length).toBe(16);
    // 16 families × 12 recipes = 192 compat cells
    const cells = Object.values(COMPAT).reduce((s, r) => s + Object.keys(r).length, 0);
    expect(cells).toBe(192);
    expect(Object.keys(SLOT_REGISTRY).length).toBeGreaterThan(40);
  });

  it("every hook id is unique and well-formed", () => {
    const ids = HOOK_BANK.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^HK-[A-Z]+-\d+$/.test(id))).toBe(true);
  });

  it("builds seed SQL (writes 0010 when GEN_SEED set)", () => {
    const sql = buildSeedSql();
    expect(sql).toContain("insert into hook_templates");
    expect(sql).toContain("insert into compat_rules");
    if (process.env.GEN_SEED) writeFileSync("supabase/migrations/0010_script_seed.sql", sql);
  });
});
