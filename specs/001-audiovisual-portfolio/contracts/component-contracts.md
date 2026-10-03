# Frontend Component Contracts: Lens Producciones

**Feature**: `001-audiovisual-portfolio`  
**Date**: 2026-10-02  
**Status**: Completed  

---

## 1. Contrato del Componente `HeroSection`

### Props & Interfaz
```typescript
export interface HeroSectionProps {
  /** Marca o título principal (ej. 'Lens Producciones') */
  brandName?: string;
  /** Subtítulo o lema editorial */
  tagline?: string;
  /** Video de fondo en bucle */
  backgroundVideoUrl: string;
  /** Imagen de poster para carga instantánea del hero */
  posterUrl: string;
  /** Callback o ancla para desplazamiento suave hacia el portafolio */
  onExploreClick?: () => void;
}
```

### Reglas de Renderizado y Comportamiento
- El elemento `<video>` DEBE renderizarse con: `autoPlay`, `loop`, `muted`, `playsInline`, `poster={posterUrl}`.
- Contiene un overlay semitransparente con gradiente oscuro (`bg-black/60` o gradiente radial/lineal) para asegurar legibilidad tipográfica absoluta.
- Botón interactivo de llamado a la acción con icono y animación suave de rebote/indicador de scroll.

---

## 2. Contrato del Componente `VideoCard`

### Props & Interfaz
```typescript
export interface VideoCardProps {
  /** Objeto de datos del proyecto */
  project: Project;
  /** Callback ejecutado al seleccionar el proyecto para visualización completa */
  onSelectProject: (project: Project) => void;
  /** Prioridad de carga (si es visible en primer render para omitir lazy) */
  priority?: boolean;
}
```

### Reglas de Renderizado y Optimización de Video
- **Poster estático**: `<img>` o fondo con `thumbnailUrl`, visible por defecto.
- **Elemento `<video>`**:
  - `preload="metadata"`
  - `muted={true}`
  - `loop={true}`
  - `playsInline={true}`
  - `poster={project.thumbnailUrl}`
- **Lazy Loading**: Supervisado por hook de `IntersectionObserver`. El video se monta o activa únicamente cuando la tarjeta entra al viewport (con `rootMargin: '150px'`).
- **Hover Teaser**:
  - `onMouseEnter`: Inicia temporizador de 100ms. Al cumplirse, reproduce el video (`videoRef.current.play()`) y aplica transición de opacidad (`opacity-100` sobre el video, `opacity-0` en el poster).
  - `onMouseLeave`: Cancela temporizador, pausa el video (`videoRef.current.pause()`), restablece tiempo (`currentTime = 0`), y restaura la visibilidad del poster.
- **Accesibilidad**: La tarjeta es focuseable mediante teclado (`tabIndex={0}`, `role="button"`), activándose con `Enter` o `Space`.

---

## 3. Contrato del Componente `VideoModal` (Reproductor Inmersivo)

### Props & Interfaz
```typescript
export interface VideoModalProps {
  /** Proyecto seleccionado actualmente; si es null, el modal permanece cerrado */
  project: Project | null;
  /** Callback para cerrar el modal y liberar recursos */
  onClose: () => void;
}
```

### Reglas de Comportamiento y Controles Personalizados
- **Gestión de DOM**:
  - Al abrirse (`project !== null`): bloquea el scroll global (`document.body.style.overflow = 'hidden'`).
  - Al cerrarse: restablece el scroll (`document.body.style.overflow = ''`).
- **Controles de Reproducción Personalizados**:
  - Barra de progreso interactiva (seekable timeline).
  - Botón Play / Pause con indicador de estado visual.
  - Indicador de tiempo transcurrido / duración total (formato `MM:SS`).
  - Control de volumen y botón rápido de Silenciar / Desactivar silencio.
  - Botón para solicitar pantalla completa (`requestFullscreen`).
- **Cierre Rápido y Limpieza**:
  - Tecla `Escape`: Cierra el modal inmediatamente.
  - Clic en el telón de fondo (backdrop outside player): Cierra el modal.
  - El desmontaje del modal DEBE pausar el video inmediatamente para evitar fugas de sonido.

---

## 4. Contrato del Componente `PortfolioGrid`

### Props & Interfaz
```typescript
export interface PortfolioGridProps {
  /** Lista de todos los proyectos disponibles */
  projects: Project[];
  /** Callback al seleccionar un proyecto */
  onSelectProject: (project: Project) => void;
  /** Categoría seleccionada actualmente para filtrado */
  selectedCategory: string;
  /** Callback al cambiar la categoría seleccionada */
  onCategoryChange: (category: string) => void;
}
```

### Reglas de Renderizado
- Barra de filtros con las categorías disponibles ("Todos", "Comercial", "Automotriz", etc.).
- Distribución responsiva en cuadrícula CSS (1 columna en móvil, 2 en tablet, 3 en desktop).
- Animación suave de reordenamiento cuando cambia la categoría activa.
