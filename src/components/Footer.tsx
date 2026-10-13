import Link from "next/link";
import { Logo } from "./Logo";

const COLS = [
  { title: "Khám phá", links: [["/nha-dat", "Nhà đất bán"], ["/nha-dat?giao-dich=thue", "Nhà đất cho thuê"], ["/du-an", "Dự án"], ["/ban-do", "Bản đồ"], ["/ha-tang", "Hạ tầng"]] },
  { title: "Người đăng tin", links: [["/dang-tin", "Đăng tin"], ["/quan-ly-tin", "Quản lý tin"], ["/bang-gia", "Gói dịch vụ"], ["/tin-da-luu", "Tin đã lưu"]] },
  { title: "GoldHome", links: [["/gioi-thieu", "Về chúng tôi"], ["/goldscore", "GoldScore"], ["/bao-cao", "Báo cáo thị trường"], ["/tin-tuc", "Kiến thức"], ["/dieu-khoan", "Điều khoản"], ["/quyen-rieng-tu", "Quyền riêng tư"]] },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-950 text-ink-200">
      <div className="container-gh grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-6 text-ink-400">
            Nền tảng bất động sản minh bạch: mỗi tin đăng đều có GoldScore giúp bạn so sánh giá, pháp lý và hạ tầng trước khi quyết định.
          </p>
          <p className="mt-4 text-sm"><a href="mailto:hotro@goldhome.vn" className="text-gold-300 hover:text-gold-200">hotro@goldhome.vn</a></p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-300">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm text-ink-400 hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-gh py-5 text-xs text-ink-400">© {new Date().getFullYear()} GoldHome. Dữ liệu trên trang demo là dữ liệu mẫu.</div>
      </div>
    </footer>
  );
}
