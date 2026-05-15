import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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

function execToMetrics(base: { att: number; wr: number; acv: number; ramp: number }, exec: number): Metrics {
  const gain = Math.max(0, (exec - EXEC_BASE) / 100);
  return {
    att: Math.min(100, base.att + gain * 45),
    wr: Math.min(80, base.wr + gain * 18),
    acv: Math.round(base.acv * (1 + gain * 0.12)),
    ramp: Math.max(1, base.ramp * (1 - gain * 0.42)),
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
  const dealsPerRep = (quota * (m.att / 100)) / Math.max(1, m.acv);
  const pipeReq = attRev / Math.max(0.01, m.wr / 100);
  const rampLoss = (m.ramp / 12) * quota * reps * 0.20;
  const payback = m.ramp * 1.3;
  const teamRampCost = (m.ramp / 12) * quota * Math.max(1, Math.round(reps * 0.2)) * 0.25;
  const net = attRev - rampLoss;
  const rpr = net / reps;
  return { totQ, attRev, missedCost, dealsPerRep, pipeReq, rampLoss, payback, teamRampCost, net, rpr };
}

type TabId = "revenue" | "attainment" | "winrate" | "ramp";

function DRow({ label, cur, tgt, delta, note, posGood = true }: {
  label: string; cur?: string; tgt?: string; delta?: string; note?: string; posGood?: boolean;
}) {
  const isPos = delta?.startsWith("+");
  const isNeg = delta?.startsWith("-");
  const dColor = !delta || delta === "—" ? "#64748B"
    : isPos ? (posGood ? "#16A34A" : "#DC2626")
    : isNeg ? (posGood ? "#DC2626" : "#16A34A") : "#64748B";

  return (
    <tr>
      <td style={{ padding: "9px 12px", borderBottom: "0.5px solid #F1F5F9", fontSize: 12, color: "#475569" }}>{label}</td>
      <td style={{ padding: "9px 12px", borderBottom: "0.5px solid #F1F5F9", fontSize: 13, color: "#0a1f3d", textAlign: "right" }}>{cur ?? "—"}</td>
      <td style={{ padding: "9px 12px", borderBottom: "0.5px solid #F1F5F9", fontSize: 13, color: "#0a1f3d", textAlign: "right" }}>{tgt ?? "—"}</td>
      <td style={{ padding: "9px 12px", borderBottom: "0.5px solid #F1F5F9", fontSize: 13, fontWeight: 500, color: dColor, textAlign: "right" }}>{delta ?? "—"}</td>
      <td style={{ padding: "9px 12px", borderBottom: "0.5px solid #F1F5F9", fontSize: 11, color: "#94A3B8" }}>{note ?? ""}</td>
    </tr>
  );
}

function GRow({ label }: { label: string }) {
  return (
    <tr style={{ background: "#F8FAFC" }}>
      <td colSpan={5} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 500, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</td>
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
  const [tab, setTab] = useState<TabId>("revenue");
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const c = loadContext();
    setCtx(c);
    setExec(Math.min((c.executionScore || EXEC_BASE) + 20, 95));
    if (c.teamSize) setReps(c.teamSize);
    if (c.revenueTarget && c.teamSize) setQuota(Math.round(c.revenueTarget / c.teamSize));
    if (c.quotaAttainPct) setAtt(c.quotaAttainPct);
    if (c.rampMonths) setRamp(c.rampMonths);
  }, []);

  const baseExecScore = ctx.executionScore || EXEC_BASE;
  const curM: Metrics = { att, wr, acv, ramp };
  const tgtM = execToMetrics(curM, exec);
  const cur = compute(reps, quota, curM);
  const tgt = compute(reps, quota, tgtM);
  const uplift = tgt.net - cur.net;
  const t = tier(exec);
  const wrUplift = Math.max(0, (tgtM.wr - wr) / 100 * cur.pipeReq * 0.35);

  const inp = {
    width: "100%", border: "0.5px solid #CBD5E1", borderRadius: 8,
    padding: "8px 12px", fontSize: 15, fontWeight: 500, color: "#0a1f3d",
    outline: "none", boxSizing: "border-box" as const, background: "white",
  };

  const submitEmail = async () => {
    if (!email || !email.includes("@")) return;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (url && key) {
      fetch(`${url}/rest/v1/roi_requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
        body: JSON.stringify({
          email, execution_score: baseExecScore, methodology: ctx.methodology,
          reps, quota_per_rep: quota, attainment_pct: att, win_rate: wr,
          ramp_months: ramp, target_exec: exec, total_uplift: Math.round(uplift),
          created_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
    setEmailSent(true);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "revenue", label: "Revenue summary" },
    { id: "attainment", label: "Quota attainment" },
    { id: "winrate", label: "Win rate & deals" },
    { id: "ramp", label: "Ramp & productivity" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Sales Methodology Hub</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#0a1f3d" }}>Revenue scenario planner</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 16px", borderRadius: 20, background: tier(baseExecScore).bg, color: tier(baseExecScore).col }}>
            {baseExecScore}% execution — {tier(baseExecScore).label.toLowerCase()}
          </span>
        </div>

        {/* Team inputs — outside the dashboard */}
        <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Your team</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {[
              { label: "No. of reps", val: reps, set: setReps, step: 1, min: 1, hint: "e.g. 10" },
              { label: "Quota / rep (£)", val: quota, set: setQuota, step: 10000, min: 10000, hint: "e.g. 400000" },
              { label: "Attainment %", val: att, set: setAtt, step: 1, min: 1, hint: "e.g. 55" },
              { label: "ACV (£)", val: acv, set: setAcv, step: 1000, min: 1000, hint: "e.g. 50000" },
              { label: "Win rate %", val: wr, set: setWr, step: 1, min: 1, hint: "e.g. 22" },
              { label: "Ramp (months)", val: ramp, set: setRamp, step: 1, min: 1, hint: "e.g. 5" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</div>
                <input style={inp} type="number" value={f.val} step={f.step} min={f.min}
                  placeholder={f.hint}
                  onChange={e => f.set(Math.max(f.min, +e.target.value || f.min))} />
              </div>
            ))}
          </div>
        </div>

        {/* CENTREPIECE DASHBOARD — dark navy */}
        <div style={{ background: "#0a1f3d", borderRadius: 16, padding: "2rem", marginBottom: 16, boxShadow: "0 8px 40px rgba(10,31,61,0.25)" }}>

          {/* Dashboard header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Revenue Control Centre
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Methodology:</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "white", background: "rgba(255,255,255,0.1)", padding: "3px 12px", borderRadius: 20 }}>
                {ctx.methodology || "MEDDIC"}
              </span>
            </div>
          </div>

          {/* 4 metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
            {[
              { label: "Team revenue now", val: fmtM(cur.net), sub: `${reps} reps · ${Math.round(att)}% attainment`, color: "white", accent: "rgba(255,255,255,0.5)" },
              { label: "At target execution", val: fmtM(tgt.net), sub: `${exec}% execution score`, color: "#22C55E", accent: "rgba(34,197,94,0.5)" },
              { label: "Revenue gap to quota", val: fmtM(cur.totQ - cur.attRev), sub: "vs full quota potential", color: "#F87171", accent: "rgba(248,113,113,0.5)" },
              { label: "Revenue per rep", val: fmtM(cur.rpr), sub: `${fmtM(tgt.rpr)} at target`, color: "white", accent: "rgba(255,255,255,0.5)" },
            ].map(m => (
              <div key={m.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "1.1rem", border: "0.5px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: m.color, lineHeight: 1, marginBottom: 6 }}>{m.val}</div>
                <div style={{ fontSize: 11, color: m.accent }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)", marginBottom: 24 }} />

          {/* Revenue unlocked — big hero number */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Revenue unlocked at {exec}% execution</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: uplift >= 0 ? "#22C55E" : "#F87171", lineHeight: 1, letterSpacing: "-1px" }}>
              {uplift >= 0 ? "+" : ""}{fmtM(uplift)}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              across quota attainment, win rate and ramp time
            </div>
          </div>

          {/* THE SLIDER */}
          <div style={{ padding: "0 0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Current <strong style={{ color: "white" }}>{baseExecScore}%</strong></span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>→ Target <strong style={{ fontSize: 20, color: t.hex }}>{exec}%</strong></span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: t.bg, color: t.col }}>{t.label}</span>
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Drag to model</span>
            </div>

            <input
              type="range"
              min={baseExecScore}
              max={95}
              value={exec}
              step={1}
              onChange={e => setExec(+e.target.value)}
              style={{ width: "100%", cursor: "pointer", accentColor: "#22C55E", height: 6 }}
            />

            {/* Milestone markers */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 4 }}>
              {[
                { s: baseExecScore, l: `${baseExecScore}% current`, bg: "rgba(255,255,255,0.08)", c: "rgba(255,255,255,0.4)" },
                { s: 55, l: "55% developing", bg: "rgba(217,119,6,0.15)", c: "#D97706" },
                { s: 70, l: "70% strong", bg: "rgba(14,124,123,0.15)", c: "#0E7C7B" },
                { s: 85, l: "85% best in class", bg: "rgba(22,163,74,0.15)", c: "#16A34A" },
              ].filter(m => m.s > baseExecScore || m.s === baseExecScore).map(m => (
                <span key={m.s} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 8, background: m.bg, color: m.c }}>{m.l}</span>
              ))}
            </div>
          </div>

          {/* Mini uplift breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 24 }}>
            {[
              { label: "Quota attainment", val: fmtD(tgt.attRev - cur.attRev) },
              { label: "Win rate gain", val: fmtD(wrUplift) },
              { label: "Ramp savings", val: fmtD(cur.rampLoss - tgt.rampLoss) },
            ].map(m => (
              <div key={m.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.875rem", textAlign: "center", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: m.val.startsWith("+") ? "#22C55E" : m.val === "—" ? "rgba(255,255,255,0.3)" : "#F87171" }}>{m.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABBED DRILL-DOWN */}
        <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>

          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "0.5px solid #E2E8F0", overflowX: "auto" }}>
            {tabs.map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ padding: "14px 20px", fontSize: 13, fontWeight: tab === tb.id ? 600 : 400, color: tab === tb.id ? "#0a1f3d" : "#64748B", background: "none", border: "none", borderBottom: tab === tb.id ? "2px solid #0a1f3d" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s" }}>
                {tb.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "1.5rem" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Metric", "Current", `Target (${exec}%)`, "Delta", "Notes"].map((h, i) => (
                      <th key={h} style={{ padding: "8px 12px", borderBottom: "1px solid #E2E8F0", fontSize: 11, fontWeight: 500, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 0 ? "left" : "right", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tab === "revenue" && <>
                    <GRow label="Team output" />
                    <DRow label="Total quota capacity" cur={fmtM(cur.totQ)} tgt={fmtM(tgt.totQ)} note="reps × quota" />
                    <DRow label="Revenue from attainment" cur={fmtM(cur.attRev)} tgt={fmtM(tgt.attRev)} delta={fmtD(tgt.attRev - cur.attRev)} note="quota × attainment %" />
                    <DRow label="Win rate revenue uplift" tgt={fmtM(wrUplift)} delta={fmtD(wrUplift)} note="from qualification improvement" />
                    <DRow label="Ramp cost saving" tgt={fmtM(cur.rampLoss - tgt.rampLoss)} delta={fmtD(cur.rampLoss - tgt.rampLoss)} note="faster onboarding" />
                    <GRow label="Efficiency" />
                    <DRow label="Revenue per rep" cur={fmtM(cur.rpr)} tgt={fmtM(tgt.rpr)} delta={fmtD(tgt.rpr - cur.rpr)} note="key CRO metric" />
                    <DRow label="Annual cost of execution gap" cur={fmtM(Math.abs(uplift))} note={`staying at ${baseExecScore}% execution`} />
                    <GRow label="Net" />
                    <DRow label="Net revenue (after ramp costs)" cur={fmtM(cur.net)} tgt={fmtM(tgt.net)} delta={fmtD(uplift)} note="total adjusted" />
                  </>}

                  {tab === "attainment" && <>
                    <GRow label="Quota performance" />
                    <DRow label="Quota attainment %" cur={`${Math.round(att)}%`} tgt={`${Math.round(tgtM.att)}%`} delta={fmtPp(tgtM.att - att)} note="exec drives consistency" />
                    <DRow label="Reps hitting quota" cur={`${Math.round(reps * att / 100 * 10) / 10}`} tgt={`${Math.round(reps * tgtM.att / 100 * 10) / 10}`} delta={fmtPp(tgtM.att - att)} note={`of ${reps} total reps`} />
                    <DRow label="Cost of missed reps" cur={fmtM(cur.missedCost)} tgt={fmtM(tgt.missedCost)} delta={fmtD(tgt.missedCost - cur.missedCost)} posGood={false} note="underattainment × quota" />
                    <DRow label="Revenue from attainment" cur={fmtM(cur.attRev)} tgt={fmtM(tgt.attRev)} delta={fmtD(tgt.attRev - cur.attRev)} note="total quota × attainment" />
                    <GRow label="What drives this" />
                    <DRow label="Avg rep attainment" cur={`${Math.round(att)}%`} tgt={`${Math.round(tgtM.att)}%`} delta={fmtPp(tgtM.att - att)} note="MEDDIC qualification" />
                    <DRow label="Gap between top and avg rep" cur={`~${Math.round((100 - att) * 0.4)}pp`} tgt={`~${Math.round((100 - tgtM.att) * 0.4)}pp`} delta={fmtPp((tgtM.att - att) * 0.4)} note="consistency improvement" />
                  </>}

                  {tab === "winrate" && <>
                    <GRow label="Win rate" />
                    <DRow label="Win rate" cur={`${Math.round(wr)}%`} tgt={`${Math.round(tgtM.wr)}%`} delta={fmtPp(tgtM.wr - wr)} note="methodology qualification" />
                    <DRow label="ACV" cur={fmtM(acv)} tgt={fmtM(tgtM.acv)} delta={fmtD(tgtM.acv - acv)} note="multi-threading uplift" />
                    <DRow label="Deals closed / rep / yr" cur={`${Math.round(cur.dealsPerRep * 10) / 10}`} tgt={`${Math.round(tgt.dealsPerRep * 10) / 10}`} delta={fmtPp(tgt.dealsPerRep - cur.dealsPerRep)} note="quota ÷ acv × attainment" />
                    <GRow label="Pipeline" />
                    <DRow label="Pipeline required to hit target" cur={fmtM(cur.pipeReq)} tgt={fmtM(tgt.pipeReq)} delta={fmtD(tgt.pipeReq - cur.pipeReq)} posGood={false} note="revenue ÷ win rate" />
                    <DRow label="Pipeline coverage needed" cur={`${Math.round(cur.pipeReq / cur.attRev * 10) / 10}x`} tgt={`${Math.round(tgt.pipeReq / tgt.attRev * 10) / 10}x`} delta={fmtPp((tgt.pipeReq / tgt.attRev) - (cur.pipeReq / cur.attRev))} posGood={false} note="at current close rate" />
                    <DRow label="Win rate revenue uplift" tgt={fmtM(wrUplift)} delta={fmtD(wrUplift)} note="incremental from wr gain" />
                  </>}

                  {tab === "ramp" && <>
                    <GRow label="Ramp efficiency" />
                    <DRow label="Ramp time to full productivity" cur={fmtMo(ramp)} tgt={fmtMo(tgtM.ramp)} delta={fmtDMo(tgtM.ramp - ramp)} posGood={false} note="structured onboarding" />
                    <DRow label="Productivity loss / new hire" cur={fmtM(cur.rampLoss / reps)} tgt={fmtM(tgt.rampLoss / reps)} delta={fmtD(tgt.rampLoss / reps - cur.rampLoss / reps)} posGood={false} note="ramp ÷ 12 × quota × 20%" />
                    <DRow label="Payback on new hire" cur={fmtMo(cur.payback)} tgt={fmtMo(tgt.payback)} delta={fmtDMo(tgt.payback - cur.payback)} posGood={false} note="months to net positive" />
                    <DRow label="Annual team ramp cost" cur={fmtM(cur.teamRampCost)} tgt={fmtM(tgt.teamRampCost)} delta={fmtD(tgt.teamRampCost - cur.teamRampCost)} posGood={false} note="20% attrition assumed" />
                    <GRow label="Scale impact" />
                    <DRow label="Cost of hiring 2 new reps now" cur={fmtM(cur.rampLoss / reps * 2)} tgt={fmtM(tgt.rampLoss / reps * 2)} delta={fmtD((tgt.rampLoss - cur.rampLoss) / reps * 2)} posGood={false} note="ramp cost × 2 hires" />
                    <DRow label="Monthly productivity recovered" tgt={fmtM((cur.rampLoss - tgt.rampLoss) / 12)} delta={fmtD((cur.rampLoss - tgt.rampLoss) / 12)} note="per month saved" />
                  </>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Email CTA */}
        <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 12, padding: "1.5rem" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0a1f3d", marginBottom: 4 }}>Get this as a board-ready report</div>
          <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55, marginBottom: 14 }}>We'll email the full scenario model with SMH pricing for your team size and a projected payback timeline — within 24 hours.</div>
          {!emailSent ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{ flex: 1, border: "0.5px solid #CBD5E1", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#0a1f3d", outline: "none", background: "white" }}
                onKeyDown={e => e.key === "Enter" && submitEmail()} />
              <button onClick={submitEmail} style={{ background: "#0a1f3d", color: "white", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                Send report
              </button>
            </div>
          ) : (
            <div style={{ padding: "12px 16px", background: "#E1F5EE", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#085041" }}>
              ✓ On its way. Ashraf will be in touch within 24 hours.
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => { window.location.href = "/"; }} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94A3B8", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}>
            <RotateCcw style={{ width: 13, height: 13 }} /> Start over
          </button>
        </div>

      </div>
    </div>
  );
}
