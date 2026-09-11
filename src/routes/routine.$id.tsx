import { DayToggle } from "@/components/days";
import { DurationPicker } from "@/components/duration";
import { EmojiPicker, IconBadge } from "@/components/emoji-picker";
import { Button, Card, Input, Modal, Switch } from "@/components/ui";
import { SOUND_LABELS } from "@/lib/audio";
import { checksFor, useAppStore } from "@/lib/store";
import { endTime, totalSec } from "@/lib/stats";
import type { Routine, SoundId, Step } from "@/lib/types";
import { formatDuration, formatTime, uid } from "@/lib/utils";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Play, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/routine/$id")({ component: RoutinePage });

function RoutinePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const routines = useAppStore((s) => s.routines);
  const save = useAppStore((s) => s.saveRoutine);
  const addBlank = useAppStore((s) => s.addBlankRoutine);
  const del = useAppStore((s) => s.deleteRoutine);
  const addStep = useAppStore((s) => s.addStep);
  const saveStep = useAppStore((s) => s.saveStep);
  const deleteStep = useAppStore((s) => s.deleteStep);
  const moveStep = useAppStore((s) => s.moveStep);
  const toggleCheck = useAppStore((s) => s.toggleCheck);
  const checks = useAppStore((s) => s.checks);
  const [stepId, setStepId] = useState<string | null>(null);
  const [mode, setMode] = useState<"routine" | "checklist">("routine");

  useEffect(() => {
    if (id !== "new") return;
    const nid = addBlank();
    void navigate({ to: "/routine/$id", params: { id: nid }, replace: true });
  }, [id, addBlank, navigate]);

  const routine = routines.find((r) => r.id === id);
  const checked = routine ? checksFor(checks, routine.id) : [];
  const editing = routine?.steps.find((s) => s.id === stepId) ?? null;

  if (id === "new") {
    return <div className="p-8 text-sm text-muted">Creating…</div>;
  }
  if (!routine) {
    return (
      <main className="px-5 py-12 text-center">
        <p className="font-medium">Routine gone</p>
        <Link to="/" className="mt-3 inline-block text-sm text-muted underline">
          Back to today
        </Link>
      </main>
    );
  }

  const current = routine;

  function patch(p: Partial<Routine>) {
    save({ ...current, ...p });
  }

  return (
    <main className="px-5 pt-4 pb-10">
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted">
          Back
        </Link>
        <button
          type="button"
          className="text-sm text-coral"
          onClick={() => {
            if (confirm("Delete this routine?")) {
              del(routine.id);
              void navigate({ to: "/" });
            }
          }}
        >
          Delete
        </button>
      </div>

      <button type="button" onClick={() => setStepId("__emoji__")} className="mb-2">
        <IconBadge emoji={routine.emoji} seed={routine.id} size="lg" />
      </button>
      <Input
        className="border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight shadow-none"
        value={routine.name}
        onChange={(e) => patch({ name: e.target.value })}
      />
      <p className="text-sm text-muted">
        {routine.anytime
          ? "Anytime"
          : `${formatTime(routine.startTime)} – ${formatTime(endTime(routine))}`}
        {" · "}
        {formatDuration(totalSec(routine))}
      </p>

      <div className="mt-4 flex rounded-full bg-sunken p-1">
        {(["routine", "checklist"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`h-9 flex-1 rounded-full text-sm font-medium capitalize ${
              mode === m ? "bg-surface shadow-card" : "text-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <Card className="mt-4 divide-y divide-border px-4">
        <label className="flex items-center justify-between py-3 text-sm">
          <span>Anytime</span>
          <Switch
            checked={routine.anytime}
            onCheckedChange={(v) => patch({ anytime: v })}
          />
        </label>
        {!routine.anytime ? (
          <label className="flex items-center justify-between py-3 text-sm">
            <span>Start</span>
            <Input
              type="time"
              className="h-10 w-32"
              value={routine.startTime}
              onChange={(e) => patch({ startTime: e.target.value })}
            />
          </label>
        ) : null}
        <div className="py-3">
          <div className="mb-2 text-sm">Days</div>
          <DayToggle value={routine.days} onChange={(days) => patch({ days })} />
        </div>
        <label className="flex items-center justify-between py-3 text-sm">
          <span>Enabled</span>
          <Switch
            checked={routine.enabled}
            onCheckedChange={(v) => patch({ enabled: v })}
          />
        </label>
      </Card>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Reminders
      </h2>
      <Card className="divide-y divide-border">
        {routine.reminders.map((rem) => (
          <div key={rem.id} className="flex items-center gap-3 px-4 py-3">
            <Switch
              checked={rem.enabled}
              onCheckedChange={(v) =>
                patch({
                  reminders: routine.reminders.map((x) =>
                    x.id === rem.id ? { ...x, enabled: v } : x,
                  ),
                })
              }
            />
            <div className="min-w-0 flex-1">
              <select
                className="w-full bg-transparent text-sm"
                value={rem.minutesBefore}
                onChange={(e) =>
                  patch({
                    reminders: routine.reminders.map((x) =>
                      x.id === rem.id
                        ? { ...x, minutesBefore: Number(e.target.value) }
                        : x,
                    ),
                  })
                }
              >
                {[0, 1, 5, 10, 15, 30, 60].map((n) => (
                  <option key={n} value={n}>
                    {n === 0 ? "At start time" : `${n} min before`}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="h-9 rounded-lg bg-sunken px-2 text-xs"
              value={rem.sound}
              onChange={(e) =>
                patch({
                  reminders: routine.reminders.map((x) =>
                    x.id === rem.id ? { ...x, sound: e.target.value as SoundId } : x,
                  ),
                })
              }
            >
              {Object.entries(SOUND_LABELS).map(([sid, name]) => (
                <option key={sid} value={sid}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-faint"
              onClick={() =>
                patch({
                  reminders: routine.reminders.filter((x) => x.id !== rem.id),
                })
              }
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
          onClick={() =>
            patch({
              reminders: [
                ...routine.reminders,
                { id: uid(), enabled: true, minutesBefore: 5, sound: "bell" },
              ],
            })
          }
        >
          <Plus className="size-4" />
          Add reminder
        </button>
      </Card>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Steps
      </h2>
      <div className="space-y-2">
        {routine.steps.map((step, i) => {
          const on = checked.includes(step.id);
          return (
            <Card key={step.id} className="flex items-center gap-2 p-2 pr-3">
              {mode === "checklist" ? (
                <button
                  type="button"
                  onClick={() => toggleCheck(routine.id, step.id)}
                  className={`size-7 rounded-full border ${
                    on ? "border-mint bg-mint" : "border-border"
                  }`}
                  aria-label="Toggle"
                />
              ) : (
                <div className="flex flex-col">
                  <button type="button" onClick={() => moveStep(routine.id, i, i - 1)}>
                    <ChevronUp className="size-4 text-faint" />
                  </button>
                  <button type="button" onClick={() => moveStep(routine.id, i, i + 1)}>
                    <ChevronDown className="size-4 text-faint" />
                  </button>
                </div>
              )}
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => setStepId(step.id)}
              >
                <span className="text-lg">{step.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {step.title}
                </span>
                <span className="text-sm tabular-nums text-muted">
                  {formatDuration(step.durationSec)}
                </span>
              </button>
            </Card>
          );
        })}
      </div>
      <Button
        className="mt-3 w-full"
        variant="outline"
        onClick={() => addStep(routine.id)}
      >
        <Plus className="size-4" />
        Add step
      </Button>

      <Button
        className="mt-6 w-full"
        size="pill"
        variant="solid"
        onClick={() => {
          useAppStore.getState().startRun(routine.id);
          void navigate({ to: "/run/$id", params: { id: routine.id } });
        }}
      >
        <Play className="size-4 fill-current" />
        Start
      </Button>

      <StepEditor
        open={Boolean(editing)}
        step={editing}
        onClose={() => setStepId(null)}
        onSave={(s) => {
          saveStep(routine.id, s);
          setStepId(null);
        }}
        onDelete={() => {
          if (editing) deleteStep(routine.id, editing.id);
          setStepId(null);
        }}
      />

      <Modal
        open={stepId === "__emoji__"}
        onClose={() => setStepId(null)}
        title="Routine icon"
      >
        <EmojiPicker value={routine.emoji} onChange={(emoji) => patch({ emoji })} />
        <Button className="mt-4 w-full" onClick={() => setStepId(null)}>
          Done
        </Button>
      </Modal>
    </main>
  );
}

function StepEditor({
  open,
  step,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  step: Step | null;
  onClose: () => void;
  onSave: (s: Step) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Step | null>(step);
  useEffect(() => {
    setDraft(step);
  }, [step]);
  if (!open || !draft) return null;
  return (
    <Modal open onClose={onClose} title="Step">
      <div className="space-y-4">
        <EmojiPicker value={draft.emoji} onChange={(emoji) => setDraft({ ...draft, emoji })} />
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
        <DurationPicker
          value={draft.durationSec}
          onChange={(durationSec) => setDraft({ ...draft, durationSec })}
        />
        <Input
          value={draft.note ?? ""}
          placeholder="Note (optional)"
          onChange={(e) => setDraft({ ...draft, note: e.target.value })}
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onSave(draft)}>
            Save
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
