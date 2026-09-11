# ForgeHealth

Samsung Health-style integrated wellness PWA built on Dayring v2 — habit tracking, NoFap challenge with buddy accountability, MoodSathi mood journal, and XP/willpower gamification.

## Run

```bash
npm install
npm run dev
```

App listens on port 8080 by default.

## Dual-Tab Buddy Challenge Demo

ForgeHealth supports real-time buddy accountability via BroadcastChannel + localStorage:

1. **Open two browser tabs** at `http://localhost:8080`
2. **Tab 1**: Select **Soumya** account → Complete onboarding → Go to Challenge tab → Start challenge with buddy email `mdjabirkhan6786@gmail.com`
3. **Tab 2**: Select **Jabir** account → Complete onboarding → Go to Challenge tab → Start challenge with buddy email `smyrnjnpkry@gmail.com`
4. **Check in** on either tab → the other tab automatically shows updated buddy progress (streak, XP, willpower)
5. Each account's data is isolated in separate localStorage keys: `forgehealth-soumya` and `forgehealth-jabir`
6. Buddy snapshots are stored in `forgehealth-buddy-soumya` / `forgehealth-buddy-jabir` for cross-tab visibility

## Features

### Core (Dayring v2)
- **First-run onboarding** — Name your plant, pick 1–2 starter templates
- **Timed routines** — Voice cues, step transitions, progress rings
- **Plant stages** — Nine earned stages (Seed → Grove) growing with your streak
- **Explore templates** — Morning, night, focus, body, reset, ADHD-optimized routines
- **Reminders** — Routine-linked and standalone alerts with sound/voice
- **Stats & mood** — Completion history, streak calendar, post-run mood check

### ForgeHealth Extensions
- **5-tab UI** — Home (rings + plant) | Habits | Challenge | Mood | You
- **Habit tracker** — Gym, hydration, cold shower, meditation, learning, gratitude (6 default habits)
- **NoFap challenge** — 18+ consent, 7/30/60/90/custom duration, buddy progress, relapse log (non-shaming)
- **XP & levels** — ~30 XP/check-in, habit bonus XP, rank progression (Beginner → Mythic)
- **Willpower system** — Earned via habits, spent on metaphorical monster battles
- **MoodSathi journal** — 8 moods + intensity + tags + note; recent entries view
- **Dual accounts** — Soumya + Jabir seed accounts for demo; isolated storage per user

## Tech Stack

- **TanStack Start** (React 19, Vite, file-based routing)
- **Tailwind v4** + Radix UI primitives
- **Zustand** with persist middleware (account-namespaced localStorage)
- **BroadcastChannel** for real-time buddy sync across tabs
- **Web Speech API** for voice cues
- **Playwright** for browser smoke tests
