import { Button } from "@/components/ui";
import { formatDuration } from "@/lib/utils";

const PRESETS = [30, 60, 120, 180, 300, 600, 900, 1200, 1500, 1800, 2700, 3600];

export function DurationPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (sec: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-2xl bg-sunken px-4 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 bg-surface"
          onClick={() => onChange(Math.max(15, value - 15))}
        >
          −
        </Button>
        <div className="text-center">
          <div className="text-2xl font-semibold tabular-nums">{formatDuration(value)}</div>
          <div className="text-xs text-muted">
            {Math.floor(value / 60)}m {value % 60}s
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 bg-surface"
          onClick={() => onChange(value + 15)}
        >
          +
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`h-8 rounded-full px-3 text-xs font-medium ${
              value === p ? "bg-fg text-bg" : "bg-sunken text-muted"
            }`}
          >
            {formatDuration(p)}
          </button>
        ))}
      </div>
    </div>
  );
}
