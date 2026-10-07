import React from 'react';
import { Timer, Moon, X, Power, Check } from 'lucide-react';
import { useSleepTimerStore } from '../../stores/useSleepTimerStore';
import type { SleepTimerOption } from '../../types/music';

export const SleepTimerModal: React.FC = () => {
  const {
    activeOption,
    secondsRemaining,
    isModalOpen,
    setSleepTimer,
    cancelSleepTimer,
    toggleModal,
  } = useSleepTimerStore();

  if (!isModalOpen) return null;

  const timerOptions: { id: SleepTimerOption; label: string }[] = [
    { id: 15, label: '15 minutos' },
    { id: 30, label: '30 minutos' },
    { id: 45, label: '45 minutos' },
    { id: 60, label: '60 minutos' },
    { id: 'track_end', label: 'Al terminar la pista actual' },
  ];

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[var(--app-surface)] border border-[var(--app-border)] rounded-2xl shadow-2xl p-5 text-[var(--app-text)] transition-colors animate-fadeScale">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[var(--app-border)] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF]">
              <Moon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-text)] leading-tight">
                Temporizador de apagado
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Desvanecimiento suave y parada automática
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleModal(false)}
            className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Active Countdown Badge */}
        {activeOption !== null && secondsRemaining !== null && (
          <div className="mb-4 p-3 rounded-xl bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-[#4FD1C5] animate-pulse" />
              <div>
                <span className="text-[11px] text-[var(--app-text-muted)] block">Tiempo restante</span>
                <span className="text-base font-bold font-mono text-[#4FD1C5]">
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
            </div>

            <button
              onClick={cancelSleepTimer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs transition-colors"
            >
              <Power size={12} />
              <span>Desactivar</span>
            </button>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-1.5 mb-4">
          {timerOptions.map((opt) => {
            const isSelected = activeOption === opt.id;
            return (
              <button
                key={String(opt.id)}
                onClick={() => {
                  setSleepTimer(opt.id);
                  toggleModal(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[#7C5CFF] text-white shadow-sm'
                    : 'bg-[var(--app-surface-elevated)]/60 text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] border border-[var(--app-border)]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>

        {/* Cancel button if active */}
        {activeOption !== null && (
          <button
            onClick={() => {
              cancelSleepTimer();
              toggleModal(false);
            }}
            className="w-full py-2 rounded-xl text-xs text-red-500 hover:bg-red-500/10 transition-colors font-medium text-center"
          >
            Cancelar temporizador activo
          </button>
        )}
      </div>
    </div>
  );
};
