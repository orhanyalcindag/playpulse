"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { LiveCategory, LiveStream } from "@/types/iptv";
import { cleanCategoryName } from "@/lib/utils";
import {
  Tv,
  Search,
  Heart,
  Play,
  Radio,
  Loader2,
  ChevronDown,
  Lock,
} from "lucide-react";

const PAGE_SIZE = 30;

export function LiveTvView() {
  const {
    xtreamService,
    playMedia,
    isFavorite,
    toggleFavorite,
    isKidsMode,
    isAdultCategory,
    requestPinAccess,
  } = useApp();

  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isLoadingStreams, setIsLoadingStreams] = useState<boolean>(true);

  // Load Categories on mount
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingCategories(true);
    xtreamService
      .getLiveCategories()
      .then((cats) => {
        setCategories(cats);
        setIsLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Failed to fetch live categories:", err);
        setIsLoadingCategories(false);
      });
  }, [xtreamService]);

  // Load Streams when category changes
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingStreams(true);
    setVisibleCount(PAGE_SIZE);
    xtreamService
      .getLiveStreams(selectedCategoryId)
      .then((data) => {
        setStreams(data);
        setIsLoadingStreams(false);
      })
      .catch((err) => {
        console.error("Failed to fetch live streams:", err);
        setIsLoadingStreams(false);
      });
  }, [xtreamService, selectedCategoryId]);

  // Filter categories for Kids Mode
  const availableCategories = useMemo(() => {
    if (!isKidsMode) return categories;
    return categories.filter((cat) => !isAdultCategory(cat.category_name));
  }, [categories, isKidsMode]);

  const handleSelectCategory = (catId: string, catName?: string) => {
    if (catId === "all") {
      setSelectedCategoryId("all");
      return;
    }
    if (catName && isAdultCategory(catName)) {
      requestPinAccess(() => {
        setSelectedCategoryId(catId);
      });
      return;
    }
    setSelectedCategoryId(catId);
  };

  // Reset pagination on search
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // Filter streams by search query
  const filteredStreams = useMemo(() => {
    if (!searchQuery.trim()) return streams;
    const q = searchQuery.toLowerCase();
    return streams.filter((s) => s.name.toLowerCase().includes(q));
  }, [streams, searchQuery]);

  const displayedStreams = useMemo(() => {
    return filteredStreams.slice(0, visibleCount);
  }, [filteredStreams, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredStreams.length));
  };

  const handlePlayChannel = (stream: LiveStream) => {
    if (!xtreamService) return;
    const url = xtreamService.getLiveStreamUrl(stream.stream_id);
    playMedia({
      id: `live-${stream.stream_id}`,
      title: stream.name,
      subtitle: "Canlı Yayın",
      poster: stream.stream_icon,
      streamUrl: url,
      type: "live",
      contentId: stream.stream_id,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-24">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Tv className="w-7 h-7 text-brand" />
            Canlı TV Kanalları
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Yüksek çözünürlüklü kesintisiz canlı yayınları keşfedin
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Kanal adı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-white"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleSelectCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryId === "all"
                ? "bg-brand text-white shadow-md shadow-brand/40"
                : "bg-dark-elevated text-zinc-300 hover:bg-zinc-800 border border-dark-border"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Tüm Kanallar
          </button>

          {availableCategories.map((cat) => {
            const isSelected = selectedCategoryId === cat.category_id;
            const isAdult = isAdultCategory(cat.category_name);
            return (
              <button
                key={cat.category_id}
                onClick={() => handleSelectCategory(cat.category_id, cat.category_name)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-brand text-white shadow-md shadow-brand/40"
                    : "bg-dark-elevated text-zinc-300 hover:bg-zinc-800 border border-dark-border"
                }`}
              >
                {isAdult && <Lock className="w-3 h-3 text-rose-400" />}
                <span>{cleanCategoryName(cat.category_name)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Streams Grid */}
      {isLoadingStreams ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="w-10 h-10 animate-spin text-brand mb-3" />
          <p className="text-sm">Kanallar yükleniyor...</p>
        </div>
      ) : filteredStreams.length === 0 ? (
        <div className="text-center py-20 bg-dark-surface rounded-2xl border border-dashed border-zinc-800">
          <Tv className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Kanal Bulunamadı</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Arama teriminizi veya kategori filtrenizi değiştirmeyi deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {displayedStreams.map((stream) => {
              const favId = `live-${stream.stream_id}`;
              const isFav = isFavorite(favId);

              return (
                <div
                  key={stream.stream_id}
                  onClick={() => handlePlayChannel(stream)}
                  className="group relative bg-dark-surface hover:bg-dark-elevated rounded-2xl p-3 border border-dark-border hover:border-brand/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center select-none"
                >
                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite({
                        id: favId,
                        type: "live",
                        name: stream.name,
                        streamId: stream.stream_id,
                        icon: stream.stream_icon,
                        addedAt: Date.now(),
                      });
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${
                      isFav
                        ? "text-brand bg-brand/10"
                        : "text-zinc-500 hover:text-white bg-black/40 hover:bg-black/80"
                    }`}
                    title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-brand" : ""}`} />
                  </button>

                  {/* Channel Logo Container */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-900/90 flex items-center justify-center p-2 mb-3 overflow-hidden border border-white/5 group-hover:border-brand/40 transition-colors">
                    {stream.stream_icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={stream.stream_icon}
                        alt={stream.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}

                    {/* Fallback TV icon behind or if missing */}
                    <div className="absolute inset-0 flex items-center justify-center -z-1 text-zinc-700">
                      <Tv className="w-8 h-8" />
                    </div>

                    {/* Play hover badge */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/60">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Channel Name */}
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover:text-brand line-clamp-2 transition-colors w-full">
                    {stream.name}
                  </h3>

                  {/* Live Indicator Pill */}
                  <span className="mt-2 text-[10px] text-zinc-400 group-hover:text-zinc-300 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Canlı
                  </span>
                </div>
              );
            })}
          </div>

          {/* Load More Button for Channels */}
          {filteredStreams.length > visibleCount && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <p className="text-xs text-zinc-400">
                Toplam <span className="font-bold text-white">{filteredStreams.length}</span> kanaldan{" "}
                <span className="font-bold text-brand">{displayedStreams.length}</span> tanesi gösteriliyor
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="py-3 px-8 bg-dark-elevated hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/10 hover:border-brand/50 shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center gap-2 active:scale-95 group"
              >
                <span>Daha Fazla Kanal Göster (+{Math.min(PAGE_SIZE, filteredStreams.length - visibleCount)})</span>
                <ChevronDown className="w-4 h-4 text-brand group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
