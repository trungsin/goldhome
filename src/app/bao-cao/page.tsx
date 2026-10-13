import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Báo cáo thị trường" };
export const dynamic = "force-dynamic";

type Row = { province: string; district: string; province_slug: string; district_slug: string; ref: number; listings: bigint; avg_unit: number | null; avg_score: number | null };

export default async function ReportPage() {
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT p.name AS province, d.name AS district, p.slug AS province_slug, d.slug AS district_slug,
           d."avgPricePerM2" AS ref,
           COUNT(l.id) AS listings,
           AVG(l.price::float8 / l.area / 1e6) FILTER (WHERE l.transaction = 'SALE') AS avg_unit,
           AVG(l.score) AS avg_score
    FROM "District" d
    JOIN "Province" p ON p.id = d."provinceId"
    LEFT JOIN "Listing" l ON l."districtId" = d.id AND l.status = 'ACTIVE'
    GROUP BY p.name, d.name, p.slug, d.slug, d."avgPricePerM2"
    HAVING COUNT(l.id) > 0
    ORDER BY p.name, avg_score DESC NULLS LAST`;

  const best = [...rows].filter((r) => r.avg_unit).sort((a, b) => (a.avg_unit! / a.ref) - (b.avg_unit! / b.ref)).slice(0, 3);

  return (
    <div className="container-gh py-10">
      <h1 className="font-display text-3xl font-semibold">Báo cáo thị trường</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-600">Tổng hợp trực tiếp từ các tin đang hiển thị trên GoldHome: đơn giá rao bán trung bình so với giá tham chiếu khu vực và GoldScore trung bình.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {best.map((r) => {
          const diff = Math.round((r.avg_unit! / r.ref - 1) * 100);
          return (
            <Link key={r.district_slug + r.province_slug} href={`/nha-dat?tinh=${r.province_slug}&quan=${r.district_slug}`} className="card p-5 hover:ring-2 hover:ring-gold-300">
              <p className="text-xs font-semibold uppercase text-gold-700">Giá rao thấp so với tham chiếu</p>
              <h2 className="mt-2 text-lg font-semibold">{r.district}, {r.province}</h2>
              <p className="mt-1 text-sm text-ink-600">Đơn giá rao trung bình {r.avg_unit!.toFixed(0)} tr/m² ({diff > 0 ? "+" : ""}{diff}% so với tham chiếu {r.ref} tr/m²)</p>
            </Link>
          );
        })}
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase text-ink-400">
            <tr><th className="px-4 py-3">Khu vực</th><th className="px-4 py-3 text-right">Tin đăng</th><th className="px-4 py-3 text-right">Đơn giá rao (tr/m²)</th><th className="px-4 py-3 text-right">Tham chiếu</th><th className="px-4 py-3 text-right">Chênh lệch</th><th className="px-4 py-3 text-right">GoldScore TB</th></tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {rows.map((r) => {
              const diff = r.avg_unit ? Math.round((r.avg_unit / r.ref - 1) * 100) : null;
              return (
                <tr key={r.province_slug + r.district_slug} className="hover:bg-gold-50/40">
                  <td className="px-4 py-3"><Link href={`/nha-dat?tinh=${r.province_slug}&quan=${r.district_slug}`} className="font-medium hover:text-gold-700">{r.district}</Link><span className="text-ink-400">, {r.province}</span></td>
                  <td className="px-4 py-3 text-right">{Number(r.listings)}</td>
                  <td className="px-4 py-3 text-right">{r.avg_unit ? r.avg_unit.toFixed(0) : "—"}</td>
                  <td className="px-4 py-3 text-right text-ink-600">{r.ref}</td>
                  <td className={`px-4 py-3 text-right font-medium ${diff == null ? "" : diff <= 0 ? "text-emerald-700" : "text-red-600"}`}>{diff == null ? "—" : `${diff > 0 ? "+" : ""}${diff}%`}</td>
                  <td className="px-4 py-3 text-right font-semibold">{r.avg_score?.toFixed(1) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
