# ForgeHealth

Wellness PWA for starting — habit tracking, buddy challenge, MoodSathi journal, and a science-backed **Forge** workshop (Unstick, Tiny Habits, WOOP). Local-first. No Watch tab.

## Run

```bash
npm install
npm run dev
```

## Dual-tab buddy demo

1. Open two browser tabs.
2. **Tab 1**: Choose **Soumya** → onboarding → Challenge → start with buddy email `sutapanahak23@gmail.com`
3. **Tab 2**: Choose **Sutapa** → onboarding → Challenge → start with buddy email `smyrnjnpkry@gmail.com`
4. Check in on either tab — the other shows updated streak / XP / willpower.
5. Storage is isolated: `forgehealth-soumya` and `forgehealth-sutapa`. Snapshots live in `forgehealth-buddy-*`.

## Features

- **Home** — rings, plant, giant Unstick CTA, tiny recipes
- **Habits** — gym, hydration, cold shower, meditation, learning, gratitude, two-minute start. Automaticity vs a 66-day median. One miss is not a reset.
- **Forge** — Unstick protocol (label aversion → 2-minute slice → reward), Tiny Habits recipes, WOOP if-then plans, stall-style quiz, evidence cards
- **Challenge** — 18+ consent, 7/30/60/90/custom, buddy progress, non-shaming relapse log, XP / willpower / monster metaphor
- **Mood** — MoodSathi journal
- **You** — identity sentence, sounds, theme

## Science (see `SCIENCE_PROMPT.md`)

Steel TMT · Sirois/Pychyl mood repair · Gollwitzer if-then · Oettingen WOOP · Fogg Tiny Habits · Lally ~66 days · Wood context cues. No 21-day myth.

## Tech

TanStack Start · React 19 · Tailwind v4 · Zustand persist · BroadcastChannel buddy sync
