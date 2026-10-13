"use client";
import { useActionState, useMemo, useState } from "react";
import { saveListing } from "@/app/actions/listings";
import { legalLabel, propertyTypeLabel } from "@/lib/format";

type District = { id: string; name: string; provinceId: string };
type Province = { id: string; name: string };
export type ListingDefaults = Partial<{
  id: string; title: string; description: string; transaction: string; propertyType: string; priceMillion: number; area: number;
  bedrooms: number | null; bathrooms: number | null; floors: number | null; frontage: number | null; roadWidth: number | null;
  legal: string; furnished: boolean; carAccess: boolean; floodRisk: boolean; districtId: string; provinceId: string; address: string;
  contactName: string; contactPhone: string; imageUrls: string;
}>;

export function ListingForm({ provinces, districts, defaults }: { provinces: Province[]; districts: District[]; defaults: ListingDefaults }) {
  const [state, action, pending] = useActionState(saveListing, undefined);
  const [provinceId, setProvinceId] = useState(defaults.provinceId ?? provinces[0]?.id ?? "");
  const [transaction, setTransaction] = useState(defaults.transaction ?? "SALE");
  const options = useMemo(() => districts.filter((d) => d.provinceId === provinceId), [districts, provinceId]);
  const fe = state?.fieldErrors ?? {};
  const Err = ({ k }: { k: string }) => (fe[k] ? <p className="mt-1 text-xs text-red-600">{fe[k]![0]}</p> : null);
  const num = (name: keyof ListingDefaults, label: string, step = "1") => (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type="number" min={0} step={step} defaultValue={(defaults[name] as number | null | undefined) ?? ""} className="input" />
      <Err k={name} />
    </div>
  );

  return (
    <form action={action} className="space-y-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}
      {state?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}

      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">1. Thông tin cơ bản</h2>
        <div className="flex gap-2">
          {["SALE", "RENT"].map((t) => (
            <label key={t} className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${transaction === t ? "bg-ink-900 text-gold-300" : "bg-ink-100 text-ink-600"}`}>
              <input type="radio" name="transaction" value={t} checked={transaction === t} onChange={() => setTransaction(t)} className="sr-only" />
              {t === "SALE" ? "Bán" : "Cho thuê"}
            </label>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="propertyType">Loại nhà đất</label>
            <select id="propertyType" name="propertyType" defaultValue={defaults.propertyType ?? "HOUSE"} className="input">
              {Object.entries(propertyTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="legal">Pháp lý</label>
            <select id="legal" name="legal" defaultValue={defaults.legal ?? "PINK_BOOK"} className="input">
              {Object.entries(legalLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="title">Tiêu đề</label>
          <input id="title" name="title" defaultValue={defaults.title} placeholder="VD: Bán nhà 4 tầng hẻm xe hơi, gần chợ, sổ hồng riêng" className="input" />
          <Err k="title" />
        </div>
        <div>
          <label className="label" htmlFor="description">Mô tả chi tiết</label>
          <textarea id="description" name="description" rows={6} defaultValue={defaults.description} placeholder="Mô tả kết cấu, hướng nhà, tiện ích xung quanh, tình trạng pháp lý…" className="input" />
          <Err k="description" />
          <p className="mt-1 text-xs text-ink-400">Mô tả càng đầy đủ, điểm “Độ đầy đủ thông tin” càng cao.</p>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">2. Giá & đặc điểm</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {num("priceMillion", transaction === "RENT" ? "Giá thuê (triệu/tháng)" : "Giá bán (triệu đồng)", "0.1")}
          {num("area", "Diện tích (m²)", "0.1")}
          {num("bedrooms", "Phòng ngủ")}
          {num("bathrooms", "Phòng tắm")}
          {num("floors", "Số tầng")}
          {num("frontage", "Mặt tiền (m)", "0.1")}
          {num("roadWidth", "Đường vào (m)", "0.1")}
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="carAccess" defaultChecked={defaults.carAccess} className="accent-gold-500" /> Ô tô vào được</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="furnished" defaultChecked={defaults.furnished} className="accent-gold-500" /> Có nội thất</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="floodRisk" defaultChecked={defaults.floodRisk} className="accent-gold-500" /> Khu vực có ngập</label>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">3. Vị trí</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="province">Tỉnh/thành</label>
            <select id="province" value={provinceId} onChange={(e) => setProvinceId(e.target.value)} className="input">
              {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="districtId">Quận/huyện</label>
            <select id="districtId" name="districtId" key={provinceId} defaultValue={defaults.districtId} className="input">
              {options.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <Err k="districtId" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">Địa chỉ</label>
          <input id="address" name="address" defaultValue={defaults.address} placeholder="Số nhà, tên đường, phường" className="input" />
          <Err k="address" />
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">4. Hình ảnh & liên hệ</h2>
        <div>
          <label className="label" htmlFor="imageUrls">Link ảnh (mỗi dòng một link https)</label>
          <textarea id="imageUrls" name="imageUrls" rows={3} defaultValue={defaults.imageUrls} placeholder="https://…" className="input font-mono text-xs" />
          <p className="mt-1 text-xs text-ink-400">Bỏ trống để dùng ảnh minh hoạ. Tối đa 12 ảnh.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="contactName">Tên liên hệ</label><input id="contactName" name="contactName" defaultValue={defaults.contactName} className="input" /><Err k="contactName" /></div>
          <div><label className="label" htmlFor="contactPhone">Số điện thoại</label><input id="contactPhone" name="contactPhone" defaultValue={defaults.contactPhone} className="input" /><Err k="contactPhone" /></div>
        </div>
      </section>

      <button disabled={pending} className="btn-gold w-full !py-3 text-base">{pending ? "Đang lưu…" : defaults.id ? "Cập nhật tin" : "Đăng tin & nhận GoldScore"}</button>
    </form>
  );
}
