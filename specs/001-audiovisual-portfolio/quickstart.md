# Quickstart & Validation Guide: Lens Producciones

**Feature**: `001-audiovisual-portfolio`  
**Date**: 2026-10-02  
**Status**: Completed  

---

## 1. Prerrequisitos del Entorno

- **Node.js**: v18.18.0 o superior (recomendado v20 LTS).
- **Gestor de Paquetes**: `npm` v9+ o `pnpm`.
- **Docker** (opcional, para validación de contenedor): v24+.

---

## 2. Puesta en Marcha Local (Desarrollo)

### Paso 1: Instalación de dependencias
```bash
npm install
```

### Paso 2: Ejecución del servidor de desarrollo
```bash
npm run dev
```
Acceder en el navegador a: `http://localhost:3000`

---

## 3. Escenarios de Validación de Criterios

### Escenario 1: Hero Section y Autoplay Mute
- **Acción**: Cargar la página inicial.
- **Resultado Esperado**:
  - El fondo de video del Hero debe reproducirse de inmediato sin emitir sonido.
  - El titular "Lens Producciones" y el botón de exploración deben ser claramente legibles.
  - Al pulsar "Ver Portafolio", la pantalla se desplaza suavemente hacia la sección de la cuadrícula.

### Escenario 2: Lazy Loading y Hover Teaser en Cuadrícula
- **Acción**:
  1. Abrir la pestaña *Network* de DevTools (filtrar por *Media*).
  2. Verificar que los videos de tarjetas fuera de pantalla no se han descargado.
  3. Desplazarse hacia una tarjeta y posicionar el cursor sobre ella.
- **Resultado Esperado**:
  - Tras un breve instante (~100ms), la miniatura estática se desvanece suavemente.
  - El video teaser comienza a reproducirse en bucle continuo y sin sonido.
  - Al retirar el cursor, el video se pausa y la miniatura estática reaparece.

### Escenario 3: Modal Inmersivo y Controles Personalizados
- **Acción**:
  1. Hacer clic sobre cualquier tarjeta de la cuadrícula.
  2. Probar los controles: play/pause, avance en barra de tiempo, volumen/mute, y pantalla completa.
  3. Presionar la tecla `Escape` o hacer clic fuera del reproductor.
- **Resultado Esperado**:
  - El modal se abre en menos de 150ms ocupando toda la pantalla y bloqueando el scroll de fondo.
  - Los controles personalizados responden con precisión.
  - El modal se cierra inmediatamente deteniendo la reproducción de audio y video por completo, y el scroll de fondo se reactiva.

### Escenario 4: Filtrado por Categorías
- **Acción**: Seleccionar una categoría en la barra de filtros (ej. "Automotriz").
- **Resultado Esperado**:
  - La cuadrícula filtra las tarjetas de forma instantánea, mostrando solo los proyectos correspondientes.
  - Al seleccionar "Todos", se muestran nuevamente todos los proyectos.

---

## 4. Validación de Exportación Estática y Contenedor Docker

### Paso 1: Compilación Estática (SSG)
```bash
npm run build
```
- **Resultado Esperado**: Creación exitosa del directorio `out/` conteniendo únicamente archivos estáticos (HTML, CSS, JS, imágenes y videos). Cero errores de TypeScript o ESLint.

### Paso 2: Construcción y Ejecución en Contenedor (Coolify Simulation)
```bash
# Construir la imagen Docker multi-etapa
docker build -t lens-producciones:latest .

# Ejecutar el contenedor localmente en el puerto 8080
docker run -p 8080:80 lens-producciones:latest
```
- **Resultado Esperado**:
  - Acceder a `http://localhost:8080`.
  - La aplicación funciona idénticamente a la versión de desarrollo.
  - El servidor Nginx sirve la aplicación con gzip y cabeceras de caché estáticas.
