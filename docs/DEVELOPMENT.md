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
- Se emplea la fuente **Inter** como tipografía base, complementada por fuentes del sistema de respaldo (`sans-serif`).
- Para valores temporales, contadores e información técnica se debe usar fuentes monoespaciadas (`font-mono`) con ancho tabular (`tabular-nums`).

### 3.4 Privacidad Estricta
- Ningún archivo, metadata, hash o contenido de audio debe ser transmitido a servidores remotos ni a servicios de análisis o telemetría.
- Toda la persistencia debe realizarse localmente en el navegador mediante **IndexedDB**.
