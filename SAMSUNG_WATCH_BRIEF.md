# Samsung Watch / Health section — FULL UI clone from user screenshots

User provided Samsung Health phone screenshots in `reference/samsung-health-ui/`. Clone that look + feature set inside ForgeHealth **Watch** tab. ZIP import of Samsung Health “Download personal data” must instantly populate cards.

## Visual language (from screenshots)
- Soft blue→cream gradient background
- Large rounded white cards, subtle shadows
- Floating pill top actions (watch / profile / menu)
- Category chip row: Overview | Activity | Sleep | Heart | Mindfulness | Food
- Heart-shaped triple activity rings (steps green, active mins blue, calories purple)
- Status tags: Excellent (blue), Fair (yellow), Attention (orange)
- Bottom: keep ForgeHealth tabs but Watch is a first-class tab

## Screens / cards to implement (match screenshots)

### Overview (Home-like feed)
1. Energy score — big number + Excellent/Fair/Attention + 7-day dots/bars
2. Daily activity — heart rings + steps / active mins / kcal
3. Sleep score — gauge + score + status
4. Food promo / log CTA card
5. Quick access 2x2 (mindfulness / breathe / meditate / list)
6. Heart health promo card
7. Vitals promo during sleep

### Activity
- Daily activity heart rings + metrics
- Workouts this week — duration, sessions, kcal, weekday bars
- Steps card — count vs goal (6000) + hourly/day bars
- Exercise quick start: Walk / Run / Bike / More
- Fitness index / Running coach / Daily cardio load cards (can be informational if no data)

### Sleep (detail)
- Sleep score hero (Today) + Attention/Excellent + nap note
- Sleep time + actual sleep time ranges
- Sleep score factors grid: actual sleep, deep, REM, awake, latency (with status tags)
- Sleep stages hypnogram (Awake/REM/Light/Deep) + movement ticks
- Stage % bars with typical-range hatch if possible
- Blood oxygen during sleep (avg + under 90% duration + chart)
- Skin temperature vs baseline chart (if in ZIP)
- Heart rate during sleep avg + chart
- Respiratory rate avg
- Snoring (show No data if missing)
- Sleep time last 7 days bar chart + average
- Sleep consistency grid (bedtime/wake targets)
- Sleep animal / bedtime guidance / snoring promo cards if no data

### Heart / Vitals
- Heart rate card — latest bpm + sparkline/bars + timestamp
- Blood oxygen — avg during sleep %
- Blood pressure promo / logged values if in ZIP
- Vascular load / AGEs / Antioxidant index cards if present else promo placeholders

### Mindfulness
- Mood check-in / Breathing / Meditation tiles (link to existing Mood/Habits where sensible)
- Stress chart over day with Low/Med/High label

### Food / Body
- Water tracker card (+250 ml toward 2000 ml) with day strip
- Food / Body composition / Blood glucose / Antioxidant / AGEs cards (import if CSV exists; else CTA cards)

## ZIP import
- Drop/select Samsung Health personal data ZIP → parse CSVs client-side with JSZip → fill all above instantly
- Support filenames containing: step_daily_trend, pedometer_day_summary, heart_rate, sleep, exercise, stress, spo2/oxygen, step_count, calories, water, weight/body
- Skip metadata first rows; flexible column aliases
- Persist in zustand/localStorage; Clear + Re-export summary ZIP
- Sample fixture at public/fixtures/sample-samsung-health.zip with enough fake data to demo Overview/Activity/Sleep/Heart/Stress/Water

## Tech
- Expand `src/lib/samsung-health-import.ts` + `src/routes/watch.tsx` (subviews via chips)
- Fix any typecheck errors
- Do not break existing ForgeHealth tabs
- README: how to export from Samsung Health and import here

Priority: make Overview + Activity + Sleep + Heart look like the screenshots and fill from ZIP first; then Food/Mindfulness polish.
