import Link from "next/link";

export function Pagination({ page, totalPages, makeHref }: { page: number; totalPages: number; makeHref: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2);
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-ink-400">…</span>}
          <Link
            href={makeHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-medium ${p === page ? "bg-ink-900 text-gold-300" : "bg-white text-ink-700 hover:bg-gold-50"}`}
          >
            {p}
          </Link>
        </span>
      ))}
    </nav>
  );
}
