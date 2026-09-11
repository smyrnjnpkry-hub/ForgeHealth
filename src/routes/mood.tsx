import { Button, Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { MOOD_ENTRY_META, type MoodEntry, type MoodEntryMood } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { todayKey } from "@/lib/utils";
import JSZip from "jszip";
import { BarChart3, Calendar, Download, Lock, Search, Upload, Wind } from "lucide-react";

export const Route = createFileRoute("/mood")({ component: Mood });

type View = "track" | "calendar" | "insights" | "journal";

const PIN_KEY = "forgehealth-mood-pin";
const AVAILABLE_TAGS = ["work", "family", "health", "sleep", "exercise", "social", "stress"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function readStoredPin() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PIN_KEY);
}

function monthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(todayKey(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function lastNDateKeys(n: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(todayKey(d));
  }
  return keys;
}

function moodStreak(entries: MoodEntry[]) {
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const cursor = new Date();
  if (!dates.has(todayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function Mood() {
  const moodEntries = useAppStore((s) => s.moodEntries);
  const addMoodEntry = useAppStore((s) => s.addMoodEntry);
  const updateMoodEntry = useAppStore((s) => s.updateMoodEntry);
  const deleteMoodEntry = useAppStore((s) => s.deleteMoodEntry);

  const [selectedMood, setSelectedMood] = useState<MoodEntryMood | null>(null);
  const [intensity, setIntensity] = useState(6);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [view, setView] = useState<View>("track");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [pinReady, setPinReady] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount] = useState(0);
  const [calCursor, setCalCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const today = todayKey();
  const todayEntry = moodEntries.find((e) => e.date === today);
  const selectedEntry = moodEntries.find((e) => e.date === selectedDate);

  useEffect(() => {
    const pin = readStoredPin();
    setStoredPin(pin);
    setIsUnlocked(!pin);
    setPinReady(true);
  }, []);

  useEffect(() => {
    if (!breathingActive) return;
    setBreathPhase("in");
    setBreathCount(0);
    let phase: "in" | "hold" | "out" = "in";
    let count = 0;
    const interval = window.setInterval(() => {
      count += 1;
      if (phase === "in" && count >= 4) {
        phase = "hold";
        count = 0;
        setBreathPhase("hold");
      } else if (phase === "hold" && count >= 7) {
        phase = "out";
        count = 0;
        setBreathPhase("out");
      } else if (phase === "out" && count >= 8) {
        phase = "in";
        count = 0;
        setBreathPhase("in");
      }
      setBreathCount(count);
    }, 1000);
    const stop = window.setTimeout(() => {
      window.clearInterval(interval);
      setBreathingActive(false);
    }, 60_000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [breathingActive]);

  const avgIntensity =
    moodEntries.length > 0
      ? (moodEntries.reduce((sum, e) => sum + e.intensity, 0) / moodEntries.length).toFixed(1)
      : "0";
  const last7Days = lastNDateKeys(7);
  const last7Map = useMemo(() => {
    const map = new Map<string, MoodEntry>();
    for (const entry of moodEntries) {
      if (!map.has(entry.date)) map.set(entry.date, entry);
    }
    return map;
  }, [moodEntries]);
  const filteredEntries = searchQuery.trim()
    ? moodEntries.filter((e) => {
        const q = searchQuery.toLowerCase();
        return (
          e.note?.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          MOOD_ENTRY_META[e.mood].label.toLowerCase().includes(q) ||
          e.date.includes(q)
        );
      })
    : moodEntries;
  const cells = monthCells(calCursor.year, calCursor.month);
  const monthLabel = new Date(calCursor.year, calCursor.month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const streak = moodStreak(moodEntries);

  function handleSubmit() {
    if (!selectedMood) return;
    const payload = {
      date: selectedDate || today,
      mood: selectedMood,
      intensity,
      tags,
      note: note.trim() || undefined,
      photoDataUrl,
    };
    const existing = moodEntries.find((e) => e.date === payload.date);
    if (existing) {
      updateMoodEntry(existing.id, payload);
    } else {
      addMoodEntry(payload);
    }
    setSelectedMood(null);
    setNote("");
    setTags([]);
    setIntensity(6);
    setPhotoDataUrl(undefined);
  }

  function handleSetPin() {
    if (pinCode.length !== 4) return;
    window.localStorage.setItem(PIN_KEY, pinCode);
    setStoredPin(pinCode);
    setPinCode("");
  }

  function handleUnlock() {
    if (pinInput === storedPin) {
      setIsUnlocked(true);
      setPinInput("");
    } else {
      setPinInput("");
    }
  }

  function handleRemovePin() {
    window.localStorage.removeItem(PIN_KEY);
    setStoredPin(null);
    setIsUnlocked(true);
  }

  async function handleExport() {
    const zip = new JSZip();
    const data = { moodEntries, exportedAt: Date.now(), version: "1.0" };
    zip.file("moodsathi.json", JSON.stringify(data, null, 2));
    zip.file(
      "README.txt",
      "ForgeHealth mood backup. Import this ZIP from the Mood calendar tab to restore entries.\n",
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mood-export-${todayKey()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      let parsed: { moodEntries?: MoodEntry[] } | MoodEntry[] | null = null;
      if (file.name.endsWith(".json")) {
        parsed = JSON.parse(await file.text());
      } else {
        const zip = await JSZip.loadAsync(file);
        const jsonFile =
          zip.file("moodsathi.json") || zip.file("mood-data.json") || zip.file(/\.json$/)[0];
        if (!jsonFile) return;
        parsed = JSON.parse(await jsonFile.async("string"));
      }
      const incoming = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.moodEntries)
          ? parsed.moodEntries
          : [];
      for (const entry of incoming) {
        if (!entry?.date || !entry?.mood) continue;
        const existing = moodEntries.find((m) => m.date === entry.date);
        const patch = {
          mood: entry.mood,
          intensity: entry.intensity ?? 5,
          tags: entry.tags ?? [],
          note: entry.note,
          photoDataUrl: entry.photoDataUrl,
        };
        if (existing) updateMoodEntry(existing.id, patch);
        else addMoodEntry({ date: entry.date, ...patch });
      }
    } catch (err) {
      console.error("Import failed:", err);
    }
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPhotoDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  }

  if (!pinReady) {
    return (
      <main className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Mood</h1>
        <p className="mt-1 text-sm text-muted">Track your inner weather</p>
      </main>
    );
  }

  if (!isUnlocked) {
    return (
      <main className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Mood</h1>
        <Card className="mt-6 space-y-4 p-6 text-center">
          <Lock className="mx-auto size-12 text-muted" />
          <div className="text-sm text-muted">Enter PIN to unlock your journal</div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="mx-auto h-12 w-32 rounded-xl border border-border bg-surface text-center text-2xl tracking-widest"
          />
          <Button variant="sun" onClick={handleUnlock} disabled={pinInput.length !== 4}>
            Unlock
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="px-5 pt-6 pb-8">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Mood</h1>
        {storedPin ? (
          <Button size="sm" variant="outline" onClick={handleRemovePin}>
            <Lock className="size-4" /> Unlock PIN
          </Button>
        ) : null}
      </div>
      <p className="text-sm text-muted">Track your inner weather</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {(
          [
            ["track", "Track", null],
            ["calendar", "Calendar", Calendar],
            ["insights", "Insights", BarChart3],
            ["journal", "Journal", Search],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              view === id ? "bg-mint text-white" : "bg-sunken text-muted"
            }`}
          >
            {Icon ? <Icon className="size-4" /> : null}
            {label}
          </button>
        ))}
      </div>

      {view === "track" && (
        <>
          <Card className="mt-6 space-y-4 p-6">
            <div>
              <h2 className="mb-3 text-sm font-medium">How are you feeling?</h2>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(MOOD_ENTRY_META) as MoodEntryMood[]).map((mood) => {
                  const meta = MOOD_ENTRY_META[mood];
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setSelectedMood(mood)}
                      className={`rounded-xl border-2 p-3 transition-all ${
                        selectedMood === mood ? "scale-95 border-fg" : "border-border hover:border-muted"
                      }`}
                    >
                      <div className="mb-1 text-2xl">{meta.emoji}</div>
                      <div className="text-xs">{meta.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedMood && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">Intensity: {intensity}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full accent-mint"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setTags((prev) =>
                            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          tags.includes(tag) ? "bg-mint text-white" : "bg-sunken text-muted"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What is on your mind?"
                    className="h-24 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                  <Button type="button" size="sm" variant="outline" onClick={() => photoRef.current?.click()}>
                    {photoDataUrl ? "Change photo" : "Add photo"}
                  </Button>
                  {photoDataUrl ? (
                    <img src={photoDataUrl} alt="Mood photo" className="mt-3 h-24 w-24 rounded-xl object-cover" />
                  ) : null}
                </div>
                <Button variant="sun" className="w-full" onClick={handleSubmit}>
                  Save mood
                </Button>
              </>
            )}
          </Card>

          {todayEntry && (
            <Card className="mt-4 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MOOD_ENTRY_META[todayEntry.mood].emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{MOOD_ENTRY_META[todayEntry.mood].label}</div>
                  <div className="text-xs text-muted">Intensity {todayEntry.intensity}/10</div>
                  {todayEntry.tags.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {todayEntry.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-sunken px-2 py-0.5 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {todayEntry.note && <p className="mt-2 text-sm text-muted">{todayEntry.note}</p>}
                </div>
              </div>
            </Card>
          )}

          {!storedPin && (
            <Card className="mt-4 p-4">
              <div className="mb-2 text-sm font-medium">Optional PIN lock</div>
              <p className="mb-3 text-xs text-muted">Hides the journal on this device. Not encryption.</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="h-10 flex-1 rounded-xl border border-border bg-surface px-3 text-sm"
                />
                <Button size="sm" onClick={handleSetPin} disabled={pinCode.length !== 4}>
                  Set
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {view === "calendar" && (
        <div className="mt-6 space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-muted"
                onClick={() =>
                  setCalCursor((c) => {
                    const d = new Date(c.year, c.month - 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })
                }
              >
                Prev
              </button>
              <h2 className="text-sm font-semibold">{monthLabel}</h2>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm text-muted"
                onClick={() =>
                  setCalCursor((c) => {
                    const d = new Date(c.year, c.month + 1, 1);
                    return { year: d.getFullYear(), month: d.getMonth() };
                  })
                }
              >
                Next
              </button>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
              {WEEKDAYS.map((d, i) => (
                <div key={`${d}-${i}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, i) => {
                const entry = date ? last7Map.get(date) ?? moodEntries.find((e) => e.date === date) : undefined;
                const color = entry ? MOOD_ENTRY_META[entry.mood].color : date ? "#e5e7eb" : "transparent";
                return (
                  <button
                    key={date ?? `empty-${i}`}
                    type="button"
                    disabled={!date}
                    onClick={() => date && setSelectedDate(date)}
                    className={`aspect-square rounded-lg text-xs ${
                      date === selectedDate ? "ring-2 ring-fg" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    title={entry ? `${MOOD_ENTRY_META[entry.mood].label} (${entry.intensity}/10)` : date ?? ""}
                  >
                    {date ? (
                      <span className={entry ? "font-medium text-white" : "text-muted"}>
                        {Number(date.slice(-2))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          {selectedEntry ? (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{MOOD_ENTRY_META[selectedEntry.mood].emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{selectedDate}</div>
                  <div className="text-xs text-muted">
                    {MOOD_ENTRY_META[selectedEntry.mood].label} · {selectedEntry.intensity}/10
                  </div>
                  {selectedEntry.note ? <p className="mt-2 text-sm">{selectedEntry.note}</p> : null}
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteMoodEntry(selectedEntry.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-sm text-muted">No entry for {selectedDate}. Log one on Track.</Card>
          )}

          <Card className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Export ZIP backup</div>
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="size-4" /> Export
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Import ZIP or JSON</div>
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,.json,application/zip,application/json"
                  className="hidden"
                  onChange={handleImport}
                />
                <Button size="sm" variant="outline" type="button" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" /> Import
                </Button>
              </>
            </div>
          </Card>
        </div>
      )}

      {view === "insights" && (
        <div className="mt-6 space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold">Statistics</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-mint">{avgIntensity}</div>
                <div className="mt-1 text-xs text-muted">Avg intensity</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky">{streak}</div>
                <div className="mt-1 text-xs text-muted">Log streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{moodEntries.length}</div>
                <div className="mt-1 text-xs text-muted">Entries</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold">Last 7 days</h2>
            <div className="flex h-32 items-end justify-around gap-2">
              {last7Days.map((date) => {
                const entry = last7Map.get(date);
                const heightPct = entry ? (entry.intensity / 10) * 100 : 8;
                const color = entry ? MOOD_ENTRY_META[entry.mood].color : "#e5e7eb";
                return (
                  <div key={date} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{ height: `${heightPct}%`, backgroundColor: color }}
                    />
                    <div className="mt-1 text-xs text-muted">{date.slice(-2)}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">4-7-8 breathing</h2>
              <Wind className="size-5 text-mint" />
            </div>
            <p className="mb-4 text-sm text-muted">
              Inhale 4 seconds, hold 7, exhale 8. One minute of guided cycles.
            </p>
            {!breathingActive ? (
              <Button variant="sun" className="w-full" onClick={() => setBreathingActive(true)}>
                Start exercise
              </Button>
            ) : (
              <div className="text-center">
                <div className="mb-2 text-6xl">
                  {breathPhase === "in" ? "🌬️" : breathPhase === "hold" ? "🫁" : "😌"}
                </div>
                <div className="text-lg font-medium capitalize">{breathPhase}</div>
                <div className="text-3xl font-bold text-mint">{breathCount}</div>
                <Button className="mt-4" variant="outline" onClick={() => setBreathingActive(false)}>
                  Stop
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {view === "journal" && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mood, tags, or notes..."
              className="h-11 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-sm"
            />
          </div>
          {filteredEntries.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted">No journal entries yet.</Card>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{MOOD_ENTRY_META[entry.mood].emoji}</span>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <div className="text-sm font-medium">{MOOD_ENTRY_META[entry.mood].label}</div>
                        <div className="text-xs text-muted">{entry.date}</div>
                      </div>
                      <div className="mb-2 text-xs text-muted">Intensity {entry.intensity}/10</div>
                      {entry.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-sunken px-2 py-0.5 text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {entry.note ? <p className="text-sm">{entry.note}</p> : null}
                      {entry.photoDataUrl ? (
                        <img
                          src={entry.photoDataUrl}
                          alt=""
                          className="mt-2 h-20 w-20 rounded-lg object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
