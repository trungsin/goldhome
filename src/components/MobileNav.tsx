"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/nha-dat", label: "Mua bán" },
  { href: "/nha-dat?giao-dich=thue", label: "Cho thuê" },
  { href: "/du-an", label: "Dự án" },
  { href: "/ban-do", label: "Bản đồ" },
  { href: "/ha-tang", label: "Hạ tầng" },
  { href: "/bao-cao", label: "Báo cáo" },
  { href: "/tin-tuc", label: "Kiến thức" },
];

export function MobileNav({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const links = [...LINKS, ...(loggedIn ? [{ href: "/quan-ly-tin", label: "Tin của tôi" }, { href: "/tin-da-luu", label: "Tin đã lưu" }] : [{ href: "/dang-nhap", label: "Đăng nhập" }])];
  return (
    <div className="lg:hidden">
      <button aria-label="Mở menu" onClick={() => setOpen(!open)} className="rounded-full p-2 hover:bg-ink-100">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-16 border-b border-ink-100 bg-white px-4 py-3 shadow-card">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-gold-50">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
