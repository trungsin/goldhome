import type { Prisma } from "@prisma/client";

export const listingCardSelect = {
  id: true, slug: true, title: true, price: true, area: true, bedrooms: true, bathrooms: true,
  transaction: true, propertyType: true, legal: true, score: true, featured: true, createdAt: true,
  district: { select: { name: true } }, province: { select: { name: true } },
  images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ListingSelect;

export type ListingCardData = Prisma.ListingGetPayload<{ select: typeof listingCardSelect }>;

export const projectCardSelect = {
  id: true, slug: true, name: true, status: true, legal: true, score: true, coverUrl: true, priceFrom: true, priceTo: true,
  developer: { select: { name: true, slug: true } }, district: { select: { name: true } }, province: { select: { name: true } },
} satisfies Prisma.ProjectSelect;

export type ProjectCardData = Prisma.ProjectGetPayload<{ select: typeof projectCardSelect }>;
