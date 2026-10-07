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
- Favoritos desde el reproductor, las filas, las tarjetas o el atajo `L`; el estado se actualiza en todas las vistas.
- Confirmación visible al agregar o quitar una pista, contador actualizado y persistencia local en IndexedDB.
- Los controles de favorito siguen visibles y accesibles en pantallas táctiles.
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
- **Service Worker Local**: Estrategia *network-first* con respaldo en caché limitada al mismo origen y al ámbito de BeatNest. No intercepta ni almacena solicitudes a servicios de terceros.
- **Respeto a Recursos Locales**: El Service Worker omite intercepciones de streams de audio `blob:` y URLs en memoria para mantener el rendimiento nativo del decodificador del navegador.

---

## 18. Preamplificador y Normalización de Volumen (Auto-Gain)

- **Preamplificador de Ganancia**: Deslizador de ganancia previa ajustable entre -6 dB y +6 dB antes de los filtros del ecualizador para compensar grabaciones de bajo nivel o prevenir saturación digital en pistas con realces pronunciados de graves.
- **Normalización Dinámica (*Auto-Gain*)**: Procesamiento de nivelación basado en un nodo `DynamicsCompressorNode` configurado con compresión musical suave (umbral -20 dB, ratio 3.5:1, ataque 5ms, liberación 200ms) que unifica el volumen percibido entre diferentes pistas.

---

## 19. Paleta de Comandos Global (Command Palette `Ctrl + K` / `Cmd + K`)

- **Búsqueda Unificada Ultrarrápida**: Acceso instantáneo a cualquier acción, pista, artista, álbum o lista de reproducción con filtrado difuso.
- **Navegación Totalmente por Teclado**: Soporte para flechas arriba/abajo, Enter para ejecutar o reproducir, y Escape para cerrar.
- **Acceso Rápido en Barra Superior**: Botón con insignia `Ctrl+K` integrado dentro del buscador principal de la barra de navegación.

---

## 20. Fondo Ambiental Dinámico Adaptativo a la Carátula

- **Muestreo Cromático en Tiempo Real**: Análisis de píxeles mediante un lienzo HTML5 Canvas de baja resolución que extrae los dos colores dominantes y más saturados del arte del álbum.
- **Halos de Gradiente Reactivos**: Variables CSS dinámicas (`--dynamic-glow-1`, `--dynamic-glow-2`) que transforman suavemente el fondo de la biblioteca y el reproductor en sintonía con la pista en curso.

---

## 21. Generador de Tarjetas de Pista Compartibles (Now Playing Card)

- **Renderizado Gráfico en Alta Definición**: Lienzo Canvas 1200x630 píxeles que compone el arte de la carátula, título, artista, álbum, duración, espectro gráfico de ondas simuladas y marca de agua BeatNest.
- **Exportación en 1 Clic**: Descarga directa de la tarjeta generada en formato PNG de alta fidelidad o copia rápida del texto descriptivo al portapapeles.

---

## 22. Estadísticas y Métricas de Escucha Locales (BeatNest Insights)

- **Métricas 100% Privadas en el Dispositivo**:
  - Tiempo total acumulado de audio (horas y minutos).
  - Número total de pistas, favoritos, listas de reproducción e historial.
  - Artistas y álbumes más recurrentes con barras visuales de frecuencia.
  - Desglose porcentual por géneros musicales.
  - Conteo de elementos únicos sin transmitir ningún dato fuera del navegador.

---

## 23. Sistema de Notificaciones Flotantes (Toasts) Unificado

- Avisos elegantes con iconos semánticos y temporizador de auto-cierre para operaciones críticas (generación de respaldo, restauración de datos, actualización de metadatos, copia al portapapeles).

---

## 24. Reordenamiento Manual en Listas de Reproducción

- Opciones de «Subir posición» y «Bajar posición» en el menú contextual de filas para personalizar el orden de las canciones en cualquier lista, persistiendo la nueva disposición de forma inmediata en IndexedDB.

