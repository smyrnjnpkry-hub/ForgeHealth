import { Button, Card, Input, Segmented } from "@/components/ui";
import { sliceTask } from "@/lib/ai-forge";
import {
  AVERSION_META,
  HABIT_MEDIAN_DAYS,
  SCIENCE_CARDS,
  STYLE_META,
  STYLE_QUIZ,
  TWO_MINUTE_SEC,
  automaticityEstimate,
  styleFromAnswers,
} from "@/lib/science";
import { habitDayCount } from "@/lib/stats";
import { useAppStore } from "@/lib/store";
import type { AversionTag, ProcrastinationStyle } from "@/lib/types";
import { cn, todayKey } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Flame, RotateCcw, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/forge")({ component: Forge });

type Panel = "start" | "recipes" | "plans" | "lab";
type UnstickStep = "name" | "tag" | "slice" | "ride" | "done";

const AVERSIONS = Object.keys(AVERSION_META) as AversionTag[];

function Forge() {
  const [panel, setPanel] = useState<Panel>("start");
  return (
    <main className="px-5 pt-6 pb-24">
      <header className="mb-5">
        <p className="text-sm font-medium text-mint">Start workshop</p>
        <h1 className="text-2xl font-semibold tracking-tight">Forge</h1>
        <p className="mt-1 text-sm text-muted">
          Label the stall. Cut a two-minute slice. One miss does not reset the groove.
        </p>
      </header>
      <Segmented
        value={panel}
        onChange={setPanel}
        options={[
          { value: "start", label: "Unstick" },
          { value: "recipes", label: "Tiny" },
          { value: "plans", label: "WOOP" },
          { value: "lab", label: "Lab" },
        ]}
      />
      <div className="mt-5">
        {panel === "start" ? <UnstickPanel /> : null}
        {panel === "recipes" ? <RecipesPanel /> : null}
        {panel === "plans" ? <WoopPanel /> : null}
        {panel === "lab" ? <LabPanel /> : null}
      </div>
    </main>
  );
}

