import { Plant } from "@/components/plant";
import { Button, Input } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { formatDuration, cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const STARTERS = ["morning", "night", "adhd-start", "yoga", "selfcare", "pomo"] as const;

export function Onboarding() {
  const complete = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState<0 | 1>(0);
  const [name, setName] = useState("Sprout");
  const [picked, setPicked] = useState<string[]>(["morning"]);

  const options = useMemo(
    () => TEMPLATES.filter((t) => (STARTERS as readonly string[]).includes(t.id)),
    [],
  );

  function toggle(id: string) {
    setPicked((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  function finish() {
    complete(name.trim() || "Sprout", picked.slice(0, 2));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg px-5 pt-10 pb-8">
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              step === i ? "bg-sun" : "bg-sunken",
            )}
          />
        ))}
      </div>

      {step === 0 ? (
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-3xl bg-sunken p-4">
              <Plant level={2} size={96} />
            </div>
            <p className="text-sm font-medium text-mint">Welcome to Dayring</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Name your plant
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted">
              It grows with your streak. Pick a name you will want to water.
            </p>
          </div>
          <label className="mt-8 block">
            <span className="mb-2 block text-sm font-medium">Plant name</span>
            <Input
              value={name}
              maxLength={24}
              placeholder="Sprout"
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </label>
          <div className="mt-auto pt-8">
            <Button
              className="w-full"
              size="pill"
              variant="sun"
              onClick={() => setStep(1)}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="text-center">
            <p className="text-sm font-medium text-mint">Starter rails</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Pick 1–2 routines
            </h1>
            <p className="mt-2 text-sm text-muted">
              You can add more anytime from Explore.
            </p>
          </div>
          <div className="mt-6 space-y-2 overflow-y-auto">
            {options.map((t) => {
              const on = picked.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggle(t.id)}
                  className={cn(
                    "w-full rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.99]",
                    on
                      ? "border-sun bg-sun/15 shadow-card"
                      : "border-transparent bg-surface shadow-card",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold tracking-tight">{t.name}</div>
                      <p className="text-sm text-muted">{t.blurb}</p>
                      <p className="mt-1 text-xs text-faint">
                        {t.steps.length} steps ·{" "}
                        {formatDuration(
                          t.steps.reduce((n, s) => n + s.durationSec, 0),
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "mt-1 flex size-6 items-center justify-center rounded-full text-xs font-bold",
                        on ? "bg-sun text-sun-ink" : "bg-sunken text-muted",
                      )}
                      aria-hidden
                    >
                      {on ? "✓" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex gap-2 pt-6">
            <Button
              className="flex-1"
              size="pill"
              variant="soft"
              onClick={() => setStep(0)}
            >
              Back
            </Button>
            <Button
              className="flex-[1.4]"
              size="pill"
              variant="sun"
              disabled={picked.length === 0}
              onClick={finish}
            >
              Start growing
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
