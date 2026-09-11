export type SoundId =
  | "chime"
  | "bell"
  | "ding"
  | "wood"
  | "beep"
  | "success";

export type NoiseId = "off" | "white" | "pink" | "brown" | "rain" | "fan";

export type RingColor = "sun" | "mint" | "sky" | "coral" | "ink";

export type Mood = "good" | "ok" | "low";

export type Step = {
  id: string;
  title: string;
  emoji: string;
  durationSec: number;
  note?: string;
};

export type RoutineReminder = {
  id: string;
  enabled: boolean;
  minutesBefore: number;
  sound: SoundId;
};

export type Routine = {
  id: string;
  name: string;
  emoji: string;
  steps: Step[];
  days: number[];
  startTime: string;
  anytime: boolean;
  reminders: RoutineReminder[];
  enabled: boolean;
  showIcons: boolean;
  showDays: boolean;
  showProgress: boolean;
  createdAt: number;
};

export type StandaloneReminder = {
  id: string;
  title: string;
  emoji: string;
  time: string;
  days: number[];
  enabled: boolean;
  sound: SoundId;
  note: string;
};

export type Completion = {
  id: string;
  routineId: string;
  date: string;
  startedAt: number;
  finishedAt: number;
  completedSteps: number;
  totalSteps: number;
  skippedSteps: number;
  durationSec: number;
  stepActualMs: number[];
  mood?: Mood;
};

export type RunStatus = "running" | "paused" | "overtime" | "done";

export type RunSession = {
  routineId: string;
  stepIndex: number;
  status: RunStatus;
  stepDurationMs: number;
  segmentStartedAt: number;
  elapsedBeforePause: number;
  skipped: number[];
  completed: number[];
  sessionStartedAt: number;
  spoken: Record<string, boolean>;
  stepActualMs: number[];
};

export type Settings = {
  displayName: string;
  plantName: string;
  onboardingDone: boolean;
  theme: "light" | "dark";
  voiceEnabled: boolean;
  soundEnabled: boolean;
  stepSound: SoundId;
  completeSound: SoundId;
  reminderSound: SoundId;
  whiteNoise: NoiseId;
  whiteNoiseVolume: number;
  autoNext: boolean;
  ringColor: RingColor;
  timerShowNext: boolean;
  timerShowAdjust: boolean;
  volume: number;
  notifyEnabled: boolean;
  identity: string;
};

export type InAppAlert = {
  id: string;
  title: string;
  body: string;
  emoji: string;
  routineId?: string;
  createdAt: number;
};

export type Template = {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  category: "morning" | "night" | "focus" | "body" | "reset" | "adhd";
  startTime: string;
  anytime?: boolean;
  days: number[];
  steps: Omit<Step, "id">[];
};

export const DEFAULT_SETTINGS: Settings = {
  displayName: "",
  plantName: "Sprout",
  onboardingDone: false,
  theme: "light",
  voiceEnabled: true,
  soundEnabled: true,
  stepSound: "chime",
  completeSound: "success",
  reminderSound: "bell",
  whiteNoise: "off",
  whiteNoiseVolume: 0.22,
  autoNext: true,
  ringColor: "sun",
  timerShowNext: true,
  timerShowAdjust: true,
  volume: 0.75,
  notifyEnabled: false,
  identity: "I am someone who starts, even when I do not feel like it.",
};

export const RING_HEX: Record<RingColor, string> = {
  sun: "#f5c400",
  mint: "#2f9e6b",
  sky: "#4d8fe8",
  coral: "#e86a4d",
  ink: "#1a1a24",
};

export const MOOD_META: Record<Mood, { emoji: string; label: string }> = {
  good: { emoji: "😊", label: "Good" },
  ok: { emoji: "😐", label: "Okay" },
  low: { emoji: "😔", label: "Low" },
};

export type Account = {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
};

export type ChallengeStatus = "pending" | "active" | "completed" | "abandoned";

export type Challenge = {
  id: string;
  accountId: string;
  buddyEmail?: string;
  status: ChallengeStatus;
  startDate: string;
  durationDays: number;
  agreedAt: number;
  lastCheckIn: string;
  currentStreak: number;
  longestStreak: number;
  relapses: RelapseEntry[];
  xp: number;
  willpower: number;
};

export type RelapseEntry = {
  id: string;
  date: string;
  timestamp: number;
  note?: string;
};

export type HabitType =
  | "gym"
  | "hydration"
  | "cold_shower"
  | "meditation"
  | "learning"
  | "gratitude"
  | "start"
  | "custom";

export type Habit = {
  id: string;
  type: HabitType;
  title: string;
  emoji: string;
  targetPerDay: number;
  xpPerCompletion: number;
  enabled: boolean;
  createdAt: number;
  cue?: string;
};

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
  timestamp: number;
  count: number;
};

