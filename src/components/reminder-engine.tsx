import { playSound } from "@/lib/audio";
import { useAppStore } from "@/lib/store";
import { isScheduledToday } from "@/lib/stats";
import { speak } from "@/lib/tts";
import { addMinutes, nowHm, parseHm, todayKey } from "@/lib/utils";
import { useEffect } from "react";

function maybeNotify(title: string, body: string) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch {
    /* ignored — in-app alert still fires */
  }
}

export function ReminderEngine() {
  const routines = useAppStore((s) => s.routines);
  const reminders = useAppStore((s) => s.reminders);
  const firedKeys = useAppStore((s) => s.firedKeys);
  const settings = useAppStore((s) => s.settings);
  const markFired = useAppStore((s) => s.markFired);
  const pushAlert = useAppStore((s) => s.pushAlert);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;

    const tick = () => {
      const hm = nowHm();
      const nowMin = parseHm(hm);
      const date = todayKey();
      const state = useAppStore.getState();

      for (const r of state.routines) {
        if (!r.enabled || r.anytime || !isScheduledToday(r)) continue;
        for (const rem of r.reminders) {
          if (!rem.enabled) continue;
          const fireAt = addMinutes(r.startTime, -rem.minutesBefore);
          const fireMin = parseHm(fireAt);
          const key = `${date}:routine:${r.id}:${rem.id}`;
          if (state.firedKeys.includes(key)) continue;
          if (nowMin >= fireMin && nowMin <= fireMin + 4) {
            markFired(key);
            const body =
              rem.minutesBefore === 0
                ? `${r.name} starts now`
                : `${r.name} starts in ${rem.minutesBefore} min`;
            pushAlert({ title: r.name, body, emoji: r.emoji, routineId: r.id });
            if (settings.soundEnabled) playSound(rem.sound, settings.volume);
            if (settings.voiceEnabled) speak(body, settings.volume);
            maybeNotify(r.name, body);
          }
        }
      }

      for (const rem of state.reminders) {
        if (!rem.enabled || !rem.days.includes(new Date().getDay())) continue;
        const fireMin = parseHm(rem.time);
        const key = `${date}:solo:${rem.id}`;
        if (state.firedKeys.includes(key)) continue;
        if (nowMin >= fireMin && nowMin <= fireMin + 4) {
          markFired(key);
          pushAlert({
            title: rem.title,
            body: rem.note || "Reminder",
            emoji: rem.emoji,
          });
          if (settings.soundEnabled) playSound(rem.sound, settings.volume);
          if (settings.voiceEnabled) speak(rem.title, settings.volume);
          maybeNotify(rem.title, rem.note || "Reminder");
        }
      }
    };

    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, [hydrated, routines, reminders, firedKeys, settings, markFired, pushAlert]);

  return null;
}
