# Referencia de API y Módulos — BeatNest

Documentación de los tipos, almacenes de estado y módulos principales de BeatNest.

---

## 1. Tipos de Datos (`src/types/music.ts`)

### `Track`
Representa una canción cargada en la biblioteca o cola de reproducción:

```typescript
export interface Track {
  id: string;              // Identificador único (nombre-tamano-timestamp)
  title: string;           // Título extraído de ID3 o nombre de archivo
  artist: string;          // Nombre del artista o grupo
  album: string;           // Nombre del álbum
  duration: number;        // Duración en segundos
  year?: number;           // Año de lanzamiento (opcional)
  genre?: string;          // Género musical (opcional)
  coverUrl?: string;       // ObjectURL temporal para renderizado en sesión
  coverData?: Blob | null; // Blob de la imagen persistido en IndexedDB
  file?: File;             // Instancia File activa en la sesión del navegador
  fileName: string;        // Nombre físico del archivo
  fileSize: number;        // Tamaño en bytes
  fileType: string;        // Tipo MIME (ej: audio/mpeg, audio/flac)
  dateAdded: number;       // Timestamp unix de incorporación
  isFavorite?: boolean;    // Estado de favorito
  playCount?: number;      // Contador de reproducciones
}
```

### `Playlist`
Representa una lista de reproducción personalizada:

```typescript
export interface Playlist {
  id: string;              // Identificador único
  name: string;            // Nombre de la playlist
  description?: string;    // Descripción opcional
  trackIds: string[];      // Lista ordenada de IDs de canciones
  coverUrl?: string;       // URL en memoria o blob URL de la carátula personalizada
  coverData?: Blob | null; // Blob binario de la imagen persistido en IndexedDB
  createdAt: number;       // Fecha de creación
  updatedAt: number;       // Fecha de última modificación
}
```

---

## 2. Motor de Audio (`src/lib/audioEngine.ts`)

La clase `AudioEngine` expone un singleton para controlar el flujo de reproducción y nodos Web Audio:

### Métodos Principales:
- `getInstance(): AudioEngine`: Retorna la instancia compartida.
- `initAudioContext(): Promise<void>`: Inicializa o reanuda el `AudioContext` tras interacción de usuario.
- `loadTrack(fileOrUrl: File | string, crossfadeSec?: number): Promise<void>`: Carga una pista con soporte para crossfade continuo de doble canal (fade-in en canal receptor y fade-out en canal emisor sincronizados vía nodos `GainNode`).
- `stop(): void`: Detiene la reproducción en ambos canales y resetea el tiempo a cero.
- `play(): Promise<void>`: Inicia la reproducción de audio.
- `pause(): void`: Pausa la reproducción de audio.
- `seek(seconds: number): void`: Desplaza la posición de reproducción a la marca de tiempo indicada.
- `setVolume(vol: number): void`: Ajusta el nivel de ganancia entre 0.0 y 1.0.
- `setMuted(muted: boolean): void`: Silencia o desactiva el silenciado de la salida.
- `setPlaybackRate(rate: number): void`: Modifica la velocidad de reproducción (0.8x a 2.0x).
- `setEqGain(bandIndex: number, gainValue: number): void`: Ajusta la ganancia en dB de una de las 5 bandas (-12 a +12 dB).
- `applyPreset(presetGains: [number, number, number, number, number]): void`: Aplica un conjunto de 5 ganancias predefinidas.
- `setEqEnabled(enabled: boolean, currentGains: [...] ): void`: Alterna entre el ecualizador activo y el modo bypass (0 dB).
- `getAnalyser(): AnalyserNode | null`: Retorna el nodo analizador para alimentar los visualizadores Canvas.

---

## 3. Almacén del Reproductor (`src/stores/usePlayerStore.ts`)

Gestionado con Zustand. Expone el estado reactivo del reproductor:

