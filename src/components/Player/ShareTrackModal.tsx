import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Share2, Check } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatDuration } from '../../lib/metadata';
import { showToast } from '../../stores/useToastStore';

export const ShareTrackModal: React.FC = () => {
  const { currentTrack, duration } = usePlayerStore();
  const { isShareTrackOpen, toggleShareTrack } = useUIStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isShareTrackOpen || !currentTrack) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 630;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0F0F14');
    bgGradient.addColorStop(0.5, '#171622');
    bgGradient.addColorStop(1, '#0A0A0D');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative ambient circles
    const radGlow1 = ctx.createRadialGradient(200, 180, 0, 200, 180, 400);
    radGlow1.addColorStop(0, 'rgba(124, 92, 255, 0.35)');
    radGlow1.addColorStop(1, 'rgba(124, 92, 255, 0)');
    ctx.fillStyle = radGlow1;
    ctx.fillRect(0, 0, width, height);

    const radGlow2 = ctx.createRadialGradient(1000, 450, 0, 1000, 450, 450);
    radGlow2.addColorStop(0, 'rgba(79, 209, 197, 0.25)');
    radGlow2.addColorStop(1, 'rgba(79, 209, 197, 0)');
    ctx.fillStyle = radGlow2;
    ctx.fillRect(0, 0, width, height);

    // Outer card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    const drawContent = (coverImg?: HTMLImageElement) => {
      // Draw cover
      const coverSize = 360;
      const coverX = 80;
      const coverY = 135;

      if (coverImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 28);
        ctx.clip();
        ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
        ctx.restore();

        // Cover border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 28);
        ctx.stroke();
      } else {
        // Fallback placeholder box
        ctx.fillStyle = '#22212F';
        ctx.beginPath();
        ctx.roundRect(coverX, coverY, coverSize, coverSize, 28);
        ctx.fill();
        ctx.fillStyle = '#7C5CFF';
      ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BeatNest', coverX + coverSize / 2, coverY + coverSize / 2);
      }

      // Track details on the right
      const textX = 490;
      ctx.textAlign = 'left';

      // Badge
      ctx.fillStyle = 'rgba(124, 92, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(textX, 140, 150, 36, 10);
      ctx.fill();
      ctx.fillStyle = '#4FD1C5';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.fillText('REPRODUCIENDO', textX + 16, 164);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 52px system-ui, sans-serif';
      const truncatedTitle =
        currentTrack.title.length > 24
          ? currentTrack.title.substring(0, 24) + '...'
          : currentTrack.title;
      ctx.fillText(truncatedTitle, textX, 235);

      // Artist
      ctx.fillStyle = '#C0BEE0';
      ctx.font = '600 32px system-ui, sans-serif';
      const truncatedArtist =
        currentTrack.artist.length > 30
          ? currentTrack.artist.substring(0, 30) + '...'
          : currentTrack.artist;
      ctx.fillText(truncatedArtist, textX, 290);

      // Album & Duration
      ctx.fillStyle = '#8381A5';
      ctx.font = '400 24px system-ui, sans-serif';
      const durText = formatDuration(currentTrack.duration || duration);
      const albumText = currentTrack.album ? `${currentTrack.album} • ` : '';
      ctx.fillText(`${albumText}${durText}`, textX, 340);

      // Simulated Sound Waveform Bars
      const waveX = textX;
      const waveY = 410;
      const barCount = 38;
      const barWidth = 10;
      const barGap = 6;

      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin((i / barCount) * Math.PI) * 0.8 + 0.2;
        const pseudoRand = (Math.sin(i * 12.3) + 1) * 0.5;
        const barHeight = Math.max(8, factor * pseudoRand * 65);

        const barGradient = ctx.createLinearGradient(0, waveY - barHeight, 0, waveY);
        barGradient.addColorStop(0, '#4FD1C5');
        barGradient.addColorStop(1, '#7C5CFF');
        ctx.fillStyle = barGradient;

        ctx.beginPath();
        ctx.roundRect(
          waveX + i * (barWidth + barGap),
          waveY - barHeight / 2,
          barWidth,
          barHeight,
          4
        );
        ctx.fill();
      }

      // Footer branding
      ctx.fillStyle = '#8381A5';
      ctx.font = '500 18px system-ui, sans-serif';
      ctx.fillText('BeatNest • Reproductor de audio local 100% privado', textX, 500);

      setPreviewUrl(canvas.toDataURL('image/png'));
    };

    if (currentTrack.coverUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawContent(img);
      img.onerror = () => drawContent();
      img.src = currentTrack.coverUrl;
    } else {
      drawContent();
    }
  }, [isShareTrackOpen, currentTrack, duration]);

  if (!isShareTrackOpen || !currentTrack) return null;

  const handleDownload = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `beatnest-${currentTrack.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    a.click();
    showToast('Tarjeta descargada', 'Imagen PNG guardada en tu dispositivo');
  };

  const handleCopyText = () => {
    const text = `Escuchando «${currentTrack.title}» de ${currentTrack.artist} en BeatNest`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Copiado al portapapeles', text);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={() => toggleShareTrack(false)}
    >
      <div
        className="w-full max-w-2xl liquid-glass-elevated border border-[var(--liquid-glass-border)] rounded-3xl shadow-2xl overflow-hidden p-6 animate-fadeScale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--liquid-glass-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)] leading-tight">
                Compartir Pista
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Generador de tarjeta visual en alta definición
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleShareTrack(false)}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="my-5 rounded-xl overflow-hidden border border-[var(--app-border)] bg-black/40 shadow-inner flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-auto max-h-72 object-contain" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopyText}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-border)] transition-colors"
          >
            {copied ? <Check size={14} className="text-[#4FD1C5]" /> : <Copy size={14} />}
            <span>{copied ? 'Copiado' : 'Copiar texto'}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => toggleShareTrack(false)}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6D48F7] active:scale-95 transition-all shadow-md shadow-[#7C5CFF]/20"
            >
              <Download size={14} />
              <span>Descargar PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
