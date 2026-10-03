"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Calendar, User, Clock, Film, Play, VolumeX, Activity, Copy, Check, Terminal } from "lucide-react";
import Hls from "hls.js";
import { Project } from "@/types/project";
import { CustomControls } from "./CustomControls";

interface VideoModalProps {
  project: Project | null;
  onClose: () => void;
}

interface TelemetryLog {
  id: number;
  time: string;
  tag: string;
  msg: string;
  type: "info" | "success" | "warn" | "error";
}

interface TelemetryState {
  streamUrl: string;
  streamVariant: string;
  deviceType: string;
  viewport: string;
  bufferAhead: number;
  droppedFrames: number;
  totalFrames: number;
  segmentsLoaded: number;
  bandwidthMbps: number;
  hlsState: string;
  logs: TelemetryLog[];
}

export function VideoModal({ project, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  const [telemetry, setTelemetry] = useState<TelemetryState>({
    streamUrl: "",
    streamVariant: "",
    deviceType: "",
    viewport: "",
    bufferAhead: 0,
    droppedFrames: 0,
    totalFrames: 0,
    segmentsLoaded: 0,
    bandwidthMbps: 0,
    hlsState: "Iniciando...",
    logs: [],
  });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Centralized telemetry and console logger
  const addLog = useCallback(
    (
      tag: string,
      msg: string,
      type: "info" | "success" | "warn" | "error" = "info"
    ) => {
      const now = new Date();
      const time = now.toLocaleTimeString("es-ES", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      const fullTime = `${time}.${ms}`;

      // Styled browser console output for instant devtools inspection
      const style =
        type === "error"
          ? "color: #f87171; font-weight: bold;"
          : type === "warn"
          ? "color: #fbbf24; font-weight: bold;"
          : type === "success"
          ? "color: #34d399; font-weight: bold;"
          : "color: #38bdf8;";

      console.log(`%c[LensPlayer ${fullTime}] [${tag}] ${msg}`, style);

      setTelemetry((prev) => ({
        ...prev,
        logs: [
          {
            id: Date.now() + Math.random(),
            time: fullTime,
            tag,
            msg,
            type,
          },
          ...prev.logs.slice(0, 39),
        ],
      }));
    },
    []
  );

  const handleCopyLogs = useCallback(() => {
    const text = telemetry.logs
      .slice()
      .reverse()
      .map((l) => `[${l.time}] [${l.tag}] ${l.msg}`)
      .join("\n");
    const summary = `=== LENS PRODUCCIONES - TELEMETRÍA DE REPRODUCCIÓN ===\nVideo: ${project?.title}\nDispositivo: ${telemetry.deviceType} (${telemetry.viewport})\nFlujo Activo: ${telemetry.streamUrl}\nBúfer disponible: ${telemetry.bufferAhead}s adelante\nCuadros Caídos: ${telemetry.droppedFrames} / ${telemetry.totalFrames}\nSegmentos descargados: ${telemetry.segmentsLoaded}\n\n=== REGISTRO DETALLADO DE EVENTOS ===\n${text}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    });
  }, [telemetry, project]);

  const handleWaiting = useCallback(() => {
    if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
    bufferTimeoutRef.current = setTimeout(() => {
      setIsBuffering(true);
      addLog(
        "BÚFER",
        `Esperando datos en ${(videoRef.current?.currentTime || 0).toFixed(1)}s`,
        "warn"
      );
    }, 200);
  }, [addLog]);

  const handlePlaying = useCallback(() => {
    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = null;
    }
    setIsPlaying(true);
    setIsBuffering(false);
    addLog(
      "REPRODUCCIÓN",
      `▶️ Reproduciendo video de forma fluida en ${(videoRef.current?.currentTime || 0).toFixed(1)}s`,
      "success"
    );
  }, [addLog]);

  // Auto-hide controls when user is inactive during playback
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  // Safe close handler that halts media playback instantly
  const handleClose = useCallback(() => {
    if (bufferTimeoutRef.current) {
      clearTimeout(bufferTimeoutRef.current);
      bufferTimeoutRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    onClose();
  }, [onClose]);

  // Lock body scroll and set up keyboard listeners
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, handleClose]);

  // Video time update listener & telemetry buffer health monitor
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (isBuffering && !videoRef.current.paused) {
        setIsBuffering(false);
      }

      // Calculate buffer ahead in seconds
      let ahead = 0;
      const buf = videoRef.current.buffered;
      for (let i = 0; i < buf.length; i++) {
        if (buf.start(i) <= cur && cur <= buf.end(i)) {
          ahead = buf.end(i) - cur;
          break;
        }
      }

      // Query dropped video frames from hardware decoder if supported
      const quality = (videoRef.current as any).getVideoPlaybackQuality?.();
      const dropped = quality ? quality.droppedVideoFrames : 0;
      const total = quality ? quality.totalVideoFrames : 0;

      setTelemetry((prev) => ({
        ...prev,
        bufferAhead: Number(ahead.toFixed(1)),
        droppedFrames: dropped,
        totalFrames: total,
      }));
    }
  };

  const attemptPlay = useCallback(() => {
    if (!videoRef.current) return;
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          setAudioBlocked(false);
          addLog("AUTOPLAY", "Autoplay exitoso con audio activado", "success");
        })
        .catch(() => {
          // Mobile autoplay policy blocked unmuted playback -> Fallback to muted playback
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            setAudioBlocked(true);
            addLog("AUTOPLAY", "Autoplay con audio bloqueado por el navegador -> Silenciando para reproducir", "warn");
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
              })
              .catch(() => {
                setIsPlaying(false);
                setIsBuffering(false);
                addLog("AUTOPLAY", "Autoplay completamente bloqueado por ahorro de batería del SO", "warn");
              });
          } else {
            setIsPlaying(false);
            setIsBuffering(false);
          }
        });
    }
  }, [addLog]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      addLog("METADATOS", `Metadatos cargados: duración ${videoRef.current.duration.toFixed(1)}s`, "info");
      attemptPlay();
    }
  };

  // Adaptive HLS (.m3u8) stream loader with intelligent device delivery, telemetry & fallback
  useEffect(() => {
    if (!project || !videoRef.current) return;
    const video = videoRef.current;
    const rawUrl = project.videoUrl;
    const isHls = rawUrl.endsWith(".m3u8");

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      // Intelligent device delivery:
      // Mobile devices receive hardware-friendly 720p fMP4 stream (prevents decoder stalls on Helio/Exynos/Snapdragon mid-range chips).
      // Desktops receive full pristine 1080p master quality.
      const isMobile =
        typeof window !== "undefined" &&
        (window.innerWidth < 768 ||
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ));
      const targetVariant = isMobile ? "720p.m3u8" : "1080p.m3u8";
      const streamUrl = rawUrl.includes("/videos/hls/")
        ? rawUrl.replace(/[^/]+\.m3u8$/, targetVariant)
        : rawUrl;

      const devType = isMobile ? "Móvil (Optimizado 720p)" : "Escritorio (Master 1080p)";
      const vp = typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "";

      setTelemetry((prev) => ({
        ...prev,
        streamUrl,
        streamVariant: targetVariant,
        deviceType: devType,
        viewport: vp,
        hlsState: "Iniciando...",
      }));

      addLog("DISPOSITIVO", `${devType} | Pantalla: ${vp}`, "info");
      addLog("PROYECTO", `Cargando: "${project.title}"`, "info");
      addLog("STREAM", `URL Seleccionada: ${streamUrl}`, "info");

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 60,
          maxMaxBufferLength: 120,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
          highBufferWatchdogPeriod: 2,
          nudgeMaxRetry: 5,
          nudgeOffset: 0.1,
          startFragPrefetch: true,
        });
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_LOADED, (_event, data) => {
          addLog("MANIFEST", `Manifiesto cargado (${data.levels.length} calidad/es detectada/s)`, "success");
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const lvl = data.levels[0];
          const res = lvl ? `${lvl.width}x${lvl.height}` : targetVariant;
          setTelemetry((prev) => ({ ...prev, hlsState: "Listo para reproducir" }));
          addLog("PARSER", `Flujo preparado: ${res} a ~${Math.round((lvl?.bitrate || 1200000) / 1000)} kbps`, "success");
          attemptPlay();
        });

        hls.on(Hls.Events.FRAG_LOADING, (_event, data) => {
          const fragName = data.frag.relurl || `frag_${data.frag.sn}`;
          addLog("CARGA", `Descargando: ${fragName}...`, "info");
        });

        hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
          const fragName = data.frag.relurl || `frag_${data.frag.sn}`;
          const dur = data.frag.duration.toFixed(1);
          const kb = (data.frag.stats.total / 1024).toFixed(0);
          const loadMs = Math.max(1, Math.round(data.frag.stats.loading.end - data.frag.stats.loading.start));
          const speedMbps = ((data.frag.stats.total * 8) / (loadMs / 1000) / 1000000).toFixed(2);

          setTelemetry((prev) => ({
            ...prev,
            segmentsLoaded: prev.segmentsLoaded + 1,
            bandwidthMbps: Number(speedMbps),
          }));

          addLog("SEGMENTO", `✔ ${fragName} listo (${dur}s, ${kb} KB en ${loadMs}ms @ ${speedMbps} Mbps)`, "success");
        });

        hls.on(Hls.Events.BUFFER_APPENDED, () => {
          if (!video) return;
          const cur = video.currentTime;
          let ahead = 0;
          for (let i = 0; i < video.buffered.length; i++) {
            if (video.buffered.start(i) <= cur && cur <= video.buffered.end(i)) {
              ahead = video.buffered.end(i) - cur;
              break;
            }
          }
          setTelemetry((prev) => ({ ...prev, bufferAhead: Number(ahead.toFixed(1)) }));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          const isFatal = data.fatal;
          addLog(
            isFatal ? "ERROR_FATAL" : "HLS_AVISO",
            `${data.type}: ${data.details}`,
            isFatal ? "error" : "warn"
          );
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                addLog("RECUPERACIÓN", "Reintentando conexión de red...", "warn");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                addLog("RECUPERACIÓN", "Recuperando decodificador de medios...", "warn");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS for Safari iOS & macOS
        addLog("NATIVE_HLS", `Cargando HLS nativo en Safari: ${streamUrl}`, "info");
        video.src = streamUrl;
      }
    } else {
      addLog("DIRECT_MP4", `Cargando MP4 directo: ${rawUrl}`, "info");
      video.src = rawUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [project, attemptPlay, addLog]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioBlocked) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setAudioBlocked(false);
      }
      attemptPlay();
    }
  };

  const handleSeek = (newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      handleUserActivity();
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, handleUserActivity]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalles de ${project.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-2xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Modal Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-neutral-950 border border-white/15 rounded-2xl shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md z-30 transition-opacity duration-500 ${
            showControls || !isPlaying || showTelemetry ? "opacity-100" : "opacity-40 hover:opacity-100"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-mono tracking-widest uppercase text-neutral-400 truncate">
              {project.category} // {project.metadata?.client || "Lens Producciones"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live Telemetry / Logs Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTelemetry((v) => !v);
              }}
              title="Ver telemetría técnica y registro de logs en tiempo real"
              aria-label="Alternar telemetría y logs"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                showTelemetry
                  ? "bg-amber-400 text-black border-amber-300 font-semibold shadow-md shadow-amber-400/20"
                  : "bg-white/5 hover:bg-white/10 text-neutral-300 border-white/15"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">LOGS & STATS</span>
              <span className="xs:hidden">LOGS</span>
              {telemetry.bufferAhead > 0 && (
                <span className="hidden sm:inline text-[10px] opacity-75 font-normal">
                  ({telemetry.bufferAhead}s)
                </span>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Cerrar reproductor"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all transform hover:rotate-90 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Video on Top + Ficha descriptiva abajo */}
        <div className="overflow-y-auto flex-grow flex flex-col">
          {/* Main Video Player Frame (adapts to 16:9 landscape and 9:16 vertical) */}
          <div
            onMouseMove={handleUserActivity}
            onMouseEnter={handleUserActivity}
            onMouseLeave={() => {
              if (isPlaying) {
                setShowControls(false);
              }
            }}
            onTouchStart={handleUserActivity}
            className={`relative w-full h-[55vh] sm:h-[68vh] md:h-[75vh] max-h-[750px] bg-black flex items-center justify-center group/player overflow-hidden select-none ${
              !showControls && isPlaying ? "cursor-none" : "cursor-default"
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload="metadata"
              poster={project.thumbnailUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onPause={() => {
                if (bufferTimeoutRef.current) {
                  clearTimeout(bufferTimeoutRef.current);
                  bufferTimeoutRef.current = null;
                }
                setIsPlaying(false);
                setIsBuffering(false);
              }}
              onCanPlay={() => {
                if (bufferTimeoutRef.current) {
                  clearTimeout(bufferTimeoutRef.current);
                  bufferTimeoutRef.current = null;
                }
                setIsBuffering(false);
              }}
              onSeeking={() => {
                if (isPlaying) handleWaiting();
              }}
              onSeeked={() => {
                if (bufferTimeoutRef.current) {
                  clearTimeout(bufferTimeoutRef.current);
                  bufferTimeoutRef.current = null;
                }
                setIsBuffering(false);
              }}
              onClick={togglePlayPause}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Audio Blocked Toast for Mobile Autoplay */}
            {audioBlocked && isPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                    setAudioBlocked(false);
                  }
                }}
                className="absolute top-4 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/85 backdrop-blur-md border border-amber-400/60 text-xs font-semibold text-white shadow-2xl animate-pulse cursor-pointer"
              >
                <VolumeX className="w-4 h-4 text-amber-400" />
                <span>Toca para activar audio</span>
              </button>
            )}

            {/* Live Telemetry & Diagnostics Overlay */}
            {showTelemetry && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 left-3 right-3 sm:right-auto sm:w-[420px] max-h-[85%] z-40 flex flex-col bg-neutral-950/95 backdrop-blur-2xl border border-white/20 rounded-xl p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-xs font-mono text-neutral-200 select-text animate-fade-in"
              >
                {/* HUD Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-amber-400 tracking-wider">TELEMETRÍA EN VIVO</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCopyLogs}
                      title="Copiar logs al portapapeles"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-neutral-300 transition-colors cursor-pointer"
                    >
                      {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLogs ? "¡Copiado!" : "Copiar Logs"}</span>
                    </button>
                    <button
                      onClick={() => setShowTelemetry(false)}
                      className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      aria-label="Cerrar telemetría"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Flujo Activo</span>
                    <span className="font-semibold text-amber-300 truncate block mt-0.5">{telemetry.streamVariant || "Auto"}</span>
                    <span className="text-[9px] text-neutral-500 block truncate">{telemetry.streamUrl.replace("/videos/hls/", "")}</span>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Dispositivo</span>
                    <span className="font-semibold text-neutral-200 truncate block mt-0.5">{telemetry.deviceType || "N/A"}</span>
                    <span className="text-[9px] text-neutral-500 block">{telemetry.viewport}</span>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Búfer Precargado</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`font-semibold ${telemetry.bufferAhead >= 4 ? "text-emerald-400" : telemetry.bufferAhead >= 1 ? "text-amber-400" : "text-rose-400"}`}>
                        {telemetry.bufferAhead}s adelante
                      </span>
                    </div>
                    <span className="text-[9px] text-neutral-500 block">{isPlaying ? "En reproducción" : "Pausado"}</span>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Segmentos & Pérdida</span>
                    <span className={`font-semibold block mt-0.5 ${telemetry.droppedFrames === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {telemetry.droppedFrames} cuadros caídos
                    </span>
                    <span className="text-[9px] text-neutral-500 block">{telemetry.segmentsLoaded} segs descargados</span>
                  </div>
                </div>

                {/* Log Stream Terminal */}
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 px-0.5">
                  <span className="flex items-center gap-1 font-semibold text-neutral-300">
                    <Terminal className="w-3 h-3 text-amber-400" />
                    Consola de Eventos ({telemetry.logs.length})
                  </span>
                  <span>{telemetry.bandwidthMbps > 0 ? `${telemetry.bandwidthMbps} Mbps red` : ""}</span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-48 bg-black/70 rounded-lg p-2 border border-white/10 space-y-1 font-mono text-[10.5px]">
                  {telemetry.logs.length === 0 ? (
                    <div className="text-neutral-500 text-center py-4">Esperando eventos de reproducción...</div>
                  ) : (
                    telemetry.logs.map((log) => (
                      <div key={log.id} className="leading-tight break-words py-0.5 border-b border-white/5 last:border-none">
                        <span className="text-neutral-500 mr-1.5 text-[9.5px]">{log.time}</span>
                        <span
                          className={`font-semibold mr-1.5 px-1 py-0.5 rounded text-[9px] ${
                            log.type === "error"
                              ? "bg-rose-500/20 text-rose-400"
                              : log.type === "warn"
                              ? "bg-amber-500/20 text-amber-400"
                              : log.type === "success"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-sky-500/20 text-sky-400"
                          }`}
                        >
                          {log.tag}
                        </span>
                        <span className="text-neutral-300">{log.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Big Center Play Button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                aria-label="Reproducir video"
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer group/center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center transform transition-transform group-hover/center:scale-110 shadow-2xl">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white translate-x-0.5" />
                </div>
              </button>
            )}

            {/* Buffering Spinner: only show while actively playing and waiting for data */}
            {isPlaying && isBuffering && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px] pointer-events-none">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-amber-400 animate-spin" />
              </div>
            )}

            {/* Custom Video Controls bar with auto-hide fade */}
            <div
              className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-500 ease-in-out ${
                showControls || !isPlaying
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
              onMouseEnter={() => {
                if (controlsTimeoutRef.current) {
                  clearTimeout(controlsTimeoutRef.current);
                }
                setShowControls(true);
              }}
            >
              <CustomControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                isMuted={isMuted}
                isFullscreen={isFullscreen}
                onPlayPause={togglePlayPause}
                onSeek={handleSeek}
                onVolumeChange={handleVolumeChange}
                onToggleMute={toggleMute}
                onToggleFullscreen={toggleFullscreen}
                onRestart={handleRestart}
              />
            </div>
          </div>

          {/* Project Details Narrative Section */}
          <div className="p-6 sm:p-8 bg-neutral-900/40 flex flex-col md:flex-row gap-8 justify-between">
            {/* Left Column: Title & Narrative */}
            <div className="max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
                {project.description}
              </p>
            </div>

            {/* Right Column: Ficha Técnica */}
            <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-3 p-5 rounded-xl bg-neutral-950/80 border border-white/10 text-xs">
              <h3 className="font-semibold text-neutral-200 tracking-wider uppercase text-[11px] border-b border-white/10 pb-2">
                Ficha de Producción
              </h3>

              <div className="flex items-center gap-2.5 text-neutral-400">
                <User className="w-4 h-4 text-amber-400" />
                <span>Cliente:</span>
                <span className="text-white font-medium ml-auto">
                  {project.metadata?.client || "Original"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-400">
                <Film className="w-4 h-4 text-amber-400" />
                <span>Rol:</span>
                <span className="text-white font-medium ml-auto">
                  {project.metadata?.role || "Dirección & DP"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-400">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Año:</span>
                <span className="text-white font-medium ml-auto">
                  {project.metadata?.year || "2025"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Duración:</span>
                <span className="text-white font-mono ml-auto">
                  {project.metadata?.duration || "01:30"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
