"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { Project } from "@/types/project";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface VideoCardProps {
  project: Project;
  onSelectProject: (project: Project) => void;
  priority?: boolean;
}

export function VideoCard({
  project,
  onSelectProject,
  priority = false,
}: VideoCardProps) {
  const { elementRef, isVisible } = useIntersectionObserver({
    rootMargin: "150px",
    freezeOnceVisible: true,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handle pointer enter with debounce
  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && isVisible) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser autoplay restrictions handled gracefully
            setIsPlaying(false);
          });
      }
    }, 100);
  };

  // Handle pointer leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    onSelectProject(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectProject(project);
    }
  };

  return (
    <div
      ref={elementRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col bg-surface rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/80 focus:ring-offset-2 focus:ring-offset-background"
    >
      {/* Video / Poster Media Container (16:9 ratio) */}
      <div className="relative w-full aspect-video overflow-hidden bg-neutral-950">
        {/* Static Poster Image */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-10 ${
            isPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            loading={priority ? "eager" : "lazy"}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>

        {/* Lazy Loaded Preview Video */}
        {(isVisible || priority) && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={project.thumbnailUrl}
            onLoadedData={() => setVideoLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ease-in-out ${
              isPlaying ? "opacity-100 z-20" : "opacity-0 pointer-events-none"
            }`}
          >
            <source src={project.videoUrl} type="video/mp4" />
          </video>
        )}

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/15 text-neutral-200">
            {project.category}
          </span>
          {project.featured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Destacado
            </span>
          )}
        </div>

        {/* Hover Center Indicator */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 shadow-2xl">
            <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Duration / Role Tag at bottom right of thumbnail */}
        {project.metadata?.duration && (
          <div className="absolute bottom-3 right-3 z-30 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-black/70 backdrop-blur-sm text-neutral-300 border border-white/10">
            {project.metadata.duration}
          </div>
        )}
      </div>

      {/* Project Card Info */}
      <div className="p-5 flex flex-col flex-grow justify-between bg-neutral-900/60 backdrop-blur-sm">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1">
            {project.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed font-light">
            {project.description}
          </p>
        </div>

        {/* Footer info metadata */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>{project.metadata?.client || "Producción Original"}</span>
          <span>{project.metadata?.year || "2025"}</span>
        </div>
      </div>
    </div>
  );
}
