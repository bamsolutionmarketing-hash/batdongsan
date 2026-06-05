import { describe, it, expect } from "vitest";
import { chooseSuggestion, computeStreak, type Candidate } from "./suggestion";

const cands: Candidate[] = [
  { id: "f1", label: "Thị trường", category: "finance", projectId: "p", projectSlug: "g" },
  { id: "l1", label: "Vị trí", category: "location", projectId: "p", projectSlug: "g" },
  { id: "l2", label: "Vị trí 2", category: "location", projectId: "p", projectSlug: "g" },
];

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const today = new Date("2026-06-05T08:00:00Z");
    const recent = [
      { createdAt: "2026-06-05T01:00:00Z", nodeIds: [] },
      { createdAt: "2026-06-04T01:00:00Z", nodeIds: [] },
      { createdAt: "2026-06-02T01:00:00Z", nodeIds: [] }, // gap
    ];
    expect(computeStreak(today, recent)).toBe(2);
  });
  it("is 0 when no recent post", () => {
    expect(computeStreak(new Date("2026-06-05"), [])).toBe(0);
  });
});

describe("chooseSuggestion", () => {
  const base = { today: new Date("2026-06-01T08:00:00Z"), triggers: [], recent: [], candidates: cands, dueNotes: [], hadPostYesterday: false };

  it("weekly rhythm picks the day's angle (Mon → finance)", () => {
    const s = chooseSuggestion(base); // 2026-06-01 is Monday
    expect(s.post?.angle).toBe("finance");
    expect(s.post?.nodeIds).toEqual(["f1"]);
  });

  it("active trigger overrides angle + preselects its nodes", () => {
    const s = chooseSuggestion({
      ...base,
      triggers: [{ triggerDate: "2026-06-03", activeDaysBefore: 7, suggestedAngle: "location", nodeIds: ["l1", "l2"], label: "Early bird sắp hết" }],
    });
    expect(s.post?.angle).toBe("location");
    expect(s.post?.nodeIds).toEqual(["l1", "l2"]);
    expect(s.post?.reason).toContain("Early bird");
  });

  it("variety: prefers nodes not used recently", () => {
    const tue = new Date("2026-06-02T08:00:00Z"); // Tue → location
    const s = chooseSuggestion({ ...base, today: tue, recent: [{ createdAt: "2026-06-01T01:00:00Z", nodeIds: ["l1"] }] });
    expect(s.post?.nodeIds[0]).toBe("l2"); // l1 used → l2 first
  });

  it("tasks: notes + share + story capped at 3", () => {
    const s = chooseSuggestion({
      ...base,
      dueNotes: [{ id: "n1", text: "Gọi anh A" }, { id: "n2", text: "Gửi báo giá" }],
      recent: [{ createdAt: "2026-05-31T01:00:00Z", nodeIds: [] }],
      hadPostYesterday: true,
    });
    expect(s.tasks).toHaveLength(3);
    expect(s.tasks[0].kind).toBe("note");
  });
});
