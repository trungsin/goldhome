"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

type Province = { slug: string; name: string };

export function HeroSearch({ provinces }: { provinces: Province[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"mua" | "thue">("mua");
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (tab === "thue") sp.set("giao-dich", "thue");
    if (q) sp.set("q", q);
    if (province) sp.set("tinh", province);
    if (type) sp.set("loai", type);
    router.push(`/nha-dat?${sp}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-3 shadow-2xl ring-1 ring-black/5">
      <div className="mb-3 flex gap-1 px-1">
        {(["mua", "thue"] as const).map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-ink-900 text-gold-300" : "text-ink-600 hover:bg-ink-100"}`}
          >
            {t === "mua" ? "Mua" : "Thuê"}
          </button>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-[1fr_180px_160px_auto]">
        <label className="relative">
          <span className="sr-only">Từ khoá</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên đường, quận, dự án…" className="input !rounded-2xl !py-3 pl-10" />
        </label>
        <select value={province} onChange={(e) => setProvince(e.target.value)} className="input !rounded-2xl !py-3" aria-label="Tỉnh/thành">
          <option value="">Toàn quốc</option>
          {provinces.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input !rounded-2xl !py-3" aria-label="Loại nhà đất">
          <option value="">Mọi loại</option>
          <option value="nha-rieng">Nhà riêng</option>
          <option value="can-ho">Căn hộ</option>
          <option value="dat-nen">Đất nền</option>
          <option value="biet-thu">Biệt thự</option>
          <option value="mat-tien">Nhà mặt tiền</option>
          <option value="van-phong">Văn phòng</option>
          <option value="kho-xuong">Kho xưởng</option>
        </select>
        <button className="btn-gold !rounded-2xl !py-3">Tìm kiếm</button>
      </div>
    </form>
  );
}
