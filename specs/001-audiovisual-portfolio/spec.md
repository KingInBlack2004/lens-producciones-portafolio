# Feature Specification: Portafolio Audiovisual para Lens Producciones

**Feature Branch**: `001-audiovisual-portfolio`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Generador de Portafolio Audiovisual (Frontend Estático) para Lens Producciones. Portafolio web de nivel profesional orientado a cineasta/filmmaker, 100% frontend estático, sin base de datos, optimizado para carga ultrarrápida y listo para despliegue en contenedores Coolify. Incluye Hero Section con video en loop a pantalla completa, Grid de portafolio con interacción hover que reproduce teaser sin sonido, Modal de visualización inmersivo con reproductor a pantalla completa y detalles de proyecto, arquitectura de datos local en projects.json, y reglas críticas de optimización de video (autoPlay, muted, loop, playsInline, preload metadata, posters y lazy loading)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inmersión Inicial en Hero Section y Marca (Priority: P1)

Como visitante o cliente potencial (director de arte, productor de agencia o marca), quiero acceder al sitio web de Lens Producciones y experimentar de inmediato un impacto audiovisual de alta calidad cinematográfica mediante un video ambiental a pantalla completa con la identidad de la productora y un llamado a la acción para explorar el portafolio.

**Why this priority**: Es la primera impresión del cliente y define el tono profesional y cinematográfico de la productora. Sin una portada visualmente contundente, el valor percibido del trabajo disminuye drásticamente.

**Independent Test**: Puede ser probado de forma independiente cargando la página de inicio en cualquier navegador; el video ambiental debe reproducirse en bucle de manera fluida y silenciosa bajo la marca "Lens Producciones" con un botón funcional que desplaza la vista hacia los proyectos.

**Acceptance Scenarios**:

1. **Given** un usuario que ingresa a la URL raíz del portafolio, **When** el sitio web carga en el navegador, **Then** se presenta de inmediato un Hero section a pantalla completa en estética oscura con el logotipo y nombre "Lens Producciones", un llamado a la acción sutil y un video de fondo que inicia su reproducción en bucle sin emitir sonido.
2. **Given** el usuario observando el Hero Section, **When** interactúa con el botón de llamado a la acción ("Ver Portafolio" o scroll indicador), **Then** la vista se desplaza suavemente hacia la sección de la cuadrícula de proyectos.

---

### User Story 2 - Exploración del Catálogo y Previsualización Dinámica (Priority: P1)

Como visitante explorando los trabajos audiovisuales, quiero navegar por una cuadrícula de proyectos organizados donde, al pasar el cursor sobre cualquier miniatura, se desvanezca suavemente la imagen estática y se reproduzca un fragmento de video en bucle sin sonido, para tener un vistazo rápido del estilo y calidad de cada pieza antes de decidir abrirla.

**Why this priority**: Constituye la experiencia central de navegación y diferenciación de un portafolio de video profesional frente a galerías de imágenes tradicionales, permitiendo evaluar rápidamente múltiples trabajos.

**Independent Test**: Se prueba de forma independiente navegando por la cuadrícula de proyectos; al posicionar el cursor sobre una tarjeta con video asociado, la miniatura realiza un fundido cruzado hacia el video teaser en reproducción muda; al retirar el cursor, regresa suavemente a la imagen estática.

**Acceptance Scenarios**:

1. **Given** la cuadrícula de proyectos visible en pantalla, **When** el usuario coloca el cursor sobre una tarjeta de proyecto, **Then** la imagen de miniatura se desvanece con una transición suave y el reproductor de previsualización inicia la reproducción en bucle del fragmento de video sin emitir audio.
2. **Given** un proyecto con video de previsualización en reproducción activa por hover, **When** el usuario retira el cursor fuera de los límites de la tarjeta, **Then** el video se pausa y la tarjeta retorna suavemente a su miniatura estática (poster).
3. **Given** tarjetas de proyecto ubicadas fuera del área visible inicial (below-the-fold), **When** la página carga inicialmente, **Then** el sistema no descarga los fragmentos de video pesados de esas tarjetas hasta que el usuario hace scroll hacia ellas (lazy visual hydration).

---

