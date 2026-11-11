"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Volume2,
  Subtitles,
  Upload,
  Sliders,
  Check,
  RotateCcw,
  Plus,
  Minus,
  FileText,
  Trash2,
  Sparkles,
  ExternalLink,
  Copy,
} from "lucide-react";
import { SubtitleSettings, parseSubtitleContent, SubtitleCue } from "@/lib/subtitles";

export interface AudioTrackOption {
  id: number;
  label: string;
  lang?: string;
}

export interface SubtitleTrackOption {
  id: string; // 'none' | 'custom' | `hls-${index}`
  label: string;
  lang?: string;
  type: "none" | "hls" | "custom";
}

interface SubtitleAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Audio tracks
  audioTracks: AudioTrackOption[];
  activeAudioTrack: number;
  onSelectAudioTrack: (id: number) => void;
  // Subtitle tracks
  subtitleTracks: SubtitleTrackOption[];
  activeSubtitleTrack: string;
  onSelectSubtitleTrack: (id: string) => void;
  // Custom subtitle file handling
  customSubtitleName: string | null;
  onUploadCustomSubtitle: (name: string, cues: SubtitleCue[]) => void;
  onRemoveCustomSubtitle: () => void;
  // Subtitle settings
  settings: SubtitleSettings;
  onUpdateSettings: (newSettings: Partial<SubtitleSettings>) => void;
  // Audio Mode & External Player
  audioMode?: "aac" | "direct";
  onChangeAudioMode?: (mode: "aac" | "direct") => void;
  streamUrl?: string;
  mediaType?: "live" | "movie" | "series";
}

