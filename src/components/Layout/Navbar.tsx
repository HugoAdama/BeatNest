import React from 'react';
import {
  Search,
  X,
  List,
  LayoutGrid,
  ArrowUpDown,
  Activity,
  Sliders,
  Loader2,
  Sun,
  Moon,
  Menu,
} from 'lucide-react';
import { useLibraryStore, type SortField } from '../../stores/useLibraryStore';
import { useAudioSettingsStore } from '../../stores/useAudioSettingsStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useUIStore } from '../../stores/useUIStore';

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    setSort,
    isScanning,
    scanProgress,
  } = useLibraryStore();

  const { eqEnabled } = useAudioSettingsStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleMobileSidebar, toggleVisualizer, toggleEqualizer } = useUIStore();

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'title', label: 'Título' },
    { field: 'artist', label: 'Artista' },
    { field: 'album', label: 'Álbum' },
    { field: 'duration', label: 'Duración' },
    { field: 'dateAdded', label: 'Fecha' },
    { field: 'playCount', label: 'Más reproducidas' },
  ];

  return (
    <header className="h-[4.25rem] px-4 sm:px-6 flex items-center justify-between gap-3 liquid-glass border-b border-[var(--liquid-glass-border-subtle)] sticky top-0 z-20 transition-all">
      {/* Mobile Menu Hamburger Toggle */}
      <button
        onClick={() => toggleMobileSidebar(true)}
        className="lg:hidden p-2 rounded-xl liquid-glass-subtle text-[var(--app-text)] hover:text-[#7C5CFF] transition-colors shrink-0"
        title="Abrir menú de biblioteca"
      >
        <Menu size={18} />
      </button>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--app-text-muted)]">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar canciones, artistas o álbumes..."
          className="w-full pl-10 pr-16 sm:pr-20 py-2.5 rounded-xl liquid-glass-subtle text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF]/60 transition-all shadow-sm"
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            >
              <X size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => useUIStore.getState().toggleCommandPalette(true)}
              className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono text-[var(--app-text-muted)] liquid-glass-subtle rounded hover:text-[var(--app-text)] hover:border-[#7C5CFF]/60 transition-colors"
              title="Abrir paleta de comandos (Ctrl+K)"
            >
              Ctrl+K
            </button>
          )}
        </div>
      </div>

      {/* Center scan progress if scanning */}
      {isScanning && scanProgress && (
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-[#7C5CFF]/40 text-xs text-[var(--app-text)] animate-pulse shadow-sm">
          <Loader2 size={14} className="animate-spin text-[#4FD1C5]" />
          <span className="font-medium text-[#4FD1C5]">
            Escaneando ({scanProgress.current}/{scanProgress.total}):
          </span>
          <span className="text-[var(--app-text-muted)] truncate max-w-36 font-mono text-xs">
            {scanProgress.filename}
          </span>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Sort Selector */}
        <div className="hidden sm:flex items-center liquid-glass-subtle rounded-xl px-2.5 py-1 text-xs text-[var(--app-text-muted)] shadow-sm">
          <ArrowUpDown size={14} className="mr-1 text-[var(--app-text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="bg-transparent text-[var(--app-text)] text-xs focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.field} value={opt.field} className="bg-[var(--app-bg)] text-[var(--app-text)]">
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-1 text-[11px] font-mono px-1 py-0.5 rounded text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)] transition-colors font-semibold"
            title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
          >
            {sortOrder === 'asc' ? 'ASC' : 'DESC'}
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center liquid-glass-subtle rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white shadow-sm'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de lista"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-gradient-to-tr from-[#7C5CFF] to-[#6366F1] text-white shadow-sm'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de cuadrícula"
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        {/* Equalizer button */}
        <button
          onClick={() => toggleEqualizer(true)}
          className={`p-2 rounded-xl transition-all ${
            eqEnabled
              ? 'bg-[#7C5CFF]/20 border border-[#7C5CFF]/50 text-[#7C5CFF] shadow-sm'
              : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:scale-105'
          }`}
          title="Ecualizador de 5 bandas"
        >
          <Sliders size={16} />
        </button>

        {/* Visualizer button */}
        <button
          onClick={() => toggleVisualizer(true)}
          className="p-2 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:border-[var(--app-accent)]/50 hover:scale-105 active:scale-95 transition-all shadow-sm"
          title="Visualizador de audio"
        >
          <Activity size={16} />
        </button>

        {/* Theme mode toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[#7C5CFF] hover:border-[#7C5CFF]/50 hover:scale-105 active:scale-95 transition-all shadow-sm"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#7C5CFF]" />}
        </button>
      </div>
    </header>
  );
};
