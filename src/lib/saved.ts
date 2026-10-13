import { prisma } from "./db";

export async function savedIdsFor(userId: string | undefined, listingIds: string[]): Promise<Set<string>> {
  if (!userId || listingIds.length === 0) return new Set();
  const rows = await prisma.savedListing.findMany({ where: { userId, listingId: { in: listingIds } }, select: { listingId: true } });
  return new Set(rows.map((r) => r.listingId));
}
