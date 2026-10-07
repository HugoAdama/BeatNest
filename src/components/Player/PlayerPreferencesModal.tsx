import React from 'react';
import { Check, Heart, ListMusic, Maximize2, Minimize2, Music2, Settings2, Sliders, Volume2, X } from 'lucide-react';
import { usePlayerPreferencesStore, type PlayerControl } from '../../stores/usePlayerPreferencesStore';
import { useUIStore } from '../../stores/useUIStore';

const CONTROL_OPTIONS: { id: PlayerControl; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'favorite', label: 'Favoritos', description: 'Acceso rápido para guardar la pista actual.', icon: <Heart size={16} /> },
  { id: 'lyrics', label: 'Letras', description: 'Abre las letras desde el reproductor.', icon: <Music2 size={16} /> },
  { id: 'equalizer', label: 'Ecualizador', description: 'Acceso rápido a los ajustes de sonido.', icon: <Sliders size={16} /> },
  { id: 'queue', label: 'Cola', description: 'Muestra la lista de reproducción actual.', icon: <ListMusic size={16} /> },
  { id: 'tools', label: 'Herramientas', description: 'Velocidad, crossfade, temporizador y visualizador.', icon: <Settings2 size={16} /> },
  { id: 'volume', label: 'Volumen', description: 'Control de volumen siempre visible.', icon: <Volume2 size={16} /> },
];

export const PlayerPreferencesModal: React.FC = () => {
  const { layout, controls, setLayout, toggleControl } = usePlayerPreferencesStore();
  const { isPlayerPreferencesOpen, togglePlayerPreferences } = useUIStore();

  if (!isPlayerPreferencesOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) togglePlayerPreferences(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-preferences-title"
        className="liquid-glass-elevated w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--liquid-glass-border)] text-[var(--app-text)] shadow-2xl animate-fadeScale"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--liquid-glass-border-subtle)] p-5 sm:p-6">
          <div>
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Settings2 size={19} />
            </div>
            <h2 id="player-preferences-title" className="text-lg font-bold">Personalizar reproductor</h2>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">Elige el tamaño del reproductor y los accesos que quieres ver.</p>
          </div>
          <button
            type="button"
            onClick={() => togglePlayerPreferences(false)}
            aria-label="Cerrar personalización del reproductor"
            className="rounded-xl p-2 text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-text)]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold">Tamaño del reproductor</legend>
            <div className="grid grid-cols-2 gap-3">
              {([
                { id: 'compact', label: 'Compacto', description: 'Oculta la forma de onda y ocupa menos alto.', icon: <Minimize2 size={18} /> },
                { id: 'expanded', label: 'Completo', description: 'Muestra la forma de onda para buscar dentro de la pista.', icon: <Maximize2 size={18} /> },
              ] as const).map((option) => {
                const selected = layout === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setLayout(option.id)}
                    className={`rounded-2xl border p-3 text-left transition-colors ${selected ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/10' : 'border-[var(--liquid-glass-border)] hover:bg-[var(--app-surface-hover)]'}`}
                  >
                    <span className="flex items-center justify-between text-sm font-semibold">
                      <span className="flex items-center gap-2">{option.icon}{option.label}</span>
                      {selected && <Check size={16} className="text-[var(--app-accent)]" />}
                    </span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-[var(--app-text-muted)]">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Accesos visibles</legend>
            <p className="mb-3 text-xs text-[var(--app-text-muted)]">Los controles principales de reproducción siempre estarán disponibles.</p>
            <div className="divide-y divide-[var(--liquid-glass-border-subtle)] rounded-2xl border border-[var(--liquid-glass-border)] px-3">
              {CONTROL_OPTIONS.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-hover)] text-[var(--app-accent)]">{option.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[var(--app-text-muted)]">{option.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={controls[option.id]}
                    onChange={() => toggleControl(option.id)}
                    className="h-4 w-4 accent-[#7C5CFF]"
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-[var(--app-text-muted)]">Tus preferencias se guardan en este dispositivo.</p>
        </div>
      </section>
    </div>
  );
};
