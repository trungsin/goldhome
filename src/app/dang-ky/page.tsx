import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next ?? "/";
  return (
    <AuthShell title="Tạo tài khoản GoldHome" subtitle="Miễn phí, chỉ mất 30 giây.">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
