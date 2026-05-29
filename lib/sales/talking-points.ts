import type { Project, Segment } from "../data/types";

export interface TalkingPoint {
  id: string;
  text: string;
  /** Which fact(s) this point is grounded in — shown for trust. */
  basis: string;
}

const SEGMENT_VI: Record<Segment, string> = {
  luxury: "hạng sang",
  "high-end": "cao cấp",
  "mid-range": "trung cấp",
  affordable: "bình dân",
};

export interface TalkingPointInput {
  project: Project;
  amenities?: string[];
  /** Average price/m² of peers in the same district, if known. */
  districtAvg?: number;
}

// Derive sales talking points from confirmed facts only. Pure + deterministic:
// every point cites its basis, nothing is invented. Returns [] when no fact
// supports a point (caller shows an empty state rather than filler).
export function buildTalkingPoints(input: TalkingPointInput): TalkingPoint[] {
  const { project, amenities = [], districtAvg } = input;
  const points: TalkingPoint[] = [];

  if (project.developer) {
    points.push({
      id: "developer",
      text: `Dự án do ${project.developer} phát triển — nhấn mạnh uy tín và năng lực chủ đầu tư khi tư vấn.`,
      basis: `Chủ đầu tư: ${project.developer}`,
    });
  }

  if (project.district) {
    points.push({
      id: "location",
      text: `Tọa lạc tại ${project.district}${project.city ? `, ${project.city}` : ""} — khai thác lợi thế vị trí, kết nối khu vực.`,
      basis: `Khu vực: ${project.district}`,
    });
  }

  if (project.pricePerSqmM > 0) {
    if (districtAvg && districtAvg > 0) {
      const diff = Math.round(((project.pricePerSqmM - districtAvg) / districtAvg) * 100);
      if (diff <= -5) {
        points.push({
          id: "price-advantage",
          text: `Giá ~${project.pricePerSqmM} tr/m², thấp hơn ~${Math.abs(diff)}% so với mặt bằng khu vực — đây là lợi thế cạnh tranh rõ rệt khi chốt khách.`,
          basis: `Giá ${project.pricePerSqmM} tr/m² vs TB khu vực ~${districtAvg.toFixed(0)} tr/m²`,
        });
      } else if (diff >= 15) {
        points.push({
          id: "price-premium",
          text: `Giá ~${project.pricePerSqmM} tr/m² cao hơn mặt bằng ~${diff}% — chuẩn bị lý do (vị trí, tiện ích, thương hiệu) để giải thích mức giá.`,
          basis: `Giá ${project.pricePerSqmM} tr/m² vs TB khu vực ~${districtAvg.toFixed(0)} tr/m²`,
        });
      }
    } else {
      points.push({
        id: "price",
        text: `Mức giá tham chiếu ~${project.pricePerSqmM} tr/m² — nắm rõ để báo giá tự tin với khách.`,
        basis: `Giá: ${project.pricePerSqmM} tr/m²`,
      });
    }
  }

  if (project.segment) {
    const seg = SEGMENT_VI[project.segment];
    if (project.segment === "luxury" || project.segment === "high-end") {
      points.push({
        id: "segment",
        text: `Phân khúc ${seg}: tập trung nhóm khách có tài chính, đề cao trải nghiệm sống và giá trị tài sản dài hạn.`,
        basis: `Phân khúc: ${seg}`,
      });
    } else {
      points.push({
        id: "segment",
        text: `Phân khúc ${seg}: nhấn mạnh tính hợp lý về giá và khả năng thanh khoản/cho thuê.`,
        basis: `Phân khúc: ${seg}`,
      });
    }
  }

  if (amenities.length > 0) {
    const top = amenities.slice(0, 4).join(", ");
    points.push({
      id: "amenities",
      text: `Tiện ích nổi bật: ${top}${amenities.length > 4 ? "…" : ""} — dùng để vẽ ra trải nghiệm sống cho khách.`,
      basis: `Tiện ích: ${amenities.join(", ")}`,
    });
  }

  return points;
}
