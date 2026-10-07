import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  BarChart3,
  Activity,
  Disc,
  Sparkles,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { CanvasVisualizer } from './CanvasVisualizer';
import type { VisualizerMode } from '../../types/music';

export const AudioVisualizerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const {
    isVisualizerOpen,
    toggleVisualizer,
    visualizerMode,
    setVisualizerMode,
  } = useUIStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isVisualizerOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  const modes: { id: VisualizerMode; label: string; icon: React.ReactNode }[] = [
    { id: 'bars', label: 'Barras de espectro', icon: <BarChart3 size={15} /> },
    { id: 'wave', label: 'Osciloscopio', icon: <Activity size={15} /> },
    { id: 'circle', label: 'Radial 360°', icon: <Disc size={15} /> },
    { id: 'pulse', label: 'Pulso reactivo', icon: <Sparkles size={15} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F0F12]/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b border-[#2E2E38]/50 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1F] border border-[#2E2E38]">
            <Disc className="text-[#4FD1C5] animate-spin" style={{ animationDuration: '6s' }} size={16} />
            <span className="text-xs font-semibold tracking-wide text-[#F5F5F7]">
              Visualizador Web Audio API
            </span>
          </div>

          {/* Mode Switchers */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#1A1A1F] p-1 rounded-xl border border-[#2E2E38]">
            {modes.map((m) => {
              const isActive = visualizerMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setVisualizerMode(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#7C5CFF] text-white shadow-[0_0_12px_rgba(124,92,255,0.4)]'
                      : 'text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B]'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-[#A0A0AB] hover:text-[#F5F5F7] hover:border-[#7C5CFF]/50 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={() => toggleVisualizer(false)}
            className="p-2 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors"
            title="Cerrar visualizador"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        <CanvasVisualizer mode={visualizerMode} isPlaying={isPlaying} />

        {/* Ambient Track Info Overlay */}
        {currentTrack && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2E2E38] shadow-2xl max-w-md pointer-events-auto">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#24242B] flex items-center justify-center shrink-0 border border-[#2E2E38]">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={20} className="text-[#7C5CFF]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#F5F5F7] truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-[#A0A0AB] truncate">
                {currentTrack.artist} • {currentTrack.album}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevTrack}
                className="p-2 rounded-lg text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
                title="Pista anterior"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6D48F7] transition-all shadow-[0_0_12px_rgba(124,92,255,0.4)]"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              </button>
              <button
                onClick={() => nextTrack(true)}
                className="p-2 rounded-lg text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
                title="Siguiente pista"
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Mode Switcher */}
      <div className="sm:hidden flex items-center justify-around p-3 border-t border-[#2E2E38] bg-[#1A1A1F]">
        {modes.map((m) => {
          const isActive = visualizerMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setVisualizerMode(m.id)}
              className={`p-2 rounded-lg ${isActive ? 'bg-[#7C5CFF] text-white' : 'text-[#A0A0AB]'}`}
            >
              {m.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
