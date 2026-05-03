import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { QUESTIONS, loadAnswers, saveAnswer } from "@/lib/quiz";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/quiz/$step")({
  component: QuizStep,
  head: () => ({
    meta: [{ title: "Pipeline Insights — Question" }],
  }),
});

function QuizStep() {
  const { step } = useParams({ from: "/quiz/$step" });
  const navigate = useNavigate();
  const idx = Math.max(0, Math.min(QUESTIONS.length - 1, parseInt(step, 10) - 1 || 0));
  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;

  const [value, setValue] = useState<number | null>(null);

  useEffect(() => {
    const stored = loadAnswers()[q.id];
    setValue(typeof stored === "number" ? stored : null);
  }, [q.id]);

  const commit = (v: number) => {
    setValue(v);
    saveAnswer(q.id, v);
  };

  const next = () => {
    if (value == null) return;
    if (idx + 1 >= total) {
      navigate({ to: "/results" });
    } else {
      navigate({ to: "/quiz/$step", params: { step: String(idx + 2) } });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader step={idx + 1} total={total} />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[760px] flex-col px-6 py-12">
        <div className="flex items-center gap-3">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-mint">
            {q.category}
          </span>
          <span className="h-px w-8 bg-hairline-strong" />
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {q.topic}
          </span>
        </div>

        <h1 className="mt-6 font-display text-[34px] font-semibold leading-[1.15] tracking-tight">
          {q.prompt}
        </h1>
        {q.helper && (
          <p className="mt-4 text-[14px] italic text-muted-foreground">{q.helper}</p>
        )}

        {/* 1-10 selector */}
        <div className="mt-12">
          <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const active = value === n;
              return (
                <button
                  key={n}
                  onClick={() => commit(n)}
                  className={`group relative flex aspect-square items-center justify-center rounded-xl border text-[15px] font-display font-semibold tabular-nums transition ${
                    active
                      ? "border-mint bg-mint text-primary-foreground shadow-glow"
                      : "border-hairline bg-surface text-foreground hover:border-hairline-strong hover:bg-surface-2"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>Poor</span>
            <span>Best in class</span>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-auto flex items-center justify-between pt-12">
          {idx > 0 ? (
            <Link
              to="/quiz/$step"
              params={{ step: String(idx) }}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2.5 text-[13px] font-medium text-foreground transition hover:bg-surface-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Exit
            </Link>
          )}

          <button
            onClick={next}
            disabled={value == null}
            className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
          >
            {idx + 1 === total ? "See my score" : "Next"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
}
