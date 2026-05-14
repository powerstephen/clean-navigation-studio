import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  loadContext,
  computeUplift,
  formatCurrency,
  formatCurrencyPlain,
  tierFor,
  type RoiContext,
  DEFAULT_CONTEXT,
} from "@/lib/quiz";

export const Route = createFileRoute("/results")({
  component: Results,
  head: () => ({
    meta: [{ title: "Your Revenue Gap — Sales Methodology Hub" }],
  }),
});

function Results() {
  const [ctx, setCtx] = useState<RoiContext>(DEFAULT_CONTEXT);
  const [targetExec, setTargetExec] = useState(58);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const c = loadContext();
    setCtx(c);
    setTargetExec(Math.min(c.executionScore + 20, 95));
    setHydrated(true);
  }, []);

  const uplift = useMemo(() => computeUplift(ctx, targetExec), [ctx, targetExec]);
  const currentTier = tierFor(ctx.executionScore);
  const targetTier = tierFor(targetExec);

  const submitEmail = async () => {
    if (!email || !email.includes("@")) return;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      fetch(`${url}/rest/v1/roi_requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
        body: JSON.stringify({
          email,
          role: ctx.role,
          execution_score: ctx.executionScore,
          methodology: ctx.methodology,
          revenue_target: ctx.revenueTarget,
          quota_attain_pct: ctx.quotaAttainPct,
          ramp_months: ctx.rampMonths,
          target_exec_score: targetExec,
          total_uplift: Math.round(uplift.totalUplift),
          created_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
    setEmailSent(true);
  };

  if (!hydrated) return null;

  const milestones = [
    { score: 55, label: "Inconsistent" },
    { score: 70, label: "Developing" },
    { score: 85, label: "Strong" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ background: "#0a1f3d", borderRadius: 12, padding: "1.5rem 1.75rem", marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Sales Methodology Hub · Revenue Gap Calculator
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "white", lineHeight: 1.3, margin: 0 }}>
            Your revenue gap — and what closing it is worth
          </h1>
        </div>

        {/* Current state cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Execution score</div>
            <div style={{ fontSize: 36, fontWeight: 600, color: currentTier.hex, lineHeight: 1 }}>{ctx.executionScore}%</div>
            <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: currentTier.bg, color: currentTier.color }}>{currentTier.label}</span>
          </div>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Current revenue gap</div>
            <div style={{ fontSize: 36, fontWeight: 600, color: "#DC2626", lineHeight: 1 }}>{formatCurrencyPlain(uplift.revenueGap)}</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>vs your {formatCurrencyPlain(ctx.revenueTarget)} target</div>
          </div>
        </div>

        {/* Big gap number */}
        <div style={{ background: "#0a1f3d", borderRadius: 12, padding: "1.5rem 1.75rem", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
            Revenue unlocked at {targetExec}% execution
          </div>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#22C55E", lineHeight: 1, marginBottom: 6 }}>
            {formatCurrencyPlain(uplift.totalUplift)}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Across quota attainment, win rate and rep ramp time
          </div>
        </div>

        {/* THE SLIDER — centrepiece */}
        <div style={{ background: "white", border: "1.5px solid #0a1f3d", borderRadius: 12, padding: "1.5rem 1.75rem", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Target execution score</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: targetTier.hex }}>{targetExec}%</span>
                <span style={{ fontSize: 12, color: targetTier.color, background: targetTier.bg, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>{targetTier.label}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Revenue unlocked</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#22C55E" }}>{formatCurrencyPlain(uplift.totalUplift)}</div>
            </div>
          </div>

          <input
            type="range"
            min={ctx.executionScore}
            max={95}
            value={targetExec}
            step={1}
            onChange={e => setTargetExec(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#0a1f3d", cursor: "pointer", height: 6 }}
          />

          {/* Milestone markers */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <span style={{ fontSize: 10, color: "#94A3B8" }}>Current: {ctx.executionScore}%</span>
            {milestones.filter(m => m.score > ctx.executionScore).map(m => (
              <span key={m.score} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 8, background: "#F1F5F9", color: "#64748B" }}>
                {m.score}% — {m.label}
              </span>
            ))}
            <span style={{ fontSize: 10, color: "#94A3B8" }}>95%</span>
          </div>
        </div>

        {/* Three uplift counters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Quota attainment</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#16A34A" }}>{formatCurrency(uplift.quotaUplift)}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{ctx.quotaAttainPct}% → {uplift.newQuotaAttain}%</div>
          </div>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Win rate</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#16A34A" }}>{formatCurrency(uplift.winRateUplift)}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>+{uplift.winRateGainPp}pp improvement</div>
          </div>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Ramp time</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#16A34A" }}>{formatCurrency(uplift.rampUplift)}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>-{uplift.rampReductionMonths} months saved</div>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Where the uplift comes from
          </div>

          {[
            {
              title: "Quota attainment",
              desc: "Reps running a shared methodology consistently hit more of their number. The gap between your top and average performer narrows.",
              value: uplift.quotaUplift,
              label: "attainment gain",
            },
            {
              title: "Win rate improvement",
              desc: "Better qualification means fewer wasted proposals. Methodology determines which deals you pursue — and how you close them.",
              value: uplift.winRateUplift,
              label: "win rate uplift",
            },
            {
              title: "Rep ramp time",
              desc: "New reps reach full productivity faster when there's a shared framework to learn from day one — not six months of figuring it out alone.",
              value: uplift.rampUplift,
              label: "productivity gain",
            },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 0", borderBottom: i < 2 ? "0.5px solid #F1F5F9" : "none" }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0a1f3d", marginBottom: 4 }}>{row.title}</div>
                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55 }}>{row.desc}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 90 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#0a1f3d" }}>{formatCurrencyPlain(row.value)}</div>
                <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{row.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Email CTA */}
        <div style={{ background: "#F8FAFC", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem 1.5rem", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0a1f3d", marginBottom: 6 }}>
            Get your personalised pricing proposal
          </div>
          <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 16 }}>
            We'll email you a full ROI report — including SMH pricing tailored to your team size and a projected payback timeline. Within 24 hours.
          </div>
          {!emailSent ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, border: "0.5px solid #CBD5E1", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0a1f3d", outline: "none", background: "white" }}
                onKeyDown={e => e.key === "Enter" && submitEmail()}
              />
              <button
                onClick={submitEmail}
                style={{ background: "#0a1f3d", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Email me this →
              </button>
            </div>
          ) : (
            <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontWeight: 500, color: "#085041" }}>
              ✓ On its way. Ashraf will be in touch within 24 hours.
            </div>
          )}
        </div>

        {/* Start over */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => { window.location.href = "/"; }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94A3B8", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} /> Start over
          </button>
        </div>

      </div>
    </div>
  );
}
