"use client";

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineXMark,
  HiOutlineSparkles,
} from "react-icons/hi2";
import clsx from "clsx";

// =============================================
// Types
// =============================================
type ToastType = "success" | "error" | "info" | "warning" | "celebration";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// =============================================
// Icons & styles per type
// =============================================
const toastConfig: Record<
  ToastType,
  { icon: typeof HiOutlineCheckCircle; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: HiOutlineCheckCircle,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-400",
  },
  error: {
    icon: HiOutlineExclamationTriangle,
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    iconColor: "text-red-400",
  },
  warning: {
    icon: HiOutlineExclamationTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
  },
  info: {
    icon: HiOutlineInformationCircle,
    bg: "bg-cosmos-500/10",
    border: "border-cosmos-500/30",
    iconColor: "text-cosmos-400",
  },
  celebration: {
    icon: HiOutlineSparkles,
    bg: "bg-gradient-to-r from-cosmos-500/15 via-nebula-500/15 to-cosmos-500/15",
    border: "border-nebula-500/40",
    iconColor: "text-nebula-400",
  },
};

// =============================================
// Single Toast Component
// =============================================
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const duration = toast.duration || 5000;
    const leaveTimer = setTimeout(() => setIsLeaving(true), duration - 300);
    const removeTimer = setTimeout(() => onRemove(toast.id), duration);
    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onRemove]);

  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm w-full transition-all duration-300",
        config.bg,
        config.border,
        isLeaving
          ? "opacity-0 translate-x-4 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-slide-in"
      )}
    >
      <Icon className={clsx("h-5 w-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-night-100">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-night-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="text-night-500 hover:text-night-300 transition-colors shrink-0"
      >
        <HiOutlineXMark className="h-4 w-4" />
      </button>
    </div>
  );
}

// =============================================
// Toast Provider
// =============================================
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
