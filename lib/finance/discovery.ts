// "Khám phá khách" — discovery engine. A salesperson asks NATURAL, indirect
// questions during a chat ("nhà mình mấy người?", "anh đi làm xa không, đi công
// tác nhiều chứ?", "anh chạy xe gì cho tiện?") and ticks the answer. Each option
// carries hidden signals; we aggregate them into a SALE-ONLY read: estimated
// income band + confidence, job level, household need, intent, urgency, capital
// hint — then hand off to assessCustomer. Pure & unit-tested.

export type GroupId = "gia_dinh" | "cong_viec" | "tai_san" | "muc_tieu";
export type JobLevel = "nhanvien" | "quanly" | "lanhdao" | "chudn" | "tudo";
export type Intent = "o_thuc" | "cho_thue" | "dau_tu";
export type Tri = "thap" | "vua" | "cao";
export type Decision = "mot_minh" | "vo_chong" | "gia_dinh";

export interface Signal {
  incomeMin?: number; // VND/tháng — đóng góp ước tính dải thu nhập
  incomeMax?: number;
  weight?: number; // trọng số tín hiệu thu nhập (mặc định 1)
  jobLevel?: JobLevel;
  rooms?: 1 | 2 | 3;
  dependents?: number;
  intent?: Intent;
  downHint?: number; // % vốn tự có gợi ý
  dsrRisk?: Tri; // áp lực nợ hiện có
  urgency?: Tri;
  decision?: Decision;
  proven?: boolean; // thu nhập dễ chứng minh (bảng lương) hay tiền mặt
  note?: string; // dòng "đọc vị" hiển thị cho sale
}

export interface DiscoveryOption { label: string; signal: Signal }
export interface DiscoveryQuestion {
  id: string;
  group: GroupId;
  ask: string; // câu hỏi tự nhiên gợi ý sale dùng
  reads: string; // câu này "đọc" được gì (nhắc sale)
  options: DiscoveryOption[];
}

export const GROUPS: { id: GroupId; label: string; icon: string }[] = [
  { id: "gia_dinh", label: "Gia đình & nhu cầu", icon: "👨‍👩‍👧" },
  { id: "cong_viec", label: "Công việc & cấp bậc", icon: "💼" },
  { id: "tai_san", label: "Tài sản & lối sống", icon: "🚗" },
  { id: "muc_tieu", label: "Mục tiêu & tài chính", icon: "🎯" },
];

const M = 1_000_000;

