import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ListingForm } from "@/components/ListingForm";

export const metadata: Metadata = { title: "Sửa tin" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/sua-tin/${id}`);
  const l = await prisma.listing.findFirst({ where: { id, ownerId: user.id }, include: { images: { orderBy: { position: "asc" } } } });
  if (!l) notFound();
  const [provinces, districts] = await Promise.all([
    prisma.province.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.district.findMany({ select: { id: true, name: true, provinceId: true }, orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="container-gh max-w-3xl py-10">
      <h1 className="mb-8 font-display text-3xl font-semibold">Sửa tin</h1>
      <ListingForm
        provinces={provinces}
        districts={districts}
        defaults={{
          ...l, priceMillion: Number(l.price) / 1e6, provinceId: l.provinceId, districtId: l.districtId,
          imageUrls: l.images.map((i) => i.url).join("\n"),
        }}
      />
    </div>
  );
}
