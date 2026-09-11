import type { DaySummary } from "@/lib/samsung-health-import";

export const STEP_GOAL = 6000;
export const MIN_GOAL = 30;
export const KCAL_GOAL = 400;
export const WATER_GOAL = 2000;
export const WATER_STEP = 250;
export const SAMPLE_ZIP = "/fixtures/sample-samsung-health.zip";

export type WatchTab = "overview" | "activity" | "sleep" | "heart" | "mindfulness" | "food";
export type StatusKind = "excellent" | "fair" | "attention";
export type WeekPoint = { date: string; day?: DaySummary };

export const WATCH_TABS: { id: WatchTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "sleep", label: "Sleep" },
  { id: "heart", label: "Heart" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "food", label: "Food" },
];

export function statusFromScore(score: number): StatusKind {
  if (score >= 80) return "excellent";
  if (score >= 60) return "fair";
  return "attention";
}

export function statusLabel(kind: StatusKind) {
  if (kind === "excellent") return "Excellent";
  if (kind === "fair") return "Fair";
  return "Attention";
}

export function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

export function formatMinutes(mins: number) {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h <= 0) return `${r}m`;
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function formatClockFromTs(ts?: number) {
  if (!ts) return "--:--";
  const d = new Date(ts);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? "AM" : "PM"}`;
}

export function weekdayShort(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function prettyDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function waterMl(day?: DaySummary) {
  return (day?.water ?? []).reduce((sum, w) => sum + w.amountMl, 0);
}

export function foodKcal(day?: DaySummary) {
  return (day?.food ?? []).reduce((sum, f) => sum + f.calories, 0);
}

export function energyScore(day?: DaySummary) {
  if (!day) return 0;
  const sleep =
    day.sleep?.score ??
    clamp(day.sleep?.durationMinutes ? day.sleep.durationMinutes / 480 : 0) * 100;
  const steps = clamp(day.steps / STEP_GOAL) * 100;
  const mins = clamp(day.activeMinutes / MIN_GOAL) * 100;
  return Math.round(sleep * 0.45 + steps * 0.3 + mins * 0.25);
}

export function sleepStages(day?: DaySummary) {
  const total = day?.sleep?.durationMinutes ?? 0;
  const existing = day?.sleep?.stages;
  if (existing && existing.length) {
    const map = { awake: 0, rem: 0, light: 0, deep: 0 };
    for (const s of existing) map[s.stage] += s.durationMinutes;
    return map;
  }
  return {
    awake: Math.round(total * 0.06),
    rem: Math.round(total * 0.2),
    light: Math.round(total * 0.49),
    deep: Math.round(total * 0.25),
  };
}

export function lastNDays(days: DaySummary[], n: number): WeekPoint[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const latest = days[0]?.date ? new Date(`${days[0].date}T12:00:00`) : new Date();
  const out: WeekPoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(latest);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, day: byDate.get(key) });
  }
  return out;
}

export function sparkFromHr(day?: DaySummary, points = 24) {
  if (day?.heartRate?.readings && day.heartRate.readings.length > 1) {
    return day.heartRate.readings.slice(-points).map((r) => r.bpm);
  }
  const min = day?.heartRate?.min ?? 58;
  const max = day?.heartRate?.max ?? 110;
  const avg = day?.heartRate?.avg ?? 74;
  const seed = (day?.steps ?? 1) + (day?.activeMinutes ?? 0);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin((i / points) * Math.PI * 2.2 + (seed % 7));
    const bump = i > 8 && i < 14 ? 10 : i > 17 && i < 20 ? 8 : 0;
    return Math.round(avg + wave * ((max - min) / 4) + bump);
  });
}

export function stressSeries(day?: DaySummary) {
  if (day?.stress) {
    const avg = day.stress.avg;
    const max = day.stress.max;
    return Array.from({ length: 18 }, (_, i) => {
      const wave = (Math.sin(i / 2.4) + 1) / 2;
      return Math.round(avg * 0.55 + max * 0.45 * wave);
    });
  }
  return sparkFromHr(day, 18).map((bpm) => clamp((bpm - 55) / 70) * 100);
}