// ── Question bank ─────────────────────────────────────────────────────────────
export const QUESTIONS: DiscoveryQuestion[] = [
  // GIA ĐÌNH & NHU CẦU
  {
    id: "ho_gia_dinh", group: "gia_dinh",
    ask: "“Nhà mình giờ mấy người ạ, các cháu lớn chưa anh/chị?”",
    reads: "Suy ra số phòng cần + số người phụ thuộc + ai cùng quyết định.",
    options: [
      { label: "Độc thân / mới cưới", signal: { rooms: 1, dependents: 0, decision: "mot_minh", note: "Độc thân/mới cưới → 1–2PN, quyết nhanh." } },
      { label: "Vợ chồng + 1 con nhỏ", signal: { rooms: 2, dependents: 1, decision: "vo_chong", note: "Gia đình trẻ 1 con → 2PN, hai vợ chồng cùng quyết." } },
      { label: "Gia đình 2 con", signal: { rooms: 3, dependents: 2, decision: "vo_chong", note: "2 con → cần 3PN, ưu tiên trường học gần." } },
      { label: "Ở cùng ông bà / 3 thế hệ", signal: { rooms: 3, dependents: 3, decision: "gia_dinh", note: "3 thế hệ → 3PN, quyết định cả gia đình." } },
    ],
  },
  {
    id: "do_tuoi_con", group: "gia_dinh",
    ask: "“Các cháu đang tuổi mầm non hay đã đi học lớn rồi ạ?”",
    reads: "Con đi học → ưu tiên ở thực, gần trường; chi tiêu giáo dục.",
    options: [
      { label: "Chưa có / mầm non", signal: { intent: "o_thuc", note: "Con nhỏ → mua để ở, chọn theo tiện ích trẻ em." } },
      { label: "Đang đi học (cấp 1–2)", signal: { intent: "o_thuc", urgency: "cao", note: "Con đi học → cần ổn định chỗ ở, độ gấp cao hơn." } },
      { label: "Con đã lớn / đi học xa", signal: { intent: "dau_tu", note: "Con lớn → có thể nghiêng tích sản/đầu tư." } },
    ],
  },
  // CÔNG VIỆC & CẤP BẬC
  {
    id: "nganh_nghe", group: "cong_viec",
    ask: "“Anh/chị đang làm ngành nào, đi làm công ty hay tự kinh doanh ạ?”",
    reads: "Loại công việc → dải thu nhập + khả năng chứng minh thu nhập.",
    options: [
      { label: "Nhân viên văn phòng", signal: { jobLevel: "nhanvien", incomeMin: 15 * M, incomeMax: 30 * M, proven: true, weight: 1, note: "NV văn phòng → TN ~15–30tr, dễ chứng minh." } },
      { label: "Quản lý / trưởng phòng", signal: { jobLevel: "quanly", incomeMin: 30 * M, incomeMax: 60 * M, proven: true, weight: 1.2, note: "Quản lý → TN ~30–60tr, có thưởng." } },
      { label: "Giám đốc / cấp cao", signal: { jobLevel: "lanhdao", incomeMin: 60 * M, incomeMax: 150 * M, proven: true, weight: 1.3, note: "Cấp cao → TN ~60–150tr." } },
      { label: "Tự kinh doanh / chủ shop", signal: { jobLevel: "chudn", incomeMin: 40 * M, incomeMax: 120 * M, proven: false, weight: 1, note: "Chủ DN → TN cao nhưng phần lớn tiền mặt, khó chứng minh." } },
      { label: "Freelance / nghề tự do", signal: { jobLevel: "tudo", incomeMin: 20 * M, incomeMax: 60 * M, proven: false, weight: 0.9, note: "Tự do → TN biến động, cần tính hệ số." } },
    ],
  },
  {
    id: "gio_giac", group: "cong_viec",
    ask: "“Anh đi làm giờ hành chính cố định, hay linh hoạt — chắc hay đi công tác nhỉ?”",
    reads: "Giờ giấc & đi công tác là proxy cấp bậc: càng linh hoạt/đi nhiều càng cao.",
    options: [
      { label: "Hành chính cố định 8–5", signal: { jobLevel: "nhanvien", weight: 0.6, note: "Giờ cố định → thiên nhân viên." } },
      { label: "Linh hoạt, tự sắp xếp", signal: { jobLevel: "quanly", incomeMin: 30 * M, incomeMax: 70 * M, weight: 0.7, note: "Giờ linh hoạt → có quyền tự chủ, nghiêng quản lý." } },
      { label: "Đi công tác / gặp đối tác nhiều", signal: { jobLevel: "lanhdao", incomeMin: 50 * M, incomeMax: 130 * M, weight: 0.9, note: "Đi công tác nhiều → cấp quản lý cao/điều hành." } },
      { label: "Chủ động hoàn toàn thời gian", signal: { jobLevel: "chudn", incomeMin: 40 * M, incomeMax: 120 * M, weight: 0.8, note: "Tự chủ hoàn toàn → chủ doanh nghiệp." } },
    ],
  },
  {
    id: "noi_lam", group: "cong_viec",
    ask: "“Chỗ làm anh/chị ở khu nào, từ đây qua có xa không ạ?”",
    reads: "Khu làm việc (lõi Q1/Thủ Thiêm/khu công nghệ) là proxy mức lương.",
    options: [
      { label: "Lõi trung tâm (Q1, Thủ Thiêm)", signal: { incomeMin: 40 * M, incomeMax: 120 * M, weight: 0.8, note: "Làm ở lõi trung tâm → mặt bằng lương cao." } },
      { label: "Khu công nghệ / VP lớn", signal: { incomeMin: 30 * M, incomeMax: 80 * M, weight: 0.7, note: "Khu công nghệ/VP lớn → lương khá." } },
      { label: "KCN / nhà máy", signal: { incomeMin: 15 * M, incomeMax: 40 * M, weight: 0.7, note: "KCN → thu nhập ổn định mức trung bình." } },
      { label: "Gần nhà / tại nhà", signal: { weight: 0.3, note: "Làm gần nhà → ưu tiên tiện đi lại hơn là mức lương." } },
    ],
  },
  {
    id: "tham_nien", group: "cong_viec",
    ask: "“Anh/chị gắn bó chỗ làm lâu chưa, hay vừa chuyển việc ạ?”",
    reads: "Thâm niên → độ ổn định thu nhập (ảnh hưởng duyệt vay).",
    options: [
      { label: "Trên 3 năm, ổn định", signal: { dsrRisk: "thap", proven: true, note: "Thâm niên cao → hồ sơ vay đẹp." } },
      { label: "1–3 năm", signal: { dsrRisk: "vua", note: "Thâm niên vừa → ổn." } },
      { label: "Mới vào / thử việc", signal: { dsrRisk: "cao", note: "Mới đi làm → ngân hàng dễ soi, cân nhắc đồng vay." } },
    ],
  },
  // TÀI SẢN & LỐI SỐNG
  {
    id: "xe", group: "tai_san",
    ask: "“Anh/chị chạy xe gì đi làm cho tiện ạ?”",
    reads: "Phương tiện là proxy tài sản & thu nhập trực quan nhất.",
    options: [
      { label: "Xe máy phổ thông", signal: { incomeMin: 12 * M, incomeMax: 30 * M, weight: 0.6, note: "Xe máy phổ thông → ngân sách vừa phải." } },
      { label: "Tay ga cao cấp (SH…)", signal: { incomeMin: 25 * M, incomeMax: 50 * M, weight: 0.6, note: "Tay ga cao cấp → mức sống khá." } },
      { label: "Ô tô phổ thông", signal: { incomeMin: 40 * M, incomeMax: 90 * M, downHint: 35, weight: 0.8, note: "Có ô tô → tích luỹ tốt, vốn tự có khá." } },
      { label: "Ô tô sang", signal: { incomeMin: 80 * M, incomeMax: 200 * M, downHint: 45, weight: 0.9, note: "Ô tô sang → thu nhập & tài sản cao." } },
    ],
  },
  {
    id: "cho_o", group: "tai_san",
    ask: "“Hiện anh/chị đang ở nhà riêng hay thuê, khu nào ạ?”",
    reads: "Đang thuê → cầu ở thực + ít tích luỹ; đã có nhà → nghiêng đầu tư, vốn dày.",
    options: [
      { label: "Đang thuê", signal: { intent: "o_thuc", downHint: 20, urgency: "vua", note: "Đang thuê → mua để ở, vốn mỏng hơn, ngại trả tiền thuê hoài." } },
      { label: "Ở nhà bố mẹ", signal: { downHint: 35, note: "Ở nhà bố mẹ → tích luỹ được, có thể nhờ hỗ trợ vốn." } },
      { label: "Đã có 1 nhà/căn hộ", signal: { intent: "dau_tu", downHint: 40, incomeMin: 35 * M, incomeMax: 90 * M, weight: 0.6, note: "Đã có nhà → nghiêng tích sản/đầu tư, vốn khá." } },
      { label: "Có nhiều BĐS", signal: { intent: "dau_tu", downHint: 50, incomeMin: 60 * M, incomeMax: 200 * M, weight: 0.8, note: "Nhiều BĐS → nhà đầu tư, quan tâm dòng tiền & pháp lý." } },
    ],
  },
  {
    id: "truong_con", group: "tai_san",
    ask: "“Các cháu học trường gần nhà hay trường song ngữ/quốc tế ạ?”",
    reads: "Trường con học là proxy chi tiêu & thu nhập rất mạnh.",
    options: [
      { label: "Trường công gần nhà", signal: { incomeMin: 15 * M, incomeMax: 40 * M, weight: 0.6, note: "Trường công → chi tiêu hợp lý." } },
      { label: "Tư thục / song ngữ", signal: { incomeMin: 40 * M, incomeMax: 90 * M, weight: 0.8, note: "Song ngữ → thu nhập khá, chú trọng giáo dục." } },
      { label: "Quốc tế", signal: { incomeMin: 90 * M, incomeMax: 250 * M, weight: 1, note: "Trường quốc tế → thu nhập rất cao (học phí vài trăm triệu/năm)." } },
    ],
  },
  // MỤC TIÊU & TÀI CHÍNH NHẸ
  {
    id: "muc_dich", group: "muc_tieu",
    ask: "“Anh/chị tính mua để ở luôn hay để dành đầu tư cho thuê ạ?”",
    reads: "Mục tiêu quyết hướng tư vấn: ở thực vs dòng tiền/đầu tư.",
    options: [
      { label: "Mua để ở", signal: { intent: "o_thuc", note: "Ở thực → nhấn tiện ích, trường, môi trường sống." } },
      { label: "Cho thuê lấy dòng tiền", signal: { intent: "cho_thue", note: "Cho thuê → nhấn lợi suất, tệp khách thuê." } },
      { label: "Đầu tư chờ tăng giá", signal: { intent: "dau_tu", note: "Đầu tư → nhấn pháp lý, hạ tầng, thanh khoản." } },
    ],
  },
  {
    id: "do_gap", group: "muc_tieu",
    ask: "“Anh/chị tính dọn vào ở liền hay còn thong thả tìm hiểu ạ?”",
    reads: "Độ gấp → mức độ sẵn sàng chốt.",
    options: [
      { label: "Cần sớm / đang ở thuê", signal: { urgency: "cao", note: "Gấp → ưu tiên hàng có thể nhận sớm, chốt nhanh." } },
      { label: "Trong 6–12 tháng", signal: { urgency: "vua", note: "Trung hạn → nuôi dưỡng, gửi tiến độ." } },
      { label: "Thong thả, xem dần", signal: { urgency: "thap", note: "Chưa gấp → chăm sóc dài hạn." } },
    ],
  },
  {
    id: "vay_von", group: "muc_tieu",
    ask: "“Anh/chị tính trả thẳng hay dùng gói vay ngân hàng cho nhẹ ạ?”",
    reads: "Suy ra vốn tự có & khẩu vị đòn bẩy.",
    options: [
      { label: "Trả thẳng / vay rất ít", signal: { downHint: 70, dsrRisk: "thap", note: "Trả thẳng → vốn dày, ít phụ thuộc duyệt vay." } },
      { label: "Vay khoảng một nửa", signal: { downHint: 50, note: "Vay ~50% → cân đối, an toàn." } },
      { label: "Vay tối đa, trả dần", signal: { downHint: 30, dsrRisk: "vua", note: "Vay tối đa → cần xét kỹ DSR & dòng tiền." } },
    ],
  },
  {
    id: "no_hien_co", group: "muc_tieu",
    ask: "“Hiện anh/chị còn khoản trả góp nào không — xe, hay vay tiêu dùng ạ?”",
    reads: "Nợ đang trả → ảnh hưởng trực tiếp khả năng vay (DSR).",
    options: [
      { label: "Không có khoản nào", signal: { dsrRisk: "thap", note: "Không nợ → dư địa vay tốt." } },
      { label: "Đang trả góp xe", signal: { dsrRisk: "vua", note: "Trả góp xe → trừ vào khả năng vay, cần nhập khoản này." } },
      { label: "Vài khoản (xe + tiêu dùng)", signal: { dsrRisk: "cao", note: "Nhiều khoản nợ → DSR căng, cân nhắc giảm giá căn/kéo kỳ hạn." } },
    ],
  },
  {
    id: "ngan_sach", group: "muc_tieu",
    ask: "“Tầm ngân sách nào anh/chị thấy thoải mái thì mình lọc cho trúng ạ?”",
    reads: "Khoảng giá khách tự thấy thoải mái → mỏ neo target & phân khúc.",
    options: [
      { label: "Quanh 2 tỷ", signal: { note: "Ngân sách ~2 tỷ → căn 1–2PN.", incomeMin: 18 * M, incomeMax: 35 * M, weight: 0.5 } },
      { label: "2,5 – 3,5 tỷ", signal: { note: "Ngân sách ~3 tỷ → 2PN/3PN.", incomeMin: 30 * M, incomeMax: 60 * M, weight: 0.5 } },
      { label: "3,5 – 5 tỷ", signal: { note: "Ngân sách ~4–5 tỷ → 3PN/cao cấp.", incomeMin: 50 * M, incomeMax: 100 * M, weight: 0.6 } },
      { label: "Trên 5 tỷ", signal: { note: "Ngân sách >5 tỷ → phân khúc cao.", incomeMin: 80 * M, incomeMax: 200 * M, weight: 0.6 } },
    ],
  },
];

