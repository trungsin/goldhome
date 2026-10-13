"use client";
import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-ink-100">
        <Image src={images[active]} alt={`${title} – ảnh ${active + 1}`} fill priority sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" />
        <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs text-white">{active + 1}/{images.length}</span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button key={src} onClick={() => setActive(i)} aria-label={`Xem ảnh ${i + 1}`} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ${i === active ? "ring-gold-400" : "ring-transparent opacity-70 hover:opacity-100"}`}>
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
