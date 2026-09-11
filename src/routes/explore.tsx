import { IconBadge } from "@/components/emoji-picker";
import { Button, Card } from "@/components/ui";
import { TEMPLATES } from "@/lib/templates";
import { useAppStore } from "@/lib/store";
import { formatDuration } from "@/lib/utils";
import type { Template } from "@/lib/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/explore")({ component: Explore });

const CATS = [
  { value: "all", label: "All" },
  { value: "morning", label: "Morning" },
  { value: "night", label: "Night" },
  { value: "focus", label: "Focus" },
  { value: "body", label: "Body" },
  { value: "adhd", label: "ADHD" },
  { value: "reset", label: "Reset" },
] as const;

function Explore() {
  const [cat, setCat] = useState<(typeof CATS)[number]["value"]>("all");
  const [q, setQ] = useState("");
  const add = useAppStore((s) => s.addFromTemplate);
  const navigate = useNavigate();
  const list = useMemo(() => {
    return TEMPLATES.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!q.trim()) return true;
      const hay = `${t.name} ${t.blurb} ${t.steps.map((s) => s.title).join(" ")}`.toLowerCase();
      return hay.includes(q.trim().toLowerCase());
    });
  }, [cat, q]);

  function adopt(t: Template) {
    const id = add(t);
    void navigate({ to: "/routine/$id", params: { id } });
  }

  return (
    <main className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
      <p className="mt-1 text-sm text-muted">
        Ready-made sequences. Add one, then make it yours.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search routines"
        className="mt-4 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm"
      />
      <div className="mt-4 -mx-5 overflow-x-auto px-5">
        <div className="flex gap-1.5 pb-1">
          {CATS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCat(c.value)}
              className={`h-9 shrink-0 rounded-full px-3 text-sm font-medium ${
                cat === c.value ? "bg-fg text-bg" : "bg-sunken text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {list.map((t) => (
          <Card key={t.id} className="p-4">
            <div className="flex items-start gap-3">
              <IconBadge emoji={t.emoji} seed={t.id} />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold tracking-tight">{t.name}</h2>
                <p className="text-sm text-muted">{t.blurb}</p>
                <p className="mt-1 text-xs text-faint">
                  {t.steps.length} steps · {formatDuration(t.steps.reduce((n, s) => n + s.durationSec, 0))}
                  {t.anytime ? " · anytime" : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {t.steps.slice(0, 6).map((s, i) => (
                    <span key={`${s.title}-${i}`} className="text-base">
                      {s.emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              className="mt-3 w-full"
              variant="sun"
              onClick={() => adopt(t)}
            >
              Add to my day
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
