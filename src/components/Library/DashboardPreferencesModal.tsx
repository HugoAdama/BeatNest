import React from 'react';
import { ArrowDown, ArrowUp, Check, Home, ListMusic, Music2, X } from 'lucide-react';
import {
  HOME_SECTION_LABELS,
  HOME_SECTION_ORDER,
  useHomeDashboardStore,
  type LandingView,
} from '../../stores/useHomeDashboardStore';
import { useUIStore } from '../../stores/useUIStore';

const SECTION_ICONS = {
  recent: <Music2 size={15} />,
  added: <Music2 size={15} />,
  played: <Music2 size={15} />,
  playlists: <ListMusic size={15} />,
};

export const DashboardPreferencesModal: React.FC = () => {
  const {
    sectionOrder,
    visibleSections,
    maxItems,
    landingView,
    toggleSection,
    moveSection,
    setMaxItems,
    setLandingView,
  } = useHomeDashboardStore();
  const { isDashboardPreferencesOpen, toggleDashboardPreferences } = useUIStore();

  if (!isDashboardPreferencesOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) toggleDashboardPreferences(false);
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="dashboard-settings-title" className="liquid-glass-elevated w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--liquid-glass-border)] text-[var(--app-text)] shadow-2xl animate-fadeScale">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--liquid-glass-border-subtle)] p-5 sm:p-6">
          <div>
            <h2 id="dashboard-settings-title" className="text-lg font-bold">Personalizar Inicio</h2>
            <p className="mt-1 text-sm text-[var(--app-text-muted)]">Ordena y muestra solo las secciones que usas.</p>
          </div>
          <button type="button" onClick={() => toggleDashboardPreferences(false)} aria-label="Cerrar preferencias de Inicio" className="rounded-xl p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]"><X size={18} /></button>
        </header>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <label className="block text-sm font-semibold">
            Página inicial
            <span className="mt-1 block text-xs font-normal text-[var(--app-text-muted)]">“Última sección” restaura la ruta con la que cerraste la app.</span>
            <select
              value={landingView}
              onChange={(event) => setLandingView(event.target.value as LandingView)}
              className="mt-2 w-full rounded-xl border border-[var(--liquid-glass-border)] bg-[var(--app-surface)] px-3 py-2.5 text-sm text-[var(--app-text)]"
            >
              <option value="last">Última sección</option>
              <option value="home">Inicio</option>
              <option value="tracks">Todas las pistas</option>
              <option value="favorites">Favoritos</option>
            </select>
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Canciones y playlists por sección</legend>
            <div className="flex gap-2">
              {([3, 6, 9] as const).map((count) => (
                <button key={count} type="button" aria-pressed={maxItems === count} onClick={() => setMaxItems(count)} className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${maxItems === count ? 'border-[var(--app-primary)] bg-[var(--app-primary-light)] text-[var(--app-primary)]' : 'border-[var(--liquid-glass-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]'}`}>
                  {count}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Secciones de Inicio</legend>
            <div className="space-y-2">
              {sectionOrder.map((section, index) => (
                <div key={section} className="flex items-center gap-2 rounded-xl border border-[var(--liquid-glass-border-subtle)] px-3 py-2.5">
                  <span className="text-[var(--app-accent)]">{SECTION_ICONS[section]}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm ${visibleSections[section] ? 'font-medium text-[var(--app-text)]' : 'text-[var(--app-text-muted)]'}`}>{HOME_SECTION_LABELS[section]}</span>
                  <button type="button" onClick={() => moveSection(section, -1)} disabled={index === 0} aria-label={`Mover ${HOME_SECTION_LABELS[section]} arriba`} className="rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => moveSection(section, 1)} disabled={index === HOME_SECTION_ORDER.length - 1} aria-label={`Mover ${HOME_SECTION_LABELS[section]} abajo`} className="rounded-lg p-1.5 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)] disabled:opacity-30"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => toggleSection(section)} aria-label={`${visibleSections[section] ? 'Ocultar' : 'Mostrar'} ${HOME_SECTION_LABELS[section]}`} aria-pressed={visibleSections[section]} className={`rounded-lg p-1.5 ${visibleSections[section] ? 'text-[var(--app-primary)]' : 'text-[var(--app-text-muted)]'}`}>
                    {visibleSections[section] ? <Check size={15} /> : <Home size={15} />}
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="flex justify-end border-t border-[var(--liquid-glass-border-subtle)] p-4 sm:px-6">
          <button type="button" onClick={() => toggleDashboardPreferences(false)} className="rounded-xl bg-[var(--app-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--app-primary-hover)]">Listo</button>
        </footer>
      </section>
    </div>
  );
};
