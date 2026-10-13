import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ListingForm } from "@/components/ListingForm";

export const metadata: Metadata = { title: "Đăng tin" };

export default async function NewListingPage() {
  const user = await requireUser("/dang-tin");
  const [provinces, districts] = await Promise.all([
    prisma.province.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.district.findMany({ select: { id: true, name: true, provinceId: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="container-gh max-w-3xl py-10">
      <h1 className="font-display text-3xl font-semibold">Đăng tin mới</h1>
      <p className="mb-8 mt-1 text-sm text-ink-600">Tin được hiển thị ngay sau khi đăng, kèm GoldScore tính tự động.</p>
      <ListingForm provinces={provinces} districts={districts} defaults={{ contactName: user.name, contactPhone: user.phone ?? "" }} />
    </div>
  );
}
