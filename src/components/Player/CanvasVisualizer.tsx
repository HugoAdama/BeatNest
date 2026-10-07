import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../../lib/audioEngine';
import type { VisualizerMode } from '../../types/music';

interface CanvasVisualizerProps {
  mode: VisualizerMode;
  isPlaying: boolean;
  className?: string;
}

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({
  mode,
  isPlaying,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; size: number; speedX: number; speedY: number; alpha: number }[] = [];
    
    // Initialize ambient particles for pulse mode
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      const analyser = audioEngine.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) {
        // Idle animation: subtle gentle wave
        const time = Date.now() * 0.002;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(124, 92, 255, 0.25)';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.015 + time) * 12;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      const timeData = new Uint8Array(bufferLength);

      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      if (mode === 'bars') {
        // Frequency bars with violet-to-cyan gradient
        const barCount = Math.min(64, bufferLength);
        const barWidth = (width / barCount) * 0.75;
        const gap = (width - barCount * barWidth) / (barCount + 1);

        for (let i = 0; i < barCount; i++) {
          const value = freqData[i] || 0;
          const barHeight = Math.max(4, (value / 255) * height * 0.85);
          const x = gap + i * (barWidth + gap);
          const y = height - barHeight;

          const gradient = ctx.createLinearGradient(0, height, 0, y);
          gradient.addColorStop(0, '#7C5CFF');
          gradient.addColorStop(0.6, '#6D48F7');
          gradient.addColorStop(1, '#4FD1C5');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // Peak cap highlight
          ctx.fillStyle = '#4FD1C5';
          ctx.fillRect(x, Math.max(0, y - 4), barWidth, 2);
        }
      } else if (mode === 'wave') {
        // Oscilloscope waveform
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#4FD1C5';
        ctx.shadowColor = '#4FD1C5';
        ctx.shadowBlur = 10;

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (mode === 'circle') {
        // Circular / Radial spectrum
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.45;
        const points = 72;
        const angleStep = (Math.PI * 2) / points;

        for (let i = 0; i < points; i++) {
          const index = Math.floor((i / points) * (bufferLength / 2));
          const val = freqData[index] || 0;
          const barLen = (val / 255) * (radius * 0.8) + 4;

          const angle = i * angleStep;
          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barLen);
          const y2 = centerY + Math.sin(angle) * (radius + barLen);

          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, '#7C5CFF');
          grad.addColorStop(1, '#4FD1C5');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Central glowing core
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(26, 26, 31, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#7C5CFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (mode === 'pulse') {
        // Pulse beat & particles
        const centerX = width / 2;
        const centerY = height / 2;

        let bassSum = 0;
        for (let i = 0; i < 16; i++) {
          bassSum += freqData[i];
        }
        const bassLevel = bassSum / (16 * 255);
        const pulseRadius = 40 + bassLevel * 60;

        // Glowing center orb
        const radialGrad = ctx.createRadialGradient(
          centerX,
          centerY,
          pulseRadius * 0.2,
          centerX,
          centerY,
          pulseRadius * 1.5
        );
        radialGrad.addColorStop(0, '#4FD1C5');
        radialGrad.addColorStop(0.5, 'rgba(124, 92, 255, 0.6)');
        radialGrad.addColorStop(1, 'rgba(124, 92, 255, 0)');

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Particles moving outwards on bass hits
        particles.forEach((p) => {
          p.x += p.speedX * (1 + bassLevel * 3);
          p.y += p.speedY * (1 + bassLevel * 3);

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = `rgba(79, 209, 197, ${p.alpha * (0.3 + bassLevel * 0.7)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + bassLevel * 1.5), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, isPlaying]);

  // Handle high-DPI resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
    />
  );
};
