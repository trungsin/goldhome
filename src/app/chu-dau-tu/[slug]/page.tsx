import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { projectCardSelect } from "@/lib/queries";
import { ProjectCard } from "@/components/ProjectCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await prisma.developer.findUnique({ where: { slug: (await params).slug }, select: { name: true } });
  return d ? { title: `Chủ đầu tư ${d.name}` } : {};
}

export default async function DeveloperPage({ params }: Props) {
  const d = await prisma.developer.findUnique({ where: { slug: (await params).slug } });
  if (!d) notFound();
  const projects = await prisma.project.findMany({ where: { developerId: d.id }, select: projectCardSelect, orderBy: { score: "desc" } });
  return (
    <div className="container-gh py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">Chủ đầu tư</p>
      <h1 className="mt-1 font-display text-4xl font-semibold">{d.name}</h1>
      <p className="mt-3 max-w-3xl text-ink-600">{d.description}</p>
      <div className="mt-4 flex gap-6 text-sm text-ink-600">
        {d.founded && <span>Thành lập <strong className="text-ink-900">{d.founded}</strong></span>}
        <span><strong className="text-ink-900">{projects.length}</strong> dự án trên GoldHome</span>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
    </div>
  );
}
