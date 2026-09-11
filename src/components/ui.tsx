import { cn } from "@/lib/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

export function Button({
  className,
  variant = "solid",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "sun" | "ghost" | "outline" | "danger" | "soft";
  size?: "sm" | "md" | "lg" | "icon" | "pill";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out select-none",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variant === "solid" && "bg-fg text-bg hover:opacity-90",
        variant === "sun" && "bg-sun text-sun-ink hover:brightness-95",
        variant === "ghost" && "bg-transparent text-fg hover:bg-sunken",
        variant === "outline" && "border border-border bg-surface text-fg hover:bg-sunken",
        variant === "danger" && "bg-coral text-sun-ink hover:brightness-95",
        variant === "soft" && "bg-sunken text-fg hover:bg-border",
        size === "sm" && "h-9 rounded-lg px-3 text-sm",
        size === "md" && "h-11 rounded-xl px-4 text-sm",
        size === "lg" && "h-12 rounded-2xl px-5 text-base",
        size === "icon" && "size-11 rounded-full",
        size === "pill" && "h-14 rounded-full px-7 text-base",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-fg",
        "placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
      {...props}
    />
  );
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-fg" : "bg-border",
        disabled && "opacity-40",
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "block size-5 translate-x-1 rounded-full bg-bg shadow-sm transition-transform",
          "data-[state=checked]:translate-x-6",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl bg-surface shadow-card", className)}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-fg/40"
        onClick={onClose}
      />
      <div className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-bg p-5 shadow-card sm:rounded-3xl">
        {title ? <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-full bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 flex-1 rounded-full px-3 text-sm font-medium transition-colors",
            value === o.value ? "bg-surface text-fg shadow-card" : "text-muted",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
