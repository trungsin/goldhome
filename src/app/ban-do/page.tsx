import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, infraStatusLabel, infraTypeLabel } from "@/lib/format";
import { Map } from "@/components/Map";

export const metadata: Metadata = { title: "Bản đồ nhà đất" };

export default async function MapPage({ searchParams }: { searchParams: Promise<{ tinh?: string }> }) {
  const { tinh } = await searchParams;
  const provinces = await prisma.province.findMany({ orderBy: { name: "asc" } });
  const current = provinces.find((p) => p.slug === tinh) ?? provinces.find((p) => p.slug === "ho-chi-minh") ?? provinces[0];
  const [listings, infra, projects] = await Promise.all([
    prisma.listing.findMany({ where: { status: "ACTIVE", provinceId: current.id }, select: { id: true, slug: true, title: true, lat: true, lng: true, price: true, transaction: true, score: true } }),
    prisma.infrastructure.findMany({ where: { provinceId: current.id } }),
    prisma.project.findMany({ where: { provinceId: current.id }, select: { id: true, slug: true, name: true, lat: true, lng: true } }),
  ]);
  const points = [
    ...infra.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng, label: i.name, sub: `${infraTypeLabel[i.type]} · ${infraStatusLabel[i.status]}`, kind: "infra" as const, radiusKm: i.radiusKm })),
    ...projects.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name, sub: "Dự án", href: `/du-an/${p.slug}`, kind: "project" as const })),
    ...listings.map((l) => ({ id: l.id, lat: l.lat, lng: l.lng, label: formatPrice(l.price, l.transaction), sub: `${l.title} · GoldScore ${l.score.toFixed(1)}`, href: `/nha-dat/${l.slug}`, kind: "listing" as const })),
  ];
  return (
    <div className="container-gh py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Bản đồ {current.name}</h1>
          <p className="text-sm text-ink-600">{listings.length} tin đăng · {projects.length} dự án · {infra.length} công trình hạ tầng</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {provinces.map((p) => (
            <Link key={p.slug} href={`/ban-do?tinh=${p.slug}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${p.id === current.id ? "bg-ink-900 text-gold-300" : "bg-white text-ink-600 hover:bg-gold-50"}`}>{p.name}</Link>
          ))}
        </div>
      </div>
      <div className="mb-3 flex gap-4 text-xs text-ink-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-gold-500" />Tin đăng</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-ink-900" />Dự án</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-blue-600" />Hạ tầng</span>
      </div>
      <Map key={current.id} points={points} center={[current.lat, current.lng]} zoom={11} height="70vh" />
    </div>
  );
}
