import type { Completion, Mood, Routine } from "@/lib/types";
import { addMinutes, todayKey } from "@/lib/utils";

export function totalSec(routine: Routine) {
  return routine.steps.reduce((n, s) => n + s.durationSec, 0);
}

export function endTime(routine: Routine) {
  return addMinutes(routine.startTime, Math.round(totalSec(routine) / 60));
}

export function isScheduledToday(routine: Routine, d = new Date()) {
  if (!routine.enabled) return false;
  return routine.days.includes(d.getDay());
}

export function dayKeysBetween(from: string, to: string) {
  const out: string[] = [];
  const cur = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  while (cur <= end) {
    out.push(todayKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function datesWithCompletion(
  completions: Completion[],
  routineId?: string,
) {
  const set = new Set<string>();
  for (const c of completions) {
    if (routineId && c.routineId !== routineId) continue;
    if (c.completedSteps > 0) set.add(c.date);
  }
  return set;
}

export function currentStreak(completions: Completion[], routineId?: string) {
  const set = datesWithCompletion(completions, routineId);
  if (set.size === 0) return 0;
  const today = todayKey();
  const d = new Date(`${today}T00:00:00`);
  if (!set.has(today)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(todayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function dayCount(completions: Completion[]) {
  if (completions.length === 0) return 0;
  const first = completions.reduce(
    (min, c) => (c.date < min ? c.date : min),
    completions[0].date,
  );
  const a = new Date(`${first}T00:00:00`).getTime();
  const b = new Date(`${todayKey()}T00:00:00`).getTime();
  return Math.max(1, Math.floor((b - a) / 86400000) + 1);
}

/** Nine earned stages — thresholds feel intentional, not arbitrary. */
export function plantStage(streak: number) {
  if (streak <= 0)
    return { level: 0, name: "Seed", hint: "Press start once — that's enough to sprout." };
  if (streak < 2)
    return { level: 1, name: "Crack", hint: "The shell is opening. Come back tomorrow." };
  if (streak < 4)
    return { level: 2, name: "Sprout", hint: "A green tip. Keep the soil warm." };
  if (streak < 7)
    return { level: 3, name: "Seedling", hint: "A week grows roots." };
  if (streak < 14)
    return { level: 4, name: "Young plant", hint: "Two weeks of follow-through." };
  if (streak < 21)
    return { level: 5, name: "Bush", hint: "Three weeks — the shape is showing." };
  if (streak < 30)
    return { level: 6, name: "Sapling", hint: "A month of rails." };
  if (streak < 45)
    return { level: 7, name: "Young tree", hint: "The habit is taking hold." };
  if (streak < 60)
    return { level: 8, name: "Bloom", hint: "You earned the flowers." };
  return { level: 9, name: "Grove", hint: "This is who you are now." };
}

export const PLANT_MAX_LEVEL = 9;

export function completionsOn(completions: Completion[], date: string) {
  return completions.filter((c) => c.date === date);
}

export function weekKeys(from = new Date()) {
  const d = new Date(from);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return todayKey(x);
  });
}

export function lastNDays(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setDate(d.getDate() - i);
    out.push(todayKey(x));
  }
  return out;
}

/** Score a routine for "right now" — lower is better (sooner / more relevant). */
export function routinePriorityScore(routine: Routine, now = new Date()) {
  if (routine.anytime) return 10_000 + totalSec(routine);
  const [h, m] = routine.startTime.split(":").map(Number);
  const startMin = h * 60 + m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const delta = startMin - nowMin;
  // Past due (within last 3h) bubbles up first; upcoming next; far future last.
  if (delta < -180) return 8_000 + Math.abs(delta);
  if (delta < 0) return Math.abs(delta); // overdue recently → top
  return 200 + delta;
}

export function moodTrend(completions: Completion[], limit = 14) {
  const withMood = completions.filter((c): c is Completion & { mood: Mood } => Boolean(c.mood));
  return withMood.slice(0, limit).reverse();
}

export function moodSummary(completions: Completion[]) {
  const counts: Record<Mood, number> = { good: 0, ok: 0, low: 0 };
  let n = 0;
  for (const c of completions) {
    if (!c.mood) continue;
    counts[c.mood] += 1;
    n += 1;
  }
  return { counts, n };
}
