import Link from "next/link";
import Image from "next/image";
import { BedDouble, Bath, Maximize2, MapPin } from "lucide-react";
import type { ListingCardData } from "@/lib/queries";
import { formatPrice, pricePerM2, propertyTypeLabel, timeAgo } from "@/lib/format";
import { ScoreBadge } from "./ScoreBadge";
import { SaveButton } from "./SaveButton";

export function ListingCard({ l, saved }: { l: ListingCardData; saved?: boolean }) {
  return (
    <article className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/nha-dat/${l.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
          {l.images[0] && (
            <Image src={l.images[0].url} alt={l.title} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
          )}
          <div className="absolute left-3 top-3 flex gap-1.5">
            <ScoreBadge score={l.score} />
            {l.featured && <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gold-700">Nổi bật</span>}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-gold-700">{formatPrice(l.price, l.transaction)}</p>
            {l.transaction === "SALE" && <p className="text-xs text-ink-400">{pricePerM2(l.price, l.area)}</p>}
          </div>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-ink-900">{l.title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-600">
            <span className="inline-flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{l.area} m²</span>
            {l.bedrooms != null && <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{l.bedrooms} PN</span>}
            {l.bathrooms != null && <span className="inline-flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{l.bathrooms} WC</span>}
            <span className="chip !py-0.5">{propertyTypeLabel[l.propertyType]}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
            <span className="inline-flex items-center gap-1 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{l.district.name}, {l.province.name}</span>
            <span className="shrink-0">{timeAgo(l.createdAt)}</span>
          </div>
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <SaveButton listingId={l.id} initial={!!saved} />
      </div>
    </article>
  );
}
