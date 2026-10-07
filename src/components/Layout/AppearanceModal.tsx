import React, { useEffect, useState } from 'react';
import { Check, RotateCcw, Rows3, Sparkles, X } from 'lucide-react';
import {
  ACCENT_PALETTES,
  applyAppearanceSettings,
  DEFAULT_APPEARANCE,
  type AppearanceSettings,
} from '../../lib/appearance';
import { useAppearanceStore } from '../../stores/useAppearanceStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useUIStore } from '../../stores/useUIStore';

export const AppearanceModal: React.FC = () => {
  const { settings, saveSettings } = useAppearanceStore();
  const { theme } = useThemeStore();
  const { isAppearanceOpen, toggleAppearance, toggleDisplayPreferences } = useUIStore();
  const [draft, setDraft] = useState<AppearanceSettings>(settings);

  useEffect(() => {
    if (!isAppearanceOpen) return;
    setDraft(settings);
    applyAppearanceSettings(settings, theme);
  }, [isAppearanceOpen, settings, theme]);

  useEffect(() => {
    if (!isAppearanceOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        applyAppearanceSettings(settings, theme);
        toggleAppearance(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isAppearanceOpen, settings, theme, toggleAppearance]);

  if (!isAppearanceOpen) return null;

  const updateDraft = (updates: Partial<AppearanceSettings>) => {
    const next = { ...draft, ...updates };
    setDraft(next);
    applyAppearanceSettings(next, theme);
  };

  const closeWithoutSaving = () => {
    applyAppearanceSettings(settings, theme);
    toggleAppearance(false);
  };

  const handleApply = () => {
    saveSettings(draft, theme);
    toggleAppearance(false);
  };

  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    suffix: string,
    onChange: (value: number) => void,
  ) => (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-[var(--app-text)]">
        <span>{label}</span><span className="font-mono text-[var(--app-text-muted)]">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[var(--app-border)] accent-[var(--app-primary)]"
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeWithoutSaving();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="appearance-title" className="liquid-glass-elevated w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--liquid-glass-border)] text-[var(--app-text)] shadow-2xl animate-fadeScale">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--liquid-glass-border-subtle)] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-primary-light)] text-[var(--app-primary)]"><Sparkles size={19} /></span>
            <div>
              <h2 id="appearance-title" className="text-lg font-bold">Apariencia Liquid Glass</h2>
              <p className="mt-1 text-sm text-[var(--app-text-muted)]">Ajusta el color, el cristal y el resplandor ambiental.</p>
            </div>
          </div>
          <button type="button" onClick={closeWithoutSaving} aria-label="Cerrar sin guardar" className="rounded-xl p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]"><X size={18} /></button>
        </header>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <fieldset>
            <legend className="mb-2.5 text-sm font-semibold">Color de acento</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {ACCENT_PALETTES.map((palette) => {
                const selected = draft.accentPalette === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => updateDraft({ accentPalette: palette.id })}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors ${selected ? 'border-[var(--app-primary)] bg-[var(--app-primary-light)]' : 'border-[var(--liquid-glass-border)] hover:bg-[var(--app-surface-hover)]'}`}
                  >
                    <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: palette.color }} />
                    <span className="flex-1 text-left">{palette.name}</span>
                    {selected && <Check size={13} className="text-[var(--app-primary)]" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            {slider('Transparencia del cristal', draft.glassOpacity, 20, 90, '%', (glassOpacity) => updateDraft({ glassOpacity }))}
            {slider('Desenfoque', draft.glassBlur, 0, 40, ' px', (glassBlur) => updateDraft({ glassBlur }))}
            {slider('Reflejos', draft.reflectionStrength, 0, 100, '%', (reflectionStrength) => updateDraft({ reflectionStrength }))}
          </div>

          <section className="rounded-2xl border border-[var(--liquid-glass-border)] p-3.5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold">Resplandor ambiental</span>
                <span className="mt-0.5 block text-xs text-[var(--app-text-muted)]">El color de la portada actual tiñe el fondo de la aplicación.</span>
              </span>
              <input
                type="checkbox"
                checked={draft.ambientGlowEnabled}
                onChange={(event) => updateDraft({ ambientGlowEnabled: event.target.checked })}
                className="h-4 w-4 accent-[var(--app-primary)]"
              />
            </label>
            <div className={`mt-3 transition-opacity ${draft.ambientGlowEnabled ? '' : 'opacity-40'}`}>
              {slider('Intensidad', draft.ambientGlowIntensity, 0, 100, '%', (ambientGlowIntensity) => updateDraft({ ambientGlowIntensity }))}
            </div>
          </section>

          <div className="rounded-2xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)]/40 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--app-text-muted)]">Vista previa</p>
            <div className="liquid-glass rounded-xl p-4">
              <p className="text-sm font-semibold">Así se verá tu biblioteca</p>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Los cambios aparecen aquí mientras los ajustas.</p>
              <span className="mt-3 inline-flex rounded-lg bg-[var(--app-primary)] px-3 py-1.5 text-xs font-semibold text-white">Acento activo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closeWithoutSaving();
              toggleDisplayPreferences(true);
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--liquid-glass-border)] px-3 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-accent)]"
          >
            <Rows3 size={15} /> Ajustar vista de la biblioteca
          </button>
        </div>

        <footer className="flex flex-col-reverse justify-between gap-2 border-t border-[var(--liquid-glass-border-subtle)] p-4 sm:flex-row sm:items-center sm:px-6">
          <button type="button" onClick={() => updateDraft({ ...DEFAULT_APPEARANCE })} className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]">
            <RotateCcw size={14} /> Restablecer valores
          </button>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeWithoutSaving} className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]">Cancelar</button>
            <button type="button" onClick={handleApply} className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--app-primary-hover)]">Aplicar cambios</button>
          </div>
        </footer>
      </section>
    </div>
  );
};
