import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QUESTIONS, loadContext, saveContext, type Context } from "@/lib/quiz";
import { ArrowRight } from "lucide-react";
import icebergHero from "@/assets/iceberg-hero.png";
import logo from "@/assets/smh-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pipeline Insights — ROI Self-Assessment" },
      {
        name: "description",
        content:
          "Rate your sales team across 15 questions and discover exactly how much revenue you're leaving on the table.",
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
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#0a1f3d" }}
    >
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left: content */}
        <section className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sales Methodology Hub" className="h-10 w-auto brightness-0 invert" />
          </div>

          <div className="mt-12 flex flex-1 flex-col justify-center max-w-xl lg:mt-20">
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Are you leaving money on the table?
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg max-w-md">
              Rate your sales team across {QUESTIONS.length} questions and discover exactly how much
              revenue you're leaving on the table.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[12px] font-medium text-white/60">{f.label}</span>
                  <div
                    className="mt-1.5 flex items-center rounded-lg border border-white/15 bg-white/5 px-3 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400/40"
                  >
                    {f.prefix && <span className="text-sm text-white/60">{f.prefix}</span>}
                    <input
                      inputMode="numeric"
                      value={String(ctx[f.key] ?? "")}
                      onChange={(e) => update(f.key, e.target.value)}
                      className="w-full bg-transparent py-2.5 text-[15px] font-medium tabular-nums text-white outline-none placeholder:text-white/30"
                    />
                    {f.suffix && <span className="text-sm text-white/60">{f.suffix}</span>}
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
              >
                Start the assessment
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-white/50">
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