---

## 25. Micro-Fade al Pausar y Reanudar (Zero-Click Audio)

- **Eliminación de Transitorios Digitales**: Al pausar o reanudar, el motor de audio aplica una rampa exponencial y lineal de ganancia ultra-rápida (35 a 40 ms) en el nodo maestro antes de invocar la pausa o reproducción del elemento HTML.
- **Experiencia Acústica Suave**: Previene chasquidos o ruidos bruscos en auriculares y altavoces provocados por la interrupción abrupta de la forma de onda en amplitudes no nulas.

---

## 26. Presets de Ecualizador Personalizados

- **Creación en Caliente**: Guarda cualquier configuración de las 5 bandas paramétricas con un nombre personalizado mediante el botón «Guardar actual».
- **Gestión Completa**: Visualización de presets de usuario en una sección dedicada «Mis Presets» con activación rápida y eliminación en un clic.
- **Persistencia Local**: Almacenamiento automático y seguro en el almacenamiento del navegador.

---

## 27. Gestión Avanzada de la Cola de Reproducción

- **Guardar Cola como Playlist**: Botón integrado en la cabecera de la cola que permite convertir todas las pistas en cola en una nueva lista de reproducción permanente.
- **Limpieza Selectiva de Cola**: Opciones para vaciar toda la cola o descartar únicamente las pistas siguientes (*Limpiar siguientes*) conservando la pista en reproducción activa.
- **Reordenamiento Rápido**: Flechas de subir/bajar posición por cada pista en la cola.

---

## 28. Listas de Reproducción Inteligentes (Smart Playlists)

- **Más reproducidas**: Pistas con actividad (`playCount > 0`), ordenadas de mayor a menor número de reproducciones.
- **Añadidas recientemente**: Biblioteca ordenada por fecha de importación, con las últimas incorporaciones primero.
- **Pistas largas (+5 min)**: Selección automática de temas épicos, sesiones y pistas con duración mayor o igual a 300 segundos.
- **Acceso Directo en Barra Lateral**: Sección dedicada «Listas Inteligentes» con insignias de conteo numérico en tiempo real.

---

## 29. Filtrado por Formato de Audio y Ordenamiento Multicriterio

- **Selector Rápido de Formatos**: Chips interactivos para filtrar la vista activa por contenedor: `ALL`, `MP3`, `FLAC`, `WAV`, `OGG`, `M4A`.
- **Ordenamiento Ampliado**: Selección directa en la barra de navegación entre Título, Artista, Álbum, Duración, Fecha de adición y «Más reproducidas» con alternancia ascendente/descendente.

---

## 30. Exportación de Listas de Reproducción (.M3U)

- **Compatibilidad con Reproductores Externos**: Descarga de archivos estándar de lista de reproducción `.m3u` con directivas `#EXTM3U` y metadatos `#EXTINF` (duración, artista, título y nombre de archivo).
- **Exportación en 1 Clic**: Disponible directamente en la fila de cada lista en la barra lateral y en la cabecera de la vista de playlist.

---

## 31. Persistencia de Binarios de Audio en IndexedDB

- **Almacenamiento Local de Datos de Audio**: Guardado del blob binario de cada pista importada en IndexedDB (`StoredTrack.audioData`), permitiendo rehidratar pistas y reproducirlas entre sesiones sin perder la fuente original de audio.
- **Gestión de Cuota de Disco**: Manejo transparente de cuota para priorizar metadatos y portadas en caso de límites de almacenamiento en navegadores estrictos.

---

## 32. Rediseño UX/UI Liquid Glass y Modo Oscuro Obsidian

