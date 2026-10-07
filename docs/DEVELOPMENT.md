# Guía de Desarrollo y Contribución — BeatNest

Información para la configuración del entorno de desarrollo local, estándares de código y convenciones de BeatNest.

---

## 1. Requisitos Previos

- **Node.js**: Versión 18.x o superior (probado en v24.x).
- **npm**: Versión 9.x o superior.
- **Navegador Web Moderno**: Chrome, Edge, Firefox, Brave o Safari con soporte para Web Audio API e IndexedDB.

---

## 2. Comandos Disponibles

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar proyecto para producción (typecheck + vite build)
npm run build

# Previsualizar el bundle de producción
npm run preview

# Ejecutar el linter estático
npm run lint
```

---

## 3. Convenciones y Estándares de Diseño

### 3.1 Iconografía
- Toda la representación gráfica y señalética visual emplea componentes vectoriales SVG de **Lucide React**, garantizando nitidez en cualquier resolución y alineación armónica con el tema oscuro.

### 3.2 Paleta de Colores Oficial
- **Fondo principal**: `#0F0F12`
- **Superficie de componentes**: `#1A1A1F`
- **Superficie elevada / Cards**: `#24242B`
- **Bordes y separadores**: `#2E2E38`
- **Color primario (Violeta)**: `#7C5CFF`
- **Color de acento (Cian)**: `#4FD1C5`
- **Texto principal**: `#F5F5F7`
- **Texto secundario**: `#A0A0AB`

### 3.3 Tipografía
- Se emplea la pila de fuentes del sistema (`system-ui`, Segoe UI, Roboto, sans-serif) para mantener la interfaz sin solicitudes a proveedores externos.
- Para valores temporales, contadores e información técnica se debe usar fuentes monoespaciadas (`font-mono`) con ancho tabular (`tabular-nums`).

### 3.4 Privacidad Estricta
- Ningún archivo, metadata, hash o contenido de audio debe ser transmitido a servidores remotos ni a servicios de análisis o telemetría.
- Toda la persistencia debe realizarse localmente en el navegador mediante **IndexedDB**.

### 3.5 Estructura Modular y Responsabilidades
- Mantener componentes y módulos enfocados en una responsabilidad. Dividir por comportamiento cohesivo y dependencias; usar el tamaño como señal para revisar un módulo, no como límite rígido.
- La lógica de síntesis de audio, cálculo de frecuencias o manipulación binaria debe residir en módulos de servicio dentro de `src/lib/`.
- El estado visual de modales, modos de visualización y cajones reside en `useUIStore`; la cola y reproducción en `usePlayerStore`; EQ y efectos en `useAudioSettingsStore`.
- Los stores son la fuente de verdad del estado y coordinan sus acciones. `useLibraryStore` delega el pipeline de importación a `src/lib/libraryImport.ts`; los módulos de `src/lib/` concentran procesamiento especializado y operaciones de dominio, mientras la persistencia CRUD permanece cerca de los stores que la coordinan.
- En la biblioteca, `LibraryView` compone secciones y delega cabecera, filtros y datos derivados en módulos especializados. `Sidebar` compone navegación y playlists; `LibrarySidebarActions` maneja respaldos y acciones auxiliares.
- `EditTrackModal` coordina la edición de metadatos y `TrackCoverEditor` se ocupa de seleccionar, generar y previsualizar carátulas. Mantén el intercambio entre ambos explícito mediante props y callbacks.

### 3.6 Sistema visual Liquid Glass y legibilidad
- Usa `.liquid-glass` para paneles principales, `.liquid-glass-subtle` para controles y superficies secundarias, `.liquid-glass-elevated` para diálogos y menús, y `.liquid-dock` para el reproductor flotante.
- Mantén la transparencia, el desenfoque, los reflejos y las sombras en los tokens de `src/index.css`; evita volver opacas las superficies con fondos sólidos locales salvo que el contenido necesite aislamiento.
- Para texto de interfaz, prioriza `text-xs` (13 px) o superior. Reserva tamaños menores para etiquetas técnicas cortas y conserva contraste alto en texto secundario; evita reducir contraste usando opacidad en textos informativos.
- Los controles deben conservar un indicador `:focus-visible`, y las animaciones deben respetar `prefers-reduced-motion`.
