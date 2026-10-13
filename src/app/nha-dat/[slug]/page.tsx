import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Bath, Building2, Maximize2, Ruler, Route, Sofa, Car, Droplets, FileCheck2, Phone, MapPin, Eye } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { listingCardSelect } from "@/lib/queries";
import { savedIdsFor } from "@/lib/saved";
import { formatPrice, legalLabel, pricePerM2, propertyTypeLabel, timeAgo, transactionLabel, infraTypeLabel, infraStatusLabel } from "@/lib/format";
import { distanceKm } from "@/lib/geo";
import type { ScoreBreakdown } from "@/lib/score";
import { Gallery } from "@/components/Gallery";
import { ScoreBreakdownCard } from "@/components/ScoreBreakdownCard";
import { InquiryForm } from "@/components/InquiryForm";
import { ListingCard } from "@/components/ListingCard";
import { SaveButton } from "@/components/SaveButton";
import { Map } from "@/components/Map";

type Props = { params: Promise<{ slug: string }> };

async function getListing(slug: string) {
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      district: true, province: true,
      project: { select: { name: true, slug: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).slug);
  if (!l) return {};
  return { title: l.title, description: l.description.slice(0, 160), openGraph: { images: l.images[0]?.url ? [l.images[0].url] : [] } };
}

export default async function ListingDetail({ params }: Props) {
  const { slug } = await params;
  const l = await getListing(slug);
  if (!l || (l.status !== "ACTIVE" && l.status !== "SOLD")) notFound();
  const user = await getCurrentUser();

  const [similar, infra] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE", id: { not: l.id }, districtId: l.districtId, transaction: l.transaction },
      select: listingCardSelect, orderBy: { score: "desc" }, take: 4,
    }),
    prisma.infrastructure.findMany({ where: { provinceId: l.provinceId } }),
    prisma.listing.update({ where: { id: l.id }, data: { views: { increment: 1 } } }),
  ]);
  const nearbyInfra = infra
    .map((i) => ({ ...i, d: distanceKm(l, i) }))
    .filter((i) => i.d <= Math.max(i.radiusKm, 5))
    .sort((a, b) => a.d - b.d)
    .slice(0, 5);
  const saved = await savedIdsFor(user?.id, [l.id, ...similar.map((s) => s.id)]);

  const facts = [
    { icon: Maximize2, label: "Diện tích", value: `${l.area} m²` },
    l.bedrooms != null && { icon: BedDouble, label: "Phòng ngủ", value: l.bedrooms },
    l.bathrooms != null && { icon: Bath, label: "Phòng tắm", value: l.bathrooms },
    l.floors != null && { icon: Building2, label: "Số tầng", value: l.floors },
    l.frontage != null && { icon: Ruler, label: "Mặt tiền", value: `${l.frontage} m` },
    l.roadWidth != null && { icon: Route, label: "Đường vào", value: `${l.roadWidth} m` },
    { icon: FileCheck2, label: "Pháp lý", value: legalLabel[l.legal] },
    { icon: Sofa, label: "Nội thất", value: l.furnished ? "Có" : "Không" },
    { icon: Car, label: "Ô tô vào", value: l.carAccess ? "Có" : "Không" },
    { icon: Droplets, label: "Ngập nước", value: l.floodRisk ? "Có nguy cơ" : "Không ghi nhận" },
  ].filter(Boolean) as { icon: typeof Maximize2; label: string; value: string | number }[];

  const mapPoints = [
    { id: l.id, lat: l.lat, lng: l.lng, label: l.title, kind: "listing" as const },
    ...nearbyInfra.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng, label: i.name, sub: `${infraTypeLabel[i.type]} · ${infraStatusLabel[i.status]}`, kind: "infra" as const, radiusKm: i.radiusKm })),
  ];

  return (
    <div className="container-gh py-8">
      <nav className="mb-4 text-xs text-ink-400">
        <Link href="/" className="hover:text-ink-900">Trang chủ</Link> /{" "}
        <Link href={`/nha-dat${l.transaction === "RENT" ? "?giao-dich=thue" : ""}`} className="hover:text-ink-900">{transactionLabel[l.transaction]}</Link> /{" "}
        <Link href={`/nha-dat?tinh=${l.province.slug}`} className="hover:text-ink-900">{l.province.name}</Link> /{" "}
        <Link href={`/nha-dat?tinh=${l.province.slug}&quan=${l.district.slug}`} className="hover:text-ink-900">{l.district.name}</Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <Gallery images={l.images.map((i) => i.url)} title={l.title} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{l.title}</h1>
              <SaveButton listingId={l.id} initial={saved.has(l.id)} />
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-ink-600"><MapPin className="h-4 w-4" />{l.address}</p>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <p className="text-3xl font-bold text-gold-700">{formatPrice(l.price, l.transaction)}</p>
              {l.transaction === "SALE" && <p className="text-sm text-ink-600">{pricePerM2(l.price, l.area)}</p>}
              <span className="chip">{propertyTypeLabel[l.propertyType]}</span>
              {l.status === "SOLD" && <span className="chip !bg-red-100 !text-red-700">Đã giao dịch</span>}
              {l.project && <Link href={`/du-an/${l.project.slug}`} className="chip hover:bg-gold-100">Dự án {l.project.name}</Link>}
            </div>
            <p className="mt-3 flex items-center gap-3 text-xs text-ink-400">
              <span>Đăng {timeAgo(l.createdAt)}</span><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{l.views.toLocaleString("vi-VN")} lượt xem</span>
            </p>
          </div>

          <section className="card p-6">
            <h2 className="mb-4 font-semibold">Thông tin chính</h2>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-3">
                  <f.icon className="mt-0.5 h-5 w-5 text-gold-600" />
                  <div><dt className="text-xs text-ink-400">{f.label}</dt><dd className="text-sm font-semibold">{f.value}</dd></div>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="mb-3 font-semibold">Mô tả</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-ink-800">{l.description}</p>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-semibold">Vị trí & hạ tầng xung quanh</h2>
            <Map points={mapPoints} center={[l.lat, l.lng]} zoom={13} height={360} />
            {nearbyInfra.length > 0 && (
              <ul className="mt-4 divide-y divide-ink-100">
                {nearbyInfra.map((i) => (
                  <li key={i.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span><span className="font-medium">{i.name}</span> <span className="text-ink-400">· {infraTypeLabel[i.type]}</span></span>
                    <span className="text-right text-xs text-ink-600">{i.d.toFixed(1)} km · {infraStatusLabel[i.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <p className="text-xs text-ink-400">Liên hệ người đăng</p>
            <p className="mt-1 text-lg font-semibold">{l.contactName}</p>
            <a href={`tel:${l.contactPhone}`} className="btn-gold mt-4 w-full"><Phone className="h-4 w-4" />{l.contactPhone.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3")}</a>
            <div className="my-5 h-px bg-ink-100" />
            <InquiryForm listingId={l.id} defaultName={user?.name} defaultPhone={user?.phone ?? ""} />
          </div>
          <ScoreBreakdownCard score={l.score} breakdown={l.scoreBreakdown as ScoreBreakdown | null} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title mb-6">Tin tương tự tại {l.district.name}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => <ListingCard key={s.id} l={s} saved={saved.has(s.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
