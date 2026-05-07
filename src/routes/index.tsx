import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { QUESTIONS, loadContext, saveContext, type Context } from "@/lib/quiz";
import { ArrowRight } from "lucide-react";
import icebergHero from "@/assets/iceberg-hero.png";

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

      <main className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-2">
        {/* Left: content */}
        <section className="flex items-center px-6 py-12 sm:px-10 lg:px-16 lg:py-20">
          <div className="mx-auto w-full max-w-xl">
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
              Are you leaving money on the table?
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Rate your sales team across {QUESTIONS.length} questions and discover exactly how much
              revenue you're leaving on the table.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
              >
                Start the assessment
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-muted-foreground">
                ~3 minutes · {QUESTIONS.length} questions
              </span>
            </div>
          </div>
        </section>

        {/* Right: iceberg image */}
        <section
          aria-hidden="true"
          className="relative hidden min-h-[420px] bg-cover bg-center lg:block"
          style={{ backgroundImage: `url(${icebergHero})` }}
        />
      </main>
    </div>
  );
}
