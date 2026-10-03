# Technical Research & Architecture Decisions: Lens Producciones

**Feature**: `001-audiovisual-portfolio`  
**Date**: 2026-10-02  
**Status**: Completed  

---

## 1. Framework & Static Export Strategy

### Decision
Utilizar **Next.js (App Router)** con TypeScript, configurado en modo Static Site Generation (SSG) mediante `output: 'export'` en `next.config.ts`, desactivando la optimización dinámica de imágenes del servidor (`images: { unoptimized: true }`).

### Rationale
- **Generación Estática Pura**: Al compilar (`next build`), Next.js produce un directorio `out/` con archivos HTML, CSS y JavaScript completamente estáticos, eliminando la necesidad de un runtime de Node.js en producción.
- **Rendimiento y DX**: Excelente soporte para TypeScript, modularización de componentes en React, integración fluida con Tailwind CSS y compatibilidad total con librerías de animación e iconografía modernas.
- **Flexibilidad de Despliegue**: El directorio generado `out/` puede ser servido de manera trivial por cualquier servidor web de alto rendimiento (Nginx, Caddy, Cloudflare Pages, S3/CloudFront).

### Alternatives Considered
- **Nuxt 3 (Vue)**: Excelente alternativa estática (`npx nuxi generate`), pero el ecosistema React ofrece mayor madurez en utilidades de control fino para canvas/video y animaciones complejas con Framer Motion.
- **Vite + React SPA**: Muy ligero, pero Next.js App Router proporciona una estructura de metadatos SEO nativa (`generateMetadata`) y pre-renderizado HTML estático superior para buscadores sin necesidad de plugins adicionales.

---

## 2. Estrategia de Rendimiento y Lazy Loading para Video

### Decision
Implementar un sistema de hidratación y reproducción diferida de video en dos niveles:
1. **Lazy Loading con Intersection Observer**:
   - Las tarjetas de la cuadrícula observan su visibilidad en el viewport con un margen de anticipación (`rootMargin: '150px'`).
   - El elemento `<video>` solo se monta o inicializa en el DOM cuando la tarjeta se aproxima a la pantalla, evitando peticiones de red simultáneas para elementos *below-the-fold*.
   - Se establece obligatoriamente `preload="metadata"` y el atributo `poster` apuntando a la miniatura optimizada WebP/JPG.
2. **Hover Teaser con Debounce**:
   - Al posicionar el cursor sobre la tarjeta, se activa un retardo de debounce sutil (~80-120ms) para evitar disparar la reproducción si el usuario simplemente pasa el puntero de paso por la cuadrícula.
   - El video teaser se reproduce obligatoriamente con `muted`, `loop`, `autoPlay` y `playsInline`.
   - Se realiza una transición de opacidad CSS (cross-fade) entre el poster y el video.
   - Al salir el cursor (`onMouseLeave`), la reproducción se pausa inmediatamente y el tiempo de reproducción se reinicia (`currentTime = 0`).

### Rationale
- Un portafolio audiovisual puede contener decenas de proyectos. Si todos los videos intentaran cargar o inicializarse al mismo tiempo, el ancho de banda del cliente colapsaría y el navegador experimentaría caídas de frames críticas.
- Garantiza que la experiencia inicial cargue únicamente imágenes estáticas ligeras, cargando video solo por demanda visual.

### Alternatives Considered
- **Atributo `loading="lazy"` nativo**: No está estandarizado para la etiqueta `<video>` en todos los navegadores modernos.
- **Carga de GIFs animados para previews**: Descartada rotundamente por ineficiencia de compresión y degradación drástica de la fidelidad de color frente a video MP4/WebM.

---

## 3. Arquitectura del Modal Inmersivo y Controles de Video

### Decision
Construir un componente de reproductor inmersivo (`VideoModal`) basado en la API nativa de HTML5 Video (`HTMLVideoElement`), controlado mediante React Hooks (`useRef`, `useState`, `useEffect`), con interfaz de controles personalizados:
- **Controles Personalizados**: Play/Pause, barra de tiempo interactiva (scrubber), visualización de tiempo (actual/duración), botón y deslizador de volumen/mute, y botón de pantalla completa (Fullscreen API).
- **Gestión de Foco y Scroll**: Bloqueo del scroll de fondo (`document.body.style.overflow = 'hidden'`) mientras el modal está activo.
- **Navegación por Teclado**: Cierre con tecla Escape, barra espaciadora para alternar reproducción, flechas para avanzar/retroceder.
- **Limpieza de Recursos**: Al desmontar o cerrar el modal, se pausa el video y se liberan las promesas de reproducción activas para evitar fugas de memoria o errores en consola (`AbortError`).

### Rationale
- Los reproductores de terceros (como Video.js o Plyr) añaden de 50KB a 120KB al bundle y traen estilos preconfigurados difíciles de adaptar a un diseño cinematográfico oscuro minimalista.
- Un reproductor nativo personalizado con Tailwind CSS ofrece control absoluto sobre accesibilidad, transiciones y rendimiento sin dependencias pesadas.

### Alternatives Considered
- **Reproductor embebido de Vimeo/YouTube**: Introduce iframes pesados, cookies de terceros, banners no deseados y tiempos de carga lentos. Inadecuado para un portafolio de alta gama.

---

## 4. Arquitectura de Datos Local (Headless Local)

### Decision
Estructurar los datos de los proyectos en un archivo JSON local `src/data/projects.json`, validado con interfaces estrictas de TypeScript en `src/types/project.ts`. Proporcionar utilidades en `src/lib/projects.ts` para obtener listas completas, filtrar por categoría y consultar proyectos destacados.

### Rationale
- Cumple al 100% con la restricción de cero bases de datos ni backends.
- Permite al usuario/cliente editar, agregar o reordenar proyectos simplemente modificando un archivo JSON legible.
- Las imágenes y videos se organizan en `public/thumbnails/` y `public/videos/` respectivamente, facilitando la adición de activos sin recompilar assets binarios.

---

## 5. Estrategia de Contenedorización para Coolify

### Decision
Diseñar un `Dockerfile` multi-etapa (*multi-stage build*):
1. **Etapa de Construcción (Builder)**: Imagen base `node:20-alpine`. Instala dependencias con `npm ci`, ejecuta `npm run build` y genera el directorio estático exportado `out/`.
2. **Etapa de Producción (Runner)**: Imagen base ultraligera `nginx:alpine`. Copia únicamente los archivos de `/app/out` hacia `/usr/share/nginx/html` e inyecta una configuración optimizada `nginx.conf`:
   - Enrutamiento SPA con `try_files $uri $uri/ /index.html =404;`.
   - Compresión Gzip activada para HTML, CSS, JS y JSON.
   - Cabeceras de caché agresivas para activos estáticos con hash (`Cache-Control: public, max-age=31536000, immutable`).
   - Servidor HTTP escuchando en el puerto 80, listo para que Coolify asigne el proxy inverso y certificados SSL automáticamente.

### Rationale
- **Tamaño Mínimo**: La imagen final pesa menos de 25MB y consume menos de 15MB de memoria RAM en el servidor.
- **Seguridad Máxima**: No contiene Node.js, npm ni herramientas de desarrollo en la capa de producción.
- **Compatibilidad Coolify**: Coolify detecta el `Dockerfile` directamente en el repositorio y realiza el despliegue sin configuraciones complejas adicionales.
