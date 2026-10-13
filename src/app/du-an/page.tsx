import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { projectCardSelect } from "@/lib/queries";
import { ProjectCard } from "@/components/ProjectCard";
import { projectStatusLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Dự án bất động sản" };

type SP = Promise<{ tinh?: string; "trang-thai"?: string }>;

export default async function ProjectsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const where: Prisma.ProjectWhereInput = {};
  if (sp.tinh) where.province = { slug: sp.tinh };
  if (sp["trang-thai"] && sp["trang-thai"] in projectStatusLabel) where.status = sp["trang-thai"] as ProjectStatus;
  const [provinces, projects] = await Promise.all([
    prisma.province.findMany({ where: { projects: { some: {} } }, select: { slug: true, name: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where, select: projectCardSelect, orderBy: { score: "desc" } }),
  ]);
  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/du-an${q.size ? `?${q}` : ""}`;
  };
  const pill = (active: boolean) => `rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-ink-900 text-gold-300" : "bg-white text-ink-600 hover:bg-gold-50"}`;

  return (
    <div className="container-gh py-10">
      <h1 className="font-display text-3xl font-semibold">Dự án</h1>
      <p className="mt-1 text-sm text-ink-600">{projects.length} dự án, xếp theo GoldScore dự án</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={href({ tinh: undefined })} className={pill(!sp.tinh)}>Tất cả khu vực</Link>
        {provinces.map((p) => <Link key={p.slug} href={href({ tinh: p.slug })} className={pill(sp.tinh === p.slug)}>{p.name}</Link>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={href({ "trang-thai": undefined })} className={pill(!sp["trang-thai"])}>Mọi trạng thái</Link>
        {(Object.keys(projectStatusLabel) as ProjectStatus[]).map((s) => (
          <Link key={s} href={href({ "trang-thai": s })} className={pill(sp["trang-thai"] === s)}>{projectStatusLabel[s]}</Link>
        ))}
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => <ProjectCard key={p.id} p={p} />)}
      </div>
      {projects.length === 0 && <p className="card mt-8 p-10 text-center text-sm text-ink-600">Chưa có dự án phù hợp.</p>}
    </div>
  );
}
