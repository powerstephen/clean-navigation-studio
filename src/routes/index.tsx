import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORIES, QUESTIONS, loadContext, saveContext, type Context } from "@/lib/quiz";
import { ArrowRight, Target, Gauge, DollarSign, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pipeline Insights — ROI Self-Assessment" },
      {
        name: "description",
        content:
          "Score your pipeline management & forecasting maturity across Close Rate, Sales Cycle, ASP and Forecasting.",
      },
    ],
  }),
});

const ICONS = [Target, Gauge, DollarSign, LineChart];

function Index() {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<Context>({ acv: 0, reps: 0, dealsPerRep: 0, closeRate: 0 });

  useEffect(() => {
    setCtx(loadContext());
  }, []);

  const update = (k: keyof Context, v: string) => {
    const n = Number(v.replace(/[^0-9.]/g, ""));
    setCtx((c) => ({ ...c, [k]: isFinite(n) ? n : 0 }));
  };

  const start = () => {
    saveContext(ctx);
    navigate({ to: "/quiz/$step", params: { step: "1" } });
  };

  const fields: { key: keyof Context; label: string; suffix?: string; prefix?: string }[] = [
    { key: "acv", label: "Average contract value", prefix: "$" },
    { key: "reps", label: "Number of reps" },
    { key: "dealsPerRep", label: "Deals per rep / year" },
    { key: "closeRate", label: "Current close rate", suffix: "%" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="max-w-2xl">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
            Pipeline & Forecasting Quiz
          </span>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            How healthy is your pipeline really?
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
            Rate your team from <span className="text-foreground font-medium">1 to 10</span> across {QUESTIONS.length} questions
            covering the four pillars of pipeline health. Get an instant score and a personalised revenue-at-risk estimate.
          </p>
        </div>

        {/* Context inputs */}
        <section className="mt-10 rounded-2xl border border-hairline bg-surface p-6 shadow-card sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Tell us about your sales motion</h2>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Used to calculate your ROI</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="text-[12px] font-medium text-muted-foreground">{f.label}</span>
                <div className="mt-1.5 flex items-center rounded-lg border border-hairline-strong bg-background-elev px-3 focus-within:ring-2 focus-within:ring-ring">
                  {f.prefix && <span className="text-sm text-muted-foreground">{f.prefix}</span>}
                  <input
                    inputMode="numeric"
                    value={String(ctx[f.key] ?? "")}
                    onChange={(e) => update(f.key, e.target.value)}
                    className="w-full bg-transparent py-2.5 text-[15px] font-medium tabular-nums outline-none"
                  />
                  {f.suffix && <span className="text-sm text-muted-foreground">{f.suffix}</span>}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              Start the assessment
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground">~3 minutes · {QUESTIONS.length} questions</span>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const Icon = ICONS[i];
            const count = QUESTIONS.filter((q) => q.category === c.label).length;
            return (
              <div
                key={c.id}
                className="rounded-2xl border border-hairline bg-surface p-5 shadow-card"
              >
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-mint-soft text-mint">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-4 font-display text-base font-semibold">{c.label}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  {count} question{count > 1 ? "s" : ""}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
