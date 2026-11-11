"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SeriesInfoResponse, EpisodeItem } from "@/types/iptv";
import {
  X,
  Play,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Layers,
  ChevronDown,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

interface InPlayerEpisodesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId: number;
  seriesTitle: string;
  currentSeasonNum?: number;
  currentEpisodeNum?: number;
  onSelectEpisode: (episode: EpisodeItem, seasonNum: number, episodesList: EpisodeItem[], epIndex: number) => void;
}

export function InPlayerEpisodesDrawer({
  isOpen,
  onClose,
  seriesId,
  seriesTitle,
  currentSeasonNum = 1,
  currentEpisodeNum = 1,
  onSelectEpisode,
}: InPlayerEpisodesDrawerProps) {
  const { xtreamService, isEpisodeWatched, toggleWatchedEpisode } = useApp();

  const [seriesInfo, setSeriesInfo] = useState<SeriesInfoResponse | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>(String(currentSeasonNum));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !xtreamService || !seriesId) return;

    setIsLoading(true);
    xtreamService
      .getSeriesInfo(seriesId)
      .then((data) => {
        setSeriesInfo(data);
        if (data && data.episodes) {
          if (data.episodes[String(currentSeasonNum)]) {
            setSelectedSeason(String(currentSeasonNum));
          } else {
            const firstSeason = Object.keys(data.episodes)[0] || "1";
            setSelectedSeason(firstSeason);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load in-player series info:", err);
        setIsLoading(false);
      });
  }, [isOpen, xtreamService, seriesId, currentSeasonNum]);

  if (!isOpen) return null;

  const episodesInSeason: EpisodeItem[] =
    seriesInfo?.episodes && seriesInfo.episodes[selectedSeason]
      ? seriesInfo.episodes[selectedSeason]
      : [];

  const availableSeasons = seriesInfo?.seasons && seriesInfo.seasons.length > 0
    ? seriesInfo.seasons
    : Object.keys(seriesInfo?.episodes || {}).map((num) => ({
        season_number: parseInt(num, 10),
        name: `${num}. Sezon`,
      }));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full bg-zinc-950/95 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-left"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-brand" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{seriesTitle}</h3>
              <p className="text-[11px] text-zinc-400">Bölümler ve Sezonlar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Season Selector Tabs */}
        {availableSeasons && availableSeasons.length > 0 && (
          <div className="px-4 py-3 border-b border-white/5 bg-zinc-900/30 overflow-x-auto no-scrollbar flex items-center gap-2">
            {availableSeasons.map((season) => {
              const seasonStr = String(season.season_number);
              const isSelected = selectedSeason === seasonStr;
              return (
                <button
                  key={season.season_number}
                  onClick={() => setSelectedSeason(seasonStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand text-white shadow-md shadow-brand/40"
                      : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5"
                  }`}
                >
                  {season.name || `${season.season_number}. Sezon`}
                </button>
              );
            })}
          </div>
        )}

        {/* Episode List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="w-8 h-8 text-brand animate-spin mb-2" />
              <span className="text-xs">Bölümler yükleniyor...</span>
            </div>
          ) : episodesInSeason.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
              Bu sezonda henüz bölüm bulunamadı.
            </div>
          ) : (
            episodesInSeason.map((episode, idx) => {
              const isCurrent =
                String(currentSeasonNum) === selectedSeason &&
                currentEpisodeNum === episode.episode_num;

              const watchedKey = `${seriesId}-s${selectedSeason}-e${episode.episode_num}`;
              const isWatched = isEpisodeWatched(watchedKey);

              const durationFormatted = episode.info?.duration_secs
                ? formatSecondsToTime(episode.info.duration_secs)
                : episode.info?.duration || "45 dk";

              return (
                <div
                  key={episode.id || idx}
                  onClick={() => onSelectEpisode(episode, parseInt(selectedSeason, 10), episodesInSeason, idx)}
                  className={`group relative flex items-center gap-3 p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-brand/15 border-brand/50 shadow-md shadow-brand/20"
                      : "bg-zinc-900/60 hover:bg-zinc-900 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Thumbnail / Number */}
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    {episode.info?.movie_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={episode.info.movie_image}
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold text-sm">
                        {episode.episode_num}
                      </div>
                    )}

                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                        isCurrent
                          ? "bg-black/50 opacity-100"
                          : "bg-black/40 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isCurrent ? (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-3 bg-brand animate-pulse" />
                          <span className="w-1 h-4 bg-brand animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-brand animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Play className="w-5 h-5 fill-white text-white drop-shadow-md" />
                      )}
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-bold text-zinc-400">
                        {episode.episode_num}. Bölüm
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-black uppercase text-brand bg-brand/15 px-1.5 py-0.2 rounded border border-brand/30">
                          Şu An Oynatılıyor
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-brand transition-colors">
                      {episode.title || `${episode.episode_num}. Bölüm`}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {durationFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Watched Toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchedEpisode(watchedKey);
                    }}
                    className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                      isWatched
                        ? "text-emerald-400 hover:text-emerald-300"
                        : "text-zinc-600 hover:text-zinc-400"
                    }`}
                    title={isWatched ? "İzlendi olarak işaretlendi" : "İzlendi olarak işaretle"}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
