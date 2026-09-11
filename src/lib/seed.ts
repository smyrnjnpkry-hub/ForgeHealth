import { TEMPLATES } from "@/lib/templates";
import type { Routine, StandaloneReminder, Template } from "@/lib/types";
import { uid } from "@/lib/utils";

export function templateToRoutine(t: Template, id: string = uid()): Routine {
  return {
    id,
    name: t.name,
    emoji: t.emoji,
    steps: t.steps.map((s) => ({ ...s, id: uid() })),
    days: [...t.days],
    startTime: t.startTime,
    anytime: Boolean(t.anytime),
    reminders: t.anytime
      ? []
      : [
          {
            id: uid(),
            enabled: true,
            minutesBefore: 5,
            sound: "bell",
          },
        ],
    enabled: true,
    showIcons: true,
    showDays: true,
    showProgress: true,
    createdAt: Date.now(),
  };
}

export function blankRoutine(): Routine {
  return {
    id: uid(),
    name: "New routine",
    emoji: "☀️",
    steps: [
      { id: uid(), title: "First step", emoji: "💧", durationSec: 60 },
    ],
    days: [0, 1, 2, 3, 4, 5, 6],
    startTime: "07:00",
    anytime: false,
    reminders: [
      { id: uid(), enabled: true, minutesBefore: 5, sound: "bell" },
    ],
    enabled: true,
    showIcons: true,
    showDays: true,
    showProgress: true,
    createdAt: Date.now(),
  };
}

export function seedRoutines(): Routine[] {
  const morning = TEMPLATES.find((t) => t.id === "morning")!;
  const night = TEMPLATES.find((t) => t.id === "night")!;
  const start = TEMPLATES.find((t) => t.id === "adhd-start")!;
  return [
    templateToRoutine(morning, "seed-morning"),
    templateToRoutine(night, "seed-night"),
    templateToRoutine(start, "seed-start"),
  ];
}

export function seedReminders(): StandaloneReminder[] {
  return [
    {
      id: "seed-vitamins",
      title: "Take vitamins",
      emoji: "💊",
      time: "08:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      sound: "ding",
      note: "With breakfast water.",
    },
    {
      id: "seed-standup",
      title: "Stand and stretch",
      emoji: "🧍",
      time: "15:00",
      days: [1, 2, 3, 4, 5],
      enabled: true,
      sound: "wood",
      note: "Two minutes away from the screen.",
    },
  ];
}
