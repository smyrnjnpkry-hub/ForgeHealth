import { EMOJI_SET } from "@/lib/templates";
import { cn } from "@/lib/utils";

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {EMOJI_SET.map((e) => (
        <button
          key={e}
          type="button"
          onClick={() => onChange(e)}
          className={cn(
            "flex size-10 items-center justify-center rounded-xl text-lg",
            e === value ? "bg-sun" : "bg-sunken",
          )}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

const PASTELS = [
  "bg-[#FFF3C4]",
  "bg-[#D1FAE5]",
  "bg-[#DBEAFE]",
  "bg-[#FFEDD5]",
  "bg-[#E0E7FF]",
  "bg-[#FCE7F3]",
  "bg-[#E2F0CB]",
  "bg-[#F1F5F9]",
];

export function IconBadge({
  emoji,
  seed,
  size = "md",
}: {
  emoji: string;
  seed: string;
  size?: "sm" | "md" | "lg";
}) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i) * (i + 1)) % PASTELS.length;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl",
        PASTELS[n],
        size === "sm" && "size-9 text-base",
        size === "md" && "size-11 text-lg",
        size === "lg" && "size-16 text-3xl",
      )}
    >
      {emoji}
    </span>
  );
}
