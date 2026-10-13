import Link from "next/link";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="gh-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4df95" />
          <stop offset=".55" stopColor="#d4961f" />
          <stop offset="1" stopColor="#925417" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="#0b1120" />
      <path d="M8 21 20 10l12 11" fill="none" stroke="url(#gh-g)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 19.5V30h15V22h-6.5" fill="none" stroke="url(#gh-g)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="GoldHome – trang chủ">
      <LogoMark />
      <span className={`font-display text-xl font-bold ${light ? "text-white" : "text-ink-900"}`}>
        Gold<span className="text-gold-500">Home</span>
      </span>
    </Link>
  );
}
