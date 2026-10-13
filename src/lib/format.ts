import type { LegalStatus, PropertyType, TransactionType, ProjectStatus, InfraType, InfraStatus } from "@prisma/client";

export function formatPrice(value: bigint | number, transaction: TransactionType = "SALE"): string {
  const n = Number(value);
  const suffix = transaction === "RENT" ? "/tháng" : "";
  if (n >= 1e9) return `${trim(n / 1e9)} tỷ${suffix}`;
  if (n >= 1e6) return `${trim(n / 1e6)} triệu${suffix}`;
  return `${n.toLocaleString("vi-VN")} đ${suffix}`;
}

export function pricePerM2(price: bigint | number, area: number): string {
  if (!area) return "";
  return `${trim(Number(price) / area / 1e6)} tr/m²`;
}

function trim(n: number): string {
  return n.toLocaleString("vi-VN", { maximumFractionDigits: n >= 100 ? 0 : 2 });
}

export function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export const propertyTypeLabel: Record<PropertyType, string> = {
  HOUSE: "Nhà riêng", APARTMENT: "Căn hộ", LAND: "Đất nền", VILLA: "Biệt thự",
  SHOPHOUSE: "Nhà mặt tiền", OFFICE: "Văn phòng", WAREHOUSE: "Kho xưởng",
};

export const transactionLabel: Record<TransactionType, string> = { SALE: "Bán", RENT: "Cho thuê" };

export const legalLabel: Record<LegalStatus, string> = {
  PINK_BOOK: "Sổ hồng/Sổ đỏ", SALE_CONTRACT: "Hợp đồng mua bán", PENDING: "Đang chờ sổ", OTHER: "Giấy tờ khác",
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Sắp mở bán", UNDER_CONSTRUCTION: "Đang xây dựng", HANDED_OVER: "Đã bàn giao",
};

export const infraTypeLabel: Record<InfraType, string> = {
  METRO: "Metro", EXPRESSWAY: "Cao tốc", RING_ROAD: "Vành đai", BRIDGE: "Cầu", MALL: "Trung tâm thương mại",
  HOSPITAL: "Bệnh viện", SCHOOL: "Trường học", PARK: "Công viên", INDUSTRIAL: "Khu công nghiệp",
};

export const infraStatusLabel: Record<InfraStatus, string> = {
  PLANNED: "Quy hoạch", UNDER_CONSTRUCTION: "Đang thi công", COMPLETED: "Đã hoàn thành",
};

export function slugify(input: string): string {
  return input
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
