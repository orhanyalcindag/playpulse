"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useApp } from "@/context/AppContext";
import { LiveStream, EpgListing } from "@/types/iptv";
import { X, Tv, Calendar, Clock, Play, Loader2, Radio } from "lucide-react";

interface EpgScheduleModalProps {
  channel: LiveStream;
  onClose: () => void;
  onPlay: (channel: LiveStream) => void;
}

export function EpgScheduleModal({ channel, onClose, onPlay }: EpgScheduleModalProps) {
  const { xtreamService } = useApp();
  const [epgList, setEpgList] = useState<EpgListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!xtreamService) return;
    setIsLoading(true);
    xtreamService
      .getShortEpg(channel.stream_id, 10)
      .then((listings) => {
        setEpgList(listings);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load EPG:", err);
        setIsLoading(false);
      });
  }, [xtreamService, channel.stream_id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted || typeof document === "undefined") return null;

  const formatEpgTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.slice(11, 16);
      return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-xl max-h-[88vh] rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header with Channel info */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
              {channel.stream_icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={channel.stream_icon}
                  alt={channel.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Tv className="w-6 h-6 text-brand" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white truncate flex items-center gap-2">
                <span>{channel.name}</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Canlı Yayın
                </span>
                {channel.num ? <span>• Kanal {channel.num}</span> : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onPlay(channel);
                onClose();
              }}
              className="py-2 px-3.5 bg-brand hover:bg-brand-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>İzle</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* EPG Schedule Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>Yayın Akışı & Program Rehberi</span>
            </h4>
            <span className="text-[11px] text-zinc-500">Bugün</span>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-zinc-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <span className="text-xs">Yayın akışı alınıyor...</span>
            </div>
          ) : epgList.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs sm:text-sm bg-zinc-900/40 rounded-2xl border border-dashed border-white/5 p-6">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="font-semibold text-zinc-400">Bu kanal için detaylı yayın akışı bulunamadı.</p>
              <p className="text-zinc-600 text-xs mt-1">
                Yine de kanalı hemen izleyebilir ve anlık canlı akışa bağlanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {epgList.map((item, idx) => {
                const startTime = formatEpgTime(item.start);
                const endTime = formatEpgTime(item.end);
                const isNow = idx === 0;

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isNow
                        ? "bg-brand/10 border-brand/40 text-white shadow-md shadow-brand/10"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                            isNow
                              ? "bg-brand text-white shadow-sm"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {startTime} - {endTime}
                        </span>
                        {isNow && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/20 px-2 py-0.5 rounded-full border border-brand/30 animate-pulse">
                            Şu An Oynuyor
                          </span>
                        )}
                      </div>
                    </div>

                    <h5 className="text-sm font-bold text-white mt-1">{item.title}</h5>
                    {item.description && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span>{channel.name}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
