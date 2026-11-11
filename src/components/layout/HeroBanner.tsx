"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Play, Info, Star, Plus, Check } from "lucide-react";
import { MovieDetailModal } from "@/components/vod/MovieDetailModal";
import { VodStream } from "@/types/iptv";

export function HeroBanner() {
  const { playMedia, xtreamService, isFavorite, toggleFavorite } = useApp();
  const [showDetail, setShowDetail] = useState(false);

  // Featured content: Dune Part Two
  const featuredMovie: VodStream = {
    num: 1,
    name: "Dune: Çöl Gezegeni Bölüm İki (2024)",
    stream_type: "movie",
    stream_id: 201,
    stream_icon: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    rating: "8.6",
    rating_5based: 4.3,
    added: "1709251200",
    category_id: "11",
    container_extension: "mp4",
    custom_sid: "",
    direct_source: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  };

  const favId = `movie-${featuredMovie.stream_id}`;
  const isFav = isFavorite(favId);

  const handlePlay = () => {
    if (!xtreamService) return;
    const url = xtreamService.getMovieStreamUrl(
      featuredMovie.stream_id,
      featuredMovie.container_extension || "mp4"
    );
    playMedia({
      id: favId,
      title: featuredMovie.name,
      subtitle: "2024 • 4K Ultra HD",
      poster: featuredMovie.stream_icon,
      streamUrl: url,
      type: "movie",
      contentId: featuredMovie.stream_id,
    });
  };

  return (
    <>
      <div className="relative w-full h-[55vh] sm:h-[65vh] lg:h-[75vh] min-h-[420px] max-h-[640px] overflow-hidden -mt-16 mb-8 select-none">
        {/* Background Backdrop Image */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=85"
            alt="Dune 2"
            className="w-full h-full object-cover object-center scale-105 animate-pulse-slow"
          />
          {/* Multi-layered cinematic gradients */}
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-8 sm:pb-16 z-10">
          <div className="max-w-2xl space-y-2.5 sm:space-y-4">
            {/* Tag / Category */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 rounded-full bg-brand text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-brand/40">
                Günün Öne Çıkanı
              </span>
              <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
                8.6 IMDB
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-300 font-semibold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                4K Ultra HD
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Dune: Çöl Gezegeni
              <span className="block text-brand text-xl sm:text-4xl lg:text-5xl font-extrabold mt-0.5 sm:mt-1">
                Bölüm İki
              </span>
            </h1>

            {/* Plot */}
            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
              Paul Atreides, ailesini yok eden komploculara karşı Fremen halkı ile birleşir.
              Evrenin kaderi ile aşkı arasında yapacağı seçim, insanlığın geleceğini belirleyecektir.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={handlePlay}
                className="py-2.5 px-4 sm:py-3 sm:px-6 bg-brand hover:bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 text-xs sm:text-sm shadow-xl shadow-brand/40 hover:shadow-brand/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Hemen Oynat</span>
              </button>

              <button
                onClick={() => setShowDetail(true)}
                className="py-2.5 px-3.5 sm:py-3 sm:px-5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all cursor-pointer active:scale-95"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Bilgi</span>
              </button>

              <button
                onClick={() =>
                  toggleFavorite({
                    id: favId,
                    type: "movie",
                    name: featuredMovie.name,
                    streamId: featuredMovie.stream_id,
                    icon: featuredMovie.stream_icon,
                    rating: featuredMovie.rating,
                    container_extension: featuredMovie.container_extension,
                    addedAt: Date.now(),
                  })
                }
                className={`p-2.5 sm:p-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer active:scale-95 ${
                  isFav
                    ? "bg-brand/20 border-brand text-brand"
                    : "bg-black/40 border-white/20 text-white hover:bg-white/15"
                }`}
                title={isFav ? "Listemden Çıkar" : "Listeme Ekle"}
              >
                {isFav ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-brand" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetail && (
        <MovieDetailModal
          movie={featuredMovie}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