export type MoodEntryMood =
  | "ecstatic"
  | "happy"
  | "good"
  | "okay"
  | "low"
  | "sad"
  | "distressed"
  | "anxious";

export type MoodEntry = {
  id: string;
  date: string;
  timestamp: number;
  mood: MoodEntryMood;
  intensity: number;
  tags: string[];
  note?: string;
  photoDataUrl?: string;
};

export type GratitudeEntry = {
  id: string;
  date: string;
  timestamp: number;
  text: string;
};

export type MonsterBoss = {
  id: string;
  name: string;
  emoji: string;
  maxHp: number;
  currentHp: number;
  level: number;
};

export type XPLevel = {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
};

export const XP_LEVELS: XPLevel[] = [
  { level: 1, name: "Beginner", minXp: 0, maxXp: 299 },
  { level: 2, name: "Novice", minXp: 300, maxXp: 599 },
  { level: 3, name: "Apprentice", minXp: 600, maxXp: 999 },
  { level: 4, name: "Adept", minXp: 1000, maxXp: 1499 },
  { level: 5, name: "Expert", minXp: 1500, maxXp: 2099 },
  { level: 6, name: "Master", minXp: 2100, maxXp: 2799 },
  { level: 7, name: "Champion", minXp: 2800, maxXp: 3599 },
  { level: 8, name: "Legend", minXp: 3600, maxXp: 4999 },
  { level: 9, name: "Mythic", minXp: 5000, maxXp: 99999 },
];

export const MOOD_ENTRY_META: Record<
  MoodEntryMood,
  { emoji: string; label: string; color: string }
> = {
  ecstatic: { emoji: "🤩", label: "Ecstatic", color: "#10b981" },
  happy: { emoji: "😊", label: "Happy", color: "#34d399" },
  good: { emoji: "🙂", label: "Good", color: "#6ee7b7" },
  okay: { emoji: "😐", label: "Okay", color: "#fbbf24" },
  low: { emoji: "😔", label: "Low", color: "#fb923c" },
  sad: { emoji: "😢", label: "Sad", color: "#f87171" },
  distressed: { emoji: "😰", label: "Distressed", color: "#ef4444" },
  anxious: { emoji: "😟", label: "Anxious", color: "#dc2626" },
};

export const DEFAULT_HABITS: Omit<Habit, "id" | "createdAt">[] = [
  {
    type: "start",
    title: "Two-minute start",
    emoji: "⚡",
    targetPerDay: 1,
    xpPerCompletion: 20,
    enabled: true,
    cue: "After I sit down to work",
  },
  { type: "gym", title: "Workout", emoji: "💪", targetPerDay: 1, xpPerCompletion: 20, enabled: true },
  {
    type: "hydration",
    title: "Hydration",
    emoji: "💧",
    targetPerDay: 8,
    xpPerCompletion: 2,
    enabled: true,
  },
  {
    type: "cold_shower",
    title: "Cold shower",
    emoji: "🚿",
    targetPerDay: 1,
    xpPerCompletion: 15,
    enabled: true,
  },
  {
    type: "meditation",
    title: "Meditation",
    emoji: "🧘",
    targetPerDay: 1,
    xpPerCompletion: 25,
    enabled: true,
  },
  {
    type: "learning",
    title: "Learning",
    emoji: "📚",
    targetPerDay: 1,
    xpPerCompletion: 20,
    enabled: true,
  },
  {
    type: "gratitude",
    title: "Gratitude",
    emoji: "🙏",
    targetPerDay: 5,
    xpPerCompletion: 3,
    enabled: true,
  },
];

export type AversionTag =
  | "boring"
  | "unclear"
  | "too-big"
  | "fear"
  | "no-reward"
  | "tired"
  | "distracted";

export type UnstickSession = {
  id: string;
  createdAt: number;
  date: string;
  task: string;
  aversion: AversionTag;
  firstAction: string;
  reward: string;
  started: boolean;
  completed: boolean;
  durationSec: number;
};

export type WoopCard = {
  id: string;
  createdAt: number;
  wish: string;
  outcome: string;
  obstacle: string;
  planIf: string;
  planThen: string;
};

export type TinyRecipe = {
  id: string;
  createdAt: number;
  anchor: string;
  behavior: string;
  celebration: string;
  habitId?: string;
  lastDoneDate: string | null;
  doneCount: number;
};

export type AutomaticityRating = {
  id: string;
  habitId: string;
  date: string;
  score: number;
};

export type ProcrastinationStyle = "avoider" | "perfectionist" | "discounter" | "overwhelmed";

export type ProcrastinationProfile = {
  style: ProcrastinationStyle;
  answeredAt: number;
};
