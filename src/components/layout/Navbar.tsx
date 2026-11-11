"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ActiveTab } from "@/types/iptv";
import {
  Play,
  Tv,
  Film,
  Clapperboard,
  Heart,
  Home,
  Search,
  LogOut,
  User,
  Clock,
  Sparkles,
  Settings,
  Crown,
  Smile,
} from "lucide-react";

export function Navbar() {
  const {
    activeTab,
    setActiveTab,
    userInfo,
    logout,
    favorites,
    setSearchOpen,
    credentials,
    activeProfile,
    setIsProfileManagerOpen,
    isKidsMode,
    toggleKidsMode,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Ana Sayfa", icon: <Home className="w-4 h-4" /> },
    { id: "live", label: "Canlı TV", icon: <Tv className="w-4 h-4" /> },
    { id: "movies", label: "Filmler", icon: <Film className="w-4 h-4" /> },
    { id: "series", label: "Diziler", icon: <Clapperboard className="w-4 h-4" /> },
    {
      id: "favorites",
      label: "Favorilerim",
      icon: (
        <span className="relative">
          <Heart className="w-4 h-4" />
          {Object.keys(favorites).length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-brand text-[10px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center">
              {Object.keys(favorites).length}
            </span>
          )}
        </span>
      ),
    },
  ];

  const formatExpDate = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      const date = new Date(parseInt(timestamp, 10) * 1000);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return null;
    }
  };

  const expDateString = formatExpDate(userInfo?.exp_date);
  const isDemo = credentials?.serverUrl.toLowerCase().includes("demo");

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center text-left group cursor-pointer focus:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo_transparent.png"
              alt="PlayPulse - Streaming Evolved"
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand/15 text-white border border-brand/30 shadow-sm shadow-brand/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  <span className={isActive ? "text-brand" : "text-zinc-400"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Icons & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Kids Mode Toggle */}
          <button
            onClick={toggleKidsMode}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isKidsMode
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md shadow-emerald-500/20"
                : "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-white border-zinc-700/50"
            }`}
            title={isKidsMode ? "Çocuk Modu Açık (+18 Gizli) - Kapatmak için tıklayın" : "Çocuk Modunu Aç"}
          >
            <Smile className="w-4 h-4" />
            <span className="hidden xl:inline text-xs font-bold">
              {isKidsMode ? "Çocuk Modu" : ""}
            </span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 transition-all cursor-pointer"
            title="İçerik Ara (Ctrl + K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Profile Switcher & Settings Button */}
          <button
            onClick={() => setIsProfileManagerOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 transition-all cursor-pointer"
            title="IPTV Profillerini ve Hesapları Yönet"
          >
            <Settings className="w-4 h-4 text-zinc-300 hover:text-brand" />
          </button>

          {/* User Status / Account pill */}
          <button
            onClick={() => setIsProfileManagerOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-elevated border border-dark-border hover:border-brand/40 text-xs transition-all cursor-pointer text-left"
            title="Profil Değiştir veya Yönet"
          >
            <div
              className={`w-5 h-5 rounded-md bg-gradient-to-tr ${
                activeProfile?.color || "from-purple-600 to-rose-600"
              } flex items-center justify-center text-white text-[10px] font-bold`}
            >
              {activeProfile?.serverUrl.includes("eu4tv.com") ? (
                <Crown className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
            </div>

            <span className="font-semibold text-zinc-200 truncate max-w-[120px]">
              {activeProfile?.name || userInfo?.username || credentials?.username || "VIP Kullanıcı"}
            </span>

            {isDemo ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                <Sparkles className="w-2.5 h-2.5" />
                Demo
              </span>
            ) : (
              <>
                {userInfo?.max_connections && (
                  <span
                    className="hidden lg:flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-mono ml-1"
                    title={`Hat Durumu: ${userInfo.active_cons || 0} / ${userInfo.max_connections} bağlantı aktif`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        parseInt(userInfo.active_cons || "0", 10) >= parseInt(userInfo.max_connections || "1", 10)
                          ? "bg-amber-400 animate-pulse"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span>{userInfo.active_cons || 0}/{userInfo.max_connections}</span>
                  </span>
                )}

                {expDateString && (
                  <span className="text-[11px] text-zinc-400 border-l border-zinc-700 pl-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {expDateString}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700/50 hover:border-red-800/50 transition-all cursor-pointer"
            title="Profilden Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
