import { LogoMark } from "./Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-gh grid min-h-[70vh] place-items-center py-12">
      <div className="card w-full max-w-md p-8">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-4 font-display text-2xl font-semibold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-600">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
