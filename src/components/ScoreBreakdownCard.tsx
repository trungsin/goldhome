import { SCORE_LABELS, SCORE_WEIGHTS, type ScoreBreakdown, type ScoreKey } from "@/lib/score";
import { ScoreBadge } from "./ScoreBadge";
import Link from "next/link";

export function ScoreBreakdownCard({ score, breakdown }: { score: number; breakdown: ScoreBreakdown | null }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">GoldScore</p>
          <h2 className="font-display text-xl font-semibold">Đánh giá tin đăng</h2>
        </div>
        <ScoreBadge score={score} size="lg" />
      </div>
      {breakdown && (
        <ul className="mt-5 space-y-4">
          {(Object.keys(SCORE_WEIGHTS) as ScoreKey[]).map((k) => (
            <li key={k}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{SCORE_LABELS[k]} <span className="text-ink-400">· {Math.round(SCORE_WEIGHTS[k] * 100)}%</span></span>
                <span className="font-semibold">{breakdown[k].score.toFixed(1)}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-ink-100">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-gold-300 to-gold-600" style={{ width: `${breakdown[k].score * 10}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-600">{breakdown[k].note}</p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/goldscore" className="mt-5 inline-block text-xs font-semibold text-gold-700 hover:underline">GoldScore được tính thế nào?</Link>
    </div>
  );
}