### User Story 3 - Visualización Inmersiva en Modal de Pantalla Completa (Priority: P1)

Como cliente o evaluador interesado en un trabajo específico, quiero hacer clic en cualquier proyecto de la cuadrícula para abrir un reproductor inmersivo a pantalla completa sin salir de la página, con controles de video personalizados y la ficha descriptiva del proyecto.

**Why this priority**: Permite disfrutar la pieza audiovisual en alta resolución y con sonido controlado, analizando la narrativa, ficha técnica y contexto de producción sin perder la posición de navegación en el portafolio.

**Independent Test**: Se prueba haciendo clic en cualquier tarjeta de proyecto; debe desplegarse un modal sobre la vista actual mostrando el reproductor principal, controles accesibles de reproducción, volumen y pantalla completa, y los datos del proyecto (título, categoría, descripción), cerrándose al presionar Escape o el botón de cierre.

**Acceptance Scenarios**:

1. **Given** el usuario navegando en la cuadrícula de proyectos, **When** hace clic sobre una tarjeta de proyecto, **Then** se abre un modal inmersivo a pantalla completa sobre la página, bloqueando el scroll de fondo y cargando el video principal junto con el título, categoría y descripción narrativa del proyecto.
2. **Given** el modal inmersivo abierto con el video en reproducción, **When** el usuario presiona la tecla Escape, el botón de cierre o hace clic fuera del contenedor de video, **Then** el modal se cierra de inmediato, el video se detiene liberando recursos y el usuario retoma exactamente la misma posición de scroll en la cuadrícula.
3. **Given** el modal inmersivo abierto, **When** el usuario interactúa con los controles personalizados (play/pause, barra de progreso, volumen/mute, pantalla completa), **Then** el reproductor responde de inmediato a las acciones del usuario.

---

### User Story 4 - Experiencia Fluida en Dispositivos Móviles y Táctiles (Priority: P2)

Como usuario que accede al portafolio desde un teléfono inteligente o tableta, quiero experimentar un diseño responsivo optimizado donde las imágenes y videos se adapten perfectamente a mi pantalla táctil sin consumir datos excesivos ni sufrir bloqueos por restricciones de reproducción automática.

**Why this priority**: Una gran proporción de directores y clientes revisan referencias desde dispositivos móviles; una experiencia rota o lenta en móviles arruina oportunidades comerciales.

**Independent Test**: Puede ser probado reduciendo el viewport a dimensiones móviles (e.g., 375px a 768px); la cuadrícula debe reorganizarse a una o dos columnas, el Hero debe encuadrarse limpiamente, los posters deben mostrarse de inmediato y tocar una tarjeta debe abrir directamente la reproducción en el modal o activar el preview sin conflictos.

**Acceptance Scenarios**:

1. **Given** un dispositivo con pantalla táctil, **When** el usuario hace scroll vertical por la cuadrícula, **Then** las miniaturas y títulos se presentan en un diseño adaptativo de alto contraste con tipografía legible y márgenes cómodos.
2. **Given** un dispositivo táctil donde la interacción "hover" no existe físicamente, **When** el usuario pulsa sobre una tarjeta de proyecto, **Then** el sistema abre fluidamente el modal inmersivo para reproducir la pieza completa.

---

### User Story 5 - Filtrado por Categorías Temáticas (Priority: P3)

Como visitante que busca un tipo específico de producción (ej. solo anuncios comerciales, videos automotrices o cobertura de eventos), quiero filtrar los proyectos de la cuadrícula por categoría para ver exclusivamente las piezas relevantes a mi necesidad.

**Why this priority**: Facilita la exploración rápida para clientes corporativos o agencias con necesidades de nicho muy concretas.

**Independent Test**: Se prueba seleccionando una categoría en el selector de filtros; la cuadrícula debe actualizarse mostrando únicamente los proyectos pertenecientes a la categoría seleccionada, o todos al elegir "Todos".

**Acceptance Scenarios**:

1. **Given** la lista completa de proyectos visibles, **When** el usuario selecciona una categoría (ej. "Comercial"), **Then** la cuadrícula se actualiza para exhibir únicamente los proyectos clasificados en dicha categoría.
2. **Given** una categoría filtrada activa, **When** el usuario selecciona la opción "Todos", **Then** la cuadrícula restaura la visualización de la totalidad del portafolio.

