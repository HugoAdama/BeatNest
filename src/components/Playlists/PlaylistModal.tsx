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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#1A1A1F] border border-[#2E2E38] rounded-2xl shadow-2xl p-6 text-[#F5F5F7]">
        <div className="flex items-center justify-between pb-4 border-b border-[#2E2E38]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <FolderPlus size={18} />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F7]">
              Crear nueva playlist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A0A0AB] mb-1.5">
              Nombre de la playlist
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mis Favoritas, Synthwave, Chill..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F12] border border-[#2E2E38] text-sm text-[#F5F5F7] placeholder-[#A0A0AB]/50 focus:outline-none focus:border-[#7C5CFF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A0A0AB] mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve nota sobre esta selección musical..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F12] border border-[#2E2E38] text-sm text-[#F5F5F7] placeholder-[#A0A0AB]/50 focus:outline-none focus:border-[#7C5CFF] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-[#7C5CFF] text-white hover:bg-[#6D48F7] disabled:opacity-40 transition-colors shadow-[0_0_12px_rgba(124,92,255,0.3)]"
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