- **Estética Liquid Glass Refinada**: Paneles y dock con refracción especular de alta definición, bordes luminosos sutiles y contraste de grado estudio musical.
- **Modo Oscuro Predeterminado**: La aplicación inicializa por defecto en modo oscuro obsidian (`#09090E`), permitiendo que el arte de los álbumes y las formas de onda resalten con máximo contraste.
- **Dock Inferior Rebalanceado (12 Columnas)**: Reorganización en rejilla donde el centro cuenta con el 50% del ancho para máxima amplitud de los controles y del Waveform Scrubber.
- **Menú Flotante de Herramientas de Audio**: Panel popover que agrupa controles secundarios (velocidad de reproducción, selector de crossfade, temporizador de apagado, visualizador y mini-reproductor) evitando sobrecarga en la barra principal.

---

## 33. Gestor de Carátulas e Imágenes de Canciones

- **Subida y Arrastre de Fotos**: Selector de archivos e interactividad drag & drop en el modal de edición de metadatos para asignar imágenes (PNG, JPG, WEBP) a cualquier canción.
- **Generador de Arte Procedural**: Motor basado en Canvas que dibuja ondas de sonido y degradados de color personalizados para crear portadas de estudio al instante si no se dispone de un archivo.
- **Acceso Rápido**: Opción «Cambiar carátula / foto» integrada directamente en el menú de tres puntos de filas y tarjetas.
- **Persistencia en IndexedDB**: Las portadas se almacenan localmente y se propagan en tiempo real al reproductor activo, cola y mini-reproductor.

---

## 34. Listas de Reproducción Estilo Spotify

- **Vista Inmersiva de Playlist**: Encabezado con tipografía prominente, información de duración y conteo de pistas.
- **Collage Automático 2x2**: Generación dinámica de una cuadrícula de 4 carátulas con las primeras canciones de la playlist si no cuenta con portada propia, o soporte para subir una foto personalizada.
- **Sección «Añadir canciones a esta playlist»**: Listado inferior integrado que muestra canciones de la biblioteca aún no añadidas, con botón rápido `+ Añadir` para incorporar temas en un solo clic.
- **Hub de Playlists**: Vista general en cuadrícula accesible desde la barra lateral con tarjetas interactivas y botón de reproducción flotante al pasar el cursor.

---

## 35. Reproducción Completa y Aleatoria de Listas

- **Reproducir Todo**: Carga la totalidad de las pistas visibles en la pantalla (biblioteca completa, género o playlist) en la cola activa y comienza desde la pista inicial de forma instantánea.
- **Reproducción Aleatoria (Shuffle Play)**: Botón dedicado que desordena las pistas antes de iniciar para escuchar la selección con distribución aleatoria.
- **Notificaciones Informativas**: Avisos flotantes que confirman la cantidad de canciones encoladas al iniciar la reproducción.

---

## 36. Motor de Crossfade Refinado y Pack de Demostración

- **Transición sin Cortes y Curvas Sincronizadas**: Conmutación inmediata de canal activo y programación de rampas de volumen lineales justo al comenzar a fluir el audio entrante, eliminando retardos o saltos abruptos.
- **Bloqueo de Cascada por ID (`lastCrossfadedTrackId`)**: Previene la activación repetida del crossfade en la misma pista, garantizando que cada canción complete su duración.
- **Pack Demo Integrado**: Generador en memoria de 3 pistas musicales sintetizadas completas de 14 segundos («Aurora Synthwave», «Velvet Horizon» y «Cyber Pulse») con portadas artísticas y la playlist «Favoritos Synth & Chill», permitiendo evaluar inmediatamente el reproductor, la cola y el crossfade.

---

## 37. Inicio y Navegación de Biblioteca

