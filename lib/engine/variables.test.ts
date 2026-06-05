import { describe, it, expect } from "vitest";
import { substitute } from "./variables";

const ctx = { branding: { displayName: "An", phone: "0900" }, project: { name: "Gladia", view360Url: null } };

describe("substitute", () => {
  it("replaces known vars", () => {
    const r = substitute("[TEN_SALE] - [SDT] @ [TEN_DU_AN]", ctx);
    expect(r.text).toBe("An - 0900 @ Gladia");
    expect(r.missing).toEqual([]);
  });
  it("reports missing required vars and keeps token", () => {
    const r = substitute("Gọi [SDT]", { branding: {} });
    expect(r.missing).toContain("SDT");
    expect(r.text).toContain("[SDT]");
  });
  it("leaves unknown tokens untouched", () => {
    expect(substitute("[FOO]", ctx).text).toBe("[FOO]");
  });
  it("optional var (LINK_360) missing is not required", () => {
    const r = substitute("xem [LINK_360]", ctx);
    expect(r.missing).toEqual([]);
  });
});
