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
- **6-tab UI** — Home (rings + plant) | Habits | Challenge | Mood | Watch | You
- **Habit tracker** — Gym, hydration, cold shower, meditation, learning, gratitude (6 default habits)
- **NoFap challenge** — 18+ consent, 7/30/60/90/custom duration, buddy progress, relapse log (non-shaming)
- **XP & levels** — ~30 XP/check-in, habit bonus XP, rank progression (Beginner → Mythic)
- **Willpower system** — Earned via habits, spent on metaphorical monster battles
- **MoodSathi journal** — 8 moods + intensity + tags + note; recent entries view
- **Watch / Health import** — Samsung Health ZIP import with activity rings, sleep/heart rate charts, weekly trends
- **Dual accounts** — Soumya + Jabir seed accounts for demo; isolated storage per user

## Samsung Health ZIP Import

The Watch tab supports importing personal data exports from Samsung Health:

### How to Export from Samsung Health

1. Open **Samsung Health** app on your phone
2. Tap **Menu (☰)** → **Settings**
3. Scroll to **"Download personal data"**
4. Request the export (you'll receive a notification when ready)
5. Share the **ZIP file** to your computer

### How to Import

1. Open ForgeHealth → **Watch tab**
2. **Drag & drop** the ZIP file or click to browse
3. Data parses instantly — no server upload, stays on your device
4. View **activity rings** (steps, calories, active minutes, distance)
5. See **health metrics** (heart rate, sleep, stress if available)
6. Browse **weekly charts** for steps and sleep trends

The parser supports various Samsung Health CSV formats and column naming variations. A **sample ZIP** is included at `public/fixtures/sample-samsung-health.zip` for testing.

## Tech Stack

- **TanStack Start** (React 19, Vite, file-based routing)
- **Tailwind v4** + Radix UI primitives
- **Zustand** with persist middleware (account-namespaced localStorage)
- **BroadcastChannel** for real-time buddy sync across tabs
- **Web Speech API** for voice cues
- **Playwright** for browser smoke tests