| Propiedad / Método | Tipo | Descripción |
| :--- | :--- | :--- |
| `currentTrack` | `Track \| null` | Pista actualmente cargada |
| `isPlaying` | `boolean` | Estado de reproducción |
| `currentTime` | `number` | Posición en segundos |
| `duration` | `number` | Duración total en segundos |
| `volume` | `number` | Volumen (0 a 1) |
| `isMuted` | `boolean` | Indicador de silencio |
| `repeatMode` | `'off' \| 'all' \| 'one'` | Modo de repetición |
| `isShuffled` | `boolean` | Modo aleatorio |
| `queue` | `Track[]` | Lista de reproducción en cola |
| `queueIndex` | `number` | Índice de la pista en curso en la cola |
| `playTrack(track, queue?)` | `Promise<void>` | Reproduce una pista e inicializa cola |
| `togglePlay()` | `void` | Alterna reproducción y pausa |
| `nextTrack()` / `prevTrack()` | `void` | Salto de pista |
| `seek(seconds)` | `void` | Búsqueda temporal |

## 4. Ajustes de audio (`src/stores/useAudioSettingsStore.ts`)

Mantiene por separado los parámetros de procesamiento del motor:

- `eqGains`, `eqEnabled`, `activePresetId` y `customPresets` para ecualización.
- `reverbMode`, `preampGain` y `autoGainEnabled` para efectos y nivelación.
- Acciones para aplicar/guardar presets y ajustar esos parámetros en `AudioEngine`.
- Los estados de apertura del ecualizador y visualizador permanecen en `useUIStore`.

---

## 5. Almacén de Biblioteca (`src/stores/useLibraryStore.ts`)

Administra colecciones, playlists y controles de navegación. La extracción y escritura de archivos se delega en `src/lib/libraryImport.ts`; los cálculos de filtros, agrupaciones y listas visibles están en `src/components/Library/useLibraryViewModel.ts`.

| Método | Descripción |
| :--- | :--- |
| `loadFromDatabase()` | Hidrata la biblioteca desde IndexedDB recreando ObjectURLs de carátulas |
| `importFiles(fileList)` | Filtra archivos válidos y extrae metadatos en segundo plano |
| `importDirectoryWithPicker()` | Invoca `showDirectoryPicker()` o fallback para importar carpetas enteras |
| `toggleFavorite(trackId)` | Alterna el estado de favorito y sincroniza con IndexedDB |
| `createPlaylist(name, desc)` | Crea una nueva lista y la persiste en IndexedDB |
| `deletePlaylist(playlistId)` | Elimina la lista de reproducción seleccionada |
| `addTrackToPlaylist(plId, trackId)` | Asocia una pista a la lista |
| `removeTrackFromPlaylist(plId, trackId)` | Desvincula una pista de la lista |
| `updateTrackCover(trackId, blob)` | Actualiza la carátula de una pista con un Blob binario, genera preview en memoria y persiste en IndexedDB |
| `updatePlaylistCover(plId, blob)` | Asigna o reemplaza la carátula personalizada de una playlist persistiendo el Blob en IndexedDB |
| `loadDemoPack()` | Sintetiza e inserta 3 pistas demo de estudio con carátulas procedurales y genera una playlist temática inicial |
| `setSearchQuery(query)` | Aplica filtro de búsqueda en tiempo real |
| `setSort(field, order)` | Modifica el criterio y dirección de ordenación |

## 6. Componentes de biblioteca

- `src/components/Library/LibraryView.tsx`: compone la vista de biblioteca y conecta el estado con los controles de presentación.
- `LibraryHeader.tsx`, `LibraryFilters.tsx` y `useLibraryViewModel.ts`: presentan cabeceras y filtros, y calculan las colecciones visibles sin mezclar esos cálculos con el store.
- `Sidebar.tsx` mantiene navegación y playlists; `LibrarySidebarActions.tsx` encapsula respaldo/restauración y accesos a estadísticas y atajos.
- `EditTrackModal.tsx` guarda metadatos y coordina la edición; `TrackCoverEditor.tsx` gestiona por separado la selección, generación y previsualización de carátulas.
