import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { playSound } from "@/lib/audio";
import { seedReminders, seedRoutines, templateToRoutine, blankRoutine } from "@/lib/seed";
import { speak } from "@/lib/tts";
import type {
  Completion,
  InAppAlert,
  Mood,
  Routine,
  RoutineReminder,
  RunSession,
  Settings,
  StandaloneReminder,
  Step,
  Template,
  Account,
  Challenge,
  Habit,
  HabitCompletion,
  MoodEntry,
  GratitudeEntry,
  MonsterBoss,
} from "@/lib/types";
import type { WatchImportResult } from "@/lib/samsung-health-import";
import { DEFAULT_SETTINGS, DEFAULT_HABITS } from "@/lib/types";
import { TEMPLATES } from "@/lib/templates";
import { todayKey, uid } from "@/lib/utils";

export type Checks = Record<string, string[]>;

type PersistShape = {
  routines: Routine[];
  reminders: StandaloneReminder[];
  completions: Completion[];
  checks: Checks;
  settings: Settings;
  session: RunSession | null;
  alerts: InAppAlert[];
  firedKeys: string[];
  hasSeeded: boolean;
  // ForgeHealth state
  account: Account | null;
  challenge: Challenge | null;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  moodEntries: MoodEntry[];
  gratitudeEntries: GratitudeEntry[];
  monster: MonsterBoss | null;
  // Watch import
  watchImport: WatchImportResult | null;
};

type AppState = PersistShape & {
  hydrated: boolean;
  setHydrated: () => void;
  seedIfNeeded: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  addFromTemplate: (t: Template) => string;
  addBlankRoutine: () => string;
  saveRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  toggleRoutine: (id: string) => void;
  saveStep: (routineId: string, step: Step) => void;
  addStep: (routineId: string, step?: Partial<Step>) => void;
  deleteStep: (routineId: string, stepId: string) => void;
  moveStep: (routineId: string, from: number, to: number) => void;
  saveReminder: (r: StandaloneReminder) => void;
  addReminder: () => string;
  deleteReminder: (id: string) => void;
  toggleCheck: (routineId: string, stepId: string, date?: string) => void;
  startRun: (routineId: string) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  adjustTime: (deltaMs: number) => void;
  completeStep: () => void;
  skipStep: () => void;
  abortRun: () => void;
  dismissAlert: (id: string) => void;
  pushAlert: (alert: Omit<InAppAlert, "id" | "createdAt">) => void;
  markFired: (key: string) => void;
  completeOnboarding: (plantName: string, templateIds: string[]) => void;
  setCompletionMood: (completionId: string, mood: Mood) => void;
  // ForgeHealth actions
  setAccount: (account: Account) => void;
  startChallenge: (durationDays: number, buddyEmail?: string) => void;
  checkInChallenge: () => void;
  recordRelapse: (note?: string) => void;
  addXp: (amount: number) => void;
  adjustWillpower: (delta: number) => void;
  addHabit: (habit: Omit<Habit, "id" | "createdAt">) => void;
  toggleHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  completeHabit: (habitId: string, count?: number) => void;
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "timestamp">) => void;
  updateMoodEntry: (id: string, patch: Partial<MoodEntry>) => void;
  deleteMoodEntry: (id: string) => void;
  addGratitude: (text: string) => void;
  spawnMonster: () => void;
  damageMonster: (damage: number) => void;
  // Watch import actions
  setWatchImport: (data: WatchImportResult) => void;
  clearWatchImport: () => void;
};

function checkKey(date: string, routineId: string) {
  return `${date}:${routineId}`;
}

function cueStep(settings: Settings, step: Step, isLast: boolean) {
  if (settings.soundEnabled) playSound(settings.stepSound, settings.volume);
  if (settings.voiceEnabled) {
    const mins = Math.max(1, Math.round(step.durationSec / 60));
    const time =
      step.durationSec < 60
        ? `${step.durationSec} seconds`
        : mins === 1
          ? "one minute"
          : `${mins} minutes`;
    speak(`${step.title}. ${time}${isLast ? ". Last step." : "."}`, settings.volume);
  }
}

