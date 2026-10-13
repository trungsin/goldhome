import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { prisma } from "@/lib/db";
import { listingCardSelect } from "@/lib/queries";
import { formatPrice, legalLabel, projectStatusLabel } from "@/lib/format";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ListingCard } from "@/components/ListingCard";
import { Map } from "@/components/Map";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await prisma.project.findUnique({ where: { slug: (await params).slug }, select: { name: true, description: true } });
  return p ? { title: p.name, description: p.description.slice(0, 160) } : {};
}

export default async function ProjectDetail({ params }: Props) {
  const p = await prisma.project.findUnique({
    where: { slug: (await params).slug },
    include: { developer: true, district: true, province: true },
  });
  if (!p) notFound();
  const listings = await prisma.listing.findMany({ where: { projectId: p.id, status: "ACTIVE" }, select: listingCardSelect, orderBy: { score: "desc" }, take: 8 });
  const facts = [
    ["Trạng thái", projectStatusLabel[p.status]],
    ["Pháp lý", legalLabel[p.legal]],
    ["Quy mô", p.totalUnits ? `${p.totalUnits.toLocaleString("vi-VN")} sản phẩm` : "—"],
    ["Diện tích", p.areaHa ? `${p.areaHa} ha` : "—"],
    ["Bàn giao", p.completion ? String(p.completion) : "—"],
    ["Khoảng giá", p.priceFrom && p.priceTo ? `${formatPrice(p.priceFrom)} – ${formatPrice(p.priceTo)}` : "Đang cập nhật"],
  ];

  return (
    <div>
      <section className="relative h-[340px] bg-ink-900 sm:h-[420px]">
        <Image src={p.coverUrl} alt={p.name} fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30" />
        <div className="container-gh relative flex h-full flex-col justify-end pb-10 text-white">
          <div className="flex gap-2"><span className="chip !bg-white/90">{projectStatusLabel[p.status]}</span><ScoreBadge score={p.score} /></div>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-ink-200">{p.address} · Chủ đầu tư <Link href={`/chu-dau-tu/${p.developer.slug}`} className="text-gold-300 hover:underline">{p.developer.name}</Link></p>
        </div>
      </section>
      <div className="container-gh mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="mb-3 font-semibold">Tổng quan</h2>
            <p className="text-sm leading-7 text-ink-800">{p.description}</p>
          </section>
          <section className="card p-6">
            <h2 className="mb-4 font-semibold">Tiện ích</h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.amenities.map((a) => <li key={a} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-gold-600" />{a}</li>)}
            </ul>
          </section>
          <section className="card p-6">
            <h2 className="mb-4 font-semibold">Vị trí</h2>
            <Map points={[{ id: p.id, lat: p.lat, lng: p.lng, label: p.name, kind: "project" }]} center={[p.lat, p.lng]} zoom={14} height={320} />
          </section>
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-20">
          <dl className="space-y-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-ink-100 pb-3 text-sm last:border-0"><dt className="text-ink-600">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
          <Link href={`/nha-dat?q=${encodeURIComponent(p.name)}`} className="btn-gold mt-5 w-full">Xem tin trong dự án</Link>
        </aside>
      </div>
      {listings.length > 0 && (
        <section className="container-gh mt-16">
          <h2 className="section-title mb-6">Tin đăng tại {p.name}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </section>
      )}
    </div>
  );
}
