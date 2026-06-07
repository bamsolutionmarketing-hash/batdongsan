// Compliance for the finance tools. Every shared output (text copy + branded
// image) MUST carry a disclaimer: the numbers are illustrative, not a promise of
// profit, price growth, or an approved loan (mirrors R10 in the script lint).

export const DISCLAIMER =
  "Số liệu chỉ mang tính minh hoạ, không phải cam kết lợi nhuận, tăng giá hay phê duyệt khoản vay. Lãi suất & chính sách thực tế do ngân hàng/chủ đầu tư quyết định.";

// Shorter line for tight image footers.
export const DISCLAIMER_SHORT = "Số liệu minh hoạ — không phải cam kết lợi nhuận/khoản vay.";

// Banned phrasings if an agent edits the copy text before sharing. Reuses the
// R10 spirit: no guaranteed return / price growth. Returns offending matches.
const BANNED =
  /cam kết lợi nhuận|chắc chắn sinh lời|cam kết sinh lời|chắc chắn tăng giá|chắc chắn lời|không thể lỗ|lãi tối thiểu|bao lợi nhuận|cam kết tăng giá/i;

export function lintShareText(text: string): { ok: boolean; match: string | null } {
  const m = text.match(BANNED);
  return { ok: !m, match: m?.[0] ?? null };
}
