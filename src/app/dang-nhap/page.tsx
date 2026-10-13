import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? "/";
  if (await getCurrentUser()) redirect(next.startsWith("/") ? next : "/");
  return (
    <AuthShell title="Đăng nhập" subtitle="Lưu tin, đăng tin và nhận thông báo giá.">
      <LoginForm next={next} />
      <p className="mt-6 rounded-xl bg-ink-50 p-3 text-xs text-ink-600">Tài khoản demo: <b>demo@goldhome.vn</b> / <b>goldhome123</b></p>
    </AuthShell>
  );
}
