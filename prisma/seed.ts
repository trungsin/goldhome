/* Dữ liệu mẫu cho GoldHome. Tất cả tin đăng, dự án và chủ đầu tư đều là dữ liệu giả lập. */
import { PrismaClient, type InfraStatus, type InfraType, type LegalStatus, type PropertyType, type TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeScore } from "../src/lib/score";
import { slugify } from "../src/lib/format";

const prisma = new PrismaClient();

// Bộ sinh số ngẫu nhiên có seed để dữ liệu ổn định giữa các lần chạy
let seed = 20261013;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);
const int = (a: number, b: number) => Math.floor(between(a, b + 1));
const img = (key: string, w = 960, h = 640) => `https://picsum.photos/seed/${key}/${w}/${h}`;

const PROVINCES = [
  {
    slug: "ho-chi-minh", name: "TP. Hồ Chí Minh", lat: 10.7769, lng: 106.7009, avg: 95,
    districts: [
      ["quan-1", "Quận 1", 10.7756, 106.7004, 280], ["quan-3", "Quận 3", 10.7843, 106.6844, 210],
      ["binh-thanh", "Bình Thạnh", 10.8106, 106.7091, 120], ["phu-nhuan", "Phú Nhuận", 10.7992, 106.6803, 140],
      ["tan-binh", "Tân Bình", 10.8015, 106.6527, 110], ["go-vap", "Gò Vấp", 10.8387, 106.6653, 85],
      ["quan-7", "Quận 7", 10.7340, 106.7218, 95], ["thu-duc", "TP. Thủ Đức", 10.8494, 106.7537, 80],
      ["binh-tan", "Bình Tân", 10.7653, 106.6036, 65], ["hoc-mon", "Hóc Môn", 10.8863, 106.5923, 35],
      ["nha-be", "Nhà Bè", 10.6953, 106.7390, 45],
    ],
  },
  {
    slug: "ha-noi", name: "Hà Nội", lat: 21.0285, lng: 105.8542, avg: 110,
    districts: [
      ["hoan-kiem", "Hoàn Kiếm", 21.0287, 105.8524, 320], ["ba-dinh", "Ba Đình", 21.0340, 105.8143, 220],
      ["dong-da", "Đống Đa", 21.0181, 105.8296, 180], ["cau-giay", "Cầu Giấy", 21.0362, 105.7906, 150],
      ["tay-ho", "Tây Hồ", 21.0700, 105.8189, 165], ["hai-ba-trung", "Hai Bà Trưng", 21.0067, 105.8574, 160],
      ["hoang-mai", "Hoàng Mai", 20.9746, 105.8636, 95], ["long-bien", "Long Biên", 21.0469, 105.8888, 100],
      ["nam-tu-liem", "Nam Từ Liêm", 21.0122, 105.7655, 105], ["ha-dong", "Hà Đông", 20.9714, 105.7788, 75],
      ["gia-lam", "Gia Lâm", 21.0285, 105.9370, 55],
    ],
  },
  {
    slug: "da-nang", name: "Đà Nẵng", lat: 16.0544, lng: 108.2022, avg: 60,
    districts: [
      ["hai-chau", "Hải Châu", 16.0471, 108.2068, 120], ["son-tra", "Sơn Trà", 16.0710, 108.2417, 95],
      ["ngu-hanh-son", "Ngũ Hành Sơn", 16.0019, 108.2526, 75], ["thanh-khe", "Thanh Khê", 16.0653, 108.1856, 70],
      ["lien-chieu", "Liên Chiểu", 16.0718, 108.1504, 40], ["cam-le", "Cẩm Lệ", 16.0151, 108.1950, 45],
    ],
  },
  {
    slug: "binh-duong", name: "Bình Dương", lat: 10.9805, lng: 106.6519, avg: 35,
    districts: [
      ["thu-dau-mot", "Thủ Dầu Một", 10.9804, 106.6519, 40], ["di-an", "Dĩ An", 10.9069, 106.7697, 45],
      ["thuan-an", "Thuận An", 10.9230, 106.7130, 42], ["ben-cat", "Bến Cát", 11.1528, 106.5926, 20],
    ],
  },
  {
    slug: "khanh-hoa", name: "Khánh Hòa", lat: 12.2388, lng: 109.1967, avg: 45,
    districts: [
      ["nha-trang", "Nha Trang", 12.2451, 109.1943, 70], ["cam-ranh", "Cam Ranh", 11.9214, 109.1591, 25],
    ],
  },
] as const;

