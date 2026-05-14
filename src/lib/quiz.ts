// SMH Revenue Gap Calculator — calculation engine

const STORAGE_KEY = "smh-roi-v1";

export type RoiContext = {
  revenueTarget: number;    // annual revenue target £
  quotaAttainPct: number;   // % of reps hitting quota (0-100)
  rampMonths: number;       // average ramp time in months
  executionScore: number;   // from Methodology Finder (0-100)
  methodology: string;      // recommended methodology name
  role: string;             // from Methodology Finder
  teamSize: number;         // number of reps
};

export const DEFAULT_CONTEXT: RoiContext = {
  revenueTarget: 5000000,
  quotaAttainPct: 55,
  rampMonths: 5,
  executionScore: 38,
  methodology: "MEDDIC",
  role: "CRO / VP Sales",
  teamSize: 10,
};

export function saveContext(ctx: RoiContext) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ctx)); } catch {}
}

export function loadContext(): RoiContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTEXT;
    return { ...DEFAULT_CONTEXT, ...JSON.parse(raw) };
  } catch { return DEFAULT_CONTEXT; }
}

export function clearContext() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ── Core calculation engine ───────────────────────────────────────────────────

export type UpliftResult = {
  quotaUplift: number;
  winRateUplift: number;
  rampUplift: number;
  totalUplift: number;
  newQuotaAttain: number;
  winRateGainPp: number;
  rampReductionMonths: number;
  currentRevenue: number;
  revenueGap: number;
};

export function computeUplift(ctx: RoiContext, targetExec: number): UpliftResult {
  const execGain = Math.max(0, (targetExec - ctx.executionScore) / 100);

  // 1. Quota attainment uplift
  // Every 10pp execution improvement drives ~5.5pp attainment improvement
  const attainGainPp = execGain * 55;
  const newAttain = Math.min(ctx.quotaAttainPct + attainGainPp, 100);
  const currentRevenue = ctx.revenueTarget * (ctx.quotaAttainPct / 100);
  const targetRevenue = ctx.revenueTarget * (newAttain / 100);
  const quotaUplift = Math.max(0, targetRevenue - currentRevenue);

  // 2. Win rate uplift
  // Methodology execution improvement drives win rate gain
  // Base win rate estimated from quota attainment and execution score
  const baseWinRate = 15 + (ctx.executionScore / 100) * 20;
  const winRateGainPp = execGain * 18;
  const newWinRate = Math.min(baseWinRate + winRateGainPp, 65);
  // Pipeline value estimated as 2.5x current revenue
  const pipelineValue = currentRevenue * 2.5;
  const winRateUplift = Math.max(0, pipelineValue * (winRateGainPp / 100) * 0.35);

  // 3. Ramp time uplift
  // Structured methodology cuts ramp time proportionally to execution gain
  const rampReductionMonths = execGain * ctx.rampMonths * 0.45;
  const newRamp = Math.max(1, ctx.rampMonths - rampReductionMonths);
  const quotaPerRep = ctx.revenueTarget / Math.max(ctx.teamSize, 1);
  const rampUplift = Math.max(0, (rampReductionMonths / 12) * quotaPerRep * ctx.teamSize * 0.28);

  const totalUplift = quotaUplift + winRateUplift + rampUplift;
  const revenueGap = Math.max(0, ctx.revenueTarget - currentRevenue);

  return {
    quotaUplift,
    winRateUplift,
    rampUplift,
    totalUplift,
    newQuotaAttain: Math.round(newAttain),
    winRateGainPp: Math.round(winRateGainPp * 10) / 10,
    rampReductionMonths: Math.round(rampReductionMonths * 10) / 10,
    currentRevenue,
    revenueGap,
  };
}

export function formatCurrency(n: number): string {
  if (!isFinite(n)) return "£0";
  const abs = Math.abs(n);
  const prefix = n < 0 ? "-" : "+";
  if (abs >= 1_000_000) return `${prefix}£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${prefix}£${Math.round(abs / 1_000)}K`;
  return `${prefix}£${Math.round(abs)}`;
}

export function formatCurrencyPlain(n: number): string {
  if (!isFinite(n)) return "£0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `£${Math.round(abs / 1_000)}K`;
  return `£${Math.round(abs)}`;
}

export function tierFor(score: number): { label: string; hex: string; bg: string; color: string } {
  if (score < 35) return { label: "Critical gaps", hex: "#DC2626", bg: "#FEF2F2", color: "#A32D2D" };
  if (score < 55) return { label: "Inconsistent", hex: "#D97706", bg: "#FFFBEB", color: "#854F0B" };
  if (score < 70) return { label: "Developing", hex: "#0E7C7B", bg: "#ECFEFF", color: "#0F6E56" };
  if (score < 85) return { label: "Strong", hex: "#1D9E75", bg: "#E1F5EE", color: "#085041" };
  return { label: "Best in class", hex: "#16A34A", bg: "#EAF3DE", color: "#27500A" };
}

// Role-specific framing
export function roleFraming(role: string): { headline: string; sub: string } {
  const r = role.toLowerCase();
  if (r.includes("founder") || r.includes("ceo")) return {
    headline: "You're still in too many deals. Here's what that's costing you.",
    sub: "We already know your execution score and methodology. Three more inputs and we can show you the exact revenue gap — and what fixing it unlocks.",
  };
  if (r.includes("cro") || r.includes("vp")) return {
    headline: "You know what the number should be. Here's what's standing between you and it.",
    sub: "We already know your execution score and methodology. Three more inputs and we can model your exact revenue gap across quota attainment, win rate and ramp time.",
  };
  if (r.includes("manager") || r.includes("head of sales")) return {
    headline: "You can see which reps are struggling. Here's what it's worth to fix it.",
    sub: "We already know your execution score and methodology. Three more inputs and we'll show you the revenue gap — and what closing it means for your team.",
  };
  if (r.includes("enablement") || r.includes("revops") || r.includes("ops")) return {
    headline: "You've built the playbook. Here's what inconsistent adoption is costing.",
    sub: "We already know your execution score and methodology. Three more inputs and we'll quantify the gap between training and execution.",
  };
  return {
    headline: "Here's what your execution gap is actually costing you.",
    sub: "We already know your execution score and methodology. Three more inputs and we'll model your exact revenue gap.",
  };
}
