import React, { useState } from 'react';
import { Sliders, Power, RotateCcw, X, Sparkles, Gauge, Volume1, BookmarkPlus, Trash2, Check } from 'lucide-react';
import { useAudioSettingsStore } from '../../stores/useAudioSettingsStore';
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
    customPresets,
    saveCustomPreset,
    deleteCustomPreset,
    reverbMode,
    setReverbMode,
    preampGain,
    setPreampGain,
    autoGainEnabled,
    toggleAutoGain,
  } = useAudioSettingsStore();

  const { isEqualizerOpen, toggleEqualizer } = useUIStore();
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

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
    setPreampGain(0);
    toggleAutoGain(false);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (presetNameInput.trim()) {
      saveCustomPreset(presetNameInput.trim());
      setPresetNameInput('');
      setIsSavingCustom(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg liquid-glass-elevated rounded-3xl shadow-2xl p-6 text-[var(--app-text)] transition-colors animate-fadeScale border border-[var(--liquid-glass-border)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--liquid-glass-border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
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
                  : 'liquid-glass-subtle text-[var(--app-text-muted)]'
              }`}
              title={eqEnabled ? 'Desactivar ecualizador' : 'Activar ecualizador'}
            >
              <Power size={13} />
              <span>{eqEnabled ? 'Activo' : 'Bypass'}</span>
            </button>

            <button
              onClick={() => toggleEqualizer(false)}
              className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Presets List */}
        <div className="my-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wider text-[var(--app-text-muted)]">
              Presets de fábrica
            </label>
            <button
              onClick={() => setIsSavingCustom(!isSavingCustom)}
              disabled={!eqEnabled}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#7C5CFF] hover:underline disabled:opacity-40"
            >
              <BookmarkPlus size={13} />
              <span>Guardar actual</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setEqPreset(preset.id)}
                  disabled={!eqEnabled}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-[0_0_12px_rgba(124,92,255,0.4)] border border-white/20'
                      : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] disabled:opacity-40'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Form to Save Custom Preset */}
          {isSavingCustom && (
            <form onSubmit={handleSavePreset} className="flex items-center gap-2 pt-2 animate-fadeIn">
              <input
                type="text"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
                placeholder="Nombre del preset..."
                maxLength={25}
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-[var(--app-surface)] text-[var(--app-text)] border border-[var(--liquid-glass-border)] focus:outline-none focus:border-[#7C5CFF]"
                autoFocus
              />
              <button
                type="submit"
                disabled={!presetNameInput.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#7C5CFF] text-white disabled:opacity-40"
              >
                <Check size={13} />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSavingCustom(false)}
                className="px-2 py-1.5 rounded-xl text-xs text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]"
              >
                Cancelar
              </button>
            </form>
          )}

          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <div className="pt-2 border-t border-[var(--liquid-glass-border-subtle)]">
              <label className="text-xs font-medium uppercase tracking-wider text-[var(--app-text-muted)] mb-2 block">
                Mis Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {customPresets.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#4FD1C5] to-[#2DD4BF] text-black shadow-[0_0_12px_rgba(79,209,197,0.3)] font-semibold'
                          : 'liquid-glass-subtle text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
                      }`}
                    >
                      <button
                        onClick={() => setEqPreset(preset.id)}
                        disabled={!eqEnabled}
                        className="truncate max-w-[120px]"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomPreset(preset.id);
                        }}
                        className="p-0.5 rounded text-[var(--app-text-muted)] hover:text-red-500 transition-colors ml-0.5"
                        title="Eliminar preset"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Equalizer Sliders Area */}
        <div
          className={`grid grid-cols-5 gap-3 p-4 rounded-2xl liquid-glass-subtle border border-[var(--liquid-glass-border)] transition-opacity ${
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

        {/* Audiophile Preamp & Dynamic Auto-Gain Leveling */}
        <div className="mt-4 p-3 rounded-2xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Volume1 size={14} className="text-[#7C5CFF]" />
              <span className="text-xs font-semibold text-[var(--app-text)]">Preamplificador</span>
              <span className="text-[11px] font-mono text-[var(--app-text-muted)]">
                {preampGain > 0 ? `+${preampGain}` : preampGain} dB
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={preampGain}
                onChange={(e) => setPreampGain(Number(e.target.value))}
                className="w-32 h-1.5 bg-[var(--app-border)] rounded-lg appearance-none cursor-pointer accent-[#7C5CFF]"
              />
              <button
                onClick={() => setPreampGain(0)}
                className="text-[10px] px-2 py-0.5 rounded-lg liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                title="Restablecer preamplificador a 0 dB"
              >
                0 dB
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--liquid-glass-border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge size={14} className="text-[#4FD1C5]" />
              <div>
                <span className="text-xs font-semibold text-[var(--app-text)] block">
                  Normalización de Volumen (Auto-Gain)
                </span>
                <span className="text-[10px] text-[var(--app-text-muted)] block">
                  Compensación dinámica de sonoridad y limitador suave
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleAutoGain()}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                autoGainEnabled
                  ? 'bg-[#4FD1C5] text-black shadow-sm font-semibold'
                  : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              {autoGainEnabled ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </div>

        {/* Spatial Reverb Simulator */}
        <div className="mt-4 p-3 rounded-2xl liquid-glass-subtle border border-[var(--liquid-glass-border-subtle)]">
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
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#7C5CFF] to-[#6366F1] text-white shadow-sm border border-white/20'
                      : 'liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)]'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-subtle text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
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
