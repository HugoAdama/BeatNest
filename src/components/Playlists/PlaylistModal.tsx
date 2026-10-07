import React, { useState } from 'react';
import { X, Plus, FolderPlus } from 'lucide-react';
import { useLibraryStore } from '../../stores/useLibraryStore';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose }) => {
  const { createPlaylist } = useLibraryStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createPlaylist(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md liquid-glass-elevated rounded-3xl shadow-2xl p-6 text-[var(--app-text)] transition-colors animate-fadeScale border border-[var(--liquid-glass-border)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--liquid-glass-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
              <FolderPlus size={18} />
            </div>
            <h3 className="text-base font-semibold text-[var(--app-text)]">
              Crear nueva playlist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1.5">
              Nombre de la playlist
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mis Favoritas, Synthwave, Chill..."
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-subtle text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 focus:outline-none focus:border-[#7C5CFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve nota sobre esta selección musical..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-subtle text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 focus:outline-none focus:border-[#7C5CFF] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-[0_4px_14px_rgba(124,92,255,0.35)] border border-white/20"
            >
              <Plus size={15} />
              <span>Crear playlist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
