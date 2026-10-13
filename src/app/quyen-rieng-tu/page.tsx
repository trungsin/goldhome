import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Chính sách quyền riêng tư" };

export default function PrivacyPage() {
  return (
    <Prose title="Chính sách quyền riêng tư" updated="10/2026">
      <p>Chúng tôi chỉ thu thập dữ liệu cần thiết để vận hành dịch vụ. Đây là bản mẫu cho môi trường demo.</p>
      <h2>Dữ liệu thu thập</h2>
      <ul>
        <li>Thông tin tài khoản: họ tên, email, số điện thoại.</li>
        <li>Nội dung bạn đăng: tin rao, hình ảnh, lời nhắn.</li>
        <li>Dữ liệu sử dụng cơ bản: lượt xem tin, tin đã lưu.</li>
      </ul>
      <h2>Mục đích sử dụng</h2>
      <p>Hiển thị tin đăng, kết nối người mua với người bán, cải thiện GoldScore và chất lượng dịch vụ. Chúng tôi không bán dữ liệu cá nhân cho bên thứ ba.</p>
      <h2>Quyền của bạn</h2>
      <p>Bạn có thể yêu cầu xem, sửa hoặc xoá dữ liệu cá nhân bằng cách gửi email tới hotro@goldhome.vn.</p>
    </Prose>
  );
}
