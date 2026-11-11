"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Film, ExternalLink } from "lucide-react";

interface YouTubeTrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  youtubeId?: string | null;
  year?: string;
}

export function YouTubeTrailerModal({
  isOpen,
  onClose,
  title,
  youtubeId,
  year,
}: YouTubeTrailerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  // Compute YouTube embed URL
  let embedUrl = "";
  let cleanId = "";

  if (youtubeId && typeof youtubeId === "string") {
    // If it's a full URL e.g. https://www.youtube.com/watch?v=XXXX or youtu.be/XXXX
    const match = youtubeId.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/);
    if (match && match[1] && match[1].length === 11) {
      cleanId = match[1];
    } else if (youtubeId.trim().length === 11) {
      cleanId = youtubeId.trim();
    }
  }

  if (cleanId) {
    embedUrl = `https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0&modestbranding=1`;
  } else {
    // Search embed fallback for any title
    const searchParam = encodeURIComponent(`${title} ${year || ""} resmi fragman trailer`);
    embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${searchParam}&autoplay=1`;
  }

  const directYouTubeUrl = cleanId
    ? `https://www.youtube.com/watch?v=${cleanId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} fragman`)}`;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2 truncate pr-4">
            <Film className="w-4 h-4 text-brand shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {title} - Resmi Fragman
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directYouTubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="YouTube'da Aç"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Ratio 16:9 */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={embedUrl}
            title={`${title} Fragman`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
