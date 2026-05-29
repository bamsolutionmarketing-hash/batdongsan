import type { GuidanceItem, GuidanceResult, Project } from "../data/types";

// Threshold above the district average at which price is flagged.
const PRICE_PREMIUM_RATIO = 1.5;

function districtAverage(target: Project, all: Project[]): number {
  const peers = all.filter((p) => p.district === target.district);
  if (peers.length === 0) return target.pricePerSqmM;
  const sum = peers.reduce((acc, p) => acc + p.pricePerSqmM, 0);
  return sum / peers.length;
}

// Pure guidance engine: derive recommendations for `target` given the full set.
export function buildGuidance(target: Project, all: Project[]): GuidanceResult {
  const items: GuidanceItem[] = [];

  const avg = districtAverage(target, all);
  if (avg > 0 && target.pricePerSqmM >= avg * PRICE_PREMIUM_RATIO) {
    items.push({
      id: "price-premium",
      level: "warning",
      title: "Giá cao hơn mặt bằng khu vực",
      detail: `Giá ~${target.pricePerSqmM} tr/m² cao hơn đáng kể so với trung bình district (~${avg.toFixed(0)} tr/m²).`,
    });
  }

  if (target.status === "planning") {
    items.push({
      id: "status-planning",
      level: "warning",
      title: "Dự án đang ở giai đoạn quy hoạch",
      detail: "Pháp lý và tiến độ chưa chắc chắn — cân nhắc rủi ro trước khi xuống tiền.",
    });
  }

  if (target.segment === "luxury" || target.segment === "high-end") {
    items.push({
      id: "segment-premium",
      level: "tip",
      title: "Phân khúc cao cấp",
      detail: "Thanh khoản phụ thuộc nhóm khách hẹp; ưu tiên vị trí và uy tín chủ đầu tư.",
    });
  }

  const related = (target.relatedIds ?? []).filter((id) => all.some((p) => p.id === id));
  if (related.length > 0) {
    items.push({
      id: "related-projects",
      level: "info",
      title: "Có dự án liên quan",
      detail: `Liên kết với ${related.length} dự án cùng hệ — có thể so sánh giá và tiện ích.`,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "baseline",
      level: "info",
      title: "Chưa có cảnh báo nổi bật",
      detail: `${target.name} nằm trong mặt bằng chung của ${target.district}.`,
    });
  }

  return { projectId: target.id, items };
}