const DEVELOPERS = [
  { slug: "an-khang-land", name: "An Khang Land", founded: 2008, description: "Nhà phát triển khu đô thị tích hợp tại phía Nam, tập trung vào sản phẩm căn hộ trung cấp cho gia đình trẻ." },
  { slug: "song-viet-group", name: "Sông Việt Group", founded: 2003, description: "Tập đoàn bất động sản với danh mục nhà phố thương mại, biệt thự ven sông và văn phòng hạng B." },
  { slug: "thien-phuc-holdings", name: "Thiên Phúc Holdings", founded: 2012, description: "Chuyên phát triển căn hộ cao cấp tại các quận trung tâm Hà Nội và Đà Nẵng." },
  { slug: "hoa-binh-urban", name: "Hòa Bình Urban", founded: 2015, description: "Phát triển đất nền và khu dân cư quy hoạch đồng bộ gần các khu công nghiệp." },
  { slug: "bien-xanh-resort", name: "Biển Xanh Resort", founded: 2010, description: "Phát triển căn hộ nghỉ dưỡng và condotel tại các thành phố biển miền Trung." },
];

type InfraSeed = { name: string; type: InfraType; status: InfraStatus; year?: number; p: string; d?: string; lat: number; lng: number; r: number; desc: string };
const INFRA: InfraSeed[] = [
  { name: "Metro số 1 Bến Thành – Suối Tiên", type: "METRO", status: "COMPLETED", year: 2024, p: "ho-chi-minh", d: "thu-duc", lat: 10.8231, lng: 106.7449, r: 3, desc: "Tuyến metro đầu tiên của TP.HCM nối trung tâm Quận 1 với TP. Thủ Đức, chạy qua Bình Thạnh." },
  { name: "Metro số 2 Bến Thành – Tham Lương", type: "METRO", status: "UNDER_CONSTRUCTION", year: 2030, p: "ho-chi-minh", d: "tan-binh", lat: 10.7980, lng: 106.6520, r: 2.5, desc: "Tuyến metro dọc trục Cách Mạng Tháng Tám – Trường Chinh, đi qua Quận 3 và Tân Bình." },
  { name: "Đường Vành đai 3 TP.HCM", type: "RING_ROAD", status: "UNDER_CONSTRUCTION", year: 2026, p: "ho-chi-minh", d: "hoc-mon", lat: 10.8800, lng: 106.6000, r: 4, desc: "Vành đai kết nối TP.HCM với Bình Dương, Đồng Nai và Long An, giảm tải cho nội đô." },
  { name: "Cầu Thủ Thiêm 4", type: "BRIDGE", status: "UNDER_CONSTRUCTION", year: 2028, p: "ho-chi-minh", d: "quan-7", lat: 10.7520, lng: 106.7250, r: 3, desc: "Cầu nối Quận 7 với khu đô thị Thủ Thiêm, rút ngắn thời gian di chuyển vào trung tâm." },
  { name: "Mở rộng đường Nguyễn Hữu Thọ", type: "EXPRESSWAY", status: "PLANNED", year: 2029, p: "ho-chi-minh", d: "nha-be", lat: 10.7000, lng: 106.7300, r: 3, desc: "Nâng cấp trục giao thông chính kết nối Nhà Bè với Quận 7." },
  { name: "Bệnh viện đa khoa khu vực Thủ Đức", type: "HOSPITAL", status: "COMPLETED", p: "ho-chi-minh", d: "thu-duc", lat: 10.8500, lng: 106.7700, r: 2, desc: "Bệnh viện tuyến cuối phục vụ khu Đông." },
  { name: "Metro Nhổn – Ga Hà Nội", type: "METRO", status: "COMPLETED", year: 2024, p: "ha-noi", d: "cau-giay", lat: 21.0350, lng: 105.7950, r: 2.5, desc: "Tuyến đường sắt đô thị đi qua Nam Từ Liêm, Cầu Giấy và Đống Đa." },
  { name: "Metro Cát Linh – Hà Đông", type: "METRO", status: "COMPLETED", year: 2021, p: "ha-noi", d: "ha-dong", lat: 20.9800, lng: 105.7900, r: 2.5, desc: "Tuyến metro trên cao đầu tiên tại Hà Nội." },
  { name: "Đường Vành đai 4 Vùng Thủ đô", type: "RING_ROAD", status: "UNDER_CONSTRUCTION", year: 2027, p: "ha-noi", d: "ha-dong", lat: 20.9500, lng: 105.7300, r: 4, desc: "Vành đai liên vùng kết nối Hà Nội với Hưng Yên và Bắc Ninh." },
  { name: "Cầu Trần Hưng Đạo", type: "BRIDGE", status: "UNDER_CONSTRUCTION", year: 2027, p: "ha-noi", d: "long-bien", lat: 21.0300, lng: 105.8700, r: 3, desc: "Cầu vượt sông Hồng nối Hoàn Kiếm với Long Biên." },
  { name: "Công viên Hồ Tây mở rộng", type: "PARK", status: "PLANNED", year: 2028, p: "ha-noi", d: "tay-ho", lat: 21.0600, lng: 105.8200, r: 2, desc: "Cải tạo không gian công cộng ven hồ." },
  { name: "Trung tâm thương mại Hoàng Mai", type: "MALL", status: "COMPLETED", p: "ha-noi", d: "hoang-mai", lat: 20.9800, lng: 105.8600, r: 2, desc: "Tổ hợp thương mại – giải trí phía Nam Hà Nội." },
  { name: "Cầu Nguyễn Tri Phương mở rộng", type: "BRIDGE", status: "PLANNED", year: 2028, p: "da-nang", d: "cam-le", lat: 16.0300, lng: 108.2100, r: 2.5, desc: "Nâng cấp kết nối Hải Châu và Cẩm Lệ." },
  { name: "Khu công nghệ cao Đà Nẵng", type: "INDUSTRIAL", status: "COMPLETED", p: "da-nang", d: "lien-chieu", lat: 16.0900, lng: 108.1300, r: 4, desc: "Khu công nghệ cao thu hút doanh nghiệp điện tử và bán dẫn." },
  { name: "Tuyến ven biển Sơn Trà – Ngũ Hành Sơn", type: "EXPRESSWAY", status: "COMPLETED", p: "da-nang", d: "son-tra", lat: 16.0500, lng: 108.2450, r: 3, desc: "Trục ven biển kết nối các khu du lịch." },
  { name: "Metro Thủ Dầu Một – Suối Tiên", type: "METRO", status: "PLANNED", year: 2032, p: "binh-duong", d: "di-an", lat: 10.9100, lng: 106.7600, r: 3, desc: "Tuyến đường sắt đô thị kết nối Bình Dương với TP.HCM." },
  { name: "KCN VSIP III", type: "INDUSTRIAL", status: "UNDER_CONSTRUCTION", year: 2027, p: "binh-duong", d: "ben-cat", lat: 11.1600, lng: 106.6000, r: 5, desc: "Khu công nghiệp thế hệ mới ở phía Bắc Bình Dương." },
  { name: "Sân bay Cam Ranh – nhà ga mở rộng", type: "EXPRESSWAY", status: "UNDER_CONSTRUCTION", year: 2026, p: "khanh-hoa", d: "cam-ranh", lat: 11.9980, lng: 109.2190, r: 6, desc: "Mở rộng năng lực đón khách quốc tế." },
];

