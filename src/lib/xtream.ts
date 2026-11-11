import {
  XtreamCredentials,
  XtreamAuthResponse,
  LiveCategory,
  LiveStream,
  VodCategory,
  VodStream,
  VodInfo,
  SeriesCategory,
  SeriesItem,
  SeriesInfoResponse,
} from "@/types/iptv";
import {
  MOCK_AUTH_RESPONSE,
  MOCK_LIVE_CATEGORIES,
  MOCK_LIVE_STREAMS,
  MOCK_VOD_CATEGORIES,
  MOCK_VOD_STREAMS,
  MOCK_VOD_INFO,
  MOCK_SERIES_CATEGORIES,
  MOCK_SERIES,
  MOCK_SERIES_INFO,
} from "./mockData";

export class XtreamService {
  private credentials: XtreamCredentials;
  private isDemo: boolean;

  constructor(credentials: XtreamCredentials) {
    this.credentials = {
      ...credentials,
      serverUrl: credentials.serverUrl.replace(/\/+$/, ""), // Strip trailing slash
    };
    this.isDemo =
      this.credentials.serverUrl.toLowerCase().includes("demo") ||
      this.credentials.username.toLowerCase() === "demo";
  }

  private buildApiUrl(action?: string, params?: Record<string, string | number>): string {
    const { serverUrl, username, password } = this.credentials;
    const url = new URL(`${serverUrl}/player_api.php`);
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);