// target-price hint (VND) for the budget question, parallel to its options
const BUDGET_TARGET: Record<number, number> = {
  0: 2_000_000_000, 1: 3_000_000_000, 2: 4_300_000_000, 3: 6_000_000_000,
};

// ── Inference ─────────────────────────────────────────────────────────────────
const JOB_RANK: Record<JobLevel, number> = { nhanvien: 1, tudo: 2, quanly: 3, chudn: 4, lanhdao: 5 };
const JOB_LABEL: Record<JobLevel, string> = {
  nhanvien: "Nhân viên", quanly: "Quản lý/Trưởng phòng", lanhdao: "Cấp cao/Điều hành",
  chudn: "Chủ doanh nghiệp", tudo: "Nghề tự do",
};
const INTENT_LABEL: Record<Intent, string> = { o_thuc: "Mua để ở", cho_thue: "Cho thuê", dau_tu: "Đầu tư" };
const TRI_LABEL: Record<Tri, string> = { thap: "thấp", vua: "vừa", cao: "cao" };
const DECISION_LABEL: Record<Decision, string> = { mot_minh: "tự quyết", vo_chong: "hai vợ chồng", gia_dinh: "cả gia đình" };

export interface DiscoveryResult {
  answered: number;
  incomeBand: { low: number; high: number } | null;
  incomeMid: number | null;
  confidence: Tri;
  jobLevel: JobLevel | null;
  jobLabel: string | null;
  rooms: 1 | 2 | 3 | null;
  dependents: number;
  intent: Intent | null;
  urgency: Tri | null;
  decision: Decision | null;
  dsrRisk: Tri | null;
  downHint: number | null;
  proven: boolean; // thu nhập chủ yếu chứng minh được?
  targetPrice: number | null;
  notes: string[]; // "đọc vị" cho sale
  // prefill cho engine đánh giá
  handoff: { income: number; dependents: number; downPaymentPercent: number; targetPrice: number | null };
}

