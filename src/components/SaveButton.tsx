"use client";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaved } from "@/app/actions/listings";

export function SaveButton({ listingId, initial }: { listingId: string; initial: boolean }) {
  const [saved, setSaved] = useOptimistic(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setSaved(!saved);
          const res = await toggleSaved(listingId);
          if (res.needLogin) router.push(`/dang-nhap?next=${encodeURIComponent(location.pathname)}`);
        })
      }
      className="rounded-full bg-white/90 p-2 shadow hover:bg-white"
    >
      <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-ink-600"}`} />
    </button>
  );
}
