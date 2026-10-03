"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { X, Calendar, User, Clock, Film } from "lucide-react";
import { Project } from "@/types/project";
import { CustomControls } from "./CustomControls";

interface VideoModalProps {
  project: Project | null;
  onClose: () => void;
}

export function VideoModal({ project, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Safe close handler that halts media playback instantly
  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
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
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60 backdrop-blur-md z-30">
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
          {/* Main Video Player Frame */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center group/player">
            <video
              ref={videoRef}
              playsInline
              preload="auto"
              poster={project.thumbnailUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlayPause}
              className="w-full h-full object-contain cursor-pointer"
            >
              <source src={project.videoUrl} type="video/mp4" />
            </video>

            {/* Custom Video Controls bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30">
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