// answers: { [questionId]: optionIndex }
export function inferDiscovery(answers: Record<string, number>): DiscoveryResult {
  const picks: { q: DiscoveryQuestion; opt: DiscoveryOption; idx: number }[] = [];
  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx == null || !q.options[idx]) continue;
    picks.push({ q, opt: q.options[idx], idx });
  }

  // income: weighted aggregate of explicit ranges
  let wSum = 0, lowSum = 0, highSum = 0, incomeSignals = 0;
  const mids: number[] = [];
  let provenVotes = 0, provenTotal = 0;
  for (const { opt } of picks) {
    const s = opt.signal;
    if (s.proven != null) { provenTotal++; if (s.proven) provenVotes++; }
    if (s.incomeMin != null && s.incomeMax != null) {
      const w = s.weight ?? 1;
      wSum += w; lowSum += s.incomeMin * w; highSum += s.incomeMax * w;
      mids.push((s.incomeMin + s.incomeMax) / 2);
      incomeSignals++;
    }
  }

  // job level: strongest-ranked among signals
  let jobLevel: JobLevel | null = null;
  for (const { opt } of picks) {
    const j = opt.signal.jobLevel;
    if (j && (!jobLevel || JOB_RANK[j] > JOB_RANK[jobLevel])) jobLevel = j;
  }

  // income band: from signals, else fall back to job-level baseline
  let incomeBand: { low: number; high: number } | null = null;
  if (wSum > 0) {
    incomeBand = { low: Math.round(lowSum / wSum), high: Math.round(highSum / wSum) };
  } else if (jobLevel) {
    const base: Record<JobLevel, [number, number]> = {
      nhanvien: [15, 30], quanly: [30, 60], lanhdao: [60, 150], chudn: [40, 120], tudo: [20, 60],
    };
    const [lo, hi] = base[jobLevel];
    incomeBand = { low: lo * M, high: hi * M };
  }
  const incomeMid = incomeBand ? Math.round((incomeBand.low + incomeBand.high) / 2) : null;

  // confidence: driven by how many income signals agree. Use dispersion of the
  // per-signal midpoints (not absolute band width) — high earners legitimately
  // have wide bands, so penalise disagreement, not magnitude.
  let confidence: Tri = "thap";
  if (incomeSignals >= 1 && mids.length) {
    const mean = mids.reduce((a, b) => a + b, 0) / mids.length;
    const variance = mids.reduce((a, b) => a + (b - mean) ** 2, 0) / mids.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1; // coefficient of variation
    if (incomeSignals >= 3 && cv < 0.45) confidence = "cao";
    else if (incomeSignals >= 2 && cv < 0.7) confidence = "vua";
    else confidence = "thap";
  }

  // categorical aggregations
  const rooms = pickMax(picks, (s) => s.rooms) as 1 | 2 | 3 | null;
  const dependents = pickMax(picks, (s) => s.dependents) ?? 0;
  const intent = pickIntent(picks);
  const urgency = pickTri(picks, "urgency");
  const dsrRisk = pickTri(picks, "dsrRisk");
  const decision = pickLast(picks, (s) => s.decision) as Decision | null;
  let downHint = pickMax(picks, (s) => s.downHint);

  // target price from budget question
  const budgetIdx = answers["ngan_sach"];
  const targetPrice = budgetIdx != null ? BUDGET_TARGET[budgetIdx] ?? null : null;

  const proven = provenTotal === 0 ? true : provenVotes >= provenTotal / 2;

  // sale-facing reasoning notes (dedup, in question order)
  const notes = picks.map((p) => p.opt.signal.note).filter((x): x is string => !!x);

  if (downHint == null && intent === "dau_tu") downHint = 40; // investors usually heavier equity
  const downPaymentPercent = downHint ?? 30;

  return {
    answered: picks.length,
    incomeBand, incomeMid, confidence,
    jobLevel, jobLabel: jobLevel ? JOB_LABEL[jobLevel] : null,
    rooms, dependents, intent, urgency, decision, dsrRisk, downHint, proven, targetPrice,
    notes,
    handoff: { income: incomeMid ?? 0, dependents, downPaymentPercent, targetPrice },
  };
}

