import { Button, Card, Field, Input, Switch } from "@/components/ui";
import { NOISE_LABELS, SOUND_LABELS, playSound, startNoise, stopNoise } from "@/lib/audio";
import { useAppStore } from "@/lib/store";
import type { NoiseId, RingColor, SoundId } from "@/lib/types";
import { RING_HEX } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/you")({ component: You });

const RINGS: RingColor[] = ["sun", "mint", "sky", "coral", "ink"];

function You() {
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const routines = useAppStore((s) => s.routines);

  useEffect(() => () => stopNoise(), []);

  async function enableNotify() {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    update({ notifyEnabled: perm === "granted" });
  }

  return (
    <main className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-semibold tracking-tight">You</h1>
      <p className="mt-1 text-sm text-muted">Sounds, voice, timer look, theme.</p>

      <Card className="mt-5 divide-y divide-border px-4">
        <Field label="Your name">
          <Input
            className="max-w-40"
            value={settings.displayName}
            placeholder="Optional"
            onChange={(e) => update({ displayName: e.target.value })}
          />
        </Field>
        <Field label="Plant name" hint="Shown on Today and after a run.">
          <Input
            className="max-w-40"
            value={settings.plantName}
            placeholder="Sprout"
            maxLength={24}
            onChange={(e) => update({ plantName: e.target.value })}
          />
        </Field>
        <Field label="Dark mode" hint="Matches the night wind-down energy.">
          <Switch
            checked={settings.theme === "dark"}
            onCheckedChange={(v) => update({ theme: v ? "dark" : "light" })}
          />
        </Field>
      </Card>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Voice & sound
      </h2>
      <Card className="divide-y divide-border px-4">
        <Field label="Voice cues" hint="Speaks the next step out loud.">
          <Switch
            checked={settings.voiceEnabled}
            onCheckedChange={(v) => update({ voiceEnabled: v })}
          />
        </Field>
        <Field label="Sounds">
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={(v) => update({ soundEnabled: v })}
          />
        </Field>
        <Field label="Volume">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            className="w-28 accent-sun"
          />
        </Field>
        {(
          [
            ["stepSound", "Step chime"],
            ["completeSound", "Routine done"],
            ["reminderSound", "Reminder"],
          ] as const
        ).map(([key, label]) => (
          <Field key={key} label={label}>
            <select
              className="h-10 rounded-xl border border-border bg-surface px-2 text-sm"
              value={settings[key]}
              onChange={(e) => {
                const v = e.target.value as SoundId;
                update({ [key]: v });
                playSound(v, settings.volume);
              }}
            >
              {Object.entries(SOUND_LABELS).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        ))}
        <Field label="White noise" hint="Plays while a timer runs.">
          <select
            className="h-10 rounded-xl border border-border bg-surface px-2 text-sm"
            value={settings.whiteNoise}
            onChange={(e) => {
              const v = e.target.value as NoiseId;
              update({ whiteNoise: v });
              if (v === "off") stopNoise();
              else startNoise(v, settings.whiteNoiseVolume);
            }}
          >
            {Object.entries(NOISE_LABELS).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Timer screen
      </h2>
      <Card className="divide-y divide-border px-4">
        <Field label="Auto-next" hint="Advance when a step hits zero.">
          <Switch
            checked={settings.autoNext}
            onCheckedChange={(v) => update({ autoNext: v })}
          />
        </Field>
        <Field label="Show next step">
          <Switch
            checked={settings.timerShowNext}
            onCheckedChange={(v) => update({ timerShowNext: v })}
          />
        </Field>
        <Field label="Time adjust" hint="+1 / −1 on the timer.">
          <Switch
            checked={settings.timerShowAdjust}
            onCheckedChange={(v) => update({ timerShowAdjust: v })}
          />
        </Field>
        <div className="py-3">
          <div className="mb-2 text-sm font-medium">Ring color</div>
          <div className="flex gap-2">
            {RINGS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => update({ ringColor: c })}
                className="size-9 rounded-full border-2"
                style={{
                  background: RING_HEX[c],
                  borderColor: settings.ringColor === c ? "var(--color-fg)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      <h2 className="mt-8 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
        Notifications
      </h2>
      <Card className="px-4 py-3">
        <Field
          label="Browser alerts"
          hint="Fires while Dayring is open. Allow once."
        >
          <Button size="sm" variant="outline" onClick={() => void enableNotify()}>
            {settings.notifyEnabled ? "Allowed" : "Allow"}
          </Button>
        </Field>
      </Card>

      <p className="mt-8 text-center text-xs text-faint">
        {routines.length} routines on this device · saved locally
      </p>
    </main>
  );
}
