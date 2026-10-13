import type { Metadata } from "next";
import type { InfraStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { infraStatusLabel, infraTypeLabel } from "@/lib/format";
import { Map } from "@/components/Map";

export const metadata: Metadata = { title: "Hạ tầng & quy hoạch" };

const STATUS_STYLE: Record<InfraStatus, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-800",
  UNDER_CONSTRUCTION: "bg-gold-100 text-gold-800",
  PLANNED: "bg-ink-100 text-ink-600",
};

export default async function InfraPage() {
  const items = await prisma.infrastructure.findMany({
    include: { province: { select: { name: true } }, district: { select: { name: true } } },
    orderBy: [{ province: { name: "asc" } }, { status: "asc" }],
  });
  const byProvince = Object.groupBy(items, (i) => i.province.name);
  return (
    <div className="container-gh py-10">
      <h1 className="font-display text-3xl font-semibold">Hạ tầng & quy hoạch</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">
        Các công trình giao thông, thương mại và dịch vụ công được dùng để tính điểm “Hạ tầng lân cận” trong GoldScore. Vòng tròn trên bản đồ thể hiện bán kính ảnh hưởng.
      </p>
      <div className="mt-6">
        <Map
          points={items.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng, label: i.name, sub: `${infraTypeLabel[i.type]} · ${infraStatusLabel[i.status]}`, kind: "infra", radiusKm: i.radiusKm }))}
          center={[14.8, 106.8]} zoom={6} height={460}
        />
      </div>
      <div className="mt-10 space-y-10">
        {Object.entries(byProvince).map(([province, list]) => (
          <section key={province}>
            <h2 className="section-title mb-4 !text-2xl">{province}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {list!.map((i) => (
                <article key={i.id} id={i.slug} className="card scroll-mt-24 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-gold-700">{infraTypeLabel[i.type]}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[i.status]}`}>{infraStatusLabel[i.status]}{i.expectedYear && i.status !== "COMPLETED" ? ` · ${i.expectedYear}` : ""}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{i.name}</h3>
                  <p className="mt-1 text-sm text-ink-600">{i.description}</p>
                  <p className="mt-3 text-xs text-ink-400">{i.district?.name ? `${i.district.name} · ` : ""}Bán kính ảnh hưởng {i.radiusKm} km</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