// helpers
function pickMax(picks: { opt: DiscoveryOption }[], get: (s: Signal) => number | undefined): number | null {
  let v: number | null = null;
  for (const { opt } of picks) { const x = get(opt.signal); if (x != null && (v == null || x > v)) v = x; }
  return v;
}
function pickLast<T>(picks: { opt: DiscoveryOption }[], get: (s: Signal) => T | undefined): T | null {
  let v: T | null = null;
  for (const { opt } of picks) { const x = get(opt.signal); if (x != null) v = x; }
  return v;
}
const TRI_RANK: Record<Tri, number> = { thap: 1, vua: 2, cao: 3 };
function pickTri(picks: { opt: DiscoveryOption }[], key: "urgency" | "dsrRisk"): Tri | null {
  let v: Tri | null = null;
  for (const { opt } of picks) { const x = opt.signal[key]; if (x && (!v || TRI_RANK[x] > TRI_RANK[v])) v = x; }
  return v;
}
function pickIntent(picks: { q: DiscoveryQuestion; opt: DiscoveryOption }[]): Intent | null {
  // explicit goal answer wins; else last intent seen
  const explicit = picks.find((p) => p.q.id === "muc_dich");
  if (explicit?.opt.signal.intent) return explicit.opt.signal.intent;
  return pickLast(picks, (s) => s.intent);
}

