import { Plant } from "@/components/plant";
import { Button, Card } from "@/components/ui";
import { useNow } from "@/hooks/use-now";
import { useAppStore } from "@/lib/store";
import { currentStreak, dayCount, isScheduledToday, plantStage, totalSec } from "@/lib/stats";
import { cn, formatDuration, greeting, todayKey } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Play, Plus, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const now = useNow(30_000);
  const routines = useAppStore((s) => s.routines);
  const completions = useAppStore((s) => s.completions);
  const plantName = useAppStore((s) => s.settings.plantName || "Sprout");
  const displayName = useAppStore((s) => s.settings.displayName);
  const challenge = useAppStore((s) => s.challenge);
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const startRun = useAppStore((s) => s.startRun);
  const navigate = useNavigate();
  const d = new Date(now);
  const date = todayKey(d);
  const streak = currentStreak(completions);
  const plant = plantStage(streak);
  const dPlus = dayCount(completions);
  const todayRoutines = routines.filter((r) => isScheduledToday(r, d));
  const doneIds = new Set(completions.filter((c) => c.date === date && c.completedSteps > 0).map((c) => c.routineId));
  const doneCount = todayRoutines.filter((r) => doneIds.has(r.id)).length;
  const todayHabits = habits.filter((h) => h.enabled);
  const completedHabits = todayHabits.filter((h) => {
    const completion = habitCompletions.find((hc) => hc.habitId === h.id && hc.date === date);
    return completion && completion.count >= h.targetPerDay;
  });
  const greet = displayName ? `${greeting(d)}, ${displayName.split(" ")[0]}` : greeting(d);

  return (
    <main className="px-5 pt-6 pb-8">
      <header className="mb-5">
        <p className="text-sm text-muted">{greet}</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
        </h1>
      </header>

      <Card className="mb-6 p-5">
        <div className="flex items-center justify-around">
          <div className="text-center"><Link to="/challenge"><div className="relative mx-auto mb-2 size-16"><svg className="size-full -rotate-90"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-sunken" /><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - (challenge?.currentStreak || 0) / 30)}`} className="text-mint transition-all duration-500" strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{challenge?.currentStreak || 0}</div></div><div className="text-xs font-medium">Streak</div></Link></div>
          <div className="text-center"><Link to="/habits"><div className="relative mx-auto mb-2 size-16"><svg className="size-full -rotate-90"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-sunken" /><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - completedHabits.length / Math.max(1, todayHabits.length))}`} className="text-sun transition-all duration-500" strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{completedHabits.length}</div></div><div className="text-xs font-medium">Habits</div></Link></div>
          <div className="text-center"><div className="relative mx-auto mb-2 size-16"><svg className="size-full -rotate-90"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-sunken" /><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - doneCount / Math.max(1, todayRoutines.length))}`} className="text-sky transition-all duration-500" strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{doneCount}</div></div><div className="text-xs font-medium">Routines</div></div>
        </div>
      </Card>

      <Card className="mb-6 flex overflow-hidden"><div className="flex flex-1 items-center gap-3 p-4"><Plant level={plant.level} size={56} /><div><div className="text-xs font-medium text-muted">{plantName} · D+{dPlus || 0}</div><div className="text-lg font-semibold">{plant.name}</div><p className="text-sm text-muted">{doneCount}/{todayRoutines.length || 0} routines today</p></div></div></Card>

      {challenge && (<Link to="/challenge"><Card className="mb-6 p-4 flex items-center justify-between hover:bg-sunken/30 transition-colors"><div className="flex items-center gap-3"><div className="size-12 rounded-2xl bg-mint/10 flex items-center justify-center text-2xl">💪</div><div><div className="font-semibold">Challenge Active</div><div className="text-xs text-muted">{challenge.currentStreak} day streak · {challenge.xp} XP</div></div></div><TrendingUp className="size-5 text-mint" /></Card></Link>)}

      {todayRoutines.length === 0 ? (<Card className="p-8 text-center"><div className="mb-3 text-4xl">☀️</div><p className="mb-1 text-sm font-medium">No routines scheduled today</p><p className="mb-4 text-sm text-muted">Browse templates or create your own</p><Link to="/explore"><Button variant="outline" size="sm"><Plus className="size-4" />Explore</Button></Link></Card>) : (<div className="space-y-3"><h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Today's Routines</h2>{todayRoutines.slice(0, 5).map((r) => { const done = doneIds.has(r.id); return (<Link key={r.id} to="/routine/$id" params={{ id: r.id }}><Card className={cn("p-4 transition-colors hover:bg-sunken/50", done && "opacity-60")}><div className="flex items-start justify-between gap-3"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-lg">{r.emoji}</span><span className="font-semibold">{r.name}</span></div><div className="text-xs text-muted">{r.steps.length} steps · {formatDuration(totalSec(r))}</div></div>{!done && (<Button size="icon" variant="solid" onClick={(e) => { e.preventDefault(); startRun(r.id); void navigate({ to: "/run/$id", params: { id: r.id } }); }}><Play className="size-4 fill-current" /></Button>)}</div>{done && (<p className="mt-2 text-xs font-medium text-mint">✓ Finished today</p>)}</Card></Link>); })}</div>)}

      <div className="mt-6 flex justify-center gap-3"><Link to="/explore"><Button variant="outline" size="md"><Plus className="size-4" />Browse</Button></Link><Link to="/stats"><Button variant="outline" size="md">Stats</Button></Link></div>
    </main>
  );
}
