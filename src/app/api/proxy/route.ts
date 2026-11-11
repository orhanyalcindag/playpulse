import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing 'url' query parameter" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "IPTVSmartersPlayer/3.1.5 (Linux; Android 10)",
        "Accept": "*/*",
      },
      cache: "no-store", // Critical: prevents Next.js 2MB body cache limit error on large IPTV catalogs
      signal: AbortSignal.timeout(60000), // 60s timeout for large upstream IPTV provider lists
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json") || targetUrl.includes("player_api.php")) {
      // Forward JSON text directly to avoid memory overhead of JSON.parse/stringify on huge lists
      const rawText = await response.text();
      return new NextResponse(rawText, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Cache-Control": "no-store",
        },
      });
    }

    // For plain text, m3u8 or media chunks
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Proxy fetch error for:", targetUrl, error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch upstream resource", details: error?.message },
      { status: 502 }
    );
  }
}
