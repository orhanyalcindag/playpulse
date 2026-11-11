"use client";

import React, { useEffect, useState } from "react";
import { Play, X, FastForward } from "lucide-react";

interface NextEpisodeCountdownProps {
  nextEpisode: {
    title: string;
    seasonNum: number;
    episodeNum: number;
    streamUrl: string;
    episodeId: string;
    poster?: string;
  };
  onPlayNext: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

export function NextEpisodeCountdown({
  nextEpisode,
  onPlayNext,
  onCancel,
  countdownSeconds = 15,
}: NextEpisodeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onPlayNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onPlayNext]);

  const progressPercentage = ((countdownSeconds - timeLeft) / countdownSeconds) * 100;

  return (
    <div className="absolute bottom-20 sm:bottom-24 right-4 sm:right-8 z-50 max-w-sm w-full bg-dark-surface/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl shadow-black/80 animate-slide-up text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase font-bold tracking-wider text-brand flex items-center gap-1.5">
          <FastForward className="w-3.5 h-3.5" />
          Sonraki Bölüm Başlıyor ({timeLeft}s)
        </span>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          title="Geri Sayımı İptal Et"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Episode Info */}
      <div className="flex items-center gap-3 my-2">
        {nextEpisode.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={nextEpisode.poster}
            alt={nextEpisode.title}
            className="w-16 h-12 object-cover rounded-lg border border-white/10 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate text-zinc-100">
            {nextEpisode.title}
          </h4>
          <p className="text-xs text-zinc-400">
            {nextEpisode.seasonNum}. Sezon {nextEpisode.episodeNum}. Bölüm
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
        <button
          onClick={onPlayNext}
          className="flex-1 py-2 px-3 bg-brand hover:bg-brand-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/30 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Hemen İzle</span>
        </button>
        <button
          onClick={onCancel}
          className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-xl border border-white/10 transition-colors cursor-pointer"
        >
          Vazgeç
        </button>
      </div>

      {/* Linear progress timer bar */}
      <div className="w-full bg-zinc-800 h-1 rounded-full mt-3 overflow-hidden">
        <div
          className="bg-brand h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
