"use client";

import React, { useState } from "react";
import { Lock, Delete, X, AlertCircle } from "lucide-react";

interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  expectedPin: string;
}

export function PinLockModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Ebeveyn Kilidi",
  description = "Bu kategoriye erişmek için lütfen 4 haneli PIN kodunuzu girin.",
  expectedPin,
}: PinLockModalProps) {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === expectedPin) {
        setTimeout(() => {
          setPin("");
          setError(false);
          onSuccess();
        }, 150);
      } else {
        setError(true);
        setTimeout(() => {
          setPin("");
        }, 800);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClose = () => {
    setPin("");
    setError(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-zinc-900 border border-white/10 p-6 sm:p-8 text-center shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 text-brand mx-auto flex items-center justify-center mb-4 shadow-lg shadow-brand/20">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{description}</p>

        {/* Pin Dots */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? "bg-rose-500 scale-110 animate-bounce"
                    : isFilled
                    ? "bg-brand scale-125 shadow-md shadow-brand/50"
                    : "bg-zinc-700/60"
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-400 mb-4 animate-shake">
            <AlertCircle className="w-4 h-4" />
            <span>Hatalı PIN! (Varsayılan: 0000)</span>
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-brand text-white text-xl font-bold transition-all cursor-pointer border border-white/5 shadow-sm active:scale-95"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="h-14 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 active:bg-brand text-white text-xl font-bold transition-all cursor-pointer border border-white/5 shadow-sm active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-zinc-800/40 hover:bg-zinc-700/60 text-zinc-400 hover:text-white transition-all cursor-pointer border border-white/5 flex items-center justify-center active:scale-95"
            title="Sil"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 mt-6">
          Varsayılan şifre <strong className="text-zinc-300">0000</strong>'dır.
        </p>
      </div>
    </div>
  );
}
