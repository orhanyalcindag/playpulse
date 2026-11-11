"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SeriesItem, SeriesInfoResponse, EpisodeItem } from "@/types/iptv";
import {
  X,
  Play,
  Heart,
  Star,
  Clock,
  CheckCircle2,
  Check,
  Clapperboard,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface SeriesDetailModalProps {
  series: SeriesItem;
  onClose: () => void;
}

export function SeriesDetailModal({ series, onClose }: SeriesDetailModalProps) {
  const {
    xtreamService,
    playMedia,
    isFavorite,
    toggleFavorite,
    watchProgress,
    isEpisodeWatched,
    toggleWatchedEpisode,
  } = useApp();

  const [seriesInfo, setSeriesInfo] = useState<SeriesInfoResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>("1");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const favId = `series-${series.series_id}`;
  const isFav = isFavorite(favId);

  useEffect(() => {
    if (!xtreamService) return;
    setIsLoading(true);
    xtreamService
      .getSeriesInfo(series.series_id)
      .then((data) => {
        setSeriesInfo(data);
        if (data && data.seasons && data.seasons.length > 0) {
          setSelectedSeason(String(data.seasons[0].season_number));
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load series info:", err);
        setIsLoading(false);
      });
  }, [xtreamService, series.series_id]);

  const episodesInSeason =
    seriesInfo?.episodes && seriesInfo.episodes[selectedSeason]
      ? seriesInfo.episodes[selectedSeason]
      : [];

  const handlePlayFirstEpisode = () => {
    if (episodesInSeason.length > 0) {
      handlePlayEpisode(episodesInSeason[0], 0);
      return;
    }

    // Fallback: search across all seasons in seriesInfo.episodes
    if (seriesInfo?.episodes) {
      for (const seasonKey of Object.keys(seriesInfo.episodes)) {
        const eps = seriesInfo.episodes[seasonKey];
        if (eps && eps.length > 0) {
          handlePlayEpisode(eps[0], 0);
          return;
        }
      }
    }
  };

  const handlePlayEpisode = (episode: EpisodeItem, episodeIndex: number) => {
    if (!xtreamService) return;

    const streamUrl = xtreamService.getSeriesStreamUrl(
      episode.id,
      episode.container_extension || "mp4"
    );

    // Compute next episode if available in same season or next season
    let nextEpisode = undefined;
    if (episodeIndex + 1 < episodesInSeason.length) {
      const nextEp = episodesInSeason[episodeIndex + 1];
      nextEpisode = {
        title: nextEp.title,
        seasonNum: Number(selectedSeason),
        episodeNum: nextEp.episode_num,
        streamUrl: xtreamService.getSeriesStreamUrl(nextEp.id, nextEp.container_extension || "mp4"),
        episodeId: String(nextEp.id),
        poster: nextEp.info?.movie_image || series.cover,
      };
    }

    const progressId = `series-${series.series_id}-s${selectedSeason}-e${episode.episode_num}`;

    playMedia({
      id: progressId,
      title: series.name,
      subtitle: `${selectedSeason}. Sezon ${episode.episode_num}. Bölüm: ${episode.title}`,
      poster: episode.info?.movie_image || series.cover,
      streamUrl,
      type: "series",
      contentId: series.series_id,
      seriesId: series.series_id,
      seasonNum: Number(selectedSeason),
      episodeNum: episode.episode_num,
      episodeId: String(episode.id),
      nextEpisode,
    });

    onClose();
  };

  const backdrop =
    seriesInfo?.info?.backdrop_path && seriesInfo.info.backdrop_path.length > 0
      ? seriesInfo.info.backdrop_path[0]
      : series.cover;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-dark-surface border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-zinc-900 shrink-0">
          {backdrop && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdrop}
              alt={series.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/50 to-transparent" />

          {/* Centered Big Play Button on Banner */}
          <div
            onClick={handlePlayFirstEpisode}
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand hover:bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand/70 group-hover:scale-115 active:scale-95 transition-all"
              title="1. Bölümü Başlat"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
            </div>
          </div>

          {/* Action buttons on banner */}
          <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handlePlayFirstEpisode}
              className="py-2.5 px-5 bg-brand hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-xl shadow-brand/40 transition-all cursor-pointer hover:scale-105 active:scale-95 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>1. Bölümü Oynat</span>
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  id: favId,
                  type: "series",
                  name: series.name,
                  streamId: series.series_id,
                  icon: series.cover,
                  rating: series.rating,
                  addedAt: Date.now(),
                })
              }
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold ${
                isFav
                  ? "bg-brand/20 border-brand text-brand"
                  : "bg-black/50 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-brand" : ""}`} />
              <span>{isFav ? "Favorilerimde" : "Favorilere Ekle"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{series.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
              {series.rating && (
                <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {series.rating}
                </span>
              )}

              {series.genre && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {series.genre}
                </span>
              )}

              {seriesInfo?.seasons && (
                <span className="text-zinc-400">
                  {seriesInfo.seasons.length} Sezon
                </span>
              )}
            </div>

            {/* Synopsis */}
            {(seriesInfo?.info?.plot || series.plot) && (
              <p className="text-sm text-zinc-300 leading-relaxed mt-3">
                {seriesInfo?.info?.plot || series.plot}
              </p>
            )}
          </div>

          {/* Season Selector Tabs */}
          {seriesInfo?.seasons && seriesInfo.seasons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-brand" />
                  Bölümler
                </h3>

                {/* Season Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {seriesInfo.seasons.map((season) => {
                    const isSelected = selectedSeason === String(season.season_number);
                    return (
                      <button
                        key={season.season_number}
                        onClick={() => setSelectedSeason(String(season.season_number))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand text-white shadow-sm shadow-brand/40"
                            : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                        }`}
                      >
                        {season.name || `${season.season_number}. Sezon`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Episodes List */}
              {isLoading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-7 h-7 animate-spin text-brand" />
                </div>
              ) : episodesInSeason.length === 0 ? (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  Bu sezona ait bölüm bulunamadı.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {episodesInSeason.map((episode, idx) => {
                    const epKey = `${series.series_id}-s${selectedSeason}-e${episode.episode_num}`;
                    const isWatched = isEpisodeWatched(epKey);
                    const epProgressId = `series-${series.series_id}-s${selectedSeason}-e${episode.episode_num}`;
                    const epProg = watchProgress[epProgressId];

                    return (
                      <div
                        key={episode.id || idx}
                        className={`group relative p-3 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isWatched
                            ? "bg-zinc-900/40 border-zinc-800/60 opacity-80"
                            : "bg-dark-elevated border-dark-border hover:border-brand/40"
                        }`}
                      >
                        {/* Left Side: Thumbnail & Title */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Episode thumbnail */}
                          <div
                            onClick={() => handlePlayEpisode(episode, idx)}
                            className="relative w-24 h-14 rounded-lg bg-zinc-900 overflow-hidden shrink-0 cursor-pointer border border-white/5"
                          >
                            {episode.info?.movie_image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={episode.info.movie_image}
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                <Clapperboard className="w-5 h-5" />
                              </div>
                            )}

                            {/* Play icon overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-5 h-5 text-white fill-white" />
                            </div>

                            {/* Progress bar line */}
                            {epProg && epProg.progressPercentage > 5 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                                <div
                                  className="h-full bg-brand"
                                  style={{ width: `${epProg.progressPercentage}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-zinc-500">
                                #{episode.episode_num}
                              </span>
                              <h4
                                onClick={() => handlePlayEpisode(episode, idx)}
                                className="text-sm font-semibold text-zinc-100 hover:text-brand transition-colors truncate cursor-pointer"
                              >
                                {episode.title}
                              </h4>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                              {episode.info?.plot || "Bölüm özeti bulunmuyor."}
                            </p>
                          </div>
                        </div>

                        {/* Right Side: Watched badge & Play Button */}
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {/* Duration */}
                          {episode.info?.duration && (
                            <span className="text-xs text-zinc-500 hidden sm:inline-block mr-1">
                              {episode.info.duration}
                            </span>
                          )}

                          {/* Watched Status Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleWatchedEpisode(epKey)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                              isWatched
                                ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
                                : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
                            }`}
                            title={isWatched ? "İzlenmedi olarak işaretle" : "İzlendi olarak işaretle"}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${isWatched ? "text-emerald-400 fill-emerald-400/20" : ""}`}
                            />
                            <span className="text-[11px] font-medium hidden sm:inline">
                              {isWatched ? "İzlendi" : "İzlendi Yap"}
                            </span>
                          </button>

                          {/* Play button */}
                          <button
                            type="button"
                            onClick={() => handlePlayEpisode(episode, idx)}
                            className="p-2 rounded-lg bg-brand hover:bg-brand-600 text-white transition-all cursor-pointer shadow-md shadow-brand/30"
                            title="Oynat"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
