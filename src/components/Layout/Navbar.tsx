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
} from 'lucide-react';
import { useLibraryStore, type SortField } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';

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

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'title', label: 'Título' },
    { field: 'artist', label: 'Artista' },
    { field: 'album', label: 'Álbum' },
    { field: 'duration', label: 'Duración' },
    { field: 'dateAdded', label: 'Fecha' },
  ];

  return (
    <header className="h-16 border-b border-[#2E2E38] px-6 flex items-center justify-between gap-4 bg-[#0F0F12]/80 backdrop-blur-md sticky top-0 z-20">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A0A0AB]">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar canciones, artistas o álbumes..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-xs text-[#F5F5F7] placeholder-[#A0A0AB] focus:outline-none focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0A0AB] hover:text-[#F5F5F7]"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Center scan progress if scanning */}
      {isScanning && scanProgress && (
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-xs text-[#F5F5F7] animate-pulse">
          <Loader2 size={14} className="animate-spin text-[#4FD1C5]" />
          <span className="font-medium text-[#4FD1C5]">
            Extrayendo metadatos ({scanProgress.current}/{scanProgress.total}):
          </span>
          <span className="text-[#A0A0AB] truncate max-w-40 font-mono text-[11px]">
            {scanProgress.filename}
          </span>
        </div>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Sort Selector */}
        <div className="flex items-center bg-[#1A1A1F] border border-[#2E2E38] rounded-xl px-2 py-1 text-xs text-[#A0A0AB]">
          <ArrowUpDown size={14} className="mr-1.5 text-[#A0A0AB]" />
          <select
            value={sortBy}
            onChange={(e) => setSort(e.target.value as SortField)}
            className="bg-transparent text-[#F5F5F7] text-xs focus:outline-none cursor-pointer pr-1"
          >
            {sortOptions.map((opt) => (
              <option key={opt.field} value={opt.field} className="bg-[#1A1A1F]">
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
            className="ml-1 text-[11px] font-mono px-1 py-0.5 rounded text-[#4FD1C5] hover:bg-[#2E2E38] transition-colors"
            title={sortOrder === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'}
          >
            {sortOrder === 'asc' ? 'ASC' : 'DESC'}
          </button>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-[#1A1A1F] border border-[#2E2E38] rounded-xl p-0.5">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-[#7C5CFF] text-white shadow-sm'
                : 'text-[#A0A0AB] hover:text-[#F5F5F7]'
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
                : 'text-[#A0A0AB] hover:text-[#F5F5F7]'
            }`}
            title="Vista de cuadrícula"
          >
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Header Visualizer & EQ Buttons */}
        <button
          onClick={() => toggleEqualizer(true)}
          className={`p-2 rounded-xl border transition-colors ${
            eqEnabled
              ? 'bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-[#7C5CFF]'
              : 'bg-[#1A1A1F] border-[#2E2E38] text-[#A0A0AB] hover:text-[#F5F5F7]'
          }`}
          title="Ecualizador"
        >
          <Sliders size={16} />
        </button>

        <button
          onClick={() => toggleVisualizer(true)}
          className="p-2 rounded-xl bg-[#1A1A1F] border border-[#2E2E38] text-[#A0A0AB] hover:text-[#4FD1C5] hover:border-[#4FD1C5]/40 transition-colors"
          title="Visualizador"
        >
          <Activity size={16} />
        </button>
      </div>
    </header>
  );
};
