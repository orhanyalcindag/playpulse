"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  XtreamCredentials,
  XtreamUserInfo,
  XtreamServerInfo,
  FavoriteItem,
  WatchProgressItem,
  ActiveTab,
  PlayingMedia,
} from "@/types/iptv";
import { StorageService } from "@/lib/storage";
import { XtreamService } from "@/lib/xtream";

interface AppContextType {
  credentials: XtreamCredentials | null;
  userInfo: XtreamUserInfo | null;
  serverInfo: XtreamServerInfo | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  login: (creds: XtreamCredentials) => Promise<void>;
  logout: () => void;

  // Favorites
  favorites: Record<string, FavoriteItem>;
  toggleFavorite: (item: FavoriteItem) => void;
  isFavorite: (id: string) => boolean;

  // Watch Progress (Continue Watching)
  watchProgress: Record<string, WatchProgressItem>;
  updateWatchProgress: (progress: Partial<WatchProgressItem> & { id: string }) => void;
  removeWatchProgress: (id: string) => void;

  // Watched Episodes
  watchedEpisodes: Record<string, boolean>;
  toggleWatchedEpisode: (episodeKey: string) => void;
  isEpisodeWatched: (episodeKey: string) => boolean;

  // Video Player state
  playingMedia: PlayingMedia | null;
  playMedia: (media: PlayingMedia) => void;
  closePlayer: () => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Service
  xtreamService: XtreamService | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<XtreamCredentials | null>(null);
  const [userInfo, setUserInfo] = useState<XtreamUserInfo | null>(null);
  const [serverInfo, setServerInfo] = useState<XtreamServerInfo | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  const [favorites, setFavorites] = useState<Record<string, FavoriteItem>>({});
  const [watchProgress, setWatchProgress] = useState<Record<string, WatchProgressItem>>({});
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});

  const [playingMedia, setPlayingMedia] = useState<PlayingMedia | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Initialize service based on credentials
  const xtreamService = useMemo(() => {
    if (!credentials) return null;
    return new XtreamService(credentials);
  }, [credentials]);

  // Load initial data from localStorage on mount
  useEffect(() => {
    const savedCreds = StorageService.getCredentials();
    const savedFavs = StorageService.getFavorites();
    const savedProgress = StorageService.getWatchProgress();
    const savedEpisodes = StorageService.getWatchedEpisodes();

    setFavorites(savedFavs);
    setWatchProgress(savedProgress);
    setWatchedEpisodes(savedEpisodes);

    if (savedCreds) {
      setCredentials(savedCreds);
      const service = new XtreamService(savedCreds);
      
      // Safety timeout: max 3.5s on splash screen
      const timeoutId = setTimeout(() => {
        setIsLoadingAuth(false);
      }, 3500);

      service
        .authenticate()
        .then((res) => {
          setUserInfo(res.user_info);
          setServerInfo(res.server_info);
        })
        .catch((err) => {
          console.warn("Could not re-authenticate saved credentials:", err);
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
  }, []);

  const login = async (creds: XtreamCredentials) => {
    const service = new XtreamService(creds);
    const authData = await service.authenticate();
    StorageService.saveCredentials(creds);
    setCredentials(creds);
    setUserInfo(authData.user_info);
    setServerInfo(authData.server_info);
    setActiveTab("home");
  };

  const logout = () => {
    StorageService.clearCredentials();
    setCredentials(null);
    setUserInfo(null);
    setServerInfo(null);
    setPlayingMedia(null);
    setActiveTab("home");
  };

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites((prev) => {
      const updated = { ...prev };
      if (updated[item.id]) {
        delete updated[item.id];
      } else {
        updated[item.id] = { ...item, addedAt: Date.now() };
      }
      StorageService.saveFavorites(updated);
      return updated;
    });
  };

  const isFavorite = (id: string): boolean => {
    return !!favorites[id];
  };

  const updateWatchProgress = (item: Partial<WatchProgressItem> & { id: string }) => {
    setWatchProgress((prev) => {
      const existing = prev[item.id] || {};
      const updatedItem: WatchProgressItem = {
        ...existing,
        ...item,
        lastWatchedAt: Date.now(),
      } as WatchProgressItem;

      // If user watched more than 92%, also mark episode as watched if it's an episode
      if (
        updatedItem.type === "series" &&
        updatedItem.seriesId &&
        updatedItem.seasonNum !== undefined &&
        updatedItem.episodeNum !== undefined &&
        updatedItem.progressPercentage >= 90
      ) {
        const epKey = `${updatedItem.seriesId}-s${updatedItem.seasonNum}-e${updatedItem.episodeNum}`;
        setWatchedEpisodes((epPrev) => {
          const epNext = { ...epPrev, [epKey]: true };
          StorageService.saveWatchedEpisodes(epNext);
          return epNext;
        });
      }

      const next = { ...prev, [item.id]: updatedItem };
      StorageService.saveWatchProgress(next);
      return next;
    });
  };

  const removeWatchProgress = (id: string) => {
    setWatchProgress((prev) => {
      const updated = { ...prev };
      delete updated[id];
      StorageService.saveWatchProgress(updated);
      return updated;
    });
  };

  const toggleWatchedEpisode = (episodeKey: string) => {
    setWatchedEpisodes((prev) => {
      const next = { ...prev, [episodeKey]: !prev[episodeKey] };
      StorageService.saveWatchedEpisodes(next);
      return next;
    });
  };

  const isEpisodeWatched = (episodeKey: string): boolean => {
    return !!watchedEpisodes[episodeKey];
  };

  const playMedia = (media: PlayingMedia) => {
    setPlayingMedia(media);
  };

  const closePlayer = () => {
    setPlayingMedia(null);
  };

  return (
    <AppContext.Provider
      value={{
        credentials,
        userInfo,
        serverInfo,
        isAuthenticated: !!credentials,
        isLoadingAuth,
        activeTab,
        setActiveTab,
        login,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        watchProgress,
        updateWatchProgress,
        removeWatchProgress,
        watchedEpisodes,
        toggleWatchedEpisode,
        isEpisodeWatched,
        playingMedia,
        playMedia,
        closePlayer,
        searchOpen,
        setSearchOpen,
        xtreamService,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
