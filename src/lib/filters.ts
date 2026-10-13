import type { Prisma, PropertyType } from "@prisma/client";

export const TYPE_SLUGS: Record<string, PropertyType> = {
  "nha-rieng": "HOUSE", "can-ho": "APARTMENT", "dat-nen": "LAND", "biet-thu": "VILLA",
  "mat-tien": "SHOPHOUSE", "van-phong": "OFFICE", "kho-xuong": "WAREHOUSE",
};

export type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const num = (v: string) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export function parseFilters(sp: SearchParams) {
  return {
    q: one(sp.q).trim(),
    transaction: one(sp["giao-dich"]) === "thue" ? ("RENT" as const) : ("SALE" as const),
    province: one(sp.tinh),
    district: one(sp.quan),
    type: one(sp.loai),
    priceMin: num(one(sp["gia-min"])), // triệu
    priceMax: num(one(sp["gia-max"])),
    areaMin: num(one(sp["dt-min"])),
    areaMax: num(one(sp["dt-max"])),
    beds: num(one(sp["phong-ngu"])),
    legal: one(sp["phap-ly"]) === "so" ? ("PINK_BOOK" as const) : undefined,
    car: one(sp["o-to"]) === "1",
    noFlood: one(sp["khong-ngap"]) === "1",
    minScore: num(one(sp["diem-min"])),
    sort: one(sp["sap-xep"]) || "moi",
    page: Math.max(1, num(one(sp.trang)) ?? 1),
  };
}

export type Filters = ReturnType<typeof parseFilters>;

export function buildWhere(f: Filters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "ACTIVE", transaction: f.transaction };
  if (f.q) where.OR = [
    { title: { contains: f.q, mode: "insensitive" } },
    { address: { contains: f.q, mode: "insensitive" } },
    { district: { name: { contains: f.q, mode: "insensitive" } } },
    { project: { name: { contains: f.q, mode: "insensitive" } } },
  ];
  if (f.province) where.province = { slug: f.province };
  if (f.district) where.district = { slug: f.district, ...(f.province ? { province: { slug: f.province } } : {}) };
  if (f.type && TYPE_SLUGS[f.type]) where.propertyType = TYPE_SLUGS[f.type];
  if (f.priceMin != null || f.priceMax != null)
    where.price = {
      ...(f.priceMin != null ? { gte: BigInt(Math.round(f.priceMin * 1e6)) } : {}),
      ...(f.priceMax != null ? { lte: BigInt(Math.round(f.priceMax * 1e6)) } : {}),
    };
  if (f.areaMin != null || f.areaMax != null) where.area = { ...(f.areaMin != null ? { gte: f.areaMin } : {}), ...(f.areaMax != null ? { lte: f.areaMax } : {}) };
  if (f.beds != null) where.bedrooms = { gte: f.beds };
  if (f.legal) where.legal = f.legal;
  if (f.car) where.carAccess = true;
  if (f.noFlood) where.floodRisk = false;
  if (f.minScore != null) where.score = { gte: f.minScore };
  return where;
}

export function buildOrder(sort: string): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "diem": return [{ score: "desc" }];
    case "gia-tang": return [{ price: "asc" }];
    case "gia-giam": return [{ price: "desc" }];
    case "dien-tich": return [{ area: "desc" }];
    case "gia-tot": return [{ score: "desc" }, { price: "asc" }];
    default: return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export function toQuery(sp: SearchParams, patch: Record<string, string | undefined>) {
  const out = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) { const s = one(v); if (s) out.set(k, s); }
  for (const [k, v] of Object.entries(patch)) { if (v) out.set(k, v); else out.delete(k); }
  return out.toString();
}
