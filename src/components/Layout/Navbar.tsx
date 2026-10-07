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
} from 'lucide-react';
import { useLibraryStore, type SortField } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useThemeStore } from '../../stores/useThemeStore';

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

  const { toggleVisualizer, toggleEqualizer, eqEnabled } = usePlayerStore();
  const { theme, toggleTheme } = useThemeStore();

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'title', label: 'Título' },
    { field: 'artist', label: 'Artista' },
    { field: 'album', label: 'Álbum' },
    { field: 'duration', label: 'Duración' },
    { field: 'dateAdded', label: 'Fecha' },
  ];

  return (
    <header className="h-16 border-b border-[var(--app-border)] px-6 flex items-center justify-between gap-4 bg-[var(--app-navbar)] backdrop-blur-md sticky top-0 z-20 transition-colors">
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
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Center scan progress if scanning */}
      {isScanning && scanProgress && (
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs text-[var(--app-text)] animate-pulse">
          <Loader2 size={14} className="animate-spin text-[#4FD1C5]" />
          <span className="font-medium text-[#4FD1C5]">
            Extrayendo metadatos ({scanProgress.current}/{scanProgress.total}):
          </span>
          <span className="text-[var(--app-text-muted)] truncate max-w-40 font-mono text-[11px]">
            {scanProgress.filename}
          </span>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Sort Selector */}
        <div className="flex items-center bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl px-2.5 py-1 text-xs text-[var(--app-text-muted)] shadow-sm">
          <ArrowUpDown size={14} className="mr-1.5 text-[var(--app-text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="bg-transparent text-[var(--app-text)] text-xs focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.field} value={opt.field} className="bg-[var(--app-surface)] text-[var(--app-text)]">
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-1 text-[11px] font-mono px-1 py-0.5 rounded text-[var(--app-accent)] hover:bg-[var(--app-surface-elevated)] transition-colors font-semibold"
            title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
          >
            {sortOrder === 'asc' ? 'ASC' : 'DESC'}
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[var(--app-surface)] border border-[var(--app-border)] rounded-xl p-0.5 shadow-sm">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[#7C5CFF] text-white shadow-sm'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de lista"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#7C5CFF] text-white shadow-sm'
                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
            title="Vista de cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Equalizer button */}
        <button
          onClick={() => toggleEqualizer(true)}
          className={`p-2 rounded-xl border transition-colors ${
            eqEnabled
              ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-[#7C5CFF]'
              : 'bg-[var(--app-surface)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
          }`}
          title="Ecualizador de 5 bandas"
        >
          <Sliders size={16} />
        </button>

        {/* Visualizer button */}
        <button
          onClick={() => toggleVisualizer(true)}
          className="p-2 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-accent)] hover:border-[var(--app-accent)]/40 transition-colors shadow-sm"
          title="Visualizador de audio"
        >
          <Activity size={16} />
        </button>

        {/* Theme mode toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[#7C5CFF] hover:border-[#7C5CFF]/40 transition-all shadow-sm"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#7C5CFF]" />}
        </button>
      </div>
    </header>
  );
};
