import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({ title, subtitle, href, cta = "Xem tất cả" }: { title: string; subtitle?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-600">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
