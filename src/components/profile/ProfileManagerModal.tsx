"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { XtreamProfile } from "@/types/iptv";
import {
  X,
  Server,
  User,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
  Crown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

const AVATAR_COLORS = [
  { name: "Mor & Pembe", value: "from-purple-600 via-pink-600 to-rose-600" },
  { name: "Zümrüt Yeşili", value: "from-emerald-500 to-teal-700" },
  { name: "Okyanus Mavisi", value: "from-blue-600 to-cyan-500" },
  { name: "Ateş Kırmızısı", value: "from-rose-600 to-amber-600" },
  { name: "Altın Sarısı", value: "from-amber-500 to-yellow-600" },
  { name: "Gece Mavisi", value: "from-indigo-600 to-slate-900" },
];

export function ProfileManagerModal() {
  const {
    isProfileManagerOpen,
    setIsProfileManagerOpen,
    profiles,
    activeProfile,
    selectProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    testProfileConnection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connectionMode, setConnectionMode] = useState<"proxy" | "direct">("proxy");
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].value);

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    profileId?: string;
    success: boolean;
    message: string;
  } | null>(null);

  if (!isProfileManagerOpen) return null;

  const resetForm = () => {
    setName("");
    setServerUrl("");
    setUsername("");
    setPassword("");
    setConnectionMode("proxy");
    setSelectedColor(AVATAR_COLORS[0].value);
    setEditingProfileId(null);
    setTestResult(null);
  };

  const handleOpenEdit = (profile: XtreamProfile) => {
    setEditingProfileId(profile.id);
    setName(profile.name);
    setServerUrl(profile.serverUrl);
    setUsername(profile.username);
    setPassword(profile.password);
    setConnectionMode(profile.connectionMode || "proxy");
    setSelectedColor(profile.color || AVATAR_COLORS[0].value);
    setTestResult(null);
    setActiveTab("create");
  };

  const handleTestConnection = async (profileId?: string) => {
    let cleanUrl = serverUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `http://${cleanUrl}`;
    }

    if (!cleanUrl || !username.trim() || !password.trim()) {
      setTestResult({
        profileId,
        success: false,
        message: "Lütfen Server URL, kullanıcı adı ve şifreyi eksiksiz doldurun.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testProfileConnection({
        serverUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        connectionMode,
      });

      const expDate = res.user_info.exp_date
        ? new Date(parseInt(res.user_info.exp_date, 10) * 1000).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Süresiz";

      setTestResult({
        profileId,
        success: true,
        message: `Bağlantı Başarılı! Durum: ${res.user_info.status} | Bitiş: ${expDate} | Maks Bağlantı: ${res.user_info.max_connections || 1}`,
      });
    } catch (err: any) {
      setTestResult({
        profileId,
        success: false,
        message: err?.message || "Sunucuya bağlanılamadı.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let cleanUrl = serverUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `http://${cleanUrl}`;
    }

    if (!name.trim() || !cleanUrl || !username.trim() || !password.trim()) {
      return;
    }

    if (editingProfileId) {
      updateProfile(editingProfileId, {
        name: name.trim(),
        serverUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        connectionMode,
        color: selectedColor,
      });
    } else {
      await addProfile({
        name: name.trim(),
        serverUrl: cleanUrl,
        username: username.trim(),
        password: password.trim(),
        connectionMode,
        color: selectedColor,
        icon: "tv",
      });
    }

    resetForm();
    setActiveTab("list");
  };

  const handleTestExistingProfile = async (profile: XtreamProfile) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testProfileConnection({
        serverUrl: profile.serverUrl,
        username: profile.username,
        password: profile.password,
        connectionMode: profile.connectionMode,
      });

      const expDate = res.user_info.exp_date
        ? new Date(parseInt(res.user_info.exp_date, 10) * 1000).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Süresiz";

      setTestResult({
        profileId: profile.id,
        success: true,
        message: `Aktif (Bitiş: ${expDate})`,
      });
    } catch (err: any) {
      setTestResult({
        profileId: profile.id,
        success: false,
        message: err?.message || "Bağlantı hatası",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-dark-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between bg-dark-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-rose-600 flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">IPTV Hesap Yönetimi & Profiller</h2>
              <p className="text-xs text-zinc-400">
                Birden fazla Xtream Codes hesabı ekleyin, test edin ve anında profil değiştirin.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsProfileManagerOpen(false);
              resetForm();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 px-6 bg-zinc-900/50">
          <button
            onClick={() => {
              setActiveTab("list");
              resetForm();
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "list"
                ? "border-brand text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Kayıtlı Profiller ({profiles.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("create");
              if (!editingProfileId) resetForm();
            }}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "create"
                ? "border-brand text-white font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingProfileId ? "Profili Düzenle" : "Yeni Xtream Hesabı Ekle"}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === "list" ? (
            <div className="space-y-3.5">
              {profiles.map((profile) => {
                const isActive = activeProfile?.id === profile.id;
                const isTestingThis = isTesting && testResult?.profileId === profile.id;
                const resultThis = testResult?.profileId === profile.id ? testResult : null;

                return (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-brand/10 border-brand/50 shadow-md shadow-brand/10"
                        : "bg-dark-elevated border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${
                            profile.color || "from-purple-600 to-rose-600"
                          } flex items-center justify-center text-white shadow-md shrink-0`}
                        >
                          {profile.icon === "crown" ? (
                            <Crown className="w-6 h-6" />
                          ) : profile.icon === "sparkles" ? (
                            <Sparkles className="w-6 h-6" />
                          ) : (
                            <Tv className="w-6 h-6" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-base">{profile.name}</h3>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Aktif Profil
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                            <span className="font-mono text-zinc-300">{profile.username}</span>
                            <span>•</span>
                            <span className="truncate max-w-[200px] text-zinc-400">
                              {profile.serverUrl}
                            </span>
                            <span>•</span>
                            <span className="text-zinc-500 uppercase text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">
                              {profile.connectionMode === "direct" ? "Direct" : "Proxy"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleTestExistingProfile(profile)}
                          disabled={isTesting}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-700/60"
                          title="Sunucu bağlantısını test et"
                        >
                          {isTestingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>Test Et</span>
                        </button>

                        {!isActive && (
                          <button
                            onClick={() => {
                              selectProfile(profile);
                              setIsProfileManagerOpen(false);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand hover:bg-brand-hover text-white transition-all cursor-pointer shadow-sm shadow-brand/20"
                          >
                            Kullan
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(profile)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {profiles.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`"${profile.name}" profilini silmek istediğinize emin misiniz?`)) {
                                deleteProfile(profile.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
                            title="Profili Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Result banner if tested */}
                    {resultThis && (
                      <div
                        className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                          resultThis.success
                            ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300"
                            : "bg-red-950/60 border border-red-800/60 text-red-300"
                        }`}
                      >
                        {resultThis.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <span>{resultThis.message}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Create / Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              {/* Profile Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Profil Adı (Örn: PlayPulse VIP, Spor Paketi, Salon TV)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Profil Adı"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-elevated border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                />
              </div>

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
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                  />
                </div>
              </div>

              {/* Username & Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="Kullanıcı Adı"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>

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
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-elevated border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Connection Mode */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Bağlantı Modu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConnectionMode("proxy")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      connectionMode === "proxy"
                        ? "bg-brand/15 border-brand text-white"
                        : "bg-dark-elevated border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Proxy Modu (Önerilen)</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      CORS ve Mixed-Content engellerini otomatik aşar.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConnectionMode("direct")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      connectionMode === "direct"
                        ? "bg-brand/15 border-brand text-white"
                        : "bg-dark-elevated border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Doğrudan İstemci (Direct)</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Tarayıcıdan doğrudan bağlanır (CORS eklentisi gerektirir).
                    </div>
                  </button>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Profil Avatar Rengi
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${color.value} transition-all cursor-pointer flex items-center justify-center ${
                        selectedColor === color.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      title={color.name}
                    >
                      {selectedColor === color.value && (
                        <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Connection Banner */}
              {testResult && !testResult.profileId && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in ${
                    testResult.success
                      ? "bg-emerald-950/60 border border-emerald-800/60 text-emerald-300"
                      : "bg-red-950/60 border border-red-800/60 text-red-300"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleTestConnection()}
                  disabled={isTesting}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Bağlantıyı Test Et</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab("list");
                    }}
                    className="px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-brand to-rose-600 hover:from-rose-600 hover:to-brand text-white rounded-xl text-xs font-bold shadow-lg shadow-brand/30 transition-all cursor-pointer"
                  >
                    {editingProfileId ? "Güncellemeleri Kaydet" : "Profili Ekle ve Kaydet"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
