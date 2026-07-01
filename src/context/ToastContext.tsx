"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  title: string;
  message?: string;
  type: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const colors: Record<ToastType, string> = {
  success: "#00E676",
  error: "#FF5252",
  warning: "#FFAB40",
  info: "#448AFF"
};

const icons: Record<ToastType, string> = {
  success: "check_circle",
  error: "error_rounded",
  warning: "warning_rounded",
  info: "info"
};

const labels: Record<ToastType, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Information"
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((items) => {
        const withoutDuplicate = items.filter(
          (item) => item.title !== toast.title || item.message !== toast.message || item.type !== toast.type
        );
        return [{ ...toast, id }, ...withoutDuplicate].slice(0, 4);
      });
      window.setTimeout(() => remove(id), toast.durationMs ?? (toast.type === "error" ? 6500 : 4000));
    },
    [remove]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[min(440px,calc(100vw-32px))] flex-col gap-3" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="fade-up overflow-hidden rounded-2xl border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-colors dark:bg-surface"
            role={toast.type === "error" || toast.type === "warning" ? "alert" : "status"}
            style={{ borderColor: `${colors[toast.type]}26`, boxShadow: `0 10px 24px ${colors[toast.type]}24` }}
          >
            <div className="h-1 w-full" style={{ background: colors[toast.type] }} />
            <div className="flex gap-3 px-4 py-3.5">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                style={{ background: `${colors[toast.type]}1A`, color: colors[toast.type] }}
              >
                <Icon name={icons[toast.type]} size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: colors[toast.type] }}>
                  {labels[toast.type]}
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-darkBlue">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-xs font-medium leading-5 text-grey">{toast.message}</p> : null}
              </div>
              <button
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-grey transition hover:bg-lightGrey/60 hover:text-darkBlue"
                onClick={() => remove(toast.id)}
                aria-label="Dismiss toast"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}
