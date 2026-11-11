"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";
import { NextEpisodeCountdown } from "./NextEpisodeCountdown";

export function VideoPlayerModal() {
  const { playingMedia, closePlayer, watchProgress, updateWatchProgress, playMedia } = useApp();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [showNextEpisodeModal, setShowNextEpisodeModal] = useState<boolean>(false);
  const [nextModalDismissed, setNextModalDismissed] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressSaveRef = useRef<number>(0);

  // Resume check
  const savedProgress = playingMedia ? watchProgress[playingMedia.id] : null;

  // Initialize playback
  useEffect(() => {
    if (!playingMedia || !videoRef.current) return;

    const video = videoRef.current;
    setPlaybackError(null);
    setIsBuffering(true);
    setShowNextEpisodeModal(false);
    setNextModalDismissed(false);

    let streamUrl = playingMedia.streamUrl;

    // Destroy existing HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = streamUrl.includes(".m3u8") || playingMedia.type === "live";

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        if (savedProgress && savedProgress.currentTime > 5 && savedProgress.progressPercentage < 95) {
          video.currentTime = savedProgress.currentTime;
        }
        video.play().then(() => setIsPlaying(true)).catch((err) => {
          if (err.name === "NotAllowedError") {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          } else {
            setIsPlaying(false);
          }
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("HLS fatal network error, trying recoverMediaError");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS fatal media error, recovering");
              hls.recoverMediaError();
              break;
            default:
              setPlaybackError("Canlı yayın akışı yüklenirken bir hata oluştu.");
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Direct stream (MP4, MKV, TS, Safari Native HLS)
      video.src = streamUrl;
      video.load();

      const startPlayback = () => {
        setIsBuffering(false);
        if (savedProgress && savedProgress.currentTime > 5 && savedProgress.progressPercentage < 95) {
          video.currentTime = savedProgress.currentTime;
        }
        const promise = video.play();
        if (promise !== undefined) {
          promise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              if (err.name === "NotAllowedError") {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              } else {
                setIsPlaying(false);
              }
            });
        }
      };

      const onError = () => {
        setIsBuffering(false);
        setIsPlaying(false);
        const err = video.error;
        let msg = "Video yüklenirken veya oynatılırken bir hata oluştu.";
        if (err) {
          if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
            msg = "Bu içerik formatı (MKV/AC3) tarayıcınız tarafından doğrudan desteklenmiyor. Aşağıdaki butonla bağlantıyı kopyalayarak VLC Player veya harici oynatıcıda izleyebilirsiniz.";
          } else if (err.code === MediaError.MEDIA_ERR_NETWORK) {
            msg = "Ağ bağlantı hatası: Sunucu yayını yanıt vermedi.";
          }
        }
        setPlaybackError(msg);
      };

      video.addEventListener("canplay", startPlayback, { once: true });
      video.addEventListener("loadeddata", startPlayback, { once: true });
      video.addEventListener("error", onError);

      return () => {
        video.removeEventListener("canplay", startPlayback);
        video.removeEventListener("loadeddata", startPlayback);
        video.removeEventListener("error", onError);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playingMedia]);

  // Handle Controls Timeout on mouse movement
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // Video Events
  const handleTimeUpdate = () => {
    if (!videoRef.current || !playingMedia) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 0;

    setCurrentTime(current);
    setDuration(total);

    // Save progress every 4 seconds for movies and series
    const now = Date.now();
    if (playingMedia.type !== "live" && total > 0 && now - lastProgressSaveRef.current > 4000) {
      lastProgressSaveRef.current = now;
      const percentage = (current / total) * 100;
      updateWatchProgress({
        id: playingMedia.id,
        contentId: playingMedia.contentId,
        type: playingMedia.type,
        title: playingMedia.title,
        subtitle: playingMedia.subtitle,
        poster: playingMedia.poster || "",
        streamUrl: playingMedia.streamUrl,
        currentTime: current,
        duration: total,
        progressPercentage: percentage,
        seriesId: playingMedia.seriesId,
        seasonNum: playingMedia.seasonNum,
        episodeNum: playingMedia.episodeNum,
        episodeId: playingMedia.episodeId,
      });
    }

    // Trigger Next Episode countdown if series, has next episode, and <= 15s remaining
    if (
      playingMedia.type === "series" &&
      playingMedia.nextEpisode &&
      total > 30 &&
      total - current <= 15 &&
      !nextModalDismissed &&
      !showNextEpisodeModal
    ) {
      setShowNextEpisodeModal(true);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn("Play error:", e);
      });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const targetTime = parseFloat(e.target.value);
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.5;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleCopyUrl = () => {
    if (!playingMedia) return;
    navigator.clipboard.writeText(playingMedia.streamUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handlePlayNextEpisode = () => {
    if (!playingMedia || !playingMedia.nextEpisode) return;
    const next = playingMedia.nextEpisode;
    playMedia({
      id: `series-${playingMedia.seriesId}-s${next.seasonNum}-e${next.episodeNum}`,
      title: playingMedia.title,
      subtitle: `${next.seasonNum}. Sezon ${next.episodeNum}. Bölüm`,
      poster: next.poster || playingMedia.poster,
      streamUrl: next.streamUrl,
      type: "series",
      contentId: playingMedia.contentId,
      seriesId: playingMedia.seriesId,
      seasonNum: next.seasonNum,
      episodeNum: next.episodeNum,
      episodeId: next.episodeId,
    });
  };

  if (!playingMedia) return null;

  const isLive = playingMedia.type === "live";

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={handlePlayPause}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onTimeUpdate={handleTimeUpdate}
        autoPlay
        playsInline
      />

      {/* Buffering Spinner */}
      {isBuffering && !playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-xs">
          <Loader2 className="w-14 h-14 text-brand animate-spin drop-shadow-[0_0_15px_rgba(229,9,20,0.9)]" />
          <span className="text-xs text-zinc-300 mt-3 font-semibold tracking-wide">Yükleniyor...</span>
        </div>
      )}

      {/* Playback Error Screen */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 text-center p-6 z-30">
          <AlertCircle className="w-14 h-14 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Yayın Başlatılamadı</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
            {playbackError}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (videoRef.current) {
                  setPlaybackError(null);
                  setIsBuffering(true);
                  videoRef.current.load();
                  videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                }
              }}
              className="px-5 py-2.5 bg-brand hover:bg-brand-600 text-white rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-lg shadow-brand/40 active:scale-95 transition-all"
            >
              Yeniden Dene
            </button>

            <button
              onClick={handleCopyUrl}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs sm:text-sm font-medium cursor-pointer border border-white/10 flex items-center gap-2 active:scale-95 transition-all"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? "Kopyalandı!" : "Yayın URL Kopyala"}</span>
            </button>

            <a
              href={`vlc://${playingMedia.streamUrl}`}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs sm:text-sm font-medium cursor-pointer border border-white/10 flex items-center gap-2 active:scale-95 transition-all"
            >
              <ExternalLink className="w-4 h-4 text-brand" />
              <span>VLC ile Aç</span>
            </a>

            <button
              onClick={closePlayer}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              Geri Dön
            </button>
          </div>
        </div>
      )}

      {/* Next Episode Countdown Overlay */}
      {showNextEpisodeModal && playingMedia.nextEpisode && (
        <NextEpisodeCountdown
          nextEpisode={playingMedia.nextEpisode}
          onPlayNext={handlePlayNextEpisode}
          onCancel={() => {
            setShowNextEpisodeModal(false);
            setNextModalDismissed(true);
          }}
          countdownSeconds={15}
        />
      )}

      {/* Floating Unmute Banner if video started muted */}
      {isMuted && isPlaying && !playbackError && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-30 py-2 px-4 rounded-full bg-brand/95 hover:bg-brand text-white text-xs font-bold flex items-center gap-2 shadow-2xl shadow-brand/70 animate-bounce cursor-pointer border border-white/20 active:scale-95"
        >
          <VolumeX className="w-4 h-4" />
          <span>Sesi Açmak İçin Dokunun</span>
        </button>
      )}

      {/* Top Header Controls (Back, Title, Live tag, VLC link) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 z-10 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={closePlayer}
            className="p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
            title="Kapat (ESC)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {playingMedia.title}
              </h2>
              {isLive && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  CANLI
                </span>
              )}
            </div>
            {playingMedia.subtitle && (
              <p className="text-xs text-zinc-300 mt-0.5">{playingMedia.subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Header items */}
        <div className="flex items-center gap-2">
          <a
            href={`vlc://${playingMedia.streamUrl}`}
            className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
            title="Bu filmi VLC Player ile açın"
          >
            <ExternalLink className="w-3.5 h-3.5 text-brand" />
            <span className="hidden sm:inline">VLC ile Aç</span>
          </a>
        </div>
      </div>

      {/* Center Big Play/Pause icon feedback on click */}
      {!isPlaying && !isBuffering && !playbackError && (
        <div
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand/95 hover:bg-brand text-white flex items-center justify-center shadow-2xl shadow-brand/70 scale-100 hover:scale-110 active:scale-95 transition-all">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-10 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Bar (VOD / Series) */}
        {!isLive && (
          <div className="mb-3 flex items-center gap-3 text-xs text-zinc-400">
            <span className="w-12 text-right font-mono text-zinc-200">
              {formatSecondsToTime(currentTime)}
            </span>
            <div className="relative flex-1 group py-2 cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-zinc-700/80 rounded-lg accent-brand cursor-pointer focus:outline-none"
              />
            </div>
            <span className="w-12 font-mono text-zinc-400">
              {formatSecondsToTime(duration)}
            </span>
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Play / Pause */}
            <button
              onClick={handlePlayPause}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-brand text-white transition-all cursor-pointer active:scale-95"
              title={isPlaying ? "Duraklat" : "Oynat"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* Skip 10s Backward & Forward (VOD only) */}
            {!isLive && (
              <>
                <button
                  onClick={() => handleSkip(-10)}
                  className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="10 Saniye Geri"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSkip(10)}
                  className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="10 Saniye İleri"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={toggleMute}
                className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-zinc-700 rounded cursor-pointer accent-brand hidden sm:block"
              />
            </div>
          </div>

          {/* Right side controls (Fullscreen) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
