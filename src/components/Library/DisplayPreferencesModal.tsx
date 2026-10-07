import React from 'react';
import { Check, Rows3, X } from 'lucide-react';
import { useLibraryDisplayPreferencesStore, type LibraryDensity, type LibraryGridColumns } from '../../stores/useLibraryDisplayPreferencesStore';
import { useUIStore } from '../../stores/useUIStore';

export const DisplayPreferencesModal: React.FC = () => {
  const { density, gridColumns, setDensity, setGridColumns } = useLibraryDisplayPreferencesStore();
  const { isDisplayPreferencesOpen, toggleDisplayPreferences } = useUIStore();

  if (!isDisplayPreferencesOpen) return null;

  const densityOptions: { id: LibraryDensity; name: string; description: string }[] = [
    { id: 'comfortable', name: 'Cómoda', description: 'Más espacio para leer títulos y metadatos.' },
    { id: 'compact', name: 'Compacta', description: 'Filas y tarjetas más pequeñas para mostrar más música.' },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) toggleDisplayPreferences(false);
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="display-settings-title" className="liquid-glass-elevated w-full max-w-md overflow-hidden rounded-3xl border border-[var(--liquid-glass-border)] text-[var(--app-text)] shadow-2xl animate-fadeScale">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--liquid-glass-border-subtle)] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-primary-light)] text-[var(--app-primary)]"><Rows3 size={17} /></span>
            <div>
              <h2 id="display-settings-title" className="text-base font-bold">Vista de la biblioteca</h2>
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">Ajusta el espacio y la cantidad de columnas.</p>
            </div>
          </div>
          <button type="button" onClick={() => toggleDisplayPreferences(false)} aria-label="Cerrar preferencias de vista" className="rounded-xl p-2 text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]"><X size={17} /></button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Densidad</legend>
            <div className="grid grid-cols-2 gap-2">
              {densityOptions.map((option) => {
                const selected = density === option.id;
                return (
                  <button key={option.id} type="button" aria-pressed={selected} onClick={() => setDensity(option.id)} className={`rounded-xl border p-3 text-left ${selected ? 'border-[var(--app-primary)] bg-[var(--app-primary-light)]' : 'border-[var(--liquid-glass-border)] hover:bg-[var(--app-surface-hover)]'}`}>
                    <span className="flex items-center justify-between text-sm font-semibold">{option.name}{selected && <Check size={15} className="text-[var(--app-primary)]" />}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--app-text-muted)]">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Columnas en pantallas grandes</legend>
            <p className="mb-2 text-xs text-[var(--app-text-muted)]">En pantallas pequeñas, la cuadrícula se adapta al ancho disponible.</p>
            <div className="grid grid-cols-5 gap-2">
              {([2, 3, 4, 5, 6] as const).map((count: LibraryGridColumns) => (
                <button key={count} type="button" aria-pressed={gridColumns === count} onClick={() => setGridColumns(count)} className={`rounded-xl border py-2 text-sm font-semibold ${gridColumns === count ? 'border-[var(--app-primary)] bg-[var(--app-primary-light)] text-[var(--app-primary)]' : 'border-[var(--liquid-glass-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-hover)]'}`}>
                  {count}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-[var(--app-text-muted)]">Los cambios se guardan automáticamente en este dispositivo.</p>
        </div>
      </section>
    </div>
  );
};
