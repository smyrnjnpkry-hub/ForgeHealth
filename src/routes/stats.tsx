import { Plant } from "@/components/plant";
import { Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import {
  currentStreak,
  dayCount,
  lastNDays,
  moodSummary,
  moodTrend,
  plantStage,
  weekKeys,
} from "@/lib/stats";
import { MOOD_META, type Mood } from "@/lib/types";
import { formatDuration, todayKey } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/stats")({ component: Stats });

function Stats() {
  const completions = useAppStore((s) => s.completions);
  const routines = useAppStore((s) => s.routines);
  const plantName = useAppStore((s) => s.settings.plantName || "Sprout");
  const streak = currentStreak(completions);
  const plant = plantStage(streak);
  const dPlus = dayCount(completions);
  const days = lastNDays(28);
  const byDate = new Map<string, number>();
  for (const c of completions) {
    byDate.set(c.date, (byDate.get(c.date) ?? 0) + 1);
  }
  const week = weekKeys().map((k) => {
    const list = completions.filter((c) => c.date === k);
    return {
      day: k.slice(8),
      minutes: Math.round(list.reduce((n, c) => n + c.durationSec, 0) / 60),
    };
  });
  const today = todayKey();
  const todayMin = Math.round(
    completions.filter((c) => c.date === today).reduce((n, c) => n + c.durationSec, 0) / 60,
  );
  const totalRuns = completions.length;
  const best = routines
    .map((r) => ({
      r,
      n: currentStreak(completions, r.id),
    }))
    .sort((a, b) => b.n - a.n)[0];
  const trend = moodTrend(completions, 12);
  const summary = moodSummary(completions);

  return (
    <main className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-semibold tracking-tight">Stats</h1>
      <p className="mt-1 text-sm text-muted">Streaks, time, and the plant that grows with you.</p>

      <Card className="mt-5 flex items-center gap-4 p-4">
        <Plant level={plant.level} size={96} />
        <div>
          <div className="text-xs font-medium text-muted">
            {plantName} · D+{dPlus}
          </div>
          <div className="text-xl font-semibold">{plant.name}</div>
          <p className="text-sm text-muted">{plant.hint}</p>
          <p className="mt-1 text-sm font-medium tabular-nums">{streak} day streak</p>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { k: "Today", v: todayMin ? `${todayMin}m` : "—" },
          { k: "Runs", v: String(totalRuns) },
          { k: "Best", v: best && best.n ? `${best.n}d` : "—" },
        ].map((x) => (
          <Card key={x.k} className="px-3 py-3 text-center">
            <div className="text-xs text-muted">{x.k}</div>
            <div className="text-lg font-semibold tabular-nums">{x.v}</div>
          </Card>
        ))}
      </div>

      {summary.n > 0 ? (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
            Mood check
          </h2>
          <Card className="p-4">
            <div className="flex items-end justify-between gap-2">
              {(Object.keys(MOOD_META) as Mood[]).map((m) => {
                const n = summary.counts[m];
                const pct = summary.n ? Math.round((n / summary.n) * 100) : 0;
                return (
                  <div key={m} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full max-w-10 rounded-t-md bg-sun/80"
                      style={{ height: `${Math.max(6, pct)}px` }}
                      title={`${n}×`}
                    />
                    <span className="text-lg">{MOOD_META[m].emoji}</span>
                    <span className="text-[11px] tabular-nums text-muted">{n}</span>
                  </div>
                );
              })}
            </div>
            {trend.length > 0 ? (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {trend.map((c) => (
                  <span
                    key={c.id}
                    className="text-base leading-none"
                    title={c.date}
                  >
                    {MOOD_META[c.mood].emoji}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-2 text-center text-[11px] text-faint">
              Recent post-run check-ins
            </p>
          </Card>
        </>
      ) : null}

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
        This week
      </h2>
      <Card className="p-3">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  fontSize: 12,
                }}
                formatter={(v) => [`${v} min`, "Time"]}
              />
              <Bar dataKey="minutes" fill="#f5c400" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
        28-day map
      </h2>
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((k) => {
            const n = byDate.get(k) ?? 0;
            return (
              <div
                key={k}
                title={`${k}: ${n}`}
                className={`aspect-square rounded-md ${
                  n >= 3 ? "bg-leaf" : n === 2 ? "bg-mint" : n === 1 ? "bg-sun" : "bg-sunken"
                }`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm bg-sunken" /> none
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm bg-sun" /> 1
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm bg-mint" /> 2
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-2.5 rounded-sm bg-leaf" /> 3+
          </span>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
        Per routine
      </h2>
      <div className="space-y-2">
        {routines.map((r) => {
          const s = currentStreak(completions, r.id);
          const runs = completions.filter((c) => c.routineId === r.id);
          const time = runs.reduce((n, c) => n + c.durationSec, 0);
          return (
            <Card key={r.id} className="flex items-center gap-3 p-3">
              <span className="text-xl">{r.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.name}</div>
                <div className="text-xs text-muted">
                  {s}d streak · {runs.length} runs · {formatDuration(time)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
