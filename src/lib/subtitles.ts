export interface SubtitleCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface SubtitleSettings {
  fontSize: "small" | "medium" | "large" | "xlarge";
  color: "white" | "yellow" | "cyan" | "green";
  backgroundColor: "transparent" | "semi" | "solid";
  offset: number; // in seconds (-5.0 to +5.0)
}

export const DEFAULT_SUBTITLE_SETTINGS: SubtitleSettings = {
  fontSize: "medium",
  color: "white",
  backgroundColor: "semi",
  offset: 0,
};

// Convert HH:MM:SS,mmm or HH:MM:SS.mmm to seconds
export function timeStringToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(",", ".");
  const parts = cleaned.split(":");
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  }
  return parseFloat(cleaned) || 0;
}

// Format seconds into HH:MM:SS.mmm (WebVTT style)
export function secondsToVttTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = (s % 60).toFixed(3);

  const hStr = hours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  const [secPart, msPart] = secs.split(".");
  const sStr = secPart.padStart(2, "0");
  const msStr = (msPart || "000").padEnd(3, "0").slice(0, 3);

  return `${hStr}:${mStr}:${sStr}.${msStr}`;
}

// Parse SRT or VTT content into structured cues
export function parseSubtitleContent(content: string): SubtitleCue[] {
  if (!content) return [];

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];
  let cueId = 1;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    // Skip WEBVTT header
    if (lines[0].startsWith("WEBVTT") || lines[0].startsWith("NOTE")) {
      continue;
    }

    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex === -1) continue;

    const timeLine = lines[timeLineIndex];
    const match = timeLine.match(/([\d:,.]+)\s*-->\s*([\d:,.]+)/);
    if (!match) continue;

    const startSec = timeStringToSeconds(match[1]);
    const endSec = timeStringToSeconds(match[2]);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines
      .join("\n")
      .replace(/<[^>]+>/g, "") // Strip HTML/formatting tags like <i>, <b>, <font>
      .trim();

    if (text && endSec > startSec) {
      cues.push({
        id: cueId++,
        start: startSec,
        end: endSec,
        text,
      });
    }
  }

  return cues;
}

// Convert parsed cues to valid WebVTT string
export function cuesToWebVtt(cues: SubtitleCue[], offsetSeconds: number = 0): string {
  let vtt = "WEBVTT\n\n";

  for (const cue of cues) {
    const adjStart = Math.max(0, cue.start + offsetSeconds);
    const adjEnd = Math.max(adjStart + 0.1, cue.end + offsetSeconds);

    vtt += `${cue.id}\n`;
    vtt += `${secondsToVttTime(adjStart)} --> ${secondsToVttTime(adjEnd)}\n`;
    vtt += `${cue.text}\n\n`;
  }

  return vtt;
}

// Create a Blob URL from WebVTT string
export function createVttBlobUrl(vttContent: string): string {
  const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
  return URL.createObjectURL(blob);
}
