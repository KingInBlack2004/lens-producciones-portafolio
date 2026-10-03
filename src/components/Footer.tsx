"use client";

import React from "react";
import { Film, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative w-full border-t border-white/10 bg-black text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-white/20 bg-neutral-900 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold tracking-widest text-lg text-white uppercase">
                LENS PRODUCCIONES
              </span>
            </div>
            <p className="text-sm font-light text-neutral-400 max-w-md leading-relaxed">
              Casa productora audiovisual dedicada a la creación de comerciales,
              cinematografía automotriz y piezas documentales de alta fidelidad.
              Desarrollamos cada proyecto desde la conceptualización hasta la gradación final de color.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://www.instagram.com/lensproducciones593?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:text-white hover:border-white/30 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Direct */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-mono font-semibold text-white tracking-widest uppercase mb-2">
              Contacto Directo
            </h4>
            <div className="flex items-center gap-3 text-xs">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <a
                href="mailto:josuegiorgio4512@gmail.com"
                className="hover:text-white transition-colors"
              >
                josuegiorgio4512@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>+593 99-020-4444</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Quito - Ecuador</span>
            </div>
          </div>

          {/* Workflow & Gear */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-mono font-semibold text-white tracking-widest uppercase mb-2">
              Flujo Técnico
            </h4>
            <p className="text-xs leading-relaxed text-neutral-400 font-light">
              Producción en 4K RAW (RED / ARRI)  y corrección de color en DaVinci Resolve Studio.
            </p>
            <div className="inline-block mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-[10px] font-mono text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Disponibilidad para rodajes 2026
              </span>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4">
          <p>© {new Date().getFullYear()} Lens Producciones. Todos los derechos reservados.</p>
          <p className="font-mono text-[11px] text-neutral-400">
            Diseño & Cinematografía Web Estática
          </p>
        </div>
      </div>
    </footer>
  );
}
