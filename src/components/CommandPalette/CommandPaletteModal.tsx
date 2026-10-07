import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Search,
  Play,
  Sliders,
  Timer,
  Activity,
  AlignLeft,
  Download,
  Upload,
  Sun,
  Moon,
  HelpCircle,
  ListMusic,
  BarChart3,
  X,
  Music,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { useLibraryStore } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import { exportLibraryBackup, importLibraryBackup } from '../../lib/backup';
import { showToast } from '../../stores/useToastStore';
import type { Track, Playlist } from '../../types/music';

interface CommandAction {
  id: string;
  title: string;
  category: 'Acción' | 'Pista' | 'Playlist';
  icon: React.ReactNode;
  perform?: () => void;
}

export const CommandPaletteModal: React.FC = () => {
  const {
    isCommandPaletteOpen,
    toggleCommandPalette,
    toggleEqualizer,
    toggleVisualizer,
    toggleLyrics,
    toggleShortcutModal,
    toggleStats,
  } = useUIStore();

  const { tracks, playlists, setActiveTab, setSelectedPlaylistId } = useLibraryStore();
  const { playTrack, togglePlay, isPlaying } = usePlayerStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleModal: toggleSleepTimer } = useSleepTimerStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeCommandPalette = useCallback(() => {
    setQuery('');
    setSelectedIndex(0);
    toggleCommandPalette(false);
  }, [toggleCommandPalette]);

  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const focusFrame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  }, [isCommandPaletteOpen]);

  // Global key combination to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isCommandPaletteOpen) {
          closeCommandPalette();
        } else {
          toggleCommandPalette(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, toggleCommandPalette, closeCommandPalette]);

  const handleExport = useCallback(async () => {
    try {
      await exportLibraryBackup();
      showToast('Respaldo generado', 'JSON de metadatos descargado. Los archivos de audio no se incluyen.');
    } catch {
      showToast('Error al respaldar', 'No se pudo generar el archivo', 'warning');
    }
  }, []);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importLibraryBackup(file);
      showToast('Restauración completa', `${result.playlistsRestored} listas y ${result.favoritesRestored} favoritos sincronizados. Importa primero el audio para enlazar las pistas.`);
    } catch (err) {
      showToast('Error de importación', err instanceof Error ? err.message : 'El archivo no tiene un formato válido', 'warning');
    } finally {
      e.target.value = '';
      closeCommandPalette();
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  const handleAction = (item: CommandAction) => {
    if (item.id === 'restore-library') {
      fileInputRef.current?.click();
      return;
    }

    item.perform?.();
    closeCommandPalette();
  };

  const allItems: CommandAction[] = useMemo(() => {
    const actions: CommandAction[] = [
      {
        id: 'toggle-play',
        title: isPlaying ? 'Pausar reproducción' : 'Reanudar reproducción',
        category: 'Acción',
        icon: <Play size={16} className="text-[#4FD1C5]" />,
        perform: () => togglePlay(),
      },
      {
        id: 'open-equalizer',
        title: 'Abrir ecualizador paramétrico y preamplificador',
        category: 'Acción',
        icon: <Sliders size={16} className="text-[#7C5CFF]" />,
        perform: () => toggleEqualizer(true),
      },
      {
        id: 'open-sleep-timer',
        title: 'Configurar temporizador de apagado (Sleep Timer)',
        category: 'Acción',
        icon: <Timer size={16} className="text-amber-400" />,
        perform: () => toggleSleepTimer(true),
      },
      {
        id: 'open-visualizer',
        title: 'Abrir visualizador de audio en tiempo real',
        category: 'Acción',
        icon: <Activity size={16} className="text-[#4FD1C5]" />,
        perform: () => toggleVisualizer(true),
      },
      {
        id: 'open-lyrics',
        title: 'Ver letras sincronizadas (LRC)',
        category: 'Acción',
        icon: <AlignLeft size={16} className="text-[#7C5CFF]" />,
        perform: () => toggleLyrics(true),
      },
      {
        id: 'open-stats',
        title: 'Ver estadísticas de escucha (BeatNest Insights)',
        category: 'Acción',
        icon: <BarChart3 size={16} className="text-[#4FD1C5]" />,
        perform: () => toggleStats(true),
      },
      {
        id: 'backup-library',
        title: 'Exportar respaldo de metadatos y listas (JSON; sin audio)',
        category: 'Acción',
        icon: <Download size={16} className="text-[var(--app-text-muted)]" />,
        perform: handleExport,
      },
      {
        id: 'restore-library',
        title: 'Restaurar biblioteca desde archivo JSON',
        category: 'Acción',
        icon: <Upload size={16} className="text-[var(--app-text-muted)]" />,
      },
      {
        id: 'toggle-theme',
        title: `Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`,
        category: 'Acción',
        icon: theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#7C5CFF]" />,
        perform: () => toggleTheme(),
      },
      {
        id: 'open-shortcuts',
        title: 'Ver lista completa de atajos de teclado',
        category: 'Acción',
        icon: <HelpCircle size={16} className="text-[var(--app-text-muted)]" />,
        perform: () => toggleShortcutModal(true),
      },
    ];

    const q = query.toLowerCase().trim();

    // Matching actions
    const filteredActions = q
      ? actions.filter((a) => a.title.toLowerCase().includes(q))
      : actions;

    // Matching tracks
    const matchingTracks: CommandAction[] = q
      ? tracks
          .filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.artist.toLowerCase().includes(q) ||
              t.album.toLowerCase().includes(q)
          )
          .slice(0, 8)
          .map((t: Track) => ({
            id: `track-${t.id}`,
            title: `${t.title} — ${t.artist}`,
            category: 'Pista',
            icon: <Music size={16} className="text-[#7C5CFF]" />,
            perform: () => playTrack(t, tracks),
          }))
      : [];

    // Matching playlists
    const matchingPlaylists: CommandAction[] = q
      ? playlists
          .filter((p) => p.name.toLowerCase().includes(q))
          .slice(0, 4)
          .map((p: Playlist) => ({
            id: `playlist-${p.id}`,
            title: `Playlist: ${p.name}`,
            category: 'Playlist',
            icon: <ListMusic size={16} className="text-[#4FD1C5]" />,
            perform: () => {
              setActiveTab('playlists');
              setSelectedPlaylistId(p.id);
            },
          }))
      : [];

    return [...matchingPlaylists, ...matchingTracks, ...filteredActions];
  }, [
    query,
    tracks,
    playlists,
    isPlaying,
    theme,
    togglePlay,
    toggleEqualizer,
    toggleSleepTimer,
    toggleVisualizer,
    toggleLyrics,
    toggleStats,
    toggleTheme,
      toggleShortcutModal,
      playTrack,
      setActiveTab,
      setSelectedPlaylistId,
      handleExport,
  ]);

  const handleKeyDownInDialog = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleAction(allItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeCommandPalette}
      onKeyDown={handleKeyDownInDialog}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onClick={(e) => e.stopPropagation()}
        onChange={handleImportFile}
      />

      <div
        className="w-full max-w-xl liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-3xl shadow-2xl overflow-hidden animate-fadeScale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--liquid-glass-border-subtle)]">
          <Search size={18} className="text-[var(--app-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar pista, álbum, playlist o comando..."
            className="w-full bg-transparent text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-[var(--app-text-muted)] liquid-glass-subtle rounded-md">
            ESC
          </kbd>
          <button
            onClick={closeCommandPalette}
            className="p-1 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors sm:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-[var(--app-text-muted)] text-xs">
              No se encontraron comandos ni pistas coincidentes
            </div>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    handleAction(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm border border-white/20'
                      : 'text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isSelected ? 'text-white' : ''}>{item.icon}</span>
                    <span className="truncate font-medium">{item.title}</span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'liquid-glass-subtle text-[var(--app-text-muted)]'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 border-t border-[var(--liquid-glass-border-subtle)] bg-[var(--app-surface-elevated)]/40 flex items-center justify-between text-[11px] text-[var(--app-text-muted)]">
          <div className="flex items-center gap-2">
            <span>Usa las flechas para navegar</span>
            <span>•</span>
            <span>Enter para seleccionar</span>
          </div>
          <span className="font-mono text-[10px]">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
