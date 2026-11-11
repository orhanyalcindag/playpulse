"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Keyboard, Command } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const shortcuts = [
    { key: "Space / K", desc: "Oynat / Duraklat" },
    { key: "← / → (veya J / L)", desc: "10 Saniye Geri / İleri Sar" },
    { key: "↑ / ↓", desc: "Sesi %10 Artır / Azalt" },
    { key: "F", desc: "Tam Ekran Aç / Çık" },
    { key: "M", desc: "Sesi Aç / Kapat (Mute)" },
    { key: "C", desc: "Altyazıyı Aç / Kapat" },
    { key: "S", desc: "AAC Ses Çözücü / Doğrudan Akış Geçişi" },
    { key: "Ctrl + K", desc: "Hızlı Film / Dizi / Kanal Arama" },
    { key: "0 - 9", desc: "Canlı TV'de Doğrudan Kanal Numarasına Git (Zapping)" },
    { key: "Esc", desc: "Oynatıcıyı veya Modalı Kapat" },
    { key: "?", desc: "Bu Kısayol Rehberini Aç / Kapat" },
  ];

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-white tracking-wide">Klavye Kısayolları</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-900/50 border border-white/5 text-xs sm:text-sm"
            >
              <span className="text-zinc-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-brand font-mono font-bold text-xs shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-zinc-500" />
            <span>Smart TV Air Mouse & Klavyelerle uyumludur</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold transition-all cursor-pointer"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
