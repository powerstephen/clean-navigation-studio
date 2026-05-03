import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { CATEGORIES, QUESTIONS } from "@/lib/quiz";
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
            covering the four pillars of pipeline health. Get an instant score and see exactly where to focus.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <Link
              to="/quiz/$step"
              params={{ step: "1" }}
              className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              Start the assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-muted-foreground">~3 minutes · {QUESTIONS.length} questions</span>
          </div>
        </div>

        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
