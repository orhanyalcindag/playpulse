"use client";

import React from "react";

export interface MoodFilter {
  id: string;
  label: string;
  keywords: string[];
}

export const MOOD_FILTERS: MoodFilter[] = [
  { id: "all", label: "Tümü", keywords: [] },
  { id: "trending", label: "🔥 Trendler", keywords: ["trend", "populer", "top"] },
  { id: "action", label: "💥 Aksiyon & Macera", keywords: ["aksiyon", "macera", "action", "adventure"] },
  { id: "comedy", label: "😂 Komedi", keywords: ["komedi", "comedy"] },
  { id: "scifi", label: "🚀 Bilim Kurgu & Fantastik", keywords: ["bilim kurgu", "fantastik", "sci-fi", "fantasy"] },
  { id: "horror", label: "😱 Korku & Gerilim", keywords: ["korku", "gerilim", "horror", "thriller"] },
  { id: "drama", label: "🎭 Dram", keywords: ["dram", "drama"] },
  { id: "family", label: "👨‍👩‍👧‍👦 Aile & Çocuk", keywords: ["aile", "çocuk", "cocuk", "animasyon", "animation", "family"] },
  { id: "turkish", label: "🇹🇷 Türk Yapımları", keywords: ["yerli", "türk", "turk", "yeşilçam", "yesilcam"] },
];

interface MoodFilterChipsProps {
  selectedMood: string;
  onSelectMood: (id: string) => void;
}

export function MoodFilterChips({ selectedMood, onSelectMood }: MoodFilterChipsProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
      <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-2 no-scrollbar">
        {MOOD_FILTERS.map((filter) => {
          const isSelected = selectedMood === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onSelectMood(filter.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand text-white shadow-lg shadow-brand/40 scale-105"
                  : "bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
