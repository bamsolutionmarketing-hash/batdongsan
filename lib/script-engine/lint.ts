import type { LintHit, RenderedNode, SlotMap } from "./types";

// COMPLIANCE LINT (R10 / Spec 2.6.1) — runs on RENDERED text. Hard blocks stop
// output; soft warns annotate. Some checks consult resolved slots (source,
// legal status, internal scarcity) rather than text alone.

export interface LintReport {
  hardBlocks: LintHit[];
  warnings: LintHit[];
}

const hasSource = (slots: SlotMap): boolean => Boolean(slots.values.nguon);

// internal scarcity is real only if a sourced internal slot resolves and is not
// past its valid_until (R10 fake-scarcity gate).
function hasValidScarcity(slots: SlotMap): boolean {
  const keys = ["so_can_con_lai", "chinh_sach", "moc_tg"];
  return keys.some((k) => {
    if (!slots.values[k]) return false;
    const until = slots.meta[k]?.validUntil;
    if (!until) return true;
    return new Date(until).getTime() >= Date.now();
  });
}

interface Rule {
  rule: string;
  re: RegExp;
  message: string;
  severity: "hard" | "warn";
  // optional: when present, the hit only counts if predicate(slots) is true.
  when?: (slots: SlotMap, text: string) => boolean;
}

const RULES: Rule[] = [
  // ── hard blocks ──────────────────────────────────────────────────────────
  {
    rule: "R10:financial_promise",
    re: /cam kết lợi nhuận|chắc chắn sinh lời|cam kết sinh lời|x2 tài sản|nhân đôi tài sản|lãi tối thiểu|không thể lỗ|chắc chắn lời/i,
    message: "Cam kết tài chính bị cấm.",
    severity: "hard",
  },
  {
    rule: "R10:absolute_unverified",
    re: /rẻ nhất thị trường|duy nhất|số 1|số một|tốt nhất thị trường/i,
    message: "Tuyệt đối hoá không kiểm chứng (thiếu nguồn).",
    severity: "hard",
    when: (slots) => !hasSource(slots),
  },
  {
    rule: "R10:competitor_bashing",
    re: /\b(lừa đảo|lùa gà|rác|chết chìm|vỡ nợ)\b/i,
    message: "Dìm đối thủ / ngôn từ hạ thấp.",
    severity: "hard",
  },
  {
    rule: "R10:legal_mismatch",
    re: /sổ hồng trao tay|sổ hồng/i,
    message: "Nói 'sổ hồng' nhưng pháp lý thực tế khác.",
    severity: "hard",
    when: (slots) => Boolean(slots.values.phap_ly) && !/sổ hồng/i.test(slots.values.phap_ly),
  },
  {
    rule: "R10:fake_scarcity",
    re: /căn cuối|suất cuối|chỉ còn \d+|còn \d+ căn|sắp hết|hạn chót|cháy hàng/i,
    message: "Claim khan hiếm nhưng thiếu nguồn nội bộ còn hạn.",
    severity: "hard",
    when: (slots) => !hasValidScarcity(slots),
  },
  // ── soft warnings ─────────────────────────────────────────────────────────
  {
    rule: "R10:soft_safe_invest",
    re: /đầu tư chắc ăn|an toàn tuyệt đối|mua là thắng|chắc chắn tăng giá/i,
    message: "Lời hứa an toàn — cân nhắc bỏ.",
    severity: "warn",
  },
  {
    rule: "R10:soft_round_number",
    re: /tăng \d{2,}\s*%|x\d+ giá trị/i,
    message: "Con số tăng không nguồn.",
    severity: "warn",
    when: (slots) => !hasSource(slots),
  },
  {
    rule: "R10:soft_liquidity_promise",
    re: /cho thuê.*\d+\s*tháng|lấp đầy.*\d+|thanh khoản.*\d+\s*(ngày|tháng)/i,
    message: "Hứa thời gian cho thuê/thanh khoản cụ thể.",
    severity: "warn",
  },
];

export function runComplianceLint(rendered: RenderedNode[], slots: SlotMap): LintReport {
  const hardBlocks: LintHit[] = [];
  const warnings: LintHit[] = [];
  for (const node of rendered) {
    const text = `${node.text} ${node.onscreen}`;
    for (const r of RULES) {
      const m = text.match(r.re);
      if (!m) continue;
      if (r.when && !r.when(slots, text)) continue;
      const hit: LintHit = { rule: r.rule, match: m[0], where: node.id, message: r.message };
      (r.severity === "hard" ? hardBlocks : warnings).push(hit);
    }
  }
  return { hardBlocks, warnings };
}
