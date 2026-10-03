"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Calendar, User, Clock, Film, Play, VolumeX } from "lucide-react";
import Hls from "hls.js";
import { Project } from "@/types/project";
import { CustomControls } from "./CustomControls";

interface VideoModalProps {
  project: Project | null;
  onClose: () => void;
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
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Video time update listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (isBuffering && !videoRef.current.paused) {
        setIsBuffering(false);
      }
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
        })
        .catch(() => {
          // Mobile autoplay policy blocked unmuted playback -> Fallback to muted playback
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            setAudioBlocked(true);
            videoRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsBuffering(false);
              })
              .catch(() => {
                // Autoplay blocked completely by mobile OS battery saver / policy
                setIsPlaying(false);
                setIsBuffering(false);
              });
          } else {
            setIsPlaying(false);
            setIsBuffering(false);
          }
        });
    }
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      attemptPlay();
    }
  };

  // Adaptive HLS (.m3u8) stream loader with seamless fallback
  useEffect(() => {
    if (!project || !videoRef.current) return;
    const video = videoRef.current;
    const url = project.videoUrl;
    const isHls = url.endsWith(".m3u8");

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000,
          startLevel: -1,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          attemptPlay();
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
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
        video.src = url;
      }
    } else {
      video.src = url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [project, attemptPlay]);

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
          className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md z-30 transition-opacity duration-500 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-40 hover:opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-neutral-400">
              {project.category} // {project.metadata?.client || "Lens Producciones"}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            aria-label="Cerrar reproductor"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all transform hover:rotate-90 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <X className="w-5 h-5" />
          </button>
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
              onWaiting={() => {
                if (isPlaying) setIsBuffering(true);
              }}
              onPlaying={() => {
                setIsPlaying(true);
                setIsBuffering(false);
              }}
              onPause={() => {
                setIsPlaying(false);
                setIsBuffering(false);
              }}
              onCanPlay={() => setIsBuffering(false)}
              onSeeking={() => {
                if (isPlaying) setIsBuffering(true);
              }}
              onSeeked={() => setIsBuffering(false)}
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
