import { PLANT_MAX_LEVEL } from "@/lib/stats";
import { cn } from "@/lib/utils";

export function Plant({
  level,
  className,
  size = 88,
  celebrate = false,
}: {
  level: number;
  className?: string;
  size?: number;
  celebrate?: boolean;
}) {
  const l = Math.max(0, Math.min(PLANT_MAX_LEVEL, level));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      className={cn("shrink-0", celebrate && "animate-plant-pulse", className)}
      aria-hidden
    >
      <ellipse cx="44" cy="78" rx="22" ry="5" fill="currentColor" opacity="0.08" />
      <path d="M42 78 V38" stroke="#7A5A32" strokeWidth="3" strokeLinecap="round" />
      {l >= 1 && (
        <ellipse cx="44" cy="68" rx="5" ry="7" fill="#C4A574" opacity={l === 1 ? 1 : 0.35} />
      )}
      {l >= 2 && (
        <path d="M42 64 C28 60 24 50 30 44 C38 52 40 56 42 60" fill="#7BC47F" />
      )}
      {l >= 3 && (
        <path d="M43 58 C56 54 62 46 58 38 C48 44 45 50 43 56" fill="#4CAF6A" />
      )}
      {l >= 4 && (
        <>
          <circle cx="34" cy="42" r="11" fill="#3FA35A" />
          <circle cx="52" cy="38" r="12" fill="#4CAF6A" />
        </>
      )}
      {l >= 5 && (
        <>
          <circle cx="44" cy="30" r="13" fill="#2F9E6B" />
          <circle cx="28" cy="36" r="9" fill="#62C57A" />
          <circle cx="60" cy="36" r="9" fill="#3FA35A" />
        </>
      )}
      {l >= 6 && (
        <>
          <circle cx="44" cy="24" r="14" fill="#2F9E6B" />
          <circle cx="24" cy="32" r="11" fill="#4CAF6A" />
          <circle cx="64" cy="32" r="11" fill="#3FA35A" />
        </>
      )}
      {l >= 7 && (
        <>
          <circle cx="36" cy="18" r="8" fill="#62C57A" />
          <circle cx="52" cy="16" r="9" fill="#4CAF6A" />
          <circle cx="16" cy="48" r="8" fill="#4CAF6A" />
          <circle cx="72" cy="48" r="8" fill="#3FA35A" />
        </>
      )}
      {l >= 8 && (
        <>
          <circle cx="30" cy="22" r="3.5" fill="#f5c400" />
          <circle cx="58" cy="20" r="3.5" fill="#f5c400" />
          <circle cx="44" cy="12" r="4" fill="#f5c400" />
        </>
      )}
      {l >= 9 && (
        <>
          <circle cx="12" cy="52" r="7" fill="#62C57A" />
          <circle cx="76" cy="52" r="7" fill="#4CAF6A" />
          <circle cx="44" cy="8" r="5" fill="#7BC47F" />
          <circle cx="22" cy="26" r="3" fill="#f5c400" />
          <circle cx="66" cy="28" r="3" fill="#f5c400" />
        </>
      )}
      {l === 0 && (
        <ellipse cx="44" cy="70" rx="6" ry="8" fill="#C4A574" />
      )}
    </svg>
  );
}

export function SunMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden>
      <circle cx="56" cy="44" r="28" fill="#f5c400" />
    </svg>
  );
}
