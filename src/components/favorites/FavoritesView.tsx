"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { FavoriteItem } from "@/types/iptv";
import {
  Heart,
  Play,
  Tv,
  Film,
  Clapperboard,
  ArrowUpDown,
  Trash2,
  Star,
  Search,
} from "lucide-react";

type FilterType = "all" | "live" | "movie" | "series";
type SortOption = "date-desc" | "name-asc" | "name-desc" | "rating-desc";

export function FavoritesView() {
  const { favorites, toggleFavorite, playMedia, xtreamService, setActiveTab } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const favoriteList = useMemo(() => {
    return Object.values(favorites);
  }, [favorites]);

  // Filter & Sort
  const processedFavorites = useMemo(() => {
    let result = [...favoriteList];

    // Filter by type
    if (activeFilter !== "all") {
      result = result.filter((item) => item.type === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "name-asc") {
        return a.name.localeCompare(b.name, "tr");
      }
      if (sortOption === "name-desc") {
        return b.name.localeCompare(a.name, "tr");
      }
      if (sortOption === "rating-desc") {
        const rA = parseFloat(String(a.rating || 0)) || 0;
        const rB = parseFloat(String(b.rating || 0)) || 0;
        return rB - rA;
      }
      // Default: date-desc
      return (b.addedAt || 0) - (a.addedAt || 0);
    });

    return result;
  }, [favoriteList, activeFilter, searchQuery, sortOption]);

  const handlePlay = (item: FavoriteItem) => {
    if (!xtreamService) return;

    if (item.type === "live") {
      const url = xtreamService.getLiveStreamUrl(item.streamId);
      playMedia({
        id: item.id,
        title: item.name,
        subtitle: "Canlı TV",
        poster: item.icon,
        streamUrl: url,
        type: "live",
        contentId: item.streamId,
      });
    } else if (item.type === "movie") {
      const url = xtreamService.getMovieStreamUrl(
        item.streamId,
        item.container_extension || "mp4"
      );
      playMedia({
        id: item.id,
        title: item.name,
        subtitle: "Film",
        poster: item.icon,
        streamUrl: url,
        type: "movie",
        contentId: item.streamId,
      });
    } else if (item.type === "series") {
      // Direct navigation or quick playback
      setActiveTab("series");
    }
  };

  const counts = {
    all: favoriteList.length,
    live: favoriteList.filter((f) => f.type === "live").length,
    movie: favoriteList.filter((f) => f.type === "movie").length,
    series: favoriteList.filter((f) => f.type === "series").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-brand fill-brand" />
            Favorilerim
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Kaydettiğiniz tüm canlı kanallar, filmler ve diziler tek bir yerde
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Favorilerde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-300">
              <ArrowUpDown className="w-4 h-4 text-brand shrink-0" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer pr-2"
              >
                <option value="date-desc" className="bg-dark-surface text-white">
                  En Son Eklenenler
                </option>
                <option value="name-asc" className="bg-dark-surface text-white">
                  İsim (A &rarr; Z)
                </option>
                <option value="name-desc" className="bg-dark-surface text-white">
                  İsim (Z &rarr; A)
                </option>
                <option value="rating-desc" className="bg-dark-surface text-white">
                  IMDB Puanı (Yüksekten Düşüğe)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Tümü, Canlı TV, Filmler, Diziler) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 py-1">
        {[
          { id: "all", label: "Tümü", icon: <Heart className="w-3.5 h-3.5" />, count: counts.all },
          { id: "live", label: "Canlı TV", icon: <Tv className="w-3.5 h-3.5" />, count: counts.live },
          { id: "movie", label: "Filmler", icon: <Film className="w-3.5 h-3.5" />, count: counts.movie },
          { id: "series", label: "Diziler", icon: <Clapperboard className="w-3.5 h-3.5" />, count: counts.series },
        ].map((tab) => {
          const isSelected = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? "bg-brand text-white shadow-md shadow-brand/40"
                  : "bg-dark-elevated text-zinc-300 hover:bg-zinc-800 border border-dark-border"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Favorites List / Grid */}
      {processedFavorites.length === 0 ? (
        <div className="text-center py-24 bg-dark-surface rounded-2xl border border-dashed border-zinc-800">
          <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">
            Henüz favori içerik bulunmuyor
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            İzlemekten keyif aldığınız kanal, film veya dizilerdeki kalp ikonuna tıklayarak buraya ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
          {processedFavorites.map((item) => {
            const isLive = item.type === "live";

            return (
              <div
                key={item.id}
                onClick={() => handlePlay(item)}
                className="group relative bg-dark-surface hover:bg-dark-elevated rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-1.5 cursor-pointer flex flex-col"
              >
                {/* Media Artwork Area */}
                <div
                  className={`relative w-full bg-zinc-900 overflow-hidden ${
                    isLive ? "aspect-video flex items-center justify-center p-3" : "aspect-[2/3]"
                  }`}
                >
                  {item.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.icon}
                      alt={item.name}
                      className={`transition-transform duration-500 group-hover:scale-105 ${
                        isLive ? "max-w-full max-h-full object-contain" : "w-full h-full object-cover"
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}

                  {/* Fallback Icon */}
                  <div className="absolute inset-0 flex items-center justify-center -z-1 text-zinc-700">
                    {item.type === "live" ? (
                      <Tv className="w-8 h-8" />
                    ) : item.type === "series" ? (
                      <Clapperboard className="w-10 h-10" />
                    ) : (
                      <Film className="w-10 h-10" />
                    )}
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-zinc-300 border border-white/10 uppercase">
                    {item.type === "live" ? "Canlı" : item.type === "series" ? "Dizi" : "Film"}
                  </div>

                  {/* Rating if present */}
                  {item.rating && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {item.rating}
                    </div>
                  )}

                  {/* Remove Favorite Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-brand/20 hover:bg-brand text-brand hover:text-white transition-all cursor-pointer z-10"
                    title="Favorilerden Kaldır"
                  >
                    <Heart className="w-4 h-4 fill-brand" />
                  </button>

                  {/* Play hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/60">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-brand line-clamp-1 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span>{item.type === "live" ? "Kanal" : item.type === "series" ? "Dizi" : "Film"}</span>
                    <span className="text-brand font-medium">İzle &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
