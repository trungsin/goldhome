import type { InfraStatus, InfraType, LegalStatus, TransactionType } from "@prisma/client";
import { distanceKm } from "./geo";

/**
 * GoldScore: điểm 0–10 cho mỗi tin đăng, tổng hợp từ 5 tiêu chí có trọng số.
 * Mỗi tiêu chí được chấm 0–10 và đi kèm một câu giải thích ngắn.
 */
export const SCORE_WEIGHTS = { price: 0.3, legal: 0.2, infrastructure: 0.2, liveability: 0.15, completeness: 0.15 } as const;

export type ScoreKey = keyof typeof SCORE_WEIGHTS;
export type ScoreBreakdown = Record<ScoreKey, { score: number; note: string }>;

export const SCORE_LABELS: Record<ScoreKey, string> = {
  price: "Giá so với khu vực",
  legal: "Pháp lý",
  infrastructure: "Hạ tầng lân cận",
  liveability: "Tiện ích ở",
  completeness: "Độ đầy đủ thông tin",
};

type ScoreInput = {
  transaction: TransactionType;
  price: bigint | number;
  area: number;
  legal: LegalStatus;
  carAccess: boolean;
  floodRisk: boolean;
  furnished: boolean;
  roadWidth?: number | null;
  bedrooms?: number | null;
  description: string;
  imageCount: number;
  lat: number;
  lng: number;
  districtAvgPricePerM2: number; // triệu/m² (giá bán)
  infrastructure: { type: InfraType; status: InfraStatus; lat: number; lng: number; radiusKm: number }[];
};

const clamp = (n: number) => Math.max(0, Math.min(10, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export function computeScore(input: ScoreInput): { score: number; breakdown: ScoreBreakdown } {
  // 1. Giá: so sánh đơn giá với mặt bằng quận. Với tin thuê, quy đổi ~ 0.4%/tháng giá trị.
  const monthlyYield = 0.004;
  const unit = Number(input.price) / input.area / 1e6;
  const unitSale = input.transaction === "RENT" ? unit / monthlyYield : unit;
  const diff = (unitSale - input.districtAvgPricePerM2) / input.districtAvgPricePerM2;
  const priceScore = clamp(6.5 - diff * 12);
  const pct = Math.round(diff * 100);
  const priceNote =
    pct <= -3 ? `Thấp hơn ${Math.abs(pct)}% so với mặt bằng quận`
    : pct >= 3 ? `Cao hơn ${pct}% so với mặt bằng quận`
    : "Tương đương mặt bằng quận";

  // 2. Pháp lý
  const legalMap: Record<LegalStatus, [number, string]> = {
    PINK_BOOK: [10, "Có sổ hồng/sổ đỏ"],
    SALE_CONTRACT: [7, "Hợp đồng mua bán với chủ đầu tư"],
    PENDING: [5, "Đang chờ cấp sổ"],
    OTHER: [3, "Giấy tờ chưa rõ ràng, cần kiểm tra kỹ"],
  };
  const [legalScore, legalNote] = legalMap[input.legal];

  // 3. Hạ tầng: cộng điểm cho công trình trong bán kính ảnh hưởng
  const statusWeight: Record<InfraStatus, number> = { COMPLETED: 1, UNDER_CONSTRUCTION: 0.8, PLANNED: 0.4 };
  const typeWeight: Partial<Record<InfraType, number>> = { METRO: 1.4, EXPRESSWAY: 1.1, RING_ROAD: 1.1, BRIDGE: 0.9, MALL: 0.8, HOSPITAL: 0.7, SCHOOL: 0.6, PARK: 0.6, INDUSTRIAL: 0.5 };
  let infraPoints = 0;
  let nearby = 0;
  for (const i of input.infrastructure) {
    const d = distanceKm(input, i);
    if (d > i.radiusKm) continue;
    nearby++;
    infraPoints += 2.2 * statusWeight[i.status] * (typeWeight[i.type] ?? 0.5) * (1 - d / i.radiusKm / 2);
  }
  const infraScore = clamp(3 + infraPoints);
  const infraNote = nearby ? `${nearby} công trình hạ tầng trong bán kính ảnh hưởng` : "Ít công trình hạ tầng lớn gần đây";

  // 4. Tiện ích ở
  let live = 5;
  const liveNotes: string[] = [];
  if (input.carAccess) { live += 2; liveNotes.push("ô tô vào được"); }
  if ((input.roadWidth ?? 0) >= 6) { live += 1; liveNotes.push(`đường ${input.roadWidth}m`); }
  if (input.furnished) { live += 1; liveNotes.push("có nội thất"); }
  if (input.floodRisk) { live -= 3; liveNotes.push("khu vực có nguy cơ ngập"); }
  const liveScore = clamp(live);

  // 5. Độ đầy đủ thông tin
  let comp = 2;
  comp += Math.min(input.imageCount, 6) * 0.7;
  comp += Math.min(input.description.length / 400, 1) * 2.5;
  if (input.bedrooms != null) comp += 1.3;
  const compScore = clamp(comp);

  const breakdown: ScoreBreakdown = {
    price: { score: round1(priceScore), note: priceNote },
    legal: { score: legalScore, note: legalNote },
    infrastructure: { score: round1(infraScore), note: infraNote },
    liveability: { score: round1(liveScore), note: liveNotes.length ? capitalize(liveNotes.join(", ")) : "Thông tin tiện ích còn hạn chế" },
    completeness: { score: round1(compScore), note: `${input.imageCount} ảnh, mô tả ${input.description.length} ký tự` },
  };

  const score = (Object.keys(SCORE_WEIGHTS) as ScoreKey[]).reduce((s, k) => s + breakdown[k].score * SCORE_WEIGHTS[k], 0);
  return { score: round1(score), breakdown };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function scoreTone(score: number): "high" | "mid" | "low" {
  return score >= 7.5 ? "high" : score >= 5.5 ? "mid" : "low";
}