const STREETS = ["Lê Lợi", "Nguyễn Trãi", "Trần Hưng Đạo", "Hai Bà Trưng", "Lý Thường Kiệt", "Phan Đình Phùng", "Võ Văn Kiệt", "Nguyễn Văn Linh", "Hoàng Văn Thụ", "Điện Biên Phủ", "Lê Văn Sỹ", "Quang Trung", "Nguyễn Thị Minh Khai", "Pasteur", "Bạch Đằng", "Tô Hiến Thành"];
const NAMES = ["Anh Minh", "Chị Lan", "Anh Tuấn", "Chị Hương", "Anh Khoa", "Chị Thảo", "Anh Đức", "Chị Ngọc", "Anh Phúc", "Chị Mai"];

const TYPE_CONF: Record<PropertyType, { area: [number, number]; beds?: [number, number]; floors?: [number, number]; mult: number; rentMult: number; label: string }> = {
  HOUSE: { area: [35, 120], beds: [2, 6], floors: [1, 5], mult: 1, rentMult: 1, label: "Nhà" },
  APARTMENT: { area: [45, 130], beds: [1, 4], mult: 0.7, rentMult: 1.1, label: "Căn hộ" },
  LAND: { area: [80, 400], mult: 0.55, rentMult: 0.4, label: "Đất" },
  VILLA: { area: [180, 450], beds: [4, 7], floors: [2, 4], mult: 1.2, rentMult: 1, label: "Biệt thự" },
  SHOPHOUSE: { area: [70, 200], beds: [3, 6], floors: [3, 6], mult: 1.5, rentMult: 1.4, label: "Nhà mặt tiền" },
  OFFICE: { area: [60, 400], mult: 1, rentMult: 1.3, label: "Văn phòng" },
  WAREHOUSE: { area: [300, 3000], mult: 0.25, rentMult: 0.3, label: "Kho xưởng" },
};

