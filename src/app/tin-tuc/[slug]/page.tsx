import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await prisma.article.findUnique({ where: { slug: (await params).slug } });
  return a ? { title: a.title, description: a.excerpt } : {};
}

export default async function ArticlePage({ params }: Props) {
  const a = await prisma.article.findUnique({ where: { slug: (await params).slug } });
  if (!a) notFound();
  return (
    <article className="container-gh max-w-3xl py-12">
      <span className="text-xs font-semibold uppercase text-gold-700">{a.category}</span>
      <h1 className="mt-2 font-display text-4xl font-semibold">{a.title}</h1>
      <p className="mt-2 text-sm text-ink-400">{a.publishedAt.toLocaleDateString("vi-VN")}</p>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-ink-100"><Image src={a.coverUrl} alt={a.title} fill priority sizes="768px" className="object-cover" /></div>
      <div className="mt-8 space-y-5 text-[15px] leading-7 text-ink-800">
        {a.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </article>
  );
}
