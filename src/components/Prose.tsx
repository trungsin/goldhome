export function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-gh max-w-3xl py-12">
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      {updated && <p className="mt-2 text-sm text-ink-400">Cập nhật: {updated}</p>}
      <div className="mt-8 space-y-5 text-[15px] leading-7 text-ink-800 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </div>
  );
}
