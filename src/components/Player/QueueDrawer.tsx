import React from 'react';
import {
  ListMusic,
  Trash2,
  X,
  Play,
  Volume2,
  ChevronUp,
  ChevronDown,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { formatDuration } from '../../lib/metadata';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    queueIndex,
    playTrack,
    removeFromQueue,
    clearQueue,
    reorderQueue,
  } = usePlayerStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-40 bg-[#1A1A1F] border-l border-[#2E2E38] shadow-2xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2E2E38]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF]">
            <ListMusic size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7]">
              Cola de reproducción
            </h3>
            <span className="text-xs text-[#A0A0AB]">
              {queue.length} {queue.length === 1 ? 'pista' : 'pistas'} en cola
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Vaciar cola"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
            title="Cerrar cola"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Queue items list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#A0A0AB]">
            <div className="w-12 h-12 rounded-2xl bg-[#24242B] border border-[#2E2E38] flex items-center justify-center mb-3 text-[#A0A0AB]">
              <ListMusic size={22} />
            </div>
            <p className="text-sm font-medium text-[#F5F5F7] mb-1">
              La cola está vacía
            </p>
            <p className="text-xs max-w-xs">
              Añade canciones desde tu biblioteca seleccionando «Añadir a la cola» o «Reproducir siguiente».
            </p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = idx === queueIndex;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center gap-3 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#F5F5F7]'
                    : 'bg-[#24242B]/60 hover:bg-[#24242B] border border-transparent text-[#A0A0AB] hover:text-[#F5F5F7]'
                }`}
              >
                {/* Thumbnail / Status */}
                <div
                  onClick={() => playTrack(track)}
                  className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#2E2E38] shrink-0 cursor-pointer flex items-center justify-center"
                >
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={16} className="text-[#A0A0AB]" />
                  )}

                  <div
                    className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                      isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isCurrent ? (
                      <Volume2 size={16} className="text-[#4FD1C5] animate-pulse" />
                    ) : (
                      <Play size={14} className="text-white" fill="white" />
                    )}
                  </div>
                </div>

                {/* Track details */}
                <div
                  onClick={() => playTrack(track)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <p
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-[#4FD1C5]' : 'text-[#F5F5F7]'
                    }`}
                  >
                    {track.title}
                  </p>
                  <p className="text-[11px] text-[#A0A0AB] truncate">
                    {track.artist}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-[11px] font-mono text-[#A0A0AB] shrink-0">
                  {formatDuration(track.duration)}
                </span>

                {/* Reorder and Delete controls */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={() => reorderQueue(idx, idx - 1)}
                      className="p-1 rounded text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#2E2E38]"
                      title="Mover arriba"
                    >
                      <ChevronUp size={14} />
                    </button>
                  )}
                  {idx < queue.length - 1 && (
                    <button
                      onClick={() => reorderQueue(idx, idx + 1)}
                      className="p-1 rounded text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#2E2E38]"
                      title="Mover abajo"
                    >
                      <ChevronDown size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 rounded text-[#A0A0AB] hover:text-red-400 hover:bg-red-500/10"
                    title="Quitar de la cola"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
