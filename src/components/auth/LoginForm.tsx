"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Play, Tv, ShieldCheck, AlertCircle, Sparkles, Server, User, KeyRound, Loader2 } from "lucide-react";

export function LoginForm() {
  const { login } = useApp();

  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [useDirectMode, setUseDirectMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login({
        serverUrl: "https://demo.playpulse.tv",
        username: "demo",
        password: "demo_password",
      });
    } catch (err: any) {
      setErrorMessage("Demo hesabına bağlanırken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-dark-bg">
      {/* Background ambient lighting effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-800/10 blur-[150px] pointer-events-none" />

      {/* Decorative subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10 animate-fade-in">
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
          <p className="text-xs sm:text-sm text-zinc-400">
            Yeni Nesil IPTV, Canlı TV, Sinema ve Dizi Deneyimi
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand" />
              Giriş Yap
            </h2>
            <span className="text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-zinc-700/50">
              Xtream Codes API
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 flex flex-col gap-2 text-red-200 text-sm animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {(errorMessage.includes("engelliyor") || errorMessage.includes("Failed to fetch") || errorMessage.includes("bağlanılamadı")) && (
                <div className="text-xs text-zinc-400 pl-8 pt-1 border-t border-red-800/30">
                  💡 <strong>İpucu:</strong> Birçok IPTV sağlayıcısı yurtdışı bulut (AWS/Vercel) sunucularını engeller. Sağlayıcınızın <code className="text-zinc-300">https://</code> adresi varsa onu deneyebilir veya yerel ağınızdan (localhost) kesintisiz kullanabilirsiniz.
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server URL */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Server URL (Port Dahil)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Server className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="http://iptv-server.com:8080"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Kullanıcı Adı (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="kullanici_adiniz"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Şifre (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-dark-border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-dark-elevated border-dark-border text-brand focus:ring-brand focus:ring-offset-0 focus:ring-0"
                />
                <span>Beni Hatırla</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200">
                <input
                  type="checkbox"
                  checked={useDirectMode}
                  onChange={(e) => setUseDirectMode(e.target.checked)}
                  className="w-4 h-4 rounded mt-0.5 bg-dark-elevated border-dark-border text-brand focus:ring-brand focus:ring-offset-0 focus:ring-0"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-zinc-300">Doğrudan Bağlantı Modu (Direct Client)</span>
                  <span className="text-[10px] text-zinc-500">
                    Vercel bulut proxy&apos;sini atlar. (Tarayıcıda &quot;Allow CORS&quot; eklentisi veya yerel ağ için önerilir)
                  </span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-brand to-rose-600 hover:from-rose-600 hover:to-brand text-white font-semibold rounded-xl shadow-lg shadow-brand/30 hover:shadow-brand/50 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Giriş Yap ve Başla</span>
                  <Play className="w-4 h-4 fill-white" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <span className="relative px-3 bg-dark-surface text-xs text-zinc-500 uppercase tracking-wider">
              veya
            </span>
          </div>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 font-medium rounded-xl border border-zinc-700/60 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>IPTV Aboneliğim Yok, Demo Modu ile Dene</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-zinc-500">
          PlayPulse PWA • Doğrudan Xtream Codes Sunucunuz ile Güvenli Bağlantı
        </div>
      </div>
    </div>
  );
}
