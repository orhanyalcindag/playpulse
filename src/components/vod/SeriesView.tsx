"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { SeriesCategory, SeriesItem } from "@/types/iptv";
import { cleanCategoryName } from "@/lib/utils";
import {
  Clapperboard,
  Search,
  Heart,
  Play,
  Star,
  Loader2,
  ChevronDown,
  Info,
  Lock,
} from "lucide-react";
import { SeriesDetailModal } from "./SeriesDetailModal";

const PAGE_SIZE = 20;

export function SeriesView() {
  const {
    xtreamService,
    isFavorite,
    toggleFavorite,
    playMedia,
    watchProgress,
    isKidsMode,
    isAdultCategory,
    requestPinAccess,
  } = useApp();

  const [categories, setCategories] = useState<SeriesCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isLoadingSeries, setIsLoadingSeries] = useState<boolean>(true);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [loadingSeriesId, setLoadingSeriesId] = useState<number | null>(null);

  // Load Categories
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingCategories(true);
    xtreamService
      .getSeriesCategories()
      .then((cats) => {
        setCategories(cats);
        setIsLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Failed to load series categories:", err);
        setIsLoadingCategories(false);
      });
  }, [xtreamService]);

  // Load Series when category changes
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingSeries(true);
    setVisibleCount(PAGE_SIZE);
    xtreamService
      .getSeriesList(selectedCategoryId)
      .then((data) => {
        setSeriesList(data);
        setIsLoadingSeries(false);
      })
      .catch((err) => {
        console.error("Failed to load series:", err);
        setIsLoadingSeries(false);
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

  // Reset on search
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // Filter series
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase();
    return seriesList.filter((s) => s.name.toLowerCase().includes(q));
  }, [seriesList, searchQuery]);

  const displayedSeries = useMemo(() => {
    return filteredSeries.slice(0, visibleCount);
  }, [filteredSeries, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSeries.length));
  };

  // Direct play handler for series (plays Episode 1 or resumes last watched)
  const handleDirectPlaySeries = async (series: SeriesItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!xtreamService) return;

    // Check if user already has watch progress for this series
    const existingProgress = Object.values(watchProgress).find(
      (p) => p.seriesId === series.series_id && p.progressPercentage < 95
    );

    if (existingProgress) {
      playMedia({
        id: existingProgress.id,
        title: existingProgress.title,
        subtitle: existingProgress.subtitle,
        poster: existingProgress.poster,
        streamUrl: existingProgress.streamUrl,
        type: "series",
        contentId: existingProgress.contentId,
        seriesId: existingProgress.seriesId,
        seasonNum: existingProgress.seasonNum,
        episodeNum: existingProgress.episodeNum,
        episodeId: existingProgress.episodeId,
      });
      return;
    }

    // Otherwise fetch series info to get first episode
    setLoadingSeriesId(series.series_id);
    try {
      const info = await xtreamService.getSeriesInfo(series.series_id);
      if (info && info.episodes) {
        // Find first season and first episode
        const firstSeasonKey = Object.keys(info.episodes)[0] || "1";
        const seasonEpisodes = info.episodes[firstSeasonKey];
        if (seasonEpisodes && seasonEpisodes.length > 0) {
          const ep1 = seasonEpisodes[0];
          const streamUrl = xtreamService.getSeriesStreamUrl(
            ep1.id,
            ep1.container_extension || "mp4"
          );

          let nextEpisode = undefined;
          if (seasonEpisodes.length > 1) {
            const ep2 = seasonEpisodes[1];
            nextEpisode = {
              title: ep2.title,
              seasonNum: Number(firstSeasonKey),
              episodeNum: ep2.episode_num,
              streamUrl: xtreamService.getSeriesStreamUrl(ep2.id, ep2.container_extension || "mp4"),
              episodeId: String(ep2.id),
              poster: ep2.info?.movie_image || series.cover,
            };
          }

          playMedia({
            id: `series-${series.series_id}-s${firstSeasonKey}-e${ep1.episode_num}`,
            title: series.name,
            subtitle: `${firstSeasonKey}. Sezon ${ep1.episode_num}. Bölüm: ${ep1.title}`,
            poster: ep1.info?.movie_image || series.cover,
            streamUrl,
            type: "series",
            contentId: series.series_id,
            seriesId: series.series_id,
            seasonNum: Number(firstSeasonKey),
            episodeNum: ep1.episode_num,
            episodeId: String(ep1.id),
            nextEpisode,
          });
          return;
        }
      }
      // Fallback: open modal if no episodes found
      setSelectedSeries(series);
    } catch {
      setSelectedSeries(series);
    } finally {
      setLoadingSeriesId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-24">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Clapperboard className="w-7 h-7 text-brand" />
            Diziler & Sezonlar
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Yerli ve yabancı popüler diziler, bölümler ve Exxen orijinalleri
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Dizi adı ara..."
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
            <Clapperboard className="w-3.5 h-3.5" />
            Tüm Diziler
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

      {/* Series Grid */}
      {isLoadingSeries ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="w-10 h-10 animate-spin text-brand mb-3" />
          <p className="text-sm">Diziler listeleniyor...</p>
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="text-center py-20 bg-dark-surface rounded-2xl border border-dashed border-zinc-800">
          <Clapperboard className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Dizi Bulunamadı</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Farklı bir arama terimi veya kategori deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {displayedSeries.map((series) => {
              const favId = `series-${series.series_id}`;
              const isFav = isFavorite(favId);
              const isCurrentLoading = loadingSeriesId === series.series_id;

              return (
                <div
                  key={series.series_id}
                  className="group relative bg-dark-surface hover:bg-dark-elevated rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-1.5 flex flex-col select-none"
                >
                  {/* Poster Area - Clicking opens Series Details & Episode List modal */}
                  <div
                    onClick={() => setSelectedSeries(series)}
                    className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden cursor-pointer"
                  >
                    {series.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={series.cover}
                        alt={series.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}

                    {/* Fallback Icon */}
                    <div className="absolute inset-0 flex items-center justify-center -z-1 text-zinc-700">
                      <Clapperboard className="w-10 h-10" />
                    </div>

                    {/* Dark gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-black/30 opacity-80 group-hover:opacity-50 transition-opacity" />

                    {/* Rating Badge */}
                    {series.rating && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {typeof series.rating === "number" ? series.rating.toFixed(1) : series.rating}
                      </div>
                    )}

                    {/* Favorite Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: favId,
                          type: "series",
                          name: series.name,
                          streamId: series.series_id,
                          icon: series.cover,
                          rating: series.rating,
                          addedAt: Date.now(),
                        });
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 cursor-pointer ${
                        isFav
                          ? "text-brand bg-brand/20"
                          : "text-zinc-400 hover:text-white bg-black/60 hover:bg-black/90"
                      }`}
                      title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-brand" : ""}`} />
                    </button>

                    {/* Center Big Play Button - Always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <div
                        onClick={(e) => handleDirectPlaySeries(series, e)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand hover:bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand/70 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                        title="Bölümü Başlat"
                      >
                        {isCurrentLoading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Series Title & Bottom Bar */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h3
                      onClick={() => setSelectedSeries(series)}
                      className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-brand line-clamp-1 transition-colors cursor-pointer"
                    >
                      {series.name}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-1 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setSelectedSeries(series)}
                        className="text-brand font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Clapperboard className="w-3.5 h-3.5 text-brand" />
                        <span>Sezonlar & Bölümler</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSeries(series);
                        }}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer p-0.5 hover:bg-white/10 rounded transition-colors"
                        title="Sezonları ve Bölümleri Gör"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Sezonlar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {filteredSeries.length > visibleCount && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <p className="text-xs text-zinc-400">
                Toplam <span className="font-bold text-white">{filteredSeries.length}</span> diziden{" "}
                <span className="font-bold text-brand">{displayedSeries.length}</span> tanesi gösteriliyor
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="py-3 px-8 bg-dark-elevated hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/10 hover:border-brand/50 shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center gap-2 active:scale-95 group"
              >
                <span>Daha Fazla Dizi Göster (+{Math.min(PAGE_SIZE, filteredSeries.length - visibleCount)})</span>
                <ChevronDown className="w-4 h-4 text-brand group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Series Detail Modal */}
      {selectedSeries && (
        <SeriesDetailModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </div>
  );
}
