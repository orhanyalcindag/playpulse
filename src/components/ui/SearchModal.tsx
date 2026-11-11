"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/context/AppContext";
import { LiveStream, VodStream, SeriesItem } from "@/types/iptv";
import {
  Search,
  X,
  Tv,
  Film,
  Clapperboard,
  Play,
  Loader2,
  Sparkles,
} from "lucide-react";
import { MovieDetailModal } from "@/components/vod/MovieDetailModal";
import { SeriesDetailModal } from "@/components/vod/SeriesDetailModal";

export function SearchModal() {
  const { searchOpen, setSearchOpen, xtreamService, playMedia } = useApp();

  const [query, setQuery] = useState("");
  const [liveList, setLiveList] = useState<LiveStream[]>([]);
  const [movieList, setMovieList] = useState<VodStream[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<VodStream | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesItem | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load all initial lists when search is opened
  useEffect(() => {
    if (!searchOpen || !xtreamService) return;

    setIsLoading(true);
    Promise.all([
      xtreamService.getLiveStreams().catch(() => []),
      xtreamService.getVodStreams().catch(() => []),
      xtreamService.getSeriesList().catch(() => []),
    ])
      .then(([lives, movies, series]) => {
        setLiveList(lives);
        setMovieList(movies);
        setSeriesList(series);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [searchOpen, xtreamService]);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const cleanQuery = query.trim().toLowerCase();

  const matchingLive = useMemo(() => {
    if (!cleanQuery) return [];
    return liveList.filter((c) => c.name.toLowerCase().includes(cleanQuery)).slice(0, 6);
  }, [liveList, cleanQuery]);

  const matchingMovies = useMemo(() => {
    if (!cleanQuery) return [];
    return movieList
      .filter((m) => m.name.toLowerCase().includes(cleanQuery))
      .slice(0, 10);
  }, [movieList, cleanQuery]);

  const matchingSeries = useMemo(() => {
    if (!cleanQuery) return [];
    return seriesList
      .filter((s) => {
        const titleMatch = s.name.toLowerCase().includes(cleanQuery);
        const castMatch = s.cast && s.cast.toLowerCase().includes(cleanQuery);
        const directorMatch = s.director && s.director.toLowerCase().includes(cleanQuery);
        const genreMatch = s.genre && s.genre.toLowerCase().includes(cleanQuery);
        return titleMatch || castMatch || directorMatch || genreMatch;
      })
      .slice(0, 10);
  }, [seriesList, cleanQuery]);

  const totalResults = matchingLive.length + matchingMovies.length + matchingSeries.length;

  if (!searchOpen) return null;

  const handlePlayLive = (stream: LiveStream) => {
    if (!xtreamService) return;
    const url = xtreamService.getLiveStreamUrl(stream.stream_id);
    playMedia({
      id: `live-${stream.stream_id}`,
      title: stream.name,
      subtitle: "Canlı Yayın",
      poster: stream.stream_icon,
      streamUrl: url,
      type: "live",
      contentId: stream.stream_id,
    });
    setSearchOpen(false);
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        onClick={() => setSearchOpen(false)}
        className="fixed inset-0 z-[70] flex items-start justify-center pt-12 sm:pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-full sm:max-w-2xl bg-dark-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Search Input Bar */}
          <div className="relative flex items-center border-b border-dark-border px-4 py-3 bg-dark-elevated">
            <Search className="w-5 h-5 text-brand shrink-0 mr-3" />
            <input
              type="text"
              autoFocus
              placeholder="Canlı TV kanalı, film veya dizi ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-zinc-400 hover:text-white mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setSearchOpen(false)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-lg"
            >
              ESC
            </button>
          </div>

          {/* Results Container */}
          <div className="overflow-y-auto p-4 pb-20 sm:pb-4 space-y-6">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand mb-2" />
                <span className="text-xs">Katalog taranıyor...</span>
              </div>
            ) : !query.trim() ? (
              <div className="py-12 text-center text-zinc-500">
                <Sparkles className="w-10 h-10 mx-auto text-zinc-700 mb-2" />
                <p className="text-sm">Aramak istediğiniz içeriğin adını yazın</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Örn: &quot;TRT&quot;, &quot;Dune&quot;, &quot;Breaking Bad&quot;, &quot;Spor&quot;
                </p>
              </div>
            ) : totalResults === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <p className="text-sm font-medium text-zinc-400">Sonuç bulunamadı</p>
                <p className="text-xs text-zinc-600 mt-1">
                  &quot;{query}&quot; ile eşleşen bir kanal, film veya dizi yok.
                </p>
              </div>
            ) : (
              <>
                {/* Live Channels Results */}
                {matchingLive.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-brand" />
                      Canlı Kanallar ({matchingLive.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingLive.map((stream) => (
                        <div
                          key={stream.stream_id}
                          onClick={() => handlePlayLive(stream)}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-elevated hover:bg-zinc-800 border border-dark-border hover:border-brand/50 cursor-pointer transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center p-1 shrink-0 border border-white/5">
                            {stream.stream_icon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={stream.stream_icon}
                                alt={stream.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Tv className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate flex-1">
                            {stream.name}
                          </span>
                          <Play className="w-4 h-4 text-brand shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Movies Results */}
                {matchingMovies.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-brand" />
                      Filmler ({matchingMovies.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingMovies.map((movie) => (
                        <div
                          key={movie.stream_id}
                          onClick={() => {
                            setSelectedMovie(movie);
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-elevated hover:bg-zinc-800 border border-dark-border hover:border-brand/50 cursor-pointer transition-all"
                        >
                          <div className="w-10 h-14 rounded bg-zinc-900 overflow-hidden shrink-0 border border-white/5">
                            {movie.stream_icon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={movie.stream_icon}
                                alt={movie.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Film className="w-5 h-5 text-zinc-600 m-auto mt-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate block">
                              {movie.name}
                            </span>
                            <span className="text-[11px] text-zinc-500">Film</span>
                          </div>
                          <span className="text-xs text-brand font-medium">Detay</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Series Results */}
                {matchingSeries.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
                      <Clapperboard className="w-3.5 h-3.5 text-brand" />
                      Diziler ({matchingSeries.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingSeries.map((series) => (
                        <div
                          key={series.series_id}
                          onClick={() => {
                            setSelectedSeries(series);
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-dark-elevated hover:bg-zinc-800 border border-dark-border hover:border-brand/50 cursor-pointer transition-all"
                        >
                          <div className="w-10 h-14 rounded bg-zinc-900 overflow-hidden shrink-0 border border-white/5">
                            {series.cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={series.cover}
                                alt={series.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Clapperboard className="w-5 h-5 text-zinc-600 m-auto mt-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-xs sm:text-sm font-semibold text-zinc-200 truncate block">
                              {series.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-zinc-500">Dizi</span>
                              {series.cast && series.cast.toLowerCase().includes(cleanQuery) && (
                                <span className="text-[9px] text-brand font-semibold bg-brand/10 px-1 rounded truncate max-w-[130px]">
                                  Oyuncu: {series.cast}
                                </span>
                              )}
                              {series.director && series.director.toLowerCase().includes(cleanQuery) && (
                                <span className="text-[9px] text-indigo-400 font-semibold bg-indigo-500/10 px-1 rounded truncate max-w-[130px]">
                                  Yönetmen: {series.director}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-brand font-medium">Bölümler</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {selectedSeries && (
        <SeriesDetailModal
          series={selectedSeries}
          onClose={() => setSelectedSeries(null)}
        />
      )}
    </>,
    document.body
  );
}
