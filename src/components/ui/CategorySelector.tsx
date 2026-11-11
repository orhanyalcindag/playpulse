"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { cleanCategoryName } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  X,
  Check,
  Lock,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";

export interface CategoryItem {
  category_id: string;
  category_name: string;
}

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string, categoryName?: string) => void;
  allLabel?: string;
  allIcon?: React.ReactNode;
  isAdultCategory?: (name: string) => boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
  allLabel = "Tümü",
  allIcon,
  isAdultCategory,
}: CategorySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchFilter("");
    }
  }, [isModalOpen]);

  // Find currently selected category name
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return categories.find((c) => c.category_id === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const selectedName = selectedCategory
    ? cleanCategoryName(selectedCategory.category_name)
    : allLabel;

  // Filter categories by search keyword inside modal
  const modalFilteredCategories = useMemo(() => {
    if (!searchFilter.trim()) return categories;
    const q = searchFilter.toLowerCase();
    return categories.filter((c) => {
      const clean = cleanCategoryName(c.category_name).toLowerCase();
      const raw = c.category_name.toLowerCase();
      return clean.includes(q) || raw.includes(q);
    });
  }, [categories, searchFilter]);

  // Top 5 quick chips to show directly beside the dropdown
  const quickChips = useMemo(() => {
    return categories.slice(0, 5);
  }, [categories]);

  const handleSelect = (catId: string, catName?: string) => {
    onSelectCategory(catId, catName);
    setIsModalOpen(false);
  };

  return (
    <div className="mb-6 w-full select-none">
      {/* Category Bar: Main Dropdown + Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
        {/* Main Dropdown Trigger Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${
            selectedCategoryId !== "all"
              ? "bg-brand/20 border border-brand text-white shadow-brand/20"
              : "bg-dark-elevated hover:bg-zinc-800 border border-dark-border text-zinc-200 hover:text-white"
          }`}
          title="Tüm kategorileri görüntüle ve ara"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand" />
          <span className="font-bold">
            {selectedCategoryId !== "all" ? `Kategori: ${selectedName}` : "Kategoriler"}
          </span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-[10px] font-bold text-zinc-300">
            {categories.length}
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400 ml-0.5" />
        </button>

        {/* Quick Reset Button if not 'all' */}
        {selectedCategoryId !== "all" && (
          <button
            onClick={() => handleSelect("all")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/5 text-xs font-semibold cursor-pointer transition-all"
            title="Tümüne dön"
          >
            <X className="w-3.5 h-3.5" />
            <span>Filtreyi Temizle</span>
          </button>
        )}

        {/* 'Tümü' Quick Chip */}
        <button
          onClick={() => handleSelect("all")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryId === "all"
              ? "bg-brand text-white shadow-md shadow-brand/40"
              : "bg-dark-elevated text-zinc-300 hover:bg-zinc-800 border border-dark-border"
          }`}
        >
          {allIcon}
          <span>{allLabel}</span>
        </button>

        {/* Quick Chips for First 4-5 categories */}
        {quickChips.map((cat) => {
          const isSelected = selectedCategoryId === cat.category_id;
          const isAdult = isAdultCategory?.(cat.category_name);
          const name = cleanCategoryName(cat.category_name);

          return (
            <button
              key={cat.category_id}
              onClick={() => handleSelect(cat.category_id, cat.category_name)}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand text-white shadow-md shadow-brand/40"
                  : "bg-dark-elevated text-zinc-300 hover:bg-zinc-800 border border-dark-border"
              }`}
            >
              {isAdult && <Lock className="w-3 h-3 text-rose-400" />}
              <span>{name}</span>
            </button>
          );
        })}

        {/* 'Daha Fazla...' Trigger Button */}
        {categories.length > 5 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5 text-xs font-medium cursor-pointer transition-all"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" />
            <span>Daha Fazla (+{categories.length - 5})</span>
          </button>
        )}
      </div>

      {/* Full Categories Modal / Dialog Sheet */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-brand" />
                  <span>Kategori Seçin</span>
                  <span className="text-xs text-zinc-400 font-normal">
                    ({categories.length} Kategori)
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  İstediğiniz türe anında geçiş yapın veya yukarıdan arayın.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-4 sm:px-6 border-b border-white/5 bg-zinc-900/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Kategori adı ara (örn: Aksiyon, Yerli, 2025, Komedi)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/80 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories Multi-Column Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* All Items Option Card */}
              <button
                onClick={() => handleSelect("all")}
                className={`w-full p-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between transition-all cursor-pointer ${
                  selectedCategoryId === "all"
                    ? "bg-brand text-white border-brand shadow-lg shadow-brand/30"
                    : "bg-zinc-900/80 hover:bg-zinc-800 border-white/5 text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {allIcon}
                  <span>{allLabel} (Tüm İçerikler)</span>
                </div>
                {selectedCategoryId === "all" && <Check className="w-4 h-4" />}
              </button>

              {modalFilteredCategories.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-xs sm:text-sm">
                  "{searchFilter}" ile eşleşen kategori bulunamadı.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
                  {modalFilteredCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.category_id;
                    const isAdult = isAdultCategory?.(cat.category_name);
                    const cleanName = cleanCategoryName(cat.category_name);

                    return (
                      <button
                        key={cat.category_id}
                        onClick={() => handleSelect(cat.category_id, cat.category_name)}
                        className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-brand/20 border-brand text-white shadow-md shadow-brand/20 font-bold"
                            : "bg-zinc-900/60 hover:bg-zinc-800 border-white/5 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate mr-2">
                          {isAdult && (
                            <span title="+18 / PIN Korumalı">
                              <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            </span>
                          )}
                          <span className="truncate">{cleanName}</span>
                        </div>

                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with category count */}
            <div className="px-6 py-3 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
              <span>Toplam {categories.length} kategori listelendi</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