---

### Edge Cases

- **Políticas de Autoplay en Navegadores**: Si el navegador del usuario bloquea la reproducción automática de video sin interacción previa, el sistema debe mostrar de forma visible la imagen de miniatura (poster) y garantizar que la interfaz no colapse ni muestre mensajes de error técnicos.
- **Conexiones Lentas o Ahorro de Datos**: Si la descarga del video toma más tiempo del habitual, el poster estático debe mantenerse nítido sin parpadeos ni fondos transparentes rotos hasta que el primer fotograma esté listo para reproducirse.
- **Cierre Rápido del Modal o Salida Rápida de Hover**: Si el usuario entra y sale velozmente de una tarjeta, o abre y cierra inmediatamente el modal, el sistema debe cancelar las promesas de reproducción de video en curso para evitar excepciones en el hilo principal del navegador.
- **Teclado y Accesibilidad**: Si un usuario navega utilizando la tecla Tab, las tarjetas y los controles del modal deben recibir foco visible, y la tecla Escape debe cerrar el modal desde cualquier elemento enfocado.
- **Proyectos sin Video Asignado o Ruta Rota**: Si un archivo multimedia no puede ser cargado, el sistema debe conservar visible la miniatura estática y emitir un mensaje sutil en el modal indicando la indisponibilidad del video, sin afectar a los demás proyectos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE presentar un diseño de temática oscura nativa (Dark Mode), con paleta de colores sobria, alto contraste y tipografía sans-serif minimalista que priorice el contenido visual cinematográfico.
- **FR-002**: El sistema DEBE incluir un Hero Section de pantalla completa con un video ambiental de fondo configurado para reproducirse automáticamente, en bucle continuo, silenciado (`muted`) y en línea (`playsInline`).
- **FR-003**: El Hero Section DEBE mostrar la marca "Lens Producciones" y un elemento de llamado a la acción para guiar la atención del usuario hacia la galería de proyectos.
- **FR-004**: El sistema DEBE renderizar una cuadrícula responsiva o estilo mampostería (masonry) con todas las tarjetas de proyectos audiovisuales.
- **FR-005**: Cada tarjeta de proyecto DEBE mostrar una imagen de portada fija (poster/thumbnail), el título de la obra y su categoría correspondiente.
- **FR-006**: En dispositivos con puntero (desktop), al pasar el cursor sobre una tarjeta de proyecto, el sistema DEBE realizar una transición suave de desvanecimiento del poster hacia un fragmento de video de previsualización sin audio (`muted`, `loop`, `playsInline`).
- **FR-007**: Al retirar el cursor de la tarjeta de proyecto, el sistema DEBE pausar la previsualización y restaurar suavemente la visibilidad de la imagen de miniatura.
- **FR-008**: El sistema DEBE cargar de forma diferida (Lazy Loading con Intersection Observer) los elementos de video de las tarjetas del portafolio, montándolos y preparando sus metadatos (`preload="metadata"`) únicamente cuando entren o estén próximos a entrar al área visible del viewport.
- **FR-009**: Cada elemento de video DEBE incluir obligatoriamente el atributo `poster` asociado a su respectiva imagen de miniatura para garantizar una renderización inicial instantánea.
- **FR-010**: Al hacer clic o pulsar en una tarjeta de proyecto, el sistema DEBE abrir un modal inmersivo a pantalla completa sobre la página actual, sin realizar redirecciones ni recargas completas.
- **FR-011**: El modal inmersivo DEBE reproducir la pieza audiovisual seleccionada y proporcionar controles accesibles de reproducción (reproducir/pausar, progreso temporal, ajuste de volumen y alternar pantalla completa).
- **FR-012**: El modal inmersivo DEBE mostrar el título, la categoría y la descripción detallada del proyecto seleccionado.
- **FR-013**: El modal inmersivo DEBE cerrarse mediante un botón dedicado de cierre, haciendo clic en la capa de fondo o presionando la tecla Escape, deteniendo inmediatamente la reproducción y liberando recursos de audio/video.
- **FR-014**: El sistema DEBE cargar la información de los proyectos desde una estructura de datos local estructurada (`projects.json` o equivalente local) sin depender de APIs ni bases de datos dinámicas externas.
- **FR-015**: El sistema DEBE permitir clasificar proyectos en categorías (ej. "Comercial", "Automotriz", "Evento") e identificar proyectos destacados (`featured`).
- **FR-016**: El sistema DEBE operar como una entrega web estática autónoma, lista para ejecución en infraestructura web ligera y contenedores sin requerir bases de datos activas ni capas de ejecución de servidor dinámicas en producción.

