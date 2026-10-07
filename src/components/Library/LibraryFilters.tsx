import React from 'react';
import { Layers, RotateCcw, Tag, X } from 'lucide-react';
import type { LibraryTab } from '../../stores/useLibraryStore';

interface LibraryFiltersProps {
  activeTab: LibraryTab;
  selectedPlaylistId: string | null;
  uniqueGenres: string[];
  selectedGenre: string | null;
  selectedFormat: string | null;
  searchQuery: string;
  onSelectGenre: (genre: string | null) => void;
  onSelectFormat: (format: string | null) => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  activeTab,
  selectedPlaylistId,
  uniqueGenres,
  selectedGenre,
  selectedFormat,
  searchQuery,
  onSelectGenre,
  onSelectFormat,
  onClearSearch,
  onClearAll,
}) => {
  if (activeTab === 'playlists' && !selectedPlaylistId) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--liquid-glass-border-subtle)] py-2">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1"><Layers size={14} className="text-[#4FD1C5]" /><span>Formato</span></span>
        <div className="inline-flex items-center gap-1 p-0.5 rounded-xl bg-[var(--app-surface)] border border-[var(--liquid-glass-border-subtle)]">
          {['ALL', 'MP3', 'FLAC', 'WAV', 'OGG', 'M4A'].map((format) => {
            const selected = (format === 'ALL' && selectedFormat === null) || selectedFormat === format;
            return <button key={format} onClick={() => onSelectFormat(format === 'ALL' ? null : format)} className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${selected ? 'bg-[#4FD1C5] text-black shadow-sm font-bold' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'}`}>{format}</button>;
          })}
        </div>
      </div>

      {uniqueGenres.length > 0 && <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5 shrink-0 mr-1"><Tag size={14} className="text-[#7C5CFF]" /><span>Género</span></span>
        <button onClick={() => onSelectGenre(null)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${selectedGenre === null ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm font-semibold' : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/30'}`}>Todos</button>
        {uniqueGenres.map((genre) => <button key={genre} onClick={() => onSelectGenre(selectedGenre === genre ? null : genre)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${selectedGenre === genre ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm font-semibold' : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/30'}`}>{genre}</button>)}
      </div>}
      {(searchQuery || selectedGenre || selectedFormat) && (
        <div className="flex w-full flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-medium text-[var(--app-text-muted)]">Filtros activos:</span>
          {searchQuery && <button type="button" onClick={onClearSearch} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2.5 text-xs text-[var(--app-text)] hover:border-[var(--app-accent)]">“{searchQuery}” <X size={13} /></button>}
          {selectedFormat && <button type="button" onClick={() => onSelectFormat(null)} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2.5 text-xs text-[var(--app-text)] hover:border-[var(--app-accent)]">{selectedFormat} <X size={13} /></button>}
          {selectedGenre && <button type="button" onClick={() => onSelectGenre(null)} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-2.5 text-xs text-[var(--app-text)] hover:border-[var(--app-accent)]">{selectedGenre} <X size={13} /></button>}
          <button type="button" onClick={onClearAll} className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[var(--app-accent)] hover:bg-[var(--app-surface-hover)]"><RotateCcw size={13} /> Limpiar todo</button>
        </div>
      )}
    </div>
  );
};
