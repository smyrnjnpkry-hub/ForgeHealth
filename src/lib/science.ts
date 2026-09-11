import type { AversionTag, ProcrastinationStyle } from "@/lib/types";

/** Lally et al. 2010 — median days to 95% of automaticity asymptote. */
export const HABIT_MEDIAN_DAYS = 66;
export const HABIT_RANGE_DAYS = { min: 18, max: 254 } as const;
export const TWO_MINUTE_SEC = 120;

export const AVERSION_META: Record<
  AversionTag,
  { label: string; hint: string; lever: string }
> = {
  boring: {
    label: "Boring",
    hint: "The task has low immediate value.",
    lever: "Pair it with a tiny after-reward and shrink it to two minutes.",
  },
  unclear: {
    label: "Unclear",
    hint: "You cannot start what you cannot picture.",
    lever: "Write the next physical action in one sentence.",
  },
  "too-big": {
    label: "Too big",
    hint: "Delay explodes when the finish line is far away.",
    lever: "Cut a 2-minute first slice. The rest can wait.",
  },
  fear: {
    label: "Fear of failing",
    hint: "Low expectancy. Perfection is a delay tactic.",
    lever: "Aim for an ugly draft. Starting raises expectancy.",
  },
  "no-reward": {
    label: "No payoff yet",
    hint: "Future value is discounted. Present you wants a receipt.",
    lever: "Name a reward you get the moment the 2 minutes end.",
  },
  tired: {
    label: "Low energy",
    hint: "Mood repair often wins over the task.",
    lever: "Do the smallest version, then rest on purpose.",
  },
  distracted: {
    label: "Tempted",
    hint: "Impulsiveness × delay. The phone is closer than the outcome.",
    lever: "If I reach for the phone, then I start the 2-minute slice instead.",
  },
};

export const STYLE_META: Record<
  ProcrastinationStyle,
  { label: string; blurb: string; move: string }
> = {
  avoider: {
    label: "Mood avoider",
    blurb: "You delay to feel better now. The task is not the enemy — the feeling is.",
    move: "Label the feeling, then start a 2-minute slice. Mood follows motion.",
  },
  perfectionist: {
    label: "Perfectionist",
    blurb: "If it cannot be excellent, it waits. Expectancy drops until the bar is imaginary.",
    move: "Set a deliberately ugly first version. Done-enough raises expectancy.",
  },
  discounter: {
    label: "Now-bias",
    blurb: "Tomorrow's reward is faint. Today's distraction is loud.",
    move: "Pull the reward closer: a 2-minute start plus a tiny treat after.",
  },
  overwhelmed: {
    label: "Overloaded",
    blurb: "The whole mountain is in view, so no path appears.",
    move: "Write one next action you could finish before a song ends.",
  },
};

export const STYLE_QUIZ: {
  id: string;
  prompt: string;
  options: { style: ProcrastinationStyle; label: string }[];
}[] = [
  {
    id: "feel",
    prompt: "When a needed task feels bad, I usually…",
    options: [
      { style: "avoider", label: "Wait until the feeling passes" },
      { style: "perfectionist", label: "Wait until I can do it properly" },
      { style: "discounter", label: "Do something more fun first" },
      { style: "overwhelmed", label: "Freeze — I cannot see a first step" },
    ],
  },
  {
    id: "deadline",
    prompt: "Deadlines make me…",
    options: [
      { style: "discounter", label: "Finally start, almost too late" },
      { style: "perfectionist", label: "Polish forever, then panic-edit" },
      { style: "avoider", label: "Anxious, so I hide in comfort tasks" },
      { style: "overwhelmed", label: "See ten tasks and pick none" },
    ],
  },
  {
    id: "start",
    prompt: "Starting is hardest because…",
    options: [
      { style: "overwhelmed", label: "The whole project sits in my head at once" },
      { style: "perfectionist", label: "The first line has to be good" },
      { style: "avoider", label: "I want to feel ready first" },
      { style: "discounter", label: "Something closer is more rewarding" },
    ],
  },
  {
    id: "miss",
    prompt: "After I skip a day I tend to…",
    options: [
      { style: "avoider", label: "Avoid opening the app so I don't feel worse" },
      { style: "perfectionist", label: "Tell myself the streak is ruined so why bother" },
      { style: "overwhelmed", label: "Add make-up work until the list is impossible" },
      { style: "discounter", label: "Promise a heroic catch-up tomorrow" },
    ],
  },
];

