// Lead scoring — "khách tiềm năng hay không". Turns the discovery read (and,
// when available, the affordability verdict) into a 0–100 potential score and a
// Nóng/Ấm/Nguội tier, with strengths, blockers and a next-best-action list.
// Framework: BANT adapted to VN primary-market sales — Tài chính (Budget),
// Nhu cầu (Need), Thời điểm (Timeline), Thẩm quyền (Authority), Rào cản (risk).
// Pure & unit-tested. SALE-ONLY (never shown to the customer).

import type { DiscoveryResult } from "./discovery";
import type { Band } from "./assess";

export type Tier = "nong" | "am" | "nguoi";

export interface LeadDimension {
  key: "tai_chinh" | "nhu_cau" | "thoi_diem" | "tham_quyen" | "rao_can";
  label: string;
  score: number; // 0–100
  weight: number;
  note: string;
}

export interface LeadResult {
  score: number; // 0–100 weighted
  tier: Tier;
  tierLabel: string; // "🔥 Khách nóng" ...
  completeness: number; // 0–1, độ đầy đủ thông tin (số câu đã hỏi)
  reliable: boolean; // đủ dữ kiện để tin điểm chưa
  dimensions: LeadDimension[];
  strengths: string[];
  blockers: string[];
  nextActions: string[];
}

