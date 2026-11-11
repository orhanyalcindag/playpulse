"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { ActiveTab } from "@/types/iptv";
import { Home, Tv, Film, Clapperboard, Heart } from "lucide-react";

export function BottomNav() {
  const { activeTab, setActiveTab, favorites, playingMedia } = useApp();

  // Hide bottom bar when video player is currently active
  if (playingMedia) return null;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: "home",
      label: "Ana Sayfa",
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: "live",
      label: "Canlı TV",
      icon: (
        <span className="relative">
          <Tv className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
        </span>
      ),
    },
    {
      id: "movies",
      label: "Filmler",
      icon: <Film className="w-5 h-5" />,
    },
    {
      id: "series",
      label: "Diziler",
      icon: <Clapperboard className="w-5 h-5" />,
    },
    {
      id: "favorites",
      label: "Favoriler",
      badge: Object.keys(favorites).length,
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 px-2 pt-1 safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-around h-15 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 relative transition-all duration-200 cursor-pointer active:scale-95 select-none ${
                isActive
                  ? "text-brand font-bold"
                  : "text-zinc-400 hover:text-zinc-200 font-medium"
              }`}
            >
              {/* Icon Container with Badge */}
              <div
                className={`relative transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? "scale-110 drop-shadow-[0_0_12px_rgba(229,9,20,0.7)]"
                    : "opacity-80"
                }`}
              >
                {item.icon}

                {/* Favorites count badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-brand text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-brand/40">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight transition-colors ${
                  isActive ? "text-white font-semibold" : "text-zinc-400"
                }`}
              >
                {item.label}
              </span>

              {/* Active glowing indicator pill */}
              {isActive && (
                <span className="absolute -bottom-0.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-brand to-rose-400 shadow-[0_0_8px_#e50914]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
