# MoodSathi — आपका मूड साथी

A private mood companion you can open in any browser. No account. No server.

## Open the app
1. Unzip this folder.
2. Open `index.html` in Chrome, Edge, Firefox or Safari.
3. Optional: use the browser menu → **Add to Home Screen / Install app**.

ZIP import/export needs an internet connection the first time so the page can load the JSZip library from a CDN. After that the rest of the app works offline.

## Daily use
- **Today** — pick a mood, intensity 1–10, tags, note, optional photo.
- **Calendar** — month colour map. Tap a day to reopen that entry.
- **Insights** — streak, average intensity, 7-day bar, 4-7-8 breathing.
- **Journal** — searchable timeline.
- **ZIP** — download a backup zip or drop an old zip/json to restore.

## ZIP format
The backup file contains:
- `moodsathi.json` — all entries
- `README.txt`

When you import, entries are merged by date. A day already on the device is replaced by the copy from the zip.

## Privacy
Everything stays in this browser’s localStorage. Use **Download backup ZIP** before clearing site data or switching phones. Optional PIN only hides the UI on this device; it is not strong encryption.

## Built for
Soumya Ranjan Paikaray — MoodSathi v1, September 2026.
