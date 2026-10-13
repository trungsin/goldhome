import Link from "next/link";
import Image from "next/image";
import type { ProjectCardData } from "@/lib/queries";
import { formatPrice, legalLabel, projectStatusLabel } from "@/lib/format";
import { ScoreBadge } from "./ScoreBadge";

export function ProjectCard({ p }: { p: ProjectCardData }) {
  return (
    <Link href={`/du-an/${p.slug}`} className="card group block overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <Image src={p.coverUrl} alt={p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink-800">{projectStatusLabel[p.status]}</span>
          <ScoreBadge score={p.score} />
        </div>
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="font-display text-xl font-semibold">{p.name}</h3>
          <p className="text-xs text-ink-200">{p.district.name}, {p.province.name}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 text-sm">
        <div>
          <p className="text-xs text-ink-400">Chủ đầu tư</p>
          <p className="font-medium">{p.developer.name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-400">{legalLabel[p.legal]}</p>
          {p.priceFrom && <p className="font-semibold text-gold-700">Từ {formatPrice(p.priceFrom)}</p>}
        </div>
      </div>
    </Link>
  );
}
