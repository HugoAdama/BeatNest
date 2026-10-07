# Arquitectura Técnica — BeatNest

BeatNest es un reproductor de audio local que se ejecuta íntegramente en el navegador web del cliente. No cuenta con servidor backend, no almacena datos en la nube y no transmite telemetría de archivos.

---

## 1. Diagrama de Flujo General

```
[Usuario]
   │
   ▼
[Selección de Archivos o Carpetas]
   │ (File System Access API / HTML5 input fallback)
   │
   ▼
[Extracción de Metadatos] (music-metadata-browser + HTMLAudioElement)
   │
   ▼
[Capa de Persistencia] (Dexie.js + IndexedDB)
   │
   ▼
[Gestor de Estado] (Zustand: PlayerStore + LibraryStore)
   │
   ▼
[Motor de Audio Web Audio API]
   │
   ├──▶ 5-Band BiquadFilter Parametric Equalizer
   │       (60Hz, 250Hz, 1kHz, 4kHz, 16kHz)
   │
   ├──▶ AnalyserNode (FFT: 512 bins, smoothing: 0.8)
   │       │
   │       ▼
   │     [Canvas Visualizer 60fps]
   │     (Barras, Osciloscopio, Radial, Pulso)
   │
   └──▶ AudioContext.destination (Altavoces / Auriculares)
```

---

## 2. Componentes del Sistema

### 2.1 Acceso a Archivos Locales
- **Chromium (Chrome, Edge, Brave, Opera)**: Utiliza `showDirectoryPicker()` de la File System Access API para iterar de manera recursiva sobre las carpetas seleccionadas por el usuario.
- **Firefox / Safari / Fallback**: Utiliza elementos `<input type="file" webkitdirectory multiple>` o `<input type="file" multiple accept="audio/*">`.
- **Privacidad**: Las referencias en memoria `File` y `Blob` residen exclusivamente en el entorno de ejecución local.

### 2.2 Extracción de Metadatos y Duración
- **Motor principal**: `music-metadata-browser`.
- **Etiquetas analizadas**:
  - Título (`common.title`)
  - Artista / Intérpretes (`common.artist`, `common.artists`)
  - Álbum (`common.album`)
  - Año (`common.year`)
  - Género (`common.genre`)
  - Carátula (`common.picture` -> `Blob` de imagen tipado)
- **Estrategia de Fallback**: Si el archivo carece de etiquetas ID3 válidas o presenta cabeceras dañadas:
  1. Se analiza el nombre del archivo mediante expresiones regulares para separar artista y título (`Artista - Canción.mp3`).
  2. La duración exacta se mide a través de un elemento `HTMLAudioElement` efímero mediante el evento `loadedmetadata`.

### 2.3 Persistencia con Dexie.js (IndexedDB)
La base de datos local `BeatNestDB` se compone de tres tablas:

1. **`tracks`**:
   - Clave primaria: `id` (`nombre-tamano-timestamp`)
   - Índices: `title`, `artist`, `album`, `isFavorite`, `dateAdded`, `fileName`
   - Almacenamiento: Metadatos, duración, tamaño, tipo MIME y carátula persistida como `Blob`.
2. **`playlists`**:
   - Clave primaria: `id`
   - Índices: `name`, `createdAt`, `updatedAt`
   - Almacenamiento: Colección de identificadores de canciones (`trackIds`).
3. **`settings`**:
   - Almacenamiento clave-valor para volumen, modo de visualizador y preset activo del ecualizador.

### 2.4 Cadena de Audio Web Audio API
El singleton `AudioEngine` administra la instancia compartida de `HTMLAudioElement` y `AudioContext`.

```
HTMLAudioElement (stream de audio)
        │
        ▼
MediaElementAudioSourceNode
        │
        ▼
BiquadFilterNode #0 (Lowshelf: 60 Hz)
        │
        ▼
BiquadFilterNode #1 (Peaking: 250 Hz, Q: 1.0)
        │
        ▼
BiquadFilterNode #2 (Peaking: 1 kHz, Q: 1.0)
        │
        ▼
BiquadFilterNode #3 (Peaking: 4 kHz, Q: 1.0)
        │
        ▼
BiquadFilterNode #4 (Highshelf: 16 kHz)
        │
        ▼
AnalyserNode (getByteFrequencyData / getByteTimeDomainData)
        │
        ▼
AudioContext.destination
```

### 2.5 Integración con Media Session API
Sincronización bidireccional con el sistema operativo:
- Muestra el título, artista, álbum y carátula en la pantalla de bloqueo y barra multimedia del sistema.
- Atiende las acciones globales de `play`, `pause`, `previoustrack`, `nexttrack` y `seekto`.

### 2.6 Separación de Responsabilidades y Arquitectura Modular
Para garantizar un mantenimiento óptimo y escalable, el código se estructura en módulos desacoplados:

1. **Gestión de Estado Especializada (`src/stores/`)**:
   - `usePlayerStore`: Controla exclusivamente la reproducción de audio, el progreso, la cola de pistas y los parámetros del ecualizador.
   - `useUIStore`: Administra de manera aislada la visibilidad de modales y paneles (Visualizador, Ecualizador, Letras sincronizadas, Mini Reproductor, Atajos de teclado), evitando re-renderizados innecesarios cuando el temporizador de audio (`currentTime`) se actualiza continuamente.
   - `useLibraryStore`: Gestiona la biblioteca musical, playlists, filtros, búsqueda y persistencia en IndexedDB.
   - `useThemeStore`: Controla el modo claro y modo oscuro.

2. **Capa de Servicios y Utilidades (`src/lib/`)**:
   - `audioEngine.ts`: Manejo de Web Audio API, nodos de ganancia, crossfade dual y análisis espectral.
   - `audioGenerator.ts`: Síntesis de ondas armónicas en memoria y codificación binaria WAV (`audioBufferToWav`).
   - `lyrics.ts`: Procesamiento y emparejamiento de letras en formato LRC.
   - `metadata.ts`: Extracción de metadatos ID3 y formateo de duración.

3. **Descomposición de Componentes de UI**:
   - Vistas orquestadoras limpias respaldadas por subcomponentes enfocados (`LibraryStatsBanner`, `LibraryEmptyState`, `ArtistsGridView`, `AlbumsGridView`, `PlaybackControls`, `VolumeControl`, `PlayerMenus`).