function remainingMs(session: RunSession, now = Date.now()) {
  const elapsed =
    session.status === "paused"
      ? session.elapsedBeforePause
      : session.elapsedBeforePause + (now - session.segmentStartedAt);
  return session.stepDurationMs - elapsed;
}

export { remainingMs };

function finishFrom(session: RunSession, routine: Routine, extra: Partial<RunSession> = {}): Completion {
  const now = Date.now();
  const merged: RunSession = { ...session, ...extra };
  return {
    id: uid(),
    routineId: routine.id,
    date: todayKey(),
    startedAt: merged.sessionStartedAt,
    finishedAt: now,
    completedSteps: merged.completed.length,
    totalSteps: routine.steps.length,
    skippedSteps: merged.skipped.length,
    durationSec: Math.round((now - merged.sessionStartedAt) / 1000),
    stepActualMs: merged.stepActualMs,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      routines: [],
      reminders: [],
      completions: [],
      checks: {},
      settings: DEFAULT_SETTINGS,
      session: null,
      alerts: [],
      firedKeys: [],
      hasSeeded: false,
      hydrated: false,
      // ForgeHealth initial state
      account: null,
      challenge: null,
      habits: [],
      habitCompletions: [],
      moodEntries: [],
      gratitudeEntries: [],
      monster: null,
      watchImport: null,

      setHydrated: () => set({ hydrated: true }),

      seedIfNeeded: () => {
        if (get().hasSeeded) return;
        // First-run: reminders only. Routines come from onboarding picks.
        set({
          routines: [],
          reminders: seedReminders(),
          hasSeeded: true,
        });
      },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addFromTemplate: (t) => {
        const routine = templateToRoutine(t);
        set((s) => ({ routines: [routine, ...s.routines] }));
        return routine.id;
      },

      addBlankRoutine: () => {
        const routine = blankRoutine();
        set((s) => ({ routines: [routine, ...s.routines] }));
        return routine.id;
      },

      saveRoutine: (routine) =>
        set((s) => ({
          routines: s.routines.map((r) => (r.id === routine.id ? routine : r)),
        })),

      deleteRoutine: (id) =>
        set((s) => ({
          routines: s.routines.filter((r) => r.id !== id),
          session: s.session?.routineId === id ? null : s.session,
        })),

      toggleRoutine: (id) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r,
          ),
        })),

      saveStep: (routineId, step) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, steps: r.steps.map((x) => (x.id === step.id ? step : x)) }
              : r,
          ),
        })),

      addStep: (routineId, partial) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  steps: [
                    ...r.steps,
                    {
                      id: uid(),
                      title: partial?.title ?? "New step",
                      emoji: partial?.emoji ?? "⭐",
                      durationSec: partial?.durationSec ?? 60,
                      note: partial?.note,
                    },
                  ],
                }
              : r,
          ),
        })),

      deleteStep: (routineId, stepId) =>
        set((s) => ({
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, steps: r.steps.filter((x) => x.id !== stepId) }
              : r,
          ),
        })),

      moveStep: (routineId, from, to) =>
        set((s) => ({
          routines: s.routines.map((r) => {
            if (r.id !== routineId) return r;
            if (to < 0 || to >= r.steps.length) return r;
            const steps = [...r.steps];
            const [item] = steps.splice(from, 1);
            steps.splice(to, 0, item);
            return { ...r, steps };
          }),
        })),

      saveReminder: (r) =>
        set((s) => {
          const exists = s.reminders.some((x) => x.id === r.id);
          return {
            reminders: exists
              ? s.reminders.map((x) => (x.id === r.id ? r : x))
              : [r, ...s.reminders],
          };
        }),

      addReminder: () => {
        const r: StandaloneReminder = {
          id: uid(),
          title: "New reminder",
          emoji: "⏰",
          time: "09:00",
          days: [1, 2, 3, 4, 5],
          enabled: true,
          sound: get().settings.reminderSound,
          note: "",
        };
        set((s) => ({ reminders: [r, ...s.reminders] }));
        return r.id;
      },

      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      toggleCheck: (routineId, stepId, date = todayKey()) => {
        const key = checkKey(date, routineId);
        set((s) => {
          const current = s.checks[key] ?? [];
          const next = current.includes(stepId)
            ? current.filter((id) => id !== stepId)
            : [...current, stepId];
          const checks = { ...s.checks, [key]: next };
          const routine = s.routines.find((r) => r.id === routineId);
          let completions = s.completions;
          if (routine && next.length === routine.steps.length && routine.steps.length > 0) {
            const already = completions.some(
              (c) => c.routineId === routineId && c.date === date,
            );
            if (!already) {
              completions = [
                {
                  id: uid(),
                  routineId,
                  date,
                  startedAt: Date.now(),
                  finishedAt: Date.now(),
                  completedSteps: routine.steps.length,
                  totalSteps: routine.steps.length,
                  skippedSteps: 0,
                  durationSec: 0,
                  stepActualMs: routine.steps.map((st) => st.durationSec * 1000),
                },
                ...completions,
              ];
            }
          }
          return { checks, completions };
        });
      },

      startRun: (routineId) => {
        const routine = get().routines.find((r) => r.id === routineId);
        if (!routine || routine.steps.length === 0) return;
        const first = routine.steps[0];
        const session: RunSession = {
          routineId,
          stepIndex: 0,
          status: "running",
          stepDurationMs: first.durationSec * 1000,
          segmentStartedAt: Date.now(),
          elapsedBeforePause: 0,
          skipped: [],
          completed: [],
          sessionStartedAt: Date.now(),
          spoken: { "0": true },
          stepActualMs: [],
        };
        set({ session });
        cueStep(get().settings, first, routine.steps.length === 1);
      },

      pauseRun: () => {
        const session = get().session;
        if (!session || session.status !== "running") return;
        set({
          session: {
            ...session,
            status: "paused",
            elapsedBeforePause:
              session.elapsedBeforePause + (Date.now() - session.segmentStartedAt),
          },
        });
      },

      resumeRun: () => {
        const session = get().session;
        if (!session || (session.status !== "paused" && session.status !== "overtime")) return;
        set({
          session: {
            ...session,
            status: "running",
            segmentStartedAt: Date.now(),
          },
        });
      },

      adjustTime: (deltaMs) => {
        const session = get().session;
        if (!session) return;
        set({
          session: {
            ...session,
            stepDurationMs: Math.max(5000, session.stepDurationMs + deltaMs),
          },
        });
      },

      completeStep: () => {
        const { session, routines, settings } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const used = session.stepDurationMs - remainingMs(session, now);
        const actual = [...session.stepActualMs];
        actual[session.stepIndex] = Math.max(0, used);
        const completed = session.completed.includes(session.stepIndex)
          ? session.completed
          : [...session.completed, session.stepIndex];

        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = {
            ...session,
            status: "done",
            completed,
            stepActualMs: actual,
          };
          const completion = finishFrom(doneSession, routine);
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          if (settings.soundEnabled) playSound(settings.completeSound, settings.volume);
          if (settings.voiceEnabled) speak("Routine complete. Nice work.", settings.volume);
          return;
        }

        const next = routine.steps[nextIndex];
        const nextSession: RunSession = {
          ...session,
          stepIndex: nextIndex,
          status: "running",
          stepDurationMs: next.durationSec * 1000,
          segmentStartedAt: now,
          elapsedBeforePause: 0,
          completed,
          stepActualMs: actual,
          spoken: { ...session.spoken, [String(nextIndex)]: true },
        };
        set({ session: nextSession });
        cueStep(settings, next, nextIndex === routine.steps.length - 1);
      },

      skipStep: () => {
        const { session, routines, settings } = get();
        if (!session) return;
        const routine = routines.find((r) => r.id === session.routineId);
        if (!routine) return;
        const now = Date.now();
        const used = session.stepDurationMs - remainingMs(session, now);
        const actual = [...session.stepActualMs];
        actual[session.stepIndex] = Math.max(0, used);
        const skipped = session.skipped.includes(session.stepIndex)
          ? session.skipped
          : [...session.skipped, session.stepIndex];
        const nextIndex = session.stepIndex + 1;
        if (nextIndex >= routine.steps.length) {
          const doneSession: RunSession = {
            ...session,
            status: "done",
            skipped,
            stepActualMs: actual,
          };
          const completion = finishFrom(doneSession, routine);
          set((s) => ({
            session: doneSession,
            completions: [completion, ...s.completions],
          }));
          if (settings.soundEnabled) playSound(settings.completeSound, settings.volume);
          if (settings.voiceEnabled) speak("Routine complete.", settings.volume);
          return;
        }
        const next = routine.steps[nextIndex];
        set({
          session: {
            ...session,
            stepIndex: nextIndex,
            status: "running",
            stepDurationMs: next.durationSec * 1000,
            segmentStartedAt: now,
            elapsedBeforePause: 0,
            skipped,
            stepActualMs: actual,
            spoken: { ...session.spoken, [String(nextIndex)]: true },
          },
        });
        cueStep(settings, next, nextIndex === routine.steps.length - 1);
      },

      abortRun: () => set({ session: null }),

      dismissAlert: (id) =>
        set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      pushAlert: (alert) =>
        set((s) => ({
          alerts: [
            { ...alert, id: uid(), createdAt: Date.now() },
            ...s.alerts,
          ].slice(0, 12),
        })),

      markFired: (key) =>
        set((s) => {
          const today = todayKey();
          const kept = s.firedKeys.filter((k) => k.startsWith(today) || k.includes(today));
          return { firedKeys: [...kept, key].slice(-200) };
        }),

      completeOnboarding: (plantName, templateIds) => {
        const picked = templateIds
          .map((id) => TEMPLATES.find((t) => t.id === id))
          .filter((t): t is Template => Boolean(t))
          .map((t) => templateToRoutine(t));
        const fallback = picked.length > 0 ? picked : seedRoutines().slice(0, 2);
        set((s) => ({
          routines: [
            ...fallback,
            ...s.routines.filter((r) => !r.id.startsWith("seed-")),
          ],
          reminders: s.reminders.length ? s.reminders : seedReminders(),
          hasSeeded: true,
          settings: {
            ...s.settings,
            plantName: plantName.trim() || "Sprout",
            onboardingDone: true,
          },
        }));
      },

      setCompletionMood: (completionId, mood) =>
        set((s) => ({
          completions: s.completions.map((c) =>
            c.id === completionId ? { ...c, mood } : c,
          ),
        })),

      // ForgeHealth actions
      setAccount: (account) => {
        // Save current state before switching
        const currentAccount = get().account;
        if (currentAccount) {
          const key = `forgehealth-${currentAccount.id}`;
          localStorage.setItem(key, JSON.stringify(get()));
        }
        
        // Load new account state
        const newKey = `forgehealth-${account.id}`;
        const stored = localStorage.getItem(newKey);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            set({ ...parsed, account, hydrated: true });
            return;
          } catch {}
        }
        
        // New account - set with defaults
        set({ account });
      },

      startChallenge: (durationDays, buddyEmail) => {
        const account = get().account;
        if (!account) return;
        const challenge: Challenge = {
          id: uid(),
          accountId: account.id,
          buddyEmail,
          status: "active",
          startDate: todayKey(),
          durationDays,
          agreedAt: Date.now(),
          lastCheckIn: todayKey(),
          currentStreak: 0,
          longestStreak: 0,
          relapses: [],
          xp: 0,
          willpower: 100,
        };
        set({ challenge, habits: DEFAULT_HABITS.map((h) => ({ ...h, id: uid(), createdAt: Date.now() })) });
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("forgehealth-challenge");
          bc.postMessage({ 
            type: "challenge-started", 
            accountId: account.id,
            challenge 
          });
          bc.close();
        }
        // Save buddy snapshot to shared localStorage
        if (buddyEmail) {
          localStorage.setItem(`forgehealth-buddy-${account.id}`, JSON.stringify({
            accountId: account.id,
            email: account.email,
            displayName: account.displayName,
            challenge,
            timestamp: Date.now()
          }));
        }
      },

      checkInChallenge: () => {
        set((s) => {
          if (!s.challenge || s.challenge.status !== "active") return s;
          const today = todayKey();
          if (s.challenge.lastCheckIn === today) return s;
          const newStreak = s.challenge.currentStreak + 1;
          const xpGain = 30;
          const willpowerGain = 5;
          const updatedChallenge = {
            ...s.challenge,
            lastCheckIn: today,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, s.challenge.longestStreak),
            xp: s.challenge.xp + xpGain,
            willpower: Math.min(100, s.challenge.willpower + willpowerGain),
          };
          
          // Broadcast to buddy
          if (typeof BroadcastChannel !== "undefined" && s.account) {
            const bc = new BroadcastChannel("forgehealth-challenge");
            bc.postMessage({ 
              type: "check-in", 
              accountId: s.account.id,
              challenge: updatedChallenge 
            });
            bc.close();
            
            // Update buddy snapshot
            if (s.challenge.buddyEmail) {
              localStorage.setItem(`forgehealth-buddy-${s.account.id}`, JSON.stringify({
                accountId: s.account.id,
                email: s.account.email,
                displayName: s.account.displayName,
                challenge: updatedChallenge,
                timestamp: Date.now()
              }));
            }
          }
          
          return { challenge: updatedChallenge };
        });
      },

      recordRelapse: (note) => {
        set((s) => {
          if (!s.challenge || s.challenge.status !== "active") return s;
          const relapse: import("@/lib/types").RelapseEntry = {
            id: uid(),
            date: todayKey(),
            timestamp: Date.now(),
            note,
          };
          const xpLoss = 50;
          const willpowerLoss = 30;
          return {
            challenge: {
              ...s.challenge,
              currentStreak: 0,
              relapses: [...s.challenge.relapses, relapse],
              xp: Math.max(0, s.challenge.xp - xpLoss),
              willpower: Math.max(0, s.challenge.willpower - willpowerLoss),
            },
          };
        });
      },

      addXp: (amount) => {
        set((s) => {
          if (!s.challenge) return s;
          return { challenge: { ...s.challenge, xp: s.challenge.xp + amount } };
        });
      },

      adjustWillpower: (delta) => {
        set((s) => {
          if (!s.challenge) return s;
          return {
            challenge: {
              ...s.challenge,
              willpower: Math.max(0, Math.min(100, s.challenge.willpower + delta)),
            },
          };
        });
      },

      addHabit: (habit) => {
        const newHabit: Habit = { ...habit, id: uid(), createdAt: Date.now() };
        set((s) => ({ habits: [...s.habits, newHabit] }));
      },

      toggleHabit: (habitId) => {
        set((s) => ({
          habits: s.habits.map((h) => (h.id === habitId ? { ...h, enabled: !h.enabled } : h)),
        }));
      },

      deleteHabit: (habitId) => {
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== habitId),
          habitCompletions: s.habitCompletions.filter((hc) => hc.habitId !== habitId),
        }));
      },

      completeHabit: (habitId, count = 1) => {
        const habit = get().habits.find((h) => h.id === habitId);
        if (!habit) return;
        const today = todayKey();
        const existing = get().habitCompletions.find(
          (hc) => hc.habitId === habitId && hc.date === today
        );
        if (existing) {
          set((s) => ({
            habitCompletions: s.habitCompletions.map((hc) =>
              hc.id === existing.id ? { ...hc, count: hc.count + count } : hc
            ),
          }));
        } else {
          const completion: HabitCompletion = {
            id: uid(),
            habitId,
            date: today,
            timestamp: Date.now(),
            count,
          };
          set((s) => ({ habitCompletions: [...s.habitCompletions, completion] }));
        }
        get().addXp(habit.xpPerCompletion * count);
        const monster = get().monster;
        if (monster && monster.currentHp > 0) {
          get().damageMonster(habit.xpPerCompletion * count);
        }
      },

      addMoodEntry: (entry) => {
        const newEntry: MoodEntry = { ...entry, id: uid(), timestamp: Date.now() };
        set((s) => ({ moodEntries: [newEntry, ...s.moodEntries] }));
      },

      updateMoodEntry: (id, patch) => {
        set((s) => ({
          moodEntries: s.moodEntries.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        }));
      },

      deleteMoodEntry: (id) => {
        set((s) => ({ moodEntries: s.moodEntries.filter((m) => m.id !== id) }));
      },

      addGratitude: (text) => {
        const entry: GratitudeEntry = {
          id: uid(),
          date: todayKey(),
          timestamp: Date.now(),
          text,
        };
        set((s) => ({ gratitudeEntries: [entry, ...s.gratitudeEntries] }));
      },

      spawnMonster: () => {
        const level = Math.floor(Math.random() * 3) + 1;
        const monsters = [
          { name: "Temptation Beast", emoji: "👹" },
          { name: "Urge Demon", emoji: "😈" },
          { name: "Craving Dragon", emoji: "🐉" },
        ];
        const monster = monsters[Math.floor(Math.random() * monsters.length)];
        const maxHp = 100 * level;
        set({
          monster: {
            id: uid(),
            name: monster.name,
            emoji: monster.emoji,
            maxHp,
            currentHp: maxHp,
            level,
          },
        });
      },

      damageMonster: (damage) => {
        set((s) => {
          if (!s.monster) return s;
          const newHp = Math.max(0, s.monster.currentHp - damage);
          if (newHp === 0) {
            get().addXp(s.monster.maxHp);
            return { monster: null };
          }
          return { monster: { ...s.monster, currentHp: newHp } };
        });
      },

      setWatchImport: (data) => {
        set({ watchImport: data });
      },

      clearWatchImport: () => {
        set({ watchImport: null });
      },
    }),
    {
      name: "forgehealth-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        routines: s.routines,
        reminders: s.reminders,
        completions: s.completions,
        checks: s.checks,
        settings: s.settings,
        session: s.session,
        alerts: s.alerts,
        firedKeys: s.firedKeys,
        hasSeeded: s.hasSeeded,
        account: s.account,
        challenge: s.challenge,
        habits: s.habits,
        habitCompletions: s.habitCompletions,
        moodEntries: s.moodEntries,
        gratitudeEntries: s.gratitudeEntries,
        monster: s.monster,
        watchImport: s.watchImport,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistShape>;
        const settings = {
          ...DEFAULT_SETTINGS,
          ...(p.settings ?? {}),
        };
        // Legacy installs already had routines — skip onboarding once.
        if (
          !settings.onboardingDone &&
          Array.isArray(p.routines) &&
          p.routines.length > 0
        ) {
          settings.onboardingDone = true;
          if (!settings.plantName) settings.plantName = "Sprout";
        }
        return {
          ...current,
          ...p,
          settings,
          hydrated: false,
        };
      },
    },
  ),
);

export function checksFor(checks: Checks, routineId: string, date = todayKey()) {
  return checks[checkKey(date, routineId)] ?? [];
}

export function hydrateStore() {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    const s = useAppStore.getState();
    if (!s.hasSeeded) s.seedIfNeeded();
    s.setHydrated();
  };
  void Promise.resolve(useAppStore.persist.rehydrate()).then(finish, finish);
  if (useAppStore.persist.hasHydrated()) finish();
}

export function formatCue(step: Step) {
  return `${step.emoji} ${step.title}`;
}

export type { RoutineReminder };
