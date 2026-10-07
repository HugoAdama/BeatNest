import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../stores/useToastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-[#4FD1C5] shrink-0" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info size={16} className="text-[#7C5CFF] shrink-0" />;
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-2xl backdrop-blur-md animate-slideLeft transition-all"
        >
          <div className="pt-0.5">{renderIcon(toast.type)}</div>
          <div className="flex-1 min-w-0 pr-1">
            <h5 className="text-xs font-bold text-[var(--app-text)] leading-tight">
              {toast.title}
            </h5>
            {toast.description && (
              <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 line-clamp-2">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-surface-elevated)] transition-colors"
            title="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
