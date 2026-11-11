import {
  XtreamCredentials,
  FavoriteItem,
  WatchProgressItem,
  XtreamProfile,
  DEFAULT_PROFILES,
} from "@/types/iptv";

const STORAGE_KEYS = {
  CREDENTIALS: "playpulse_credentials",
  PROFILES: "playpulse_profiles",
  ACTIVE_PROFILE_ID: "playpulse_active_profile_id",
  FAVORITES: "playpulse_favorites",
  WATCH_PROGRESS: "playpulse_watch_progress",
  WATCHED_EPISODES: "playpulse_watched_episodes",
  LAST_TAB: "playpulse_last_tab",
  SUBTITLE_SETTINGS: "playpulse_subtitle_settings",
  PARENTAL_PIN: "playpulse_parental_pin",
  KIDS_MODE: "playpulse_kids_mode",
};

export const StorageService = {
  // Profiles
  getProfiles(): XtreamProfile[] {
    if (typeof window === "undefined") return DEFAULT_PROFILES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!data) {
        this.saveProfiles(DEFAULT_PROFILES);
        return DEFAULT_PROFILES;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default VIP profile is always included if missing
        const hasVip = parsed.some((p) => p.serverUrl.includes("eu4tv.com"));
        if (!hasVip) {
          const merged = [...DEFAULT_PROFILES, ...parsed];
          this.saveProfiles(merged);
          return merged;
        }
        return parsed;
      }
      return DEFAULT_PROFILES;
    } catch {
      return DEFAULT_PROFILES;
    }
  },

  saveProfiles(profiles: XtreamProfile[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save profiles", e);
    }
  },

  getActiveProfileId(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    } catch {
      return null;
    }
  },

  setActiveProfileId(id: string | null): void {
    if (typeof window === "undefined") return;
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
      }
    } catch (e) {
      console.error("Failed to set active profile id", e);
    }
  },

  // Credentials
  getCredentials(): XtreamCredentials | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCredentials(creds: XtreamCredentials): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(creds));
    } catch (e) {
      console.error("Failed to save credentials to localStorage", e);
    }
  },

  clearCredentials(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
    } catch (e) {
      console.error("Failed to remove credentials from localStorage", e);
    }
  },

  // Favorites
  getFavorites(): Record<string, FavoriteItem> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveFavorites(favorites: Record<string, FavoriteItem>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  },

  // Watch Progress
  getWatchProgress(): Record<string, WatchProgressItem> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveWatchProgress(progressList: Record<string, WatchProgressItem>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progressList));
    } catch (e) {
      console.error("Failed to save watch progress", e);
    }
  },

  removeWatchProgress(id: string): void {
    if (typeof window === "undefined") return;
    try {
      const all = this.getWatchProgress();
      delete all[id];
      this.saveWatchProgress(all);
    } catch (e) {
      console.error("Failed to remove progress item", e);
    }
  },

  // Watched Episodes (green checkmarks)
  getWatchedEpisodes(): Record<string, boolean> {
    if (typeof window === "undefined") return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveWatchedEpisodes(episodes: Record<string, boolean>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHED_EPISODES, JSON.stringify(episodes));
    } catch (e) {
      console.error("Failed to save watched episodes", e);
    }
  },

  // Subtitle Settings
  getSubtitleSettings(): any {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBTITLE_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveSubtitleSettings(settings: any): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.SUBTITLE_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save subtitle settings", e);
    }
  },

  // Parental PIN
  getParentalPin(): string {
    if (typeof window === "undefined") return "0000";
    try {
      return localStorage.getItem(STORAGE_KEYS.PARENTAL_PIN) || "0000";
    } catch {
      return "0000";
    }
  },

  saveParentalPin(pin: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.PARENTAL_PIN, pin);
    } catch (e) {
      console.error("Failed to save parental pin", e);
    }
  },

  // Kids Mode
  getKidsMode(): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEYS.KIDS_MODE) === "true";
    } catch {
      return false;
    }
  },

  saveKidsMode(enabled: boolean): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.KIDS_MODE, enabled ? "true" : "false");
    } catch (e) {
      console.error("Failed to save kids mode state", e);
    }
  },
};