    if (action) {
      url.searchParams.append("action", action);
    }

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async fetchViaProxy<T>(directUrl: string): Promise<T> {
    if (this.credentials.connectionMode === "direct") {
      try {
        const res = await fetch(directUrl);
        if (!res.ok) {
          throw new Error(`Sunucu Hatası: ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (err: any) {
        throw new Error(
          `Doğrudan bağlantı başarısız (${err?.message || "CORS engeli"}). Tarayıcınızda "Allow CORS" eklentisinin aktif olduğundan emin olun.`
        );
      }
    }

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(directUrl)}`;
    let res: Response;

    try {
      res = await fetch(proxyUrl);
    } catch (networkError: any) {
      // If browser fetch to proxy failed, try direct client fetch if directUrl is https
      if (typeof window !== "undefined" && directUrl.startsWith("https://")) {
        try {
          const directRes = await fetch(directUrl);
          if (directRes.ok) {
            return await directRes.json();
          }
        } catch {
          // fallback failed, proceed with error
        }
      }
      throw new Error(
        "Ağ bağlantısı kurulamadı (Failed to fetch). İnternet bağlantınızı veya sunucu adresinizi kontrol edin."
      );
    }

    if (!res.ok) {
      let errDetails = "";
      try {
        const errJson = await res.json();
        errDetails = errJson.details || errJson.error || "";
      } catch {
        // Not JSON
      }

      if (res.status === 401) {
        throw new Error("Kullanıcı adı veya şifre hatalı! (401 Unauthorized)");
      }

      if (res.status === 504 || res.status === 502) {
        throw new Error(
          errDetails ||
            "IPTV sunucusu yanıt vermedi. Sunucu kapalı olabilir veya Vercel bulut IP'lerini engelliyor olabilir."
        );
      }

      throw new Error(
        errDetails || `IPTV API hatası: ${res.status} ${res.statusText}`
      );
    }

    return res.json();
  }

  // 1. Authenticate
  async authenticate(): Promise<XtreamAuthResponse> {
    if (this.isDemo) {
      return MOCK_AUTH_RESPONSE;
    }

    const directUrl = this.buildApiUrl();
    const data = await this.fetchViaProxy<any>(directUrl);

    if (!data || !data.user_info || data.user_info.auth === 0) {
      throw new Error(data?.user_info?.message || "Geçersiz kullanıcı adı veya şifre!");
    }

    return data as XtreamAuthResponse;
  }

  // 2. Live TV
  async getLiveCategories(): Promise<LiveCategory[]> {
    if (this.isDemo) {
      return MOCK_LIVE_CATEGORIES;
    }
    const directUrl = this.buildApiUrl("get_live_categories");
    const data = await this.fetchViaProxy<LiveCategory[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  async getLiveStreams(categoryId?: string): Promise<LiveStream[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === "all") return MOCK_LIVE_STREAMS;
      return MOCK_LIVE_STREAMS.filter((s) => s.category_id === categoryId);
    }
    const params = categoryId && categoryId !== "all" ? { category_id: categoryId } : undefined;
    const directUrl = this.buildApiUrl("get_live_streams", params);
    const data = await this.fetchViaProxy<LiveStream[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  // 3. VOD (Movies)
  async getVodCategories(): Promise<VodCategory[]> {
    if (this.isDemo) {
      return MOCK_VOD_CATEGORIES;
    }
    const directUrl = this.buildApiUrl("get_vod_categories");
    const data = await this.fetchViaProxy<VodCategory[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  async getVodStreams(categoryId?: string): Promise<VodStream[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === "all") return MOCK_VOD_STREAMS;
      return MOCK_VOD_STREAMS.filter((s) => s.category_id === categoryId);
    }
    const params = categoryId && categoryId !== "all" ? { category_id: categoryId } : undefined;
    const directUrl = this.buildApiUrl("get_vod_streams", params);
    const data = await this.fetchViaProxy<VodStream[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  async getVodInfo(vodId: number): Promise<VodInfo | null> {
    if (this.isDemo) {
      return (
        MOCK_VOD_INFO[vodId] || {
          info: {
            name: "Örnek Film",
            plot: "Bu bir demo film açıklamasıdır.",
            rating: "8.0",
            duration: "120 dk",
            duration_secs: 7200,
          },
          movie_data: { stream_id: vodId, name: "Örnek Film", container_extension: "mp4" },
        }
      );
    }
    const directUrl = this.buildApiUrl("get_vod_info", { vod_id: vodId });
    return this.fetchViaProxy<VodInfo>(directUrl);
  }

  // 4. Series
  async getSeriesCategories(): Promise<SeriesCategory[]> {
    if (this.isDemo) {
      return MOCK_SERIES_CATEGORIES;
    }
    const directUrl = this.buildApiUrl("get_series_categories");
    const data = await this.fetchViaProxy<SeriesCategory[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  async getSeriesList(categoryId?: string): Promise<SeriesItem[]> {
    if (this.isDemo) {
      if (!categoryId || categoryId === "all") return MOCK_SERIES;
      return MOCK_SERIES.filter((s) => s.category_id === categoryId);
    }
    const params = categoryId && categoryId !== "all" ? { category_id: categoryId } : undefined;
    const directUrl = this.buildApiUrl("get_series", params);
    const data = await this.fetchViaProxy<SeriesItem[]>(directUrl);
    return Array.isArray(data) ? data : [];
  }

  async getSeriesInfo(seriesId: number): Promise<SeriesInfoResponse | null> {
    if (this.isDemo) {
      return (
        MOCK_SERIES_INFO[seriesId] || {
          seasons: [{ season_number: 1, name: "1. Sezon", episode_count: 1 }],
          info: { name: "Demo Dizi", plot: "Örnek dizi açıklaması.", rating: "8.5" },
          episodes: {
            "1": [
              {
                id: "999",
                episode_num: 1,
                season: 1,
                title: "1. Bölüm",
                container_extension: "mp4",
                info: { duration: "45 dk", duration_secs: 2700, plot: "Örnek bölüm" },
              },
            ],
          },
        }
      );
    }
    const directUrl = this.buildApiUrl("get_series_info", { series_id: seriesId });
    return this.fetchViaProxy<SeriesInfoResponse>(directUrl);
  }

  // Stream URL Generators
  getLiveStreamUrl(streamId: number, extension: "m3u8" | "ts" = "m3u8"): string {
    if (this.isDemo) {
      const match = MOCK_LIVE_STREAMS.find((s) => s.stream_id === streamId);
      if (match?.direct_source) return match.direct_source;
      return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    }
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/live/${username}/${password}/${streamId}.${extension}`;
  }

  getMovieStreamUrl(streamId: number, containerExtension: string = "mp4"): string {
    if (this.isDemo) {
      const match = MOCK_VOD_STREAMS.find((s) => s.stream_id === streamId);
      if (match?.direct_source) return match.direct_source;
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/movie/${username}/${password}/${streamId}.${containerExtension || "mp4"}`;
  }

  getSeriesStreamUrl(episodeId: string | number, containerExtension: string = "mp4"): string {
    if (this.isDemo) {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
    }
    const { serverUrl, username, password } = this.credentials;
    return `${serverUrl}/series/${username}/${password}/${episodeId}.${containerExtension || "mp4"}`;
  }
}
