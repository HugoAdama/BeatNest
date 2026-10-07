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
import { parseLRC, getActiveLyricIndex } from '../../lib/lyrics';

export const LyricsModal: React.FC = () => {
  const {
    currentTrack,
    currentTime,
    isLyricsOpen,
    toggleLyrics,
    seek,
    setTrackLyrics,
  } = usePlayerStore();

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
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F0F12]/95 backdrop-blur-2xl animate-fadeIn text-[#F5F5F7]">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2E2E38]/50 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
            <AlignLeft size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#F5F5F7] leading-none">
              Letras sincronizadas
            </h3>
            <p className="text-xs text-[#A0A0AB] mt-1">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-xs text-[#A0A0AB] hover:text-[#F5F5F7] hover:border-[#7C5CFF]/50 transition-colors"
            >
              <FileText size={14} />
              <span>{isEditing ? 'Cancelar edición' : 'Editar / Pegar'}</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-xs text-[#4FD1C5] hover:bg-[#4FD1C5]/10 border-[#4FD1C5]/30 transition-colors"
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
            className="p-2 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-[#A0A0AB] hover:text-[#F5F5F7] transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={() => toggleLyrics(false)}
            className="p-2 rounded-lg bg-[#1A1A1F] border border-[#2E2E38] text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-red-500/20 hover:text-red-400 transition-colors"
            title="Cerrar letras"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-6">
        {isEditing ? (
          /* Editor Mode */
          <div className="w-full max-w-xl flex flex-col h-full max-h-[500px] bg-[#1A1A1F] border border-[#2E2E38] rounded-2xl p-5 shadow-2xl">
            <h4 className="text-sm font-semibold mb-2 text-[#F5F5F7]">
              Pegar letra en formato LRC o texto plano
            </h4>
            <p className="text-xs text-[#A0A0AB] mb-3">
              Puedes pegar contenido sincronizado [00:15.20] o texto de letra estándar línea por línea.
            </p>
            <textarea
              value={lyricsInputText}
              onChange={(e) => setLyricsInputText(e.target.value)}
              placeholder="[00:12.50] Primera línea de la canción...&#10;[00:18.20] Segunda línea..."
              className="flex-1 w-full p-3.5 rounded-xl bg-[#0F0F12] border border-[#2E2E38] text-xs font-mono text-[#F5F5F7] placeholder-[#A0A0AB]/40 focus:outline-none focus:border-[#7C5CFF] resize-none"
            />
            <div className="flex justify-end gap-2.5 mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePasted}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C5CFF] text-white hover:bg-[#6D48F7] shadow-[0_0_12px_rgba(124,92,255,0.3)]"
              >
                <Check size={14} />
                <span>Guardar letra</span>
              </button>
            </div>
          </div>
        ) : !currentTrack ? (
          <div className="text-center text-[#A0A0AB]">
            <Music size={36} className="mx-auto mb-3 text-[#7C5CFF]" />
            <p className="text-sm">Selecciona una pista para ver su letra.</p>
          </div>
        ) : parsedLyrics.length === 0 ? (
          /* Empty Lyrics state */
          <div className="max-w-md text-center p-8 bg-[#1A1A1F] border border-[#2E2E38] rounded-2xl shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center mx-auto mb-4 text-[#7C5CFF]">
              <AlignLeft size={28} />
            </div>
            <h4 className="text-base font-semibold text-[#F5F5F7] mb-1">
              Sin letra para «{currentTrack.title}»
            </h4>
            <p className="text-xs text-[#A0A0AB] mb-6 leading-relaxed">
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
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#24242B] border border-[#2E2E38] text-xs font-medium text-[#F5F5F7] hover:border-[#7C5CFF]/50 transition-all"
              >
                <FileText size={15} className="text-[#4FD1C5]" />
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
                  className={`cursor-pointer transition-all duration-300 py-1.5 px-4 rounded-xl ${
                    isActive
                      ? 'text-[#4FD1C5] font-bold text-xl sm:text-2xl scale-105 drop-shadow-[0_0_12px_rgba(79,209,197,0.35)]'
                      : isPast
                      ? 'text-[#A0A0AB]/50 text-base sm:text-lg hover:text-[#A0A0AB]'
                      : 'text-[#A0A0AB]/80 text-base sm:text-lg hover:text-[#F5F5F7]'
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
