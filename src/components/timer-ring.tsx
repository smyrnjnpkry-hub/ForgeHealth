import { RING_HEX, type RingColor } from "@/lib/types";

export function TimerRing({
  progress,
  color,
  children,
  size = 260,
}: {
  progress: number;
  color: RingColor;
  children: React.ReactNode;
  size?: number;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1.2, progress));
  const offset = c * (1 - Math.min(1, p));
  const hex = RING_HEX[color];
  const overtime = progress > 1;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-sunken"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={overtime ? RING_HEX.coral : hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={overtime ? 0 : offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
