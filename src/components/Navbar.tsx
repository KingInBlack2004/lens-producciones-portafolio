"use client";

import React, { useState, useEffect } from "react";
import { Film, Instagram, Mail, Menu, X, Youtube } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
          : "bg-gradient-to-b from-black/80 via-black/30 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#"
          className="flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-white/40 rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-full border border-white/20 bg-neutral-900/80 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:border-white/50">
            <Film className="w-5 h-5 text-white/90 transition-transform group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-widest text-lg text-white uppercase group-hover:text-amber-400 transition-colors">
              LENS
            </span>
            <span className="text-[9px] tracking-[0.35em] text-neutral-400 uppercase -mt-1 font-medium">
              PRODUCCIONES
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider text-neutral-300">
          <button
            onClick={() => scrollToSection("portfolio")}
            className="hover:text-white transition-colors focus:outline-none"
          >
            PORTAFOLIO
          </button>
          <button
            onClick={() => scrollToSection("hero")}
            className="hover:text-white transition-colors focus:outline-none"
          >
            SHOWREEL
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-white transition-colors focus:outline-none"
          >
            CONTACTO
          </button>
        </nav>

        {/* Social / Action */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Lens Producciones"
            className="p-2 text-neutral-400 hover:text-white transition-colors hover:scale-110"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube Lens Producciones"
            className="p-2 text-neutral-400 hover:text-white transition-colors hover:scale-110"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <button
            onClick={() => scrollToSection("contact")}
            className="ml-2 px-4 py-2 text-xs font-semibold tracking-wider text-black bg-white hover:bg-neutral-200 transition-all rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none"
          >
            INICIAR PROYECTO
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Alternar menú"
          className="md:hidden p-2 text-neutral-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-4 text-center">
          <button
            onClick={() => scrollToSection("portfolio")}
            className="text-base font-semibold tracking-widest text-neutral-300 hover:text-white py-2"
          >
            PORTAFOLIO
          </button>
          <button
            onClick={() => scrollToSection("hero")}
            className="text-base font-semibold tracking-widest text-neutral-300 hover:text-white py-2"
          >
            SHOWREEL
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-base font-semibold tracking-widest text-neutral-300 hover:text-white py-2"
          >
            CONTACTO
          </button>
        </div>
      )}
    </header>
  );
}
