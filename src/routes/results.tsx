import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { loadContext, type RoiContext, DEFAULT_CONTEXT } from "@/lib/quiz";

export const Route = createFileRoute("/results")({
  component: Results,
  head: () => ({ meta: [{ title: "Revenue Scenario Planner — Sales Methodology Hub" }] }),
});

const EXEC_BASE = 38;

function tier(s: number) {
  if (s < 35) return { label: "Critical gaps", bg: "#FEF2F2", col: "#A32D2D", hex: "#DC2626" };
  if (s < 55) return { label: "Inconsistent", bg: "#FFFBEB", col: "#854F0B", hex: "#D97706" };
  if (s < 70) return { label: "Developing", bg: "#ECFEFF", col: "#0F6E56", hex: "#0E7C7B" };
  if (s < 85) return { label: "Strong", bg: "#E1F5EE", col: "#085041", hex: "#1D9E75" };
  return { label: "Best in class", bg: "#EAF3DE", col: "#27500A", hex: "#16A34A" };
}

function fmtM(n: number) {
  const a = Math.abs(Math.round(n));
  if (a >= 1_000_000) return `£${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `£${Math.round(a / 1_000)}K`;
  return `£${a}`;
}

function fmtD(n: number) {
  if (Math.abs(n) < 100) return "—";
  const s = n > 0 ? "+" : "-";
  const a = Math.abs(Math.round(n));
  if (a >= 1_000_000) return `${s}£${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `${s}£${Math.round(a / 1_000)}K`;
  return `${s}£${a}`;
}

function fmtPp(n: number) {
  if (Math.abs(n) < 0.1) return "—";
  return `${n > 0 ? "+" : ""}${Math.round(n * 10) / 10}pp`;
}

function fmtMo(n: number) { return `${Math.round(n * 10) / 10} mo`; }
function fmtDMo(n: number) {
  if (Math.abs(n) < 0.1) return "—";
  return `${n > 0 ? "+" : ""}${Math.round(n * 10) / 10} mo`;
}

interface Metrics { att: number; wr: number; acv: number; ramp: number; }

function execToMetrics(base: RoiContext, exec: number): Metrics {
  const gain = Math.max(0, (exec - EXEC_BASE) / 100);
  return {
    att: Math.min(100, base.quotaAttainPct + gain * 45),
    wr: Math.min(80, 22 + gain * 18),
    acv: Math.round((base.rampMonths > 0 ? 50000 : 50000) * (1 + gain * 0.12)),
    ramp: Math.max(1, base.rampMonths * (1 - gain * 0.42)),
  };
}

interface Calc {
  totQ: number; attRev: number; missedCost: number; dealsPerRep: number;
  pipeReq: number; rampLoss: number; payback: number; teamRampCost: number;
  net: number; rpr: number;
}

function compute(reps: number, quota: number, m: Metrics): Calc {
  const totQ = reps * quota;
  const attRev = totQ * (m.att / 100);
  const missedCost = reps * quota * (1 - m.att / 100);
  const dealsPerRep = (quota * (m.att / 100)) / m.acv;
  const pipeReq = attRev / Math.max(0.01, m.wr / 100);
  const rampLoss = (m.ramp / 12) * quota * reps * 0.20;
  const payback = m.ramp * 1.3;
  const teamRampCost = (m.ramp / 12) * quota * Math.max(1, Math.round(reps * 0.2)) * 0.25;
  const net = attRev - rampLoss;
  const rpr = net / reps;
  return { totQ, attRev, missedCost, dealsPerRep, pipeReq, rampLoss, payback, teamRampCost, net, rpr };
}

function DeltaCell({ val, positive = true }: { val: string; positive?: boolean }) {
  const isNeg = val.startsWith("-");
  const isPos = val.startsWith("+");
  const color = isPos ? (positive ? "#16A34A" : "#DC2626") : isNeg ? (positive ? "#DC2626" : "#16A34A") : "#64748B";
  return <td style={{ padding: "8px 10px", borderBottom: "0.5px solid #F1F5F9", textAlign: "right", color, fontWeight: 500, fontSize: 13 }}>{val}</td>;
}

function WFRow({ label, cur, tgt, delta, note, positive = true, isGroup = false, isTotal = false }: {
  label: string; cur?: string; tgt?: string; delta?: string; note?: string; positive?: boolean; isGroup?: boolean; isTotal?: boolean;
}) {
  const bg = isGroup ? "#F8FAFC" : isTotal ? "#F0F4F8" : "white";
  const fw = isTotal ? 600 : 400;
  return (
    <tr style={{ background: bg }}>
      <td style={{ padding: isGroup ? "6px 10px" : "8px 10px", borderBottom: "0.5px solid #F1F5F9", fontSize: isGroup ? 11 : 12, color: isGroup ? "#64748B" : "#475569", textTransform: isGroup ? "uppercase" : "none", letterSpacing: isGroup ? "0.06em" : "normal", fontWeight: isGroup ? 500 : fw }}>{label}</td>
      <td style={{ padding: "8px 10px", borderBottom: "0.5px solid #F1F5F9", textAlign: "right", fontSize: isTotal ? 14 : 13, fontWeight: fw, color: "#0a1f3d" }}>{cur ?? "—"}</td>
      <td style={{ padding: "8px 10px", borderBottom: "0.5px solid #F1F5F9", textAlign: "right", fontSize: isTotal ? 14 : 13, fontWeight: fw, color: "#0a1f3d" }}>{tgt ?? "—"}</td>
      {delta !== undefined ? <DeltaCell val={delta} positive={positive} /> : <td style={{ padding: "8px 10px", borderBottom: "0.5px solid #F1F5F9", textAlign: "right", color: "#94A3B8" }}>—</td>}
      <td style={{ padding: "8px 10px", borderBottom: "0.5px solid #F1F5F9", fontSize: 11, color: "#94A3B8" }}>{note ?? ""}</td>
    </tr>
  );
}

function Results() {
  const [ctx, setCtx] = useState<RoiContext>(DEFAULT_CONTEXT);
  const [exec, setExec] = useState(58);
  const [reps, setReps] = useState(10);
  const [quota, setQuota] = useState(400000);
  const [att, setAtt] = useState(55);
  const [acv, setAcv] = useState(50000);
  const [wr, setWr] = useState(22);
  const [ramp, setRamp] = useState(5);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const c = loadContext();
    setCtx(c);
    setExec(Math.min(c.executionScore + 20, 95));
    setReps(c.teamSize || 10);
    setQuota(c.revenueTarget ? Math.round(c.revenueTarget / (c.teamSize || 10)) : 400000);
    setAtt(c.quotaAttainPct || 55);
    setRamp(c.rampMonths || 5);
  }, []);

  const curM: Metrics = { att, wr, acv, ramp };
  const tgtM = execToMetrics({ ...ctx, quotaAttainPct: att, rampMonths: ramp }, exec);
  const cur = compute(reps, quota, curM);
  const tgt = compute(reps, quota, tgtM);

  const uplift = tgt.net - cur.net;
  const t = tier(exec);
  const wrUplift = (tgtM.wr - wr) / 100 * tgt.attRev * 0.35;

  const sp = { padding: "1.5rem 1.75rem" } as const;
  const card = { background: "white", border: "0.5px solid #E2E8F0", borderRadius: 12, marginBottom: 14 } as const;
  const metric = { background: "#F8FAFC", borderRadius: 8, padding: "1rem" } as const;
  const lbl = { fontSize: 10, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6, display: "block" as const };
  const inp = { width: "100%", border: "0.5px solid #CBD5E1", borderRadius: 8, padding: "6px 10px", fontSize: 14, fontWeight: 500, color: "#0a1f3d", outline: "none", boxSizing: "border-box" as const, background: "white" };

  const submitEmail = async () => {
    if (!email || !email.includes("@")) return;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      fetch(`${url}/rest/v1/roi_requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
        body: JSON.stringify({ email, execution_score: ctx.executionScore, methodology: ctx.methodology, revenue_target: reps * quota, reps, quota_per_rep: quota, attainment_pct: att, win_rate: wr, ramp_months: ramp, target_exec: exec, total_uplift: Math.round(uplift), created_at: new Date().toISOString() }),
      }).catch(() => {});
    }
    setEmailSent(true);
  };

  const smhFixes = [
    { show: tgtM.att - att > 2, title: "Quota attainment", icon: "👥", body: `MEDDIC gives every rep the same qualification discipline — closing the gap between your top performers and the rest of the team.` },
    { show: tgtM.wr - wr > 1, title: "Win rate", icon: "🎯", body: `Structured discovery and qualification filters out weak opportunities early — so reps stop chasing deals that were never real.` },
    { show: tgtM.ramp - ramp < -0.5, title: "Ramp time", icon: "⏱", body: `A shared methodology gives new reps a playbook from day one — not six months figuring out how top performers actually close.` },
    { show: tgtM.acv - acv > 500, title: "Deal size", icon: "📈", body: `Multi-threading and economic buyer access unlock larger deals — MEDDPICC disciplines that get the right people in the room earlier.` },
  ].filter(f => f.show);

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Sales Methodology Hub</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#0a1f3d" }}>Revenue scenario planner</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, padding: "3px 14px", borderRadius: 20, background: tier(ctx.executionScore || EXEC_BASE).bg, color: tier(ctx.executionScore || EXEC_BASE).col }}>
            {ctx.executionScore || EXEC_BASE}% execution — {tier(ctx.executionScore || EXEC_BASE).label.toLowerCase()}
          </span>
        </div>

        {/* Team inputs */}
        <div style={{ ...card, ...sp }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Your team</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
            {[
              { label: "Reps", val: reps, set: setReps, step: 1 },
              { label: "Quota / rep (£)", val: quota, set: setQuota, step: 10000 },
              { label: "Attainment %", val: att, set: setAtt, step: 1 },
              { label: "ACV (£)", val: acv, set: setAcv, step: 1000 },
              { label: "Win rate %", val: wr, set: setWr, step: 1 },
              { label: "Ramp (months)", val: ramp, set: setRamp, step: 1 },
            ].map(f => (
              <div key={f.label}>
                <span style={lbl}>{f.label}</span>
                <input style={inp} type="number" value={f.val} step={f.step} min={1} onChange={e => f.set(+e.target.value || 1)} />
              </div>
            ))}
          </div>
        </div>

        {/* EXECUTION SLIDER — hero */}
        <div style={{ ...card, ...sp, border: "1.5px solid #0a1f3d" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Execution score — drag to model your target</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "#64748B" }}>Current <strong style={{ color: "#0a1f3d" }}>{EXEC_BASE}%</strong></span>
                <span style={{ fontSize: 13, color: "#64748B" }}>→ Target <strong style={{ fontSize: 22, color: t.hex }}>{exec}%</strong></span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: t.bg, color: t.col }}>{t.label}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Revenue unlocked</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: uplift >= 0 ? "#16A34A" : "#DC2626" }}>{fmtD(uplift)}</div>
            </div>
          </div>
          <input type="range" min={EXEC_BASE} max={95} value={exec} step={1} onChange={e => setExec(+e.target.value)} style={{ width: "100%", accentColor: "#0a1f3d", cursor: "pointer" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 4 }}>
            {[{ s: EXEC_BASE, l: `${EXEC_BASE}% current`, bg: tier(EXEC_BASE).bg, c: tier(EXEC_BASE).col }, { s: 55, l: "55% developing", bg: "#FFFBEB", c: "#854F0B" }, { s: 70, l: "70% strong", bg: "#E1F5EE", c: "#085041" }, { s: 85, l: "85% best in class", bg: "#EAF3DE", c: "#27500A" }].map(m => (
              <span key={m.s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: m.bg, color: m.c }}>{m.l}</span>
            ))}
          </div>
        </div>

        {/* Headline cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Team revenue now", val: fmtM(cur.net), sub: `${reps} reps · ${Math.round(att)}% attainment`, color: "#0a1f3d" },
            { label: "At target execution", val: fmtM(tgt.net), sub: `${exec}% execution score`, color: "#16A34A" },
            { label: "Revenue gap to quota", val: fmtM(cur.totQ - cur.attRev), sub: "vs full quota potential", color: "#DC2626" },
            { label: "Revenue / rep now", val: fmtM(cur.rpr), sub: `vs ${fmtM(tgt.rpr)} at target`, color: "#0a1f3d" },
          ].map(m => (
            <div key={m.label} style={metric}>
              <div style={lbl}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Deep financial waterfall */}
        <div style={{ ...card, ...sp }}>
          <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Revenue waterfall — current vs {exec}% execution target</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Metric", "Current", `Target (${exec}%)`, "Delta", "Notes"].map((h, i) => (
                    <th key={h} style={{ padding: "8px 10px", borderBottom: "1px solid #E2E8F0", fontSize: 11, fontWeight: 500, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <WFRow label="Team capacity" isGroup />
                <WFRow label="Number of reps" cur={String(reps)} tgt={String(reps)} note="fixed" />
                <WFRow label="Quota per rep" cur={fmtM(quota)} tgt={fmtM(quota)} note="fixed" />
                <WFRow label="Total quota capacity" cur={fmtM(cur.totQ)} tgt={fmtM(tgt.totQ)} note="reps × quota" />

                <WFRow label="Attainment" isGroup />
                <WFRow label="Quota attainment %" cur={`${Math.round(att)}%`} tgt={`${Math.round(tgtM.att)}%`} delta={fmtPp(tgtM.att - att)} note="exec drives consistency" />
                <WFRow label="Reps hitting quota" cur={`${Math.round(reps * att / 100 * 10) / 10}`} tgt={`${Math.round(reps * tgtM.att / 100 * 10) / 10}`} delta={fmtD((tgtM.att - att) / 100 * reps * quota)} note={`of ${reps} reps`} />
                <WFRow label="Cost of missed reps" cur={fmtM(cur.missedCost)} tgt={fmtM(tgt.missedCost)} delta={fmtD(tgt.missedCost - cur.missedCost)} positive={false} note="underattainment × quota" />
                <WFRow label="Revenue from attainment" cur={fmtM(cur.attRev)} tgt={fmtM(tgt.attRev)} delta={fmtD(tgt.attRev - cur.attRev)} note="total quota × attainment" />

                <WFRow label="Win rate & deal quality" isGroup />
                <WFRow label="Win rate" cur={`${Math.round(wr)}%`} tgt={`${Math.round(tgtM.wr)}%`} delta={fmtPp(tgtM.wr - wr)} note="methodology qualification" />
                <WFRow label="ACV" cur={fmtM(acv)} tgt={fmtM(tgtM.acv)} delta={fmtD(tgtM.acv - acv)} note="multi-threading uplift" />
                <WFRow label="Deals closed / rep / yr" cur={`${Math.round(cur.dealsPerRep * 10) / 10}`} tgt={`${Math.round(tgt.dealsPerRep * 10) / 10}`} delta={fmtPp(tgt.dealsPerRep - cur.dealsPerRep)} note="quota ÷ acv × attainment" />
                <WFRow label="Pipeline required to hit target" cur={fmtM(cur.pipeReq)} tgt={fmtM(tgt.pipeReq)} delta={fmtD(tgt.pipeReq - cur.pipeReq)} positive={false} note="revenue ÷ win rate" />
                <WFRow label="Win rate revenue uplift" tgt={fmtM(wrUplift)} delta={fmtD(wrUplift)} note="incremental from wr gain" />

                <WFRow label="Ramp & productivity" isGroup />
                <WFRow label="Ramp time to full productivity" cur={fmtMo(ramp)} tgt={fmtMo(tgtM.ramp)} delta={fmtDMo(tgtM.ramp - ramp)} positive={false} note="structured onboarding" />
                <WFRow label="Productivity loss / new hire" cur={fmtM(cur.rampLoss / reps)} tgt={fmtM(tgt.rampLoss / reps)} delta={fmtD(tgt.rampLoss / reps - cur.rampLoss / reps)} positive={false} note="ramp ÷ 12 × quota × 20%" />
                <WFRow label="Payback on new hire" cur={fmtMo(cur.payback)} tgt={fmtMo(tgt.payback)} delta={fmtDMo(tgt.payback - cur.payback)} positive={false} note="months to net positive" />
                <WFRow label="Annual team ramp cost" cur={fmtM(cur.teamRampCost)} tgt={fmtM(tgt.teamRampCost)} delta={fmtD(tgt.teamRampCost - cur.teamRampCost)} positive={false} note="20% attrition assumed" />

                <WFRow label="Revenue efficiency" isGroup />
                <WFRow label="Revenue per rep (current)" cur={fmtM(cur.rpr)} note="key CRO efficiency metric" />
                <WFRow label="Revenue per rep (target)" tgt={fmtM(tgt.rpr)} delta={fmtD(tgt.rpr - cur.rpr)} note={`at ${exec}% execution`} />
                <WFRow label="Annual cost of execution gap" cur={`${fmtM(Math.abs(uplift))} / yr`} note={`staying at ${EXEC_BASE}%`} />

                <WFRow label="Net revenue (after ramp costs)" cur={fmtM(cur.net)} tgt={fmtM(tgt.net)} delta={fmtD(uplift)} note="total adjusted" isTotal />
              </tbody>
            </table>
          </div>
        </div>

        {/* What SMH fixes */}
        {smhFixes.length > 0 && (
          <div style={{ ...card, ...sp }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>What SMH directly addresses at {exec}% execution</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {smhFixes.map(f => (
                <div key={f.title} style={{ background: "#F8FAFC", borderLeft: "2px solid #0a1f3d", borderRadius: "0 8px 8px 0", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0a1f3d" }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, margin: 0 }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email CTA */}
        <div style={{ ...card, ...sp, background: "#F8FAFC" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0a1f3d", marginBottom: 4 }}>Get this as a board-ready report</div>
          <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 14 }}>We'll email the full scenario model with SMH pricing tailored to your team size and a projected payback timeline — within 24 hours.</div>
          {!emailSent ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ flex: 1, border: "0.5px solid #CBD5E1", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0a1f3d", outline: "none", background: "white" }} onKeyDown={e => e.key === "Enter" && submitEmail()} />
              <button onClick={submitEmail} style={{ background: "#0a1f3d", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Send report</button>
            </div>
          ) : (
            <div style={{ padding: "12px 16px", background: "#E1F5EE", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#085041" }}>✓ On its way. Ashraf will be in touch within 24 hours.</div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => { window.location.href = "/"; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94A3B8", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            <RotateCcw style={{ width: 13, height: 13 }} /> Start over
          </button>
        </div>
      </div>
    </div>
  );
}
