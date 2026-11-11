import { NextRequest } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getFfmpegPath(): string {
  const isWin = process.platform === "win32";
  const binaryName = isWin ? "ffmpeg.exe" : "ffmpeg";
  const platformFolder = `${process.platform}-${process.arch}`;

  const candidates = [
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", platformFolder, binaryName),
    path.join(process.cwd(), "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe"),
    binaryName,
  ];

  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {}
  }

  return binaryName;
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");
  const seekParam = request.nextUrl.searchParams.get("seek");

  if (!targetUrl) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new Response("Invalid URL protocol", { status: 400 });
    }
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  // Build FFmpeg command arguments
  const args = [
    "-hide_banner",
    "-loglevel", "error",
  ];

  // Optional fast seek before input
  if (seekParam) {
    const seekSec = parseFloat(seekParam);
    if (!isNaN(seekSec) && seekSec > 0) {
      args.push("-ss", seekSec.toString());
    }
  }

  // Network resilience and user-agent for IPTV sources
  args.push(
    "-reconnect", "1",
    "-reconnect_at_eof", "1",
    "-reconnect_streamed", "1",
    "-reconnect_delay_max", "5",
    "-user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "-i", targetUrl,
    "-map", "0:v:0",                                          // Extract primary video track
    "-map", "0:a:0?",                                         // Extract primary audio track (optional fallback)
    "-c:v", "copy",                                           // Copy video stream with 0 CPU cost
    "-flags", "+global_header",                               // Generate SPS/PPS global headers for TV decoders
    "-bsf:v", "dump_extra",                                   // Dump extra parameter sets into keyframes for LG webOS/Smart TVs
    "-c:a", "aac",                                            // Convert AC-3 / E-AC-3 / DTS to standard AAC
    "-b:a", "192k",                                           // 192kbps high quality audio
    "-ac", "2",                                               // 2-channel stereo for universal browser playback
    "-sn",                                                    // Ignore embedded subtitles to prevent muxer crashes
    "-f", "mp4",                                              // Output as MP4 container
    "-movflags", "frag_keyframe+default_base_moof",           // Write valid initial moov with SPS/PPS (no empty_moov) for Smart TV hardware decoders
    "pipe:1"
  );

  const ffmpegPath = getFfmpegPath();
  const ffmpegProcess = spawn(ffmpegPath, args);

  const stream = new ReadableStream({
    start(controller) {
      ffmpegProcess.stdout.on("data", (chunk: Buffer) => {
        try {
          controller.enqueue(new Uint8Array(chunk));
        } catch {
          ffmpegProcess.kill("SIGKILL");
        }
      });

      ffmpegProcess.stdout.on("end", () => {
        try {
          controller.close();
        } catch {}
      });

      ffmpegProcess.stderr.on("data", (data: Buffer) => {
        console.warn("[FFmpeg stderr]:", data.toString().trim());
      });

      ffmpegProcess.on("error", (err) => {
        console.error("[FFmpeg error]:", err);
        try {
          controller.error(err);
        } catch {}
      });

      request.signal.addEventListener("abort", () => {
        ffmpegProcess.kill("SIGKILL");
      });
    },
    cancel() {
      ffmpegProcess.kill("SIGKILL");
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
