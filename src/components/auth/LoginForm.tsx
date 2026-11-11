"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { XtreamProfile } from "@/types/iptv";
import {
  ShieldCheck,
  AlertCircle,
  Server,
  User,
  KeyRound,
  Loader2,
  Settings,
  Plus,
  Crown,
  Sparkles,
  Tv,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function LoginForm() {
  const {
    profiles,
    selectProfile,
    login,
    setIsProfileManagerOpen,
  } = useApp();

  // Manual Form State
  const [showManualForm, setShowManualForm] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [useDirectMode, setUseDirectMode] = useState(false);

  // Loading & Error States
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleProfileSelect = async (profile: XtreamProfile) => {
    setLoadingProfileId(profile.id);
    setErrorMessage(null);
    try {
      await selectProfile(profile);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Profile bağlanırken hata oluştu. Lütfen bağlantıyı kontrol edin."
      );
    } finally {
      setLoadingProfileId(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let cleanUrl = serverUrl.trim();
    if (!cleanUrl) {
      setErrorMessage("Lütfen geçerli bir Server URL adresi girin.");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `http://${cleanUrl}`;
    }

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setIsManualLoading(true);

    try {
      await login({
        serverUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        connectionMode: useDirectMode ? "direct" : "proxy",
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Sunucuya bağlanılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
      );
    } finally {
      setIsManualLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-dark-bg">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/10 blur-[150px] pointer-events-none" />

      {/* Decorative subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-2xl z-10 animate-fade-in flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo_transparent.png"
              alt="PlayPulse - Streaming Evolved"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Kim İzliyor?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            İzlemeye başlamak için profilinizi seçin veya yeni Xtream hesabı ekleyin
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-800/80 flex flex-col gap-2 text-red-200 text-sm animate-fade-in shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
            <div className="text-xs text-zinc-400 pl-8 pt-1 border-t border-red-800/30">
              💡 <strong>İpucu:</strong> IPTV sunucunuz 8080 portundaysa ve yerel ağdaysanız (Wi-Fi), tarayıcıda <code className="text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded">http://192.168.7.240:3000</code> adresinden açarak kesintisiz bağlanabilirsiniz.
            </div>
          </div>
        )}

        {/* Profile Cards Grid (Netflix Style) */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {profiles.map((profile) => {
            const isLoading = loadingProfileId === profile.id;
            const isVip = profile.serverUrl.includes("eu4tv.com");

            return (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile)}
                disabled={!!loadingProfileId || isManualLoading}
                className="group relative flex flex-col items-center p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 hover:border-brand/60 bg-dark-card/60 hover:bg-dark-elevated transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                {/* Profile Avatar */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${
                    profile.color || "from-purple-600 to-rose-600"
                  } flex items-center justify-center text-white shadow-xl group-hover:shadow-brand/40 group-hover:ring-4 group-hover:ring-brand/40 transition-all duration-300 mb-3`}
                >
                  {isLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  ) : profile.icon === "crown" || isVip ? (
                    <Crown className="w-10 h-10 drop-shadow" />
                  ) : profile.icon === "sparkles" ? (
                    <Sparkles className="w-10 h-10 drop-shadow" />
                  ) : (
                    <Tv className="w-10 h-10 drop-shadow" />
                  )}

                  {isVip && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                      VIP
                    </span>
                  )}
                </div>

                {/* Profile Name & Details */}
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-brand transition-colors line-clamp-1">
                  {profile.name}
                </h3>
                <span className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-full font-mono">
                  {profile.username}
                </span>

                {isLoading && (
                  <span className="text-[10px] text-brand font-semibold mt-1 animate-pulse">
                    Giriş yapılıyor...
                  </span>
                )}
              </button>
            );
          })}

          {/* Add Profile Card */}
          <button
            onClick={() => setIsProfileManagerOpen(true)}
            className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-brand/70 bg-zinc-900/30 hover:bg-zinc-800/40 transition-all duration-300 hover:scale-105 cursor-pointer text-center min-h-[160px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 group-hover:bg-brand/20 border border-zinc-700 group-hover:border-brand/40 flex items-center justify-center text-zinc-400 group-hover:text-brand transition-all mb-3">
              <Plus className="w-7 h-7" />
            </div>
            <span className="font-semibold text-xs sm:text-sm text-zinc-300 group-hover:text-white">
              Yeni Profil Ekle
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5">
              Xtream Hesabı Tanımla
            </span>
          </button>
        </div>

        {/* Management & Manual Toggle Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsProfileManagerOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-zinc-600 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Settings className="w-4 h-4 text-brand" />
            <span>IPTV Profillerini Yönet</span>
          </button>

          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Farklı Bir Hesapla Manuel Giriş</span>
            {showManualForm ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Collapsible Manual Form */}
        {showManualForm && (
          <div className="w-full max-w-md mt-6 glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand" />
                Manuel Xtream Girişi
              </h2>
              <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                Xtream Codes
              </span>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Server URL (Port Dahil)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Server className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="http://iptv-server.com:8080"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Kullanıcı Adı (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Şifre (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-dark-elevated border-dark-border text-brand"
                  />
                  <span>Beni Hatırla</span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={useDirectMode}
                    onChange={(e) => setUseDirectMode(e.target.checked)}
                    className="w-3.5 h-3.5 rounded mt-0.5 bg-dark-elevated border-dark-border text-brand"
                  />
                  <span className="flex flex-col">
                    <span className="text-zinc-300">Doğrudan Bağlantı (Direct Client)</span>
                    <span className="text-[10px] text-zinc-500">
                      Vercel proxy&apos;sini atlar (CORS eklentisi gerektirir).
                    </span>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isManualLoading}
                className="w-full py-2.5 bg-gradient-to-r from-brand to-rose-600 hover:from-rose-600 hover:to-brand text-white font-semibold rounded-xl text-xs shadow-md shadow-brand/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isManualLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Bağlanılıyor...</span>
                  </>
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
