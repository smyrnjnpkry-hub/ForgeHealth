import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  STEP_GOAL,
  MIN_GOAL,
  KCAL_GOAL,
  clamp,
  statusFromScore,
  statusLabel,
} from "@/lib/watch-view";

export function ShCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn("w-full rounded-[28px] bg-white p-5 text-left shadow-card", className)}>
        {children}
      </button>
    );
  }
  return <div className={cn("w-full rounded-[28px] bg-white p-5 text-left shadow-card", className)}>{children}</div>;
}

export function StatusTag({ score }: { score: number }) {
  const kind = statusFromScore(score);
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        kind === "excellent" && "bg-sky-100 text-sky-700",
        kind === "fair" && "bg-amber-100 text-amber-700",
        kind === "attention" && "bg-orange-100 text-orange-700",
      )}
    >
      {statusLabel(kind)}
    </span>
  );
}

export function HeartRings({ steps, mins, kcal }: { steps: number; mins: number; kcal: number }) {
  const rings = [
    { value: clamp(steps / STEP_GOAL), color: "#34d399", r: 46, w: 7 },
    { value: clamp(mins / MIN_GOAL), color: "#60a5fa", r: 36, w: 7 },
    { value: clamp(kcal / KCAL_GOAL), color: "#c084fc", r: 26, w: 7 },
  ];
  return (
    <div className="relative mx-auto size-[168px]">
      <svg viewBox="0 0 120 110" className="size-full">
        <defs>
          <clipPath id="heart-clip">
            <path d="M60 100 C20 72 8 48 8 32 8 16 22 8 36 8 46 8 54 13 60 22 66 13 74 8 84 8 98 8 112 16 112 32 112 48 100 72 60 100Z" />
          </clipPath>
        </defs>
        <path
          d="M60 100 C20 72 8 48 8 32 8 16 22 8 36 8 46 8 54 13 60 22 66 13 74 8 84 8 98 8 112 16 112 32 112 48 100 72 60 100Z"
          fill="#f3f6fb"
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <g clipPath="url(#heart-clip)">
          {rings.map((ring) => {
            const c = 2 * Math.PI * ring.r;
            return (
              <g key={ring.color} transform="rotate(-90 60 52)">
                <circle cx="60" cy="52" r={ring.r} fill="none" stroke="#e8edf3" strokeWidth={ring.w} />
                <circle
                  cx="60"
                  cy="52"
                  r={ring.r}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={ring.w}
                  strokeLinecap="round"
                  strokeDasharray={`${c * ring.value} ${c}`}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export function MiniBars({
  values,
  color,
  max,
  labels,
}: {
  values: number[];
  color: string;
  max?: number;
  labels?: string[];
}) {
  const peak = Math.max(max ?? 0, ...values, 1);
  return (
    <div className="flex h-24 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex h-20 w-full items-end rounded-md bg-slate-100/80">
            <div className="w-full rounded-md" style={{ height: `${clamp(v / peak) * 100}%`, background: color }} />
          </div>
          {labels ? <span className="text-[10px] text-muted">{labels[i]}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="h-16" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
      const y = 28 - ((v - min) / span) * 24;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-16 w-full" preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Gauge({ score, color }: { score: number; color: string }) {
  const r = 42;
  const c = Math.PI * r;
  const v = clamp(score / 100);
  return (
    <svg viewBox="0 0 120 80" className="h-24 w-36">
      <path d="M18 70 A42 42 0 0 1 102 70" fill="none" stroke="#e8edf3" strokeWidth="10" strokeLinecap="round" />
      <path
        d="M18 70 A42 42 0 0 1 102 70"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${c * v} ${c}`}
      />
      <text x="60" y="62" textAnchor="middle" className="fill-fg" fontSize="22" fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

export function Metric({ color, label, value, hint }: { color: string; label: string; value: string; hint: string }) {
  return (
    <div>
      <div className="mx-auto mb-1 size-2 rounded-full" style={{ background: color }} />
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-[11px] text-muted">
        {label} · {hint}
      </div>
    </div>
  );
}

export function QuickTile({ to, emoji, label }: { to: "/mood" | "/habits"; emoji: string; label: string }) {
  return (
    <Link to={to} className="rounded-[24px] bg-white p-4 shadow-card">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
    </Link>
  );
}

export function Promo({ title, body }: { title: string; body: string }) {
  return (
    <ShCard>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </ShCard>
  );
}
