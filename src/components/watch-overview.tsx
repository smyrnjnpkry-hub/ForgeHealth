import type { DaySummary } from "@/lib/samsung-health-import";
import {
  STEP_GOAL,
  energyScore,
  formatMinutes,
  weekdayShort,
  type WeekPoint,
} from "@/lib/watch-view";
import { Gauge, HeartRings, Metric, QuickTile, ShCard, StatusTag } from "@/components/watch-ui";
import { ChevronRight, Heart, Zap } from "lucide-react";

export function OverviewTab({
  latest,
  week,
  onFood,
}: {
  latest?: DaySummary;
  week: WeekPoint[];
  onFood: () => void;
}) {
  const energy = energyScore(latest);
  const sleepScore = latest?.sleep?.score ?? 0;
  return (
    <>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Energy score</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight">{energy || "--"}</span>
              {energy ? <StatusTag score={energy} /> : null}
            </div>
          </div>
          <Zap className="size-5 text-amber-400" />
        </div>
        <div className="mt-4 flex gap-1.5">
          {week.map(({ date, day }) => {
            const s = energyScore(day);
            return (
              <div key={date} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-10 w-full items-end rounded-full bg-slate-100">
                  <div className="w-full rounded-full bg-sky-400" style={{ height: `${Math.max(12, s)}%` }} />
                </div>
                <span className="text-[10px] text-muted">{weekdayShort(date).slice(0, 1)}</span>
              </div>
            );
          })}
        </div>
      </ShCard>

      <ShCard>
        <p className="text-xs font-medium text-muted">Daily activity</p>
        <HeartRings steps={latest?.steps ?? 0} mins={latest?.activeMinutes ?? 0} kcal={latest?.activeCalories ?? 0} />
        <div className="mt-1 grid grid-cols-3 gap-2 text-center">
          <Metric color="#34d399" label="Steps" value={(latest?.steps ?? 0).toLocaleString()} hint={`${STEP_GOAL.toLocaleString()}`} />
          <Metric color="#60a5fa" label="Active" value={`${Math.round(latest?.activeMinutes ?? 0)}`} hint="min" />
          <Metric color="#c084fc" label="Calories" value={`${Math.round(latest?.activeCalories ?? 0)}`} hint="kcal" />
        </div>
      </ShCard>

      <ShCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Sleep score</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-semibold">{sleepScore || "--"}</span>
              {sleepScore ? <StatusTag score={sleepScore} /> : null}
            </div>
            <p className="mt-1 text-xs text-muted">
              {latest?.sleep ? formatMinutes(latest.sleep.durationMinutes) : "No sleep last night"}
            </p>
          </div>
          <Gauge score={sleepScore} color={sleepScore >= 80 ? "#38bdf8" : sleepScore >= 60 ? "#fbbf24" : "#fb923c"} />
        </div>
      </ShCard>

      <ShCard onClick={onFood} className="bg-gradient-to-br from-lime-50 to-white">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-lime-100 text-xl">🥗</div>
          <div className="flex-1">
            <p className="font-semibold">Log food</p>
            <p className="text-xs text-muted">Track meals, water, and glucose</p>
          </div>
          <ChevronRight className="size-4 text-faint" />
        </div>
      </ShCard>

      <div className="grid grid-cols-2 gap-3">
        <QuickTile to="/mood" emoji="😊" label="Mood check-in" />
        <QuickTile to="/habits" emoji="🌬️" label="Breathe" />
        <QuickTile to="/habits" emoji="🧘" label="Meditate" />
        <QuickTile to="/mood" emoji="📝" label="Journal" />
      </div>

      <ShCard className="bg-gradient-to-br from-rose-50 to-white">
        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-rose-100">
            <Heart className="size-5 text-rose-500" />
          </div>
          <div>
            <p className="font-semibold">Heart health</p>
            <p className="text-xs text-muted">
              {latest?.heartRate
                ? `${latest.heartRate.latest} bpm · avg ${latest.heartRate.avg}`
                : "Measure resting heart rate on your watch"}
            </p>
          </div>
        </div>
      </ShCard>

      <ShCard>
        <p className="font-semibold">Vitals during sleep</p>
        <p className="mt-1 text-sm text-muted">
          Overnight heart rate, blood oxygen, and breathing appear here after a sleep session.
        </p>
      </ShCard>
    </>
  );
}
