import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Gói dịch vụ đăng tin" };

const PLANS = [
  { name: "Miễn phí", price: "0đ", period: "", desc: "Cho chủ nhà đăng lẻ", features: ["3 tin đang hiển thị", "Hiển thị 30 ngày", "GoldScore tự động", "Nhận lời nhắn từ khách"], cta: "Bắt đầu", highlight: false },
  { name: "Silver", price: "199.000đ", period: "/tháng", desc: "Cho môi giới cá nhân", features: ["30 tin đang hiển thị", "Hiển thị 60 ngày", "Gợi ý cải thiện GoldScore", "Thống kê lượt xem theo ngày", "Huy hiệu môi giới xác thực"], cta: "Chọn Silver", highlight: true },
  { name: "Gold", price: "599.000đ", period: "/tháng", desc: "Cho sàn & đội nhóm", features: ["Không giới hạn tin", "10 lượt đẩy tin nổi bật/tháng", "Báo cáo thị trường chi tiết", "Quản lý nhiều thành viên", "Hỗ trợ ưu tiên"], cta: "Chọn Gold", highlight: false },
];

export default function PricingPage() {
  return (
    <div className="container-gh py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-semibold">Gói dịch vụ</h1>
        <p className="mt-3 text-ink-600">Bắt đầu miễn phí. Nâng cấp khi bạn cần đăng nhiều tin hơn và muốn tin nổi bật hơn.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`relative rounded-3xl p-8 ${p.highlight ? "bg-ink-950 text-white shadow-2xl ring-2 ring-gold-400" : "card"}`}>
            {p.highlight && <span className="absolute -top-3 left-8 rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-ink-950">Phổ biến nhất</span>}
            <h2 className={`font-display text-2xl font-semibold ${p.highlight ? "text-gold-300" : ""}`}>{p.name}</h2>
            <p className={`mt-1 text-sm ${p.highlight ? "text-ink-200" : "text-ink-600"}`}>{p.desc}</p>
            <p className="mt-6"><span className="text-4xl font-bold">{p.price}</span><span className={p.highlight ? "text-ink-200" : "text-ink-400"}>{p.period}</span></p>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="h-5 w-5 shrink-0 text-gold-500" />{f}</li>)}
            </ul>
            <Link href="/dang-ky?next=/dang-tin" className={`${p.highlight ? "btn-gold" : "btn-dark"} mt-8 w-full`}>{p.cta}</Link>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-ink-400">Giá đã bao gồm VAT. Bản demo chưa tích hợp cổng thanh toán.</p>
    </div>
  );
}
