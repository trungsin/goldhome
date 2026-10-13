import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = { title: "Điều khoản sử dụng" };

export default function TermsPage() {
  return (
    <Prose title="Điều khoản sử dụng" updated="10/2026">
      <p>Bằng việc sử dụng GoldHome, bạn đồng ý với các điều khoản dưới đây. Đây là bản mẫu cho môi trường demo và cần được rà soát pháp lý trước khi vận hành chính thức.</p>
      <h2>1. Tài khoản</h2>
      <p>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình.</p>
      <h2>2. Nội dung tin đăng</h2>
      <ul>
        <li>Thông tin phải trung thực, đúng với tài sản thực tế.</li>
        <li>Không đăng hình ảnh, nội dung mà bạn không có quyền sử dụng.</li>
        <li>GoldHome có quyền ẩn hoặc xoá tin vi phạm mà không cần báo trước.</li>
      </ul>
      <h2>3. GoldScore</h2>
      <p>GoldScore chỉ mang tính tham khảo, được tính tự động từ thông tin người đăng cung cấp và dữ liệu công khai. GoldHome không bảo đảm tính chính xác tuyệt đối của điểm số.</p>
      <h2>4. Giới hạn trách nhiệm</h2>
      <p>GoldHome là nền tảng kết nối, không phải bên tham gia giao dịch. Người dùng tự thẩm định và chịu trách nhiệm với quyết định của mình.</p>
    </Prose>
  );
}
