import React, { useRef } from 'react';
import {
  Music,
  Heart,
  FolderOpen,
  FileAudio,
  Plus,
  Disc,
  Mic2,
  ListMusic,
  Trash2,
  History,
  X,
  Sparkles,
  Clock,
  Timer,
  FileDown,
} from 'lucide-react';
import { useLibraryStore, type LibraryTab } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { exportPlaylistAsM3U } from '../../lib/playlistExport';
import { showToast } from '../../stores/useToastStore';
import { LibrarySidebarActions } from './LibrarySidebarActions';

interface SidebarProps {
  onOpenCreatePlaylistModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreatePlaylistModal }) => {
  const {
    tracks,
    playlists,
    activeTab,
    setActiveTab,
    selectedPlaylistId,
    setSelectedPlaylistId,
    importDirectoryWithPicker,
    importFiles,
    deletePlaylist,
  } = useLibraryStore();

  const { recentTracks } = usePlayerStore();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const favoriteCount = tracks.filter((t) => t.isFavorite).length;

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files);
    }
  };

  const handleExportPlaylistM3U = (pl: (typeof playlists)[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const plTracks = tracks.filter((t) => pl.trackIds.includes(t.id));
    if (plTracks.length === 0) {
      showToast('Playlist vacía', 'No hay pistas para exportar en esta lista', 'warning');
      return;
    }
    exportPlaylistAsM3U(pl.name, plTracks);
    showToast('Exportación M3U', `Descargado archivo .m3u para «${pl.name}»`);
  };

  const navItems: { id: LibraryTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'tracks', label: 'Todas las pistas', icon: <Music size={17} />, count: tracks.length },
    { id: 'favorites', label: 'Favoritos', icon: <Heart size={17} />, count: favoriteCount },
    { id: 'artists', label: 'Artistas', icon: <Mic2 size={17} /> },
    { id: 'albums', label: 'Álbumes', icon: <Disc size={17} /> },
    { id: 'history', label: 'Historial reciente', icon: <History size={17} />, count: recentTracks.length },
  ];

  const smartItems: { id: LibraryTab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'smart-top',
      label: 'Más reproducidas',
      icon: <Sparkles size={16} className="text-amber-400" />,
      count: tracks.filter((t) => (t.playCount || 0) > 0).length,
    },
    {
      id: 'smart-recent',
      label: 'Añadidas recientemente',
      icon: <Clock size={16} className="text-[#4FD1C5]" />,
      count: tracks.length,
    },
    {
      id: 'smart-long',
      label: 'Pistas largas (+5m)',
      icon: <Timer size={16} className="text-[#7C5CFF]" />,
      count: tracks.filter((t) => t.duration >= 300).length,
    },
  ];

  const handleSelectTab = (tab: LibraryTab) => {
    setActiveTab(tab);
    setSelectedPlaylistId(null);
    if (isMobileSidebarOpen) {
      toggleMobileSidebar(false);
    }
  };

  const handleSelectPlaylist = (id: string) => {
    setSelectedPlaylistId(id);
    setActiveTab('playlists');
    if (isMobileSidebarOpen) {
      toggleMobileSidebar(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => toggleMobileSidebar(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static w-72 lg:w-64 liquid-glass flex flex-col h-full select-none shrink-0 transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--liquid-glass-border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25 border border-white/20">
              <Disc className="text-white" size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--app-text)] leading-none">
                BeatNest
              </h1>
              <p className="text-[11px] text-[var(--app-accent)] font-medium mt-1">
                Tu música, sin nube
              </p>
            </div>
          </div>

          {/* Close button on mobile screens */}
          <button
            onClick={() => toggleMobileSidebar(false)}
            className="lg:hidden p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Import Action Buttons */}
        <div className="p-3.5 space-y-2 border-b border-[var(--liquid-glass-border-subtle)]">
          <button
            onClick={importDirectoryWithPicker}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(124,92,255,0.35)] border border-white/20"
          >
            <FolderOpen size={16} />
            <span>Abrir carpeta local</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl liquid-glass-subtle text-[var(--app-text)] text-xs font-medium hover:border-[#7C5CFF]/60 hover:bg-[var(--app-surface-hover)] active:scale-[0.98] transition-all"
          >
            <FileAudio size={16} className="text-[var(--app-accent)]" />
            <span>Añadir archivos</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            className="hidden"
            onChange={handleFilesSelect}
          />
        </div>

        {/* Navigation Sections (min-h-0 prevents bottom footer clipping) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-5">
          {/* Main Section */}
          <div>
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2">
              Biblioteca
            </span>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id && selectedPlaylistId === null;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/40 font-semibold shadow-sm backdrop-blur-md'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-[11px] font-mono text-[var(--app-text-muted)] tabular-nums">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Playlists Section */}
          <div>
            <span className="px-3 text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-2">
              Listas Inteligentes
            </span>
            <div className="space-y-0.5">
              {smartItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/40 font-semibold shadow-sm backdrop-blur-md'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.count !== undefined && (
                      <span className="text-[11px] font-mono text-[var(--app-text-muted)] tabular-nums">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playlists Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <button
                onClick={() => {
                  setActiveTab('playlists');
                  setSelectedPlaylistId(null);
                  if (isMobileSidebarOpen) toggleMobileSidebar(false);
                }}
                className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-left transition-colors"
                title="Ver todas las playlists"
              >
                Playlists ({playlists.length})
              </button>
              <button
                onClick={onOpenCreatePlaylistModal}
                className="text-[var(--app-accent)] hover:opacity-80 p-1 rounded-lg transition-colors hover:bg-[var(--app-surface-hover)]"
                title="Nueva playlist"
              >
                <Plus size={15} />
              </button>
            </div>

            <div className="space-y-0.5">
              {playlists.length === 0 ? (
                <p className="px-3 py-2 text-xs text-[var(--app-text-muted)] opacity-60 italic">
                  Sin listas creadas
                </p>
              ) : (
                playlists.map((pl) => {
                  const isSelected = selectedPlaylistId === pl.id;
                  return (
                    <div
                      key={pl.id}
                      className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/40 font-semibold backdrop-blur-md'
                          : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                      }`}
                    >
                      <button
                        onClick={() => handleSelectPlaylist(pl.id)}
                        className="flex items-center gap-2.5 truncate flex-1 text-left"
                      >
                        <ListMusic size={16} className="shrink-0 text-[#7C5CFF]" />
                        <span className="truncate">{pl.name}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-[var(--app-text-muted)] group-hover:hidden">
                          {pl.trackIds.length}
                        </span>
                        <button
                          onClick={(e) => handleExportPlaylistM3U(pl, e)}
                          className="hidden group-hover:block p-1 text-[var(--app-text-muted)] hover:text-[#4FD1C5] transition-colors"
                          title="Descargar playlist (.m3u)"
                        >
                          <FileDown size={13} />
                        </button>
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="hidden group-hover:block p-1 text-[var(--app-text-muted)] hover:text-red-400 transition-colors"
                          title="Eliminar playlist"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <LibrarySidebarActions />
      </aside>
    </>
  );
};
