"use client";

import React, { useRef } from "react";
import { VodStream, SeriesItem } from "@/types/iptv";
import { ChevronLeft, ChevronRight, Play, Info, Star } from "lucide-react";

export type Top10Item = {
  rank: number;
  item: VodStream | SeriesItem;
  type: "movie" | "series";
};

interface Top10ShelfProps {
  items: Top10Item[];
  onSelectMovie: (movie: VodStream) => void;
  onSelectSeries: (series: SeriesItem) => void;
  onPlayMovie: (movie: VodStream, e: React.MouseEvent) => void;
  onPlaySeries: (series: SeriesItem, e: React.MouseEvent) => void;
}

export function Top10Shelf({
  items,
  onSelectMovie,
  onSelectSeries,
  onPlayMovie,
  onPlaySeries,
}: Top10ShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-1 sm:w-1.5 h-6 sm:h-7 bg-brand rounded-full shadow-[0_0_12px_rgba(229,9,20,0.8)]" />
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
            <span>Türkiye'de Bugünün</span>
            <span className="text-brand font-black">Top 10</span>
            <span>İçeriği</span>
          </h2>
        </div>

        {/* Scroll Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer shadow-md"
            title="Geri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-all cursor-pointer shadow-md"
            title="İleri"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth"
      >
        {items.slice(0, 10).map(({ rank, item, type }) => {
          const isMovie = type === "movie";
          const movie = isMovie ? (item as VodStream) : null;
          const series = !isMovie ? (item as SeriesItem) : null;

          const poster = isMovie ? movie?.stream_icon : series?.cover;
          const title = item.name;
          const rating = item.rating;

          return (
            <div
              key={`${type}-${isMovie ? movie?.stream_id : series?.series_id}`}
              onClick={() => {
                if (isMovie && movie) onSelectMovie(movie);
                if (!isMovie && series) onSelectSeries(series);
              }}
              className="group relative flex-none w-[170px] sm:w-[220px] flex items-end cursor-pointer transition-all duration-300"
            >
              {/* Giant Stylized Rank Number (Netflix typography) */}
              <div className="relative -mr-6 sm:-mr-9 z-0 select-none pointer-events-none">
                <span
                  className="font-black text-[95px] sm:text-[140px] leading-none text-zinc-900 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                  style={{
                    WebkitTextStroke: "3px #52525b",
                    fontFamily: "Impact, Arial Black, sans-serif",
                  }}
                >
                  {rank}
                </span>
              </div>

              {/* Poster Card Container */}
              <div className="relative z-10 w-[120px] sm:w-[150px] aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-brand/60 group-hover:scale-105 shadow-xl group-hover:shadow-2xl group-hover:shadow-brand/30 transition-all duration-300">
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    poster ||
                    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80"
                  }
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=80";
                  }}
                />

                {/* Top-Right Red TOP 10 Tag */}
                <div className="absolute top-2 right-2 bg-brand text-[9px] sm:text-[10px] font-black uppercase text-white px-1.5 py-0.5 rounded shadow-md tracking-wider">
                  TOP 10
                </div>

                {/* Bottom Overlay with actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-3">
                  <h4 className="text-xs font-bold text-white line-clamp-1 mb-1.5">{title}</h4>

                  {rating && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mb-2">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{rating}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMovie && movie) onPlayMovie(movie, e);
                        if (!isMovie && series) onPlaySeries(series, e);
                      }}
                      className="flex-1 py-1 px-2 rounded-lg bg-brand hover:bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md shadow-brand/40 active:scale-95 transition-all"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Oynat</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMovie && movie) onSelectMovie(movie);
                        if (!isMovie && series) onSelectSeries(series);
                      }}
                      className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                      title="Detaylar"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