export interface LeadInput {
  discovery: DiscoveryResult;
  // verdict từ engine đánh giá vay nếu sale đã chạy (tăng độ chính xác phần tài chính)
  affordability?: { verdict: Band } | null;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const TIER_LABEL: Record<Tier, string> = { nong: "🔥 Khách nóng", am: "🌤️ Khách ấm", nguoi: "❄️ Khách nguội" };

export function scoreLead({ discovery: d, affordability }: LeadInput): LeadResult {
  // ── Tài chính (Budget) ──
  let fin: number; let finNote: string;
  if (affordability) {
    fin = affordability.verdict === "khoe" ? 90 : affordability.verdict === "can_bien" ? 62 : 32;
    finNote = affordability.verdict === "khoe" ? "Đủ lực mua căn đang nhắm." : affordability.verdict === "can_bien" ? "Cận biên — cần thu xếp thêm." : "Chưa đủ cho căn nhắm — cần phương án.";
  } else if (d.incomeBand) {
    fin = d.confidence === "cao" ? 76 : d.confidence === "vua" ? 58 : 44;
    if (!d.proven) fin -= 8; // thu nhập tiền mặt khó chứng minh khi vay
    finNote = `Thu nhập ước ${Math.round(d.incomeBand.low / 1e6)}–${Math.round(d.incomeBand.high / 1e6)}tr (tin cậy ${d.confidence === "thap" ? "thấp" : d.confidence === "vua" ? "vừa" : "cao"}).`;
  } else {
    fin = 35; finNote = "Chưa đọc được thu nhập — cần hỏi thêm.";
  }
  fin = clamp(fin);

  // ── Nhu cầu (Need) ──
  let need = d.intent === "o_thuc" ? 82 : d.intent === "dau_tu" ? 70 : d.intent === "cho_thue" ? 66 : 46;
  if (d.dependents >= 1 || d.rooms) need += 5; // nhu cầu ở thực rõ ràng
  need = clamp(need);
  const needNote = d.intent === "o_thuc" ? "Mua để ở — nhu cầu thật, ít mặc cả." : d.intent === "dau_tu" ? "Đầu tư — nhạy hạ tầng/thanh khoản." : d.intent === "cho_thue" ? "Cho thuê — nhạy lợi suất." : "Chưa rõ mục đích mua.";

  // ── Thời điểm (Timeline) ──
  const tl = d.urgency === "cao" ? 90 : d.urgency === "vua" ? 60 : d.urgency === "thap" ? 32 : 46;
  const tlNote = d.urgency === "cao" ? "Cần sớm / đã khoanh vùng — sẵn sàng chốt." : d.urgency === "vua" ? "Trung hạn — nuôi dưỡng." : d.urgency === "thap" ? "Chưa gấp — chăm dài hạn." : "Chưa rõ thời điểm.";

  // ── Thẩm quyền (Authority) ──
  const auth = d.decision === "mot_minh" ? 85 : d.decision === "vo_chong" ? 72 : d.decision === "gia_dinh" ? 56 : 60;
  const authNote = d.decision === "mot_minh" ? "Tự quyết — chốt nhanh." : d.decision === "vo_chong" ? "Hai vợ chồng cùng quyết." : d.decision === "gia_dinh" ? "Cả gia đình quyết — cần đủ người." : "Chưa rõ ai quyết định.";

  // ── Rào cản (nghịch đảo rủi ro; cao = ít rào cản) ──
  let barrier = 70;
  if (!d.proven) barrier -= 15;
  if (d.dsrRisk === "cao") barrier -= 25; else if (d.dsrRisk === "vua") barrier -= 10; else if (d.dsrRisk === "thap") barrier += 10;
  barrier = clamp(barrier);
  const barrierNote = d.dsrRisk === "cao" ? "Nợ hiện có nặng — khả năng vay hẹp." : !d.proven ? "Thu nhập khó chứng minh khi vay." : "Hồ sơ tài chính ít rào cản.";

  const dimensions: LeadDimension[] = [
    { key: "tai_chinh", label: "Tài chính", score: fin, weight: 0.30, note: finNote },
    { key: "nhu_cau", label: "Nhu cầu", score: need, weight: 0.25, note: needNote },
    { key: "thoi_diem", label: "Thời điểm", score: tl, weight: 0.25, note: tlNote },
    { key: "tham_quyen", label: "Thẩm quyền", score: auth, weight: 0.12, note: authNote },
    { key: "rao_can", label: "Ít rào cản", score: barrier, weight: 0.08, note: barrierNote },
  ];

  const score = Math.round(dimensions.reduce((s, dim) => s + dim.score * dim.weight, 0));
  const tier: Tier = score >= 70 ? "nong" : score >= 45 ? "am" : "nguoi";

  // completeness: ~6 câu hỏi cốt lõi là đủ để tin điểm
  const completeness = Math.min(1, d.answered / 6);
  const reliable = completeness >= 0.5;

  const strengths = dimensions.filter((x) => x.score >= 72).map((x) => `${x.label}: ${x.note}`);
  const blockers = dimensions.filter((x) => x.score <= 45).map((x) => `${x.label}: ${x.note}`);

  const nextActions = buildActions({ tier, dimensions, d, affordability, reliable });

  return { score, tier, tierLabel: TIER_LABEL[tier], completeness, reliable, dimensions, strengths, blockers, nextActions };
}

function buildActions(a: {
  tier: Tier; dimensions: LeadDimension[]; d: DiscoveryResult;
  affordability?: { verdict: Band } | null; reliable: boolean;
}): string[] {
  const { tier, dimensions, d, affordability, reliable } = a;
  const byKey = Object.fromEntries(dimensions.map((x) => [x.key, x.score])) as Record<LeadDimension["key"], number>;
  const out: string[] = [];

  if (tier === "nong") out.push("Ưu tiên cao: mời đi xem nhà / giữ chỗ ngay, chuẩn bị bảng giá theo ngày hiệu lực + phương thức thanh toán.");
  else if (tier === "am") out.push("Khách ấm: gửi thông tin so sánh, hẹn mốc theo dõi rõ ràng để đẩy dần lên nóng.");
  else out.push("Khách nguội: đưa vào danh sách chăm dài hạn, gửi tiến độ/ưu đãi định kỳ, không ép chốt.");

  if (affordability?.verdict === "chua_du" || byKey.tai_chinh <= 45)
    out.push("Tài chính căng: đề xuất căn vừa tầm hơn, thêm người đồng vay hoặc kéo dài kỳ hạn — dùng tab Đánh giá vay để ra con số.");
  if (byKey.thoi_diem <= 45) out.push("Chưa gấp: nuôi dưỡng bằng nội dung dự án (tiến độ, pháp lý), tránh thúc ép.");
  if (byKey.tham_quyen <= 56 || d.decision === "gia_dinh") out.push("Cần đúng người quyết: mời cả vợ/chồng hoặc người nhà cùng buổi tư vấn tới.");
  if (!d.proven) out.push("Thu nhập khó chứng minh: tư vấn sớm hồ sơ vay (sao kê, tài sản đảm bảo) để tránh vỡ kèo lúc duyệt.");
  if (!reliable) out.push("Mới đủ ít dữ kiện: hỏi thêm vài câu khám phá để chấm điểm chính xác hơn.");

  return out;
}