export const SCIENCE_CARDS = [
  {
    id: "lally",
    title: "Automaticity takes weeks, not 21 days",
    body: "Lally et al. (2010) tracked real daily behaviors. Median time to peak automaticity was 66 days. The range was 18–254. Missing a single day did not flatten the curve. Singh et al. (2024) later put the median near 59–66 days.",
    use: "Track repetitions in a stable context. Never treat one miss as a reset.",
  },
  {
    id: "tmt",
    title: "Motivation is an equation, not a vibe",
    body: "Temporal Motivation Theory (Steel & König, 2006): Motivation = (Expectancy × Value) / (1 + Impulsiveness × Delay). You delay when the finish feels far, uncertain, or unrewarding — especially if you are impulse-sensitive.",
    use: "Raise expectancy (tiny start), raise value (why + treat), cut delay (2 minutes), cut impulsiveness (if-then).",
  },
  {
    id: "tdm",
    title: "Unstick: label it, then slice it",
    body: "A 2025 BMC Psychology trial (N=1,035) used the Temporal Decision Model: affect-label the aversion, then generate a subtask and pick a reward. People reported higher 24-hour completion likelihood, better mood, and a wider utility–aversion gap.",
    use: "That is the Unstick protocol on this tab.",
  },
  {
    id: "woop",
    title: "WOOP beats positive thinking",
    body: "Mental contrasting + implementation intentions (Oettingen; Gollwitzer) — Wish, Outcome, Obstacle, Plan — outperforms fantasizing alone. If-then plans roughly triple follow-through versus vague goals. A 2024 review of 642 tests found larger effects for contingent if-then format plus one rehearsal.",
    use: "Write the obstacle before the plan. The plan must be If [cue], then [action].",
  },
  {
    id: "fogg",
    title: "Tiny beats motivated",
    body: "Fogg's B = MAP: behavior happens when Motivation, Ability, and a Prompt coincide. Shrink the behavior until ability is high even on a bad day. Recipe: After [anchor], I will [tiny action], then [celebrate].",
    use: "If you skip often, the habit is still too big.",
  },
  {
    id: "wood",
    title: "Habits live in the room, not in willpower",
    body: "Wendy Wood: habits are context-response associations. Stable time, place, and preceding action do the cuing. Change the context and the old loop loses its trigger. Self-control is the expensive backup, not the engine.",
    use: "Lock a cue. Put the prompt in the environment. Do not wait to feel ready.",
  },
  {
    id: "tice",
    title: "Procrastination is mood repair",
    body: "Tice, Sirois & Pychyl: we delay to escape aversive feeling, not because we cannot plan. Shame after delay is more aversion. CBT for procrastination shows a moderate benefit (Rozental et al., 2018). Emotion-regulation training later cut delay (Eckert et al., 2022).",
    use: "Name the feeling. Do not negotiate with it. Start a slice, then reassess.",
  },
  {
    id: "identity",
    title: "Identity outlasts streaks",
    body: "Once a behavior is cued by context, it needs less self-control (Stojanovic & Wood, 2024). Identity statements — I am someone who starts — keep action available when mood is low. Streaks are a report, not a hostage.",
    use: "Count total starts and automaticity, not only unbroken days.",
  },
] as const;

export function automaticityEstimate(repetitions: number) {
  const clamped = Math.max(0, repetitions);
  const pct = Math.min(100, Math.round((clamped / HABIT_MEDIAN_DAYS) * 100));
  let label = "Just planting";
  if (clamped >= 66) label = "Mostly automatic for many people";
  else if (clamped >= 40) label = "The groove is forming";
  else if (clamped >= 14) label = "Cue is starting to pull";
  else if (clamped >= 3) label = "Still effortful — expected";
  return { pct, label, remaining: Math.max(0, HABIT_MEDIAN_DAYS - clamped) };
}

export function styleFromAnswers(answers: ProcrastinationStyle[]) {
  const counts: Record<ProcrastinationStyle, number> = {
    avoider: 0,
    perfectionist: 0,
    discounter: 0,
    overwhelmed: 0,
  };
  for (const a of answers) counts[a] += 1;
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] ??
    "avoider") as ProcrastinationStyle;
}
