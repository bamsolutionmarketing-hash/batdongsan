import { describe, it, expect } from "vitest";
import { buildTempCaption } from "./tempCaption";

const nodes = [
  { label: "Gladia", facts: [{ key: "Diện tích", value: "11.8 ha" }], talkpoint: '"Mua đi"' },
  { label: "Metro 6", facts: [], talkpoint: null },
];

describe("buildTempCaption", () => {
  it("is deterministic and includes labels, facts, talkpoints (quotes stripped)", () => {
    const a = buildTempCaption(nodes);
    const b = buildTempCaption(nodes);
    expect(a).toBe(b);
    expect(a).toContain("📍 Gladia");
    expect(a).toContain("• Diện tích: 11.8 ha");
    expect(a).toContain("Mua đi");
    expect(a).not.toContain('"Mua đi"');
    expect(a).toContain("📍 Metro 6");
  });

  it("caps facts at 3 per node", () => {
    const out = buildTempCaption([
      { label: "X", facts: [1, 2, 3, 4].map((i) => ({ key: `k${i}`, value: `v${i}` })), talkpoint: null },
    ]);
    expect(out).toContain("k3: v3");
    expect(out).not.toContain("k4: v4");
  });
});
