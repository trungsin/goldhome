import clsx from "clsx";
import { scoreTone } from "@/lib/score";

export function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const tone = scoreTone(score);
  return (
    <span
      title="GoldScore – điểm đánh giá tin đăng 0–10"
      className={clsx(
        "inline-flex items-center gap-1 rounded-full font-bold",
        size === "lg" ? "px-3 py-1.5 text-base" : "px-2 py-0.5 text-xs",
        tone === "high" && "bg-gold-400 text-ink-950",
        tone === "mid" && "bg-ink-900 text-gold-300",
        tone === "low" && "bg-ink-200 text-ink-600",
      )}
    >
      <span aria-hidden>★</span>
      {score.toFixed(1)}
    </span>
  );
}
