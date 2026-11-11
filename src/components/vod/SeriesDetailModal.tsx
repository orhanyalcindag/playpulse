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
  Tv,
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
          // Default to first available season
          setSelectedSeason(String(data.seasons[0].season_number));
        } else if (data && data.episodes && Object.keys(data.episodes).length > 0) {
          setSelectedSeason(Object.keys(data.episodes)[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load series info:", err);
        setIsLoading(false);
      });
  }, [xtreamService, series.series_id]);

  // Episodes for active season
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

  const posterImg = series.cover || seriesInfo?.info?.cover;
  const rating = series.rating || seriesInfo?.info?.rating;
  const plot = seriesInfo?.info?.plot || series.plot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-dark-surface border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black/95 text-white transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full bg-zinc-900 shrink-0 overflow-hidden">
          {backdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdrop}
              alt={series.name}
              className="w-full h-full object-cover object-center filter brightness-90"
              onError={(e) => {
                if (posterImg && (e.target as HTMLImageElement).src !== posterImg) {
                  (e.target as HTMLImageElement).src = posterImg;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
              <Tv className="w-16 h-16" />
            </div>
          )}

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/80 via-transparent to-transparent" />

          {/* Banner Action Buttons */}
          <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-3 z-10">
            <button
              onClick={handlePlayFirstEpisode}
              className="py-3 px-6 bg-gradient-to-r from-brand to-rose-600 hover:from-rose-600 hover:to-brand text-white font-bold rounded-xl flex items-center gap-2.5 shadow-2xl shadow-brand/50 transition-all cursor-pointer hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>1. Bölümü Başlat</span>
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  id: favId,
                  type: "series",
                  name: series.name,
                  streamId: series.series_id,
                  icon: series.cover,
                  rating: typeof series.rating === "number" ? String(series.rating) : series.rating,
                  addedAt: Date.now(),
                })
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${
                isFav
                  ? "bg-brand/20 border-brand text-brand"
                  : "bg-black/60 border-white/15 text-white hover:bg-black/80"
              }`}
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-brand" : ""}`} />
              <span className="hidden sm:inline">{isFav ? "Favorilerimde" : "Favorilere Ekle"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {/* Header Info: Poster + Title + Rating */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Vertical Series Poster */}
            {posterImg && (
              <div className="relative w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-xl hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterImg}
                  alt={series.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {series.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 mt-2.5">
                {rating && (
                  <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {typeof rating === "number" ? rating.toFixed(1) : rating} IMDB
                  </span>
                )}

                {series.genre && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {series.genre}
                  </span>
                )}

                {seriesInfo?.seasons && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/50 font-medium">
                    {seriesInfo.seasons.length} Sezon
                  </span>
                )}
              </div>

              {/* Description / Plot */}
              <div className="mt-3.5">
                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-1.5">
                  Açıklama & Dizi Özeti
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {plot || "Bu dizi için açıklama bulunamadı."}
                </p>
              </div>
            </div>
          </div>

          {/* Season Selector & Episodes Section */}
          <div className="border-t border-zinc-800/80 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-brand" />
                <span>Bölümler</span>
              </h3>

              {/* Season Selection Buttons / Tabs */}
              {seriesInfo?.seasons && seriesInfo.seasons.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {seriesInfo.seasons.map((season) => {
                    const isSelected = selectedSeason === String(season.season_number);
                    return (
                      <button
                        key={season.season_number}
                        onClick={() => setSelectedSeason(String(season.season_number))}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand text-white shadow-md shadow-brand/40 scale-105"
                            : "bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-700/50"
                        }`}
                      >
                        {season.name || `${season.season_number}. Sezon`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Episodes List */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
                <span className="text-xs">Bölümler yükleniyor...</span>
              </div>
            ) : episodesInSeason.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                Bu sezona ait bölüm bulunamadı.
              </div>
            ) : (
              <div className="space-y-3">
                {episodesInSeason.map((episode, idx) => {
                  const epKey = `${series.series_id}-s${selectedSeason}-e${episode.episode_num}`;
                  const isWatched = isEpisodeWatched(epKey);
                  const epProgressId = `series-${series.series_id}-s${selectedSeason}-e${episode.episode_num}`;
                  const epProg = watchProgress[epProgressId];

                  return (
                    <div
                      key={episode.id || idx}
                      onClick={() => handlePlayEpisode(episode, idx)}
                      className={`group relative p-3 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                        isWatched
                          ? "bg-zinc-900/40 border-zinc-800/60 opacity-80 hover:opacity-100"
                          : "bg-dark-elevated border-dark-border hover:border-brand/50 hover:bg-zinc-800/80"
                      }`}
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-28 h-16 sm:w-32 sm:h-20 rounded-xl bg-zinc-900 overflow-hidden shrink-0 border border-white/5">
                          {episode.info?.movie_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={episode.info.movie_image}
                              alt={episode.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <Clapperboard className="w-6 h-6" />
                            </div>
                          )}

                          {/* Hover Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-white ml-0.5" />
                            </div>
                          </div>

                          {/* Progress bar */}
                          {epProg && epProg.progressPercentage > 5 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                              <div
                                className="h-full bg-brand"
                                style={{ width: `${epProg.progressPercentage}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Title and metadata */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded">
                              {episode.episode_num}. Bölüm
                            </span>
                            {isWatched && (
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                İzlendi
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-brand transition-colors truncate">
                            {episode.title}
                          </h4>

                          {episode.info?.duration && (
                            <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{episode.info.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleWatchedEpisode(epKey)}
                          className={`p-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isWatched
                              ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-300"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white"
                          }`}
                          title={isWatched ? "İzlenmedi olarak işaretle" : "İzlendi olarak işaretle"}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{isWatched ? "İzlendi" : "İşaretle"}</span>
                        </button>

                        <button
                          onClick={() => handlePlayEpisode(episode, idx)}
                          className="py-2 px-3.5 bg-brand hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand/30 transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Oynat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
