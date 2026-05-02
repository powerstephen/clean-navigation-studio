import { ChevronDown, Database, Check } from "lucide-react";
import { useState } from "react";

type SourceStatus = "connected" | "pending";
type Source = { id: string; label: string; status: SourceStatus };

const SOURCES: Source[] = [
  { id: "crm", label: "CRM", status: "connected" },
  { id: "billing", label: "Billing", status: "pending" },
  { id: "cs", label: "CS", status: "pending" },
];

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const connected = SOURCES.filter((s) => s.status === "connected").length;
  const total = SOURCES.length;
  const pct = (connected / total) * 100;

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-mint-soft text-mint">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h10M10 6l8 6-8 6" />
            </svg>
          </div>
          <span className="font-display text-[17px] font-semibold tracking-tight">SignalOps</span>
        </div>

        {/* Center label */}
        <div className="hidden md:block">
          <span className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Revenue Intelligence Platform
          </span>
        </div>

        {/* Live */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Connector strip */}
      <div className="border-t border-hairline bg-background-elev/40">
        <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-6 py-3">
          {/* Segmented progress pill */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="group relative flex items-center gap-3 rounded-full border border-hairline bg-surface px-3.5 py-2 transition hover:border-hairline-strong hover:bg-surface-2"
          >
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[13px] font-medium">Data sources</span>

            {/* Segmented bar */}
            <div className="flex items-center gap-1">
              {SOURCES.map((s) => (
                <span
                  key={s.id}
                  className={`h-1.5 w-6 rounded-full transition ${
                    s.status === "connected" ? "bg-mint" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <span className="text-[12px] tabular-nums text-muted-foreground">
              <span className="text-foreground font-semibold">{connected}</span>
              <span className="mx-0.5 opacity-50">/</span>
              {total}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
          </button>

          <p className="hidden text-[13px] italic text-muted-foreground md:block">
            Connect remaining sources to unlock full agent intelligence
          </p>

          {/* Inline progress meter on far right */}
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-mint transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {Math.round(pct)}% ready
            </span>
          </div>
        </div>

        {/* Expanded source list */}
        {open && (
          <div className="border-t border-hairline">
            <div className="mx-auto grid max-w-[1400px] gap-2 px-6 py-3 sm:grid-cols-3">
              {SOURCES.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-hairline bg-surface px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s.status === "connected" ? "bg-mint" : "bg-amber"
                      }`}
                    />
                    <span className="text-[13px] font-medium">{s.label}</span>
                  </div>
                  {s.status === "connected" ? (
                    <span className="flex items-center gap-1 text-[11px] text-mint">
                      <Check className="h-3 w-3" /> Connected
                    </span>
                  ) : (
                    <button className="text-[11px] font-medium text-amber hover:underline">
                      Connect →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
