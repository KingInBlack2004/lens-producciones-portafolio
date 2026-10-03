# Implementation Plan: Portafolio Audiovisual para Lens Producciones

**Branch**: `001-audiovisual-portfolio` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-audiovisual-portfolio/spec.md`

## Summary

Desarrollar una aplicación web estática de grado profesional para "Lens Producciones" (productora audiovisual / cineasta) con diseño oscuro nativo minimalista, hero section con video ambiental en bucle, cuadrícula de proyectos con previsualización por hover (video mudo) optimizada mediante lazy loading (Intersection Observer) y un reproductor inmersivo modal a pantalla completa con controles personalizados y ficha narrativa. Todo el contenido reside en un archivo local `src/data/projects.json` (Headless Local), compilado con Static Site Generation (Next.js App Router con exportación estática) y preparado para despliegue en contenedores Coolify mediante un Dockerfile multi-etapa con servidor Nginx Alpine.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+ LTS  
**Primary Dependencies**: Next.js 15+ (App Router, `output: 'export'`), React 19, Tailwind CSS 3.4+, Lucide React, Framer Motion  
**Storage**: N/A (Headless Local: `src/data/projects.json` en local estático, cero bases de datos externas)  
**Testing**: Validación estática con TypeScript compiler (`tsc --noEmit`), ESLint y escenarios de prueba manual documentados en `quickstart.md`  
**Target Platform**: Servidor web estático Nginx en contenedor Docker (Coolify / VPS Linux x86_64 / ARM64) y cualquier navegador moderno (Chromium, Firefox, Safari, iOS Safari, Android Chrome)  
**Project Type**: Aplicación web frontend estática (Single-page app exportada estáticamente)  
**Performance Goals**: FCP < 1.2s, TTI < 1.5s, 60fps en animaciones y transiciones de video, carga diferida de videos fuera de pantalla (0 KB de video transferidos antes del scroll), latencia de hover preview < 300ms  
**Constraints**: 100% estático (sin runtime de Node.js en producción), consumo de memoria del contenedor < 25MB, video previews forzosamente silenciados (`muted`), compatibilidad estricta con políticas de autoplay de navegadores móviles y desktop  
**Scale/Scope**: Catálogo de 6-20 proyectos de alta resolución, 1 página principal con secciones integradas (Hero, Grid, About/Contact footer sutil) y 1 modal inmersivo  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Static-First Gate**: ¿La arquitectura genera artefactos 100% estáticos sin dependencias de base de datos en tiempo de ejecución?
   - **Resultado**: PASA. La aplicación utiliza `output: 'export'` de Next.js generando solo HTML/CSS/JS estáticos servidos por Nginx.
2. **Media Optimization Gate**: ¿Todos los elementos de video respetan los atributos mandatorios (`autoPlay`, `muted`, `loop`, `playsInline`, `preload="metadata"`, `poster`) y lazy loading?
   - **Resultado**: PASA. El diseño de componentes y contratos impone rigurosamente estas reglas tanto en Hero como en `VideoCard` y `VideoModal`.
3. **Containerization Gate**: ¿El artefacto de despliegue está aislado en un Dockerfile multi-etapa listo para Coolify?
   - **Resultado**: PASA. Se define un Dockerfile con Node.js en compilación y Nginx Alpine en producción con configuración de compresión gzip y caché inmutable.

## Project Structure

### Documentation (this feature)

```text
specs/001-audiovisual-portfolio/
├── spec.md              # Especificación de requerimientos y criterios de éxito
├── plan.md              # Este plan de implementación arquitectónico
├── research.md          # Decisiones tecnológicas y análisis de alternativas
├── data-model.md        # Definición de entidades, interfaces y ciclo de estados
├── quickstart.md        # Guía de validación y puesta en marcha
├── contracts/           # Contratos de interfaz y esquemas formales
│   ├── projects-schema.json
│   └── component-contracts.md
└── checklists/
    └── requirements.md  # Validación de calidad de la especificación
```

### Source Code (repository layout)

```text
.
├── .specify/                   # Configuración del flujo spec-kit
├── specs/                      # Especificaciones y documentación técnica
├── public/                     # Archivos estáticos públicos
│   ├── thumbnails/             # Imágenes estáticas de alta resolución (posters)
│   │   ├── hero-poster.webp
│   │   ├── commercial-1.webp
│   │   ├── automotive-1.webp
│   │   └── ...
│   └── videos/                 # Archivos de video optimizados (MP4 / WebM)
│       ├── hero-reel.mp4
│       ├── commercial-1.mp4
│       ├── automotive-1.mp4
│       └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Estructura raíz, tipografía y metadatos SEO
│   │   ├── page.tsx            # Página principal integrando Hero, Grid y Modal
│   │   └── globals.css         # Directivas Tailwind, tokens de color y estilos base
│   ├── components/             # Componentes modulares de interfaz
│   │   ├── HeroSection.tsx     # Hero de pantalla completa con loop ambiental y CTA
│   │   ├── PortfolioGrid.tsx   # Cuadrícula responsiva con filtros por categoría
│   │   ├── VideoCard.tsx       # Tarjeta de proyecto con hover teaser y lazy loading
│   │   ├── VideoModal.tsx      # Modal de pantalla completa con controles personalizados
│   │   ├── CategoryFilter.tsx  # Botones interactivos de filtrado por categoría
│   │   └── CustomControls.tsx  # Barra de progreso, play/pause y volumen para el modal
│   ├── data/
│   │   └── projects.json       # Base de datos local con los proyectos del portafolio
│   ├── hooks/
│   │   └── useIntersectionObserver.ts # Hook reutilizable para detección de viewport
│   ├── lib/
│   │   └── projects.ts         # Funciones helper para consulta y filtrado tipado
│   └── types/
│       └── project.ts          # Interfaces TypeScript del catálogo y estados
├── Dockerfile                  # Construcción multi-etapa (Node build -> Nginx Alpine)
├── nginx.conf                  # Configuración de Nginx para SPA estática y caché
├── next.config.ts              # Configuración de Next.js (output: 'export')
├── package.json                # Dependencias y scripts de construcción
├── postcss.config.mjs          # Integración de PostCSS para Tailwind
├── tailwind.config.ts          # Configuración de Tailwind (paleta cinematográfica oscura)
└── tsconfig.json               # Configuración estricta de TypeScript
```

**Structure Decision**: Se elige una arquitectura Next.js App Router mono-proyecto orientada a componentes modulares con separación limpia entre datos locales (`src/data/`), lógica de componentes (`src/components/`), ganchos de optimización de rendimiento (`src/hooks/`) y tipado estricto (`src/types/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *Ninguna* | No se identifican violaciones a las compuertas de simplicidad ni principios de la constitución. | Arquitectura minimalista 100% estática sin servidores de backend ni bases de datos. |
