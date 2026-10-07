# BeatNest — Tu música, sin nube

> Reproductor de audio local que se ejecuta 100% en el navegador. Sin servidores, sin cuentas, sin telemetría. Tus archivos se quedan siempre contigo.

---

## Resumen del Proyecto

BeatNest resuelve la dependencia de la nube en los reproductores modernos. Permite seleccionar colecciones de archivos de audio locales o carpetas completas del dispositivo del usuario, extraer sus metadatos (título, artista, álbum, carátula, duración), organizarlos en una biblioteca persistente y reproducirlos con controles completos, ecualizador paramétrico de 5 bandas, visualizador dinámico en Canvas y listas de reproducción.

Todo se procesa en el cliente utilizando APIs nativas del navegador web: **File System Access API**, **Web Audio API** e **IndexedDB**.

---

## Características Principales

- **Privacidad Absoluta**: Cero llamadas de subida a servidores. Los archivos nunca salen de tu ordenador.
- **Acceso a Archivos Locales**: Selección de carpetas directas con la File System Access API y fallback automático de entrada HTML5 para compatibilidad multiplataforma (Chrome, Edge, Firefox, Safari, Brave).
- **Extracción de Metadatos Completa**: Extracción automática de ID3v1, ID3v2, FLAC Vorbis Comments y contenedores MP4 con `music-metadata-browser`, además de cálculo de duración y obtención de carátulas en alta resolución.
- **Ecualizador Paramétrico de 5 Bandas**: Filtros Web Audio Biquad a 60 Hz, 250 Hz, 1 kHz, 4 kHz y 16 kHz con rango de ganancia de -12 dB a +12 dB y presets integrados (*Plano, Bass Boost, Rock, Pop, Voces, Electrónica, Jazz*).
- **Visualizador de Audio en Tiempo Real (Canvas 60fps)**: 4 modos de visualización reactiva (*Barras de frecuencia, Osciloscopio, Radial 360° y Pulso reactivo*), con soporte para pantalla completa.
- **Waveform Scrubber Interactivo**: Barra de progreso con silueta de onda de audio, previsualización de tiempo al pasar el cursor y búsqueda de posición suave.
- **Persistencia Local con IndexedDB**: Almacenamiento local mediante Dexie.js para biblioteca, canciones favoritas y listas de reproducción.
- **Cola de Reproducción Flexible**: Panel lateral deslizable para ordenar, añadir y gestionar las pistas siguientes.
- **Mini Reproductor Flotante**: Modo compacto para mantener el control de la música mientras trabajas en otras pestañas.
- **Atajos de Teclado Globales**: Control inmediato de reproducción, volumen, silenciamiento, favoritos y modales.
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

- [docs/ARCHITECTURE.md](file:///e:/BeatNest/docs/ARCHITECTURE.md): Diagrama de flujo, pipeline de audio, nodos Web Audio y modelo de persistencia.
- [docs/FEATURES.md](file:///e:/BeatNest/docs/FEATURES.md): Detalle exhaustivo de cada funcionalidad, bandas del ecualizador y atajos de teclado.
- [docs/API_REFERENCE.md](file:///e:/BeatNest/docs/API_REFERENCE.md): Modelos de datos (`Track`, `Playlist`), singleton `AudioEngine` y almacenes de Zustand.
- [docs/DEVELOPMENT.md](file:///e:/BeatNest/docs/DEVELOPMENT.md): Configuración de desarrollo local, estándares de código y convenciones de diseño.

---

## Inicio Rápido

### 1. Clonar e Instalar Dependencias

```bash
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
| `?` | Ver modal de atajos de teclado |
| `Esc` | Cerrar modales o ventanas activas |

---

## Licencia

Distribuido bajo la licencia MIT.
Tus archivos y tu música pertenecen exclusivamente a tu dispositivo.
