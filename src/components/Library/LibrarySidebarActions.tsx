import React, { useRef } from 'react';
import {
  BarChart3,
  Download,
  Keyboard,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { exportLibraryBackup, importLibraryBackup } from '../../lib/backup';
import { useUIStore } from '../../stores/useUIStore';
import { showToast } from '../../stores/useToastStore';

export const LibrarySidebarActions: React.FC = () => {
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const toggleShortcutModal = useUIStore((state) => state.toggleShortcutModal);
  const toggleStats = useUIStore((state) => state.toggleStats);

  const handleBackupExport = async () => {
    try {
      await exportLibraryBackup();
      showToast('Respaldo generado', 'JSON de metadatos descargado. Los archivos de audio no se incluyen.');
    } catch {
      showToast('Error al respaldar', 'No se pudo generar el archivo de respaldo', 'warning');
    }
  };

  const handleBackupRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importLibraryBackup(file);
      showToast(
        'Respaldo restaurado',
        `${res.playlistsRestored} playlists y ${res.favoritesRestored} favoritos sincronizados. Si restauras en otro equipo, importa primero el audio para enlazar las pistas.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'El archivo no tiene un formato válido';
      showToast('Error de restauración', message, 'warning');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="p-3 border-t border-[var(--liquid-glass-border-subtle)] space-y-2 shrink-0 bg-[var(--app-sidebar)]">
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl liquid-glass-subtle text-[11px] text-[var(--app-text-muted)]">
        <ShieldCheck size={18} className="text-[var(--app-accent)] shrink-0" />
        <div className="leading-snug">
          <span className="text-[var(--app-text)] font-semibold block">100% Local &amp; Privado</span>
          <span className="text-xs">Archivos seguros en tu equipo</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleBackupExport}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-medium hover:border-[#7C5CFF]/50 transition-colors"
          title="Descargar metadatos, playlists, favoritos y letras. Los archivos de audio no se incluyen."
        >
          <Download size={13} className="text-[#7C5CFF]" />
          <span>Respaldar</span>
        </button>

        <button
          onClick={() => backupInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-medium hover:border-[#7C5CFF]/50 transition-colors"
          title="Importa primero tus archivos de audio en este equipo; después restaura el JSON para enlazar las pistas."
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
      <p className="px-1 text-[11px] leading-snug text-[var(--app-text-muted)]">
        No incluye audio. En otro equipo, importa primero la música y luego restaura este JSON.
      </p>

      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          onClick={() => toggleStats(true)}
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
  );
};
