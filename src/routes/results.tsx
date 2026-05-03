import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import {
  QUESTIONS,
  categoryScores,
  clearAnswers,
  loadAnswers,
  scoreFor,
  tierFor,
} from "@/lib/quiz";
import { RotateCcw, ArrowRight, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/results")({
  component: Results,
  head: () => ({
    meta: [{ title: "Your Pipeline Score — Pipeline Insights" }],
  }),
});

function Results() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  useEffect(() => {
    setAnswers(loadAnswers());
  }, []);

  const score = scoreFor(answers);
  const cats = categoryScores(answers);
  const tier = tierFor(score.pct);

  const toneClass: Record<string, string> = {
    mint: "text-mint",
    emerald: "text-emerald",
    amber: "text-amber",
    rose: "text-rose",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-[1000px] px-6 py-12">
        {/* Hero score */}
        <section className="rounded-3xl border border-hairline bg-surface p-10 text-center shadow-card">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
            Your Pipeline Health Score
          </span>

          <div className="mt-6 flex items-end justify-center gap-3">
            <span className={`font-display text-[88px] font-semibold leading-none tabular-nums ${toneClass[tier.tone]}`}>
              {score.pct}
            </span>
            <span className="mb-3 font-display text-2xl text-muted-foreground">/ 100</span>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-background-elev px-3.5 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${tier.tone === "mint" ? "bg-mint" : tier.tone === "emerald" ? "bg-emerald" : tier.tone === "amber" ? "bg-amber" : "bg-rose"}`} />
            <span className="text-[12px] font-medium">{tier.label}</span>
          </div>

          <p className="mx-auto mt-5 max-w-xl text-[14px] text-muted-foreground">{tier.blurb}</p>

          <div className="mt-3 text-[12px] text-muted-foreground">
            {score.sum} of {score.max} points · {score.answered}/{score.total} answered
          </div>
        </section>

        {/* Category breakdown */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cats.map((c) => (
            <div key={c.id} className="rounded-2xl border border-hairline bg-surface p-5 shadow-card">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-base font-semibold">{c.label}</div>
                <div className="font-display text-2xl font-semibold tabular-nums">
                  {c.pct}<span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-mint transition-all duration-700"
                  style={{ width: `${c.pct}%` }}
                />
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                {c.sum} / {c.max} points
              </div>
            </div>
          ))}
        </section>

        {/* Per-question detail */}
        <section className="mt-6 rounded-2xl border border-hairline bg-surface shadow-card">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
              <h2 className="font-display text-base font-semibold">Question-by-question</h2>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ul className="divide-y divide-[var(--hairline)] border-t border-hairline">
              {QUESTIONS.map((q, i) => {
                const v = answers[q.id];
                return (
                  <li key={q.id} className="px-5 py-3">
                    <details className="group/q">
                      <summary className="flex cursor-pointer list-none items-center gap-4">
                        <span className="w-6 text-[11px] font-medium tabular-nums text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium">{q.topic}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{q.category}</div>
                        </div>
                        <div className="font-display text-base font-semibold tabular-nums">
                          {typeof v === "number" ? v : "—"}
                          <span className="text-xs text-muted-foreground">/10</span>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open/q:rotate-180" />
                      </summary>
                      <div className="ml-10 mt-2 space-y-1 text-[12px] text-muted-foreground">
                        <div className="text-foreground">{q.prompt}</div>
                        {q.helper ? <div className="text-[11px]">{q.helper}</div> : null}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </details>
        </section>

        {/* Actions */}
        <section className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              clearAnswers();
              setAnswers({});
            }}
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-5 py-2.5 text-[13px] font-medium text-foreground transition hover:bg-surface-2"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset answers
          </button>
          <Link
            to="/quiz/$step"
            params={{ step: "1" }}
            className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
          >
            Retake assessment <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </main>
    </div>
  );
}
