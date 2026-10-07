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
  ShieldCheck,
  Keyboard,
  Trash2,
  History,
  Download,
  Upload,
  BarChart3,
} from 'lucide-react';
import { useLibraryStore, type LibraryTab } from '../../stores/useLibraryStore';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { exportLibraryBackup, importLibraryBackup } from '../../lib/backup';
import { showToast } from '../../stores/useToastStore';

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
  const { toggleShortcutModal } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  const favoriteCount = tracks.filter((t) => t.isFavorite).length;

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files);
    }
  };

  const handleBackupExport = async () => {
    try {
      await exportLibraryBackup();
      showToast('Respaldo generado', 'Archivo JSON descargado exitosamente');
    } catch {
      showToast('Error al respaldar', 'No se pudo generar el archivo de respaldo', 'warning');
    }
  };

  const handleBackupRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      try {
        const res = await importLibraryBackup(e.target.files[0]);
        showToast(
          'Respaldo restaurado',
          `${res.playlistsRestored} playlists y ${res.favoritesRestored} favoritos sincronizados`
        );
      } catch (err: any) {
        showToast('Error de restauración', err.message || 'El archivo no tiene un formato válido', 'warning');
      }
      e.target.value = '';
    }
  };

  const navItems: { id: LibraryTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'tracks', label: 'Todas las pistas', icon: <Music size={17} />, count: tracks.length },
    { id: 'favorites', label: 'Favoritos', icon: <Heart size={17} />, count: favoriteCount },
    { id: 'artists', label: 'Artistas', icon: <Mic2 size={17} /> },
    { id: 'albums', label: 'Álbumes', icon: <Disc size={17} /> },
    { id: 'history', label: 'Historial reciente', icon: <History size={17} />, count: recentTracks.length },
  ];

  return (
    <aside className="w-64 bg-[var(--app-sidebar)] border-r border-[var(--app-border)] flex flex-col h-full select-none shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-[var(--app-border)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C5CFF] to-[#4FD1C5] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/20">
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

      {/* Main Import Buttons */}
      <div className="p-3.5 space-y-2">
        <button
          onClick={importDirectoryWithPicker}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6D48F7] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(124,92,255,0.3)]"
        >
          <FolderOpen size={16} />
          <span>Abrir carpeta local</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-medium hover:border-[#7C5CFF]/50 hover:bg-[var(--app-surface-hover)] active:scale-[0.98] transition-all"
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

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main Section */}
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1.5">
            Biblioteca
          </span>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id && selectedPlaylistId === null;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedPlaylistId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 font-semibold shadow-sm'
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
              Playlists ({playlists.length})
            </span>
            <button
              onClick={onOpenCreatePlaylistModal}
              className="text-[var(--app-accent)] hover:opacity-80 p-0.5 rounded transition-colors"
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
                        ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 font-semibold'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedPlaylistId(pl.id);
                        setActiveTab('playlists');
                      }}
                      className="flex items-center gap-2.5 truncate flex-1 text-left"
                    >
                      <ListMusic size={16} className="shrink-0 text-[#7C5CFF]" />
                      <span className="truncate">{pl.name}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-[var(--app-text-muted)] group-hover:hidden">
                        {pl.trackIds.length}
                      </span>
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

      {/* Footer Info & Shortcuts */}
      <div className="p-3 border-t border-[var(--app-border)] space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[11px] text-[var(--app-text-muted)]">
          <ShieldCheck size={18} className="text-[var(--app-accent)] shrink-0" />
          <div className="leading-tight">
            <span className="text-[var(--app-text)] font-semibold block">100% Local & Privado</span>
            <span>Archivos seguros en tu equipo</span>
          </div>
        </div>

        {/* Backup export / import */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBackupExport}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-[11px] font-medium border border-[var(--app-border)] hover:border-[#7C5CFF]/40 transition-colors"
            title="Descargar archivo .json con tus playlists y favoritos"
          >
            <Download size={13} className="text-[#7C5CFF]" />
            <span>Respaldar</span>
          </button>

          <button
            onClick={() => backupInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-[11px] font-medium border border-[var(--app-border)] hover:border-[#7C5CFF]/40 transition-colors"
            title="Restaurar archivo de respaldo .json"
          >
            <Upload size={13} className="text-[#4FD1C5]" />
            <span>Restaurar</span>
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleBackupRestore}
          />
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => useUIStore.getState().toggleStats(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] rounded-lg transition-colors"
          >
            <BarChart3 size={14} className="text-[#4FD1C5]" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => toggleShortcutModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] rounded-lg transition-colors"
          >
            <Keyboard size={14} />
            <span>Atajos</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
