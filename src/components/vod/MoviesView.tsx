"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { VodCategory, VodStream } from "@/types/iptv";
import { cleanCategoryName } from "@/lib/utils";
import {
  Film,
  Search,
  Heart,
  Play,
  Star,
  Loader2,
  ChevronDown,
  Info,
  Lock,
  ArrowUpDown,
} from "lucide-react";
import { MovieDetailModal } from "./MovieDetailModal";
import { CategorySelector } from "@/components/ui/CategorySelector";

const PAGE_SIZE = 20;

export function MoviesView() {
  const {
    xtreamService,
    isFavorite,
    toggleFavorite,
    playMedia,
    isKidsMode,
    isAdultCategory,
    requestPinAccess,
  } = useApp();

  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [movies, setMovies] = useState<VodStream[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(true);
  const [selectedMovie, setSelectedMovie] = useState<VodStream | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "rating-desc" | "added-desc" | "year-desc" | "title-asc">("default");

  // Load Categories
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingCategories(true);
    xtreamService
      .getVodCategories()
      .then((cats) => {
        setCategories(cats);
        setIsLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Failed to load vod categories:", err);
        setIsLoadingCategories(false);
      });
  }, [xtreamService]);

  // Load Movies when category changes
  useEffect(() => {
    if (!xtreamService) return;
    setIsLoadingMovies(true);
    setVisibleCount(PAGE_SIZE); // Reset pagination on category change
    xtreamService
      .getVodStreams(selectedCategoryId)
      .then((data) => {
        setMovies(data);
        setIsLoadingMovies(false);
      })
      .catch((err) => {
        console.error("Failed to load vod streams:", err);
        setIsLoadingMovies(false);
      });
  }, [xtreamService, selectedCategoryId]);

  // Filter categories for Kids Mode
  const availableCategories = useMemo(() => {
    if (!isKidsMode) return categories;
    return categories.filter((cat) => !isAdultCategory(cat.category_name));
  }, [categories, isKidsMode]);

  const handleSelectCategory = (catId: string, catName?: string) => {
    if (catId === "all") {
      setSelectedCategoryId("all");
      return;
    }
    if (catName && isAdultCategory(catName)) {
      requestPinAccess(() => {
        setSelectedCategoryId(catId);
      });
      return;
    }
    setSelectedCategoryId(catId);
  };

  // Reset pagination on search
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery]);

  // Filter movies
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const q = searchQuery.toLowerCase();
    return movies.filter((m) => m.name.toLowerCase().includes(q));
  }, [movies, searchQuery]);

  // Sort movies
  const sortedMovies = useMemo(() => {
    if (sortBy === "default") return filteredMovies;
    const list = [...filteredMovies];

    const extractYear = (name: string): number => {
      const match = name.match(/\b(19\d\d|20\d\d)\b/);
      return match ? parseInt(match[1], 10) : 0;
    };

    switch (sortBy) {
      case "rating-desc":
        return list.sort((a, b) => {
          const rA = parseFloat(String(a.rating || 0)) || 0;
          const rB = parseFloat(String(b.rating || 0)) || 0;
          return rB - rA;
        });
      case "added-desc":
        return list.sort((a, b) => {
          const tA = parseInt(String(a.added || 0), 10) || 0;
          const tB = parseInt(String(b.added || 0), 10) || 0;
          return tB - tA;
        });
      case "year-desc":
        return list.sort((a, b) => extractYear(b.name) - extractYear(a.name));
      case "title-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
      default:
        return list;
    }
  }, [filteredMovies, sortBy]);

  // Slice displayed movies by visibleCount for maximum performance
  const displayedMovies = useMemo(() => {
    return sortedMovies.slice(0, visibleCount);
  }, [sortedMovies, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredMovies.length));
  };

  // Direct play handler
  const handleDirectPlay = (movie: VodStream, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!xtreamService) return;

    const streamUrl = xtreamService.getMovieStreamUrl(
      movie.stream_id,
      movie.container_extension || "mp4"
    );

    playMedia({
      id: `movie-${movie.stream_id}`,
      title: movie.name,
      subtitle: "Film",
      poster: movie.stream_icon,
      streamUrl,
      type: "movie",
      contentId: movie.stream_id,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-24 md:pb-10 overflow-x-hidden">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Film className="w-7 h-7 text-brand" />
            Filmler (VOD)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            En yeni vizyon filmleri, 4K sinema klasikleri ve ödüllü yapımlar
          </p>
        </div>

        {/* Right Controls: Sort & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2 bg-dark-elevated border border-dark-border hover:border-brand/40 rounded-xl text-xs sm:text-sm font-semibold text-zinc-200 focus:outline-none focus:border-brand cursor-pointer transition-all appearance-none pr-9 shadow-sm"
              title="Filmleri sırala"
            >
              <option value="default" className="bg-zinc-900 text-white">Varsayılan Sıralama</option>
              <option value="rating-desc" className="bg-zinc-900 text-white">⭐ En Yüksek IMDB</option>
              <option value="added-desc" className="bg-zinc-900 text-white">🆕 En Yeni Eklenenler</option>
              <option value="year-desc" className="bg-zinc-900 text-white">📅 Çıkış Yılına Göre</option>
              <option value="title-asc" className="bg-zinc-900 text-white">🔤 A'dan Z'ye</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-brand absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72 max-w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Film adı veya tür ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-white"
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Netflix-Style Category Selector */}
      <CategorySelector
        categories={availableCategories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        allLabel="Tüm Filmler"
        allIcon={<Film className="w-3.5 h-3.5" />}
        isAdultCategory={isAdultCategory}
      />

      {/* Movies Grid */}
      {isLoadingMovies ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Loader2 className="w-10 h-10 animate-spin text-brand mb-3" />
          <p className="text-sm">Filmler listeleniyor...</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-20 bg-dark-surface rounded-2xl border border-dashed border-zinc-800">
          <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">Film Bulunamadı</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Farklı bir arama terimi veya kategori deneyin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {displayedMovies.map((movie) => {
              const favId = `movie-${movie.stream_id}`;
              const isFav = isFavorite(favId);

              return (
                <div
                  key={movie.stream_id}
                  className="min-w-0 group relative bg-dark-surface hover:bg-dark-elevated rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand/20 hover:-translate-y-1.5 flex flex-col select-none"
                >
                  {/* Poster Area - Clicking anywhere opens Movie Details modal */}
                  <div
                    onClick={() => setSelectedMovie(movie)}
                    className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden cursor-pointer"
                  >
                    {/* Fallback Icon behind image */}
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-700">
                      <Film className="w-10 h-10" />
                    </div>

                    {movie.stream_icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.stream_icon}
                        alt={movie.name}
                        className="relative z-1 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}

                    {/* Dark gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-black/30 opacity-80 group-hover:opacity-50 transition-opacity" />

                    {/* Rating Badge */}
                    {movie.rating && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-400 border border-white/10 flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {typeof movie.rating === "number" ? movie.rating.toFixed(1) : movie.rating}
                      </div>
                    )}

                    {/* Favorite Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: favId,
                          type: "movie",
                          name: movie.name,
                          streamId: movie.stream_id,
                          icon: movie.stream_icon,
                          rating: movie.rating,
                          container_extension: movie.container_extension,
                          addedAt: Date.now(),
                        });
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 cursor-pointer ${
                        isFav
                          ? "text-brand bg-brand/20"
                          : "text-zinc-400 hover:text-white bg-black/60 hover:bg-black/90"
                      }`}
                      title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-brand" : ""}`} />
                    </button>

                    {/* Center Big Play Button - Always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <div
                        onClick={(e) => handleDirectPlay(movie, e)}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand hover:bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand/70 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                        title="Filmi Oynat"
                      >
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Movie Title & Info Bottom Bar */}
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between min-w-0">
                    <h3
                      onClick={() => setSelectedMovie(movie)}
                      className="text-xs sm:text-sm font-semibold text-zinc-100 hover:text-brand truncate transition-colors cursor-pointer"
                    >
                      {movie.name}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-1 border-t border-white/5 min-w-0">
                      {/* Left: Details text */}
                      <button
                        type="button"
                        onClick={() => setSelectedMovie(movie)}
                        className="text-brand font-semibold hover:underline flex items-center gap-1 cursor-pointer truncate"
                      >
                        <Info className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span className="truncate">Detay</span>
                      </button>

                      {/* Right: Info / Details Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMovie(movie);
                        }}
                        className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer p-0.5 hover:bg-white/10 rounded transition-colors shrink-0"
                        title="Detaylı Bilgi"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button & Pagination Controls */}
          {filteredMovies.length > visibleCount && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <p className="text-xs text-zinc-400">
                Toplam <span className="font-bold text-white">{filteredMovies.length}</span> filmden{" "}
                <span className="font-bold text-brand">{displayedMovies.length}</span> tanesi gösteriliyor
              </p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="py-3 px-8 bg-dark-elevated hover:bg-zinc-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/10 hover:border-brand/50 shadow-lg shadow-black/40 transition-all cursor-pointer flex items-center gap-2 active:scale-95 group"
              >
                <span>Daha Fazla Film Göster (+{Math.min(PAGE_SIZE, filteredMovies.length - visibleCount)})</span>
                <ChevronDown className="w-4 h-4 text-brand group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
