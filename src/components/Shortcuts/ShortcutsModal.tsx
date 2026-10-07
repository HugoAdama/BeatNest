import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutModalOpen, toggleShortcutModal } = useUIStore();

  if (!isShortcutModalOpen) return null;

  const shortcuts = [
    { key: 'Espacio', description: 'Reproducir / Pausar' },
    { key: '← / →', description: 'Rebobinar / Avanzar 5 segundos' },
    { key: '↑ / ↓', description: 'Subir / Bajar volumen' },
    { key: 'M', description: 'Silenciar / Activar sonido' },
    { key: 'L', description: 'Añadir / Quitar de favoritos' },
    { key: 'S', description: 'Alternar modo aleatorio (Shuffle)' },
    { key: 'R', description: 'Ciclo de repetición (Off / All / One)' },
    { key: 'V', description: 'Abrir / Cerrar visualizador Canvas' },
    { key: 'E', description: 'Abrir / Cerrar ecualizador' },
    { key: 'T', description: 'Abrir / Cerrar letras sincronizadas' },
    { key: 'Ctrl + K', description: 'Abrir paleta de comandos' },
    { key: 'Esc', description: 'Cerrar cualquier ventana flotante' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md liquid-glass-elevated rounded-3xl shadow-2xl p-6 text-[var(--app-text)] transition-colors animate-fadeScale border border-[var(--liquid-glass-border)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--liquid-glass-border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
              <Keyboard size={18} />
            </div>
            <h3 className="text-base font-semibold text-[var(--app-text)]">
              Atajos de teclado
            </h3>
          </div>
          <button
            onClick={() => toggleShortcutModal(false)}
            className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-hover)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 divide-y divide-[var(--liquid-glass-border-subtle)]">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-xs">
              <span className="text-[var(--app-text-muted)]">{sc.description}</span>
              <kbd className="px-2.5 py-1 rounded-lg liquid-glass-subtle font-mono text-[11px] font-semibold text-[#7C5CFF]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[var(--liquid-glass-border-subtle)] text-center">
          <p className="text-[11px] text-[var(--app-text-muted)]">
            Presiona <span className="text-[#7C5CFF] font-mono">?</span> en cualquier momento para ver esta ayuda.
          </p>
        </div>
      </div>
    </div>
  );
};
