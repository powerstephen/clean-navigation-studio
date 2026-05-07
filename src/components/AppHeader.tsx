import { Link } from "@tanstack/react-router";
import logo from "@/assets/smh-logo.png";

export function AppHeader({
  step,
  total,
}: {
  step?: number;
  total?: number;
}) {
  const pct = step && total ? (step / total) * 100 : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[760px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Sales Methodology Hub" className="h-8 w-auto" />
        </Link>
        {step && total ? (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground tabular-nums">
              {step} / {total}
            </span>
          </div>
        ) : (
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:block">
            ROI Self-Assessment
          </span>
        )}
      </div>

      {/* Progress bar constrained to content width */}
      {step && total ? (
        <div className="mx-auto max-w-[760px] px-6">
          <div className="h-1 w-full overflow-hidden rounded-full bg-hairline">
            <div
              className="h-full rounded-full bg-mint transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
