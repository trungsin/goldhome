import type { Metadata } from "next";
import { Prose } from "@/components/Prose";
import { SCORE_LABELS, SCORE_WEIGHTS, type ScoreKey } from "@/lib/score";

export const metadata: Metadata = { title: "GoldScore được tính thế nào?" };

const DETAILS: Record<ScoreKey, string> = {
  price: "So sánh đơn giá (triệu/m²) của tin với giá tham chiếu của quận/huyện. Rẻ hơn mặt bằng được cộng điểm, đắt hơn bị trừ điểm. Với tin cho thuê, giá thuê được quy đổi tương đương giá bán theo tỷ suất cho thuê phổ biến.",
  legal: "Sổ hồng/sổ đỏ đạt điểm tối đa; hợp đồng mua bán với chủ đầu tư và tài sản đang chờ sổ được điểm trung bình; giấy tờ khác được điểm thấp và kèm khuyến nghị kiểm tra kỹ.",
  infrastructure: "Cộng điểm cho mỗi công trình (metro, cao tốc, vành đai, cầu, trung tâm thương mại, bệnh viện…) nằm trong bán kính ảnh hưởng. Công trình đã hoàn thành có trọng số cao hơn công trình đang thi công hoặc mới quy hoạch.",
  liveability: "Ô tô vào được, đường rộng từ 6m và có nội thất được cộng điểm; khu vực có nguy cơ ngập bị trừ điểm.",
  completeness: "Tin có nhiều ảnh, mô tả chi tiết và đủ thông số (phòng ngủ, phòng tắm…) giúp người mua đánh giá nhanh hơn nên được điểm cao hơn.",
};

export default function GoldScorePage() {
  return (
    <Prose title="GoldScore được tính thế nào?">
      <p>
        GoldScore là điểm từ 0 đến 10 được tính tự động mỗi khi tin được đăng hoặc chỉnh sửa. Điểm là trung bình có trọng số của năm tiêu chí dưới đây.
        GoldScore là công cụ tham khảo, không thay thế việc thẩm định thực tế.
      </p>
      {(Object.keys(SCORE_WEIGHTS) as ScoreKey[]).map((k) => (
        <section key={k}>
          <h2>{SCORE_LABELS[k]} · {Math.round(SCORE_WEIGHTS[k] * 100)}%</h2>
          <p>{DETAILS[k]}</p>
        </section>
      ))}
      <h2>Thang điểm</h2>
      <ul>
        <li><b>7,5 trở lên:</b> tin nổi bật, nên ưu tiên xem.</li>
        <li><b>5,5 – 7,4:</b> tin ở mức trung bình, cần xem xét thêm.</li>
        <li><b>Dưới 5,5:</b> có điểm cần lưu ý về giá, pháp lý hoặc thông tin.</li>
      </ul>
    </Prose>
  );
}