function describe(t: PropertyType, tr: TransactionType, area: number, beds: number | null, district: string, carAccess: boolean, legal: LegalStatus) {
  const parts = [
    `${tr === "SALE" ? "Cần bán" : "Cho thuê"} ${TYPE_CONF[t].label.toLowerCase()} diện tích ${area}m² tại ${district}.`,
    beds ? `Gồm ${beds} phòng ngủ, phòng khách rộng, bếp thoáng, nhiều ánh sáng tự nhiên.` : "Mặt bằng vuông vức, thuận tiện xây dựng hoặc khai thác kinh doanh.",
    carAccess ? "Đường trước nhà ô tô vào tận nơi, khu dân cư an ninh." : "Hẻm yên tĩnh, gần chợ, trường học và trạm y tế.",
    legal === "PINK_BOOK" ? "Pháp lý: sổ hồng riêng, sẵn sàng công chứng." : "Pháp lý: liên hệ để xem giấy tờ chi tiết.",
    tr === "SALE" ? "Chủ nhà thiện chí, hỗ trợ khách vay ngân hàng." : "Có thể vào ở ngay, hợp đồng tối thiểu 12 tháng.",
  ];
  return parts.join(" ");
}

async function main() {
  console.log("Xoá dữ liệu cũ…");
  await prisma.$transaction([
    prisma.inquiry.deleteMany(), prisma.savedListing.deleteMany(), prisma.listingImage.deleteMany(),
    prisma.listing.deleteMany(), prisma.project.deleteMany(), prisma.developer.deleteMany(),
    prisma.infrastructure.deleteMany(), prisma.district.deleteMany(), prisma.province.deleteMany(),
    prisma.article.deleteMany(), prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash("goldhome123", 10);
  const admin = await prisma.user.create({ data: { email: "admin@goldhome.vn", name: "GoldHome Admin", passwordHash, role: "ADMIN", plan: "GOLD", phone: "0900000000" } });
  const agents = await Promise.all(
    NAMES.slice(0, 5).map((n, i) =>
      prisma.user.create({ data: { email: `agent${i + 1}@goldhome.vn`, name: n, passwordHash, role: "AGENT", plan: i < 2 ? "GOLD" : "SILVER", phone: `09${String(10000000 + i * 1234567).slice(0, 8)}` } }),
    ),
  );
  await prisma.user.create({ data: { email: "demo@goldhome.vn", name: "Người dùng Demo", passwordHash, phone: "0911111111" } });

  console.log("Tạo tỉnh/thành & quận/huyện…");
  const districtMap = new Map<string, { id: string; provinceId: string; name: string; lat: number; lng: number; avg: number; provinceName: string }>();
  const provinceMap = new Map<string, string>();
  for (const p of PROVINCES) {
    const prov = await prisma.province.create({ data: { slug: p.slug, name: p.name, lat: p.lat, lng: p.lng, avgPricePerM2: p.avg } });
    provinceMap.set(p.slug, prov.id);
    for (const [slug, name, lat, lng, avg] of p.districts) {
      const d = await prisma.district.create({ data: { slug, name, lat, lng, avgPricePerM2: avg, provinceId: prov.id } });
      districtMap.set(`${p.slug}/${slug}`, { id: d.id, provinceId: prov.id, name, lat, lng, avg, provinceName: p.name });
    }
  }

  console.log("Tạo hạ tầng…");
  const infra = [];
  for (const i of INFRA) {
    infra.push(
      await prisma.infrastructure.create({
        data: {
          slug: slugify(i.name), name: i.name, type: i.type, status: i.status, expectedYear: i.year, description: i.desc,
          lat: i.lat, lng: i.lng, radiusKm: i.r, provinceId: provinceMap.get(i.p)!, districtId: i.d ? districtMap.get(`${i.p}/${i.d}`)!.id : null,
        },
      }),
    );
  }

  console.log("Tạo chủ đầu tư & dự án…");
  const devs = await Promise.all(DEVELOPERS.map((d) => prisma.developer.create({ data: { ...d, website: `https://${d.slug}.example.vn` } })));
  const PROJECTS = [
    { name: "GoldRiver Residences", dev: 1, key: "ho-chi-minh/binh-thanh", status: "HANDED_OVER", legal: "PINK_BOOK", units: 1800, ha: 6.2, from: 4.2e9, to: 12e9, year: 2021, score: 9.1 },
    { name: "An Khang Garden City", dev: 0, key: "ho-chi-minh/thu-duc", status: "UNDER_CONSTRUCTION", legal: "SALE_CONTRACT", units: 3200, ha: 18, from: 2.8e9, to: 7.5e9, year: 2027, score: 8.4 },
    { name: "Saigon South Lakeview", dev: 1, key: "ho-chi-minh/quan-7", status: "HANDED_OVER", legal: "PINK_BOOK", units: 1200, ha: 4.5, from: 3.9e9, to: 9.8e9, year: 2019, score: 8.8 },
    { name: "Thiên Phúc Skyline", dev: 2, key: "ha-noi/cau-giay", status: "HANDED_OVER", legal: "PINK_BOOK", units: 950, ha: 2.3, from: 5.1e9, to: 14e9, year: 2022, score: 9.0 },
    { name: "Lakeside Tây Hồ", dev: 2, key: "ha-noi/tay-ho", status: "UNDER_CONSTRUCTION", legal: "SALE_CONTRACT", units: 600, ha: 1.8, from: 7e9, to: 22e9, year: 2027, score: 8.2 },
    { name: "Hòa Bình Eco Town", dev: 3, key: "binh-duong/ben-cat", status: "PLANNING", legal: "PENDING", units: 2400, ha: 45, from: 1.6e9, to: 4.5e9, year: 2028, score: 7.1 },
    { name: "Ocean Pearl Nha Trang", dev: 4, key: "khanh-hoa/nha-trang", status: "HANDED_OVER", legal: "PINK_BOOK", units: 780, ha: 1.2, from: 2.5e9, to: 8e9, year: 2020, score: 7.8 },
    { name: "Sơn Trà Bay View", dev: 4, key: "da-nang/son-tra", status: "UNDER_CONSTRUCTION", legal: "SALE_CONTRACT", units: 520, ha: 1.6, from: 3.2e9, to: 9.5e9, year: 2026, score: 8.0 },
    { name: "Hoàng Mai Central Park", dev: 0, key: "ha-noi/hoang-mai", status: "HANDED_OVER", legal: "PINK_BOOK", units: 2100, ha: 9, from: 3e9, to: 6.8e9, year: 2023, score: 8.5 },
  ] as const;
  const AMENITIES = ["Hồ bơi", "Phòng gym", "Công viên nội khu", "Trường mầm non", "Siêu thị", "Bãi đỗ xe", "An ninh 24/7", "Sân tennis", "Khu BBQ", "Đường chạy bộ"];
  const projects = [];
  for (const [idx, p] of PROJECTS.entries()) {
    const d = districtMap.get(p.key)!;
    projects.push(
      await prisma.project.create({
        data: {
          slug: slugify(p.name), name: p.name, status: p.status, legal: p.legal, totalUnits: p.units, areaHa: p.ha,
          priceFrom: BigInt(p.from), priceTo: BigInt(p.to), completion: p.year, score: p.score,
          description: `${p.name} là dự án do ${devs[p.dev].name} phát triển tại ${d.name}, ${d.provinceName}. Quy mô ${p.units.toLocaleString("vi-VN")} sản phẩm trên ${p.ha} ha với hệ tiện ích nội khu khép kín và kết nối thuận tiện tới các trục giao thông chính.`,
          coverUrl: img(`gh-project-${idx}`, 1200, 800), address: `${d.name}, ${d.provinceName}`,
          lat: d.lat + between(-0.01, 0.01), lng: d.lng + between(-0.01, 0.01),
          amenities: AMENITIES.filter(() => rand() > 0.4), developerId: devs[p.dev].id, provinceId: d.provinceId, districtId: d.id, featured: idx < 6,
        },
      }),
    );
  }

  console.log("Tạo tin đăng…");
  const owners = [admin, ...agents];
  const typesWeighted: PropertyType[] = ["HOUSE", "HOUSE", "HOUSE", "APARTMENT", "APARTMENT", "APARTMENT", "LAND", "LAND", "VILLA", "SHOPHOUSE", "OFFICE", "WAREHOUSE"];
  const districtKeys = [...districtMap.keys()];
  const infraForScore = infra.map((i) => ({ type: i.type, status: i.status, lat: i.lat, lng: i.lng, radiusKm: i.radiusKm }));
  const legalOptions: LegalStatus[] = ["PINK_BOOK", "PINK_BOOK", "PINK_BOOK", "SALE_CONTRACT", "PENDING", "OTHER"];

  for (let n = 0; n < 160; n++) {
    const key = pick(districtKeys);
    const d = districtMap.get(key)!;
    const type = pick(typesWeighted);
    const tr: TransactionType = rand() < 0.3 && type !== "LAND" ? "RENT" : "SALE";
    const c = TYPE_CONF[type];
    const area = Math.round(between(...c.area));
    const beds = c.beds ? int(...c.beds) : null;
    const floors = c.floors ? int(...c.floors) : null;
    const unitSale = d.avg * c.mult * between(0.75, 1.3) * 1e6;
    const priceRaw = tr === "SALE" ? unitSale * area : unitSale * area * 0.004 * c.rentMult;
    const price = BigInt(Math.round(priceRaw / (tr === "SALE" ? 1e7 : 1e5)) * (tr === "SALE" ? 1e7 : 1e5));
    const legal: LegalStatus = tr === "RENT" ? "PINK_BOOK" : type === "APARTMENT" ? pick(["PINK_BOOK", "PINK_BOOK", "SALE_CONTRACT"] as const) : pick(legalOptions);
    const carAccess = rand() < 0.55;
    const floodRisk = rand() < 0.12;
    const furnished = type === "APARTMENT" ? rand() < 0.6 : rand() < 0.2;
    const roadWidth = carAccess ? Math.round(between(4, 16)) : Math.round(between(2, 4));
    const street = pick(STREETS);
    const imageCount = int(3, 7);
    const description = describe(type, tr, area, beds, d.name, carAccess, legal);
    const lat = d.lat + between(-0.018, 0.018);
    const lng = d.lng + between(-0.018, 0.018);
    const proj = type === "APARTMENT" ? projects.find((p) => p.districtId === d.id) : undefined;
    const { score, breakdown } = computeScore({
      transaction: tr, price, area, legal, carAccess, floodRisk, furnished, roadWidth, bedrooms: beds, description, imageCount,
      lat, lng, districtAvgPricePerM2: d.avg, infrastructure: infraForScore,
    });
    const priceText = tr === "SALE" ? `${(Number(price) / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ` : `${Math.round(Number(price) / 1e6)} triệu/tháng`;
    const title = `${tr === "SALE" ? "Bán" : "Cho thuê"} ${c.label.toLowerCase()} ${area}m²${beds ? ` ${beds}PN` : ""} đường ${street}, ${d.name} – ${priceText}`;
    const owner = pick(owners);
    const createdAt = new Date(Date.now() - int(0, 45 * 24) * 3600 * 1000);

    await prisma.listing.create({
      data: {
        slug: `${slugify(title)}-${n + 1000}`, title, description, transaction: tr, propertyType: type, price, area,
        bedrooms: beds, bathrooms: beds ? Math.max(1, beds - int(0, 1)) : null, floors, frontage: type === "APARTMENT" ? null : Math.round(between(3.5, 10) * 10) / 10,
        roadWidth, legal, furnished, carAccess, floodRisk, address: `${int(1, 450)} ${street}, ${d.name}, ${d.provinceName}`, lat, lng,
        provinceId: d.provinceId, districtId: d.id, projectId: proj?.id, ownerId: owner.id, contactName: owner.name, contactPhone: owner.phone ?? "0900000000",
        score, scoreBreakdown: breakdown, featured: rand() < 0.15, views: int(5, 2500), createdAt,
        images: { create: Array.from({ length: imageCount }, (_, i) => ({ url: img(`gh-${n}-${i}`), position: i })) },
      },
    });
  }

  console.log("Tạo tin tức…");
  const ARTICLES = [
    { title: "5 bước kiểm tra pháp lý trước khi đặt cọc mua nhà", cat: "Kinh nghiệm", body: "Trước khi đặt cọc, người mua nên yêu cầu bản chính sổ hồng, đối chiếu thông tin chủ sở hữu với căn cước, kiểm tra quy hoạch tại cơ quan địa phương, xác minh tình trạng thế chấp và lập hợp đồng đặt cọc có điều khoản phạt rõ ràng." },
    { title: "Hạ tầng metro tác động thế nào đến giá căn hộ?", cat: "Phân tích", body: "Các khu vực nằm trong bán kính 1–2 km quanh ga metro thường ghi nhận thanh khoản tốt hơn. Tuy nhiên mức tăng giá phụ thuộc vào tiến độ thực tế, chất lượng kết nối đi bộ và mặt bằng giá trước khi công trình hoàn thành." },
    { title: "Thuê nhà lần đầu: những điều khoản cần đọc kỹ", cat: "Kinh nghiệm", body: "Hãy chú ý tiền cọc, thời hạn báo trước khi chấm dứt hợp đồng, trách nhiệm sửa chữa, chi phí điện nước theo giá nào và việc chủ nhà có được tăng giá giữa kỳ hay không." },
    { title: "GoldScore được tính như thế nào?", cat: "GoldHome", body: "GoldScore tổng hợp 5 tiêu chí: giá so với khu vực, pháp lý, hạ tầng lân cận, tiện ích ở và mức độ đầy đủ của tin đăng. Mỗi tiêu chí có trọng số và lời giải thích để bạn tự đánh giá." },
    { title: "Vay mua nhà: tính khả năng trả nợ trước khi chọn căn", cat: "Tài chính", body: "Nguyên tắc phổ biến là tổng khoản trả nợ hằng tháng không vượt quá 40% thu nhập. Hãy tính cả kịch bản lãi suất thả nổi tăng 2–3 điểm phần trăm sau thời gian ưu đãi." },
    { title: "Đất nền ven khu công nghiệp: cơ hội và rủi ro", cat: "Phân tích", body: "Nhu cầu nhà ở cho chuyên gia và công nhân hỗ trợ thanh khoản, nhưng nhà đầu tư cần kiểm tra quy hoạch sử dụng đất, hạ tầng thoát nước và tránh các lô chưa tách thửa." },
  ];
  for (const [i, a] of ARTICLES.entries()) {
    await prisma.article.create({
      data: {
        slug: slugify(a.title), title: a.title, category: a.cat, excerpt: a.body.slice(0, 140) + "…",
        content: `${a.body}\n\n${a.body}`, coverUrl: img(`gh-article-${i}`, 1200, 700), publishedAt: new Date(Date.now() - i * 3 * 86400000),
      },
    });
  }

  const count = await prisma.listing.count();
  console.log(`Hoàn tất: ${count} tin đăng, ${projects.length} dự án, ${infra.length} công trình hạ tầng.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
