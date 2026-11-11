"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { VodStream, VodInfo } from "@/types/iptv";
import {
  X,
  Play,
  Heart,
  Star,
  Clock,
  Calendar,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

interface MovieDetailModalProps {
  movie: VodStream;
  onClose: () => void;
}

export function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
  const { xtreamService, playMedia, isFavorite, toggleFavorite, watchProgress } = useApp();

  const [vodInfo, setVodInfo] = useState<VodInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const favId = `movie-${movie.stream_id}`;
  const isFav = isFavorite(favId);
  const progress = watchProgress[favId];

  useEffect(() => {
    if (!xtreamService) return;
    setIsLoading(true);
    xtreamService
      .getVodInfo(movie.stream_id)
      .then((info) => {
        setVodInfo(info);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vod info:", err);
        setIsLoading(false);
      });
  }, [xtreamService, movie.stream_id]);

  const handlePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!xtreamService) return;

    const streamUrl = xtreamService.getMovieStreamUrl(
      movie.stream_id,
      movie.container_extension || "mp4"
    );

    playMedia({
      id: favId,
      title: movie.name,
      subtitle: vodInfo?.info?.releasedate?.slice(0, 4) || "Film",
      poster: vodInfo?.info?.movie_image || movie.stream_icon,
      streamUrl,
      type: "movie",
      contentId: movie.stream_id,
    });
    onClose();
  };

  const backdrop =
    vodInfo?.info?.backdrop_path && vodInfo.info.backdrop_path.length > 0
      ? vodInfo.info.backdrop_path[0]
      : movie.stream_icon;

  const rating = vodInfo?.info?.rating || movie.rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-dark-surface border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/95 text-white transition-colors cursor-pointer border border-white/10 shadow-lg"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner - Clicking center play button or banner launches movie */}
        <div
          onClick={handlePlay}
          className="relative aspect-[16/8] sm:aspect-[21/9] w-full bg-zinc-900 shrink-0 cursor-pointer group overflow-hidden"
        >
          {backdrop && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdrop}
              alt={movie.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />

          {/* Center Big Red Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand hover:bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand/70 group-hover:scale-115 active:scale-95 transition-all"
              title="Filmi Oynat"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
            </div>
          </div>

          {/* Bottom Action buttons on banner */}
          <div
            className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePlay}
              className="py-2.5 px-5 bg-brand hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-xl shadow-brand/40 transition-all cursor-pointer hover:scale-105 active:scale-95 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{progress && progress.currentTime > 5 ? "Kaldığın Yerden İzle" : "Filmi İzle"}</span>
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  id: favId,
                  type: "movie",
                  name: movie.name,
                  streamId: movie.stream_id,
                  icon: movie.stream_icon,
                  rating: movie.rating,
                  container_extension: movie.container_extension,
                  addedAt: Date.now(),
                })
              }
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isFav
                  ? "bg-brand/20 border-brand text-brand"
                  : "bg-black/50 border-white/10 text-white hover:bg-white/10"
              }`}
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-brand" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Title & Metadata Badges */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{movie.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-2">
              {rating && (
                <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {rating}
                </span>
              )}

              {vodInfo?.info?.releasedate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {vodInfo.info.releasedate}
                </span>
              )}

              {vodInfo?.info?.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {vodInfo.info.duration}
                </span>
              )}

              {vodInfo?.info?.genre && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {vodInfo.info.genre}
                </span>
              )}
            </div>
          </div>

          {/* Watch Progress resume alert if previously started */}
          {progress && progress.currentTime > 5 && progress.progressPercentage < 95 && (
            <div className="p-3 bg-brand/10 border border-brand/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-zinc-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-brand" />
                Daha önce {formatSecondsToTime(progress.currentTime)} anına kadar izlediniz (%
                {Math.round(progress.progressPercentage)}).
              </span>
              <button
                onClick={handlePlay}
                className="text-brand font-bold hover:underline cursor-pointer"
              >
                Devam Et &rarr;
              </button>
            </div>
          )}

          {/* Plot / Synopsis */}
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : (
            <>
              {vodInfo?.info?.plot && (
                <div>
                  <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-1">
                    Özet
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {vodInfo.info.plot}
                  </p>
                </div>
              )}

              {vodInfo?.info?.director && (
                <div className="text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Yönetmen: </span>
                  {vodInfo.info.director}
                </div>
              )}

              {vodInfo?.info?.cast && (
                <div className="text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">Oyuncular: </span>
                  {vodInfo.info.cast}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
