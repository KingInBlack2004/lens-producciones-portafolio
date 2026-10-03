"use client";

import React from "react";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface CustomControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onRestart: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function CustomControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onRestart,
}: CustomControlsProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    onSeek(newTime);
  };

  return (
    <div className="w-full flex flex-col gap-2 p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent backdrop-blur-md rounded-b-2xl border-t border-white/10 transition-opacity duration-300">
      {/* Timeline Scrubber */}
      <div className="relative group/timeline w-full flex items-center">
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progressPercent || 0}
          onChange={handleScrubberChange}
          aria-label="Línea de tiempo del video"
          className="w-full h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-white transition-all group-hover/timeline:h-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        {/* Visual progress bar highlight */}
        <div
          className="absolute left-0 h-1.5 bg-amber-400 rounded-lg pointer-events-none group-hover/timeline:h-2.5 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Control buttons & metadata */}
      <div className="flex items-center justify-between gap-4 mt-1 text-neutral-300">
        {/* Left Actions: Play/Pause, Restart, Time */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
            className="p-2 rounded-full hover:bg-white/15 text-white transition-colors focus:outline-none"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onRestart}
            aria-label="Reiniciar video"
            className="p-2 rounded-full hover:bg-white/15 text-neutral-400 hover:text-white transition-colors focus:outline-none hidden sm:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs font-mono text-neutral-400 select-none">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Actions: Volume & Fullscreen */}
        <div className="flex items-center gap-4">
          {/* Volume Control */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? "Activar sonido" : "Silenciar sonido"}
              className="p-1.5 rounded-full hover:bg-white/15 text-neutral-300 hover:text-white transition-colors focus:outline-none"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-red-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Control de volumen"
              className="w-16 sm:w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white transition-all focus:outline-none"
            />
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            aria-label={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
            className="p-2 rounded-full hover:bg-white/15 text-neutral-300 hover:text-white transition-colors focus:outline-none"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
