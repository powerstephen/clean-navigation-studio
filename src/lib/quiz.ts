export type Question = {
  id: string;
  category: string;
  topic: string;
  prompt: string;
  helper?: string;
};

export const CATEGORIES = [
  { id: "close-rate", label: "Close Rate" },
  { id: "sales-cycle", label: "Sales Cycle" },
  { id: "asp", label: "Average Sales Price" },
  { id: "forecasting", label: "Forecasting" },
] as const;

export const QUESTIONS: Question[] = [
  // Close Rate
  {
    id: "qualification",
    category: "Close Rate",
    topic: "Qualification",
    prompt: "How well do your reps qualify deals before they enter pipeline?",
    helper: "1 = pipeline is full of unqualified deals · 10 = every deal is rigorously qualified",
  },
  {
    id: "zombie",
    category: "Close Rate",
    topic: "Zombie Pipeline",
    prompt: "Do reps close out stale deals so pipeline isn't full of deals that will never close?",
    helper: "1 = zombies everywhere · 10 = pipeline is constantly groomed",
  },
  {
    id: "methodology",
    category: "Close Rate",
    topic: "Sales Methodology",
    prompt: "How well-adopted is your sales methodology (BANT, MEDDIC, MEDDPICC, etc.)?",
    helper: "1 = no methodology · 10 = used consistently across the team",
  },
  {
    id: "process",
    category: "Close Rate",
    topic: "Pipeline Process",
    prompt: "Do you have a documented sales process with entry/exit criteria at each stage?",
    helper: "1 = nothing documented · 10 = clear, enforced criteria per stage",
  },
  {
    id: "adoption",
    category: "Close Rate",
    topic: "Process Adoption",
    prompt: "Do reps execute the sales process consistently on every deal in CRM?",
    helper: "1 = inconsistent · 10 = consistent and visible in Salesforce",
  },
  {
    id: "visibility",
    category: "Close Rate",
    topic: "Deal Visibility",
    prompt: "Do you have CRM fields (MEDDPICC, risks, etc.) that reps actually fill out?",
    helper: "1 = no visibility · 10 = full deal context in CRM",
  },

  // Sales Cycle
  {
    id: "speed",
    category: "Sales Cycle",
    topic: "Speed",
    prompt: "Are reps doing all the right things to close deals as fast as possible?",
    helper: "1 = lots of dead time · 10 = momentum on every deal",
  },
  {
    id: "pushed",
    category: "Sales Cycle",
    topic: "Pushed Deals",
    prompt: "How rarely do deals get pushed and miss the month or quarter?",
    helper: "1 = constantly slipping · 10 = rarely pushed",
  },
  {
    id: "time-to-lose",
    category: "Sales Cycle",
    topic: "Time to Lose",
    prompt: "Do you know how long it takes to lose a deal — and walk away in time?",
    helper: "1 = deals linger forever · 10 = clear walk-away signals",
  },

  // ASP
  {
    id: "upside",
    category: "Average Sales Price",
    topic: "Upside",
    prompt: "How well are you capturing the upside on larger deals?",
    helper: "1 = lots of room left · 10 = consistently landing bigger deals",
  },
  {
    id: "stakeholders",
    category: "Average Sales Price",
    topic: "Stakeholders",
    prompt: "Do reps consistently engage the right stakeholders on bigger deals?",
    helper: "1 = single-threaded · 10 = multi-threaded with execs",
  },
  {
    id: "process-fit",
    category: "Average Sales Price",
    topic: "Process Fit",
    prompt: "Is your sales process built for the kind of deals you sell?",
    helper: "1 = mismatch · 10 = tailored to strategic + transactional motion",
  },

  // Forecasting
  {
    id: "forecast-process",
    category: "Forecasting",
    topic: "Forecasting Process",
    prompt: "How mature is your forecasting process today?",
    helper: "1 = none · 10 = structured, deal-by-deal + weighted + AI assist",
  },
  {
    id: "accuracy",
    category: "Forecasting",
    topic: "Accuracy",
    prompt: "How accurate is your forecast versus actuals?",
    helper: "1 = miss badly · 10 = within a few % every quarter",
  },
  {
    id: "frequency",
    category: "Forecasting",
    topic: "Frequency",
    prompt: "How often do you forecast and reforecast?",
    helper: "1 = rarely · 10 = continuously updated",
  },
  {
    id: "doc",
    category: "Forecasting",
    topic: "Documentation",
    prompt: "Do you have a defined and documented forecasting process?",
    helper: "1 = nothing written · 10 = clear, shared playbook",
  },
  {
    id: "actual-forecast",
    category: "Forecasting",
    topic: "Visible Forecast",
    prompt: "Can leadership actually see the forecast at any time?",
    helper: "1 = lives in someone's head · 10 = always visible & current",
  },
];

const STORAGE_KEY = "pipeline-quiz-answers-v1";

export function loadAnswers(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveAnswer(id: string, value: number) {
  const all = loadAnswers();
  all[id] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearAnswers() {
  localStorage.removeItem(STORAGE_KEY);
}

export function scoreFor(answers: Record<string, number>) {
  const answered = QUESTIONS.filter((q) => typeof answers[q.id] === "number");
  const sum = answered.reduce((a, q) => a + (answers[q.id] || 0), 0);
  const max = QUESTIONS.length * 10;
  const pct = Math.round((sum / max) * 100);
  return { sum, max, pct, answered: answered.length, total: QUESTIONS.length };
}

export function categoryScores(answers: Record<string, number>) {
  return CATEGORIES.map((c) => {
    const qs = QUESTIONS.filter((q) => q.category === c.label);
    const vals = qs.map((q) => answers[q.id]).filter((v) => typeof v === "number") as number[];
    const sum = vals.reduce((a, b) => a + b, 0);
    const max = qs.length * 10;
    return {
      ...c,
      sum,
      max,
      pct: max ? Math.round((sum / max) * 100) : 0,
      answered: vals.length,
      total: qs.length,
    };
  });
}

export function tierFor(pct: number) {
  if (pct >= 80) return { label: "Best in class", tone: "mint", blurb: "Your pipeline & forecasting motion is dialed in. Keep optimizing the edges." };
  if (pct >= 60) return { label: "On track", tone: "emerald", blurb: "Solid foundation. A few targeted fixes will compound quickly." };
  if (pct >= 40) return { label: "Needs work", tone: "amber", blurb: "Real gaps to close. Prioritize visibility and process adoption first." };
  return { label: "Critical gaps", tone: "rose", blurb: "Pipeline can't be trusted yet. Start with qualification & process basics." };
}
