import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  FileText,
  Upload,
  Music,
  Check,
  AlignLeft,
} from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { parseLRC, getActiveLyricIndex } from '../../lib/lyrics';

export const LyricsModal: React.FC = () => {
  const {
    currentTrack,
    currentTime,
    seek,
    setTrackLyrics,
  } = usePlayerStore();

  const { isLyricsOpen, toggleLyrics } = useUIStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lyricsInputText, setLyricsInputText] = useState('');
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsedLyrics = useMemo(() => {
    if (!currentTrack?.lyrics) return [];
    return parseLRC(currentTrack.lyrics);
  }, [currentTrack?.lyrics]);

  const activeIndex = useMemo(() => {
    return getActiveLyricIndex(parsedLyrics, currentTime);
  }, [parsedLyrics, currentTime]);

  // Smooth auto-scroll active lyric line into center
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isEditing]);

  if (!isLyricsOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && currentTrack) {
      const file = e.target.files[0];
      file.text().then((text) => {
        setTrackLyrics(currentTrack.id, text);
        setIsEditing(false);
      });
    }
  };

  const handleSavePasted = () => {
    if (currentTrack && lyricsInputText.trim()) {
      setTrackLyrics(currentTrack.id, lyricsInputText.trim());
      setIsEditing(false);
      setLyricsInputText('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.warn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--app-bg)]/95 backdrop-blur-2xl animate-fadeIn text-[var(--app-text)] transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--app-border)] z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
            <AlignLeft size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-text)] leading-none">
              Letras sincronizadas
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">
              {currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : 'Sin pista en reproducción'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentTrack && (
            <button
              onClick={() => {
                setLyricsInputText(currentTrack.lyrics || '');
                setIsEditing(!isEditing);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:border-[#7C5CFF]/50 transition-colors"
            >
              <FileText size={14} />
              <span>{isEditing ? 'Cancelar edición' : 'Editar / Pegar'}</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-xs text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 transition-colors"
          >
            <Upload size={14} />
            <span>Cargar .LRC</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".lrc,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={() => toggleLyrics(false)}
            className="p-2 rounded-lg bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/20 transition-colors"
            title="Cerrar letras"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#7C5CFF]/15 blur-3xl animate-float-1" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#4FD1C5]/15 blur-3xl animate-float-2" />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-6 z-10">
        {isEditing ? (
          /* Editor Mode */
          <div className="w-full max-w-xl flex flex-col h-full max-h-[500px] liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-3xl p-5 shadow-2xl">
            <h4 className="text-sm font-semibold mb-2 text-[var(--app-text)]">
              Pegar letra en formato LRC o texto plano
            </h4>
            <p className="text-xs text-[var(--app-text-muted)] mb-3">
              Puedes pegar contenido sincronizado [00:15.20] o texto de letra estándar línea por línea.
            </p>
            <textarea
              value={lyricsInputText}
              onChange={(e) => setLyricsInputText(e.target.value)}
              placeholder="[00:12.50] Primera línea de la canción...&#10;[00:18.20] Segunda línea..."
              className="flex-1 w-full p-3.5 rounded-xl liquid-glass-subtle text-xs font-mono text-[var(--app-text)] placeholder-[var(--app-text-muted)]/40 focus:outline-none focus:border-[#7C5CFF] resize-none"
            />
            <div className="flex justify-end gap-2.5 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePasted}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm border border-white/20"
              >
                <Check size={14} />
                <span>Guardar letra</span>
              </button>
            </div>
          </div>
        ) : !currentTrack ? (
          <div className="text-center text-[var(--app-text-muted)]">
            <Music size={36} className="mx-auto mb-3 text-[#7C5CFF]" />
            <p className="text-sm">Selecciona una pista para ver su letra.</p>
          </div>
        ) : parsedLyrics.length === 0 ? (
          /* Empty Lyrics state */
          <div className="max-w-md text-center p-8 liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center mx-auto mb-4 text-[#7C5CFF]">
              <AlignLeft size={28} />
            </div>
            <h4 className="text-base font-semibold text-[var(--app-text)] mb-1">
              Sin letra para «{currentTrack.title}»
            </h4>
            <p className="text-xs text-[var(--app-text-muted)] mb-6 leading-relaxed">
              No se encontró un archivo .lrc coincidente. Puedes subir un archivo .lrc de tu equipo o pegar el texto directamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-semibold hover:bg-[#6D48F7] transition-all shadow-md"
              >
                <Upload size={15} />
                <span>Subir archivo .lrc</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-xs font-medium text-[var(--app-text)] hover:border-[#7C5CFF]/50 transition-all"
              >
                <FileText size={15} className="text-[var(--app-accent)]" />
                <span>Pegar letra</span>
              </button>
            </div>
          </div>
        ) : (
          /* Synchronized Lyrics Viewer */
          <div
            ref={containerRef}
            className="w-full max-w-2xl h-full overflow-y-auto px-4 py-36 space-y-7 text-center select-none scroll-smooth"
          >
            {parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = activeIndex !== -1 && idx < activeIndex;

              return (
                <div
                  key={line.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => {
                    if (line.time >= 0) {
                      seek(line.time);
                    }
                  }}
                  className={`cursor-pointer transition-all duration-300 py-2 px-5 rounded-2xl ${
                    isActive
                      ? 'text-[#4FD1C5] font-extrabold text-xl sm:text-2xl scale-105 bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 shadow-[0_0_24px_rgba(79,209,197,0.25)]'
                      : isPast
                      ? 'text-[var(--app-text-muted)]/50 text-base sm:text-lg hover:text-[var(--app-text-muted)]'
                      : 'text-[var(--app-text-muted)]/80 text-base sm:text-lg hover:text-[var(--app-text)]'
                  }`}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
