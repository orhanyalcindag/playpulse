"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { WatchProgressItem } from "@/types/iptv";
import { Play, X, Clock, Film, Clapperboard } from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

export function ContinueWatchingRow() {
  const { watchProgress, removeWatchProgress, playMedia } = useApp();

  const items = Object.values(watchProgress)
    .filter((item) => item.progressPercentage > 2 && item.progressPercentage < 95)
    .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);

  if (items.length === 0) return null;

  const handleResume = (item: WatchProgressItem) => {
    playMedia({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      poster: item.poster,
      streamUrl: item.streamUrl,
      type: item.type,
      contentId: item.contentId,
      seriesId: item.seriesId,
      seasonNum: item.seasonNum,
      episodeNum: item.episodeNum,
      episodeId: item.episodeId,
    });
  };

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            İzlemeye Devam Et
          </h2>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-semibold">
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 py-2 scroll-smooth">
        {items.map((item) => {
          const remainingSecs = Math.max(0, item.duration - item.currentTime);
          const remainingText =
            remainingSecs > 0
              ? `${Math.round(remainingSecs / 60)} dk kaldı`
              : `${Math.round(item.progressPercentage)}% izlendi`;

          return (
            <div
              key={item.id}
              className="group relative flex-none w-[220px] sm:w-[260px] bg-dark-surface rounded-xl overflow-hidden border border-white/5 hover:border-brand/50 transition-all duration-300 shadow-lg hover:shadow-brand/20 hover:-translate-y-1"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => handleResume(item)}>
                {item.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                    {item.type === "series" ? (
                      <Clapperboard className="w-8 h-8" />
                    ) : (
                      <Film className="w-8 h-8" />
                    )}
                  </div>
                )}

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity" />

                {/* Play hover button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-11 h-11 rounded-full bg-brand/90 text-white flex items-center justify-center shadow-lg shadow-brand/50 group-hover:scale-115 transition-transform duration-200">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWatchProgress(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Listeden Kaldır"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-zinc-300 border border-white/10 uppercase tracking-wider">
                  {item.type === "series" ? "Dizi" : "Film"}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-zinc-800">
                <div
                  className="h-full bg-brand rounded-r transition-all"
                  style={{ width: `${Math.min(100, Math.max(3, item.progressPercentage))}%` }}
                />
              </div>

              {/* Item Info */}
              <div className="p-3">
                <h3
                  onClick={() => handleResume(item)}
                  className="text-sm font-semibold text-white truncate cursor-pointer hover:text-brand transition-colors"
                >
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                  <span className="truncate max-w-[140px] text-zinc-400">
                    {item.subtitle || formatSecondsToTime(item.currentTime)}
                  </span>
                  <span className="text-[11px] font-medium text-brand/90 shrink-0">
                    {remainingText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
