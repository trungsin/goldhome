import Link from "next/link";
import { ShieldCheck, TrainFront, Scale, KeyRound, Landmark, TrendingUp, Home as HomeIcon, Map } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { listingCardSelect, projectCardSelect } from "@/lib/queries";
import { savedIdsFor } from "@/lib/saved";
import { HeroSearch } from "@/components/HeroSearch";
import { ListingCard } from "@/components/ListingCard";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeader } from "@/components/SectionHeader";
import { SCORE_LABELS, SCORE_WEIGHTS, type ScoreKey } from "@/lib/score";
import { infraStatusLabel, infraTypeLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

const GOALS = [
  { icon: HomeIcon, title: "Tìm nhà để ở", desc: "Ưu tiên pháp lý rõ, ô tô vào, không ngập", href: "/nha-dat?sap-xep=diem&o-to=1" },
  { icon: TrendingUp, title: "Đầu tư sinh lời", desc: "Giá thấp hơn khu vực, gần hạ tầng mới", href: "/nha-dat?sap-xep=gia-tot" },
  { icon: KeyRound, title: "Thuê nhà", desc: "Căn hộ, nhà nguyên căn, mặt bằng", href: "/nha-dat?giao-dich=thue" },
  { icon: Map, title: "Xem trên bản đồ", desc: "Tin đăng và công trình hạ tầng", href: "/ban-do" },
];

const QUICK = [
  ["Nhà riêng TP.HCM", "/nha-dat?tinh=ho-chi-minh&loai=nha-rieng"],
  ["Căn hộ Hà Nội", "/nha-dat?tinh=ha-noi&loai=can-ho"],
  ["Dưới 3 tỷ", "/nha-dat?gia-max=3000"],
  ["Đất nền Bình Dương", "/nha-dat?tinh=binh-duong&loai=dat-nen"],
  ["Căn hộ biển Đà Nẵng", "/nha-dat?tinh=da-nang&loai=can-ho"],
];

export default async function HomePage() {
  const user = await getCurrentUser();
  const active = { status: "ACTIVE" as const };
  const [provinces, latest, topScored, rentals, projects, infra, stats] = await Promise.all([
    prisma.province.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.listing.findMany({ where: { ...active, transaction: "SALE" }, select: listingCardSelect, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.listing.findMany({ where: { ...active, transaction: "SALE" }, select: listingCardSelect, orderBy: { score: "desc" }, take: 4 }),
    prisma.listing.findMany({ where: { ...active, transaction: "RENT" }, select: listingCardSelect, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.project.findMany({ where: { featured: true }, select: projectCardSelect, orderBy: { score: "desc" }, take: 3 }),
    prisma.infrastructure.findMany({ where: { status: "UNDER_CONSTRUCTION" }, orderBy: { expectedYear: "asc" }, take: 4, include: { province: { select: { name: true } } } }),
    prisma.listing.aggregate({ where: active, _count: true, _avg: { score: true } }),
  ]);
  const saved = await savedIdsFor(user?.id, [...latest, ...topScored, ...rentals].map((l) => l.id));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,180,52,.28),transparent_55%)]" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-gh relative py-16 sm:py-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-200">
            <ShieldCheck className="h-3.5 w-3.5" /> {stats._count.toLocaleString("vi-VN")} tin đăng đã được chấm GoldScore
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Chọn nhà bằng <span className="bg-gradient-to-r from-gold-200 to-gold-500 bg-clip-text text-transparent">dữ liệu</span>, không chỉ bằng cảm tính
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-200">
            GoldHome chấm điểm từng tin đăng theo giá khu vực, pháp lý và hạ tầng xung quanh để bạn biết ngay căn nào đáng xem.
          </p>
          <div className="mt-8 max-w-4xl">
            <HeroSearch provinces={provinces} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {QUICK.map(([label, href]) => (
              <Link key={href} href={href} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink-200 hover:border-gold-400 hover:text-gold-200">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="container-gh -mt-8 relative z-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g) => (
            <Link key={g.title} href={g.href} className="card group flex items-start gap-3 p-5 transition hover:ring-2 hover:ring-gold-300">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-700 group-hover:bg-gold-400 group-hover:text-ink-950">
                <g.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{g.title}</span>
                <span className="text-sm text-ink-600">{g.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="container-gh mt-16">
        <SectionHeader title="Tin mới đăng" subtitle="Cập nhật liên tục từ chủ nhà và môi giới" href="/nha-dat" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((l) => <ListingCard key={l.id} l={l} saved={saved.has(l.id)} />)}
        </div>
      </section>

      {/* GoldScore explainer */}
      <section className="container-gh mt-20">
        <div className="grid overflow-hidden rounded-3xl bg-ink-900 text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-gold-300">GoldScore</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Một con số, năm lý do</h2>
            <p className="mt-4 text-ink-200">
              Mỗi tin đăng nhận điểm từ 0 đến 10. Điểm trung bình hiện tại là{" "}
              <strong className="text-gold-300">{(stats._avg.score ?? 0).toFixed(1)}</strong>. Bấm vào bất kỳ tin nào để xem chi tiết từng tiêu chí.
            </p>
            <ul className="mt-6 space-y-3">
              {(Object.keys(SCORE_WEIGHTS) as ScoreKey[]).map((k) => (
                <li key={k} className="flex items-center gap-3">
                  <span className="w-44 text-sm text-ink-200">{SCORE_LABELS[k]}</span>
                  <span className="h-2 flex-1 rounded-full bg-white/10">
                    <span className="block h-2 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${SCORE_WEIGHTS[k] * 100 * 3.3}%` }} />
                  </span>
                  <span className="w-10 text-right text-sm font-semibold text-gold-300">{Math.round(SCORE_WEIGHTS[k] * 100)}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href="/nha-dat?sap-xep=diem" className="btn-gold">Tin điểm cao nhất</Link>
              <Link href="/goldscore" className="btn border border-white/20 text-white hover:border-gold-300">Cách tính điểm</Link>
            </div>
          </div>
          <div className="grid gap-4 bg-ink-950/50 p-8 sm:grid-cols-2 sm:p-10">
            {topScored.map((l) => <ListingCard key={l.id} l={l} saved={saved.has(l.id)} />)}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="container-gh mt-20">
        <SectionHeader title="Dự án đáng chú ý" subtitle="Xếp theo GoldScore dự án" href="/du-an" />
        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Infrastructure */}
      <section className="container-gh mt-20">
        <SectionHeader title="Hạ tầng đang thi công" subtitle="Các công trình có thể thay đổi giá trị khu vực xung quanh" href="/ha-tang" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infra.map((i) => (
            <Link key={i.id} href={`/ha-tang#${i.slug}`} className="card p-5 hover:ring-2 hover:ring-gold-300">
              <div className="flex items-center gap-2 text-gold-700">
                {i.type === "METRO" ? <TrainFront className="h-5 w-5" /> : i.type === "BRIDGE" ? <Landmark className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
                <span className="text-xs font-semibold uppercase">{infraTypeLabel[i.type]}</span>
              </div>
              <h3 className="mt-3 font-semibold">{i.name}</h3>
              <p className="mt-1 text-sm text-ink-600">{i.province.name}</p>
              <p className="mt-3 text-xs text-ink-400">{infraStatusLabel[i.status]}{i.expectedYear ? ` · dự kiến ${i.expectedYear}` : ""}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Rentals */}
      <section className="container-gh mt-20">
        <SectionHeader title="Cho thuê nổi bật" href="/nha-dat?giao-dich=thue" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rentals.map((l) => <ListingCard key={l.id} l={l} saved={saved.has(l.id)} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container-gh mt-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-br from-gold-200 via-gold-300 to-gold-500 p-8 sm:flex-row sm:items-center sm:p-12">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink-950">Có nhà cần bán hoặc cho thuê?</h2>
            <p className="mt-2 text-ink-800">Đăng tin trong 3 phút, nhận GoldScore ngay để biết tin của bạn hấp dẫn đến đâu.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dang-tin" className="btn-dark">Đăng tin miễn phí</Link>
            <Link href="/bang-gia" className="btn border border-ink-900/20 text-ink-900 hover:bg-white/30">Xem gói dịch vụ</Link>
          </div>
        </div>
      </section>
    </>
  );
}
