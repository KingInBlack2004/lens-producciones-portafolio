# Lens Producciones — Portafolio Audiovisual

Sitio web estático de nivel profesional para la productora cinematográfica **Lens Producciones**. 

Desarrollado con una arquitectura 100% frontend estática (SSG), optimizado para carga ultrarrápida de medios visuales y listo para ser desplegado en contenedores mediante **Coolify**.

---

## Características Principales

- **Estética Cinematográfica Dark Mode**: Paleta oscura nativa, alto contraste y tipografía sans-serif minimalista.
- **Hero Section Fullscreen**: Video ambiental de fondo en bucle continuo, marca del estudio y llamada a la acción con desplazamiento suave.
- **Hover Preview Teaser**: Al pasar el cursor sobre cualquier proyecto de la cuadrícula, la miniatura se desvanece suavemente para reproducir un fragmento de video en bucle y sin sonido.
- **Lazy Loading (Intersection Observer)**: Los videos del catálogo no consumen ancho de banda hasta que el usuario se desplaza cerca de ellos.
- **Reproductor Inmersivo Modal**: Al hacer clic en un proyecto, se abre un reproductor a pantalla completa con controles personalizados (play/pause, barra de progreso, volumen, pantalla completa), ficha técnica y descripción. Bloqueo de scroll de fondo y cierre instantáneo con tecla `Escape` o clic exterior sin fugas de audio.
- **Filtro por Categorías**: Navegación dinámica entre categorías temáticas (*Comercial*, *Automotriz*, *Evento*, *Documental*).
- **Headless Local Data**: Catálogo gestionado directamente en [`src/data/projects.json`](./src/data/projects.json).
- **Contenedorización para Coolify**: `Dockerfile` multi-etapa con servidor web Nginx Alpine ultraligero (< 25MB) y compresión Gzip.

---

## Estructura del Proyecto

```text
.
├── public/
│   ├── thumbnails/             # Miniaturas estáticas en alta resolución (posters)
│   └── videos/                 # Archivos de video optimizados (MP4)
├── src/
│   ├── app/
│   │   ├── globals.css         # Estilos globales y tokens de Tailwind
│   │   ├── layout.tsx          # Layout raíz con metadatos SEO
│   │   └── page.tsx            # Página principal integrada
│   ├── components/
│   │   ├── CustomControls.tsx  # Barra y botones personalizados de video
│   │   ├── CategoryFilter.tsx  # Selector de categorías temáticas
│   │   ├── Footer.tsx          # Pie de página y datos de contacto
│   │   ├── HeroSection.tsx     # Hero de pantalla completa con loop de video
│   │   ├── Navbar.tsx          # Barra de navegación superior con efecto blur
│   │   ├── PortfolioGrid.tsx   # Cuadrícula responsiva de proyectos
│   │   ├── VideoCard.tsx       # Tarjeta con hover teaser y lazy loading
│   │   └── VideoModal.tsx      # Modal de pantalla completa para visualización
│   ├── data/
│   │   └── projects.json       # Datos locales del portafolio (Headless)
│   ├── hooks/
│   │   └── useIntersectionObserver.ts # Hook de detección de viewport
│   ├── lib/
│   │   └── projects.ts         # Consultas y filtros tipados
│   └── types/
│       └── project.ts          # Interfaces TypeScript
├── Dockerfile                  # Construcción multi-etapa (Node -> Nginx Alpine)
├── nginx.conf                  # Configuración de Nginx (SPA, compresión y caché)
├── next.config.ts              # Configuración de exportación estática (output: 'export')
└── tailwind.config.ts          # Configuración de Tailwind CSS
```

---

## Comandos de Desarrollo y Compilación

### Instalación de Dependencias
```bash
npm install
```

### Servidor de Desarrollo Local
```bash
npm run dev
```
Acceder a: `http://localhost:3000`

### Compilación y Exportación Estática
```bash
npm run build
```
Genera la carpeta `out/` con todos los archivos HTML, CSS, JS y multimedia estáticos listos para producción.

---

## Despliegue en Coolify

Este repositorio incluye una configuración lista para producción:

1. En tu panel de **Coolify**, añade un nuevo recurso seleccionando **Git Source**.
2. Conecta este repositorio.
3. Coolify detectará automáticamente el archivo `Dockerfile`.
4. El contenedor construirá el proyecto usando Node 20 y servirá el resultado con Nginx Alpine en el puerto `80`.
5. Coolify asignará automáticamente el certificado SSL (HTTPS) y el proxy inverso.
