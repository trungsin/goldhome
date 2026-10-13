import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [listings, projects, articles] = await Promise.all([
    prisma.listing.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.project.findMany({ select: { slug: true } }),
    prisma.article.findMany({ select: { slug: true, publishedAt: true } }),
  ]);
  const statics = ["", "/nha-dat", "/du-an", "/ban-do", "/ha-tang", "/bao-cao", "/tin-tuc", "/bang-gia", "/goldscore", "/gioi-thieu"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}` })),
    ...listings.map((l) => ({ url: `${base}/nha-dat/${l.slug}`, lastModified: l.updatedAt })),
    ...projects.map((p) => ({ url: `${base}/du-an/${p.slug}` })),
    ...articles.map((a) => ({ url: `${base}/tin-tuc/${a.slug}`, lastModified: a.publishedAt })),
  ];
}
