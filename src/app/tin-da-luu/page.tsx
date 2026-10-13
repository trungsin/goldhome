import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { listingCardSelect } from "@/lib/queries";
import { ListingCard } from "@/components/ListingCard";

export const metadata: Metadata = { title: "Tin đã lưu" };

export default async function SavedPage() {
  const user = await requireUser("/tin-da-luu");
  const saved = await prisma.savedListing.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, select: { listing: { select: listingCardSelect } } });
  return (
    <div className="container-gh py-10">
      <h1 className="font-display text-3xl font-semibold">Tin đã lưu</h1>
      <p className="mt-1 text-sm text-ink-600">{saved.length} tin</p>
      {saved.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="font-semibold">Chưa lưu tin nào</p>
          <p className="mt-1 text-sm text-ink-600">Bấm biểu tượng trái tim trên tin đăng để lưu lại.</p>
          <Link href="/nha-dat" className="btn-dark mt-4">Khám phá nhà đất</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{saved.map((s) => <ListingCard key={s.listing.id} l={s.listing} saved />)}</div>
      )}
    </div>
  );
}
