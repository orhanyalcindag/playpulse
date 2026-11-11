import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const preferredRegion = ["fra1", "cdg1"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Range, X-Requested-With",
  "Access-Control-Expose-Headers": "Content-Length, Content-Range, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function GET(request: NextRequest) {
  const targetUrl = request.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const parsedUrl = new URL(targetUrl);
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return NextResponse.json(
        { error: "Invalid protocol. Only http and https are allowed." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const requestHeaders: Record<string, string> = {
      "User-Agent": "IPTVSmartersPro/3.1.5 (Linux; Android 12; SM-G998B)",
      "Accept": "*/*",
      "Connection": "keep-alive",
    };

    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      requestHeaders["Range"] = rangeHeader;
    }

    // 25s timeout allows upstream enough time while preventing abrupt Vercel gateway kills
    const response = await fetch(targetUrl, {
      headers: requestHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });

    const contentType = response.headers.get("content-type") || "application/json";

    // Build response headers forwarding CORS and content attributes
    const responseHeaders: Record<string, string> = {
      ...CORS_HEADERS,
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    const contentRange = response.headers.get("content-range");
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    // Stream the response body directly to avoid Vercel 4.5MB payload limit & RAM spikes
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy fetch error for:", targetUrl, error?.message || error);
    const isTimeout = error?.name === "TimeoutError" || error?.message?.toLowerCase().includes("timeout");

    return NextResponse.json(
      {
        error: "IPTV sunucusuna bağlanılamadı",
        details: isTimeout
          ? "Sunucu yanıt vermedi (Zaman aşımı / Timeout). IPTV sunucunuz bulut IP'lerini (Vercel) engelliyor olabilir veya geçici olarak çevrimdışı."
          : (error?.message || "Bağlantı kurulamadı."),
      },
      {
        status: 504,
        headers: CORS_HEADERS,
      }
    );
  }
}
