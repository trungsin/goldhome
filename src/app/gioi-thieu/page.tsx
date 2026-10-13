import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Về GoldHome" };

export default function AboutPage() {
  return (
    <Prose title="Về GoldHome">
      <p>
        GoldHome ra đời từ một câu hỏi đơn giản: <em>làm sao biết một tin rao nhà đất có đáng để đi xem hay không?</em> Thay vì để người mua tự đối chiếu
        hàng chục nguồn thông tin, chúng tôi gom các dữ kiện quan trọng nhất vào một điểm số dễ hiểu, kèm giải thích rõ ràng.
      </p>
      <h2>Chúng tôi tin vào</h2>
      <ul>
        <li><b>Minh bạch:</b> mọi điểm số đều có lý do đi kèm, không có “hộp đen”.</li>
        <li><b>Dữ liệu trước, cảm xúc sau:</b> giá khu vực, pháp lý và hạ tầng là nền tảng của một quyết định tốt.</li>
        <li><b>Tôn trọng người đăng tin:</b> tin đăng tốt được hiển thị nổi bật nhờ chất lượng, không chỉ nhờ trả phí.</li>
      </ul>
      <h2>Liên hệ</h2>
      <p>Email: <a className="text-gold-700" href="mailto:hotro@goldhome.vn">hotro@goldhome.vn</a>. Tìm hiểu thêm về <Link className="text-gold-700" href="/goldscore">cách tính GoldScore</Link>.</p>
    </Prose>
  );
}
