# ForgeHealth — build brief (Cline)

Build an integrated Samsung Health–style PWA on this Dayring v2 codebase.

## Branding
Working name: **ForgeHealth**. Do NOT copy Addicted / NoFap: Ranked trademarks or assets.

## Accounts (seed)
- Soumya — smyrnjnpkry@gmail.com
- Sutapa — sutapanahak23@gmail.com
Both can start/join the same NoFap challenge and see near-real-time dual progress (BroadcastChannel + localStorage shared challenge room is fine for demo; document dual-tab demo).

## Must implement
1. Samsung Health–like UI: bottom tabs Home | Habits | Forge | Challenge | Mood | You; big rings; teal/mint + Dayring sun accents; dark mode. **No Watch tab.**
2. Keep Dayring v2: onboarding, plant stages, Today/Next-up, Explore, timed runs, reminders, stats, post-run mood.
3. MoodSathi (see `reference/moodsathi/`): mood log + intensity + tags + note + photo; calendar; insights (streak, avg, 7-day bars, 4-7-8 breath); journal search; ZIP backup; optional PIN.
4. Habit tracker + reminders (gym, hydration, cold shower, meditation, learning, gratitude, two-minute start + custom).
5. NoFap challenge:
   - Agreement/consent (18+, voluntary, not medical advice) before start
   - Adjustable duration: 7/30/60/90 + custom
   - Dual account progress vs buddy
   - Relapse log (non-shaming); soft XP penalty not hard zero
6. Clone **Addicted** features in spirit: multi-habit quit tracking, streaks, milestones, Willpower Points, monster/boss battle metaphor.
7. Clone **NoFap: Ranked** features in spirit: ~30 XP/clean day, habit bonus XP, ~-150 relapse, levels toward ~3000 XP, dashboard rings, streak/relapse calendar, meditation timer, gratitude (5/day), buddy leaderboard.
8. Integrate XP/streaks/mood/habits/challenge into one system.
9. **Forge workshop** (see `SCIENCE_PROMPT.md`): Unstick 2-minute protocol, Tiny Habits recipes, WOOP, stall-style quiz, automaticity vs 66-day median, science cards. Evidence-based. No 21-day myth. Misses do not reset automaticity.
10. `npm install && npm run dev` works; `npx tsc --noEmit` passes; update README.

## Success
App runnable locally; dual-tab demo of Soumya vs Sutapa challenge; Watch removed; Forge tab ships the start workshop.
