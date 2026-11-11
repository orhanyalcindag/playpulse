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
  Film,
  User,
  Users,
  Volume2,
  Tv,
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

  const posterImg = vodInfo?.info?.movie_image || movie.stream_icon;
  const rating = vodInfo?.info?.rating || movie.rating;

  // Technical video/audio badge helpers
  const videoWidth = vodInfo?.info?.video?.width;
  const is4K = (videoWidth && videoWidth >= 3840) || movie.name.toLowerCase().includes("4k") || movie.name.toLowerCase().includes("uhd");
  const isFHD = !is4K && ((videoWidth && videoWidth >= 1920) || movie.name.toLowerCase().includes("1080") || movie.name.toLowerCase().includes("fhd"));
  const audioCodec = vodInfo?.info?.audio?.codec_name?.toUpperCase();
  const audioChannels = vodInfo?.info?.audio?.channels;
  const isSurround = audioChannels && audioChannels >= 6;
  const audioLang = vodInfo?.info?.audio?.tags?.language || vodInfo?.info?.audio?.tags?.title;
  const isTurkish = audioLang?.toLowerCase().includes("tur") || movie.name.toLowerCase().includes("türkçe") || movie.name.toLowerCase().includes("turkce") || movie.name.toLowerCase().includes("dublaj");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-dark-surface border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black/95 text-white transition-all cursor-pointer border border-white/10 shadow-lg hover:scale-105"
          title="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner Section */}
        <div className="relative aspect-[16/7] sm:aspect-[21/9] w-full bg-zinc-900 shrink-0 overflow-hidden">
          {backdrop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={backdrop}
              alt={movie.name}
              className="w-full h-full object-cover object-center filter brightness-90"
              onError={(e) => {
                if (posterImg && (e.target as HTMLImageElement).src !== posterImg) {
                  (e.target as HTMLImageElement).src = posterImg;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
              <Film className="w-16 h-16" />
            </div>
          )}

          {/* Cinematic Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-surface/80 via-transparent to-transparent" />

          {/* Quick Play Action Button on Banner */}
          <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-3 z-10">
            <button
              onClick={handlePlay}
              className="py-3 px-6 bg-gradient-to-r from-brand to-rose-600 hover:from-rose-600 hover:to-brand text-white font-bold rounded-xl flex items-center gap-2.5 shadow-2xl shadow-brand/50 transition-all cursor-pointer hover:scale-105 active:scale-95 text-sm sm:text-base"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{progress && progress.currentTime > 5 ? "Kaldığın Yerden İzle" : "Filmi Başlat"}</span>
            </button>

            <button
              onClick={() =>
                toggleFavorite({
                  id: favId,
                  type: "movie",
                  name: movie.name,
                  streamId: movie.stream_id,
                  icon: movie.stream_icon,
                  rating: typeof movie.rating === "number" ? String(movie.rating) : movie.rating,
                  container_extension: movie.container_extension,
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

        {/* Content Body: Poster + Details */}
        <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {/* Main Info Header */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Vertical Poster Thumbnail */}
            {posterImg && (
              <div className="relative w-28 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-xl hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterImg}
                  alt={movie.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {movie.name}
              </h2>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-300 mt-2.5">
                {rating && (
                  <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {typeof rating === "number" ? rating.toFixed(1) : rating} IMDB
                  </span>
                )}

                {vodInfo?.info?.releasedate && (
                  <span className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg text-zinc-300 border border-zinc-700/50">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {vodInfo.info.releasedate}
                  </span>
                )}

                {vodInfo?.info?.duration && (
                  <span className="flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg text-zinc-300 border border-zinc-700/50">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {vodInfo.info.duration}
                  </span>
                )}

                {vodInfo?.info?.genre && (
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {vodInfo.info.genre}
                  </span>
                )}

                {/* Technical Quality Badges */}
                {is4K ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-[10px] tracking-wider uppercase">
                    4K Ultra HD
                  </span>
                ) : isFHD ? (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-black text-[10px] tracking-wider uppercase">
                    1080p Full HD
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 font-bold text-[10px] tracking-wider uppercase">
                    HD
                  </span>
                )}

                {isTurkish && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] tracking-wide">
                    Türkçe Dublaj
                  </span>
                )}

                {audioCodec && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 font-bold text-[10px]">
                    <Volume2 className="w-3 h-3 text-brand" />
                    <span>{isSurround ? "5.1 " : ""}{audioCodec}</span>
                  </span>
                )}
              </div>

              {/* Watch Progress resume alert */}
              {progress && progress.currentTime > 5 && progress.progressPercentage < 95 && (
                <div className="mt-3.5 p-3 bg-brand/10 border border-brand/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-zinc-200 flex items-center gap-1.5 font-medium">
                    <RotateCcw className="w-3.5 h-3.5 text-brand" />
                    Daha önce {formatSecondsToTime(progress.currentTime)} anına kadar izlediniz (%
                    {Math.round(progress.progressPercentage)}).
                  </span>
                  <button
                    onClick={handlePlay}
                    className="text-brand font-bold hover:underline cursor-pointer ml-2"
                  >
                    Devam Et &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Plot / Synopsis Section */}
          <div className="border-t border-zinc-800/80 pt-4">
            <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">
              Açıklama & Özet
            </h3>
            {isLoading ? (
              <div className="py-4 flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
                <span>Film bilgileri yükleniyor...</span>
              </div>
            ) : (
              <p className="text-sm text-zinc-300 leading-relaxed">
                {vodInfo?.info?.plot || "Bu film için açıklama bulunamadı."}
              </p>
            )}
          </div>

          {/* Director & Cast Info */}
          {(vodInfo?.info?.director || vodInfo?.info?.cast) && (
            <div className="border-t border-zinc-800/80 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {vodInfo.info.director && (
                <div className="flex items-start gap-2 text-zinc-400">
                  <User className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-200">Yönetmen: </span>
                    <span>{vodInfo.info.director}</span>
                  </div>
                </div>
              )}

              {vodInfo.info.cast && (
                <div className="flex items-start gap-2 text-zinc-400">
                  <Users className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-zinc-200">Oyuncular: </span>
                    <span className="line-clamp-2">{vodInfo.info.cast}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
