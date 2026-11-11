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
  let cleaned = name;
  // Strip common noisy IPTV prefixes like "FILM:", "DIZI:", "TR | ", "[TR]", etc. iteratively
  const prefixRegex =
    /^(\[.*?\]|\(.*?\)|(?:FILM|MOVIES?|D[İI]Z[İI]|SERIES|CANLI|LIVE|VOD|4K|UHD|FHD)\s*[:|/\-•*~#]?\s*|(?:TR|TURK|TURKEY|ENG?|DE|FR|US|UK)\s*[:|/\-•*~#]\s*)/i;

  let prev = "";
  let iterations = 0;
  while (cleaned !== prev && iterations < 5) {
    prev = cleaned;
    cleaned = cleaned.replace(prefixRegex, "").trim();
    iterations++;
  }
  return cleaned || name;
}
