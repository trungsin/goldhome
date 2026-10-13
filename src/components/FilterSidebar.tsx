import type { Filters } from "@/lib/filters";

type Opt = { slug: string; name: string };

export function FilterSidebar({ f, provinces, districts }: { f: Filters; provinces: Opt[]; districts: Opt[] }) {
  return (
    <form method="get" action="/nha-dat" className="card space-y-5 p-5">
      {f.transaction === "RENT" && <input type="hidden" name="giao-dich" value="thue" />}
      {f.q && <input type="hidden" name="q" value={f.q} />}
      {f.sort !== "moi" && <input type="hidden" name="sap-xep" value={f.sort} />}
      <div>
        <label className="label" htmlFor="tinh">Tỉnh/thành</label>
        <select id="tinh" name="tinh" defaultValue={f.province} className="input">
          <option value="">Toàn quốc</option>
          {provinces.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
      </div>
      {districts.length > 0 && (
        <div>
          <label className="label" htmlFor="quan">Quận/huyện</label>
          <select id="quan" name="quan" defaultValue={f.district} className="input">
            <option value="">Tất cả</option>
            {districts.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label" htmlFor="loai">Loại nhà đất</label>
        <select id="loai" name="loai" defaultValue={f.type} className="input">
          <option value="">Tất cả</option>
          <option value="nha-rieng">Nhà riêng</option>
          <option value="can-ho">Căn hộ</option>
          <option value="dat-nen">Đất nền</option>
          <option value="biet-thu">Biệt thự</option>
          <option value="mat-tien">Nhà mặt tiền</option>
          <option value="van-phong">Văn phòng</option>
          <option value="kho-xuong">Kho xưởng</option>
        </select>
      </div>
      <fieldset>
        <legend className="label">Giá ({f.transaction === "RENT" ? "triệu/tháng" : "triệu"})</legend>
        <div className="flex gap-2">
          <input name="gia-min" type="number" min={0} defaultValue={f.priceMin} placeholder="Từ" className="input" />
          <input name="gia-max" type="number" min={0} defaultValue={f.priceMax} placeholder="Đến" className="input" />
        </div>
      </fieldset>
      <fieldset>
        <legend className="label">Diện tích (m²)</legend>
        <div className="flex gap-2">
          <input name="dt-min" type="number" min={0} defaultValue={f.areaMin} placeholder="Từ" className="input" />
          <input name="dt-max" type="number" min={0} defaultValue={f.areaMax} placeholder="Đến" className="input" />
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="phong-ngu">Phòng ngủ tối thiểu</label>
        <select id="phong-ngu" name="phong-ngu" defaultValue={f.beds ?? ""} className="input">
          <option value="">Bất kỳ</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="diem-min">GoldScore tối thiểu</label>
        <select id="diem-min" name="diem-min" defaultValue={f.minScore ?? ""} className="input">
          <option value="">Bất kỳ</option>
          {[5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}+</option>)}
        </select>
      </div>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="phap-ly" value="so" defaultChecked={!!f.legal} className="accent-gold-500" /> Có sổ hồng/sổ đỏ</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="o-to" value="1" defaultChecked={f.car} className="accent-gold-500" /> Ô tô vào được</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="khong-ngap" value="1" defaultChecked={f.noFlood} className="accent-gold-500" /> Không ngập</label>
      </div>
      <div className="flex gap-2">
        <button className="btn-dark flex-1">Áp dụng</button>
        <a href={f.transaction === "RENT" ? "/nha-dat?giao-dich=thue" : "/nha-dat"} className="btn-ghost">Xoá</a>
      </div>
    </form>
  );
}
