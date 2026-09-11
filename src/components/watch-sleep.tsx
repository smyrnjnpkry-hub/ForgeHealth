import type { DaySummary } from "@/lib/samsung-health-import";
import {
  clamp,
  formatClockFromTs,
  formatMinutes,
  prettyDate,
  sleepStages,
  sparkFromHr,
  weekdayShort,
  type WeekPoint,
} from "@/lib/watch-view";
import { MiniBars, Promo, ShCard, Sparkline, StatusTag } from "@/components/watch-ui";
import { Heart, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SleepTab({ latest, week }: { latest?: DaySummary; week: WeekPoint[] }) {
  const sleep = latest?.sleep;
  const score = sleep?.score ?? 0;
  const stages = sleepStages(latest);
  const total = Math.max(1, stages.awake + stages.rem + stages.light + stages.deep);
  const avgSleep =
    week.reduce((s, w) => s + (w.day?.sleep?.durationMinutes ?? 0), 0) /
    Math.max(1, week.filter((w) => w.day?.sleep).length);
  const factors = [
    { label: "Actual sleep", value: formatMinutes(sleep?.durationMinutes ?? 0), score: sleep?.score ?? 50 },
    { label: "Deep", value: formatMinutes(stages.deep), score: clamp(stages.deep / 90) * 100 },
    { label: "REM", value: formatMinutes(stages.rem), score: clamp(stages.rem / 90) * 100 },
    { label: "Awake", value: formatMinutes(stages.awake), score: 100 - clamp(stages.awake / 40) * 80 },
    { label: "Latency", value: "12m", score: 78 },
  ];
  const hypno = [
    ["awake", stages.awake, "#fbbf24"],
    ["REM", stages.rem, "#a78bfa"],
    ["Light", stages.light, "#7dd3fc"],
    ["Deep", stages.deep, "#6366f1"],
  ] as const;
  const bars = [
    ["Awake", stages.awake, "#fbbf24", 8],
    ["REM", stages.rem, "#a78bfa", 20],
    ["Light", stages.light, "#7dd3fc", 50],
    ["Deep", stages.deep, "#6366f1", 22],
  ] as const;
  return (
    <>
      <ShCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted">Today</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-5xl font-semibold">{score || "--"}</span>
              {score ? <StatusTag score={score} /> : null}
            </div>
            <p className="mt-1 text-xs text-muted">{sleep ? `${prettyDate(latest!.date)} · no nap logged` : "No sleep session"}</p>
          </div>
          <Moon className="size-5 text-indigo-400" />
        </div>
        {sleep ? (
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-muted">Sleep time</p>
              <p className="font-semibold">
                {formatClockFromTs(sleep.startTime)} – {formatClockFromTs(sleep.endTime)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-muted">Actual sleep</p>
              <p className="font-semibold">{formatMinutes(sleep.durationMinutes)}</p>
            </div>
          </div>
        ) : null}
      </ShCard>
      <ShCard>
        <p className="mb-3 text-xs font-medium text-muted">Sleep score factors</p>
        <div className="grid grid-cols-2 gap-2">
          {factors.map((f) => (
            <div key={f.label} className="rounded-2xl bg-slate-50 px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted">{f.label}</span>
                <StatusTag score={f.score} />
              </div>
              <div className="mt-1 text-lg font-semibold">{f.value}</div>
            </div>
          ))}
        </div>
      </ShCard>
      <ShCard>
        <p className="mb-3 text-xs font-medium text-muted">Sleep stages</p>
        <div className="flex h-16 overflow-hidden rounded-xl">
          {hypno.map(([label, mins, color]) => (
            <div key={label} title={`${label} ${formatMinutes(mins)}`} style={{ width: `${(mins / total) * 100}%`, background: color }} />
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {bars.map(([label, mins, color, typical]) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-muted">{label}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(mins / total) * 100}%`, background: color }} />
                <div className="absolute inset-y-0 w-0.5 bg-fg/30" style={{ left: `${typical}%` }} />
              </div>
              <span className="w-10 text-right font-medium">{Math.round((mins / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Blood oxygen during sleep</p>
        <p className="mt-1 text-sm text-muted">No SpO2 samples in this export. Wear your watch overnight to fill this chart.</p>
      </ShCard>
      <ShCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Heart rate during sleep</p>
            <p className="text-3xl font-semibold">{latest?.heartRate?.avg ?? "--"}</p>
            <p className="text-xs text-muted">avg bpm</p>
          </div>
          <Heart className="size-5 text-rose-500" />
        </div>
        <Sparkline values={sparkFromHr(latest)} color="#fb7185" />
      </ShCard>
      <ShCard>
        <p className="font-semibold">Respiratory rate</p>
        <p className="mt-1 text-sm text-muted">Average overnight rate appears after several sleep sessions.</p>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Snoring</p>
        <p className="mt-1 text-sm text-muted">No data</p>
      </ShCard>
      <ShCard>
        <p className="text-xs font-medium text-muted">Sleep time · last 7 days</p>
        <p className="mt-1 text-xl font-semibold">{formatMinutes(avgSleep || 0)} avg</p>
        <div className="mt-3">
          <MiniBars values={week.map((w) => (w.day?.sleep?.durationMinutes ?? 0) / 60)} labels={week.map((w) => weekdayShort(w.date).slice(0, 2))} color="#818cf8" max={9} />
        </div>
      </ShCard>
      <ShCard>
        <p className="font-semibold">Sleep consistency</p>
        <p className="mt-1 text-xs text-muted">Bedtime 11:00 PM · Wake 7:00 AM</p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {week.map(({ date, day }) => (
            <div key={date} className="text-center">
              <div className={cn("mx-auto h-12 w-3 rounded-full", day?.sleep ? "bg-indigo-400" : "bg-slate-200")} />
              <div className="mt-1 text-[10px] text-muted">{weekdayShort(date).slice(0, 1)}</div>
            </div>
          ))}
        </div>
      </ShCard>
      <Promo title="Sleep animal" body="Keep a regular bedtime to meet your sleep creature." />
      <Promo title="Bedtime guidance" body="Wind down 30 minutes before your target bedtime." />
    </>
  );
}
