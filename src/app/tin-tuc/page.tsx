import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Kiến thức nhà đất" };

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } });
  const [first, ...rest] = articles;
  return (
    <div className="container-gh py-10">
      <h1 className="font-display text-3xl font-semibold">Kiến thức nhà đất</h1>
      {first && (
        <Link href={`/tin-tuc/${first.slug}`} className="card mt-8 grid overflow-hidden md:grid-cols-2">
          <div className="relative aspect-[16/10] bg-ink-100"><Image src={first.coverUrl} alt={first.title} fill sizes="50vw" className="object-cover" /></div>
          <div className="flex flex-col justify-center p-8">
            <span className="text-xs font-semibold uppercase text-gold-700">{first.category}</span>
            <h2 className="mt-2 font-display text-2xl font-semibold">{first.title}</h2>
            <p className="mt-3 text-sm text-ink-600">{first.excerpt}</p>
          </div>
        </Link>
      )}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <Link key={a.id} href={`/tin-tuc/${a.slug}`} className="card overflow-hidden hover:shadow-lg">
            <div className="relative aspect-[16/9] bg-ink-100"><Image src={a.coverUrl} alt={a.title} fill sizes="33vw" className="object-cover" /></div>
            <div className="p-5">
              <span className="text-xs font-semibold uppercase text-gold-700">{a.category}</span>
              <h3 className="mt-1 font-semibold">{a.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-ink-600">{a.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
