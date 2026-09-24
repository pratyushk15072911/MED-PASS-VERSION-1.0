import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showWarning,
        showError,
        showInfo,
      }}
    >
      {children}
      {/* Toast Render Container */}
      <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-[calc(100vw-2.5rem)] pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarn = toast.type === 'warning';
          const isErr = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 fade-in duration-200 ${
                isSuccess
                  ? 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md'
                  : isWarn
                  ? 'bg-amber-950/90 text-amber-100 border-amber-500/40 backdrop-blur-md'
                  : isErr
                  ? 'bg-rose-950/90 text-rose-100 border-rose-500/40 backdrop-blur-md'
                  : 'bg-slate-900/90 text-slate-100 border-slate-700/50 backdrop-blur-md'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarn && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {isErr && <AlertOctagon className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isWarn && !isErr && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight tracking-wide">{toast.title}</p>
                {toast.message && (
                  <p className="text-[11px] opacity-90 mt-0.5 leading-snug break-words">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-white/50 hover:text-white transition-colors p-0.5"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
