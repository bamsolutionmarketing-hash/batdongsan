import type { Project } from "./types";

// Seed projects used to render the map + guidance engine end-to-end.
// Anchored on Masteri and Gladia, with a few neighbours so the graph has edges.
export const seedProjects: Project[] = [
  {
    id: "masteri-thao-dien",
    name: "Masteri Thảo Điền",
    developer: "Masterise Homes",
    district: "Quận 2",
    city: "TP.HCM",
    segment: "high-end",
    status: "completed",
    pricePerSqmM: 95,
    relatedIds: ["masteri-an-phu"],
  },
  {
    id: "masteri-an-phu",
    name: "Masteri An Phú",
    developer: "Masterise Homes",
    district: "Quận 2",
    city: "TP.HCM",
    segment: "high-end",
    status: "handover",
    pricePerSqmM: 110,
    relatedIds: ["masteri-thao-dien"],
  },
  {
    id: "gladia-an-khanh",
    name: "Gladia by The Water",
    developer: "Masterise Homes",
    district: "TP. Thủ Đức",
    city: "TP.HCM",
    segment: "luxury",
    status: "selling",
    pricePerSqmM: 160,
  },
  {
    id: "the-river-thu-thiem",
    name: "The River Thủ Thiêm",
    developer: "Refico",
    district: "TP. Thủ Đức",
    city: "TP.HCM",
    segment: "luxury",
    status: "handover",
    pricePerSqmM: 150,
  },
  {
    id: "vinhomes-grand-park",
    name: "Vinhomes Grand Park",
    developer: "Vinhomes",
    district: "TP. Thủ Đức",
    city: "TP.HCM",
    segment: "mid-range",
    status: "selling",
    pricePerSqmM: 55,
  },
];
