import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { listingCardSelect } from "@/lib/queries";
import { savedIdsFor } from "@/lib/saved";
import { buildOrder, buildWhere, parseFilters, toQuery, type SearchParams } from "@/lib/filters";
import { ListingCard } from "@/components/ListingCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 12;
const SORTS = [["moi", "Mới nhất"], ["diem", "GoldScore cao"], ["gia-tang", "Giá thấp → cao"], ["gia-giam", "Giá cao → thấp"], ["dien-tich", "Diện tích lớn"]] as const;

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  return { title: f.transaction === "RENT" ? "Nhà đất cho thuê" : "Nhà đất bán" };
}

export default async function ListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const f = parseFilters(sp);
  const where = buildWhere(f);
  const user = await getCurrentUser();

  const [provinces, districts, total, listings] = await Promise.all([
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    f.province ? prisma.district.findMany({ where: { province: { slug: f.province } }, select: { slug: true, name: true }, orderBy: { name: "asc" } }) : [],
    prisma.listing.count({ where }),
    prisma.listing.findMany({ where, select: listingCardSelect, orderBy: buildOrder(f.sort), skip: (f.page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);
  const saved = await savedIdsFor(user?.id, listings.map((l) => l.id));
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const heading = `${f.transaction === "RENT" ? "Nhà đất cho thuê" : "Nhà đất bán"}${f.province ? ` tại ${provinces.find((p) => p.slug === f.province)?.name ?? ""}` : " toàn quốc"}`;

  return (
    <div className="container-gh py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex rounded-full bg-white p-1 shadow-card">
            <Link href={`/nha-dat?${toQuery(sp, { "giao-dich": undefined, trang: undefined })}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.transaction === "SALE" ? "bg-ink-900 text-gold-300" : "text-ink-600"}`}>Mua bán</Link>
            <Link href={`/nha-dat?${toQuery(sp, { "giao-dich": "thue", trang: undefined })}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.transaction === "RENT" ? "bg-ink-900 text-gold-300" : "text-ink-600"}`}>Cho thuê</Link>
          </div>
          <h1 className="font-display text-3xl font-semibold">{heading}</h1>
          <p className="mt-1 text-sm text-ink-600">{total.toLocaleString("vi-VN")} kết quả{f.q && <> cho “{f.q}”</>}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map(([key, label]) => (
            <Link key={key} href={`/nha-dat?${toQuery(sp, { "sap-xep": key === "moi" ? undefined : key, trang: undefined })}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${f.sort === key ? "bg-gold-400 text-ink-950" : "bg-white text-ink-600 hover:bg-gold-50"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FilterSidebar f={f} provinces={provinces} districts={districts} />
        </aside>
        <div>
          {listings.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-semibold">Không tìm thấy tin phù hợp</p>
              <p className="mt-1 text-sm text-ink-600">Thử nới rộng khoảng giá hoặc bỏ bớt bộ lọc.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => <ListingCard key={l.id} l={l} saved={saved.has(l.id)} />)}
            </div>
          )}
          <Pagination page={f.page} totalPages={totalPages} makeHref={(p) => `/nha-dat?${toQuery(sp, { trang: p > 1 ? String(p) : undefined })}`} />
        </div>
      </div>
    </div>
  );
}
