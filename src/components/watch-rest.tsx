import type { BodyMeasurement, DaySummary } from "@/lib/samsung-health-import";
import {
  WATER_GOAL,
  WATER_STEP,
  clamp,
  foodKcal,
  prettyDate,
  sparkFromHr,
  stressSeries,
  waterMl,
  weekdayShort,
  type WeekPoint,
} from "@/lib/watch-view";
import { MiniBars, Promo, QuickTile, ShCard, Sparkline } from "@/components/watch-ui";
import { Droplets, Heart, Leaf, Sparkles } from "lucide-react";

export function HeartTab({ latest, week }: { latest?: DaySummary; week: WeekPoint[] }) {
  const hr = latest?.heartRate;
  return (
    <>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Heart rate</p>
            <p className="mt-1 text-5xl font-semibold">
              {hr?.latest ?? "--"}
              <span className="ml-1 text-base font-medium text-muted">bpm</span>
            </p>
            <p className="mt-1 text-xs text-muted">{hr ? `Min ${hr.min} · Max ${hr.max} · ${prettyDate(latest!.date)}` : "No readings yet"}</p>
          </div>
          <Heart className="size-5 text-rose-500" />
        </div>
        <Sparkline values={sparkFromHr(latest)} color="#f43f5e" />
        <div className="mt-2">
          <MiniBars values={week.map((w) => w.day?.heartRate?.avg ?? 0)} labels={week.map((w) => weekdayShort(w.date).slice(0, 2))} color="#fb7185" />
        </div>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Blood oxygen</p>
        <p className="mt-1 text-sm text-muted">Average SpO2 during sleep is not in this ZIP. Measure from the watch to fill this card.</p>
      </ShCard>
      <Promo title="Blood pressure" body="Log a reading or connect a cuff to track trends." />
      <Promo title="Vascular load" body="Available when your Galaxy Watch records overnight vascular data." />
      <Promo title="AGEs index" body="Use the Samsung sensor accessory to estimate AGEs." />
      <Promo title="Antioxidant index" body="Promo — no antioxidant samples in this export." />
    </>
  );
}

export function MindfulnessTab({ latest }: { latest?: DaySummary }) {
  const series = stressSeries(latest);
  const avg = latest?.stress?.avg ?? Math.round(series.reduce((s, n) => s + n, 0) / series.length);
  const label = avg < 30 ? "Low" : avg < 60 ? "Medium" : "High";
  const sessions = latest?.mindfulness ?? [];
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <QuickTile to="/mood" emoji="🌤️" label="Mood check-in" />
        <QuickTile to="/habits" emoji="🌬️" label="Breathing" />
        <QuickTile to="/habits" emoji="🧘" label="Meditation" />
        <QuickTile to="/mood" emoji="💜" label="Gratitude" />
      </div>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Stress</p>
            <p className="mt-1 text-3xl font-semibold">{Math.round(avg)}</p>
            <p className="text-xs text-muted">{label} · throughout the day</p>
          </div>
          <Sparkles className="size-5 text-violet-500" />
        </div>
        <Sparkline values={series} color="#8b5cf6" />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>Low</span>
          <span>Med</span>
          <span>High</span>
        </div>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Today's sessions</p>
        {sessions.length === 0 ? (
          <p className="mt-1 text-sm text-muted">No meditation or breathing sessions logged.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Leaf className="size-4 text-mint" />
                  {s.type ?? "Mindfulness"}
                </span>
                <span className="text-muted">{s.durationMinutes} min</span>
              </li>
            ))}
          </ul>
        )}
      </ShCard>
    </>
  );
}

export function FoodTab({
  latest,
  week,
  body,
  onAddWater,
}: {
  latest?: DaySummary;
  week: WeekPoint[];
  body?: BodyMeasurement[];
  onAddWater: () => void;
}) {
  const ml = waterMl(latest);
  const kcal = foodKcal(latest);
  const latestBody = body?.[0];
  return (
    <>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Water</p>
            <p className="mt-1 text-3xl font-semibold">
              {ml}
              <span className="ml-1 text-base font-medium text-muted">/ {WATER_GOAL} ml</span>
            </p>
          </div>
          <Droplets className="size-5 text-sky-500" />
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-sky-50">
          <div className="h-full rounded-full bg-sky-400" style={{ width: `${clamp(ml / WATER_GOAL) * 100}%` }} />
        </div>
        <button
          type="button"
          onClick={onAddWater}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-sky-500 text-sm font-semibold text-white"
        >
          +{WATER_STEP} ml
        </button>
        <div className="mt-4 flex gap-1.5">
          {week.map(({ date, day }) => (
            <div key={date} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-10 w-full items-end rounded-md bg-sky-50">
                <div className="w-full rounded-md bg-sky-400" style={{ height: `${clamp(waterMl(day) / WATER_GOAL) * 100}%` }} />
              </div>
              <span className="text-[10px] text-muted">{weekdayShort(date).slice(0, 1)}</span>
            </div>
          ))}
        </div>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Food</p>
        {kcal > 0 ? (
          <p className="mt-1 text-2xl font-semibold">
            {Math.round(kcal)} <span className="text-sm font-medium text-muted">kcal today</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">No meals in this export. Log breakfast to start the day.</p>
        )}
      </ShCard>
      <ShCard>
        <p className="font-semibold">Body composition</p>
        {latestBody ? (
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <p>Weight · {latestBody.weight?.toFixed(1)} kg</p>
            <p>BMI · {latestBody.bmi?.toFixed(1)}</p>
            <p>Fat · {latestBody.bodyFat?.toFixed(1)}%</p>
            <p>Muscle · {latestBody.muscleMass?.toFixed(1)} kg</p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">Step on a Galaxy scale or import weight CSV to fill this card.</p>
        )}
      </ShCard>
      <Promo title="Blood glucose" body="Connect a glucose log or import CSV to see trends here." />
      <Promo title="Antioxidant index" body="Promo card — no sensor data in this ZIP." />
      <Promo title="AGEs" body="Promo card — measure with a compatible Samsung device." />
    </>
  );
}
