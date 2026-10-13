"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { computeScore } from "@/lib/score";
import { slugify } from "@/lib/format";
import type { FormState } from "./auth";

export async function toggleSaved(listingId: string): Promise<{ saved?: boolean; needLogin?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { needLogin: true };
  const key = { userId_listingId: { userId: user.id, listingId } };
  const existing = await prisma.savedListing.findUnique({ where: key });
  if (existing) await prisma.savedListing.delete({ where: key });
  else await prisma.savedListing.create({ data: { userId: user.id, listingId } });
  revalidatePath("/tin-da-luu");
  return { saved: !existing };
}

const optNum = z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().nonnegative().optional());
const bool = z.preprocess((v) => v === "on" || v === "true", z.boolean());

const listingSchema = z.object({
  title: z.string().trim().min(15, "Tiêu đề tối thiểu 15 ký tự").max(150),
  description: z.string().trim().min(50, "Mô tả tối thiểu 50 ký tự").max(5000),
  transaction: z.enum(["SALE", "RENT"]),
  propertyType: z.enum(["HOUSE", "APARTMENT", "LAND", "VILLA", "SHOPHOUSE", "OFFICE", "WAREHOUSE"]),
  priceMillion: z.coerce.number().positive("Nhập giá (triệu đồng)"),
  area: z.coerce.number().positive("Nhập diện tích"),
  bedrooms: optNum, bathrooms: optNum, floors: optNum, frontage: optNum, roadWidth: optNum,
  legal: z.enum(["PINK_BOOK", "SALE_CONTRACT", "PENDING", "OTHER"]),
  furnished: bool, carAccess: bool, floodRisk: bool,
  districtId: z.string().min(1, "Chọn quận/huyện"),
  address: z.string().trim().min(5, "Nhập địa chỉ"),
  contactName: z.string().trim().min(2, "Nhập tên liên hệ"),
  contactPhone: z.string().trim().regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
  imageUrls: z.string().optional(),
});

export async function saveListing(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/dang-tin");
  const parsed = listingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, error: "Vui lòng kiểm tra lại thông tin" };
  const d = parsed.data;
  const editingId = String(formData.get("id") ?? "") || null;

  const district = await prisma.district.findUnique({ where: { id: d.districtId } });
  if (!district) return { error: "Quận/huyện không hợp lệ" };
  if (editingId) {
    const owned = await prisma.listing.findFirst({ where: { id: editingId, ownerId: user.id } });
    if (!owned) return { error: "Bạn không có quyền sửa tin này" };
  }

  const imageUrls = (d.imageUrls ?? "").split(/\s+/).map((s) => s.trim()).filter((s) => /^https:\/\//.test(s)).slice(0, 12);
  const images = imageUrls.length ? imageUrls : [`https://picsum.photos/seed/gh-user-${Date.now()}/960/640`];
  // Vị trí xấp xỉ theo trung tâm quận; có thể thay bằng geocoding sau này
  const lat = district.lat + (Math.random() - 0.5) * 0.02;
  const lng = district.lng + (Math.random() - 0.5) * 0.02;
  const price = BigInt(Math.round(d.priceMillion * 1e6));
  const infrastructure = await prisma.infrastructure.findMany({ where: { provinceId: district.provinceId } });
  const { score, breakdown } = computeScore({
    transaction: d.transaction, price, area: d.area, legal: d.legal, carAccess: d.carAccess, floodRisk: d.floodRisk,
    furnished: d.furnished, roadWidth: d.roadWidth, bedrooms: d.bedrooms, description: d.description, imageCount: images.length,
    lat, lng, districtAvgPricePerM2: district.avgPricePerM2, infrastructure,
  });

  const data = {
    title: d.title, description: d.description, transaction: d.transaction, propertyType: d.propertyType, price, area: d.area,
    bedrooms: d.bedrooms, bathrooms: d.bathrooms, floors: d.floors, frontage: d.frontage, roadWidth: d.roadWidth,
    legal: d.legal, furnished: d.furnished, carAccess: d.carAccess, floodRisk: d.floodRisk, address: d.address,
    provinceId: district.provinceId, districtId: district.id, contactName: d.contactName, contactPhone: d.contactPhone,
    score, scoreBreakdown: breakdown,
  };

  let slug: string;
  if (editingId) {
    const updated = await prisma.listing.update({
      where: { id: editingId },
      data: { ...data, images: { deleteMany: {}, create: images.map((url, position) => ({ url, position })) } },
    });
    slug = updated.slug;
  } else {
    const created = await prisma.listing.create({
      data: {
        ...data, lat, lng, slug: `${slugify(d.title)}-${Date.now().toString(36)}`, ownerId: user.id,
        images: { create: images.map((url, position) => ({ url, position })) },
      },
    });
    slug = created.slug;
  }
  revalidatePath("/");
  revalidatePath("/quan-ly-tin");
  redirect(`/nha-dat/${slug}`);
}

export async function setListingStatus(id: string, status: ListingStatus) {
  const user = await requireUser("/quan-ly-tin");
  await prisma.listing.updateMany({ where: { id, ownerId: user.id }, data: { status } });
  revalidatePath("/quan-ly-tin");
}

export async function deleteListing(id: string) {
  const user = await requireUser("/quan-ly-tin");
  await prisma.listing.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/quan-ly-tin");
}

const inquirySchema = z.object({
  listingId: z.string().min(1),
  name: z.string().trim().min(2, "Nhập tên"),
  phone: z.string().trim().regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ"),
  message: z.string().trim().min(5, "Nhập lời nhắn").max(1000),
});

type InquiryState = (NonNullable<FormState> & { ok?: boolean }) | undefined;

export async function sendInquiry(_: InquiryState, formData: FormData): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  const user = await getCurrentUser();
  await prisma.inquiry.create({ data: { ...parsed.data, userId: user?.id } });
  return { ok: true };
}
