import { Link } from "@tanstack/react-router";

export function AppHeader({
  step,
  total,
}: {
  step?: number;
  total?: number;
}) {
  const pct = step && total ? (step / total) * 100 : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-mint-soft text-mint">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h10M10 6l8 6-8 6" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight">Pipeline Insights</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ROI Self-Assessment</div>
          </div>
        </Link>

        {step && total ? (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground tabular-nums">
              {step} / {total}
            </span>
          </div>
        ) : (
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:block">
            Union Square Consulting
          </span>
        )}
      </div>

      {step && total ? (
        <div className="h-0.5 w-full bg-white/[0.05]">
          <div
            className="h-full bg-mint transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </header>
  );
}
