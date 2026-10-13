import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import type { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPrice, timeAgo } from "@/lib/format";
import { ScoreBadge } from "@/components/ScoreBadge";
import { MyListingActions } from "@/components/MyListingActions";

export const metadata: Metadata = { title: "Quản lý tin" };

const STATUS: Record<ListingStatus, [string, string]> = {
  ACTIVE: ["Đang hiển thị", "bg-emerald-100 text-emerald-800"], HIDDEN: ["Đã ẩn", "bg-ink-100 text-ink-600"],
  SOLD: ["Đã giao dịch", "bg-gold-100 text-gold-800"], DRAFT: ["Nháp", "bg-ink-100 text-ink-600"], EXPIRED: ["Hết hạn", "bg-red-100 text-red-700"],
};

export default async function MyListingsPage() {
  const user = await requireUser("/quan-ly-tin");
  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { images: { take: 1, orderBy: { position: "asc" } }, _count: { select: { inquiries: true, savedBy: true } } },
  });
  const totals = listings.reduce((a, l) => ({ views: a.views + l.views, inquiries: a.inquiries + l._count.inquiries }), { views: 0, inquiries: 0 });

  return (
    <div className="container-gh py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tin của tôi</h1>
          <p className="mt-1 text-sm text-ink-600">{listings.length} tin · {totals.views.toLocaleString("vi-VN")} lượt xem · {totals.inquiries} lời nhắn</p>
        </div>
        <Link href="/dang-tin" className="btn-gold">+ Đăng tin mới</Link>
      </div>
      {listings.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="font-semibold">Bạn chưa có tin đăng nào</p>
          <Link href="/dang-tin" className="btn-dark mt-4">Đăng tin đầu tiên</Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {listings.map((l) => (
            <li key={l.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:w-36">
                {l.images[0] && <Image src={l.images[0].url} alt="" fill sizes="144px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[l.status][1]}`}>{STATUS[l.status][0]}</span>
                  <ScoreBadge score={l.score} />
                </div>
                <Link href={`/nha-dat/${l.slug}`} className="mt-1 block truncate font-semibold hover:text-gold-700">{l.title}</Link>
                <p className="text-sm text-gold-700">{formatPrice(l.price, l.transaction)}</p>
                <p className="text-xs text-ink-400">Đăng {timeAgo(l.createdAt)} · {l.views} lượt xem · {l._count.savedBy} lượt lưu · {l._count.inquiries} lời nhắn</p>
              </div>
              <MyListingActions id={l.id} status={l.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
