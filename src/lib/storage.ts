import { XtreamCredentials, FavoriteItem, WatchProgressItem } from "@/types/iptv";

const STORAGE_KEYS = {
  CREDENTIALS: "playpulse_credentials",
  FAVORITES: "playpulse_favorites",
  WATCH_PROGRESS: "playpulse_watch_progress",
  WATCHED_EPISODES: "playpulse_watched_episodes",
  LAST_TAB: "playpulse_last_tab",
};

export const StorageService = {
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
};
