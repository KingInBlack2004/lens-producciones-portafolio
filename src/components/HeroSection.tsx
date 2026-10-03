"use client";

import React, { useRef, useEffect } from "react";
import { ChevronDown, Play, VolumeX } from "lucide-react";

interface HeroSectionProps {
  onExploreClick?: () => void;
  isPaused?: boolean;
}

export function HeroSection({ onExploreClick, isPaused = false }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isPaused) {
      videoRef.current.pause();
    } else {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, [isPaused]);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.muted = true;
    video.defaultMuted = true;

    // Pause video when scrolled out of view to free hardware decoder & GPU for portfolio videos
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isPaused) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, [isPaused]);

  const handleVideoEnded = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleScrollDown = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const portfolio = document.getElementById("portfolio");
      if (portfolio) {
        portfolio.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Background Ambient Video Loop */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        preload="metadata"
        onEnded={handleVideoEnded}
        poster="/thumbnails/empiccc-flow-fest.webp"
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.03] transition-transform duration-1000 pointer-events-none"
      >
        <source src="/videos/hero-loop-v2.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Overlays */}
      {/* 1. Vignette & Contrast gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60 pointer-events-none" />
      {/* 2. Radial focal spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Film Production Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-black/40 backdrop-blur-md mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium tracking-[0.25em] text-neutral-300 uppercase">
            Dirección Cinematográfica // Showreel 2025-2026
          </span>
        </div>

        {/* Studio Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-[0.95]">
          LENS{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-600">
            PRODUCCIONES
          </span>
        </h1>

        {/* Narrative Tagline */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-neutral-300 max-w-2xl font-light tracking-wide leading-relaxed drop-shadow-md">
          Historias visuales de alta fidelidad. Cobertura cinematográfica en vivo,
          festivales de música, videoclips y piezas visuales de alta energía.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <button
            onClick={handleScrollDown}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm tracking-wider uppercase transition-all duration-300 hover:bg-neutral-200 hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/80"
          >
            <Play className="w-4 h-4 fill-black text-black transition-transform group-hover:translate-x-0.5" />
            <span>Ver Portafolio</span>
          </button>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/20 bg-black/30 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase transition-all duration-300 hover:bg-white/10 hover:border-white/40 focus:outline-none"
          >
            <span>Contratar Rodaje</span>
          </a>
        </div>
      </div>

      {/* Silent Playback Indicator badge */}
      <div className="absolute bottom-10 right-8 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[11px] text-neutral-400">
        <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
        <span>Audio ambiental silenciado</span>
      </div>

      {/* Animated Scroll Down Indicator */}
      <button
        onClick={handleScrollDown}
        aria-label="Desplazarse al portafolio"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer group focus:outline-none"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-medium opacity-60 group-hover:opacity-100 transition-opacity">
          SCROLL
        </span>
        <ChevronDown className="w-5 h-5 animate-bounce transition-transform group-hover:scale-125" />
      </button>
    </section>
  );
}
