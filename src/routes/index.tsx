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
      className="relative min-h-screen w-full text-white"
      style={{
        backgroundImage: `url(${icebergHero})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#0a1f3d",
      }}
    >
      {/* Gradient overlay — dark left, clear right */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(10,31,61,0.92) 0%, rgba(10,31,61,0.75) 35%, rgba(10,31,61,0.0) 65%)",
        }}
      />

      <main className="relative z-10 flex min-h-screen flex-col px-8 py-8 sm:px-12 lg:px-20 lg:py-12">
        {/* Logo — top left */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Sales Methodology Hub" className="h-12 w-auto" />
        </div>

        {/* Content */}
        <div className="mt-16 flex flex-1 flex-col justify-center max-w-2xl lg:mt-24">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Are you leaving money on the table?
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg max-w-lg">
            Rate your sales team across {QUESTIONS.length} questions and discover exactly how much
            revenue you're leaving on the table.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-lg">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="text-[12px] font-medium text-white/70">{f.label}</span>
                <div className="mt-1.5 flex items-center rounded-lg border border-white/20 bg-white/10 px-3 backdrop-blur-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400/40">
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
      </main>
    </div>
  );
}
