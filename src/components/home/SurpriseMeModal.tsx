"use client";

import React, { useState, useEffect } from "react";
import { VodStream, SeriesItem } from "@/types/iptv";
import {
  X,
  Play,
  Dices,
  Sparkles,
  Star,
  Info,
  RotateCw,
  Film,
  Clapperboard,
} from "lucide-react";

interface SurpriseMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: VodStream[];
  series: SeriesItem[];
  onPlayMovie: (movie: VodStream) => void;
  onPlaySeries: (series: SeriesItem) => void;
  onSelectMovie: (movie: VodStream) => void;
  onSelectSeries: (series: SeriesItem) => void;
}

type ChosenItem =
  | { type: "movie"; data: VodStream }
  | { type: "series"; data: SeriesItem };

export function SurpriseMeModal({
  isOpen,
  onClose,
  movies,
  series,
  onPlayMovie,
  onPlaySeries,
  onSelectMovie,
  onSelectSeries,
}: SurpriseMeModalProps) {
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [displayItem, setDisplayItem] = useState<ChosenItem | null>(null);
  const [chosenItem, setChosenItem] = useState<ChosenItem | null>(null);

  const pool = React.useMemo(() => {
    const list: ChosenItem[] = [
      ...movies.map((m) => ({ type: "movie" as const, data: m })),
      ...series.map((s) => ({ type: "series" as const, data: s })),
    ];
    return list;
  }, [movies, series]);

  const spinRoulette = () => {
    if (pool.length === 0) return;

    setIsSpinning(true);
    let counter = 0;
    const totalTicks = 20;

    const interval = setInterval(() => {
      counter++;
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setDisplayItem(randomItem);

      if (counter >= totalTicks) {
        clearInterval(interval);
        // Pick high rated or random winner
        const winner = pool[Math.floor(Math.random() * pool.length)];
        setDisplayItem(winner);
        setChosenItem(winner);
        setIsSpinning(false);
      }
    }, 80);
  };

  useEffect(() => {
    if (isOpen && pool.length > 0) {
      spinRoulette();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const current = chosenItem || displayItem;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8 text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-brand/15 text-brand border border-brand/30">
            <Dices className="w-5 h-5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-brand">
            Beni Şaşırt & Rastgele İzle
          </span>
        </div>

        {/* Content Poster Card */}
        <div className="relative mx-auto w-44 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/15 shadow-2xl mb-6">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                current.type === "movie"
                  ? current.data.stream_icon
                  : current.data.cover
              }
              alt={current.data.name}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isSpinning ? "blur-xs scale-105" : "scale-100"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand animate-spin" />
            </div>
          )}

          {/* Type Badge */}
          {current && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-white/10">
              {current.type === "movie" ? (
                <>
                  <Film className="w-3 h-3 text-brand" />
                  <span>Film</span>
                </>
              ) : (
                <>
                  <Clapperboard className="w-3 h-3 text-indigo-400" />
                  <span>Dizi</span>
                </>
              )}
            </div>
          )}

          {isSpinning && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="font-bold text-xs text-white tracking-widest uppercase bg-black/60 px-3 py-1 rounded-full border border-white/20 animate-pulse">
                Seçiliyor...
              </span>
            </div>
          )}
        </div>

        {/* Title & Info */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">
            {current ? current.data.name : "İçerikler taranıyor..."}
          </h3>

          {current && current.data.rating && (
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{current.data.rating} IMDB</span>
            </div>
          )}

          {current && current.type === "series" && current.data.plot && (
            <p className="text-xs text-zinc-400 line-clamp-2 max-w-sm mx-auto">
              {current.data.plot}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            disabled={isSpinning || !chosenItem}
            onClick={() => {
              if (!chosenItem) return;
              onClose();
              if (chosenItem.type === "movie") {
                onPlayMovie(chosenItem.data);
              } else {
                onPlaySeries(chosenItem.data);
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand hover:bg-brand-600 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/40 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Hemen İzle</span>
          </button>

          <button
            disabled={isSpinning || !chosenItem}
            onClick={() => {
              if (!chosenItem) return;
              onClose();
              if (chosenItem.type === "movie") {
                onSelectMovie(chosenItem.data);
              } else {
                onSelectSeries(chosenItem.data);
              }
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 hover:text-white border border-white/10 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Info className="w-4 h-4" />
            <span>Detayları Gör</span>
          </button>

          <button
            disabled={isSpinning}
            onClick={spinRoulette}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 hover:text-brand border border-white/10 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Başka bir rastgele içerik seç"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            <span>Tekrar Çevir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
