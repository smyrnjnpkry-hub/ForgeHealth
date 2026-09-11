import type { DaySummary } from "@/lib/samsung-health-import";
import {
  STEP_GOAL,
  MIN_GOAL,
  KCAL_GOAL,
  clamp,
  formatMinutes,
  weekdayShort,
  type WeekPoint,
} from "@/lib/watch-view";
import { HeartRings, Metric, MiniBars, Promo, ShCard } from "@/components/watch-ui";
import { Activity, Bike, Footprints, MoreHorizontal, PersonStanding } from "lucide-react";

export function ActivityTab({ latest, week }: { latest?: DaySummary; week: WeekPoint[] }) {
  const workouts = week.flatMap((w) => w.day?.exercises ?? []);
  const weekMins = week.reduce((s, w) => s + (w.day?.activeMinutes ?? 0), 0);
  const weekKcal = week.reduce((s, w) => s + (w.day?.activeCalories ?? 0), 0);
  const sessions = workouts.length || week.filter((w) => (w.day?.activeMinutes ?? 0) > 0).length;
  return (
    <>
      <ShCard>
        <p className="text-xs font-medium text-muted">Daily activity</p>
        <HeartRings steps={latest?.steps ?? 0} mins={latest?.activeMinutes ?? 0} kcal={latest?.activeCalories ?? 0} />
        <div className="grid grid-cols-3 gap-2 text-center">
          <Metric color="#34d399" label="Steps" value={(latest?.steps ?? 0).toLocaleString()} hint={`${STEP_GOAL}`} />
          <Metric color="#60a5fa" label="Mins" value={`${Math.round(latest?.activeMinutes ?? 0)}`} hint={`${MIN_GOAL}`} />
          <Metric color="#c084fc" label="kcal" value={`${Math.round(latest?.activeCalories ?? 0)}`} hint={`${KCAL_GOAL}`} />
        </div>
      </ShCard>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Workouts this week</p>
            <p className="mt-1 text-2xl font-semibold">{formatMinutes(weekMins)}</p>
            <p className="text-xs text-muted">
              {sessions} sessions · {Math.round(weekKcal)} kcal
            </p>
          </div>
          <Activity className="size-5 text-sky-500" />
        </div>
        <div className="mt-4">
          <MiniBars values={week.map((w) => w.day?.activeMinutes ?? 0)} labels={week.map((w) => weekdayShort(w.date).slice(0, 2))} color="#60a5fa" />
        </div>
      </ShCard>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Steps</p>
            <p className="mt-1 text-3xl font-semibold">{(latest?.steps ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted">Goal {STEP_GOAL.toLocaleString()}</p>
          </div>
          <Footprints className="size-5 text-emerald-500" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${clamp((latest?.steps ?? 0) / STEP_GOAL) * 100}%` }} />
        </div>
        <div className="mt-4">
          <MiniBars values={week.map((w) => w.day?.steps ?? 0)} labels={week.map((w) => weekdayShort(w.date).slice(0, 2))} color="#34d399" max={STEP_GOAL} />
        </div>
      </ShCard>
      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">Exercise</p>
        <div className="grid grid-cols-4 gap-2">
          <ExStart icon={PersonStanding} label="Walk" />
          <ExStart icon={Footprints} label="Run" />
          <ExStart icon={Bike} label="Bike" />
          <ExStart icon={MoreHorizontal} label="More" />
        </div>
      </div>
      <Promo title="Fitness index" body="Walk or run outdoors to estimate VO2 max from your watch." />
      <Promo title="Running coach" body="Get pacing guidance after a few outdoor runs." />
      <Promo title="Daily cardio load" body="Cardio load appears once workouts include heart-rate data." />
    </>
  );
}

function ExStart({ icon: Icon, label }: { icon: typeof Bike; label: string }) {
  return (
    <div className="rounded-[22px] bg-white py-3 text-center shadow-card">
      <Icon className="mx-auto size-5 text-sky-600" />
      <div className="mt-1 text-[11px] font-semibold">{label}</div>
    </div>
  );
}