function UnstickPanel() {
  const saveUnstick = useAppStore((s) => s.saveUnstick);
  const finishUnstick = useAppStore((s) => s.finishUnstick);
  const unsticks = useAppStore((s) => s.unsticks);
  const style = useAppStore((s) => s.procrastination?.style);
  const [step, setStep] = useState<UnstickStep>("name");
  const [task, setTask] = useState("");
  const [aversion, setAversion] = useState<AversionTag | null>(null);
  const [firstAction, setFirstAction] = useState("");
  const [reward, setReward] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [left, setLeft] = useState(TWO_MINUTE_SEC);
  const [running, setRunning] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");

  const todayStarts = unsticks.filter((u) => u.date === todayKey() && u.completed).length;
  const move = style ? STYLE_META[style].move : "Name the stall, then start a slice smaller than your mood.";

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          setRunning(false);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running]);

  function beginRide() {
    if (!aversion || !task.trim() || !firstAction.trim()) return;
    const id = saveUnstick({
      task: task.trim(),
      aversion,
      firstAction: firstAction.trim(),
      reward: reward.trim() || "Stand up and breathe once",
    });
    setSessionId(id);
    setLeft(TWO_MINUTE_SEC);
    setRunning(true);
    setStep("ride");
  }

  function settle(completed: boolean) {
    if (sessionId) finishUnstick(sessionId, completed, TWO_MINUTE_SEC - left);
    setRunning(false);
    setStep("done");
  }

  async function askSlice() {
    if (!task.trim() || !aversion) return;
    setAiBusy(true);
    setAiError("");
    try {
      const res = await sliceTask({ data: { task: task.trim(), aversion } });
      if (!res.ok) {
        setAiError(res.error);
      } else {
        if (res.firstAction) setFirstAction(res.firstAction);
        if (res.reward) setReward(res.reward);
        setAiNote(res.note);
      }
    } catch {
      setAiError("Could not reach the coach. Write your own slice.");
    } finally {
      setAiBusy(false);
    }
  }

  function reset() {
    setStep("name");
    setTask("");
    setAversion(null);
    setFirstAction("");
    setReward("");
    setSessionId(null);
    setLeft(TWO_MINUTE_SEC);
    setRunning(false);
    setAiNote("");
    setAiError("");
  }

  if (step === "done") {
    return (
      <Card className="p-5">
        <p className="text-sm font-medium text-mint">Logged</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Starting is the win</h2>
        <p className="mt-2 text-sm text-muted">
          The mountain can wait. You raised expectancy by moving, even a little.
        </p>
        <Button className="mt-5 w-full" variant="sun" onClick={reset}>
          Unstick another
        </Button>
      </Card>
    );
  }

  if (step === "ride") {
    const m = Math.floor(left / 60);
    const s = left % 60;
    return (
      <Card className="p-5">
        <p className="text-sm text-muted">{firstAction}</p>
        <div className="mt-4 text-center">
          <div className="text-5xl font-semibold tabular-nums tracking-tight">
            {m}:{String(s).padStart(2, "0")}
          </div>
          <p className="mt-2 text-sm text-muted">Two minutes. Ugly is allowed.</p>
        </div>
        <div className="mt-6 space-y-2">
          <Button className="w-full" variant="sun" onClick={() => settle(true)}>
            I started — skip the wait
          </Button>
          <Button className="w-full" variant="outline" onClick={() => settle(left === 0)}>
            {left === 0 ? "Times up — I started" : "Still stuck"}
          </Button>
        </div>
        {reward ? (
          <p className="mt-4 text-center text-xs text-muted">After: {reward}</p>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Today</p>
        <p className="mt-1 text-sm">
          {todayStarts} start{todayStarts === 1 ? "" : "s"} logged. {move}
        </p>
      </Card>

      {step === "name" || step === "tag" || step === "slice" ? (
        <Card className="p-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">What is stalled?</span>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="The next thing you keep not starting"
              className="h-24 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm"
            />
          </label>
          {task.trim() ? (
            <div>
              <div className="mb-2 text-sm font-medium">Name the stall</div>
              <div className="flex flex-wrap gap-2">
                {AVERSIONS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setAversion(id);
                      setStep("slice");
                    }}
                    className={cn(
                      "h-10 rounded-full px-3 text-sm font-medium",
                      aversion === id ? "bg-fg text-bg" : "bg-sunken text-fg",
                    )}
                  >
                    {AVERSION_META[id].label}
                  </button>
                ))}
              </div>
              {aversion ? (
                <p className="mt-2 text-xs text-muted">{AVERSION_META[aversion].lever}</p>
              ) : null}
            </div>
          ) : null}

          {aversion ? (
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Two-minute first action</span>
                <Input
                  value={firstAction}
                  onChange={(e) => setFirstAction(e.target.value)}
                  placeholder="Open the file and write one ugly sentence"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Reward when the two minutes end</span>
                <Input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="Tea, stretch, one song"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={aiBusy || !task.trim()}
                onClick={() => void askSlice()}
              >
                {aiBusy ? "Slicing…" : "Suggest a 2-minute slice"}
              </Button>
              {aiNote ? <p className="text-xs text-muted">{aiNote}</p> : null}
              {aiError ? <p className="text-xs text-coral">{aiError}</p> : null}
              <Button
                className="w-full"
                variant="sun"
                disabled={!firstAction.trim()}
                onClick={beginRide}
              >
                <Timer className="size-4" />
                Start the two minutes
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

function RecipesPanel() {
  const recipes = useAppStore((s) => s.recipes);
  const addRecipe = useAppStore((s) => s.addRecipe);
  const completeRecipe = useAppStore((s) => s.completeRecipe);
  const deleteRecipe = useAppStore((s) => s.deleteRecipe);
  const [anchor, setAnchor] = useState("");
  const [behavior, setBehavior] = useState("");
  const [celebration, setCelebration] = useState("say started");
  const today = todayKey();

  function save() {
    if (!anchor.trim() || !behavior.trim()) return;
    addRecipe({
      anchor: anchor.trim(),
      behavior: behavior.trim(),
      celebration: celebration.trim() || "say started",
    });
    setAnchor("");
    setBehavior("");
    setCelebration("say started");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        After an existing cue, do something tiny, then celebrate. Fogg: if you skip often, it is still too big.
      </p>
      <Card className="space-y-3 p-5">
        <Input value={anchor} onChange={(e) => setAnchor(e.target.value)} placeholder="After I sit at my desk" />
        <Input value={behavior} onChange={(e) => setBehavior(e.target.value)} placeholder="I will open the stalled file" />
        <Input value={celebration} onChange={(e) => setCelebration(e.target.value)} placeholder="then I will say started" />
        <Button className="w-full" variant="sun" onClick={save} disabled={!anchor.trim() || !behavior.trim()}>
          Save recipe
        </Button>
      </Card>
      {recipes.length === 0 ? (
        <Card className="p-5 text-sm text-muted">No recipes yet. Anchor to something you already do.</Card>
      ) : (
        <div className="space-y-3">
          {recipes.map((r) => {
            const done = r.lastDoneDate === today;
            return (
              <Card key={r.id} className="p-4">
                <p className="text-sm">
                  After <span className="font-medium">{r.anchor}</span>, I will{" "}
                  <span className="font-medium">{r.behavior}</span>, then {r.celebration}.
                </p>
                <p className="mt-1 text-xs text-muted">
                  {r.doneCount} repetition{r.doneCount === 1 ? "" : "s"} · {automaticityEstimate(r.doneCount).label}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant={done ? "soft" : "sun"}
                    className="flex-1"
                    disabled={done}
                    onClick={() => completeRecipe(r.id)}
                  >
                    {done ? "Done today" : "Did it"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteRecipe(r.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WoopPanel() {
  const woops = useAppStore((s) => s.woops);
  const addWoop = useAppStore((s) => s.addWoop);
  const deleteWoop = useAppStore((s) => s.deleteWoop);
  const [wish, setWish] = useState("");
  const [outcome, setOutcome] = useState("");
  const [obstacle, setObstacle] = useState("");
  const [planIf, setPlanIf] = useState("");
  const [planThen, setPlanThen] = useState("");

  function save() {
    if (!wish.trim() || !obstacle.trim() || !planIf.trim() || !planThen.trim()) return;
    addWoop({
      wish: wish.trim(),
      outcome: outcome.trim(),
      obstacle: obstacle.trim(),
      planIf: planIf.trim(),
      planThen: planThen.trim(),
    });
    setWish("");
    setOutcome("");
    setObstacle("");
    setPlanIf("");
    setPlanThen("");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Wish, Outcome, Obstacle, Plan. The obstacle is required — fantasizing the win without it does not help.
      </p>
      <Card className="space-y-3 p-5">
        <Input value={wish} onChange={(e) => setWish(e.target.value)} placeholder="Wish — the habit or task" />
        <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="Best outcome if it happens" />
        <Input value={obstacle} onChange={(e) => setObstacle(e.target.value)} placeholder="Inner obstacle that shows up" />
        <Input value={planIf} onChange={(e) => setPlanIf(e.target.value)} placeholder="If (cue)" />
        <Input value={planThen} onChange={(e) => setPlanThen(e.target.value)} placeholder="then (action)" />
        <Button
          className="w-full"
          variant="sun"
          disabled={!wish.trim() || !obstacle.trim() || !planIf.trim() || !planThen.trim()}
          onClick={save}
        >
          Save plan
        </Button>
      </Card>
      {woops.map((w) => (
        <Card key={w.id} className="p-4">
          <p className="font-medium">{w.wish}</p>
          {w.outcome ? <p className="mt-1 text-sm text-muted">{w.outcome}</p> : null}
          <p className="mt-2 text-sm">Obstacle: {w.obstacle}</p>
          <p className="mt-1 rounded-xl bg-sunken px-3 py-2 text-sm">
            If {w.planIf}, then {w.planThen}.
          </p>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => deleteWoop(w.id)}>
            Remove
          </Button>
        </Card>
      ))}
    </div>
  );
}

function LabPanel() {
  const habits = useAppStore((s) => s.habits);
  const habitCompletions = useAppStore((s) => s.habitCompletions);
  const recipes = useAppStore((s) => s.recipes);
  const unsticks = useAppStore((s) => s.unsticks);
  const procrastination = useAppStore((s) => s.procrastination);
  const setProcrastination = useAppStore((s) => s.setProcrastination);
  const [answers, setAnswers] = useState<ProcrastinationStyle[]>([]);
  const [openCard, setOpenCard] = useState<string | null>(SCIENCE_CARDS[0].id);
  const [retake, setRetake] = useState(false);

  const starts = unsticks.filter((u) => u.completed).length;
  const recipeReps = recipes.reduce((n, r) => n + r.doneCount, 0);
  const habitReps = useMemo(
    () => habits.reduce((n, h) => n + habitDayCount(habitCompletions, h.id), 0),
    [habits, habitCompletions],
  );
  const auto = automaticityEstimate(Math.max(recipeReps, Math.round(habitReps / Math.max(1, habits.length))));

  function pick(style: ProcrastinationStyle, index: number) {
    const next = answers.slice(0, index);
    next[index] = style;
    setAnswers(next);
    if (index === STYLE_QUIZ.length - 1) {
      setProcrastination(styleFromAnswers(next));
      setRetake(false);
    }
  }

  const showQuiz = retake || !procrastination;

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Automaticity</p>
            <p className="mt-1 text-lg font-semibold">{auto.label}</p>
            <p className="text-xs text-muted">
              Median to plateau is {HABIT_MEDIAN_DAYS} days. {starts} starts logged.
            </p>
          </div>
          <Flame className="size-6 text-mint" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sunken">
          <div className="h-full bg-mint transition-all duration-300" style={{ width: `${auto.pct}%` }} />
        </div>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Your stall style</h2>
        {procrastination && !showQuiz ? (
          <Card className="p-5">
            <p className="font-semibold">{STYLE_META[procrastination.style].label}</p>
            <p className="mt-1 text-sm text-muted">{STYLE_META[procrastination.style].blurb}</p>
            <p className="mt-2 text-sm">{STYLE_META[procrastination.style].move}</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() => {
                setAnswers([]);
                setRetake(true);
              }}
            >
              <RotateCcw className="size-3.5" />
              Retake
            </Button>
          </Card>
        ) : (
          <Card className="space-y-4 p-5">
            {STYLE_QUIZ.map((q, i) => {
              if (i > answers.length) return null;
              return (
                <div key={q.id}>
                  <p className="mb-2 text-sm font-medium">{q.prompt}</p>
                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => pick(o.style, i)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm",
                          answers[i] === o.style ? "bg-fg text-bg" : "bg-sunken",
                        )}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Evidence</h2>
        {SCIENCE_CARDS.map((c) => {
          const open = openCard === c.id;
          return (
            <Card key={c.id} className="overflow-hidden">
              <button
                type="button"
                className="w-full px-4 py-3 text-left"
                onClick={() => setOpenCard(open ? null : c.id)}
              >
                <div className="font-medium">{c.title}</div>
              </button>
              {open ? (
                <div className="border-t border-border px-4 py-3 text-sm text-muted">
                  <p>{c.body}</p>
                  <p className="mt-2 text-fg">{c.use}</p>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
