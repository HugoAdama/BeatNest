# BeatNest — Tu música, sin nube

> Reproductor de audio local que se ejecuta 100% en el navegador. Sin servidores, sin cuentas, sin telemetría. Tus archivos se quedan siempre contigo.

**Sitio web y Demo en vivo**: [https://hugoadama.github.io/BeatNest/](https://hugoadama.github.io/BeatNest/)

---

## Resumen del Proyecto

BeatNest resuelve la dependencia de la nube en los reproductores modernos. Permite seleccionar colecciones de archivos de audio locales o carpetas completas del dispositivo del usuario, extraer sus metadatos (título, artista, álbum, carátula, duración), organizarlos en una biblioteca persistente y reproducirlos con controles completos, ecualizador paramétrico de 5 bandas, visualizador dinámico en Canvas, transiciones cruzadas (crossfade), letras sincronizadas y listas de reproducción.

Todo se procesa en el cliente utilizando APIs nativas del navegador web: **File System Access API**, **Web Audio API** e **IndexedDB**.

---

## Características Principales

- **Privacidad Absoluta**: Cero llamadas de subida a servidores. Los archivos nunca salen de tu ordenador.
- **Acceso a Archivos Locales**: Selección de carpetas directas con la File System Access API y fallback automático de entrada HTML5 para compatibilidad multiplataforma (Chrome, Edge, Firefox, Safari, Brave).
- **Extracción de Metadatos Completa**: Extracción automática de ID3v1, ID3v2, FLAC Vorbis Comments y contenedores MP4 con `music-metadata-browser`, además de cálculo de duración y obtención de carátulas en alta resolución.
- **Transición Suave (Crossfade) y Zero-Click Audio**: Arquitectura de doble canal con nodos `GainNode` para fundir suavemente canciones sin cortes abruptos, protección anticascada y micro-fade analógico de 35-40ms al pausar o dar play.
- **Gestor de Carátulas y Generador de Arte Procedural**: Asignación de fotos mediante selector de archivos o arrastrar y soltar, generador algorítmico de carátulas abstractas en Canvas HTML5 y persistencia completa en IndexedDB.
- **Experiencia de Playlists Estilo Spotify**: Portada dinámica tipo collage 2x2 basada en las canciones de la lista, soporte para carátula propia personalizada, botones directos de «Reproducir todo» y «Aleatorio», y sección integrada para añadir nuevas pistas con un clic.
- **Pack Demo Integrado con Síntesis de Estudio**: Generador offline de 3 pistas completas («Aurora Synthwave», «Velvet Horizon», «Cyber Pulse») con portadas de alta definición y creación automática de lista de reproducción inicial.
- **Diseño Liquid Glass y Dock Rebalanceado**: Interfaz oscura obsidiana con efectos de desenfoque de fondo (*backdrop-blur*), dock inferior en rejilla de 12 columnas y herramientas de audio (ecualizador y visualizador) organizadas en popover flotante sin colisión visual.
- **Letras Sincronizadas (.LRC)**: Analizador integrado con resaltado interactivo estilo karaoke, desplazamiento centrado automático (*auto-scroll*) y salto temporal al hacer clic sobre cualquier verso.
- **Ecualizador Paramétrico de 5 Bandas**: Filtros Web Audio Biquad a 60 Hz, 250 Hz, 1 kHz, 4 kHz y 16 kHz con rango de ganancia de -12 dB a +12 dB, presets integrados y capacidad de guardar **presets personalizados** del usuario.
- **Visualizador de Audio en Tiempo Real (Canvas 60fps)**: 4 modos de visualización reactiva (*Barras de frecuencia, Osciloscopio, Radial 360° y Pulso reactivo*), con soporte para pantalla completa.
- **Waveform Scrubber Interactivo**: Barra de progreso con silueta de onda de audio, previsualización de tiempo al pasar el cursor y búsqueda de posición suave.
- **Persistencia Completa en IndexedDB**: Almacenamiento local mediante Dexie.js para biblioteca, pistas de audio (blobs), favoritos, metadatos y listas de reproducción.
- **Listas Inteligentes Dinámicas**: Acceso instantáneo a listas autocalculadas: «Más reproducidas», «Añadidas recientemente» y «Pistas largas (+5 min)».
- **Cola de Reproducción Avanzada**: Panel lateral deslizable para ordenar, guardar la cola directamente como una nueva lista de reproducción permanente o limpiar pistas siguientes.
- **Exportación Estándar .M3U**: Descarga de listas de reproducción en formato `.m3u` con metadatos extendidos para interoperabilidad con reproductores externos como VLC.
- **Filtros por Formato y Género**: Filtrado instantáneo por contenedor de audio (MP3, FLAC, WAV, OGG, M4A) y chips de género interactivos.
- **Mini Reproductor Flotante**: Modo compacto para mantener el control de la música mientras trabajas en otras pestañas.
- **Atajos de Teclado Globales y Paleta de Comandos**: Control inmediato mediante teclado y paleta universal accesible con `Ctrl + K`.
- **PWA Lista para Instalación**: Soporte sin conexión a internet y manifiesto web.

---

## Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Entorno y Build** | Vite 8 + TypeScript |
| **Framework UI** | React 19 |
| **Estilos y Tema** | Tailwind CSS v4 |
| **Gestión de Estado** | Zustand |
| **Motor de Audio** | Web Audio API + HTMLAudioElement |
| **Visualización** | HTML5 Canvas + AnalyserNode (FFT) |
| **Extracción de Metadatos** | music-metadata-browser |
| **Persistencia Local** | Dexie.js + IndexedDB |
| **Acceso al Sistema de Archivos** | File System Access API |
| **Iconografía** | Lucide React |

---

## Documentación Detallada (`docs/`)

Para profundizar en el diseño técnico, la API interna y las funcionalidades, consulta los documentos de la carpeta `docs/`:

- [docs/APRENDIZAJES_Y_TECNOLOGIAS.md](file:///e:/BeatNest/docs/APRENDIZAJES_Y_TECNOLOGIAS.md): Justificación técnica exhaustiva de cada herramienta del stack y desafíos de ingeniería superados (Web Audio API, Canvas a 60fps, IndexedDB, etc.).
- [docs/ARCHITECTURE.md](file:///e:/BeatNest/docs/ARCHITECTURE.md): Diagrama de flujo, pipeline de audio, nodos Web Audio y modelo de persistencia.
- [docs/FEATURES.md](file:///e:/BeatNest/docs/FEATURES.md): Detalle exhaustivo de cada funcionalidad, bandas del ecualizador, crossfade, letras y atajos de teclado.
- [docs/API_REFERENCE.md](file:///e:/BeatNest/docs/API_REFERENCE.md): Modelos de datos (`Track`, `Playlist`), singleton `AudioEngine` y almacenes de Zustand.
- [docs/DEVELOPMENT.md](file:///e:/BeatNest/docs/DEVELOPMENT.md): Configuración de desarrollo local, estándares de código y convenciones de diseño.

---

## Inicio Rápido

### 1. Clonar e Instalar Dependencias

```bash
git clone https://github.com/HugoAdama/BeatNest.git
cd BeatNest
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173/`.

### 3. Compilar para Producción

```bash
npm run build
```

---

## Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| `Espacio` | Reproducir / Pausar |
| `←` / `→` | Rebobinar / Avanzar 5 segundos |
| `↑` / `↓` | Subir / Bajar volumen (+/- 5%) |
| `M` | Silenciar / Activar sonido |
| `L` | Marcar / Desmarcar favorito |
| `S` | Alternar modo aleatorio (Shuffle) |
| `R` | Ciclo de repetición (Off / All / One) |
| `V` | Abrir / Cerrar visualizador Canvas |
| `E` | Abrir / Cerrar ecualizador paramétrico |
| `T` | Abrir / Cerrar letras sincronizadas |
| `?` | Ver modal de atajos de teclado |
| `Esc` | Cerrar modales o ventanas activas |

---

## Despliegue en GitHub Pages

El proyecto incluye el flujo de trabajo automatizado de GitHub Actions en `.github/workflows/deploy.yml`. Cada push a la rama `main` compila y publica automáticamente la versión más reciente en:

**[https://hugoadama.github.io/BeatNest/](https://hugoadama.github.io/BeatNest/)**

---

## Licencia

Distribuido bajo la licencia MIT.
Tus archivos y tu música pertenecen exclusivamente a tu dispositivo.
