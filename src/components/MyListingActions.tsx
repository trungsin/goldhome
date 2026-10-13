"use client";
import Link from "next/link";
import { useTransition } from "react";
import type { ListingStatus } from "@prisma/client";
import { deleteListing, setListingStatus } from "@/app/actions/listings";

export function MyListingActions({ id, status }: { id: string; status: ListingStatus }) {
  const [pending, start] = useTransition();
  const btn = "rounded-full border border-ink-200 px-3 py-1 text-xs font-medium hover:border-gold-400 disabled:opacity-50";
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link href={`/sua-tin/${id}`} className={btn}>Sửa</Link>
      {status === "ACTIVE" ? (
        <>
          <button disabled={pending} className={btn} onClick={() => start(() => setListingStatus(id, "HIDDEN"))}>Ẩn</button>
          <button disabled={pending} className={btn} onClick={() => start(() => setListingStatus(id, "SOLD"))}>Đã giao dịch</button>
        </>
      ) : (
        <button disabled={pending} className={btn} onClick={() => start(() => setListingStatus(id, "ACTIVE"))}>Hiển thị lại</button>
      )}
      <button
        disabled={pending}
        className={`${btn} text-red-600 hover:border-red-400`}
        onClick={() => confirm("Xoá tin này vĩnh viễn?") && start(() => deleteListing(id))}
      >
        Xoá
      </button>
    </div>
  );
}
