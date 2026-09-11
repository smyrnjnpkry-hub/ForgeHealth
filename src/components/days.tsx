import { DAY_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function DayToggle({
  value,
  onChange,
}: {
  value: number[];
  onChange: (days: number[]) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {DAY_LABELS.map((label, i) => {
        const on = value.includes(i);
        return (
          <button
            key={`${label}-${i}`}
            type="button"
            onClick={() =>
              onChange(on ? value.filter((d) => d !== i) : [...value, i].sort())
            }
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-xs font-semibold",
              on ? "bg-fg text-bg" : "bg-sunken text-muted",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function DayChips({ days }: { days: number[] }) {
  if (days.length === 7) return <span className="text-muted">Every day</span>;
  const weekdays = [1, 2, 3, 4, 5];
  if (weekdays.every((d) => days.includes(d)) && days.length === 5) {
    return <span className="text-muted">Weekdays</span>;
  }
  return (
    <span className="text-muted">
      {days.map((d) => DAY_LABELS[d]).join(" ")}
    </span>
  );
}
