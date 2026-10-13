import Link from "next/link";
import { Logo } from "./Logo";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { MobileNav } from "./MobileNav";

export const NAV = [
  { href: "/nha-dat", label: "Mua bán" },
  { href: "/nha-dat?giao-dich=thue", label: "Cho thuê" },
  { href: "/du-an", label: "Dự án" },
  { href: "/ban-do", label: "Bản đồ" },
  { href: "/ha-tang", label: "Hạ tầng" },
  { href: "/bao-cao", label: "Báo cáo" },
  { href: "/tin-tuc", label: "Kiến thức" },
];

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="container-gh flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-2 text-sm font-medium text-ink-600 hover:bg-gold-50 hover:text-ink-900">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/tin-da-luu" className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 sm:block">Đã lưu</Link>
              <Link href="/quan-ly-tin" className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 sm:block">Tin của tôi</Link>
              <form action={logout}>
                <button className="hidden text-sm text-ink-400 hover:text-ink-900 sm:block" title={user.email}>Đăng xuất</button>
              </form>
            </>
          ) : (
            <Link href="/dang-nhap" className="hidden text-sm font-medium text-ink-600 hover:text-ink-900 sm:block">Đăng nhập</Link>
          )}
          <Link href="/dang-tin" className="btn-gold !px-4 !py-2">Đăng tin</Link>
          <MobileNav loggedIn={!!user} />
        </div>
      </div>
    </header>
  );
}