// SALE-ONLY summary text (never shown to the customer).
export function explainDiscovery(r: DiscoveryResult): { headline: string; lines: string[] } {
  if (r.answered === 0) return { headline: "Chưa có dữ kiện", lines: ["Tick câu trả lời khi trò chuyện để hệ thống đọc vị khách."] };
  const fmtTr = (n: number) => `${Math.round(n / M)}tr`;
  const lines: string[] = [];
  if (r.incomeBand) lines.push(`Thu nhập ước tính: ${fmtTr(r.incomeBand.low)}–${fmtTr(r.incomeBand.high)}/tháng (tin cậy ${TRI_LABEL[r.confidence]}).`);
  if (r.jobLabel) lines.push(`Cấp bậc nghề nghiệp: ${r.jobLabel}${r.proven ? "" : " — thu nhập phần lớn tiền mặt, khó chứng minh"}.`);
  if (r.rooms) lines.push(`Nhu cầu: ~${r.rooms}PN${r.dependents ? `, ${r.dependents} người phụ thuộc` : ""}${r.intent ? `, ${INTENT_LABEL[r.intent]}` : ""}.`);
  if (r.decision) lines.push(`Người quyết định: ${DECISION_LABEL[r.decision]}.`);
  if (r.urgency) lines.push(`Độ gấp: ${TRI_LABEL[r.urgency]}.`);
  if (r.dsrRisk) lines.push(`Áp lực nợ hiện có: ${TRI_LABEL[r.dsrRisk]}.`);
  if (r.targetPrice) lines.push(`Ngân sách khách tự nêu: ~${(r.targetPrice / 1e9).toFixed(1).replace(/\.0$/, "")} tỷ.`);
  return { headline: r.incomeBand ? `Khách ${r.jobLabel ?? ""} · ${fmtTr(r.incomeBand.low)}–${fmtTr(r.incomeBand.high)}/th` : "Chân dung sơ bộ", lines };
}
