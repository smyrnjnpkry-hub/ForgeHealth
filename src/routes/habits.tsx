import { Button, Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { createFileRoute } from "@tanstack/react-router";
import { todayKey } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Heart } from "lucide-react";

export const Route = createFileRoute("/habits")({ component: Habits });

function Habits() {
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const completeHabit = useAppStore((s) => s.completeHabit);
  const gratitudeEntries = useAppStore((s) => s.gratitudeEntries);
  const addGratitude = useAppStore((s) => s.addGratitude);
  const today = todayKey();

  const [gratitudeText, setGratitudeText] = useState("");
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayGratitudes = gratitudeEntries.filter((g) => g.date === today);
  const canAddGratitude = todayGratitudes.length < 5;

  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            const meditationHabit = habits.find((h) => h.type === "meditation");
            if (meditationHabit) completeHabit(meditationHabit.id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timerRemaining, habits, completeHabit]);

  function startTimer() {
    setTimerRemaining(timerSeconds);
    setTimerRunning(true);
  }

  function pauseTimer() { setTimerRunning(false); }
  function resetTimer() { setTimerRunning(false); setTimerRemaining(timerSeconds); }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function handleAddGratitude() {
    if (!gratitudeText.trim() || !canAddGratitude) return;
    addGratitude(gratitudeText.trim());
    const gratitudeHabit = habits.find((h) => h.type === "gratitude");
    if (gratitudeHabit) completeHabit(gratitudeHabit.id);
    setGratitudeText("");
  }

  return (
    <main className="px-5 pt-6 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
      <p className="mt-1 text-sm text-muted">Track daily wins, earn XP</p>

      <div className="mt-6 space-y-3">
        {habits.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted">No habits yet. Create one to begin.</p>
          </Card>
        ) : (
          habits.map((habit) => {
            const todayCompletion = habitCompletions.find((hc) => hc.habitId === habit.id && hc.date === today);
            const completedCount = todayCompletion?.count ?? 0;
            const isDone = completedCount >= habit.targetPerDay;
            const progressPct = Math.min(100, (completedCount / habit.targetPerDay) * 100);

            return (
              <Card key={habit.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-1 items-center gap-3">
                    <div className={`size-10 rounded-xl flex items-center justify-center text-xl ${
                      isDone ? "bg-mint/20" : "bg-sunken"
                    }`}>{habit.emoji}</div>
                    <div className="flex-1">
                      <div className="font-medium">{habit.title}</div>
                      <div className="text-xs text-muted">
                        {completedCount}/{habit.targetPerDay} · +{habit.xpPerCompletion}xp each
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {habit.type === "meditation" && (
                      <Button size="sm" variant="outline" onClick={() => setShowTimer(!showTimer)}>
                        {showTimer ? "Hide" : "Timer"}
                      </Button>
                    )}
                    {isDone ? (
                      <span className="text-xs font-medium text-mint px-3 py-1.5 bg-mint/10 rounded-lg">✓ Done</span>
                    ) : (
                      <Button size="sm" variant={completedCount > 0 ? "soft" : "solid"} onClick={() => completeHabit(habit.id)}>
                        +1
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 h-1.5 bg-sunken rounded-full overflow-hidden">
                  <div className="h-full bg-mint transition-all duration-300" style={{ width: `${progressPct}%` }} />
                </div>
                {habit.targetPerDay > 1 && (
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: habit.targetPerDay }).map((_, i) => (
                      <div key={i} className={`flex-1 h-2 rounded-full ${
                        i < completedCount ? "bg-mint" : "bg-sunken"
                      }`} />
                    ))}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {showTimer && (
        <Card className="mt-6 p-6">
          <h2 className="text-sm font-semibold mb-4">Meditation Timer</h2>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold tabular-nums">{formatTime(timerRemaining)}</div>
            <div className="text-xs text-muted mt-1">
              {timerRunning ? "Meditating..." : timerRemaining === 0 ? "Complete!" : "Ready"}
            </div>
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {[3, 5, 10, 15, 20].map((min) => (
              <button key={min} type="button" disabled={timerRunning} onClick={() => { setTimerSeconds(min * 60); setTimerRemaining(min * 60); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timerSeconds === min * 60 ? "bg-mint text-white" : "bg-sunken text-muted"
              }`}>{min}m</button>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            {!timerRunning ? (
              <Button variant="sun" onClick={startTimer} disabled={timerRemaining === 0}>
                <Play className="size-4" /> Start
              </Button>
            ) : (
              <Button variant="outline" onClick={pauseTimer}>
                <Pause className="size-4" /> Pause
              </Button>
            )}
            <Button variant="outline" onClick={resetTimer}>
              <Square className="size-4" /> Reset
            </Button>
          </div>
        </Card>
      )}

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Gratitude Journal</h2>
          <Heart className="size-4 text-coral" />
        </div>
        <p className="text-xs text-muted mb-3">Up to 5 entries per day · +3 XP each</p>
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${
              i < todayGratitudes.length ? "bg-coral" : "bg-sunken"
            }`} />
          ))}
        </div>
        {canAddGratitude ? (
          <div className="space-y-3">
            <textarea value={gratitudeText} onChange={(e) => setGratitudeText(e.target.value)} placeholder="What are you grateful for today?" className="w-full h-20 rounded-xl border border-border bg-surface px-3 py-2 text-sm resize-none" />
            <Button variant="sun" className="w-full" onClick={handleAddGratitude} disabled={!gratitudeText.trim()}>
              Add gratitude ({todayGratitudes.length}/5)
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-mint font-medium">All 5 gratitudes logged today</div>
        )}
        {todayGratitudes.length > 0 && (
          <div className="mt-4 space-y-2">
            {todayGratitudes.map((g) => (
              <div key={g.id} className="p-3 bg-sunken rounded-xl text-sm">
                {g.text}
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
