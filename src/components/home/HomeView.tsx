"use client";

import React, { useEffect, useState } from "react";
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
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { MovieDetailModal } from "@/components/vod/MovieDetailModal";
import { SeriesDetailModal } from "@/components/vod/SeriesDetailModal";

export function HomeView() {
  const { xtreamService, setActiveTab, playMedia } = useApp();

  const [trendingMovies, setTrendingMovies] = useState<VodStream[]>([]);
  const [trendingSeries, setTrendingSeries] = useState<SeriesItem[]>([]);
  const [topLiveChannels, setTopLiveChannels] = useState<LiveStream[]>([]);

  const [selectedMovie, setSelectedMovie] = useState<VodStream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);

  useEffect(() => {
    if (!xtreamService) return;

    xtreamService
      .getVodStreams()
      .then((data) => setTrendingMovies(data.slice(0, 10)))
      .catch(() => {});

    xtreamService
      .getSeriesList()
      .then((data) => setTrendingSeries(data.slice(0, 10)))
      .catch(() => {});

    xtreamService
      .getLiveStreams()
      .then((data) => setTopLiveChannels(data.slice(0, 8)))
      .catch(() => {});
  }, [xtreamService]);

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

  return (
    <div className="pb-24 animate-fade-in">
      {/* Cinematic Hero Billboard */}
      <HeroBanner />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Mobile Quick Category Shortcuts */}
        <div className="flex md:hidden items-center justify-center gap-2 px-4 -mt-2 sm:-mt-4">
          <button
            onClick={() => setActiveTab("live")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span>Canlı TV</span>
          </button>
          <button
            onClick={() => setActiveTab("movies")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Film className="w-3.5 h-3.5 text-brand" />
            <span>Filmler</span>
          </button>
          <button
            onClick={() => setActiveTab("series")}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-elevated/90 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Clapperboard className="w-3.5 h-3.5 text-purple-400" />
            <span>Diziler</span>
          </button>
        </div>

        {/* Continue Watching shelf (If user has progress) */}
        <ContinueWatchingRow />

        {/* Section 1: Featured Live TV Channels */}
        {topLiveChannels.length > 0 && (
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
              {topLiveChannels.map((channel) => (
                <div
                  key={channel.stream_id}
                  onClick={() => handlePlayLive(channel)}
                  className="group relative p-2.5 rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border hover:border-brand/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm"
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
                    <div className="absolute inset-0 bg-brand/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
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
        {trendingMovies.length > 0 && (
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-brand" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Trend Filmler
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
              {trendingMovies.map((movie) => (
                <div
                  key={movie.stream_id}
                  onClick={() => setSelectedMovie(movie)}
                  className="group relative flex-none w-[140px] sm:w-[170px] bg-dark-surface rounded-2xl overflow-hidden border border-white/5 hover:border-brand/40 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-md"
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                    {movie.stream_icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.stream_icon}
                        alt={movie.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Film className="w-8 h-8 text-zinc-700 m-auto mt-12" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent opacity-80" />
                    {movie.rating && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-brand truncate">
                      {movie.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Popular Series */}
        {trendingSeries.length > 0 && (
          <section className="px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-brand" />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Popüler Diziler & Sezonlar
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
              {trendingSeries.map((series) => (
                <div
                  key={series.series_id}
                  onClick={() => setSelectedSeries(series)}
                  className="group relative flex-none w-[140px] sm:w-[170px] bg-dark-surface rounded-2xl overflow-hidden border border-white/5 hover:border-brand/40 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-md"
                >
                  <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                    {series.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={series.cover}
                        alt={series.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <Clapperboard className="w-8 h-8 text-zinc-700 m-auto mt-12" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent opacity-80" />
                    {series.rating && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {series.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-zinc-100 group-hover:text-brand truncate">
                      {series.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

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
    </div>
  );
}