### Key Entities *(include if feature involves data)*

- **Proyecto Audiovisual (Project)**:
  - `id`: Identificador único del proyecto (string alfanumérico, ej. "comercial-horizonte").
  - `title`: Título formal de la obra o producción (string, ej. "Horizonte Urbano").
  - `category`: Categoría temática de la producción (string, ej. "Comercial", "Automotriz", "Evento", "Documental").
  - `description`: Descripción narrativa del proyecto, cliente o ficha técnica del rodaje (string).
  - `videoUrl`: Ruta local relativa del archivo de video para visualización completa y previsualización (string relativo a la carpeta pública de videos).
  - `thumbnailUrl`: Ruta local relativa de la imagen estática de miniatura/poster en alta resolución (string relativo a la carpeta pública de imágenes/thumbnails).
  - `featured`: Indicador booleano que señala si la pieza goza de visibilidad destacada en la galería o portada.

- **Categoría (Category)**:
  - `name`: Nombre descriptivo de la categoría para agrupación y filtrado visual.
  - `slug`: Identificador textual amigable para filtrado en la interfaz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El despliegue inicial del Hero Section y la percepción visual de la página ocurren en menos de 1.5 segundos en conexiones de banda ancha estándar, con el poster visible de inmediato mientras el video ambiental inicia.
- **SC-002**: La transición de miniatura a video teaser en la interacción hover se inicia fluidamente en menos de 300 milisegundos tras situar el cursor sobre una tarjeta en viewport.
- **SC-003**: La apertura del modal inmersivo de visualización responde en menos de 150 milisegundos tras la interacción del usuario.
- **SC-004**: Cero videos ubicados fuera del viewport inicial descargan segmentos de datos hasta que el scroll del usuario los acerca al área visible.
- **SC-005**: El 100% de las reproducciones en Hero y previsualizaciones hover se ejecutan sin emisión accidental de sonido (`muted`), cumpliendo rigurosamente con las políticas de autoplay de los navegadores modernos.
- **SC-006**: El cierre del modal detiene el audio y la reproducción en menos de 50 milisegundos, garantizando que no existan fugas de sonido en segundo plano ni pérdida de la posición de navegación previa del usuario.
- **SC-007**: El 100% de la experiencia de navegación del portafolio se ejecuta sin recargas de página completas ni peticiones a bases de datos en tiempo de ejecución.
- **SC-008**: El artefacto de entrega de la aplicación se empaqueta de forma autónoma y puede inicializarse y servirse en entornos de despliegue en menos de 60 segundos sin dependencias de servicios de base de datos externos.

## Assumptions

- **Alojamiento Local de Medios**: Los archivos de video y miniaturas estáticas residen en carpetas públicas locales dentro del paquete estático (`public/videos/` y `public/thumbnails/`).
- **Codificación Óptima de Video**: Los archivos de video están pre-codificados en formato MP4 (H.264 / AAC) o WebM con metadatos optimizados para inicio rápido web (moov atom al inicio del archivo).
- **Estética Oscura Exclusiva**: La aplicación está concebida exclusivamente con diseño Dark Mode cinematográfico; no se contempla selector de modo claro (Light Mode) en la primera versión para preservar la atmósfera artística.
- **Gestión de Contenido Estática**: La administración y actualización de proyectos se realiza directamente mediante el archivo de datos local (`projects.json`), eliminando la necesidad de un panel administrativo o CMS en esta etapa.
- **Interacción Móvil**: En pantallas táctiles donde el evento hover no existe, el usuario accede directamente a la experiencia cinematográfica a través del modal al pulsar sobre la tarjeta.
