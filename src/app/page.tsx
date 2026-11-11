"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { HomeView } from "@/components/home/HomeView";
import { LiveTvView } from "@/components/live/LiveTvView";
import { MoviesView } from "@/components/vod/MoviesView";
import { SeriesView } from "@/components/vod/SeriesView";
import { FavoritesView } from "@/components/favorites/FavoritesView";
import { VideoPlayerModal } from "@/components/player/VideoPlayerModal";
import { SearchModal } from "@/components/ui/SearchModal";
import { Play, Loader2 } from "lucide-react";

export default function AppMain() {
  const { isAuthenticated, isLoadingAuth, activeTab } = useApp();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center mb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/symbol_transparent.png"
            alt="PlayPulse"
            className="w-20 h-20 object-contain animate-pulse drop-shadow-[0_0_35px_rgba(168,85,247,0.55)]"
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo_transparent.png"
          alt="PlayPulse"
          className="h-10 w-auto object-contain mb-3"
        />
        <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
          Oturum hazırlanıyor...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <main className="min-h-screen bg-dark-bg text-zinc-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Tab Content */}
      <div className="flex-1 pb-20 md:pb-6">
        {activeTab === "home" && <HomeView />}
        {activeTab === "live" && <LiveTvView />}
        {activeTab === "movies" && <MoviesView />}
        {activeTab === "series" && <SeriesView />}
        {activeTab === "favorites" && <FavoritesView />}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Fullscreen Video Player Modal */}
      <VideoPlayerModal />

      {/* Global Search Modal */}
      <SearchModal />
    </main>
  );
}
