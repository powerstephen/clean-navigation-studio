import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import {
  QUESTIONS,
  clearAnswers,
  loadAnswers,
  loadContext,
  scoreFor,
  tierFor,
  computeRoi,
  formatCurrency,
  type Context,
  DEFAULT_CONTEXT,
} from "@/lib/quiz";
import { RotateCcw, ArrowRight, ChevronDown, Calendar, TrendingDown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/results")({
  component: Results,
  head: () => ({
    meta: [{ title: "Your Pipeline ROI — Pipeline Insights" }],
  }),
});

function Results() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [ctx, setCtx] = useState<Context>(DEFAULT_CONTEXT);

  useEffect(() => {
    setAnswers(loadAnswers());
    setCtx(loadContext());
  }, []);

  const score = scoreFor(answers);
  const tier = tierFor(score.pct);
  const roi = computeRoi(answers, ctx);
  const sortedCats = [...roi.cats].sort((a, b) => b.revenueAtRisk - a.revenueAtRisk);

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
        </section>

        {/* ROI summary */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-hairline bg-surface p-6 shadow-card">
            <div className="flex items-center gap-2 text-rose">
              <TrendingDown className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Estimated revenue at risk</span>
            </div>
            <div className="mt-4 font-display text-[44px] font-semibold leading-none tabular-nums text-rose">
              {formatCurrency(roi.totalAtRisk)}
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              Annualised gap across all four pillars, based on {ctx.reps} reps × {ctx.dealsPerRep} deals × {ctx.closeRate}% close rate × {formatCurrency(ctx.acv)} ACV.
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-mint-soft p-6 shadow-card">
            <div className="flex items-center gap-2 text-mint">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Recoverable upside</span>
            </div>
            <div className="mt-4 font-display text-[44px] font-semibold leading-none tabular-nums text-mint">
              {formatCurrency(roi.recoverable)}
            </div>
            <p className="mt-3 text-[13px] text-muted-foreground">
              ~60% of the gap is realistically recoverable in 2–3 quarters with the right operating cadence.
            </p>
          </div>
        </section>

        {/* Per-category breakdown sorted by impact */}
        <section className="mt-8 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">Where the revenue is leaking</h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Sorted by impact</span>
          </div>

          {sortedCats.map((c, i) => (
            <article key={c.id} className="rounded-2xl border border-hairline bg-surface p-6 shadow-card">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-mint-soft font-display text-[11px] font-semibold text-mint tabular-nums">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-lg font-semibold">{c.label}</h3>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-hairline">
                      <div className="h-full rounded-full bg-mint transition-all duration-700" style={{ width: `${c.pct}%` }} />
                    </div>
                    <span className="font-display text-sm font-semibold tabular-nums">
                      {c.pct}<span className="text-xs text-muted-foreground">%</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">score</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Revenue impact</div>
                  <div className="font-display text-2xl font-semibold tabular-nums text-rose">
                    {formatCurrency(c.revenueAtRisk)}
                  </div>
                </div>
              </header>

              <p className="mt-5 text-[14px] leading-relaxed text-foreground">{c.insight}</p>

              <div className="mt-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">Priority actions</div>
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {c.actions.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-lg border border-hairline bg-background-elev px-3 py-2.5 text-[13px]">
                      <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint text-[10px] font-semibold text-primary-foreground tabular-nums">
                        {idx + 1}
                      </span>
                      <span className="text-foreground/90">{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>

        {/* Per-question detail */}
        <section className="mt-8 rounded-2xl border border-hairline bg-surface shadow-card">
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

        {/* CTA */}
        <section className="mt-10 overflow-hidden rounded-3xl border border-hairline bg-foreground p-8 text-background shadow-card sm:p-10">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-background/70">
                Sales Methodology Hub
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
                Recover {formatCurrency(roi.recoverable)} in pipeline.
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-background/75">
                Book a free 30-minute working session. We'll walk through your scores, pressure-test the numbers, and map the fastest path to closing your biggest gap.
              </p>
            </div>
            <a
              href="https://salesmethodologyhub.com/book"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-6 py-3 text-[14px] font-semibold text-foreground transition hover:brightness-95"
            >
              <Calendar className="h-4 w-4" />
              Book a free session
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
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
