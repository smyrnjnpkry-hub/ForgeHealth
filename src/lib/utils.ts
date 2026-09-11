import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  return crypto.randomUUID();
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function weekday(d = new Date()) {
  return d.getDay();
}

export function pad2(n: number) {
  return String(Math.floor(Math.abs(n))).padStart(2, "0");
}

export function formatClock(totalSec: number) {
  const sign = totalSec < 0 ? "-" : "";
  const s = Math.abs(Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${sign}${h}:${pad2(m)}:${pad2(sec)}`;
  return `${sign}${m}:${pad2(sec)}`;
}

export function formatDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.round(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function formatTime(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  const am = h < 12;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${am ? "AM" : "PM"}`;
}

export function addMinutes(hhmm: string, minutes: number) {
  const [hStr, mStr] = hhmm.split(":");
  const total = Number(hStr) * 60 + Number(mStr) + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

export function parseHm(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function nowHm() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const DAY_NAMES = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;
