# Guía de Funcionalidades — BeatNest

BeatNest integra un conjunto completo de características orientadas a audiófilos y usuarios con bibliotecas musicales locales.

---

## 1. Importación y Manejo de Archivos

- **Apertura de Carpetas**: Soporta la lectura masiva de directorios anidados con subcarpetas de álbumes y artistas.
- **Añadir Archivos Sueltos**: Selector múltiple con filtro de tipos de audio.
- **Formatos Soportados**: MP3, FLAC, WAV, OGG, M4A, AAC, OPUS, WMA y WebM.
- **Generador de Pista Demo**: Síntesis en tiempo real de una pista armónica arpegiada (acorde de Do Mayor) generada con `AudioBuffer` y codificada a formato WAV en memoria, permitiendo evaluar el reproductor sin necesidad de contar con archivos locales.

---

## 2. Ecualizador Paramétrico de 5 Bandas

Permite ajustar la respuesta en frecuencia en tiempo real entre -12 dB y +12 dB.

### Bandas de Frecuencia:
- **60 Hz**: Graves profundos (Sub-bass / Low-shelf).
- **250 Hz**: Calidez y cuerpo de bajos y percusión media (Peaking).
- **1 kHz**: Rango vocal y presencia instrumental principal (Peaking).
- **4 kHz**: Definición, ataque y claridad de voces (Peaking).
- **16 kHz**: Brillo, aire y platillos (High-shelf).

### Presets Incluidos:
- **Plano**: Respuesta neutra [0, 0, 0, 0, 0 dB].
- **Bass Boost**: Refuerzo de frecuencias bajas [+7, +4, 0, -1, -2 dB].
- **Rock**: Curva clásica en V [+4, +2, -1, +3, +5 dB].
- **Pop**: Refuerzo vocal y agudo equilibrado [-1, +2, +4, +2, -1 dB].
- **Voces**: Énfasis en medios vocales [-3, +1, +5, +3, 0 dB].
- **Electrónica**: Bajos y agudos enérgicos [+5, +3, -1, +2, +4 dB].
- **Jazz**: Calidez acústica [+3, +1, +1, +2, +3 dB].
- **Personalizado**: Al mover manualmente cualquier control deslizante.

Incluye interruptor de encendido/apagado (*Bypass*) para comparación directa inmediata.

---

## 3. Visualizador de Audio Reactivo (Canvas 60fps)

Renderizado mediante Web Audio API (`AnalyserNode`) sobre un elemento HTML5 Canvas optimizado para pantallas Retina y alta densidad:

1. **Barras de espectro**: 64 barras de frecuencia con degradado vertical violeta a cian y marcadores de pico dinámicos.
2. **Osciloscopio**: Onda en dominio temporal con resplandor cian reactivo.
3. **Radial 360°**: Espectrograma circular con núcleo pulsante para una experiencia inmersiva.
4. **Pulso reactivo**: Núcleo central con detección de impacto de graves (sub-bass) y partículas flotantes.

Incluye soporte para modo **Pantalla Completa** (`requestFullscreen`) y controles de reproducción superpuestos.

---

## 4. Waveform Scrubber Interactivo

- Visualización con forma de onda de 70 segmentos.
- Animación suave de los segmentos activos durante la reproducción.
- Tooltip flotante con previsualización del tiempo en hover.
- Arrastre (*scrubbing*) fluido con precisión de milisegundos.

---

## 5. Gestión de Playlists y Favoritos

- Creación, edición de descripción y eliminación de listas de reproducción.
- Añadir o quitar canciones desde cualquier fila o tarjeta mediante menú contextual.
- Marcado de pistas favoritas con acceso directo en la barra lateral.
- Persistencia automática de listas y metadatos en IndexedDB mediante Dexie.js.

---

## 6. Cola de Reproducción (Queue)

- Panel lateral desplegable (*slide-out*).
- Indicador animado de la pista en curso.
- Reordenamiento ascendente y descendente.
- Acciones de «Reproducir siguiente» y «Añadir a la cola».
- Vaciado rápido de la cola.

---

## 7. Transición Suave (Crossfade)

- Arquitectura de doble canal en Web Audio API con dos elementos de audio y dos nodos `GainNode`.
- Opciones de duración seleccionables: Desactivado (0s), 2s, 3s, 5s u 8s.
- Rampa de volumen automática (*linearRampToValueAtTime*) para fundir el final de la pista en curso con el inicio de la siguiente sin silencios bruscos ni cortes secos.
- Detección anticipada cuando la canción se aproxima a su final para iniciar la transición automática antes de la terminación de la pista.

---

## 8. Soporte de Letras Sincronizadas (.LRC)

- Analizador automático de archivos `.lrc` que detecta marcas de tiempo múltiples (`[mm:ss.xx]`).
- Emparejamiento automático durante la importación de carpetas cuando un archivo `.lrc` comparte el nombre base del archivo de audio.
- Resaltado dinámico con color cian y tamaño aumentado para la línea activa sincronizada con `currentTime`.
- Desplazamiento automático (*auto-scroll*) centrado de la línea activa durante la reproducción.
- Salto temporal interactivo (*seek*): al hacer clic sobre cualquier línea de la letra, la reproducción salta inmediatamente a ese segundo exacto.
- Soporte para carga manual de archivos `.lrc` o pegado directo de texto en tiempo real con persistencia en IndexedDB.

---

## 9. Mini Reproductor Flotante

- Modo compacto flotante en la esquina inferior de la pantalla.
- Carátula, título, artista y barra de progreso en miniatura.
- Controles esenciales de reproducción y botón de restauración rápida a pantalla completa.

---

