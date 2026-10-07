import React from 'react';
import { Sliders, Power, RotateCcw, X, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';
import { useUIStore } from '../../stores/useUIStore';
import { EQ_LABELS, DEFAULT_PRESETS } from '../../lib/audioEngine';
import type { ReverbMode } from '../../types/music';

export const EqualizerModal: React.FC = () => {
  const {
    eqEnabled,
    toggleEq,
    eqGains,
    setEqGain,
    activePresetId,
    setEqPreset,
    reverbMode,
    setReverbMode,
  } = usePlayerStore();

  const { isEqualizerOpen, toggleEqualizer } = useUIStore();

  if (!isEqualizerOpen) return null;

  const reverbOptions: { id: ReverbMode; label: string }[] = [
    { id: 'off', label: 'Desactivado' },
    { id: 'room', label: 'Habitación' },
    { id: 'hall', label: 'Sala de conciertos' },
    { id: 'cathedral', label: 'Catedral / Amplio' },
  ];

  const handleReset = () => {
    setEqPreset('flat');
    setReverbMode('off');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-6 text-[var(--app-text)] transition-colors animate-fadeScale">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight text-[var(--app-text)]">
                Ecualizador paramétrico
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Ajuste de audio en tiempo real de 5 bandas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* EQ Toggle Switch */}
            <button
              onClick={() => toggleEq()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                eqEnabled
                  ? 'bg-[#4FD1C5]/20 text-[#4FD1C5] border border-[#4FD1C5]/40 shadow-[0_0_12px_rgba(79,209,197,0.2)]'
                  : 'bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
              }`}
              title={eqEnabled ? 'Desactivar ecualizador' : 'Activar ecualizador'}
            >
              <Power size={13} />
              <span>{eqEnabled ? 'Activo' : 'Bypass'}</span>
            </button>

            <button
              onClick={() => toggleEqualizer(false)}
              className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Presets List */}
        <div className="my-5">
          <label className="text-xs font-medium uppercase tracking-wider text-[var(--app-text-muted)] mb-2 block">
            Presets de fábrica
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setEqPreset(preset.id)}
                  disabled={!eqEnabled}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#7C5CFF] text-white shadow-[0_0_10px_rgba(124,92,255,0.4)]'
                      : 'bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:opacity-40'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Equalizer Sliders Area */}
        <div
          className={`grid grid-cols-5 gap-3 p-4 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)] transition-opacity ${
            eqEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
        >
          {eqGains.map((gain, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Gain Indicator */}
              <span className="text-[11px] font-mono font-semibold text-[var(--app-accent)] mb-3">
                {gain > 0 ? `+${gain}` : gain} dB
              </span>

              {/* Vertical Slider Wrapper */}
              <div className="relative h-44 flex items-center justify-center">
                <div className="absolute inset-y-0 w-px bg-[var(--app-border)] pointer-events-none" />
                <div className="absolute top-0 w-2 h-px bg-[var(--app-text-muted)] opacity-40" />
                <div className="absolute top-1/2 w-3 h-px bg-[var(--app-accent)]/50" />
                <div className="absolute bottom-0 w-2 h-px bg-[var(--app-text-muted)] opacity-40" />

                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={gain}
                  onChange={(e) => setEqGain(index, Number(e.target.value))}
                  className="h-36 w-2 accent-[#7C5CFF] cursor-pointer appearance-none bg-transparent [-webkit-appearance:slider-vertical]"
                  style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                />
              </div>

              {/* Frequency Label */}
              <span className="text-[11px] font-medium text-[var(--app-text-muted)] mt-3">
                {EQ_LABELS[index]}
              </span>
            </div>
          ))}
        </div>

        {/* Spatial Reverb Simulator */}
        <div className="mt-4 p-3 rounded-xl bg-[var(--app-surface-elevated)] border border-[var(--app-border)]">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--app-text)]">
            <Sparkles size={14} className="text-[#4FD1C5]" />
            <span>Acústica Espacial (Reverb de Sala)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {reverbOptions.map((opt) => {
              const isSelected = reverbMode === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setReverbMode(opt.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#7C5CFF] text-white shadow-sm'
                      : 'bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] border border-[var(--app-border)]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--app-surface-elevated)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            <RotateCcw size={13} />
            <span>Restablecer todo a 0 dB</span>
          </button>

          <span className="text-[var(--app-text-muted)] font-mono text-[11px]">
            Rango: -12 dB / +12 dB
          </span>
        </div>
      </div>
    </div>
  );
};
