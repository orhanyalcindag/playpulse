import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSecondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mStr = m.toString().padStart(2, "0");
  const sStr = s.toString().padStart(2, "0");

  if (h > 0) {
    return `${h}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

export function cleanCategoryName(name: string): string {
  if (!name) return "";
  // Strip common noisy IPTV prefixes like "TR | ", "TR - ", "4K | ", etc.
  return name.replace(/^(\[.*?\]|TR\s*[:|/-]?|TURK\s*[:|/-]?|4K\s*[:|/-]?)\s*/i, "").trim() || name;
}