- **Inicio de escucha**: Panel con la pista activa, el historial reciente, las últimas incorporaciones, las canciones más reproducidas y acceso a playlists.
- **Rutas con historial**: Secciones, artistas, álbumes y playlists se reflejan en el fragmento de URL. Atrás/Adelante restaura la sección y los filtros; las vistas también se pueden abrir mediante un enlace directo.
- **Navegación por colección**: Seleccionar una tarjeta de artista o álbum abre su detalle con canciones y acciones de reproducción; el botón de reproducción directa permanece separado de la navegación.
- **Búsqueda por sección**: Buscar desde Inicio abre resultados de canciones; desde Artistas y Álbumes filtra tarjetas por sus metadatos y canciones. La paleta `Ctrl + K` / `Cmd + K` también permite abrir artistas y álbumes.
- **Filtros visibles**: Texto, formato y género activos se muestran como chips y pueden quitarse individualmente o limpiarse juntos. Los filtros se conservan en la URL.
- **Controles contextuales**: Orden y modo de vista se muestran únicamente en secciones donde tienen efecto. En móvil, seleccionar un destino cierra el panel lateral.

---

## 38. Reproductor Personalizable

- **Vista Compacta o Completa**: La vista compacta reduce el tamaño del dock y oculta la forma de onda; la completa conserva el control de búsqueda de posición.
- **Accesos configurables**: Se pueden mostrar u ocultar favoritos, letras, ecualizador, cola, herramientas de audio y control de volumen. Los controles principales de reproducción permanecen disponibles.
- **Diseño adaptable**: Las preferencias se reflejan en el dock de escritorio y en los controles secundarios del dock móvil.
- **Persistencia local**: La distribución y los controles se guardan en el almacenamiento del navegador del dispositivo.

## 39. Perfiles de Audio por Género y Playlist

- **Captura de configuración**: Guarda como perfil una instantánea del ecualizador de cinco bandas, su estado de activación, la reverberación, el preamplificador y la normalización de volumen.
- **Aplicación automática**: Asigna un perfil a un género o a una playlist. Se aplica al iniciar cada pista; la asignación de playlist tiene prioridad sobre la de género.
- **Gestión**: Los perfiles se pueden aplicar manualmente o eliminar; al eliminar un perfil también se quitan sus asignaciones.
- **Persistencia local**: Los perfiles y asociaciones se almacenan en el navegador. La biblioteca musical y los archivos de audio no se modifican.

---

## 40. Personalización de Apariencia Liquid Glass

- **Paletas de acento**: Selección entre cinco combinaciones de color que actualizan los controles y resaltados de la interfaz.
- **Material Liquid Glass**: Ajustes de opacidad, desenfoque y reflejos para paneles, tarjetas y dock.
- **Resplandor ambiental**: Se puede desactivar y graduar su intensidad.
- **Previsualización segura**: Los cambios se ven antes de guardarlos; «Cancelar» y Escape restauran la apariencia aplicada.
- **Persistencia local**: Preferencias guardadas en `beatnest_appearance` y aplicadas tanto al modo claro como al oscuro.

## 41. Inicio Configurable

- **Secciones personalizables**: Mostrar, ocultar y reordenar «Escuchado recientemente», «Añadido recientemente», «Más reproducido» y playlists.
- **Cantidad de tarjetas**: Elegir entre 3, 6 o 9 elementos por sección.
- **Página de inicio**: Restaurar la última sección o iniciar en Inicio, Todas las pistas o Favoritos.
- **Acceso contextual**: El botón «Personalizar Inicio» abre los ajustes directamente desde el panel Inicio.
- **Collage de playlists**: Las tarjetas muestran una portada propia, un collage automático de las carátulas de sus pistas o un icono de respaldo.
- **Persistencia local**: El diseño se almacena en `beatnest_home_dashboard`.

## 42. Densidad y Cuadrícula de Biblioteca

- **Densidad**: Alternar entre filas y tarjetas cómodas o compactas.
- **Columnas configurables**: En pantallas grandes se pueden elegir entre 2 y 6 columnas; en pantallas pequeñas la cuadrícula se adapta al ancho.
- **Persistencia local**: Las preferencias se guardan en `beatnest_library_display`.
