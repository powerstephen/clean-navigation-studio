import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { Target, Users, Star, AlertTriangle, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SignalOps — Revenue Intelligence Platform" },
      {
        name: "description",
        content:
          "Connect your CRM, billing and CS data to surface your true ICP, recover churn risk, and accelerate revenue.",
      },
    ],
  }),
});

const SECTIONS = [
  { id: "icp", label: "ICP", active: true },
  { id: "profit", label: "Profit" },
  { id: "recover", label: "Recover" },
  { id: "generate", label: "Generate" },
  { id: "ignite", label: "Ignite" },
  { id: "deal", label: "Deal" },
];

const STATS = [
  { label: "Total accounts", value: "250", note: "in your CRM", icon: Users, accent: "text-foreground" },
  { label: "Active customers", value: "72", note: "currently paying", icon: Star, accent: "text-emerald" },
  { label: "Churned", value: "9", note: "lost accounts", icon: AlertTriangle, accent: "text-amber" },
  { label: "At risk", value: "5", note: "flagged accounts", icon: Zap, accent: "text-rose" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />

      <main className="mx-auto max-w-[1400px] px-6 py-10">
        {/* Section nav */}
        <nav className="mb-10 border-b border-hairline">
          <ul className="flex flex-wrap items-center gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  className={`relative px-5 py-3.5 font-display text-[13px] font-semibold uppercase tracking-[0.18em] transition ${
                    s.active
                      ? "text-mint"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                  {s.active && (
                    <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-mint" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stat cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group rounded-2xl border border-hairline bg-surface p-5 shadow-card transition hover:border-hairline-strong hover:bg-surface-2"
              >
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </div>
                <div className={`mt-4 font-display text-4xl font-semibold tabular-nums ${s.accent}`}>
                  {s.value}
                </div>
                <div className="mt-3 text-[12px] text-muted-foreground">{s.note}</div>
              </div>
            );
          })}
        </section>

        {/* ICP panel */}
        <section className="mt-6 rounded-2xl border border-hairline bg-surface p-12 text-center shadow-card">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint-soft text-mint">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold">Build your ICP Profile</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            SignalOps analyses your 250 customer records — CRM data, billing outcomes, CS history — to
            identify the characteristics of your truly best customers.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-[13px] italic text-muted-foreground/80">
            Not your average customers. Your best ones — the ones that stay, expand, and never drain your team.
          </p>
          <button className="mt-7 inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110">
            <Target className="h-4 w-4" />
            Analyse my ICP
            <span aria-hidden>→</span>
          </button>
        </section>
      </main>
    </div>
  );
}
