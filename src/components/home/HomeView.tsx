"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { ContinueWatchingRow } from "@/components/continue-watching/ContinueWatchingRow";
import { LiveStream, VodStream, SeriesItem } from "@/types/iptv";
import {
  Tv,
  Film,
  Clapperboard,
  Play,
  Star,
  ChevronRight,
  Info,
  Loader2,
  Dices,
} from "lucide-react";
import { MovieDetailModal } from "@/components/vod/MovieDetailModal";
import { SeriesDetailModal } from "@/components/vod/SeriesDetailModal";
import { Top10Shelf, Top10Item } from "./Top10Shelf";
import { SurpriseMeModal } from "./SurpriseMeModal";
import { MoodFilterChips, MOOD_FILTERS } from "./MoodFilterChips";

export function HomeView() {
  const { xtreamService, setActiveTab, playMedia, watchProgress, isKidsMode, isAdultCategory } = useApp();

  const [allMovies, setAllMovies] = useState<VodStream[]>([]);
  const [allSeries, setAllSeries] = useState<SeriesItem[]>([]);
  const [topLiveChannels, setTopLiveChannels] = useState<LiveStream[]>([]);

  const [selectedMood, setSelectedMood] = useState<string>("all");
  const [isSurpriseMeOpen, setIsSurpriseMeOpen] = useState<boolean>(false);

  const [selectedMovie, setSelectedMovie] = useState<VodStream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [loadingSeriesId, setLoadingSeriesId] = useState<number | null>(null);

  useEffect(() => {
    if (!xtreamService) return;

    xtreamService
      .getVodStreams()
      .then((data) => setAllMovies(data.slice(0, 50)))
      .catch(() => {});

    xtreamService
      .getSeriesList()
      .then((data) => setAllSeries(data.slice(0, 50)))
      .catch(() => {});

    xtreamService
      .getLiveStreams()
      .then((data) => setTopLiveChannels(data.slice(0, 16)))
      .catch(() => {});
  }, [xtreamService]);

  // Filter movies & series for Kids Mode and Mood Filter
  const filteredMovies = useMemo(() => {
    let list = allMovies;
    if (isKidsMode) {
      list = list.filter((m) => !isAdultCategory(m.name));
    }
    if (selectedMood !== "all") {
      const activeFilter = MOOD_FILTERS.find((f) => f.id === selectedMood);
      if (activeFilter && activeFilter.keywords.length > 0) {
        list = list.filter((m) => {
          const lower = m.name.toLowerCase();
          return activeFilter.keywords.some((kw) => lower.includes(kw));
        });
      }
    }
    return list;
  }, [allMovies, isKidsMode, selectedMood, isAdultCategory]);

  const filteredSeries = useMemo(() => {
    let list = allSeries;
    if (isKidsMode) {
      list = list.filter(
        (s) =>
          !isAdultCategory(s.name) &&
          !isAdultCategory(s.genre || "") &&
          !isAdultCategory(s.plot || "")
      );
    }
    if (selectedMood !== "all") {
      const activeFilter = MOOD_FILTERS.find((f) => f.id === selectedMood);
      if (activeFilter && activeFilter.keywords.length > 0) {
        list = list.filter((s) => {
          const lower = `${s.name} ${s.genre || ""} ${s.plot || ""}`.toLowerCase();
          return activeFilter.keywords.some((kw) => lower.includes(kw));
        });
      }
    }
    return list;
  }, [allSeries, isKidsMode, selectedMood, isAdultCategory]);

  const filteredLiveChannels = useMemo(() => {
    if (!isKidsMode) return topLiveChannels;
    return topLiveChannels.filter((c) => !isAdultCategory(c.name));
  }, [topLiveChannels, isKidsMode, isAdultCategory]);

  // Compute Top 10 items (combining top movies and series)
  const top10Items: Top10Item[] = useMemo(() => {
    const pool: Array<{ item: VodStream | SeriesItem; type: "movie" | "series"; score: number }> = [];

    allMovies.slice(0, 15).forEach((m) => {
      if (isKidsMode && isAdultCategory(m.name)) return;
      pool.push({
        item: m,
        type: "movie",
        score: parseFloat(String(m.rating || "7.5")) || 7.5,
      });
    });

    allSeries.slice(0, 15).forEach((s) => {
      if (isKidsMode && isAdultCategory(s.name)) return;
      pool.push({
        item: s,
        type: "series",
        score: (parseFloat(String(s.rating || "8.0")) || 8.0) + 0.2, // slight boost for series
      });
    });

    pool.sort((a, b) => b.score - a.score);

    return pool.slice(0, 10).map((entry, idx) => ({
      rank: idx + 1,
      item: entry.item,
      type: entry.type,
    }));
  }, [allMovies, allSeries, isKidsMode, isAdultCategory]);

  const handlePlayLive = (stream: LiveStream) => {
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

  const handleDirectPlayMovie = (movie: VodStream, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!xtreamService) return;

    const streamUrl = xtreamService.getMovieStreamUrl(
      movie.stream_id,
      movie.container_extension || "mp4"
    );

    playMedia({
      id: `movie-${movie.stream_id}`,
      title: movie.name,
      subtitle: "Film",
      poster: movie.stream_icon,
      streamUrl,
      type: "movie",
      contentId: movie.stream_id,
    });
  };

  const handleDirectPlaySeries = async (series: SeriesItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!xtreamService) return;

    // Check if user already has an active progress on this series
    const existingProgress = Object.values(watchProgress).find(
      (p) => p.type === "series" && p.seriesId === series.series_id
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

    setLoadingSeriesId(series.series_id);
    try {
      const info = await xtreamService.getSeriesInfo(series.series_id);
      if (info && info.episodes) {
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
            subtitle: `${firstSeasonKey}. Sezon 1. Bölüm: ${ep1.title}`,
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
        } else {
          setSelectedSeries(series);
        }
      } else {
        setSelectedSeries(series);
      }
    } catch (err) {
      console.error("Failed to load series for direct play:", err);
      setSelectedSeries(series);
    } finally {
      setLoadingSeriesId(null);
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      {/* Cinematic Hero Billboard */}
      <HeroBanner onOpenSurpriseMe={() => setIsSurpriseMeOpen(true)} />

      {/* Mood / Genre Filter Chips */}
      <MoodFilterChips
        selectedMood={selectedMood}
        onSelectMood={setSelectedMood}
      />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        {/* Mobile Quick Category Shortcuts */}
        <div className="flex md:hidden items-center justify-center gap-2 px-4 -mt-2 sm:-mt-4">
          <button
            onClick={() => setActiveTab("live")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span>Canlı TV</span>
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-brand" />
            <span>Filmler</span>
          </button>
          <button
            onClick={() => setActiveTab("series")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
            <span>Diziler</span>
          </button>
        </div>

        {/* Continue Watching shelf */}
        <ContinueWatchingRow />

        {/* Netflix Iconic Top 10 Shelf */}
        {selectedMood === "all" && top10Items.length > 0 && (
          <Top10Shelf
            items={top10Items}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onSelectSeries={(s) => setSelectedSeries(s)}
            onPlayMovie={handleDirectPlayMovie}
            onPlaySeries={handleDirectPlaySeries}
          />
        )}

        {/* Section 1: Featured Live TV Channels */}
        {filteredLiveChannels.length > 0 && (
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-brand" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Popüler Canlı Kanallar
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("live")}
                className="text-xs sm:text-sm text-zinc-400 hover:text-brand flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {filteredLiveChannels.slice(0, 8).map((channel) => (
                <div
                  key={channel.stream_id}
                  onClick={() => handlePlayLive(channel)}
                  className="group relative p-2.5 rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border hover:border-brand/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm select-none"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-zinc-900 flex items-center justify-center p-1.5 mb-2 relative overflow-hidden">
                    {channel.stream_icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={channel.stream_icon}
                        alt={channel.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <Tv className="w-6 h-6 text-zinc-600" />
                    )}
                    <div className="absolute inset-0 bg-brand/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-brand truncate w-full">
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Trending Movies */}
        {filteredMovies.length > 0 && (
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-brand" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {selectedMood === "all" ? "Trend Filmler" : "Seçilen Türdeki Filmler"}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("movies")}
                className="text-xs sm:text-sm text-zinc-400 hover:text-brand flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {filteredMovies.slice(0, 15).map((movie) => (
                <div
                  key={movie.stream_id}
                  onClick={() => setSelectedMovie(movie)}
                  className="group relative flex-none w-[140px] sm:w-[170px] bg-dark-surface rounded-2xl overflow-hidden border border-white/5 hover:border-brand/40 transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col select-none cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                    {movie.stream_icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.stream_icon}
                        alt={movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Film className="w-8 h-8 text-zinc-700 m-auto mt-12" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent opacity-80" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-xl shadow-brand/60 group-hover:scale-110 active:scale-95 transition-all">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {movie.rating && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.rating}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 flex items-center justify-between gap-1.5 bg-dark-surface">
                    <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-brand truncate flex-1">
                      {movie.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Popular Series */}
        {filteredSeries.length > 0 && (
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-brand" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  {selectedMood === "all" ? "Popüler Diziler & Sezonlar" : "Seçilen Türdeki Diziler"}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("series")}
                className="text-xs sm:text-sm text-zinc-400 hover:text-brand flex items-center gap-1 font-medium cursor-pointer transition-colors"
              >
                Tümünü Gör
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {filteredSeries.slice(0, 15).map((series) => (
                <div
                  key={series.series_id}
                  onClick={() => setSelectedSeries(series)}
                  className="group relative flex-none w-[140px] sm:w-[170px] bg-dark-surface rounded-2xl overflow-hidden border border-white/5 hover:border-brand/40 transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col select-none cursor-pointer"
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
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
                    ) : (
                      <Clapperboard className="w-8 h-8 text-zinc-700 m-auto mt-12" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent opacity-80" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-xl shadow-brand/60 group-hover:scale-110 active:scale-95 transition-all">
                        {loadingSeriesId === series.series_id ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Clapperboard className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>

                    {series.rating && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {series.rating}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 flex items-center justify-between gap-1.5 bg-dark-surface">
                    <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-brand truncate flex-1">
                      {series.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {selectedSeries && (
        <SeriesDetailModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}

      {/* Surprise Me Shuffle Modal */}
      <SurpriseMeModal
        isOpen={isSurpriseMeOpen}
        onClose={() => setIsSurpriseMeOpen(false)}
        movies={allMovies}
        series={allSeries}
        onPlayMovie={handleDirectPlayMovie}
        onPlaySeries={handleDirectPlaySeries}
        onSelectMovie={(m) => setSelectedMovie(m)}
        onSelectSeries={(s) => setSelectedSeries(s)}
      />
    </div>
  );
}
