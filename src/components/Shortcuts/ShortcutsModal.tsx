import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { usePlayerStore } from '../../stores/usePlayerStore';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutModalOpen, toggleShortcutModal } = usePlayerStore();

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
    { key: 'Esc', description: 'Cerrar cualquier ventana flotante' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#1A1A1F] border border-[#2E2E38] rounded-2xl shadow-2xl p-6 text-[#F5F5F7]">
        <div className="flex items-center justify-between pb-4 border-b border-[#2E2E38]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Keyboard size={18} />
            </div>
            <h3 className="text-base font-semibold text-[#F5F5F7]">
              Atajos de teclado
            </h3>
          </div>
          <button
            onClick={() => toggleShortcutModal(false)}
            className="p-1.5 rounded-lg text-[#A0A0AB] hover:text-[#F5F5F7] hover:bg-[#24242B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#2E2E38]">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-[#A0A0AB]">{sc.description}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-[#0F0F12] border border-[#2E2E38] font-mono text-[11px] font-semibold text-[#4FD1C5] shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#2E2E38] text-center">
          <p className="text-[11px] text-[#A0A0AB]">
            Presiona <span className="text-[#4FD1C5] font-mono">?</span> en cualquier momento para ver esta ayuda.
          </p>
        </div>
      </div>
    </div>
  );
};
