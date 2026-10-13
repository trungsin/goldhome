import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-gh grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-gold-500">404</p>
        <h1 className="mt-3 text-xl font-semibold">Không tìm thấy trang</h1>
        <p className="mt-1 text-sm text-ink-600">Tin đăng có thể đã bị ẩn hoặc đường dẫn không đúng.</p>
        <Link href="/" className="btn-dark mt-6">Về trang chủ</Link>
      </div>
    </div>
  );
}
