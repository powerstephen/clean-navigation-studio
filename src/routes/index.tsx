import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { loadContext, saveContext, roleFraming, tierFor, type RoiContext, DEFAULT_CONTEXT } from "@/lib/quiz";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Revenue Gap Calculator — Sales Methodology Hub" },
      {
        name: "description",
        content: "See what your execution gap is costing you — and what closing it is worth.",
      },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<RoiContext>(DEFAULT_CONTEXT);
  const [errors, setErrors] = useState<Partial<Record<keyof RoiContext, string>>>({});

  useEffect(() => {
    setCtx(loadContext());
  }, []);

  const upd = (k: keyof RoiContext, v: string) => {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    setCtx(c => ({ ...c, [k]: isFinite(n) ? n : 0 }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof RoiContext, string>> = {};
    if (!ctx.revenueTarget || ctx.revenueTarget < 10000) e.revenueTarget = "Enter a valid revenue target";
    if (!ctx.quotaAttainPct || ctx.quotaAttainPct < 1 || ctx.quotaAttainPct > 100) e.quotaAttainPct = "Enter a % between 1 and 100";
    if (!ctx.rampMonths || ctx.rampMonths < 1) e.rampMonths = "Enter ramp time in months";
    return e;
  };

  const start = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    saveContext(ctx);
    navigate({ to: "/results" });
  };

  const framing = roleFraming(ctx.role);
  const tier = tierFor(ctx.executionScore);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-foreground">
      <div className="mx-auto max-w-[680px] px-6 py-12">

        {/* Header */}
        <div style={{ background: "#0a1f3d", borderRadius: 12, padding: "1.75rem 2rem", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            Sales Methodology Hub · Revenue Gap Calculator
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "white", lineHeight: 1.3, marginBottom: 10 }}>
            {framing.headline}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
            {framing.sub}
          </p>
        </div>

        {/* Execution score + methodology from Methodology Finder */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Your execution score</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: tier.hex, lineHeight: 1 }}>{ctx.executionScore}%</div>
            <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: tier.bg, color: tier.color }}>{tier.label}</span>
          </div>
          <div style={{ background: "white", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "1.25rem" }}>
            <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Recommended methodology</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "#0a1f3d", lineHeight: 1.2, marginTop: 4 }}>{ctx.methodology}</div>
            <span style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: "#E1F5EE", color: "#085041" }}>Matched to your profile</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderLeft: "3px solid #0a1f3d", paddingLeft: 14, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>
            Three more questions to calculate your exact revenue gap. These are the numbers that make the model accurate — take 60 seconds to get them right.
          </p>
        </div>

        {/* 3 Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>

          {/* Q1 — Revenue target */}
          <div style={{ background: "white", border: `0.5px solid ${errors.revenueTarget ? "#DC2626" : "#E2E8F0"}`, borderRadius: 10, padding: "1.25rem" }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#0a1f3d", display: "block", marginBottom: 4 }}>
              What is your annual revenue target?
            </label>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>The number you're accountable for delivering this year.</p>
            <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #CBD5E1", borderRadius: 8, overflow: "hidden" }}>
              <span style={{ padding: "10px 14px", background: "#F8FAFC", color: "#64748B", fontSize: 14, borderRight: "0.5px solid #CBD5E1" }}>£</span>
              <input
                type="number"
                value={ctx.revenueTarget || ""}
                onChange={e => upd("revenueTarget", e.target.value)}
                placeholder="e.g. 5000000"
                style={{ flex: 1, padding: "10px 14px", fontSize: 16, fontWeight: 500, color: "#0a1f3d", border: "none", outline: "none", background: "white" }}
              />
            </div>
            {errors.revenueTarget && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{errors.revenueTarget}</p>}
          </div>

          {/* Q2 — Quota attainment */}
          <div style={{ background: "white", border: `0.5px solid ${errors.quotaAttainPct ? "#DC2626" : "#E2E8F0"}`, borderRadius: 10, padding: "1.25rem" }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#0a1f3d", display: "block", marginBottom: 4 }}>
              What % of your reps are hitting quota right now?
            </label>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>The honest number — industry benchmark is 60–65%.</p>
            <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #CBD5E1", borderRadius: 8, overflow: "hidden" }}>
              <input
                type="number"
                value={ctx.quotaAttainPct || ""}
                onChange={e => upd("quotaAttainPct", e.target.value)}
                placeholder="e.g. 55"
                min="1"
                max="100"
                style={{ flex: 1, padding: "10px 14px", fontSize: 16, fontWeight: 500, color: "#0a1f3d", border: "none", outline: "none", background: "white" }}
              />
              <span style={{ padding: "10px 14px", background: "#F8FAFC", color: "#64748B", fontSize: 14, borderLeft: "0.5px solid #CBD5E1" }}>%</span>
            </div>
            {errors.quotaAttainPct && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{errors.quotaAttainPct}</p>}
          </div>

          {/* Q3 — Ramp time */}
          <div style={{ background: "white", border: `0.5px solid ${errors.rampMonths ? "#DC2626" : "#E2E8F0"}`, borderRadius: 10, padding: "1.25rem" }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#0a1f3d", display: "block", marginBottom: 4 }}>
              How many months before a new rep hits full productivity?
            </label>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>From day one to running deals independently at full quota.</p>
            <div style={{ display: "flex", alignItems: "center", border: "0.5px solid #CBD5E1", borderRadius: 8, overflow: "hidden" }}>
              <input
                type="number"
                value={ctx.rampMonths || ""}
                onChange={e => upd("rampMonths", e.target.value)}
                placeholder="e.g. 5"
                min="1"
                max="24"
                style={{ flex: 1, padding: "10px 14px", fontSize: 16, fontWeight: 500, color: "#0a1f3d", border: "none", outline: "none", background: "white" }}
              />
              <span style={{ padding: "10px 14px", background: "#F8FAFC", color: "#64748B", fontSize: 14, borderLeft: "0.5px solid #CBD5E1" }}>months</span>
            </div>
            {errors.rampMonths && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{errors.rampMonths}</p>}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={start}
          style={{ width: "100%", background: "#0a1f3d", color: "white", border: "none", borderRadius: 10, padding: "15px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          Calculate my revenue gap
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#94A3B8", marginTop: 12 }}>
          Takes under 60 seconds · salesmethodologyhub.com
        </p>
      </div>
    </div>
  );
}
