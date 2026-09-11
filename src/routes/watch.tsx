import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/lib/store";
import { parseZip } from "@/lib/samsung-health-import";
import type { WatchImportResult } from "@/lib/samsung-health-import";
import { cn } from "@/lib/utils";
import {
  SAMPLE_ZIP,
  WATER_STEP,
  WATCH_TABS,
  lastNDays,
  type WatchTab,
} from "@/lib/watch-view";
import { OverviewTab } from "@/components/watch-overview";
import { ActivityTab } from "@/components/watch-activity";
import { SleepTab } from "@/components/watch-sleep";
import { FoodTab, HeartTab, MindfulnessTab } from "@/components/watch-rest";
import { useRef, useState, type DragEvent, type RefObject } from "react";
import { Menu, Upload, User, Watch, X } from "lucide-react";

export const Route = createFileRoute("/watch")({
  component: WatchPage,
});

function WatchPage() {
  const watchImport = useAppStore((s) => s.watchImport);
  const setWatchImport = useAppStore((s) => s.setWatchImport);
  const clearWatchImport = useAppStore((s) => s.clearWatchImport);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<WatchTab>("overview");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ingestFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Please select a .zip file");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const result = await parseZip(file);
      if (result.days.length === 0) {
        setError("No health data found in ZIP. Check the export format.");
      } else {
        setWatchImport(result);
        setTab("overview");
      }
    } catch (err) {
      setError(`Failed to parse: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setParsing(false);
    }
  };

  const loadSample = async () => {
    setParsing(true);
    setError(null);
    try {
      const res = await fetch(SAMPLE_ZIP);
      if (!res.ok) throw new Error("Sample ZIP missing");
      const blob = await res.blob();
      const file = new File([blob], "sample-samsung-health.zip", { type: "application/zip" });
      await ingestFile(file);
    } catch (err) {
      setError(`Could not load sample: ${err instanceof Error ? err.message : "Unknown error"}`);
      setParsing(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void ingestFile(file);
  };

  if (!watchImport) {
    return (
      <EmptyState
        fileInputRef={fileInputRef}
        parsing={parsing}
        error={error}
        dragging={dragging}
        onBrowse={() => fileInputRef.current?.click()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void ingestFile(file);
        }}
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onSample={() => void loadSample()}
      />
    );
  }

  const latest = watchImport.days[0];
  const week = lastNDays(watchImport.days, 7);

  const addWater = () => {
    if (!latest) return;
    const next: WatchImportResult = {
      ...watchImport,
      days: watchImport.days.map((d, i) =>
        i === 0
          ? { ...d, water: [...(d.water ?? []), { timestamp: Date.now(), amountMl: WATER_STEP }] }
          : d,
      ),
    };
    setWatchImport(next);
  };

  return (
    <div className="relative min-h-[calc(100dvh-5.5rem)] overflow-hidden bg-gradient-to-b from-[#cfe6f8] via-[#e7f1f4] to-[#f3e6cc] pb-8">
      <div className="pointer-events-none absolute -top-16 right-[-40px] size-48 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-40 left-[-50px] size-40 rounded-full bg-amber-100/70 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-card backdrop-blur">
          <Watch className="size-4 text-sky-600" />
          <span className="text-sm font-semibold tracking-tight">Watch</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/you" className="grid size-10 place-items-center rounded-full bg-white/80 shadow-card" aria-label="Profile">
            <User className="size-4" />
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-white/80 shadow-card"
            aria-label="Menu"
            onClick={() => fileInputRef.current?.click()}
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      <div className="relative z-10 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WATCH_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-fg text-bg shadow-card" : "bg-white/70 text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative z-10 mt-4 space-y-4 px-4">
        {tab === "overview" && <OverviewTab latest={latest} week={week} onFood={() => setTab("food")} />}
        {tab === "activity" && <ActivityTab latest={latest} week={week} />}
        {tab === "sleep" && <SleepTab latest={latest} week={week} />}
        {tab === "heart" && <HeartTab latest={latest} week={week} />}
        {tab === "mindfulness" && <MindfulnessTab latest={latest} />}
        {tab === "food" && (
          <FoodTab latest={latest} week={week} body={watchImport.bodyMeasurements} onAddWater={addWater} />
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/80 text-sm font-medium shadow-card"
          >
            <Upload className="size-4" />
            Import ZIP
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear imported watch data?")) clearWatchImport();
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/80 px-4 text-sm font-medium text-coral shadow-card"
          >
            <X className="size-4" />
            Clear
          </button>
        </div>
        <p className="pb-2 text-center text-[11px] text-muted">
          {watchImport.days.length} days · {watchImport.sourceFiles.length} files · stays on this device
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void ingestFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function EmptyState({
  fileInputRef,
  parsing,
  error,
  dragging,
  onBrowse,
  onChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onSample,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  parsing: boolean;
  error: string | null;
  dragging: boolean;
  onBrowse: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onSample: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col bg-gradient-to-b from-[#cfe6f8] via-[#eaf3f2] to-[#f4ead8] px-5 py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 shadow-card">
            <Watch className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Samsung Health</h1>
          <p className="mt-1 text-sm text-muted">
            Drop a personal data ZIP to fill activity rings, sleep, heart, and more.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onBrowse}
          className={cn(
            "cursor-pointer rounded-[28px] border-2 border-dashed bg-white/70 p-8 text-center shadow-card transition-colors",
            dragging ? "border-sky-500 bg-sky-50" : "border-border",
          )}
        >
          <Upload className="mx-auto mb-3 size-10 text-sky-500" />
          <p className="text-sm font-semibold">Drop ZIP or click to browse</p>
          <p className="mt-1 text-xs text-muted">Samsung Health → Settings → Download personal data</p>
          <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={onChange} />
        </div>

        {parsing ? <p className="text-center text-sm text-muted animate-pulse">Parsing health data…</p> : null}
        {error ? (
          <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</div>
        ) : null}

        <button
          type="button"
          onClick={onSample}
          disabled={parsing}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-fg text-sm font-semibold text-bg shadow-card disabled:opacity-50"
        >
          Load sample
        </button>

        <ol className="space-y-1.5 text-xs text-muted">
          <li>1. Open Samsung Health → Menu → Settings</li>
          <li>2. Tap Download personal data and wait for the ZIP</li>
          <li>3. Drop it here — nothing is uploaded</li>
        </ol>
      </div>
    </div>
  );
}
