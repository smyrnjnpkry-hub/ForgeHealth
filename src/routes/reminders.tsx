import { DayToggle } from "@/components/days";
import { EmojiPicker, IconBadge } from "@/components/emoji-picker";
import { Button, Card, Input, Modal, Switch } from "@/components/ui";
import { SOUND_LABELS } from "@/lib/audio";
import { useAppStore } from "@/lib/store";
import type { SoundId, StandaloneReminder } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/reminders")({ component: RemindersPage });

function RemindersPage() {
  const reminders = useAppStore((s) => s.reminders);
  const routines = useAppStore((s) => s.routines);
  const add = useAppStore((s) => s.addReminder);
  const save = useAppStore((s) => s.saveReminder);
  const del = useAppStore((s) => s.deleteReminder);
  const saveRoutine = useAppStore((s) => s.saveRoutine);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = reminders.find((r) => r.id === editId) ?? null;

  const routineNudge = routines.flatMap((r) =>
    r.reminders
      .filter((x) => x.enabled)
      .map((x) => ({
        routine: r,
        rem: x,
      })),
  );

  return (
    <main className="px-5 pt-6 pb-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
          <p className="mt-1 text-sm text-muted">
            Nudge a routine, or ping a habit on its own.
          </p>
        </div>
        <Button
          size="icon"
          variant="sun"
          aria-label="Add reminder"
          onClick={() => {
            const id = add();
            setEditId(id);
          }}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <h2 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Standalone
      </h2>
      {reminders.length === 0 ? (
        <Card className="px-4 py-8 text-center text-sm text-muted">
          No standalone reminders yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <Card key={r.id} className="flex items-center gap-3 p-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                onClick={() => setEditId(r.id)}
              >
                <IconBadge emoji={r.emoji} seed={r.id} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{r.title}</span>
                  <span className="text-xs text-muted">{formatTime(r.time)}</span>
                </span>
              </button>
              <Switch
                checked={r.enabled}
                onCheckedChange={(v) => save({ ...r, enabled: v })}
              />
            </Card>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Routine cues
      </h2>
      <div className="space-y-2">
        {routineNudge.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted">
            Routines can ping you minutes before they start. Edit a routine to add one.
          </Card>
        ) : (
          routineNudge.map(({ routine, rem }) => (
            <Card key={`${routine.id}-${rem.id}`} className="flex items-center gap-3 p-3">
              <Bell className="size-4 text-muted" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{routine.name}</div>
                <div className="text-xs text-muted">
                  {rem.minutesBefore === 0
                    ? "At start"
                    : `${rem.minutesBefore} min before ${formatTime(routine.startTime)}`}
                </div>
              </div>
              <Switch
                checked={rem.enabled}
                onCheckedChange={(v) =>
                  saveRoutine({
                    ...routine,
                    reminders: routine.reminders.map((x) =>
                      x.id === rem.id ? { ...x, enabled: v } : x,
                    ),
                  })
                }
              />
            </Card>
          ))
        )}
      </div>

      <EditReminder
        reminder={editing}
        onClose={() => setEditId(null)}
        onSave={(r) => {
          save(r);
          setEditId(null);
        }}
        onDelete={(id) => {
          del(id);
          setEditId(null);
        }}
      />
    </main>
  );
}

function EditReminder({
  reminder,
  onClose,
  onSave,
  onDelete,
}: {
  reminder: StandaloneReminder | null;
  onClose: () => void;
  onSave: (r: StandaloneReminder) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<StandaloneReminder | null>(reminder);
  useEffect(() => {
    setDraft(reminder);
  }, [reminder]);
  if (!reminder || !draft) return null;

  return (
    <Modal open onClose={onClose} title="Reminder">
      <div className="space-y-4">
        <EmojiPicker
          value={draft.emoji}
          onChange={(emoji) => setDraft({ ...draft, emoji })}
        />
        <Input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Title"
        />
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Time</span>
          <Input
            type="time"
            value={draft.time}
            onChange={(e) => setDraft({ ...draft, time: e.target.value })}
          />
        </label>
        <div>
          <div className="mb-2 text-sm text-muted">Days</div>
          <DayToggle
            value={draft.days}
            onChange={(days) => setDraft({ ...draft, days })}
          />
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Note</span>
          <Input
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            placeholder="Optional"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Sound</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-surface px-3"
            value={draft.sound}
            onChange={(e) => setDraft({ ...draft, sound: e.target.value as SoundId })}
          >
            {Object.entries(SOUND_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" variant="solid" onClick={() => onSave(draft)}>
            Save
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(draft.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