export function SubtitleAudioModal({
  isOpen,
  onClose,
  audioTracks,
  activeAudioTrack,
  onSelectAudioTrack,
  subtitleTracks,
  activeSubtitleTrack,
  onSelectSubtitleTrack,
  customSubtitleName,
  onUploadCustomSubtitle,
  onRemoveCustomSubtitle,
  settings,
  onUpdateSettings,
  audioMode = "aac",
  onChangeAudioMode,
  streamUrl,
  mediaType,
}: SubtitleAudioModalProps) {
  const [activeTab, setActiveTab] = useState<"tracks" | "settings">("tracks");
  const [copiedLink, setCopiedLink] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const cues = parseSubtitleContent(text);
        if (cues.length > 0) {
          onUploadCustomSubtitle(file.name, cues);
        } else {
          alert("Altyazı dosyasından geçerli zaman çizelgesi okunamadı. Lütfen standart SRT veya VTT dosyası seçin.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleAdjustOffset = (delta: number) => {
    const next = Math.round((settings.offset + delta) * 10) / 10;
    const clamped = Math.max(-5, Math.min(5, next));
    onUpdateSettings({ offset: clamped });
  };

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-white tracking-wide">Ses ve Altyazı Yönetimi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-white/10 bg-zinc-900/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab("tracks")}
            className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === "tracks" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Ses & Altyazı Seçimi</span>
            {activeTab === "tracks" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full shadow-[0_0_10px_rgba(229,9,20,0.8)]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === "settings" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Altyazı Ayarları & Senkronizasyon</span>
            {activeTab === "settings" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full shadow-[0_0_10px_rgba(229,9,20,0.8)]" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "tracks" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Audio Tracks */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-sm pb-1 border-b border-white/5">
                  <Volume2 className="w-4 h-4 text-brand" />
                  <span>Ses Dili</span>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {audioTracks.length === 0 ? (
                    <button
                      onClick={() => onSelectAudioTrack(0)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900/90 border border-brand/50 text-white text-xs font-semibold"
                    >
                      <span>Varsayılan Ses Akışı</span>
                      <Check className="w-4 h-4 text-brand" />
                    </button>
                  ) : (
                    audioTracks.map((track) => {
                      const isSelected = activeAudioTrack === track.id;
                      return (
                        <button
                          key={track.id}
                          onClick={() => onSelectAudioTrack(track.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? "bg-brand/15 border border-brand/50 text-white"
                              : "bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white"
                          }`}
                        >
                          <span className="truncate">{track.label || `Ses Kanalı ${track.id + 1}`}</span>
                          {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Audio Transcode Compatibility Mode (Fixes AC-3 silence in browsers) */}
                {mediaType !== "live" && onChangeAudioMode && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ses Çözücü Uyumluluğu</span>
                      </span>
                      {audioMode === "aac" && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Ses Aktif (AAC)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Filmlerde ses gelmiyorsa (Dolby AC-3 tarayıcı kısıtı), <strong>AAC Çözücü</strong> modunu kullanın.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onChangeAudioMode("aac")}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          audioMode === "aac"
                            ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-sm"
                            : "bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-emerald-400">AAC Çözücü</span>
                          {audioMode === "aac" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 block line-clamp-1">Önerilen (Ses Açık)</span>
                      </button>

                      <button
                        onClick={() => onChangeAudioMode("direct")}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          audioMode === "direct"
                            ? "bg-brand/15 border border-brand/50 text-white shadow-sm"
                            : "bg-zinc-900/50 hover:bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">Doğrudan Akış</span>
                          {audioMode === "direct" && <Check className="w-3.5 h-3.5 text-brand" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 block line-clamp-1">Ham IPTV Bağlantısı</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* External Player (VLC / PotPlayer) Links */}
                {streamUrl && (
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-brand" />
                      <span>Harici Oynatıcı</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`vlc://${streamUrl}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>VLC ile Aç</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(streamUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Akış Bağlantısını Kopyala"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? "Kopyalandı!" : "Linki Kopyala"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Subtitles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-zinc-300 font-bold text-sm pb-1 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Subtitles className="w-4 h-4 text-brand" />
                    <span>Altyazı</span>
                  </div>
                  {activeSubtitleTrack !== "none" && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Aktif
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {/* Off Option */}
                  <button
                    onClick={() => onSelectSubtitleTrack("none")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                      activeSubtitleTrack === "none"
                        ? "bg-brand/15 border border-brand/50 text-white"
                        : "bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white"
                    }`}
                  >
                    <span>Kapalı</span>
                    {activeSubtitleTrack === "none" && <Check className="w-4 h-4 text-brand shrink-0" />}
                  </button>

                  {/* Custom Uploaded Subtitle Item */}
                  {customSubtitleName && (
                    <div
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                        activeSubtitleTrack === "custom"
                          ? "bg-brand/15 border border-brand/50 text-white"
                          : "bg-zinc-900/50 border border-white/5 text-zinc-300"
                      }`}
                    >
                      <button
                        onClick={() => onSelectSubtitleTrack("custom")}
                        className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{customSubtitleName}</span>
                      </button>

                      <div className="flex items-center gap-1.5 ml-2">
                        {activeSubtitleTrack === "custom" && <Check className="w-4 h-4 text-brand shrink-0" />}
                        <button
                          onClick={onRemoveCustomSubtitle}
                          className="p-1 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Yüklenen Altyazıyı Kaldır"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Embedded HLS Tracks */}
                  {subtitleTracks.map((track) => {
                    const isSelected = activeSubtitleTrack === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => onSelectSubtitleTrack(track.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-brand/15 border border-brand/50 text-white"
                            : "bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{track.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Upload Custom Subtitle Button */}
                <div className="pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".srt,.vtt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-dashed border-white/20 hover:border-brand text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Upload className="w-4 h-4 text-brand" />
                    <span>Harici Altyazı Dosyası Yükle (.srt / .vtt)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Settings & Sync Tab */
            <div className="space-y-6">
              {/* Synchronization Offset Slider */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Altyazı Senkronizasyonu (Gecikme)</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Altyazı sesle uyuşmuyorsa ileri veya geri kaydırın.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-brand px-2.5 py-1 rounded-lg bg-brand/10 border border-brand/30">
                    {settings.offset > 0 ? `+${settings.offset.toFixed(1)}s` : `${settings.offset.toFixed(1)}s`}
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.25"
                  value={settings.offset}
                  onChange={(e) => onUpdateSettings({ offset: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-700/80 rounded-lg accent-brand cursor-pointer"
                />

                {/* Quick Nudge Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustOffset(-0.5)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                      <span>-0.5s</span>
                    </button>
                    <button
                      onClick={() => handleAdjustOffset(-0.25)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      -0.25s
                    </button>
                  </div>

                  <button
                    onClick={() => onUpdateSettings({ offset: 0 })}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Sıfırla (0s)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdjustOffset(0.25)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                    >
                      +0.25s
                    </button>
                    <button
                      onClick={() => handleAdjustOffset(0.5)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+0.5s</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Size & Color & Background Styling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Yazı Boyutu</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "small", label: "Küçük" },
                      { id: "medium", label: "Normal" },
                      { id: "large", label: "Büyük" },
                      { id: "xlarge", label: "Ekstra" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onUpdateSettings({ fontSize: opt.id as any })}
                        className={`py-2 px-2 text-xs rounded-xl font-medium transition-all cursor-pointer ${
                          settings.fontSize === opt.id
                            ? "bg-brand text-white font-bold shadow-md shadow-brand/30"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Yazı Rengi</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: "white", label: "Beyaz", color: "#ffffff" },
                      { id: "yellow", label: "Sarı", color: "#ffe600" },
                      { id: "cyan", label: "Mavi", color: "#00e5ff" },
                      { id: "green", label: "Yeşil", color: "#4ade80" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onUpdateSettings({ color: opt.id as any })}
                        className={`py-2 px-2 text-xs rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          settings.color === opt.id
                            ? "bg-zinc-800 border border-brand text-white font-bold"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: opt.color }}
                        />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Box */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300">Arka Plan</label>
                  <div className="space-y-1.5">
                    {[
                      { id: "transparent", label: "Şeffaf (Sadece Gölgeli)" },
                      { id: "semi", label: "Yarı Saydam Siyah" },
                      { id: "solid", label: "Tam Kutu (Opak)" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onUpdateSettings({ backgroundColor: opt.id as any })}
                        className={`w-full py-1.5 px-3 text-xs rounded-xl font-medium transition-all text-left cursor-pointer ${
                          settings.backgroundColor === opt.id
                            ? "bg-brand text-white font-bold shadow-md shadow-brand/30"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtitle Live Preview Box */}
              <div className="p-4 rounded-2xl bg-black border border-white/10 flex flex-col items-center justify-center min-h-[100px] text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
                  Canlı Görünüm Önizleme
                </span>
                <div
                  className={`px-3 py-1.5 rounded font-sans transition-all max-w-sm ${
                    settings.backgroundColor === "solid"
                      ? "bg-black"
                      : settings.backgroundColor === "semi"
                      ? "bg-black/70 backdrop-blur-xs"
                      : "bg-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  } ${
                    settings.fontSize === "small"
                      ? "text-sm"
                      : settings.fontSize === "medium"
                      ? "text-base font-semibold"
                      : settings.fontSize === "large"
                      ? "text-xl font-bold"
                      : "text-2xl font-black"
                  }`}
                  style={{
                    color:
                      settings.color === "yellow"
                        ? "#ffe600"
                        : settings.color === "cyan"
                        ? "#00e5ff"
                        : settings.color === "green"
                        ? "#4ade80"
                        : "#ffffff",
                    textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)",
                  }}
                >
                  PlayPulse ile sinema keyfi evinize geliyor.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-zinc-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-brand hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-brand/40 transition-all cursor-pointer active:scale-95"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