## 10. Atajos de Teclado Globales

| Tecla | Acción |
| :--- | :--- |
| **Espacio** | Reproducir / Pausar |
| **Flecha Derecha** | Avanzar 5 segundos |
| **Flecha Izquierda** | Retroceder 5 segundos |
| **Flecha Arriba** | Subir volumen (+5%) |
| **Flecha Abajo** | Bajar volumen (-5%) |
| **M** | Silenciar / Restaurar volumen (*Mute*) |
| **L** | Añadir / Quitar de favoritos (*Like*) |
| **S** | Alternar modo aleatorio (*Shuffle*) |
| **R** | Ciclo de repetición (*Desactivado / Todo / Una*) |
| **V** | Abrir / Cerrar visualizador de audio |
| **E** | Abrir / Cerrar ecualizador |
| **T** | Abrir / Cerrar letras sincronizadas |
| **?** | Abrir ventana de atajos de teclado |
| **Esc** | Cerrar cualquier ventana o modal activo |

---

## 11. Animaciones y Microinteracciones

- **Indicador de Ecualizador en Vivo**: Barras animadas dinámicas que reflejan la actividad sonora de la pista en curso en vistas de lista, tarjetas de cuadrícula y cola de reproducción.
- **Transiciones Modales y Paneles**: Animaciones `fadeScale` y `slideLeft` con curvas cúbicas suaves para modales, menús contextuales y el panel deslizante de cola.
- **Fondo Ambiental Flotante**: Halos de gradiente orgánico `floatAmbient` que aportan profundidad visual sin impacto en el rendimiento de renderizado a 60 FPS.
- **Microinteracciones en Controles**: Rebotes elásticos al presionar botones principales, resaltado y zoom sutil en carátulas activas, y seguimiento suave en el depurador de ondas de audio.

---

## 12. Temporizador de Apagado (Sleep Timer) con Desvanecimiento

- **Opciones de Tiempo**: Presets de 15, 30, 45, 60 minutos, o al finalizar la canción actual.
- **Desvanecimiento Progresivo (*Fade-Out*)**: Durante los últimos 45 segundos del temporizador, el motor de audio reduce gradualmente la ganancia principal a cero de manera imperceptible para evitar cortes abruptos durante el sueño.
- **Pausa Automática y Restauración**: Al expirar el tiempo, el reproductor pausa la reproducción y restaura el volumen al valor nominal para la próxima sesión.
- **Indicador Visual**: Botón con insignia temporal en tiempo real y punto pulsante en la barra de control inferior.

---

## 13. Acústica Espacial (Reverberación de Sala)

- **Simulador Convolutivo**: Integración de un nodo `ConvolverNode` en la cadena de procesamiento de Web Audio API.
- **Generación de Impulso Sintético**: Construcción matemática en memoria de respuestas al impulso estéreo con envolvente de decaimiento exponencial (`decay = Math.pow(1 - t, decayRate)`), eliminando la dependencia de descargas de archivos externos de audio y garantizando funcionamiento offline absoluto.
- **Modos Acústicos**:
  - **Desactivado**: Señal pura en seco (*Dry 100%, Wet 0%*).
  - **Habitación (*Room*)**: Espacio íntimo con reverberación corta (1.2s).
  - **Sala de Conciertos (*Hall*)**: Espacio amplio con profundidad media (2.5s).
  - **Catedral (*Cathedral*)**: Espacio monumental con decaimiento prolongado (4.2s).
- **Control Integrado**: Selector por botones segmentados en el modal de ecualización.

---

## 14. Respaldo y Restauración de Biblioteca (JSON)

- **Exportación Segura**: Descarga un archivo JSON estructurado con listas de reproducción, metadatos, favoritos, fechas de adición y letras personalizadas.
- **Validación de Esquema**: Analiza el archivo importado, valida tipos y versión de esquema antes de escribir en IndexedDB.
- **Sincronización Inmediata**: Actualiza la base de datos Dexie y rehidrata los estados de Zustand en tiempo real sin requerir recargar la página.
- **Acceso Directo**: Botones dedicados de «Respaldar» y «Restaurar» ubicados en el pie de la barra lateral.

---

## 15. Historial Reciente y Filtros por Género

- **Historial de Reproducción**: Pestaña dedicada en la barra lateral que almacena en orden cronológico inverso las últimas 50 pistas reproducidas.
- **Filtro de Géneros por Chips**: Fila horizontal de etiquetas dinámicas calculadas a partir de las pistas disponibles en la biblioteca. Permite alternar y filtrar con un solo clic entre géneros como Rock, Pop, Synthwave, Electrónica, etc.

---

## 16. Editor de Metadatos ID3 en Caliente

- **Edición en Tiempo Real**: Modifica título, artista, álbum, género y año de lanzamiento de cualquier pista desde los menús de opciones en tarjetas o filas.
- **Persistencia en IndexedDB**: Guarda las modificaciones en el almacén local de Dexie y propaga los cambios inmediatamente a la cola de reproducción, reproductor activo e interfaz de biblioteca.

---

## 17. Modo Aplicación Web Progresiva (PWA y Soporte Offline)

- **Instalable como Aplicación de Escritorio/Móvil**: Manifiesto web configurado con modo de visualización autónomo (*standalone*) y soporte de temas visuales.
- **Service Worker Local**: Estrategia de caché de recursos estáticos (*network-first* con respaldo en caché) que permite abrir y utilizar BeatNest incluso sin conexión a Internet.
- **Respeto a Recursos Locales**: El Service Worker omite intercepciones de streams de audio `blob:` y URLs en memoria para mantener el rendimiento nativo del decodificador del navegador.


