# GoldHome

Nền tảng mua bán & cho thuê bất động sản, mỗi tin đăng được chấm **GoldScore** (0–10) dựa trên giá khu vực, pháp lý, hạ tầng lân cận, tiện ích và độ đầy đủ thông tin.

## Công nghệ

| Lớp | Lựa chọn |
|---|---|
| Web | Next.js 15 (App Router, Server Components, Server Actions), React 19, TypeScript |
| Giao diện | Tailwind CSS 3, lucide-react, font Be Vietnam Pro + Playfair Display |
| Dữ liệu | **PostgreSQL 16** qua Prisma ORM |
| Xác thực | Email + mật khẩu (bcrypt), phiên JWT ký HS256 trong cookie httpOnly |
| Bản đồ | Leaflet + OpenStreetMap |
| Triển khai | Docker / docker-compose (Next.js standalone) |

## Chạy nhanh bằng Docker

```bash
docker compose up --build
# mở http://localhost:3000
```

Lần chạy đầu tự migrate và nạp dữ liệu mẫu (`SEED_ON_START=true`). Sau đó nên đặt `SEED_ON_START=false` để không xoá dữ liệu thật.

## Chạy khi phát triển

```bash
cp .env.example .env            # chỉnh DATABASE_URL, AUTH_SECRET
docker compose up -d db         # hoặc dùng PostgreSQL có sẵn
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Tài khoản mẫu (mật khẩu `goldhome123`): `demo@goldhome.vn`, `admin@goldhome.vn`, `agent1@goldhome.vn` … `agent5@goldhome.vn`.

## Tính năng

- **Trang chủ:** tìm kiếm nhanh, lối tắt theo nhu cầu, tin mới, tin GoldScore cao, dự án, hạ tầng đang thi công, tin cho thuê.
- **Nhà đất** (`/nha-dat`): lọc theo giao dịch, tỉnh/quận, loại nhà đất, giá, diện tích, phòng ngủ, pháp lý, ô tô, ngập, GoldScore; sắp xếp; phân trang.
- **Chi tiết tin:** thư viện ảnh, thông số, bảng điểm GoldScore có giải thích, bản đồ và hạ tầng gần đó, form gửi lời nhắn, tin tương tự.
- **Dự án / chủ đầu tư**, **bản đồ** tổng hợp, **hạ tầng & quy hoạch**, **báo cáo thị trường** (tổng hợp SQL trực tiếp).
- **Tài khoản:** đăng ký, đăng nhập, đăng / sửa / ẩn / đánh dấu đã bán / xoá tin, tin đã lưu, thống kê lượt xem và lời nhắn.
- **Nội dung:** kiến thức, gói dịch vụ, GoldScore, giới thiệu, điều khoản, quyền riêng tư; `sitemap.xml`, `robots.txt`.

## Cấu trúc

```
prisma/schema.prisma   # mô hình dữ liệu PostgreSQL
prisma/seed.ts         # dữ liệu mẫu (giả lập)
src/lib/score.ts       # thuật toán GoldScore
src/lib/filters.ts     # parse query → Prisma where
src/app/actions/       # server actions (auth, tin đăng)
src/app/**/page.tsx    # các trang
src/components/        # thành phần giao diện
```

## Lộ trình đề xuất

1. Upload ảnh lên S3/R2 thay cho nhập link.
2. Geocoding địa chỉ để có toạ độ chính xác.
3. Thanh toán gói Silver/Gold (VNPay/MoMo), đẩy tin nổi bật.
4. Trang quản trị duyệt tin, báo cáo vi phạm.
5. Tìm kiếm toàn văn tiếng Việt (pg_trgm / unaccent) và cảnh báo giá qua email.

> Dữ liệu tin đăng, dự án và chủ đầu tư trong `seed.ts` là dữ liệu giả lập phục vụ demo. Ảnh minh hoạ lấy từ picsum.photos.
